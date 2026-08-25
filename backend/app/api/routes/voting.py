import time
import jwt
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from typing import List, Optional
from pydantic import BaseModel

from app.services.face.detector import detect_faces, check_exactly_one_face, check_face_quality
from app.services.face.embedding import generate_embedding_from_face, fuse_embeddings
from app.services.face.liveness import check_liveness
from app.services.faiss_search import search_index
from app.db.local_db import (
    get_voter_by_uuid, get_active_session, get_candidates_by_session, 
    submit_voter_ballot, get_all_sessions, get_session_by_id,
    get_voter_vote_for_session, get_session_by_share_token
)
from app.core.config import SIMILARITY_THRESHOLD, ADMIN_SECRET
from app.api.routes.registration import decode_image
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

VOTE_TOKEN_SECRET = ADMIN_SECRET if ADMIN_SECRET else "vote_token_secret_key_123"

class CastVoteRequest(BaseModel):
    vote_token: str
    candidate_id: str

@router.get("/api/voting/session-by-token/{share_token}")
def get_voting_session_by_token(share_token: str):
    """Retrieve session by unique share_token and return status + candidates."""
    session = get_session_by_share_token(share_token)
    if not session:
        return {
            "status": "NOT_FOUND",
            "message": "Voting Session Not Found. This voting link is invalid or no longer available.",
            "session": None,
            "candidates": []
        }
    
    candidates = get_candidates_by_session(session['session_id'])
    status = session.get('status', 'SCHEDULED')
    
    if status == 'SCHEDULED':
        return {
            "status": "SCHEDULED",
            "message": "Voting Has Not Started",
            "session": session,
            "candidates": candidates
        }
    elif status in ['ENDED', 'COMPLETED']:
        return {
            "status": "ENDED",
            "message": "Voting Has Ended",
            "session": session,
            "candidates": candidates
        }
    elif status == 'PAUSED':
        return {
            "status": "PAUSED",
            "message": "Voting Is Currently Paused",
            "session": session,
            "candidates": candidates
        }
    elif status == 'ACTIVE':
        return {
            "status": "ACTIVE",
            "message": "Voting Session Active",
            "session": session,
            "candidates": candidates
        }
    else:
        return {
            "status": status,
            "message": f"Voting Session Status: {status}",
            "session": session,
            "candidates": candidates
        }

@router.get("/api/voting/active-session")
def get_active_voting_session():
    """Retrieve current active or upcoming session with candidate list."""
    session = get_active_session()
    if not session:
        # Check if there is an upcoming scheduled session
        all_sessions = get_all_sessions()
        scheduled = [s for s in all_sessions if s.get('status') == 'SCHEDULED']
        if scheduled:
            upcoming = scheduled[0]
            return {
                "status": "UPCOMING",
                "message": "Voting has not started yet.",
                "session": upcoming
            }
        return {
            "status": "NO_ACTIVE_SESSION",
            "message": "No active voting session is currently open.",
            "session": None
        }
        
    candidates = get_candidates_by_session(session['session_id'])
    return {
        "status": "ACTIVE",
        "session": session,
        "candidates": candidates
    }

