'use client';

import React, { useEffect, useState, useRef, createContext, useContext, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export const ForumContext = createContext<any>(null);

export function useForum() {
  return useContext(ForumContext);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.includes('/auth/');
  const isAdminRoute = pathname.includes('/admin');
  const isTermsPage = pathname === '/forum/terms';
  const isExemptFromAuthRedirect = isAuthPage || isAdminRoute || isTermsPage;

  // Shared ref so heartbeat + inactivity tracker both read the same activity clock
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    let mounted = true;
    const fetchAuth = async () => {
      try {
        const res = await fetch('/api/forum/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.authenticated) {
            setUser(data.user);
            
            // Redirect to terms if not accepted and not already there
            if (!data.user.termsAccepted && !isTermsPage && !isAdminRoute) {
               router.push('/forum/terms');
            }
          } else if (!isExemptFromAuthRedirect && mounted) {
            router.push('/forum/auth/login');
          }
        } else if (!isExemptFromAuthRedirect && mounted) {
          router.push('/forum/auth/login');
        }
      } catch (e) {
        if (!isExemptFromAuthRedirect && mounted) router.push('/forum/auth/login');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAuth();

    // Heartbeat: only pings the server if the user was active in the last 6 minutes.
    // This means an idle user's lastSeen goes stale naturally and admin panel shows them offline.
    const heartbeatInterval = setInterval(async () => {
       try {
         const idleSoFar = Date.now() - lastActivityRef.current;
         if (idleSoFar >= 11 * 60 * 1000) return; // skip heartbeat when idle

         const res = await fetch('/api/forum/heartbeat', { method: 'GET' });
         if (res.status === 401 && mounted && !isExemptFromAuthRedirect) {
           const data = await res.json();
           if (data.requirePasswordChange) {
             setUser(null);
             router.push('/forum/auth/login');
           }
         }
       } catch (err) {}
    }, 90 * 1000); // every 90 seconds

    return () => {
      mounted = false;
      clearInterval(heartbeatInterval);
    };
  }, [pathname, isAuthPage, router]);

  // Inactivity Auto-Logout Tracker (5 Minutes)
  useEffect(() => {
    if (!user) return;

    let hasTriggeredLogout = false;
    const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, resetActivity));

    const checkInactivity = setInterval(() => {
      if (hasTriggeredLogout) return;

      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_LIMIT_MS) {
        hasTriggeredLogout = true;
        fetch('/api/forum/auth/logout', { method: 'POST' }).then(() => {
          setUser(null);
          router.push('/forum/auth/login?reason=inactivity');
        });
      }
    }, 15000); // audit every 15 seconds

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, resetActivity));
      clearInterval(checkInactivity);
    };
  }, [user, router]);

  // Notification Registration Logic
  const registerPush = useCallback(async (fromUserGesture = false) => {
    if (!user || typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
      return;
    }

    try {
      // 1. Get Public Key
      const keyRes = await fetch('/api/forum/notifications/vapid-public-key');
      const { publicKey } = await keyRes.json();
      if (!publicKey) return;

      // 2. Register Service Worker (if not already handled by layout)
      const registration = await navigator.serviceWorker.ready;

      // 3. Request Permission & Subscribe
      const currentPermission = Notification.permission;
      
      // If not from gesture and permission is default, show our internal banner instead
      if (!fromUserGesture && currentPermission === 'default') {
        setShowNotificationPrompt(true);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        // 4. Send to backend
        await fetch('/api/forum/notifications/subscribe', {
          method: 'POST',
          body: JSON.stringify({ subscription }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Mobile notifications active.');
        setShowNotificationPrompt(false);
      }
    } catch (err) {
      console.error('Push registration failed:', err);
    }
  }, [user]);

  useEffect(() => {
    // Delay slightly to check current state
    const timer = setTimeout(() => registerPush(false), 2000);
    return () => clearTimeout(timer);
  }, [registerPush]);

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
  if (isAuthPage || pathname.includes('/verify') || pathname.includes('/admin/login')) {
    return <ForumContext.Provider value={{ user, setUser }}>{children}</ForumContext.Provider>;
  }

  return (
    <ForumContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-[#04091a] text-slate-300 flex flex-col relative overflow-hidden font-sans">
        
        {/* Dynamic Background Blurs */}
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
        <div className="absolute bottom-1/4 right-0 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

        {/* Sticky Container for Banner + Header */}
        <div className="sticky top-0 z-[1000] flex flex-col">
          {/* Notification Opt-in Banner */}
          {showNotificationPrompt && user && (
            <div className="bg-blue-700/95 backdrop-blur-md border-b border-blue-400/30 px-4 py-3 shadow-2xl animate-in slide-in-from-top duration-500">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔔</span>
                  <p className="text-sm font-medium text-blue-100 leading-tight">
                    <span className="font-bold">Enable Forum Notifications?</span> Get real-time alerts on your phone for new posts and replies.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => registerPush(true)}
                    className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-blue-500/20 transition-all uppercase tracking-wider"
                  >
                    Enable Now
                  </button>
                  <button
                    onClick={() => setShowNotificationPrompt(false)}
                    className="text-blue-300 hover:text-white text-xs font-semibold px-2 py-2"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          )}

          <header className="bg-[#0b1120]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 sm:h-20 items-center">
              
              {/* Left: Logo + Main Site */}
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href="/forum" className="flex-shrink-0 transition-transform hover:scale-105">
                  <Image
                    src="/assets/forum-logo.svg"
                    alt="Technicians Forum Logo"
                    width={240}
                    height={80}
                    className="h-12 sm:h-16 w-auto object-contain"
                    priority
                  />
                </Link>

                <div className="hidden sm:block border-l border-slate-700/50 pl-6">
                  <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <i className="fas fa-home"></i> Main Site
                  </Link>
                </div>
              </div>

              {/* Right: User Info + Nav */}
              {user && (
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Desktop user name */}
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

                  {/* Avatar */}
                  <div className="relative">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt="Profile" className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20" />
                    ) : (
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-bold ring-2 ring-blue-500/30">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Mobile online dot */}
                    <span className="sm:hidden absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0b1120]"></span>
                  </div>
                  
                  {/* Desktop Nav Links */}
                  <div className="hidden sm:flex items-center gap-1 ml-1 pr-2 border-l border-slate-700/50 pl-3">
                    {user.role === 'admin' && (
                       <Link 
                         href="/forum/admin"
                         className="px-3 py-1.5 text-xs font-bold text-red-500 hover:text-white hover:bg-red-500/20 rounded-lg transition-all uppercase"
                       >
                         ADMIN HUB
                       </Link>
                    )}
                    <Link 
                      href="/forum/settings"
                      className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all uppercase"
                    >
                      SETTINGS
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      LOGOUT
                    </button>
                  </div>

                  {/* Mobile Hamburger */}
                  <button
                    onClick={() => setMobileMenuOpen(o => !o)}
                    className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    aria-label="Menu"
                  >
                    {mobileMenuOpen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && user && (
            <div className="sm:hidden bg-[#0d1526]/95 backdrop-blur-xl border-t border-slate-800 px-4 py-3 space-y-1">
              <div className="flex items-center gap-3 px-2 py-2 mb-2 border-b border-slate-800">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-green-400 font-medium">● Online</p>
                </div>
              </div>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <i className="fas fa-home w-4 text-center"></i> Main Site
              </Link>
              {user.role === 'admin' && (
                <Link href="/forum/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-all">
                  <i className="fas fa-shield-halved w-4 text-center"></i> Admin Hub
                </Link>
              )}
              <Link href="/forum/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                <i className="fas fa-gear w-4 text-center"></i> Settings
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left">
                <i className="fas fa-right-from-bracket w-4 text-center"></i> Logout
              </button>
            </div>
          )}
        </header>
      </div>
        
        <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:py-10 relative z-10 px-3 sm:px-4 lg:px-8">
          {children}
        </main>
      </div>
    </ForumContext.Provider>
  );
}
