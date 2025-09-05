'use client'

import { useState, useEffect } from 'react'

export default function CookiePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const cookieAccepted = localStorage.getItem('cookiesAccepted')
    if (!cookieAccepted) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAllCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    localStorage.setItem('analyticsCookies', 'true')
    localStorage.setItem('marketingCookies', 'true')
    setIsVisible(false)
    setShowSettings(false)
  }

  const acceptEssentialOnly = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    localStorage.setItem('analyticsCookies', 'false')
    localStorage.setItem('marketingCookies', 'false')
    setIsVisible(false)
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
      {/* Cookie Popup */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 transform transition-transform duration-500 ease-out">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <i className="fas fa-cookie-bite text-2xl text-amber-500"></i>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">We use cookies</h4>
                  <p className="text-gray-600 text-sm mb-4">We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Settings
              </button>
              <button 
                onClick={acceptAllCookies}
                className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Cookie Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                    <p className="text-sm text-gray-600 mt-1">Required for basic site functionality</p>
                  </div>
                  <input type="checkbox" checked disabled className="mt-1 h-5 w-5 text-primary-600" />
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600 mt-1">Help us understand how you use our site</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-1 h-5 w-5 text-primary-600" 
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600 mt-1">Used to show you relevant advertisements</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-1 h-5 w-5 text-primary-600" 
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-8">
                <button 
                  onClick={savePreferences}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Save Preferences
                </button>
                <button 
                  onClick={acceptAllCookies}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
