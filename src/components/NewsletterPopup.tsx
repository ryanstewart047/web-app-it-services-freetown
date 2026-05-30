'use client'

import { useState, useEffect } from 'react'
import { X, Mail, CheckCircle } from 'lucide-react'

interface NewsletterPopupProps {
  delay?: number // Delay in milliseconds before showing popup
}

export default function NewsletterPopup({ delay = 8000 }: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if user has already seen this popup
    const hasSeenNewsletter = localStorage.getItem('newsletter-popup-shown')
    if (hasSeenNewsletter) {
      return
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true)
      setHasShown(true)
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
        throw new Error('Failed to subscribe')
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccess(true)
        setEmail('')
        
        // Store that user has seen this popup
        localStorage.setItem('newsletter-popup-shown', 'true')
        
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
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    // Mark that user has dismissed the popup
    if (hasShown) {
      localStorage.setItem('newsletter-popup-shown', 'true')
    }
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#040e40] to-red-600 p-6 text-white relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Stay in the Loop</h3>
                <p className="text-sm text-white/90">Weekly insights from IT Services Freetown</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-600 text-sm">
                  You're now subscribed to our weekly newsletter. Check your email for confirmation!
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Get the latest computer and mobile repair tips, exclusive offers, and IT service updates delivered to your inbox every week.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4" data-form-type="newsletter">
                  <div>
                    <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-200"
                      disabled={isLoading}
                      required
                    />
                    {error && (
                      <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#040e40] to-red-600 hover:from-[#040e40]/90 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Subscribe Now
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
