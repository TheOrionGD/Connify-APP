import React, { useState } from 'react';
import { ConnifyPage } from '../types';
import { Shield, Volume2, VolumeX, Smartphone, Compass, Activity, Award, Download, Terminal, Radio, Lock } from 'lucide-react';
import { motion } from 'motion/react';

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
    { page: ConnifyPage.DOWNLOAD_APK, label: 'APK Center', icon: Download },
  ];

  const handleAudioToggle = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    if (onToggleSound) onToggleSound();
    if (onShowToast) {
      onShowToast(nextState ? 'Audio sirens & alerts muted' : 'Audio sirens & alerts enabled', 'info');
    }
  };

  return (
    <header id="connify-navbar" className="sticky top-0 z-50 bg-[#090a0f]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Live Mesh Status */}
          <div 
            onClick={() => setCurrentPage(ConnifyPage.PROTOCOL_FEATURES)}
            className="flex items-center space-x-3 cursor-pointer group"
            title="Connify P2P Security Protocol"
          >
            <div className="relative p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/30 group-hover:border-rose-500 transition-all duration-300 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
              <Shield className="h-6 w-6 text-rose-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-tech font-extrabold text-2xl tracking-wider text-white uppercase">
                  CONNIFY
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-400 font-mono font-bold px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-wider">
                  ZK-P2P
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="font-mono text-[10px] text-slate-400 font-semibold tracking-wide flex items-center gap-1.5">
                  <span>1,284 NODES ONLINE</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-mono">v1.4 STABLE</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#12141d] p-1.5 rounded-xl border border-white/10 shadow-inner">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-bold font-sans flex items-center space-x-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white bg-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.4)] border border-rose-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls Hub: Sound Synthesizer Toggle & Admin Portal */}
          <div className="flex items-center space-x-3">
            {/* Audio Feedback Synthesizer Toggle */}
            <button
              onClick={handleAudioToggle}
              className={`px-3 py-2 rounded-xl border text-xs font-bold font-mono flex items-center space-x-2 transition-all duration-200 cursor-pointer ${
                isMuted 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              }`}
              title={isMuted ? "Audio simulation muted - Click to unmute siren" : "Audio synthesizer active"}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-amber-400" /> : <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />}
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider">{isMuted ? "AUDIO MUTED" : "SOUND ON"}</span>
            </button>

            {/* Admin Portal Toggle */}
            <button
              onClick={() => setCurrentPage(ConnifyPage.ADMIN_PORTAL)}
              className={`px-4 py-2 rounded-xl border text-xs font-bold font-mono transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                currentPage === ConnifyPage.ADMIN_PORTAL
                  ? 'bg-white text-[#090a0f] border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15 hover:border-white/30'
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span>{currentPage === ConnifyPage.ADMIN_PORTAL ? 'EXIT PORTAL' : 'ADMIN PORTAL'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
