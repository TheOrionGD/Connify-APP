import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

/**
 * Real, Mathematically Scannable QR Code Generator Component
 * Uses High Error Correction (H, ~30% recovery) so camera scanners decode instantly
 * even with the central Connify brand badge.
 */
export default function RealQRCode({ 
  value = "https://theoriongd.github.io/Connify-APP/download.html", 
  size = 196,
  showLogo = true 
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: size * 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Generation error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #f1e4e4',
      padding: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    }}>
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt={`Scan to open ${value}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            borderRadius: '8px'
          }}
        />
      ) : (
        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Generating QR...</div>
      )}

      {/* Center Connify Red Logo Emblem */}
      {showLogo && qrDataUrl && (
        <div style={{
          position: 'absolute',
          width: `${Math.round(size * 0.22)}px`,
          height: `${Math.round(size * 0.22)}px`,
          borderRadius: '10px',
          background: '#ffffff',
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #ffffff',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: `${Math.round(size * 0.12)}px`,
            letterSpacing: '-0.05em'
          }}>
            C
          </div>
        </div>
      )}
    </div>
  );
}
