import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    success: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60",
    live: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 animate-pulse",
    warning: "bg-amber-950/60 text-amber-400 border-amber-800/60",
    danger: "bg-red-950/60 text-red-400 border-red-800/60",
    indigo: "bg-indigo-950/60 text-indigo-300 border-indigo-700/60",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
