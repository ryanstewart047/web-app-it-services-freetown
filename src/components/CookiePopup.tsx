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

  const dismissCookieBanner = () => {
    localStorage.setItem('cookiesAccepted', 'true')
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
      {/* Responsive Cookie Modal with Scrollable Body & Close Button */}
      <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
          
          {/* Header with gradient branding & prominent Close Button */}
          <div className="bg-gradient-to-r from-[#040e40] to-red-600 px-5 sm:px-7 py-5 sm:py-6 relative shrink-0 overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 pointer-events-none"></div>
            
            <div className="relative flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl backdrop-blur-sm shrink-0 shadow-inner">
                  <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">Privacy &amp; Cookies</h2>
                  <p className="text-white/80 text-xs sm:text-sm font-medium">BridgeTech IT Services</p>
                </div>
              </div>
            </div>

            {/* Direct Close Button */}
            <button
              onClick={dismissCookieBanner}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 p-1.5 sm:p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
              title="Close cookies banner"
              aria-label="Close cookies banner"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 md:p-7 overflow-y-auto overscroll-contain flex-1 space-y-5 text-slate-800">
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              We use cookies to enhance your browsing experience, analyze how you use our site, and deliver personalized content. Your privacy and data security are our highest priority.
            </p>

            {!showSettings ? (
              <>
                {/* Cookie types overview */}
                <div className="space-y-3">
                  <div className="flex gap-3.5 items-start p-3.5 sm:p-4 bg-blue-50/80 rounded-xl border border-blue-100">
                    <Shield className="w-5 h-5 text-[#040e40] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Essential Cookies</h3>
                      <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5 leading-snug">Required for core site functionality &amp; security (always enabled)</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-3.5 sm:p-4 bg-amber-50/80 rounded-xl border border-amber-100">
                    <BarChart3 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Analytics Cookies</h3>
                      <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5 leading-snug">Help us improve your experience by understanding aggregate usage patterns</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start p-3.5 sm:p-4 bg-green-50/80 rounded-xl border border-green-100">
                    <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Marketing Cookies</h3>
                      <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5 leading-snug">Show you relevant offers, IT service promotions &amp; recommendations</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button 
                    onClick={acceptAllCookies}
                    className="flex-1 bg-gradient-to-r from-[#040e40] to-red-600 hover:from-[#040e40]/90 hover:to-red-700 text-white font-bold py-3 px-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm text-center"
                  >
                    Accept All Cookies
                  </button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:border-[#040e40] hover:text-[#040e40] font-bold py-3 px-5 rounded-xl transition-all duration-200 text-xs sm:text-sm text-center"
                  >
                    Customize Preferences
                  </button>
                </div>

                <p className="text-center text-[10.5px] sm:text-xs text-slate-400 pt-1">
                  By continuing to use this site, you accept our use of cookies as described above.
                </p>
              </>
            ) : (
              <>
                {/* Settings view */}
                <div className="space-y-3.5">
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Essential Cookies</h4>
                        <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5">Required for basic functionality &amp; sessions</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked 
                        disabled 
                        className="h-5 w-5 flex-shrink-0 accent-[#040e40] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <label className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-[#040e40] transition-colors block">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Analytics Cookies</h4>
                        <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5">Help us understand how visitors interact with the site</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={analytics}
                        onChange={(e) => setAnalytics(e.target.checked)}
                        className="h-5 w-5 flex-shrink-0 accent-red-600 cursor-pointer"
                      />
                    </div>
                  </label>

                  <label className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-[#040e40] transition-colors block">
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Marketing Cookies</h4>
                        <p className="text-slate-600 text-[11px] sm:text-xs mt-0.5">Personalized recommendations and tech news updates</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                        className="h-5 w-5 flex-shrink-0 accent-green-600 cursor-pointer"
                      />
                    </div>
                  </label>
                </div>

                {/* Settings action buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button 
                    onClick={savePreferences}
                    className="flex-1 bg-gradient-to-r from-[#040e40] to-red-600 hover:from-[#040e40]/90 hover:to-red-700 text-white font-bold py-3 px-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-xs sm:text-sm text-center"
                  >
                    Save &amp; Continue
                  </button>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:border-[#040e40] hover:text-[#040e40] font-bold py-3 px-5 rounded-xl transition-all duration-200 text-xs sm:text-sm text-center"
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

