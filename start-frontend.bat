@echo off
SETLOCAL EnableDelayedExpansion

CD /D "%~dp0"

ECHO ============================================================
ECHO           FACEVOTE -- FRONTEND KIOSK PORTAL
ECHO ============================================================

CD /D "%~dp0frontend"

IF NOT EXIST "node_modules" (
    ECHO [INFO] Installing frontend node_modules...
    CALL npm install
)

IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        COPY ".env.example" ".env" >nul
        ECHO [INFO] Created frontend\.env from .env.example
    ) ELSE (
        ECHO VITE_API_URL=http://127.0.0.1:8000 > .env
        ECHO [INFO] Initialized frontend\.env
    )
)

ECHO [INFO] Launching Frontend Kiosk on http://localhost:5173...
CALL npm run dev
PAUSE
