import React, { useState } from 'react';
import { Download, Smartphone, ShieldAlert, QrCode, FileText, CheckCircle2, Cpu, Layers, WifiOff, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DownloadApk() {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(0);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const apkSpecs = {
    version: 'v1.4.2-stable',
    releaseDate: 'July 18, 2026',
    fileSize: '18.4 MB',
    minAndroid: 'Android 8.0 (Oreo) and above',
    architectures: 'arm64-v8a, armeabi-v7a, x86_64',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(apkSpecs.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    
    // Create and trigger a mock APK file download
    const element = document.createElement("a");
    const file = new Blob([
      "// Connify Secure P2P Client Mock APK Manifest\n" +
      `// Build: ${apkSpecs.version}\n` +
      `// Architecture: ${apkSpecs.architectures}\n` +
      `// Integrity Certificate SHA-256: ${apkSpecs.sha256}\n` +
      "console.log('Connify Secure Android P2P App initialized');"
    ], { type: 'text/plain' });
    
    element.href = URL.createObjectURL(file);
    element.download = "connify-client-v1.4.2.apk";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setTimeout(() => {
      setDownloadStarted(false);
    }, 5000);
  };

  const installationSteps = [
    {
      title: '1. Download the Connify APK',
      desc: 'Click the primary "Download APK" button below. Your web browser may warn you that downloading files of this type could harm your device. Confirm to proceed.',
    },
    {
      title: '2. Enable Unknown Sources',
      desc: 'Go to Settings > Apps & Notifications > Special app access > Install unknown apps. Choose your browser (e.g., Chrome or Opera) and toggle on "Allow from this source".',
    },
    {
      title: '3. Install & Sync Mesh Key',
      desc: 'Open your device Downloads folder, tap the downloaded APK, and click "Install". Launch Connify to configure your offline secure mesh encryption credentials.',
    }
  ];

  const faqItems = [
    {
      question: 'Why download the APK directly instead of Google Play Store?',
      answer: 'To protect community autonomy from corporate censorship, Connify is fully decentralized. The direct APK features direct Bluetooth mesh transport access which is restricted on standard store releases, and works completely offline without Google Play Services.'
    },
    {
      question: 'Is installing a third-party APK file secure?',
      answer: 'Yes. Every release on Connify is open-source and signed cryptographically by the Consensus Council. You can verify the integrity of your download by matching the SHA-256 checksum against our distributed mesh ledger.'
    },
    {
      question: 'How does Local Mesh Sharing work?',
      answer: 'If you are off-grid with other neighbors, you can share the APK directly over a local Bluetooth or Wi-Fi Direct connection. Other users do not need an internet connection to receive and install the app.'
    }
  ];

  return (
    <section className="space-y-12">
      {/* Opera Web Browser Style Hero Banner */}
      <div className="bg-brand-surface border-2 border-brand-black rounded-xl p-8 sm:p-12 relative overflow-hidden shadow-[6px_6px_0px_#1b1b1b]">
        {/* Decorative Grid and Ambient Lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-brand-red/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Hero Left: Large Opera-style product hook */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-red/10 rounded border border-brand-red/25">
              <Smartphone className="h-4 w-4 text-brand-red" />
              <span className="font-mono text-xs font-bold text-brand-red uppercase tracking-widest">
                OFFICIAL ANDROID STABLE RELEASE
              </span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-brand-black leading-none tracking-tight">
              Get Connify for <span className="text-brand-red">Android</span>
            </h1>

            <p className="font-sans text-brand-muted text-base sm:text-lg leading-relaxed max-w-xl font-medium">
              Sideload the off-grid guard companion directly to your phone. Engineered with raw Bluetooth-Mesh socket integration, encrypted local storage, and 24/7 background geofence alerts.
            </p>

            {/* Features Highlight */}
            <div className="grid sm:grid-cols-3 gap-4 py-2">
              <div className="flex items-start space-x-2.5">
                <WifiOff className="h-5 w-5 text-brand-red mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-xs text-brand-black">100% Offline Mesh</h4>
                  <p className="font-sans text-[10px] text-brand-muted leading-tight mt-0.5">Operates with zero cell towers or central databases.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <Cpu className="h-5 w-5 text-brand-red mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-xs text-brand-black">Low Battery drain</h4>
                  <p className="font-sans text-[10px] text-brand-muted leading-tight mt-0.5">Optimized foreground persistent service.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <Layers className="h-5 w-5 text-brand-red mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-xs text-brand-black">Open-Source ZK</h4>
                  <p className="font-sans text-[10px] text-brand-muted leading-tight mt-0.5">Audited zero-knowledge verification protocols.</p>
                </div>
              </div>
            </div>

            {/* Prominent Action Button Grid */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleDownload}
                className="px-8 py-4 bg-brand-red hover:bg-brand-red-hover text-white font-sans font-bold text-base rounded border-2 border-brand-black shadow-[4px_4px_0px_#1b1b1b] hover:shadow-[1px_1px_0px_#1b1b1b] hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer flex items-center space-x-3"
              >
                <Download className="h-5 w-5" />
                <span>DOWNLOAD STABLE APK ({apkSpecs.fileSize})</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('sideload-guide');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 bg-white hover:bg-brand-beige text-brand-black font-sans font-bold text-sm rounded border-2 border-brand-black shadow-[3px_3px_0px_#1b1b1b] hover:shadow-[1px_1px_0px_#1b1b1b] hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex items-center space-x-2"
              >
                <span>INSTALLATION GUIDE</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Alert on direct mesh advantages */}
            <div className="flex items-center space-x-2 text-[11px] font-sans text-brand-muted font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span>Direct APK package contains Bluetooth-Mesh drivers optimized for pure offline connection.</span>
            </div>
          </div>

          {/* Hero Right: Opera-style specs container + QR code for desktop sideloading */}
          <div className="lg:col-span-5 space-y-6">
            {/* Spec Card with QR integration */}
            <div className="bg-brand-beige border-2 border-brand-black rounded-lg p-6 space-y-5 shadow-[4px_4px_0px_rgba(27,27,27,1)]">
              <div className="flex justify-between items-center border-b border-brand-black/10 pb-3">
                <span className="font-mono text-xs text-brand-red font-bold">PACKAGE DETAILS</span>
                <span className="bg-brand-red text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                  v1.4.2 STABLE
                </span>
              </div>

              {/* Specs parameters */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-brand-muted font-semibold">Minimum OS</span>
                  <span className="text-brand-black font-bold font-mono">{apkSpecs.minAndroid}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-brand-muted font-semibold">Architectures</span>
                  <span className="text-brand-black font-bold font-mono">{apkSpecs.architectures}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-brand-muted font-semibold">File Size</span>
                  <span className="text-brand-black font-bold font-mono">{apkSpecs.fileSize}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="text-brand-muted font-semibold">Release Date</span>
                  <span className="text-brand-black font-bold font-mono">{apkSpecs.releaseDate}</span>
                </div>
              </div>

              {/* SHA-256 Verification Checksum */}
              <div className="bg-white border border-brand-black/10 rounded p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-brand-muted font-extrabold uppercase">SHA-256 INTEGRITY HASH:</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 hover:bg-brand-beige rounded text-brand-muted hover:text-brand-black transition-colors"
                    title="Copy Checksum"
                  >
                    {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="font-mono text-[9px] text-brand-black break-all font-bold">
                  {apkSpecs.sha256}
                </p>
              </div>

              {/* QR Code section for scanning directly with physical mobile */}
              <div className="border-t border-brand-black/10 pt-4 flex items-center space-x-4">
                <div className="p-2 bg-white border border-brand-black/20 rounded">
                  {/* Simulated SVG QR Code for direct download */}
                  <svg className="w-16 h-16 text-brand-black" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#ffffff" />
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="25" height="25" fill="currentColor" />
                    <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                    <rect x="13" y="13" width="9" height="9" fill="currentColor" />
                    {/* Corner 2 */}
                    <rect x="70" y="5" width="25" height="25" fill="currentColor" />
                    <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                    <rect x="78" y="13" width="9" height="9" fill="currentColor" />
                    {/* Corner 3 */}
                    <rect x="5" y="70" width="25" height="25" fill="currentColor" />
                    <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                    <rect x="13" y="78" width="9" height="9" fill="currentColor" />
                    {/* Noise & Alignment Squares */}
                    <rect x="40" y="10" width="5" height="10" fill="currentColor" />
                    <rect x="50" y="5" width="10" height="5" fill="currentColor" />
                    <rect x="45" y="25" width="8" height="8" fill="currentColor" />
                    <rect x="80" y="40" width="10" height="10" fill="currentColor" />
                    <rect x="35" y="45" width="15" height="5" fill="currentColor" />
                    <rect x="55" y="35" width="10" height="15" fill="currentColor" />
                    <rect x="75" y="60" width="5" height="5" fill="currentColor" />
                    <rect x="65" y="75" width="10" height="15" fill="currentColor" />
                    <rect x="45" y="70" width="15" height="10" fill="currentColor" />
                    <rect x="85" y="85" width="10" height="10" fill="currentColor" />
                    <rect x="40" y="85" width="5" height="5" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center space-x-1">
                    <QrCode className="h-3.5 w-3.5 text-brand-red" />
                    <span className="font-display font-bold text-[11px] text-brand-black">DESKTOP-TO-MOBILE SCAN</span>
                  </div>
                  <p className="font-sans text-[10px] text-brand-muted leading-tight font-medium">
                    Hover and scan this code with your smartphone camera to load the direct APK link instantly on your device.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sideload Guide / Instructions Grid */}
      <div id="sideload-guide" className="grid md:grid-cols-12 gap-8 scroll-mt-24">
        {/* Left side: Guide Steps */}
        <div className="md:col-span-8 bg-brand-surface border-2 border-brand-black rounded-lg p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_#1b1b1b]">
          <div className="space-y-1.5">
            <span className="font-mono text-[10px] font-bold text-brand-red uppercase tracking-wider block">INSTRUCTIONS MANUAL</span>
            <h2 className="font-display font-extrabold text-2xl text-brand-black">How to Install APK on Android</h2>
            <p className="font-sans text-xs text-brand-muted font-medium">
              Sideloading an APK package manually is safe, transparent, and takes less than 2 minutes. Follow the direct browser installation steps:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            {installationSteps.map((step, idx) => (
              <div key={idx} className="space-y-2">
                <div className="p-2 bg-brand-beige border border-brand-black/10 rounded w-fit">
                  <span className="font-mono text-xs font-bold text-brand-red">STEP 0{idx + 1}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-brand-black">{step.title}</h3>
                <p className="font-sans text-[11px] text-brand-muted leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-brand-beige/50 border border-brand-black/15 rounded flex items-start space-x-3 text-xs text-brand-muted">
            <ShieldAlert className="h-5 w-5 text-brand-red shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block font-display font-bold text-brand-black text-[11px]">Security Verification Assurance</span>
              <p className="leading-relaxed font-medium">
                Our distribution binary is audited daily. If you receive an alert from Android Play Protect, you can safely dismiss it: our community-mesh framework requires low-level network permissions (such as Bluetooth Socket binding) to route offline packets without cellular towers.
              </p>
            </div>
          </div>
        </div>

        {/* Right side: FAQ Panel */}
        <div className="md:col-span-4 bg-brand-surface border-2 border-brand-black rounded-lg p-6 space-y-4 shadow-[4px_4px_0px_#1b1b1b]">
          <h3 className="font-display font-extrabold text-lg text-brand-black">Sideloading FAQ</h3>
          
          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = activeFAQ === idx;
              return (
                <div key={idx} className="border border-brand-black/10 rounded overflow-hidden bg-white">
                  <button
                    onClick={() => setActiveFAQ(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left font-display font-bold text-xs text-brand-black flex justify-between items-center hover:bg-brand-beige/30 transition-colors"
                  >
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5 shrink-0 ml-2" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 ml-2" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-brand-black/10 px-3.5 py-3 font-sans text-[11px] text-brand-muted leading-relaxed font-medium"
                      >
                        {item.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Sideload Action Simulator Notification */}
      <AnimatePresence>
        {downloadStarted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border-2 border-brand-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(27,27,27,1)] flex items-start space-x-3.5"
          >
            <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-600 rounded">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="block font-display font-bold text-xs text-brand-black">Direct Sideload Triggered</span>
              <p className="font-sans text-[10px] text-brand-muted leading-tight font-medium">
                Downloading <strong>connify-client-v1.4.2.apk</strong> (18.4 MB) onto your computer file sandbox. Move to Android storage or scan the QR code to run.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
