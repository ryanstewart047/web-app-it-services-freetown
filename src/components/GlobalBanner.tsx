'use client'

import { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { BannerSettings } from '@/lib/server/banner-store';

export default function GlobalBanner() {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`/api/banner?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data: BannerSettings = await res.json();
        
        if (data.enabled) {
          // Check if this specific banner update was dismissed by the user in this session
          const dismissedUpdate = sessionStorage.getItem('dismissed_banner');
          if (dismissedUpdate !== data.lastUpdated) {
            setBanner(data);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error('Failed to load global banner:', error);
      }
    };
    
    fetchBanner();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (banner) {
      sessionStorage.setItem('dismissed_banner', banner.lastUpdated);
    }
  };

  if (!isVisible || !banner) return null;

  return (
    <div className={`relative ${banner.color} text-white shadow-sm transition-all duration-300 z-50`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="py-1.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Icon + Continuous End-to-End Marquee Track */}
          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            <span className="flex-shrink-0 flex items-center justify-center p-1 rounded-md bg-white/10" title="Announcement">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </span>
            
            {/* Continuous Marquee: Moves from right to left, and only repeats once the message moves till the end */}
            <div className="flex-1 overflow-hidden relative select-none">
              <div className="banner-marquee-text text-xs sm:text-sm font-medium tracking-wide">
                {banner.message}
              </div>
            </div>
          </div>
          
          {/* Actions: Customizable Button + Dismiss Icon */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {banner.link && (
              <a
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/30 bg-white/15 hover:bg-white/25 active:scale-95 text-[11px] sm:text-xs font-semibold text-white transition-all shadow-sm whitespace-nowrap"
              >
                <span>{banner.buttonText || 'Learn More'}</span>
                <ExternalLink className="w-3 h-3 text-white/90" />
              </a>
            )}
            
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors focus:outline-none"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
