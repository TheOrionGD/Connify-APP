import React, { useState } from 'react';
import { 
  ShieldCheck, Smartphone, Radio, Users, CheckCircle, 
  Play, RotateCcw, Cpu, Lock, Key, ChevronRight, Terminal, RefreshCw, FileText, CheckCircle2, Shield,
  Layers3, LayoutGrid
} from 'lucide-react';
import CardSwipeDeck from './CardSwipeDeck';

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
  const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
  const [simLogs, setSimLogs] = useState<string[]>([
    '[INIT] Connify Zero-Trust Protocol Engine initialized.',
    '[READY] Select a lifecycle stage or click "Run Simulated Telemetry" below.'
  ]);

  const timelineSteps: TimelineStep[] = [
    {
      id: 1,
      title: 'Signed SOS Beacon Dispatch',
      sub: 'Ed25519 Signature & Blinded Grid Token',
      desc: 'When distress is triggered, Phone A hashes GPS coordinates into an obfuscated regional grid cell token, signs the payload with its sovereign Ed25519 key, and broadcasts the beacon in < 500ms.',
      icon: Key,
      techDetail: 'Ed25519 Sovereign Signature + Blinded Spatial Token'
    },
    {
      id: 2,
      title: 'Mesh Peer & Helper Discovery',
      sub: 'Proximity Radius Filter & Real-Time Socket Match',
      desc: 'The Render backend indexes the blinded cell and emits an emergency_broadcast event to all authenticated volunteer nodes within the selected radius (e.g. 500m). Nearby Phone B receives the card.',
      icon: Users,
      techDetail: 'Real-Time WebSocket Mesh + Geographic Radius Routing'
    },
    {
      id: 3,
      title: 'Offline Proximity QR Handshake',
      sub: 'Mutual Challenge-Response Identity Verification',
      desc: 'Upon arrival, Phone A presents a single-use signed QR challenge. Phone B scans the code with its camera, executing an offline signature verification that eliminates impersonation and false alarms.',
      icon: Radio,
      techDetail: 'Offline Dynamic QR Challenge-Response Protocol'
    },
    {
      id: 4,
      title: 'Active Episode & 15s Watchdog',
      sub: 'Live Assistance & Multi-Channel Failover',
      desc: 'Both nodes enter the active assistance session with a countdown timer. If GPS heartbeat drops for >15s, automated multi-channel FCM notifications and guardian SMS alerts dispatch with last known coordinates.',
      icon: ShieldCheck,
      techDetail: 'Active Session Countdown + 15s Guardian Failover Watchdog'
    },
    {
      id: 5,
      title: 'Resolution & Ephemeral Data Purge',
      sub: 'Immutable Audit Ledger & Zero Residual Trace',
      desc: 'Once safety is confirmed ("I\'m Safe"), an anonymized hash digest commits to the SQLite Merkle DAG audit ledger, and all temporary routing tokens and tracking coordinates are permanently purged.',
      icon: CheckCircle2,
      techDetail: 'SHA3-256 Merkle DAG Hash Commit + Instant Memory Purge'
    }
  ];

  const fullLogSequence = [
    '[00:01] Initializing zero-trust emergency broadcast handshake...',
    '[00:02] Deriving deterministic Ed25519 node keypair & blinded cell token... [OK]',
    '[00:03] Emergency episode created: UUIDv4 registered to isolate transactional identity... [OK]',
    '[00:04] Broadcasting signed SOS payload over WebSocket mesh channel... [Active]',
    '[00:05] Nearby volunteer node (Phone B) discovered within 500m radius... [Matched]',
    '[00:06] Phone B accepted request: Generating single-use proximity QR challenge... [Ready]',
    '[00:07] Phone B arrived on scene. Scanning QR challenge code via camera...',
    '[00:08] Mutual Ed25519 signature challenge verified offline... [Authenticated]',
    '[00:09] 10-Minute active assistance timer unlocked on both devices... [Live]',
    '[00:10] Satellite GPS watchdog monitoring location heartbeat (5s atomic sync)... [Healthy]',
    '[00:11] Requester taps "I\'M SAFE": Initializing episode resolution sequence... [Triggered]',
    '[00:12] Canonical digest hashed with SHA3-256 and committed to immutable DAG ledger... [Committed]',
    '[00:13] Purging transient grid-cell routing tokens and ephemeral coordinates... [Purged]',
    '[00:14] Zero-trace cleanup verified. No residual tracking records stored. [Zero-Knowledge]',
    '[00:15] System sanitized. Ready for next peer safety cycle. [Offline]'
  ];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setActiveSimStep(0);
    setSimLogs(['[SIMULATION STARTED] Executing 5-stage zero-trust emergency lifecycle...']);

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
    }, 1400);
  };

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setActiveSimStep(0);
    setSimLogs([
      '[RESET] Simulator reset to standby state.',
      '[READY] Select a lifecycle stage or click "Run Simulated Telemetry" below.'
    ]);
  };

  const handleExportLogs = () => {
    const text = simLogs.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'connify-telemetry-log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex justify-center py-6 md:py-10">
      <section className="relative w-full max-w-[1150px] rounded-[32px] bg-[#12141d]/90 backdrop-blur-xl text-white p-6 md:p-8 lg:p-10 shadow-2xl border border-white/15 overflow-hidden font-sans">
        
        {/* Background ambient lighting */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 gap-4">
            <div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400 text-xs font-bold uppercase tracking-wider w-fit mb-3">
                <Shield className="w-3.5 h-3.5" />
                <span>Zero-Trust Protocol Mechanics</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display drop-shadow-md flex items-center gap-3 flex-wrap">
                <span>How Phone A &amp; Phone B</span> <span className="text-rose-500 font-extrabold flex items-center gap-1.5"><Smartphone className="h-8 w-8 text-rose-500" /> Coordinate Safety</span>
              </h2>
              <p className="text-slate-300 text-sm mt-2 max-w-xl font-normal leading-relaxed">
                A 5-stage zero-knowledge emergency lifecycle ensuring rapid peer response without central surveillance or persistent location tracking.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-[#090a0f] p-1 rounded-xl border border-white/10 shadow-inner">
                <button
                  onClick={() => setViewMode('swipe')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'swipe' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Swipe Deck"
                >
                  <Layers3 className="w-3.5 h-3.5" />
                  <span>Swipe Deck</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'grid' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isSimulating ? 'SIMULATING...' : 'RUN SIMULATION'}</span>
              </button>
              <button
                onClick={handleResetSimulation}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 shadow-sm transition-all cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Swipe Deck Mode for Zero-Trust Protocol Mechanics */}
          {viewMode === 'swipe' ? (
            <div className="mb-8">
              <CardSwipeDeck
                items={timelineSteps}
                stackHeight="h-[390px]"
                badgeText="Swipe stages or click arrows"
                renderCard={(step, isTop) => {
                  const IconComp = step.icon;

                  return (
                    <div className={`w-full h-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden relative text-slate-900 ${
                      isTop ? 'ring-2 ring-rose-500/20' : ''
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 shadow-sm flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-600" /> STAGE 0{step.id} OF 05
                          </span>
                          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shadow-sm">
                            <IconComp className="w-6 h-6" />
                          </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 leading-snug font-display">{step.title}</h3>
                        <p className="text-xs text-rose-600 font-bold mb-3">{step.sub}</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{step.desc}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-700">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-cyan-600" /> SPEC PROTOCOL:
                        </span>
                        <span className="text-cyan-700 font-bold truncate max-w-[240px] flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> {step.techDetail}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          ) : (
            /* 5-Stage Step Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {timelineSteps.map((step) => {
                const IconComp = step.icon;
                const isActive = activeSimStep === step.id;
                const isPast = activeSimStep > step.id;

                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveSimStep(step.id)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-white border-rose-500 shadow-xl ring-2 ring-rose-500/20 -translate-y-1'
                        : isPast
                        ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-lg'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isActive
                            ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold'
                            : isPast
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          STAGE 0{step.id}
                        </span>
                        <div className={`p-2 rounded-xl border ${
                          isActive
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">{step.title}</h3>
                      <p className="text-[11px] text-rose-600 font-bold mb-2">{step.sub}</p>
                      <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{step.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-600 font-semibold truncate flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-cyan-600 shrink-0" />
                      <span className="truncate">{step.techDetail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Telemetry Console */}
          <div className="rounded-2xl bg-[#090a0f] border border-white/15 p-4 font-mono text-xs overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-4 h-4 text-rose-400" />
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-200">Live Peer Telemetry Stream</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportLogs}
                  className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Export telemetry log file"
                >
                  <FileText className="w-3 h-3 text-cyan-400" /> Export Log
                </button>
                <button
                  onClick={handleResetSimulation}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  title="Refresh stream"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" /> Clear
                </button>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-slate-400">Node Sync: 60 FPS</span>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin text-slate-300">
              {simLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={
                    log.includes('[OK]') || log.includes('[Pass]') || log.includes('[Authenticated]') || log.includes('[Committed]')
                      ? 'text-emerald-400 font-semibold'
                      : log.includes('[SIMULATION STARTED]') || log.includes('[Active]') || log.includes('[Triggered]')
                      ? 'text-rose-400 font-semibold'
                      : log.includes('[Zero-Knowledge]') || log.includes('[Sanitized]')
                      ? 'text-cyan-400 font-semibold'
                      : 'text-slate-300'
                  }>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
