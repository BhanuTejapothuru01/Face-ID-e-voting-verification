"""
Supabase Database Integration Layer for FaceVote
Provides cloud PostgreSQL database operations via Supabase REST Client.
"""

import uuid
import secrets
from datetime import datetime, timezone
from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

_supabase_client: Client | None = None

def get_supabase_client() -> Client | None:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
        
    key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    if SUPABASE_URL and key:
        try:
            _supabase_client = create_client(SUPABASE_URL, key)
            return _supabase_client
        except Exception as e:
            print(f"[ERROR] Failed to initialize Supabase client: {e}")
            return None
    return None

def is_supabase_available() -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        # Quick check if voters table exists
        client.table('voters').select('id').limit(1).execute()
        return True
    except Exception:
        return False

def generate_share_token():
    return secrets.token_hex(5)

# ==========================================
# VOTERS OPERATIONS
# ==========================================

def insert_voter(voter_id: str, name: str, embedding: list[float], status: str = 'ELIGIBLE'):
    client = get_supabase_client()
    if not client:
        return None
    now = datetime.now(timezone.utc).isoformat()
    data = {
        'id': str(uuid.uuid4()),
        'voter_id': voter_id,
        'name': name,
        'face_embedding': embedding,
        'eligibility_status': status,
        'has_voted': 0,
        'created_at': now,
        'updated_at': now
    }
    try:
        res = client.table('voters').insert(data).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase DB Error] insert_voter: {e}")
        return None

def get_voter_by_id(voter_id: str):
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table('voters').select('*').eq('voter_id', voter_id).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[Supabase DB Error] get_voter_by_id: {e}")
        return None

def get_voter_by_uuid(uuid_str: str):
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table('voters').select('*').eq('id', uuid_str).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[Supabase DB Error] get_voter_by_uuid: {e}")
        return None

def get_all_voters(session_id: str = None, include_embeddings: bool = False):
    client = get_supabase_client()
    if not client:
        return []
    try:
        select_cols = '*' if include_embeddings else 'id, voter_id, name, eligibility_status, has_voted, created_at, updated_at'
        res = client.table('voters').select(select_cols).execute()
        voters = res.data or []
        
        # If session_id provided, check voting status for that session
        if session_id:
            votes_res = client.table('votes').select('voter_id, cast_at').eq('session_id', session_id).execute()
            voted_map = {v['voter_id']: v['cast_at'] for v in (votes_res.data or [])}
            for voter in voters:
                if voter['voter_id'] in voted_map:
                    voter['has_voted'] = 1
                    voter['voted_at'] = voted_map[voter['voter_id']]
                    voter['voted_session_id'] = session_id
                else:
                    voter['has_voted'] = 0
        return voters
    except Exception as e:
        print(f"[Supabase DB Error] get_all_voters: {e}")
        return []

def update_eligibility(voter_id: str, status: str):
    client = get_supabase_client()
    if not client:
        return None
    now = datetime.now(timezone.utc).isoformat()
    try:
        res = client.table('voters').update({'eligibility_status': status, 'updated_at': now}).eq('voter_id', voter_id).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase DB Error] update_eligibility: {e}")
        return None

def delete_voter(voter_id: str):
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table('voters').delete().eq('voter_id', voter_id).execute()
        return res.data
    except Exception as e:
        print(f"[Supabase DB Error] delete_voter: {e}")
        return None

def insert_voter_embeddings(voter_uuid: str, voter_id: str, templates: list[tuple[list[float], float]]):
    client = get_supabase_client()
    if not client:
        return False
    now = datetime.now(timezone.utc).isoformat()
    rows = []
    for emb, quality in templates:
        rows.append({
            'id': str(uuid.uuid4()),
            'voter_uuid': voter_uuid,
            'voter_id': voter_id,
            'face_embedding': emb,
            'quality_score': float(quality),
            'created_at': now
        })
    try:
        client.table('face_embeddings').insert(rows).execute()
        return True
    except Exception as e:
        print(f"[Supabase DB Error] insert_voter_embeddings: {e}")
        return False

