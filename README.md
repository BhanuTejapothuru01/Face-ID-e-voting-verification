# 🗳️ FaceVote Engine v2.0 — Face-ID E-Voting Verification

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![InsightFace](https://img.shields.io/badge/Biometrics-InsightFace%20(512D)-FF6F00.svg?style=for-the-badge)](https://github.com/deepinsight/insightface)
[![FAISS](https://img.shields.io/badge/Vector%20DB-FAISS-0467DF.svg?style=for-the-badge)](https://github.com/facebookresearch/faiss)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

**FaceVote** is a biometric voter eligibility verification and electronic voting terminal. It captures live webcam video streams, performs real-time anti-spoofing micro-movement liveness detection, extracts 512-dimensional facial embeddings using **InsightFace (`buffalo_l`)**, and queries an in-memory **FAISS vector index** to enforce strict **one-person, one-vote** session security.

---

## 📌 Table of Contents

- [🌟 Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 System Requirements & Prerequisites](#-system-requirements--prerequisites)
- [🚀 Step-by-Step Installation & Setup Guide](#-step-by-step-installation--setup-guide)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Set Up Environment Variables](#step-2-set-up-environment-variables)
  - [Step 3: Backend Setup & Launch (FastAPI)](#step-3-backend-setup--launch-fastapi)
  - [Step 4: Frontend Setup & Launch (React + Vite)](#step-4-frontend-setup--launch-react--vite)
- [⚡ Quick Start (Root NPM Shortcuts)](#-quick-start-root-npm-shortcuts)
- [🔑 Application Access Points & Admin Credentials](#-application-access-points--admin-credentials)
- [🏗️ Project Architecture & Data Flow](#️-project-architecture--data-flow)
- [🧪 Helper Scripts](#-helper-scripts)
- [❓ Troubleshooting & Frequently Asked Questions](#-troubleshooting--frequently-asked-questions)
- [🛡️ License & Acknowledgments](#️-license--acknowledgments)

---

## 🌟 Key Features

- 🎯 **Hands-Free Biometric Face Lock**: Continuous frame-scanning reticle with visual feedback for rapid voter identification.
- 👁️ **Anti-Spoofing Liveness Guard**: Analyzes texture and micro-movement variance to prevent static photo or screen spoofing.
- ⚡ **FAISS 512D Vector Search**: Cosine similarity matching ($> 0.40$ threshold) for duplicate face prevention during registration & voting.
- 🗳️ **Session-Based Election Management**: Admin controls to create, schedule, pause, resume, or close election sessions with kiosk links.
- 📊 **Executive Admin Command Center**: Telemetry metrics, real-time turnout charts, candidate management, and audit logs.
- 🔒 **JWT-Secured Single Ballot**: Time-limited (5-min) vote authorization tokens ensuring voters can cast exactly one ballot per session.

---

## 🛠️ Tech Stack

| Layer | Technology & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, Vite, Tailwind CSS, Lucide Icons, React Router DOM |
| **Backend REST API** | Python 3.11+, FastAPI, Uvicorn, SlowAPI (Rate Limiting), PyJWT |
| **Biometrics & Vision** | InsightFace (`buffalo_l`), OpenCV, ONNX Runtime |
| **Vector Database** | FAISS (`faiss-cpu`) |
| **Relational Database** | SQLite (`backend/app/db/voters.db`) |

---

## 📋 System Requirements & Prerequisites

Before running the application, make sure your system has:

1. **Git** (v2.x or higher)
2. **Python 3.10 or 3.11** *(Python 3.11 is strongly recommended for prebuilt wheel compatibility with OpenCV, InsightFace, and FAISS)*
3. **Node.js 18+ or 20 LTS** & `npm`
4. **Hardware**: Working webcam connected and browser permissions granted.

---

## 🚀 Step-by-Step Installation & Setup Guide

Follow these steps sequentially to get the backend API and frontend application up and running.

---

### Step 1: Clone the Repository

Open your terminal or command line and run:

```bash
git clone https://github.com/BhanuTejapothuru01/Face-ID-e-voting-verification.git
cd Face-ID-e-voting-verification
```

*(Note: If your local project directory is named `FaceVote`, `cd FaceVote`)*

---

### Step 2: Set Up Environment Variables

Create the `.env` file from the provided `.env.example` template:

#### macOS / Linux:
```bash
cp .env.example .env
cp .env backend/.env
```

#### Windows (PowerShell):
```powershell
Copy-Item .env.example .env
Copy-Item .env.example backend\.env
```

#### Default `.env` Settings:
```env
ADMIN_SECRET=602142
SIMILARITY_THRESHOLD=0.4
```

---

### Step 3: Backend Setup & Launch (FastAPI)

Open a terminal window in the project root directory and follow these steps to start the Python FastAPI backend:

#### 1. Navigate to the backend directory:
```bash
cd backend
```

#### 2. Create a Python Virtual Environment:
```bash
# macOS / Linux / Windows
python3 -m venv venv
```
*(On Windows, if `python3` isn't recognized, use `python -m venv venv`)*

#### 3. Activate the Virtual Environment:
* **macOS / Linux (Bash/Zsh):**
  ```bash
  source venv/bin/activate
  ```
* **Windows (PowerShell):**
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```
* **Windows (Command Prompt / CMD):**
  ```cmd
  .\venv\Scripts\activate.bat
  ```

#### 4. Upgrade `pip` and Install Dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 5. Start the FastAPI Server:
* **macOS / Linux:**
  ```bash
  PYTHONPATH=. uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
* **Windows (PowerShell):**
  ```powershell
  $env:PYTHONPATH="."
  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
* **Windows (CMD):**
  ```cmd
  set PYTHONPATH=.
  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```

> ℹ️ **First-Time Launch Note**: On the very first launch, InsightFace automatically downloads the `buffalo_l` deep learning model weights (~200 MB). Please allow a couple of minutes for the initial download to finish. Subsequent launches load instantly from the local cache.

The backend API will be live at: **`http://localhost:8000`**

---

### Step 4: Frontend Setup & Launch (React + Vite)

Open a **new, separate terminal window** in the project root directory:

#### 1. Navigate to the `frontend` directory:
```bash
cd frontend
```

#### 2. Install Node Dependencies:
```bash
npm install
```

#### 3. Start the Vite Development Server:
```bash
npm run dev
```

The frontend application will run at: **`http://localhost:5173`**

---

## ⚡ Quick Start (Root NPM Shortcuts)

If you have already created the Python virtual environment and installed dependencies in `backend/` and `frontend/`, you can use the root-level helper scripts:

From the root directory:
```bash
# Install frontend dependencies
npm run install-all

# Start the Backend Server (Terminal 1)
npm run start:backend

# Start the Frontend Server (Terminal 2)
npm run dev
```

---

## 🔑 Application Access Points & Admin Credentials

Once both backend and frontend servers are running, access the following routes in your browser:

| Interface | URL | Description |
| :--- | :--- | :--- |
| 🏠 **Main Portal** | [http://localhost:5173/](http://localhost:5173/) | Kiosk homepage & voter navigation |
| 📝 **Voter Registration** | [http://localhost:5173/register](http://localhost:5173/register) | Biometric registration with webcam |
| 🗳️ **Voter Verification & Voting** | [http://localhost:5173/vote](http://localhost:5173/vote) | Face-ID scanner & digital ballot |
| ⚙️ **Admin Dashboard** | [http://localhost:5173/admin](http://localhost:5173/admin) | Analytics, logs & control center *(Passcode: `602142`)* |
| 📋 **Session Manager** | [http://localhost:5173/admin/sessions](http://localhost:5173/admin/sessions) | Create, pause, and close elections |
| 📑 **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for FastAPI endpoints |

---

## 🏗️ Project Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   React 19 + Vite + Tailwind CSS (http://localhost:5173)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API Calls / Vite Proxy
┌──────────────────────────────▼──────────────────────────────┐
│                       Backend Layer                         │
│             FastAPI Server (http://localhost:8000)          │
└───────┬──────────────────────┬──────────────────────┬───────┘
        │                      │                      │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│ OpenCV &       │    │ FAISS Vector    │    │ SQLite          │
│ InsightFace    │    │ Index (512D)    │    │ Database        │
│ (buffalo_l)    │    │ (In-Memory IP)  │    │ (voters.db)     │
└────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **Webcam Capture**: Frontend streams video feed and captures image frames.
2. **Liveness Verification**: OpenCV checks frame-to-frame variance to block static photos.
3. **Feature Extraction**: InsightFace generates a normalized 512D face vector.
4. **Vector Search**: FAISS checks in-memory inner product index against existing faces ($> 0.40$ threshold).
5. **Authorization**: Verified voters receive a signed 5-minute JWT session token.
6. **Vote Recording**: Ballot is persisted under database constraints preventing multi-voting.

---

## 🧪 Helper Scripts

### Rebuild FAISS Vector Index
If the SQLite database is edited manually or out-of-band, rebuild the in-memory vector index:
```bash
cd backend
source venv/bin/activate   # On Windows: .\venv\Scripts\Activate.ps1
python ../scripts/rebuild_index.py
```

---

## ❓ Troubleshooting & Frequently Asked Questions

<details>
<summary><b>1. Camera feed is blank or shows access error</b></summary>
<br />

* Ensure no other application (Zoom, Teams, Photo Booth) is actively using your camera.
* Allow camera permissions in your browser prompt when accessing `http://localhost:5173`.
* If using HTTPS or remote IP, browsers enforce secure context requirements for WebRTC/MediaDevices. Use `http://localhost:5173`.
</details>

<details>
<summary><b>2. InsightFace downloading error or slow response on first boot</b></summary>
<br />

* InsightFace automatically downloads `buffalo_l.zip` (~200MB) from GitHub releases on initial start.
* If your connection drops, delete the incomplete cache folder inside `~/.insightface/models/` and restart the backend server.
</details>

<details>
<summary><b>3. ModuleNotFoundError: No module named 'app'</b></summary>
<br />

* Ensure you are inside the `backend` directory when running `uvicorn`.
* Make sure `PYTHONPATH=.` is set when launching uvicorn:
  * macOS/Linux: `PYTHONPATH=. uvicorn app.main:app --port 8000 --reload`
  * Windows PowerShell: `$env:PYTHONPATH="."; uvicorn app.main:app --port 8000 --reload`
</details>

<details>
<summary><b>4. `faiss` installation issues</b></summary>
<br />

* `requirements.txt` specifies `faiss-cpu`. If installation fails on Apple Silicon (M1/M2/M3/M4) or specific Windows builds, ensure Python version is 3.10 or 3.11.
* Alternatively, run: `pip install faiss-cpu --no-cache-dir`.
</details>

---

## 🛡️ License

This project is open-source and intended for academic research, biometric demonstration, and educational purposes.

