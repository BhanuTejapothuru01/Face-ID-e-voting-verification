from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from app.services.faiss_search import init_faiss_index
from app.api.routes.registration import router as registration_router
from app.api.routes.verification import router as verification_router
from app.api.routes.admin import router as admin_router
from app.api.routes.voting import router as voting_router

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load FAISS index
    init_faiss_index()
    yield
    # Shutdown
    pass

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
    return {"status": "ok"}
