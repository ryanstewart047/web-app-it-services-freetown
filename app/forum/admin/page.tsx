'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForum } from '../layout';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string;
  isOnline: boolean;
  lastSeen: string;
  active: boolean;
  role: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user } = useForum();
  const router = useRouter();
  
  const [users, setUsers] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Broadcast State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, tempPassword?: string } | null>(null);

  useEffect(() => {
    // Basic verification - redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/forum');
      return;
    }

    if (user?.role === 'admin') {
       fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forum/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.technicians);
      } else {
        setError('Failed to fetch user list or unauthorized.');
      }
    } catch (e) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/forum/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, active: !currentStatus })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotification({ type: 'success', message: `User ${!currentStatus ? 'Unblocked' : 'Blocked'} successfully.` });
        setUsers(users.map(u => u.id === userId ? { ...u, active: !currentStatus } : u));
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update user status.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error occurred.' });
    }
    
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you absolutely sure you want to PERMANENTLY delete this user? This cannot be undone.')) return;
    
    try {
      const res = await fetch('/api/forum/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotification({ type: 'success', message: 'User deleted successfully.' });
        setUsers(users.filter(u => u.id !== userId));
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to delete user.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error occurred.' });
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this users password?')) return;
    
    try {
      const res = await fetch('/api/forum/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotification({ 
          type: 'success', 
          message: `Password reset successfully. Please copy it and share securely.`, 
          tempPassword: data.temporaryPassword 
        });
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to reset password.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error occurred.' });
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

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBroadcast(true);
    setNotification(null);
    
    try {
      // 1. Upload Images if any
      const imageUrls: string[] = [];
      for (const file of files) {
         const b64 = await toBase64(file);
         const upRes = await fetch('/api/forum/upload', {
            method: 'POST',
            body: JSON.stringify({ base64Data: b64, fileName: file.name }),
            headers: { 'Content-Type': 'application/json' }
         });
         const upData = await upRes.json();
         if (upData.success) imageUrls.push(upData.url);
      }

      // 2. Dispatch Broadcast
      const res = await fetch('/api/forum/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: broadcastTitle, content: broadcastContent, images: imageUrls })
      });
      
      if (res.ok) {
        setShowBroadcastModal(false);
        setBroadcastTitle('');
        setBroadcastContent('');
        setFiles([]);
        setNotification({ type: 'success', message: 'Broadcast published successfully to the forum.' });
      } else {
        const errorData = await res.json();
        setNotification({ type: 'error', message: errorData.error || 'Failed to broadcast message.' });
      }
    } catch {
       setNotification({ type: 'error', message: 'Network error occurred.' });
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="text-center mt-32">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin mx-auto mb-6"></div>
        <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Authorizing Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 font-sans space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight flex items-center gap-3">
               <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               Administrator Hub
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage network access, technician identity, and global directives.</p>
         </div>
         <button 
           onClick={() => setShowBroadcastModal(true)}
           className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg transition-all shadow-lg shadow-red-500/20 w-fit flex items-center gap-2 border border-red-500/50"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
           Dispatch Broadcast
         </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl border font-medium text-sm flex flex-col gap-2 ${notification.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          <div className="flex items-center gap-3">
             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {notification.type === 'success' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
             </svg>
             {notification.message}
          </div>
          {notification.tempPassword && (
             <div className="bg-black/30 p-3 rounded-lg flex justify-between items-center border border-green-500/20 mt-1">
                <code className="text-green-300 font-mono text-lg tracking-wider">{notification.tempPassword}</code>
                <span className="text-xs uppercase tracking-widest opacity-60">Temporary Cipher</span>
             </div>
          )}
        </div>
      )}

      {error ? (
        <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-xl text-red-400 text-center font-medium">
           {error}
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-sm text-slate-400">
               <thead className="bg-slate-800/80 text-xs uppercase font-bold tracking-widest text-slate-300 border-b border-slate-700/50">
                  <tr>
                     <th className="px-6 py-4">Technician</th>
                     <th className="px-6 py-4">System Identity</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Administrative Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50">
                  {users.map(u => (
                     <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                                 {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                 <div className="text-white font-bold">{u.name} {u.id === user.id && <span className="text-xs text-red-500 ml-2 uppercase tracking-wide px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">(You)</span>}</div>
                                 <div className="text-xs text-slate-500">{u.expertise}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                           <div className="text-slate-300">{u.email}</div>
                           <div className="text-slate-500">{u.phone || 'No direct comms'}</div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest border ${u.active ? (u.isOnline ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-700/50 text-slate-300 border-slate-600/50') : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                              {u.active ? (
                                 <>
                                    <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-green-400 animate-pulse ring-2 ring-green-400/30' : 'bg-slate-500'}`}></span>
                                    {u.isOnline ? 'Active Link' : 'Offline'}
                                 </>
                              ) : (
                                 'Suspended'
                              )}
                           </span>
                        </td>
                        <td className="px-6 py-4 flex justify-end gap-2">
                           <button onClick={() => handleResetPassword(u.id)} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 rounded text-blue-400 border border-slate-600 transition-colors mr-2">Reset PRTCl</button>
                           {u.id !== user.id && (
                              <>
                                 <button onClick={() => handleToggleBlock(u.id, u.active)} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-colors ${u.active ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30'}`}>
                                    {u.active ? 'Block' : 'Unblock'}
                                 </button>
                                 <button onClick={() => handleDeleteUser(u.id)} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-red-900/30 hover:bg-red-800/50 rounded text-red-500 border border-red-500/30 transition-colors">
                                    Purge
                                 </button>
                              </>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {users.length === 0 && (
               <div className="p-8 text-center text-slate-500">No technicians found in the registry.</div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-[#04091a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-red-500/30 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-red-500/10 relative">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="border-b border-slate-800 px-6 py-5 flex justify-between items-center bg-slate-900/80 z-10">
              <h2 className="text-lg font-bold text-red-400 tracking-wide uppercase flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                Issue Global Directive
              </h2>
              <button onClick={() => setShowBroadcastModal(false)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleBroadcast} className="px-6 py-5 flex-1 overflow-y-auto space-y-5 z-10">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Subject Header</label>
                <input required type="text" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg focus:border-red-500 focus:ring-red-500 shadow-inner px-4 py-3 text-white border" placeholder="MAINTENANCE SCHEDULE REVISION..." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Directive Contents</label>
                <textarea required rows={5} value={broadcastContent} onChange={e => setBroadcastContent(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg focus:border-red-500 focus:ring-red-500 shadow-inner px-4 py-3 text-white border" placeholder="All nodes must comply with the new security regulations..."></textarea>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Attach Official Documentation (Max 2)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={e => setFiles(e.target.files ? Array.from(e.target.files).slice(0, 2) : [])}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-red-600/20 file:text-red-400 hover:file:bg-red-600/30 transition-colors file:cursor-pointer"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowBroadcastModal(false)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 bg-transparent border border-slate-700 hover:border-slate-500 rounded-lg transition-all">Cancel</button>
                <button type="submit" disabled={submittingBroadcast} className="px-5 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20">
                   {submittingBroadcast && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                   {submittingBroadcast ? 'TRANSMITTING...' : 'DISPATCH TO ALL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
