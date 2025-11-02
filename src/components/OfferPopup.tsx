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

  useEffect(() => {
    console.log('[OfferPopup] Component mounted, delay:', delay)

    // Fetch current offer
    console.log('[OfferPopup] Fetching offer from API...')
    fetch('/api/offer')
      .then(res => {
        console.log('[OfferPopup] API status:', res.status)
        return res.json()
      })
      .then(data => {
        console.log('[OfferPopup] API response:', data)
        if (data.success && data.offer) {
          console.log('[OfferPopup] Offer found:', data.offer.title)
          console.log('[OfferPopup] Offer isActive:', data.offer.isActive)
          setOffer(data.offer)
          
          // Show popup after delay
          const timer = setTimeout(() => {
            console.log('[OfferPopup] Timer fired, showing popup now')
            setIsVisible(true)
          }, delay)

          return () => {
            console.log('[OfferPopup] Cleanup: clearing timer')
            clearTimeout(timer)
          }
        } else {
          console.log('[OfferPopup] No offer available in response')
        }
      })
      .catch(error => console.error('[OfferPopup] Error fetching offer:', error))
  }, [delay])

  const handleClose = () => {
    console.log('[OfferPopup] Closing popup')
    setIsVisible(false)
  }

  // Don't render if no offer or not visible
  if (!offer || !isVisible) {
    return null
  }

  console.log('[OfferPopup] Rendering popup for:', offer.title)

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Popup Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 pointer-events-none">
        <div 
          className="rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden pointer-events-auto transform transition-all duration-300 animate-scale-in"
          style={{ backgroundColor: offer.backgroundColor || '#ffffff' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-10 p-1.5 md:p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
            aria-label="Close popup"
          >
            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="md:w-2/5 relative bg-gradient-to-br from-purple-100 to-pink-100 min-h-[150px] md:min-h-[300px]">
              {offer.imageUrl ? (
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl md:text-6xl">🎉</div>
                </div>
              )}
            </div>

            {/* Text Section */}
            <div className="md:w-3/5 p-4 md:p-8">
              <div className="mb-3 md:mb-4">
                <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 text-white text-[10px] md:text-xs font-bold rounded-full mb-2 md:mb-3" style={{ background: offer.badgeColor || '#9333ea' }}>
                  {offer.badgeText || "TODAY'S OFFER"}
                </div>
                <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight" style={{ color: offer.textColor || '#1f2937' }}>
                  {offer.title}
                </h2>
              </div>
              
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-line mb-4 md:mb-6" style={{ color: offer.textColor || '#1f2937' }}>
                {offer.description}
              </div>

              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {offer.buttonText && offer.buttonLink && (
                    <a
                      href={offer.buttonLink}
                      onClick={handleClose}
                      className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base text-white font-semibold rounded-lg md:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:opacity-90"
                      style={{ backgroundColor: offer.buttonColor || '#9333ea' }}
                    >
                      {offer.buttonText}
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className={`px-4 py-2 md:px-6 md:py-3 text-sm md:text-base ${offer.buttonText && offer.buttonLink ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105'} font-semibold rounded-lg md:rounded-xl transition-all duration-300`}
                  >
                    {offer.buttonText && offer.buttonLink ? 'Maybe Later' : 'Got It!'}
                  </button>
                </div>
                {offer.termsText && (
                  <p className="text-[10px] md:text-xs text-gray-500 text-center mt-1 md:mt-2">
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
