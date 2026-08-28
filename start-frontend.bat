@echo off
CD /D "%~dp0\frontend"

IF NOT EXIST "node_modules" (
    ECHO [INFO] Installing frontend node_modules...
    CALL npm install
)

IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        COPY ".env.example" ".env" >nul
    ) ELSE (
        ECHO VITE_API_URL=http://127.0.0.1:8000 > .env
    )
)

ECHO [INFO] Launching FaceVote Frontend Kiosk on http://localhost:5173...
CALL npm run dev
PAUSE
