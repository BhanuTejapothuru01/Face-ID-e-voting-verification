"""
Vercel Python Serverless Function Entry Point for FaceVote API
Imports the existing FastAPI application object from backend/app/main.py
"""

import sys
import os
from pathlib import Path

# Add backend and root workspace directories to Python sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Import existing FastAPI application
from app.main import app

# Vercel Serverless Function entry point
app = app
