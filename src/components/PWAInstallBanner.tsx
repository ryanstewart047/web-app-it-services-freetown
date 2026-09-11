'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Download, Share } from 'lucide-react'
import {
  markPWAInstalled,
  shouldShowInstallBanner,
  getInstallInstructions,
  detectDevice,
  logDeviceInfo,
  monitorInstallationState
} from '@/utils/deviceDetection'
import { BRAND_LOGO_TRANSPARENT_SRC, BRAND_NAME } from '@/lib/brand'
import PWAPhoneMockup from './PWAPhoneMockup'

const AVATAR_SRC = '/assets/bridgetech-avatar-transparent.png'

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const deferredPromptRef = useRef<any>(null)
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, isIOS: false, isAndroid: false })
  const [visible, setVisible] = useState(false)
  const [showMockup, setShowMockup] = useState(false) // ← controls phone mockup modal

  useEffect(() => {
    const device = detectDevice()
    setDeviceInfo(device)
    logDeviceInfo()

    // ── Desktop guard: mobile only ──
    if (!device.isMobile && !device.isIOS && !device.isAndroid) return

    const handleBeforeInstallPrompt = (e: any) => {
      console.log('PWA Banner: beforeinstallprompt fired')
      try {
        if (localStorage.getItem('pwa-was-installed') === 'true') {
          localStorage.removeItem('pwa-was-installed')
        }
      } catch {}
      e.preventDefault()
      deferredPromptRef.current = e
      setDeferredPrompt(e)
      if (shouldShowInstallBanner()) triggerShow()
    }

    const cleanupMonitor = monitorInstallationState((isInstalled) => {
      if (isInstalled) {
        setShowBanner(false)
        setVisible(false)
      } else {
        if (shouldShowInstallBanner()) triggerShow()
      }
    })

    const handleAppInstalled = () => {
      console.log('PWA Banner: appinstalled fired')
      markPWAInstalled()
      setShowBanner(false)
      setVisible(false)
      setShowMockup(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    if (device.isIOS && shouldShowInstallBanner()) {
      const t = setTimeout(() => { if (shouldShowInstallBanner()) triggerShow() }, 3000)
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
        clearTimeout(t)
        cleanupMonitor()
      }
    }

    if (device.isAndroid && shouldShowInstallBanner()) {
      const t = setTimeout(() => {
        if (!deferredPromptRef.current && shouldShowInstallBanner()) triggerShow()
      }, 5000)
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
        clearTimeout(t)
        cleanupMonitor()
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      cleanupMonitor()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerShow = () => {
    setShowBanner(true)
    requestAnimationFrame(() => setTimeout(() => setVisible(true), 30))
  }

  useEffect(() => {
    try {
      if (sessionStorage.getItem('pwa-banner-closed') === 'true') {
        setShowBanner(false)
      }
    } catch {}
  }, [])

  // ── Step 1: tapping "Install App" opens the phone mockup preview ──
  const handleInstallClick = () => {
    setShowMockup(true)
  }

  // ── Step 2: tapping "Install Now" inside the mockup triggers native prompt ──
  const handleActualInstall = async () => {
    setShowMockup(false)
    const prompt = deferredPromptRef.current

    if (prompt) {
      try {
        prompt.prompt()
        const { outcome } = await prompt.userChoice
        console.log('PWA install outcome:', outcome)
        if (outcome === 'accepted') markPWAInstalled()
      } catch (err) {
        console.error('PWA prompt error:', err)
      } finally {
        deferredPromptRef.current = null
        setDeferredPrompt(null)
        dismissBanner()
      }
    } else {
      if (deviceInfo.isIOS) {
        alert(
          `To install ${BRAND_NAME} on iOS:\n` +
          `1. Tap the Share button (⎙) at the bottom of Safari\n` +
          `2. Scroll down and tap "Add to Home Screen"\n` +
          `3. Tap "Add"`
        )
      } else {
        alert(
          `To install ${BRAND_NAME}:\n` +
          `1. Tap your browser menu (⋮ or ⋯)\n` +
          `2. Select "Add to Home screen" or "Install app"`
        )
      }
      dismissBanner()
    }
  }

  const dismissBanner = () => {
    setVisible(false)
    setTimeout(() => setShowBanner(false), 350)
    try { sessionStorage.setItem('pwa-banner-closed', 'true') } catch {}
  }

  return (
    <>
      {/* ── Phone Mockup Preview Modal ── */}
      <PWAPhoneMockup
        isOpen={showMockup}
        isIOS={deviceInfo.isIOS}
        onInstall={handleActualInstall}
        onClose={() => setShowMockup(false)}
      />

      {/* ── Top Banner ── */}
      {showBanner && shouldShowInstallBanner() && (
        <div
          className={`
            fixed top-0 left-0 right-0 z-[9990]
            transition-transform duration-[350ms] ease-out
            ${visible ? 'translate-y-0' : '-translate-y-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-label={`Install ${BRAND_NAME} app`}
        >
          <div
            className="mx-3 mb-0 rounded-2xl overflow-hidden border border-white/10"
            style={{
              marginTop: 'max(0.75rem, env(safe-area-inset-top))',
              background: 'linear-gradient(135deg, #040e40 0%, #1a0630 60%, #7b0000 100%)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-4 pb-4 pt-1">
              {/* Header row */}
              <div className="flex items-center gap-3">

                {/* App icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden border border-white/15"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <img
                    src={AVATAR_SRC}
                    alt={BRAND_NAME}
                    className="w-12 h-12 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = BRAND_LOGO_TRANSPARENT_SRC }}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-[15px] leading-tight truncate">
                    {BRAND_NAME}
                  </p>
                  <p className="text-white/65 text-[12px] leading-snug mt-0.5">
                    {deviceInfo.isIOS
                      ? 'Add to Home Screen for quick access'
                      : 'Install for faster access & offline use'}
                  </p>
                  {deviceInfo.isIOS && (
                    <p className="text-white/45 text-[11px] mt-0.5">
                      Tap <span className="font-semibold text-white/65">Share</span> → <span className="font-semibold text-white/65">Add to Home Screen</span>
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={dismissBanner}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.13)' }}
                  aria-label="Dismiss install banner"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>
              </div>

              {/* Install button — opens mockup preview */}
              <button
                onClick={handleInstallClick}
                className="mt-3.5 w-full flex items-center justify-center gap-2 bg-white font-black text-sm py-3 rounded-xl shadow-lg hover:bg-gray-100 active:scale-[0.98] transition-all duration-200"
                style={{ color: '#040e40' }}
              >
                {deviceInfo.isIOS
                  ? <Share className="w-4 h-4" />
                  : <Download className="w-4 h-4" />
                }
                {deviceInfo.isIOS ? 'Add to Home Screen' : 'Install App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
