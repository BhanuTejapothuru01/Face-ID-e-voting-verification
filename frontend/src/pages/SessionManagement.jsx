import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SketchEmptyBox } from '../components/ui/DoodleAccents';
import {
  Vote,
  Plus,
  Copy,
  ExternalLink,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Check,
  X
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function SessionManagement() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Wizard form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('2026-08-26');
  const [endTime, setEndTime] = useState('18:00');
  const [candidates, setCandidates] = useState([
    { name: 'Alex Morgan', party_or_position: 'Alliance Party' },
    { name: 'Sarah Chen', party_or_position: 'Reform Voice' },
  ]);
  const [candName, setCandName] = useState('');
  const [candParty, setCandParty] = useState('');

  const fetchSessions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Fetch sessions failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSessions();
  }, [token]);

  const handleCopyLink = (shareToken) => {
    const fullUrl = `${window.location.origin}/vote/${shareToken}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(shareToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleToggleStatus = async (sessionId, newStatus) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/sessions/${sessionId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchSessions();
    } catch (err) {
      console.error('Update status failed:', err);
    }
  };

  const handleAddCandidate = () => {
    if (!candName.trim()) return;
    setCandidates((prev) => [...prev, { name: candName, party_or_position: candParty || 'Independent' }]);
    setCandName('');
    setCandParty('');
  };

  const handleCreateSession = async () => {
    try {
      const startIso = `${startDate}T${startTime}:00`;
      const endIso = `${endDate}T${endTime}:00`;

      const res = await fetch(`${API_BASE_URL}/api/admin/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          start_time: startIso,
          end_time: endIso,
          candidates,
        }),
      });

      if (res.ok) {
        setIsWizardOpen(false);
        setTitle('');
        setDescription('');
        setWizardStep(1);
        fetchSessions();
      }
    } catch (err) {
      console.error('Create session error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      <Sidebar onLogout={() => localStorage.removeItem('admin_token')} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Election Session Management</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Schedule, configure, and control election lifecycles</p>
          </div>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setIsWizardOpen(true)}>
            Create New Election
          </Button>
        </div>

        {/* Elections Table */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Active & Scheduled Sessions</h3>
            <Badge variant="indigo">{sessions.length} Sessions Total</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3 font-semibold">Election Title</th>
                  <th className="p-3 font-semibold">Session ID</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Shareable Kiosk Link</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <SketchEmptyBox className="w-16 h-16 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-400 text-xs font-semibold">No Election Sessions Created Yet</p>
                      <p className="text-zinc-500 text-[11px] mt-1">Click "Create New Election" above to launch your first session.</p>
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.session_id} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-medium text-white">
                        <div>{s.title}</div>
                        {s.description && <div className="text-[10px] text-zinc-500">{s.description}</div>}
                      </td>
                      <td className="p-3 font-mono text-zinc-400">{s.session_id}</td>
                      <td className="p-3">
                        <Badge variant={s.status === 'ACTIVE' ? 'live' : s.status === 'SCHEDULED' ? 'warning' : 'default'}>
                          {s.status === 'ACTIVE' ? '● LIVE' : s.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" icon={Copy} onClick={() => handleCopyLink(s.share_token || s.session_id)}>
                            {copiedToken === (s.share_token || s.session_id) ? 'Copied!' : 'Copy Link'}
                          </Button>
                          <a href={`/vote/${s.share_token || s.session_id}`} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm" icon={ExternalLink}>Open Kiosk</Button>
                          </a>
                        </div>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {s.status === 'ACTIVE' ? (
                          <Button variant="outline" size="sm" icon={Pause} onClick={() => handleToggleStatus(s.session_id, 'PAUSED')}>
                            Pause
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" icon={Play} onClick={() => handleToggleStatus(s.session_id, 'ACTIVE')}>
                            Make Live
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Multi-Step Create Election Wizard Modal */}
        <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title="Create Election Wizard">
          <div className="space-y-5">
            {/* Wizard Steps indicator */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <div className={`p-2 rounded-lg border ${wizardStep === 1 ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                1. Details & Schedule
              </div>
              <div className={`p-2 rounded-lg border ${wizardStep === 2 ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                2. Candidates ({candidates.length})
              </div>
              <div className={`p-2 rounded-lg border ${wizardStep === 3 ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                3. Final Review
              </div>
            </div>

            {/* STEP 1 */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 font-medium">Election Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Student Council Presidential Election 2026"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief objective of this voting session..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-medium">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-medium">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="md" isDisabled={!title.trim()} onClick={() => setWizardStep(2)}>
                    Next: Add Candidates
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-white block">Add Candidate</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Candidate Name"
                      value={candName}
                      onChange={(e) => setCandName(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Party / Position"
                      value={candParty}
                      onChange={(e) => setCandParty(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddCandidate} className="w-full justify-center">
                    Add Candidate to List
                  </Button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-medium text-zinc-400">Configured Candidates</span>
                  {candidates.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
                      <div>
                        <span className="font-semibold text-white">{c.name}</span>
                        <span className="text-zinc-500 block text-[10px]">{c.party_or_position}</span>
                      </div>
                      <button onClick={() => setCandidates(candidates.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-red-400 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="md" onClick={() => setWizardStep(1)}>Back</Button>
                  <Button variant="primary" size="md" isDisabled={candidates.length === 0} onClick={() => setWizardStep(3)}>Next: Review</Button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-xs space-y-2 font-mono">
                  <div className="flex justify-between"><span className="text-zinc-500">Title:</span><span className="text-white font-bold">{title}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Candidates:</span><span className="text-indigo-400 font-bold">{candidates.length} Registered</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Status:</span><span className="text-emerald-400">● Ready to Launch</span></div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="md" onClick={() => setWizardStep(2)}>Back</Button>
                  <Button variant="primary" size="md" icon={CheckCircle2} onClick={handleCreateSession}>Create & Publish Session</Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
}
