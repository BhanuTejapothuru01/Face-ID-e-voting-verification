# FaceVote - Windows PowerShell Launcher & Setup Script
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "         FACEVOTE -- LOCAL ONE-CLICK LAUNCHER (POWERSHELL)  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Detect Python
$pythonCmd = $null
if (Get-Command "py" -ErrorAction SilentlyContinue) {
    $test311 = & py -3.11 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pythonCmd = "py -3.11"
    } else {
        $pythonCmd = "py -3"
    }
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
if (Test-Path $venvPip) {
    Start-Process -FilePath $venvPip -ArgumentList "install --upgrade pip" -Wait -NoNewWindow
    if (Test-Path "backend\requirements.txt") {
        Start-Process -FilePath $venvPip -ArgumentList "install -r backend\requirements.txt" -Wait -NoNewWindow
    }
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
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$PSScriptRoot\frontend`" && npm install" -Wait -NoNewWindow
    }
}

# 6. Run Model Download & Validation Check
if (Test-Path $venvPython) {
    Write-Host "[INFO] Ensuring AI models are downloaded..." -ForegroundColor Yellow
    Start-Process -FilePath $venvPython -ArgumentList "backend\download_models.py" -Wait -NoNewWindow
    Start-Process -FilePath $venvPython -ArgumentList "backend\check_setup.py" -Wait -NoNewWindow
}

Write-Host "============================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Environment Ready! Starting FaceVote Servers... " -ForegroundColor Green
Write-Host "  Frontend Kiosk:     http://localhost:5173" -ForegroundColor White
Write-Host "  Backend API:        http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Swagger API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green

# 7. Launch Backend and Frontend in separate windows
Start-Process cmd.exe -ArgumentList "/c `"$PSScriptRoot\start-backend.bat`""
Start-Process cmd.exe -ArgumentList "/c `"$PSScriptRoot\start-frontend.bat`""

Write-Host "Backend and Frontend launched in new windows." -ForegroundColor Green
