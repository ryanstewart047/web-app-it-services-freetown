'use client'

import { useEffect, useState } from 'react'
import { 
  detectDevice, 
  shouldShowPWAInstall, 
  isPWASupported, 
  isPWAInstalled, 
  getInstallInstructions 
} from '@/utils/deviceDetection'

export default function PWATestPage() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    isDesktop: true,
    userAgent: ''
  })
  
  const [pwaInfo, setPWAInfo] = useState({
    shouldShow: false,
    isSupported: false,
    isInstalled: false,
    instructions: ''
  })

  useEffect(() => {
    const device = detectDevice()
    setDeviceInfo(device)
    
    const pwa = {
      shouldShow: shouldShowPWAInstall(),
      isSupported: isPWASupported(),
      isInstalled: isPWAInstalled(),
      instructions: getInstallInstructions()
    }
    setPWAInfo(pwa)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            PWA Test - Mobile-Only Implementation
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Device Detection */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Detection</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Mobile Device:</span>
                  <span className={deviceInfo.isMobile ? 'text-green-600' : 'text-red-600'}>
                    {deviceInfo.isMobile ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Android:</span>
                  <span className={deviceInfo.isAndroid ? 'text-green-600' : 'text-gray-500'}>
                    {deviceInfo.isAndroid ? '✅ Yes' : '⚪ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">iOS:</span>
                  <span className={deviceInfo.isIOS ? 'text-green-600' : 'text-gray-500'}>
                    {deviceInfo.isIOS ? '✅ Yes' : '⚪ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Desktop:</span>
                  <span className={deviceInfo.isDesktop ? 'text-red-600' : 'text-gray-500'}>
                    {deviceInfo.isDesktop ? '🖥️ Yes' : '⚪ No'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">User Agent:</h3>
                <p className="text-sm text-gray-600 break-all">{deviceInfo.userAgent}</p>
              </div>
            </div>

            {/* PWA Information */}
            <div className="bg-red-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">PWA Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Should Show Install:</span>
                  <span className={pwaInfo.shouldShow ? 'text-green-600' : 'text-red-600'}>
                    {pwaInfo.shouldShow ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">PWA Supported:</span>
                  <span className={pwaInfo.isSupported ? 'text-green-600' : 'text-orange-600'}>
                    {pwaInfo.isSupported ? '✅ Yes' : '⚠️ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Already Installed:</span>
                  <span className={pwaInfo.isInstalled ? 'text-red-600' : 'text-gray-500'}>
                    {pwaInfo.isInstalled ? '📱 Yes' : '⚪ No'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h3 className="font-medium text-gray-700 mb-2">Install Instructions:</h3>
                <p className="text-sm text-gray-600">{pwaInfo.instructions}</p>
              </div>
            </div>
          </div>

          {/* Expected Behavior */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">Expected Behavior</h2>
            <div className="space-y-3 text-sm text-yellow-700">
              <div className="flex items-start space-x-2">
                <span className="font-medium">📱 Mobile Devices:</span>
                <span>PWA install banner should appear on Android Chrome and iOS Safari</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">🖥️ Desktop Browsers:</span>
                <span>PWA install banner should NOT appear (mobile-only implementation)</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">🤖 Android:</span>
                <span>Shows &quot;Install&quot; button that triggers native install prompt</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">🍎 iOS:</span>
                <span>Shows instructions for &quot;Add to Home Screen&quot; manually</span>
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Testing Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
              <li>Open this page on a desktop browser - PWA banner should NOT appear</li>
              <li>Open this page on Android Chrome - PWA banner should appear with Install button</li>
              <li>Open this page on iOS Safari - PWA banner should appear with iOS instructions</li>
              <li>Check the Device Detection section above to confirm your device is detected correctly</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}