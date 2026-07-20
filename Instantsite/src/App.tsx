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
  const isScrollingRef = useRef<boolean>(false);

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

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }

    // Release scroll tracking lock after animation finishes
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
        console.error("Backend wake-up error (continuing anyway):", e);
      } finally {
        setIsBackendReady(true);
      }
    };
    
    wakeUpBackend();
  }, []);

  // Scroll spy to automatically update active navbar state during scrolling
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

  // Global SOS Handler
  const handleTriggerSOSGlobally = () => {
    setCurrentPage(ConnifyPage.URGENT_SERENITY);
    isScrollingRef.current = true;
    
    // Smooth scroll down to the smartphone mockup section
    const el = document.getElementById('urgent-serenity');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    
    setTimeout(() => {
      isScrollingRef.current = false;
      
      // We trigger the SOS button programmatically inside the smartphone mockup!
      const btn = document.getElementById('sos-button-triggered');
      if (btn) {
        btn.click();
      }
    }, 800);
  };

  if (!isBackendReady) {
    return (
      <div className="min-h-screen bg-brand-surface text-brand-black flex flex-col items-center justify-center font-sans selection:bg-brand-red/15">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-brand-red/30 rounded-xl animate-ping blur-md"></div>
            <div className="relative p-5 bg-brand-red/10 rounded-xl border-2 border-brand-red shadow-[6px_6px_0px_#1b1b1b]">
              <Shield className="h-16 w-16 text-brand-red" />
            </div>
          </div>
          
          <div className="space-y-3 text-center">
            <h1 className="font-display font-extrabold text-4xl tracking-tight text-brand-black uppercase">Connify Protocol</h1>
            <p className="font-mono text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center justify-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 bg-brand-red rounded-full animate-pulse"></span>
              <span>Initiating secure backend...</span>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige text-brand-black flex flex-col justify-between selection:bg-brand-red/15 selection:text-brand-red font-sans">
      
      {/* Top Navbar */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange} 
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
                  className="px-5 py-2.5 bg-white hover:bg-brand-beige border-2 border-brand-black text-xs font-bold font-sans rounded shadow-[3px_3px_0px_#1b1b1b] hover:shadow-[1px_1px_0px_#1b1b1b] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center space-x-2"
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
              <div id="urgent-serenity" className="scroll-mt-28 border-t-2 border-brand-black/10 pt-20">
                <UrgentSerenity />
              </div>

              {/* Section 3: Telemetry & Incident Simulation System */}
              <div id="how-it-works" className="scroll-mt-28 border-t-2 border-brand-black/10 pt-20">
                <HowItWorks />
              </div>

              {/* Section 4: Live Coordinated Safety Mesh Map */}
              <div id="safety-map" className="scroll-mt-28 border-t-2 border-brand-black/10 pt-20">
                <SafetyCoordinated />
              </div>

              {/* Section 5: Decentralized Consensus & Vetting Proposals */}
              <div id="governance-council" className="scroll-mt-28 border-t-2 border-brand-black/10 pt-20">
                <FeaturesGovernance />
              </div>

              {/* Section 6: Official Opera-style Android APK Download Center */}
              <div id="download-apk" className="scroll-mt-28 border-t-2 border-brand-black/10 pt-20">
                <DownloadApk />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Interactive Footer & Action Hub */}
      <footer className="bg-brand-surface border-t-2 border-brand-black mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Relocated Core Emergency & Dev Actions */}
          <div className="bg-brand-beige border-2 border-brand-black rounded-xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[4px_4px_0px_#1b1b1b]">
            <div className="space-y-1 text-center md:text-left">
              <span className="font-mono text-[9px] font-bold text-brand-red uppercase tracking-widest bg-brand-red/5 px-2 py-0.5 rounded border border-brand-red/20">RELOCATED SYSTEM CONTROLS</span>
              <h4 className="font-display font-extrabold text-xl text-brand-black">Emergency Dispatch & Codebase Hub</h4>
              <p className="font-sans text-xs text-brand-muted max-w-lg leading-relaxed font-medium">
                Access immediate geofenced peer notifications or view our self-sovereign cryptographic protocol implementation.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <a
                href="https://github.com/TheOrionGD/Team-Connify-APP"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-brand-beige text-brand-black rounded border-2 border-brand-black shadow-[3px_3px_0px_#1b1b1b] hover:shadow-[1px_1px_0px_#1b1b1b] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center space-x-2"
                title="View on GitHub"
              >
                <Github className="h-4.5 w-4.5" />
                <span className="font-mono text-xs font-bold uppercase">VIEW CODE ON GITHUB</span>
              </a>

              <button
                id="sos-quick-trigger-footer"
                onClick={handleTriggerSOSGlobally}
                className="w-full sm:w-auto px-6 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-sm rounded border-2 border-brand-black shadow-[4px_4px_0px_#1b1b1b] hover:shadow-[1px_1px_0px_#1b1b1b] hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <Bell className="h-4.5 w-4.5 animate-bounce" />
                <span className="uppercase tracking-wider">TRIGGER SOS ACTIVE</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10 border-b border-brand-black/10 pb-10">
            {/* Column 1: Logo and Tagline */}
            <div className="space-y-4">
              <div 
                onClick={() => handlePageChange(ConnifyPage.ADMIN_PORTAL)}
                className="flex items-center space-x-3 cursor-pointer group w-fit"
                title="Access Firebase Admin Portal"
              >
                <div className="p-2 bg-brand-red/10 rounded border border-brand-red group-hover:border-brand-red-hover transition-all duration-300">
                  <Shield className="h-5 w-5 text-brand-red" />
                </div>
                <div>
                  <span className="font-display font-bold text-lg tracking-tight text-brand-black">CONNIFY PROTOCOL</span>
                </div>
              </div>
              <p className="font-sans text-xs text-brand-muted max-w-xs leading-relaxed font-medium">
                Reimagining mutual-aid safety through cryptographic local peer meshes and client-authoritative protocol rules.
              </p>
            </div>

            {/* Column 2 & 3: Relocated Nav Items styled as Premium Navigation Dock */}
            <div className="lg:col-span-2 space-y-4">
              <span className="block font-mono text-[10px] font-bold text-brand-muted uppercase tracking-wider">PROTOCOL NAVIGATOR</span>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { page: ConnifyPage.PROTOCOL_FEATURES, label: 'Protocol & Features', icon: Shield },
                  { page: ConnifyPage.URGENT_SERENITY, label: 'Urgent Serenity', icon: Activity },
                  { page: ConnifyPage.HOW_IT_WORKS, label: 'How It Works', icon: HelpCircle },
                  { page: ConnifyPage.SAFETY_COORDINATED, label: 'Safety Map', icon: Compass },
                  { page: ConnifyPage.GOVERNANCE, label: 'Governance Council', icon: Award },
                  { page: ConnifyPage.DOWNLOAD_APK, label: 'Download APK', icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.page}
                      id={`footer-nav-item-${item.page}`}
                      onClick={() => handlePageChange(item.page)}
                      className={`flex items-center space-x-2.5 p-3 rounded border-2 text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-brand-red text-white border-brand-black shadow-[3px_3px_0px_rgba(27,27,27,1)] font-semibold'
                          : 'bg-white text-brand-muted hover:text-brand-black hover:bg-brand-beige border-brand-black/10'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-brand-muted group-hover:text-brand-black'}`} />
                      <span className="font-sans text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Copyright, Audit, and Technical Badges */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] font-mono text-brand-muted">
              <span>© {new Date().getFullYear()} CONNIFY PROTOCOL FOUNDATION.</span>
              <span>•</span>
              <span className="flex items-center text-brand-red font-bold">
                <Lock className="h-3 w-3 mr-1" /> Audit Passed (v1.4)
              </span>
              <span>•</span>
              <span className="flex items-center text-brand-muted font-bold">
                <Radio className="h-3 w-3 mr-1" /> ZK-Proofs Enabled
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] text-brand-muted font-bold">CLIENT-CENTRIC P2P SYSTEM</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-red/10 text-brand-red text-[8px] font-mono font-bold uppercase border border-brand-red/20">
                PROXIMITY SECURED
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Sticky Bottom Dock for Mobile Viewports */}
      {currentPage !== ConnifyPage.ADMIN_PORTAL && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-50 lg:hidden bg-brand-surface/90 backdrop-blur-md border-2 border-brand-black shadow-[4px_4px_0px_#1b1b1b] rounded-full px-4 py-2 flex justify-between items-center">
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
                    ? 'bg-brand-red text-white border-2 border-brand-black shadow-[2px_2px_0px_#1b1b1b] -translate-y-1' 
                    : 'text-brand-muted hover:text-brand-black hover:bg-brand-beige'
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.span 
                    layoutId="activeDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 bg-brand-black rounded-full" 
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
