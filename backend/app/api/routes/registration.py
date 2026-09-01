import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import uuid

from app.services.face.detector import (
    detect_faces, 
    check_exactly_one_face, 
    check_face_quality_advanced, 
    align_face_crop
)
from app.services.face.embedding import (
    generate_embedding_from_face, 
    filter_outlier_embeddings, 
    compute_fused_centroid
)
from app.services.face.liveness import check_liveness
from app.services.faiss_search import search_index_top_k, add_multiple_to_index
from app.db.db_router import insert_voter, insert_voter_embeddings
from app.core.config import SIMILARITY_THRESHOLD, MAX_TEMPLATES_PER_VOTER

router = APIRouter()

def decode_image(file_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(file_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@router.post("/api/register")
async def register_voter(
    name: str = Form(...),
    frames: List[UploadFile] = File(...)
):
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

    # 2. Extract aligned face crops, quality scores, and embeddings
    valid_embeddings = []
    valid_scores = []
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
            
        # Align face crop using 5-point landmarks
        aligned_crop = align_face_crop(frame, face)
        
        # Re-run face app on aligned crop to get standard landmark-aligned embedding
        aligned_faces = detect_faces(aligned_crop)
        if aligned_faces and len(aligned_faces) > 0:
            emb = generate_embedding_from_face(aligned_faces[0])
        else:
            emb = generate_embedding_from_face(face)

        valid_embeddings.append(emb)
        valid_scores.append(score)

    if not valid_embeddings:
        reason = quality_rejections[0] if quality_rejections else "Quality check failed on all frames."
        raise HTTPException(status_code=400, detail=f"Registration rejected: {reason}")

    # 3. Filter outlier embeddings
    clean_embeddings, clean_scores = filter_outlier_embeddings(valid_embeddings, valid_scores)
    
    # Select top K highest quality templates
    if len(clean_embeddings) > MAX_TEMPLATES_PER_VOTER:
        sorted_indices = np.argsort(clean_scores)[::-1][:MAX_TEMPLATES_PER_VOTER]
        clean_embeddings = [clean_embeddings[i] for i in sorted_indices]
        clean_scores = [clean_scores[i] for i in sorted_indices]

    # Compute fused centroid for primary database record
    centroid_embedding = compute_fused_centroid(clean_embeddings, clean_scores)

    # 4. Multi-template duplicate detection against existing FAISS index
    for emb in clean_embeddings:
        matches = search_index_top_k(emb, top_k=3)
        for matched_uuid, sim_score in matches:
            if matched_uuid and sim_score > SIMILARITY_THRESHOLD:
                raise HTTPException(
                    status_code=409, 
                    detail=f"Duplicate face detected (Match score: {sim_score:.2f}). This person is already registered in the system."
                )

    # 5. Save primary voter record & multi-template embeddings in DB
    voter_id = f"FV-{str(uuid.uuid4())[:8].upper()}"
    centroid_list = centroid_embedding.tolist()
    
    result = insert_voter(voter_id, name, centroid_list)
    if not result:
        raise HTTPException(status_code=500, detail="Database insertion failed.")
        
    db_uuid = result[0]['id']

    # Insert multi-template vector records
    template_records = [(emb.tolist(), sc) for emb, sc in zip(clean_embeddings, clean_scores)]
    insert_voter_embeddings(db_uuid, voter_id, template_records)

    # 6. Update live FAISS Index with all templates
    add_multiple_to_index(db_uuid, clean_embeddings)

    print(f"[REGISTRATION SUCCESS] Registered voter '{name}' ({voter_id}) with {len(clean_embeddings)} biometric templates.")

    return {
        "status": "success",
        "voter_id": voter_id,
        "name": name,
        "templates_count": len(clean_embeddings),
        "message": f"Voter '{name}' registered successfully with {len(clean_embeddings)} biometric templates."
    }
