import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_SECRET = os.getenv("ADMIN_SECRET")
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.4"))
