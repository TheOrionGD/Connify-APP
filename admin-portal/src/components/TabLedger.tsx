import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Zap,
  Lock,
  Search,
  Database,
  ArrowRight
} from 'lucide-react';

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

interface TabLedgerProps {
  isChainValid: boolean;
  validations: ValidationLog[];
  onCorruptLedger: () => Promise<void>;
  onHealLedger: () => Promise<void>;
}

export default function TabLedger({
  isChainValid,
  validations,
  onCorruptLedger,
  onHealLedger,
}: TabLedgerProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<ValidationLog | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCorrupt = async () => {
    setSubmitting(true);
    try {
      await onCorruptLedger();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHeal = async () => {
    setSubmitting(true);
    try {
      await onHealLedger();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatHash = (hash: string) => {
    if (hash === '0') return '0x0000...0000 (Genesis)';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const filteredValidations = validations.filter(
    (val) =>
      val.eventType.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (val.episodeId && val.episodeId.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Ledger Integrity HUD (Neumorphism & Glassmorphism) */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Validation Status Card */}
        <div className="neuo-card p-5 flex items-center justify-between transition-all">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <span>Cryptographic Ledger Status</span>
              <span className="text-[8px] px-1.5 py-0.2 rounded clay-badge text-cyan-400">SHA-256</span>
            </span>
            <h3 className={`text-xl font-bold font-mono uppercase tracking-wide flex items-center gap-2 mt-1.5 ${
              isChainValid ? 'text-emerald-400' : 'text-red-500 animate-pulse'
            }`}>
              {isChainValid ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  INTEGRITOUS
                </>
              ) : (
                <>
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  COMPROMISED
                </>
              )}
            </h3>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center neuo-inset ${
            isChainValid ? 'text-emerald-400 border border-emerald-500/30' : 'text-red-400 border border-red-500/30'
          }`}>
            <Lock className="h-6 w-6" />
          </div>
        </div>

        {/* Total Blocks count */}
        <div className="neuo-card p-5 flex items-center justify-between transition-all">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Chained Blocks Count
            </span>
            <h3 className="text-2xl font-bold font-mono text-white mt-1.5 flex items-center gap-2">
              {validations.length}
              <span className="text-[10px] font-mono text-emerald-400 font-normal">NODES LINKED</span>
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl neuo-inset text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Database className="h-6 w-6" />
          </div>
        </div>

        {/* Auditor Actions (`neuo-btn` & `clay-btn`) */}
        <div className="neuo-card p-4 flex items-center justify-around gap-3">
          <button
            onClick={handleCorrupt}
            disabled={submitting || validations.length === 0}
            className="flex-1 neuo-btn py-2.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase cursor-pointer transition-all disabled:opacity-30 text-red-400 hover:text-red-300 border-red-500/30 shadow-sm"
          >
            Corrupt Ledger
          </button>
          <button
            onClick={handleHeal}
            disabled={submitting || isChainValid}
            className="flex-1 clay-btn py-2.5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase cursor-pointer transition-all disabled:opacity-30 shadow-[0_0_15px_rgba(16,185,129,0.3)] !bg-emerald-600 hover:!bg-emerald-500"
          >
            Heal Ledger
          </button>
        </div>
      </div>

      {/* Visual Chain Leaf Nodes Diagram (Neomorphism & Glassmorphism Tree) */}
      <div className="col-span-12 neuo-card p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-[#1b1b1b] uppercase flex items-center gap-2">
              SHA-256 Cryptographic Block Linkage Tree
              <span className="text-[9px] font-mono glass-pill px-2.5 py-0.5 rounded text-[#0051c6] font-bold">CHAIN MESH</span>
            </h2>
            <p className="text-[10px] text-[#5f3f3a]">Live block hash sequence validation diagram</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 custom-scroll-hide">
          {validations.map((val, index) => {
            const isLatest = index === validations.length - 1;

            return (
              <React.Fragment key={val.id}>
                {/* Block node */}
                <div
                  onClick={() => setSelectedBlock(val)}
                  className={`min-w-[180px] rounded-xl p-3.5 cursor-pointer transition-all flex flex-col gap-2 font-mono ${
                    selectedBlock?.id === val.id
                      ? 'glass-card border-[#0051c6] shadow-[0_0_15px_rgba(0,81,198,0.3)]'
                      : !val.isValid
                      ? 'neuo-inset border border-[#ba1a1a] bg-[#ffdad6] animate-pulse'
                      : 'neuo-outset hover:border-[#1b1b1b]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-[#5f3f3a] uppercase font-bold">
                      Block #{index}
                    </span>
                    {val.isValid ? (
                      <span className="text-emerald-700 font-bold">OK</span>
                    ) : (
                      <span className="text-[#ba1a1a] font-bold uppercase animate-pulse">BAD</span>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-[#1b1b1b] uppercase truncate">
                    {val.eventType}
                  </div>

                  <div className="text-[9px] text-[#5f3f3a] neuo-inset p-1.5 rounded border border-[#1b1b1b]/10">
                    Hash: <span className={val.isValid ? 'text-[#1b1b1b] select-all font-bold' : 'text-[#ba1a1a] font-bold'}>
                      {val.storedHash.substring(0, 6)}...
                    </span>
                  </div>
                </div>

                {/* Arrow connector */}
                {!isLatest && (
                  <ArrowRight className={`h-4 w-4 flex-shrink-0 ${
                    !validations[index + 1].isValid ? 'text-red-500 animate-pulse' : 'text-slate-600'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Details Box (Glassmorphism & Holomorphism Inspector) */}
      {selectedBlock && (
        <div className="col-span-12 glass-panel holo-border rounded-xl p-6 flex flex-col gap-4 font-mono text-[11px] text-[#1b1b1b] shadow-2xl animate-fade-in border border-[#1b1b1b]">
          <div className="flex items-center justify-between border-b border-[#1b1b1b]/20 pb-3">
            <span className="text-[#0051c6] font-bold uppercase tracking-wider text-xs flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#0051c6] animate-pulse" />
              Block Detailed Ledger Verification Check
              <span className="text-[9px] holo-badge px-2 py-0.5 rounded font-bold">INSPECTOR HUD</span>
            </span>
            <button
              onClick={() => setSelectedBlock(null)}
              className="neuo-btn px-3 py-1 rounded-lg text-[#1b1b1b] hover:bg-[#b60100] hover:text-white text-[10px] uppercase font-bold transition-all"
            >
              Clear Inspector
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <div className="space-y-3 neuo-inset p-4 rounded-xl border border-[#1b1b1b]/10">
              <div>
                <span className="text-[#0051c6] uppercase block text-[9px] font-bold">Event Log Type</span>
                <span className="text-[#1b1b1b] text-sm font-bold uppercase">{selectedBlock.eventType}</span>
              </div>
              <div>
                <span className="text-[#0051c6] uppercase block text-[9px] font-bold">Attached Episode Identifier</span>
                <span className="text-[#1b1b1b] font-bold select-all font-mono bg-[#e2e2e2] px-2 py-0.5 rounded block mt-1">{selectedBlock.episodeId || '0x0000000000000000'}</span>
              </div>
              <div>
                <span className="text-[#0051c6] uppercase block text-[9px] font-bold">Creation Timestamp</span>
                <span className="text-[#1b1b1b] font-mono">{new Date(selectedBlock.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3.5 neuo-inset p-4 rounded-xl border border-[#1b1b1b]/10 font-mono text-[10px]">
              <div>
                <span className="text-[#5f3f3a] block uppercase font-bold text-[9px]">1. Previous Link Hash (prevHash)</span>
                <code className="text-[#0051c6] font-bold break-all select-all block mt-0.5">{selectedBlock.prevHash}</code>
              </div>
              <div>
                <span className="text-[#5f3f3a] block uppercase font-bold text-[9px]">2. Reconstructed Hash Payload</span>
                <code className="text-[#1b1b1b] font-bold break-all block mt-0.5 text-[9px] bg-[#e2e2e2] p-1.5 rounded">
                  SHA-256("{selectedBlock.prevHash}:{selectedBlock.eventType}:{selectedBlock.episodeId || ''}")
                </code>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-[#1b1b1b]/10 pt-3">
                <div>
                  <span className="text-[#5f3f3a] uppercase font-bold block text-[9px]">3. Stored Database Hash</span>
                  <span className={`break-all font-bold block mt-0.5 ${selectedBlock.matchesCurrent ? 'text-emerald-700' : 'text-[#ba1a1a] font-bold'}`}>
                    {selectedBlock.storedHash}
                  </span>
                </div>
                <div>
                  <span className="text-[#5f3f3a] uppercase font-bold block text-[9px]">4. Computed Runtime Hash</span>
                  <span className={`break-all font-bold block mt-0.5 ${selectedBlock.matchesCurrent ? 'text-emerald-700' : 'text-[#ba1a1a] font-bold'}`}>
                    {selectedBlock.calculatedHash}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Table logs (Neomorphism Card & Debossed Inputs) */}
      <div className="col-span-12 neuo-card rounded-xl p-6 flex flex-col gap-4">
        
        {/* Table Filter Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b1b1b]/20 pb-4">
          <div>
            <h2 className="text-xs font-bold font-mono tracking-wider text-[#1b1b1b] uppercase flex items-center gap-2">
              Cryptographic Audit Log Table Chain
              <span className="text-[8px] bg-[#dae2ff] text-[#0051c6] px-2 py-0.5 rounded border border-[#0051c6]/30 font-bold">TAMPER-EVIDENT</span>
            </h2>
            <p className="text-[10px] text-[#5f3f3a] mt-0.5">Tamper-evident chained databases transaction records</p>
          </div>

          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#0051c6]" />
            </span>
            <input
              type="text"
              placeholder="Search by event or episode ID..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full neuo-input rounded-xl pl-10 pr-4 py-2 text-xs text-[#1b1b1b] focus:ring-2 focus:ring-[#0051c6] transition-all font-mono placeholder:text-[#5f3f3a]"
            />
          </div>
        </div>

        {/* Verification Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1b1b1b]/20 text-[#5f3f3a] text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-3.5">Block #</th>
                <th className="py-3 px-3.5">Event Type</th>
                <th className="py-3 px-3.5">Previous Hash Link</th>
                <th className="py-3 px-3.5">Stored Entry Hash</th>
                <th className="py-3 px-3.5">Integrity Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b1b1b]/10 font-mono text-[11px]">
              {filteredValidations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#5f3f3a] font-mono text-xs">
                    No block transactions matching query.
                  </td>
                </tr>
              ) : (
                filteredValidations.map((log, index) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedBlock(log)}
                    className="hover:bg-[#1b1b1b]/5 transition-all group cursor-pointer"
                  >
                    <td className="py-3.5 px-3.5 text-[#0051c6] font-bold">Block #{index}</td>
                    <td className="py-3.5 px-3.5">
                      <span className="text-[#1b1b1b] font-bold block">{log.eventType}</span>
                      {log.episodeId && (
                        <span className="block text-[9px] text-[#5f3f3a] font-mono break-all max-w-[180px] mt-0.5 bg-[#e2e2e2] px-1.5 py-0.5 rounded font-bold">
                          {log.episodeId}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-[#1b1b1b] select-all font-mono" title={log.prevHash}>
                      <code className="bg-[#e2e2e2] px-2 py-1 rounded text-[10px] font-bold">{formatHash(log.prevHash)}</code>
                    </td>
                    <td className="py-3.5 px-3.5 text-[#1b1b1b] select-all font-mono" title={log.storedHash}>
                      <code className="bg-[#e2e2e2] px-2 py-1 rounded text-[10px] font-bold">{formatHash(log.storedHash)}</code>
                    </td>
                    <td className="py-3.5 px-3.5">
                      {log.isValid ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-500/40 shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-3 py-1 rounded-full border border-[#ba1a1a]/50 animate-pulse shadow-sm">
                          <ShieldAlert className="h-3.5 w-3.5 text-[#ba1a1a]" />
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

    </div>
  );
}
