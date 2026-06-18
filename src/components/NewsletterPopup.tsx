'use client'

import { useState, useEffect } from 'react'
import { X, Mail, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface NewsletterPopupProps {
  delay?: number // Fallback delay in ms if settings can't be fetched
}

interface PopupSettings {
  enabled: boolean
  delaySeconds: number
  headline: string
  bodyText: string
  buttonText: string
}

const DEFAULTS: PopupSettings = {
  enabled: true,
  delaySeconds: 8,
  headline: 'Stay in the Loop',
  bodyText: 'Join thousands of Freetown residents getting weekly computer and mobile repair tips, exclusive service updates, and special offers delivered right to your inbox.',
  buttonText: 'Subscribe Now',
}

export default function NewsletterPopup({ delay }: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [popupSettings, setPopupSettings] = useState<PopupSettings>(DEFAULTS)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    // Fetch live settings from admin panel
    fetch('/api/admin/newsletter-settings')
      .then(res => res.json())
      .then((data: PopupSettings) => {
        setPopupSettings(data)
        setSettingsLoaded(true)
      })
      .catch(() => {
        // Fallback to defaults if fetch fails
        setSettingsLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return

    // Respect admin toggle — don't show if disabled
    if (!popupSettings.enabled) return

    const delayMs = delay !== undefined
      ? delay
      : popupSettings.delaySeconds * 1000

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delayMs)

    return () => clearTimeout(timer)
  }, [settingsLoaded, popupSettings.enabled, popupSettings.delaySeconds, delay])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.status === 409) {
        // Already subscribed — treat as success so the popup closes happily
        setSuccess(true)
        setEmail('')
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      if (data.success) {
        setSuccess(true)
        setEmail('')
        toast.success('Subscription succeeded! Welcome to our newsletter.')

        // Close popup after 3 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
      } else {
        throw new Error(data.error || 'Failed to subscribe')
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto md:overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-300">

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="sticky top-0 right-0 float-right p-2 sm:p-3 hover:bg-gray-100 rounded-bl-lg transition-colors z-20 bg-white/95 backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Left Side - Image */}
            <div className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-3 md:p-6 relative overflow-hidden h-[200px] sm:h-[250px] md:h-auto">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-40 sm:h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-40 sm:h-40 bg-red-200/30 rounded-full blur-3xl"></div>

              <img
                src="/assets/newsletter-woman.png"
                alt="African woman smiling at laptop"
                className="relative z-10 w-full h-full object-cover rounded-xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23E5E7EB" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23999"%3EAdd your photo here%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>

            {/* Right Side - Form */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center">

              <div className="mb-3 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#040e40] to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900">{popupSettings.headline}</h3>
                    <p className="text-xs md:text-sm text-gray-600">Weekly insights &amp; exclusive tips</p>
                  </div>
                </div>
              </div>

              {success ? (
                <div className="text-center">
                  <div className="flex justify-center mb-3 md:mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                    </div>
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Thank You!</h4>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                    You're now subscribed to IT Services Freetown's weekly newsletter. Check your email for confirmation!
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">
                    Expect weekly tips on computer &amp; mobile repair, tech news, and exclusive offers.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 md:mb-6 leading-relaxed">
                    {popupSettings.bodyText}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4" data-form-type="newsletter">
                    <div>
                      <label htmlFor="newsletter-email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 md:mb-2">
                        Email Address
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                        placeholder="your@email.com"
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200"
                        disabled={isLoading}
                        required
                      />
                      {error && (
                        <p className="text-red-500 text-xs mt-2">{error}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#040e40] to-red-600 hover:from-[#040e40]/90 hover:to-red-700 text-white font-semibold py-2 md:py-3 px-3 md:px-4 text-sm md:text-base rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span className="text-xs md:text-base">Subscribing...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span className="text-xs md:text-base">{popupSettings.buttonText}</span>
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center leading-tight md:leading-relaxed">
                      We respect your privacy and never spam. Unsubscribe anytime.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
