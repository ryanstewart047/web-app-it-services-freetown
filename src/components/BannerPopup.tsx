'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function BannerPopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const bannerShown = localStorage.getItem('bannerShown')
    if (!bannerShown) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000) // Show banner after 2 seconds
      return () => clearTimeout(timer)
    }
  }, [])

  const closeBanner = () => {
    setIsVisible(false)
    localStorage.setItem('bannerShown', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl transform transition-all duration-300 relative">
        {/* Close Button */}
        <button
          onClick={closeBanner}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center z-10 transition-colors duration-200 touch-manipulation"
        >
          <i className="fas fa-times text-gray-600"></i>
        </button>

        {/* Image Section */}
        <div className="relative h-40 sm:h-48">
          <Image
            src="https://images.pexels.com/photos/3568520/pexels-photo-3568520.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="Professional IT Repair Services"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            🎉 Special Offer!
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Get 20% off your first repair service! Professional computer and mobile repairs with same-day service available.
          </p>
          
          <div className="flex flex-col gap-3">
            <a
              href="/book-appointment"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 font-medium text-center text-sm sm:text-base touch-manipulation"
              onClick={closeBanner}
            >
              Book Now
            </a>
            <button
              onClick={closeBanner}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base touch-manipulation"
            >
              Maybe Later
            </button>
          </div>

          {/* Social Media Icons */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 text-center">Follow us for updates:</p>
            <div className="flex space-x-3 sm:space-x-4 justify-center">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 touch-manipulation"
              >
                <i className="fab fa-facebook-f text-sm"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-200 touch-manipulation"
              >
                <i className="fab fa-twitter text-sm"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all duration-200 touch-manipulation"
              >
                <i className="fab fa-instagram text-sm"></i>
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-200 touch-manipulation"
              >
                <i className="fab fa-whatsapp text-sm"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
