'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';

const HOSTINGER_REFERRAL_URL = 'https://www.hostinger.com?REFERRALCODE=0TCITSERVWRL';
const REFERRAL_CODE = '0TCITSERVWRL';
const STORAGE_KEY = 'bridgetech_hostinger_slideup_dismissed';
const DISMISS_DURATION_HOURS = 24;
const INITIAL_DELAY_MS = 4500; // Slide up 4.5 seconds after page load

export default function HostingerSlideUp() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Exclude admin, checkout, and personal surprise reveal pages
  const isExcludedPage =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/cart') ||
    pathname?.startsWith('/receipt') ||
    pathname?.startsWith('/surprise/');

  useEffect(() => {
    if (isExcludedPage) {
      setVisible(false);
      return;
    }

    // Check if dismissed within the last 24 hours
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const elapsedHours = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
        if (elapsedHours < DISMISS_DURATION_HOURS) {
          setMinimized(true);
          return;
        }
      }
    } catch {
      // localStorage may fail in strict privacy modes
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname, isExcludedPage]);

  if (isExcludedPage) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    setMinimized(true);

    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  };

  const handleExpand = () => {
    setMinimized(false);
    setVisible(true);
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Minimized floating pill (unobtrusive, bottom-left)
  if (minimized && !visible) {
    return (
      <button
        onClick={handleExpand}
        className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-[85] group flex items-center gap-2 px-3 py-1.5 bg-[#673de6] hover:bg-[#5025d1] text-white rounded-full shadow-lg border border-purple-400/30 hover:scale-105 transition-all duration-300 backdrop-blur-md"
        title="Hostinger Partner Deal: Extra 20% Off Web Hosting"
        aria-label="Open Hostinger Web Hosting Discount Deal"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold tracking-tight">Hostinger 20% Off</span>
      </button>
    );
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Hostinger Web Hosting Partner Offer"
      className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-[85] w-[calc(100vw-2rem)] sm:w-[320px] max-w-sm transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b153b] via-[#211747] to-[#120c29] border border-purple-500/30 shadow-2xl p-4 text-white">
        {/* Subtle Ambient Purple Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#673de6]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors z-10"
          aria-label="Dismiss offer"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Header with Hostinger Logo Mark & Partner Badge */}
        <div className="flex items-center gap-2.5 mb-2.5">
          {/* Hostinger Stylized Isometric H Icon */}
          <div className="w-7 h-7 rounded-lg bg-[#673de6] flex items-center justify-center shadow-md shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
              <path d="M12.87 3.5L4.5 8.33v7.34L12.87 20.5l8.37-4.83V8.33L12.87 3.5zm-1.12 2.6l5.98 3.45-5.98 3.45-5.98-3.45 5.98-3.45zM6.5 10.42l5.25 3.03v5.92L6.5 16.34v-5.92zm7.5 8.95v-5.92l5.25-3.03v5.92l-5.25 3.03z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">
                Official Partner
              </span>
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            </div>
            <p className="text-xs font-bold text-white leading-none">Hostinger Web Hosting</p>
          </div>
        </div>

        {/* Value Pitch */}
        <h4 className="text-sm font-black text-white tracking-tight leading-snug mb-1">
          Need a Fast Website? Save an <span className="text-emerald-400">Extra 20%</span>
        </h4>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
          Get up to 75% off hosting + an extra 20% discount with a <strong>free custom domain</strong> and SSL certificate.
        </p>

        {/* Promo Code Copy Pill */}
        <div className="flex items-center justify-between bg-black/40 border border-purple-500/20 rounded-lg px-2.5 py-1.5 mb-3">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[10px] uppercase font-semibold text-purple-300">Code:</span>
            <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
              {REFERRAL_CODE}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded"
            title="Copy promo code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={HOSTINGER_REFERRAL_URL}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#673de6] to-[#7f54fc] hover:from-[#582fd4] hover:to-[#6c40e8] text-white font-black text-xs rounded-xl shadow-md hover:shadow-purple-500/25 transition-all transform hover:scale-[1.02] text-center"
          >
            <span>Claim 20% Off Deal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={handleDismiss}
            className="px-2.5 py-2 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </aside>
  );
}
