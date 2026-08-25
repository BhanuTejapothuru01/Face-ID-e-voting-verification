import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Vote,
  Users,
  Activity,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  Server
} from 'lucide-react';

export function Sidebar({ onLogout }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Elections', path: '/admin/sessions', icon: Vote },
    { name: 'Voters', path: '/admin#voters', icon: Users },
    { name: 'Audit Logs', path: '/admin#audit-logs', icon: Activity },
    { name: 'System Health', path: '/admin#system-health', icon: Server },
  ];

  return (
    <aside className="w-64 bg-[#0D0D0D] border-r border-zinc-800/80 min-h-screen flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <Link to="/" className="flex items-center gap-2.5 px-3 py-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            FACE<span className="text-indigo-400">VOTE</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Command Center
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-zinc-800/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </aside>
  );
}
