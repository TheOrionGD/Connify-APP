import React, { useState, useEffect } from 'react';
import { 
  Shield, Cpu, Lock, Radio, Key, Zap, CheckCircle2, ChevronRight, 
  Sliders, Terminal, RefreshCw, Layers, ShieldCheck, EyeOff, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SafetyProtocolFeatures() {
  // Protocol Configurator State
  const [sweepRadius, setSweepRadius] = useState<number>(1500); // meters
  const [decibelThreshold, setDecibelThreshold] = useState<number>(85); // dB
  const [peerDispatchRadius, setPeerDispatchRadius] = useState<number>(600); // meters
  const [meshHops, setMeshHops] = useState<number>(3);
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'config' | 'spec'>('config');

  // Feature Card Expand state
  const [expandedFeature, setExpandedFeature] = useState<number | null>(0);

  // Cosmetic UI Visualizer: Simulates real-time protocol parameter hash animation for landing page demonstration.
  // NOTE: This is purely a UI visualizer and has no cryptographic or security role.
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

  const handleSimulateVerification = () => {
    setIsVerifying(true);
    setVerificationSuccess(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 4000);
    }, 1200);
  };

  const featurePillars = [
    {
      id: 0,
      title: 'Zero-Knowledge Oblivious Proximity',
      subtitle: 'ZK-Proof Spatial Blinding Engine',
      description: 'Connify encrypts location coordinates into 1024-bit environmental Bloom filters. Nearby peer devices perform relational spatial queries without ever disclosing raw GPS telemetry or identity.',
      icon: Lock,
      color: 'rose',
      spec: `// Ephemeral ZK-Proof Grid Hash
const BloomFilter = generateSpatialBloom(coords, wifiBssids);
const BlindedQuery = Hashing.sha256(BloomFilter + SessionNonce);
const IsProximate = PostGIS.evalQuery(BlindedQuery); // True/False only`,
    },
    {
      id: 1,
      title: 'Offline Bluetooth LE & Wi-Fi Mesh',
      subtitle: 'Sub-GHz Off-Grid Relay Mesh',
      description: 'When cellular networks fail or internet connection is suppressed, Connify defaults to peer-to-peer multi-hop Bluetooth LE broadcasting, relaying distress alerts across nearby devices.',
      icon: Radio,
      color: 'cyan',
      spec: `// Off-Grid Multi-Hop Packet Format
struct MeshPacket {
  uint32_t episodeId;
  uint8_t hopLimit = ${meshHops};
  uint8_t bchSyndromeData[64];
  uint8_t ed25519Signature[64];
};`,
    },
    {
      id: 2,
      title: 'Urgent Serenity Escort Companion',
      subtitle: 'Dynamic Walk Monitoring & Panic Sirens',
      description: 'Active companion mode continuously monitors route deviation, heart rate spikes, and sudden acoustic shifts, firing localized audio alarms and instant peer dispatcher alerts when needed.',
      icon: Zap,
      color: 'emerald',
      spec: `// Escort Companion Trigger Pipeline
if (accelMagnitude > 4.2g || decibelLevel > ${decibelThreshold}dB) {
  triggerLocalSiren(115dB);
  broadcastPeerDispatch(radius: ${peerDispatchRadius}m);
}`,
    },
    {
      id: 3,
      title: 'Decentralized Consensus & Vetting',
      subtitle: 'Community Reputation Ledger',
      description: 'No corporate monopolies. All safety zone registrations, merchant sanctuary verifications, and protocol threshold changes are governed through decentralized cryptographically-signed community votes.',
      icon: ShieldCheck,
      color: 'purple',
      spec: `// Governance Verification Standard
function verifyResponder(nodeId, trustScore) {
  require(trustScore >= 850, "Trust score insufficient");
  return Ed25519.verifySignature(nodeId, councilPubKey);
}`,
    }
  ];

  return (
    <section className="space-y-20 py-6">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-[#0f111a] border border-white/10 p-6 sm:p-14 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 grid-pattern-bg opacity-40 pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
              <Shield className="h-4 w-4 text-rose-500" />
              <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
                SELF-SOVEREIGN EMERGENCY PROTOCOL
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] break-words">
              Decentralized Peer Mesh & <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400">Community Safety Grid</span>
            </h1>

            <p className="font-sans text-slate-300 text-lg sm:text-xl leading-relaxed max-w-2xl">
              Zero central servers. Zero location tracking logs. Connify activates instant peer-to-peer safety alerts, civilian escort companions, and cryptographic proximity verifications.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-white">0</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">GPS Logs Stored</span>
              </div>
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-rose-400">&lt;1.2s</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">Mesh Propagation</span>
              </div>
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-emerald-400">100%</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">ZK-Proof Private</span>
              </div>
              <div className="min-w-0">
                <span className="block font-tech font-extrabold text-xl sm:text-2xl text-cyan-400">BLE+Wi-Fi</span>
                <span className="font-mono text-[10px] sm:text-xs text-slate-400 leading-tight block">Offline Mesh</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Protocol Card */}
          <div className="lg:col-span-5">
            <div className="glass-card-glow rounded-2xl p-6 border border-white/15 space-y-6 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">Live Mesh Node State</span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  SECURE (ED25519)
                </span>
              </div>

              <div className="space-y-3 font-code text-xs">
                <div className="bg-[#090a0f] p-3 rounded-lg border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Episode Hash:</span>
                    <span className="text-cyan-400">0x8f4a...92b1</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Proximity Radius:</span>
                    <span className="text-white font-bold">{sweepRadius}m</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Acoustic Panic:</span>
                    <span className="text-amber-400 font-bold">{decibelThreshold} dB</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Peer Mesh Relay:</span>
                    <span className="text-emerald-400 font-bold">{meshHops} Hops</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/30 flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-rose-400 shrink-0" />
                  <p className="font-sans text-xs text-rose-200">
                    Oblivious Bloom filter generated on-device. Coordinates never broadcast.
                  </p>
                </div>
              </div>

              <a
                href="#urgent-serenity"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-sans font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all duration-200 flex items-center justify-center space-x-2 group cursor-pointer"
              >
                <span>LAUNCH ESCORT COMPANION</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Protocol Builder Sandbox */}
      <div className="bg-[#12141d] rounded-2xl border border-white/10 p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Sliders className="h-4 w-4" />
              <span>INTERACTIVE PROTOCOL BUILDER</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Configure Protocol Risk Parameters
            </h2>
          </div>

          <div className="flex items-center space-x-2 bg-[#090a0f] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'config' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Parameter Sliders
            </button>
            <button
              onClick={() => setActiveTab('spec')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'spec' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Payload Json
            </button>
          </div>
        </div>

        {activeTab === 'config' ? (
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Control Panel */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Slider 1: Geofence Sweep Radius */}
              <div className="space-y-2 bg-[#090a0f] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">Geofence Alert Sweep Radius</span>
                  <span className="text-rose-400 font-bold text-sm">{sweepRadius} meters</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="5000" 
                  step="100" 
                  value={sweepRadius}
                  onChange={(e) => setSweepRadius(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="font-sans text-[11px] text-slate-400">
                  Sets the peer broadcast radius for local mesh responder pings.
                </p>
              </div>

              {/* Slider 2: Acoustic Panic Threshold */}
              <div className="space-y-2 bg-[#090a0f] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">Acoustic Panic Threshold</span>
                  <span className="text-amber-400 font-bold text-sm">{decibelThreshold} dB</span>
                </div>
                <input 
                  type="range" 
                  min="65" 
                  max="110" 
                  step="5" 
                  value={decibelThreshold}
                  onChange={(e) => setDecibelThreshold(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="font-sans text-[11px] text-slate-400">
                  Automatic siren trigger threshold for sudden screaming or acoustic noise spikes.
                </p>
              </div>

              {/* Slider 3: Peer Dispatch Radius */}
              <div className="space-y-2 bg-[#090a0f] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">Peer Dispatcher Radius</span>
                  <span className="text-emerald-400 font-bold text-sm">{peerDispatchRadius} meters</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="1200" 
                  step="50" 
                  value={peerDispatchRadius}
                  onChange={(e) => setPeerDispatchRadius(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="font-sans text-[11px] text-slate-400">
                  Maximum proximity threshold to notify background-checked civilian guardians.
                </p>
              </div>

              {/* Slider 4: Mesh Relay Hops */}
              <div className="space-y-2 bg-[#090a0f] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">Multi-Hop Mesh Relay Limit</span>
                  <span className="text-cyan-400 font-bold text-sm">{meshHops} Hops</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="6" 
                  step="1" 
                  value={meshHops}
                  onChange={(e) => setMeshHops(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <p className="font-sans text-[11px] text-slate-400">
                  Limits off-grid packet forwarding across peer Bluetooth devices to prevent flooding.
                </p>
              </div>

            </div>

            {/* Live Generated Protocol State Hash Output */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#090a0f] p-6 rounded-2xl border border-white/10 space-y-4 font-code">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="h-4 w-4" />
                    <span>Protocol State Digest</span>
                  </span>
                  <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded font-mono">
                    SHA-256
                  </span>
                </div>

                <div className="bg-[#12141d] p-3.5 rounded-xl border border-white/10 text-xs text-rose-300 break-all font-mono">
                  {generatedHash}
                </div>

                <div className="space-y-2 text-xs text-slate-300 font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calculated Latency:</span>
                    <span className="font-mono text-emerald-400 font-bold">14ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cryptographic Cipher:</span>
                    <span className="font-mono text-white font-bold">Ed25519 + AES-GCM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Privacy Verification:</span>
                    <span className="font-mono text-cyan-400 font-bold">Passed (Zero-Logs)</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateVerification}
                  disabled={isVerifying}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>COMPUTING ZK PROOF...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-white" />
                      <span>TEST PROTOCOL COMPLIANCE</span>
                    </>
                  )}
                </button>

                {verificationSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center space-x-2"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Protocol state valid! 100% ZK compliance verified.</span>
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-[#090a0f] p-6 rounded-2xl border border-white/10 font-code text-xs text-rose-300">
            <pre className="overflow-x-auto">
{`{
  "protocol": "CONNIFY_P2P_SAFETY_SPEC_v1.4",
  "parameters": {
    "geofenceSweepRadiusMeters": ${sweepRadius},
    "acousticPanicThresholdDb": ${decibelThreshold},
    "peerDispatchRadiusMeters": ${peerDispatchRadius},
    "maxMultiHopBleRelays": ${meshHops}
  },
  "cryptography": {
    "identityScheme": "W3C_DID_Ed25519",
    "bloomFilterBits": 1024,
    "errorCorrection": "BCH_Syndrome_31_21",
    "obliviousQuery": true
  },
  "digest": "${generatedHash}"
}`}
            </pre>
          </div>
        )}
      </div>

      {/* Protocol Core Pillars Matrix */}
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
            ENGINEERING ARCHITECTURE
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Built on Cryptographic Mutual-Aid Principles
          </h2>
          <p className="font-sans text-slate-400 text-base">
            Every layer of Connify is designed to put safety control back into local hands without trusting centralized databases.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featurePillars.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedFeature === item.id;
            return (
              <div 
                key={item.id}
                className={`glass-card-glow rounded-2xl p-6 border transition-all duration-300 ${
                  isExpanded ? 'border-rose-500/50 bg-[#161926]' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
                      <Icon className="h-6 w-6 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">{item.title}</h3>
                      <span className="font-mono text-xs text-rose-400">{item.subtitle}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedFeature(isExpanded ? null : item.id)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-mono text-slate-300 transition-all cursor-pointer"
                  >
                    {isExpanded ? 'Hide Code' : 'View Code'}
                  </button>
                </div>

                <p className="font-sans text-slate-300 text-sm mt-4 leading-relaxed">
                  {item.description}
                </p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10 space-y-2"
                    >
                      <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">Implementation Specification Snippet</span>
                      <div className="bg-[#090a0f] p-3 rounded-xl border border-white/10 font-code text-xs text-emerald-400 overflow-x-auto">
                        <pre>{item.spec}</pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
