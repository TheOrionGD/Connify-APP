import React, { useState, useEffect } from 'react';
import ConnifyLogo from './ConnifyLogo';
import { Download, ShieldCheck, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ onOpenDeletionModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: isScrolled
          ? 'rgba(255, 255, 255, 0.88)'
          : 'rgba(250, 249, 248, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isScrolled
          ? '1px solid rgba(226, 232, 240, 0.8)'
          : '1px solid transparent',
        boxShadow: isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.03)' : 'none',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        {/* Brand */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#fff1f2',
              border: '1px solid rgba(225, 29, 72, 0.2)',
              boxShadow: '0 2px 8px rgba(225, 29, 72, 0.12)',
            }}
          >
            <ConnifyLogo size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#0f172a',
                }}
              >
                Connify
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: 'rgba(225, 29, 72, 0.1)',
                  color: '#e11d48',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                }}
              >
                P2P
              </span>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#64748b',
                fontWeight: 500,
                display: 'block',
                marginTop: '-2px',
              }}
            >
              Zero-Knowledge Mesh
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
          }}
          className="desktop-nav"
        >
          <a
            href="#download"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#334155',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#e11d48')}
            onMouseLeave={(e) => (e.target.style.color = '#334155')}
          >
            Download Client
          </a>
          <a
            href="#protocol"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#334155',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#e11d48')}
            onMouseLeave={(e) => (e.target.style.color = '#334155')}
          >
            SHARP Protocol
          </a>
          <a
            href="#mesh"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#334155',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#e11d48')}
            onMouseLeave={(e) => (e.target.style.color = '#334155')}
          >
            Mutual Aid & Mesh
          </a>
          <a
            href="#security"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#334155',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#e11d48')}
            onMouseLeave={(e) => (e.target.style.color = '#334155')}
          >
            Trust & Security
          </a>
          <a
            href="#compliance"
            style={{
              fontSize: '0.92rem',
              fontWeight: 600,
              color: '#334155',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#e11d48')}
            onMouseLeave={(e) => (e.target.style.color = '#334155')}
          >
            Play Safety & Deletion
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="https://github.com/TheOrionGD/Connify-APP"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.85rem',
              borderRadius: '12px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>

          <a
            href="#download"
            className="btn btn-primary"
            style={{
              padding: '9px 18px',
              fontSize: '0.88rem',
              borderRadius: '9999px',
            }}
          >
            <Download size={16} />
            <span>Get Connify</span>
          </a>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            style={{
              padding: '8px',
              borderRadius: '8px',
              color: '#0f172a',
              background: '#f1f5f9',
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <a
            href="#download"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#334155', padding: '8px 0' }}
          >
            Download Client (v4.2.1)
          </a>
          <a
            href="#protocol"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#334155', padding: '8px 0' }}
          >
            SHARP ZK Protocol
          </a>
          <a
            href="#mesh"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#334155', padding: '8px 0' }}
          >
            22 Mutual Aid Categories
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#334155', padding: '8px 0' }}
          >
            Anti-Luring Security & Ledger
          </a>
          <a
            href="#compliance"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: '#334155', padding: '8px 0' }}
          >
            Google Play Safety & Account Deletion
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-hamburger-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
