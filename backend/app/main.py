import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend directory is in sys.path so 'app' package resolves cleanly from any location
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Python Version Verification Notice
if sys.version_info.major != 3 or sys.version_info.minor != 11:
    print(f"[WARNING] Python {sys.version_info.major}.{sys.version_info.minor} detected. Python 3.11 is the officially recommended version for FaceVote.")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.services.faiss_search import init_faiss_index
from app.services.face.detector import get_face_app
from app.api.routes.registration import router as registration_router
from app.api.routes.verification import router as verification_router
from app.api.routes.admin import router as admin_router
from app.api.routes.voting import router as voting_router

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup initialization
    print("[INFO] Starting FaceVote API...")
    print("[INFO] Initializing FAISS vector index...")
    init_faiss_index()
    
    print("[INFO] Pre-loading InsightFace biometric engine...")
    try:
        get_face_app()
        print("[INFO] InsightFace biometric engine ready.")
    except Exception as e:
        print(f"[WARNING] Could not pre-load InsightFace model during startup: {e}")
        print("[INFO] Model will attempt to load on first facial recognition request.")
        
    yield
    # Shutdown
    print("[INFO] Shutting down FaceVote API.")

app = FastAPI(title="FaceVote API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(registration_router)
app.include_router(verification_router)
app.include_router(admin_router)
app.include_router(voting_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "message": "FaceVote API is fully operational"
    }
