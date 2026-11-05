'use client';

import { useState } from 'react';
import { Share2, Check, MessageCircle } from 'lucide-react';

export default function ShareGuideButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://www.itservicesfreetown.com/flood-safety-guide';
    const text = `🚨 URGENT FREETOWN FLOOD SAFETY ADVISORY: Heavy rains across Freetown. Dial 117 for national emergency rescue. Read the full step-by-step life safety & tech protection guide here:\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Freetown Flood Safety Guide (Dial 117)',
          text,
          url,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    // Direct WhatsApp share or clipboard
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopy = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://www.itservicesfreetown.com/flood-safety-guide';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 text-xs shadow-md transition hover:scale-105"
      >
        <MessageCircle className="h-4 w-4" />
        Share on WhatsApp
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-3.5 text-xs font-semibold transition"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
      </button>
    </div>
  );
}
