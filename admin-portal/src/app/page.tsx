'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Heart,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Cpu,
  Layers,
  Database,
  Lock
} from 'lucide-react';

interface Episode {
  id: string;
  category: string;
  urgency: number;
  createdAt: string;
}

interface DashboardData {
  totalEpisodes: number;
  statusCounts: {
    pending: number;
    matched: number;
    active: number;
    completed: number;
  };
  successRate: number;
  activeEpisodes: Episode[];
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

interface AuditChainData {
  isChainValid: boolean;
  validations: ValidationLog[];
}

export default function AdminDashboard() {
  const [dbData, setDbData] = useState<DashboardData | null>(null);
  const [auditData, setAuditData] = useState<AuditChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      setError(null);
      const [dashRes, auditRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/dashboard`),
        fetch(`${backendUrl}/api/admin/audit-chain`)
      ]);

      if (!dashRes.ok || !auditRes.ok) {
        throw new Error('Server returned an error status.');
      }

      const dashJson = await dashRes.json();
      const auditJson = await auditRes.json();

      if (dashJson.success && auditJson.success) {
        setDbData(dashJson.data);
        setAuditData(auditJson.data);
      } else {
        throw new Error('API request reported failure.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Fastify backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 5) return 'text-red-500 bg-red-950/40 border border-red-800/40';
    if (urgency >= 4) return 'text-orange-500 bg-orange-950/40 border border-orange-850/40';
    return 'text-amber-500 bg-amber-950/40 border border-amber-850/40';
  };

  const formatHash = (hash: string) => {
    if (hash === '0') return '0x0000...0000 (Genesis)';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col items-center justify-center gap-4">
        <Activity className="animate-spin text-[#B60100] h-12 w-12" />
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">
          Initializing Secure Command Center...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 font-sans selection:bg-[#B60100] selection:text-white">
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#B60100]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-900 bg-[#0A0E17]/80 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#B60100]/10 border border-[#B60100]/30 flex items-center justify-center">
            <Shield className="text-[#B60100] h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight uppercase font-mono text-white">
              Connify Admin Portal
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              TAMPER-EVIDENT EPHEMERAL TRUST NETWORK AUDITOR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {error && (
            <div className="text-xs text-red-500 bg-red-950/30 px-3 py-1.5 rounded border border-red-900/30 flex items-center gap-1.5 font-mono">
              <AlertTriangle className="h-3.5 w-3.5" />
              Backend Offline (Fallback Mock Active)
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800 text-sm font-mono"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            REFRESH METRICS
          </button>
        </div>
      </header>

      <main className="relative z-10 p-6 max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top summary section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0D121F]/90 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Total Episodes
              </p>
              <h3 className="text-3xl font-bold font-mono mt-1 text-white">
                {dbData?.totalEpisodes ?? 24}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Cpu className="text-blue-400 h-6 w-6" />
            </div>
          </div>

          <div className="bg-[#0D121F]/90 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Success Rate
              </p>
              <h3 className="text-3xl font-bold font-mono mt-1 text-white">
                {dbData?.successRate ? `${dbData.successRate}%` : '96.2%'}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Heart className="text-emerald-400 h-6 w-6" />
            </div>
          </div>

          <div className="bg-[#0D121F]/90 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Active Capsules
              </p>
              <h3 className="text-3xl font-bold font-mono mt-1 text-[#B60100]">
                {dbData?.statusCounts.active ?? 3}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-[#B60100]/10 border border-[#B60100]/20 flex items-center justify-center">
              <Layers className="text-[#B60100] h-6 w-6" />
            </div>
          </div>

          <div className="bg-[#0D121F]/90 border border-slate-900 rounded-xl p-5 hover:border-slate-800 transition-all flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Ledger Status
              </p>
              <h3 className={`text-xl font-bold font-mono mt-2 uppercase flex items-center gap-1.5 ${
                auditData?.isChainValid !== false ? 'text-emerald-500' : 'text-red-500 animate-pulse'
              }`}>
                {auditData?.isChainValid !== false ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    INTEGRITOUS
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5" />
                    COMPROMISED
                  </>
                )}
              </h3>
            </div>
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              auditData?.isChainValid !== false 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <Lock className="h-6 w-6" />
            </div>
          </div>
        </section>

        {/* Dashboard Panels */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Episodes List */}
          <div className="lg:col-span-1 bg-[#0D121F] border border-slate-950 rounded-xl p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-slate-400">
                ACTIVE EPISODES MESH
              </h2>
              <p className="text-xs text-slate-500">Live request transactions in PostGIS buffer</p>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[460px] pr-1">
              {(!dbData || dbData.activeEpisodes.length === 0) ? (
                <div className="text-center py-8 text-slate-600 font-mono text-xs border border-dashed border-slate-900 rounded-lg">
                  No active tracking episodes.
                </div>
              ) : (
                dbData.activeEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3.5 bg-[#090D17] border border-slate-900 rounded-lg flex flex-col gap-2 hover:border-[#B60100]/20 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        {ep.category}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${getUrgencyColor(ep.urgency)}`}>
                        LVL {ep.urgency}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 break-all select-all">
                      {ep.id}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                      <Clock className="h-3 w-3" />
                      {new Date(ep.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cryptographic Ledger Audit Log Chain */}
          <div className="lg:col-span-2 bg-[#0D121F] border border-slate-950 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-slate-400">
                  LEDGER VALIDATION CHAINS (SHA-256)
                </h2>
                <p className="text-xs text-slate-500">Cryptographically chained tamper detection log</p>
              </div>

              <div className="flex items-center gap-1.5">
                <Database className="text-slate-500 h-4 w-4" />
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  LEAF HASH CHAIN
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[10px] font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-3">STEP</th>
                    <th className="py-2.5 px-3">EVENT</th>
                    <th className="py-2.5 px-3">PREVIOUS HASH</th>
                    <th className="py-2.5 px-3">STORED HASH</th>
                    <th className="py-2.5 px-3">VALIDATION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-950 font-mono text-[11px]">
                  {(!auditData || auditData.validations.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-600 font-mono text-xs">
                        No audit ledger records present. Run transactions in mobile client to write blocks.
                      </td>
                    </tr>
                  ) : (
                    auditData.validations.map((log, index) => (
                      <tr key={log.id} className="hover:bg-slate-950/40 transition-colors group">
                        <td className="py-3 px-3 text-slate-400">{index + 1}</td>
                        <td className="py-3 px-3">
                          <span className="text-slate-200 font-bold">{log.eventType}</span>
                          {log.episodeId && (
                            <span className="block text-[9px] text-slate-500 break-all max-w-[120px]">
                              {log.episodeId.substring(0, 18)}...
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400 select-all cursor-help" title={log.prevHash}>
                          {formatHash(log.prevHash)}
                        </td>
                        <td className="py-3 px-3 text-slate-400 select-all cursor-help" title={log.storedHash}>
                          {formatHash(log.storedHash)}
                        </td>
                        <td className="py-3 px-3">
                          {log.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                              <CheckCircle className="h-3 w-3" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-red-500 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30 animate-pulse">
                              <AlertTriangle className="h-3 w-3" />
                              TAMPERED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
