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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div></div>;
  }

  if (isAuthPage) {
    return <ForumContext.Provider value={{ user, setUser }}>{children}</ForumContext.Provider>;
  }

  return (
    <ForumContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link href="/forum" className="flex-shrink-0 flex items-center gap-2">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-900 leading-tight">Sierra Leone</span>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest leading-tight">Technician Forum</span>
                  </div>
                </Link>
              </div>

              {user && (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                     <p className="text-sm font-medium text-gray-900">{user.name}</p>
                     <p className="text-xs text-green-600 flex items-center justify-end gap-1">
                       <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                     </p>
                  </div>
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="ml-2 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-7xl mx-auto py-8">
          {children}
        </main>
      </div>
    </ForumContext.Provider>
  );
}
