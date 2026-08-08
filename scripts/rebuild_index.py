import sys
import os

# Add the parent directory to sys.path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.services.faiss_search import init_faiss_index, _index, _uuid_map

def rebuild():
    print("Rebuilding FAISS index from Supabase...")
    init_faiss_index()
    print(f"Rebuild complete. Index size: {_index.ntotal}")

if __name__ == "__main__":
    rebuild()
