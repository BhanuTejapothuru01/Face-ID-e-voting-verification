@echo off
SETLOCAL EnableDelayedExpansion

:: Navigate to project root directory
CD /D "%~dp0"

ECHO ============================================================
ECHO          FACEVOTE -- LOCAL ONE-CLICK LAUNCHER (WINDOWS)
ECHO ============================================================

:: 1. Detect Python Executable
SET PYTHON_CMD=

py -3.11 --version >nul 2>&1
IF !ERRORLEVEL! EQU 0 (
    SET PYTHON_CMD=py -3.11
) ELSE (
    py -3 --version >nul 2>&1
    IF !ERRORLEVEL! EQU 0 (
        SET PYTHON_CMD=py -3
    ) ELSE (
        python --version >nul 2>&1
        IF !ERRORLEVEL! EQU 0 (
            SET PYTHON_CMD=python
        ) ELSE (
            python3 --version >nul 2>&1
            IF !ERRORLEVEL! EQU 0 (
                SET PYTHON_CMD=python3
            )
        )
    )
)

IF "!PYTHON_CMD!"=="" (
    ECHO [ERROR] Python was not found in system PATH.
    ECHO Please install Python 3.11 from https://www.python.org/downloads/
    ECHO Ensure "Add python.exe to PATH" is checked during installation.
    PAUSE
    EXIT /B 1
)

ECHO [INFO] Using Python command: '!PYTHON_CMD!'

:: 2. Prepare Virtual Environment in backend\venv
IF NOT EXIST "%~dp0backend\venv\Scripts\python.exe" (
    ECHO [INFO] Creating Python virtual environment in backend\venv...
    !PYTHON_CMD! -m venv "%~dp0backend\venv"
    IF !ERRORLEVEL! NEQ 0 (
        ECHO [ERROR] Failed to create virtual environment.
        PAUSE
        EXIT /B 1
    )
)

SET VENV_PYTHON=%~dp0backend\venv\Scripts\python.exe
SET VENV_PIP=%~dp0backend\venv\Scripts\pip.exe

:: 3. Upgrade Pip & Install Backend Dependencies
ECHO [INFO] Upgrading pip...
"%VENV_PIP%" install --quiet --upgrade pip

IF EXIST "%~dp0backend\requirements.txt" (
    ECHO [INFO] Installing backend dependencies (this may take a minute)...
    "%VENV_PIP%" install --quiet -r "%~dp0backend\requirements.txt"
    IF !ERRORLEVEL! NEQ 0 (
        ECHO [WARNING] Dependency installation encountered non-fatal issues. Proceeding to validation...
    )
)

:: 4. Initialize .env Files
IF NOT EXIST "%~dp0backend\.env" (
    IF EXIST "%~dp0backend\.env.example" (
        COPY "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
        ECHO [INFO] Created backend\.env from backend\.env.example
    ) ELSE IF EXIST "%~dp0.env.example" (
        COPY "%~dp0.env.example" "%~dp0backend\.env" >nul
        ECHO [INFO] Created backend\.env from .env.example
    )
)

IF NOT EXIST "%~dp0.env" (
    IF EXIST "%~dp0.env.example" (
        COPY "%~dp0.env.example" "%~dp0.env" >nul
        ECHO [INFO] Created .env from .env.example
    )
)

:: 5. Download AI Models & Run Setup Validation Check
ECHO [INFO] Ensuring all AI models are downloaded...
"%VENV_PYTHON%" "%~dp0backend\download_models.py"

ECHO [INFO] Running backend setup validation check...
"%VENV_PYTHON%" "%~dp0backend\check_setup.py"

:: 6. Prepare Frontend Node Dependencies
IF EXIST "%~dp0frontend" (
    IF NOT EXIST "%~dp0frontend\node_modules" (
        ECHO [INFO] Installing frontend node packages...
        CALL npm --prefix "%~dp0frontend" install
    )

    IF NOT EXIST "%~dp0frontend\.env" (
        IF EXIST "%~dp0frontend\.env.example" (
            COPY "%~dp0frontend\.env.example" "%~dp0frontend\.env" >nul
        ) ELSE (
            ECHO VITE_API_URL=http://127.0.0.1:8000 > "%~dp0frontend\.env"
        )
        ECHO [INFO] Initialized frontend\.env
    )
)

ECHO ============================================================
ECHO  [SUCCESS] Environment ready! Launching FaceVote application...
ECHO ------------------------------------------------------------
ECHO  Frontend Kiosk:     http://localhost:5173
ECHO  Backend API:        http://127.0.0.1:8000
ECHO  API Health Status:  http://127.0.0.1:8000/api/health
ECHO  Swagger API Docs:   http://127.0.0.1:8000/docs
ECHO ============================================================

:: Start Backend and Frontend in separate dedicated windows
START "FaceVote Backend API" cmd /c "%~dp0start-backend.bat"
START "FaceVote Frontend Portal" cmd /c "%~dp0start-frontend.bat"

ECHO Both servers launched successfully in dedicated windows.
PAUSE
