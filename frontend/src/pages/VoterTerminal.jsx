import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AutoFaceScanner from '../components/AutoFaceScanner';
import { 
  Shield, Calendar, Clock, AlertTriangle, ChevronLeft, Vote, 
  Users, SunMedium, UserX
} from 'lucide-react';

export default function VoterTerminal() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchActiveSession = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/voting/active-session');
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
    fetchActiveSession();
  }, []);

  const handleVerified = (verifiedData) => {
    sessionStorage.setItem('vote_token', verifiedData.vote_token);
    sessionStorage.setItem('voter_id', verifiedData.voter_id);
    sessionStorage.setItem('voter_name', verifiedData.name);
    navigate('/vote/ballot');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-500">Initializing voting kiosk...</p>
        </div>
      </div>
    );
  }

  const sessionStatus = sessionData?.status;
  const activeSession = sessionData?.session;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 flex flex-col items-center justify-between font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <Link to="/" className="text-slate-600 hover:text-slate-900 text-xs font-mono flex items-center transition">
          <ChevronLeft className="w-4 h-4 mr-1" /> Main Portal
        </Link>
        <span className="text-[10px] font-mono text-slate-600 uppercase bg-white border border-slate-200 px-3 py-1 rounded-full shadow-xs">
          Biometric Kiosk
        </span>
      </div>

      {/* CENTER KIOSK CONTAINER */}
      <div className="w-full max-w-5xl my-8 flex flex-col lg:flex-row items-center justify-center gap-8">
        
        {/* WELCOME SCREEN CARD (Card 1 in Mockup) */}
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center space-y-5 min-h-[520px] justify-between">
          
          <div className="w-full flex items-center gap-2 border-b border-slate-100 pb-3 text-xs">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">{activeSession?.title || 'Student Council Election 2026'}</span>
          </div>

          <div className="my-auto space-y-4">
            {/* 3D Ballot Box Graphic Container */}
            <div className="w-24 h-24 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-md shadow-indigo-500/10">
              <Vote className="w-12 h-12 text-indigo-600" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Welcome to {activeSession?.title || 'Student Council Election 2026'}</h2>
              <p className="text-xs text-indigo-600 font-semibold">Secure &bull; Transparent &bull; Reliable</p>
            </div>

            <p className="text-xs text-slate-500 italic">"Your vote shapes the future"</p>

            {/* Voting Session Active Pill */}
            <div className="bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl text-[11px] font-mono text-indigo-900 space-y-0.5">
              <div className="font-bold uppercase text-emerald-700">Voting Session Active</div>
              <div className="text-slate-600">21 Aug 2026 | 09:00 AM - 05:00 PM</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 w-full text-[10px] text-slate-400 font-mono">
            Biometric verification will start automatically
          </div>

        </div>

        {/* ACTIVE CAMERA SCANNER */}
        {sessionStatus === 'ACTIVE' && (
          <div className="w-full max-w-sm">
            <AutoFaceScanner 
              sessionTitle={activeSession?.title} 
              onVerified={handleVerified} 
            />
          </div>
        )}

      </div>

      {/* BOTTOM EXCEPTION CARDS GRID BAR (Matching bottom row in Mockup) */}
      <div className="w-full max-w-5xl pt-4 border-t border-slate-200">
        <h3 className="text-xs font-mono uppercase font-semibold text-slate-500 mb-3 text-center">
          Kiosk Terminal Diagnostics & State Reference
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-sans">
          
          {/* Card A: No Active Session */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>No Active Session</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">There is currently no active voting session.</p>
          </div>

          {/* Card B: Upcoming Session */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Upcoming Session</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Starts in 02 : 14 : 36</p>
          </div>

          {/* Card C: Session Ended */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>Session Ended</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Voting for this session has ended.</p>
          </div>

          {/* Card D: Multiple Faces */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Multiple Faces</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Please make sure only one person is visible.</p>
          </div>

          {/* Card E: Face Not Recognized */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
              <UserX className="w-3.5 h-3.5 text-red-500" />
              <span>Face Unrecognized</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">We couldn't recognize you. Please try again.</p>
          </div>

          {/* Card F: Poor Lighting */}
          <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px]">
              <SunMedium className="w-3.5 h-3.5 text-yellow-500" />
              <span>Poor Lighting</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Please improve lighting and try again.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
