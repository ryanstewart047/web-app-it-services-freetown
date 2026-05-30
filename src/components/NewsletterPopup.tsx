'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { X, Mail, CheckCircle } from 'lucide-react'

const ReCAPTCHA = dynamic(() => import('react-google-recaptcha'), { ssr: false })

interface NewsletterPopupProps {
  delay?: number // Delay in milliseconds before showing popup
}

export default function NewsletterPopup({ delay = 8000 }: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const recaptchaRef = useRef<any>(null)

  useEffect(() => {
    // Show popup after delay on each page load
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Get CAPTCHA token
      let captchaToken = null
      if (recaptchaRef.current) {
        captchaToken = await recaptchaRef.current.executeAsync()
      }

      // Verify CAPTCHA
      if (captchaToken) {
        const captchaResponse = await fetch('/api/verify-recaptcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: captchaToken })
        })

        if (!captchaResponse.ok) {
          throw new Error('CAPTCHA verification failed')
        }
      }

      // Submit to form analytics API with newsletter type
      const response = await fetch('/api/analytics/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'submission',
          formType: 'newsletter',
          fields: {
            email: email
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to subscribe')
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setEmail('')
        
        // Close popup after 3 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
      } else {
        throw new Error(data.message || 'Failed to subscribe')
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
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
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto md:overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-300">
          
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
                  // Fallback to a placeholder if image not found
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"%3E%3Crect fill="%23E5E7EB" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%23999"%3EAdd your photo here%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
            
            {/* Right Side - Form */}
            <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center">
              
              {/* Close Button - Mobile */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Close Button - Desktop */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 md:top-6 md:right-6 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
              
              <div className="mb-3 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#040e40] to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900">Stay in the Loop</h3>
                    <p className="text-xs md:text-sm text-gray-600">Weekly insights & exclusive tips</p>
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
                  Expect weekly tips on computer & mobile repair, tech news, and exclusive offers.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-xs sm:text-sm mb-4 md:mb-6 leading-relaxed">
                  Join thousands of Freetown residents getting weekly computer and mobile repair tips, exclusive service updates, and special offers delivered right to your inbox.
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

                  {/* Google reCAPTCHA */}
                  {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                    <div className="flex justify-center my-3">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                        size="compact"
                      />
                    </div>
                  )}

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
                        <span className="text-xs md:text-base">Subscribe Now</span>
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
