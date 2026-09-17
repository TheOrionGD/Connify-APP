import React, { useState } from 'react';
import { 
  Binary, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Layers, 
  Fingerprint, 
  Sparkles,
  Bot,
  Cloud,
  Code
} from 'lucide-react';

export default function ProtocolSection() {
  const [jitterMeters, setJitterMeters] = useState(6);

  // In standard SHA-256, any jitter > 0 breaks exact matching
  const sha256Match = jitterMeters === 0;
  // In SHARP BCH(15,7) GF(2^4), error correction recovers up to 12 meters of spatial sensor drift
  const sharpMatch = jitterMeters <= 12;

  return (
    <section id="protocol" className="section" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255, 241, 242, 0.45) 50%, rgba(255,255,255,0) 100%)' }}>
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="badge-pill primary">
            <Binary size={14} color="#e11d48" />
            <span>CRYPTOGRAPHIC FOUNDATION</span>
          </div>
          <h2 className="section-title">
            The Stranger Trust & <br />
            <span className="highlight">Privacy-Accuracy Paradox</span>
          </h2>
          <p className="section-subtitle">
            Connecting strangers in physical space has always failed due to two fundamental hurdles: the danger of fake luring requests, and the impossibility of matching GPS coordinates without broadcasting plaintext locations to surveillance clouds.
          </p>
        </div>

        {/* 3D Tech Card Aesthetic Banner (Inspired by Image 2) */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f6fc 0%, #fdf2f4 50%, #f3f0ff 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(225, 29, 72, 0.15)',
          padding: '32px',
          marginBottom: '48px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: '28px',
          alignItems: 'center',
          boxShadow: '0 12px 36px -10px rgba(139, 92, 246, 0.08)'
        }} className="protocol-banner">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#ede9fe', color: '#6d28d9', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '14px' }}>
              <Sparkles size={13} />
              <span>PATENTED ZERO-KNOWLEDGE PROXIMITY</span>
            </div>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              The SHARP Protocol: <br />
              <span style={{ color: '#e11d48' }}>Galois Field GF(2⁴) Spatial Matching</span>
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.65, marginBottom: '16px' }}>
              Connify does not send your raw <code style={{ color: '#e11d48', background: '#fff1f2', padding: '2px 6px', borderRadius: '4px' }}>(lat, lng)</code> to any central server. Instead, it quantizes coordinates into a 9-cell spatial neighborhood, converts them into a 1024-bit Bloom filter, and computes <strong>BCH(15,7)</strong> error-correcting syndromes.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Zero Plaintext Coordinates</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Hardware Keystore Ed25519</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Sensor Jitter Self-Correction</span>
              </div>
            </div>
          </div>

          {/* 3D Glass Pedestal Graphic (Visual Tribute to Image 2) */}
          <div style={{
            position: 'relative',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Soft Glow Radial */}
            <div style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(225, 29, 72, 0.1) 60%, transparent 80%)',
              filter: 'blur(10px)'
            }} />

            {/* Glowing Layered Glass Platforms */}
            <div style={{
              position: 'relative',
              width: '240px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(243, 232, 255, 0.7) 100%)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'perspective(600px) rotateX(25deg)'
            }}>
              {/* Lower Purple Accent Ring */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                width: '190px',
                height: '18px',
                background: '#8b5cf6',
                borderRadius: '16px',
                opacity: 0.8,
                filter: 'blur(3px)',
                zIndex: -1
              }} />
            </div>

            {/* 3 Floating Elements (Robot AI, Code bracket, Cloud) */}
            {/* Top Robot Badge */}
            <div className="float-animation" style={{
              position: 'absolute',
              top: '15px',
              width: '58px',
              height: '58px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
              boxShadow: '0 8px 24px rgba(217, 70, 239, 0.25)',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3
            }}>
              <Bot size={28} color="#c026d3" />
            </div>

            {/* Code Chip Right */}
            <div style={{
              position: 'absolute',
              right: '25px',
              top: '60px',
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              animation: 'float 3.5s ease-in-out infinite 0.8s'
            }}>
              <Code size={24} color="#059669" strokeWidth={2.5} />
            </div>

            {/* Cloud Chip Left */}
            <div style={{
              position: 'absolute',
              left: '25px',
              top: '75px',
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.2)',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              animation: 'float 4.2s ease-in-out infinite 1.4s'
            }}>
              <Cloud size={24} color="#2563eb" />
            </div>
          </div>
        </div>

        {/* Interactive ZK Coordinate Drift Simulator */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  Interactive Simulator: Mobile Sensor Jitter vs. Matching
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                Drag the slider to introduce GPS drift and see why traditional SHA-256 breaks while Connify SHARP succeeds.
              </p>
            </div>

            {/* Slider Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>Sensor Jitter:</span>
              <input
                type="range"
                min="0"
                max="16"
                step="1"
                value={jitterMeters}
                onChange={(e) => setJitterMeters(parseInt(e.target.value))}
                style={{ width: '130px', accentColor: '#e11d48', cursor: 'pointer' }}
              />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                fontWeight: 800,
                color: '#e11d48',
                minWidth: '42px'
              }}>
                {jitterMeters}m
              </span>
            </div>
          </div>

          {/* Comparison Matrix */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {/* Standard SHA-256 Box */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: sha256Match ? '1.5px solid #86efac' : '1.5px solid #fecaca',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>Traditional SHA-256 Hash</span>
                {sha256Match ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                    <CheckCircle2 size={13} /> MATCH (0m only)
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>
                    <XCircle size={13} /> MISMATCH (Broken by {jitterMeters}m jitter)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>Requester: SHA256(12.97159, 77.59456)</div>
              <code style={{ display: 'block', background: '#f8fafc', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', color: '#475569', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </code>
              <div style={{ fontSize: '0.76rem', color: '#64748b', margin: '8px 0 4px 0' }}>Responder ({jitterMeters}m drift):</div>
              <code style={{ display: 'block', background: '#f8fafc', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', color: sha256Match ? '#16a34a' : '#dc2626', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                {sha256Match 
                  ? "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" 
                  : `7a89f02c5108bb6b2e1f827dbb18${(jitterMeters * 37).toString(16).padStart(4, '0')}e91981a4b51a0293c048f029a1`}
              </code>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px' }}>
                Exact hash matching fails completely in real urban environments with GPS drift.
              </p>
            </div>

            {/* Connify SHARP Protocol Box */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: sharpMatch ? '1.5px solid #fda4af' : '1.5px solid #fecaca',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>Connify SHARP GF(2⁴) BCH(15,7)</span>
                {sharpMatch ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#e11d48', fontSize: '0.75rem', fontWeight: 700, background: '#fff1f2', padding: '2px 8px', borderRadius: '6px' }}>
                    <CheckCircle2 size={13} /> SYNCHRONIZED ({jitterMeters}m drift corrected)
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, background: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>
                    <XCircle size={13} /> OUT OF RANGE (&gt;12m threshold)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>9-Cell Bloom Filter + Parity Syndromes:</div>
              <code style={{ display: 'block', background: '#f8fafc', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', color: '#475569', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>
                SYNDROME: 0x4F, 0x8A, 0x12, 0xC3 | ROOTS α³+α+1 in GF(16)
              </code>
              <div style={{ fontSize: '0.76rem', color: '#64748b', margin: '8px 0 4px 0' }}>ZK Verification Status:</div>
              <div style={{
                background: sharpMatch ? '#f0fdf4' : '#fef2f2',
                border: sharpMatch ? '1px solid #bbf7d0' : '1px solid #fecaca',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: sharpMatch ? '#16a34a' : '#dc2626'
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sharpMatch ? '#16a34a' : '#dc2626' }}>
                  {sharpMatch 
                    ? "Syndrome Error-Correction Converged. Rendezvous Authenticated in Zero-Knowledge." 
                    : "Drift exceeds local cell radius. Request safely quarantined."}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px' }}>
                Responders mathematically reconstruct the spatial vector on their own hardware without raw coordinates ever leaving the device.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Foundation Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={22} color="#e11d48" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>9-Cell Spatial Neighborhood</h4>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Positions are quantized into local geometric cells and blinded with salt before computing Bloom filter signatures, completely hiding raw latitude and longitude.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Fingerprint size={22} color="#8b5cf6" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Hardware-Bound Ed25519 Keys</h4>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Client identity is generated deterministically within Android Keystore and Apple Keychain. Every message is signed using TweetNaCl cryptographic keypairs.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Cpu size={22} color="#16a34a" />
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>JIT Trust Capsules</h4>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.6 }}>
              Just-In-Time connection tokens last only 2 hours. Bearer tokens never live in a central database—only SHA-256 digests—preventing credential theft.
            </p>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 860px) {
          .protocol-banner {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
