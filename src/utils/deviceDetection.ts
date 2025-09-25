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
 * Checks if the app is already installed (running in standalone mode)
 * @returns boolean indicating if app is installed
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if running in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  
  // Check iOS specific standalone mode
  const isIOSStandalone = (navigator as any).standalone === true
  
  return isStandalone || isIOSStandalone
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