def get_all_embeddings_for_index():
    client = get_supabase_client()
    if not client:
        return []
    records = []
    voter_uuids_with_templates = set()
    
    # 1. Fetch multi-templates from face_embeddings table
    try:
        res_tmpl = client.table('face_embeddings').select('voter_uuid, voter_id, face_embedding, quality_score').execute()
        for r in (res_tmpl.data or []):
            uuid_id = r.get('voter_uuid')
            if uuid_id:
                voter_uuids_with_templates.add(uuid_id)
                records.append({
                    'id': uuid_id,
                    'voter_id': r.get('voter_id'),
                    'face_embedding': r.get('face_embedding'),
                    'quality_score': r.get('quality_score', 1.0)
                })
    except Exception as e:
        print(f"[Supabase DB Notice] face_embeddings query failed ({e})")

    # 2. Fetch legacy single embeddings from voters table for any voter missing multi-templates
    try:
        res_voters = client.table('voters').select('id, voter_id, face_embedding').execute()
        for r in (res_voters.data or []):
            if r['id'] not in voter_uuids_with_templates:
                records.append({
                    'id': r['id'],
                    'voter_id': r.get('voter_id'),
                    'face_embedding': r.get('face_embedding'),
                    'quality_score': 1.0
                })
    except Exception as e:
        print(f"[Supabase DB Error] get_all_embeddings_for_index voters query: {e}")

    return records

# ==========================================
# VOTING SESSION OPERATIONS
# ==========================================

def get_active_session():
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table('voting_sessions').select('*').eq('status', 'ACTIVE').order('id', desc=True).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[Supabase DB Error] get_active_session: {e}")
        return None

def get_all_sessions():
    client = get_supabase_client()
    if not client:
        return []
    try:
        res = client.table('voting_sessions').select('*').order('id', desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase DB Error] get_all_sessions: {e}")
        return []

def get_session_by_id(session_id: str):
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table('voting_sessions').select('*').eq('session_id', session_id).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[Supabase DB Error] get_session_by_id: {e}")
        return None

def get_session_by_share_token(share_token: str):
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table('voting_sessions').select('*').eq('share_token', share_token).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[Supabase DB Error] get_session_by_share_token: {e}")
        return None

def create_full_session(title: str, description: str, start_time: str, end_time: str, candidates_list: list = None):
    client = get_supabase_client()
    if not client:
        return None
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Get session count
    count_res = client.table('voting_sessions').select('id', count='exact').execute()
    count = (count_res.count or 0) + 1
    session_id = f"SESSION-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count:03d}"
    share_token = generate_share_token()
    
    initial_status = 'SCHEDULED'
    if start_time <= now_iso <= end_time:
        initial_status = 'ACTIVE'
    elif now_iso > end_time:
        initial_status = 'ENDED'

    session_data = {
        'session_id': session_id,
        'share_token': share_token,
        'title': title,
        'description': description,
        'start_time': start_time,
        'end_time': end_time,
        'status': initial_status,
        'created_at': now_iso,
        'updated_at': now_iso,
        'created_by': 'admin'
    }

    try:
        res = client.table('voting_sessions').insert(session_data).execute()
        created_session = res.data[0] if res.data else None

        if candidates_list and created_session:
            cand_payloads = []
            for cand in candidates_list:
                cand_payloads.append({
                    'session_id': session_id,
                    'candidate_id': f"CAND-{str(uuid.uuid4())[:8]}",
                    'name': cand.get('name', 'Candidate'),
                    'party_or_position': cand.get('party_or_position', 'Independent'),
                    'created_at': now_iso
                })
            client.table('candidates').insert(cand_payloads).execute()

        return created_session
    except Exception as e:
        print(f"[Supabase DB Error] create_full_session: {e}")
        return None

def set_session_status(session_id: str, status: str):
    client = get_supabase_client()
    if not client:
        return False
    now_iso = datetime.now(timezone.utc).isoformat()
    ended_at = now_iso if status in ['ENDED', 'CANCELLED'] else None
    
    try:
        res = client.table('voting_sessions').update({
            'status': status,
            'ended_at': ended_at,
            'updated_at': now_iso
        }).eq('session_id', session_id).execute()
        return len(res.data) > 0
    except Exception as e:
        print(f"[Supabase DB Error] set_session_status: {e}")
        return False

# ==========================================
# CANDIDATES OPERATIONS
# ==========================================

def get_candidates_by_session(session_id: str):
    client = get_supabase_client()
    if not client:
        return []
    try:
        res = client.table('candidates').select('*').eq('session_id', session_id).order('id', desc=False).execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase DB Error] get_candidates_by_session: {e}")
        return []

