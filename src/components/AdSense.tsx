'use client'

import { useEffect, useRef, useState } from 'react'

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
 * Optimized for fast load & automatic collapse of unfilled ads on all devices
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
  const [isUnfilled, setIsUnfilled] = useState(false)
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADSENSE_APPROVED || !adRef.current) return

    const el = adRef.current

    // Check initial state in case it was set instantly
    if (el.getAttribute('data-ad-status') === 'unfilled') {
      setIsUnfilled(true)
    }

    // Set up a MutationObserver to watch for Google's status changes
    const statusObserver = new MutationObserver(() => {
      if (el.getAttribute('data-ad-status') === 'unfilled') {
        setIsUnfilled(true)
      }
    })

    statusObserver.observe(el, {
      attributes: true,
      attributeFilter: ['data-ad-status']
    })

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

    let scrollObserver: IntersectionObserver | null = null

    // Use IntersectionObserver with a 200px early margin
    if ('IntersectionObserver' in window) {
      scrollObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            push()
            scrollObserver?.disconnect()
          }
        },
        { rootMargin: '200px 0px', threshold: 0 }
      )
      scrollObserver.observe(el)
    } else {
      // Fallback for older browsers — push immediately
      push()
    }

    return () => {
      statusObserver.disconnect()
      if (scrollObserver) {
        scrollObserver.disconnect()
      }
    }
  }, [])

  if (!ADSENSE_APPROVED || isUnfilled) return null

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
