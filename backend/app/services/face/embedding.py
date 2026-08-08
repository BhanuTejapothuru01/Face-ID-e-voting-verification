import numpy as np
from app.services.face.detector import get_face_app

def generate_embedding_from_face(face) -> np.ndarray:
    """
    Extracts the normalized 512D embedding from an InsightFace face object.
    InsightFace FaceAnalysis already returns normalized embeddings if configured correctly,
    but we explicitly normalize it using L2 norm to be safe for Cosine Similarity.
    """
    embedding = face.embedding
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding

def fuse_embeddings(embeddings: list[np.ndarray]) -> np.ndarray:
    """
    Fuses multiple face embeddings (e.g., from a burst of frames) into a single 
    robust registration template by taking the mean and re-normalizing.
    """
    if not embeddings:
        raise ValueError("Cannot fuse empty list of embeddings.")
    
    # Calculate the mean across all embeddings
    mean_embedding = np.mean(embeddings, axis=0)
    
    # Re-normalize the fused embedding
    norm = np.linalg.norm(mean_embedding)
    if norm > 0:
        mean_embedding = mean_embedding / norm
        
    return mean_embedding
