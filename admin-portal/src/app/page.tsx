'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  User,
  LogOut,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Server,
  AlertTriangle,
  Play
} from 'lucide-react';
import LoginScreen from '../components/LoginScreen';
import TabSOC from '../components/TabSOC';
import TabLedger from '../components/TabLedger';
import TabDevices from '../components/TabDevices';
import TabProtocol from '../components/TabProtocol';
import TabSettings from '../components/TabSettings';

// Onboarding & Landing components
import VerticalJourney from '../components/landing/VerticalJourney';
import SplashScreen from '../components/landing/SplashScreen';

// Native browser asynchronous SHA-256 hashing
async function nativeSha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Types matching database schema
interface Device {
  id: string;
  deviceFingerprintHash: string;
  publicKey: string;
  phoneHash: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}

interface Capsule {
  id: string;
  episodeId: string;
  helperDeviceId: string;
  signedTokenHash: string;
  status: string;
  blindedGridCell: string | null;
  issuedAt: string;
  expiresAt: string;
  redeemedAt: string | null;
}

interface Outcome {
  id: string;
  episodeId: string;
  result: 'success' | 'failure';
  category: string;
  riskLevel: number | null;
  completedInWindow: boolean;
  createdAt: string;
}

interface Episode {
  id: string;
  category: string;
  urgency: number;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
}

interface ValidationLog {
  id: string;
  eventType: string;
  episodeId: string | null;
  prevHash: string;
  storedHash: string;
  calculatedHash: string;
  matchesPrev: boolean;
  matchesCurrent: boolean;
  isValid: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  // Authentication & Settings state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [isOfflineSession, setIsOfflineSession] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeTab, setActiveTab] = useState<'soc' | 'ledger' | 'devices' | 'protocol' | 'settings'>('soc');
  const [landingRoute, setLandingRoute] = useState<'splash' | 'coordination' | 'trusted' | 'trustworthy' | 'features' | 'how-it-works' | 'privacy' | 'protocol-features' | 'login'>('splash');

  // Network State
  const [useSimulator, setUseSimulator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Operational Database State
  const [devices, setDevices] = useState<Device[]>([]);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [validations, setValidations] = useState<ValidationLog[]>([]);
  const [isChainValid, setIsChainValid] = useState(true);

  // Console Telemetry Logs state
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://connify-backend.onrender.com';

  const logTelemetry = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTelemetryLogs((prev) => [...prev.slice(-29), `[${timestamp}] ${msg}`]);
  };

