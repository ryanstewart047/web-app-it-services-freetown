'use client'

import { useEffect } from 'react'

interface AdSenseProps {
  adSlot?: string
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  adLayout?: string
  adStyle?: React.CSSProperties
  className?: string
}

/**
 * Google AdSense Component
 * 
 * Setup Instructions:
 * 1. Apply for Google AdSense at https://www.google.com/adsense
 * 2. Once approved, replace 'ca-pub-XXXXXXXXXXXXXXXX' with your Publisher ID
 * 3. Replace the adSlot prop with your actual ad unit IDs
 * 4. Add the AdSense script to app/layout.tsx <head> section:
 * 
 *    <Script
 *      async
 *      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
 *      crossOrigin="anonymous"
 *      strategy="afterInteractive"
 *    />
 */

export default function AdSense({
  adSlot = '0000000000', // Replace with your ad slot ID after approval
  adFormat = 'auto',
  adLayout,
  adStyle = { display: 'block' },
  className = ''
}: AdSenseProps) {
  
  useEffect(() => {
    try {
      // Push ad to AdSense when component mounts
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your Publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
    </div>
  )
}

/**
 * Predefined AdSense Layouts
 */

// Responsive Display Ad (works everywhere)
export function DisplayAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="1111111111" // Replace with your display ad slot
      adFormat="auto"
      className={className}
    />
  )
}

// In-Article Ad (for blog posts)
export function InArticleAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="2222222222" // Replace with your in-article ad slot
      adFormat="fluid"
      adLayout="in-article"
      className={className}
    />
  )
}

// Multiplex Ad (native ad grid)
export function MultiplexAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="3333333333" // Replace with your multiplex ad slot
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
      adSlot="4444444444" // Replace with your in-feed ad slot
      adFormat="fluid"
      adLayout="in-feed"
      className={className}
    />
  )
}

// Horizontal Ad (for headers/footers)
export function HorizontalAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="5555555555" // Replace with your horizontal ad slot
      adFormat="horizontal"
      className={className}
      adStyle={{ display: 'block' }}
    />
  )
}
