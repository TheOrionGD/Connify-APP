import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, Shield, AlertCircle, MapPin, Users, HeartHandshake,
  Check, Crosshair, Plus, Trash2, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SafeSpot } from '../types';

export default function SafetyCoordinated() {
  const [safeSpots, setSafeSpots] = useState<SafeSpot[]>([
    { id: '1', name: 'Safe Spot #08 - Horizon Coffee Store', type: 'business', lat: 100, lng: -120, status: 'active' },
    { id: '2', name: 'Civic Shelter #12 (24h Community Center)', type: 'shelter', lat: -150, lng: 80, status: 'active' },
    { id: '3', name: 'Guardian Node #42 (Vetted Resident David)', type: 'guardian_node', lat: 80, lng: 140, status: 'active' },
    { id: '4', name: 'Guardian Node #19 (Vetted Resident Sofia)', type: 'guardian_node', lat: -60, lng: -110, status: 'active' }
  ]);
  const [selectedSpot, setSelectedSpot] = useState<SafeSpot | null>(safeSpots[0]);
  const [newNodeName, setNewNodeName] = useState<string>('');
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

  const scaleMultiplier = radarWidth / 400;

  // Add custom node on map
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    // Filter out clicks that are too close to the edge
    if (Math.abs(x) > centerX - 20 || Math.abs(y) > centerY - 20) return;

    // Convert back to base 400px coordinates to store in state
    const baseScale = 400 / rect.width;
    const baseLat = Math.round(x * baseScale);
    const baseLng = Math.round(y * baseScale);

    const id = 'node-' + Math.random().toString(36).substring(2, 6);
    const names = [
      'Neighborhood Patrol Node',
      'Community Escort Point',
      'Local Secure Market Lobby',
      'Mutual Aid Sanctuary',
      'Vetted Public Lighting Node'
    ];
    const defaultName = names[Math.floor(Math.random() * names.length)] + ` #${Math.floor(Math.random() * 90) + 10}`;

    const newSpot: SafeSpot = {
      id,
      name: defaultName,
      type: newNodeType,
      lat: baseLat,
      lng: baseLng,
      status: 'active'
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

  return (
    <div id="safety-coordinated-page" className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      
      {/* Intro and Info Panel */}
      <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-red/10 rounded border border-brand-red/20">
            <Compass className="h-4 w-4 text-brand-red" />
            <span className="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">Neighborhood Mesh Map</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-brand-black tracking-tight leading-none">
            Coordinated by those <span className="text-brand-red">Nearest to You</span>
          </h1>

          <p className="font-sans text-brand-muted text-base leading-relaxed">
            By mapping vetted local business sanctuaries, 24/7 public spaces, and background-checked civilian guardians into a secure P2P community radar, Connify activates local mutual-aid shields instantly.
          </p>
        </div>

        {/* Local Density Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border-2 border-brand-black rounded shadow-[3px_3px_0px_rgba(27,27,27,1)] text-center space-y-1">
            <span className="font-display font-black text-2xl text-brand-black">48,290</span>
            <span className="block font-mono text-[10px] text-brand-muted uppercase tracking-wider font-bold">Active Responders</span>
          </div>
          <div className="p-4 bg-white border-2 border-brand-black rounded shadow-[3px_3px_0px_rgba(27,27,27,1)] text-center space-y-1">
            <span className="font-display font-black text-2xl text-brand-black">624</span>
            <span className="block font-mono text-[10px] text-brand-muted uppercase tracking-wider font-bold">Vetted Storefronts</span>
          </div>
        </div>

        {/* Node creation controls */}
        <div className="bg-brand-surface border-2 border-brand-black rounded-xl p-6 space-y-4 shadow-[4px_4px_0px_rgba(27,27,27,1)]">
          <span className="font-mono text-xs font-bold text-brand-black uppercase block">NODE REGISTRATION CONTROLS</span>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setNewNodeType('guardian_node')}
                className={`flex-1 py-2 font-sans text-xs font-bold rounded border-2 transition-all cursor-pointer ${
                  newNodeType === 'guardian_node'
                    ? 'bg-brand-red/10 border-brand-red text-brand-red font-extrabold shadow-inner'
                    : 'bg-white border-brand-black/20 text-brand-muted hover:border-brand-black hover:text-brand-black'
                }`}
              >
                Guardian Dot
              </button>
              <button
                onClick={() => setNewNodeType('business')}
                className={`flex-1 py-2 font-sans text-xs font-bold rounded border-2 transition-all cursor-pointer ${
                  newNodeType === 'business'
                    ? 'bg-brand-red/10 border-brand-red text-brand-red font-extrabold shadow-inner'
                    : 'bg-white border-brand-black/20 text-brand-muted hover:border-brand-black hover:text-brand-black'
                }`}
              >
                Safe Storefront
              </button>
            </div>
            <p className="font-sans text-[11px] text-brand-muted leading-normal font-medium">
              <strong>Instructions:</strong> Select your node class above, then <strong>click directly inside the radar circle</strong> on the right to simulate spawning a new secure safety asset node!
            </p>
          </div>
        </div>
      </div>

      {/* Radar Map & Node Inspector Column */}
      <div className="lg:col-span-7 space-y-6 flex flex-col items-center">
        
        {/* Nocturnal Radar Display container */}
        <div 
          ref={radarRef}
          className="relative w-full max-w-[400px] aspect-square rounded-full bg-brand-beige border-4 border-brand-black shadow-[6px_6px_0px_rgba(27,27,27,1)] flex items-center justify-center overflow-hidden select-none"
        >
          {/* Radial concentric rings */}
          <div className="absolute border border-brand-black/15 rounded-full" style={{ width: `${320 * scaleMultiplier}px`, height: `${320 * scaleMultiplier}px` }} />
          <div className="absolute border border-brand-black/10 rounded-full" style={{ width: `${240 * scaleMultiplier}px`, height: `${240 * scaleMultiplier}px` }} />
          <div className="absolute border border-brand-black/5 rounded-full" style={{ width: `${160 * scaleMultiplier}px`, height: `${160 * scaleMultiplier}px` }} />
          <div className="absolute border border-brand-red/5 rounded-full" style={{ width: `${80 * scaleMultiplier}px`, height: `${80 * scaleMultiplier}px` }} />
          
          {/* Radar Sweep rotating light */}
          <div className="absolute inset-0 w-full h-full animate-radar-sweep radar-fade pointer-events-none rounded-full z-10" />

          {/* Radar Crosshair overlay */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-brand-black/10 pointer-events-none" />
          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-brand-black/10 pointer-events-none" />

          {/* Interactive clickable overlay */}
          <div 
            onClick={handleMapClick}
            className="absolute inset-0 w-full h-full cursor-crosshair z-20"
          />

          {/* Center User Pinpoint (You) */}
          <div className="absolute z-30 flex items-center justify-center">
            <span className="absolute w-6 h-6 rounded-full bg-brand-red/15 animate-ping"></span>
            <div className="w-3.5 h-3.5 bg-brand-black rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.4)]" />
            <span className="absolute top-4 font-mono text-[8px] text-brand-black font-extrabold tracking-widest uppercase">YOU</span>
          </div>

          {/* Safe Spot Nodes on Radar */}
          {safeSpots.map((spot) => {
            const isSelected = selectedSpot?.id === spot.id;
            return (
              <div
                key={spot.id}
                onClick={(e) => {
                  e.stopPropagation(); // Stop parent map click
                  setSelectedSpot(spot);
                }}
                className="absolute z-30 transition-all cursor-pointer group flex items-center justify-center"
                style={{
                  transform: `translate(${spot.lat * scaleMultiplier}px, ${spot.lng * scaleMultiplier}px)`
                }}
              >
                {/* Visual node icon */}
                <div className={`p-2 rounded border-2 transition-all duration-300 relative ${
                  isSelected 
                    ? 'bg-brand-red border-brand-black text-white shadow-[3px_3px_0px_rgba(27,27,27,1)] scale-110' 
                    : spot.type === 'guardian_node'
                    ? 'bg-white border-brand-black/50 text-brand-black hover:border-brand-black hover:bg-brand-beige'
                    : 'bg-white border-brand-black/50 text-brand-red hover:border-brand-black hover:bg-brand-beige'
                }`}>
                  {spot.type === 'guardian_node' ? (
                    <Users className="h-3.5 w-3.5" />
                  ) : (
                    <Shield className="h-3.5 w-3.5" />
                  )}

                  {/* Distance Ring Indicator on selected */}
                  {isSelected && (
                    <span className="absolute -inset-1.5 rounded border border-brand-red/45 animate-pulse-ring" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Inspector Details Box */}
        <div className="w-full max-w-[400px]">
          <AnimatePresence mode="wait">
            {selectedSpot ? (
              <motion.div
                key={selectedSpot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-brand-surface border-2 border-brand-black rounded-xl p-5 space-y-4 relative shadow-[4px_4px_0px_rgba(27,27,27,1)]"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] font-bold text-brand-red uppercase bg-brand-red/10 px-2 py-0.5 border border-brand-red/20 rounded tracking-wider">
                      {selectedSpot.type === 'guardian_node' ? 'CIVILIAN GUARDIAN' : 'VETTED SAFE HAVEN'}
                    </span>
                    <h4 className="font-display font-extrabold text-base text-brand-black">{selectedSpot.name}</h4>
                  </div>

                  <button
                    onClick={() => handleDeleteNode(selectedSpot.id)}
                    className="p-1.5 text-brand-muted hover:text-brand-red rounded-lg transition-colors cursor-pointer"
                    title="Remove custom node"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-brand-black/10 pt-3 text-xs font-sans">
                  <div>
                    <span className="text-brand-muted block font-medium">Relative Coordinates:</span>
                    <span className="font-mono text-brand-black font-bold">lat: {selectedSpot.lat}, lng: {selectedSpot.lng}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted block font-medium">Trust Level:</span>
                    <span className="text-brand-red font-bold flex items-center">
                      <Check className="h-3.5 w-3.5 mr-1 stroke-[3px]" /> Vetted Secure
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white border border-brand-black/10 rounded-lg text-brand-muted text-[11px] leading-relaxed font-medium">
                  {selectedSpot.type === 'guardian_node' 
                    ? "Verified background-vetted resident on the active Connify mesh network. Equipped with tactical alert response transmitters."
                    : "Illuminated storefront with permanent public security surveillance cameras. Guaranteed 24/7 lobby staffing with silent alarm locks."
                  }
                </div>
              </motion.div>
            ) : (
              <div className="bg-brand-surface/50 border-2 border-dashed border-brand-black/20 rounded-xl p-6 text-center text-xs text-brand-muted font-bold italic">
                Select a node on the radar grid to audit the neighborhood trust vetting logs.
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
