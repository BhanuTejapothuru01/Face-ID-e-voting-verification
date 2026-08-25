# FaceVote Engine v2.0 &ndash; Face-ID E-Voting Verification

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg)](https://react.dev/)
[![InsightFace](https://img.shields.io/badge/Biometrics-InsightFace%20(512D)-FF6F00.svg)](https://github.com/deepinsight/insightface)
[![FAISS](https://img.shields.io/badge/Vector%20DB-FAISS-0467DF.svg)](https://github.com/facebookresearch/faiss)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://www.sqlite.org/)

FaceVote is a real-time biometric voter eligibility verification and e-voting terminal. It captures live camera feeds, performs anti-spoofing micro-movement liveness detection, extracts 512-dimensional facial embeddings via **InsightFace (`buffalo_l`)**, and matches voters against an in-memory **FAISS vector index** to enforce strict **one person, one vote** session eligibility.

---

## 🌟 Key Features

- **Hands-Free Biometric Face Lock**: Automatic continuous frame scanning reticle for instant voter recognition.
- **Anti-Spoofing Liveness Guard**: Texture and movement variance verification to prevent static photo spoofing.
- **FAISS 512D Vector Search**: Ultra-fast cosine similarity matching for duplicate face prevention during registration & voting.
- **Session-Based Election Management**: Create, schedule, pause, resume, or close election sessions with shareable kiosk links.
- **Executive Admin Command Center**: Live participation telemetry, real-time turnout charts, candidate management, and audit logs.
- **Secure Candidate Ballot**: Time-limited JWT vote authorization tokens ensuring voters can only submit one ballot per active session.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons, React Router DOM |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, SlowAPI (Rate Limiter), PyJWT |
| **Biometrics** | InsightFace (`buffalo_l`), OpenCV, ONNXRuntime |
| **Vector DB** | FAISS (`faiss-cpu`) |
| **Relational DB** | SQLite (`app/db/voters.db`) |

---

## 📋 Prerequisites

Ensure you have the following installed on your system:

1. **Git**: Version 2.x+
2. **Python**: **3.11** (strongly recommended for prebuilt wheel compatibility)
3. **Node.js**: **20 LTS** (or 18+) & `npm`
4. **Hardware**: Functional webcam

---

## 🚀 Quick Start Guide

### 1. Clone Repository

```bash
git clone https://github.com/BhanuTejapothuru01/Face-ID-e-voting-verification.git
cd Face-ID-e-voting-verification
```

### 2. Environment Setup

Create `.env` file from `.env.example`:

**macOS / Linux:**
```bash
cp .env.example .env
```

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Default contents of `backend/.env`:
```env
ADMIN_SECRET=602142
SIMILARITY_THRESHOLD=0.4
```

---

### 3. Backend Installation & Run

Make sure you are in the `backend` directory (`cd FaceVote/backend` or `cd backend` if inside `FaceVote`):

#### macOS / Linux:
```bash
cd FaceVote/backend   # Or 'cd backend' if inside FaceVote directory
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Windows PowerShell:
```powershell
cd FaceVote\backend   # Or 'cd backend' if inside FaceVote directory
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
$env:PYTHONPATH="."
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> **Note on First Run**: On initial startup, InsightFace automatically downloads the `buffalo_l` model weights (~200MB). Subsequent runs load directly from local cache.

---

### 4. Frontend Installation & Run

Open a **new terminal window** in the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend client will open at **[http://localhost:5173](http://localhost:5173)**.

---

### 5. Convenient One-Command Runners

From the project root directory:
- **Start Backend Server**: `npm run start:backend`
- **Start Frontend Server**: `npm run dev`

---

## 🔑 Access Points & Admin Credentials

- **Main Portal**: [http://localhost:5173/](http://localhost:5173/)
- **Voter Terminal**: [http://localhost:5173/vote](http://localhost:5173/vote)
- **Voter Registration**: [http://localhost:5173/register](http://localhost:5173/register)
- **Admin Dashboard**: [http://localhost:5173/admin](http://localhost:5173/admin)
  - **Admin Secret Passcode**: `602142`
- **Session Management**: [http://localhost:5173/admin/sessions](http://localhost:5173/admin/sessions)

---

## 🏗️ Project Architecture & Workflow

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
│  React 19 + Vite + Tailwind CSS (http://localhost:5173) │
└────────────────────────────┬────────────────────────────┘
                             │ REST API / Vite Proxy
┌────────────────────────────▼────────────────────────────┐
│                      Backend Layer                      │
│            FastAPI Server (http://localhost:8000)       │
└───────┬────────────────────┬────────────────────┬───────┘
        │                    │                    │
┌───────▼──────┐    ┌────────▼───────┐    ┌───────▼──────┐
│  OpenCV +    │    │  FAISS Vector  │    │    SQLite    │
│ InsightFace  │    │  Index (512D)  │    │  Database    │
│ (buffalo_l)  │    │ (In-Memory IP) │    │ (voters.db)  │
└──────────────┘    └────────────────┘    └──────────────┘
```

1. **Camera Frame Capture**: Frontend streams video feed and captures frame bursts.
2. **Quality & Liveness Check**: OpenCV analyzes frame variance to verify micro-movements.
3. **Face Embedding Extraction**: InsightFace outputs normalized 512D facial feature vectors.
4. **Vector Search**: FAISS searches in-memory inner product index using threshold ($> 0.40$).
5. **Authorization Token**: Verified voters receive a 5-minute JWT vote token.
6. **Ballot Casting**: Database records vote under session-specific `UNIQUE(session_id, voter_id)` constraint.

---

## 🧪 Helper Scripts

### Rebuild FAISS Vector Index from Database
If the database records are modified out-of-band:
```bash
cd backend
venv/bin/python ../scripts/rebuild_index.py
```

---

## 🛡️ License

This project is open-source and intended for academic research, biometric demonstration, and educational purposes.
