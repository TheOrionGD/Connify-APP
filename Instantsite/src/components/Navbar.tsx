import React, { useState } from 'react';
import { ConnifyPage } from '../types';
import { Shield, Volume2, VolumeX, Smartphone, Compass, Activity, Award, Download, Terminal } from 'lucide-react';

interface NavbarProps {
  currentPage: ConnifyPage;
  setCurrentPage: (page: ConnifyPage) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onShowToast?: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function Navbar({ 
  currentPage, 
  setCurrentPage, 
  soundEnabled = true, 
  onToggleSound,
  onShowToast 
}: NavbarProps) {
  const [isMuted, setIsMuted] = useState(!soundEnabled);

  const navLinks = [
    { page: ConnifyPage.PROTOCOL_FEATURES, label: 'Features', icon: Shield },
    { page: ConnifyPage.URGENT_SERENITY, label: 'Escort', icon: Activity },
    { page: ConnifyPage.HOW_IT_WORKS, label: 'Telemetry', icon: Terminal },
    { page: ConnifyPage.SAFETY_COORDINATED, label: 'Map', icon: Compass },
    { page: ConnifyPage.GOVERNANCE, label: 'Council', icon: Award },
    { page: ConnifyPage.DOWNLOAD_APK, label: 'APK', icon: Download },
  ];

  const handleAudioToggle = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (onToggleSound) onToggleSound();
    if (onShowToast) {
      onShowToast(nextState ? 'Audio alerts muted' : 'Audio alerts enabled', 'info');
    }
  };

  return (
    <nav id="connify-navbar" className="sticky top-0 z-50 bg-brand-surface/95 backdrop-blur-md border-b-2 border-brand-black shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentPage(ConnifyPage.PROTOCOL_FEATURES)}
            className="flex items-center space-x-3 cursor-pointer group"
            title="Connify Security Protocol"
          >
            <div className="relative p-2 bg-brand-red/10 rounded-lg border-2 border-brand-red group-hover:border-brand-black transition-all duration-300 shadow-[2px_2px_0px_#1b1b1b]">
              <Shield className="h-6 w-6 text-brand-red group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-red rounded-full animate-ping"></div>
            </div>
            <div>
              <span className="font-tech font-extrabold text-2xl tracking-wider text-brand-black flex items-center gap-1.5 uppercase">
                CONNIFY <span className="text-[9px] bg-brand-red text-white px-1.5 py-0.5 rounded font-mono font-bold tracking-widest border border-brand-black">p2p</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-mono text-[9px] text-brand-muted font-bold uppercase tracking-wider">PROTOCOL ACTIVE v1.4</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-brand-beige p-1.5 rounded-lg border border-brand-black/20">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`px-3 py-1.5 rounded text-xs font-bold font-sans flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-red text-white shadow-[2px_2px_0px_#1b1b1b] border border-brand-black'
                      : 'text-brand-muted hover:text-brand-black hover:bg-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Hub & Status Controls */}
          <div className="flex items-center space-x-3">
            {/* Audio Feedback Toggle Button */}
            <button
              onClick={handleAudioToggle}
              className={`p-2 rounded border-2 border-brand-black text-xs font-bold font-mono flex items-center space-x-1 transition-all cursor-pointer shadow-[2px_2px_0px_#1b1b1b] hover:translate-x-[1px] hover:translate-y-[1px] ${
                isMuted ? 'bg-amber-100 text-amber-900 border-amber-900' : 'bg-emerald-100 text-emerald-900 border-emerald-900'
              }`}
              title={isMuted ? "Audio simulation muted - Click to unmute" : "Audio simulation active - Click to mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-amber-700" /> : <Volume2 className="h-4 w-4 text-emerald-700 animate-pulse" />}
              <span className="hidden sm:inline-block text-[10px] uppercase">{isMuted ? "MUTED" : "SOUND ON"}</span>
            </button>

            {/* Admin Portal Toggle */}
            <button
              onClick={() => setCurrentPage(ConnifyPage.ADMIN_PORTAL)}
              className={`px-3.5 py-2 rounded-lg border-2 border-brand-black text-xs font-bold font-mono transition-all cursor-pointer shadow-[2px_2px_0px_#1b1b1b] hover:shadow-[1px_1px_0px_#1b1b1b] hover:translate-x-[1px] hover:translate-y-[1px] ${
                currentPage === ConnifyPage.ADMIN_PORTAL
                  ? 'bg-brand-black text-white'
                  : 'bg-white hover:bg-brand-beige text-brand-black'
              }`}
            >
              <span>{currentPage === ConnifyPage.ADMIN_PORTAL ? '← EXIT PORTAL' : 'ADMIN DASHBOARD'}</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}


