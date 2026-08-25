import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Server, Database, Cpu, ShieldCheck } from 'lucide-react';

export function SystemHealthPanel() {
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    fetch('http://localhost:8000/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setHealthStatus('online');
        else setHealthStatus('degraded');
      })
      .catch(() => setHealthStatus('offline'));
  }, []);

  const services = [
    { name: 'FastAPI Backend Core', icon: Server, status: healthStatus === 'online' ? 'ACTIVE' : 'OFFLINE' },
    { name: 'InsightFace Biometric Engine', icon: Cpu, status: healthStatus === 'online' ? 'ACTIVE' : 'OFFLINE' },
    { name: 'FAISS Vector Index (512D)', icon: Database, status: healthStatus === 'online' ? 'ACTIVE' : 'OFFLINE' },
    { name: 'SQLite Relational Storage', icon: ShieldCheck, status: healthStatus === 'online' ? 'ACTIVE' : 'OFFLINE' },
  ];

  return (
    <Card id="system-health">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white">System Service Health</h4>
          <p className="text-xs text-zinc-400">Live operational telemetry</p>
        </div>
        <Badge variant={healthStatus === 'online' ? 'success' : 'danger'}>
          {healthStatus === 'online' ? '● System Operational' : '● Degraded / Offline'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.name} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-medium text-zinc-200">{s.name}</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                s.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-red-950 text-red-400 border border-red-800/60'
              }`}>
                {s.status}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
