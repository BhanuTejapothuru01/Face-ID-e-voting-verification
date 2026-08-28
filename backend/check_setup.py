import sys
import os
from pathlib import Path

# Fix sys.path so backend/app modules can be imported directly
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

def print_status(component: str, ok: bool, detail: str = ""):
    symbol = "[OK]" if ok else "[ERROR]"
    msg = f"{symbol} {component}"
    if detail:
        msg += f" - {detail}"
    print(msg)

def check_python_version() -> bool:
    v = sys.version_info
    version_str = f"{v.major}.{v.minor}.{v.micro}"
    if v.major == 3 and v.minor == 11:
        print_status("Python Version", True, f"Python {version_str} detected (Official Python 3.11 supported)")
        return True
    else:
        print_status("Python Version", False, f"Python {version_str} detected. Python 3.11 is strongly recommended for binary package compatibility.")
        return True  # Non-fatal warning to allow running, but clearly flagged

def check_dependencies() -> bool:
    packages = [
        ("FastAPI", "fastapi"),
        ("Uvicorn", "uvicorn"),
        ("OpenCV", "cv2"),
        ("ONNX Runtime", "onnxruntime"),
        ("FAISS", "faiss"),
        ("InsightFace", "insightface"),
        ("PyJWT", "jwt"),
        ("Passlib", "passlib"),
        ("Pydantic", "pydantic"),
        ("Dotenv", "dotenv"),
        ("SlowAPI", "slowapi"),
    ]
    all_ok = True
    for name, module in packages:
        try:
            __import__(module)
            print_status(name, True, "installed")
        except ImportError as e:
            print_status(name, False, f"MISSING ({e})")
            all_ok = False
    return all_ok

def check_environment() -> bool:
    env_file = backend_dir / ".env"
    root_env = backend_dir.parent / ".env"
    
    if env_file.exists():
        print_status("Environment File", True, f"Found {env_file}")
    elif root_env.exists():
        print_status("Environment File", True, f"Found {root_env}")
    else:
        print_status("Environment File", False, ".env missing (Will be created automatically from .env.example)")
    return True

def check_directories() -> bool:
    db_dir = backend_dir / "app" / "db"
    db_dir.mkdir(parents=True, exist_ok=True)
    print_status("Database Directory", True, f"Directory ready at {db_dir}")
    return True

def check_backend_import() -> bool:
    try:
        from app.main import app
        print_status("Backend FastAPI App", True, "Successfully imported app.main:app")
        return True
    except Exception as e:
        print_status("Backend FastAPI App", False, f"Failed to import app.main:app ({e})")
        return False

def check_insightface_model() -> bool:
    try:
        from app.services.face.detector import get_face_app
        print("Checking InsightFace 'buffalo_l' model files...")
        app = get_face_app()
        if app:
            print_status("InsightFace Model", True, "'buffalo_l' model initialized and ready")
            return True
        else:
            print_status("InsightFace Model", False, "Failed to load model instance")
            return False
    except Exception as e:
        print_status("InsightFace Model", False, f"Model initialization error: {e}")
        return False

def main():
    print("=" * 60)
    print("      FACEVOTE BACKEND SETUP VALIDATION CHECK")
    print("=" * 60)
    
    ok_py = check_python_version()
    ok_deps = check_dependencies()
    ok_env = check_environment()
    ok_dirs = check_directories()
    ok_import = check_backend_import()
    ok_model = check_insightface_model()
    
    print("-" * 60)
    if ok_deps and ok_import and ok_model:
        print("[SUCCESS] All core backend checks passed! Ready to launch.")
        sys.exit(0)
    else:
        print("[WARNING] Some checks failed. Please check log messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
