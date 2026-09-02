# 🗳️ FaceVote — Face-ID Electronic Voting Verification System

**FaceVote** is a modern, high-trust electronic voting platform utilizing facial recognition biometrics, real-time liveness anti-spoofing detection, sub-millisecond FAISS vector similarity search, and strict election session isolation.

---

## 📋 System Requirements

Before running FaceVote, ensure your computer has the following software installed:

* **Operating System**: Windows 10/11, macOS (Intel/Apple Silicon), or Linux (Ubuntu/Debian/Fedora).
* **Python**: **Python 3.11.x** *(Python 3.11 is required for pre-compiled ONNX Runtime, FAISS, and InsightFace binary packages)*.
* **Node.js**: **v18.x or v20.x+** (includes `npm`).
* **Git**: Installed and available in terminal / command prompt.
* **Hardware**: Built-in webcam or USB camera for facial scanning terminal.

---

## ⚡ One-Command Automatic Setup & Launch

You **do not** need to manually install Python environments, run pip commands, or install node modules. A single command handles everything automatically!

### 🪟 Windows (VS Code Terminal / CMD / PowerShell):

Open your terminal in the `FaceVote` directory and run **this single command**:

```cmd
start.bat
```

> **What `start.bat` automatically does in one step:**
> 1. Detects Python 3.11 (`py -3.11`, `py`, `python`).
> 2. Creates the Python virtual environment (`backend\venv`) if missing.
> 3. Installs & upgrades all backend dependencies (`requirements.txt`).
> 4. Generates `.env` config files.
> 5. Validates setup and downloads AI facial recognition models (`buffalo_l`).
> 6. Installs all frontend node packages (`node_modules`).
> 7. Launches both the **Backend API** (`http://127.0.0.1:8000`) and **Frontend Kiosk** (`http://localhost:5173`) in dedicated windows!

---

### 🍎 macOS & 🐧 Linux:

Open your terminal in the `FaceVote` directory and run **this single command**:

```bash
./start.sh
```

---

## 🛠️ Alternative: Manual Setup in Two Terminals (Windows)

If you prefer to run the backend and frontend separately in two VS Code terminal tabs:

### 🔹 Terminal 1 (Backend API):
```cmd
cd backend && py -3.11 -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python check_setup.py && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 🔹 Terminal 2 (Frontend Kiosk):
```cmd
cd frontend && npm install && npm run dev
```

---



## ⚡ Modular Launchers

The project includes individual scripts if you want to run servers independently:

* **Backend Only**:
  * macOS/Linux: `./start-backend.sh`
  * Windows: `start-backend.bat`
* **Frontend Only**:
  * macOS/Linux: `./start-frontend.sh`
  * Windows: `start-frontend.bat`

---

## ❓ Troubleshooting & FAQs

### 1. `python: command not found` or Wrong Python Version
* **Problem**: System cannot find Python or uses Python 3.13+.
* **Solution**: Ensure Python 3.11 is installed. On Windows, ensure "Add python.exe to PATH" was selected during installation. On macOS, use `brew install python@3.11`.

### 2. Windows PowerShell Script Execution Error
* **Problem**: `File start.ps1 cannot be loaded because running scripts is disabled on this system.`
* **Solution**: Run `start.bat` instead of a PowerShell `.ps1` script. `start.bat` runs natively in Command Prompt and PowerShell without restriction.

### 3. Port 8000 or Port 5173 Already in Use
* **Problem**: `[Errno 98] Address already in use` or port conflict.
* **Solution**: Stop any process using port 8000 or 5173 before launching. On macOS/Linux: `lsof -i :8000` followed by `kill -9 <PID>`. On Windows: `netstat -ano | findstr :8000` followed by `taskkill /PID <PID> /F`.

### 4. InsightFace Model Download Delay / Failure
* **Problem**: `InsightFace model initialization failed`.
* **Solution**: On the very first launch, InsightFace downloads the `buffalo_l` face recognition model (~300MB). Ensure an active internet connection on initial startup. Once cached in `~/.insightface/models/`, subsequent startups are instant and offline-capable.

### 5. Frontend Cannot Connect to Backend
* **Problem**: Network error or CORS failure in browser console.
* **Solution**: Verify that `backend/app/main.py` is running on `http://127.0.0.1:8000` and `frontend/.env` contains `VITE_API_URL=http://127.0.0.1:8000`.

### 6. `ModuleNotFoundError: No module named 'app'`
* **Problem**: Python cannot find the `app` package.
* **Solution**: Run the application via `start.sh` / `start.bat` or execute `uvicorn app.main:app` from inside the `backend/` directory. `backend/app/main.py` automatically injects the backend path into `sys.path`.

---

## 🔒 Default Admin Credentials

* **Admin Command Center Passcode**: `602142` *(Configurable in `.env` via `ADMIN_SECRET`)*

---

## 📄 License

MIT License. Designed for secure, transparent electronic voting research.
