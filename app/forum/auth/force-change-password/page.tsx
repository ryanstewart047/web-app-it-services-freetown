'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForum } from '../../layout';

export default function ForceChangePassword() {
  const router = useRouter();
  const { setUser } = useForum();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forum/auth/force-change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        router.push('/forum');
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (e) {
      setError('A network error occurred. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04091a] relative overflow-hidden flex items-center justify-center px-4 font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-orange-600/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 bg-slate-900/60 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-2xl p-8 lg:p-10">
        
        <div className="mb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20 mb-6 relative">
             <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full mix-blend-screen"></div>
             <i className="fas fa-key text-red-400 text-2xl relative z-10"></i>
          </div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-300 tracking-tight">
            Action Required
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            You are using a temporary password.<br/>
            Please choose a new, secure passcode to continue.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <i className="fas fa-exclamation-circle shrink-0"></i>
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">New Passphrase</label>
              <input
                type="password" required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-inner font-mono text-lg"
                placeholder="••••••••"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Confirm New Passphrase</label>
              <input
                type="password" required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all shadow-inner font-mono text-lg"
                placeholder="••••••••"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/25"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> SECURING...</>
              ) : (
                'UPDATE PASSPHRASE'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
