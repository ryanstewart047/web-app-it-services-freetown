'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Generates a strong password: uppercase + lowercase + digits + symbol
function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  for (let i = 0; i < 5; i++) pwd.push(all[Math.floor(Math.random() * all.length)]);
  return pwd.sort(() => Math.random() - 0.5).join('');
}

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', expertise: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'error' | 'success', message: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  // Password Strength Logic
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length > 7) score++; // Length 
    if (/[A-Z]/.test(p)) score++; // Uppercase
    if (/[0-9]/.test(p)) score++; // Numbers
    if (/[^A-Za-z0-9]/.test(p)) score++; // Special char
    return score;
  };

  const pScore = getPasswordStrength();
  const strengthLabels = ['WEAK', 'FAIR', 'GOOD', 'STRONG', 'SECURE'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (pScore < 3) throw new Error("Passphrase must be 'GOOD' or higher.");

      const res = await fetch('/api/forum/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setFormData({ name: '', email: '', phone: '', expertise: '', password: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Registration sequence failed.' });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: e.message || 'A network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04091a] relative overflow-hidden flex items-center justify-center px-4 font-sans border-0 m-0 py-8 lg:py-16">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 lg:p-10">
        
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
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
            Terminal Access
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Request Clearance. <br/>
            <Link href="/forum/auth/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider text-xs ml-1">
              Return to Login
            </Link>
          </p>
        </div>

        {status?.type === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full mx-auto flex items-center justify-center mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Request Transmitted</h3>
            <p className="text-green-300 font-medium text-sm leading-relaxed">{status.message}</p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleRegister}>
            {status?.type === 'error' && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {status.message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Technician Identity</label>
                <input
                  type="text" required
                  className="w-full bg-slate-800/50 border border-slate-700/80 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner text-sm"
                  placeholder="Full Name"
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Network Comm (Email)</label>
                <input
                  type="email" required
                  className="w-full bg-slate-800/50 border border-slate-700/80 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner text-sm"
                  placeholder="tech@it-services.com"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Hardware ID (Optional)</label>
                  <input
                    type="tel"
                    className="w-full bg-slate-800/50 border border-slate-700/80 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner text-sm"
                    placeholder="+232 Phone"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Specialization</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-800/50 border border-slate-700/80 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner text-sm"
                    placeholder="e.g. Networking"
                    value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passphrase Sequence</label>
                  <button
                    type="button"
                    onClick={() => {
                      const pwd = generateStrongPassword();
                      setSuggestion(pwd);
                    }}
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Suggest Password
                  </button>
                </div>

                {/* Suggested password pill */}
                {suggestion && suggestion !== formData.password && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, password: suggestion });
                      setSuggestion('');
                    }}
                    className="w-full mb-2 flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/20 transition-all group"
                  >
                    <span className="font-mono text-sm tracking-widest text-left truncate">{suggestion}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 shrink-0 group-hover:text-white">Use this ↵</span>
                  </button>
                )}

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/80 rounded-lg px-4 pr-12 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner font-mono text-lg"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
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
                
                {/* Password Strength Indicator */}
                {formData.password.length > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                     <div className="flex space-x-1.5 w-full mr-4">
                        {[0,1,2,3].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < pScore ? strengthColors[pScore] : 'bg-slate-700'}`}></div>
                        ))}
                     </div>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${pScore > 2 ? 'text-green-400' : pScore > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {strengthLabels[pScore]}
                     </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/50">
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> GENERATING CLEARANCE...</>
                ) : (
                  'SUBMIT REQUEST'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
