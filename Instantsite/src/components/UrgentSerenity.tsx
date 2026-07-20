import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Play, AlertOctagon, Heart, Smartphone, MapPin, 
  Clock, Flame, HelpCircle, Volume2, VolumeX, Eye, ArrowLeft,
  ChevronRight, RefreshCw, UserCheck, PhoneCall, Smile, MessageSquareQuote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UrgentSerenity() {
  const [sessionState, setSessionState] = useState<'idle' | 'active' | 'breathing' | 'sos'>('idle');
  const [walkType, setWalkType] = useState<string>('night_walk');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes in seconds
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathingTimer, setBreathingTimer] = useState<number>(4);
  const [responderStatus, setResponderStatus] = useState<any[]>([
    { id: 1, name: 'Guardian David (Active Responder)', distance: 180, eta: '45s', progress: 10, status: 'dispatched' },
    { id: 2, name: 'Guardian Sofia (Community Volunteer)', distance: 320, eta: '1m 20s', progress: 5, status: 'dispatched' },
    { id: 3, name: 'Safe Spot #84 (Vetted Coffee Shop)', distance: 450, eta: 'Walking direction', progress: 0, status: 'notified' }
  ]);
  const [groundingScript, setGroundingScript] = useState<string>(
    "Keep your shoulders back and maintain standard walking strides. Look around at fixed objects—the corner street light, the brick pattern of the nearest wall. You are connected to a live mesh safety network. Speak aloud: 'I am currently broadcasting on a monitored security grid.'"
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const countdownIntervalRef = useRef<any>(null);
  const breathingIntervalRef = useRef<any>(null);

  // Sound Engine for SOS Siren (Tactical Alarm Pulse)
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

      // Create Oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      
      // Siren FM Modulator
      let toggle = false;
      const sirenInterval = setInterval(() => {
        if (osc) {
          osc.frequency.setValueAtTime(toggle ? 600 : 400, ctx.currentTime);
          toggle = !toggle;
        }
      }, 500);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      // Keep reference to clear interval when stopping
      (osc as any).sirenInterval = sirenInterval;
    } catch (e) {
      console.error('Audio synthesizer failed to initialize', e);
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

  // Manage Countdown timer
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

  // Manage Breathing Cycle for Calming Companion
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
            return 4; // 4 seconds per phase (box breathing)
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
      setBreathingTimer(4);
      setBreathingPhase('in');
    }
    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [sessionState]);

  // Real-time animation for responders in SOS state
  useEffect(() => {
    let responderInterval: any;
    if (sessionState === 'sos') {
      startSiren();
      responderInterval = setInterval(() => {
        setResponderStatus((prev) =>
          prev.map((r) => {
            if (r.distance > 10) {
              const reduction = Math.floor(Math.random() * 20) + 10;
              const newDist = Math.max(0, r.distance - reduction);
              return {
                ...r,
                distance: newDist,
                progress: Math.min(100, r.progress + 8),
                eta: newDist === 0 ? 'Arrived' : `${Math.ceil(newDist / 4)}s`,
                status: newDist === 0 ? 'arrived' : 'responding'
              };
            }
            return r;
          })
        );
      }, 2500);
    } else {
      stopSiren();
      setResponderStatus([
        { id: 1, name: 'Guardian David (Active Responder)', distance: 180, eta: '45s', progress: 10, status: 'dispatched' },
        { id: 2, name: 'Guardian Sofia (Community Volunteer)', distance: 320, eta: '1m 20s', progress: 5, status: 'dispatched' },
        { id: 3, name: 'Safe Spot #84 (Vetted Coffee Shop)', distance: 450, eta: 'Walking direction', progress: 0, status: 'notified' }
      ]);
    }
    return () => {
      stopSiren();
      clearInterval(responderInterval);
    };
  }, [sessionState, isMuted]);

  const handleStartSession = () => {
    setCountdown(300);
    setSessionState('active');
  };

  const handleTriggerSOS = () => {
    setSessionState('sos');
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (sessionState === 'sos') {
      if (nextMuted) {
        stopSiren();
      } else {
        startSiren();
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div id="urgent-serenity-container" className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      
      {/* Intro and Info Column */}
      <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-red/10 rounded border border-brand-red/20">
            <Flame className="h-4 w-4 text-brand-red animate-pulse" />
            <span className="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">Active Companion</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-brand-black tracking-tight leading-none">
            Urgent Serenity in <span className="text-brand-red">Every Step</span>
          </h1>

          <p className="font-sans text-brand-muted text-base leading-relaxed">
            The active escort companion runs locally on your phone. If you feel uneasy, set your check-in timer. Devastatingly fast response times, peer-verification safeguards, and grounding calming modules help you hold absolute tranquility.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-4 font-sans text-sm">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-brand-red/10 rounded border border-brand-red/20 text-brand-red mt-0.5">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-brand-black block">Dead-Man Checkpoint System</span>
              <span className="text-brand-muted">Timer automatically notifies verified guardians if you fail to check in. No central data storage.</span>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-brand-red/10 rounded border border-brand-red/20 text-brand-red mt-0.5">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-brand-black block">Integrative Grounding Exercises</span>
              <span className="text-brand-muted">Box breathing companion and psychological scripts to immediately curb high-stress reactions.</span>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-brand-red/10 rounded border border-brand-red/20 text-brand-red mt-0.5">
              <AlertOctagon className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-brand-black block">Immediate P2P Alarm Routing</span>
              <span className="text-brand-muted">Flashing high-luminance strobe screen & high-pitch alert dispatches nearest vetted responders.</span>
            </div>
          </div>
        </div>

        {/* Tactical Note */}
        <div className="p-5 bg-brand-surface rounded border-2 border-brand-black shadow-[3px_3px_0px_rgba(27,27,27,1)] font-sans text-xs text-brand-black leading-relaxed">
          <strong>Tactical Note:</strong> This sandbox fully simulates the Connify mobile client. Interact with the phone UI on the right to test check-ins, activate the breathing module, or trigger a full SOS mock response.
        </div>
      </div>

      {/* Smartphone Simulator Column */}
      <div className="lg:col-span-7 flex justify-center items-center w-full">
        <div className="relative w-full max-w-[340px] h-[620px] sm:h-[680px] bg-brand-beige rounded-[40px] border-[10px] border-brand-black p-3 shadow-[8px_8px_0px_rgba(27,27,27,1)] overflow-hidden flex flex-col justify-between">
          
          {/* Phone Speaker Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-28 bg-brand-black rounded-b-2xl z-40 flex items-center justify-center">
            <div className="w-10 h-1 bg-brand-muted rounded-full mb-1"></div>
          </div>

          {/* Phone Header / Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-brand-muted px-4 pt-4 z-30 select-none">
            <span className="font-bold text-brand-black">CONNIFY MESH</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
              <span className="text-[10px] text-brand-red font-semibold uppercase">SECURE</span>
            </div>
          </div>

          {/* PHONE INTERACTIVE BODY AREA */}
          <div className="flex-1 my-4 flex flex-col justify-between overflow-y-auto px-2 relative z-20">
            <AnimatePresence mode="wait">
              
              {/* STATE 1: IDLE / SETUP */}
              {sessionState === 'idle' && (
                <motion.div 
                  key="idle-view"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="h-full flex flex-col justify-between py-2 space-y-6"
                >
                  <div className="text-center space-y-2 mt-4">
                    <div className="mx-auto w-12 h-12 rounded bg-brand-red/10 border-2 border-brand-red flex items-center justify-center text-brand-red">
                      <Shield className="h-6 w-6" />
                    </div>
                    <span className="block font-display font-extrabold text-xl text-brand-black">Escort Mode</span>
                    <span className="block font-sans text-xs text-brand-muted px-4">Choose your walk condition below to arms the silent deadline checkpoint timer.</span>
                  </div>

                  {/* Walk Options Selector */}
                  <div className="space-y-2 px-2">
                    <button
                      onClick={() => setWalkType('night_walk')}
                      className={`w-full p-3.5 rounded border text-left font-sans transition-all duration-200 cursor-pointer flex justify-between items-center ${
                        walkType === 'night_walk'
                          ? 'bg-brand-red/5 border-2 border-brand-black shadow-[2px_2px_0px_#1b1b1b]'
                          : 'bg-white border border-brand-black/20 hover:border-brand-black'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold text-brand-black block">Walking Alone at Night</span>
                        <span className="text-[10px] text-brand-muted block">Checkpoint interval: 5m, GPS deviation active</span>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${walkType === 'night_walk' ? 'bg-brand-red animate-pulse' : 'bg-brand-beige border border-brand-black/30'}`} />
                    </button>

                    <button
                      onClick={() => setWalkType('taxi_ride')}
                      className={`w-full p-3.5 rounded border text-left font-sans transition-all duration-200 cursor-pointer flex justify-between items-center ${
                        walkType === 'taxi_ride'
                          ? 'bg-brand-red/5 border-2 border-brand-black shadow-[2px_2px_0px_#1b1b1b]'
                          : 'bg-white border border-brand-black/20 hover:border-brand-black'
                      }`}
                    >
                      <div>
                        <span className="text-sm font-bold text-brand-black block">Rideshare / Taxi Escort</span>
                        <span className="text-[10px] text-brand-muted block">Speed drift check, timer check-in: 10m</span>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${walkType === 'taxi_ride' ? 'bg-brand-red animate-pulse' : 'bg-brand-beige border border-brand-black/30'}`} />
                    </button>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleStartSession}
                    className="w-full py-4 bg-brand-red hover:bg-brand-red-hover text-white font-sans font-extrabold text-sm rounded border-2 border-brand-black shadow-[3px_3px_0px_rgba(27,27,27,1)] hover:shadow-[1px_1px_0px_rgba(27,27,27,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    <span>START WALK SESSION</span>
                  </button>
                </motion.div>
              )}

              {/* STATE 2: ACTIVE SESSION */}
              {sessionState === 'active' && (
                <motion.div 
                  key="active-view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between py-2 space-y-6"
                >
                  <div className="space-y-4">
                    {/* Active Route Header */}
                    <div className="p-3 bg-brand-red/5 border border-brand-red/20 rounded flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-brand-red rounded-full animate-ping"></span>
                        <span className="font-mono text-[10px] text-brand-red font-bold uppercase tracking-wider">ACTIVE MESH ON-DUTY</span>
                      </div>
                      <span className="font-mono text-[9px] text-brand-muted">P2P: DIRECT</span>
                    </div>

                    {/* Big Countdown */}
                    <div className="text-center py-6 bg-white border-2 border-brand-black rounded shadow-[3px_3px_0px_rgba(27,27,27,1)] space-y-1">
                      <span className="font-mono text-[10px] text-brand-muted tracking-wider block font-bold uppercase">AUTO-SOS CHECK-IN IN:</span>
                      <span className="font-mono text-4xl font-extrabold text-brand-red tracking-widest block">{formatTime(countdown)}</span>
                      <span className="block text-[10px] text-brand-muted font-sans">Slide or press SOS to immediately notify responders.</span>
                    </div>
                  </div>

                  {/* Calming, Check-in buttons */}
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setSessionState('breathing')}
                      className="w-full py-3.5 bg-brand-muted/15 hover:bg-brand-muted/25 border-2 border-brand-black text-brand-black font-sans font-extrabold text-xs rounded shadow-[2px_2px_0px_#1b1b1b] transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Heart className="h-4 w-4 text-brand-red fill-brand-red/10" />
                      <span>OPEN CALMING COMPANION</span>
                    </button>

                    <button
                      onClick={() => setSessionState('idle')}
                      className="w-full py-3 bg-white hover:bg-brand-beige border border-brand-black text-brand-muted hover:text-brand-black font-sans text-xs font-bold rounded transition-all cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>I AM SAFE - CLOSE SESSION</span>
                    </button>
                  </div>

                  {/* Giant SOS Panic Button */}
                  <div className="pt-2 text-center">
                    <button
                      id="sos-button-triggered"
                      onClick={handleTriggerSOS}
                      className="mx-auto w-24 h-24 rounded-full bg-brand-red hover:bg-brand-red-hover text-white font-display font-black text-xl flex flex-col items-center justify-center border-4 border-brand-black shadow-[4px_4px_0px_#1b1b1b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#1b1b1b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#1b1b1b] transition-all cursor-pointer"
                    >
                      <span>SOS</span>
                      <span className="text-[8px] font-sans font-extrabold tracking-widest mt-1">TAP NOW</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STATE 3: BREATHING COMPANION */}
              {sessionState === 'breathing' && (
                <motion.div 
                  key="breathing-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between py-2"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-brand-black/10">
                    <button 
                      onClick={() => setSessionState('active')}
                      className="text-brand-muted hover:text-brand-black flex items-center text-xs font-sans font-bold cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </button>
                    <span className="font-mono text-[10px] text-brand-red uppercase font-bold">Calming Circle</span>
                    <span className="w-4 h-4"></span> {/* spacer */}
                  </div>

                  {/* Breathing animation guide */}
                  <div className="flex-1 flex flex-col justify-center items-center space-y-10 my-4">
                    <div className="relative flex items-center justify-center w-48 h-48">
                      {/* Interactive breathing circle */}
                      <motion.div
                        animate={{
                          scale: breathingPhase === 'in' ? 1.4 : breathingPhase === 'hold' ? 1.4 : 0.8,
                        }}
                        transition={{
                          duration: 4,
                          ease: 'easeInOut',
                        }}
                        className={`absolute w-32 h-32 rounded-full flex items-center justify-center border transition-colors ${
                          breathingPhase === 'in' 
                            ? 'bg-brand-red/5 border-brand-red/30' 
                            : breathingPhase === 'hold' 
                            ? 'bg-brand-red/10 border-2 border-brand-black shadow-[3px_3px_0px_rgba(182,1,0,0.1)]'
                            : 'bg-brand-muted/5 border-brand-muted/30'
                        }`}
                      />
                      
                      <div className="text-center z-10 space-y-0.5 select-none">
                        <span className="font-display font-extrabold text-2xl text-brand-black tracking-wide uppercase block">
                          {breathingPhase === 'in' && 'Breathe In'}
                          {breathingPhase === 'hold' && 'Hold'}
                          {breathingPhase === 'out' && 'Breathe Out'}
                        </span>
                        <span className="font-mono text-[11px] text-brand-red font-bold block">
                          {breathingTimer}s remaining
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-brand-muted text-center max-w-[240px] leading-relaxed select-none">
                      Focus entirely on the expansion. Sync your breath with the visual cadence. Slow your heart rate.
                    </p>
                  </div>

                  <button
                    onClick={() => setSessionState('active')}
                    className="w-full py-3 bg-brand-surface hover:bg-brand-beige text-brand-black font-sans text-xs font-bold rounded border-2 border-brand-black shadow-[2px_2px_0px_rgba(27,27,27,1)] cursor-pointer"
                  >
                    Close & Return to Escort
                  </button>
                </motion.div>
              )}

              {/* STATE 4: SOS TRIGGERED */}
              {sessionState === 'sos' && (
                <motion.div 
                  key="sos-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between py-2 space-y-4"
                >
                  {/* Flashing SOS Header */}
                  <div className="p-3.5 bg-brand-red border-2 border-brand-black rounded flex items-center justify-between text-white shadow-[3px_3px_0px_#1b1b1b] animate-pulse">
                    <div className="flex items-center space-x-2">
                      <AlertOctagon className="h-5 w-5 text-white" />
                      <span className="font-display font-extrabold text-sm uppercase tracking-widest">SOS ACTIVE</span>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-brand-red bg-white px-1.5 py-0.5 rounded">DISPATCHED</span>
                  </div>

                  {/* Responders ETA List */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                    <span className="font-mono text-[9px] text-brand-muted tracking-wider font-bold uppercase block">Nearby responders active:</span>
                    
                    <div className="space-y-2">
                      {responderStatus.map((r) => (
                        <div key={r.id} className="p-3 bg-white border-2 border-brand-black rounded shadow-[2px_2px_0px_#1b1b1b] space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-brand-black truncate max-w-[150px]">{r.name}</span>
                            <span className="font-mono text-brand-red font-bold text-[11px]">{r.distance === 0 ? 'Arrived' : `${r.distance}m`}</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-brand-beige h-1.5 rounded overflow-hidden border border-brand-black/10">
                            <div 
                              className={`h-full transition-all duration-1000 bg-brand-red`}
                              style={{ width: `${r.progress}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between text-[10px] text-brand-muted">
                            <span>ETA: {r.eta}</span>
                            <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">{r.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audio alarm controller */}
                  <div className="flex items-center justify-between px-2 text-xs">
                    <span className="text-brand-muted font-mono text-[10px] uppercase font-bold">Audio Siren:</span>
                    <button
                      onClick={handleMuteToggle}
                      className={`p-2 rounded border transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isMuted 
                          ? 'bg-brand-surface text-brand-muted border-brand-black/20' 
                          : 'bg-brand-red text-white border-brand-black shadow-[2px_2px_0px_#1b1b1b]'
                      }`}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 animate-bounce" />}
                      <span className="font-mono text-[10px] font-bold">{isMuted ? 'UNMUTE ALARM' : 'MUTED'}</span>
                    </button>
                  </div>

                  {/* Cancel Button */}
                  <button
                    onClick={() => setSessionState('idle')}
                    className="w-full py-3.5 bg-white hover:bg-brand-beige text-brand-muted hover:text-brand-red font-sans text-xs font-bold rounded border-2 border-brand-black shadow-[2px_2px_0px_#1b1b1b] transition-all cursor-pointer"
                  >
                    False Alarm - Cancel SOS
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Simulated Home Indicator Bar */}
          <div className="w-24 h-1 bg-brand-black/20 rounded-full mx-auto mb-1 select-none pointer-events-none" />
        </div>
      </div>

      {/* Grounding & Interactive Comfort section */}
      <div className="lg:col-span-12 mt-4 bg-brand-surface border-2 border-brand-black rounded-xl p-8 sm:p-10 shadow-[6px_6px_0px_rgba(27,27,27,1)] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-brand-red/5 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-black/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-brand-red fill-brand-red/10 animate-pulse" />
              <span className="font-display font-extrabold text-xl text-brand-black">Active Calm Grounding Assist</span>
            </div>
            <p className="font-sans text-xs text-brand-muted">
              Emergency scripts and psychological anchoring tactics during moments of elevated distress.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const scripts = [
                  "Stand comfortably with weight balanced evenly. Anchor your focus on the cold air touching your face. Listen closely to nearby mechanical sounds: a distant generator, a ventilation fan. Affirm: 'I have full situational control right now.'",
                  "If someone approaches, establish immediate strong boundaries. Extend one palm out slightly and say firmly: 'Keep back. This route is logged on an encrypted, neighborhood safety beacon.' Check your surrounding coordinates in the phone widget.",
                  "Release the physical tension. Drop your shoulders away from your ears, open your clenched fists, and take a 4-second deep box breath. Your coordinates are secure. Local verified guardians have active eyes on your grid node."
                ];
                const nextScript = scripts[Math.floor(Math.random() * scripts.length)];
                setGroundingScript(nextScript);
              }}
              className="px-4 py-2 bg-brand-surface hover:bg-brand-beige border-2 border-brand-black text-brand-black hover:text-brand-red font-mono text-[11px] font-bold rounded shadow-[2px_2px_0px_rgba(27,27,27,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(27,27,27,1)] transition-all cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>CYCLE TACTIC</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-brand-beige border-2 border-brand-black rounded space-y-4 shadow-inner">
          <span className="font-mono text-[10px] text-brand-red font-bold uppercase tracking-wider block">RECOMMENDED INTERNAL DISCOURSE:</span>
          <p className="font-sans text-base text-brand-black italic font-medium leading-relaxed">
            "{groundingScript}"
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-4 bg-white border-2 border-brand-black rounded shadow-[3px_3px_0px_#1b1b1b] space-y-1">
            <span className="font-bold text-brand-black block">Auditory Calming Node</span>
            <span className="text-brand-muted">Enable soft audio heartbeat pulses or grounding scripts on-demand.</span>
          </div>
          <div className="p-4 bg-white border-2 border-brand-black rounded shadow-[3px_3px_0px_#1b1b1b] space-y-1">
            <span className="font-bold text-brand-black block">Silent Warning Vibe</span>
            <span className="text-brand-muted">Emits custom Morse patterns on your wrist to confirm helper progress secretly.</span>
          </div>
          <div className="p-4 bg-white border-2 border-brand-black rounded shadow-[3px_3px_0px_#1b1b1b] space-y-1 sm:col-span-2 md:col-span-1">
            <span className="font-bold text-brand-black block">Rapid Safe Haven Pinpoint</span>
            <span className="text-brand-muted">Identifies the nearest verified illuminated storefront with an emergency guard link.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
