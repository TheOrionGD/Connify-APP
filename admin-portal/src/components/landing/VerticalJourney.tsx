import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  MapPin,
  CheckCircle,
  Handshake,
  QrCode,
  AlertTriangle,
  Key,
  Activity,
  ChevronDown,
  Fingerprint,
  Radio,
  RefreshCw,
  Filter,
  Play,
  Square,
  Check,
  Layers,
  Sparkles,
  Lock,
  Terminal,
  Cpu,
  Compass,
  Database
} from 'lucide-react';

/* ============================================================================
 * TYPE DEFINITIONS & DOMAIN MODELS (ALIGNED WITH SHARP ARCHITECTURE)
 * ============================================================================ */

export type RouteDestination =
  | 'splash'
  | 'coordination'
  | 'trusted'
  | 'trustworthy'
  | 'features'
  | 'how-it-works'
  | 'privacy'
  | 'protocol-features'
  | 'login';

export interface VerticalJourneyProps {
  setRoute: (route: RouteDestination) => void;
}

export type RoleType = 'requester' | 'helper';
export type SimulationStatus = 'standby' | 'initiating' | 'sharp_handshake' | 'capsule_issued' | 'monitoring' | 'resolved' | 'sos_active';
export type MetricCategory = 'all' | 'privacy' | 'speed' | 'cryptography';

export interface ProximityAlert {
  id: string;
  title: string;
  location: string;
  distance: number; // in meters
  type: 'late_walk' | 'check_in' | 'sos_distress';
  status: 'active' | 'monitoring' | 'resolved';
  timestamp: string;
  episodeId: string;
}

export interface FlowStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: 'cyan' | 'emerald' | 'amber' | 'red';
  badge: string;
}

export interface TrustProtocolLayer {
  id: string;
  layerNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: 'cyan' | 'emerald' | 'amber' | 'red';
  technicalDetails: {
    label: string;
    value: string;
  }[];
  codeSnippet: string;
}

export interface ComparisonMetric {
  id: string;
  feature: string;
  traditionalApp: string;
  connifyProtocol: string;
  category: 'privacy' | 'speed' | 'cryptography';
  isHighlight?: boolean;
}

export interface PrivacyControlItem {
  id: string;
  title: string;
  category: 'hardware' | 'storage' | 'network';
  description: string;
  enabled: boolean;
  securityImpact: string;
}

/* ============================================================================
 * STATIC DATA & CONFIGURATION (AUTHENTIC CONNIFY ARCHITECTURE)
 * ============================================================================ */

const INITIAL_PROXIMITY_ALERTS: ProximityAlert[] = [
  {
    id: 'alt-001',
    title: 'Late Walk: Downtown Corridor',
    location: 'Grid Cell #8492 (PostGIS Coarse)',
    distance: 140,
    type: 'late_walk',
    status: 'active',
    timestamp: '2 mins ago',
    episodeId: 'EP-ID-UUIDv4-9A4B'
  },
  {
    id: 'alt-002',
    title: 'Station Transit Check-in',
    location: 'Grid Cell #3120 (PostGIS Coarse)',
    distance: 380,
    type: 'check_in',
    status: 'monitoring',
    timestamp: 'Just now',
    episodeId: 'EP-ID-UUIDv4-7C11'
  },
  {
    id: 'alt-003',
    title: 'Night Shift Walk Escort',
    location: 'Grid Cell #5519 (PostGIS Coarse)',
    distance: 520,
    type: 'late_walk',
    status: 'active',
    timestamp: '5 mins ago',
    episodeId: 'EP-ID-UUIDv4-2E88'
  }
];

const REQUESTER_FLOW_STEPS: FlowStep[] = [
  {
    stepNumber: '01',
    title: 'Create Ephemeral Episode ID',
    subtitle: 'UUIDv4 Transactional Isolation',
    description: 'Set category and urgency slider via our Selective Disclosure Engine. An ephemeral Episode ID (DID equivalent) is minted without logging permanent GPS trails.',
    icon: MapPin,
    accentColor: 'cyan',
    badge: 'ZERO IDENTITIES'
  },
  {
    stepNumber: '02',
    title: 'SHARP Proximity Handshake',
    subtitle: 'Environmental Signal Tags & BCH',
    description: 'The Helper Match Engine pairs you via PostGIS coarse radius checks while time-bound QR tokens exchange BCH syndromes to verify environmental signal tags.',
    icon: Shield,
    accentColor: 'cyan',
    badge: 'SHARP PROTOCOL'
  },
  {
    stepNumber: '03',
    title: 'JIT Trust Capsule Issuance',
    subtitle: 'Ed25519 Signed JWT + Redis Lock',
    description: 'Once SHARP verification succeeds, a Trust Capsule is minted Just-In-Time (JIT) with a single-use Redis NX lock, authorizing ephemeral communication until arrival.',
    icon: Handshake,
    accentColor: 'emerald',
    badge: 'JIT CAPSULE'
  }
];

const HELPER_FLOW_STEPS: FlowStep[] = [
  {
    stepNumber: '01',
    title: 'Selective Disclosure Feed',
    subtitle: 'Coarse PostGIS Radius Matching',
    description: 'Candidate helpers view anonymized requests showing only category, urgency, and approximate distance pre-match, keeping requester identities completely shielded.',
    icon: Activity,
    accentColor: 'emerald',
    badge: 'BLINDED QUERY'
  },
  {
    stepNumber: '02',
    title: 'SHARP Verification & BCH',
    subtitle: 'Bloom Filter & LTE TC-RNTI Sync',
    description: 'Accept an episode with one tap. Your device constructs a local Bloom filter (>64 bits entropy) and submits a blinded grid index to reconstruct session key K.',
    icon: Fingerprint,
    accentColor: 'emerald',
    badge: 'KEY RECOVERY'
  },
  {
    stepNumber: '03',
    title: 'Complete & Outcome Logging',
    subtitle: 'Decoupled Audit Purge',
    description: 'Meet at the safe zone, verify the rotating QR token, and finalize. Ephemeral channels auto-destruct while the Outcome Service logs minimal identity-free proof.',
    icon: QrCode,
    accentColor: 'cyan',
    badge: 'MINIMAL AUDIT'
  }
];

