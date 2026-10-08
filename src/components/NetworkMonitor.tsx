'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { BRAND_LOGO_SRC, BRAND_LOGO_FALLBACK_SRC, BRAND_NAME } from '@/lib/brand'

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
}

// How often to re-check real connectivity while offline
const OFFLINE_RECHECK_INTERVAL_MS = 30_000

export default function NetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    wasOffline: false
  })
  const [showPopup, setShowPopup] = useState(false)
  const [popupType, setPopupType] = useState<'offline' | 'online'>('offline')
  const [isClient, setIsClient] = useState(false)
  const recheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleOnline = useCallback(() => {
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
  }, [])

  const handleOffline = useCallback(() => {
    console.log('Network: Disconnected')
    setNetworkStatus({
      isOnline: false,
      wasOffline: true
    })
    setPopupType('offline')
    setShowPopup(true)
    // Don't auto-hide offline popup - user should be aware they're offline
  }, [])

  // Real connectivity probe — navigator.onLine / the browser's online/offline
  // events only reflect the state of the network interface, so a device can
  // report "online" while still having no actual internet access (e.g. on a
  // Wi-Fi network with no uplink). Hitting the server confirms real
  // connectivity rather than trusting the browser's own signal.
  const probeConnectivity = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/ping?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
      })
      return res.ok || res.status < 500
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !isClient) return

    // Check initial online status
    const initialStatus = navigator.onLine
    setNetworkStatus({
      isOnline: initialStatus,
      wasOffline: false
    })

    console.log('NetworkMonitor: Initializing with status:', initialStatus)

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isClient, handleOnline, handleOffline])

  // While offline, re-check real connectivity every 30 seconds and come
  // back online automatically as soon as a connection is confirmed —
  // instead of waiting on the browser's 'online' event, which doesn't
  // always fire reliably.
  useEffect(() => {
    if (!isClient) return

    if (networkStatus.isOnline) {
      if (recheckTimerRef.current) {
        clearInterval(recheckTimerRef.current)
        recheckTimerRef.current = null
      }
      return
    }

    recheckTimerRef.current = setInterval(async () => {
      console.log('NetworkMonitor: Re-checking connectivity…')
      const isConnected = await probeConnectivity()
      if (isConnected) {
        handleOnline()
      }
    }, OFFLINE_RECHECK_INTERVAL_MS)

    return () => {
      if (recheckTimerRef.current) {
        clearInterval(recheckTimerRef.current)
        recheckTimerRef.current = null
      }
    }
  }, [isClient, networkStatus.isOnline, probeConnectivity, handleOnline])

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
    if (typeof window !== 'undefined' && isClient) {
      (window as any).networkTest = { forceOffline, forceOnline }
    }
  }, [isClient])

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  // Don't render on server or before client hydration
  if (!isClient || !showPopup) return null

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
                src={BRAND_LOGO_SRC}
                alt={BRAND_NAME}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = BRAND_LOGO_FALLBACK_SRC
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
                <span>BridgeTech IT Services</span>
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
