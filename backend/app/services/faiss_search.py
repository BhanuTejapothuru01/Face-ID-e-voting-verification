import faiss
import numpy as np
from app.db.db_router import get_all_embeddings_for_index
from app.core.config import TOP_K_SEARCH

# Global in-memory FAISS IndexFlatIP (Inner Product = Cosine Similarity for L2-normalized 512D vectors)
EMBEDDING_DIM = 512
_index = faiss.IndexFlatIP(EMBEDDING_DIM)
_uuid_map = [] # Maps FAISS index position integer -> voter UUID string

def init_faiss_index():
    """Initializes the FAISS index by loading all template embeddings from database router."""
    global _index, _uuid_map
    _index = faiss.IndexFlatIP(EMBEDDING_DIM)
    _uuid_map = []
    
    records = get_all_embeddings_for_index()
    if not records:
        print("[FAISS] Index initialization: No voter embeddings found in database. Initialized empty index.")
        return
        
    embeddings_list = []
    invalid_count = 0
    unique_voters = set()

    for record in records:
        emb = record.get('face_embedding')
        v_uuid = record.get('id')
        if emb and len(emb) == EMBEDDING_DIM and v_uuid:
            embeddings_list.append(emb)
            _uuid_map.append(v_uuid)
            unique_voters.add(v_uuid)
        else:
            invalid_count += 1
            
    if embeddings_list:
        emb_matrix = np.array(embeddings_list, dtype=np.float32)
        faiss.normalize_L2(emb_matrix)
        _index.add(emb_matrix)
        print(f"[FAISS] Loaded {len(unique_voters)} unique voters | {len(embeddings_list)} face templates into index (Invalid: {invalid_count}).")
    else:
        print(f"[FAISS] No valid 512D embeddings found in database. Initialized empty index (Invalid: {invalid_count}).")

def add_to_index(uuid: str, embedding: np.ndarray):
    """Adds a single new template embedding to the live FAISS index."""
    global _index, _uuid_map
    emb_matrix = np.array([embedding], dtype=np.float32)
    faiss.normalize_L2(emb_matrix)
    _index.add(emb_matrix)
    _uuid_map.append(uuid)

def add_multiple_to_index(uuid: str, embeddings: list[np.ndarray]):
    """Adds multiple template embeddings for a voter to the live FAISS index."""
    global _index, _uuid_map
    if not embeddings:
        return
    emb_matrix = np.array(embeddings, dtype=np.float32)
    faiss.normalize_L2(emb_matrix)
    _index.add(emb_matrix)
    for _ in embeddings:
        _uuid_map.append(uuid)

def remove_from_index(uuid: str):
    """Rebuilds index omitting deleted voter UUID."""
    init_faiss_index()

def search_index_top_k(embedding: np.ndarray, top_k: int = None) -> list[tuple[str, float]]:
    """
    Queries FAISS for the Top-K nearest template matches.
    Returns list of (voter_uuid, similarity_score).
    """
    if _index.ntotal == 0:
        return []

    k = top_k if top_k is not None else TOP_K_SEARCH
    k = min(k, _index.ntotal)

    emb_matrix = np.array([embedding], dtype=np.float32)
    faiss.normalize_L2(emb_matrix)

    similarities, indices = _index.search(emb_matrix, k)

    results = []
    for idx, sim in zip(indices[0], similarities[0]):
        if idx != -1 and idx < len(_uuid_map):
            results.append((_uuid_map[idx], float(sim)))

    return results

def search_index(embedding: np.ndarray, top_k: int = 1) -> tuple[str | None, float]:
    """
    Backward-compatible single-match search interface.
    Returns (best_matched_uuid, best_similarity_score).
    """
    matches = search_index_top_k(embedding, top_k=1)
    if not matches:
        return None, 0.0
    return matches[0][0], matches[0][1]
