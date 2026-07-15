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
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available; please refresh
                    console.log('New content is available; please refresh.')
                    
                    // Optionally show a notification to the user
                    if ('Notification' in window && Notification.permission === 'granted') {
                      new Notification(BRAND_NAME, {
                        body: 'New content available! Tap to refresh.',
                        icon: BRAND_LOGO_SRC,
                        badge: '/assets/favicon-52x52.png'
                      })
                    }
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use.')
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
