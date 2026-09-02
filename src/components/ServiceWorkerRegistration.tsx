'use client'

import { useEffect } from 'react'
import { logDeviceInfo } from '@/utils/deviceDetection'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // In local development (localhost / 127.0.0.1), service workers cause chunk 404s,
    // HMR cache conflicts, and "Failed to update a ServiceWorker" errors.
    // Cleanly unregister any active workers in development mode.
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'

    if (process.env.NODE_ENV === 'development' && isLocalhost) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().catch(() => {})
          }
        })
        .catch(() => {})

      if ('caches' in window) {
        caches
          .keys()
          .then((keys) => {
            keys.forEach((key) => caches.delete(key))
          })
          .catch(() => {})
      }
      return
    }

    // Clear legacy image/asset caches directly from client side
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => {
          keys.forEach((key) => {
            if (
              key.includes('it-services-freetown') ||
              key.includes('v1') ||
              key.includes('v2') ||
              key.includes('v3') ||
              key.includes('v4') ||
              key.includes('v5')
            ) {
              caches.delete(key)
            }
          })
        })
        .catch(() => {})
    }

    // Register service worker with safe error handling
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Safe update check with catch handler to prevent unhandled rejections
        if (registration && typeof registration.update === 'function') {
          registration.update().catch((err) => {
            console.debug('[ServiceWorker] Update check skipped or network unavailable:', err)
          })
        }

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Post skip waiting to new worker
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                }
              }
            })
          }
        })
      })
      .catch((error) => {
        console.warn('[ServiceWorker] Registration bypassed or failed:', error)
      })

    // Handle service worker messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FORM_SYNC_SUCCESS') {
        console.log('Form synced successfully:', event.data.formId)
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    // Log device information for debugging
    logDeviceInfo()

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [])

  return null
}

