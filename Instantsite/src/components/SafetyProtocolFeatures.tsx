import React, { useState } from 'react';
import { Shield, Lock, EyeOff, Radio, Users, CheckCircle, ChevronRight, Zap, Download, Compass, Coffee, UserCheck, Cpu, Smartphone, Eye, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SafetyProtocolFeatures() {
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['ambient', 'route']);
  const [customTime, setCustomTime] = useState<number>(15);
  const [protocolGenerated, setProtocolGenerated] = useState<boolean>(false);
  const [generatedHash, setGeneratedHash] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('radar');
  const [showDownloadNotification, setShowDownloadNotification] = useState<boolean>(false);

  const tourTabs = [
    {
      id: 'radar',
      label: 'Mesh Radar Navigation',
      icon: Compass,
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
      title: 'Geofenced Route & Path Deviation Monitor',
      subtitle: 'Dynamic GPS-bound mesh coordination with zero centralized tracking.',
      tag: 'ACTIVE MESH NAVIGATION',
      color: 'text-brand-red border-brand-red bg-brand-red/5',
      screenDetails: (
        <div className="space-y-4 font-sans text-brand-black">
          <div className="p-3 bg-brand-beige border border-brand-black/10 rounded flex items-center justify-between text-xs">
            <span className="font-mono text-brand-red font-bold">ROUTE TOLERANCE:</span>
            <span className="font-mono font-extrabold">+50 METERS</span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed font-medium">
            The app actively measures cellular signal bounce and GPS drift in volatile urban zones. If you diverge from your preset course by more than 50 meters, a silent pulse vibration triggers. If unacknowledged within 60 seconds, an SOS broadcast goes live to nearest peers.
          </p>
          <div className="space-y-1">
            <span className="block font-mono text-[10px] text-brand-muted uppercase font-bold">ACTIVE PROTOCOL PARAMETERS:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● GEO_TOLERANCE: 50M</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● MESH_UPDATE: 3S</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● ENCRYPT_CIPHER: GCM-256</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● BEACON_TYPE: EPHEMERAL</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'haven',
      label: 'Sanctum Directory',
      icon: Coffee,
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      title: 'Illuminated & Vetted Safe Storefronts',
      subtitle: '24/7 lobby coverage with cryptographically linked silent panic switches.',
      tag: 'VETTED NEIGHBORHOOD SANCTUM',
      color: 'text-brand-red border-brand-red bg-brand-red/5',
      screenDetails: (
        <div className="space-y-4 font-sans text-brand-black">
          <div className="p-3 bg-brand-beige border border-brand-black/10 rounded flex items-center justify-between text-xs">
            <span className="font-mono text-brand-red font-bold">SANCTUM ID:</span>
            <span className="font-mono font-extrabold font-bold">#402 - LOBBY ACTIVE</span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed font-medium">
            Connify anchors local business sanctuaries—vetted coffee shops, late-night bookstores, and community hubs—equipped with hardware panic switches. If you step inside, your app securely shakes hands with the local router to alert on-duty staff without exposing your personal ID.
          </p>
          <div className="space-y-1">
            <span className="block font-mono text-[10px] text-brand-muted uppercase font-bold">SANCTUM ACCESS PROTOCOLS:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● STAFF_CERT: 100% VETTED</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● HARDWARE_PANIC: ENABLED</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● CAM_STATION: ILLUMINATED</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● ROUTER_SYNC: PASSIVE</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'guardians',
      label: 'Civilian Guardians',
      icon: UserCheck,
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
      title: 'Background-Checked Neighbor Shield',
      subtitle: 'Triple-Neighbor sponsorship model ensuring community trust accountability.',
      tag: 'ON-MESH RESIDENT SHIELD',
      color: 'text-brand-red border-brand-red bg-brand-red/5',
      screenDetails: (
        <div className="space-y-4 font-sans text-brand-black">
          <div className="p-3 bg-brand-beige border border-brand-black/10 rounded flex items-center justify-between text-xs">
            <span className="font-mono text-brand-red font-bold">RESPONSE TEAM RANGE:</span>
            <span className="font-mono font-extrabold">1.4 MIN AVG ETA</span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed font-medium">
            Every guardian in your surrounding 500m radius is verified by criminal background screenings and vetted via three cryptographic sponsor signatures from current on-duty community leaders. They act as rapid response escorts, matching your speed and guiding you safely.
          </p>
          <div className="space-y-1">
            <span className="block font-mono text-[10px] text-brand-muted uppercase font-bold">GUARDIAN STATS MANIFEST:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● ACTIVE_VOLUNTEERS: 48,290</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● SPONSORSHIP_REQ: TRIPLE</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● TRAINING: FIRST-AID CERT</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● PASSIVE_RADAR: INSTANT</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'zkp',
      label: 'Zero-Logs Auditor',
      icon: Cpu,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      title: 'Cryptographic Zero-Knowledge Auditing',
      subtitle: 'Your actual coordinates never leave volatile RAM, verified by peer consensus.',
      tag: 'ZERO-KNOWLEDGE PRIVACY RULE',
      color: 'text-brand-red border-brand-red bg-brand-red/5',
      screenDetails: (
        <div className="space-y-4 font-sans text-brand-black">
          <div className="p-3 bg-brand-beige border border-brand-black/10 rounded flex items-center justify-between text-xs">
            <span className="font-mono text-brand-red font-bold">VOLATILE RAM MODE:</span>
            <span className="font-mono font-extrabold">100% COMPLIANT</span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed font-medium">
            By leveraging cryptographic Zero-Knowledge Proofs, the Connify network verifies you are on a registered safe route without ever storing your raw latitude or longitude in any corporate log files. Your safety and your data sovereignty are non-negotiable.
          </p>
          <div className="space-y-1">
            <span className="block font-mono text-[10px] text-brand-muted uppercase font-bold">ZK CRYPTOGRAPHIC PARAMS:</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● PROOF_TYPE: SNARK-ZKP</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● RETENTION_LOG: VOLATILE_RAM</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● AUDIT_FREQUENCY: REALTIME</span>
              <span className="bg-brand-beige p-1.5 rounded border border-brand-black/5">● SECURITY_ENCLAVE: HARDWARE</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleToggleTrigger = (id: string) => {
    if (selectedTriggers.includes(id)) {
      setSelectedTriggers(selectedTriggers.filter(t => t !== id));
    } else {
      setSelectedTriggers([...selectedTriggers, id]);
    }
    setProtocolGenerated(false);
  };

  const handleGenerateProtocol = () => {
    const hash = 'P-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-CON';
    setGeneratedHash(hash);
    setProtocolGenerated(true);
  };

  const features = [
    {
      icon: Radio,
      title: 'Ambient Presence Mesh',
      desc: 'Instead of broadcasting location continually, Connify uses cryptographically secure peer-to-peer pings that remain fully client-side unless a safety deviation triggers.',
      badge: 'ZKP Protected'
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge Auditing',
      desc: 'All coordinates are ephemeral and stored entirely locally. In emergencies, routing paths are decrypted on-the-fly and deleted immediately upon incident resolution.',
      badge: 'Zero-Logs'
    },
    {
      icon: Users,
      title: 'Coordinated Peer Network',
      desc: 'Alerts bypass central operators and route directly to vetted, active neighbors, local business safe havens, and certified volunteers nearest to you.',
      badge: '1.4m Avg Response'
    },
    {
      icon: Zap,
      title: 'Dynamic Safe-Walking',
      desc: 'Configure safe walking routes with smart timers and route boundary tolerance. Get instant silent vibration pings when a divergence is detected.',
      badge: 'Auto-Trigger'
    }
  ];

  const triggerOptions = [
    { id: 'ambient', title: 'Silent Ambient Check-ins', desc: 'Sends an encrypted beacon to trusted circles every 3 minutes' },
    { id: 'route', title: 'Route Deviation Monitor', desc: 'Triggers immediately if GPS departs from set path by 50+ meters' },
    { id: 'timer', title: 'Inactive Deadline Timer', desc: 'SOS escalates automatically if inactive at check-ins' },
    { id: 'biometric', title: 'Biometric Disconnect', desc: 'Triggers if continuous watch contact is broken' }
  ];

  return (
    <div id="safety-protocol-features" className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        {/* Decorative Grid and Ambient Lights */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-red/5 via-brand-beige/0 to-brand-beige/0 z-0 pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-red/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-brand-red/10 rounded border border-brand-red/20">
            <Shield className="h-4 w-4 text-brand-red" />
            <span className="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">Decentralized Civilian Guard</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-brand-black max-w-4xl mx-auto leading-none">
            The Decentralized Safety <span className="text-brand-red">Protocol</span>
          </h1>

          <p className="font-sans text-lg sm:text-xl text-brand-muted max-w-3xl mx-auto font-normal leading-relaxed">
            Connify replaces unreliable central alarm stations with an encrypted, peer-to-peer security mesh and user-authorized localized response protocols.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#protocol-builder"
              className="w-full sm:w-auto px-8 py-4 bg-brand-red hover:bg-brand-red-hover text-white font-sans font-extrabold rounded border-2 border-brand-black shadow-[4px_4px_0px_#1b1b1b] hover:shadow-[2px_2px_0px_#1b1b1b] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Build Custom Protocol</span>
              <ChevronRight className="h-5 w-5" />
            </a>
            <button
              onClick={() => {
                const el = document.getElementById('bento-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-brand-surface hover:bg-brand-beige text-brand-black font-sans font-bold rounded border-2 border-brand-black shadow-[4px_4px_0px_#1b1b1b] hover:shadow-[2px_2px_0px_#1b1b1b] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
            >
              Learn the Architecture
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 max-w-4xl mx-auto border-t-2 border-brand-black">
            <div className="space-y-1">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-brand-black">1.4 min</div>
              <div className="font-mono text-xs text-brand-muted tracking-wider uppercase">Avg Alert Response</div>
            </div>
            <div className="space-y-1">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-brand-black">100%</div>
              <div className="font-mono text-xs text-brand-muted tracking-wider uppercase">Zero-Logs Encrypted</div>
            </div>
            <div className="space-y-1">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-brand-black">48k+</div>
              <div className="font-mono text-xs text-brand-muted tracking-wider uppercase">Active Responders</div>
            </div>
            <div className="space-y-1">
              <div className="font-display font-extrabold text-3xl sm:text-4xl text-brand-black">620+</div>
              <div className="font-mono text-xs text-brand-muted tracking-wider uppercase">Vetted Safe Havens</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="bento-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-brand-black">Security Engineered from the Ground Up</h2>
          <p className="font-sans text-brand-muted max-w-2xl mx-auto">
            Traditional panic buttons leak metadata and cause alarm fatigue. Connify is built around state-of-the-art decentralized safety rules.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative p-8 bg-brand-surface border-2 border-brand-black rounded shadow-[4px_4px_0px_#1b1b1b] hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Spotlight background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-brand-beige rounded border border-brand-border text-brand-red group-hover:bg-brand-red/10 group-hover:border-brand-red/30 transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-brand-red bg-brand-red/5 border border-brand-red/20 px-2.5 py-1 rounded-full tracking-wider uppercase">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-brand-black group-hover:text-brand-red transition-colors duration-300">
                    {feat.title}
                  </h3>
                  <p className="font-sans text-sm text-brand-muted leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Immersive Mobile App Tour & Live Directory Gallery */}
      <section id="app-tour-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface border-2 border-brand-black rounded-xl p-8 sm:p-12 space-y-10 shadow-[6px_6px_0px_#1b1b1b] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
            <span className="font-mono text-xs font-bold text-brand-red uppercase tracking-widest bg-brand-red/5 px-3 py-1 rounded border border-brand-red/20">Product Showcase</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-black">Interactive App Screen Explorer</h2>
            <p className="font-sans text-sm text-brand-muted max-w-2xl mx-auto font-medium">
              Connify merges hyper-local coordination, secure custom GPS parameters, and community-audited safe havens. Navigate the interface screens below to see the protocol in action.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 justify-center border-b border-brand-black/10 pb-6 relative z-10">
            {tourTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded font-sans text-xs font-bold border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-red text-white border-brand-black shadow-[3px_3px_0px_#1b1b1b]'
                      : 'bg-white border-brand-black/15 text-brand-muted hover:border-brand-black hover:text-brand-black shadow-[1px_1px_0px_rgba(27,27,27,0.1)]'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Screen Layout Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-center pt-4 relative z-10">
            {/* Phone Screen Mockup Left */}
            <div className="lg:col-span-5 flex justify-center">
              {tourTabs.map((tab) => {
                if (tab.id !== activeTab) return null;
                return (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full max-w-[280px] h-[480px] sm:h-[520px] bg-brand-beige rounded-[36px] border-8 border-brand-black p-3.5 shadow-[6px_6px_0px_#1b1b1b] flex flex-col justify-between overflow-hidden"
                  >
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-24 bg-brand-black rounded-b-xl z-20" />
                    
                    {/* Screen Header */}
                    <div className="flex justify-between items-center text-[9px] font-mono text-brand-muted px-2 pt-2">
                      <span className="font-extrabold">CONNIFY_PROT</span>
                      <span className="text-brand-red font-bold">● ONLINE</span>
                    </div>

                    {/* App Visual Body */}
                    <div className="flex-1 my-3 rounded-lg border border-brand-black/10 overflow-hidden relative group">
                      <img
                        src={tab.image}
                        alt={tab.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 transition-all duration-500"
                      />
                      
                      {/* Realistic HUD overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-brand-black/30 p-3 flex flex-col justify-between font-sans">
                        <span className="self-start text-[8px] font-mono font-bold bg-brand-red text-white px-2 py-0.5 rounded border border-brand-black/20 uppercase tracking-wider">
                          {tab.tag}
                        </span>
                        
                        <div className="space-y-1 text-white">
                          <span className="block font-mono text-[9px] text-brand-red uppercase font-black tracking-widest">Active Safe Guard</span>
                          <span className="block font-display font-bold text-[13px] leading-tight text-white drop-shadow">
                            {tab.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="w-16 h-1 bg-brand-black/20 rounded-full mx-auto" />
                  </motion.div>
                );
              })}
            </div>

            {/* Screen Details Right */}
            <div className="lg:col-span-7 space-y-6">
              {tourTabs.map((tab) => {
                if (tab.id !== activeTab) return null;
                return (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <span className="font-mono text-[10px] font-bold text-brand-red uppercase tracking-wider block">INTERFACE DETAILS:</span>
                      <h3 className="font-display font-extrabold text-2xl text-brand-black">
                        {tab.title}
                      </h3>
                      <p className="font-sans text-sm text-brand-muted italic font-medium">
                        "{tab.subtitle}"
                      </p>
                    </div>

                    <div className="p-1 bg-brand-beige border-2 border-brand-black rounded-lg">
                      <div className="bg-brand-surface p-5 rounded border border-brand-black/5">
                        {tab.screenDetails}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5 text-xs text-brand-muted font-sans font-medium">
                      <div className="p-2 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded">
                        <Shield className="h-4 w-4" />
                      </div>
                      <span>Every action is fully verified via decentralized neighbor nodes on-mesh, keeping you completely self-sovereign.</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Custom Protocol Builder Section */}
      <section id="protocol-builder" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-brand-surface border-2 border-brand-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#1b1b1b] grid lg:grid-cols-12 gap-0 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Form Left Column */}
          <div className="p-8 sm:p-12 lg:col-span-7 space-y-8 border-b lg:border-b-0 lg:border-r-2 border-brand-black">
            <div className="space-y-3">
              <span className="font-mono text-[10px] font-semibold text-brand-red uppercase tracking-widest bg-brand-red/5 px-2.5 py-1 rounded border border-brand-red/20">Interactive Sandbox</span>
              <h2 className="font-display font-bold text-3xl text-brand-black">Assemble Your Safety Protocol</h2>
              <p className="font-sans text-sm text-brand-muted leading-relaxed">
                Check the alert conditions and rules you want to embed. Connify compiles these into a secure custom JSON-policy loaded onto your phone.
              </p>
            </div>

            {/* Triggers Checklist */}
            <div className="space-y-4">
              <span className="font-mono text-xs font-bold text-brand-muted uppercase tracking-wider">Configure Conditions & Safe Guards</span>
              <div className="grid gap-3.5">
                {triggerOptions.map((option) => {
                  const isChecked = selectedTriggers.includes(option.id);
                  return (
                    <div
                      key={option.id}
                      onClick={() => handleToggleTrigger(option.id)}
                      className={`p-4 rounded border transition-all duration-200 cursor-pointer flex items-start space-x-4 ${
                        isChecked
                          ? 'bg-brand-red/5 border-brand-red/50 shadow-[2px_2px_0px_#1b1b1b]'
                          : 'bg-brand-beige/50 border-brand-border/40 hover:bg-brand-beige hover:border-brand-black'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-brand-red border-brand-black text-white' : 'border-brand-muted bg-white'
                      }`}>
                        {isChecked && <CheckCircle className="h-4 w-4 text-white fill-brand-red border-none" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-sans text-sm font-semibold transition-colors ${isChecked ? 'text-brand-black font-bold' : 'text-brand-muted'}`}>
                          {option.title}
                        </span>
                        <p className="font-sans text-xs text-brand-muted">
                          {option.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Time slider */}
            {selectedTriggers.includes('timer') && (
              <div className="space-y-3 bg-brand-beige p-4 rounded border border-brand-black">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-brand-muted font-bold">INACTIVITY TIMER LIMIT:</span>
                  <span className="text-brand-red font-bold">{customTime} MINUTES</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(parseInt(e.target.value));
                    setProtocolGenerated(false);
                  }}
                  className="w-full h-1.5 bg-brand-surface rounded appearance-none cursor-pointer accent-brand-red border border-brand-black"
                />
                <span className="block text-[10px] text-brand-muted font-sans italic">
                  Escalates to SOS if check-in button is not pushed within this time frame.
                </span>
              </div>
            )}

            <button
              onClick={handleGenerateProtocol}
              disabled={selectedTriggers.length === 0}
              className="w-full py-4 bg-brand-red hover:bg-brand-red-hover disabled:bg-brand-beige disabled:text-brand-muted disabled:border-brand-muted/20 text-white font-sans font-bold text-sm rounded border-2 border-brand-black shadow-[4px_4px_0px_#1b1b1b] hover:shadow-[2px_2px_0px_#1b1b1b] hover:translate-x-[2px] hover:translate-y-[2px] disabled:translate-none disabled:shadow-none transition-all cursor-pointer uppercase tracking-wider"
            >
              Compile & Sign Protocol Key
            </button>
          </div>

          {/* Visual Output Right Column */}
          <div className="p-8 sm:p-12 lg:col-span-5 bg-brand-beige/50 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="font-mono text-xs font-bold text-brand-muted uppercase tracking-wider">Protocol Certificate Manifest</span>
              
              <div className="bg-brand-surface border-2 border-brand-black rounded p-6 font-mono text-xs space-y-4 shadow-[3px_3px_0px_#1b1b1b]">
                <div className="flex justify-between text-[10px] text-brand-muted border-b border-brand-black/10 pb-2.5">
                  <span>METADATA</span>
                  <span className="text-brand-red font-bold animate-pulse">● READY TO CONFIGURE</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">PROTOCOL_TYPE:</span>
                    <span className="text-brand-black font-bold">CLIENT_AUTHORITATIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">GUARDIAN_RADIUS:</span>
                    <span className="text-brand-red font-bold">1000m (LOCAL MESH)</span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-brand-muted">ACTIVE_GUARDS:</span>
                    <span className="text-brand-black font-bold">{selectedTriggers.length > 0 ? selectedTriggers.join(' | ').toUpperCase() : 'NONE'}</span>
                  </div>
                  {selectedTriggers.includes('timer') && (
                    <div className="flex justify-between">
                      <span className="text-brand-muted">TIMEOUT_THRESHOLD:</span>
                      <span className="text-brand-red font-bold">{customTime} mins</span>
                    </div>
                  )}
                </div>

                {protocolGenerated ? (
                  <div className="pt-4 border-t border-brand-black/10 space-y-3">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-brand-muted">SIGNATURE_HASH:</span>
                      <span className="text-brand-red font-bold font-mono tracking-wider">{generatedHash}</span>
                    </div>
                    <div className="p-2.5 bg-brand-red/5 rounded border border-brand-red/20 text-[10px] text-brand-red leading-relaxed font-mono">
                      // Verified cryptographic key created. Handshake token signed. Safe-zone routing generated successfully.
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-brand-black/10 text-center py-6 text-brand-muted text-[11px] italic">
                    Configure triggers and click compile to generate security handshake keys.
                  </div>
                )}
              </div>
            </div>

            {protocolGenerated && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowDownloadNotification(true);
                    setTimeout(() => setShowDownloadNotification(false), 5000);
                  }}
                  className="w-full py-3 bg-brand-surface hover:bg-brand-beige border-2 border-brand-black text-brand-black hover:text-brand-red font-mono text-xs font-bold rounded shadow-[3px_3px_0px_#1b1b1b] hover:shadow-[1px_1px_0px_#1b1b1b] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4 text-brand-red" />
                  <span>DOWNLOAD POLICY JSON</span>
                </button>
                
                <AnimatePresence>
                  {showDownloadNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-white border border-brand-red text-[11px] font-sans font-bold text-brand-red text-center rounded shadow-sm"
                    >
                      ✓ Custom security protocol manifest JSON generated & downloaded to device sandbox.
                    </motion.div>
                  )}
                </AnimatePresence>

                <span className="block text-[10px] text-brand-muted text-center font-sans">
                  Instantly loadable to Connify iOS / Android clients. Includes ZK proof headers.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
