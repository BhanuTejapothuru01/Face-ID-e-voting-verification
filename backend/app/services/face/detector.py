import cv2
import insightface
from insightface.app import FaceAnalysis
import numpy as np

# Singleton instance for the InsightFace app
_app = None

def get_face_app():
    global _app
    if _app is None:
        print("[INFO] Initializing InsightFace 'buffalo_l' model...")
        print("[INFO] Note: If running for the first time, InsightFace will download model files (~300MB).")
        try:
            _app = FaceAnalysis(name='buffalo_l', allowed_modules=['detection', 'recognition'], providers=['CPUExecutionProvider'])
            _app.prepare(ctx_id=0, det_size=(640, 640))
            print("[INFO] InsightFace 'buffalo_l' model loaded successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to initialize InsightFace model: {e}")
            raise RuntimeError(f"InsightFace model initialization failed: {e}. Please check your internet connection for the initial download.")
    return _app

def detect_faces(frame: np.ndarray):
    """
    Detects faces in the given BGR frame.
    Returns a list of face objects (each containing bbox, kps, embedding).
    """
    app = get_face_app()
    faces = app.get(frame)
    return faces

def check_exactly_one_face(faces: list) -> tuple[bool, str, any]:
    """
    Checks if there is exactly one face detected.
    Returns (is_valid, error_message, face_object)
    """
    if len(faces) == 0:
        return False, "Face not detected.", None
    elif len(faces) > 1:
        return False, "Multiple faces detected. Only one person may use the verification terminal.", None
    
    return True, "", faces[0]

def check_face_quality(face, min_size: int = 100) -> tuple[bool, str]:
    """
    Basic face quality check (minimum size).
    Can be expanded to include blur/sharpness checks on the crop.
    """
    bbox = face.bbox
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    
    if width < min_size or height < min_size:
        return False, f"Face too small. Please move closer to the camera."
        
    return True, ""
