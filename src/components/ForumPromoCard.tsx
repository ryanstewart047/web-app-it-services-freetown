'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Sparkles, ChevronRight, X } from 'lucide-react';

const FORUM_PROMO_ENABLED = false;
const SHOW_DELAY_MS = 10000;
const MIN_VISIBLE_MS = 5000;
const EXIT_ANIMATION_MS = 500;

export default function ForumPromoCard() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isForumPage = pathname === '/forum' || pathname?.startsWith('/forum/');

  const dismissPromo = () => {
    setVisible(false);

    window.setTimeout(() => {
      setDismissed(true);
      sessionStorage.setItem('forum_promo_dismissed', '1');
    }, EXIT_ANIMATION_MS);
  };

  useEffect(() => {
    if (!FORUM_PROMO_ENABLED) {
      setVisible(false);
      return;
    }

    if (isForumPage) {
      setVisible(false);
      return;
    }

    const wasDismissed = sessionStorage.getItem('forum_promo_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isForumPage]);

  useEffect(() => {
    if (!FORUM_PROMO_ENABLED) return;
    if (!visible || isForumPage) return;

    const autoDismissTimer = window.setTimeout(() => {
      setVisible(false);

      window.setTimeout(() => {
        setDismissed(true);
        sessionStorage.setItem('forum_promo_dismissed', '1');
      }, EXIT_ANIMATION_MS);
    }, MIN_VISIBLE_MS);

    return () => clearTimeout(autoDismissTimer);
  }, [visible, isForumPage]);

  if (!FORUM_PROMO_ENABLED || isForumPage || dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissPromo();
  };

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 z-[90] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-16 scale-95 pointer-events-none'
      }`}
    >
      <div className="group relative max-w-xs w-72 sm:w-80">
        {/* Glow backdrop */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-[#040e40] rounded-3xl blur-lg opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
        
        {/* Solid container with red and #040e40 gradient */}
        <div className="relative bg-[#040e40] bg-gradient-to-br from-red-950 via-[#040e40] to-[#020724] border-2 border-red-500/40 hover:border-red-500/80 rounded-3xl p-5.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-300">
          {/* Header row with glowing status dot & close button */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-white/20 rounded-full shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white drop-shadow">Live Forum</span>
            </div>

            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-all shadow-md"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Body Content */}
          <Link href="/forum/auth/register" className="block text-left group/link">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-xl shadow-red-600/40 border border-white/30 group-hover/link:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="font-black text-lg text-white tracking-tight flex items-center gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="text-white">SL-Tech-Stack</span>
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse flex-shrink-0" />
                </h4>
                <p className="text-xs font-bold text-white line-clamp-3 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
                  Join Sierra Leone&apos;s active developer & tech repair community. Ask questions & share expertise!
                </p>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="mt-5 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 hover:from-red-500 to-blue-700 hover:to-blue-600 text-white font-black text-xs rounded-xl shadow-lg shadow-black/50 transition-all group-hover/link:shadow-red-500/30 border border-white/30 uppercase tracking-wider">
              <span className="text-white">Join Community Portal</span>
              <ChevronRight className="w-4 h-4 text-white group-hover/link:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
