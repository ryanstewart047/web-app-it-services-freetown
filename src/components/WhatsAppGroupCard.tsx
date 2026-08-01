'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/FuS9EBvCF455geNHqQl3Iz?s=cl&p=a&ilr=1';
const SHOW_DELAY_MS = 3000;

export default function WhatsAppGroupCard() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
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
    
    setTimeout(() => {
      setDismissed(true);
      setMinimized(true);
      sessionStorage.setItem('whatsapp_group_card_dismissed', '1');
    }, 400);
  };

  const handleExpand = () => {
    setMinimized(false);
    setDismissed(false);
    setTimeout(() => setVisible(true), 50);
  };

  // Minimized trigger pill
  if (dismissed && minimized) {
    return (
      <button
        onClick={handleExpand}
        className="fixed bottom-24 right-4 sm:right-6 z-[95] flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl border border-emerald-400/40 hover:scale-105 transition-all duration-300"
        title="Join Our WhatsApp Group"
      >
        <i className="fab fa-whatsapp text-sm text-white" aria-hidden="true" />
        <span className="text-xs font-bold">Join Our WhatsApp Group</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-24 right-4 sm:right-6 z-[95] transition-all duration-500 ease-out transform ${
        visible ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto' : 'opacity-0 translate-x-[120%] scale-95 pointer-events-none'
      }`}
    >
      <div className="relative bg-[#041d11] border-2 border-emerald-500/60 hover:border-emerald-400 rounded-2xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)] text-white backdrop-blur-xl transition-all duration-300 w-64 sm:w-72">
        
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center transition-all"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Card Content & Action */}
        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
            <i className="fab fa-whatsapp text-xl text-white" aria-hidden="true" />
          </div>

          <div className="flex-1 pr-4">
            <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors leading-snug">
              Join Our WhatsApp Group
            </h4>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
              Click to join <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
