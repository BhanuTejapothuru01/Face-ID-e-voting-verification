import React from 'react';

export function SketchShield({ className = "w-12 h-12 text-indigo-500" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M50 12 C65 18, 80 15, 85 25 C88 45, 82 72, 50 90 C18 72, 12 45, 15 25 C20 15, 35 18, 50 12 Z"
        className="animate-sketch-in"
      />
      <path
        d="M35 48 L46 59 L66 37"
        className="animate-sketch-in"
        strokeWidth="4"
      />
    </svg>
  );
}

export function SketchCheckmark({ className = "w-16 h-16 text-emerald-500" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="50" cy="50" r="40" strokeWidth="3" strokeDasharray="6 4" className="opacity-40" />
      <path
        d="M28 52 L44 68 L74 34"
        className="animate-sketch-in"
      />
    </svg>
  );
}

export function SketchUnderline({ className = "w-32 h-4 text-indigo-500" }) {
  return (
    <svg viewBox="0 0 200 20" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M5 12 C50 4, 110 18, 195 8" className="animate-sketch-in" />
    </svg>
  );
}

export function SketchEmptyBox({ className = "w-20 h-20 text-zinc-600" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="20" y="25" width="60" height="55" rx="6" strokeDasharray="5 3" />
      <path d="M35 25 L35 15 C35 12, 65 12, 65 15 L65 25" />
      <circle cx="50" cy="52" r="8" strokeDasharray="3 2" />
      <path d="M50 60 L50 68" />
    </svg>
  );
}

export function SketchFaceFrame({ className = "w-48 h-48 text-indigo-400" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {/* Corner indicators */}
      <path d="M 20 50 L 20 20 L 50 20" strokeWidth="3" />
      <path d="M 150 20 L 180 20 L 180 50" strokeWidth="3" />
      <path d="M 180 150 L 180 180 L 150 180" strokeWidth="3" />
      <path d="M 50 180 L 20 180 L 20 150" strokeWidth="3" />
      
      {/* Doodled face outline */}
      <path d="M 60 70 Q 100 50 140 70 Q 155 110 140 145 Q 100 175 60 145 Q 45 110 60 70 Z" strokeDasharray="4 3" opacity="0.6" />
      <circle cx="80" cy="95" r="4" fill="currentColor" />
      <circle cx="120" cy="95" r="4" fill="currentColor" />
      <path d="M 85 130 Q 100 142 115 130" strokeWidth="2.5" />
    </svg>
  );
}
