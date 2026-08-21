import React from 'react';
import { Shield, Command, LogOut, CheckCircle2, SlidersHorizontal, Users, Vote, Calendar, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardNavbar({ activeTab, setActiveTab, voterCount, onLogout }) {
  const navigate = useNavigate();

  const handleTabClick = (tabId) => {
    if (tabId === 'sessions') {
      navigate('/admin/sessions');
    } else {
      if (window.location.pathname !== '/admin') {
        navigate('/admin');
      }
      setActiveTab(tabId);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 px-6 py-3 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* SaaS App Header / Breadcrumb */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-4 h-4 text-zinc-100" />
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className="font-semibold text-white tracking-tight">FaceVote</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400 font-mono text-[11px]">Command Center</span>
            </div>
          </div>

          {/* Operational Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational</span>
          </div>
        </div>

        {/* SaaS Segmented Tab Bar */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 overflow-x-auto max-w-full">
          {[
            { id: 'overview', label: 'Overview', icon: Command },
            { id: 'sessions', label: 'Sessions', icon: Calendar },
            { id: 'voters', label: `Voters (${voterCount || 0})`, icon: Users },
            { id: 'terminal', label: 'Biometric Kiosk', icon: Vote },
            { id: 'logs', label: 'Audit Logs', icon: Activity },
            { id: 'settings', label: 'Settings', icon: SlidersHorizontal }
          ].map((tab) => {
            const isSessionsPage = window.location.pathname === '/admin/sessions' && tab.id === 'sessions';
            const isActive = activeTab === tab.id || isSessionsPage;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>admin@facevote.io</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs transition font-medium"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
