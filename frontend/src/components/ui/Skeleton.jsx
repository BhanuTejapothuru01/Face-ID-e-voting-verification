import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-zinc-800/60 rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#0D0D0D] border border-zinc-800/80 rounded-xl p-5 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-[#0D0D0D] border border-zinc-800/80 rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  );
}
