import os
from dotenv import load_dotenv

load_dotenv()

# Server & Security Settings
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "602142")
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.68"))

# Quality & Biometric Filtering Settings
FACE_MIN_SIZE = int(os.getenv("FACE_MIN_SIZE", "100"))
FACE_MIN_DETECTION_SCORE = float(os.getenv("FACE_MIN_DETECTION_SCORE", "0.6"))
BLUR_THRESHOLD = float(os.getenv("BLUR_THRESHOLD", "45.0"))
BRIGHTNESS_MIN = float(os.getenv("BRIGHTNESS_MIN", "35.0"))
BRIGHTNESS_MAX = float(os.getenv("BRIGHTNESS_MAX", "225.0"))
MAX_POSE_ANGLE = float(os.getenv("MAX_POSE_ANGLE", "25.0"))

# Multi-Template & Verification Tuning
TOP_K_SEARCH = int(os.getenv("TOP_K_SEARCH", "5"))
MIN_MATCHING_FRAMES = int(os.getenv("MIN_MATCHING_FRAMES", "3"))
MAX_TEMPLATES_PER_VOTER = int(os.getenv("MAX_TEMPLATES_PER_VOTER", "10"))
OUTLIER_DISTANCE_THRESHOLD = float(os.getenv("OUTLIER_DISTANCE_THRESHOLD", "0.45"))

# Verification Candidate Scoring Weights
WEIGHT_BEST_SIM = float(os.getenv("WEIGHT_BEST_SIM", "0.50"))
WEIGHT_TOP_K_AVG = float(os.getenv("WEIGHT_TOP_K_AVG", "0.30"))
WEIGHT_TEMPORAL_CONSISTENCY = float(os.getenv("WEIGHT_TEMPORAL_CONSISTENCY", "0.20"))

# Supabase Credentials (Loaded via Environment)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
