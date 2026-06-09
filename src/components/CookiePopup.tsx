'use client'

import { useState, useEffect } from 'react'
import { Cookie, Shield, BarChart3, Zap, X } from 'lucide-react'

export default function CookiePopup() {
  const [isVisible, setIsVisible] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  useEffect(() => {
    const cookieAccepted = localStorage.getItem('cookiesAccepted')
    if (cookieAccepted) {
      setIsVisible(false)
    }
  }, [])

  const acceptAllCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    localStorage.setItem('analyticsCookies', 'true')
    localStorage.setItem('marketingCookies', 'true')
    setIsVisible(false)
    setShowSettings(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    localStorage.setItem('analyticsCookies', analytics.toString())
    localStorage.setItem('marketingCookies', marketing.toString())
    setIsVisible(false)
    setShowSettings(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Mandatory Cookie Modal - Blocks content until accepted */}
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header with gradient branding */}
          <div className="bg-gradient-to-r from-[#040e40] to-red-600 px-6 md:px-8 py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Privacy & Cookies</h2>
            </div>
            <p className="text-white/80 text-sm md:text-base">IT Services Freetown</p>
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 py-8">
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-8">
              We use cookies to enhance your browsing experience, analyze how you use our site, and deliver personalized content. Your privacy is important to us.
            </p>

            {!showSettings ? (
              <>
                {/* Cookie types overview */}
                <div className="space-y-4 mb-8">
                  <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Shield className="w-5 h-5 text-[#040e40] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Essential Cookies</h3>
                      <p className="text-gray-600 text-xs mt-1">Required for site functionality (always enabled)</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <BarChart3 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Analytics Cookies</h3>
                      <p className="text-gray-600 text-xs mt-1">Help us improve your experience by understanding usage patterns</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-green-50 rounded-lg border border-green-100">
                    <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Marketing Cookies</h3>
                      <p className="text-gray-600 text-xs mt-1">Show you relevant offers and recommendations</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={acceptAllCookies}
                    className="w-full bg-gradient-to-r from-[#040e40] to-red-600 hover:from-[#040e40]/90 hover:to-red-700 text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
                  >
                    Accept All Cookies
                  </button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#040e40] hover:text-[#040e40] font-semibold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 text-sm md:text-base"
                  >
                    Customize Preferences
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                  By continuing to use this site, you accept our use of cookies as described above.
                </p>
              </>
            ) : (
              <>
                {/* Settings view */}
                <div className="space-y-5 mb-8">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">Essential Cookies</h4>
                        <p className="text-gray-600 text-xs mt-1">Required for basic functionality</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked 
                        disabled 
                        className="h-5 w-5 flex-shrink-0 accent-[#040e40]"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-[#040e40] transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">Analytics Cookies</h4>
                        <p className="text-gray-600 text-xs mt-1">Help us understand how you use our site</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={analytics}
                        onChange={(e) => setAnalytics(e.target.checked)}
                        className="h-5 w-5 flex-shrink-0 accent-red-600"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-[#040e40] transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">Marketing Cookies</h4>
                        <p className="text-gray-600 text-xs mt-1">Personalized content and offers</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                        className="h-5 w-5 flex-shrink-0 accent-green-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings action buttons */}
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={savePreferences}
                    className="w-full bg-gradient-to-r from-[#040e40] to-red-600 hover:from-[#040e40]/90 hover:to-red-700 text-white font-semibold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
                  >
                    Save & Continue
                  </button>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#040e40] hover:text-[#040e40] font-semibold py-3 md:py-4 px-6 rounded-lg transition-all duration-200 text-sm md:text-base"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
