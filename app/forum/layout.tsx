'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export const ForumContext = createContext<any>(null);

export function useForum() {
  return useContext(ForumContext);
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.includes('/auth/');

  useEffect(() => {
    let mounted = true;
    const fetchAuth = async () => {
      try {
        const res = await fetch('/api/forum/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.authenticated) {
            setUser(data.user);
          } else if (!isAuthPage && mounted) {
            router.push('/forum/auth/login');
          }
        } else if (!isAuthPage && mounted) {
          router.push('/forum/auth/login');
        }
      } catch (e) {
        if (!isAuthPage && mounted) router.push('/forum/auth/login');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAuth();

    const heartbeatInterval = setInterval(async () => {
       await fetch('/api/forum/heartbeat', { method: 'GET' }).catch(() => {});
    }, 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(heartbeatInterval);
    };
  }, [pathname, isAuthPage, router]);

  const handleLogout = async () => {
    await fetch('/api/forum/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/forum/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#04091a]">
        <div className="flex flex-col items-center">
           <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
           <p className="mt-4 text-blue-400 font-medium tracking-widest animate-pulse">CONNECTING TO NETWORK...</p>
        </div>
      </div>
    );
  }

  // Pure dark background for auth panels without the navbar
  if (isAuthPage || pathname.includes('/verify')) {
    return <ForumContext.Provider value={{ user, setUser }}>{children}</ForumContext.Provider>;
  }

  return (
    <ForumContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-[#04091a] text-slate-300 flex flex-col relative overflow-hidden font-sans">
        
        {/* Dynamic Background Blurs */}
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-0 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

        <header className="sticky top-0 z-50 bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <div className="flex items-center">
                <Link href="/forum" className="flex-shrink-0 flex items-center gap-3 transition-transform hover:scale-105">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-blue-500/20">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">SL Tech Stack</span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] leading-tight">Secure Network</span>
                  </div>
                </Link>
              </div>

              {user && (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                     <p className="text-sm font-bold text-white tracking-wide">{user.name}</p>
                     <p className="text-xs text-green-400 flex items-center justify-end gap-1.5 font-medium tracking-wider">
                       <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                       </span>
                       LIVE
                     </p>
                  </div>
                  <div className="relative">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-bold ring-2 ring-blue-500/30">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="ml-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-7xl mx-auto py-10 relative z-10 px-4">
          {children}
        </main>
      </div>
    </ForumContext.Provider>
  );
}
