import React from 'react';
import { 
  ShieldCheck, Download, QrCode, Code2, Lock, EyeOff, Network, 
  Copy, Github, Calendar, CheckCircle2, Smartphone, Share2, Activity,
  Heart, Check
} from 'lucide-react';
import QRCode from 'react-qr-code';

const AndroidIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997zm11.439-6.3887l1.0964-1.9c.0465-.0806.0189-.1835-.0617-.2301-.0806-.0465-.1836-.019-.2302.0617l-1.1187 1.9388c-1.5835-.7247-3.3853-1.1274-5.297-1.1274-1.9118 0-3.7135.4027-5.297 1.1274l-1.1188-1.9388c-.0466-.0807-.1495-.1082-.2302-.0617-.0806.0466-.1081.1495-.0616.2301l1.0963 1.9c-2.4837 1.36-4.148 3.8643-4.3297 6.8407h21.9022c-.1818-2.9764-1.846-5.4807-4.3298-6.8407z"/>
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className={className}>
    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 22.1 184.2 8.7 257.6c-24 125.1 52.8 243.6 122.9 243.6 24.3 0 35.3-15 67.5-15 32.2 0 42.1 14.8 68.3 14.8 69.8 0 138.8-112.5 138.8-112.5-62.8-26.2-87.1-84.4-87.5-119.8zm-119-142c26.2-31.5 45.4-74.8 40.5-118-36.5 1.5-79.6 24.3-106.8 55.4-21.7 24.7-44.5 69.3-38.6 111.4 41.5 3.2 80-20.3 104.9-48.8z"/>
  </svg>
);

const PlayStoreIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
    <path d="M3.7,2.8C3.3,3.2,3,3.9,3,4.9v14.2c0,1,0.3,1.7,0.7,2.1l0.1,0.1l7.8-7.8v-0.3L3.8,2.7L3.7,2.8z" fill="#03A9F4"/>
    <path d="M15.4,14.6l-3.8-3.8v-0.3l3.8-3.8l0.1,0.1l4.5,2.6c1.3,0.7,1.3,1.9,0,2.6l-4.5,2.6L15.4,14.6z" fill="#FFC107"/>
    <path d="M11.7,11.2L3.7,19.2c0.4,0.4,1,0.5,1.7,0.1l9.9-5.7L11.7,11.2z" fill="#E91E63"/>
    <path d="M11.7,12.8L15.4,9l-9.9-5.7C4.7,2.9,4.2,3,3.7,3.4L11.7,11.2z" fill="#4CAF50"/>
  </svg>
);

