import sys
import os
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

def download_models():
    print("=" * 60)
    print("   FACEVOTE -- AI MODEL DOWNLOADER & VERIFIER")
    print("=" * 60)
    print("[INFO] Checking required AI models ('buffalo_l')...")
    print("[INFO] Note: If downloading for the first time (~300MB), please ensure an active internet connection.")
    
    try:
        import insightface
        from insightface.app import FaceAnalysis
        
        app = FaceAnalysis(
            name='buffalo_l', 
            allowed_modules=['detection', 'recognition'], 
            providers=['CPUExecutionProvider']
        )
        app.prepare(ctx_id=0, det_size=(640, 640))
        print("[SUCCESS] All InsightFace AI models ('buffalo_l') are downloaded and ready!")
        return True
    except Exception as e:
        print(f"[ERROR] Model download or initialization failed: {e}", file=sys.stderr)
        print("[WARNING] Please check your internet connection and try running again.", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = download_models()
    if not success:
        sys.exit(1)
