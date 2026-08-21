import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, ArrowRight } from 'lucide-react';

export default function Ballot() {
  const [candidates, setCandidates] = useState([]);
  const [session, setSession] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const voteToken = sessionStorage.getItem('vote_token');
  const voterId = sessionStorage.getItem('voter_id');
  const voterName = sessionStorage.getItem('voter_name');

  useEffect(() => {
    if (!voteToken || !voterId) {
      navigate('/vote');
      return;
    }

    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8000/api/voting/active-session');
        if (!res.ok) throw new Error('Failed to load election candidates.');
        const data = await res.json();
        
        if (data.status !== 'ACTIVE' || !data.session) {
          throw new Error('Voting session is no longer active.');
        }

        setSession(data.session);
        setCandidates(data.candidates && data.candidates.length > 0 ? data.candidates : [
          { candidate_id: 'CAND-01', name: 'Rahul Sharma', party_or_position: 'Vision Party' },
          { candidate_id: 'CAND-02', name: 'Sneha Patel', party_or_position: 'Unity Party' },
          { candidate_id: 'CAND-03', name: 'Arjun Mehta', party_or_position: 'Progressive Party' },
          { candidate_id: 'CAND-04', name: 'Priya Nair', party_or_position: 'NextGen Party' }
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [voteToken, voterId, navigate]);

  const handleCastVote = async () => {
    if (!selectedCandidate || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:8000/api/voting/cast-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vote_token: voteToken,
          candidate_id: selectedCandidate
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Vote submission failed.');
      }

      sessionStorage.removeItem('vote_token');
      sessionStorage.setItem('last_vote_timestamp', data.timestamp || new Date().toISOString());

      navigate('/vote/success');

    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Loading official ballot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 flex flex-col items-center justify-center font-sans selection:bg-indigo-500 selection:text-white">
      
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">{session?.title || 'Student Council Election 2026'}</span>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Select your candidate</h1>
          <p className="text-xs text-slate-500">Choose one candidate</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Candidates List */}
        <div className="space-y-2.5">
          {candidates.map((cand) => {
            const isSelected = selectedCandidate === cand.candidate_id;
            return (
              <div
                key={cand.candidate_id}
                onClick={() => setSelectedCandidate(cand.candidate_id)}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                  isSelected 
                    ? 'bg-indigo-50/50 border-indigo-600 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                    {cand.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{cand.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">{cand.party_or_position}</p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm Vote Button */}
        <button
          onClick={handleCastVote}
          disabled={!selectedCandidate || submitting}
          className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-md ${
            !selectedCandidate || submitting
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
          }`}
        >
          <span>{submitting ? 'Recording Vote...' : 'Confirm Vote'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
