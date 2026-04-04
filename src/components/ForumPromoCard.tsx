'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ForumPromoCard() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const isForumPage = pathname === '/forum' || pathname?.startsWith('/forum/');

  // ALL hooks must be called unconditionally — before any early returns
  useEffect(() => {
    if (isForumPage) return;

    const wasDismissed = sessionStorage.getItem('forum_promo_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, [isForumPage]);

  // Early return AFTER all hooks
  if (isForumPage || dismissed) return null;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      sessionStorage.setItem('forum_promo_dismissed', '1');
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-4 sm:right-6 z-50 transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      {minimized ? (
        /* Minimized pill */
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl shadow-blue-500/40 border border-blue-400/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          Join Our Technician Forum
        </button>
      ) : (
        /* Full card */
        <div className="w-72 sm:w-80 bg-[#0b1120] border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden ring-1 ring-white/5">

          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          {/* Card body */}
          <div className="p-5">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">SL Tech Stack Forum</p>
                  <p className="text-green-400 text-[10px] font-semibold flex items-center gap-1 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Community is Live
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(true)}
                  className="p-1 text-slate-600 hover:text-slate-400 transition-colors rounded"
                  title="Minimize"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1 text-slate-600 hover:text-slate-400 transition-colors rounded"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Message */}
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Connect with <span className="text-white font-semibold">Sierra Leone's top technicians</span>. Ask questions, share knowledge, and grow your skills — for free.
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 mb-4 bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
              <div className="text-center flex-1">
                <p className="text-white font-black text-lg leading-none">🛠️</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Repair Help</p>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="text-center flex-1">
                <p className="text-white font-black text-lg leading-none">💡</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Tech Tips</p>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="text-center flex-1">
                <p className="text-white font-black text-lg leading-none">🤝</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">Network</p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex gap-2">
              <Link
                href="/forum/auth/register"
                className="flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-blue-500/25 border border-blue-400/20"
              >
                Join Now — Free
              </Link>
              <Link
                href="/forum"
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-all"
              >
                Browse
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
