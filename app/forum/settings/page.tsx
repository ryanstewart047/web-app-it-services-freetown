'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForum } from '../layout';

export default function SettingsPage() {
  const { user, setUser } = useForum();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [deletePassword, setDeletePassword] = useState('');
  const [status, setStatus] = useState<{type: 'error' | 'success', message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      let b64 = null;
      let fName = null;
      if (photoFile) {
        b64 = await toBase64(photoFile);
        fName = photoFile.name;
      }

      const res = await fetch('/api/forum/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           newPassword: password || undefined,
           photoData: b64,
           fileName: fName
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Profile updated successfully.' });
        setPassword('');
        setPhotoFile(null);
        if (data.user) setUser(data.user);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to update profile.' });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: 'Network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you absolutely sure you want to delete your Technician profile? This is irreversible.')) return;
    
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/forum/auth/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(null);
        router.push('/forum/auth/login');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to delete account.' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Network error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-8 font-sans pb-12">
      <Link href="/forum" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors w-fit bg-blue-900/10 px-4 py-2 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-900/20">
        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Return to Dashboard
      </Link>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <h1 className="text-3xl font-extrabold text-white mb-2 leading-tight tracking-tight relative z-10">System Preferences</h1>
        <p className="text-slate-400 text-sm mb-8">Manage your identity, security credentials, and network access.</p>

        {status && (
          <div className={`p-4 rounded-lg mb-8 border font-medium text-sm flex items-center gap-3 relative z-10 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               {status.type === 'success' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
            </svg>
            {status.message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10 border-b border-slate-700/50 pb-10">
          
          {/* Avatar Section */}
          <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Identity Matrix (Avatar)</h3>
             <div className="flex items-center gap-6">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Current profile" className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-blue-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                   <label className="block text-sm text-slate-400 mb-2 font-medium">Upload new optical identifier</label>
                   <input 
                     type="file" 
                     accept="image/*" 
                     onChange={handlePhotoChange}
                     className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-colors file:cursor-pointer"
                   />
                </div>
             </div>
          </div>

          {/* Password Update */}
          <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security Passphrase</h3>
             <label className="block text-sm text-slate-400 mb-2 font-medium">Set a new transmission passphrase (leave blank to keep current)</label>
             <input
                type="password"
                className="w-full bg-slate-900 border-slate-700 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-inner px-4 py-3 text-white border font-mono text-lg"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
          </div>

          <div className="flex justify-end">
             <button type="submit" disabled={loading} className="px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400/30 flex items-center gap-2">
                {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Commit Protocol Changes
             </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="pt-10 relative z-10">
           <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             Critical Danger Zone
           </h3>
           <p className="text-slate-400 text-sm mb-6">Executing this command will permanently obliterate your profile from the database network.</p>
           
           <form onSubmit={handleDeleteAccount} className="bg-red-500/5 p-6 rounded-xl border border-red-500/30 space-y-4">
              <div>
                <label className="text-xs font-bold text-red-400/80 uppercase tracking-widest block mb-1.5 ml-1">Confirm Current Passphrase</label>
                <input
                  type="password" required
                  className="w-full bg-slate-900 border-red-500/30 focus:border-red-500 rounded-lg focus:ring-red-500 shadow-inner px-4 py-3 text-white border font-mono"
                  placeholder="Enter passphrase to authorize termination"
                  value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading || !deletePassword} className="px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20 border border-red-400/30">
                   Terminate Account
                </button>
              </div>
           </form>
        </div>

      </div>
    </div>
  );
}
