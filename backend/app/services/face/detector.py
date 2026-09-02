import cv2
import insightface
from insightface.app import FaceAnalysis
from insightface.utils import face_align
import numpy as np
from app.core.config import (
    FACE_MIN_SIZE,
    FACE_MIN_DETECTION_SCORE,
    BLUR_THRESHOLD,
    BRIGHTNESS_MIN,
    BRIGHTNESS_MAX,
    MAX_POSE_ANGLE
)

# Singleton instance for the InsightFace app
_app = None

def get_face_app():
    global _app
    if _app is None:
        import os
        model_root = os.getenv("INSIGHTFACE_ROOT")
        if not model_root:
            model_root = "/tmp/.insightface" if os.getenv("VERCEL") else os.path.expanduser("~/.insightface")

        print(f"[INFO] Initializing InsightFace 'buffalo_l' model (root: {model_root})...")
        try:
            _app = FaceAnalysis(
                name='buffalo_l', 
                root=model_root,
                allowed_modules=['detection', 'recognition'], 
                providers=['CPUExecutionProvider']
            )
            det_dim = int(os.getenv("FACE_DET_SIZE", "320" if (os.getenv("RENDER") or os.getenv("VERCEL")) else "640"))
            _app.prepare(ctx_id=0, det_size=(det_dim, det_dim))
            print(f"[INFO] InsightFace 'buffalo_l' model loaded successfully (det_size: {det_dim}x{det_dim}).")
        except Exception as e:
            print(f"[ERROR] Failed to initialize InsightFace model: {e}")
            raise RuntimeError(f"InsightFace model initialization failed: {e}. Check directory permissions or network connection for initial download.")
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
        return False, "Face not detected. Look directly into the camera.", None
    elif len(faces) > 1:
        return False, "Multiple faces detected. Only one person may use the verification terminal.", None
    
    return True, "", faces[0]

def estimate_pose_angle(kps: np.ndarray) -> float:
    """
    Estimates approximate yaw/pitch pose angle in degrees from 5 2D facial keypoints.
    kps: [left_eye, right_eye, nose, left_mouth, right_mouth]
    """
    if kps is None or len(kps) < 5:
        return 0.0
    left_eye, right_eye, nose = kps[0], kps[1], kps[2]
    eye_center = (left_eye + right_eye) / 2.0
    dx = eye_center[0] - nose[0]
    dy = eye_center[1] - nose[1]
    dist_eyes = np.linalg.norm(right_eye - left_eye)
    if dist_eyes == 0:
        return 0.0
    ratio = abs(dx) / (dist_eyes / 2.0)
    yaw_angle = np.degrees(np.arctan(ratio))
    return float(yaw_angle)

def align_face_crop(frame: np.ndarray, face) -> np.ndarray:
    """
    Aligns and crops the face using InsightFace's 5 keypoints via similarity transformation (norm_crop).
    Returns a 112x112 aligned BGR face crop.
    """
    if hasattr(face, 'kps') and face.kps is not None and len(face.kps) == 5:
        try:
            aligned_img = face_align.norm_crop(frame, landmark=face.kps, image_size=112)
            return aligned_img
        except Exception:
            pass
            
    # Fallback to bounding box crop if alignment fails
    bbox = [int(v) for v in face.bbox]
    h, w, _ = frame.shape
    x1, y1 = max(0, bbox[0]), max(0, bbox[1])
    x2, y2 = min(w, bbox[2]), min(h, bbox[3])
    crop = frame[y1:y2, x1:x2]
    if crop.size == 0:
        return frame
    return cv2.resize(crop, (112, 112))

def check_face_quality_advanced(face, frame: np.ndarray) -> tuple[bool, str, float]:
    """
    Comprehensive multi-factor face quality check.
    Returns (is_valid, failure_reason, quality_score_0_to_1).
    """
    bbox = face.bbox
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    
    # 1. Size check
    if width < FACE_MIN_SIZE or height < FACE_MIN_SIZE:
        return False, f"Face too small ({int(width)}x{int(height)}px). Please move closer to the camera.", 0.0

    # 2. Detection confidence score check
    det_score = float(getattr(face, 'det_score', 1.0))
    if det_score < FACE_MIN_DETECTION_SCORE:
        return False, "Face detection confidence too low. Ensure face is clearly visible.", 0.0

    # Crop face bounding box for image-level metrics
    h, w, _ = frame.shape
    x1, y1 = max(0, int(bbox[0])), max(0, int(bbox[1]))
    x2, y2 = min(w, int(bbox[2])), min(h, int(bbox[3]))
    face_crop = frame[y1:y2, x1:x2]

    if face_crop.size == 0:
        return False, "Invalid face bounding box region.", 0.0

    # 3. Blur / Sharpness check (Laplacian Variance)
    gray_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
    blur_var = float(cv2.Laplacian(gray_crop, cv2.CV_64F).var())
    if blur_var < BLUR_THRESHOLD:
        return False, f"Image too blurry ({blur_var:.1f} < {BLUR_THRESHOLD:.1f}). Please hold steady.", 0.0

    # 4. Brightness check (Mean Gray Level)
    mean_brightness = float(np.mean(gray_crop))
    if mean_brightness < BRIGHTNESS_MIN:
        return False, "Lighting too dark. Please move to a better lit area.", 0.0
    if mean_brightness > BRIGHTNESS_MAX:
        return False, "Lighting too harsh / washed out. Avoid bright backlight.", 0.0

    # 5. Pose Angle check
    kps = getattr(face, 'kps', None)
    pose_angle = estimate_pose_angle(kps)
    if pose_angle > MAX_POSE_ANGLE:
        return False, f"Extreme head pose angle ({pose_angle:.1f}°). Please look directly at the camera.", 0.0

    # Compute composite quality score (0.0 to 1.0)
    size_norm = min(1.0, (width * height) / (250.0 * 250.0))
    blur_norm = min(1.0, blur_var / 200.0)
    det_norm = min(1.0, det_score)
    quality_score = float(0.4 * size_norm + 0.4 * blur_norm + 0.2 * det_norm)

    return True, "", quality_score

def check_face_quality(face, min_size: int = None) -> tuple[bool, str]:
    """
    Backward-compatible wrapper for existing single-argument quality checks.
    """
    min_sz = min_size or FACE_MIN_SIZE
    bbox = face.bbox
    width = bbox[2] - bbox[0]
    height = bbox[3] - bbox[1]
    
    if width < min_sz or height < min_sz:
        return False, f"Face too small. Please move closer to the camera."
        
    return True, ""
