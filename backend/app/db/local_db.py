import sqlite3
import json
import uuid
import os
from datetime import datetime, timezone

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voters.db')

def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    
    # 1. Voters Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS voters (
            id TEXT PRIMARY KEY,
            voter_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            face_embedding TEXT NOT NULL,
            eligibility_status TEXT NOT NULL DEFAULT 'ELIGIBLE',
            has_voted INTEGER NOT NULL DEFAULT 0,
            voted_at TEXT,
            voted_session_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    c.execute('CREATE INDEX IF NOT EXISTS idx_voters_voter_id ON voters(voter_id)')

    # Add missing columns if upgrading existing database
    existing_cols = [row[1] for row in c.execute("PRAGMA table_info(voters)").fetchall()]
    if 'has_voted' not in existing_cols:
        c.execute('ALTER TABLE voters ADD COLUMN has_voted INTEGER NOT NULL DEFAULT 0')
    if 'voted_at' not in existing_cols:
        c.execute('ALTER TABLE voters ADD COLUMN voted_at TEXT')
    if 'voted_session_id' not in existing_cols:
        c.execute('ALTER TABLE voters ADD COLUMN voted_session_id TEXT')

    # 2. Voting Sessions Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS voting_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'SCHEDULED',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            created_by TEXT DEFAULT 'admin'
        )
    ''')

    # Migration for voting_sessions columns if upgrading
    session_cols = [row[1] for row in c.execute("PRAGMA table_info(voting_sessions)").fetchall()]
    if 'description' not in session_cols:
        c.execute('ALTER TABLE voting_sessions ADD COLUMN description TEXT')
    if 'start_time' not in session_cols:
        c.execute("ALTER TABLE voting_sessions ADD COLUMN start_time TEXT DEFAULT ''")
    if 'end_time' not in session_cols:
        c.execute("ALTER TABLE voting_sessions ADD COLUMN end_time TEXT DEFAULT ''")
    if 'created_by' not in session_cols:
        c.execute("ALTER TABLE voting_sessions ADD COLUMN created_by TEXT DEFAULT 'admin'")
    if 'updated_at' not in session_cols:
        c.execute("ALTER TABLE voting_sessions ADD COLUMN updated_at TEXT DEFAULT ''")

    # 3. Candidates Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            candidate_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            party_or_position TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    c.execute('CREATE INDEX IF NOT EXISTS idx_candidates_session ON candidates(session_id)')

    # 4. Votes Table with UNIQUE(session_id, voter_id) constraint
    c.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            voter_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            cast_at TEXT NOT NULL,
            UNIQUE(session_id, voter_id)
        )
    ''')
    c.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_session_voter ON votes(session_id, voter_id)')

    # Ensure candidate_id column exists
    c.execute("PRAGMA table_info(votes)")
    cols = [row[1] for row in c.fetchall()]
    if 'candidate_id' not in cols:
        c.execute("ALTER TABLE votes ADD COLUMN candidate_id TEXT DEFAULT ''")

    conn.commit()
    conn.close()

    # Seed default active session & candidates if database is empty
    _seed_default_session_and_candidates()

