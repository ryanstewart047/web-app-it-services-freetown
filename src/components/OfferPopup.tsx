'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface OfferPopupProps {
  delay?: number // Delay in milliseconds before showing popup
}

export default function OfferPopup({ delay = 30000 }: OfferPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [offer, setOffer] = useState<any>(null)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if popup was already shown in this session
    const shownToday = sessionStorage.getItem('offer-popup-shown')
    
    console.log('[OfferPopup] Component mounted, delay:', delay)
    console.log('[OfferPopup] Already shown this session:', shownToday)
    
    if (shownToday) {
      setHasShown(true)
      return
    }

    // Fetch current offer
    console.log('[OfferPopup] Fetching offer from API...')
    fetch('/api/offer')
      .then(res => res.json())
      .then(data => {
        console.log('[OfferPopup] API response:', data)
        if (data.offer) {
          console.log('[OfferPopup] Offer found, setting timer for', delay, 'ms')
          setOffer(data.offer)
          
          // Show popup after delay
          const timer = setTimeout(() => {
            console.log('[OfferPopup] Timer fired, showing popup')
            setIsVisible(true)
            sessionStorage.setItem('offer-popup-shown', 'true')
            setHasShown(true)
          }, delay)

          return () => clearTimeout(timer)
        } else {
          console.log('[OfferPopup] No offer available')
        }
      })
      .catch(error => console.error('[OfferPopup] Error fetching offer:', error))
  }, [delay])

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!offer || !isVisible || hasShown) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Popup Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden pointer-events-auto transform transition-all duration-300 animate-scale-in"
          style={{ backgroundColor: offer.backgroundColor || '#ffffff' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
            aria-label="Close popup"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-2/5 relative bg-gradient-to-br from-purple-100 to-pink-100 min-h-[200px] md:min-h-[300px]">
              {offer.imageUrl ? (
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl">🎉</div>
                </div>
              )}
            </div>

            {/* Text Section */}
            <div className="md:w-3/5 p-8">
              <div className="mb-4">
                <div className="inline-block px-3 py-1 text-white text-xs font-bold rounded-full mb-3" style={{ background: offer.badgeColor || '#9333ea' }}>
                  TODAY'S OFFER
                </div>
                <h2 className="text-3xl font-bold mb-3" style={{ color: offer.textColor || '#1f2937' }}>
                  {offer.title}
                </h2>
              </div>
              
              <div className="leading-relaxed whitespace-pre-line mb-6" style={{ color: offer.textColor || '#1f2937' }}>
                {offer.description}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3">
                  {offer.buttonText && offer.buttonLink && (
                    <a
                      href={offer.buttonLink}
                      onClick={handleClose}
                      className="px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:opacity-90"
                      style={{ backgroundColor: offer.buttonColor || '#9333ea' }}
                    >
                      {offer.buttonText}
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className={`px-6 py-3 ${offer.buttonText && offer.buttonLink ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'} font-semibold rounded-xl transition-all duration-300`}
                  >
                    {offer.buttonText && offer.buttonLink ? 'Maybe Later' : 'Got It!'}
                  </button>
                </div>
                {offer.termsText && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {offer.termsText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
