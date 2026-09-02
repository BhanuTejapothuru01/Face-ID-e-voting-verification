@echo off
SETLOCAL EnableDelayedExpansion

CD /D "%~dp0"

ECHO ============================================================
ECHO            FACEVOTE FRONTEND KIOSK PORTAL
ECHO ============================================================

CD /D "%~dp0frontend"

IF NOT EXIST "node_modules" (
    ECHO [INFO] Installing frontend npm packages (node_modules)...
    CALL npm install
)

IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        COPY ".env.example" ".env" >nul
    ) ELSE (
        ECHO VITE_API_URL=http://127.0.0.1:8000 > .env
    )
)

ECHO [INFO] Launching FaceVote Frontend Portal on http://localhost:5173...
CALL npm run dev
PAUSE
