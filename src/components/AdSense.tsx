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
 * Publisher ID: ca-pub-9989697800650646
 * Optimised for fast load: uses IntersectionObserver with 200px early trigger
 * so ads are requested before they scroll into view.
 */

const ADSENSE_APPROVED = process.env.NEXT_PUBLIC_ADSENSE_APPROVED === 'true'
const PUB_ID = 'ca-pub-9989697800650646'

export default function AdSense({
  adSlot = '1036914951',
  adFormat = 'auto',
  adLayout,
  adStyle = { display: 'block' },
  className = '',
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADSENSE_APPROVED || pushed.current || !adRef.current) return

    const el = adRef.current

    const push = () => {
      if (pushed.current) return
      try {
        if (typeof window !== 'undefined' && !el.getAttribute('data-ad-status')) {
          ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
          pushed.current = true
        }
      } catch (err) {
        console.error('AdSense push error:', err)
      }
    }

    // Use IntersectionObserver with a 200px early margin so the ad
    // is requested before it visually enters the viewport.
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            push()
            observer.disconnect()
          }
        },
        { rootMargin: '200px 0px', threshold: 0 }
      )
      observer.observe(el)
      return () => observer.disconnect()
    } else {
      // Fallback for older browsers — push immediately
      push()
    }
  }, [])

  if (!ADSENSE_APPROVED) return null

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={PUB_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        {...(adLayout ? { 'data-ad-layout': adLayout } : {})}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// ─── Predefined layouts ────────────────────────────────────────────────────

/** Responsive Display Ad */
export function DisplayAd({ className }: { className?: string }) {
  return <AdSense adSlot="1036914951" adFormat="auto" className={className} />
}

/** In-Article Ad */
export function InArticleAd({ className }: { className?: string }) {
  return <AdSense adSlot="4541969135" adFormat="fluid" adLayout="in-article" className={className} />
}

/** Multiplex / native grid Ad */
export function MultiplexAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="6836036542"
      adFormat="autorelaxed"
      adLayout="in-article"
      className={className}
    />
  )
}

/** In-Feed Ad */
export function InFeedAd({ className }: { className?: string }) {
  return <AdSense adSlot="1357402596" adFormat="fluid" adLayout="in-article" className={className} />
}

/** Horizontal banner Ad */
export function HorizontalAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="1036914951"
      adFormat="horizontal"
      adStyle={{ display: 'block' }}
      className={className}
    />
  )
}
