import React from 'react';
import { Card } from '../ui/Card';

export function TurnoutChart({ totalVoters = 0, votesCast = 0 }) {
  const turnoutPercent = totalVoters > 0 ? Math.min(100, Math.round((votesCast / totalVoters) * 100)) : 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">Turnout Telemetry</h4>
          <p className="text-xs text-zinc-400">Live participation metric</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-indigo-400">{turnoutPercent}%</span>
          <span className="text-xs text-zinc-400 block">participation rate</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${turnoutPercent}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-800/80 text-xs">
        <div>
          <span className="text-zinc-400 block">Votes Cast</span>
          <span className="text-sm font-semibold text-white">{votesCast}</span>
        </div>
        <div>
          <span className="text-zinc-400 block">Registered Voters</span>
          <span className="text-sm font-semibold text-white">{totalVoters}</span>
        </div>
      </div>
    </Card>
  );
}
