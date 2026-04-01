'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForumAdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forum/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        router.push('/forum/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid master transmission cipher.');
      }
    } catch {
      setError('Network communication unestablished.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans px-4">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/30 p-8 md:p-12 w-full max-w-md relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider">Admin Hub</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium tracking-wide">Enter Master Clearance Cipher</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center font-medium relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Clearance Cipher</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl focus:border-red-500 focus:ring-red-500 shadow-inner px-4 py-4 text-white font-mono placeholder-slate-600 transition-colors"
              placeholder="••••••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !password}
            className="w-full px-6 py-4 text-xs font-bold uppercase tracking-widest rounded-xl text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/30 flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Initiate Override'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center relative z-10">
          <Link href="/forum" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
            Return to Public Feed
          </Link>
        </div>
      </div>
    </div>
  );
}
