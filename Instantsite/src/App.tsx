import React, { useState, useRef, useEffect } from 'react';
import { ConnifyPage } from './types';
import Navbar from './components/Navbar';
import SafetyProtocolFeatures from './components/SafetyProtocolFeatures';
import UrgentSerenity from './components/UrgentSerenity';
import HowItWorks from './components/HowItWorks';
import SafetyCoordinated from './components/SafetyCoordinated';
import FeaturesGovernance from './components/FeaturesGovernance';
import DownloadApk from './components/DownloadApk';
import AdminPortal from './components/AdminPortal';
import { Shield, Lock, Radio, Github, Bell, Compass, Activity, Award, HelpCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isBackendReady, setIsBackendReady] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<ConnifyPage>(ConnifyPage.PROTOCOL_FEATURES);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[]>([]);
  const isScrollingRef = useRef<boolean>(false);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Smooth scroll handler for Navbar & Footer actions
  const handlePageChange = (page: ConnifyPage) => {
    setCurrentPage(page);
    isScrollingRef.current = true;

    const targetId = {
      [ConnifyPage.PROTOCOL_FEATURES]: 'protocol-features',
      [ConnifyPage.URGENT_SERENITY]: 'urgent-serenity',
      [ConnifyPage.HOW_IT_WORKS]: 'how-it-works',
      [ConnifyPage.SAFETY_COORDINATED]: 'safety-map',
      [ConnifyPage.GOVERNANCE]: 'governance-council',
      [ConnifyPage.DOWNLOAD_APK]: 'download-apk',
    }[page];

    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  // Wake up backend and handle splash screen
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await fetch('https://connify-backend.onrender.com/');
      } catch (e) {
        console.error("Backend wake-up notice (continuing locally):", e);
      } finally {
        setIsBackendReady(true);
      }
    };
    
    wakeUpBackend();
  }, []);

  // Scroll spy to update active navbar state during scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const sections = [
        { id: 'protocol-features', page: ConnifyPage.PROTOCOL_FEATURES },
        { id: 'urgent-serenity', page: ConnifyPage.URGENT_SERENITY },
        { id: 'how-it-works', page: ConnifyPage.HOW_IT_WORKS },
        { id: 'safety-map', page: ConnifyPage.SAFETY_COORDINATED },
        { id: 'governance-council', page: ConnifyPage.GOVERNANCE },
        { id: 'download-apk', page: ConnifyPage.DOWNLOAD_APK },
      ];

      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setCurrentPage(section.page);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global SOS Trigger
  const handleTriggerSOSGlobally = () => {
    setCurrentPage(ConnifyPage.URGENT_SERENITY);
    isScrollingRef.current = true;
    showToast("⚠️ Emergency SOS Triggered Globally", "error");
    
    const el = document.getElementById('urgent-serenity');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    
    setTimeout(() => {
      isScrollingRef.current = false;
      const btn = document.getElementById('sos-button-triggered');
      if (btn) {
        btn.click();
      }
    }, 800);
  };

  if (!isBackendReady) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-8 text-center p-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500/30 rounded-2xl animate-ping blur-lg"></div>
            <div className="relative p-6 bg-rose-500/10 rounded-2xl border border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.3)]">
              <Shield className="h-16 w-16 text-rose-500 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="font-tech font-extrabold text-4xl tracking-wider text-white uppercase">Connify Protocol</h1>
            <p className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
              <span>Initiating zero-knowledge mesh...</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-rose-500/30 selection:text-rose-200 font-sans">
      
      {/* Toast Notification Container */}
      <div className="fixed top-24 right-5 z-50 flex flex-col space-y-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto px-4 py-3 rounded-xl border font-mono text-xs font-bold shadow-2xl flex items-center space-x-2 ${
                toast.type === 'error' ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.4)]' :
                toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                toast.type === 'warning' ? 'bg-amber-500 text-[#090a0f] border-amber-300' :
                'bg-[#161926] text-white border-white/20'
              }`}
            >
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Navbar */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        onShowToast={showToast}
      />

      {/* Main Consolidated Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {currentPage === ConnifyPage.ADMIN_PORTAL ? (
            <motion.div
              key="admin-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="py-4 space-y-8"
            >
              <div className="flex items-center">
                <button
                  onClick={() => handlePageChange(ConnifyPage.PROTOCOL_FEATURES)}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white rounded-xl transition-all cursor-pointer flex items-center space-x-2"
                >
                  <span>← BACK TO PLATFORM HOME</span>
                </button>
              </div>
              <AdminPortal />
            </motion.div>
          ) : (
            <motion.div
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-32"
            >
              {/* Section 1: Features & Custom Protocol Builder */}
              <div id="protocol-features" className="scroll-mt-24">
                <SafetyProtocolFeatures />
              </div>

              {/* Section 2: Interactive Smartphone Escort Companion */}
              <div id="urgent-serenity" className="scroll-mt-28 border-t border-white/10 pt-20">
                <UrgentSerenity />
              </div>

              {/* Section 3: Telemetry & Incident Simulation System */}
              <div id="how-it-works" className="scroll-mt-28 border-t border-white/10 pt-20">
                <HowItWorks />
              </div>

              {/* Section 4: Live Coordinated Safety Mesh Map */}
              <div id="safety-map" className="scroll-mt-28 border-t border-white/10 pt-20">
                <SafetyCoordinated />
              </div>

              {/* Section 5: Decentralized Consensus & Vetting Proposals */}
              <div id="governance-council" className="scroll-mt-28 border-t border-white/10 pt-20">
                <FeaturesGovernance />
              </div>

              {/* Section 6: Official Android APK Download Center */}
              <div id="download-apk" className="scroll-mt-28 border-t border-white/10 pt-20">
                <DownloadApk />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interactive Tactical Footer */}
      <footer className="bg-[#0f111a] border-t border-white/10 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Relocated Core Controls Banner */}
          <div className="glass-card-glow border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
            <div className="space-y-1 text-center md:text-left">
              <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                PROTOCOL CONTROLS
              </span>
              <h4 className="font-display font-extrabold text-xl text-white">Emergency Dispatch & GitHub Code Hub</h4>
              <p className="font-sans text-xs text-slate-400 max-w-lg leading-relaxed">
                Access immediate geofenced peer notifications or view our self-sovereign cryptographic protocol implementation.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <a
                href="https://github.com/TheOrionGD/Team-Connify-APP"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 font-mono text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center space-x-2"
                title="View Code on GitHub"
              >
                <Github className="h-4.5 w-4.5" />
                <span>VIEW CODE ON GITHUB</span>
              </a>

              <button
                id="sos-quick-trigger-footer"
                onClick={handleTriggerSOSGlobally}
                className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all cursor-pointer flex items-center justify-center space-x-2 uppercase"
              >
                <Bell className="h-4.5 w-4.5 animate-bounce" />
                <span>TRIGGER SOS ACTIVE</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 border-b border-white/10 pb-10">
            {/* Column 1: Logo */}
            <div className="space-y-4">
              <div 
                onClick={() => handlePageChange(ConnifyPage.ADMIN_PORTAL)}
                className="flex items-center space-x-3 cursor-pointer group w-fit"
                title="Access Admin Portal"
              >
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/30 group-hover:border-rose-500 transition-all duration-300">
                  <Shield className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <span className="font-tech font-extrabold text-lg tracking-wider text-white">CONNIFY PROTOCOL</span>
                </div>
              </div>
              <p className="font-sans text-xs text-slate-400 max-w-xs leading-relaxed">
                Reimagining mutual-aid safety through cryptographic local peer meshes and client-authoritative protocol rules.
              </p>
            </div>

            {/* Column 2 & 3: Protocol Navigation Dock */}
            <div className="lg:col-span-2 space-y-4">
              <span className="block font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROTOCOL NAVIGATOR</span>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { page: ConnifyPage.PROTOCOL_FEATURES, label: 'Protocol & Features', icon: Shield },
                  { page: ConnifyPage.URGENT_SERENITY, label: 'Urgent Serenity', icon: Activity },
                  { page: ConnifyPage.HOW_IT_WORKS, label: 'Telemetry & How It Works', icon: HelpCircle },
                  { page: ConnifyPage.SAFETY_COORDINATED, label: 'Mesh Radar Map', icon: Compass },
                  { page: ConnifyPage.GOVERNANCE, label: 'Governance Council', icon: Award },
                  { page: ConnifyPage.DOWNLOAD_APK, label: 'APK Download Center', icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      id={`footer-nav-item-${item.page}`}
                      onClick={() => handlePageChange(item.page)}
                      className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-rose-600 text-white border-rose-400 font-semibold shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/10'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="font-sans text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Copyright, Audit, and Technical Badges */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-mono text-slate-400">
              <span>© {new Date().getFullYear()} CONNIFY PROTOCOL FOUNDATION.</span>
              <span>•</span>
              <span className="flex items-center text-rose-400 font-bold">
                <Lock className="h-3 w-3 mr-1" /> Audit Passed (v1.4)
              </span>
              <span>•</span>
              <span className="flex items-center text-emerald-400 font-bold">
                <Radio className="h-3 w-3 mr-1" /> ZK-Proofs Enabled
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] text-slate-400 font-bold">CLIENT-CENTRIC P2P SYSTEM</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-mono font-bold uppercase border border-rose-500/30">
                PROXIMITY SECURED
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Sticky Bottom Dock for Mobile Viewports */}
      {currentPage !== ConnifyPage.ADMIN_PORTAL && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-50 lg:hidden bg-[#090a0f]/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full px-4 py-2 flex justify-between items-center">
          {[
            { page: ConnifyPage.PROTOCOL_FEATURES, icon: Shield, label: 'Features' },
            { page: ConnifyPage.URGENT_SERENITY, icon: Activity, label: 'Companion' },
            { page: ConnifyPage.HOW_IT_WORKS, icon: HelpCircle, label: 'How It Works' },
            { page: ConnifyPage.SAFETY_COORDINATED, icon: Compass, label: 'Map' },
            { page: ConnifyPage.GOVERNANCE, icon: Award, label: 'Council' },
            { page: ConnifyPage.DOWNLOAD_APK, icon: Smartphone, label: 'Download' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handlePageChange(item.page)}
                className={`relative p-2.5 rounded-full transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                  isActive 
                    ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)] -translate-y-1' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.span 
                    layoutId="activeDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 bg-rose-400 rounded-full" 
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
