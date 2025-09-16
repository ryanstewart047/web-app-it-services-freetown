'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        }
        setDeferredPrompt(null)
        setShowBanner(false)
      })
    }
  }

  const handleClose = () => {
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="pwa-install-banner fixed top-0 left-0 right-0 bg-blue-900 text-white p-3 z-50 shadow-lg">
      <div className="pwa-banner-content flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="pwa-banner-icon text-2xl">📱</div>
          <div className="pwa-banner-text">
            <div className="pwa-banner-title font-semibold">Install Our App</div>
            <div className="pwa-banner-subtitle text-sm opacity-90">Get faster access and work offline</div>
          </div>
        </div>
        <div className="pwa-banner-buttons flex items-center space-x-2">
          <button 
            onClick={handleInstall}
            className="pwa-install-btn bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
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
