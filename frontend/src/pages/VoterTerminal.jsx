import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import AutoFaceScanner from '../components/AutoFaceScanner';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SketchEmptyBox } from '../components/ui/DoodleAccents';
import {
  ShieldCheck,
  Calendar,
  Clock,
  ChevronLeft,
  Vote,
  XCircle,
  PauseCircle,
  AlertTriangle
} from 'lucide-react';

export default function VoterTerminal() {
  const { shareToken } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = shareToken
        ? `http://localhost:8000/api/voting/session-by-token/${shareToken}`
        : 'http://localhost:8000/api/voting/active-session';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load session details.');
      const data = await res.json();
      setSessionData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [shareToken]);

  const handleVerified = (verifiedData) => {
    sessionStorage.setItem('vote_token', verifiedData.vote_token);
    sessionStorage.setItem('voter_id', verifiedData.voter_id);
    sessionStorage.setItem('voter_name', verifiedData.name);
    navigate('/vote/ballot');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-zinc-400">Initializing biometric terminal...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const sessionStatus = sessionData?.status;
  const activeSession = sessionData?.session;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-grow">
        <div className="mb-6">
          <Link to="/" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Return to Main Portal
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SESSION INFO CARD */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-sm text-white">Election Details</span>
                </div>
                <Badge variant={sessionStatus === 'ACTIVE' ? 'live' : 'default'}>
                  {sessionStatus === 'ACTIVE' ? '● LIVE' : sessionStatus}
                </Badge>
              </div>

              {sessionStatus === 'NOT_FOUND' ? (
                <div className="text-center py-6 space-y-3">
                  <SketchEmptyBox className="w-16 h-16 text-zinc-600 mx-auto" />
                  <h3 className="text-base font-semibold text-white">No Active Session Found</h3>
                  <p className="text-xs text-zinc-400">Please check the election URL or contact your administrator.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{activeSession?.title}</h2>
                    {activeSession?.description && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{activeSession.description}</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-300">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Session ID</span>
                      <span className="font-mono text-indigo-400 font-semibold">{activeSession?.session_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Candidates</span>
                      <span className="font-semibold text-white">{sessionData?.candidates_count || 3} Listed</span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 leading-relaxed">
                    <span className="font-semibold text-indigo-400 block mb-0.5">Verification Instructions</span>
                    Stand in front of the terminal camera. The reticle will perform automatic anti-spoofing liveness verification.
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* FACIAL SCANNER TERMINAL */}
          <div className="lg:col-span-7 flex justify-center">
            {sessionStatus === 'ACTIVE' ? (
              <AutoFaceScanner
                sessionTitle={activeSession?.title}
                sessionId={activeSession?.session_id}
                shareToken={shareToken}
                onVerified={handleVerified}
              />
            ) : (
              <Card className="w-full text-center py-16 px-6 space-y-4">
                <PauseCircle className="w-16 h-16 text-amber-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Election Terminal Unavailable</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Voting is currently <span className="text-amber-400 font-semibold">{sessionStatus}</span> for this election session.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
