import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function VoteSuccess() {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  const voterName = sessionStorage.getItem('voter_name') || 'Voter';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sessionStorage.clear();
          navigate('/vote');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-6 shadow-xl">
        
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
            SESSION COMPLETE
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Vote Recorded Successfully</h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Thank you, <strong className="text-slate-900">{voterName}</strong>. Your official ballot has been biometrically verified and securely recorded.
          </p>
        </div>

        {/* Automatic Kiosk Reset Countdown */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1 font-mono">
          <p className="text-xs text-slate-500">Resetting terminal for next voter in:</p>
          <span className="text-3xl font-black text-slate-900">{countdown}s</span>
        </div>

        <button
          onClick={() => {
            sessionStorage.clear();
            navigate('/vote');
          }}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30"
        >
          <span>Next Voter</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