def _seed_default_session_and_candidates():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM voting_sessions")
    count = c.fetchone()[0]
    if count == 0:
        now = datetime.now(timezone.utc)
        start_iso = now.isoformat()
        end_iso = "2099-12-31T23:59:59"
        session_id = f"SESSION-{now.strftime('%Y%m%d')}-001"
        
        c.execute('''
            INSERT INTO voting_sessions (session_id, title, description, start_time, end_time, status, created_at, updated_at, created_by)
            VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, 'admin')
        ''', (session_id, 'Student Council Election 2026', 'Official electronic election for student leadership', start_iso, end_iso, start_iso, start_iso))
        
        # Seed candidates for default session
        candidates_data = [
            (session_id, f"CAND-{str(uuid.uuid4())[:8]}", 'Alex Morgan', 'Presidential Candidate - Alliance Party', start_iso),
            (session_id, f"CAND-{str(uuid.uuid4())[:8]}", 'Sarah Chen', 'Presidential Candidate - Reform Voice', start_iso),
            (session_id, f"CAND-{str(uuid.uuid4())[:8]}", 'Marcus Vance', 'Presidential Candidate - Independent', start_iso)
        ]
        c.executemany('''
            INSERT INTO candidates (session_id, candidate_id, name, party_or_position, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', candidates_data)
        
    conn.commit()
    conn.close()

# Initialize database
init_db()

def _row_to_dict(row):
    if not row:
        return None
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
    now = datetime.now(timezone.utc).isoformat()
    internal_id = str(uuid.uuid4())
    emb_str = json.dumps(embedding)
    
    try:
        c.execute('''
            INSERT INTO voters (id, voter_id, name, face_embedding, eligibility_status, has_voted, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?)
        ''', (internal_id, voter_id, name, emb_str, status, now, now))
        conn.commit()
        return [{'id': internal_id, 'voter_id': voter_id, 'name': name, 'eligibility_status': status, 'has_voted': 0}]
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
    return _row_to_dict(row)

def get_voter_by_uuid(uuid: str):
    """Retrieve a voter by their internal UUID."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM voters WHERE id = ?", (uuid,))
    row = c.fetchone()
    conn.close()
    return _row_to_dict(row)

def get_voter_vote_for_session(session_id: str, voter_id: str):
    """Check if a voter has cast a ballot in a specific session."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM votes WHERE session_id = ? AND voter_id = ?", (session_id, voter_id))
    row = c.fetchone()
    conn.close()
    return _row_to_dict(row) if row else None

def get_all_voters(session_id: str = None, include_embeddings: bool = False):
    """Get all voters with session-scoped voting status."""
    conn = get_connection()
    c = conn.cursor()
    
    target_session = session_id
    if not target_session:
        active = get_active_session()
        if active:
            target_session = active['session_id']

    if target_session:
        query = f'''
            SELECT v.id, v.voter_id, v.name, v.eligibility_status, v.created_at, v.updated_at,
                   CASE WHEN vt.id IS NOT NULL THEN 1 ELSE 0 END as has_voted,
                   vt.cast_at as voted_at, vt.session_id as voted_session_id
                   {", v.face_embedding" if include_embeddings else ""}
            FROM voters v
            LEFT JOIN votes vt ON v.voter_id = vt.voter_id AND vt.session_id = ?
        '''
        c.execute(query, (target_session,))
    else:
        if include_embeddings:
            c.execute("SELECT * FROM voters")
        else:
            c.execute("SELECT id, voter_id, name, eligibility_status, 0 as has_voted, NULL as voted_at, NULL as voted_session_id, created_at, updated_at FROM voters")

    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

def update_eligibility(voter_id: str, status: str):
    """Update the eligibility status of a voter."""
    conn = get_connection()
    c = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    
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

# ==========================================
# VOTING SESSION & TIME-BASED DERIVATION
# ==========================================

def update_session_statuses_by_time():
    """Derived session status logic based on system clock."""
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # 1. Update SCHEDULED -> ACTIVE if start_time <= now <= end_time
    c.execute('''
        UPDATE voting_sessions 
        SET status = 'ACTIVE', updated_at = ?
        WHERE status = 'SCHEDULED' AND start_time <= ? AND end_time >= ?
    ''', (now_iso, now_iso, now_iso))

    # 2. Update ACTIVE -> ENDED if now > end_time
    c.execute('''
        UPDATE voting_sessions 
        SET status = 'ENDED', ended_at = ?, updated_at = ?
        WHERE status = 'ACTIVE' AND end_time < ?
    ''', (now_iso, now_iso, now_iso))

    conn.commit()
    conn.close()

def get_active_session():
    """Get currently active voting session (updating time states first)."""
    update_session_statuses_by_time()
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM voting_sessions WHERE status = 'ACTIVE' ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    return _row_to_dict(row)

def get_all_sessions():
    """Get all voting sessions."""
    update_session_statuses_by_time()
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM voting_sessions ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

def get_session_by_id(session_id: str):
    """Retrieve session by session_id."""
    update_session_statuses_by_time()
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM voting_sessions WHERE session_id = ?", (session_id,))
    row = c.fetchone()
    conn.close()
    return _row_to_dict(row)

def create_full_session(title: str, description: str, start_time: str, end_time: str, candidates_list: list = None):
    """Create a new voting session and assign candidates."""
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    count = c.execute("SELECT COUNT(*) FROM voting_sessions").fetchone()[0] + 1
    session_id = f"SESSION-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count:03d}"
    
    # Determine initial status
    initial_status = 'SCHEDULED'
    if start_time <= now_iso <= end_time:
        initial_status = 'ACTIVE'
    elif now_iso > end_time:
        initial_status = 'ENDED'

    c.execute('''
        INSERT INTO voting_sessions (session_id, title, description, start_time, end_time, status, created_at, updated_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'admin')
    ''', (session_id, title, description, start_time, end_time, initial_status, now_iso, now_iso))

    # Add candidates
    if candidates_list:
        for cand in candidates_list:
            cand_id = f"CAND-{str(uuid.uuid4())[:8]}"
            c.execute('''
                INSERT INTO candidates (session_id, candidate_id, name, party_or_position, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (session_id, cand_id, cand.get('name', 'Candidate'), cand.get('party_or_position', 'Independent'), now_iso))

    conn.commit()
    conn.close()
    return get_session_by_id(session_id)

def set_session_status(session_id: str, status: str):
    """Manually update session status (ACTIVE, PAUSED, ENDED, CANCELLED)."""
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    ended_at = now_iso if status in ['ENDED', 'CANCELLED'] else None
    
    c.execute('''
        UPDATE voting_sessions SET status = ?, ended_at = ?, updated_at = ?
        WHERE session_id = ?
    ''', (status, ended_at, now_iso, session_id))
    
    conn.commit()
    rows = c.rowcount
    conn.close()
    return rows > 0

# ==========================================
# CANDIDATES MANAGEMENT
# ==========================================

def get_candidates_by_session(session_id: str):
    """Retrieve candidates for a specific session."""
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM candidates WHERE session_id = ? ORDER BY id ASC", (session_id,))
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

def add_candidate(session_id: str, name: str, party_or_position: str):
    """Add a candidate to a session."""
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cand_id = f"CAND-{str(uuid.uuid4())[:8]}"
    
    c.execute('''
        INSERT INTO candidates (session_id, candidate_id, name, party_or_position, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (session_id, cand_id, name, party_or_position, now_iso))
    conn.commit()
    conn.close()
    return {'candidate_id': cand_id, 'session_id': session_id, 'name': name, 'party_or_position': party_or_position}

# ==========================================
# BALLOT VOTE CASTING (STRICT UNIQUE CONSTRAINT)
# ==========================================

def submit_voter_ballot(session_id: str, voter_id: str, candidate_id: str):
    """Submit a vote with database-level UNIQUE(session_id, voter_id) constraint."""
    conn = get_connection()
    c = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    try:
        # 1. Insert into votes table with DB unique constraint
        c.execute('''
            INSERT INTO votes (session_id, voter_id, candidate_id, cast_at)
            VALUES (?, ?, ?, ?)
        ''', (session_id, voter_id, candidate_id, now_iso))
        
        # 2. Touch updated_at timestamp on voter record (without modifying global has_voted)
        c.execute('''
            UPDATE voters SET updated_at = ?
            WHERE voter_id = ?
        ''', (now_iso, voter_id))
        
        conn.commit()
        return True, "Vote successfully recorded."
    except sqlite3.IntegrityError:
        conn.rollback()
        return False, "DUPLICATE VOTE REJECTED: You have already cast a ballot in this session."
    except Exception as e:
        conn.rollback()
        return False, f"Vote error: {str(e)}"
    finally:
        conn.close()

def get_session_results(session_id: str):
    """Get aggregated voting results for a session."""
    conn = get_connection()
    c = conn.cursor()
    
    c.execute('''
        SELECT c.candidate_id, c.name, c.party_or_position, COUNT(v.id) as vote_count
        FROM candidates c
        LEFT JOIN votes v ON c.candidate_id = v.candidate_id AND v.session_id = ?
        WHERE c.session_id = ?
        GROUP BY c.candidate_id
        ORDER BY vote_count DESC
    ''', (session_id, session_id))
    
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

def reset_voter_ballot(voter_id: str, session_id: str = None):
    """Reset an individual voter's ballot status for a session."""
    conn = get_connection()
    c = conn.cursor()
    target_session = session_id or (get_active_session() or {}).get('session_id')
    
    if target_session:
        c.execute("DELETE FROM votes WHERE voter_id = ? AND session_id = ?", (voter_id, target_session))
    else:
        c.execute("DELETE FROM votes WHERE voter_id = ?", (voter_id,))
        
    conn.commit()
    rows = c.rowcount
    conn.close()
    return rows > 0

def reset_all_ballots(session_id: str = None):
    """Reset all voters' ballot status for a session."""
    conn = get_connection()
    c = conn.cursor()
    target_session = session_id or (get_active_session() or {}).get('session_id')
    
    if target_session:
        c.execute("DELETE FROM votes WHERE session_id = ?", (target_session,))
    else:
        c.execute("DELETE FROM votes")
        
    conn.commit()
    conn.close()
    return True

def get_all_votes_log():
    """Get all cast votes with session, voter, and candidate details."""
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        SELECT v.id, v.session_id, v.voter_id, v.candidate_id, v.cast_at,
               c.name as candidate_name, c.party_or_position,
               vt.name as voter_name, s.title as session_title
        FROM votes v
        LEFT JOIN candidates c ON v.candidate_id = c.candidate_id
        LEFT JOIN voters vt ON v.voter_id = vt.voter_id
        LEFT JOIN voting_sessions s ON v.session_id = s.session_id
        ORDER BY v.id DESC
    ''')
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

def get_all_candidates_global():
    """Get all candidates across all sessions with vote tallies."""
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        SELECT c.id, c.candidate_id, c.session_id, c.name, c.party_or_position, c.created_at,
               s.title as session_title, COUNT(v.id) as total_votes
        FROM candidates c
        LEFT JOIN voting_sessions s ON c.session_id = s.session_id
        LEFT JOIN votes v ON c.candidate_id = v.candidate_id
        GROUP BY c.candidate_id
        ORDER BY total_votes DESC
    ''')
    rows = c.fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]

