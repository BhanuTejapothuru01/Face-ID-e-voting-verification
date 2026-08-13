# Face-ID E-Voting Verification

A real-time biometric voter eligibility verification terminal. It captures live camera feed, verifies liveness, extracts facial embeddings using InsightFace, and matches voters against stored embeddings via FAISS vector search to confirm eligibility before voting.

---

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Face Recognition**: InsightFace (`buffalo_l`) + OpenCV
- **Vector Search**: FAISS (`faiss-cpu`)
- **Database**: SQLite (`voters.db`)

---

## Requirements

### Install these first:
1. **Git**: Version 2.x+
2. **Python**: **3.11** (strongly recommended for prebuilt wheel compatibility)
3. **Node.js**: **20 LTS** (or 18+) & npm
4. **Web Browser**: Chrome / Edge / Brave / Firefox
5. **Hardware**: Functional HD webcam

---

## Install Git

- **Windows**: Download and run the installer from [git-scm.com](https://git-scm.com/download/win).
- **macOS**: Installed automatically with Xcode Command Line Tools, or run `brew install git`.
- **Linux**: Run `sudo apt install git` (Ubuntu/Debian) or `sudo dnf install git` (Fedora).

---

## Install Python

1. Download **Python 3.11** from [python.org/downloads](https://www.python.org/downloads/).
2. **IMPORTANT (Windows)**: Check the box **"Add python.exe to PATH"** during installation.
3. Verify in your terminal:
   ```bash
   python --version   # or python3 --version
   ```

---

## Install Node.js

1. Download **Node.js 20 (LTS)** from [nodejs.org](https://nodejs.org/).
2. Verify in your terminal:
   ```bash
   node --version
   npm --version
   ```

---

## Install / Clone the Project

```bash
git clone https://github.com/BhanuTejapothuru01/Face-ID-e-voting-verification.git
cd Face-ID-e-voting-verification
```

---

## Environment File

Create a local `.env` file from `.env.example` in the project root:

- **Windows PowerShell**: `Copy-Item .env.example .env`
- **Windows CMD**: `copy .env.example .env`
- **macOS / Linux**: `cp .env.example .env`

**Contents of `.env`:**
```env
ADMIN_SECRET=your_admin_secret
SIMILARITY_THRESHOLD=0.4
```
*Note: Do not commit `.env` to GitHub.*

---

## Backend Setup

### Windows PowerShell
```powershell
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### macOS / Linux
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
```

*The backend starts at `http://localhost:8000`.*

---

## Frontend Setup

Open a **NEW terminal window** (keep the backend running):

```bash
cd Face-ID-e-voting-verification/frontend
npm install
npm run dev
```

*The frontend starts at `http://localhost:5173`.*

---

## Run the Project

Run both servers simultaneously in separate terminals:

- **Terminal 1 (Backend)**: `uvicorn app.main:app --reload` (inside `backend/`) -> `http://localhost:8000`
- **Terminal 2 (Frontend)**: `npm run dev` (inside `frontend/`) -> `http://localhost:5173`

Open `http://localhost:5173` in your browser to access the website.

---

## Camera Permission

When accessing `/register` or `/verify`, your browser will prompt for camera permission. Click **Allow**. Ensure no other app (Zoom, Teams, Skype) is actively using the webcam.

---

## First Run

On the first backend run, InsightFace will automatically download the `buffalo_l` face model (~200 MB) from GitHub/ONNX. An active internet connection is required for this initial download. Subsequent runs load from local cache.

---

## Project Structure

```
Face-ID-e-voting-verification/
├── backend/
│   ├── app/
│   │   ├── api/          # API route endpoints
│   │   ├── db/           # SQLite database logic (voters.db)
│   │   ├── services/     # Face processing & FAISS search
│   │   └── main.py       # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── src/              # React pages and components
│   └── package.json
├── scripts/              # Helper scripts (rebuild_index.py)
├── .env.example
├── .gitignore
└── README.md
```

---

## Architecture

```
Browser (Webcam)
   ↓
React + Vite (http://localhost:5173)
   ↓
FastAPI Backend (http://localhost:8000)
   ↓
OpenCV + InsightFace (buffalo_l)
   ↓
Face Embedding (512D)
   ↓
FAISS Vector Search (In-Memory)
   ↓
SQLite Database (voters.db)
```

---

## Common Problems

- **Python not found**: Ensure Python 3.11 is installed and added to your system `PATH`.
- **Backend doesn't start**: Ensure `venv` is activated, dependencies are installed, and you are inside the `backend/` folder before running `uvicorn app.main:app --reload`.
- **Frontend doesn't start**: Run `npm install` inside `frontend/` before `npm run dev`.
- **Camera doesn't work**: Check browser site settings and grant camera access to `localhost`.
- **Installation error**: Verify you are using Python 3.11 (Python 3.12+ may fail compiling C++ wheels).

---

## Quick Start

1. Install Git, Python 3.11, and Node.js 20 LTS.
2. Clone repository: `git clone https://github.com/BhanuTejapothuru01/Face-ID-e-voting-verification.git`
3. Navigate to root & create `.env`: `cp .env.example .env`
4. Setup & start backend: `cd backend && python3.11 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload`
5. Open Terminal 2, setup & start frontend: `cd frontend && npm install && npm run dev`
6. Open `http://localhost:5173` in browser and allow camera access.
