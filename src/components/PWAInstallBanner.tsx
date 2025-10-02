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
    <div className="pwa-install-banner fixed top-0 left-0 right-0 bg-blue-900 text-white p-3 z-50 shadow-lg">
      <div className="pwa-banner-content flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="pwa-banner-icon text-2xl">
            {deviceInfo.isIOS ? '🍎' : deviceInfo.isAndroid ? '🤖' : '📱'}
          </div>
          <div className="pwa-banner-text">
            <div className="pwa-banner-title font-semibold">
              {deviceInfo.isIOS ? 'Add to Home Screen' : 'Install Our App'}
            </div>
            <div className="pwa-banner-subtitle text-sm opacity-90">
              {deviceInfo.isIOS 
                ? 'Tap Share → Add to Home Screen' 
                : 'Get faster access and work offline'
              }
            </div>
          </div>
        </div>
        <div className="pwa-banner-buttons flex items-center space-x-2">
          {deviceInfo.isAndroid && deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="pwa-install-btn bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Install
            </button>
          )}
          {deviceInfo.isIOS && (
            <button 
              onClick={handleInstall}
              className="pwa-install-btn bg-white text-blue-900 px-3 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
            >
              Got it
            </button>
          )}
          <button 
            onClick={handleClose}
            className="pwa-close-btn text-white hover:text-gray-300 text-xl p-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
