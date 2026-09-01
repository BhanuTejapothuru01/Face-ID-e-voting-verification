import time
import numpy as np
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from typing import List

from app.services.face.detector import (
    detect_faces, 
    check_exactly_one_face, 
    check_face_quality_advanced, 
    align_face_crop
)
from app.services.face.embedding import generate_embedding_from_face
from app.services.face.liveness import check_liveness
from app.services.faiss_search import search_index_top_k
from app.db.db_router import get_voter_by_uuid, get_active_session, submit_voter_ballot
from app.core.config import (
    SIMILARITY_THRESHOLD,
    TOP_K_SEARCH,
    MIN_MATCHING_FRAMES,
    WEIGHT_BEST_SIM,
    WEIGHT_TOP_K_AVG,
    WEIGHT_TEMPORAL_CONSISTENCY
)
from app.api.routes.registration import decode_image
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/api/verify")
@limiter.limit("15/minute")
async def verify_voter(request: Request, frames: List[UploadFile] = File(...)):
    start_time = time.time()
    
    # 0. Check Active Voting Session
    session = get_active_session()
    if not session or session.get('status') != 'ACTIVE':
        raise HTTPException(status_code=400, detail="Voting session is currently paused or closed.")

    if not frames or len(frames) == 0:
        raise HTTPException(status_code=400, detail="No frames provided.")
        
    decoded_frames = []
    MAX_FRAME_SIZE = 10 * 1024 * 1024 # 10MB limit per frame

    for f in frames:
        content = await f.read()
        if len(content) > MAX_FRAME_SIZE:
            raise HTTPException(status_code=400, detail="Uploaded frame file size exceeds 10MB limit.")
        img = decode_image(content)
        if img is not None:
            decoded_frames.append(img)
            
    if len(decoded_frames) < 2:
        raise HTTPException(status_code=400, detail="At least 2 valid image frames required for liveness check.")

    # 1. Liveness check
    is_live, liveness_msg = check_liveness(decoded_frames)
    if not is_live:
        raise HTTPException(status_code=403, detail=liveness_msg)

    # 2. Process frames & extract aligned face crop embeddings
    valid_embeddings = []
    quality_rejections = []

    for frame in decoded_frames:
        detected_faces = detect_faces(frame)
        is_single, single_msg, face = check_exactly_one_face(detected_faces)
        if not is_single:
            quality_rejections.append(single_msg)
            continue
            
        is_quality, quality_msg, score = check_face_quality_advanced(face, frame)
        if not is_quality:
            quality_rejections.append(quality_msg)
            continue

        aligned_crop = align_face_crop(frame, face)
        aligned_faces = detect_faces(aligned_crop)
        if aligned_faces and len(aligned_faces) > 0:
            emb = generate_embedding_from_face(aligned_faces[0])
        else:
            emb = generate_embedding_from_face(face)

        valid_embeddings.append(emb)

    if not valid_embeddings:
        reason = quality_rejections[0] if quality_rejections else "Quality check failed on all frames."
        raise HTTPException(status_code=400, detail=f"Verification scan rejected: {reason}")

    # 3. Multi-frame candidate evidence scoring
    # Maps candidate_uuid -> list of similarity scores from each frame query
    candidate_scores_map = {}

    for emb in valid_embeddings:
        top_matches = search_index_top_k(emb, top_k=TOP_K_SEARCH)
        for cand_uuid, sim in top_matches:
            if cand_uuid not in candidate_scores_map:
                candidate_scores_map[cand_uuid] = []
            candidate_scores_map[cand_uuid].append(sim)

    best_candidate_uuid = None
    highest_final_score = 0.0
    winning_evidence = {}

    total_valid_frames = len(valid_embeddings)

    for cand_uuid, sim_list in candidate_scores_map.items():
        best_sim = float(np.max(sim_list))
        
        # Sort top similarities
        top_k_sims = sorted(sim_list, reverse=True)[:TOP_K_SEARCH]
        top_k_avg = float(np.mean(top_k_sims))
        
        matching_frames = sum(1 for s in sim_list if s >= SIMILARITY_THRESHOLD - 0.05)
        temporal_consistency = matching_frames / float(total_valid_frames)

        final_score = (
            WEIGHT_BEST_SIM * best_sim +
            WEIGHT_TOP_K_AVG * top_k_avg +
            WEIGHT_TEMPORAL_CONSISTENCY * temporal_consistency
        )

        if final_score > highest_final_score:
            highest_final_score = final_score
            best_candidate_uuid = cand_uuid
            winning_evidence = {
                "best_similarity": best_sim,
                "top_k_average": top_k_avg,
                "matching_frames": matching_frames,
                "temporal_consistency": temporal_consistency,
                "final_score": final_score
            }

    processing_time_ms = int((time.time() - start_time) * 1000)

    print(f"[FACE VERIFICATION LOG] Valid frames: {total_valid_frames} | Candidate: {best_candidate_uuid} | Best Sim: {winning_evidence.get('best_similarity', 0):.3f} | Final Score: {highest_final_score:.3f} | Matches: {winning_evidence.get('matching_frames', 0)}/{total_valid_frames}")

    # 4. Decision Rule: Accept ONLY if final score >= SIMILARITY_THRESHOLD and matching frames >= MIN_MATCHING_FRAMES
    min_required_matches = min(MIN_MATCHING_FRAMES, total_valid_frames)

    if (
        best_candidate_uuid 
        and highest_final_score >= SIMILARITY_THRESHOLD 
        and winning_evidence.get("matching_frames", 0) >= min_required_matches
    ):
        voter_data = get_voter_by_uuid(best_candidate_uuid)
        if not voter_data:
            raise HTTPException(status_code=500, detail="Voter matched in index but profile record not found.")

        # Check 5a: Is voter marked NOT ELIGIBLE?
        if voter_data.get('eligibility_status') == 'NOT ELIGIBLE':
            return {
                "status": "success",
                "eligibility": "NOT ELIGIBLE",
                "similarity": float(highest_final_score),
                "processing_time_ms": processing_time_ms,
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name'],
                "message": "Voter eligibility has been revoked or restricted by election administrator."
            }

        # Check 5b: Has voter ALREADY VOTED in active session?
        if voter_data.get('has_voted') == 1:
            return {
                "status": "success",
                "eligibility": "ALREADY_VOTED",
                "similarity": float(highest_final_score),
                "processing_time_ms": processing_time_ms,
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name'],
                "voted_at": voter_data.get('voted_at'),
                "message": "DUPLICATE VOTE ATTEMPT DETECTED! Voter has already cast a ballot in this session."
            }

        # Check 5c: Voter is ELIGIBLE and HAS NOT VOTED -> Submit Ballot
        recorded, msg = submit_voter_ballot(session['session_id'], voter_data['voter_id'], 'DEFAULT_CANDIDATE')
        if not recorded:
            return {
                "status": "success",
                "eligibility": "ALREADY_VOTED",
                "similarity": float(highest_final_score),
                "processing_time_ms": processing_time_ms,
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name'],
                "message": "Duplicate vote attempt detected."
            }

        return {
            "status": "success",
            "eligibility": "VOTE_CAST_SUCCESS",
            "similarity": float(highest_final_score),
            "processing_time_ms": processing_time_ms,
            "voter_id": voter_data['voter_id'],
            "name": voter_data['name'],
            "voted_at": datetime.now(timezone.utc).isoformat(),
            "message": "BALLOT SUCCESSFULLY CAST & VERIFIED"
        }
        
    return {
        "status": "success",
        "eligibility": "NOT VERIFIED",
        "similarity": float(highest_final_score) if best_candidate_uuid else 0.0,
        "processing_time_ms": processing_time_ms,
        "message": "Identity verification unconfirmed. Please look directly into the camera in clear lighting and scan again."
    }
