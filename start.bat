@echo off
SETLOCAL EnableDelayedExpansion

:: Navigate to project root directory
CD /D "%~dp0"

ECHO ============================================================
ECHO          FACEVOTE -- LOCAL ONE-CLICK LAUNCHER (WINDOWS)
ECHO ============================================================

:: 1. Detect Python executable
SET PYTHON_CMD=
WHERE python >nul 2>nul
IF %ERRORLEVEL% EQU 0 (
    SET PYTHON_CMD=python
) ELSE (
    WHERE py >nul 2>nul
    IF %ERRORLEVEL% EQU 0 (
        SET PYTHON_CMD=py -3.11
    )
)

IF "%PYTHON_CMD%"=="" (
    ECHO [ERROR] Python is not found in system PATH.
    ECHO Please install Python 3.11 from https://www.python.org/downloads/
    ECHO Ensure "Add python.exe to PATH" is checked during installation.
    PAUSE
    EXIT /B 1
)

ECHO [INFO] Using Python executable '%PYTHON_CMD%'

:: 2. Prepare Virtual Environment in backend\venv
IF NOT EXIST "backend\venv" (
    ECHO [INFO] Creating Python virtual environment in backend\venv...
    %PYTHON_CMD% -m venv backend\venv
)

SET VENV_PYTHON=backend\venv\Scripts\python.exe
SET VENV_PIP=backend\venv\Scripts\pip.exe

:: 3. Upgrade pip and Install Dependencies
ECHO [INFO] Installing/upgrading backend dependencies...
"%VENV_PIP%" install --quiet --upgrade pip
IF EXIST "backend\requirements.txt" (
    "%VENV_PIP%" install --quiet -r backend\requirements.txt
)

:: 4. Initialize .env Files
IF NOT EXIST "backend\.env" (
    IF EXIST "backend\.env.example" (
        COPY "backend\.env.example" "backend\.env" >nul
        ECHO [INFO] Created backend\.env from backend\.env.example
    ) ELSE IF EXIST ".env.example" (
        COPY ".env.example" "backend\.env" >nul
        ECHO [INFO] Created backend\.env from .env.example
    )
)

IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        COPY ".env.example" ".env" >nul
        ECHO [INFO] Created .env from .env.example
    )
)

:: 5. Run Setup Validation Script
ECHO [INFO] Running backend validation check...
"%VENV_PYTHON%" backend\check_setup.py

:: 6. Prepare Frontend Node Dependencies
IF EXIST "frontend" (
    IF NOT EXIST "frontend\node_modules" (
        ECHO [INFO] Installing frontend node_modules...
        CALL npm --prefix frontend install
    )

    IF NOT EXIST "frontend\.env" (
        IF EXIST "frontend\.env.example" (
            COPY "frontend\.env.example" "frontend\.env" >nul
        ) ELSE (
            ECHO VITE_API_URL=http://127.0.0.1:8000 > frontend\.env
        )
        ECHO [INFO] Initialized frontend\.env
    )
)

ECHO ============================================================
ECHO  [SUCCESS] Environment ready! Launching FaceVote application...
ECHO ------------------------------------------------------------
ECHO  Frontend Portal:    http://localhost:5173
ECHO  Backend API:        http://127.0.0.1:8000
ECHO  API Health Status:  http://127.0.0.1:8000/api/health
ECHO  Swagger API Docs:   http://127.0.0.1:8000/docs
ECHO ============================================================

:: Start Backend in separate window
START "FaceVote Backend Server" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Start Frontend in separate window
START "FaceVote Frontend Portal" cmd /k "cd frontend && npm run dev"

ECHO Both servers launched in dedicated windows.
PAUSE
