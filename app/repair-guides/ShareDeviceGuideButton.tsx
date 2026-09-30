'use client';

import { useState } from 'react';
import { Share2, Check, MessageCircle, Copy } from 'lucide-react';

export default function ShareDeviceGuideButton() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const guideUrl = 'https://www.itservicesfreetown.com/repair-guides';
  const shareTitle = 'Free Device Care & Remote Support Guide (BridgeTech IT Services)';
  const shareText =
    '📱💻 Download the Free BridgeTech Device Care & Remote Support Guide (10-Page Handbook). Practical tips for protecting your phone & computer against power surges, water damage, slow performance, and getting instant remote IT support in Freetown:\n' +
    guideUrl;

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: guideUrl,
        });
        return;
      } catch (err) {
        // Fallback or user canceled
      }
    }
    setMenuOpen((prev) => !prev);
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
    setMenuOpen(false);
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(guideUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    setMenuOpen(false);
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-500 hover:scale-[1.02]"
        title="Share this guide with friends and colleagues"
      >
        <Share2 className="h-4 w-4" />
        <span>Share Guide</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/10 bg-[#0B1536] p-2 text-white shadow-2xl backdrop-blur-lg">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-400 hover:bg-white/10 transition"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            Share on WhatsApp
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-cyan-300" />}
            {copied ? 'Link Copied to Clipboard!' : 'Copy Page Link'}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
        title="Copy link to clipboard"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-300" />}
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
}
