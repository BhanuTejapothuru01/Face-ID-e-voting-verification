"""
FaceVote — Dynamic Database Router
Delegates database queries to Supabase DB if accessible, or SQLite local DB as fallback.
"""

from app.core.config import USE_SQLITE
from app.db import local_db
from app.db import supabase_db

def _use_supabase():
    if USE_SQLITE:
        return False
    return supabase_db.is_supabase_available()

def init_db():
    if _use_supabase():
        print("[INFO] Database Router: Connected to Supabase Cloud PostgreSQL.")
    else:
        print("[INFO] Database Router: Connected to Local SQLite Database.")
        local_db.init_db()

def insert_voter(voter_id: str, name: str, embedding: list[float], status: str = 'ELIGIBLE'):
    if _use_supabase():
        return supabase_db.insert_voter(voter_id, name, embedding, status)
    return local_db.insert_voter(voter_id, name, embedding, status)

def insert_voter_embeddings(voter_uuid: str, voter_id: str, templates: list):
    if _use_supabase():
        return supabase_db.insert_voter_embeddings(voter_uuid, voter_id, templates)
    return local_db.insert_voter_embeddings(voter_uuid, voter_id, templates)

def get_voter_by_id(voter_id: str):
    if _use_supabase():
        return supabase_db.get_voter_by_id(voter_id)
    return local_db.get_voter_by_id(voter_id)

def get_voter_by_uuid(uuid: str):
    if _use_supabase():
        return supabase_db.get_voter_by_uuid(uuid)
    return local_db.get_voter_by_uuid(uuid)

def get_voter_vote_for_session(session_id: str, voter_id: str):
    if _use_supabase():
        return supabase_db.get_voter_vote_for_session(session_id, voter_id)
    return local_db.get_voter_vote_for_session(session_id, voter_id)

def get_all_voters(session_id: str = None, include_embeddings: bool = False):
    if _use_supabase():
        return supabase_db.get_all_voters(session_id, include_embeddings)
    return local_db.get_all_voters(session_id, include_embeddings)

def update_eligibility(voter_id: str, status: str):
    if _use_supabase():
        return supabase_db.update_eligibility(voter_id, status)
    return local_db.update_eligibility(voter_id, status)

def delete_voter(voter_id: str):
    if _use_supabase():
        return supabase_db.delete_voter(voter_id)
    return local_db.delete_voter(voter_id)

def get_all_embeddings_for_index():
    if _use_supabase():
        return supabase_db.get_all_embeddings_for_index()
    return local_db.get_all_embeddings_for_index()

def get_active_session():
    if _use_supabase():
        return supabase_db.get_active_session()
    return local_db.get_active_session()

def get_all_sessions():
    if _use_supabase():
        return supabase_db.get_all_sessions()
    return local_db.get_all_sessions()

def get_session_by_id(session_id: str):
    if _use_supabase():
        return supabase_db.get_session_by_id(session_id)
    return local_db.get_session_by_id(session_id)

def get_session_by_share_token(share_token: str):
    if _use_supabase():
        return supabase_db.get_session_by_share_token(share_token)
    return local_db.get_session_by_share_token(share_token)

def create_full_session(title: str, description: str, start_time: str, end_time: str, candidates_list: list = None):
    if _use_supabase():
        return supabase_db.create_full_session(title, description, start_time, end_time, candidates_list)
    return local_db.create_full_session(title, description, start_time, end_time, candidates_list)

def set_session_status(session_id: str, status: str):
    if _use_supabase():
        return supabase_db.set_session_status(session_id, status)
    return local_db.set_session_status(session_id, status)

def get_candidates_by_session(session_id: str):
    if _use_supabase():
        return supabase_db.get_candidates_by_session(session_id)
    return local_db.get_candidates_by_session(session_id)

def add_candidate(session_id: str, name: str, party_or_position: str):
    if _use_supabase():
        return supabase_db.add_candidate(session_id, name, party_or_position)
    return local_db.add_candidate(session_id, name, party_or_position)

def submit_voter_ballot(session_id: str, voter_id: str, candidate_id: str):
    if _use_supabase():
        return supabase_db.submit_voter_ballot(session_id, voter_id, candidate_id)
    return local_db.submit_voter_ballot(session_id, voter_id, candidate_id)

def get_session_results(session_id: str):
    if _use_supabase():
        return supabase_db.get_session_results(session_id)
    return local_db.get_session_results(session_id)

def reset_voter_ballot(voter_id: str, session_id: str = None):
    if _use_supabase():
        return supabase_db.reset_voter_ballot(voter_id, session_id)
    return local_db.reset_voter_ballot(voter_id, session_id)

def reset_all_ballots(session_id: str = None):
    if _use_supabase():
        return supabase_db.reset_all_ballots(session_id)
    return local_db.reset_all_ballots(session_id)

def get_all_votes_log():
    if _use_supabase():
        return supabase_db.get_all_votes_log()
    return local_db.get_all_votes_log()

def get_all_candidates_global():
    if _use_supabase():
        return supabase_db.get_all_candidates_global()
    return local_db.get_all_candidates_global()
