'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';

const HOSTINGER_REFERRAL_URL = 'https://www.hostinger.com?REFERRALCODE=0TCITSERVWRL';
const REFERRAL_CODE = '0TCITSERVWRL';
const STORAGE_KEY = 'bridgetech_hostinger_modal_dismissed';
const INITIAL_DELAY_MS = 2000; // Show 2 seconds after page load

export default function HostingerSlideUp() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Exclude admin, checkout, cart, receipt, and personal surprise reveal pages
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

    // Check if dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (isDismissed) {
        setMinimized(true);
        return;
      }
    } catch {
      // Ignore storage errors in strict private browsing
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, INITIAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname, isExcludedPage]);

  if (isExcludedPage) return null;

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setVisible(false);
    setMinimized(true);

    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
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

  return (
    <>
      {/* ── Minimized Floating Pill (Always pinned to Bottom-Left) ── */}
      {minimized && !visible && (
        <button
          onClick={handleExpand}
          className="fixed bottom-[5.5rem] left-4 z-[95] group flex items-center gap-2 px-3.5 py-2 bg-[#673de6] hover:bg-[#5025d1] text-white rounded-full shadow-2xl border border-purple-400/40 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md"
          title="Hostinger Deal: Special Offer • 83% Off Web Hosting"
          aria-label="Open Hostinger Web Hosting Discount Deal"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold tracking-tight">Hostinger • 83% Off</span>
        </button>
      )}

      {/* ── Center Page Popup Modal (Mobile & Desktop Friendly) ── */}
      {visible && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={() => handleDismiss()}
          role="dialog"
          aria-modal="true"
          aria-label="Hostinger Web Hosting Special Offer"
        >
          <div
            className="relative w-full max-w-[340px] sm:max-w-[390px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b153b] via-[#211747] to-[#120c29] border-2 border-purple-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 text-white transform transition-all duration-300 scale-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#673de6]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors z-20"
              aria-label="Close and minimize offer"
              title="Close offer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Hostinger Icon + Partner Badge */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#673de6] flex items-center justify-center shadow-lg shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                  <path d="M12.87 3.5L4.5 8.33v7.34L12.87 20.5l8.37-4.83V8.33L12.87 3.5zm-1.12 2.6l5.98 3.45-5.98 3.45-5.98-3.45 5.98-3.45zM6.5 10.42l5.25 3.03v5.92L6.5 16.34v-5.92zm7.5 8.95v-5.92l5.25-3.03v5.92l-5.25 3.03z" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Special Offer • 83% OFF
                  </span>
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                </div>
                <p className="text-xs font-bold text-white leading-none">Hostinger Official Partner</p>
              </div>
            </div>

            {/* Pitch */}
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug mb-1.5">
              Unlimited Websites &amp; Mailboxes
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
              Plus built-in AI website tools, free domain &amp; SSL, and priority 24/7 support for maximum flexibility.
            </p>

            {/* Referral Code Copy Box */}
            <div className="flex items-center justify-between bg-black/50 border border-purple-500/30 rounded-xl px-3 py-2 mb-4 shadow-inner">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] uppercase font-semibold text-purple-300">Code:</span>
                <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
                  {REFERRAL_CODE}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg"
                title="Copy referral code"
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

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={HOSTINGER_REFERRAL_URL}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#673de6] to-[#7f54fc] hover:from-[#582fd4] hover:to-[#6c40e8] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-[1.02] active:scale-98 text-center"
              >
                <span>Claim 83% Off Deal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleDismiss}
                className="px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