const PROTOCOL_LAYERS_DATA: TrustProtocolLayer[] = [
  {
    id: 'layer-01',
    layerNumber: '01',
    title: 'Identity & Episode Registry',
    subtitle: 'Ephemeral UUIDv4 Transactional Identifier (DID)',
    description: 'Replaces permanent user profiles and centralized directories with single-use transactional tokens. Each safety request is assigned a unique Episode ID (DID concept simplified), ensuring full isolation and zero historical surveillance across sessions.',
    icon: Key,
    accentColor: 'cyan',
    technicalDetails: [
      { label: 'Identifier Specification', value: 'UUIDv4 Ephemeral Transaction ID' },
      { label: 'Spatial Indexing', value: 'PostGIS Coarse Cell Bounding' },
      { label: 'Identity Graph', value: '0 Persistent Linkage (No DID Profile)' },
      { label: 'Disclosure Filtering', value: 'Rule-Based Selective Disclosure' }
    ],
    codeSnippet: `const episode = await connify.createEpisode({
  episodeId: generateUUIDv4(), // DID-equivalent transactional ID
  category: 'ESCORT_CHECK_IN',
  urgencyLevel: 3,
  coarseGridCell: postgis.getGridIndex(coords, { radiusMeters: 500 }),
  selectiveDisclosure: { hideIdentity: true, hideExactAddress: true }
});`
  },
  {
    id: 'layer-02',
    layerNumber: '02',
    title: 'SHARP Verification Handshake',
    subtitle: 'Environmental Signal Tags & BCH Syndrome Decoding',
    description: 'Executes our core SHARP (Secure Proximity Handshake & Relayed Protocol). Client devices capture local Wi-Fi frame headers and LTE control messages (TC-RNTI) into local Bloom filters (>64 bits entropy) to prevent GPS spoofing, while fuzzy extractors reconstruct session key K via BCH syndromes.',
    icon: Shield,
    accentColor: 'emerald',
    technicalDetails: [
      { label: 'Environmental Signals', value: 'Wi-Fi Frame Headers + LTE TC-RNTI' },
      { label: 'Anti-Spoofing Entropy', value: '> 64 Bits Bloom Filter Matrix' },
      { label: 'Fuzzy Key Reconstruction', value: 'BCH Error-Correcting Syndrome' },
      { label: 'Grid Index Blinding', value: 'B = H\'(K, b || "Bob") Oblivious Cell' }
    ],
    codeSnippet: `const sharpVerification = await handshake.verifySHARP({
  requesterSyndromes: qrPayload.bchSyndromes,
  localBloomFilter: buildBloomFilter({ wifiFrames, lteTcRnti }),
  blindedGridIndex: sha256(sessionKeyK + localCellIndex + "Bob"),
  expectedTimestamp: session.currentWindow
}); // Returns { verified: true, sessionKeyK: reconstructedKey }`
  },
  {
    id: 'layer-03',
    layerNumber: '03',
    title: 'Trust Capsule Service',
    subtitle: 'Just-In-Time (JIT) Ed25519 JWT + Redis NX Lock',
    description: 'Trust Capsules are minted Just-In-Time (JIT) only after the SHARP proximity verification passes. Each capsule is cryptographically signed using device-bound Ed25519 private keys stored in hardware secure vaults and locked via Valkey/Redis single-use locks.',
    icon: Lock,
    accentColor: 'cyan',
    technicalDetails: [
      { label: 'Issuance Protocol', value: 'Just-In-Time (JIT) Post-Handshake' },
      { label: 'Cryptographic Signature', value: 'Ed25519 Hardware-Bound Key Pair' },
      { label: 'Single-Use Enforcement', value: 'Redis SET capsule:{id} used NX EX {ttl}' },
      { label: 'Token Storage', value: 'SHA-256 Hashes (No DB Plaintext)' }
    ],
    codeSnippet: `const trustCapsule = await capsuleService.mintJITCapsule({
  episodeId: episode.episodeId,
  helperId: verification.matchedHelperId,
  ttlSeconds: 300,
  ed25519Signer: hardwareSecureStorage.getPrivateKey()
});
// Enforce single-use lock in Valkey/Redis:
await redis.set(\`capsule:\${trustCapsule.id}\`, 'ACTIVE', 'NX', 'EX', 300);`
  },
  {
    id: 'layer-04',
    layerNumber: '04',
    title: 'Decoupled Outcome Logging',
    subtitle: 'Zero-Knowledge Audit & Ephemeral Channel Purge',
    description: 'To eliminate surveillance creep, audit logs are completely decoupled from user identities. The Outcome Service records only binary success/failure, category, and SLA window adherence. Ephemeral WebSockets auto-destruct on capsule expiry with zero chat retention.',
    icon: Database,
    accentColor: 'amber',
    technicalDetails: [
      { label: 'Audit Payload', value: 'Binary Success/Fail + Category Only' },
      { label: 'Identity Footprint', value: 'Stripped of Episode ID and Helper DID' },
      { label: 'Location Trail Log', value: '0 GPS Breadcrumbs Saved to Disk' },
      { label: 'Comms Channel TTL', value: 'Auto-Destruct on Capsule Expiry' }
    ],
    codeSnippet: `await outcomeService.recordOutcome({
  outcomeStatus: 'SUCCESS_CONFIRMED',
  category: episode.category,
  completedWithinWindow: true,
  riskLevel: 'STANDARD_PROXIMITY'
  // Note: Episode ID, Helper DID, and exact coordinates are omitted by design
});
await commsRelay.destroyEphemeralChannel(trustCapsule.channelId);`
  }
];

