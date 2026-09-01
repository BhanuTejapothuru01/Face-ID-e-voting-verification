#!/usr/bin/env bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

VENV_PYTHON="$SCRIPT_DIR/backend/venv/bin/python"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "[INFO] Initializing backend virtual environment..."
    python3 -m venv "$SCRIPT_DIR/backend/venv"
    "$SCRIPT_DIR/backend/venv/bin/pip" install --quiet --upgrade pip
    "$SCRIPT_DIR/backend/venv/bin/pip" install --quiet -r "$SCRIPT_DIR/backend/requirements.txt"
fi

if [ ! -f "$SCRIPT_DIR/backend/.env" ] && [ -f "$SCRIPT_DIR/backend/.env.example" ]; then
    cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
fi

echo "[INFO] Ensuring all AI models are downloaded..."
"$VENV_PYTHON" "$SCRIPT_DIR/backend/download_models.py"

echo "[INFO] Launching FaceVote Backend API on http://127.0.0.1:8000..."
cd "$SCRIPT_DIR/backend"
"$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

