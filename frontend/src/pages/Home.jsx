import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Vote, LayoutDashboard, ArrowRight, Sparkles, Scan, Lock, 
  Users, CheckCircle2, PieChart, ShieldCheck, Cpu, Database, Eye,
  Sun, Moon, Menu, X
} from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState({
    activeElections: 2,
    registeredVoters: 12458,
    votesCastToday: 3247,
    turnout: 68.4
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Attempt to fetch real database statistics if backend is accessible
    const loadRealStats = async () => {
      try {
        const [votersRes, sessionsRes] = await Promise.all([
          fetch('http://localhost:8000/api/voters').catch(() => null),
          fetch('http://localhost:8000/api/admin/sessions').catch(() => null)
        ]);

        let registered = 12458;
        let votes = 3247;
        let active = 2;

        if (votersRes && votersRes.ok) {
          const vData = await votersRes.json();
          if (vData.voters && vData.voters.length > 0) {
            registered = vData.voters.length;
            votes = vData.voters.filter(v => v.has_voted === 1).length;
          }
        }

        if (sessionsRes && sessionsRes.ok) {
          const sData = await sessionsRes.json();
          if (sData.sessions && sData.sessions.length > 0) {
            active = sData.sessions.filter(s => s.status === 'ACTIVE').length || 1;
          }
        }

        const turnoutVal = registered > 0 ? ((votes / registered) * 100).toFixed(1) : 68.4;
        setStats({
          activeElections: active,
          registeredVoters: registered,
          votesCastToday: votes,
          turnout: parseFloat(turnoutVal)
        });
      } catch (e) {
        // Fallback to default demo stats matching exact prompt
      }
    };

    loadRealStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#070B1F] text-white font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* HEADER NAVBAR */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-indigo-950/40 relative z-20">
        
        {/* Left Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/40 group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 fill-white/20" />
          </div>
          <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            FaceVote Engine
          </span>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <Link to="/" className="text-white font-semibold relative py-1">
            Home
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/50" />
          </Link>
          <Link to="/vote" className="hover:text-white transition-colors">Voter</Link>
          <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition">
            <Sun className="w-4 h-4" />
          </button>
          <Link
            to="/admin"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#0D1127] border-b border-indigo-900/50 p-5 space-y-3 flex flex-col md:hidden text-sm font-medium z-30 shadow-2xl">
            <Link to="/" className="text-indigo-400 font-bold" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/vote" className="text-slate-300" onClick={() => setMobileMenuOpen(false)}>Voter Kiosk</Link>
            <Link to="/admin" className="text-slate-300" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
            <a href="#security" className="text-slate-300" onClick={() => setMobileMenuOpen(false)}>Security</a>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-6 pt-8 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        {/* HERO LEFT COLUMN (Text & Primary Action Cards) */}
        <div className="lg:col-span-7 space-y-7">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-[11px] font-mono text-indigo-300 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>FaceVote Engine v2.0</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Secure. Smart. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-400">
              Transparent Elections.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Hands-free biometric face lock, duplicate-vote prevention, and real-time election telemetry powered by InsightFace 512D embeddings & FAISS vector search.
          </p>

          {/* Feature Pills (4) */}
          <div id="features" className="flex flex-wrap gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-500/25 text-xs text-slate-200 font-medium hover:-translate-y-0.5 transition-transform cursor-default">
              <Scan className="w-3.5 h-3.5 text-indigo-400" />
              <span>Face Lock</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-500/25 text-xs text-slate-200 font-medium hover:-translate-y-0.5 transition-transform cursor-default">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Anti-Spoofing</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-500/25 text-xs text-slate-200 font-medium hover:-translate-y-0.5 transition-transform cursor-default">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>One Person - One Vote</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-500/25 text-xs text-slate-200 font-medium hover:-translate-y-0.5 transition-transform cursor-default">
              <PieChart className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-time Analytics</span>
            </div>
          </div>

          {/* PRIMARY ACTION CARDS (Horizontal Layout matching mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            
            {/* Card 1: Purple Kiosk Card */}
            <Link
              to="/vote"
              className="group relative bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl p-5 shadow-xl shadow-indigo-600/30 border border-indigo-400/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                  <Scan className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/20">
                  HANDS-FREE
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Open Voter Kiosk (/vote)
                  </h2>
                  <div className="w-7 h-7 rounded-full bg-white text-indigo-700 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-indigo-100/90 leading-normal">
                  Automatic facial recognition & candidate ballot
                </p>
              </div>
            </Link>

            {/* Card 2: White Executive Admin Card */}
            <Link
              to="/admin"
              className="group bg-white hover:bg-slate-50 text-slate-900 rounded-2xl p-5 shadow-xl border border-slate-200 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <LayoutDashboard className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    Executive Admin Dashboard
                  </h2>
                  <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-normal">
                  Live turnout analytics, voter registry & audit feed
                </p>
              </div>
            </Link>

          </div>

        </div>

        {/* HERO RIGHT COLUMN (Biometric Face Visualization pedestal) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-b from-indigo-950/40 to-[#070B1F] border border-indigo-500/30 p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md overflow-hidden">
            
            {/* Glowing Corner Reticle Brackets */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-400" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-400" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-400" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-400" />

            {/* Scanning Vertical Line Beam */}
            <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_#818cf8] animate-[pulse_2s_infinite] top-1/3" />

            {/* 3D Wireframe Face SVG Visualization */}
            <div className="relative w-44 h-48 my-auto flex items-center justify-center">
              
              {/* Outer Glowing Ring Base */}
              <div className="absolute -bottom-4 w-40 h-10 rounded-full border border-indigo-400/40 bg-indigo-600/10 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse" />
              
              <svg viewBox="0 0 200 240" className="w-full h-full text-indigo-400 drop-shadow-[0_0_12px_rgba(129,140,248,0.7)]">
                {/* Abstract Wireframe Head Contour */}
                <path d="M100 20 C145 20, 170 55, 170 110 C170 170, 140 210, 100 220 C60 210, 30 170, 30 110 C30 55, 55 20, 100 20 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                
                {/* Horizontal Mesh Grid Lines */}
                <path d="M40 70 Q100 90 160 70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                <path d="M35 110 Q100 130 165 110" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
                <path d="M45 150 Q100 170 155 150" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                <path d="M60 185 Q100 200 140 185" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />

                {/* Vertical Facial Axis Lines */}
                <path d="M100 20 V220" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                <path d="M75 35 Q90 110 80 200" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <path d="M125 35 Q110 110 120 200" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />

                {/* Facial Landmark Nodes */}
                <circle cx="75" cy="95" r="3.5" fill="#818cf8" />
                <circle cx="125" cy="95" r="3.5" fill="#818cf8" />
                <circle cx="100" cy="125" r="3.5" fill="#c084fc" />
                <circle cx="80" cy="160" r="3" fill="#818cf8" />
                <circle cx="120" cy="160" r="3" fill="#818cf8" />
                <circle cx="100" cy="170" r="3.5" fill="#c084fc" />

                {/* Triangular Biometric Vectors */}
                <polygon points="75,95 125,95 100,125" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
                <polygon points="75,95 100,125 80,160" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
                <polygon points="125,95 100,125 120,160" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
                <polygon points="80,160 120,160 100,170" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.7" />
              </svg>
            </div>

            {/* Glowing Pedestal Ring Platform */}
            <div className="w-full flex flex-col items-center pt-2">
              <div className="w-48 h-8 rounded-full border border-indigo-400/30 bg-gradient-to-t from-indigo-600/30 to-transparent flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <span className="text-[11px] font-mono font-bold text-indigo-200 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  FACE LOCK READY
                </span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* STATISTICS SECTION (Clean White Background Panel matching mockup) */}
      <section className="w-full bg-[#F8FAFC] text-slate-900 py-12 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat Card 1: Active Elections */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Vote className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Active Elections</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.activeElections}</span>
                <p className="text-[11px] text-slate-400 mt-1">View current & upcoming elections</p>
              </div>
            </div>

            {/* Stat Card 2: Registered Voters */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Registered Voters</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.registeredVoters.toLocaleString()}</span>
                <p className="text-[11px] text-slate-400 mt-1">Total verified voters in the system</p>
              </div>
            </div>

            {/* Stat Card 3: Votes Cast Today */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Votes Cast (Today)</span>
                <span className="text-3xl font-black text-indigo-600 tracking-tight">{stats.votesCastToday.toLocaleString()}</span>
                <p className="text-[11px] text-slate-400 mt-1">Real-time votes counted across all elections</p>
              </div>
            </div>

            {/* Stat Card 4: Turnout */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:-translate-y-1 transition-transform flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <PieChart className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Turnout</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">{stats.turnout}%</span>
                <p className="text-[11px] text-slate-400 mt-1">Overall voter participation across elections</p>
              </div>
            </div>

          </div>

          {/* SECURITY & PROMISE SECTION (Dark Card strip matching mockup) */}
          <div id="security" className="bg-[#0D1230] border border-indigo-900/60 rounded-2xl p-5 text-white shadow-xl grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            
            {/* Our Promise Title */}
            <div className="flex items-center gap-3 md:border-r border-indigo-900/60 pr-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Our Promise</h3>
                <p className="text-[10px] text-indigo-300 font-mono">Secure &bull; Transparent &bull; Reliable</p>
              </div>
            </div>

            {/* Feature 1 */}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Security First
              </h4>
              <p className="text-[11px] text-slate-400">End-to-end encryption & biometric verification</p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> No Duplicate Voting
              </h4>
              <p className="text-[11px] text-slate-400">One person can vote only once per session</p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-400" /> Real-time Transparency
              </h4>
              <p className="text-[11px] text-slate-400">Live tracking & immutable audit logs</p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Privacy Protected
              </h4>
              <p className="text-[11px] text-slate-400">Your data is safe, encrypted & private</p>
            </div>

          </div>

          {/* TECHNOLOGY SECTION (Bottom Strip matching mockup) */}
          <div className="bg-[#070B1F] border border-indigo-950 rounded-2xl p-5 text-white grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">FaceVote Engine v2.0</h4>
                <p className="text-[10px] text-slate-400">Building trust in every vote.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Powered by</span>
                <span className="font-semibold text-white">InsightFace 512D</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Vector Search</span>
                <span className="font-semibold text-white">FAISS (Facebook AI)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Secure & Compliant</span>
                <span className="font-semibold text-white">Designed for election integrity</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="w-full bg-[#050817] border-t border-indigo-950 py-6 px-6 text-center text-slate-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 FaceVote Engine. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link to="/vote" className="hover:text-slate-300 transition-colors">Voter Kiosk</Link>
            <Link to="/admin" className="hover:text-slate-300 transition-colors">Admin Dashboard</Link>
            <a href="#security" className="hover:text-slate-300 transition-colors">Security</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
