# Face-ID E-Voting Verification System

## 1. Project Overview

The **Face-ID E-Voting Verification System** is a real-time biometric voter eligibility verification application designed for academic demonstrations and prototype terminals. It answers a fundamental security question before a ballot is issued: *"Is the individual standing in front of the terminal a registered, eligible voter?"*

> **IMPORTANT SCOPE DISCLAIMER:** This application is **NOT** an electronic voting or balloting system. It does not record votes, store election ballots, tally candidate results, or manage election races. It strictly handles **biometric voter identity registration, liveness detection, and eligibility verification**.

### How It Works

1. **Camera Feed & Frame Capture**: The React frontend accesses the webcam and captures a burst of live image frames.
2. **Liveness Verification**: The backend calculates optical flow pixel variance across consecutive frames to detect micro-movements and prevent static photo spoofing.
3. **Face Detection & Quality Check**: OpenCV and InsightFace detect faces in the frame, ensuring exactly one face is present and that the face meets size/quality requirements.
4. **512D Face Embedding Extraction**: InsightFace (`buffalo_l` model) extracts a normalized 512-dimensional feature vector (embedding) representing the facial structure. Frame embeddings are fused using vector mean averaging.
5. **FAISS Similarity Search**: An in-memory FAISS `IndexFlatIP` (Inner Product) index compares the face embedding against all registered voters using cosine similarity.
6. **Database Persistence**: Voter metadata (voter ID, name, eligibility status) and face embeddings are saved locally in a SQLite database (`voters.db`).

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                        Browser (Webcam)                           |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                      React + Vite Frontend                        |
|                     (http://localhost:5173)                       |
+-------------------------------------------------------------------+
                                  |
                           HTTP / REST API
                                  |
                                  v
+-------------------------------------------------------------------+
|                      FastAPI Backend Server                       |
|                     (http://localhost:8000)                       |
+-------------------------------------------------------------------+
      |                           |                          |
      v                           v                          v
+-------------+         +-------------------+      +------------------+
| Liveness    |         | OpenCV +          |      |  FAISS In-Memory |
| Variance    |         | InsightFace       |      |  Similarity      |
| Check       |         | (buffalo_l)       |      |  Vector Search   |
+-------------+         +-------------------+      +------------------+
                                  |                          |
                                  v                          v
                        +-----------------------------------------+
                        |      SQLite Database (voters.db)        |
                        +-----------------------------------------+
```

---

## 2. Features

- **Live Frame Burst Capture**: Captures multiple frames per second from the client webcam for robust verification.
- **Optical Flow Liveness Detection**: Analyzes frame-to-frame pixel differences to filter out static printed photos or phone screen screenshots.
- **Single-Face & Quality Enforcement**: Ensures only one person is in front of the terminal and prompts the user to step closer if the face crop is too small.
- **InsightFace 512D Vector Embeddings**: Uses the `buffalo_l` model set for high-accuracy facial detection and feature vector generation.
- **Embedding Fusion**: Averages multi-frame embeddings to create a robust, noise-resilient registration template.
- **Fast Vector Search with FAISS**: Utilizes an in-memory FAISS `IndexFlatIP` index for ultra-fast nearest-neighbor matching.
- **Duplicate Registration Prevention**: Automatically blocks registering the same face under multiple voter profiles based on a similarity threshold (`SIMILARITY_THRESHOLD`).
- **Local SQLite Database (`voters.db`)**: Persists voter metadata and vector embeddings locally without requiring external cloud databases.
- **Admin Management Dashboard**: Secured with JWT authentication; allows administrators to view registered voters, toggle eligibility (`ELIGIBLE` / `NOT ELIGIBLE`), and delete voter records.
- **API Rate Limiting**: Protects sensitive endpoints (e.g. `/api/verify`) against brute-force automated requests using `slowapi`.

---

## 3. Project Structure

```
Face-ID-e-voting-verification/
├── .env.example                 # Template for environment configuration
├── .gitignore                    # Git exclusion rules for secrets, DBs, and dependencies
├── README.md                     # Project documentation and setup guide
├── backend/                      # FastAPI Backend Application
│   ├── app/                      # Backend application source code
│   │   ├── __init__.py           # Package marker
│   │   ├── main.py               # FastAPI application entry point & CORS configuration
│   │   ├── api/                  # API routers and endpoints
│   │   │   ├── __init__.py
│   │   │   └── routes/           # Endpoint route handlers
│   │   │       ├── __init__.py
│   │   │       ├── admin.py      # Admin login, voter list, status patch, deletion
│   │   │       ├── registration.py # Voter biometric registration endpoint
│   │   │       └── verification.py # Voter biometric verification endpoint
│   │   ├── core/                 # Core configuration
│   │   │   ├── __init__.py
│   │   │   └── config.py         # Environment variables parser (.env)
│   │   ├── db/                   # Database layer
│   │   │   ├── __init__.py
│   │   │   ├── local_db.py       # SQLite helper functions & schema definition
│   │   │   └── voters.db         # Local SQLite database (created on startup)
│   │   └── services/             # Core business & ML logic
│   │       ├── __init__.py
│   │       ├── faiss_search.py   # FAISS index initialization, search, & updates
│   │       └── face/             # Facial recognition pipeline
│   │           ├── __init__.py
│   │           ├── detector.py   # InsightFace detector & single-face/quality rules
│   │           ├── embedding.py  # 512D vector extraction & fusion logic
│   │           └── liveness.py   # Optical flow motion variance liveness check
│   ├── requirements.txt          # Python package dependencies
│   └── venv/                     # Python virtual environment (ignored by Git)
├── frontend/                     # React + Vite Frontend Application
│   ├── index.html                # HTML document entry point
│   ├── package.json              # Frontend dependencies and npm scripts
│   ├── package-lock.json         # Locked npm dependency versions
│   ├── vite.config.js            # Vite configuration (Tailwind & React plugins)
│   ├── public/                   # Static public assets
│   └── src/                      # React source code
│       ├── App.jsx               # Main React router & layout component
│       ├── App.css               # Global application styles
│       ├── index.css             # Tailwind CSS imports
│       ├── main.jsx              # DOM render entry point
│       ├── assets/               # Image & icon assets
│       ├── components/           # Reusable UI components
│       │   ├── Camera.jsx        # Webcam video feed component
│       │   ├── FaceScanner.jsx   # Live frame burst capture controller
│       │   ├── ResultCard.jsx    # Verification result display card
│       │   ├── ScanAnimation.jsx # Biometric scan overlay UI
│       │   └── StatusMessage.jsx # Alert & notification banners
│       └── pages/                # Page components
│           ├── AdminDashboard.jsx # Admin voter management table & auth modal
│           ├── Home.jsx          # Terminal mode selection screen
│           ├── Register.jsx       # Voter registration page
│           └── Verify.jsx         # Live voter verification terminal page
└── scripts/                      # Utility scripts
    └── rebuild_index.py          # Standalone script to manually rebuild FAISS index from SQLite
```

---

## 4. System Requirements

### Hardware Requirements
- **Webcam**: Standard integrated HD camera or USB external webcam (minimum 720p recommended).
- **RAM**: Minimum 4 GB (8 GB recommended to handle ONNX model loading and vector indexing).
- **CPU**: Dual-core x86_64 or ARM64 processor (Apple Silicon M1/M2/M3 fully supported).
- **Internet Connection**: Required during initial backend startup to automatically download the InsightFace `buffalo_l` model package (~200–300 MB). Subsequent runs operate fully offline.

### Software Requirements

| Requirement | Recommended Version | Supported Range | Reason / Notes |
| :--- | :--- | :--- | :--- |
| **Python** | **3.11.x** | **3.8 – 3.11** | **Python 3.11 is strongly recommended.** Prebuilt wheels for `faiss-cpu` and `insightface` are available. Python 3.12+ may fail during `pip install` due to missing C extension wheels. |
| **Node.js** | **20.x (LTS)** | **18.x or higher** | Required to execute Vite and install frontend packages. |
| **npm** | **10.x** | **9.x or higher** | Bundled with Node.js. |
| **Git** | Latest | 2.x+ | Required to clone the repository. |
| **Web Browser** | Latest Chrome / Edge | Modern browser with WebRTC | Chrome, Edge, Firefox, or Brave (webcam permissions must be granted). |

---

## 5. Clone the Repository

Open your terminal or command prompt and run the following commands:

```bash
git clone https://github.com/BhanuTejapothuru01/Face-ID-e-voting-verification.git
cd Face-ID-e-voting-verification
```

---

## 6. Backend Setup

The backend requires Python (version 3.8 to 3.11, with 3.11 being optimal).

### Step-by-Step Backend Setup

#### 1. Navigate to the backend directory:
```bash
cd backend
```

#### 2. Create a Python virtual environment:

- **macOS / Linux / Windows (PowerShell):**
  ```bash
  python3 -m venv venv
  ```
  *(If python3 points to Python 3.11, or use `python3.11 -m venv venv`)*

- **Windows (CMD):**
  ```cmd
  python -m venv venv
  ```

#### 3. Activate the virtual environment:

- **macOS / Linux (Bash or Zsh):**
  ```bash
  source venv/bin/activate
  ```

- **Windows PowerShell:**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
  *(If PowerShell execution policy blocks scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

- **Windows Command Prompt (CMD):**
  ```cmd
  venv\Scripts\activate.bat
  ```

#### 4. Upgrade pip:
```bash
python -m pip install --upgrade pip
```

#### 5. Install Python dependencies:
```bash
pip install -r requirements.txt
```

#### 6. Configure environment variables:
From the project root (or inside `backend`), copy `.env.example` to `.env`:

- **macOS / Linux:**
  ```bash
  cp ../.env.example ../.env
  ```
  *(or `cp .env.example .env` if you are in the project root)*

- **Windows PowerShell:**
  ```powershell
  Copy-Item ..\.env.example ..\.env
  ```

- **Windows CMD:**
  ```cmd
  copy ..\.env.example ..\.env
  ```

#### 7. Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

> **Import Path Note:** Always run `uvicorn app.main:app --reload` from inside the `backend/` directory, where `app` is a direct subfolder containing `main.py`.

The backend will start at: `http://localhost:8000`  
Swagger API Documentation is available at: `http://localhost:8000/docs`

---

## 7. Environment Variables

The application relies on environment variables loaded via `python-dotenv`. A template `.env.example` file is provided in the repository root.

### Copy Template to `.env`

```env
ADMIN_SECRET=your_admin_secret
SIMILARITY_THRESHOLD=0.4
```

### Detailed Parameter Breakdown

| Environment Variable | Default Fallback | Purpose & Description |
| :--- | :--- | :--- |
| `ADMIN_SECRET` | `admin123` | Secret password key used for hashing admin credentials and signing JWT authorization tokens for the Admin Dashboard. Change this value in production environments. |
| `SIMILARITY_THRESHOLD` | `0.4` | Cosine similarity threshold for InsightFace 512D embeddings. Values range from `0.0` to `1.0`. A threshold of `0.4`–`0.5` is optimal for InsightFace cosine distance to accurately distinguish unique individuals without false positives. |

---

## 8. InsightFace Model Setup

InsightFace uses the **`buffalo_l`** model bundle for face detection and recognition.

### Automated Initial Download
- **No manual downloading is needed.**
- On the **very first run** of the FastAPI backend when an endpoint initializes `FaceAnalysis(name='buffalo_l')`, InsightFace automatically detects that model weights are missing and downloads `buffalo_l.zip` (~200–300 MB) from GitHub/ONNX releases.
- The weights are automatically extracted and cached locally in your user home directory:
  - **macOS / Linux**: `~/.insightface/models/buffalo_l/`
  - **Windows**: `C:\Users\<YourUsername>\.insightface\models\buffalo_l\`
- **First Run Requirement**: Ensure your computer is connected to the internet during the initial startup so InsightFace can download the models.
- **Subsequent Runs**: After the initial download completes, all future server restarts load the cached models directly from disk without requiring internet access.

---

## 9. FAISS Setup

FAISS (Facebook AI Similarity Search) is used for high-speed, in-memory vector search over facial embeddings.

### How FAISS Works in This Project
- **No standalone FAISS server or separate installation is required.**
- Installed automatically via `faiss-cpu` in `backend/requirements.txt`.
- The application initializes an in-memory `IndexFlatIP` (Inner Product) index configured for 512-dimensional L2-normalized vectors.
- On backend startup (`lifespan` handler in `app/main.py`), `init_faiss_index()` automatically reads all existing voter embeddings from SQLite (`voters.db`) and builds the FAISS index.
- New voter registrations dynamically insert their vectors into both SQLite and the live FAISS index.
- If you manually alter `voters.db` outside the application, you can rebuild the FAISS index at any time by running:
  ```bash
  python scripts/rebuild_index.py
  ```

---

## 10. Frontend Setup

The frontend is built with React, Vite, and Tailwind CSS.

### Step-by-Step Frontend Setup

#### 1. Open a new terminal window and navigate to the `frontend/` directory:
```bash
cd frontend
```

#### 2. Install npm dependencies:
```bash
npm install
```

#### 3. Start the Vite development server:
```bash
npm run dev
```

The terminal will output the local development URL:
```
  VITE v8.2.0  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 11. Running the Complete Application

To run the complete system, **both the backend and frontend must run simultaneously in separate terminal windows**.

### Multi-Terminal Execution Guide

```
+------------------------------------+      +------------------------------------+
|         TERMINAL 1 (Backend)       |      |        TERMINAL 2 (Frontend)       |
+------------------------------------+      +------------------------------------+
| cd backend                         |      | cd frontend                        |
| source venv/bin/activate           |      | npm run dev                        |
| uvicorn app.main:app --reload      |      |                                    |
|                                    |      |                                    |
| -> Running at http://localhost:8000|      | -> Running at http://localhost:5173|
+------------------------------------+      +------------------------------------+
                   \                                    /
                    \                                  /
                     v                                v
         +-------------------------------------------------+
         |                 Web Browser                     |
         |         http://localhost:5173                   |
         +-------------------------------------------------+
```

1. **Terminal 1 (Backend)**: Run `uvicorn app.main:app --reload` inside `backend/`.
2. **Terminal 2 (Frontend)**: Run `npm run dev` inside `frontend/`.
3. Open your browser and navigate to `http://localhost:5173`.

---

## 12. Camera Permissions

Because facial eligibility verification relies on live video input, your web browser must be granted camera access.

### Enabling Camera Access in Chrome / Edge / Brave / Firefox
1. When you first open `http://localhost:5173/register` or `http://localhost:5173/verify`, the browser will display a permission prompt: **"localhost wants to Use your camera"**.
2. Click **Allow**.
3. If you accidentally clicked **Block**:
   - Click the **Lock / Tune icon** located to the left of the URL bar (`http://localhost:5173`).
   - Locate **Camera** in the dropdown list and switch the permission to **Allow**.
   - Refresh the page (`F5` or `Cmd+R`).
4. Ensure no other application (e.g., Zoom, Teams, Skype, or Photo Booth) is currently using your camera.

---

## 13. First-Time Startup

When starting the application for the first time on a fresh computer, expect the following initial sequence:

1. **Package Installation Overhead**: Initial `pip install` and `npm install` may take 2–5 minutes depending on network speed.
2. **Database Auto-Initialization**: On backend start, `voters.db` is automatically created inside `backend/app/db/` if it does not already exist.
3. **InsightFace Model Download Delay**: The first API call involving face processing triggers the download of the `buffalo_l` model (~200–300 MB). You may notice a 15–30 second delay on the very first registration or verification attempt while weights are saved to disk. Subsequent requests execute instantly.
4. **Browser Camera Access Prompt**: The browser will request explicit permission to stream webcam video.

---

## 14. Common Problems and Solutions

### Problem: `python` or `python3` command not found
- **Cause**: Python is not installed or not added to your system environment `PATH`.
- **Solution**: Download and install **Python 3.11** from [python.org](https://www.python.org/downloads/). During installation on Windows, **check the box: "Add python.exe to PATH"**.

---

### Problem: `pip install` fails or error compiling wheels
- **Cause**: Using Python 3.12 or 3.13 where C++ wheels for packages like `insightface` or `faiss-cpu` are missing, or missing Microsoft Visual C++ Build Tools on Windows.
- **Solution**: 
  - Ensure you are using **Python 3.11**.
  - On Windows, install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) if prompted for C++ compiler errors.

---

### Problem: FAISS installation fails (`faiss-cpu`)
- **Cause**: Conflict between `faiss` and `faiss-cpu`, or unsupported Python 3.12 architecture.
- **Solution**: Ensure your virtual environment uses Python 3.11. Run:
  ```bash
  pip uninstall faiss faiss-cpu -y
  pip install faiss-cpu
  ```

---

### Problem: InsightFace / ONNX Runtime execution error
- **Cause**: Mismatch between `onnxruntime` and GPU/CPU providers.
- **Solution**: The project uses `CPUExecutionProvider` by default. Verify `backend/requirements.txt` contains `onnxruntime` and `opencv-python-headless`. Run:
  ```bash
  pip install --force-reinstall onnxruntime opencv-python-headless
  ```

---

### Problem: FastAPI fails to start (`ModuleNotFoundError: No module named 'app'`)
- **Cause**: Running uvicorn from the wrong working directory (e.g. running from project root instead of `backend/`).
- **Solution**: Always navigate into `backend/` before launching uvicorn:
  ```bash
  cd backend
  uvicorn app.main:app --reload
  ```

---

### Problem: Frontend cannot connect to backend (`NetworkError` or `Failed to fetch`)
- **Cause**: The backend server is not running, or is running on a port other than `8000`.
- **Solution**:
  1. Verify Terminal 1 shows `Application startup complete` on `http://127.0.0.1:8000`.
  2. Open `http://localhost:8000/api/health` in your browser. It should return `{"status":"ok"}`.
  3. Ensure no firewall or proxy is blocking port 8000.

---

### Problem: Camera stream does not open or black screen
- **Cause**: Browser camera permission is denied, or another application is locking the webcam hardware.
- **Solution**:
  1. Check the browser address bar icon and verify camera access is set to **Allow**.
  2. Close any background apps using the camera (Zoom, Teams, FaceTime, Photo Booth).
  3. Restart your browser.

---

### Problem: Port 8000 or 5173 already in use

- **macOS / Linux**:
  ```bash
  # Find and kill process on port 8000
  lsof -i :8000
  kill -9 <PID>

  # Find and kill process on port 5173
  lsof -i :5173
  kill -9 <PID>
  ```

- **Windows (PowerShell)**:
  ```powershell
  # Find process on port 8000
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force

  # Find process on port 5173
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
  ```

---

### Problem: `npm install` fails
- **Cause**: Outdated Node.js version or corrupted `node_modules`.
- **Solution**: Check Node version (`node -v`). Ensure Node.js is 18.x or 20.x+. Clear cache and reinstall:
  ```bash
  cd frontend
  rm -rf node_modules package-lock.json
  npm install
  ```

---

## 15. Clean Reinstallation

If your local environment becomes corrupted, follow these steps to reset the project completely without deleting source code or voter database records:

### Reset Backend Environment
```bash
cd backend
# Remove existing virtual environment
rm -rf venv               # macOS/Linux
rd /s /q venv             # Windows CMD

# Recreate virtual environment
python3 -m venv venv      # macOS/Linux/PowerShell
source venv/bin/activate  # macOS/Linux
.\venv\Scripts\Activate   # Windows

# Reinstall dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Reset Frontend Environment
```bash
cd frontend
# Remove node modules and lockfile
rm -rf node_modules package-lock.json   # macOS/Linux
rd /s /q node_modules                   # Windows CMD
del package-lock.json                   # Windows CMD

# Reinstall npm packages
npm install
```

---

## 16. Development Workflow

Follow this standard procedure during development:

1. **Activate Environment & Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate  # (or Windows equivalent)
   uvicorn app.main:app --reload
   ```
2. **Start Frontend Server**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Access Application**:
   Open `http://localhost:5173` in Chrome or Edge.
4. **Test Voter Registration**:
   Navigate to `/register`, enter a test voter name, align your face in front of the camera, and submit.
5. **Test Voter Verification**:
   Navigate to `/verify`, align your face, and view the verification result, similarity score, and eligibility status.
6. **Test Admin Dashboard**:
   Navigate to `/admin`, log in using `ADMIN_SECRET` (default: `admin123`), view registered voters, toggle eligibility, or delete test entries.
7. **Stop Application**:
   Press `Ctrl + C` in both terminal windows to stop the servers cleanly.

---

## 17. API Overview

The FastAPI backend exposes the following RESTful API endpoints:

| Method | Endpoint | Purpose / Summary | Request Payload | Response Summary |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check | None | `{"status": "ok"}` |
| `POST` | `/api/register` | Registers a new voter with face frame burst | Form Data: `name` (str), `frames` (List of image files) | `{"status": "success", "voter_id": "FV-XXXX", "name": "...", "message": "..."}` |
| `POST` | `/api/verify` | Verifies live voter identity against FAISS index (Rate limited: 5/min) | Form Data: `frames` (List of image files) | `{"status": "success", "eligibility": "ELIGIBLE", "similarity": 0.85, "processing_time_ms": 120, "voter_id": "...", "name": "..."}` |
| `POST` | `/api/admin/login` | Authenticates administrator | JSON: `{"password": "your_admin_secret"}` | `{"token": "jwt_token_string"}` |
| `GET` | `/api/voters` | Lists all registered voters (omits embeddings) | Header: `Authorization: Bearer <token>` | `{"voters": [{"id": "...", "voter_id": "FV-...", "name": "...", "eligibility_status": "ELIGIBLE"}, ...]}` |
| `GET` | `/api/voters/{voter_id}` | Retrieves detailed record for a specific voter | Header: `Authorization: Bearer <token>` | `{"id": "...", "voter_id": "FV-...", "name": "...", "eligibility_status": "ELIGIBLE", "created_at": "..."}` |
| `PATCH` | `/api/voters/{voter_id}/status` | Updates voter eligibility status (`ELIGIBLE` / `NOT ELIGIBLE`) | Header: `Authorization: Bearer <token>`, JSON: `{"status": "NOT ELIGIBLE"}` | `{"status": "success"}` |
| `DELETE` | `/api/voters/{voter_id}` | Deletes voter from database and FAISS index | Header: `Authorization: Bearer <token>` | `{"status": "success"}` |

---

## 18. Security Notes

- **Never Commit `.env`**: The `.env` file contains configuration secrets (`ADMIN_SECRET`) and must remain listed in `.gitignore`.
- **No Raw Image Storage**: The system never stores raw image files or video recordings on disk or in the database. Only mathematical 512D embeddings are retained.
- **Academic Scope Warning**: This application is an academic research prototype. Production deployment requires 3D depth camera integration (e.g. Intel RealSense or Apple TrueDepth), active challenge-response liveness tests, and production-grade HTTPS encryption with hardware security modules (HSMs).

---

## 19. Git Ignore Verification

The project includes a root `.gitignore` file to ensure local environment files and databases are never accidentally pushed to GitHub:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
venv/
.env

# Node
node_modules/
.npm
npm-debug.log

# Database
*.db
*.sqlite3

# OS
.DS_Store
```

> **Reminder**: Ensure `.env` is created locally on every machine running the project and is never committed to source control.

---

## 20. Quick Start

For experienced developers who want to get up and running immediately:

### Windows Quick Start

```powershell
# 1. Clone project
git clone https://github.com/BhanuTejapothuru01/Face-ID-e-voting-verification.git
cd Face-ID-e-voting-verification

# 2. Setup environment file
Copy-Item .env.example .env

# 3. Setup and start Backend (Terminal 1)
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload

# 4. Setup and start Frontend (Terminal 2 - open new window)
cd Face-ID-e-voting-verification\frontend
npm install
npm run dev
```

### macOS / Linux Quick Start

```bash
# 1. Clone project
git clone https://github.com/BhanuTejapothuru01/Face-ID-e-voting-verification.git
cd Face-ID-e-voting-verification

# 2. Setup environment file
cp .env.example .env

# 3. Setup and start Backend (Terminal 1)
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload

# 4. Setup and start Frontend (Terminal 2 - open new window)
cd ../frontend
npm install
npm run dev
```

---

## 21. Important Notes

> ⚠️ **CRITICAL**: This application consists of **two separate services** (FastAPI backend and React frontend). **Both services must be running simultaneously in separate terminal windows** for the system to function.
>
> ⚠️ Cloning the repository alone does **not** install Python packages or Node modules. You must execute `pip install -r requirements.txt` in the `backend/` folder and `npm install` in the `frontend/` folder.

---

## 22. Expected Result

After successfully following the setup guide and launching both servers:

- **Frontend Interface**: Visit `http://localhost:5173` in your browser. You will see the **FaceVote Biometric Verification Terminal** landing page with navigation options for **Register Voter**, **Verify Eligibility**, and **Admin Portal**.
- **Backend API Server**: Visit `http://localhost:8000/docs` to access the interactive FastAPI Swagger UI documentation.
- **Webcam Feed**: Navigating to `/register` or `/verify` will trigger a browser popup requesting camera permissions. Once allowed, your camera feed will appear on screen with an active face detection alignment box.
