import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StatCard } from './StatCard';
import {
  Trophy,
  TrendingUp,
  Users,
  UserCheck,
  Vote,
  Activity,
  UserMinus,
  RefreshCw,
  Award,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export function ElectionResultsPanel({ token, defaultSessionId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(defaultSessionId || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch available sessions list
  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const sessionList = data.sessions || [];
        setSessions(sessionList);

        if (!selectedSessionId && sessionList.length > 0) {
          // Default to active session if available, else first session
          const active = sessionList.find((s) => s.status === 'ACTIVE');
          setSelectedSessionId(active ? active.session_id : sessionList[0].session_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions for results panel:', err);
    }
  };

  // 2. Fetch results for currently selected session
  const fetchResults = async (sessionId) => {
    if (!sessionId || !token) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/admin/elections/${sessionId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Unable to load election results for selected session.');
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Fetch election results error:', err);
      setError(err.message || 'Unable to load election results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [token]);

  useEffect(() => {
    if (selectedSessionId) {
      setLoading(true);
      fetchResults(selectedSessionId);
    }
  }, [selectedSessionId, token]);

  // 3. Polling mechanism for ACTIVE sessions (refreshes every 5 seconds)
  useEffect(() => {
    if (!results || results.status !== 'ACTIVE' || !selectedSessionId) return;

    const interval = setInterval(() => {
      fetchResults(selectedSessionId);
    }, 5000);

    return () => clearInterval(interval);
  }, [results?.status, selectedSessionId, token]);

  return (
    <div id="election-results" className="space-y-6">
      {/* Session Selector & Header */}
      <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Detailed Election Results & Live Telemetry
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Session-isolated vote tallies, candidate standings, and turnout analytics
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {sessions.length > 0 && (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition-colors w-full sm:w-64"
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.title} ({s.status})
                </option>
              ))}
            </select>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchResults(selectedSessionId)}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {loading && !results && (
        <Card className="text-center py-12 space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading election results and live tally...</p>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-red-950/40 border border-red-800/60 text-center py-8 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-300 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchResults(selectedSessionId)}>
            Try Again
          </Button>
        </Card>
      )}

      {/* No Sessions State */}
      {!loading && !error && sessions.length === 0 && (
        <Card className="text-center py-12 space-y-3">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-xs text-zinc-400">No election sessions available to display.</p>
        </Card>
      )}

      {/* Main Results Display */}
      {!loading && results && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Registered Voters"
              value={results.total_registered_voters}
              icon={Users}
              subtitle="Total voters eligible"
            />
            <StatCard
              title="Verified Voters"
              value={results.total_verified_voters}
              icon={UserCheck}
              subtitle="Passed face recognition"
            />
            <StatCard
              title="Votes Cast"
              value={results.total_votes_cast}
              icon={Vote}
              subtitle="Ballots submitted"
            />
            <StatCard
              title="Remaining Voters"
              value={results.remaining_voters}
              icon={UserMinus}
              subtitle="Haven't voted yet"
            />
            <StatCard
              title="Participation"
              value={`${results.participation_percentage}%`}
              icon={Activity}
              subtitle="Turnout percentage"
            />
          </div>

          {/* Winner / Leading Candidate Banner */}
          {results.status === 'ENDED' || results.status === 'COMPLETED' ? (
            results.winner ? (
              <div className="p-5 bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-zinc-900 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
                        ELECTION WINNER
                      </span>
                      <Badge variant="indigo">COMPLETED</Badge>
                    </div>
                    <h4 className="text-xl font-bold text-white mt-1">
                      {results.winner.candidate_name || results.winner.name}
                    </h4>
                    <p className="text-xs text-amber-200/80">
                      {results.winner.party_or_position}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold text-amber-300">
                    {results.winner.vote_count} votes
                  </span>
                  <span className="text-xs text-amber-200/80 block">
                    ({results.winner.percentage}% of votes cast)
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400">
                Election session ended without cast votes.
              </div>
            )
          ) : results.leading_candidate ? (
            <div className="p-4 bg-gradient-to-r from-indigo-950/60 via-zinc-900 to-zinc-900 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded">
                      CURRENT LEADER
                    </span>
                    <Badge variant="live">● LIVE STANDING</Badge>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {results.leading_candidate.candidate_name || results.leading_candidate.name}
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-indigo-400">
                  {results.leading_candidate.vote_count} votes
                </span>
                <span className="text-xs text-zinc-400 block">
                  ({results.leading_candidate.percentage}% of total cast)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Voting session is active. No votes have been cast yet.</span>
            </div>
          )}

          {/* Candidate Breakdown Table */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h4 className="text-base font-semibold text-white">Candidate Vote Tallies</h4>
                <p className="text-xs text-zinc-400">
                  Ranked candidate standings for session{' '}
                  <span className="font-mono text-indigo-400">{results.session_id}</span>
                </p>
              </div>
              <Badge variant="indigo">{results.candidates.length} Candidates</Badge>
            </div>

            {results.candidates.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No candidates configured for this election session.
              </div>
            ) : (
              <div className="space-y-3">
                {results.candidates.map((cand, idx) => {
                  const isWinner = results.winner?.candidate_id === cand.candidate_id;
                  const isLeader = results.leading_candidate?.candidate_id === cand.candidate_id;

                  return (
                    <div
                      key={cand.candidate_id}
                      className={`p-4 rounded-xl border transition-colors ${
                        isWinner
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : isLeader
                          ? 'bg-indigo-950/20 border-indigo-500/30'
                          : 'bg-zinc-900/60 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              idx === 0
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">
                                {cand.candidate_name || cand.name}
                              </span>
                              {isWinner && (
                                <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Award className="w-3 h-3" /> WINNER
                                </span>
                              )}
                              {isLeader && !isWinner && (
                                <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" /> LEADER
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-zinc-400">{cand.party_or_position}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-white">
                            {cand.vote_count} <span className="text-xs font-normal text-zinc-400">votes</span>
                          </span>
                          <span className="text-xs text-indigo-400 font-mono block">
                            {cand.percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Percentage Visual Progress Bar */}
                      <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinner
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : isLeader
                              ? 'bg-gradient-to-r from-indigo-600 to-cyan-400'
                              : 'bg-gradient-to-r from-indigo-600/80 to-indigo-500/60'
                          }`}
                          style={{ width: `${cand.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
