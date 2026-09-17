import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProtocolSection from './components/ProtocolSection';
import MutualAidSection from './components/MutualAidSection';
import SecuritySection from './components/SecuritySection';
import ComplianceSection from './components/ComplianceSection';
import Footer from './components/Footer';
import { X, CheckCircle2, FileText, Shield } from 'lucide-react';

export default function App() {
  const [showChangelog, setShowChangelog] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="app-root">
      {/* Sticky Glass Navbar */}
      <Navbar />

      {/* 5 Comprehensive Landing Page Sections */}
      <main>
        {/* Section 1: Official Mobile Release & Download Hub (Matches Image 4 Mockup) */}
        <HeroSection onOpenChangelog={() => setShowChangelog(true)} />

        {/* Section 2: The Core Thesis & SHARP Zero-Knowledge Galois Field Protocol */}
        <ProtocolSection />

        {/* Section 3: P2P Community Mesh & The 22 Assistance Services */}
        <MutualAidSection />

        {/* Section 4: Anti-Luring Behavioral Engine & Hash-Chained Audit Ledger */}
        <SecuritySection />

        {/* Section 5: Google Play Console Safety, IARC Ratings & Account Deletion Portal */}
        <ComplianceSection />
      </main>

      {/* Complete Footer */}
      <Footer 
        onOpenPrivacy={() => setShowPrivacy(true)}
        onOpenChangelog={() => setShowChangelog(true)}
      />

      {/* Changelog Modal */}
      {showChangelog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(9, 9, 11, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowChangelog(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="#0f172a" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={22} color="#e11d48" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Connify Changelog</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, color: '#e11d48' }}>v3.7.8 (Stable Production)</span>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>September 2026</span>
                </div>
                <ul style={{ paddingLeft: '18px', color: '#475569', lineHeight: 1.6 }}>
                  <li>Target SDK upgraded to Android 15 API 36+.</li>
                  <li>Google Play Console Data Safety questionnaire synchronization.</li>
                  <li>Account Deletion web form portal integration.</li>
                  <li>BCH(15,7) Galois Field syndrome verification optimization.</li>
                </ul>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>v3.7.5</span>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>August 2026</span>
                </div>
                <ul style={{ paddingLeft: '18px', color: '#475569', lineHeight: 1.6 }}>
                  <li>React Native 0.86.0 and React 19 framework upgrade.</li>
                  <li>Added Notifee rich foreground emergency notification channels.</li>
                  <li>Autonomous Signal-Loss Watchdog daemon with Brevo email dispatcher.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(9, 9, 11, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowPrivacy(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="#0f172a" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Shield size={22} color="#16a34a" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Zero-Trace Privacy Policy</h3>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p>
                Connify operates on a <strong>zero-knowledge proximity model</strong>. We believe your physical coordinates belong to you, not to ad brokers or cloud servers.
              </p>
              <p>
                <strong>1. No Permanent Coordinate Tracking:</strong> Locations are blinded into 9-cell spatial grids using SHARP Galois Field arithmetic. Raw GPS coordinates are never stored in our MongoDB Atlas cluster.
              </p>
              <p>
                <strong>2. Zero Third-Party Advertising:</strong> Connify does not integrate AdMob, Meta Audience Network, or any behavioral analytics tracking SDKs.
              </p>
              <p>
                <strong>3. Immediate Data Purge:</strong> When an emergency episode concludes, temporary peer JIT tokens are revoked, and all ephemeral session records are purged.
              </p>
              <p>
                <strong>4. Account Deletion:</strong> You can wipe your account profile and contacts anytime in-app or via our official Google Form within 48 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
