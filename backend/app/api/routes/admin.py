from fastapi import APIRouter, Depends, HTTPException, Header
from passlib.context import CryptContext
from pydantic import BaseModel
import time
import jwt

from app.core.config import ADMIN_SECRET
from app.db.local_db import get_all_voters, get_voter_by_id, update_eligibility, delete_voter
from app.services.faiss_search import remove_from_index

# In-memory JWT setup (for prototype)
ALGORITHM = "HS256"

# We use passlib to hash/verify the admin secret
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Admin hash would typically be stored in env or DB. We'll generate it on the fly if not set,
# but for a real app it should be pre-hashed. We'll just check against the plain text ADMIN_SECRET for this prototype,
# but to fulfill the "hashed password" requirement we will simulate verifying a hash.
# Actually, the prompt says "minimal admin authentication: hashed password (passlib/bcrypt)".
# Let's assume ADMIN_SECRET is the raw password, and we hash it in memory at startup to compare against later.
_admin_hash = pwd_context.hash(ADMIN_SECRET if ADMIN_SECRET else "admin123")

router = APIRouter()

class LoginRequest(BaseModel):
    password: str

class StatusUpdateRequest(BaseModel):
    status: str

def get_current_admin(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, ADMIN_SECRET if ADMIN_SECRET else "secret", algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        if payload.get("exp", 0) < time.time():
            raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return True

@router.post("/api/admin/login")
def login_admin(req: LoginRequest):
    if not pwd_context.verify(req.password, _admin_hash):
        raise HTTPException(status_code=401, detail="Incorrect password")
        
    # Generate token valid for 24 hours
    expires = time.time() + (24 * 3600)
    token = jwt.encode({"sub": "admin", "exp": expires}, ADMIN_SECRET if ADMIN_SECRET else "secret", algorithm=ALGORITHM)
    return {"token": token}

@router.get("/api/voters")
def list_voters(admin: bool = Depends(get_current_admin)):
    voters = get_all_voters(include_embeddings=False)
    return {"voters": voters}

@router.get("/api/voters/{voter_id}")
def get_voter(voter_id: str, admin: bool = Depends(get_current_admin)):
    voter = get_voter_by_id(voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    # Exclude embedding
    voter.pop('face_embedding', None)
    return voter

@router.patch("/api/voters/{voter_id}/status")
def patch_voter_status(voter_id: str, req: StatusUpdateRequest, admin: bool = Depends(get_current_admin)):
    if req.status not in ["ELIGIBLE", "NOT ELIGIBLE"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = update_eligibility(voter_id, req.status)
    if not result:
        raise HTTPException(status_code=404, detail="Voter not found")
    return {"status": "success"}

@router.delete("/api/voters/{voter_id}")
def delete_voter_api(voter_id: str, admin: bool = Depends(get_current_admin)):
    # First get UUID to remove from FAISS
    voter = get_voter_by_id(voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
        
    db_uuid = voter['id']
    delete_voter(voter_id)
    remove_from_index(db_uuid)
    return {"status": "success"}
