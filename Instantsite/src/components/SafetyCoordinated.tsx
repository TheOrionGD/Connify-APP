import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, Shield, AlertCircle, MapPin, Users, HeartHandshake,
  Check, Crosshair, Plus, Trash2, ArrowUpRight, Radio, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SafeSpot } from '../types';

export default function SafetyCoordinated() {
  const [safeSpots, setSafeSpots] = useState<SafeSpot[]>([
    { id: '1', name: 'Safe Spot #08 - Horizon Coffee Store', type: 'business', lat: 100, lng: -120, status: 'active', address: '402 Sunset Blvd', phone: '+1 (555) 234-8901' },
    { id: '2', name: 'Civic Shelter #12 (24h Community Center)', type: 'shelter', lat: -150, lng: 80, status: 'active', address: '89 Main Street', phone: '+1 (555) 987-1234' },
    { id: '3', name: 'Guardian Node #42 (Vetted Resident David)', type: 'guardian_node', lat: 80, lng: 140, status: 'active', address: 'Geofenced Peer Mesh' },
    { id: '4', name: 'Guardian Node #19 (Vetted Resident Sofia)', type: 'guardian_node', lat: -60, lng: -110, status: 'active', address: 'Geofenced Peer Mesh' }
  ]);
  const [selectedSpot, setSelectedSpot] = useState<SafeSpot | null>(safeSpots[0]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [newNodeType, setNewNodeType] = useState<'business' | 'shelter' | 'guardian_node'>('guardian_node');
  const [radarWidth, setRadarWidth] = useState<number>(400);

  const radarRef = useRef<HTMLDivElement>(null);

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

  const filteredSpots = safeSpots.filter(spot => {
    if (activeFilter === 'all') return true;
    return spot.type === activeFilter;
  });

  return (
    <section id="safety-map" className="space-y-12 py-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
          <Compass className="h-4 w-4 text-rose-500" />
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
            NEIGHBORHOOD P2P MESH RADAR
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          Coordinated Safety Mesh <span className="text-rose-500">Radar Map</span>
        </h2>
        <p className="font-sans text-slate-300 text-base sm:text-lg">
          Click anywhere on the radar sweep to place civilian guardian nodes or 24/7 business sanctuaries.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Interactive Radar Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[460px] space-y-4">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 justify-center bg-[#12141d] p-2 rounded-2xl border border-white/10">
              {[
                { id: 'all', label: 'All Nodes' },
                { id: 'guardian_node', label: 'Guardians' },
                { id: 'business', label: 'Sanctuaries' },
                { id: 'shelter', label: 'Shelters' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    activeFilter === f.id ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
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
              className="relative aspect-square w-full bg-[#090a0f] rounded-full border-4 border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden cursor-crosshair group"
            >
              {/* Radar Grid Circles */}
              <div className="absolute inset-[15%] rounded-full border border-white/10 pointer-events-none"></div>
              <div className="absolute inset-[35%] rounded-full border border-white/10 pointer-events-none"></div>
              <div className="absolute inset-[55%] rounded-full border border-white/10 pointer-events-none"></div>

              {/* Crosshair Axes */}
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 pointer-events-none"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 pointer-events-none"></div>

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

            <div className="text-center font-mono text-xs text-slate-400">
              💡 Tip: Click anywhere on radar to add a new node
            </div>

          </div>
        </div>

        {/* Right Column: Node Inspector & Add Node Control */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Selected Node Details Card */}
          {selectedSpot ? (
            <div className="glass-card-glow rounded-2xl p-6 border border-rose-500/40 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs text-rose-400 font-bold uppercase">{selectedSpot.type.replace('_', ' ')}</span>
                  <h3 className="font-display font-bold text-xl text-white">{selectedSpot.name}</h3>
                </div>
                
                <button
                  onClick={() => handleDeleteNode(selectedSpot.id)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 cursor-pointer"
                  title="Remove Node"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 font-mono text-xs bg-[#090a0f] p-4 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance Vector:</span>
                  <span className="text-emerald-400 font-bold">~140m from center</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verification Status:</span>
                  <span className="text-white font-bold">Active Guardian Node</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location Info:</span>
                  <span className="text-slate-300">{selectedSpot.address || 'Geofenced Mesh'}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`Ping dispatch signal sent to ${selectedSpot.name}`)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer uppercase tracking-wider"
              >
                PING DISPATCH SIGNAL TO NODE
              </button>
            </div>
          ) : (
            <div className="glass-card-glow rounded-2xl p-6 border border-white/10 text-center space-y-2">
              <Crosshair className="h-8 w-8 text-rose-400 mx-auto" />
              <h3 className="font-display font-bold text-white">No Node Selected</h3>
              <p className="font-sans text-xs text-slate-400">Click a radar beacon on the map to inspect its telemetry.</p>
            </div>
          )}

          {/* Add New Node Control */}
          <div className="glass-card-glow rounded-2xl p-6 border border-white/10 space-y-4">
            <h4 className="font-display font-bold text-base text-white flex items-center space-x-2">
              <Plus className="h-4 w-4 text-rose-400" />
              <span>Node Placement Tool</span>
            </h4>

            <div className="space-y-3 font-mono text-xs">
              <label className="block text-slate-300">Default Node Type for Map Click:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'guardian_node', label: 'Guardian' },
                  { id: 'business', label: 'Sanctuary' },
                  { id: 'shelter', label: 'Shelter' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setNewNodeType(type.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      newNodeType === type.id ? 'bg-rose-600 text-white border-rose-400' : 'bg-white/5 text-slate-400 border-white/10'
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
