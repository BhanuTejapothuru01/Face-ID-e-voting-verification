import sqlite3
import json
import uuid
import os
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voters.db')

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS voters (
            id TEXT PRIMARY KEY,
            voter_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            face_embedding TEXT NOT NULL,
            eligibility_status TEXT NOT NULL DEFAULT 'ELIGIBLE',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    c.execute('CREATE INDEX IF NOT EXISTS idx_voters_voter_id ON voters(voter_id)')
    conn.commit()
    conn.close()

# Initialize table on import
init_db()

def _row_to_dict(row):
    d = dict(row)
    if 'face_embedding' in d:
        try:
            d['face_embedding'] = json.loads(d['face_embedding'])
        except Exception:
            d['face_embedding'] = []
    return d

def insert_voter(voter_id: str, name: str, embedding: list[float], status: str = 'ELIGIBLE'):
    """Insert a new voter into the database."""
    conn = get_connection()
    c = conn.cursor()
    now = datetime.utcnow().isoformat()
    internal_id = str(uuid.uuid4())
    emb_str = json.dumps(embedding)
    
    try:
        c.execute('''
            INSERT INTO voters (id, voter_id, name, face_embedding, eligibility_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (internal_id, voter_id, name, emb_str, status, now, now))
        conn.commit()
        
        # Return a format matching what Supabase used to return
        return [{'id': internal_id, 'voter_id': voter_id, 'name': name, 'eligibility_status': status}]
    except Exception as e:
        print(f"DB Error: {e}")
        return None
    finally:
        conn.close()

def get_voter_by_id(voter_id: str):
    """Retrieve a voter by their FaceVote ID."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM voters WHERE voter_id = ?", (voter_id,))
    row = c.fetchone()
    conn.close()
    return _row_to_dict(row) if row else None

def get_voter_by_uuid(uuid: str):
    """Retrieve a voter by their internal UUID."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM voters WHERE id = ?", (uuid,))
    row = c.fetchone()
    conn.close()
    return _row_to_dict(row) if row else None

def get_all_voters(include_embeddings: bool = False):
    """Get all voters (omitting embeddings by default for admin UI)."""
    conn = get_connection()
    c = conn.cursor()
    
    if include_embeddings:
        c.execute("SELECT * FROM voters")
    else:
        c.execute("SELECT id, voter_id, name, eligibility_status, created_at, updated_at FROM voters")
        
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

def update_eligibility(voter_id: str, status: str):
    """Update the eligibility status of a voter."""
    conn = get_connection()
    c = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    c.execute('''
        UPDATE voters SET eligibility_status = ?, updated_at = ?
        WHERE voter_id = ?
    ''', (status, now, voter_id))
    conn.commit()
    rows_affected = c.rowcount
    conn.close()
    
    return [{'voter_id': voter_id, 'eligibility_status': status}] if rows_affected > 0 else None

def delete_voter(voter_id: str):
    """Delete a voter from the database."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM voters WHERE voter_id = ?", (voter_id,))
    conn.commit()
    rows_affected = c.rowcount
    conn.close()
    
    return [{'voter_id': voter_id}] if rows_affected > 0 else None

def get_all_embeddings_for_index():
    """Retrieve all embeddings and voter UUIDs for building the FAISS index."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, face_embedding FROM voters")
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]
