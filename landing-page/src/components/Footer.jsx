import React from 'react';
import ConnifyLogo from './ConnifyLogo';
import { FileText, Shield, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ onOpenPrivacy, onOpenChangelog }) {
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfpvdZDBVlvi1_kyUPvEkOzU1XRKyc2pq8gPkxC_4IDjllhDg/viewform";

  return (
    <footer style={{ background: '#09090b', color: '#94a3b8', paddingTop: '60px', paddingBottom: '40px', borderTop: '1px solid #18181b' }}>
      <div className="container">
        
        {/* Top Footer Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          paddingBottom: '40px',
          borderBottom: '1px solid #27272a'
        }}>
          {/* Col 1: Brand & Thesis */}
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#fff1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ConnifyLogo size={28} />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>Connify</span>
            </div>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#a1a1aa' }}>
              Decentralized zero-knowledge connection protocol connecting strangers in physical proximity through ad-hoc peer-to-peer mesh networks.
            </p>
          </div>

          {/* Col 2: Monorepo Workspaces */}
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>
              Monorepo Workspaces
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <li>
                <span style={{ color: '#ff4d6d', fontWeight: 600 }}>backend:</span> Fastify 5 + Mongo + Socket.IO
              </li>
              <li>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Connify:</span> React Native 0.86 + Expo
              </li>
              <li>
                <span style={{ color: '#34d399', fontWeight: 600 }}>patent:</span> SHARP Galois Field Engine
              </li>
              <li>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>landing-page:</span> React + Vanilla CSS
              </li>
            </ul>
          </div>

          {/* Col 3: Specifications & Safety */}
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>
              Security & Policy
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <li>
                <a
                  href="#compliance"
                  style={{ color: '#cbd5e1', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#e11d48'}
                  onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                >
                  Google Play Questionnaire Audit
                </a>
              </li>
              <li>
                <a
                  href={googleFormUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onMouseEnter={(e) => e.target.style.color = '#e11d48'}
                  onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                >
                  <span>Data & Account Deletion Form</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onOpenPrivacy?.(); }}
                  style={{ color: '#cbd5e1' }}
                  onMouseEnter={(e) => e.target.style.color = '#e11d48'}
                  onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                >
                  Zero-Trace Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Open Source */}
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>
              Community & Code
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="https://github.com/TheOrionGD/Connify-APP"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{
                  background: '#18181b',
                  color: '#ffffff',
                  border: '1px solid #27272a',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  justifyContent: 'flex-start',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>TheOrionGD/Connify-APP</span>
              </a>
              <div style={{ fontSize: '0.75rem', color: '#71717a' }}>
                Licensed under Apache-2.0. Verified SHA-256 cryptographic releases.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '24px',
          fontSize: '0.78rem'
        }}>
          <div>
            &copy; 2026 Connify Protocol. All rights reserved. Self-Sovereign Proximity Network.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>v4.2.1 Production</span>
            <span>Target SDK 36</span>
            <span>Zero Ads</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
