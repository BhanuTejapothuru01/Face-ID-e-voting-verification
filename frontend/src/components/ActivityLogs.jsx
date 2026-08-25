import React from 'react';
import { Activity, Clock } from 'lucide-react';

export default function ActivityLogs({ logs = [] }) {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'REGISTRATION':
        return 'bg-zinc-800 text-zinc-200 border-zinc-700';
      case 'VERIFICATION_SUCCESS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'VERIFICATION_FAILED':
      case 'FLAGGED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'STATUS_CHANGE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-semibold text-white">System Audit Stream</h2>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded">
          LIVE FEED
        </span>
      </div>

      <div className="space-y-2.5">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No recent activity logged.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div 
              key={idx}
              className="flex items-start justify-between gap-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getBadgeStyle(log.type)}`}>
                    {log.type.replace('_', ' ')}
                  </span>
                  <span className="text-zinc-200 font-medium truncate">{log.message}</span>
                </div>
                {log.detail && (
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {log.detail}
                  </p>
                )}
              </div>

              <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap flex items-center gap-1">
                <Clock className="w-3 h-3" /> {log.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
