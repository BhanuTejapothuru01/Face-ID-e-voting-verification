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

## 🚀 Quick Start (One-Command Setup)

FaceVote includes automated one-click launcher scripts that create the Python virtual environment, install all dependencies, configure environment variables, validate system setup, and launch both backend and frontend servers automatically.

### 🪟 Windows Setup (Command Prompt or PowerShell)

1. Open **Command Prompt** (`cmd`) or **PowerShell**.
2. Clone the repository:
   ```cmd
   git clone https://github.com/your-username/Face-ID-e-voting-verification.git
   cd Face-ID-e-voting-verification
   ```
3. Run the automated Windows launcher:
   ```cmd
   start.bat
   ```

*(Alternatively, you can double-click `start.bat` in Windows File Explorer).*

---

### 🍎 macOS & 🐧 Linux Setup (Terminal)

1. Open **Terminal**.
2. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Face-ID-e-voting-verification.git
   cd Face-ID-e-voting-verification
   ```
3. Grant execution permissions and run the launcher:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

---

## 🌐 Application URLs

Once the application starts, access the components at the following URLs:

| Component | URL | Description |
| :--- | :--- | :--- |
| 🏠 **Frontend Kiosk** | `http://localhost:5173` | Main Voter & Kiosk Portal |
| 🗳️ **Voting Terminal** | `http://localhost:5173/vote` | Hands-free facial verification & digital ballot |
| ⚙️ **Admin Command Center** | `http://localhost:5173/admin` | Real-time turnout, logs & metrics *(Passcode: `602142`)* |
| 📋 **Session Manager** | `http://localhost:5173/admin/sessions` | Create & publish election sessions |
| ⚙️ **Backend API** | `http://127.0.0.1:8000` | FastAPI core service |
| 🔍 **API Health Endpoint** | `http://127.0.0.1:8000/api/health` | System health check JSON endpoint |
| 📑 **Interactive Swagger Docs** | `http://127.0.0.1:8000/docs` | Interactive API documentation |

---

## 🛠️ Manual Step-by-Step Setup (Alternative)

If you prefer to start the backend and frontend separately:

### 1. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
# In project root
cp .env.example .env

# In backend directory
cp backend/.env.example backend/.env

# In frontend directory
cp frontend/.env.example frontend/.env
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment using Python 3.11
python3.11 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install backend dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run setup validation check
python check_setup.py

# Start FastAPI backend server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
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
