'use client'

import { useEffect } from 'react'
import { shouldShowPWAInstall, isPWASupported, logDeviceInfo } from '@/utils/deviceDetection'
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // We want the Service Worker to register on ALL devices that support it
    // so that features like Push Notifications work for technicians on desktop too.
    if (!('serviceWorker' in navigator)) {
      return
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      // Clear legacy image/asset caches directly from client side to unstick mobile devices
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            if (key.includes('it-services-freetown') || key.includes('v1') || key.includes('v2') || key.includes('v3') || key.includes('v4') || key.includes('v5')) {
              console.log('[ServiceWorkerRegistration] Deleting legacy cache:', key)
              caches.delete(key)
            }
          })
        })
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)

          // Force update check on every page load
          registration.update()

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New content available, updating service worker...')
                    // Post skip waiting to new worker
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'FORM_SYNC_SUCCESS') {
          console.log('Form synced successfully:', event.data.formId)
          // You could show a toast notification here
        }
      })
    }

    // Log device information for debugging
    logDeviceInfo()
  }, [])

  return null // This component doesn't render anything
}
