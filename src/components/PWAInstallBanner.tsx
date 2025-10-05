'use client'

import { useState, useEffect } from 'react'
import { 
  shouldShowPWAInstall, 
  isPWASupported, 
  isPWAInstalled, 
  shouldShowInstallBanner,
  getInstallInstructions,
  detectDevice,
  logDeviceInfo,
  monitorInstallationState
} from '@/utils/deviceDetection'

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, isIOS: false, isAndroid: false })
  const [installInstructions, setInstallInstructions] = useState('')

  useEffect(() => {
    // Get device information
    const device = detectDevice()
    setDeviceInfo(device)
    setInstallInstructions(getInstallInstructions())
    
    // Log device info for debugging
    logDeviceInfo()
    
    // Check if we should show the banner
    if (!shouldShowInstallBanner()) {
      console.log('PWA Install Banner: Not showing banner based on current state')
      return
    }

    console.log('PWA Install Banner: Initializing for device:', device)

    const handleBeforeInstallPrompt = (e: any) => {
      console.log('PWA Install Banner: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    // Monitor installation state changes
    const cleanupMonitor = monitorInstallationState((isInstalled) => {
      if (isInstalled) {
        console.log('PWA Install Banner: App was installed, hiding banner')
        setShowBanner(false)
      } else {
        console.log('PWA Install Banner: App was uninstalled, allowing fresh install')
        // Reset banner state to allow showing again
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('pwa-banner-dismissed')
        }
        // Re-check if we should show banner after uninstall
        if (shouldShowInstallBanner()) {
          setShowBanner(true)
        }
      }
    })

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS devices, show banner after a short delay since beforeinstallprompt doesn't fire
    if (device.isIOS && shouldShowInstallBanner()) {
      console.log('PWA Install Banner: Setting timer for iOS device')
      const timer = setTimeout(() => {
        if (shouldShowInstallBanner()) {
          console.log('PWA Install Banner: Showing banner for iOS')
          setShowBanner(true)
        }
      }, 3000)
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        clearTimeout(timer)
        cleanupMonitor()
      }
    }

    // For Android devices, also show after delay if beforeinstallprompt doesn't fire
    if (device.isAndroid && shouldShowInstallBanner()) {
      console.log('PWA Install Banner: Setting fallback timer for Android device')
      const fallbackTimer = setTimeout(() => {
        if (!deferredPrompt && shouldShowInstallBanner()) {
          console.log('PWA Install Banner: Showing fallback banner for Android')
          setShowBanner(true)
        }
      }, 5000)
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        clearTimeout(fallbackTimer)
        cleanupMonitor()
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      cleanupMonitor()
    }
  }, [])

  const handleInstall = () => {
    if (deviceInfo.isAndroid && deferredPrompt) {
      // Android Chrome - use the deferred prompt
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        console.log('PWA Install result:', choiceResult.outcome)
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
          // The installation state monitoring will handle the banner hiding
        }
        setDeferredPrompt(null)
        setShowBanner(false)
      })
    } else if (deviceInfo.isIOS) {
      // iOS - provide manual instructions since we can't trigger install programmatically
      setShowBanner(false)
      // The banner will show iOS-specific instructions
    } else {
      // Fallback for other devices
      setShowBanner(false)
    }
  }

  const handleClose = () => {
    setShowBanner(false)
    // Set a flag to not show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-banner-dismissed', 'true')
    }
  }

  // Don't show banner if conditions are not met
  if (!showBanner || !shouldShowInstallBanner()) {
    return null
  }

  console.log('PWA Install Banner: Rendering banner for device:', deviceInfo)

  return (
    <div className="pwa-install-banner fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-900 via-blue-800 to-red-600 text-white p-4 z-50 shadow-2xl border-b-4 border-white/20">
      <div className="pwa-banner-content flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Site Logo */}
          <div className="pwa-banner-icon bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <img 
              src="/assets/logo.png" 
              alt="IT Services Freetown" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback to SVG if PNG fails
                (e.target as HTMLImageElement).src = "/assets/logo.svg"
              }}
            />
          </div>
          
          <div className="pwa-banner-text">
            <div className="pwa-banner-title font-bold text-lg">
              IT Services Freetown
            </div>
            <div className="pwa-banner-subtitle text-sm opacity-90 font-medium">
              {deviceInfo.isIOS 
                ? 'Add to Home Screen for quick access to our services' 
                : 'Install our app for faster access and offline capabilities'
              }
            </div>
            {deviceInfo.isIOS && (
              <div className="text-xs opacity-75 mt-1">
                Tap <span className="font-semibold">Share</span> → <span className="font-semibold">Add to Home Screen</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="pwa-banner-buttons flex items-center space-x-3">
          {deviceInfo.isAndroid && deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="pwa-install-btn bg-white text-blue-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <i className="fas fa-download text-sm"></i>
              <span>Install App</span>
            </button>
          )}
          {deviceInfo.isIOS && (
            <button 
              onClick={handleInstall}
              className="pwa-install-btn bg-white/20 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/30 flex items-center space-x-2"
            >
              <i className="fas fa-check text-sm"></i>
              <span>Got it</span>
            </button>
          )}
          <button 
            onClick={handleClose}
            className="pwa-close-btn text-white/80 hover:text-white hover:bg-white/10 text-xl p-2 rounded-lg transition-all duration-300"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  )
}