@router.post("/api/voting/verify-face-lock")
@limiter.limit("10/minute")
async def verify_face_lock(
    request: Request, 
    frames: List[UploadFile] = File(...),
    session_id: Optional[str] = Form(None),
    share_token: Optional[str] = Form(None)
):
    """Hands-free automatic biometric face lock and verification endpoint."""
    start_time = time.time()
    
    # 1. Verify Target Session
    session = None
    if share_token:
        session = get_session_by_share_token(share_token)
    elif session_id:
        session = get_session_by_id(session_id)
        
    if not session:
        session = get_active_session()

    if not session or session.get('status') != 'ACTIVE':
        raise HTTPException(status_code=400, detail="No active voting session is accepting votes.")

    if not frames or len(frames) == 0:
        raise HTTPException(status_code=400, detail="No video frames provided.")
        
    decoded_frames = []
    for f in frames:
        content = await f.read()
        img = decode_image(content)
        if img is not None:
            decoded_frames.append(img)
            
    if len(decoded_frames) < 1:
        raise HTTPException(status_code=400, detail="At least 1 frame required for face detection.")

    # 2. Check Multiple Faces Guard on latest frame
    latest_frame = decoded_frames[-1]
    detected_faces = detect_faces(latest_frame)
    
    if len(detected_faces) > 1:
        return {
            "status": "MULTIPLE_FACES",
            "message": "Multiple faces detected. Please make sure only one person is visible."
        }
    elif len(detected_faces) == 0:
        return {
            "status": "NO_FACE",
            "message": "Looking for your face..."
        }

    is_single, single_msg, face = check_exactly_one_face(detected_faces)
    if not is_single:
        return {"status": "LOW_QUALITY", "message": single_msg}

    is_quality, quality_msg = check_face_quality(face)
    if not is_quality:
        return {"status": "LOW_QUALITY", "message": quality_msg}

    # 3. Liveness Check if multi-frame burst available
    if len(decoded_frames) >= 2:
        is_live, liveness_msg = check_liveness(decoded_frames)
        if not is_live:
            return {"status": "LOW_QUALITY", "message": liveness_msg}

    # 4. Extract Face Embedding
    emb = generate_embedding_from_face(face)
    if emb is None:
        return {"status": "LOW_QUALITY", "message": "Could not extract face embedding."}

    # 5. Search FAISS Vector Index
    matched_uuid, sim_score = search_index(emb)
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    if matched_uuid and sim_score > SIMILARITY_THRESHOLD:
        voter_data = get_voter_by_uuid(matched_uuid)
        if not voter_data:
            raise HTTPException(status_code=500, detail="Matched voter metadata not found.")

        # Check Eligibility
        if voter_data.get('eligibility_status') == 'NOT ELIGIBLE':
            return {
                "status": "NOT_ELIGIBLE",
                "message": "Voter eligibility has been revoked or restricted.",
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name']
            }

        # Check Duplicate Voting strictly for THIS active session
        session_vote = get_voter_vote_for_session(session['session_id'], voter_data['voter_id'])
        if session_vote is not None:
            return {
                "status": "ALREADY_VOTED",
                "message": f"You have already voted in '{session.get('title', 'this session')}'.",
                "voter_id": voter_data['voter_id'],
                "name": voter_data['name'],
                "session_id": session['session_id'],
                "session_title": session.get('title', ''),
                "voted_at": session_vote.get('cast_at')
            }

        # Voter is ELIGIBLE & HAS NOT VOTED -> Generate Vote Token
        token_expires = time.time() + 300  # Token valid for 5 minutes
        vote_token = jwt.encode({
            "voter_id": voter_data['voter_id'],
            "session_id": session['session_id'],
            "name": voter_data['name'],
            "exp": token_expires
        }, VOTE_TOKEN_SECRET, algorithm="HS256")

        return {
            "status": "IDENTITY_VERIFIED",
            "message": f"Welcome, {voter_data['name']}. Biometric verification successful.",
            "vote_token": vote_token,
            "voter_id": voter_data['voter_id'],
            "name": voter_data['name'],
            "similarity": float(sim_score),
            "processing_time_ms": processing_time_ms
        }

    return {
        "status": "UNKNOWN_FACE",
        "message": "Identity Not Recognized. Please make sure you are registered for this election.",
        "similarity": float(sim_score) if matched_uuid else 0.0,
        "processing_time_ms": processing_time_ms
    }

@router.post("/api/voting/cast-vote")
def cast_ballot_vote_api(req: CastVoteRequest):
    """Submit voter ballot with database-level UNIQUE(session_id, voter_id) constraint."""
    try:
        payload = jwt.decode(req.vote_token, VOTE_TOKEN_SECRET, algorithms=["HS256"])
        voter_id = payload.get("voter_id")
        session_id = payload.get("session_id")
        name = payload.get("name")
        
        if payload.get("exp", 0) < time.time():
            raise HTTPException(status_code=401, detail="Vote token expired. Please re-authenticate.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or forged vote authorization token.")

    # Check target session exists and is active
    session_data = get_session_by_id(session_id)
    if not session_data or session_data.get('status') not in ['ACTIVE', 'SCHEDULED']:
        raise HTTPException(status_code=400, detail="Voting session is no longer active.")

    # Submit vote with DB unique constraint
    success, message = submit_voter_ballot(session_id, voter_id, req.candidate_id)
    if not success:
        raise HTTPException(status_code=409, detail=message)

    return {
        "status": "SUCCESS",
        "message": "Your vote has been successfully cast and recorded.",
        "voter_id": voter_id,
        "name": name,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