def add_candidate(session_id: str, name: str, party_or_position: str):
    client = get_supabase_client()
    if not client:
        return None
    now_iso = datetime.now(timezone.utc).isoformat()
    cand_id = f"CAND-{str(uuid.uuid4())[:8]}"
    data = {
        'session_id': session_id,
        'candidate_id': cand_id,
        'name': name,
        'party_or_position': party_or_position,
        'created_at': now_iso
    }
    try:
        res = client.table('candidates').insert(data).execute()
        return res.data[0] if res.data else data
    except Exception as e:
        print(f"[Supabase DB Error] add_candidate: {e}")
        return None

# ==========================================
# BALLOT SUBMISSION OPERATIONS
# ==========================================

def submit_voter_ballot(session_id: str, voter_id: str, candidate_id: str):
    client = get_supabase_client()
    if not client:
        return False, "Database client unavailable."
    now_iso = datetime.now(timezone.utc).isoformat()
    vote_data = {
        'session_id': session_id,
        'voter_id': voter_id,
        'candidate_id': candidate_id,
        'cast_at': now_iso
    }
    try:
        res = client.table('votes').insert(vote_data).execute()
        client.table('voters').update({'updated_at': now_iso}).eq('voter_id', voter_id).execute()
        return True, "Vote successfully recorded."
    except Exception as e:
        err_msg = str(e)
        if 'unique' in err_msg.lower() or 'duplicate' in err_msg.lower():
            return False, "DUPLICATE VOTE REJECTED: You have already cast a ballot in this session."
        print(f"[Supabase DB Error] submit_voter_ballot: {err_msg}")
        return False, f"Vote error: {err_msg}"

def get_session_results(session_id: str):
    client = get_supabase_client()
    if not client:
        return []
    try:
        candidates = get_candidates_by_session(session_id)
        votes_res = client.table('votes').select('candidate_id').eq('session_id', session_id).execute()
        votes = votes_res.data or []
        
        counts = {}
        for v in votes:
            cid = v['candidate_id']
            counts[cid] = counts.get(cid, 0) + 1
            
        results = []
        for c in candidates:
            cid = c['candidate_id']
            results.append({
                'candidate_id': cid,
                'name': c['name'],
                'party_or_position': c['party_or_position'],
                'vote_count': counts.get(cid, 0)
            })
        results.sort(key=lambda x: x['vote_count'], reverse=True)
        return results
    except Exception as e:
        print(f"[Supabase DB Error] get_session_results: {e}")
        return []

def get_voter_vote_for_session(session_id: str, voter_id: str):
    client = get_supabase_client()
    if not client:
        return None
    try:
        res = client.table('votes').select('*').eq('session_id', session_id).eq('voter_id', voter_id).limit(1).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        print(f"[Supabase DB Error] get_voter_vote_for_session: {e}")
        return None

def reset_voter_ballot(voter_id: str, session_id: str = None):
    client = get_supabase_client()
    if not client:
        return False
    try:
        query = client.table('votes').delete().eq('voter_id', voter_id)
        if session_id:
            query = query.eq('session_id', session_id)
        res = query.execute()
        return len(res.data or []) > 0
    except Exception as e:
        print(f"[Supabase DB Error] reset_voter_ballot: {e}")
        return False

def reset_all_ballots(session_id: str = None):
    client = get_supabase_client()
    if not client:
        return False
    try:
        query = client.table('votes').delete()
        if session_id:
            query = query.eq('session_id', session_id)
        else:
            query = query.neq('id', 0)  # Delete all
        query.execute()
        return True
    except Exception as e:
        print(f"[Supabase DB Error] reset_all_ballots: {e}")
        return False

def get_all_votes_log():
    client = get_supabase_client()
    if not client:
        return []
    try:
        res = client.table('votes').select('*').order('id', desc=True).execute()
        return res.data or []
    except Exception as e:
        print(f"[Supabase DB Error] get_all_votes_log: {e}")
        return []

def get_all_candidates_global():
    client = get_supabase_client()
    if not client:
        return []
    try:
        candidates_res = client.table('candidates').select('*').order('id', desc=False).execute()
        candidates = candidates_res.data or []
        votes_res = client.table('votes').select('candidate_id').execute()
        votes = votes_res.data or []
        
        counts = {}
        for v in votes:
            cid = v['candidate_id']
            counts[cid] = counts.get(cid, 0) + 1
            
        for c in candidates:
            c['total_votes'] = counts.get(c['candidate_id'], 0)
        candidates.sort(key=lambda x: x.get('total_votes', 0), reverse=True)
        return candidates
    except Exception as e:
        print(f"[Supabase DB Error] get_all_candidates_global: {e}")
        return []
