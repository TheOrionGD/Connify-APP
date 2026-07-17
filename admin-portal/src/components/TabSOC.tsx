import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  MapPin,
  Clock,
  User,
  Shield,
  Zap,
  TrendingUp,
  Terminal,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Episode {
  id: string;
  category: string;
  urgency: number;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
}

interface TabSOCProps {
  episodes: Episode[];
  isOffline: boolean;
  onSimulateEpisode: (category: string, urgency: number) => Promise<void>;
  onSimulateCheckin: (episodeId: string) => Promise<void>;
  telemetryLogs: string[];
}

export default function TabSOC({
  episodes,
  isOffline,
  onSimulateEpisode,
  onSimulateCheckin,
  telemetryLogs,
}: TabSOCProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [simCategory, setSimCategory] = useState('emergency');
  const [simUrgency, setSimUrgency] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [telemetryLogs]);

  // Find active episodes to display on map
  const activeEpisodes = episodes.filter((ep) => ep.status === 'active' || ep.status === 'pending');

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 5) return 'text-red-500 bg-red-950/40 border border-red-900/40';
    if (urgency >= 4) return 'text-orange-500 bg-orange-950/40 border border-orange-900/40';
    return 'text-amber-500 bg-amber-950/40 border border-amber-900/40';
  };

  const handleCreateSimulation = async () => {
    setSubmitting(true);
    setActionSuccess(null);
    try {
      await onSimulateEpisode(simCategory, simUrgency);
      setActionSuccess(`Simulated ${simCategory.toUpperCase()} request generated successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckin = async (id: string) => {
    setSubmitting(true);
    setActionSuccess(null);
    try {
      await onSimulateCheckin(id);
      setSelectedEpisode(null);
      setActionSuccess('Safety Arrival Handshake verified. Episode completed.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Simulation Controls Banner (Skeuomorphic Tactical Hardware Panel + Claymorphism) */}
      <div className="col-span-12 skeuo-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Hardware Corner Screws */}
        <div className="absolute top-2.5 left-2.5 skeuo-screw" />
        <div className="absolute top-2.5 right-2.5 skeuo-screw" />
        <div className="absolute bottom-2.5 left-2.5 skeuo-screw" />
        <div className="absolute bottom-2.5 right-2.5 skeuo-screw" />

        <div className="pl-3">
          <h3 className="text-sm font-bold font-jakarta tracking-wide text-white flex items-center gap-2 uppercase">
            <Zap className="h-4 w-4 text-[#b60100] animate-pulse" />
            PROXIMITY SIMULATOR CONTROLS
            <span className="text-[9px] font-mono px-2 py-0.5 rounded clay-badge text-amber-400 border border-amber-500/30">HARDWARE NODE</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Inject mock rescue requests and check-in updates directly into the network.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 pr-3">
          <select
            value={simCategory}
            onChange={(e) => setSimCategory(e.target.value)}
            className="neuo-inset rounded-xl px-3 py-2 text-xs text-[#1b1b1b] font-mono focus:outline-none focus:ring-2 focus:ring-[#b60100]"
          >
            <option value="emergency">Emergency SOS</option>
            <option value="medical">Medical Alert</option>
            <option value="transport">Safe Transport</option>
            <option value="general">General Escort</option>
          </select>

          <select
            value={simUrgency}
            onChange={(e) => setSimUrgency(Number(e.target.value))}
            className="neuo-inset rounded-xl px-3 py-2 text-xs text-[#1b1b1b] font-mono focus:outline-none focus:ring-2 focus:ring-[#b60100]"
          >
            <option value="5">LVL 5 (Critical)</option>
            <option value="4">LVL 4 (High)</option>
            <option value="3">LVL 3 (Medium)</option>
            <option value="2">LVL 2 (Low)</option>
          </select>

          <button
            onClick={handleCreateSimulation}
            disabled={submitting}
            className="clay-btn px-5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(182,1,0,0.5)] flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" />
            Generate SOS
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="col-span-12 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 p-4 rounded-xl flex items-center gap-2 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400 animate-pulse" />
          {actionSuccess}
        </div>
      )}

      {/* SVG Interactive Map Grid (Holomorphism HUD Screen `holo-card` + `holo-corner`) */}
      <div className="col-span-12 lg:col-span-7 holo-card holo-corner p-5 flex flex-col gap-4 relative overflow-hidden min-h-[460px]">
        <div className="flex items-center justify-between z-10">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              Brooklyn Heights Proximity Mesh Grid
              <span className="text-[8px] holo-badge px-2 py-0.5 rounded">RADAR MESH</span>
            </h2>
            <p className="text-[10px] text-slate-400">Live SVG coordinate tracking node visualizer</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/40 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              BLE Nodes Active
            </span>
          </div>
        </div>

        {/* Map visual space */}
        <div className="flex-grow w-full relative bg-[#06080e] rounded-xl border border-cyan-500/20 overflow-hidden select-none shadow-inner">
          {/* Tactical grid background overlay */}
          <div className="absolute inset-0 grid-bg-dots-dark opacity-75" />

          {/* SVG Map Canvas */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Sector lines */}
            <line x1="25" y1="0" x2="25" y2="100" stroke="#00f0ff" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#00f0ff" strokeWidth="0.3" opacity="0.5" />
            <line x1="75" y1="0" x2="75" y2="100" stroke="#00f0ff" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />
            <line x1="0" y1="25" x2="100" y2="25" stroke="#00f0ff" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#00f0ff" strokeWidth="0.3" opacity="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#00f0ff" strokeWidth="0.15" strokeDasharray="1,1" opacity="0.3" />

            {/* Simulated Volunteer Nodes (static green dots) */}
            <circle cx="15" cy="20" r="1.2" fill="#10b981" opacity="0.7" className="animate-pulse" />
            <circle cx="35" cy="45" r="1.0" fill="#10b981" opacity="0.8" />
            <circle cx="70" cy="15" r="1.5" fill="#10b981" opacity="0.6" />
            <circle cx="85" cy="65" r="1.1" fill="#10b981" opacity="0.7" />
            <circle cx="55" cy="80" r="1.3" fill="#10b981" opacity="0.6" />
            <circle cx="30" cy="85" r="0.9" fill="#10b981" opacity="0.8" />
            <circle cx="80" cy="40" r="1.2" fill="#10b981" opacity="0.6" />

            {/* Active Episodes (pulsing red/amber rings) */}
            {activeEpisodes.map((ep) => {
              const mapX = Math.max(10, Math.min(90, ((ep.longitude - (-74.01)) / 0.04) * 100));
              const mapY = Math.max(10, Math.min(90, (1 - (ep.latitude - 40.68) / 0.03) * 100));
              
              const isSelected = selectedEpisode?.id === ep.id;
              const isCritical = ep.urgency >= 4;
              const accentColor = isCritical ? '#b60100' : '#d97706';

              return (
                <g
                  key={ep.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedEpisode(ep)}
                >
                  {/* Outer Proximity Geofence Buffer */}
                  <circle
                    cx={mapX}
                    cy={mapY}
                    r="8"
                    fill={accentColor}
                    fillOpacity="0.05"
                    stroke={accentColor}
                    strokeWidth="0.25"
                    strokeOpacity="0.3"
                    strokeDasharray="2,2"
                  />

                  {/* Pulsing Alert Wave */}
                  <circle
                    cx={mapX}
                    cy={mapY}
                    r="3.5"
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="0.5"
                    className="animate-ping"
                    style={{ animationDuration: '2.5s' }}
                  />

                  {/* Node core */}
                  <circle
                    cx={mapX}
                    cy={mapY}
                    r={isSelected ? '2.2' : '1.6'}
                    fill={accentColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '0.75' : '0.4'}
                  />
                </g>
              );
            })}
          </svg>

          {/* Map Overlay HUD Details (Glassmorphism & Holomorphism) */}
          {selectedEpisode && (
            <div className="absolute bottom-4 left-4 right-4 glass-panel holo-border rounded-xl p-4 z-20 shadow-2xl flex flex-col gap-2 font-mono text-[10px] animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 animate-pulse text-red-400" />
                  EPISODE HUD: {selectedEpisode.category}
                </span>
                <span className={`px-2 py-0.5 rounded ${getUrgencyColor(selectedEpisode.urgency)} text-[9px] font-bold`}>
                  URGENCY {selectedEpisode.urgency}/5
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[#1b1b1b] py-1">
                <div>ID: <code className="text-[#1b1b1b] font-bold select-all bg-[#e2e2e2] px-1 rounded">{selectedEpisode.id.substring(0, 16)}...</code></div>
                <div>STATUS: <span className="text-[#b60100] uppercase font-bold">{selectedEpisode.status}</span></div>
                <div>COORDINATES: <span className="text-[#0051c6] font-mono">{selectedEpisode.latitude.toFixed(5)}, {selectedEpisode.longitude.toFixed(5)}</span></div>
                <div>WINDOW: <span className="text-emerald-700 font-bold">30 MIN EXPIRY</span></div>
              </div>
              <div className="flex gap-2 mt-1 pt-2 border-t border-[#1b1b1b]/20">
                <button
                  onClick={() => handleCheckin(selectedEpisode.id)}
                  disabled={submitting}
                  className="flex-1 clay-btn py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(182,1,0,0.3)]"
                >
                  Force Safety Arrival
                </button>
                <button
                  onClick={() => setSelectedEpisode(null)}
                  className="neuo-btn px-4 py-1.5 rounded-lg text-[10px] uppercase text-[#1b1b1b] hover:bg-[#b60100] hover:text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!selectedEpisode && activeEpisodes.length > 0 && (
            <div className="absolute bottom-3 left-3 glass-pill px-3 py-1 text-[9px] font-mono text-cyan-300 z-10 pointer-events-none shadow-lg">
              Click on a pulsing radar node to audit telemetry
            </div>
          )}
        </div>
      </div>

      {/* Side Active Alerts & Telemetry logs */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
        
        {/* Active Episodes List (Holomorphism `holo-card-red`) */}
        <div className="holo-card-red p-5 flex flex-col gap-4 max-h-[220px]">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-red-400 uppercase flex items-center justify-between">
              <span>Mesh Active Buffer Feed</span>
              <span className="text-[8px] bg-red-950/60 text-red-300 px-2 py-0.5 rounded border border-red-500/40">LIVE ALERT</span>
            </h2>
            <p className="text-[10px] text-slate-400">Live pending check-ins in proximity mesh</p>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            {activeEpisodes.length === 0 ? (
              <div className="text-center py-6 text-slate-500 font-mono text-xs border border-dashed border-red-900/30 rounded-xl">
                No active tracking networks.
              </div>
            ) : (
              activeEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEpisode(ep)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    selectedEpisode?.id === ep.id
                      ? 'clay-box border-red-500 shadow-[0_0_15px_rgba(182,1,0,0.4)]'
                      : 'neuo-inset hover:border-red-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#b60100] animate-ping" />
                    <div>
                      <div className="text-xs font-bold font-mono text-white uppercase">
                        {ep.category}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {ep.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-mono font-bold ${getUrgencyColor(ep.urgency)} shadow-sm`}>
                    LVL {ep.urgency}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Console Telemetry Logs (Skeuomorphic Terminal + Neumorphism Debossed Screen) */}
        <div className="skeuo-panel p-5 flex flex-col gap-3 flex-grow min-h-[200px] max-h-[300px] relative">
          <div className="absolute top-2 right-2 skeuo-screw" />
          
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold font-mono tracking-wider text-[#1b1b1b] uppercase flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#b60100]" />
              Secure Telemetry Console
            </h2>
            <span className="text-[9px] text-[#0051c6] font-bold font-mono uppercase bg-[#dae2ff] px-2 py-0.5 rounded border border-[#0051c6]/30">
              100ms cycle
            </span>
          </div>

          <div className="flex-grow neuo-inset rounded-xl p-3 overflow-y-auto font-mono text-[10px] text-[#1b1b1b] space-y-1.5 custom-scroll-hide border border-[#1b1b1b]/10">
            {telemetryLogs.map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-[#0051c6] select-none font-bold">[{index.toString().padStart(2, '0')}]</span>
                <span className={log.includes('⚠️') ? 'text-[#ba1a1a] font-bold' : log.includes('🔐') ? 'text-emerald-700 font-bold' : 'text-[#1b1b1b]'}>
                  {log}
                </span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        </div>

      </div>

    </div>
  );
}
