'use client';

import Link from 'next/link';
import { useState } from 'react';
import { WifiOff, Phone, MapPin, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleRetry = async () => {
    setChecking(true);
    setStatus('idle');

    try {
      // Ping a fast, cache-busted endpoint to confirm real connectivity
      const res = await fetch(`/api/ping?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      });

      if (res.ok || res.status < 500) {
        // Online — hard reload to bypass any cached offline page
        setStatus('success');
        setTimeout(() => {
          window.location.reload();
        }, 400);
      } else {
        setStatus('failed');
      }
    } catch {
      // Still offline
      setStatus('failed');
    } finally {
      setChecking(false);
      // Reset failed status after 3s so user can try again
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl overflow-hidden relative">
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center animate-bounce">
              <WifiOff className="w-12 h-12 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold mb-4 tracking-tight">Offline Mode</h1>
          <p className="text-blue-100/70 mb-8 leading-relaxed">
            You are currently disconnected. Don't worry, ITS Freetown is still here for you. You can still reach us directly!
          </p>

          <div className="space-y-4 mb-10">
            <a 
              href="tel:+23233399391" 
              className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-blue-200/50 font-bold">Call Us Now</p>
                <p className="font-semibold">+232 33 399 391</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-blue-200/50 font-bold">Our Location</p>
                <p className="text-sm font-medium">#1 Regent Highway, Jui Junction</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleRetry}
            disabled={checking || status === 'success'}
            className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:cursor-not-allowed
              ${status === 'failed'  ? 'bg-red-600 hover:bg-red-700 shadow-red-900/40' :
                status === 'success' ? 'bg-green-600 shadow-green-900/40' :
                'bg-blue-600 hover:bg-blue-700 shadow-blue-900/40'}
              text-white`}
          >
            {checking ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Checking connection…
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Connected! Reloading…
              </>
            ) : status === 'failed' ? (
              <>
                <XCircle className="w-5 h-5" />
                Still offline — try again
              </>
            ) : (
              <>
                <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                Try Reconnecting
              </>
            )}
          </button>

          <p className="mt-8 text-[11px] text-white/30 font-medium">
            Some features may be limited until you are back online.
          </p>
        </div>
      </div>
    </div>
  );
}
