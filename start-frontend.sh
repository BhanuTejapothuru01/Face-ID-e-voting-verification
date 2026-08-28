#!/usr/bin/env bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing frontend node_modules..."
    npm install
fi

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
    else
        echo "VITE_API_URL=http://127.0.0.1:8000" > .env
    fi
fi

echo "[INFO] Launching FaceVote Frontend Kiosk on http://localhost:5173..."
npm run dev
