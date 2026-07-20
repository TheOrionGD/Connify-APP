import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Smartphone, Radio, Users, CheckCircle, 
  Play, RotateCcw, Cpu, Lock, Key, ChevronRight, Terminal
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
  const [simLogs, setSimLogs] = useState<string[]>([]);

  const timelineSteps: TimelineStep[] = [
    {
      id: 1,
      title: 'Episode ID & DID Generation',
      sub: 'Episode-as-Identity Initialization',
      desc: 'Devices generate self-sovereign cryptographic DIDs on-device. An ephemeral Episode ID (UUIDv4) is created server-side to isolate transactional identity, preventing linkability.',
      icon: Key,
      techDetail: 'UUIDv4 per episode + Device Fingerprint hashing'
    },
    {
      id: 2,
      title: 'Ambient Signal Bloom Filter',
      sub: 'Environmental Signal Capture',
      desc: 'Captures local environmental radio signatures including Wi-Fi frame headers and LTE control signals (like TC-RNTI), packing them into a secure, blindable 1024-bit Bloom filter.',
      icon: Smartphone,
      techDetail: '1024-bit environmental Bloom filter generation'
    },
    {
      id: 3,
      title: 'Fuzzy Extractor Handshake',
      sub: 'BCH Syndrome Key Exchange',
      desc: 'Proximity helper scans a short-lived QR code containing BCH syndromes of the location Bloom filter and a helper string, reconstructing the temporary session key without disclosing exact GPS logs.',
      icon: Radio,
      techDetail: 'BCH Syndrome Error Correction Key Reconstruction'
    },
    {
      id: 4,
      title: 'Fine-Grained Grid Blinding',
      sub: 'Oblivious Proximity Check',
      desc: 'The helper device transmits a blinded grid cell index. The requester performs secure PostGIS verification on adjacent cells privately, proving proximity without revealing precise coordinates.',
      icon: Users,
      techDetail: 'Blinded Grid Index & Relational PostGIS Query'
    },
    {
      id: 5,
      title: 'Trust Capsule Activation',
      sub: 'JIT Cryptographic Token Issuance',
      desc: 'Server issues a short-lived Trust Capsule (Ed25519-signed JWT) that is single-use enforced in Redis. Wipes all ephemeral coordinates immediately upon safe destination check-in.',
      icon: ShieldCheck,
      techDetail: 'Ed25519 JWT + Redis TTL Ephemeral Expire'
    }
  ];

  const logMessages = [
    'Initializing SHARP protocol handshake...',
    'Generating self-sovereign DID & hashing device fingerprint... [OK]',
    'Episode created: UUIDv4 registered to isolate transactional identity... [OK]',
    'Sampling ambient signals (Wi-Fi frame headers + LTE TC-RNTI)... [OK]',
    'Populating 1024-bit environmental Bloom filter... [Active]',
    'BCH syndrome error-correction package compiled into QR code... [Ready]',
    'Helper scanned QR. Initiating Fuzzy Extractor key reconstruction...',
    'Temporary session key K successfully reconstructed via BCH syndrome... [OK]',
    'Helper sending blinded grid index B = H\'(K, b || "Bob")... [Transmitted]',
    'Executing relational PostGIS spatial query on blinded grid cells... [Matched]',
    'Proximity verification complete. Issuing single-use JIT Trust Capsule... [Signed]',
    'Authenticating Trust Capsule (Ed25519-signed JWT) on-demand... [Pass]',
    'User checked in successfully! Safe zone verified.',
    'Deleting single-use Trust Capsule from Redis cache... [OK]',
    'Wiping ephemeral coordinate logs from database... [OK]',
    'System sanitized. Zero-Logs protocol complete. [Status: Offline]'
  ];

  // Simulator Effect
  useEffect(() => {
    let timer: any;
    if (isSimulating) {
      if (activeSimStep < timelineSteps.length) {
        timer = setTimeout(() => {
          // Add relevant logs
          const logIdxStart = activeSimStep * 2;
          const logsToAdd = logMessages.slice(logIdxStart, logIdxStart + 2);
          setSimLogs(prev => [...prev, ...logsToAdd]);
          
          setActiveSimStep(prev => prev + 1);
        }, 3000);
      } else {
        // Final completion logs
        timer = setTimeout(() => {
          setSimLogs(prev => [...prev, logMessages[11], logMessages[12]]);
          setIsSimulating(false);
        }, 2000);
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulating, activeSimStep]);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setActiveSimStep(1);
    setSimLogs([logMessages[0], logMessages[1]]);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setActiveSimStep(0);
    setSimLogs([]);
  };

  return (
    <div id="how-it-works-page" className="space-y-24 pb-20">
      
      {/* Intro Header */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-red/10 rounded border border-brand-red/20">
          <Cpu className="h-4 w-4 text-brand-red" />
          <span className="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">Protocol Architecture</span>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-brand-black tracking-tight">
          How It Works & The <span className="text-brand-red">Connify Protocol</span>
        </h1>

        <p className="font-sans text-brand-muted text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          Connify utilizes state-of-the-art cryptography, decentralized coordination mechanisms, and ephemeral routing networks to safeguard individual privacy while securing real-world rescue paths.
        </p>
      </section>

      {/* SHARP Protocol & Zero-Trust Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface border-2 border-brand-black rounded-xl p-8 sm:p-10 shadow-[6px_6px_0px_rgba(27,27,27,1)] relative overflow-hidden space-y-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-red/10 rounded border border-brand-red/20">
                <Lock className="h-4 w-4 text-brand-red" />
                <span className="font-mono text-[10px] font-bold text-brand-red uppercase tracking-widest">Zero-Trust Identity Protocol</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl text-brand-black leading-tight">
                Not Just an App — It's a <span className="text-brand-red">Protocol implemented as an App</span>
              </h2>
              <p className="font-sans text-sm text-brand-muted leading-relaxed font-medium">
                Connify is built directly on decentralized zero-trust identity patterns—specifically <strong>episode-as-identity</strong>, <strong>capsule-as-credential</strong>, <strong>Just-In-Time (JIT) issuance</strong>, and <strong>selective disclosure</strong>. Carefully adapted for a high-integrity consumer safety context rather than a complex multi-agent AI framework, this zero-trust architecture is optimized for a native smartphone experience—powering a robust <strong>React Native + Expo mobile application</strong> ready for rapid iOS and Android deployment.
              </p>

              {/* Zero-Trust Concept Grid */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-brand-beige rounded border border-brand-black/10 space-y-2">
                  <div className="flex items-center space-x-2 text-brand-red font-bold font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-red" />
                    <span>SHARP PROXIMITY VERIFICATION</span>
                  </div>
                  <p className="font-sans text-[11px] text-brand-muted leading-relaxed font-medium">
                    Enables peer-to-peer relative proximity calculations over low-energy radio bands. Peers check each other's security status without ever disclosing precise GPS coordinate logs or real-world identities.
                  </p>
                </div>

                <div className="p-4 bg-brand-beige rounded border border-brand-black/10 space-y-2">
                  <div className="flex items-center space-x-2 text-brand-red font-bold font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-red" />
                    <span>DECENTRALIZED IDENTIFIERS (DIDs)</span>
                  </div>
                  <p className="font-sans text-[11px] text-brand-muted leading-relaxed font-medium">
                    Devices generate self-sovereign cryptographic DIDs on the local secure enclave. These credentials allow you to sign safety requests without depending on central login databases.
                  </p>
                </div>

                <div className="p-4 bg-brand-beige rounded border border-brand-black/10 space-y-2">
                  <div className="flex items-center space-x-2 text-brand-red font-bold font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-red" />
                    <span>VERIFIABLE CREDENTIALS (VCs)</span>
                  </div>
                  <p className="font-sans text-[11px] text-brand-muted leading-relaxed font-medium">
                    Neighbourhood guardians and local storefronts submit vetted background check assertions. These are compiled into tamper-proof, cryptographic credentials that can be instantly verified on-mesh.
                  </p>
                </div>

                <div className="p-4 bg-brand-beige rounded border border-brand-black/10 space-y-2">
                  <div className="flex items-center space-x-2 text-brand-red font-bold font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-brand-red" />
                    <span>JUST-IN-TIME (JIT) CREDENTIALS</span>
                  </div>
                  <p className="font-sans text-[11px] text-brand-muted leading-relaxed font-medium">
                    When deviation is triggered, closest responders receive short-lived, single-use keys to view local path routes. These ephemeral credentials self-destruct upon safe destination check-in.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-brand-beige border-2 border-brand-black rounded-xl p-6 shadow-[4px_4px_0px_#1b1b1b] space-y-6">
              <span className="font-mono text-[10px] font-bold text-brand-muted uppercase block">ARCHITECTURAL MAPPING</span>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-brand-black/10 pb-2">
                  <span className="font-sans text-xs font-bold text-brand-black">ZERO-TRUST IDENTITY PATTERN</span>
                  <span className="font-sans text-xs font-bold text-brand-red">CONNIFY NATIVE MOBILE DESIGN</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-brand-muted font-bold">Episode-as-Identity</span>
                    <span className="text-brand-black font-bold">P2P Ephemeral Verification</span>
                  </div>
                  <div className="w-full bg-white h-1 border border-brand-black/5 rounded overflow-hidden">
                    <div className="bg-brand-red h-full w-[95%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-brand-muted font-bold">Capsule-as-Credential</span>
                    <span className="text-brand-black font-bold">Sponsor-Vetted Guardians</span>
                  </div>
                  <div className="w-full bg-white h-1 border border-brand-black/5 rounded overflow-hidden">
                    <div className="bg-brand-red h-full w-[90%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-brand-muted font-bold">Just-in-Time (JIT) Issuance</span>
                    <span className="text-brand-black font-bold">Zero-Knowledge Route Corridor</span>
                  </div>
                  <div className="w-full bg-white h-1 border border-brand-black/5 rounded overflow-hidden">
                    <div className="bg-brand-red h-full w-[100%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-brand-muted font-bold">Selective Disclosure</span>
                    <span className="text-brand-black font-bold">Instant Resolution Wiping</span>
                  </div>
                  <div className="w-full bg-white h-1 border border-brand-black/5 rounded overflow-hidden">
                    <div className="bg-brand-red h-full w-[100%]" />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-brand-black/10 rounded text-[10px] font-mono text-brand-muted leading-relaxed font-bold">
                // The result is absolute data sovereignty. A civilian safety network that operates on cryptographic trust matrices to keep users completely safe.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Timeline Step Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.id} 
                className="bg-brand-surface border-2 border-brand-black rounded p-6 space-y-4 relative overflow-hidden flex flex-col justify-between shadow-[4px_4px_0px_rgba(27,27,27,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_rgba(27,27,27,1)] transition-all"
              >
                {/* Step indicator */}
                <div className="absolute top-4 right-4 font-mono font-black text-brand-black/10 text-2xl select-none">
                  0{step.id}
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-brand-red/10 rounded border border-brand-red/30 text-brand-red w-fit">
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="block font-mono text-[10px] text-brand-red font-bold tracking-wider uppercase">{step.sub}</span>
                    <h3 className="font-display font-bold text-lg text-brand-black leading-tight">{step.title}</h3>
                  </div>

                  <p className="font-sans text-xs text-brand-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-black/10 mt-4">
                  <span className="block font-mono text-[9px] text-brand-muted font-bold uppercase">ENGINE PARAMETER:</span>
                  <span className="block font-mono text-[10px] text-brand-red mt-0.5 font-bold">{step.techDetail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Lifecycle Simulation Sandbox */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface border-2 border-brand-black rounded-xl overflow-hidden shadow-[6px_6px_0px_rgba(27,27,27,1)] grid lg:grid-cols-12 gap-0">
          
          {/* Visual Simulator Frame */}
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-brand-black/10 relative">
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <span className="font-mono text-[10px] font-bold text-brand-red uppercase tracking-widest bg-brand-red/5 px-2.5 py-1 rounded border border-brand-red/20">Simulated Mesh Engine</span>
              <h2 className="font-display font-extrabold text-3xl text-brand-black">Interactive Incident Simulator</h2>
              <p className="font-sans text-sm text-brand-muted">
                Trigger a mock safety divergence incident. See how zero-knowledge signatures, secure geo-bounding, and localized neighborhood mesh routing respond dynamically.
              </p>
            </div>

            {/* Simulated Live Visual Screen */}
            <div className="bg-white border-2 border-brand-black rounded-xl p-6 min-h-[220px] flex items-center justify-center relative overflow-hidden shadow-inner">
              <AnimatePresence mode="wait">
                
                {/* IDLE SIMULATION SCREEN */}
                {activeSimStep === 0 && (
                  <motion.div 
                    key="sim-idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="p-3 bg-brand-beige border border-brand-black/10 text-brand-muted w-fit mx-auto rounded">
                      <Cpu className="h-8 w-8 text-brand-muted" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-brand-black">Safety Engine Offline</span>
                      <span className="block text-xs text-brand-muted">Initiate the incident lifecycle test to boot the secure handshake.</span>
                    </div>
                    <button
                      onClick={handleStartSimulation}
                      className="px-6 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-xs rounded border-2 border-brand-black shadow-[3px_3px_0px_#1b1b1b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_#1b1b1b] transition-all cursor-pointer flex items-center space-x-1.5 mx-auto"
                    >
                      <Play className="h-4 w-4 fill-white text-white" />
                      <span>TRIGGER LIFE INCIDENT</span>
                    </button>
                  </motion.div>
                )}

                {/* ACTIVE SIMULATION SCREEN */}
                {activeSimStep > 0 && (
                  <motion.div 
                    key="sim-active"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col justify-between space-y-6"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 bg-brand-red rounded-full animate-ping" />
                        <span className="font-mono text-[10px] text-brand-red font-bold uppercase tracking-widest">RUNNING PROTOCOL SECURELY</span>
                      </div>
                      <span className="font-mono text-brand-muted text-[10px] font-bold">PHASE {activeSimStep} / 5</span>
                    </div>

                    {/* Progress visual list of nodes */}
                    <div className="grid grid-cols-5 gap-3 relative">
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-brand-beige border-b border-brand-black/15 -translate-y-1/2 z-0" />
                      {timelineSteps.map((step) => {
                        const StepIcon = step.icon;
                        const isPast = activeSimStep > step.id;
                        const isCurrent = activeSimStep === step.id;
                        return (
                          <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded border-2 flex items-center justify-center transition-all ${
                              isPast 
                                ? 'bg-brand-red border-brand-black text-white font-bold' 
                                : isCurrent 
                                ? 'bg-white border-brand-red text-brand-red animate-pulse font-bold'
                                : 'bg-brand-beige border-brand-black/20 text-brand-muted font-bold'
                            }`}>
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <span className={`block font-mono text-[8px] mt-1.5 text-center font-bold truncate w-full ${
                              isCurrent ? 'text-brand-red' : isPast ? 'text-brand-black' : 'text-brand-muted'
                            }`}>
                              PHASE_0{step.id}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active phase text and parameter */}
                    <div className="p-4 bg-brand-beige border border-brand-black/10 rounded space-y-1">
                      <span className="font-mono text-[9px] text-brand-red font-bold uppercase block">CURRENT STATE OUTCOME:</span>
                      <span className="block font-sans text-sm font-bold text-brand-black leading-tight">
                        {timelineSteps[activeSimStep - 1]?.title || 'Simulation Completed Successfully'}
                      </span>
                      <span className="block font-sans text-xs text-brand-muted font-medium italic">
                        {timelineSteps[activeSimStep - 1]?.sub}
                      </span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Sim Control Button Row */}
            {activeSimStep > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleResetSimulation}
                  className="px-5 py-3 bg-white hover:bg-brand-beige text-brand-muted hover:text-brand-black font-mono text-xs rounded border-2 border-brand-black shadow-[2px_2px_0px_#1b1b1b] transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>RESET LIFE CYCLE</span>
                </button>
                {activeSimStep === timelineSteps.length && !isSimulating && (
                  <span className="font-mono text-xs text-brand-red flex items-center space-x-1 animate-pulse font-bold">
                    <CheckCircle className="h-4 w-4 text-brand-red" />
                    <span>LIFECYCLE TEST COMPLETED SUCCESSFULLY</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Simulated Terminal Right Column */}
          <div className="lg:col-span-5 bg-brand-beige/20 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono text-brand-muted">
                <div className="flex items-center space-x-1.5">
                  <Terminal className="h-4 w-4 text-brand-red" />
                  <span className="font-bold uppercase text-brand-black">TELEMETRY LOGS</span>
                </div>
                <span className="text-[10px] font-semibold">v1.4_OUTPUT</span>
              </div>

              {/* Console Body */}
              <div className="bg-brand-black border-2 border-brand-black rounded p-5 h-72 font-mono text-[11px] text-emerald-400/90 overflow-y-auto space-y-2 shadow-[3px_3px_0px_rgba(27,27,27,0.15)]">
                {simLogs.length === 0 ? (
                  <div className="text-brand-muted/70 text-center py-20 italic font-sans text-xs">
                    Terminal idle. Click "Trigger Life Incident" to pipe active mesh telemetry packets here.
                  </div>
                ) : (
                  simLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="text-emerald-500 font-bold select-none">&gt;</span>
                      <p className="leading-relaxed break-all text-emerald-400">{log}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-white border-2 border-brand-black rounded shadow-[3px_3px_0px_#1b1b1b] space-y-1.5 text-xs font-sans">
              <span className="font-bold text-brand-black block">Audit-Ready EPHEMERAL-KEY-SYNC</span>
              <span className="text-brand-muted block leading-relaxed font-medium">
                As verified by our public design audits, telemetry packets are only retained in volatile on-device RAM. No cloud logging databases exist.
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
