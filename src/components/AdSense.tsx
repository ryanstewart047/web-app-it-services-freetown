'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

interface AdSenseProps {
  adSlot?: string
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  adLayout?: string
  adStyle?: CSSProperties
  className?: string
}

interface SponsoredAdBlockProps {
  children: ReactNode
  eyebrow?: string
  title?: string
  description?: string
  className?: string
  contentClassName?: string
  compact?: boolean
}

/**
 * Google AdSense Component
 * 
 * Status: PROD-READY with User-Provided IDs
 * Publisher ID: ca-pub-9989697800650646
 */

// Check if AdSense is approved (set this to true after approval)
const ADSENSE_APPROVED = process.env.NEXT_PUBLIC_ADSENSE_APPROVED === 'true'

export default function AdSense({
  adSlot = '1036914951', // Default to Display Ad ID
  adFormat = 'auto',
  adLayout,
  adStyle = { display: 'block' },
  className = ''
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)
  const isAdPushed = useRef(false)
  
  // Don't render manual ads until AdSense is approved to prevent 400 errors
  if (!ADSENSE_APPROVED) {
    return null
  }
  
  useEffect(() => {
    try {
      // Only push ad once and if the element exists
      if (typeof window !== 'undefined' && adRef.current && !isAdPushed.current) {
        // Check if ad is already initialized
        const adElement = adRef.current
        if (!adElement.getAttribute('data-ad-status')) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
          isAdPushed.current = true
        }
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-9989697800650646" 
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
    </div>
  )
}

export function SponsoredAdBlock({
  children,
  eyebrow = 'Sponsored',
  title = 'Helpful offers from our partners',
  description = 'Relevant promotions help us keep repair guides, diagnostics, and pricing information free for visitors.',
  className = '',
  contentClassName = '',
  compact = false,
}: SponsoredAdBlockProps) {
  if (!ADSENSE_APPROVED) {
    return null
  }

  return (
    <section
      className={`relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/92 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur-sm ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-red-50 via-white to-blue-50" />
      <div className={`relative ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6 md:p-7'}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className={compact ? 'max-w-xl' : 'max-w-3xl'}>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {eyebrow}
            </span>
            <h3 className={`${compact ? 'mt-3 text-lg' : 'mt-3 text-xl sm:text-2xl'} font-black text-slate-900`}>
              {title}
            </h3>
            <p className={`${compact ? 'mt-2 text-sm' : 'mt-2 text-sm sm:text-base'} leading-7 text-slate-600`}>
              {description}
            </p>
          </div>

          {!compact && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Clear, non-blocking sponsor placement
            </p>
          )}
        </div>

        <div
          className={`mt-4 rounded-[1.5rem] border border-slate-200/70 bg-slate-50/90 p-3 sm:p-4 ${contentClassName}`}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

/**
 * Predefined AdSense Layouts with Production IDs
 */

// Responsive Display Ad (works everywhere)
export function DisplayAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="1036914951" 
      adFormat="auto"
      className={className}
    />
  )
}

// In-Article Ad (for blog posts)
export function InArticleAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="4541969135" 
      adFormat="auto"
      className={className}
    />
  )
}

// Multiplex Ad (native ad grid)
export function MultiplexAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="6836036542" 
      adFormat="auto"
      adLayout="multiplex"
      className={className}
    />
  )
}

// In-Feed Ad (for blog lists)
export function InFeedAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="1357402596" 
      adFormat="auto"
      className={className}
    />
  )
}

// Horizontal Ad (for headers/footers)
export function HorizontalAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="1036914951" // Reusing Display ID for horizontal
      adFormat="horizontal"
      className={className}
      adStyle={{ display: 'block' }}
    />
  )
}