const COMPARISON_METRICS_DATA: ComparisonMetric[] = [
  {
    id: 'comp-1',
    feature: 'Identity & Transaction Isolation',
    traditionalApp: 'Permanent user profiles, phone numbers, and reputation scores linked',
    connifyProtocol: 'Ephemeral UUIDv4 Episode IDs (DID equivalent) with zero linkage',
    category: 'privacy',
    isHighlight: true
  },
  {
    id: 'comp-2',
    feature: 'Location Anti-Spoofing Check',
    traditionalApp: 'Basic GPS polling vulnerable to mock location software',
    connifyProtocol: 'SHARP Handshake via Wi-Fi frame headers + LTE TC-RNTI in Bloom filters',
    category: 'cryptography',
    isHighlight: true
  },
  {
    id: 'comp-3',
    feature: 'Credential Issuance Timing',
    traditionalApp: 'Always-active OAuth access tokens with long-lived permissions',
    connifyProtocol: 'JIT Trust Capsule (Ed25519 signed JWT + Redis SET NX single-use lock)',
    category: 'cryptography'
  },
  {
    id: 'comp-4',
    feature: 'Proximity Privacy & Tracking',
    traditionalApp: 'Continuous background GPS coordinate streams sent to cloud servers',
    connifyProtocol: 'Grid Index Blinding (B = H\'(K, b || "Bob")) + PostGIS coarse filtering',
    category: 'privacy',
    isHighlight: true
  },
  {
    id: 'comp-5',
    feature: 'Emergency Priority Routing',
    traditionalApp: 'Standard HTTP queue prone to cellular network congestion',
    connifyProtocol: 'Analog Hardware Rig priority override (< 90s SLA to Trusted Circle)',
    category: 'speed'
  },
  {
    id: 'comp-6',
    feature: 'Post-Task Audit & Retention',
    traditionalApp: 'Full chat transcripts and exact movement breadcrumbs stored forever',
    connifyProtocol: 'Decoupled Outcome Logging storing only binary success/fail & category',
    category: 'privacy'
  }
];

const INITIAL_PRIVACY_CONTROLS: PrivacyControlItem[] = [
  {
    id: 'priv-1',
    title: 'Hardware-Backed Ed25519 Key Vault',
    category: 'hardware',
    description: 'Enforce device-bound Ed25519 signing keys inside hardware secure storage (iOS Keychain / Android Keystore), never in plaintext RAM.',
    enabled: true,
    securityImpact: 'Zero private key exposure during extraction'
  },
  {
    id: 'priv-2',
    title: 'SHA-256 Bearer Token Hash Storage',
    category: 'storage',
    description: 'Store active session bearer tokens exclusively as SHA-256 digests (`signed_token_hash`) inside Postgres/Prisma DB to neutralize read breaches.',
    enabled: true,
    securityImpact: 'Prevent token replay on DB breach'
  },
  {
    id: 'priv-3',
    title: 'Decoupled Outcome Logging Enforcer',
    category: 'storage',
    description: 'Automatically strip all Episode IDs, Helper identities, and spatial coordinates before committing completion records to the Outcome Service.',
    enabled: true,
    securityImpact: '100% historical identity decoupling'
  },
  {
    id: 'priv-4',
    title: 'Environmental Signal Tag Gating',
    category: 'network',
    description: 'Restrict capture of local Wi-Fi frames and LTE TC-RNTI control headers strictly to active 300-second SHARP verification handshake windows.',
    enabled: true,
    securityImpact: 'Prevent background signal surveillance'
  }
];

/* ============================================================================
 * HELPER HOOKS & SIMULATION RIG
 * ============================================================================ */

function useEpisodeSimulation() {
  const [status, setStatus] = useState<SimulationStatus>('standby');
  const [distance, setDistance] = useState<number>(240);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [tokenHash, setTokenHash] = useState<string>('CFY-EP-UUIDv4-8F9A');

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (status === 'initiating' || status === 'sharp_handshake' || status === 'capsule_issued' || status === 'monitoring') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setDistance((prevDist) => {
          const next = Math.max(0, prevDist - 12);
          if (next <= 0) {
            setStatus('resolved');
          } else if (next < 80 && status !== 'monitoring') {
            setStatus('monitoring');
          } else if (next < 160 && status === 'initiating') {
            setStatus('sharp_handshake');
          } else if (next < 120 && status === 'sharp_handshake') {
            setStatus('capsule_issued');
          }
          return next;
        });
        const randomHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
        setTokenHash(`CFY-EP-UUIDv4-${randomHex}`);
      }, 800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  const startSimulation = useCallback(() => {
    setDistance(240);
    setElapsedSeconds(0);
    setStatus('initiating');
  }, []);

  const stopSimulation = useCallback(() => {
    setStatus('standby');
    setDistance(240);
    setElapsedSeconds(0);
  }, []);

  const triggerSos = useCallback(() => {
    setStatus('sos_active');
    setTokenHash('EMERGENCY-ANALOG-QOS-OVERRIDE');
  }, []);

  return {
    status,
    distance,
    elapsedSeconds,
    tokenHash,
    startSimulation,
    stopSimulation,
    triggerSos
  };
}

/* ============================================================================
 * MAIN COMPONENT: COMPACT, HIGH-FIDELITY SHARP SHOWCASE (ALL 6 MORPHISMS)
 * ============================================================================ */

