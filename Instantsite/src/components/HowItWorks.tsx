import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Smartphone, Radio, Users, CheckCircle, 
  Play, RotateCcw, Cpu, Lock, Key, ChevronRight, Terminal, RefreshCw, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimelineStep {
  id: number;
  title: string;
  sub: string;
  desc: string;
  icon: any;
  techDetail: string;
}

export default function HowItWorks() {
  const [activeSimStep, setActiveSimStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([
    '[INIT] Connify Zero-Knowledge Protocol engine initialized.',
    '[READY] Select a timeline stage or click "Run Simulated Telemetry" below.'
  ]);
  const [showInspector, setShowInspector] = useState<boolean>(false);

  const timelineSteps: TimelineStep[] = [
    {
      id: 1,
      title: 'Episode ID & DID Generation',
      sub: 'Self-Sovereign Identity Initialization',
      desc: 'Devices generate self-sovereign cryptographic DIDs on-device. An ephemeral Episode ID (UUIDv4) isolates transactional identity to prevent location linkability.',
      icon: Key,
      techDetail: 'W3C DID + Ephemeral UUIDv4 Session Pair'
    },
    {
      id: 2,
      title: 'Ambient Signal Bloom Filter',
      sub: 'Environmental Signal Capture',
      desc: 'Captures local environmental radio signatures including Wi-Fi frame headers and LTE control signals, packing them into a 1024-bit environmental Bloom filter.',
      icon: Smartphone,
      techDetail: '1024-bit Environmental Signal Bloom Filter'
    },
    {
      id: 3,
      title: 'Fuzzy Extractor Handshake',
      sub: 'BCH Error Correction Key Exchange',
      desc: 'Proximity helper scans a short-lived QR code containing BCH syndromes of the location Bloom filter, reconstructing the session key without disclosing GPS coordinates.',
      icon: Radio,
      techDetail: 'BCH (31, 21) Error Correction Key Reconstruction'
    },
    {
      id: 4,
      title: 'Fine-Grained Grid Blinding',
      sub: 'Oblivious Proximity Spatial Check',
      desc: 'Helper device transmits a blinded grid index. Requester performs PostGIS spatial verification on adjacent blinded grid cells privately without coordinate exposure.',
      icon: Users,
      techDetail: 'Blinded Grid Index & Relational PostGIS Spatial Query'
    },
    {
      id: 5,
      title: '2-Hour Trust Capsule QR Activation',
      sub: 'QR Token Validation & JIT Token Issuance',
      desc: 'Responder scans a dynamic QR Token to verify proximity. The server validates the cryptographic signature and issues a 2-Hour Trust Capsule JWT, strictly bounding the helper engagement window.',
      icon: ShieldCheck,
      techDetail: 'QR Token Scanning + 2-Hour Ed25519 JWT Validation'
    }
  ];

  const fullLogSequence = [
    '[00:01] Initializing SHARP protocol handshake...',
    '[00:02] Generating self-sovereign DID & hashing device fingerprint... [OK]',
    '[00:03] Episode created: UUIDv4 registered to isolate transactional identity... [OK]',
    '[00:04] Sampling ambient signals (Wi-Fi frame headers + LTE TC-RNTI)... [OK]',
    '[00:05] Populating 1024-bit environmental Bloom filter... [Active]',
    '[00:06] BCH syndrome error-correction package compiled into QR code... [Ready]',
    '[00:07] Helper scanned QR. Initiating Fuzzy Extractor key reconstruction...',
    '[00:08] Temporary session key K successfully reconstructed via BCH syndrome... [OK]',
    '[00:09] Helper sending blinded grid index B = H\'(K, b || "Bob")... [Transmitted]',
    '[00:10] Executing relational PostGIS spatial query on blinded grid cells... [Matched]',
    '[00:11] Proximity verification complete. Issuing single-use JIT Trust Capsule... [Signed]',
    '[00:12] Authenticating Trust Capsule (Ed25519-signed JWT) on-demand... [Pass]',
    '[00:13] User checked in successfully! Destination verified.',
    '[00:14] Wiping ephemeral coordinate logs from memory... [Sanitized]',
    '[00:15] System sanitized. Zero-Logs protocol execution complete. [Offline]'
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveSimStep(0);
    setSimLogs(['[SIMULATION STARTED] Executing 5-stage cryptographic sequence...']);

    let step = 0;
    const interval = setInterval(() => {
      if (step < timelineSteps.length) {
        setActiveSimStep(step + 1);
        const logChunk = fullLogSequence.slice(step * 3, (step + 1) * 3);
        setSimLogs(prev => [...prev, ...logChunk]);
        step++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 1500);
  };

  const handleResetSim = () => {
    setActiveSimStep(0);
    setIsSimulating(false);
    setSimLogs(['[RESET] Log console sanitized. Engine ready.']);
  };

  return (
    <section id="how-it-works" className="space-y-16 py-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
          <Terminal className="h-4 w-4 text-rose-500" />
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
            TELEMETRY & CRYPTOGRAPHIC PIPELINE
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          How Connify Works <span className="text-rose-500">Under the Hood</span>
        </h2>
        <p className="font-sans text-slate-300 text-base sm:text-lg">
          Step-by-step breakdown of how oblivious spatial verification and zero-knowledge peer handshakes protect identity without central logging.
        </p>
      </div>

      {/* Interactive 5-Stage Stepper Cards */}
      <div className="grid lg:grid-cols-5 gap-4">
        {timelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeSimStep === step.id;
          const isPassed = activeSimStep > step.id;

          return (
            <div
              key={step.id}
              onClick={() => setActiveSimStep(step.id)}
              className={`glass-card-glow rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                isActive 
                  ? 'border-rose-500 bg-[#161926] shadow-[0_0_20px_rgba(225,29,72,0.3)] scale-[1.02]' 
                  : isPassed
                  ? 'border-emerald-500/40 bg-[#0f111a]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    isActive ? 'bg-rose-600 text-white' : isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-slate-400'
                  }`}>
                    STAGE 0{step.id}
                  </span>
                  {isPassed && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                </div>

                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 w-fit">
                  <Icon className="h-5 w-5 text-rose-400" />
                </div>

                <div>
                  <h3 className="font-display font-bold text-sm text-white">{step.title}</h3>
                  <span className="font-mono text-[11px] text-slate-400">{step.sub}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 font-mono text-[10px] text-rose-300">
                {step.techDetail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Terminal & Packet Inspector Studio */}
      <div className="bg-[#090a0f] rounded-2xl border border-white/10 p-6 space-y-6">
        
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            </div>
            <span className="font-mono text-xs text-slate-300 font-bold">
              telemetry_node_console.sh — 1,284 P2P Peers Active
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer flex items-center space-x-2"
            >
              {isSimulating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isSimulating ? 'SIMULATING...' : 'RUN SIMULATED TELEMETRY'}</span>
            </button>

            <button
              onClick={() => setShowInspector(!showInspector)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-mono text-xs font-bold rounded-xl border border-white/10 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>PACKET INSPECTOR</span>
            </button>

            <button
              onClick={handleResetSim}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-white/10 cursor-pointer"
              title="Reset Console"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live Simulated Logs Output Window */}
        <div className="bg-[#12141d] p-4 rounded-xl border border-white/10 font-code text-xs space-y-1.5 min-h-[180px] max-h-[260px] overflow-y-auto">
          {simLogs.map((log, i) => (
            <div key={i} className={`flex items-start space-x-2 ${
              log.includes('OK') || log.includes('Pass') ? 'text-emerald-400' :
              log.includes('STARTED') || log.includes('Executing') ? 'text-rose-400 font-bold' :
              log.includes('Sanitized') ? 'text-cyan-400 font-bold' :
              'text-slate-300'
            }`}>
              <span className="text-slate-600 font-mono select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>

        {/* Modal JSON Packet Inspector */}
        <AnimatePresence>
          {showInspector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-white/10 space-y-3"
            >
              <div className="flex justify-between items-center text-xs font-mono text-cyan-400 font-bold">
                <span>CRYPGRAPHIC TELEMETRY PACKET INSPECTOR (JSON)</span>
                <span>CIPHER: Ed25519 / AES-256-GCM</span>
              </div>

              <div className="bg-[#12141d] p-4 rounded-xl border border-cyan-500/30 font-code text-xs text-slate-300 overflow-x-auto">
                <pre>{`{
  "packetId": "pkt_9f82a174c8b",
  "timestamp": "${new Date().toISOString()}",
  "episode": {
    "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "did": "did:connify:zk928f7a31b40c"
  },
  "ambientSignature": {
    "bloomFilterHash": "0x4a92c810f9b3...",
    "bchSyndrome": "0x1b82c40a"
  },
  "spatialVerification": {
    "blindedGridIndex": "grid_cell_942_a",
    "postGisResult": "PROXIMATE_CONFIRMED",
    "coordinatesExposed": false
  },
  "jitTrustCapsule": {
    "signedJwt": "eyJhbGciOiJFZDI1NTE5I...d72a9b",
    "redisTtlSeconds": 120
  }
}`}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </section>
  );
}
