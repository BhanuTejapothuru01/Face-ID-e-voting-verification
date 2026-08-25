import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-zinc-800/80 py-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white tracking-tight">FACEVOTE</div>
              <div className="text-zinc-400">Secure voting. Verified by you.</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Session Isolated
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Biometric Identity Guard
            </span>
          </div>

          <div className="text-zinc-400 text-right">
            © {new Date().getFullYear()} FaceVote Platform. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
