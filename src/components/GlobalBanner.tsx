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
        const res = await fetch('/api/banner');
        if (!res.ok) return;
        const data: BannerSettings = await res.json();
        
        if (data.enabled) {
          // Check if this specific banner update was dismissed by the user
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
    <div className={`relative ${banner.color} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3.5 flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center overflow-hidden">
            <span className="flex p-2 rounded-lg flex-shrink-0 z-10 bg-inherit">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </span>
            {/* Mobile: seamless marquee loop. Desktop: static centered text */}
            <div className="flex-1 overflow-hidden relative ml-2 sm:hidden">
              <div className="marquee-track gap-16">
                <span className="font-semibold text-white text-base whitespace-nowrap pr-16">
                  {banner.message}
                </span>
                {/* Duplicate for seamless loop */}
                <span className="font-semibold text-white text-base whitespace-nowrap pr-16" aria-hidden="true">
                  {banner.message}
                </span>
              </div>
            </div>
            {/* Desktop: static text */}
            <p className="hidden sm:block font-semibold text-white text-lg truncate ml-2 pr-4">
              {banner.message}
            </p>
          </div>
          
          {banner.link && (
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <a
                href={banner.link}
                className="flex items-center justify-center px-4 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-white/20 hover:bg-white/30 transition-colors"
              >
                Learn more <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </div>
          )}
          
          <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              onClick={handleDismiss}
              className="-mr-1 flex p-2 rounded-md hover:bg-white/20 focus:outline-none sm:-mr-2 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
