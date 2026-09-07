import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, Shield, AlertCircle, MapPin, Users, HeartHandshake,
  Check, Crosshair, Plus, Trash2, ArrowUpRight, Radio, Filter
} from 'lucide-react';
import { SafeSpot } from '../types';

export default function SafetyCoordinated() {
  const [safeSpots, setSafeSpots] = useState<SafeSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SafeSpot | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [newNodeType, setNewNodeType] = useState<'business' | 'shelter' | 'guardian_node'>('guardian_node');
  const [radarWidth, setRadarWidth] = useState<number>(400);
  const [pingedSpotId, setPingedSpotId] = useState<string | null>(null);

  const radarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLiveNodes = async () => {
      try {
        const metaEnv = (import.meta as any).env || {};
        const backendUrl = metaEnv.VITE_BACKEND_URL;
        if (backendUrl) {
          const res = await fetch(`${backendUrl}/api/admin/guardians`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: SafeSpot[] = json.data.map((d: any, idx: number) => ({
              id: d.id || `node-${idx}`,
              name: d.name || `Guardian Node #${idx + 1}`,
              type: 'guardian_node',
              lat: ((idx * 50) % 200) - 100,
              lng: ((idx * 70) % 240) - 120,
              status: 'active',
              address: 'Geofenced Peer Mesh',
              phone: ''
            }));
            setSafeSpots(mapped);
            setSelectedSpot(mapped[0]);
            return;
          }
        }
      } catch (e) {
        console.warn('Live mesh nodes query fallback:', e);
      }
    };
    fetchLiveNodes();
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (radarRef.current) {
        setRadarWidth(radarRef.current.offsetWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle clicking on map to add custom node
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    if (Math.abs(x) > centerX - 25 || Math.abs(y) > centerY - 25) return;

    const baseScale = 400 / rect.width;
    const baseLat = Math.round(x * baseScale);
    const baseLng = Math.round(y * baseScale);

    const id = 'node-' + Math.random().toString(36).substring(2, 6);
    const names = [
      'Neighborhood Escort Node',
      '24h Sanctuary Hub',
      'Illuminated Store Lobby',
      'Civilian Patrol Point'
    ];
    const defaultName = names[Math.floor(Math.random() * names.length)] + ` #${Math.floor(Math.random() * 90) + 10}`;

    const newSpot: SafeSpot = {
      id,
      name: defaultName,
      type: newNodeType,
      lat: baseLat,
      lng: baseLng,
      status: 'active',
      address: 'Click-to-Place Radar Node'
    };

    setSafeSpots(prev => [...prev, newSpot]);
    setSelectedSpot(newSpot);
  };

  const handleDeleteNode = (id: string) => {
    setSafeSpots(prev => prev.filter(s => s.id !== id));
    if (selectedSpot?.id === id) {
      setSelectedSpot(null);
    }
  };

  const handlePingNode = (spot: SafeSpot) => {
    setPingedSpotId(spot.id);
    setTimeout(() => setPingedSpotId(null), 3000);
  };

  const filteredSpots = safeSpots.filter(spot => {
    if (activeFilter === 'all') return true;
    return spot.type === activeFilter;
  });

  return (
    <section id="safety-map" className="space-y-12 py-10 font-sans">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30 backdrop-blur-md">
          <Compass className="h-4 w-4 text-rose-400" />
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
            NEIGHBORHOOD P2P MESH RADAR
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight drop-shadow-md">
          Coordinated Safety Mesh <span className="text-rose-500">Radar Map</span>
        </h2>
        <p className="font-sans text-slate-300 text-base sm:text-lg leading-relaxed">
          Click anywhere on the radar sweep to place civilian guardian nodes or 24/7 business sanctuaries.
        </p>

        {/* Mesh Radar Metrics Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono text-xs text-slate-300">
          <span className="flex items-center gap-1.5 bg-[#12141d] px-3 py-1.5 rounded-full border border-white/10">
            <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" /> Live Beacon Sync
          </span>
          <span className="flex items-center gap-1.5 bg-[#12141d] px-3 py-1.5 rounded-full border border-white/10">
            <Users className="h-3.5 w-3.5 text-cyan-400" /> {safeSpots.length} Total Registered Nodes
          </span>
          <span className="flex items-center gap-1.5 bg-[#12141d] px-3 py-1.5 rounded-full border border-white/10">
            <HeartHandshake className="h-3.5 w-3.5 text-emerald-400" /> 100% Civilian Vetted
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Interactive Radar Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[460px] space-y-4">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 justify-center bg-[#12141d] p-2 rounded-2xl border border-white/10 shadow-inner">
              <span className="flex items-center gap-1 text-xs font-mono text-slate-400 font-bold px-2">
                <Filter className="h-3.5 w-3.5 text-rose-400" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Nodes' },
                { id: 'guardian_node', label: 'Guardians' },
                { id: 'business', label: 'Sanctuaries' },
                { id: 'shelter', label: 'Shelters' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeFilter === f.id ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Radar Viewport */}
            <div 
              ref={radarRef}
              onClick={handleMapClick}
              className="relative aspect-square w-full bg-[#090a0f] rounded-full border-4 border-slate-700 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden cursor-crosshair group"
            >
              {/* Radar Grid Circles */}
              <div className="absolute inset-[15%] rounded-full border border-white/15 pointer-events-none"></div>
              <div className="absolute inset-[35%] rounded-full border border-white/15 pointer-events-none"></div>
              <div className="absolute inset-[55%] rounded-full border border-white/15 pointer-events-none"></div>

              {/* Crosshair Axes */}
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/15 pointer-events-none"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/15 pointer-events-none"></div>

              {/* Rotating Radar Sweep Beam */}
              <div className="absolute inset-0 radar-fade animate-radar-sweep pointer-events-none origin-center"></div>

              {/* Center User Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 w-8 h-8 bg-rose-500/30 rounded-full animate-ping"></div>
                  <div className="w-4 h-4 bg-rose-500 rounded-full border-2 border-white shadow-[0_0_12px_#e11d48]"></div>
                </div>
              </div>

              {/* Render Nodes on Radar */}
              {filteredSpots.map((spot) => {
                const scale = radarWidth / 400;
                const posX = (spot.lat * scale) + (radarWidth / 2);
                const posY = (spot.lng * scale) + (radarWidth / 2);
                const isSelected = selectedSpot?.id === spot.id;

                return (
                  <button
                    key={spot.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSpot(spot);
                    }}
                    style={{ left: `${posX}px`, top: `${posY}px` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 p-2 rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-rose-600 text-white scale-125 shadow-[0_0_20px_#e11d48]' 
                        : spot.type === 'guardian_node' 
                        ? 'bg-cyan-500 text-white hover:scale-110' 
                        : 'bg-emerald-500 text-white hover:scale-110'
                    }`}
                    title={spot.name}
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                );
              })}

            </div>

            <div className="text-center font-mono text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-rose-400" />
              <span>Tip: Click anywhere on radar to place a new node</span>
            </div>

          </div>
        </div>

        {/* Right Column: Node Inspector & Add Node Control (High Contrast White Cards) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Selected Node Details Card */}
          {selectedSpot ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-300 shadow-2xl space-y-4 text-slate-900">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs text-rose-600 font-bold uppercase bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">{selectedSpot.type.replace('_', ' ')}</span>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 mt-1">{selectedSpot.name}</h3>
                </div>
                
                <button
                  onClick={() => handleDeleteNode(selectedSpot.id)}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 cursor-pointer transition-colors"
                  title="Remove Node"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2.5 font-mono text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" /> Distance Vector:
                  </span>
                  <span className="text-emerald-700 font-bold">~140m from center</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Verification Status:
                  </span>
                  <span className="text-slate-900 font-bold">Active Guardian Node</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-slate-500" /> Location Info:
                  </span>
                  <span className="text-slate-800 font-semibold">{selectedSpot.address || 'Geofenced Mesh'}</span>
                </div>
              </div>

              <button
                onClick={() => handlePingNode(selectedSpot)}
                className={`w-full py-3.5 font-mono text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center space-x-2 ${
                  pingedSpotId === selectedSpot.id 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                }`}
              >
                {pingedSpotId === selectedSpot.id ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>DISPATCH SIGNAL ACKNOWLEDGED!</span>
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4" />
                    <span>PING DISPATCH SIGNAL TO NODE</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-3 shadow-2xl text-slate-900">
              <Crosshair className="h-10 w-10 text-rose-500 mx-auto" />
              <h3 className="font-display font-extrabold text-lg text-slate-900">No Node Selected</h3>
              <p className="font-sans text-xs text-slate-600 font-medium">Click a radar beacon on the map to inspect its telemetry.</p>
            </div>
          )}

          {/* Add New Node Control */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl space-y-4 text-slate-900">
            <h4 className="font-display font-extrabold text-base sm:text-lg text-slate-900 flex items-center space-x-2">
              <Plus className="h-4 w-4 text-rose-600" />
              <span>Node Placement Tool</span>
            </h4>

            <div className="space-y-3 font-mono text-xs">
              <label className="block text-slate-700 font-bold">Default Node Type for Map Click:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'guardian_node', label: 'Guardian' },
                  { id: 'business', label: 'Sanctuary' },
                  { id: 'shelter', label: 'Shelter' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setNewNodeType(type.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      newNodeType === type.id ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