export default function DownloadApk() {
  const features = [
    { icon: Code2, title: "Open Source", desc: "100% transparent" },
    { icon: ShieldCheck, title: "End-to-End Encrypted", desc: "Your data stays yours" },
    { icon: EyeOff, title: "No Tracking", desc: "Privacy first" },
    { icon: Network, title: "P2P Mesh & SMS", desc: "Offline & resilient" },
    { icon: Share2, title: "Decentralized", desc: "No central servers" },
  ];

  return (
    <div className="w-full flex justify-center py-2 md:py-4">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <section className="relative w-full max-w-[1150px] rounded-[32px] bg-[#fbfbfa] text-slate-900 p-6 md:p-8 lg:p-10 shadow-[0_20px_80px_-15px_rgba(225,29,72,0.15)] border border-rose-100/60 overflow-hidden font-sans">
        {/* Background ambient glows */}
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10">
        
        {/* TOP SECTION: 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-200 text-[10px] font-bold uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Mobile Release</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 text-[10px] font-bold tracking-wide">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span>v1.4.2 Stable</span>
              </div>
            </div>

            <div className="relative mb-5">
              <h2 className="text-3xl md:text-4xl lg:text-[42px] leading-[1.15] font-extrabold tracking-tight text-slate-900 font-display pr-0 xl:pr-24 relative z-20">
                Get Connify for <br />
                <span className="text-rose-600">Android</span> & iPhone
              </h2>
              
              <div className="hidden xl:flex absolute right-0 top-1 gap-2 pointer-events-none z-10">
                <div className="w-[60px] h-[60px] bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center justify-center border border-slate-50 relative z-20 animate-float-glow">
                  <AndroidIcon className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="w-[52px] h-[52px] bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.06)] flex items-center justify-center border border-slate-50 mt-8 -ml-5 relative z-10 animate-float-glow" style={{ animationDelay: '1s' }}>
                  <AppleIcon className="w-6 h-6 text-slate-900" />
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-[14px] mb-8 leading-relaxed max-w-lg">
              Official secure mobile <strong>client</strong> with end-to-end encryption, P2P Mesh, offline communication, and decentralized identity.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[1rem] shadow-[0_6px_20px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer flex-1">
                  <Download className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-[13px] leading-tight text-white">Download APK</div>
                    <div className="text-rose-200 text-[10px] font-medium">Android (82.8 MB)</div>
                  </div>
                </button>
                
                <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-[1rem] shadow-[0_6px_20px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer flex-1">
                  <Download className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-[13px] leading-tight text-white">Download IPA</div>
                    <div className="text-slate-300 text-[10px] font-medium">iOS (Universal)</div>
                  </div>
                </button>
              </div>
              
              <div className="flex justify-center w-full mt-2">
                <button className="w-full sm:w-[85%] flex items-center justify-center gap-3 px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-[1rem] border border-slate-200 shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer">
                  <PlayStoreIcon className="w-6 h-6 shrink-0" />
                  <div className="text-left">
                    <div className="text-slate-500 text-[10px] font-bold uppercase leading-tight">Get it on</div>
                    <div className="font-bold text-[14px] leading-tight text-slate-900">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative w-full overflow-hidden border-t border-slate-200 pt-6 mt-auto">
              {/* Gradient masks for seamless loop effect */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#fbfbfa] to-transparent z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fbfbfa] to-transparent z-10"></div>
              
              <div className="flex w-max animate-marquee gap-10">
                {[...features, ...features].map((feat, idx) => (
                  <div key={idx} className="flex flex-col items-start gap-1 w-36 shrink-0">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] whitespace-nowrap">
                      <feat.icon className="w-4 h-4 text-rose-500 shrink-0" /> {feat.title}
                    </div>
                    <span className="text-slate-500 text-[10px] whitespace-nowrap">{feat.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE GROUP (Center & Right Columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-7 gap-6 lg:gap-8 xl:gap-10 self-start">
            {/* CENTER COLUMN (QR Code) */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-[1.25rem] border border-rose-100 p-5 shadow-xl shadow-rose-100/60 flex flex-col items-center relative h-full">
                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
                
                <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-5 text-[11px] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Smartphone className="w-3.5 h-3.5" />
                  Scan with your phone
                </div>
                
                <div className="bg-white p-2.5 rounded-[1rem] shadow-sm border border-slate-100 mb-5 relative">
                  <QRCode value="https://connify.dev/download" size={130} level="H" fgColor="#090a0f" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-rose-600 rounded-lg p-1.5 shadow-md border-[1.5px] border-white">
                      <span className="text-white font-tech font-extrabold text-[15px] px-0.5">C</span>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-1 mb-6">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                    <AndroidIcon className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-[13px] text-slate-900">Android APK</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                    <AppleIcon className="w-4 h-4 text-slate-900" />
                    <span className="font-bold text-[13px] text-slate-900">iPhone IPA</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                    <Github className="w-4 h-4 text-slate-900" />
                    <span className="font-bold text-[13px] text-slate-900">GitHub Releases</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 w-full pt-4 border-t border-slate-100 text-[9px] text-slate-500 mt-auto">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span className="leading-tight">Always redirects to the <span className="text-rose-500 font-bold whitespace-nowrap">latest release</span></span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Release Info) */}
            <div className="md:col-span-4">
              <div className="bg-white rounded-[1.25rem] border border-slate-100 p-6 shadow-xl shadow-slate-200/50 flex flex-col h-full">
                <h3 className="text-[11px] font-bold text-slate-900 mb-5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  Release Information
                </h3>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <AndroidIcon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] mb-0.5">Android</h4>
                    <p className="text-slate-500 text-[12px] mb-0.5">Android 8.0 (Oreo) and above</p>
                    <p className="text-slate-500 text-[12px] mb-2.5">Architectures: arm64-v8a, armeabi-v7a, x86_64</p>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100">APK Size: 82.8 MB</span>
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100 mb-6"></div>

                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <AppleIcon className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[15px] mb-0.5">iPhone</h4>
                    <p className="text-slate-500 text-[12px] mb-0.5">iOS 16.0 and above</p>
                    <p className="text-slate-500 text-[12px] mb-2.5">IPA Available</p>
                    <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded border border-rose-100">Universal</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-center gap-2.5">
                  <Github className="w-4 h-4 text-slate-900" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-900">Synced with GitHub Releases</div>
                    <a href="#" className="text-[9px] font-bold text-rose-600 hover:underline">View on GitHub ↗</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Guide, Features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 mt-6 lg:mt-8 xl:mt-10">
          
          {/* Installation Guide */}
          <div className="lg:col-span-6 w-full bg-white rounded-[1.5rem] p-6 xl:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full">
            <h3 className="text-[15px] font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Download className="w-4 h-4 text-rose-500" /> Installation Guide
            </h3>
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-rose-200 before:via-rose-100 before:to-transparent">
              <div className="relative flex items-start gap-4">
                <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 z-10 shadow-sm border-2 border-white">1</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Download or Scan</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">Download the APK / IPA or scan the QR code which redirects to the latest GitHub release.</p>
                </div>
              </div>
              <div className="relative flex items-start gap-4">
                <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 z-10 shadow-sm border-2 border-white">2</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Install the App</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">Allow installation from unknown sources (Android) or install the IPA using your preferred method (iOS).</p>
                </div>
              </div>
              <div className="relative flex items-start gap-4">
                <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 z-10 shadow-sm border-2 border-white">3</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Open Connify</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">Launch the app and follow the onboarding steps.</p>
                </div>
              </div>
              <div className="relative flex items-start gap-4">
                <div className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 z-10 shadow-sm border-2 border-white">4</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Stay Connected</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">Enjoy secure, offline-first communication.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Connify */}
          <div className="lg:col-span-6 bg-gradient-to-br from-rose-50 to-rose-100/60 rounded-[1.5rem] p-6 xl:p-8 border border-rose-100 shadow-xl shadow-rose-200/40 relative overflow-hidden flex flex-col h-full">
            <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-rose-300/30 rounded-full blur-[60px] pointer-events-none"></div>
            
            {/* Left Content */}
            <div className="relative z-10 w-full mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-rose-100 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-rose-500" strokeWidth={2.5} />
                </div>
                <h3 className="text-[18px] font-bold text-slate-900">
                  Why Connify?
                </h3>
              </div>
              <div className="space-y-4 pl-1">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Self-Sovereign</h4>
                    <p className="text-slate-500 text-[11px]">You own your identity and data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Offline First</h4>
                    <p className="text-slate-500 text-[11px]">Works without internet using P2P Mesh & SMS.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Secure by Design</h4>
                    <p className="text-slate-500 text-[11px]">Built with modern cryptography and privacy in mind.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[13px] mb-0.5">Community Driven</h4>
                    <p className="text-slate-500 text-[11px]">Built for the community, by the community.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Phone Mockups */}
            <div className="absolute -right-4 -bottom-10 lg:-right-8 lg:-bottom-12 xl:-bottom-10 flex items-end justify-end pointer-events-none z-10 scale-[0.65] sm:scale-75 md:scale-[0.8] xl:scale-[0.85] origin-bottom-right">
              
              {/* Back Phone (Mesh Network) */}
              <div className="absolute right-8 md:right-28 top-8 md:top-2 w-[150px] h-[320px] bg-[#0f111a] rounded-[2rem] border-[6px] border-[#2a2d3d] shadow-2xl z-0 transform translate-x-8 translate-y-4 -rotate-2">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-[#2a2d3d] rounded-full z-10"></div>
                <div className="h-full w-full bg-[#161926] p-3 flex flex-col items-center relative overflow-hidden rounded-[1.5rem]">
                  <div className="w-full flex justify-between items-center mb-4 pt-3 text-[8px] text-slate-400 font-medium">
                    <span>9:41</span>
                    <div className="flex gap-1"><Network className="w-2.5 h-2.5" /></div>
                  </div>
                  
                  <div className="bg-[#1f2233] w-full rounded-xl p-2.5 flex justify-between items-center mb-6 shadow-inner">
                     <span className="text-rose-500 font-bold text-[8px]">×</span>
                     <span className="text-white text-[9px] font-bold">Mesh Network</span>
                     <span className="text-slate-400 text-[8px]">+</span>
                  </div>

                  {/* Mesh Nodes Diagram */}
                  <div className="relative w-20 h-20 mb-8 opacity-80">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-300 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-slate-300/50 rounded-full"></div>
                    <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-slate-300/50 rounded-full"></div>
                    <div className="absolute top-1/2 -left-1 w-2 h-2 bg-slate-300/50 rounded-full"></div>
                    <div className="absolute top-1/2 -right-1 w-2 h-2 bg-slate-300/50 rounded-full"></div>
                    <svg className="absolute inset-0 w-full h-full text-slate-400/20" style={{ strokeWidth: 1 }}>
                       <line x1="50%" y1="6%" x2="25%" y2="94%" stroke="currentColor"/>
                       <line x1="50%" y1="6%" x2="75%" y2="94%" stroke="currentColor"/>
                       <line x1="25%" y1="94%" x2="75%" y2="94%" stroke="currentColor"/>
                       <line x1="50%" y1="6%" x2="-5%" y2="50%" stroke="currentColor"/>
                       <line x1="50%" y1="6%" x2="105%" y2="50%" stroke="currentColor"/>
                    </svg>
                  </div>
                  
                  <div className="text-center mt-auto mb-3">
                     <div className="text-white text-lg font-bold">12</div>
                     <div className="text-slate-400 text-[7px]">Peers Connected</div>
                  </div>
                  
                  {/* Bottom nav tabs simulation */}
                  <div className="flex gap-2 mb-1 w-full justify-center">
                    <div className="w-4 h-4 bg-slate-800 rounded-md"></div>
                    <div className="w-4 h-4 bg-rose-500/20 rounded-md flex items-center justify-center"><div className="w-2 h-2 bg-rose-500 rounded-full"></div></div>
                    <div className="w-4 h-4 bg-slate-800 rounded-md"></div>
                  </div>
                </div>
              </div>
              
              {/* Front Phone (Connify) */}
              <div className="relative right-0 w-[170px] h-[360px] bg-[#090a0f] rounded-[2.2rem] border-[6px] border-[#1e202e] shadow-2xl z-10 transform -rotate-1">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-[#1e202e] rounded-full z-20"></div>
                <div className="absolute -left-1.5 top-16 w-1 h-6 bg-[#1e202e] rounded-l-md"></div>
                <div className="absolute -left-1.5 top-28 w-1 h-10 bg-[#1e202e] rounded-l-md"></div>
                <div className="absolute -right-1.5 top-24 w-1 h-14 bg-[#1e202e] rounded-r-md"></div>
                <div className="h-full w-full bg-[#161926] p-4 pt-8 flex flex-col items-center relative rounded-[1.7rem] overflow-hidden shadow-inner">
                  <div className="w-full flex justify-between items-center mb-8 text-[9px] text-white font-medium z-10">
                    <span>9:41</span>
                    <div className="flex gap-1"><Activity className="w-2.5 h-2.5" /></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent"></div>
                  
                  <div className="w-14 h-14 bg-rose-600 rounded-[1rem] flex items-center justify-center font-tech text-2xl font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] mb-4 z-10 text-white mt-4 border border-rose-500">C</div>
                  
                  <div className="text-center z-10 mb-8">
                    <div className="font-bold text-[18px] text-white mb-2">Connify</div>
                    <div className="text-[8px] text-slate-400">Secure. Private.<br/>Always Connected.</div>
                  </div>
                  
                  <div className="mt-auto w-full bg-rose-600 hover:bg-rose-500 transition-colors py-2.5 rounded-lg text-[11px] font-bold text-center text-white z-10 mb-2 cursor-pointer shadow-lg shadow-rose-600/30">Get Started</div>
                  <div className="w-1/3 h-1 bg-white/20 rounded-full mt-2 mb-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
}
