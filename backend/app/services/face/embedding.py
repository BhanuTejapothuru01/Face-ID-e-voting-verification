import numpy as np
from app.core.config import OUTLIER_DISTANCE_THRESHOLD

def generate_embedding_from_face(face) -> np.ndarray:
    """
    Extracts the normalized 512D embedding from an InsightFace face object.
    Explicitly normalizes using L2 norm for Cosine Similarity matching.
    """
    embedding = face.embedding.copy()
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding

def filter_outlier_embeddings(
    embeddings: list[np.ndarray], 
    quality_scores: list[float] = None,
    max_distance: float = None
) -> tuple[list[np.ndarray], list[float]]:
    """
    Filters outlier embeddings whose cosine distance to the initial cluster mean exceeds threshold.
    Returns (cleaned_embeddings, cleaned_quality_scores).
    """
    if len(embeddings) <= 2:
        return embeddings, quality_scores or [1.0] * len(embeddings)

    max_dist = max_distance if max_distance is not None else OUTLIER_DISTANCE_THRESHOLD
    scores = quality_scores if quality_scores is not None else [1.0] * len(embeddings)

    # Initial centroid
    raw_mean = np.mean(embeddings, axis=0)
    norm = np.linalg.norm(raw_mean)
    if norm > 0:
        centroid = raw_mean / norm
    else:
        centroid = raw_mean

    valid_embeddings = []
    valid_scores = []

    for emb, sc in zip(embeddings, scores):
        # Cosine distance = 1 - dot_product(emb, centroid)
        cos_sim = float(np.dot(emb, centroid))
        cos_dist = 1.0 - cos_sim

        if cos_dist <= max_dist:
            valid_embeddings.append(emb)
            valid_scores.append(sc)

    # Fallback if all were flagged as outliers
    if not valid_embeddings:
        return embeddings, scores

    return valid_embeddings, valid_scores

def compute_fused_centroid(
    embeddings: list[np.ndarray], 
    quality_scores: list[float] = None
) -> np.ndarray:
    """
    Computes quality-weighted centroid across valid embeddings and re-normalizes L2 norm.
    """
    if not embeddings:
        raise ValueError("Cannot compute centroid from empty embeddings list.")

    if len(embeddings) == 1:
        return embeddings[0]

    if quality_scores and len(quality_scores) == len(embeddings):
        weights = np.array(quality_scores, dtype=np.float32)
        total_w = np.sum(weights)
        if total_w > 0:
            weights = weights / total_w
            weighted_emb = np.average(embeddings, axis=0, weights=weights)
        else:
            weighted_emb = np.mean(embeddings, axis=0)
    else:
        weighted_emb = np.mean(embeddings, axis=0)

    norm = np.linalg.norm(weighted_emb)
    if norm > 0:
        weighted_emb = weighted_emb / norm
    return weighted_emb

def fuse_embeddings(embeddings: list[np.ndarray]) -> np.ndarray:
    """
    Backward-compatible wrapper for existing single fused template generation.
    """
    cleaned_embs, _ = filter_outlier_embeddings(embeddings)
    return compute_fused_centroid(cleaned_embs)
