import React, { useState } from 'react';
import {
  BookOpen,
  Key,
  Zap,
  EyeOff,
  Layout,
  Smartphone,
  Monitor,
  Maximize2,
  ExternalLink,
  Cpu
} from 'lucide-react';

const SCREENS = [
  { id: 'connify_mobile_web', name: 'Mobile Web Landing Page' },
  { id: 'connify_splash_screen_desktop', name: 'Desktop Splash Screen' },
  { id: 'refined_splash_screen_desktop', name: 'Refined Desktop Splash' },
  { id: 'connify_safety_coordination_protocol', name: 'Safety Coordination Screen' },
  { id: 'connify_trusted_safety_coordination', name: 'Proximity Safety Circle' },
  { id: 'connify_trustworthy_safety_protocol', name: 'Trustworthy Safety Protocol' },
  { id: 'features_governance_connify_safety', name: 'Features & Governance' },
  { id: 'how_it_works_connify_protocol', name: 'How It Works Protocol' },
  { id: 'privacy_governance_connify', name: 'Privacy Governance Center' },
  { id: 'protocol_features_connify_safety', name: 'Safety Protocol & Features' }
];

export default function TabProtocol() {
  const [activeSection, setActiveSection] = useState<'works' | 'capsule' | 'priority' | 'privacy' | 'replicas'>('works');
  const [selectedScreen, setSelectedScreen] = useState('connify_mobile_web');
  const [viewportMode, setViewportMode] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Sub-navigation bar (Glassmorphism & Auroramorphism) */}
      <div className="col-span-12 lg:col-span-3 glass-panel p-4 rounded-2xl flex flex-col gap-2.5 h-fit shadow-xl border border-white/10">
        <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest px-2 pt-1">Protocol Layers</span>
        
        <button
          onClick={() => setActiveSection('works')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
            activeSection === 'works'
              ? 'aurora-card border-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Proximity Handshake
        </button>

        <button
          onClick={() => setActiveSection('capsule')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
            activeSection === 'capsule'
              ? 'aurora-card border-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Key className="h-4 w-4" />
          One-Time Trust Capsule
        </button>

        <button
          onClick={() => setActiveSection('priority')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
            activeSection === 'priority'
              ? 'aurora-card border-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Zap className="h-4 w-4" />
          Emergency Priority
        </button>

        <button
          onClick={() => setActiveSection('privacy')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
            activeSection === 'privacy'
              ? 'aurora-card border-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <EyeOff className="h-4 w-4" />
          Privacy & Governance
        </button>

        <button
          onClick={() => setActiveSection('replicas')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-mono font-bold tracking-wide uppercase transition-all cursor-pointer ${
            activeSection === 'replicas'
              ? 'aurora-card border-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Layout className="h-4 w-4" />
          Interactive UI Replicas
        </button>

        <div className="glass-card p-4 rounded-xl text-[10px] font-mono text-[#1b1b1b] space-y-2 mt-3 border border-[#1b1b1b]/15">
          <span className="font-bold text-[#0051c6] block uppercase flex items-center justify-between">
            <span>Protocol Base: L0 to L3</span>
            <span className="text-[8px] bg-[#dae2ff] text-[#0051c6] px-1.5 py-0.5 rounded border border-[#0051c6]/30 font-bold">ACTIVE</span>
          </span>
          <p className="leading-relaxed text-[9px] text-[#5f3f3a]">
            The Connify protocol relies on decentralized proximity loops verified locally on device hardware nodes.
          </p>
        </div>
      </div>

      {/* Main documentation space (Auroramorphism Container) */}
      <div className="col-span-12 lg:col-span-9 aurora-card rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-dots-dark opacity-30 pointer-events-none" />
        
        {activeSection === 'works' && (
          <div className="space-y-6">
            <div className="border-b border-[#1b1b1b]/20 pb-4">
              <span className="text-[10px] font-mono text-[#b60100] uppercase tracking-widest block font-bold">
                Protocol Layer 01
              </span>
              <h2 className="text-xl font-bold font-jakarta text-[#1b1b1b] mt-1">
                The Proximity Verification Handshake
              </h2>
              <p className="text-xs text-[#5f3f3a] mt-2 font-sans leading-relaxed">
                Connify ensures absolute trust by verifying that helpers are physically present in your immediate proximity before enabling key exchange.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-5 rounded-lg space-y-3">
                <div className="h-9 w-9 bg-[#b60100]/10 border border-[#b60100]/30 rounded flex items-center justify-center text-[#b60100]">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold font-jakarta text-[#1b1b1b]">
                  01. QR Signal Burst
                </h3>
                <p className="text-xs text-[#5f3f3a] font-sans leading-relaxed">
                  The requesting device generates a dynamic, time-sensitive QR code containing the session public key. The helping device scans this code to exchange coordinates and handshake vectors.
                </p>
              </div>

              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-5 rounded-lg space-y-3">
                <div className="h-9 w-9 bg-[#0051c6]/10 border border-[#0051c6]/30 rounded flex items-center justify-center text-[#0051c6]">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold font-jakarta text-[#1b1b1b]">
                  02. BLE Proximity Check
                </h3>
                <p className="text-xs text-[#5f3f3a] font-sans leading-relaxed">
                  Both devices initiate a Bluetooth Low Energy (BLE) distance scan. The handshake will fail if the signal attenuation indicates the devices are more than 5 meters apart, preventing remote hijack.
                </p>
              </div>
            </div>

            <div className="bg-[#eeeeee] p-5 border border-[#1b1b1b]/15 rounded-lg space-y-2.5">
              <h4 className="text-xs font-bold font-mono text-[#1b1b1b] uppercase">
                Technical Handshake Specification
              </h4>
              <p className="text-[10px] font-mono text-[#5f3f3a] leading-relaxed">
                Verification checks compare signature hashes locally using NaCl/tweetnacl. If both BLE range and signature comparisons pass, the devices construct an ephemeral trust capsule which is registered as validated block Leaf in PostgreSQL via Fastify socket clusters.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'capsule' && (
          <div className="space-y-6">
            <div className="border-b border-slate-900 pb-4">
              <span className="text-[10px] font-mono text-[#b60100] uppercase tracking-widest block font-bold">
                Protocol Layer 02
              </span>
              <h2 className="text-xl font-bold font-jakarta text-white mt-1">
                One-Time Trust Capsules
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                Location data access is bounded by time and space. Connify uses self-destructing cryptographic capsules to prevent persistent background tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-4 rounded-lg space-y-2">
                <span className="text-xs font-bold font-mono text-[#1b1b1b] block">
                  Ephemeral Keys
                </span>
                <p className="text-[10px] text-[#5f3f3a] leading-relaxed">
                  Encryption keys are generated dynamically for a single journey and wiped completely from the server upon safe check-in.
                </p>
              </div>
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-4 rounded-lg space-y-2">
                <span className="text-xs font-bold font-mono text-[#1b1b1b] block">
                  Safe-Time Windows
                </span>
                <p className="text-[10px] text-[#5f3f3a] leading-relaxed">
                  Sessions auto-expire. If the user doesn't check in or request more time (+5 min), helper nodes are automatically alerted.
                </p>
              </div>
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-4 rounded-lg space-y-2">
                <span className="text-xs font-bold font-mono text-[#1b1b1b] block">
                  Blinded Grid Pings
                </span>
                <p className="text-[10px] text-[#5f3f3a] leading-relaxed">
                  Coordinates are divided into discrete PostGIS grids. Proximity checks are calculated using blinded zero-knowledge strings to mask exact coordinates.
                </p>
              </div>
            </div>

            <div className="bg-[#eeeeee] p-5 border border-[#1b1b1b]/15 rounded-lg space-y-2">
              <h4 className="text-xs font-bold font-mono text-[#1b1b1b] uppercase">
                Capsule Lifetime Sequence (SHARP)
              </h4>
              <p className="text-[10px] font-mono text-[#5f3f3a] leading-relaxed">
                1. Requesting device registers capsule with blinded grid coordinates.<br />
                2. Trusted helper device pulls signature blinded tokens.<br />
                3. Verification occurs on-chain or locally on BLE standby.<br />
                4. Capsule self-destructs (status: expired) after 30 minutes, purging coordinate caches.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'priority' && (
          <div className="space-y-6">
            <div className="border-b border-slate-900 pb-4">
              <span className="text-[10px] font-mono text-[#b60100] uppercase tracking-widest block font-bold">
                Protocol Layer 03
              </span>
              <h2 className="text-xl font-bold font-jakarta text-white mt-1">
                Emergency Mode Routing
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                When seconds count, standard data pipelines are suspended to establish low-latency dedicated channels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-5 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-jakarta text-[#1b1b1b]">
                    WebSocket Priority Queue
                  </h3>
                  <span className="text-[9px] text-[#b60100] font-mono px-2 py-0.5 rounded bg-[#b60100]/10 border border-[#b60100]/20 font-bold">
                    &lt;200ms
                  </span>
                </div>
                <p className="text-xs text-[#5f3f3a] font-sans leading-relaxed">
                  SOS alerts bypass normal rate-limiters. Location coordinates stream via continuous WebSocket frames, ensuring alerts reach responders instantly even in weak signal areas.
                </p>
              </div>

              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-5 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-jakarta text-[#1b1b1b]">
                    UI High-Stakes Focus
                  </h3>
                  <span className="text-[9px] text-[#5f3f3a] font-mono font-bold">
                    Minimalist UI
                  </span>
                </div>
                <p className="text-xs text-[#5f3f3a] font-sans leading-relaxed">
                  All configuration panels and map settings are stripped. Devices lock to SOS controls and live voice, preventing latency and visual noise.
                </p>
              </div>
            </div>

            <div className="border-l-2 border-[#b60100] pl-4 py-1 text-[10px] text-[#1b1b1b] font-mono leading-relaxed bg-[#ffdad6]/40 rounded-r border-y border-r border-[#1b1b1b]/15">
              <span className="text-[#b60100] font-bold uppercase block text-[9px] mb-1">
                Security Threat Protocol (SOS)
              </span>
              Once activated, coordinates are signed cryptographically and sent in clear text payload to nearest PostGIS geofenced devices. Standard data logging is disabled to preserve network battery.
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="space-y-6">
            <div className="border-b border-slate-900 pb-4">
              <span className="text-[10px] font-mono text-[#b60100] uppercase tracking-widest block font-bold">
                Governance Protocol
              </span>
              <h2 className="text-xl font-bold font-jakarta text-white mt-1">
                Zero-Trust Privacy Governance
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                We believe security should never cost privacy. Our governance system guarantees zero-knowledge location auditing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[9px]">
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-4 rounded-lg space-y-2">
                <span className="text-[#1b1b1b] uppercase font-bold block text-[10px] border-b border-[#1b1b1b]/20 pb-1">
                  Minimal Logging
                </span>
                <p className="text-[#5f3f3a] leading-relaxed">
                  We store only the result, category, and time-frame. Coordinate trails, personal IDs, and message logs are never saved.
                </p>
              </div>
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-4 rounded-lg space-y-2">
                <span className="text-[#1b1b1b] uppercase font-bold block text-[10px] border-b border-[#1b1b1b]/20 pb-1">
                  24h Purging
                </span>
                <p className="text-[#5f3f3a] leading-relaxed">
                  All active telemetry and grid cell links are hard-deleted automatically from PostgreSQL every 24 hours.
                </p>
              </div>
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 p-4 rounded-lg space-y-2">
                <span className="text-[#1b1b1b] uppercase font-bold block text-[10px] border-b border-[#1b1b1b]/20 pb-1">
                  Edge AI Analytics
                </span>
                <p className="text-[#5f3f3a] leading-relaxed">
                  Anomalous movement checks (like sudden route deviations) are processed locally on device CPUs to keep raw data private.
                </p>
              </div>
            </div>

            <div className="bg-[#eeeeee] p-5 border border-[#1b1b1b]/15 rounded-lg text-[#5f3f3a] text-[10px] font-sans leading-relaxed">
              <span className="font-bold font-mono text-[#1b1b1b] block uppercase text-[9px] mb-1">
                Audit Compliance Statement (§8.1)
              </span>
              The admin portal operates purely as a verification ledger auditor. It has zero capability to trace historical coordinate paths or query individual user names. The database stores cryptographic leaf hashes representing events, allowing verification that the timeline matches without revealing private identities.
            </div>
          </div>
        )}

        {activeSection === 'replicas' && (
          <div className="space-y-6 flex flex-col h-full animate-fade-in">
            <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold flex items-center gap-1.5">
                  <span>Design System Verification</span>
                  <span className="text-[8px] bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">10 SCREENS</span>
                </span>
                <h2 className="text-xl font-bold font-jakarta text-[#1b1b1b] mt-1">
                  UI Prototype Viewport Replicas
                </h2>
                <p className="text-xs text-[#5f3f3a] mt-1 font-sans">
                  Interact with exact replica views compiled from static client prototypes.
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  className="glass-pill px-4 py-2 text-xs text-[#1b1b1b] font-mono focus:outline-none focus:ring-2 focus:ring-[#0051c6] transition-all border border-[#1b1b1b]/20"
                >
                  {SCREENS.map((scr) => (
                    <option key={scr.id} value={scr.id} className="bg-white text-[#1b1b1b]">
                      {scr.name}
                    </option>
                  ))}
                </select>

                <div className="flex glass-panel rounded-xl overflow-hidden border border-[#1b1b1b]/20 p-0.5">
                  <button
                    onClick={() => setViewportMode('mobile')}
                    className={`p-2 transition-all rounded-lg cursor-pointer ${
                      viewportMode === 'mobile'
                        ? 'aurora-card text-[#1b1b1b] shadow-md font-bold'
                        : 'text-[#5f3f3a] hover:text-[#1b1b1b]'
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewportMode('desktop')}
                    className={`p-2 transition-all rounded-lg cursor-pointer ${
                      viewportMode === 'desktop'
                        ? 'aurora-card text-white shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Desktop View"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Viewport Frame (Glassmorphism & Auroramorphism) */}
            <div className="flex-grow flex items-center justify-center p-4 glass-panel rounded-2xl border border-white/10 overflow-hidden min-h-[500px] shadow-inner relative">
              
              {viewportMode === 'mobile' ? (
                /* Mobile Mockup Device Case */
                <div className="w-[360px] h-[640px] border-[12px] border-slate-900 rounded-[36px] bg-black shadow-[0_0_40px_rgba(0,240,255,0.2)] relative flex flex-col overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-b-xl z-50 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800" />
                  </div>
                  
                  {/* Iframe View */}
                  <iframe
                    src={`/api/preview?screen=${selectedScreen}`}
                    className="w-full h-full border-none select-none"
                    title="Mobile UI Viewport Frame"
                  />
                </div>
              ) : (
                /* Desktop Mockup Browser Case */
                <div className="w-full h-[640px] border border-cyan-500/30 rounded-xl bg-slate-950 shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden">
                  {/* Browser Bar */}
                  <div className="h-10 bg-[#0b0f19]/90 backdrop-blur border-b border-white/10 flex items-center px-4 justify-between select-none">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm" />
                    </div>
                    <div className="glass-pill px-6 py-1 text-[9px] text-cyan-300 font-mono border border-cyan-500/20">
                      https://connify.app/preview/{selectedScreen}
                    </div>
                    <div className="w-6" />
                  </div>

                  {/* Iframe View */}
                  <iframe
                    src={`/api/preview?screen=${selectedScreen}`}
                    className="w-full h-full border-none"
                    title="Desktop UI Viewport Frame"
                  />
                </div>
              )}

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
