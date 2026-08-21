import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Vote, Users, UserCheck, 
  BarChart3, FileText, Settings, Activity, LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'sessions', label: 'Voting Sessions', icon: Vote, path: '/admin/sessions' },
    { id: 'candidates', label: 'Candidates', icon: Users, path: '/admin/sessions' },
    { id: 'voters', label: 'Voters', icon: UserCheck, path: '/admin' },
    { id: 'votes', label: 'Votes', icon: FileText, path: '/admin' },
    { id: 'results', label: 'Results', icon: BarChart3, path: '/admin/sessions' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin' },
    { id: 'logs', label: 'Activity Logs', icon: Activity, path: '/admin' },
  ];

  const handleNavClick = (item) => {
    if (location.pathname !== item.path) {
      navigate(item.path);
    }
    if (setActiveTab) {
      if (item.id === 'sessions' || item.id === 'candidates' || item.id === 'results') {
        setActiveTab('sessions');
      } else if (item.id === 'voters') {
        setActiveTab('voters');
      } else if (item.id === 'logs') {
        setActiveTab('logs');
      } else if (item.id === 'settings') {
        setActiveTab('settings');
      } else {
        setActiveTab('overview');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0 font-sans shadow-xs">
      
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
            <Shield className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
              FaceVote
            </h1>
            <p className="text-[10px] font-mono tracking-wider uppercase text-slate-500">
              E-Voting System
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSessionsPath = location.pathname === '/admin/sessions' && (item.id === 'sessions' || item.id === 'candidates' || item.id === 'results');
            const isDashboardPath = location.pathname === '/admin' && (
              (activeTab === 'overview' && item.id === 'dashboard') ||
              (activeTab === 'voters' && item.id === 'voters') ||
              (activeTab === 'logs' && item.id === 'logs') ||
              (activeTab === 'settings' && item.id === 'settings')
            );
            const isActive = isSessionsPath || isDashboardPath || (activeTab === item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Admin</span>
              <span className="text-[10px] text-slate-500 block">Super Administrator</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-200 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
}
