import time
import numpy as np
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from typing import List

from app.services.face.detector import detect_faces, check_exactly_one_face, check_face_quality
from app.services.face.embedding import generate_embedding_from_face, fuse_embeddings
from app.services.face.liveness import check_liveness
from app.services.faiss_search import search_index
from app.db.local_db import get_voter_by_uuid, get_active_session, submit_voter_ballot
from app.core.config import SIMILARITY_THRESHOLD
from app.api.routes.registration import decode_image # Reuse decode_image function
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/api/verify")
@limiter.limit("5/minute")
async def verify_voter(request: Request, frames: List[UploadFile] = File(...)):
    start_time = time.time()
    
    # 0. Check Active Voting Session
    session = get_active_session()
    if not session or session.get('status') != 'ACTIVE':
        raise HTTPException(status_code=400, detail="Voting session is currently paused or closed.")

    if not frames or len(frames) == 0:
        raise HTTPException(status_code=400, detail="No frames provided.")
        
    decoded_frames = []
    for f in frames:
        content = await f.read()
        img = decode_image(content)
        if img is not None:
            decoded_frames.append(img)
            
    if len(decoded_frames) < 2:
        raise HTTPException(status_code=400, detail="At least 2 frames required for liveness check.")

    # 1. Liveness check
    is_live, liveness_msg = check_liveness(decoded_frames)
    if not is_live:
        raise HTTPException(status_code=403, detail=liveness_msg)

    # 2. Extract embeddings
    valid_embeddings = []
    for frame in decoded_frames:
        detected_faces = detect_faces(frame)
        is_single, single_msg, face = check_exactly_one_face(detected_faces)
        
        if not is_single:
            raise HTTPException(status_code=400, detail=single_msg)
            
        is_quality, quality_msg = check_face_quality(face)
        if not is_quality:
            raise HTTPException(status_code=400, detail=quality_msg)
            
        emb = generate_embedding_from_face(face)
        valid_embeddings.append(emb)

    if not valid_embeddings:
        raise HTTPException(status_code=400, detail="Failed to extract embeddings from frames.")

    # 3. Fuse embeddings
    final_embedding = fuse_embeddings(valid_embeddings)

    # 4. Search FAISS
    matched_uuid, sim_score = search_index(final_embedding)
    
    # 5. Determine Eligibility & Single-Vote Enforcement
    if matched_uuid and sim_score > SIMILARITY_THRESHOLD:
        voter_data = get_voter_by_uuid(matched_uuid)
        if not voter_data:
            raise HTTPException(status_code=500, detail="Voter matched but data not found in DB.")
            
        processing_time_ms = int((time.time() - start_time) * 1000)

        # Check 5a: Is voter marked NOT ELIGIBLE in registry?
        if voter_data.get('eligibility_status') == 'NOT ELIGIBLE':
            return {
                "status": "success",
                "eligibility": "NOT ELIGIBLE",
                "similarity": float(sim_score),
                "processing_time_ms": processing_time_ms,
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name'],
                "message": "Voter eligibility has been revoked/restricted."
            }

        # Check 5b: Has voter ALREADY VOTED in active session?
        if voter_data.get('has_voted') == 1:
            return {
                "status": "success",
                "eligibility": "ALREADY_VOTED",
                "similarity": float(sim_score),
                "processing_time_ms": processing_time_ms,
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name'],
                "voted_at": voter_data.get('voted_at'),
                "message": "DUPLICATE VOTE ATTEMPT DETECTED! Voter has already cast a ballot."
            }

        # Check 5c: Voter is ELIGIBLE and HAS NOT VOTED -> CAST BALLOT NOW!
        recorded, msg = submit_voter_ballot(session['session_id'], voter_data['voter_id'], 'DEFAULT_CANDIDATE')
        if not recorded:
            # Race condition check
            return {
                "status": "success",
                "eligibility": "ALREADY_VOTED",
                "similarity": float(sim_score),
                "processing_time_ms": processing_time_ms,
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name'],
                "message": "Duplicate vote attempt detected."
            }

        return {
            "status": "success",
            "eligibility": "VOTE_CAST_SUCCESS",
            "similarity": float(sim_score),
            "processing_time_ms": processing_time_ms,
            "voter_id": voter_data['voter_id'],
            "name": voter_data['name'],
            "voted_at": datetime.utcnow().isoformat(),
            "message": "BALLOT SUCCESSFULLY CAST & VERIFIED"
        }
        
    processing_time_ms = int((time.time() - start_time) * 1000)
    return {
        "status": "success",
        "eligibility": "NOT VERIFIED",
        "similarity": float(sim_score) if matched_uuid else 0.0,
        "processing_time_ms": processing_time_ms,
        "message": "No matching voter found in index."
    }
