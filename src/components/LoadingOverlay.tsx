'use client'

import { useState, useEffect } from 'react'

interface LoadingOverlayProps {
  variant?: 'modern' | 'minimal' | 'dots' | 'pulse'
  message?: string
  progress?: number
}

export default function LoadingOverlay({ 
  variant = 'modern', 
  message = 'Loading expert repair services...',
  progress: externalProgress
}: LoadingOverlayProps) {
  const [internalProgress, setInternalProgress] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)

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

  const renderLoader = () => {
    switch (variant) {
      case 'modern':
        return (
          <div className="modern-loader relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50 animate-pulse"></div>
            
            {/* Main content */}
            <div className="relative z-10 text-center px-8">
              {/* Logo with breathing animation */}
              <div className="mb-8 transform hover:scale-105 transition-transform duration-500">
                <div className="relative w-24 h-24 mx-auto">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-primary-200 animate-spin-slow"></div>
                  {/* Inner spinning element */}
                  <div className="absolute inset-2 rounded-full border-4 border-t-primary-600 border-r-red-500 border-b-primary-600 border-l-red-500 animate-spin"></div>
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-tools text-2xl text-primary-600 animate-pulse"></i>
                  </div>
                </div>
              </div>

              {/* Brand name with typewriter effect */}
              {/* Removed brand name for cleaner look */}
              
              {/* Animated subtitle */}
              <p className="text-lg text-gray-600 mb-8 font-medium">
                {loadingTips[currentTip]}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto mb-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-600 to-red-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {Math.round(progress)}% Complete
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">IT Services Freetown</h3>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">IT Services Freetown</h3>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">IT Services Freetown</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        )

      default:
        return renderLoader()
    }
  }

  return (
    <div className="loading-overlay-pro fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {renderLoader()}
    </div>
  )
}
