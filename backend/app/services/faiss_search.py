import faiss
import numpy as np
from app.db.local_db import get_all_embeddings_for_index

# Global in-memory index
# InsightFace produces 512-dimensional embeddings by default
EMBEDDING_DIM = 512

# We use IndexFlatIP (Inner Product) since embeddings are L2 normalized,
# making inner product equivalent to cosine similarity.
_index = faiss.IndexFlatIP(EMBEDDING_DIM)
_uuid_map = [] # Maps FAISS index IDs (integer) to Supabase UUIDs (string)

def init_faiss_index():
    """Initializes the FAISS index by loading all embeddings from Supabase."""
    global _index, _uuid_map
    _index = faiss.IndexFlatIP(EMBEDDING_DIM)
    _uuid_map = []
    
    records = get_all_embeddings_for_index()
    if not records:
        print("FAISS initialization: No voters found in database. Initialized clean empty index.")
        return
        
    embeddings_list = []
    for record in records:
        emb = record.get('face_embedding')
        if emb and len(emb) == EMBEDDING_DIM:
            embeddings_list.append(emb)
            _uuid_map.append(record['id'])
            
    if embeddings_list:
        emb_matrix = np.array(embeddings_list, dtype=np.float32)
        # Ensure they are normalized (they should be, but just to be safe)
        faiss.normalize_L2(emb_matrix)
        _index.add(emb_matrix)
        print(f"FAISS initialization: Loaded {len(embeddings_list)} voter embeddings into live index.")
    else:
        print("FAISS initialization: No valid 512D embeddings in database. Initialized clean empty index.")

def add_to_index(uuid: str, embedding: np.ndarray):
    """Adds a single new embedding to the live FAISS index."""
    global _index, _uuid_map
    emb_matrix = np.array([embedding], dtype=np.float32)
    faiss.normalize_L2(emb_matrix)
    _index.add(emb_matrix)
    _uuid_map.append(uuid)

def remove_from_index(uuid: str):
    """
    Removes a UUID from the FAISS index.
    Note: IndexFlatIP doesn't support direct deletion by ID easily without IndexIDMap,
    so we rebuild the index from memory omitting the deleted one.
    """
    global _index, _uuid_map
    try:
        idx = _uuid_map.index(uuid)
    except ValueError:
        return # UUID not in index
        
    # FAISS does not easily support deletion from a Flat index.
    # The standard way is to recreate the index.
    # Since this is an academic prototype and N is small, we can reconstruct it from Supabase.
    init_faiss_index()

def search_index(embedding: np.ndarray, top_k: int = 1) -> tuple[str | None, float]:
    """
    Searches the FAISS index for the closest match.
    Returns (matched_uuid, similarity_score).
    If index is empty, returns (None, 0.0).
    """
    if _index.ntotal == 0:
        return None, 0.0
        
    emb_matrix = np.array([embedding], dtype=np.float32)
    faiss.normalize_L2(emb_matrix)
    
    similarities, indices = _index.search(emb_matrix, top_k)
    
    best_idx = indices[0][0]
    best_sim = similarities[0][0]
    
    if best_idx == -1 or best_idx >= len(_uuid_map):
        return None, float(best_sim)
        
    return _uuid_map[best_idx], float(best_sim)
