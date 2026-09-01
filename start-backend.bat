@echo off
CD /D "%~dp0"

IF NOT EXIST "backend\venv\Scripts\python.exe" (
    ECHO [INFO] Initializing Python virtual environment in backend\venv...
    py -3.11 -m venv backend\venv 2>nul || py -3 -m venv backend\venv 2>nul || python -m venv backend\venv
    IF EXIST "backend\venv\Scripts\python.exe" (
        backend\venv\Scripts\pip.exe install --upgrade pip
        IF EXIST "backend\requirements.txt" (
            backend\venv\Scripts\pip.exe install -r backend\requirements.txt
        )
    ) ELSE (
        ECHO [ERROR] Python environment creation failed. Ensure Python 3.11 is installed.
        PAUSE
        EXIT /B 1
    )
)

IF NOT EXIST "backend\.env" (
    IF EXIST "backend\.env.example" COPY "backend\.env.example" "backend\.env" >nul
)

ECHO [INFO] Launching FaceVote Backend API on http://127.0.0.1:8000...
CD /D "%~dp0backend"
"%~dp0backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
PAUSE


