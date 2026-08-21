import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Users, Shield, ShieldAlert, Cpu, Search, Plus, 
  Download, RefreshCw, Eye, Trash2, CheckCircle2, ArrowUpRight,
  SlidersHorizontal, Lock, Database, Activity, Vote, Play, Pause, RotateCcw,
  Sparkles, Layers, BarChart3, KeyRound, FileText, Award, Check
} from 'lucide-react';

import VoterDetailModal from '../components/VoterDetailModal';
import ActivityLogs from '../components/ActivityLogs';
import FaceScanner from '../components/FaceScanner';
import ResultCard from '../components/ResultCard';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [voters, setVoters] = useState([]);
  const [stats, setStats] = useState(null);
  const [votesLog, setVotesLog] = useState([]);
  const [globalCandidates, setGlobalCandidates] = useState([]);
  const [error, setError] = useState(null);
  
  // Dashboard UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVoter, setSelectedVoter] = useState(null);

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState([
    { type: 'SYSTEM', message: 'Voting session & single-vote enforcement active', detail: 'FAISS 512D Index Ready', timestamp: new Date().toLocaleTimeString() },
    { type: 'SYSTEM', message: 'SQLite database connected', detail: 'voters.db', timestamp: new Date().toLocaleTimeString() }
  ]);

  const addLog = (type, message, detail = '') => {
    setActivityLogs(prev => [
      { type, message, detail, timestamp: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  const fetchVoters = async (authToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/voters', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch voters');
      const data = await res.json();
      setVoters(data.voters || []);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setToken(null);
        localStorage.removeItem('admin_token');
      }
    }
  };

  const fetchStats = async (authToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchVotesLog = async (authToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/votes', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVotesLog(data.votes || []);
      }
    } catch (err) {
      console.error("Votes log fetch error:", err);
    }
  };

  const fetchCandidates = async (authToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/candidates', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error("Candidates fetch error:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchVoters(token);
      fetchStats(token);
      fetchVotesLog(token);
      fetchCandidates(token);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) throw new Error('Invalid Admin Secret Key');
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
      addLog('SYSTEM', 'Admin authenticated into SaaS terminal');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleStatus = async (voterId, currentStatus) => {
    const newStatus = currentStatus === 'ELIGIBLE' ? 'NOT ELIGIBLE' : 'ELIGIBLE';
    try {
      const res = await fetch(`http://localhost:8000/api/voters/${voterId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchVoters(token);
        fetchStats(token);
        addLog('STATUS_CHANGE', `Voter ${voterId} status updated`, `New Status: ${newStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVoter = async (voterId) => {
    if (!window.confirm(`Confirm deletion of Voter ID ${voterId}?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/voters/${voterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchVoters(token);
        fetchStats(token);
        addLog('FLAGGED', `Voter ${voterId} deleted from index`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSingleVote = async (voterId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/voters/${voterId}/reset-vote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchVoters(token);
        fetchStats(token);
        fetchVotesLog(token);
        addLog('STATUS_CHANGE', `Reset ballot for Voter ${voterId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (voters.length === 0) return alert("No voters available to export.");
    const headers = ["Voter ID", "Name", "Eligibility Status", "Has Voted", "Voted At", "Created At"];
    const rows = voters.map(v => [
      v.voter_id, 
      `"${v.name}"`, 
      v.eligibility_status, 
      v.has_voted ? "YES" : "NO", 
      v.voted_at || '', 
      v.created_at || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `facevote_registry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog('SYSTEM', 'Voter registry exported to CSV');
  };

  const exportAuditReportJSON = () => {
    const reportData = {
      system: "FaceVote E-Voting Command Platform",
      generated_at: new Date().toISOString(),
      stats: stats,
      voter_count: voters.length,
      votes_cast_count: votesLog.length,
      audit_logs: activityLogs,
      votes: votesLog
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `facevote_audit_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog('SYSTEM', 'Full audit report JSON exported');
  };

  const filteredVoters = voters.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.voter_id.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'ELIGIBLE') matchesStatus = v.eligibility_status === 'ELIGIBLE';
    if (statusFilter === 'NOT ELIGIBLE') matchesStatus = v.eligibility_status === 'NOT ELIGIBLE';
    if (statusFilter === 'VOTED') matchesStatus = v.has_voted === 1;
    return matchesSearch && matchesStatus;
  });

  const eligibleCount = voters.filter(v => v.eligibility_status === 'ELIGIBLE').length;
  const ineligibleCount = voters.filter(v => v.eligibility_status === 'NOT ELIGIBLE').length;
  const votedCount = voters.filter(v => v.has_voted === 1).length;
  const activeSession = stats?.active_session || { title: 'Student Council Election 2026', status: 'ACTIVE' };

  // Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto text-white shadow-md shadow-indigo-600/30">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Executive Admin Access</h1>
            <p className="text-xs text-slate-500">Enter Admin Secret Key to open command center</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin Key (e.g. 602142)"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
            >
              Sign In to Command Center
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 text-center">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-900 font-mono">
              ← Return to Main Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Executive Command Dashboard'}
              {activeTab === 'voters' && 'Voter Registry & Eligibility'}
              {activeTab === 'votes' && 'Ballot Votes Audit Log'}
              {activeTab === 'candidates' && 'Candidates Directory'}
              {activeTab === 'results' && 'Election Results & Analytics'}
              {activeTab === 'reports' && 'Reports & Audit Exports'}
              {activeTab === 'settings' && 'Security & Vector Index Settings'}
              {activeTab === 'logs' && 'Real-time System Audit Stream'}
            </h1>
            <p className="text-xs text-slate-500">Live biometric telemetry, voter registry, and election controls</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/sessions"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" /> Manage Voting Sessions
            </Link>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Enrolled Voters</span>
              <span className="text-2xl font-black text-slate-900">{voters.length}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Ballots Recorded</span>
              <span className="text-2xl font-black text-emerald-600">{votedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Vote className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Eligible Pending</span>
              <span className="text-2xl font-black text-slate-900">{eligibleCount - votedCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block uppercase">Restricted</span>
              <span className="text-2xl font-black text-red-600">{ineligibleCount}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">Active Election Status & Quick Actions</h2>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {activeSession?.status || 'ACTIVE'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/vote" className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500 transition group">
                  <Vote className="w-6 h-6 text-indigo-600 mb-2" />
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Launch Biometric Kiosk</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Open hands-free voter terminal</p>
                </Link>

                <Link to="/admin/sessions" className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500 transition group">
                  <Layers className="w-6 h-6 text-indigo-600 mb-2" />
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Create Voting Session</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Configure schedule & candidates</p>
                </Link>

                <button onClick={exportCSV} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-500 transition text-left group">
                  <Download className="w-6 h-6 text-indigo-600 mb-2" />
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Export Registry CSV</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Download voter database</p>
                </button>
              </div>
            </div>

            <ActivityLogs logs={activityLogs} />
          </div>
        )}

        {/* TAB 2: VOTER REGISTRY */}
        {activeTab === 'voters' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Voter Registry & Status Control</h2>

              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Name or Voter ID..."
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-3 font-semibold">Voter ID</th>
                    <th className="py-3 px-3 font-semibold">Legal Name</th>
                    <th className="py-3 px-3 font-semibold">Eligibility</th>
                    <th className="py-3 px-3 font-semibold">Ballot Status</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVoters.map((v) => (
                    <tr key={v.voter_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">{v.voter_id}</td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{v.name}</td>
                      <td className="py-3.5 px-3">
                        <button 
                          onClick={() => toggleStatus(v.voter_id, v.eligibility_status)}
                          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border transition ${
                            v.eligibility_status === 'ELIGIBLE' 
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50' 
                              : 'border-red-200 text-red-700 bg-red-50'
                          }`}
                        >
                          {v.eligibility_status}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        {v.has_voted === 1 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                            <Vote className="w-3 h-3" /> VOTED
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">
                            Not Voted
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-1.5">
                        {v.has_voted === 1 && (
                          <button
                            onClick={() => handleResetSingleVote(v.voter_id)}
                            className="p-1.5 text-amber-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                            title="Reset Ballot"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedVoter(v)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg transition"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteVoter(v.voter_id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 border border-slate-200 rounded-lg transition"
                          title="Delete Voter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VOTES LOG */}
        {activeTab === 'votes' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Cast Ballot Votes Log</h2>
              <span className="text-xs font-mono text-slate-500">Total Votes: {votesLog.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-3 font-semibold">Vote ID</th>
                    <th className="py-3 px-3 font-semibold">Session Title</th>
                    <th className="py-3 px-3 font-semibold">Voter Name</th>
                    <th className="py-3 px-3 font-semibold">Candidate Voted</th>
                    <th className="py-3 px-3 font-semibold">Timestamp</th>
                    <th className="py-3 px-3 font-semibold">Biometric Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {votesLog.map((vote) => (
                    <tr key={vote.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-slate-500 font-semibold">#VOTE-{vote.id}</td>
                      <td className="py-3 px-3 font-sans font-bold text-slate-900">{vote.session_title || vote.session_id}</td>
                      <td className="py-3 px-3 font-sans text-slate-800">{vote.voter_name || vote.voter_id}</td>
                      <td className="py-3 px-3 text-indigo-700 font-bold">{vote.candidate_name || vote.candidate_id}</td>
                      <td className="py-3 px-3 text-slate-500">{new Date(vote.cast_at).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          VERIFIED & LOCKED
                        </span>
                      </td>
                    </tr>
                  ))}
                  {votesLog.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-400 font-sans">
                        No cast votes recorded in the active database yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CANDIDATES DIRECTORY */}
        {activeTab === 'candidates' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Registered Candidates Directory</h2>
              <Link to="/admin/sessions" className="text-xs font-semibold text-indigo-600 hover:underline">
                + Add Candidate via Session Manager
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalCandidates.map((cand) => (
                <div key={cand.candidate_id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{cand.name}</span>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      {cand.total_votes || 0} votes
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{cand.party_or_position}</p>
                  <div className="text-[10px] text-slate-400 font-mono border-t border-slate-200 pt-2">
                    Session: {cand.session_title || cand.session_id}
                  </div>
                </div>
              ))}
              {globalCandidates.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  No registered candidates found across sessions.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ELECTION RESULTS */}
        {activeTab === 'results' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">{activeSession?.title || 'Student Council Election 2026'} Results</h2>
                <p className="text-xs text-slate-500">Live vote count tally & candidate leaderboard</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                OFFICIAL TALLY
              </span>
            </div>

            <div className="space-y-3">
              {globalCandidates.map((cand, idx) => {
                const totalAllVotes = globalCandidates.reduce((sum, c) => sum + (c.total_votes || 0), 0);
                const percent = totalAllVotes > 0 ? ((cand.total_votes / totalAllVotes) * 100).toFixed(1) : 0;
                return (
                  <div key={cand.candidate_id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {idx === 0 && cand.total_votes > 0 && (
                          <Award className="w-5 h-5 text-amber-500" />
                        )}
                        <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({cand.party_or_position})</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-indigo-600">{cand.total_votes || 0} Votes ({percent}%)</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: REPORTS & EXPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Election Reports & Export Generators</h2>
              <p className="text-xs text-slate-500">Download compliance reports, audit logs, and voter lists</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <FileText className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Voter Registry CSV</h3>
                  <p className="text-[11px] text-slate-500">Full list of enrolled voters and eligibility statuses</p>
                </div>
                <button onClick={exportCSV} className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition">
                  Download CSV
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <Database className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Audit Stream JSON</h3>
                  <p className="text-[11px] text-slate-500">Complete raw audit trail & biometric verification events</p>
                </div>
                <button onClick={exportAuditReportJSON} className="w-full py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition">
                  Download JSON Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">System Security & Vector Settings</h2>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Cosine Match Cutoff:</span>
                  <span className="text-indigo-600 font-bold">0.40</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Strictness threshold for FAISS vector matching.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-700 block">Single-Vote Duplicate Rule</span>
                <p className="text-emerald-700 font-bold">ENFORCED (1 Ballot per voter per session)</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-700 block">Biometric Extraction Model</span>
                <p className="text-slate-600">InsightFace (buffalo_l 512D)</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <ActivityLogs logs={activityLogs} />
        )}

      </main>

      {/* Modal Profile */}
      {selectedVoter && (
        <VoterDetailModal
          voter={selectedVoter}
          onClose={() => setSelectedVoter(null)}
          onToggleStatus={toggleStatus}
          onDelete={deleteVoter}
        />
      )}
    </div>
  );
}
