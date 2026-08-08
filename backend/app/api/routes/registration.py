import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import time
import uuid

from app.services.face.detector import detect_faces, check_exactly_one_face, check_face_quality
from app.services.face.embedding import generate_embedding_from_face, fuse_embeddings
from app.services.face.liveness import check_liveness
from app.services.faiss_search import search_index, add_to_index
from app.db.local_db import insert_voter
from app.core.config import SIMILARITY_THRESHOLD

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

    # 2. Extract embeddings from frames
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

    # 4. Check for duplicates in FAISS
    matched_uuid, sim_score = search_index(final_embedding)
    if matched_uuid and sim_score > SIMILARITY_THRESHOLD:
        raise HTTPException(status_code=409, detail="Duplicate face detected. This person is already registered.")

    # 5. Save to Supabase
    voter_id = f"FV-{str(uuid.uuid4())[:8].upper()}"
    emb_list = final_embedding.tolist()
    
    result = insert_voter(voter_id, name, emb_list)
    if not result:
        raise HTTPException(status_code=500, detail="Database insertion failed.")
        
    db_uuid = result[0]['id']

    # 6. Update FAISS Index
    add_to_index(db_uuid, final_embedding)

    return {
        "status": "success",
        "voter_id": voter_id,
        "name": name,
        "message": "Voter registered successfully."
    }
