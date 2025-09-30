'use client'

import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
}

export default function NetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    wasOffline: false
  })
  const [showPopup, setShowPopup] = useState(false)
  const [popupType, setPopupType] = useState<'offline' | 'online'>('offline')

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return

    // Check initial online status
    const initialStatus = navigator.onLine
    setNetworkStatus({
      isOnline: initialStatus,
      wasOffline: false
    })

    console.log('NetworkMonitor: Initializing with status:', initialStatus)

    const handleOnline = () => {
      console.log('Network: Connected')
      setNetworkStatus(prev => {
        // Only show "back online" popup if we were previously offline
        if (!prev.isOnline || prev.wasOffline) {
          setPopupType('online')
          setShowPopup(true)
          
          // Auto-hide online popup after 3 seconds
          setTimeout(() => {
            setShowPopup(false)
          }, 3000)
        }
        
        return {
          isOnline: true,
          wasOffline: false
        }
      })
    }

    const handleOffline = () => {
      console.log('Network: Disconnected')
      setNetworkStatus({
        isOnline: false,
        wasOffline: true
      })
      setPopupType('offline')
      setShowPopup(true)
      // Don't auto-hide offline popup - user should be aware they're offline
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Debug functions for testing
  const forceOffline = () => {
    console.log('NetworkMonitor: Force offline triggered')
    setPopupType('offline')
    setShowPopup(true)
    setNetworkStatus({ isOnline: false, wasOffline: true })
  }

  const forceOnline = () => {
    console.log('NetworkMonitor: Force online triggered')
    setPopupType('online')
    setShowPopup(true)
    setNetworkStatus({ isOnline: true, wasOffline: false })
    setTimeout(() => setShowPopup(false), 3000)
  }

  // Add to window for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).networkTest = { forceOffline, forceOnline }
    }
  }, [])

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  if (!showPopup) return null

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-500 ease-out ${
        showPopup ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div
        className={`
          network-status-popup rounded-2xl shadow-2xl p-4 max-w-sm mx-auto backdrop-blur-lg border-2
          ${popupType === 'offline' 
            ? 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 border-red-400/50 text-white' 
            : 'bg-gradient-to-r from-green-500 via-green-600 to-green-700 border-green-400/50 text-white'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Site Logo */}
            <div className="network-status-icon bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <img 
                src="/assets/logo.png" 
                alt="IT Services Freetown" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to SVG if PNG fails
                  (e.target as HTMLImageElement).src = "/assets/logo.svg"
                }}
              />
            </div>
            
            <div className="network-status-content">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    popupType === 'offline' 
                      ? 'bg-red-300 animate-pulse' 
                      : 'bg-green-300 animate-bounce'
                  }`}
                />
                <h4 className="font-bold text-sm">
                  {popupType === 'offline' ? 'You are offline' : 'Back online!'}
                </h4>
              </div>
              
              <p className="text-xs opacity-90 mt-1">
                {popupType === 'offline' 
                  ? 'Check your internet connection' 
                  : 'Connection restored successfully'
                }
              </p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleClosePopup}
            className="network-status-close text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-300 ml-2"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
        
        {/* Additional info for offline state */}
        {popupType === 'offline' && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center space-x-1">
                <i className="fas fa-wifi text-white/70"></i>
                <span>IT Services Freetown</span>
              </span>
              <span className="text-white/70">Offline Mode</span>
            </div>
          </div>
        )}
        
        {/* Success animation for online state */}
        {popupType === 'online' && (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { NetworkMonitor }