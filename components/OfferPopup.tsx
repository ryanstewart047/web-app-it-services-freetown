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
    
    if (shownToday) {
      setHasShown(true)
      return
    }

    // Fetch current offer
    fetch('/api/offer')
      .then(res => res.json())
      .then(data => {
        if (data.offer) {
          setOffer(data.offer)
          
          // Show popup after delay
          const timer = setTimeout(() => {
            setIsVisible(true)
            sessionStorage.setItem('offer-popup-shown', 'true')
            setHasShown(true)
          }, delay)

          return () => clearTimeout(timer)
        }
      })
      .catch(error => console.error('Error fetching offer:', error))
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden pointer-events-auto transform transition-all duration-300 animate-scale-in"
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
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full mb-3">
                  TODAY'S OFFER
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {offer.title}
                </h2>
              </div>
              
              <div className="text-gray-600 leading-relaxed whitespace-pre-line mb-6">
                {offer.description}
              </div>

              <button
                onClick={handleClose}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Got It!
              </button>
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