export default function VerticalJourney({ setRoute }: VerticalJourneyProps) {
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Interactive state
  const [activeRole, setActiveRole] = useState<RoleType>('requester');
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-01');
  const [isEmergencyRigActive, setIsEmergencyRigActive] = useState<boolean>(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState<string>('05:00');
  const [selectedMetricCategory, setSelectedMetricCategory] = useState<MetricCategory>('all');
  const [privacyControls, setPrivacyControls] = useState<PrivacyControlItem[]>(INITIAL_PRIVACY_CONTROLS);
  const [alertsList, setAlertsList] = useState<ProximityAlert[]>(INITIAL_PROXIMITY_ALERTS);

  const simulation = useEpisodeSimulation();

  useEffect(() => {
    if (!isEmergencyRigActive) return;
    let seconds = 300;
    const timer = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        clearInterval(timer);
        setEmergencyCountdown('00:00');
        return;
      }
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setEmergencyCountdown(`${m}:${s}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [isEmergencyRigActive]);

  const filteredMetrics = useMemo(() => {
    if (selectedMetricCategory === 'all') return COMPARISON_METRICS_DATA;
    return COMPARISON_METRICS_DATA.filter((m) => m.category === selectedMetricCategory);
  }, [selectedMetricCategory]);

  const activeProtocolLayer = useMemo(() => {
    return PROTOCOL_LAYERS_DATA.find((layer) => layer.id === activeLayerId) || PROTOCOL_LAYERS_DATA[0];
  }, [activeLayerId]);

  const togglePrivacyControl = useCallback((id: string) => {
    setPrivacyControls((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  }, []);

  const privacyScore = useMemo(() => {
    const activeCount = privacyControls.filter((c) => c.enabled).length;
    return Math.round((activeCount / privacyControls.length) * 100);
  }, [privacyControls]);

  const handleRefreshAlerts = useCallback(() => {
    setAlertsList((prev) =>
      prev.map((alert) => ({
        ...alert,
        distance: Math.max(50, alert.distance + Math.floor(Math.random() * 40 - 20)),
        timestamp: 'Just synced'
      }))
    );
  }, []);

  return (
    <div className="bg-[#f9f9f9] text-[#1b1b1b] font-sans min-h-screen selection:bg-[#b60100]/20 selection:text-[#b60100]">

      {/* Compact Top Morphism Showcase Banner (Glassmorphism) */}
      <div className="sticky top-0 z-50 glass-panel border-b border-red/10 px-4 py-2 text-xs font-mono backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 overflow-x-auto custom-scroll-hide">
          <div className="flex items-center gap-2 text-cyan-400 font-bold redspace-nowrap">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            <span>CONNIFY SHARP PROTOCOL &bull; 6-MORPHISM UI SYSTEM</span>
          </div>
          <div className="flex items-center gap-1.5 redspace-nowrap text-[10px]">
            <span className="glass-pill px-2 py-0.5 rounded text-cyan-300 border border-cyan-400/30">Auroramorphism</span>
            <span className="holo-badge px-2 py-0.5 rounded">Holomorphism</span>
            <span className="clay-badge px-2 py-0.5 rounded text-red bg-[#18233c]">Claymorphism</span>
            <span className="neuo-btn px-2 py-0.5 rounded text-slate-300">Neomorphism</span>
            <span className="skeuo-panel px-2 py-0.5 rounded text-amber-300 border border-slate-700">Skeuomorphism</span>
            <span className="glass-pill px-2 py-0.5 rounded text-emerald-300">Glassmorphism</span>
          </div>
        </div>
      </div>

      {/* Main compact container with reduced div overhead and tight spacing */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-14">

        {/* ====================================================================
         * SECTION 01 — HERO & INTRO (Auroramorphism + Glassmorphism)
         * ==================================================================== */}
        <section id="intro" className="scroll-mt-20">
          <div className="aurora-card p-6 md:p-10 rounded-2xl border border-cyan-500/40 shadow-2xl relative overflow-hidden text-center space-y-6">

            {/* Morphism Badge Header */}
            <div className="flex justify-between items-center text-left text-[11px] font-mono border-b border-red/10 pb-3">
              <div className="inline-flex items-center gap-2 text-cyan-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>SECTION 01: SHARP PROTOCOL ARCHITECTURE</span>
              </div>
              <span className="glass-pill px-2.5 py-1 rounded-md text-cyan-200 border border-cyan-400/40 font-bold uppercase tracking-wider">
                Auroramorphism + Glassmorphism
              </span>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto pt-2">
              <h1 className="font-jakarta text-3xl md:text-5xl font-extrabold text-red tracking-tight leading-tight">
                Decentralized Proximity Safety, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-[#00f0ff]">
                  Powered by the SHARP Handshake.
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                Explore Connify’s high-fidelity technical verification deck. Reconstructing single-use trust relationships via Environmental Signal Tag Bloom filters, BCH syndrome key decoding, and JIT Ed25519 Trust Capsules—without permanent profiles or tracking.
              </p>
            </div>

            {/* Ergonomic Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 font-mono text-xs">
              <button
                onClick={() => scrollToSection('coordination')}
                className="glass-card px-6 py-3 font-bold uppercase tracking-wider text-cyan-300 hover:text-red flex items-center justify-center gap-2 rounded-xl transition-all border border-cyan-500/40 cursor-pointer shadow-lg"
              >
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Inspect SHARP Interactive HUD</span>
                <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
              </button>
              <button
                onClick={() => setRoute('login')}
                className="clay-btn !bg-cyan-600 hover:!bg-cyan-500 text-red px-6 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-md"
              >
                <Lock className="h-4 w-4" />
                <span>Enter Admin Dashboard</span>
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================================
         * SECTION 02 — SHARP COORDINATION ENGINE (Holomorphism + Neomorphism)
         * ==================================================================== */}
        <section id="coordination" className="space-y-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                SECTION 02: HELPER MATCH ENGINE &amp; SHARP RADAR
              </div>
              <h2 className="font-jakarta text-2xl md:text-3xl font-extrabold text-red mt-1">
                Proximity verification via <span className="text-cyan-400 underline decoration-cyan-500 decoration-2">Environmental Bloom Filters</span>.
              </h2>
            </div>
            <span className="holo-badge self-start sm:self-auto px-3 py-1 rounded font-mono text-[10px] font-bold uppercase">
              Holomorphism + Neomorphism
            </span>
          </div>

          {/* Compact Bento Container */}
          <div className="holo-card p-5 md:p-6 rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative overflow-hidden">
            <div className="holo-corner top-0 left-0 border-t-2 border-l-2 border-cyan-400" />
            <div className="holo-corner top-0 right-0 border-t-2 border-r-2 border-cyan-400" />
            <div className="holo-corner bottom-0 left-0 border-b-2 border-l-2 border-cyan-400" />
            <div className="holo-corner bottom-0 right-0 border-b-2 border-r-2 border-cyan-400" />

            {/* Left Column: Live Radar Telemetry */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <div className="flex items-center gap-2 font-mono text-xs text-cyan-300 font-bold">
                  <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                  <span>POSTGIS COARSE RADIUS FEED</span>
                </div>
                <button
                  onClick={handleRefreshAlerts}
                  className="text-cyan-400 hover:text-red flex items-center gap-1 text-[11px] font-mono transition-colors cursor-pointer"
                  title="Sync live signals"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Sync Alerts</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Helper Match Engine active within PostGIS coarse spatial cells. Candidate guardians receive anonymized, disclosure-filtered requests pre-match without revealing full identities.
              </p>

              {/* Compact Proximity Alerts List */}
              <div className="space-y-2.5 font-mono">
                {alertsList.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-red/60 rounded-xl border border-red/10 flex items-center justify-between hover:border-cyan-400/40 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.status === 'active' ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-cyan-400'}`} />
                      <div>
                        <div className="font-bold text-red flex items-center gap-1.5">
                          <span>{alert.title}</span>
                          {alert.type === 'late_walk' && (
                            <span className="text-[9px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">ESCORT</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{alert.location} &bull; {alert.episodeId}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xs font-bold text-cyan-300">{alert.distance}m</span>
                      <div className="text-[9px] text-slate-400 uppercase">{alert.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Episode Simulator Rig (Neomorphism Inset viewport) */}
            <div className="lg:col-span-6 neuo-card p-5 rounded-2xl border border-cyan-500/30 space-y-4 bg-[#070a10]">
              <div className="flex items-center justify-between border-b border-red/10 pb-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>SHARP HANDSHAKE SIMULATOR</span>
                </div>
                <span className="glass-pill px-2 py-0.5 rounded text-[10px] text-emerald-300 font-bold uppercase">
                  {simulation.status === 'standby' ? 'READY' : simulation.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              {/* Compact Simulation Display */}
              <div className="relative h-40 rounded-xl overflow-hidden border border-cyan-500/30 bg-red/80 flex flex-col justify-between p-4 shadow-inner font-mono text-xs">
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="text-[9px] text-slate-400 block">EPISODE ID (UUIDv4 ISOLATION)</span>
                    <span className="text-cyan-300 font-bold tracking-wider">{simulation.tokenHash}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block">DISTANCE TO TARGET</span>
                    <span className="text-xl font-bold text-red">{simulation.distance}m</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 z-10">
                  <div className="flex justify-between text-[10px] text-slate-300">
                    <span>START: 240m</span>
                    <span>ELAPSED: {simulation.elapsedSeconds}s</span>
                    <span>SAFE ZONE: 0m</span>
                  </div>
                  <div className="h-2.5 w-full bg-red/10 rounded-full overflow-hidden p-0.5 border border-red/20">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                      style={{ width: `${Math.min(100, Math.max(5, ((240 - simulation.distance) / 240) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center z-10 text-[10px] text-slate-400 border-t border-red/10 pt-1.5">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="h-3 w-3" />
                    <span>BCH SYNDROME DECODED</span>
                  </span>
                  <span className="text-cyan-400 font-bold">ED25519 JIT CAPSULE</span>
                </div>
              </div>

              {/* Ergonomic Simulation Controls */}
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                {simulation.status === 'standby' || simulation.status === 'resolved' ? (
                  <button
                    onClick={simulation.startSimulation}
                    className="clay-btn !bg-cyan-600 hover:!bg-cyan-500 text-red py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all col-span-2"
                  >
                    <Play className="h-4 w-4 fill-red" />
                    <span>Initiate SHARP Proximity Episode</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={simulation.stopSimulation}
                      className="neuo-btn text-slate-300 hover:text-red py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-red/20 cursor-pointer"
                    >
                      <Square className="h-3.5 w-3.5 fill-current" />
                      <span>Stop Simulation</span>
                    </button>
                    <button
                      onClick={simulation.triggerSos}
                      className="neuo-red-btn py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg text-red"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Trigger SOS Override</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dual-Flow Segmented Role Architecture */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red/40 p-3 rounded-xl border border-red/10">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-red">SHARP ROLE PROTOCOL SWITCHER:</span>
              </div>
              <div className="inline-flex p-1 bg-red/80 rounded-xl border border-red/10 font-mono text-xs">
                <button
                  onClick={() => setActiveRole('requester')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeRole === 'requester' ? 'bg-cyan-600 text-red shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'text-slate-400 hover:text-red'}`}
                >
                  Requester Flow (Person Walking)
                </button>
                <button
                  onClick={() => setActiveRole('helper')}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${activeRole === 'helper' ? 'bg-emerald-600 text-red shadow-[0_0_10px_rgba(52,211,153,0.4)]' : 'text-slate-400 hover:text-red'}`}
                >
                  Helper Flow (Candidate Neighbor)
                </button>
              </div>
            </div>

            {/* Role Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(activeRole === 'requester' ? REQUESTER_FLOW_STEPS : HELPER_FLOW_STEPS).map((step) => {
                const IconComponent = step.icon;
                const isCyan = step.accentColor === 'cyan';
                return (
                  <div
                    key={`${activeRole}-${step.stepNumber}`}
                    className={`neuo-card p-5 rounded-2xl space-y-3 transition-all border ${isCyan ? 'hover:border-cyan-400/50' : 'hover:border-emerald-400/50'}`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isCyan ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'}`}>
                        STEP {step.stepNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{step.badge}</span>
                    </div>

                    <div className={`w-10 h-10 neuo-inset rounded-xl flex items-center justify-center ${isCyan ? 'text-cyan-400' : 'text-emerald-400'}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div>
                      <h4 className="font-jakarta text-base font-bold text-red">{step.title}</h4>
                      <div className={`text-[11px] font-mono font-bold mt-0.5 ${isCyan ? 'text-cyan-300' : 'text-emerald-300'}`}>
                        {step.subtitle}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 font-sans">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================================
         * SECTION 03 — ANALOG PRIORITY HARDWARE RIG (Skeuomorphism + Claymorphism)
         * ==================================================================== */}
        <section id="trusted" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[11px] font-bold text-red-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                SECTION 03: ANALOG PRIORITY HARDWARE MATRIX
              </div>
              <h2 className="font-jakarta text-2xl md:text-3xl font-extrabold text-red mt-1">
                Tactile hardware rig for <span className="text-red-400 italic font-extrabold underline decoration-red-500 decoration-2">high-stakes emergencies</span>.
              </h2>
            </div>
            <span className="skeuo-panel px-3 py-1 rounded font-mono text-[10px] font-bold text-amber-300 uppercase border border-slate-700">
              Skeuomorphism + Claymorphism
            </span>
          </div>

          <div className="skeuo-panel p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-2xl border border-red-500/40">
            {/* Tactile Screws */}
            <div className="skeuo-screw absolute top-3 left-3 w-3 h-3" />
            <div className="skeuo-screw absolute top-3 right-3 w-3 h-3" />
            <div className="skeuo-screw absolute bottom-3 left-3 w-3 h-3" />
            <div className="skeuo-screw absolute bottom-3 right-3 w-3 h-3" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#b60100]/20 border-2 border-[#b60100] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(182,1,0,0.6)] flex-shrink-0">
                    <div className="w-full h-full bg-[#b60100] rounded-xl flex items-center justify-center">
                      <AlertTriangle className="text-red h-7 w-7 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-jakarta text-xl font-extrabold text-red uppercase">Emergency Override Rig</h3>
                      <span className="text-[10px] font-mono bg-[#b60100] text-red px-2 py-0.5 rounded font-bold">ANALOG MODE</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      Hardware distress triggers and dead-man timers elevate traffic to priority QoS clusters when cellular network throttling occurs.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-red/60 rounded-xl border border-red-500/30">
                    <span className="text-[9px] text-slate-400 block uppercase">SLA ESCALATION</span>
                    <span className="text-base font-bold text-red-400">&lt; 90s Guaranteed</span>
                  </div>
                  <div className="p-3.5 bg-red/60 rounded-xl border border-red-500/30">
                    <span className="text-[9px] text-slate-400 block uppercase">ROUTING TUNNEL</span>
                    <span className="text-base font-bold text-red">Priority QoS</span>
                  </div>
                  <div className="p-3.5 bg-red/60 rounded-xl border border-red-500/30">
                    <span className="text-[9px] text-slate-400 block uppercase">DEAD-MAN TIMER</span>
                    <span className="text-base font-bold text-amber-400">{emergencyCountdown}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3 font-mono text-xs">
                <div className="w-full p-4 neuo-inset rounded-xl border border-red-500/40 text-center space-y-2">
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Tactile Hardware Status</div>
                  <div className="flex items-center justify-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${isEmergencyRigActive ? 'bg-red-500 animate-ping shadow-[0_0_12px_rgba(239,68,68,1)]' : 'bg-emerald-400'}`} />
                    <span className="text-xs font-bold text-red">
                      {isEmergencyRigActive ? 'CRITICAL PRIORITY OVERRIDE ENGAGED' : 'STANDBY HARDWARE SHIELDED'}
                    </span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between gap-3 bg-red/40 p-3 rounded-xl border border-red/10">
                  <span className="text-xs font-bold text-slate-200">Hardware Safety Shield Switch:</span>
                  <input
                    type="checkbox"
                    className="skeuo-switch cursor-pointer"
                    checked={isEmergencyRigActive}
                    onChange={() => setIsEmergencyRigActive(!isEmergencyRigActive)}
                  />
                </div>

                <button
                  onClick={() => setIsEmergencyRigActive(!isEmergencyRigActive)}
                  className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg text-xs ${isEmergencyRigActive ? 'neuo-btn text-cyan-400 border border-cyan-500/40' : 'clay-btn !bg-red-700 hover:!bg-red-600 text-red'}`}
                >
                  {isEmergencyRigActive ? 'Deactivate Emergency Rig' : 'Engage Analog Priority Override'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
         * SECTION 04 — CRYPTOGRAPHIC SHARP PROTOCOL LAYERS (Glassmorphism + Neomorphism)
         * ==================================================================== */}
        <section id="trustworthy" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                SECTION 04: SHARP CRYPTOGRAPHIC PROTOCOL LAYERS
              </div>
              <h2 className="font-jakarta text-2xl md:text-3xl font-extrabold text-red mt-1">
                The Core Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Architecture Matrix</span>.
              </h2>
            </div>
            <span className="glass-pill px-3 py-1 rounded font-mono text-[10px] font-bold text-cyan-300 uppercase border border-cyan-400/30">
              Glassmorphism + Neomorphism
            </span>
          </div>

          {/* Layer Selection Tabs (4 distinct layers matching authentic architecture) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {PROTOCOL_LAYERS_DATA.map((layer) => {
              const IconComp = layer.icon;
              const isSelected = layer.id === activeLayerId;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-3 border ${isSelected ? 'aurora-card border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'neuo-card border-red/10 hover:border-red/30'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 neuo-inset rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-cyan-300 font-bold uppercase">LAYER {layer.layerNumber}</div>
                      <div className="font-jakarta text-sm font-bold text-red truncate max-w-[130px] sm:max-w-[100px] lg:max-w-[120px]">{layer.title}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-cyan-400 flex-shrink-0 animate-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Detailed Layer Inspector */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-red/15 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 glass-pill px-3 py-1 rounded-full text-cyan-300 font-mono text-[11px] font-bold uppercase">
                <Terminal className="h-3.5 w-3.5" />
                <span>LAYER {activeProtocolLayer.layerNumber} TECHNICAL SPECIFICATION</span>
              </div>

              <h3 className="font-jakarta text-xl md:text-2xl font-bold text-red">
                {activeProtocolLayer.title}: <span className="text-cyan-300 font-mono text-base font-normal">{activeProtocolLayer.subtitle}</span>
              </h3>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                {activeProtocolLayer.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-1">
                {activeProtocolLayer.technicalDetails.map((detail, idx) => (
                  <div key={idx} className="p-3 bg-red/60 rounded-xl border border-red/10 space-y-0.5">
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider">{detail.label}</span>
                    <span className="text-xs font-bold text-cyan-300">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              <div className="bg-[#05070c] p-4 rounded-xl border border-cyan-500/30 font-mono text-xs space-y-2 shadow-inner overflow-x-auto">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-red/10 pb-1.5">
                  <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>PROTOCOL IMPLEMENTATION (TS EDGE)</span>
                  </span>
                  <span className="text-emerald-400 font-bold">ZERO-TRUST VERIFIED</span>
                </div>
                <pre className="text-cyan-300 text-[11px] leading-relaxed py-1">
                  <code>{activeProtocolLayer.codeSnippet}</code>
                </pre>
              </div>

              <div className="holo-card p-4 rounded-xl border border-cyan-500/40 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-3">
                  <QrCode className="h-7 w-7 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-red">SHARP Handshake &amp; BCH Syndrome Key K</div>
                    <div className="text-[10px] text-slate-400">Time-synchronized environmental Bloom check (&lt; 120ms)</div>
                  </div>
                </div>
                <span className="glass-pill px-3 py-1 rounded font-bold text-emerald-300 text-[11px] uppercase">
                  CRYPTOGRAPHIC
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
         * SECTION 05 — ARCHITECTURAL ADVANTAGE MATRIX (Neomorphism + Claymorphism)
         * ==================================================================== */}
        <section id="features" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[11px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SECTION 05: ARCHITECTURAL ADVANTAGE MATRIX
              </div>
              <h2 className="font-jakarta text-2xl md:text-3xl font-extrabold text-red mt-1">
                Why Connify is <span className="text-cyan-400 underline decoration-cyan-500 decoration-2">Fundamentally Different</span>.
              </h2>
            </div>
            <span className="neuo-btn px-3 py-1 rounded font-mono text-[10px] font-bold text-slate-300 uppercase">
              Neomorphism + Claymorphism
            </span>
          </div>

          {/* Compact Category Filters */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 mr-1 text-[11px]">
              <Filter className="h-3.5 w-3.5 text-cyan-400" />
              <span>Filter Matrix:</span>
            </span>
            {(['all', 'privacy', 'speed', 'cryptography'] as MetricCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedMetricCategory(category)}
                className={`px-4 py-1.5 rounded-xl uppercase font-bold text-[11px] transition-all cursor-pointer ${selectedMetricCategory === category ? 'clay-badge text-cyan-300 border border-cyan-400/40 shadow-md' : 'neuo-btn text-slate-400 hover:text-red'}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Compact Comparison Table */}
          <div className="neuo-card p-4 md:p-6 rounded-2xl overflow-x-auto border border-red/10 shadow-xl">
            <table className="w-full border-collapse text-left font-sans text-xs md:text-sm">
              <thead>
                <tr className="border-b border-red/10 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="p-3 w-1/4">Architectural Vector</th>
                  <th className="p-3 w-1/3">Traditional Safety Apps</th>
                  <th className="p-3 w-5/12 text-cyan-400">Connify SHARP Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red/5">
                {filteredMetrics.map((metric) => (
                  <tr key={metric.id} className={metric.isHighlight ? 'bg-cyan-950/20' : ''}>
                    <td className="p-3 font-bold text-red font-jakarta flex items-center gap-2">
                      <span>{metric.feature}</span>
                      {metric.isHighlight && (
                        <span className="font-mono text-[9px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
                          CORE
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 leading-relaxed">{metric.traditionalApp}</td>
                    <td className="p-3 font-bold text-emerald-400 flex items-center gap-2 leading-relaxed">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{metric.connifyProtocol}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ====================================================================
         * SECTION 06 — END-TO-END SHARP WORKFLOW (Claymorphism + Glassmorphism)
         * ==================================================================== */}
        <section id="how-it-works" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[11px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                SECTION 06: END-TO-END SHARP WORKFLOW
              </div>
              <h2 className="font-jakarta text-2xl md:text-3xl font-extrabold text-red mt-1">
                Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 italic">Zero-Tracking Serenity</span>.
              </h2>
            </div>
            <span className="clay-badge px-3 py-1 rounded font-mono text-[10px] font-bold text-red uppercase bg-[#18233c]">
              Claymorphism + Glassmorphism
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            <div className="clay-card p-6 rounded-2xl space-y-3 border border-red/10 hover:border-cyan-400/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 clay-badge rounded-xl flex items-center justify-center text-cyan-300 font-mono font-bold text-sm">
                  01
                </div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">NO DID PROFILE BARRIER</span>
              </div>
              <h3 className="font-jakarta text-lg font-bold text-red">Ephemeral Episode IDs</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No permanent KYC or identity directories needed to initiate safety check-ins. Your device generates an ephemeral UUIDv4 Episode ID that isolates every single transaction.
              </p>
            </div>

            <div className="clay-card p-6 rounded-2xl space-y-3 border border-red/10 hover:border-emerald-400/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 clay-badge rounded-xl flex items-center justify-center text-emerald-300 font-mono font-bold text-sm">
                  02
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">ANTI-SPOOFING RADAR</span>
              </div>
              <h3 className="font-jakarta text-lg font-bold text-red">SHARP Bloom Filters</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Instead of trusting mockable GPS streams, candidate verification verifies local Wi-Fi frame headers and LTE TC-RNTI control messages loaded into client-side Bloom filters (&gt;64 bits entropy).
              </p>
            </div>

            <div className="clay-card p-6 rounded-2xl space-y-3 border border-red/10 hover:border-amber-400/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 clay-badge rounded-xl flex items-center justify-center text-amber-300 font-mono font-bold text-sm">
                  03
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">JIT CAPSULE &amp; AUDIT</span>
              </div>
              <h3 className="font-jakarta text-lg font-bold text-red">JIT Ed25519 &amp; Outcome Log</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trust Capsules (`SET NX lock`) are minted only after verification succeeds. Upon task resolution, ephemeral communication channels auto-destruct while the Outcome Service logs identity-free proof.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================================
         * SECTION 07 — PRIVACY GOVERNANCE & DEVICE SHIELDS
         * ==================================================================== */}
        <section id="privacy" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SECTION 07: PRIVACY &amp; THREAT COUNTERMEASURES
              </div>
              <h2 className="font-jakarta text-2xl md:text-3xl font-extrabold text-red mt-1">
                Privacy is our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Absolute Foundation</span>.
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="skeuo-panel px-3 py-1 rounded font-mono text-[10px] font-bold text-slate-300 uppercase">
                Skeuomorphism + Neomorphism
              </span>
              {/* Live Privacy Impact Score Badge */}
              <div className="clay-box px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2.5 font-mono text-xs shadow-md">
                <Shield className="h-4 w-4 text-emerald-400 animate-pulse" />
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">SOVEREIGNTY SCORE</span>
                  <span className="text-sm font-bold text-emerald-300">{privacyScore}% SECURED</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
            Test our interactive threat governance matrix below. Toggle hardware-backed key storage and database hashing controls to observe how Connify enforces absolute sovereignty over your movement telemetry.
          </p>

          {/* Interactive Toggle Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
            {privacyControls.map((control) => (
              <div
                key={control.id}
                className={`p-5 rounded-2xl transition-all border flex flex-col justify-between space-y-4 ${control.enabled ? 'clay-card border-emerald-500/40 shadow-xl' : 'neuo-card border-red/10 opacity-75'}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-red/60 text-slate-300 uppercase font-bold text-[9px]">
                      {control.category} CONTROL
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePrivacyControl(control.id)}
                        className={`px-3 py-1 rounded-full font-bold uppercase transition-all cursor-pointer text-[10px] flex items-center gap-1 ${control.enabled ? 'bg-emerald-600 text-red shadow-md' : 'bg-slate-800 text-slate-400 hover:text-red'}`}
                      >
                        <span>{control.enabled ? 'ACTIVE' : 'MUTED'}</span>
                      </button>
                      <input
                        type="checkbox"
                        className="skeuo-switch cursor-pointer transform scale-75"
                        checked={control.enabled}
                        onChange={() => togglePrivacyControl(control.id)}
                      />
                    </div>
                  </div>

                  <h3 className="font-jakarta text-base font-bold text-red pt-1">{control.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{control.description}</p>
                </div>

                <div className="pt-3 border-t border-red/10 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-400">SECURITY IMPACT:</span>
                  <span className={control.enabled ? 'text-emerald-300 font-bold' : 'text-slate-500'}>{control.securityImpact}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
         * SECTION 08 — WRAP UP & FINAL CTA (Auroramorphism + Glassmorphism)
         * ==================================================================== */}
        <section id="about" className="pt-4 pb-12 scroll-mt-20">
          <div className="aurora-card p-8 md:p-10 rounded-2xl text-center space-y-6 relative overflow-hidden border border-cyan-500/40 shadow-2xl max-w-3xl mx-auto">
            <div className="space-y-4 relative z-10 font-sans">
              <span className="glass-pill px-3 py-1 rounded-full font-mono text-[10px] text-cyan-300 font-bold uppercase tracking-wider inline-block">
                SHARP Protocol Showcase
              </span>
              <h2 className="font-jakarta text-2xl md:text-4xl font-extrabold text-red">
                Ready to Reclaim <span className="text-cyan-400">Proximity Sovereignty?</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                Join 50,000+ local community guardians who have transformed their neighborhoods into a zero-trust, privacy-preserving safety grid. Professional security with true community heart.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 font-mono text-xs">
                <button
                  onClick={() => scrollToSection('coordination')}
                  className="clay-btn !bg-cyan-600 hover:!bg-cyan-500 text-red px-8 py-3.5 font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Return to SHARP Simulator
                </button>
                <button
                  onClick={() => setRoute('login')}
                  className="glass-card text-red hover:text-cyan-300 px-8 py-3.5 font-bold uppercase tracking-wider rounded-xl border border-red/30 transition-all cursor-pointer shadow-md"
                >
                  Enter Admin Dashboard
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
