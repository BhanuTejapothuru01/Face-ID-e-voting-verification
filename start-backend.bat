@echo off
SETLOCAL EnableDelayedExpansion

CD /D "%~dp0"

ECHO ============================================================
ECHO              FACEVOTE BACKEND API SERVER
ECHO ============================================================

:: Check Python virtual environment
IF NOT EXIST "%~dp0backend\venv\Scripts\python.exe" (
    ECHO [INFO] Creating Python virtual environment in backend\venv...
    
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
        ECHO [ERROR] Python is not installed or not found in system PATH.
        ECHO Please install Python 3.11 from https://www.python.org/downloads/
        PAUSE
        EXIT /B 1
    )

    !PYTHON_CMD! -m venv "%~dp0backend\venv"
    IF !ERRORLEVEL! NEQ 0 (
        ECHO [ERROR] Failed to create virtual environment.
        PAUSE
        EXIT /B 1
    )
)

SET VENV_PYTHON=%~dp0backend\venv\Scripts\python.exe
SET VENV_PIP=%~dp0backend\venv\Scripts\pip.exe

IF EXIST "%~dp0backend\requirements.txt" (
    ECHO [INFO] Ensuring backend dependencies are installed...
    "%VENV_PIP%" install --quiet -r "%~dp0backend\requirements.txt"
)

IF NOT EXIST "%~dp0backend\.env" (
    IF EXIST "%~dp0backend\.env.example" (
        COPY "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    ) ELSE IF EXIST "%~dp0.env.example" (
        COPY "%~dp0.env.example" "%~dp0backend\.env" >nul
    )
)

ECHO [INFO] Ensuring all AI models are downloaded...
"%VENV_PYTHON%" "%~dp0backend\download_models.py"

ECHO [INFO] Launching FaceVote Backend API on http://127.0.0.1:8000...
CD /D "%~dp0backend"
"%VENV_PYTHON%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
PAUSE
