'use client'

import { useEffect, useRef } from 'react'

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
 * 1. ✅ Applied for Google AdSense - Publisher ID: ca-pub-9989697800650646
 * 2. ⏳ Waiting for approval (usually takes 1-2 weeks)
 * 3. After approval: Get your ad slot IDs from AdSense dashboard
 * 4. Replace the placeholder adSlot IDs below with your actual ad unit IDs
 * 
 * Current Status: Ready for automatic ads (Auto ads enabled via script tag)
 * Once approved, ads will show automatically where Google determines best placement
 */

export default function AdSense({
  adSlot = '0000000000', // Replace with your ad slot ID after approval
  adFormat = 'auto',
  adLayout,
  adStyle = { display: 'block' },
  className = ''
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)
  const isAdPushed = useRef(false)
  
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
        data-ad-client="ca-pub-9989697800650646" // Your actual Publisher ID
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
      adFormat="auto"
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
      adFormat="auto"
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
