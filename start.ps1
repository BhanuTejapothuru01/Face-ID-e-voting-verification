# FaceVote - Windows PowerShell Launcher & Setup Script
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "         FACEVOTE -- LOCAL ONE-CLICK LAUNCHER (POWERSHELL)  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Detect Python
$pythonCmd = $null
if (Get-Command "py" -ErrorAction SilentlyContinue) {
    $pythonCmd = "py -3.11"
} elseif (Get-Command "python" -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command "python3" -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
}

if (-not $pythonCmd) {
    Write-Host "[ERROR] Python was not found in PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.11 from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Using Python command: '$pythonCmd'" -ForegroundColor Green

# 2. Virtual Environment Setup
$venvPath = Join-Path $PSScriptRoot "backend\venv"
$venvPython = Join-Path $venvPath "Scripts\python.exe"
$venvPip = Join-Path $venvPath "Scripts\pip.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "[INFO] Creating virtual environment at $venvPath..." -ForegroundColor Yellow
    Invoke-Expression "$pythonCmd -m venv `"$venvPath`""
}

# 3. Dependencies Setup
Write-Host "[INFO] Upgrading pip and installing backend requirements..." -ForegroundColor Yellow
Start-Process -FilePath $venvPip -ArgumentList "install --upgrade pip" -Wait -NoNewWindow
if (Test-Path "backend\requirements.txt") {
    Start-Process -FilePath $venvPip -ArgumentList "install -r backend\requirements.txt" -Wait -NoNewWindow
}

# 4. Environment Variables Setup
if (-not (Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
    } elseif (Test-Path ".env.example") {
        Copy-Item ".env.example" "backend\.env"
    }
}

if (-not (Test-Path "frontend\.env")) {
    if (Test-Path "frontend\.env.example") {
        Copy-Item "frontend\.env.example" "frontend\.env"
    } else {
        "VITE_API_URL=http://127.0.0.1:8000" | Out-File -FilePath "frontend\.env" -Encoding utf8
    }
}

# 5. Frontend NPM Install
if (Test-Path "frontend") {
    if (-not (Test-Path "frontend\node_modules")) {
        Write-Host "[INFO] Installing frontend node_modules..." -ForegroundColor Yellow
        Start-Process -FilePath "npm" -ArgumentList "--prefix frontend install" -Wait -NoNewWindow
    }
}

Write-Host "============================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Environment Ready! Starting FaceVote Servers... " -ForegroundColor Green
Write-Host "  Frontend Kiosk:     http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API:        http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Swagger API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green

# 6. Launch Backend and Frontend in separate windows
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; & '$venvPython' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Backend and Frontend launched in new PowerShell windows." -ForegroundColor Green
