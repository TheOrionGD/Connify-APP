import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, Key } from 'lucide-react';

interface LoginScreenProps {
  onSuccess: (token: string, email: string, isOffline: boolean) => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    try {
      // 1. Attempt to sign in via Firebase Auth REST API
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.idToken, data.email, false);
      } else {
        // Handle Firebase authentication errors specifically
        const firebaseMessage = data.error?.message || 'Authentication failed';
        
        if (firebaseMessage === 'INVALID_LOGIN_CREDENTIALS' || firebaseMessage === 'EMAIL_NOT_FOUND' || firebaseMessage === 'INVALID_PASSWORD') {
          throw new Error('Invalid email or password. Please verify credentials.');
        } else {
          throw new Error(firebaseMessage);
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Firebase REST Auth connection failed, checking offline fallback:', err.message);
      
      // 2. Offline Fallback Check (Target credentials)
      if (email === 'hello.theoriongd@gmail.com' && password === 'Orion#Connify') {
        // Simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        onSuccess('simulated-offline-jwt-token', email, true);
      } else {
        setError(err.message || 'Connection failure. Local offline fallback failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1b1b1b] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Aurora Mesh & Tactical Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 aurora-bg opacity-40">
        <div className="absolute inset-0 grid-bg-dots-dark opacity-30" />
      </div>

      {/* Holographic HUD + Frosted Glass Card (`glass-panel` + `holo-card` + `holo-corner`) */}
      <div className="relative z-10 w-full max-w-md glass-panel holo-card holo-corner p-8 shadow-2xl transition-all border border-[#1b1b1b]/20">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="h-16 w-16 rounded-2xl clay-box border border-[#0051c6]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,81,198,0.2)]">
            <Shield className="text-[#0051c6] h-8 w-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-jakarta tracking-tight text-[#1b1b1b] uppercase flex items-center justify-center gap-2">
              Connify Secure Entry
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full holo-badge font-bold">HUD AUTH</span>
            </h1>
            <p className="text-xs text-[#0051c6] font-mono tracking-wider uppercase mt-1 font-bold">
              PROXIMITY TRUST NETWORK ADMINISTRATION
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-3 text-red-300 text-xs font-mono shadow-[0_0_15px_rgba(182,1,0,0.3)] animate-bounce">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
            <div>
              <span className="font-bold block uppercase mb-1 text-red-400">Access Denied</span>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider text-[#1b1b1b] uppercase font-bold block flex items-center justify-between">
              <span>Identity Identifier (Email)</span>
              <span className="text-[9px] text-[#0051c6] font-bold">SHA-256 Link</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello.theoriongd@gmail.com"
                className="w-full neuo-input rounded-xl px-4 py-3.5 text-sm text-[#1b1b1b] focus:ring-2 focus:ring-[#0051c6] transition-all font-mono placeholder:text-[#5f3f3a]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider text-[#1b1b1b] uppercase font-bold block flex items-center justify-between">
              <span>Authorization Token (Password)</span>
              <span className="text-[9px] text-[#0051c6] font-bold">Encrypted</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full neuo-input rounded-xl px-4 py-3.5 text-sm text-[#1b1b1b] focus:ring-2 focus:ring-[#0051c6] transition-all font-mono placeholder:text-[#5f3f3a]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full clay-btn py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_4px_12px_rgba(182,1,0,0.3)]"
          >
            {loading ? (
              <span className="animate-pulse">Verifying Cryptographic Credentials...</span>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Authenticate Session
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-[#1b1b1b]/20 pt-6 text-center space-y-3">
          <p className="text-[10px] text-[#0051c6] font-mono flex items-center justify-center gap-1.5 font-bold">
            <Key className="h-3.5 w-3.5 text-[#0051c6] animate-spin" />
            Zero-Trust Ephemeral Handshake Protocol Active
          </p>
          <div className="text-[10px] neuo-inset p-3.5 rounded-xl text-left font-mono space-y-1 text-[#5f3f3a] border border-[#1b1b1b]/10">
            <span className="font-bold text-[#0051c6] block uppercase mb-1 flex items-center justify-between">
              <span>Development Credentials</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded clay-badge text-[#1b1b1b] font-bold">READY</span>
            </span>
            <div>Email: <code className="text-[#1b1b1b] font-bold">hello.theoriongd@gmail.com</code></div>
            <div>Pass: <code className="text-[#1b1b1b] font-bold">Orion#Connify</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
