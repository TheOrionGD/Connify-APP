import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  QrCode, 
  Smartphone, 
  Apple, 
  Copy, 
  Check, 
  ExternalLink, 
  Sliders, 
  Calendar, 
  Rocket, 
  Heart, 
  Code2, 
  Lock, 
  EyeOff, 
  Radio, 
  Network,
  FileText,
  X
} from 'lucide-react';
import ConnifyLogo from './ConnifyLogo';
import RealQRCode from './RealQRCode';

export default function HeroSection({ onOpenChangelog }) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedTab, setSelectedTab] = useState('android');
  const [showQrModal, setShowQrModal] = useState(false);

  // Official production release constants & verified GitHub Pages connectivity
  const githubPagesBase = "https://theoriongd.github.io/Connify-APP";
  const releaseTag = "v4.2.1";
  const releaseUrl = "https://github.com/TheOrionGD/Connify-APP/releases/tag/v4.2.1";
  const apkDownloadUrl = "https://github.com/TheOrionGD/Connify-APP/releases/download/v4.2.1/app-release.apk";
  const downloadLandingPageUrl = `${githubPagesBase}/download.html`;
  const sha256Checksum = "ea988be0a5814d6c17ab78ecb45075759aa9446fe4ee69e667e29de2f4e9602d";
  const apkSize = "149.3 MB";

  // Dynamic QR Code target URL:
  const activeQrTargetUrl = selectedTab === 'android'
    ? downloadLandingPageUrl
    : selectedTab === 'ios'
    ? `${githubPagesBase}/#download`
    : releaseUrl;

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(sha256Checksum);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2200);
  };

  return (
    <section id="download" className="section" style={{ paddingTop: '40px', paddingBottom: '70px' }}>
      <div className="container">
        
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div className="badge-pill primary" style={{ margin: 0 }}>
            <ShieldCheck size={14} color="#e11d48" />
            <span>OFFICIAL MOBILE RELEASE</span>
          </div>
          <div className="badge-pill stable" style={{ margin: 0 }}>
            <span className="badge-dot" />
            <span>v4.2.1 Stable</span>
          </div>
        </div>

        {/* Main 2-Column Hero Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr) minmax(0, 1fr)',
          gap: '24px',
          alignItems: 'stretch',
          marginBottom: '32px'
        }} className="hero-top-grid">

          {/* Left Column: Heading, Download Buttons, Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.15 }}>
                  Get Connify for <br />
                  <span style={{ color: '#e11d48' }}>Android & iPhone</span>
                </h1>
                
                {/* Floating Brand Icons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1px solid #f1e4e4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}>
                    {/* Android Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#3ddc84">
                      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993s-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8566 8.125 12 8.125s-3.5902.286-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.152 5676l1.9973 3.4592C2.6889 11.1867.3438 14.6581 0 18.7497h24c-.3438-4.0916-2.6889-7.563-6.1185-9.4283"/>
                    </svg>
                  </div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: '#ffffff',
                    border: '1px solid #f1e4e4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}>
                    <Apple size={24} color="#0f172a" />
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: '28px', maxWidth: '520px' }}>
                Official secure mobile <strong style={{ color: '#0f172a' }}>client</strong> with end-to-end encryption, Bluetooth Mesh, offline communication, and decentralized identity.
              </p>

              {/* Download Buttons Row */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <a
                  href={apkDownloadUrl}
                  download="Connify-v4.2.1-release.apk"
                  className="btn btn-primary"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '16px',
                    fontSize: '0.96rem',
                    flex: '1 1 auto',
                    minWidth: '220px',
                    display: 'flex',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Download size={20} />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>Download APK</div>
                      <div style={{ fontSize: '0.74rem', opacity: 0.9, fontWeight: 500 }}>Android ({apkSize})</div>
                    </div>
                  </div>
                </a>

                {/* Google Play Button */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.connify"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '16px',
                    fontSize: '0.96rem',
                    flex: '1 1 auto',
                    minWidth: '200px',
                    display: 'flex',
                    justifyContent: 'center',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Google Play Triangle SVG */}
                    <svg width="22" height="24" viewBox="0 0 512 512">
                      <path fill="#00C1A6" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z"/>
                      <path fill="#0083D6" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"/>
                      <path fill="#FF3333" d="M325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z"/>
                      <path fill="#FFD400" d="M482.4 233.1l-97-55.7-60.1 60.1 60.1 60.1 97-55.7c15.7-9 25.6-25.1 25.6-44.4 0-19.4-9.9-35.4-25.6-44.4z"/>
                    </svg>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>GET IT ON</div>
                      <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0f172a' }}>Google Play</div>
                    </div>
                  </div>
                </a>
              </div>

              {/* OR Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              </div>

              {/* Scan QR Code Wide Card */}
              <button
                onClick={() => setShowQrModal(true)}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(225, 29, 72, 0.25)',
                  background: 'linear-gradient(135deg, rgba(255, 241, 242, 0.6) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.06)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#e11d48'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(225, 29, 72, 0.25)'}
              >
                <QrCode size={20} color="#e11d48" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.92rem' }}>Scan QR Code to Install</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Android APK • iPhone IPA • GitHub Release</div>
                </div>
              </button>
            </div>

            {/* Feature Pills Footer */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
              <span className="tag-pill"><Code2 size={13} color="#e11d48" /> Open Source <span style={{ color: '#94a3b8' }}>100% transparent</span></span>
              <span className="tag-pill"><ShieldCheck size={13} color="#10b981" /> End-to-End Encrypted <span style={{ color: '#94a3b8' }}>Your data stays yours</span></span>
              <span className="tag-pill"><EyeOff size={13} color="#8b5cf6" /> No Tracking <span style={{ color: '#94a3b8' }}>Privacy first</span></span>
              <span className="tag-pill"><Radio size={13} color="#f59e0b" /> Bluetooth Mesh <span style={{ color: '#94a3b8' }}>Offline & resilient</span></span>
              <span className="tag-pill"><Network size={13} color="#2563eb" /> Decentralized <span style={{ color: '#94a3b8' }}>No central servers</span></span>
            </div>
          </div>

          {/* Middle Column: QR Code Card */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Smartphone size={18} color="#0f172a" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Scan with your phone</span>
            </div>

            {/* Real Mathematically Generated Scannable QR Code */}
            <a 
              href={activeQrTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Scan with your phone or click to open: ${activeQrTargetUrl}`}
              style={{ textDecoration: 'none', display: 'inline-block', transition: 'transform 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <RealQRCode value={activeQrTargetUrl} size={210} />
            </a>

            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#64748b' }}>
              <span>Scans to: </span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#e11d48', fontWeight: 600 }}>
                {selectedTab === 'android' ? 'theoriongd.github.io/Connify-APP/download.html' : selectedTab === 'ios' ? 'theoriongd.github.io/Connify-APP/#download' : 'github.com/.../tag/v4.2.1'}
              </span>
            </div>

            {/* Platform Selector Radio/Tabs */}
            <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={apkDownloadUrl}
                download="app-release.apk"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedTab('android')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  width: '100%',
                  background: selectedTab === 'android' ? '#fff1f2' : '#f8fafc',
                  color: selectedTab === 'android' ? '#e11d48' : '#334155',
                  border: selectedTab === 'android' ? '1px solid rgba(225, 29, 72, 0.3)' : '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#3ddc84', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span>Android APK ({apkSize})</span>
                </div>
                <Download size={14} color="#e11d48" />
              </a>

              <button
                onClick={() => setSelectedTab('ios')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  width: '100%',
                  background: selectedTab === 'ios' ? '#fff1f2' : '#f8fafc',
                  color: selectedTab === 'ios' ? '#e11d48' : '#334155',
                  border: selectedTab === 'ios' ? '1px solid rgba(225, 29, 72, 0.3)' : '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                <Apple size={18} color="#0f172a" />
                <span>iPhone IPA</span>
              </button>

              <a
                href={releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedTab('github')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  width: '100%',
                  background: selectedTab === 'github' ? '#fff1f2' : '#f8fafc',
                  color: selectedTab === 'github' ? '#e11d48' : '#334155',
                  border: selectedTab === 'github' ? '1px solid rgba(225, 29, 72, 0.3)' : '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <ExternalLink size={16} color="#64748b" />
                <span>GitHub Releases (v4.2.1)</span>
              </a>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} color="#64748b" />
              <span>Always redirects to the </span>
              <a href={releaseUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48', fontWeight: 600 }}>latest release</a>
            </div>
          </div>

          {/* Right Column: Release Information & Checksum */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Sliders size={18} color="#e11d48" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Release Information</h3>
              </div>

              {/* Android Spec */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #f1e4e4' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#16a34a">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993s-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.411 13.8566 8.125 12 8.125s-3.5902.286-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.152 5676l1.9973 3.4592C2.6889 11.1867.3438 14.6581 0 18.7497h24c-.3438-4.0916-2.6889-7.563-6.1185-9.4283"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Android</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Android 8.0 (Oreo) and above</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Architectures: arm64-v8a, armeabi-v7a, x86_64</div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                      APK Size: {apkSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* iPhone Spec */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1e4e4' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Apple size={20} color="#0f172a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>iPhone</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>iOS 16.0 and above</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>IPA Available</div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#be123c', background: '#ffe4e6', padding: '2px 8px', borderRadius: '6px' }}>
                      Universal
                    </span>
                  </div>
                </div>
              </div>

              {/* SHA256 Checksum Box */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  SHA256 Checksum
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  gap: '8px'
                }}>
                  <code style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#334155',
                    wordBreak: 'break-all',
                    lineHeight: 1.3
                  }}>
                    {sha256Checksum}
                  </code>
                  <button
                    onClick={handleCopyChecksum}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: copiedHash ? '#dcfce7' : '#ffffff',
                      color: copiedHash ? '#16a34a' : '#e11d48',
                      border: copiedHash ? '1px solid #86efac' : '1px solid rgba(225, 29, 72, 0.2)',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title="Copy Checksum"
                  >
                    {copiedHash ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Synced with GitHub Link */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', marginTop: '16px', borderTop: '1px solid #f1e4e4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                <ExternalLink size={14} color="#64748b" />
                <span>Synced with GitHub Releases</span>
              </div>
              <a
                href={releaseUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.8rem', color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>View on GitHub</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom 3 Cards Row (Faithful to Image 4 Mockup) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>

          {/* Bottom Card 1: Release Information */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Calendar size={18} color="#e11d48" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Release Information</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Version</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>v4.2.1 Stable</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Release Date</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>September 17, 2026</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Android Minimum</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Android 8.0 (Oreo)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>iOS Minimum</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>iOS 16.0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>Architectures</span>
                  <span style={{ fontWeight: 500, color: '#0f172a', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>arm64-v8a, x86_64</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ color: '#64748b' }}>License</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>Apache-2.0</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Downloads</span>
                  <span style={{ fontWeight: 800, color: '#e11d48' }}>2,154+</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenChangelog?.()}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                color: '#e11d48',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff1f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <FileText size={15} />
              <span>View Full Changelog</span>
            </button>
          </div>

          {/* Bottom Card 2: Installation Guide */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Rocket size={18} color="#e11d48" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Installation Guide</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  1
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Download or Scan</div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Download the APK / IPA or scan the QR code which redirects to the latest GitHub release.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  2
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Install the App</div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Allow installation from unknown sources (Android) or install the IPA using your preferred method (iOS).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  3
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Open Connify</div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Launch the app and follow the onboarding steps.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  4
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Stay Connected</div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Enjoy secure, offline-first communication.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card 3: Why Connify? + Dual Smartphone Mockup */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Heart size={18} color="#e11d48" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Why Connify?</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.95fr)', gap: '16px', alignItems: 'center' }}>
              
              {/* Bullet Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={12} color="#e11d48" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Self-Sovereign</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>You own your identity and data.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={12} color="#e11d48" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Offline First</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Works without internet using Bluetooth Mesh.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={12} color="#e11d48" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Secure by Design</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Built with modern cryptography and privacy in mind.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={12} color="#e11d48" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a' }}>Community Driven</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Built for the community, by the community.</div>
                  </div>
                </div>
              </div>

              {/* Dual Sleek Phone Mockups (CSS-rendered exact UI from Image 4) */}
              <div style={{ position: 'relative', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                {/* Phone 1: Welcome Screen */}
                <div style={{
                  position: 'absolute',
                  left: '0px',
                  width: '95px',
                  height: '175px',
                  borderRadius: '16px',
                  background: '#09090b',
                  border: '2px solid #27272a',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                  padding: '8px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 2,
                  transform: 'rotate(-4deg)'
                }}>
                  {/* Dynamic Island */}
                  <div style={{ width: '28px', height: '4px', borderRadius: '4px', background: '#27272a' }} />
                  
                  {/* App Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: '#e11d48',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '0.9rem',
                      marginBottom: '4px'
                    }}>
                      C
                    </div>
                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.65rem' }}>Connify</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.45rem', marginTop: '2px' }}>Secure. Private.<br/>Always Connected.</div>
                  </div>

                  <button style={{
                    width: '100%',
                    padding: '4px 0',
                    background: '#e11d48',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '0.52rem',
                    fontWeight: 700
                  }}>
                    Get Started
                  </button>
                </div>

                {/* Phone 2: Mesh Network Radar */}
                <div style={{
                  position: 'absolute',
                  right: '0px',
                  width: '95px',
                  height: '175px',
                  borderRadius: '16px',
                  background: '#09090b',
                  border: '2px solid #27272a',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                  padding: '8px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 1,
                  transform: 'rotate(6deg)'
                }}>
                  {/* Dynamic Island */}
                  <div style={{ width: '28px', height: '4px', borderRadius: '4px', background: '#27272a' }} />
                  
                  {/* Mesh Visualizer */}
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.48rem', fontWeight: 600 }}>Mesh Network</div>
                    {/* SVG Constellation */}
                    <div style={{ position: 'relative', width: '60px', height: '60px', margin: '4px auto' }}>
                      <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="24" stroke="rgba(225, 29, 72, 0.2)" strokeWidth="1" fill="none" />
                        <line x1="30" y1="12" x2="16" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <line x1="30" y1="12" x2="44" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <line x1="16" y1="35" x2="44" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <line x1="30" y1="30" x2="30" y2="12" stroke="#e11d48" strokeWidth="1.5" />
                        <line x1="30" y1="30" x2="16" y2="35" stroke="#e11d48" strokeWidth="1.5" />
                        <line x1="30" y1="30" x2="44" y2="35" stroke="#e11d48" strokeWidth="1.5" />
                        <circle cx="30" cy="30" r="3" fill="#e11d48" />
                        <circle cx="30" cy="12" r="2.5" fill="#38bdf8" />
                        <circle cx="16" cy="35" r="2.5" fill="#38bdf8" />
                        <circle cx="44" cy="35" r="2.5" fill="#38bdf8" />
                      </svg>
                    </div>
                    <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.62rem' }}>12</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.44rem' }}>Peers Connected</div>
                  </div>

                  {/* Bottom mini nav */}
                  <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', opacity: 0.6 }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#e11d48' }} />
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ffffff' }} />
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ffffff' }} />
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Fullscreen Interactive QR Code Modal */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(9, 9, 11, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            padding: '32px 28px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
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

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#fff1f2', color: '#e11d48', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '14px' }}>
              <QrCode size={13} />
              <span>LIVE SCANNABLE QR CODE</span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Scan to Download Connify
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '20px' }}>
              Point your smartphone camera at this QR code to open the GitHub Pages download station and download the Android APK.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <RealQRCode value={downloadLandingPageUrl} size={240} />
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '0.75rem',
              color: '#334155',
              wordBreak: 'break-all',
              fontFamily: 'var(--font-mono)'
            }}>
              {downloadLandingPageUrl}
            </div>

            <a
              href={apkDownloadUrl}
              download="app-release.apk"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                fontSize: '0.92rem',
                textDecoration: 'none'
              }}
            >
              <Download size={18} />
              <span>Download APK Directly ({apkSize})</span>
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1040px) {
          .hero-top-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
