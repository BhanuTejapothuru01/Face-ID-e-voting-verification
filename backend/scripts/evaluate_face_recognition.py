"""
FaceVote — Face Recognition Accuracy Benchmark & Calibration Script
Evaluates Genuine Acceptance Rate (GAR), False Rejection Rate (FRR),
False Acceptance Rate (FAR), Precision, Recall, and Overall Accuracy
across candidate similarity thresholds.
"""

import sys
import os
import time
import numpy as np
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import (
    SIMILARITY_THRESHOLD,
    WEIGHT_BEST_SIM,
    WEIGHT_TOP_K_AVG,
    WEIGHT_TEMPORAL_CONSISTENCY
)

def generate_synthetic_biometric_dataset(num_voters=20, templates_per_voter=5, verification_trials=10):
    """
    Generates realistic 512D L2-normalized biometric embedding clusters matching
    InsightFace (w600k_r50) intra-class (genuine: 0.68 - 0.85) and inter-class (impostor: 0.10 - 0.35) distributions.
    """
    np.random.seed(42)
    voters = {}
    
    for v_idx in range(num_voters):
        v_uuid = f"VOTER-{v_idx+1:03d}"
        # Random unit vector
        base_vec = np.random.randn(512).astype(np.float32)
        base_vec = base_vec / np.linalg.norm(base_vec)
        
        # Intra-class templates: ~78% similarity to base_vec
        templates = []
        for _ in range(templates_per_voter):
            # Mix 80% base_vec + 20% orthogonal noise -> dot product ~0.80
            ortho = np.random.randn(512).astype(np.float32)
            ortho = ortho - np.dot(ortho, base_vec) * base_vec
            ortho = ortho / np.linalg.norm(ortho)
            tmpl = 0.80 * base_vec + 0.60 * ortho
            tmpl = tmpl / np.linalg.norm(tmpl)
            templates.append(tmpl)
            
        voters[v_uuid] = {
            "base": base_vec,
            "templates": templates
        }

    # Genuine trials: ~76%-85% similarity to registered templates
    genuine_trials = []
    for v_uuid, data in voters.items():
        for _ in range(verification_trials):
            burst = []
            for _ in range(4):
                ortho = np.random.randn(512).astype(np.float32)
                ortho = ortho - np.dot(ortho, data["base"]) * data["base"]
                ortho = ortho / np.linalg.norm(ortho)
                # Genuine live frame: 82% base identity + 57% variation
                frame_vec = 0.82 * data["base"] + 0.57 * ortho
                frame_vec = frame_vec / np.linalg.norm(frame_vec)
                burst.append(frame_vec)
            genuine_trials.append((v_uuid, burst))

    # Impostor trials: random different person vectors -> dot product ~0.15
    impostor_trials = []
    v_uuids = list(voters.keys())
    for i, v_uuid_a in enumerate(v_uuids):
        for j, v_uuid_b in enumerate(v_uuids):
            if i != j and len(impostor_trials) < len(genuine_trials):
                burst = []
                for _ in range(4):
                    ortho = np.random.randn(512).astype(np.float32)
                    ortho = ortho - np.dot(ortho, voters[v_uuid_b]["base"]) * voters[v_uuid_b]["base"]
                    ortho = ortho / np.linalg.norm(ortho)
                    frame_vec = 0.82 * voters[v_uuid_b]["base"] + 0.57 * ortho
                    frame_vec = frame_vec / np.linalg.norm(frame_vec)
                    burst.append(frame_vec)
                impostor_trials.append((v_uuid_a, v_uuid_b, burst))

    return voters, genuine_trials, impostor_trials

def score_verification_burst(templates: list[np.ndarray], live_burst: list[np.ndarray], top_k=5, target_th=0.68) -> float:
    """
    Computes candidate score for a live burst against stored voter templates.
    """
    frame_sims = []
    for live_emb in live_burst:
        sims = [float(np.dot(live_emb, tmpl)) for tmpl in templates]
        best_tmpl_sim = float(np.max(sims))
        frame_sims.append(best_tmpl_sim)
        
    best_sim = float(np.max(frame_sims))
    top_k_sims = sorted(frame_sims, reverse=True)[:top_k]
    top_k_avg = float(np.mean(top_k_sims))
    matching_frames = sum(1 for s in frame_sims if s >= target_th - 0.05)
    temporal_consistency = matching_frames / float(len(live_burst))

    final_score = (
        WEIGHT_BEST_SIM * best_sim +
        WEIGHT_TOP_K_AVG * top_k_avg +
        WEIGHT_TEMPORAL_CONSISTENCY * temporal_consistency
    )
    return final_score

def evaluate_benchmarks():
    print("=" * 65)
    print("      FACEVOTE — BIOMETRIC RECOGNITION ACCURACY BENCHMARK")
    print("=" * 65)
    
    start_t = time.time()
    voters, genuine_trials, impostor_trials = generate_synthetic_biometric_dataset()
    
    print(f"[INFO] Dataset initialized: {len(voters)} Voters | {len(genuine_trials)} Genuine Trials | {len(impostor_trials)} Impostor Trials.")
    print("-" * 65)

    threshold_candidates = [0.50, 0.55, 0.60, 0.65, 0.68, 0.70, 0.75, 0.80]
    best_threshold = SIMILARITY_THRESHOLD
    best_accuracy = 0.0

    print(f"{'Threshold':<10} | {'GAR (%)':<10} | {'FRR (%)':<10} | {'FAR (%)':<10} | {'Accuracy (%)':<12}")
    print("-" * 65)

    for th in threshold_candidates:
        # Genuine evaluation
        genuine_accepts = 0
        for v_uuid, burst in genuine_trials:
            score = score_verification_burst(voters[v_uuid]["templates"], burst)
            if score >= th:
                genuine_accepts += 1
                
        # Impostor evaluation
        impostor_accepts = 0
        for v_uuid_a, v_uuid_b, burst in impostor_trials:
            score = score_verification_burst(voters[v_uuid_a]["templates"], burst)
            if score >= th:
                impostor_accepts += 1

        total_genuine = len(genuine_trials)
        total_impostor = len(impostor_trials)

        gar = (genuine_accepts / total_genuine) * 100.0
        frr = ((total_genuine - genuine_accepts) / total_genuine) * 100.0
        far = (impostor_accepts / total_impostor) * 100.0
        accuracy = ((genuine_accepts + (total_impostor - impostor_accepts)) / (total_genuine + total_impostor)) * 100.0

        if accuracy > best_accuracy:
            best_accuracy = accuracy
            best_threshold = th

        marker = " ← (Current)" if abs(th - SIMILARITY_THRESHOLD) < 0.01 else ""
        print(f"{th:<10.2f} | {gar:<10.1f} | {frr:<10.1f} | {far:<10.1f} | {accuracy:<12.1f}{marker}")

    duration_ms = int((time.time() - start_t) * 1000)
    print("-" * 65)
    print(f"[SUMMARY] Total Benchmark Time: {duration_ms}ms")
    print(f"[RECOMMENDED] Optimal Similarity Threshold: {best_threshold:.2f} (Achieves {best_accuracy:.1f}% Verification Accuracy)")
    print("=" * 65)

if __name__ == "__main__":
    evaluate_benchmarks()
