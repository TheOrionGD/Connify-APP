import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  FileText, 
  Globe, 
  Lock, 
  Smartphone,
  EyeOff
} from 'lucide-react';

export default function ComplianceSection({ onOpenDeletionModal }) {
  const [testEmail, setTestEmail] = useState('');
  const [deletionSimulated, setDeletionSimulated] = useState(false);

  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform";

  const handleSimulatePurge = (e) => {
    e.preventDefault();
    if (!testEmail) return;
    setDeletionSimulated(true);
    setTimeout(() => {
      setDeletionSimulated(false);
      setTestEmail('');
      window.open(googleFormUrl, '_blank');
    }, 1800);
  };

  return (
    <section id="compliance" className="section" style={{ background: '#ffffff' }}>
      <div className="container">

        {/* Section Header */}
        <div className="section-header">
          <div className="badge-pill stable">
            <ShieldCheck size={14} color="#16a34a" />
            <span>PLAY CONSOLE COMPLIANCE & PRIVACY</span>
          </div>
          <h2 className="section-title">
            Self-Sovereign Governance & <br />
            <span className="highlight">Account Deletion Portal</span>
          </h2>
          <p className="section-subtitle">
            Audited against Google Play Console Data Safety guidelines and Apple App Store Guideline 5.1.1(v). You have 100% control over your data with zero third-party monetization.
          </p>
        </div>

        {/* 2-Column Layout: Left Compliance Badges, Right Account Deletion Form */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '28px',
          marginBottom: '48px'
        }}>

          {/* Left Column: Official Play Store Audit Declarations */}
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Globe size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  Google Play Store Declarations
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Zero Ads */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={16} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Zero Advertisements</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No AdMob, Unity Ads, or tracking SDKs included in production APK/AAB.</div>
                  </div>
                </div>

                {/* Zero-Trace Coordinates */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={16} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Zero Location Tracking History</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>GPS telemetry is ephemeral during active peer encounters and wiped automatically upon episode resolution.</div>
                  </div>
                </div>

                {/* Android SDK 36 Target */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={16} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Android 15+ Ready (Target SDK 36)</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Full 64-bit architecture support (arm64-v8a, x86_64) with native Android lockscreen emergency widgets.</div>
                  </div>
                </div>
              </div>

              {/* IARC Rating Chips */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1e4e4' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Official IARC Ratings
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '6px' }}>
                    🇺🇸 ESRB: Everyone (E)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '6px' }}>
                    🇪🇺 PEGI: 3
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', color: '#0f172a', padding: '4px 10px', borderRadius: '6px' }}>
                    🇧🇷 ClassInd: All Ages
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#fff1f2', color: '#e11d48', padding: '4px 10px', borderRadius: '6px' }}>
                    🇩🇪 USK: 16+
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} />
              <span>TLS 1.3 in-transit encryption • Argon2 & Ed25519 identity</span>
            </div>
          </div>

          {/* Right Column: Account & Data Deletion Google Form Hub */}
          <div className="glass-card" style={{ padding: '28px', border: '1.5px solid rgba(225, 29, 72, 0.25)', background: 'linear-gradient(135deg, rgba(255, 241, 242, 0.4) 0%, #ffffff 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={20} color="#e11d48" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  Permanent Account & Data Wipe
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e11d48', background: '#ffe4e6', padding: '2px 8px', borderRadius: '6px' }}>
                48h SLA
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
              In accordance with Google Play & Apple App Store compliance policies, you can permanently wipe your account, guardian contacts, and health telemetry at any time without retaining historical traces.
            </p>

            {/* Deletion Categories Checklist */}
            <div style={{ background: '#ffffff', border: '1px solid #f1e4e4', borderRadius: '12px', padding: '14px', marginBottom: '20px', fontSize: '0.8rem', color: '#334155' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Data Categories Purged Upon Request:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
                  <input type="checkbox" defaultChecked disabled style={{ accentColor: '#e11d48' }} />
                  <span>Google OAuth profile, names & email addresses</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
                  <input type="checkbox" defaultChecked disabled style={{ accentColor: '#e11d48' }} />
                  <span>Emergency guardians & trusted contact phone numbers</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
                  <input type="checkbox" defaultChecked disabled style={{ accentColor: '#e11d48' }} />
                  <span>Medical notes (blood type, allergies, conditions)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}>
                  <input type="checkbox" defaultChecked disabled style={{ accentColor: '#e11d48' }} />
                  <span>Hardware Ed25519 node public keys & device fingerprints</span>
                </label>
              </div>
            </div>

            {/* Quick-Launch or Direct Form Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={googleFormUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <span>Open Official Account Deletion Google Form</span>
                <ExternalLink size={16} />
              </a>

              <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#94a3b8' }}>
                Direct Link: <a href={googleFormUrl} target="_blank" rel="noreferrer" style={{ color: '#e11d48', wordBreak: 'break-all' }}>docs.google.com/forms/.../viewform</a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
