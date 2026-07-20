import React from 'react';
import { ConnifyPage } from '../types';
import { Shield } from 'lucide-react';

interface NavbarProps {
  currentPage: ConnifyPage;
  setCurrentPage: (page: ConnifyPage) => void;
}

export default function Navbar({ setCurrentPage }: NavbarProps) {
  return (
    <nav id="connify-navbar" className="sticky top-0 z-50 bg-brand-surface/90 backdrop-blur-md border-b-2 border-brand-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage(ConnifyPage.ADMIN_PORTAL)}
            className="flex items-center space-x-3 cursor-pointer group"
            title="Access Firebase Admin Portal"
          >
            <div className="p-2 bg-brand-red/10 rounded border-2 border-brand-red group-hover:border-brand-red-hover transition-all duration-300">
              <Shield className="h-6 w-6 text-brand-red group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-brand-black flex items-center gap-1.5">
                CONNIFY <span className="text-[10px] bg-brand-red/10 border border-brand-red/30 px-1 py-0.5 rounded text-brand-red font-mono uppercase tracking-normal">ADMIN</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse"></span>
                <span className="font-mono text-[9px] text-brand-red font-semibold uppercase tracking-wider">Active Protocol v1.4</span>
              </div>
            </div>
          </div>

          {/* Minimalist Subtext Badge */}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-block font-mono text-[10px] text-brand-muted font-bold tracking-wider">SECURE IDENTITY PROTOCOL</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-500/20 text-[10px] font-mono font-bold uppercase">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

