'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, ChevronRight, Users, Sparkles, CheckCircle2 } from 'lucide-react';

const WHATSAPP_GROUP_URL = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || 
  'https://wa.me/23233399391?text=Hi%20IT%20Services%20Freetown!%20I%20would%20like%20to%20join%20your%20WhatsApp%20Tech%20Group.';

const SHOW_DELAY_MS = 3500; // Slide in 3.5 seconds after page load

export default function WhatsAppGroupCard() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    // Check if dismissed during current session
    const wasDismissed = sessionStorage.getItem('whatsapp_group_card_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      setMinimized(true);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    
    // Allow animation to complete before switching state
    setTimeout(() => {
      setDismissed(true);
      setMinimized(true);
      sessionStorage.setItem('whatsapp_group_card_dismissed', '1');
    }, 500);
  };

  const handleExpand = () => {
    setMinimized(false);
    setDismissed(false);
    setTimeout(() => setVisible(true), 50);
  };

  // If dismissed and user hasn't clicked minimized icon, render minimized pill trigger
  if (dismissed && minimized) {
    return (
      <button
        onClick={handleExpand}
        className="fixed bottom-24 right-4 sm:right-6 z-[95] flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white rounded-full shadow-2xl border border-emerald-300/40 hover:scale-105 transition-all duration-300 group"
        title="Join WhatsApp Group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <i className="fab fa-whatsapp text-sm relative text-white" aria-hidden="true" />
        </span>
        <span className="text-xs font-extrabold tracking-wide drop-shadow">Join WA Group</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-24 right-4 sm:right-6 z-[95] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        visible ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto' : 'opacity-0 translate-x-[120%] scale-95 pointer-events-none'
      }`}
    >
      <div className="group relative max-w-xs w-72 sm:w-80">
        {/* Glowing backdrop border animation */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse"></div>

        {/* Card Main Container */}
        <div className="relative bg-[#031c11] bg-gradient-to-br from-[#062c1b] via-[#041a10] to-[#010e08] border-2 border-emerald-500/50 hover:border-emerald-400 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white backdrop-blur-xl transition-all duration-300">
          
          {/* Header row: Live status badge & dismiss X */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded-full shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 drop-shadow">
                Freetown Tech Group
              </span>
            </div>

            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black text-gray-300 hover:text-white border border-white/20 flex items-center justify-center transition-all shadow-md hover:scale-110"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Body */}
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-left group/link"
          >
            <div className="flex items-start gap-3.5">
              {/* WhatsApp Icon Box */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/40 border border-emerald-200/40 group-hover/link:scale-110 transition-transform duration-300">
                <i className="fab fa-whatsapp text-2xl text-white drop-shadow" aria-hidden="true" />
              </div>

              <div className="space-y-1 flex-1">
                <h4 className="font-black text-base text-white tracking-tight flex items-center gap-1.5 drop-shadow">
                  <span>Join WA Community</span>
                  <Sparkles className="w-4 h-4 text-emerald-300 fill-emerald-300 animate-pulse flex-shrink-0" />
                </h4>
                <p className="text-[11px] font-medium text-emerald-100/90 leading-snug line-clamp-3">
                  Get instant repair assistance, tech tips, & exclusive discounts from local Freetown experts!
                </p>
              </div>
            </div>

            {/* Community highlight chips */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[10px] text-emerald-200/80 font-semibold">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-900/40 border border-emerald-700/40 rounded-md">
                <Users className="w-3 h-3 text-emerald-400" /> 500+ Members
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-900/40 border border-emerald-700/40 rounded-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Support
              </span>
            </div>

            {/* CTA Button */}
            <div className="mt-4 flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/50 transition-all group-hover/link:shadow-emerald-500/40 border border-emerald-200/40 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <i className="fab fa-whatsapp text-sm" aria-hidden="true" />
                Join Group Now
              </span>
              <ChevronRight className="w-4 h-4 text-white group-hover/link:translate-x-1 transition-transform" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
