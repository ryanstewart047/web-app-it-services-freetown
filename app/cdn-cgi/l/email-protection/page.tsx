'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, ArrowLeft, Check, Copy, ExternalLink, ShieldCheck, MessageCircle } from 'lucide-react';

/**
 * Cloudflare Email Obfuscation Decoder:
 * Cloudflare encodes emails using a 1-byte XOR key (the first 2 hex digits).
 * The remaining 2-digit hex pairs are XOR'd with the key to decode each ASCII character.
 */
function decodeCloudflareEmail(hash: string): string | null {
  try {
    const cleanHash = hash.replace(/^#/, '').trim();
    if (!cleanHash || cleanHash.length < 4 || cleanHash.length % 2 !== 0) {
      return null;
    }
    const key = parseInt(cleanHash.substring(0, 2), 16);
    if (isNaN(key)) return null;

    let email = '';
    for (let i = 2; i < cleanHash.length; i += 2) {
      const charCode = parseInt(cleanHash.substring(i, i + 2), 16) ^ key;
      email += String.fromCharCode(charCode);
    }

    if (email && email.includes('@') && email.includes('.')) {
      return email.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export default function EmailProtectionPage() {
  const [email, setEmail] = useState<string>('support@itservicesfreetown.com');
  const [copied, setCopied] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const decoded = hash ? decodeCloudflareEmail(hash) : null;
    const targetEmail = decoded || 'support@itservicesfreetown.com';
    setEmail(targetEmail);

    // Try opening mailto automatically
    try {
      window.location.href = `mailto:${targetEmail}`;
      setRedirectAttempted(true);
    } catch {
      // Browser blocked automatic mailto launch
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur">
        {/* Header Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Mail className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct Email Contact</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Contact IT Services Freetown
          </h1>
          <p className="text-slate-400 text-sm">
            {redirectAttempted
              ? "Opening your email app... If it didn't open automatically, click the button below."
              : 'Click below to send an email directly to our support team.'}
          </p>
        </div>

        {/* Email Box */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6 space-y-3">
          <div className="text-xs text-slate-400 font-medium">Recipient Address:</div>
          <div className="flex items-center justify-between gap-2">
            <a
              href={`mailto:${email}`}
              className="text-amber-400 hover:text-amber-300 font-mono text-sm sm:text-base font-bold break-all transition-colors"
            >
              {email}
            </a>
            <button
              onClick={handleCopy}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <a
            href={`mailto:${email}`}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Compose Email in Your App</span>
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="tel:+23233399391"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>+232 33 399391</span>
            </a>
            <a
              href="https://wa.me/23233399391"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Back Links */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/contact"
            className="hover:text-amber-400 font-semibold transition-colors"
          >
            Visit Contact Page &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
