import React, { useState } from 'react';
import { Download, Smartphone, ShieldAlert, QrCode, FileText, CheckCircle2, Cpu, Layers, WifiOff, ExternalLink, ChevronDown, ChevronUp, Copy, Check, ShieldCheck, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DownloadApk() {
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(0);
  const [downloadStarted, setDownloadStarted] = useState(false);

  // SHA-256 Validator Tool State
  const [inputHash, setInputHash] = useState<string>('');
  const [validationResult, setValidationResult] = useState<'idle' | 'valid' | 'invalid'>('idle');

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

  const handleValidateHash = () => {
    if (!inputHash.trim()) return;
    if (inputHash.trim().toLowerCase() === apkSpecs.sha256.toLowerCase()) {
      setValidationResult('valid');
    } else {
      setValidationResult('invalid');
    }
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    
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
      desc: 'Click the primary "Download APK" button below. Your browser may alert you about downloading APK files directly; confirm to proceed.',
    },
    {
      title: '2. Enable Unknown Sources',
      desc: 'Navigate to Settings > Apps & Notifications > Special App Access > Install Unknown Apps, and toggle on permission for your browser.',
    },
    {
      title: '3. Install & Sync Mesh Key',
      desc: 'Open your Downloads folder, tap the APK, and launch Connify to configure your offline Bluetooth mesh credentials.',
    }
  ];

  const faqItems = [
    {
      question: 'Why download the APK directly instead of Play Store?',
      answer: 'To protect community sovereignty from corporate censorship, Connify is fully decentralized. The direct APK provides full Bluetooth mesh hardware permissions restricted by traditional app stores.'
    },
    {
      question: 'Is installing a third-party APK file secure?',
      answer: 'Yes. Every release on Connify is open-source and signed cryptographically by the Consensus Council. You can verify the integrity of your file with our SHA-256 validator below.'
    },
    {
      question: 'How does Local Mesh Sharing work?',
      answer: 'If you are off-grid with neighbors, you can share the APK binary directly over local Bluetooth or Wi-Fi Direct without needing an internet connection.'
    }
  ];

  return (
    <section id="download-apk" className="space-y-16 py-10">
      
      {/* Opera Style Banner Showcase */}
      <div className="bg-[#0f111a] border border-white/10 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/30">
              <Smartphone className="h-4 w-4 text-rose-500" />
              <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">
                OFFICIAL ANDROID STABLE RELEASE
              </span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-none tracking-tight">
              Get Connify for <span className="text-rose-500">Android</span>
            </h1>

            <p className="font-sans text-slate-300 text-base sm:text-lg leading-relaxed">
              Install the self-sovereign mobile client directly. Off-grid mesh support, zero central tracking logs, and background escort alerts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={handleDownload}
                className="py-4 px-8 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(225,29,72,0.4)] transition-all cursor-pointer flex items-center justify-center space-x-3 group uppercase tracking-wider"
              >
                <Download className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                <span>{downloadStarted ? 'DOWNLOAD STARTED...' : `DOWNLOAD APK (${apkSpecs.fileSize})`}</span>
              </button>
            </div>
          </div>

          {/* Specs Details Panel */}
          <div className="lg:col-span-5">
            <div className="glass-card-glow rounded-2xl p-6 border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-slate-400 uppercase font-bold">RELEASE CHECKSUM</span>
                <span className="text-emerald-400 font-bold">{apkSpecs.version}</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Release Date:</span>
                  <span className="text-white font-bold">{apkSpecs.releaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Android:</span>
                  <span className="text-white font-bold">{apkSpecs.minAndroid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Architectures:</span>
                  <span className="text-white font-bold">{apkSpecs.architectures}</span>
                </div>
              </div>

              <div className="bg-[#090a0f] p-3 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>SHA-256 HASH</span>
                  <button onClick={handleCopyHash} className="text-rose-400 hover:underline cursor-pointer flex items-center gap-1">
                    {copiedHash ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
                <div className="text-[10px] text-slate-300 break-all">{apkSpecs.sha256}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SHA-256 Checksum Verification Tool */}
      <div className="max-w-4xl mx-auto bg-[#090a0f] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Key className="h-4 w-4" />
            <span>INTEGRITY VERIFICATION TOOL</span>
          </span>
          <h3 className="font-display font-bold text-xl text-white">SHA-256 Checksum Validator</h3>
          <p className="font-sans text-xs text-slate-400">
            Paste the SHA-256 hash of your downloaded file to confirm binary authenticity against the consensus ledger.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputHash}
            onChange={(e) => {
              setInputHash(e.target.value);
              setValidationResult('idle');
            }}
            placeholder="Paste downloaded APK SHA-256 hash here..."
            className="flex-1 bg-[#12141d] border border-white/10 rounded-xl p-3.5 text-xs text-white font-mono focus:border-rose-500 outline-none"
          />

          <button
            onClick={handleValidateHash}
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-all cursor-pointer uppercase shrink-0"
          >
            VALIDATE CHECKSUM
          </button>
        </div>

        {validationResult === 'valid' && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>AUTHENTIC BINARY: SHA-256 hash matches official Connify v1.4.2 consensus build!</span>
          </div>
        )}

        {validationResult === 'invalid' && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>HASH MISMATCH: Provided hash does not match official release certificate.</span>
          </div>
        )}
      </div>

      {/* Installation Guide & FAQs */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* Step-by-Step Installation Accordion */}
        <div className="glass-card-glow rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="font-display font-bold text-lg text-white">3-Step Installation Guide</h3>
          <div className="space-y-4">
            {installationSteps.map((step, idx) => (
              <div key={idx} className="bg-[#090a0f] p-4 rounded-xl border border-white/10 space-y-1">
                <h4 className="font-display font-bold text-sm text-rose-400">{step.title}</h4>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="glass-card-glow rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="font-display font-bold text-lg text-white">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqItems.map((faq, idx) => (
              <div key={idx} className="bg-[#090a0f] p-4 rounded-xl border border-white/10 space-y-1.5">
                <h4 className="font-display font-bold text-xs text-white flex justify-between">
                  <span>{faq.question}</span>
                </h4>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
