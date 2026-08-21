import React from 'react';
import { Check, ShieldAlert, AlertCircle, Clock, Vote } from 'lucide-react';

export default function ResultCard({ result, onReset }) {
  if (!result) return null;

  const data = result.data || {};
  const eligibility = data.eligibility || 'NOT VERIFIED';

  let borderColor = 'border-zinc-800';
  let title = 'NOT RECOGNIZED';
  let titleColor = 'text-zinc-400';
  let Icon = AlertCircle;

  if (eligibility === 'VOTE_CAST_SUCCESS' || eligibility === 'ELIGIBLE') {
    borderColor = 'border-emerald-500/40';
    title = 'BALLOT CAST & VERIFIED';
    titleColor = 'text-emerald-400';
    Icon = Check;
  } else if (eligibility === 'ALREADY_VOTED') {
    borderColor = 'border-amber-500/40';
    title = 'ALREADY VOTED';
    titleColor = 'text-amber-400';
    Icon = Vote;
  } else if (eligibility === 'NOT ELIGIBLE') {
    borderColor = 'border-red-500/40';
    title = 'NOT ELIGIBLE TO VOTE';
    titleColor = 'text-red-400';
    Icon = ShieldAlert;
  }

  return (
    <div className={`w-full max-w-md border ${borderColor} bg-zinc-900/90 rounded-xl p-6 shadow-lg flex flex-col items-center text-center space-y-4`}>
      
      {/* Icon Badge */}
      <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
        <Icon className={`w-6 h-6 ${titleColor}`} />
      </div>

      {/* Main Status Header */}
      <div className="space-y-1">
        <h2 className={`text-base font-semibold tracking-wide ${titleColor}`}>
          {title}
        </h2>
        {data.message && (
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {data.message}
          </p>
        )}
      </div>

      {/* Voter Profile Details Box */}
      {data.voter_id && (
        <div className="w-full text-left bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2 font-mono text-xs text-zinc-300">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-zinc-500">Legal Name</span>
            <span className="font-semibold text-white">{data.name}</span>
          </div>

          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-zinc-500">Voter ID</span>
            <span className="font-semibold text-zinc-200">{data.voter_id}</span>
          </div>

          {data.voted_at && (
            <div className="flex justify-between items-center text-amber-400 pt-1">
              <span className="text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Recorded At
              </span>
              <span>{new Date(data.voted_at).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Biometric Confidence Stats */}
      {data.similarity !== undefined && data.similarity > 0 && (
        <div className="text-[11px] text-zinc-500 font-mono flex items-center justify-between w-full pt-2 border-t border-zinc-800/80">
          <span>Match: {(data.similarity * 100).toFixed(1)}%</span>
          <span>Latency: {data.processing_time_ms}ms</span>
        </div>
      )}

      <button 
        onClick={onReset} 
        className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-white font-medium rounded-lg text-xs transition"
      >
        Scan Next Voter
      </button>
    </div>
  );
}
