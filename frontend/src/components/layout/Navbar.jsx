import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Elections', path: '/#elections' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Security', path: '/#security' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 group-hover:border-indigo-400 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              FACE<span className="text-indigo-400">VOTE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/register">
              <Button variant="outline" size="sm" icon={UserCheck}>
                Register Voter
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Admin Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0D0D0D] px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-zinc-300 hover:text-white"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 border-t border-zinc-800/80 flex flex-col gap-2">
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="md" className="w-full justify-center">
                Register Voter
              </Button>
            </Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