  // 1. Initial Mock Seeding (For local simulation fallback)
  const seedLocalSimulator = () => {
    logTelemetry('⚙️ Initializing local database simulator mesh...');
    
    const mockDevices: Device[] = [
      {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        deviceFingerprintHash: '4f9e8a7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1e0d9c8b7a6f5e4d3c2b1a0e9f',
        publicKey: 'MCowBQYDK2VwAyEAXy8a...u6y1B8n3eK92jdH7q',
        phoneHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastSeenAt: new Date().toISOString(),
      },
      {
        id: '2a1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        deviceFingerprintHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        publicKey: 'MCowBQYDK2VwAyEA9g3hJ...1kd83lKsp29Hj83h',
        phoneHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastSeenAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: '3f4e5d6c-7b8a-9f0e-1d2c-3b4a5f6e7d8c',
        deviceFingerprintHash: 'f1e2d3c4b5a6f1e2d3c4b5a6f1e2d3c4b5a6f1e2d3c4b5a6f1e2d3c4b5a6f1e2',
        publicKey: 'MCowBQYDK2VwAyEAb83kLs...92jd73Ksp29Lsk83',
        phoneHash: null,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        lastSeenAt: new Date().toISOString(),
      }
    ];

    const mockEpisodes: Episode[] = [
      {
        id: 'e10d2948-2b3d-4950-ba59-39b02d8471b3',
        category: 'emergency',
        urgency: 5,
        latitude: 40.6976,
        longitude: -73.9876,
        status: 'active',
        createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      {
        id: 'a93b48cd-5e18-4bcd-884a-39b02d84cd39',
        category: 'medical',
        urgency: 4,
        latitude: 40.6912,
        longitude: -73.9924,
        status: 'completed',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      }
    ];

    const mockCapsules: Capsule[] = [
      {
        id: 'c10d2948-3b4e-4f50-9c29-38b02c83cf38',
        episodeId: mockEpisodes[0].id,
        helperDeviceId: mockDevices[1].id,
        signedTokenHash: '8a9f0302b1d039281e0f0392a83e0c03',
        status: 'issued',
        blindedGridCell: 'd298d3b942e88a38',
        issuedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 27 * 60 * 1000).toISOString(),
        redeemedAt: null,
      },
      {
        id: 'c83b48cd-3b4e-4bcd-882a-28b01c82cf19',
        episodeId: mockEpisodes[1].id,
        helperDeviceId: mockDevices[2].id,
        signedTokenHash: 'f83b2819cd938e281d8301c38e920d9c',
        status: 'redeemed',
        blindedGridCell: '8cd29f9c03b1d9c3',
        issuedAt: new Date(Date.now() - 44 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        redeemedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      }
    ];

    const mockOutcomes: Outcome[] = [
      {
        id: 'o93b48cd-5e18-4bcd-884a-39b02d84cd39',
        episodeId: mockEpisodes[1].id,
        result: 'success',
        category: 'medical',
        riskLevel: 2,
        completedInWindow: true,
        createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      }
    ];

    // Compute mock validations sequentially with precalculated mock values
    const mockValidations: ValidationLog[] = [
      {
        id: '1',
        eventType: 'EPISODE_CREATED',
        episodeId: mockEpisodes[1].id,
        prevHash: '0',
        storedHash: '8f93e92ad3b81d9ca8e83be98fac72d82938a9d8ef92d3b9a8e839e9fac72d83',
        calculatedHash: '8f93e92ad3b81d9ca8e83be98fac72d82938a9d8ef92d3b9a8e839e9fac72d83',
        matchesPrev: true,
        matchesCurrent: true,
        isValid: true,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        eventType: 'EPISODE_COMPLETED',
        episodeId: mockEpisodes[1].id,
        prevHash: '8f93e92ad3b81d9ca8e83be98fac72d82938a9d8ef92d3b9a8e839e9fac72d83',
        storedHash: 'cf9a23e9fa823be9c08d92be8fa9d3c8e9b3a98efb3d9283fa98e3bfa923efc8',
        calculatedHash: 'cf9a23e9fa823be9c08d92be8fa9d3c8e9b3a98efb3d9283fa98e3bfa923efc8',
        matchesPrev: true,
        matchesCurrent: true,
        isValid: true,
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        eventType: 'EPISODE_CREATED',
        episodeId: mockEpisodes[0].id,
        prevHash: 'cf9a23e9fa823be9c08d92be8fa9d3c8e9b3a98efb3d9283fa98e3bfa923efc8',
        storedHash: '2c9d83e9fad2b3e8a93be9f8ac72b8c9d23ab9d8ef92d3c9a83eb9efac72d8ba',
        calculatedHash: '2c9d83e9fad2b3e8a93be9f8ac72b8c9d23ab9d8ef92d3c9a83eb9efac72d8ba',
        matchesPrev: true,
        matchesCurrent: true,
        isValid: true,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      }
    ];

    setDevices(mockDevices);
    setEpisodes(mockEpisodes);
    setCapsules(mockCapsules);
    setOutcomes(mockOutcomes);
    setValidations(mockValidations);
    setIsChainValid(true);
    logTelemetry('🔐 Local proximity trust ledger initialized (VALID)');
  };

  // 2. Fetch data from backend (or fallback to simulator)
  const fetchData = async () => {
    if (useSimulator) {
      logTelemetry('📡 Syncing local simulation nodes state...');
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const [dashRes, auditRes, devRes, capRes, outRes, epRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/dashboard`),
        fetch(`${backendUrl}/api/admin/audit-chain`),
        fetch(`${backendUrl}/api/admin/devices`),
        fetch(`${backendUrl}/api/admin/capsules`),
        fetch(`${backendUrl}/api/admin/outcomes`),
        fetch(`${backendUrl}/api/admin/episodes`),
      ]);

      if (!dashRes.ok || !auditRes.ok || !devRes.ok || !capRes.ok || !outRes.ok || !epRes.ok) {
        throw new Error('API server returned an error code.');
      }

      const dashJson = await dashRes.json();
      const auditJson = await auditRes.json();
      const devJson = await devRes.json();
      const capJson = await capRes.json();
      const outJson = await outRes.json();
      const epJson = await epRes.json();

      if (
        dashJson.success &&
        auditJson.success &&
        devJson.success &&
        capJson.success &&
        outJson.success &&
        epJson.success
      ) {
        setDevices(devJson.data);
        setCapsules(capJson.data);
        setOutcomes(outJson.data);
        setEpisodes(epJson.data);
        setValidations(auditJson.data.validations);
        setIsChainValid(auditJson.data.isChainValid);
        logTelemetry('🔄 Synchronized successfully with remote Fastify Render container');
      } else {
        throw new Error('API operations reported failure.');
      }
    } catch (err: any) {
      console.warn('⚠️ Server unreachable, switching to local Proximity Simulator mode:', err.message);
      setError('Backend connection offline. Activated offline fallback simulator.');
      setUseSimulator(true);
      seedLocalSimulator();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, useSimulator]);

  // Periodic polling / simulator ticks
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (useSimulator) {
        // Ticks for simulator
        setCapsules((prev) =>
          prev.map((cap) => {
            if (cap.status === 'issued') {
              const diff = new Date(cap.expiresAt).getTime() - Date.now();
              if (diff <= 0) {
                logTelemetry(`⏳ Capsule key self-destructed: [${cap.id.substring(0, 8)}] expired`);
                return { ...cap, status: 'expired' };
              }
            }
            return cap;
          })
        );
      } else {
        fetchData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated, useSimulator]);

  // 3. User Interactions / Simulation Handlers
  const handleLoginSuccess = (token: string, email: string, isOffline: boolean) => {
    setAuthEmail(email);
    setIsOfflineSession(isOffline);
    setIsAuthenticated(true);
    setTelemetryLogs([]);
    logTelemetry(`🔐 Session authenticated via ${isOffline ? 'local fallback' : 'Firebase Auth'}`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthEmail('');
    setIsOfflineSession(false);
  };

  // Simulate SOS creation
  const handleSimulateEpisode = async (category: string, urgency: number) => {
    logTelemetry(`🚀 Instantiating simulated request: category=${category}, urgency=${urgency}`);
    if (useSimulator) {
      const newEp: Episode = {
        id: `sim-${Math.random().toString(36).substring(2, 10)}-ep`,
        category,
        urgency,
        latitude: 40.6976 + (Math.random() - 0.5) * 0.015,
        longitude: -73.9876 + (Math.random() - 0.5) * 0.015,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      setEpisodes((prev) => [newEp, ...prev]);

      // Calculate hash asynchronously before updating state
      const lastVal = validations[validations.length - 1];
      const prevHash = lastVal ? lastVal.storedHash : '0';
      const content = `${prevHash}:EPISODE_CREATED:${newEp.id}`;
      const calculatedHash = await nativeSha256(content);

      const newVal: ValidationLog = {
        id: (validations.length + 1).toString(),
        eventType: 'EPISODE_CREATED',
        episodeId: newEp.id,
        prevHash,
        storedHash: calculatedHash,
        calculatedHash,
        matchesPrev: true,
        matchesCurrent: true,
        isValid: true,
        createdAt: new Date().toISOString(),
      };
      
      setValidations((prev) => [...prev, newVal]);
      logTelemetry(`🔐 Append block #${validations.length}: EPISODE_CREATED (hash: ${calculatedHash.substring(0,8)})`);
    } else {
      try {
        const response = await fetch(`${backendUrl}/api/admin/simulate/episode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, urgency }),
        });
        if (!response.ok) throw new Error('Simulation failed on backend.');
        await fetchData();
      } catch (err: any) {
        logTelemetry(`❌ Simulation call failed: ${err.message}`);
      }
    }
  };

  // Simulate Check-in / completion
  const handleSimulateCheckin = async (episodeId: string) => {
    logTelemetry(`Checking in session update for: ${episodeId.substring(0, 8)}...`);
    if (useSimulator) {
      setEpisodes((prev) =>
        prev.map((ep) => (ep.id === episodeId ? { ...ep, status: 'completed' } : ep))
      );

      const targetEp = episodes.find((ep) => ep.id === episodeId);

      // Create success outcome
      const newOutcome: Outcome = {
        id: `sim-${Math.random().toString(36).substring(2, 10)}-out`,
        episodeId,
        result: 'success',
        category: targetEp?.category || 'general',
        riskLevel: 2,
        completedInWindow: true,
        createdAt: new Date().toISOString(),
      };
      setOutcomes((prev) => [newOutcome, ...prev]);

      // Calculate hash asynchronously before updating state
      const lastVal = validations[validations.length - 1];
      const prevHash = lastVal ? lastVal.storedHash : '0';
      const content = `${prevHash}:EPISODE_COMPLETED:${episodeId}`;
      const calculatedHash = await nativeSha256(content);

      const newVal: ValidationLog = {
        id: (validations.length + 1).toString(),
        eventType: 'EPISODE_COMPLETED',
        episodeId,
        prevHash,
        storedHash: calculatedHash,
        calculatedHash,
        matchesPrev: true,
        matchesCurrent: true,
        isValid: true,
        createdAt: new Date().toISOString(),
      };
      
      setValidations((prev) => [...prev, newVal]);
      logTelemetry(`🔐 Append block #${validations.length}: EPISODE_COMPLETED (hash: ${calculatedHash.substring(0,8)})`);
    } else {
      try {
        const response = await fetch(`${backendUrl}/api/admin/simulate/checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ episodeId }),
        });
        if (!response.ok) throw new Error('Checkin failed on backend.');
        await fetchData();
      } catch (err: any) {
        logTelemetry(`❌ Simulation checkin failed: ${err.message}`);
      }
    }
  };

  // Simulate hash corruption
  const handleCorruptLedger = async () => {
    logTelemetry('⚠️ Intentionally injecting corrupt hash value to test auditor response...');
    if (useSimulator) {
      setValidations((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        const origHash = copy[lastIdx].storedHash;
        const corrupted = origHash.substring(0, origHash.length - 4) + 'beef';
        
        copy[lastIdx] = {
          ...copy[lastIdx],
          storedHash: corrupted,
          matchesCurrent: false,
          isValid: false,
        };
        setIsChainValid(false);
        logTelemetry(`🚨 HASH CORRUPTION INJECTED! Block #${lastIdx} (stored: ${corrupted.substring(0,8)} vs calculated: ${copy[lastIdx].calculatedHash.substring(0,8)})`);
        return copy;
      });
    } else {
      try {
        const response = await fetch(`${backendUrl}/api/admin/simulate/corrupt`, { method: 'POST' });
        if (!response.ok) throw new Error('Corrupt call failed.');
        await fetchData();
      } catch (err: any) {
        logTelemetry(`❌ Corruption call failed: ${err.message}`);
      }
    }
  };

  // Simulate hash healing / reset
  const handleHealLedger = async () => {
    logTelemetry('🛠️ Executing ledger database verification self-healing loop...');
    if (useSimulator) {
      let prevHash = '0';
      const healed: ValidationLog[] = [];

      for (const log of validations) {
        const content = `${prevHash}:${log.eventType}:${log.episodeId}`;
        const calculatedHash = await nativeSha256(content);
        
        healed.push({
          ...log,
          prevHash,
          storedHash: calculatedHash,
          calculatedHash,
          matchesPrev: true,
          matchesCurrent: true,
          isValid: true,
        });
        
        prevHash = calculatedHash;
      }
      
      setValidations(healed);
      setIsChainValid(true);
      logTelemetry('🛡️ Verification loop completed: 100% blocks healed and synchronized');
    } else {
      try {
        const response = await fetch(`${backendUrl}/api/admin/simulate/reset`, { method: 'POST' });
        if (!response.ok) throw new Error('Heal call failed.');
        await fetchData();
      } catch (err: any) {
        logTelemetry(`❌ Self-healing execution failed: ${err.message}`);
      }
    }
  };

  if (!isAuthenticated) {
    if (landingRoute === 'login') {
      return (
        <div className="relative">
          {/* Floating Back to Portal Button */}
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={() => setLandingRoute('coordination')}
              className="neuo-btn px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-primary cursor-pointer"
            >
              ← Back to Portal
            </button>
          </div>
          <LoginScreen onSuccess={handleLoginSuccess} />
        </div>
      );
    }
    if (landingRoute === 'splash') {
      return <SplashScreen onComplete={() => setLandingRoute('coordination')} />;
    }
    return <VerticalJourney setRoute={setLandingRoute} />;
  }

  // Derived stats
  const totalEpisodesCount = episodes.length;
  const successCount = outcomes.filter((o) => o.result === 'success').length;
  const computedSuccessRate = totalEpisodesCount > 0 ? (successCount / totalEpisodesCount) * 100 : 100;
  const activeCount = episodes.filter((e) => e.status === 'active' || e.status === 'pending').length;

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 relative overflow-hidden ${
      theme === 'dark' ? 'bg-[#080B11] text-slate-100' : 'bg-[#f9f9f9] text-[#1b1b1b]'
    }`}>
      {/* Background Aurora Mesh Morphism Glow */}
      <div className="fixed inset-0 pointer-events-none aurora-bg opacity-40 z-0" />
      
      {/* HUD Header Bar (Glassmorphism & Holomorphism) */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 glass-panel border-b border-[#1b1b1b]/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#b60100]/10 border border-[#b60100]/40 flex items-center justify-center shadow-[0_0_12px_rgba(182,1,0,0.15)]">
            <Shield className="text-[#b60100] h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-jakarta uppercase tracking-tight text-[#1b1b1b] flex items-center gap-2">
              Connify Ops Portal
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full clay-badge text-[#0051c6] border border-[#0051c6]">v3.1 MESH</span>
            </h1>
            <p className="text-[9px] text-[#5f3f3a] font-mono tracking-widest uppercase">
              Proximity Trust validation auditor & Zero-Trust Coordinator
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-3">
          
          {/* Simulation status */}
          <div className={`text-[10px] font-mono rounded-full px-3 py-1.5 flex items-center gap-2 glass-pill ${
            useSimulator
              ? 'text-[#b60100] border-[#b60100]/40 font-bold'
              : 'text-[#0051c6] border-[#0051c6]/40 font-bold'
          }`}>
            <span className={`w-2 h-2 rounded-full ${useSimulator ? 'bg-[#b60100] animate-ping' : 'bg-[#0051c6] animate-pulse'}`} />
            <Server className="h-3.5 w-3.5" />
            {useSimulator ? 'LOCAL SIMULATOR' : 'REMOTE BACKEND'}
          </div>

          {/* Theme Toggler */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-[#1b1b1b] glass-pill text-[#b60100] hover:bg-[#1b1b1b] hover:text-white transition-all cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Force Refresh */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 rounded-xl border border-[#1b1b1b] glass-pill text-[#1b1b1b] hover:bg-[#b60100] hover:text-white hover:border-[#b60100] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh sync"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[#0051c6]' : ''}`} />
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-[10px] uppercase cursor-pointer neuo-btn text-[#1b1b1b] font-bold hover:bg-[#b60100] hover:text-white transition-all"
          >
            <LogOut className="h-3.5 w-3.5 text-[#b60100]" />
            Exit
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation & Panels */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6 flex flex-col gap-6 relative z-10">
        
        {/* Navigation Selector Tabs (Glassmorphism & Holomorphism Pills) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl glass-card border border-[#1b1b1b] font-mono text-xs">
          <button
            onClick={() => setActiveTab('soc')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'soc'
                ? 'clay-btn text-white shadow-[0_0_12px_rgba(182,1,0,0.3)]'
                : 'text-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white'
            }`}
          >
            PROXIMITY RADAR
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'ledger'
                ? 'clay-btn text-white shadow-[0_0_12px_rgba(182,1,0,0.3)]'
                : 'text-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white'
            }`}
          >
            CRYPTOGRAPHIC LEDGER
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'devices'
                ? 'clay-btn text-white shadow-[0_0_12px_rgba(182,1,0,0.3)]'
                : 'text-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white'
            }`}
          >
            HARDWARE & CAPSULES
          </button>

          <button
            onClick={() => setActiveTab('protocol')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'protocol'
                ? 'clay-btn text-white shadow-[0_0_12px_rgba(182,1,0,0.3)]'
                : 'text-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white'
            }`}
          >
            PROTOCOL REFERENCE
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
              activeTab === 'settings'
                ? 'clay-btn text-white shadow-[0_0_12px_rgba(182,1,0,0.3)]'
                : 'text-[#1b1b1b] hover:bg-[#1b1b1b] hover:text-white'
            }`}
          >
            SETTINGS
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex-grow animate-fade-in">
          {activeTab === 'soc' && (
            <TabSOC
              episodes={episodes}
              isOffline={useSimulator}
              onSimulateEpisode={handleSimulateEpisode}
              onSimulateCheckin={handleSimulateCheckin}
              telemetryLogs={telemetryLogs}
            />
          )}

          {activeTab === 'ledger' && (
            <TabLedger
              isChainValid={isChainValid}
              validations={validations}
              onCorruptLedger={handleCorruptLedger}
              onHealLedger={handleHealLedger}
            />
          )}

          {activeTab === 'devices' && (
            <TabDevices
              devices={devices}
              capsules={capsules}
            />
          )}

          {activeTab === 'protocol' && (
            <TabProtocol />
          )}

          {activeTab === 'settings' && (
            <TabSettings
              onHealLedger={handleHealLedger}
            />
          )}
        </div>

      </main>
    </div>
  );
}
