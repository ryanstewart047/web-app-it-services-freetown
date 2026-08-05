'use client'

import { useState, useEffect } from 'react'

interface LoadingOverlayProps {
  variant?: 'modern' | 'minimal' | 'dots' | 'pulse'
  message?: string
  progress?: number
  show?: boolean // New prop to control visibility without unmounting
}

export default function LoadingOverlay({ 
  variant = 'modern', 
  message = 'Loading expert repair services...',
  progress: externalProgress,
  show = true
}: LoadingOverlayProps) {
  const [internalProgress, setInternalProgress] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)
  const [shouldRender, setShouldRender] = useState(true)

  // Use external progress if provided, otherwise use internal
  const progress = externalProgress !== undefined ? externalProgress : internalProgress

  const loadingTips = [
    'Connecting to expert technicians...',
    'Loading service information...',
    'Preparing your experience...',
    'Almost ready!'
  ]

  useEffect(() => {
    // Only simulate loading progress if no external progress is provided
    if (externalProgress === undefined) {
      const interval = setInterval(() => {
        setInternalProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [externalProgress])

  useEffect(() => {
    // Cycle through loading tips
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % loadingTips.length)
    }, 800)

    return () => {
      clearInterval(tipInterval)
    }
  }, [])

  // Handle unmounting after animation
  useEffect(() => {
    if (!show) {
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 1000) // Match transition duration
      return () => clearTimeout(timer)
    } else {
      setShouldRender(true)
    }
  }, [show])

  if (!shouldRender) return null

  const renderLoader = () => {
    switch (variant) {
      case 'modern':
        return (
          <div className="modern-loader relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#040e40]/5 via-white to-red-50 animate-pulse"></div>
            
            {/* Main content */}
            <div className="relative z-10 text-center px-8">
              {/* New BridgeTech BS logo — clean, no double spinner */}
              <div className="mb-6 flex flex-col items-center">
                <div className="relative mb-2">
                  <img
                    src="/assets/logo.svg"
                    alt="BridgeTech IT Services"
                    className="h-24 w-auto object-contain drop-shadow-lg mx-auto"
                  />
                  {/* Subtle pulse ring around logo */}
                  <div className="absolute -inset-3 rounded-full border-2 border-red-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
                </div>
                <h2 className="text-2xl font-black text-[#040e40] tracking-tight mt-3">
                  BridgeTech <span className="text-[#dc2626]">IT Services</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-widest uppercase">bridgetechit.com</p>
              </div>

              {/* Animated subtitle */}
              <p className="text-base text-gray-600 mb-6 font-medium">
                {loadingTips[currentTip]}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto mb-6">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#040e40] to-[#dc2626] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  {Math.round(progress)}% Loading
                </p>
              </div>

              {/* Feature indicators */}
              <div className="flex justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Expert Technicians</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>Quality Service</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'minimal':
        return (
          <div className="minimal-loader text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-[#040e40] mb-2">BridgeTech <span className="text-[#dc2626]">IT Services</span></h3>
            <p className="text-gray-600">{message}</p>
          </div>
        )

      case 'dots':
        return (
          <div className="dots-loader text-center">
            <div className="flex justify-center space-x-2 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <h3 className="text-xl font-bold text-[#040e40] mb-2">BridgeTech <span className="text-[#dc2626]">IT Services</span></h3>
            <p className="text-gray-600">{message}</p>
          </div>
        )

      case 'pulse':
        return (
          <div className="pulse-loader text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary-600 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-primary-600 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute inset-4 bg-primary-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-microchip text-white text-xl"></i>
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#040e40] mb-2">BridgeTech <span className="text-[#dc2626]">IT Services</span></h3>
            <p className="text-gray-600">{message}</p>
          </div>
        )

      default:
        return renderLoader()
    }
  }

  return (
    <div 
      className={`loading-overlay-pro fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 transition-all duration-1000 ease-in-out ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-full lg:translate-y-0 lg:scale-110'
      }`}
      aria-hidden={!show}
    >
      <div className={`transition-all duration-700 delay-100 ${show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        {renderLoader()}
      </div>
    </div>
  )
}
