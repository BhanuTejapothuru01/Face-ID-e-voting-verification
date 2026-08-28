import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  SketchShield,
  SketchUnderline,
  SketchFaceFrame,
  SketchCheckmark
} from '../components/ui/DoodleAccents';
import {
  ShieldCheck,
  Scan,
  Lock,
  Users,
  CheckCircle2,
  ArrowRight,
  Vote,
  FileCheck,
  Building,
  KeyRound,
  Shield
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function Home() {
  const [stats, setStats] = useState({
    activeElections: 1,
    registeredVoters: 0,
    votesCast: 0
  });

  useEffect(() => {
    // Fetch live counts if available
    Promise.all([
      fetch(`${API_BASE_URL}/api/voters`).then((res) => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/admin/sessions`).then((res) => res.json()).catch(() => null)
    ]).then(([vData, sData]) => {
      const registered = vData?.voters?.length || 0;
      const votes = vData?.voters?.filter((v) => v.has_voted === 1).length || 0;
      const active = sData?.sessions?.filter((s) => s.status === 'ACTIVE').length || 1;
      setStats({ registeredVoters: registered, votesCast: votes, activeElections: active });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Navigation */}
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden border-b border-zinc-800/80">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Left Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <Badge variant="indigo" className="py-1 px-3">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Biometric Identity Guard v2.0
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Secure voting.{' '}
                  <span className="text-indigo-400 relative inline-block">
                    Verified by you.
                    <SketchUnderline className="absolute -bottom-3 left-0 w-full text-indigo-500/80" />
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
                  A modern biometric voting platform designed for trusted, transparent elections. Run secure voter verification with real-time liveness analysis and session isolation.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link to="/admin/sessions">
                    <Button variant="primary" size="lg" icon={Vote}>
                      Create Election
                    </Button>
                  </Link>
                  <Link to="/vote">
                    <Button variant="outline" size="lg" icon={ArrowRight}>
                      Enter Election Kiosk
                    </Button>
                  </Link>
                </div>

                {/* Trust stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800/80 max-w-lg">
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.activeElections}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Active Election</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.registeredVoters}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Verified Voters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.votesCast}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">Cast Ballots</div>
                  </div>
                </div>
              </div>

              {/* Hero Right Mockup with Hand-Drawn Doodle Frame */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-md bg-[#0D0D0D] border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-indigo-950/40">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">FACEVOTE KIOSK v2</span>
                  </div>

                  {/* Kiosk Preview Camera UI */}
                  <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <SketchFaceFrame className="w-36 h-36 text-indigo-500/60" />
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500 shadow-md shadow-indigo-500 animate-scan-line" />
                    <div className="absolute bottom-2 inset-x-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between text-[10px] text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Reticle Locked
                      </span>
                      <span className="font-mono text-emerald-400">99.8% Liveness</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-zinc-200 font-medium">Session Isolation Active</span>
                    </div>
                    <Badge variant="success">READY</Badge>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TRUST CAPABILITIES SECTION */}
        <section id="features" className="py-16 bg-[#0D0D0D] border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Built for High-Trust Digital Elections
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Engineered with multi-layered biometric verification, session isolation, and non-coercive vote privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card hover>
                <div className="p-2.5 w-fit rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4">
                  <Scan className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Biometric Verification</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Extracts 512D face vectors using InsightFace with sub-millisecond similarity matching and real-time anti-spoofing liveness guard.
                </p>
              </Card>

              <Card hover>
                <div className="p-2.5 w-fit rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Session Isolation</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Every election is logically isolated in the database via strict <code className="text-indigo-300 font-mono">UNIQUE(session_id, voter_id)</code> multi-voting lock.
                </p>
              </Card>

              <Card hover>
                <div className="p-2.5 w-fit rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30 mb-4">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Non-Coercive Ballot</h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Vote receipts include timestamp and session verification code without printing the selected candidate, preventing coerced vote-buying.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* 4-STEP HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
              <Badge variant="indigo">Voter Flow</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-white">How FaceVote Works</h2>
              <p className="text-sm text-zinc-400">Four transparent steps to complete your ballot in seconds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Register', desc: 'Create voter profile with webcam face embedding generation.' },
                { step: '02', title: 'Verify Identity', desc: 'Step up to terminal for automatic reticle scan & liveness analysis.' },
                { step: '03', title: 'Cast Vote', desc: 'Select candidate on digital ballot and review choice.' },
                { step: '04', title: 'Vote Recorded', desc: 'Receive cryptographic session receipt confirmation.' },
              ].map((s, idx) => (
                <div key={s.step} className="bg-[#0D0D0D] border border-zinc-800/80 rounded-xl p-6 relative group">
                  <div className="text-3xl font-extrabold text-indigo-500/40 mb-3 font-mono">{s.step}</div>
                  <h4 className="text-base font-semibold text-white mb-1.5">{s.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY SECTION */}
        <section id="security" className="py-20 bg-[#0D0D0D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="indigo">Platform Architecture</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Security built into every vote.
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  FaceVote does not store raw photos. Facial features are converted to non-reconstructible 512D unit vectors, providing maximum privacy compliance under GDPR standards.
                </p>

                <div className="space-y-4 pt-2">
                  {[
                    'Zero raw biometric persistence (vectors only)',
                    'Sub-millisecond FAISS cosine similarity matching',
                    'Single-use JWT vote tokens with 5-minute expiry',
                    'Real-time administrative telemetry and audit logs'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-xs font-medium text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center">
                <div className="p-8 bg-[#141414] border border-zinc-800 rounded-2xl max-w-md w-full space-y-6 text-center">
                  <SketchShield className="w-20 h-20 text-indigo-400 mx-auto" />
                  <h3 className="text-xl font-bold text-white">Ready to conduct a secure election?</h3>
                  <p className="text-xs text-zinc-400">Manage sessions, candidates, and live results from the command center.</p>
                  <Link to="/admin" className="block">
                    <Button variant="primary" size="lg" className="w-full justify-center">
                      Launch Admin Command Center
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
