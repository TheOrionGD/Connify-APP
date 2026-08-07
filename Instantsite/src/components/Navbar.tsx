import React, { useState } from 'react';
import { ConnifyPage } from '../types';
import { Shield, Volume2, VolumeX, Smartphone, Compass, Activity, Award, Download, Terminal, Radio, Lock, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeContext';

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
  const { theme, toggleTheme } = useTheme();

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
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

          {/* Brand Logo & Live Mesh Status */}
          <div
            onClick={() => setCurrentPage(ConnifyPage.PROTOCOL_FEATURES)}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            title="Connify P2P Security Protocol"
          >
            <div className="relative p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/30 group-hover:border-rose-500 transition-all duration-300 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
              <Shield className="h-6 w-6 text-rose-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-nowrap">
                <span className="font-tech font-extrabold text-xl sm:text-2xl tracking-wider text-white uppercase whitespace-nowrap">
                  CONNIFY
                </span>
                <span className="text-[9px] sm:text-[10px] bg-rose-500/20 text-rose-400 font-mono font-bold px-1.5 py-0.5 rounded border border-rose-500/30 uppercase tracking-wider whitespace-nowrap shrink-0">
                  ZK-P2P
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5 flex-nowrap">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
                <span className="font-mono text-[9px] text-slate-400 font-semibold tracking-wide whitespace-nowrap">
                  1,284 NODES
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-emerald-400 font-mono text-[9px] hidden sm:inline whitespace-nowrap">v1.4 STABLE</span>
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
                  className={`relative px-3.5 py-2 rounded-lg text-xs font-bold font-sans flex items-center space-x-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
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

          {/* Controls Hub */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Audio Toggle — icon-only on small/medium, shows label on xl */}
            <button
              onClick={handleAudioToggle}
              className={`p-2.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                isMuted
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              }`}
              title={isMuted ? 'Audio muted — click to unmute' : 'Audio active — click to mute'}
            >
              {isMuted
                ? <VolumeX className="h-4 w-4 text-amber-400" />
                : <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
              }
              <span className="hidden xl:inline text-[10px] uppercase tracking-wider whitespace-nowrap">
                {isMuted ? 'MUTED' : 'SOUND'}
              </span>
            </button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.92 }}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
                theme === 'light'
                  ? 'bg-amber-400/20 text-amber-600 border-amber-400/50 hover:bg-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                  : 'bg-slate-700/60 text-slate-300 border-white/15 hover:bg-white/10 hover:border-white/30'
              }`}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'light'
                  ? <Sun className="h-4 w-4 text-amber-500" />
                  : <Moon className="h-4 w-4 text-slate-300" />
                }
              </motion.div>
            </motion.button>

            {/* Admin Portal */}
            <button
              onClick={() => setCurrentPage(ConnifyPage.ADMIN_PORTAL)}
              className={`px-3 sm:px-4 py-2 rounded-xl border text-xs font-bold font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                currentPage === ConnifyPage.ADMIN_PORTAL
                  ? 'bg-white text-[#090a0f] border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15 hover:border-white/30'
              }`}
            >
              <Lock className="h-3.5 w-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">
                {currentPage === ConnifyPage.ADMIN_PORTAL ? 'EXIT PORTAL' : 'ADMIN PORTAL'}
              </span>
              <span className="sm:hidden">
                {currentPage === ConnifyPage.ADMIN_PORTAL ? 'EXIT' : 'ADMIN'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
