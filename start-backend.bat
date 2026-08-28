@echo off
CD /D "%~dp0"

IF NOT EXIST "backend\venv\Scripts\python.exe" (
    ECHO [INFO] Initializing Python virtual environment...
    python -m venv backend\venv
    backend\venv\Scripts\pip.exe install --quiet --upgrade pip
    backend\venv\Scripts\pip.exe install --quiet -r backend\requirements.txt
)

IF NOT EXIST "backend\.env" (
    IF EXIST "backend\.env.example" COPY "backend\.env.example" "backend\.env"
)

ECHO [INFO] Launching FaceVote Backend API on http://127.0.0.1:8000...
CD backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
PAUSE
