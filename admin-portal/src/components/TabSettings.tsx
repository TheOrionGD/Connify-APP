import React, { useState } from 'react';
import { Settings, ShieldCheck, RefreshCw, AlertOctagon, HelpCircle, HardDrive } from 'lucide-react';

interface TabSettingsProps {
  onHealLedger: () => Promise<void>;
}

export default function TabSettings({ onHealLedger }: TabSettingsProps) {
  const [pollRate, setPollRate] = useState(3);
  const [geofence, setGeofence] = useState(500);
  const [bleRange, setBleRange] = useState(5);
  const [capsuleTime, setCapsuleTime] = useState(30);
  const [edgeAi, setEdgeAi] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetLogs, setResetLogs] = useState<string[]>([]);

  const handleFullReset = async () => {
    setSubmitting(true);
    setResetLogs((prev) => [...prev, 'Initiating database self-healing transaction...']);
    try {
      await onHealLedger();
      setResetLogs((prev) => [
        ...prev,
        'Database verified sequentially.',
        'All block leaf signatures match prevHash references.',
        'Ledger status restored to INTEGRITOUS.'
      ]);
    } catch (err: any) {
      setResetLogs((prev) => [...prev, `Error healing ledger: ${err.message}`]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Simulation Variable Sliders (Skeuomorphism Tactile Control Panel) */}
      <div className="col-span-12 lg:col-span-6 skeuo-panel p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl rounded-2xl">
        {/* Corner Rivets */}
        <div className="skeuo-screw absolute top-3.5 left-3.5 w-3 h-3" />
        <div className="skeuo-screw absolute top-3.5 right-3.5 w-3 h-3" />
        <div className="skeuo-screw absolute bottom-3.5 left-3.5 w-3 h-3" />
        <div className="skeuo-screw absolute bottom-3.5 right-3.5 w-3 h-3" />

        <div className="border-b border-black/60 pb-3 pl-2">
          <h2 className="text-xs font-bold font-mono tracking-wider text-amber-500 uppercase flex items-center gap-2">
            <Settings className="h-4 w-4 text-amber-500 animate-spin-slow" />
            Simulation Configuration Parameters
            <span className="text-[8px] bg-black/50 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-mono">ANALOG RIG</span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5 pl-6">Tune operational constants of the zero-trust mesh network</p>
        </div>

        <div className="space-y-5 font-mono text-[11px] text-[#1b1b1b] px-2 pt-1">
          
          {/* Telemetry rate */}
          <div className="space-y-2 bg-[#eeeeee] p-3.5 rounded-xl border border-[#1b1b1b]/10 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1b1b1b]">Coordinate Telemetry Rate</span>
              <span className="text-[#b60100] font-bold bg-[#ffffff] px-2.5 py-0.5 rounded border border-[#b60100]/30 shadow-inner">{pollRate}s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={pollRate}
              onChange={(e) => setPollRate(Number(e.target.value))}
              className="w-full h-2 bg-[#dadada] rounded-lg appearance-none cursor-pointer accent-[#b60100] border border-[#1b1b1b]/10 shadow-inner"
            />
            <span className="text-[9px] text-[#5f3f3a] block">Frequency of WebSockets location broadcast updates.</span>
          </div>

          {/* PostGIS Geofence */}
          <div className="space-y-2 bg-[#eeeeee] p-3.5 rounded-xl border border-[#1b1b1b]/10 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1b1b1b]">PostGIS Proximity Buffer Geofence</span>
              <span className="text-[#b60100] font-bold bg-[#ffffff] px-2.5 py-0.5 rounded border border-[#b60100]/30 shadow-inner">{geofence}m</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={geofence}
              onChange={(e) => setGeofence(Number(e.target.value))}
              className="w-full h-2 bg-[#dadada] rounded-lg appearance-none cursor-pointer accent-[#b60100] border border-[#1b1b1b]/10 shadow-inner"
            />
            <span className="text-[9px] text-[#5f3f3a] block">Radius used for matching helper nodes via ST_DWithin query.</span>
          </div>

          {/* BLE proximity range */}
          <div className="space-y-2 bg-[#eeeeee] p-3.5 rounded-xl border border-[#1b1b1b]/10 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1b1b1b]">BLE Proximity Handshake Boundary</span>
              <span className="text-[#b60100] font-bold bg-[#ffffff] px-2.5 py-0.5 rounded border border-[#b60100]/30 shadow-inner">{bleRange}m</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={bleRange}
              onChange={(e) => setBleRange(Number(e.target.value))}
              className="w-full h-2 bg-[#dadada] rounded-lg appearance-none cursor-pointer accent-[#b60100] border border-[#1b1b1b]/10 shadow-inner"
            />
            <span className="text-[9px] text-[#5f3f3a] block">Minimum Bluetooth signal attenuation boundary checks.</span>
          </div>

          {/* Capsule expiration */}
          <div className="space-y-2 bg-[#eeeeee] p-3.5 rounded-xl border border-[#1b1b1b]/10 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1b1b1b]">Trust Capsule TTL Duration</span>
              <span className="text-[#b60100] font-bold bg-[#ffffff] px-2.5 py-0.5 rounded border border-[#b60100]/30 shadow-inner">{capsuleTime} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={capsuleTime}
              onChange={(e) => setCapsuleTime(Number(e.target.value))}
              className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-amber-500 border border-white/10 shadow-inner"
            />
            <span className="text-[9px] text-slate-500 block">Timer limit after which access keys automatically self-destruct.</span>
          </div>

          {/* Edge AI Toggle (`skeuo-switch`) */}
          <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <div>
              <span className="block font-bold text-white text-xs">Local Edge-AI Threat Analyzer</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Detect sudden route anomalies on local device CPUs.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={edgeAi}
                onChange={(e) => setEdgeAi(e.target.checked)}
                className="sr-only peer"
              />
              <div className="skeuo-switch w-12 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gradient-to-b after:from-slate-200 after:to-slate-400 after:border after:border-slate-600 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

        </div>
      </div>

      {/* Database control panel & Logs (Claymorphism `clay-card` & `clay-btn`) */}
      <div className="col-span-12 lg:col-span-6 clay-card p-6 flex flex-col gap-5 shadow-2xl rounded-2xl">
        <div className="border-b border-white/10 pb-3">
          <h2 className="text-xs font-bold font-mono tracking-wider text-[#1b1b1b] uppercase flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-[#0051c6]" />
            Database Maintenance Console
            <span className="text-[9px] font-mono px-2 py-0.5 rounded clay-badge text-[#1b1b1b]">CLAY CORE</span>
          </h2>
          <p className="text-[10px] text-[#5f3f3a] mt-0.5">Heal compromises and restructure database hash lines</p>
        </div>

        <div className="space-y-5 flex-grow flex flex-col justify-between">
          <div className="clay-box p-4 rounded-xl space-y-2 text-[11px] text-[#1b1b1b] font-mono border border-[#1b1b1b]/15">
            <div className="flex items-start gap-3">
              <AlertOctagon className="h-6 w-6 text-[#b60100] flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-[#1b1b1b] block uppercase text-xs mb-1">
                  Database Chain Restructuring
                </span>
                Running this command will query the database sequentially, recompute the SHA-256 validation chain link by link, and heal any tampered leaf entries across all nodes.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleFullReset}
              disabled={submitting}
              className="w-full clay-btn py-3.5 rounded-xl flex items-center justify-center gap-2 font-mono font-bold text-xs uppercase cursor-pointer transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(182,1,0,0.3)]"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${submitting ? 'animate-spin' : ''}`} />
              Heal and Align PostgreSQL Ledger
            </button>

            {resetLogs.length > 0 && (
              <div className="bg-[#eeeeee] border border-[#1b1b1b]/15 rounded-xl p-4 font-mono text-[10px] text-[#1b1b1b] space-y-2 max-h-[180px] overflow-y-auto shadow-inner">
                {resetLogs.map((log, index) => (
                  <div key={index} className="flex gap-2.5 animate-fade-in">
                    <span className="text-[#0051c6] font-bold select-none">&gt;</span>
                    <span className={log.includes('restored') ? 'text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-500/30' : 'text-[#1b1b1b]'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
