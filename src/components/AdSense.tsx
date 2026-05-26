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
