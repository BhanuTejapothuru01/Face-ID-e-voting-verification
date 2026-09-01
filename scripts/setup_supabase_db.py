"""
FaceVote — Supabase Database Migration & Verification Utility
Checks connection to Supabase and verifies table readiness.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

def verify_supabase():
    print("=" * 60)
    print("      FACEVOTE SUPABASE DATABASE SETUP & VERIFICATION")
    print("=" * 60)
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("[ERROR] Supabase URL or Service Role Key missing in environment.")
        return False

    print(f"[INFO] Connecting to Supabase Project: {SUPABASE_URL}")
    
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("[OK] Successfully authenticated with Supabase!")
    except Exception as e:
        print(f"[ERROR] Failed to connect to Supabase: {e}")
        return False

    # Check for tables
    tables = ['voters', 'voting_sessions', 'candidates', 'votes']
    missing_tables = []
    
    for table in tables:
        try:
            res = supabase.table(table).select('count', count='exact').limit(1).execute()
            print(f"[OK] Table '{table}' exists on Supabase schema.")
        except Exception:
            missing_tables.append(table)
            print(f"[MISSING] Table '{table}' does not exist on Supabase yet.")

    print("-" * 60)
    if missing_tables:
        print("\n⚠️ ACTION REQUIRED TO CREATE TABLES ON SUPABASE:")
        print("1. Open your Supabase Dashboard SQL Editor:")
        print(f"   👉 {SUPABASE_URL.replace('.co', '.com')}/dashboard/project/{SUPABASE_URL.split('//')[1].split('.')[0]}/sql")
        print("2. Copy the contents of the generated schema file:")
        print(f"   📄 {Path(__file__).resolve().parent / 'supabase_schema.sql'}")
        print("3. Paste into the SQL Editor and click 'RUN'.")
        print("\nOnce executed, run this script again to confirm tables are active!")
        return False
    else:
        print("[SUCCESS] All FaceVote tables are active on Supabase!")
        return True

if __name__ == "__main__":
    verify_supabase()
