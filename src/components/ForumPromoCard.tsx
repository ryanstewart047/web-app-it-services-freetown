'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ForumPromoCard() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isForumPage = pathname === '/forum' || pathname?.startsWith('/forum/');

  useEffect(() => {
    if (isForumPage) return;

    const wasDismissed = sessionStorage.getItem('forum_promo_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [isForumPage]);

  if (isForumPage || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      sessionStorage.setItem('forum_promo_dismissed', '1');
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-20 left-4 sm:left-6 z-[80] transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <div className="group relative">
        <Link
          href="/forum/auth/register"
          className="flex items-center gap-3 bg-[#0b1120] text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/60 hover:border-blue-500/50 transition-all hover:scale-105"
        >
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-tight text-slate-100 leading-none">SL-Tech-Stack</span>
            <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">Join Community</span>
          </div>

          <div className="w-px h-6 bg-slate-700/50 mx-1"></div>
          
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600/20 group-hover:bg-blue-600 transition-colors">
            <i className="fas fa-arrow-right text-[10px] text-blue-400 group-hover:text-white"></i>
          </div>
        </Link>

        {/* Tiny Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
          title="Close"
        >
          <i className="fas fa-times text-[8px]"></i>
        </button>
      </div>
    </div>
  );
}
