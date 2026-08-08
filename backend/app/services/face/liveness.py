import numpy as np
import cv2

def check_liveness(frames: list[np.ndarray]) -> tuple[bool, str]:
    """
    Heuristic liveness signal from live video burst.
    Since we only have access to 2D frames, a simple heuristic is texture/frequency 
    variance or micro head-movement across the frames.
    
    We will implement a basic optical flow / movement variance check:
    A static photo held up to the camera will have near-zero variance across frames,
    while a live human will have slight micro-movements.
    
    LIMITATIONS:
    - This can be spoofed by a video playing on a screen.
    - True liveness in production requires 3D depth sensors or active challenge-response.
    """
    if len(frames) < 2:
        return False, "Not enough frames for liveness detection."

    # Convert frames to grayscale
    gray_frames = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
    
    movement_scores = []
    
    # Calculate absolute difference between consecutive frames
    for i in range(1, len(gray_frames)):
        diff = cv2.absdiff(gray_frames[i], gray_frames[i-1])
        # Calculate mean pixel difference
        movement = np.mean(diff)
        movement_scores.append(movement)
        
    avg_movement = np.mean(movement_scores)
    
    # A static photo will typically have very low average movement (e.g., < 0.5 due to sensor noise)
    # A live person usually has an average movement > 1.5
    # These thresholds are heuristics and should be tuned.
    MIN_MOVEMENT_THRESHOLD = 0.8
    MAX_MOVEMENT_THRESHOLD = 30.0 # Too much movement might mean they are waving the camera/phone
    
    if avg_movement < MIN_MOVEMENT_THRESHOLD:
        return False, "Liveness check failed: No micro-movement detected (possible static photo spoof)."
    elif avg_movement > MAX_MOVEMENT_THRESHOLD:
        return False, "Liveness check failed: Too much movement, please hold still."
        
    return True, ""
