import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SketchEmptyBox } from '../components/ui/DoodleAccents';
import { Vote, Calendar, Clock, UserCheck, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function PublicElection() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Attempt resolving session by shareToken or sessionId
    fetch(`${API_BASE_URL}/api/voting/session-by-token/${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Election session not found');
        return res.json();
      })
      .then((data) => {
        if (!data.session || data.status === 'NOT_FOUND') {
          throw new Error('Election session not found');
        }
        setSession(data.session);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 w-full flex-grow">
        {loading ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Loading election session details...</p>
          </div>
        ) : error || !session ? (
          <Card className="text-center py-16 px-6 space-y-4 max-w-lg mx-auto">
            <SketchEmptyBox className="w-20 h-20 text-zinc-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">Election Session Not Found</h3>
            <p className="text-xs text-zinc-400">
              The election link may be invalid, or voting may have been removed by an election administrator.
            </p>
            <div className="pt-4">
              <Link to="/">
                <Button variant="primary" size="md">Return to Main Portal</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl p-8 space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    session.status === 'ACTIVE'
                      ? 'live'
                      : session.status === 'SCHEDULED'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {session.status === 'ACTIVE' ? '● LIVE ELECTION' : session.status}
                </Badge>
                <span className="text-xs font-mono text-zinc-500">ID: {session.session_id}</span>
              </div>

              <h1 className="text-3xl font-extrabold text-white tracking-tight">{session.title}</h1>
              {session.description && (
                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{session.description}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Start: {new Date(session.start_time || Date.now()).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>End: {new Date(session.end_time || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Voting CTA Panel */}
            <Card className="p-8 text-center space-y-6">
              <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto" />
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-white">Biometric Verification Required</h3>
                <p className="text-xs text-zinc-400">
                  Step up to the facial terminal to verify your identity and cast your ballot for this active session.
                </p>
              </div>

              <div className="pt-2">
                {session.status === 'ACTIVE' ? (
                  <Link to={`/vote/${session.share_token || session.session_id}`}>
                    <Button variant="primary" size="lg" icon={Vote} className="px-8">
                      Proceed to Voting Terminal
                    </Button>
                  </Link>
                ) : (
                  <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 inline-block">
                    Voting for this election is currently <span className="text-amber-400 font-semibold">{session.status}</span>.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
