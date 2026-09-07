import React, { useState, useEffect } from 'react';
import { 
  Shield, Cpu, Lock, Radio, Key, Zap, CheckCircle2, ChevronRight, 
  Sliders, Terminal, RefreshCw, Layers, ShieldCheck, EyeOff, AlertTriangle, ArrowRight, LayoutGrid, Layers3
} from 'lucide-react';
import { motion } from 'motion/react';
import CardSwipeDeck from './CardSwipeDeck';

export default function SafetyProtocolFeatures() {
  const [sweepRadius, setSweepRadius] = useState<number>(1500); // meters
  const [decibelThreshold, setDecibelThreshold] = useState<number>(85); // dB
  const [peerDispatchRadius, setPeerDispatchRadius] = useState<number>(600); // meters
  const [meshHops, setMeshHops] = useState<number>(3);
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');

  // Feature Card Expand state
  const [expandedFeature, setExpandedFeature] = useState<number | null>(0);

  // Cosmetic UI Visualizer & Dynamic SHA256 Simulation
  useEffect(() => {
    const simulateHashAnimation = () => {
      const rawState = `RADIUS:${sweepRadius}|DB:${decibelThreshold}|DISPATCH:${peerDispatchRadius}|HOPS:${meshHops}|TS:${Date.now()}`;
      let hash = 0;
      for (let i = 0; i < rawState.length; i++) {
        const char = rawState.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(8, '0');
      setGeneratedHash(`0x${hex}e98f7a...3d91c4b${sweepRadius}`);
    };
    simulateHashAnimation();
  }, [sweepRadius, decibelThreshold, peerDispatchRadius, meshHops]);

  const handleCopyHash = () => {
    if (generatedHash) {
      navigator.clipboard.writeText(generatedHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const featurePillars = [
    {
      id: 0,
      title: '25-Screen Zero-Knowledge Onboarding',
      subtitle: 'Sovereign Ed25519 Key Derivation & Privacy Education',
      description: 'Connify walks users through a 25-step interactive journey covering deterministic device identity, blinded grid-cell spatial routing, zero-knowledge threat containment, and guardian circle configuration with background video ambiance.',
      icon: Layers,
      color: 'rose',
      spec: `// On-Device Deterministic Key Derivation
const deviceKey = await Keychain.getGenericPassword();
const sovereignDID = 'did:connify:' + sha256(deviceKey.password);
// Initialize 25-screen onboarding state
setStep(1); // 1 to 25 continuous zero-trust flow`
    },
    {
      id: 1,
      title: 'Google Sign-In & Firebase Sync',
      subtitle: 'OAuth 2.0 Auth & Instant Profile Population',
      description: 'Replaces anonymous sessions with authenticated Google Sign-In. User profile data (Name, Email, Blood Group, Medical Notes, and Guardian info) syncs seamlessly with Firebase Auth and the Render cluster in real time.',
      icon: Key,
      color: 'amber',
      spec: `// Google OAuth with Firebase
const { idToken } = await GoogleSignin.signIn();
const googleCredential = auth.GoogleAuthProvider.credential(idToken);
const userCred = await auth().signInWithCredential(googleCredential);
// Sync profile & warm Render backend asynchronously`
    },
    {
      id: 2,
      title: '5-Second GPS Watchdog & Multi-Channel Alerts',
      subtitle: 'Atomic Location Pings & Unbounded Signal Recovery',
      description: 'Every 5 seconds the device atomically overwrites its GPS record in the backend. If no ping is received for 15 seconds, the backend automatically dispatches FCM Push Notifications and Brevo Email alerts to registered guardians with live coordinates.',
      icon: Radio,
      color: 'cyan',
      spec: `// 15s Watchdog → FCM & Brevo Dispatch
if (timeSinceLastPing >= 15_000) {
  await getMessaging().send({ token: g.fcmToken, notification });
  await fetch('https://api.brevo.com/v3/smtp/email', {
    body: JSON.stringify({ to: [{ email: g.email }] })
  });
}`
    },
    {
      id: 3,
      title: 'Offline & Women Safety Modules',
      subtitle: 'Sub-GHz Off-Grid Relay & Tailored Protection',
      description: 'When cellular networks fail, Connify transitions to the Offline Emergency Screen, relaying distress beacons via 1-Tap GPS Offline SMS Broadcasts and P2P Volunteer Mesh Servers. Integrated Women Safety modules adapt behavioral risk scoring to prioritize proactive threat deterrence.',
      icon: Zap,
      color: 'emerald',
      spec: `// Off-Grid Multi-Hop Packet Format
struct MeshPacket {
  uint32_t episodeId;
  uint8_t hopLimit = ${meshHops};
  uint8_t bchSyndromeData[64];
  uint8_t ed25519Signature[64];
};`
    },
    {
      id: 4,
      title: 'Mutual Proximity QR Handshake',
      subtitle: 'Zero-Knowledge Challenge-Response Verification',
      description: 'Responders scan a dynamic single-use QR Token presented by the requester to unlock active assistance. This prevents confused-deputy attacks and validates physical co-presence without exposing raw coordinates.',
      icon: Lock,
      color: 'purple',
      spec: `// Mutual Proximity QR Challenge
const isQrValid = verifyProximitySignature(qrToken, episode.id);
if (!isQrValid) throw new Error('PROXIMITY_FAILED');
// Unlock 10-minute active assistance window`
    },
    {
      id: 5,
      title: 'Immutable Merkle DAG & Ephemeral Purge',
      subtitle: 'SHA3-256 Audit Ledger & Zero Residual Trace',
      description: 'All safety zone registrations and incident outcomes commit as canonical SHA3-256 digests into an append-only Merkle DAG ledger. When an incident is resolved, temporary location records and grid tokens are permanently purged from memory.',
      icon: ShieldCheck,
      color: 'rose',
      spec: `// Merkle DAG Commit & Purge
const digest = sha3_256(canonicalJson(eventRecord) ^ parentHash);
await sqliteAuditDAG.insert({ hash: digest, event: 'PURGE_COMPLETED' });
await purgeEphemeralCoordinates(episode.id);`
    },
  ];

  return (
    <section className="space-y-16 py-6 font-sans">
      
      {/* Hero Header Card with High Contrast */}
      <div className="relative rounded-[32px] bg-[#12141d]/90 backdrop-blur-xl border border-white/15 p-6 sm:p-12 lg:p-14 overflow-hidden shadow-2xl text-white">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
              <Shield className="h-4 w-4 text-rose-400" />
              <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
                SELF-SOVEREIGN EMERGENCY PROTOCOL v3.7.2
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] break-words drop-shadow-md">
              Decentralized Peer Mesh &amp; <span className="text-rose-500">Community Safety Grid</span>
            </h1>

            <p className="font-sans text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl font-normal">
              Zero central surveillance. Zero location tracking logs. Connify coordinates instant peer-to-peer safety alerts, civilian escort companions, and cryptographic proximity handshakes.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-white">25-Step</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">Zero-Trust Onboarding</span>
              </div>
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-rose-400">5s</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">GPS Atomic Watchdog</span>
              </div>
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-emerald-400">Google OAuth</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">Firebase Sync</span>
              </div>
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-cyan-400">Ed25519</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">Device Signing</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Protocol Card (High Contrast White Card) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-6 relative text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>
                  <span className="font-mono text-xs font-bold text-slate-900 uppercase tracking-wider">Live Mesh Node State</span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                  SECURE (ED25519)
                </span>
              </div>

              <div className="space-y-3 font-code text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5 text-slate-500" /> Episode Hash:</span>
                    <button 
                      onClick={handleCopyHash}
                      className="text-cyan-700 font-bold hover:underline cursor-pointer flex items-center gap-1 font-mono"
                      title="Click to copy hash"
                    >
                      <span>{generatedHash || '0x8f4a...92b1'}</span>
                      {copiedHash ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <RefreshCw className="h-3 w-3 text-slate-400" />}
                    </button>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-slate-500" /> GPS Watchdog:</span>
                    <span className="text-emerald-700 font-bold">5s Atomic Ping</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Signal Loss Alert:</span>
                    <span className="text-amber-700 font-bold">15s → FCM + Brevo</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-rose-500" /> Onboarding Architecture:</span>
                    <span className="text-rose-600 font-bold">25-Screen Verified</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Account Auth:</span>
                    <span className="text-purple-700 font-bold">Google Sign-In</span>
                  </div>
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-emerald-600" /> Peer Mesh Relay:</span>
                    <span className="text-emerald-700 font-bold">{meshHops} Hops</span>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-rose-600 shrink-0" />
                  <p className="font-sans text-xs text-rose-950 font-semibold leading-relaxed">
                    Proximity QR Handshake architecture validates physical co-presence with zero persistent cloud tracking.
                  </p>
                </div>
              </div>

              <a
                href="#urgent-serenity"
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-sans font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer hover:-translate-y-0.5 tracking-wider uppercase"
              >
                <span>LAUNCH ESCORT COMPANION</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Protocol Parameters & Mesh Tuner Configurator */}
      <div className="bg-[#12141d]/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest block">Interactive Mesh Tuner</span>
              <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white">Protocol Parameters &amp; Telemetry Configurator</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-[#090a0f] px-3.5 py-1.5 rounded-xl border border-white/10 font-mono text-xs text-cyan-300 font-bold">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span>Hash: {generatedHash.slice(0, 16)}...</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Slider 1: Sweep Radius */}
          <div className="bg-[#090a0f] p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-rose-400" /> Alert Sweep Radius
              </span>
              <span className="text-rose-400 font-extrabold text-sm">{sweepRadius}m</span>
            </div>
            <input 
              type="range" min="500" max="5000" step="100" value={sweepRadius}
              onChange={(e) => setSweepRadius(Number(e.target.value))}
              className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="font-sans text-[11px] text-slate-400 leading-snug">
              Coverage boundary for geofenced peer distress alerts.
            </p>
          </div>

          {/* Slider 2: Decibel Threshold */}
          <div className="bg-[#090a0f] p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Acoustic Siren Trigger
              </span>
              <span className="text-amber-400 font-extrabold text-sm">{decibelThreshold} dB</span>
            </div>
            <input 
              type="range" min="60" max="120" step="5" value={decibelThreshold}
              onChange={(e) => setDecibelThreshold(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="font-sans text-[11px] text-slate-400 leading-snug">
              Mic noise threshold for automatic acoustic panic triggers.
            </p>
          </div>

          {/* Slider 3: Peer Dispatch Radius */}
          <div className="bg-[#090a0f] p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" /> Peer Dispatch Range
              </span>
              <span className="text-cyan-400 font-extrabold text-sm">{peerDispatchRadius}m</span>
            </div>
            <input 
              type="range" min="100" max="2000" step="50" value={peerDispatchRadius}
              onChange={(e) => setPeerDispatchRadius(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="font-sans text-[11px] text-slate-400 leading-snug">
              Direct proximity filter for nearest civilian companion nodes.
            </p>
          </div>

          {/* Slider 4: Mesh Hops */}
          <div className="bg-[#090a0f] p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400" /> Off-Grid Mesh Hops
              </span>
              <span className="text-emerald-400 font-extrabold text-sm">{meshHops} Hops</span>
            </div>
            <input 
              type="range" min="1" max="8" step="1" value={meshHops}
              onChange={(e) => setMeshHops(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <p className="font-sans text-[11px] text-slate-400 leading-snug">
              Sub-GHz packet relay hop count limit for offline broadcasting.
            </p>
          </div>
        </div>
      </div>

      {/* Pillars Section Header with High Contrast */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1">Architecture Overview</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Core Protocol <span className="text-rose-500">Pillars</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-[#12141d] p-1.5 rounded-2xl border border-white/10 w-fit shadow-inner">
          <button
            onClick={() => setViewMode('swipe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              viewMode === 'swipe' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers3 className="w-3.5 h-3.5" />
            <span>Card Swipe Stack</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Swipe Deck Mode (High Contrast Crisp White Cards) */}
      {viewMode === 'swipe' ? (
        <CardSwipeDeck
          items={featurePillars}
          stackHeight="h-[460px]"
          badgeText="Drag left/right to browse pillars"
          renderCard={(pillar, isTop) => {
            const IconComponent = pillar.icon;
            const isExpanded = expandedFeature === pillar.id;

            return (
              <div
                className={`w-full h-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden relative ${
                  isTop ? 'ring-2 ring-rose-500/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm">
                      <IconComponent className="h-7 w-7" />
                    </div>
                    <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-sm">
                      PILLAR 0{pillar.id + 1} OF 06
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mb-1 leading-snug">{pillar.title}</h3>
                  <p className="font-mono text-xs text-rose-600 font-bold mb-3">{pillar.subtitle}</p>
                  <p className="font-sans text-sm text-slate-700 font-medium leading-relaxed">{pillar.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFeature(isExpanded ? null : pillar.id);
                    }}
                    className="w-full flex items-center justify-between text-xs font-mono font-bold text-slate-800 hover:text-rose-600 transition-colors py-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Spec Code' : 'Inspect Protocol Spec Code'}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90 text-rose-600' : ''}`} />
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-code text-[11px] text-cyan-300 overflow-x-auto shadow-inner"
                    >
                      <pre>{pillar.spec}</pre>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          }}
        />
      ) : (
        /* Grid Overview Mode */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featurePillars.map((pillar) => {
            const IconComponent = pillar.icon;
            const isExpanded = expandedFeature === pillar.id;

            return (
              <div
                key={pillar.id}
                onClick={() => setExpandedFeature(isExpanded ? null : pillar.id)}
                className={`bg-white rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                  isExpanded 
                    ? 'border-rose-500 shadow-2xl ring-2 ring-rose-500/20' 
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-500">PILLAR 0{pillar.id + 1}</span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900 mb-1 leading-snug">{pillar.title}</h3>
                  <p className="font-mono text-xs text-rose-600 font-bold mb-3">{pillar.subtitle}</p>
                  <p className="font-sans text-sm text-slate-700 font-medium leading-relaxed">{pillar.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                    <span>{isExpanded ? 'Hide Spec' : 'Inspect Protocol Spec'}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90 text-rose-600' : ''}`} />
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-code text-[11px] text-cyan-300 overflow-x-auto shadow-inner"
                    >
                      <pre>{pillar.spec}</pre>
                    </motion.div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
}
