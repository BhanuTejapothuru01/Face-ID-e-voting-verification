import React from 'react';
import { Card } from '../ui/Card';

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = "indigo" }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-white tracking-tight">{value !== undefined && value !== null ? value : '—'}</div>
        {subtitle && <div className="text-xs text-zinc-400 mt-1">{subtitle}</div>}
      </div>
    </Card>
  );
}
