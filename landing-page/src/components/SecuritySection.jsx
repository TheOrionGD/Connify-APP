import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Key, 
  Clock, 
  FileCheck, 
  AlertOctagon, 
  EyeOff, 
  Terminal, 
  CheckCircle2, 
  Users
} from 'lucide-react';

export default function SecuritySection() {
  const [activeLedgerIndex, setActiveLedgerIndex] = useState(2);

  const ledgerBlocks = [
    {
      index: 0,
      event: "EPISODE_CREATED",
      prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
      hash: "8f4a1c7e9b2d3f0a4c5e6b7a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
      timestamp: "18:20:02 UTC",
      detail: "Blinded spatial token broadcast. Velocity cap passed (1/2 in 10m)."
    },
    {
      index: 1,
      event: "JIT_CAPSULE_MINTED",
      prevHash: "8f4a1c7e9b2d3f0a4c5e6b7a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
      hash: "3b2a9e1d5f8c4a7b0e3d6c9a2f5e8b1d4a7c0e3f6b9d2a5c8e1f4b7a0d3c6e9f",
      timestamp: "18:20:45 UTC",
      detail: "Ed25519-signed JWS token issued. 2-hour TTL timer started."
    },
    {
      index: 2,
      event: "QR_HANDSHAKE_VERIFIED",
      prevHash: "3b2a9e1d5f8c4a7b0e3d6c9a2f5e8b1d4a7c0e3f6b9d2a5c8e1f4b7a0d3c6e9f",
      hash: "7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c",
      timestamp: "18:23:10 UTC",
      detail: "Mutual public keys exchanged via VisionCamera optical scan."
    },
    {
      index: 3,
      event: "RESOLVED_AND_PURGED",
      prevHash: "7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c",
      hash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      timestamp: "18:28:15 UTC",
      detail: "Ephemeral keys deleted. Reputation XP awarded. Zero logs retained."
    }
  ];

  return (
    <section id="security" className="section" style={{ background: 'linear-gradient(180deg, #faf9f8 0%, #fff1f2 100%)' }}>
      <div className="container">

        {/* Header */}
        <div className="section-header">
          <div className="badge-pill primary">
            <Lock size={14} color="#e11d48" />
            <span>ANTI-LURING & CRYPTOGRAPHY</span>
          </div>
          <h2 className="section-title">
            Solving the <br />
            <span className="highlight">Stranger Trust Paradox</span>
          </h2>
          <p className="section-subtitle">
            How do you summon nearby strangers without malicious actors using the system to lure victims? Connify combines hardware keystores, behavioral risk engines, and mathematical audit ledgers.
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {/* Card 1: Behavioral Risk Engine */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#fff1f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <AlertOctagon size={22} color="#e11d48" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Anti-Luring Risk Engine
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Enforces strict velocity limits (max 2 broadcasts per 10 mins). Requires mandatory verified emergency guardians on file before broadcast to deter bad-faith actors.
            </p>
          </div>

          {/* Card 2: Hardware Ed25519 Keystore */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Key size={22} color="#8b5cf6" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Hardware-Bound Node Identity
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Keypairs are derived from on-device hardware security modules (Android Keystore / iOS Secure Enclave). Prevents bot farms, spoofed coordinates, and Sybil attacks.
            </p>
          </div>

          {/* Card 3: Autonomous Watchdog */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Clock size={22} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Signal-Loss Watchdog Daemon
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Background daemon scans active sessions every 10s. If signal ceases for ≥15s during an active episode, FCM alerts and Brevo emails auto-fire to all guardians.
            </p>
          </div>

          {/* Card 4: Bystander Witness Attestation */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Users size={22} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              Bystander Witness Attestations
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Nearby third-party users can co-sign an encounter with a single tap, creating independent validation that the rendezvous was safe and consensual.
            </p>
          </div>
        </div>

        {/* Interactive Hash-Chained Audit Ledger Explorer */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  Tamper-Evident Hash-Chained Audit Ledger
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                Hₙ = SHA-256(Hₙ₋₁ ∥ EventType ∥ EpisodeID) guarantees non-repudiation for legal, police, or insurance audits.
              </p>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px' }}>
              ✓ Cryptographically Verified Chain
            </div>
          </div>

          {/* Blocks Selector */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {ledgerBlocks.map((block, idx) => (
              <button
                key={block.index}
                onClick={() => setActiveLedgerIndex(idx)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: activeLedgerIndex === idx ? '#e11d48' : '#f8fafc',
                  color: activeLedgerIndex === idx ? '#ffffff' : '#334155',
                  border: activeLedgerIndex === idx ? '1px solid #e11d48' : '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Block #{block.index}: {block.event}
              </button>
            ))}
          </div>

          {/* Active Block Inspector */}
          <div style={{ background: '#09090b', borderRadius: '14px', padding: '20px', color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #27272a', paddingBottom: '10px', marginBottom: '12px' }}>
              <span style={{ color: '#ff4d6d', fontWeight: 700, fontSize: '0.88rem' }}>
                {ledgerBlocks[activeLedgerIndex].event}
              </span>
              <span style={{ color: '#a1a1aa', fontSize: '0.78rem' }}>
                {ledgerBlocks[activeLedgerIndex].timestamp}
              </span>
            </div>

            <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: '#71717a' }}>Previous Block Hash (Hₙ₋₁): </span>
                <span style={{ color: '#38bdf8', wordBreak: 'break-all' }}>{ledgerBlocks[activeLedgerIndex].prevHash}</span>
              </div>
              <div>
                <span style={{ color: '#71717a' }}>Current State Hash (Hₙ): </span>
                <span style={{ color: '#34d399', wordBreak: 'break-all' }}>{ledgerBlocks[activeLedgerIndex].hash}</span>
              </div>
              <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #27272a', color: '#f4f4f5' }}>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>Ledger Payload: </span>
                {ledgerBlocks[activeLedgerIndex].detail}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
