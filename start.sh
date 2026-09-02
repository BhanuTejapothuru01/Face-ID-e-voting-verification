#!/usr/bin/env bash
set -e

# Determine project root directory (directory containing this script)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "          FACEVOTE — LOCAL ONE-CLICK LAUNCHER"
echo "============================================================"

# 1. Detect Python executable (prefer python3.11)
PYTHON_CMD=""
if command -v python3.11 &>/dev/null; then
    PYTHON_CMD="python3.11"
elif command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python is not installed or not in PATH."
    echo "Please install Python 3.11 from https://www.python.org/downloads/"
    exit 1
fi

PY_VERSION=$($PYTHON_CMD -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "[INFO] Using Python executable '$PYTHON_CMD' (version $PY_VERSION)"
if [ "$PY_VERSION" != "3.11" ]; then
    echo "[WARNING] Python 3.11 is strongly recommended. Detected Python $PY_VERSION."
fi

# 2. Prepare Virtual Environment in backend/venv
VENV_DIR="$SCRIPT_DIR/backend/venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "[INFO] Creating virtual environment in backend/venv..."
    $PYTHON_CMD -m venv "$VENV_DIR"
fi

VENV_PYTHON="$VENV_DIR/bin/python"
VENV_PIP="$VENV_DIR/bin/pip"

echo "[INFO] Verifying backend dependencies..."
"$VENV_PIP" install --quiet setuptools wheel --prefer-binary || true
"$VENV_PIP" install --quiet -r "$SCRIPT_DIR/backend/requirements.txt" --prefer-binary || true

# 4. Initialize .env files if missing
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    if [ -f "$SCRIPT_DIR/backend/.env.example" ]; then
        cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
        echo "[INFO] Created backend/.env from backend/.env.example"
    elif [ -f "$SCRIPT_DIR/.env.example" ]; then
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/backend/.env"
        echo "[INFO] Created backend/.env from .env.example"
    fi
fi

if [ ! -f "$SCRIPT_DIR/.env" ] && [ -f "$SCRIPT_DIR/.env.example" ]; then
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    echo "[INFO] Created root .env from .env.example"
fi

# 5. Download Models & Run Backend Validation Check
echo "[INFO] Ensuring all AI models are downloaded..."
"$VENV_PYTHON" "$SCRIPT_DIR/backend/download_models.py"

echo "[INFO] Running setup validation script..."
"$VENV_PYTHON" "$SCRIPT_DIR/backend/check_setup.py" || true


# 6. Prepare Frontend Node Dependencies
if [ -d "$SCRIPT_DIR/frontend" ]; then
    if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
        echo "[INFO] Installing frontend node_modules..."
        npm --prefix "$SCRIPT_DIR/frontend" install
    fi

    if [ ! -f "$SCRIPT_DIR/frontend/.env" ]; then
        if [ -f "$SCRIPT_DIR/frontend/.env.example" ]; then
            cp "$SCRIPT_DIR/frontend/.env.example" "$SCRIPT_DIR/frontend/.env"
        else
            echo "VITE_API_URL=http://127.0.0.1:8000" > "$SCRIPT_DIR/frontend/.env"
        fi
        echo "[INFO] Initialized frontend/.env"
    fi
fi

echo "============================================================"
echo " [SUCCESS] Environment ready! Launching FaceVote application..."
echo "------------------------------------------------------------"
echo " 🌐 Frontend Portal:    http://localhost:5173"
echo " ⚙️ Backend API:        http://127.0.0.1:8000"
echo " 🔍 API Health Status:  http://127.0.0.1:8000/api/health"
echo " 📑 Swagger API Docs:   http://127.0.0.1:8000/docs"
echo "============================================================"
echo "Press Ctrl+C to stop all servers."
echo ""

# Cleanup background jobs on termination
trap 'kill $(jobs -p) 2>/dev/null || true' EXIT

# Start backend server
(cd "$SCRIPT_DIR/backend" && "$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload) &
BACKEND_PID=$!

# Start frontend dev server
(cd "$SCRIPT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

wait
