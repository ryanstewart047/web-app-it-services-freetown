'use client'

import { useState, useEffect } from 'react'
import { 
  shouldShowPWAInstall, 
  isPWASupported, 
  isPWAInstalled, 
  getInstallInstructions,
  detectDevice,
  logDeviceInfo 
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
    
    // Only proceed if mobile device and PWA is supported
    if (!shouldShowPWAInstall() || !isPWASupported() || isPWAInstalled()) {
      return
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS devices, show banner after a short delay since beforeinstallprompt doesn't fire
    if (device.isIOS && !isPWAInstalled()) {
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 2000)
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        clearTimeout(timer)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = () => {
    if (deviceInfo.isAndroid && deferredPrompt) {
      // Android Chrome - use the deferred prompt
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
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

  // Don't show banner if not mobile or if dismissed in this session
  if (!showBanner || !shouldShowPWAInstall()) return null
  
  // Check if banner was dismissed in this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-banner-dismissed')) {
    return null
  }

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
