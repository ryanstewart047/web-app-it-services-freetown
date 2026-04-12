'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ForumAdminLogin() {
  const [username, setUsername] = useState('');
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
        body: JSON.stringify({ username: username.trim(), password })
      });

      if (res.ok) {
        router.push('/forum/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Authentication failed.');
        // Clear both fields on failure — don't leak which field was wrong
        setPassword('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center font-sans px-4">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-500/30 p-8 md:p-12 w-full max-w-md relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-5">
            <Image
              src="/assets/forum-logo.png"
              alt="Technicians Forum"
              width={280}
              height={94}
              className="h-20 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-wider">Admin Hub</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium tracking-wide">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm text-center font-medium relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10" autoComplete="off">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter admin username"
              autoComplete="off"
              required
              className="w-full bg-slate-800/60 border border-slate-700/60 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoComplete="new-password"
              required
              className="w-full bg-slate-800/60 border border-slate-700/60 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all tracking-wider uppercase text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Authenticating...
              </span>
            ) : 'Access Admin Hub'}
          </button>

          <div className="text-center pt-2">
            <Link href="/forum" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
              ← Return to Forum
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
