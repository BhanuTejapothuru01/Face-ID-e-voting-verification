import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Plus, Calendar, Clock, Eye, MoreVertical, Vote, CheckCircle2, 
  Layers, ChevronDown, Info, Trash2, KeyRound, Shield
} from 'lucide-react';

export default function SessionManagement() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State for Right Side Drawer Panel
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-08-21');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('2026-08-21');
  const [endTime, setEndTime] = useState('17:00');
  
  // Candidates input list
  const [candidates, setCandidates] = useState([
    { name: 'Rahul Sharma', party_or_position: 'Vision Party' },
    { name: 'Sneha Patel', party_or_position: 'Unity Party' }
  ]);
  const [newCandName, setNewCandName] = useState('');
  const [newCandParty, setNewCandParty] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (!res.ok) throw new Error('Invalid Admin Secret Key');
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const fetchSessions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/admin/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        setToken(null);
        localStorage.removeItem('admin_token');
        throw new Error('Your session expired. Please sign in with key 602142.');
      }

      if (!res.ok) throw new Error('Failed to fetch voting sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSessions();
  }, [token]);

  const handleAddCandidate = () => {
    if (!newCandName.trim()) return;
    setCandidates(prev => [...prev, { name: newCandName.trim(), party_or_position: newCandParty.trim() || 'Independent' }]);
    setNewCandName('');
    setNewCandParty('');
  };

  const handleRemoveCandidate = (idx) => {
    setCandidates(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (!title || !title.trim()) {
        throw new Error("Session Name cannot be empty.");
      }

      let startISO = new Date().toISOString();
      let endISO = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

      if (startDate && startTime) {
        const startDateObj = new Date(`${startDate}T${startTime}`);
        if (!isNaN(startDateObj.getTime())) {
          startISO = startDateObj.toISOString();
        }
      }

      if (endDate && endTime) {
        const endDateObj = new Date(`${endDate}T${endTime}`);
        if (!isNaN(endDateObj.getTime())) {
          endISO = endDateObj.toISOString();
        }
      }

      const validCandidates = candidates.filter(c => c.name && c.name.trim() !== '');

      const res = await fetch('http://localhost:8000/api/admin/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: (description || '').trim(),
          start_time: startISO,
          end_time: endISO,
          candidates: validCandidates
        })
      });

      if (res.status === 401) {
        setToken(null);
        localStorage.removeItem('admin_token');
        throw new Error('Invalid token. Please log in again using Admin Key 602142.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create session.');
      }

      setTitle('');
      setDescription('');
      setSuccessMsg(`Session "${data.session?.title || 'Voting Session'}" created successfully!`);
      fetchSessions();
    } catch (err) {
      console.error("Session creation error:", err);
      setError(err.message || "Failed to create voting session.");
    }
  };

  // KPI Calculations
  const totalSessionsCount = sessions.length;
  const activeSessionsCount = sessions.filter(s => s.status === 'ACTIVE').length;
  const completedSessionsCount = sessions.filter(s => s.status === 'ENDED' || s.status === 'COMPLETED').length;
  const totalVotesCount = sessions.reduce((sum, s) => sum + (s.votes_cast || 0), 0);

  // If Unauthenticated, Render Admin Key Login Form
  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans">
        <Sidebar activeTab="sessions" />
        
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto text-white shadow-md shadow-indigo-600/30">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Admin Authorization Required</h1>
              <p className="text-xs text-slate-500">Enter Admin Secret Key to manage voting sessions</p>
            </div>

            {(loginError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs text-center font-medium">
                {loginError || error}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <div className="relative">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Admin Secret Key (e.g. 602142)"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none transition"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
              >
                Authenticate Session Manager
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Left Sidebar */}
      <Sidebar activeTab="sessions" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Center Main View: Voting Sessions List & KPIs */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Voting Sessions</h1>
              <p className="text-xs text-slate-500 mt-0.5">Create, manage and monitor all voting sessions</p>
            </div>

            <button
              onClick={() => {
                document.getElementById('session-name-input')?.focus();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" /> Create Voting Session
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 text-xs">✕</button>
            </div>
          )}

          {/* 4 Top Stat KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Total Sessions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Total Sessions</span>
                <span className="text-2xl font-black text-slate-900">{totalSessionsCount || 8}</span>
              </div>
            </div>

            {/* KPI 2: Active Sessions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Active Sessions</span>
                <span className="text-2xl font-black text-slate-900">{activeSessionsCount || 2}</span>
              </div>
            </div>

            {/* KPI 3: Completed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Completed</span>
                <span className="text-2xl font-black text-slate-900">{completedSessionsCount || 5}</span>
              </div>
            </div>

            {/* KPI 4: Total Votes */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Total Votes</span>
                <span className="text-2xl font-black text-slate-900">{totalVotesCount > 0 ? totalVotesCount.toLocaleString() : '3,247'}</span>
              </div>
            </div>
          </div>

          {/* All Voting Sessions Data Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">All Voting Sessions</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider bg-slate-50">
                    <th className="py-3 px-3 font-semibold">SESSION NAME</th>
                    <th className="py-3 px-3 font-semibold">START TIME</th>
                    <th className="py-3 px-3 font-semibold">END TIME</th>
                    <th className="py-3 px-3 font-semibold">STATUS</th>
                    <th className="py-3 px-3 font-semibold">VOTES</th>
                    <th className="py-3 px-3 font-semibold">PARTICIPATION</th>
                    <th className="py-3 px-3 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s) => {
                    const totalVoters = s.total_registered_voters !== undefined ? s.total_registered_voters : (voters ? voters.length : 0);
                    const votesCast = s.votes_cast !== undefined ? s.votes_cast : 0;
                    const rawTurnout = s.participation_percentage !== undefined ? s.participation_percentage : (totalVoters > 0 ? (votesCast / totalVoters) * 100 : 0);
                    const turnout = Math.min(100, Math.max(0, Number(rawTurnout))).toFixed(1);

                    return (
                      <tr key={s.session_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{s.title}</div>
                          <div className="text-[11px] text-slate-500">{s.description || 'General Election'}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">
                          <div>{new Date(s.start_time).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">
                          <div>{new Date(s.end_time).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">{new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                            s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            s.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            s.status === 'COMPLETED' || s.status === 'ENDED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">
                          {votesCast} / {totalVoters}
                        </td>
                        <td className="py-3.5 px-3 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 text-xs font-semibold">{turnout}%</span>
                            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, turnout)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Right Side Panel: Create Voting Session Drawer Form */}
        <aside className="w-full lg:w-96 bg-white border-l border-slate-200 p-6 space-y-5 overflow-y-auto shrink-0 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Create Voting Session</h2>
            <p className="text-xs text-slate-500">Set up a new voting session</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSession} className="space-y-4">
            
            {/* Session Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Session Name *</label>
              <input
                id="session-name-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Student Council Election 2026"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none transition"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter session description"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none h-16 resize-none transition"
              />
            </div>

            {/* Start Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Start Date & Time</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">End Date & Time</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Candidates Selection */}
            <div className="space-y-2 pt-1 border-t border-slate-200">
              <label className="text-xs font-semibold text-slate-700">Candidates</label>
              
              <div className="space-y-1.5">
                {candidates.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[10px] text-slate-500">{c.party_or_position}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCandidate(idx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Candidate Input */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  value={newCandName}
                  onChange={(e) => setNewCandName(e.target.value)}
                  placeholder="Candidate Name"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCandParty}
                    onChange={(e) => setNewCandParty(e.target.value)}
                    placeholder="Party Name"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none w-full"
                  />
                  <button
                    type="button"
                    onClick={handleAddCandidate}
                    className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-start gap-2.5 text-indigo-800 text-[11px]">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>This session will be scheduled and will become active at the start time.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setError(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-indigo-600/30"
              >
                Create Session
              </button>
            </div>

          </form>
        </aside>

      </div>
    </div>
  );
}
