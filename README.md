# FaceVote: Biometric Verification Terminal

FaceVote is a **minimal face-based voter eligibility verification system**. It is an academic prototype designed to answer a single question: *"Is the person in front of the camera a registered, eligible voter?"*

**IMPORTANT SCOPE:** This is **NOT** an electronic voting system. It does not implement ballots, candidate selection, vote storage, election results, or vote tracking. It only handles biometric eligibility verification via live webcam.

## Architecture

FaceVote uses a modern React frontend and a FastAPI backend with in-memory vector search.

1. **Frontend (React + Vite + Tailwind)**: Handles live camera feed, captures frame bursts for liveness checking, and manages the biometric scanning UI. No raw face photos are permanently stored.
2. **Face Modules (InsightFace + OpenCV)**: Uses `buffalo_l` models for face detection and 512D embeddings. Includes a heuristic optical flow liveness check to deter static photo spoofing.
3. **Vector Search (FAISS)**: Uses an in-memory `IndexFlatIP` (Inner Product) FAISS index for high-speed nearest-neighbor matching across all embeddings.
4. **Database (Local SQLite)**: Persists voter metadata and the base `face_embedding` vectors locally in `voters.db`. The FAISS index is rebuilt from this database on startup.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the project root:
```env
ADMIN_SECRET=your_admin_secret
SIMILARITY_THRESHOLD=0.4
```
*(Note: A threshold around 0.4 - 0.5 is recommended for InsightFace cosine similarity.)*

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```
*Note: We use `faiss-cpu` and `onnxruntime` (CPU Execution Provider) to ensure cross-platform compatibility without requiring CUDA.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Security & Limitations
- **No Raw Images Stored**: The backend never saves or logs the raw `multipart/form-data` image frames. Only mathematical embeddings are retained.
- **Admin Authentication**: Uses simple JWT/session auth gated by a secret hash.
- **Liveness Detection**: Currently implements a basic heuristic (frame-to-frame pixel variance) to prevent simple static photo spoofing. This is an academic prototype; a production system requires 3D depth sensors or active challenge-response (e.g. "turn your head").
- **FAISS Rebuilds**: The FAISS index is kept in memory for performance. It syncs from local SQLite at startup. A manual script (`scripts/rebuild_index.py`) is provided if index drift occurs.
