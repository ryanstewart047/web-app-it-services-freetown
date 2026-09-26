'use client';

import { useState, useEffect } from 'react';
import { PartnerItem, PartnersSectionSettings, PartnerColorMode } from '@/lib/server/partners-store';

export function getLogoColorClasses(colorMode: PartnerColorMode) {
  switch (colorMode) {
    case 'black-white':
      // Pure clean grayscale
      return 'grayscale contrast-125 opacity-70 hover:opacity-90';
    case 'monochrome':
      // High contrast crisp monochrome silhouette
      return 'grayscale contrast-200 brightness-75 dark:brightness-125 opacity-70 hover:opacity-100';
    case 'original-color':
      // Full original vibrant brand colors
      return 'grayscale-0 opacity-90 hover:opacity-100 hover:scale-105';
    case 'grayscale-hover-color':
    default:
      // Muted Black & White, smooth transition to full color on hover
      return 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-105';
  }
}

export default function PartnersSection() {
  const [data, setData] = useState<{
    settings: PartnersSectionSettings;
    partners: PartnerItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/partners?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (isMounted && resData) {
          setData(resData);
        }
      })
      .catch((err) => {
        console.warn('[PartnersSection] Failed to load partners:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !data) return null;
  const { settings, partners } = data;

  if (!settings.enabled || partners.length === 0) return null;

  return (
    <section className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-gray-50/50 via-white to-gray-50 border-t border-gray-200/60 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-950 dark:border-gray-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title & Subtitle */}
        {settings.title && (
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600 dark:text-red-400 mb-2">
              Partnership &amp; Certified Expertise
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {settings.title}
            </h2>
            {settings.subtitle && (
              <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                {settings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Logos Container */}
        {settings.layout === 'marquee' ? (
          <div className="relative overflow-hidden w-full py-2">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-gray-50/80 via-gray-50/30 to-transparent dark:from-gray-900/80 dark:via-gray-900/30 dark:to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-gray-50/80 via-gray-50/30 to-transparent dark:from-gray-900/80 dark:via-gray-900/30 dark:to-transparent" />

            {/* Animated track — two identical sets side-by-side; translateX(-50%) = seamless loop */}
            <div className="animate-marquee flex items-center w-max">
              {/* Set 1 */}
              <div className="flex items-center gap-5 sm:gap-7 pr-5 sm:pr-7">
                {partners.map((partner) => {
                  const effectiveColorMode = partner.colorMode || settings.colorMode;
                  const colorClasses = getLogoColorClasses(effectiveColorMode);
                  return (
                    <div
                      key={`a-${partner.id}`}
                      className="shrink-0 flex items-center justify-center h-16 w-36 sm:h-20 sm:w-44 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {partner.websiteUrl ? (
                        <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-full h-full" title={partner.name}>
                          <img src={partner.logoUrl} alt={partner.name} loading="lazy"
                            className={`max-h-9 sm:max-h-11 max-w-[110px] sm:max-w-[130px] w-auto h-auto object-contain transition-all duration-300 ${colorClasses}`} />
                        </a>
                      ) : (
                        <img src={partner.logoUrl} alt={partner.name} loading="lazy"
                          className={`max-h-9 sm:max-h-11 max-w-[110px] sm:max-w-[130px] w-auto h-auto object-contain transition-all duration-300 ${colorClasses}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Set 2 — exact duplicate for seamless wrap */}
              <div className="flex items-center gap-5 sm:gap-7 pr-5 sm:pr-7" aria-hidden="true">
                {partners.map((partner) => {
                  const effectiveColorMode = partner.colorMode || settings.colorMode;
                  const colorClasses = getLogoColorClasses(effectiveColorMode);
                  return (
                    <div
                      key={`b-${partner.id}`}
                      className="shrink-0 flex items-center justify-center h-16 w-36 sm:h-20 sm:w-44 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/70 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {partner.websiteUrl ? (
                        <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-full h-full" title={partner.name}>
                          <img src={partner.logoUrl} alt={partner.name} loading="lazy"
                            className={`max-h-9 sm:max-h-11 max-w-[110px] sm:max-w-[130px] w-auto h-auto object-contain transition-all duration-300 ${colorClasses}`} />
                        </a>
                      ) : (
                        <img src={partner.logoUrl} alt={partner.name} loading="lazy"
                          className={`max-h-9 sm:max-h-11 max-w-[110px] sm:max-w-[130px] w-auto h-auto object-contain transition-all duration-300 ${colorClasses}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Responsive Standard Grid */
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
            {partners.map((partner) => {
              const effectiveColorMode = partner.colorMode || settings.colorMode;
              const colorClasses = getLogoColorClasses(effectiveColorMode);

              return (
                <div
                  key={partner.id}
                  className="group relative flex items-center justify-center h-16 w-36 sm:h-20 sm:w-44 px-4 py-2.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 shadow-xs hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {partner.websiteUrl ? (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full h-full"
                      title={`Visit ${partner.name}`}
                    >
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        loading="lazy"
                        className={`max-h-9 sm:max-h-11 max-w-[110px] sm:max-w-[130px] w-auto h-auto object-contain transition-all duration-300 ${colorClasses}`}
                      />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full" title={partner.name}>
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        loading="lazy"
                        className={`max-h-9 sm:max-h-11 max-w-[110px] sm:max-w-[130px] w-auto h-auto object-contain transition-all duration-300 ${colorClasses}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
