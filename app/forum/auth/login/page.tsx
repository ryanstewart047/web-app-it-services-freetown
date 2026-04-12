'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForum } from '../../ForumLayoutClient';

type View = 'login' | 'forgot' | 'forgot-sent';

export default function Login() {
  const router = useRouter();
  const { setUser } = useForum();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password state
  const [view, setView] = useState<View>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Two-step Email verification state
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [inactivityBanner, setInactivityBanner] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reason') === 'inactivity') {
      setInactivityBanner(true);
    }
    // Restore remembered email if it exists
    const saved = localStorage.getItem('forum_remembered_email');
    if (saved) setEmail(saved);
  }, [searchParams]);

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
        // Persist email if Remember Me is checked
        if (rememberMe) {
          localStorage.setItem('forum_remembered_email', email);
        } else {
          localStorage.removeItem('forum_remembered_email');
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
              <div className="flex justify-center mb-5">
                <Image
                  src="/assets/forum-logo.png"
                  alt="Technicians Forum"
                  width={160}
                  height={54}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
                Secure Portal
              </h2>
              <p className="mt-2 text-sm text-slate-400 font-medium">
                Authorized Technicians Only.{' '}
                <Link href="/forum/auth/register" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  Request Access
                </Link>
              </p>
            </div>

            <form className="space-y-5" onSubmit={emailVerified ? handleLogin : handleVerifyEmail}>
              {/* Inactivity logout banner */}
              {inactivityBanner && (
                <div className="bg-amber-500/10 border border-amber-500/40 text-amber-300 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span>
                    <strong className="block text-amber-200 mb-0.5">Session Expired</strong>
                    You were logged out due to inactivity. Please sign in again to continue.
                  </span>
                </div>
              )}

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
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner font-mono text-lg"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>

                    {/* Remember Me */}
                    <label className="flex items-center gap-2.5 cursor-pointer mt-1 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                      />
                      <span className="text-xs text-slate-400 font-medium">Remember my email on this device</span>
                    </label>
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
