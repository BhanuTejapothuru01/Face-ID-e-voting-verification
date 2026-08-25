import React from 'react';
import { CheckCircle2, User } from 'lucide-react';

export function CandidateCard({ candidate, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl p-5 border transition-all duration-200 select-none ${
        isSelected
          ? 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500'
          : 'bg-[#0D0D0D] border-zinc-800 hover:border-zinc-700 hover:bg-[#141414]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Candidate Avatar */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center border shrink-0 ${
          isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
        }`}>
          <User className="w-7 h-7" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-white truncate">{candidate.name}</h4>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
              isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-900'
            }`}>
              {isSelected && <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <p className="text-xs text-indigo-400 font-medium mt-0.5">{candidate.party_or_position}</p>
          {candidate.description && (
            <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{candidate.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
