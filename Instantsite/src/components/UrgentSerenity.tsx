import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Play, AlertOctagon, Heart, Smartphone, MapPin, 
  Clock, Flame, HelpCircle, Volume2, VolumeX, Eye, ArrowLeft,
  ChevronRight, RefreshCw, UserCheck, PhoneCall, Smile, MessageSquareQuote, Radio, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UrgentSerenity() {
  const [sessionState, setSessionState] = useState<'idle' | 'active' | 'breathing' | 'sos'>('idle');
  const [walkType, setWalkType] = useState<string>('night_walk');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathingTimer, setBreathingTimer] = useState<number>(4);
  const [responderStatus, setResponderStatus] = useState<any[]>([]);

  useEffect(() => {
    if (sessionState === 'active' || sessionState === 'sos') {
      // Dynamically load active responders from backend or mesh query
      const metaEnv = (import.meta as any).env || {};
      const backendUrl = metaEnv.VITE_BACKEND_URL;
      if (backendUrl) {
        fetch(`${backendUrl}/api/admin/guardians`)
          .then(r => r.json())
          .then(res => {
            if (res.success && Array.isArray(res.data) && res.data.length > 0) {
              setResponderStatus(res.data.slice(0, 3).map((g: any, i: number) => ({
                id: g.id || i + 1,
                name: g.name || `Guardian Node #${i + 1}`,
                distance: 150 + i * 100,
                eta: `${30 + i * 40}s`,
                progress: 10 - i * 3,
                status: 'dispatched'
              })));
            }
          })
          .catch(() => null);
      }
    } else {
      setResponderStatus([]);
    }
  }, [sessionState]);
  const [groundingScript, setGroundingScript] = useState<string>(
    "Keep your shoulders back and maintain standard walking strides. Look around at fixed objects—the corner street light, the brick pattern of the nearest wall. You are connected to a live mesh safety network. Speak aloud: 'I am currently broadcasting on a monitored security grid.'"
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const countdownIntervalRef = useRef<any>(null);
  const breathingIntervalRef = useRef<any>(null);

  // Web Audio Synthesizer for SOS Siren Alert
  const startSiren = () => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      
      let toggle = false;
      const sirenInterval = setInterval(() => {
        if (osc) {
          osc.frequency.setValueAtTime(toggle ? 680 : 420, ctx.currentTime);
          toggle = !toggle;
        }
      }, 400);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      (osc as any).sirenInterval = sirenInterval;
    } catch (e) {
      console.error('Audio synthesizer error', e);
    }
  };

  const stopSiren = () => {
    if (oscillatorRef.current) {
      try {
        clearInterval((oscillatorRef.current as any).sirenInterval);
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
  };

  // Countdown timer
  useEffect(() => {
    if (sessionState === 'active') {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleTriggerSOS();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [sessionState]);

  // Breathing Box Timer
  useEffect(() => {
    if (sessionState === 'breathing') {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currentPhase) => {
              if (currentPhase === 'in') return 'hold';
              if (currentPhase === 'hold') return 'out';
              return 'in';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    }
    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [sessionState]);

  const handleStartWalk = () => {
    setSessionState('active');
    setCountdown(300);
  };

  const handleTriggerSOS = () => {
    setSessionState('sos');
    startSiren();
  };

  const handleCancelSession = () => {
    setSessionState('idle');
    stopSiren();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section id="urgent-serenity" className="space-y-12 py-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
          <Activity className="h-4 w-4 text-rose-500" />
          <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
            SMARTPHONE ESCORT COMPANION SIMULATOR
          </span>
        </div>
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
          Urgent Serenity <span className="text-rose-500">Companion</span>
        </h2>
        <p className="font-sans text-slate-300 text-base sm:text-lg">
          Experience the client-side escort companion interface. Test live walk routes, anxiety-relief breathing exercises, or trigger a simulated SOS emergency siren.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
        
        {/* Left Column: Interactive Smartphone Mockup Device Frame */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[360px] bg-[#090a0f] rounded-[42px] border-4 border-slate-800 p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {/* Phone Notch & Status Bar */}
            <div className="flex justify-between items-center px-4 py-2 text-[11px] font-mono text-slate-400 border-b border-white/10">
              <span className="font-bold text-white">22:42</span>
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto"></div>
              <div className="flex items-center space-x-1.5">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold">5G P2P</span>
              </div>
            </div>

            {/* Smartphone Display Screen Content */}
            <div className="bg-[#12141d] rounded-[32px] p-5 my-2 min-h-[500px] flex flex-col justify-between relative overflow-hidden border border-white/10">
              
              {/* Screen Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-rose-500" />
                  <span className="font-tech text-xs text-white font-bold uppercase tracking-wider">CONNIFY SERENITY</span>
                </div>
                <span className="font-mono text-[9px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold border border-rose-500/30">
                  {sessionState === 'sos' ? 'SOS ACTIVE' : sessionState === 'active' ? 'MONITORED' : 'STANDBY'}
                </span>
              </div>

              {/* Dynamic State Views */}
              {sessionState === 'idle' && (
                <div className="space-y-6 my-auto text-center">
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping"></div>
                    <div className="relative p-5 bg-rose-500/10 rounded-full border border-rose-500/40">
                      <Smartphone className="h-10 w-10 text-rose-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-lg text-white">Select Escort Mode</h3>
                    <p className="font-sans text-xs text-slate-400">
                      Configures auto-checkins and acoustic panic triggers for your journey.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'night_walk', label: 'Late Night Walk (5m timer)' },
                      { id: 'commute', label: 'Transit Commute (15m timer)' },
                      { id: 'silent_watch', label: 'Silent Geofence Watch' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setWalkType(mode.id)}
                        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all text-left flex justify-between items-center ${
                          walkType === mode.id 
                            ? 'bg-rose-600/30 text-white border-rose-500' 
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span>{mode.label}</span>
                        {walkType === mode.id && <Shield className="h-3.5 w-3.5 text-rose-400" />}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleStartWalk}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all cursor-pointer uppercase tracking-wider"
                  >
                    START ESCORT SESSION
                  </button>
                </div>
              )}

              {sessionState === 'active' && (
                <div className="space-y-5 my-auto">
                  <div className="bg-[#090a0f] p-4 rounded-2xl border border-white/10 text-center space-y-2">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">SAFETY CHECK-IN COUNTDOWN</span>
                    <div className="font-tech text-4xl text-rose-400 font-extrabold tracking-wider">
                      {formatTime(countdown)}
                    </div>
                    <p className="font-sans text-[11px] text-slate-400">
                      Tap below if safe, or SOS triggers automatically upon expiry.
                    </p>
                  </div>

                  {/* Simulated Route Map Canvas */}
                  <div className="h-32 bg-[#090a0f] rounded-2xl border border-white/10 relative overflow-hidden p-3 flex flex-col justify-between">
                    <div className="absolute inset-0 grid-pattern-bg opacity-30"></div>
                    <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <MapPin className="h-3 w-3" /> Live GPS Match
                      </span>
                      <span>3 Guardian Pings Nearby</span>
                    </div>

                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
                      <span className="font-mono text-xs text-white font-bold">En Route to Sanctuary #42</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setSessionState('breathing')}
                      className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold rounded-xl border border-cyan-500/40 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Smile className="h-4 w-4 text-cyan-400" />
                      <span>BOX BREATHING GUIDANCE</span>
                    </button>

                    <button
                      id="sos-button-triggered"
                      onClick={handleTriggerSOS}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center space-x-2"
                    >
                      <AlertOctagon className="h-4 w-4 animate-bounce text-white" />
                      <span>TRIGGER EMERGENCY SOS</span>
                    </button>
                  </div>
                </div>
              )}

              {sessionState === 'breathing' && (
                <div className="space-y-6 my-auto text-center">
                  <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    ANXIETY-RELIEF BOX BREATHING
                  </span>

                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <motion.div 
                      animate={{ 
                        scale: breathingPhase === 'in' ? 1.3 : breathingPhase === 'hold' ? 1.3 : 0.9,
                        borderColor: breathingPhase === 'in' ? '#06b6d4' : breathingPhase === 'hold' ? '#10b981' : '#e11d48'
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full border-4 border-cyan-400 bg-cyan-500/10"
                    />
                    <div className="relative font-tech text-3xl font-extrabold text-white">
                      {breathingTimer}s
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-base text-white uppercase">
                      {breathingPhase === 'in' ? 'Breathe In Deeply' : breathingPhase === 'hold' ? 'Hold Breath' : 'Exhale Slowly'}
                    </h4>
                    <p className="font-sans text-xs text-slate-400">
                      Focus on the expanding ring to stabilize pulse rate.
                    </p>
                  </div>

                  <button
                    onClick={() => setSessionState('active')}
                    className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
                  >
                    RETURN TO WALK COMPANION
                  </button>
                </div>
              )}

              {sessionState === 'sos' && (
                <div className="space-y-5 my-auto text-center">
                  <div className="p-4 bg-rose-600/30 rounded-2xl border border-rose-500 animate-pulse space-y-2">
                    <AlertOctagon className="h-10 w-10 text-rose-500 mx-auto animate-spin" />
                    <h3 className="font-display font-extrabold text-lg text-white uppercase">EMERGENCY SOS DISPATCHED</h3>
                    <p className="font-mono text-xs text-rose-300">
                      Broadcasting encrypted beacon to nearest community guardians.
                    </p>
                  </div>

                  <div className="space-y-2 text-left bg-[#090a0f] p-3 rounded-xl border border-white/10 font-mono text-[11px]">
                    <div className="text-slate-400 font-bold uppercase mb-1">Active Responders Dispatching:</div>
                    {responderStatus.map(resp => (
                      <div key={resp.id} className="flex justify-between items-center text-slate-300">
                        <span className="truncate max-w-[170px]">{resp.name}</span>
                        <span className="text-emerald-400 font-bold">{resp.eta}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleCancelSession}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer uppercase"
                  >
                    CANCEL ALARM & SAFE CHECK-IN
                  </button>
                </div>
              )}

              {/* Bottom Phone Action Bar */}
              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <button 
                  onClick={handleCancelSession}
                  className="text-[10px] font-mono text-slate-400 hover:text-white uppercase"
                >
                  Reset Demo
                </button>
                <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
                <span className="text-[10px] font-mono text-rose-400 font-bold">P2P ON</span>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column: Escort Companion Details & Grounding Reader */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="glass-card-glow rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
                <MessageSquareQuote className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Voice Grounding Script Reader</h3>
                <span className="font-mono text-xs text-rose-400">Psychological Serenity System</span>
              </div>
            </div>

            <p className="font-sans text-slate-300 text-sm leading-relaxed bg-[#090a0f] p-4 rounded-xl border border-white/10 italic">
              "{groundingScript}"
            </p>

            <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2">
              <span>Auto-generated by Connify Grounding Engine</span>
              <button 
                onClick={() => setGroundingScript("Focus on your breathing. Keep walking at a steady pace towards the illuminated coffee shop on your map. 2 vetted civilian guardians are actively monitoring your progress.")}
                className="text-rose-400 hover:underline font-bold cursor-pointer"
              >
                Refresh Script
              </button>
            </div>
          </div>

          <div className="glass-card-glow rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-emerald-400" />
              <span>Real-Time Peer Responder Network</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {responderStatus.map((resp) => (
                <div key={resp.id} className="bg-[#090a0f] p-3.5 rounded-xl border border-white/10 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-white font-bold block">{resp.name}</span>
                    <span className="text-slate-400 text-[11px]">{resp.distance}m away • Status: {resp.status}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded border border-emerald-500/30">
                    ETA: {resp.eta}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
