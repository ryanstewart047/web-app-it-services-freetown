'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForum } from '../../layout';

type View = 'login' | 'forgot' | 'forgot-sent';

export default function Login() {
  const router = useRouter();
  const { setUser } = useForum();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [view, setView] = useState<View>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Two-step Email verification state
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingEmail(true);
    setError('');

    try {
      const res = await fetch('/api/forum/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok && data.exists) {
        if (!data.active) {
           setError(data.error || 'Account deactivated. Please contact admin.');
        } else {
           setEmailVerified(true);
           setForgotEmail(email);
        }
      } else {
        setError(data.error || 'Email not found in our database.');
      }
    } catch {
      setError('A network error occurred. Check connection.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forum/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.requirePasswordChange) {
          router.push('/forum/auth/force-change-password');
          return;
        }
        setUser(data.user);
        router.push('/forum');
      } else {
        setError(data.error || 'Login failed. Check your credentials.');
      }
    } catch (e) {
      setError('A network error occurred. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await fetch('/api/forum/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setView('forgot-sent');
      } else {
        setForgotError(data.error || 'Something went wrong. Try again.');
      }
    } catch {
      setForgotError('A network error occurred. Check your connection.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04091a] relative overflow-hidden flex items-center justify-center px-4 font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">

        {/* ─── LOGIN VIEW ─── */}
        {view === 'login' && (
          <div className="p-8 lg:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full mix-blend-screen"></div>
                <svg className="w-8 h-8 text-blue-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
                Secure Portal
              </h2>
              <p className="mt-2 text-sm text-slate-400 font-medium">
                Authorized Technicians Only.{' '}
                <span className="block mt-2">
                  <Link href="/forum/auth/register" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    Request Access
                  </Link>
                  <span className="mx-2 text-slate-600">|</span>
                  <Link href="/forum/admin/login" className="font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider text-xs">
                    <i className="fas fa-shield-halved mr-1"></i> Admin Access
                  </Link>
                </span>
              </p>
            </div>

            <form className="space-y-5" onSubmit={emailVerified ? handleLogin : handleVerifyEmail}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {error}
                </div>
              )}

              {/* Email field — shows entered email as a visible label once filled */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    readOnly={emailVerified}
                    autoComplete="email"
                    className={`w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-4 pr-16 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner ${emailVerified ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                  />
                  {/* Action or verified icon */}
                  {emailVerified ? (
                    <button 
                       type="button" 
                       onClick={() => { setEmailVerified(false); setPassword(''); setError(''); }} 
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-bold hover:text-blue-300"
                    >
                       EDIT
                    </button>
                  ) : (
                    email.includes('@') && email.includes('.') && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" title="Email entered">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </span>
                    )
                  )}
                </div>
                {/* Show the entered email as a readable confirmation only if verified */}
                {emailVerified && (
                  <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Email Verified
                  </p>
                )}
              </div>

              {emailVerified ? (
                <>
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passphrase</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotError('');
                          setView('forgot');
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      autoComplete="current-password"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner font-mono text-lg"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold uppercase tracking-widest rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Signing in…</>
                      ) : (
                        'Sign In to Forum'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={checkingEmail || !email.includes('@')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold uppercase tracking-widest rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
                  >
                    {checkingEmail ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying Email…</>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ─── FORGOT PASSWORD VIEW ─── */}
        {view === 'forgot' && (
          <div className="p-8 lg:p-10">
            <button
              onClick={() => setView('login')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors mb-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Login
            </button>

            <div className="mb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30 flex items-center justify-center shadow-lg mb-5">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password?</h2>
              <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
                Enter your registered email address. If it exists in the system, we'll send a one-time temporary password to it.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleForgotPassword}>
              {forgotError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {forgotError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-inner"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                />
                {forgotEmail.includes('@') && (
                  <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Checking system for <span className="font-bold text-slate-400">{forgotEmail}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold uppercase tracking-widest rounded-lg text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20"
                >
                  {forgotLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying…</>
                  ) : (
                    'Send Temporary Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── CONFIRMATION VIEW ─── */}
        {view === 'forgot-sent' && (
          <div className="p-8 lg:p-10 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full border border-green-500/30 flex items-center justify-center shadow-lg mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-3">Check Your Email</h2>
            <p className="text-slate-400 text-sm mb-2 max-w-sm mx-auto">
              If <span className="font-bold text-white">{forgotEmail}</span> is registered in our system, a temporary password has been sent to that address.
            </p>
            <p className="text-slate-500 text-xs mb-8 max-w-sm mx-auto">
              Use the temporary password to log in, then set a new password when prompted. Check your spam folder if you don't see it within a few minutes.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmail(forgotEmail);
                  setPassword('');
                  setView('login');
                }}
                className="w-full py-3.5 px-4 text-sm font-bold uppercase tracking-widest rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25"
              >
                Back to Login
              </button>
              <p className="text-xs text-slate-600">
                Still having trouble?{' '}
                <span className="text-slate-400 font-semibold">Call us: +23233399391</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
