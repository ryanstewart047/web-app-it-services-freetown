/**
 * Mobile Device Detection Utility
 * Detects Android and iOS devices for PWA installation prompts
 */

export interface DeviceInfo {
  isMobile: boolean
  isAndroid: boolean
  isIOS: boolean
  isDesktop: boolean
  userAgent: string
}

/**
 * Detects if the current device is a mobile device (Android or iOS)
 * @returns DeviceInfo object with device detection results
 */
export function detectDevice(): DeviceInfo {
  // Default values for server-side rendering
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isAndroid: false,
      isIOS: false,
      isDesktop: true,
      userAgent: ''
    }
  }

  const userAgent = navigator.userAgent || navigator.vendor || ''
  
  // Android detection
  const isAndroid = /android/i.test(userAgent) && !/windows phone/i.test(userAgent)
  
  // iOS detection (iPhone, iPad, iPod)
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent) && !(window as any).MSStream
  
  // Mobile detection
  const isMobile = isAndroid || isIOS
  
  // Desktop detection (everything else)
  const isDesktop = !isMobile

  return {
    isMobile,
    isAndroid,
    isIOS,
    isDesktop,
    userAgent
  }
}

/**
 * Checks if PWA installation should be available
 * @returns boolean indicating if PWA install should be shown
 */
export function shouldShowPWAInstall(): boolean {
  const device = detectDevice()
  
  // Only show PWA install on mobile devices
  return device.isMobile
}

/**
 * Checks if the current device supports PWA installation
 * @returns boolean indicating PWA support
 */
export function isPWASupported(): boolean {
  if (typeof window === 'undefined') return false
  
  const device = detectDevice()
  
  // PWA is supported on mobile devices with modern browsers
  if (device.isAndroid) {
    // Android Chrome supports PWA
    return 'serviceWorker' in navigator && typeof window !== 'undefined'
  }
  
  if (device.isIOS) {
    // iOS Safari supports PWA through "Add to Home Screen"
    return 'serviceWorker' in navigator
  }
  
  return false
}

/**
 * Gets platform-specific installation instructions
 * @returns string with installation instructions
 */
export function getInstallInstructions(): string {
  const device = detectDevice()
  
  if (device.isAndroid) {
    return "Tap 'Install' to add our app to your home screen for faster access and offline support."
  }
  
  if (device.isIOS) {
    return "Tap the share button and select 'Add to Home Screen' to install our app."
  }
  
  return "Install our app for faster access and offline support."
}

/**
 * Mark the PWA as installed — call from `appinstalled` event or after
 * the user accepts the install prompt.
 */
export function markPWAInstalled(): void {
  try {
    localStorage.setItem('pwa-was-installed', 'true')
    localStorage.setItem('pwa-install-time', Date.now().toString())
    console.log('PWA: Marked as installed')
  } catch {}
}

/**
 * Checks if the app is already installed (running in standalone mode
 * OR was previously installed via the install prompt).
 * @returns boolean indicating if app is installed
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false

  // 1. Running in standalone / home-screen mode right now
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isIOSStandalone = (navigator as any).standalone === true

  if (isStandalone || isIOSStandalone) {
    // Ensure the persisted flag is set
    markPWAInstalled()
    return true
  }

  // 2. Checked via URL parameters from Android TWA or Manifest start_url
  if (window.location.search.includes('source=pwa')) {
    markPWAInstalled()
    return true
  }

  // 3. Previously installed (user may be visiting the site in the browser
  //    but the PWA is already on their home screen)
  try {
    if (localStorage.getItem('pwa-was-installed') === 'true') {
      return true
    }
  } catch {}

  return false
}

/**
 * Checks if the PWA install banner should be shown
 * @returns boolean indicating if banner should be displayed
 */
export function shouldShowInstallBanner(): boolean {
  if (typeof window === 'undefined') return false
  
  // Don't show if already installed
  if (isPWAInstalled()) {
    console.log('PWA Banner: Not showing - app is installed')
    return false
  }

  // Don't show if user dismissed it this session
  try {
    if (sessionStorage.getItem('pwa-banner-closed') === 'true') {
      console.log('PWA Banner: Not showing - dismissed this session')
      return false
    }
  } catch (e) {}

  // NOTE: We do NOT block desktop browsers here.
  // The browser's beforeinstallprompt event is the authoritative signal
  // that the PWA is installable. If it fires, we always show the banner.
  // For iOS (which never fires beforeinstallprompt), we use the isMobile check.
  const device = detectDevice()
  if (device.isIOS) {
    // iOS doesn't support beforeinstallprompt, so we check service worker support
    if (!('serviceWorker' in navigator)) {
      console.log('PWA Banner: Not showing - iOS without service worker support')
      return false
    }
  }

  console.log('PWA Banner: Should show banner')
  return true
}

/**
 * Monitors PWA installation state changes
 * @param callback Function to call when installation state changes
 */
export function monitorInstallationState(callback: (isInstalled: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  let lastState = isPWAInstalled()
  
  const checkState = () => {
    const currentState = isPWAInstalled()
    if (currentState !== lastState) {
      console.log(`PWA Installation state changed: ${lastState} -> ${currentState}`)
      lastState = currentState
      callback(currentState)
    }
  }
  
  // Check every 5 seconds
  const interval = setInterval(checkState, 5000)
  
  // Also check when visibility changes (user returns to browser)
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setTimeout(checkState, 1000) // Small delay to allow state to settle
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Return cleanup function
  return () => {
    clearInterval(interval)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}

/**
 * Logs device information for debugging
 */
export function logDeviceInfo(): void {
  if (process.env.NODE_ENV === 'development') {
    const device = detectDevice()
    console.log('Device Detection:', {
      ...device,
      isPWASupported: isPWASupported(),
      shouldShowInstall: shouldShowPWAInstall(),
      isPWAInstalled: isPWAInstalled()
    })
  }
}