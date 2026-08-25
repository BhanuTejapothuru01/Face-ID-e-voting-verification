import sys
import os

# Add backend directory to sys.path so 'app' module can be imported properly
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.faiss_search import init_faiss_index, _index, _uuid_map

def rebuild():
    print("Rebuilding FAISS index from local database...")
    init_faiss_index()
    print(f"Rebuild complete. Index size: {_index.ntotal}")

if __name__ == "__main__":
    rebuild()

