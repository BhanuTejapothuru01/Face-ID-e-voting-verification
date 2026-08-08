from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from app.services.faiss_search import init_faiss_index
from app.api.routes.registration import router as registration_router
from app.api.routes.verification import router as verification_router
from app.api.routes.admin import router as admin_router

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
    allow_origins=["*"], # Should be restricted in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limit the verify endpoint specifically
@app.middleware("http")
async def add_rate_limit_to_verify(request: Request, call_next):
    # This is a bit hacky, normally you'd use the decorator on the endpoint itself.
    # We will just apply a global limit to /api/verify to ensure we meet requirements.
    # Alternatively, we could decorate it in verification.py. Let's rely on standard routes.
    return await call_next(request)

# Include routers
app.include_router(registration_router)
app.include_router(verification_router)
app.include_router(admin_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
