import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/admin/StatCard';
import { TurnoutChart } from '../components/admin/TurnoutChart';
import { SystemHealthPanel } from '../components/admin/SystemHealthPanel';
import { ElectionResultsPanel } from '../components/admin/ElectionResultsPanel';
import { SketchShield } from '../components/ui/DoodleAccents';
import {
  Users,
  Vote,
  CheckCircle2,
  Lock,
  Search,
  Trash2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [voters, setVoters] = useState([]);
  const [stats, setStats] = useState(null);
  const [votesLog, setVotesLog] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('Invalid Secret Key');
      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadData = async (authToken) => {
    try {
      const [vRes, sRes, logRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/voters`, { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch(`${API_BASE_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch(`${API_BASE_URL}/api/admin/votes`, { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);

      if (vRes.status === 401 || sRes.status === 401 || logRes.status === 401) {
        localStorage.removeItem('admin_token');
        setToken(null);
        setError('Admin session expired or invalid passcode key. Please log in again.');
        return;
      }

      if (vRes.ok) {
        const vData = await vRes.json();
        setVoters(vData.voters || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData);
      }
      if (logRes.ok) {
        const lData = await logRes.json();
        setVotesLog(lData.votes || []);
      }
    } catch (err) {
      console.error('Data load error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      loadData(token);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  const handleResetBallot = async (voterId) => {
    try {
      await fetch(`${API_BASE_URL}/api/voters/${voterId}/reset-vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData(token);
    } catch (err) {
      console.error('Reset ballot failed', err);
    }
  };

  const handleDeleteVoter = async (voterId) => {
    if (!window.confirm('Delete voter profile and vector index?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/voters/${voterId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadData(token);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 text-center">
          <SketchShield className="w-16 h-16 text-indigo-400 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Admin Command Center</h2>
            <p className="text-xs text-zinc-400">Enter administrative secret passcode to proceed.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium">Passcode Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Key (Default: 602142)"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute right-3 top-3" />
              </div>
            </div>

            <Button variant="primary" size="md" type="submit" className="w-full justify-center">
              Authenticate Admin Session
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const filteredVoters = voters.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.voter_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FaceVote Command Center</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Live participation metrics, audit logs & voter telemetry</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => loadData(token)}>
              Sync Telemetry
            </Button>
            <Badge variant="live">● SESSION ISOLATION ACTIVE</Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Registered Voters" value={stats?.total_voters || voters.length} icon={Users} />
          <StatCard title="Eligible Voters" value={stats?.eligible_voters || voters.filter(v => v.eligibility_status === 'ELIGIBLE').length} icon={CheckCircle2} />
          <StatCard title="Votes Cast" value={stats?.votes_cast || voters.filter(v => v.has_voted === 1).length} icon={Vote} />
          <StatCard title="Turnout Rate" value={`${stats?.turnout_percent || 0}%`} icon={Activity} />
        </div>

        {/* Detailed Election Results & Standings */}
        <ElectionResultsPanel token={token} />

        {/* Turnout & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <TurnoutChart totalVoters={voters.length} votesCast={voters.filter(v => v.has_voted === 1).length} />
          </div>
          <div className="lg:col-span-6">
            <SystemHealthPanel />
          </div>
        </div>

        {/* Voters Management Table */}
        <Card id="voters" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Voter Registry & Index</h3>
              <p className="text-xs text-zinc-400">Indexed voter profiles and voting status</p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search voter by name or ID..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 pl-9"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3 font-semibold">Voter Name</th>
                  <th className="p-3 font-semibold">Voter ID</th>
                  <th className="p-3 font-semibold">Eligibility</th>
                  <th className="p-3 font-semibold">Ballot Status</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredVoters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-zinc-500">
                      No voter profiles found in index.
                    </td>
                  </tr>
                ) : (
                  filteredVoters.map((v) => (
                    <tr key={v.voter_id} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-medium text-white">{v.name}</td>
                      <td className="p-3 font-mono text-zinc-400">{v.voter_id}</td>
                      <td className="p-3">
                        <Badge variant={v.eligibility_status === 'ELIGIBLE' ? 'success' : 'danger'}>
                          {v.eligibility_status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={v.has_voted === 1 ? 'indigo' : 'default'}>
                          {v.has_voted === 1 ? '✓ VOTED' : 'NOT VOTED'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {v.has_voted === 1 && (
                          <Button variant="outline" size="sm" onClick={() => handleResetBallot(v.voter_id)}>
                            Reset Ballot
                          </Button>
                        )}
                        <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDeleteVoter(v.voter_id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Audit Logs Section */}
        <Card id="audit-logs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">System Audit Log</h3>
              <p className="text-xs text-zinc-400">Cryptographic audit events and ballot logs</p>
            </div>
            <Badge variant="indigo">{votesLog.length} Recorded Events</Badge>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
            {votesLog.length === 0 ? (
              <div className="text-zinc-500 text-center py-4">No audit events recorded yet.</div>
            ) : (
              votesLog.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-zinc-900 last:border-0 text-zinc-300">
                  <span className="text-zinc-500">[{new Date(log.cast_at || Date.now()).toLocaleTimeString()}]</span>
                  <span className="font-bold text-indigo-400">VOTE_SUBMITTED</span>
                  <span className="text-zinc-400">Session: {log.session_id}</span>
                  <span className="text-emerald-400">Voter: {log.voter_id}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
