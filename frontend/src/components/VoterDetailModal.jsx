import React, { useState } from 'react';
import { X, ShieldCheck, ShieldAlert, Copy, Check, Trash2, Calendar, Fingerprint, Database } from 'lucide-react';

export default function VoterDetailModal({ voter, onClose, onToggleStatus, onDelete }) {
  const [copied, setCopied] = useState(false);

  if (!voter) return null;

  const isEligible = voter.eligibility_status === 'ELIGIBLE';

  const copyVoterId = () => {
    navigator.clipboard.writeText(voter.voter_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl text-zinc-100 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isEligible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {isEligible ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">{voter.name}</h3>
              <p className="text-xs text-zinc-400 font-mono">Voter Profile Details</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Content */}
        <div className="space-y-3 text-xs">
          
          {/* Status & ID */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg">
              <span className="text-[11px] text-zinc-500 block mb-1">Eligibility Status</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded border ${
                isEligible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}>
                {voter.eligibility_status}
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-[11px] text-zinc-500 block">Voter ID</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-zinc-200 text-xs font-semibold">{voter.voter_id}</span>
                <button onClick={copyVoterId} className="text-zinc-400 hover:text-white p-1">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Database & Vector Info */}
          <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-lg space-y-2.5 font-mono text-[11px] text-zinc-300">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-zinc-400" /> Internal UUID:
              </span>
              <span className="text-zinc-300 truncate max-w-[180px]">{voter.id || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-zinc-400" /> Vector:
              </span>
              <span className="text-emerald-400 font-semibold">InsightFace 512D</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Enrolled:
              </span>
              <span className="text-zinc-300">{voter.created_at ? new Date(voter.created_at).toLocaleDateString() : 'Recent'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onToggleStatus(voter.voter_id, voter.eligibility_status);
              onClose();
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition ${
              isEligible 
                ? 'bg-zinc-950 text-amber-400 border-zinc-800 hover:bg-zinc-800' 
                : 'bg-zinc-950 text-emerald-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            {isEligible ? 'Set Ineligible' : 'Set Eligible'}
          </button>

          <button
            onClick={() => {
              onDelete(voter.voter_id);
              onClose();
            }}
            className="p-2 bg-zinc-950 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-lg transition"
            title="Delete Voter"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
