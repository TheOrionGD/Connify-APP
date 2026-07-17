'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Network, Key, Cpu } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progressWidth, setProgressWidth] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing SHARP Proximity Handshake Protocol...');

  useEffect(() => {
    // 4.5 seconds total loading time
    const duration = 4500;
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgressWidth((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    const messages = [
      'Initializing SHARP Proximity Handshake Protocol...',
      'Minting Ephemeral UUIDv4 Episode ID...',
      'Capturing Environmental Signal Tag Bloom Filters...',
      'Executing BCH Syndrome Key Reconstruction...',
      'Verifying Blinded Grid Cell Index...',
      'Validating Ed25519 JIT Trust Capsule Lock...',
      'SHARP Proximity Grid Ready.'
    ];

    let msgIndex = 0;
    const messageInterval = setInterval(() => {
      if (msgIndex < messages.length - 1) {
        msgIndex++;
        setLoadingText(messages[msgIndex]);
      } else {
        clearInterval(messageInterval);
      }
    }, 700);

    return () => {
      clearInterval(timer);
      clearInterval(messageInterval);
    };
  }, []);

  useEffect(() => {
    if (progressWidth >= 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500); // Small pause at 100% for user satisfaction
      return () => clearTimeout(timeout);
    }
  }, [progressWidth, onComplete]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#05070c] font-sans text-white relative select-none overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shield-pulse {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        .fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
      `}} />

      {/* Background Atmospheric Effect & Grid */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#b60100]/10 blur-[150px]"></div>
        <div className="absolute inset-0 grid-bg-dots-dark opacity-40"></div>
      </div>

      {/* Splash Content Canvas (Holomorphism HUD Box & Glassmorphism Panel) */}
      <main className="relative w-full max-w-[540px] flex flex-col items-center justify-center px-6 z-10">
        
        <div className="holo-card glass-panel w-full p-8 md:p-10 rounded-3xl flex flex-col items-center relative overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)] border border-cyan-500/30 fade-in-up">
          {/* Holo HUD Corners */}
          <div className="holo-corner top-0 left-0 border-t-2 border-l-2 border-cyan-400" />
          <div className="holo-corner top-0 right-0 border-t-2 border-r-2 border-cyan-400" />
          <div className="holo-corner bottom-0 left-0 border-b-2 border-l-2 border-cyan-400" />
          <div className="holo-corner bottom-0 right-0 border-b-2 border-r-2 border-cyan-400" />

          {/* Top Sci-Fi Header Tag */}
          <div className="absolute top-3 left-6 right-6 flex items-center justify-between font-mono text-[9px] text-cyan-400 uppercase tracking-widest border-b border-cyan-500/20 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              SHARP PROTOCOL BOOT SEQUENCE
            </span>
            <span className="holo-badge px-2 py-0.5 rounded">ZERO-TRUST PROTOCOL</span>
          </div>

          {/* Logo Branding Section */}
          <div className="flex flex-col items-center my-8">
            {/* Shield Logo Asset */}
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-cyan-500/20 rounded-full shield-pulse blur-md"></div>
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-slate-900 to-[#0b101d] rounded-2xl flex items-center justify-center border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)] relative z-10">
                <Shield className="text-cyan-400 h-12 w-12 md:h-14 md:w-14 animate-pulse drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" />
              </div>
            </div>
            
            {/* Brand Name */}
            <h1 className="font-jakarta text-4xl md:text-5xl font-extrabold text-white tracking-tight uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Connify
            </h1>
            <p className="font-mono text-xs text-cyan-300 mt-2 tracking-[0.3em] uppercase font-bold">
              SHARP VERIFIED SAFETY GRID
            </p>
          </div>

          {/* Progress Interaction Layer */}
          <div className="w-full flex flex-col items-center mt-2">
            {/* Loading Message */}
            <div className="flex items-center justify-between w-full mb-3 px-1 font-mono text-xs">
              <span className="text-cyan-400 uppercase tracking-wider flex items-center gap-2 truncate pr-2">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0"></span>
                <span className="truncate">{loadingText}</span>
              </span>
              <span className="text-emerald-400 font-bold flex-shrink-0">{Math.round(progressWidth)}%</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30 p-0.5 shadow-inner relative">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300 rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all duration-75 relative" 
                style={{ width: `${progressWidth}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            {/* Contextual Verification Badges (Glass Pills & Holo Badges) */}
            <div className="mt-8 grid grid-cols-3 gap-2.5 w-full font-mono text-[9px]">
              <div className="glass-pill p-2 rounded-lg flex items-center justify-center gap-1.5 text-cyan-300 border border-cyan-500/30">
                <Key className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">ED25519 CAPSULES</span>
              </div>
              <div className="glass-pill p-2 rounded-lg flex items-center justify-center gap-1.5 text-amber-400 border border-amber-500/30">
                <Cpu className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">BCH SYNDROMES</span>
              </div>
              <div className="glass-pill p-2 rounded-lg flex items-center justify-center gap-1.5 text-emerald-400 border border-emerald-500/30">
                <Network className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">SHARP HANDSHAKE</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Identity Anchor */}
      <footer className="absolute bottom-6 w-full px-6 flex flex-col items-center gap-2 z-10 font-mono">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-wider">
          © 2026 Connify. Single-Use Trust Relationships via SHARP Protocol.
        </p>
        <div className="flex gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </footer>
    </div>
  );
}
