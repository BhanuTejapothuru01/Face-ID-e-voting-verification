import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export function VerificationProgress({ currentStep = 1, totalSteps = 3, statusText = "" }) {
  const steps = [
    { title: 'Camera Init', id: 1 },
    { title: 'Liveness Check', id: 2 },
    { title: 'Face Vector Match', id: 3 },
  ];

  return (
    <div className="w-full space-y-3 bg-[#0D0D0D] border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-200">Verification State</span>
        <span>{currentStep} / {totalSteps}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {steps.map((s) => {
          const isDone = s.id < currentStep;
          const isCurrent = s.id === currentStep;

          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-indigo-200 animate-pulse'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              )}
              <span className="truncate">{s.title}</span>
            </div>
          );
        })}
      </div>

      {statusText && (
        <div className="text-xs text-center text-zinc-300 pt-1 font-mono" aria-live="polite">
          {statusText}
        </div>
      )}
    </div>
  );
}
