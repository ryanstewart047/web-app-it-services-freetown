'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand'

// Auth step for the footer admin modal
type AuthStep = 'password' | '2fa' | 'panels'

export default function Footer() {
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [authStep, setAuthStep] = useState<AuthStep>('password')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 2FA state
  const [pendingToken, setPendingToken] = useState('')
  const [twoFAMode, setTwoFAMode] = useState<'email' | 'totp' | 'both'>('email')
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFAMethod, setTwoFAMethod] = useState<'email' | 'totp'>('email')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  // Newsletter form state
  const [nlEmail, setNlEmail] = useState('')
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')
  const [nlError, setNlError] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlEmail.trim()) return
    setNlStatus('loading')
    setNlError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail.trim() }),
      })
      if (res.status === 409) {
        const data = await res.json()
        setNlStatus('duplicate')
        setNlError(data.error || 'This email is already subscribed to our newsletter.')
      } else if (res.ok) {
        setNlStatus('success')
        setNlEmail('')
      } else {
        const data = await res.json()
        setNlStatus('error')
        setNlError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setNlStatus('error')
      setNlError('Network error. Please try again.')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setPassword('')
        if (data.requires2FA) {
          // Must complete 2FA before seeing panels
          setPendingToken(data.pendingToken || '')
          setTwoFAMode(data.mode || 'email')
          setTwoFAMethod(data.mode === 'totp' ? 'totp' : 'email')
          setRecipientEmail(data.recipientEmail || '')
          setAuthStep('2fa')
        } else {
          // 2FA disabled — grant access directly
          setAuthStep('panels')
        }
      } else {
        if (response.status === 429) {
          setError('Too many login attempts. Please try again later.')
        } else {
          setError('Incorrect password. Please try again.')
        }
        setPassword('')
      }
    } catch {
      setError('Login failed. Please try again.')
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/admin/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken, method: twoFAMethod, code: twoFACode.trim() }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setTwoFACode('')
        setAuthStep('panels')
      } else {
        setError(data.error || 'Invalid code. Please try again.')
        setTwoFACode('')
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    setResending(true)
    setResendMsg('')
    setError('')
    try {
      const res = await fetch('/api/admin/auth/resend-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken }),
      })
      const data = await res.json()
      if (res.ok && data.newPendingToken) {
        setPendingToken(data.newPendingToken)
        setResendMsg('New code sent to your email!')
      } else {
        setResendMsg('Failed to resend. Try again.')
      }
    } catch {
      setResendMsg('Network error. Try again.')
    } finally {
      setResending(false)
    }
  }

  const handleClose = () => {
    setShowAdminPanel(false)
    setAuthStep('password')
    setPassword('')
    setTwoFACode('')
    setPendingToken('')
    setError('')
    setResendMsg('')
  }

  return (
    <footer className="bg-gradient-to-br from-[#040e40] via-[#040e40] to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-gradient-to-br from-[#040e40] via-[#040e40] to-gray-900 border-2 border-red-500/50 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <i className="fas fa-shield-alt text-red-400 mr-3"></i>
                  Admin Panels
                </h3>
                <button 
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* ── STEP 1: Password ── */}
              {authStep === 'password' && (
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-lock text-red-400 text-3xl"></i>
                    </div>
                    <p className="text-white font-semibold mb-1">Admin Access</p>
                    <p className="text-gray-300 text-sm">Enter your admin password to continue</p>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4" data-no-analytics="true">
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        autoFocus
                        disabled={isSubmitting}
                      />
                      {error && (
                        <p className="text-red-400 text-sm mt-2 flex items-center">
                          <i className="fas fa-exclamation-circle mr-2"></i>
                          {error}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !password}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:scale-100"
                    >
                      {isSubmitting
                        ? <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying…</>
                        : <><i className="fas fa-arrow-right mr-2"></i>Continue</>
                      }
                    </button>
                  </form>
                </div>
              )}

              {/* ── STEP 2: 2FA Verification ── */}
              {authStep === '2fa' && (
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-shield-halved text-amber-400 text-3xl"></i>
                    </div>
                    <p className="text-white font-semibold mb-1">Two-Factor Verification</p>
                    <p className="text-gray-300 text-sm">
                      {twoFAMethod === 'email'
                        ? <>A 6-digit code was sent to <span className="text-amber-300 font-medium">{recipientEmail}</span></>
                        : <>Enter the code from your <span className="text-amber-300 font-medium">Authenticator App</span></>
                      }
                    </p>
                  </div>

                  {/* Method toggle when mode is 'both' */}
                  {twoFAMode === 'both' && (
                    <div className="flex rounded-lg overflow-hidden border border-white/20 mb-4">
                      <button
                        type="button"
                        onClick={() => { setTwoFAMethod('email'); setError('') }}
                        className={`flex-1 py-2 text-sm font-semibold transition-all ${
                          twoFAMethod === 'email' ? 'bg-amber-500/30 text-amber-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <i className="fas fa-envelope mr-1"></i> Email Code
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTwoFAMethod('totp'); setError('') }}
                        className={`flex-1 py-2 text-sm font-semibold transition-all ${
                          twoFAMethod === 'totp' ? 'bg-amber-500/30 text-amber-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <i className="fas fa-mobile-screen mr-1"></i> Auth App
                      </button>
                    </div>
                  )}

                  <form onSubmit={handle2FASubmit} className="space-y-4" data-no-analytics="true">
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={twoFACode}
                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-2xl tracking-[0.5em] font-mono"
                        maxLength={6}
                        autoFocus
                        disabled={isSubmitting}
                      />
                      {error && (
                        <p className="text-red-400 text-sm mt-2 flex items-center">
                          <i className="fas fa-exclamation-circle mr-2"></i>
                          {error}
                        </p>
                      )}
                      {resendMsg && (
                        <p className="text-emerald-400 text-sm mt-2 flex items-center">
                          <i className="fas fa-check-circle mr-2"></i>
                          {resendMsg}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || twoFACode.length < 6}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-all hover:scale-105 disabled:scale-100"
                    >
                      {isSubmitting
                        ? <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying…</>
                        : <><i className="fas fa-unlock-alt mr-2"></i>Verify & Access Panels</>
                      }
                    </button>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => { setAuthStep('password'); setError(''); setTwoFACode('') }}
                        className="text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        <i className="fas fa-arrow-left mr-1"></i> Back
                      </button>
                      {twoFAMethod === 'email' && (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resending}
                          className="text-amber-400 hover:text-amber-300 text-xs transition-colors disabled:opacity-60"
                        >
                          {resending ? 'Sending…' : <><i className="fas fa-redo mr-1"></i>Resend Code</>}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* ── STEP 3: Panels Grid ── */}
              {authStep === 'panels' && (
                <>
                  <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 p-4 rounded-xl text-white flex items-center justify-between shadow-lg">
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <i className="fas fa-shield-alt"></i> Unified Master Admin Console
                      </h3>
                      <p className="text-emerald-100 text-xs mt-0.5">Manage all 20 administration modules from a single unified workspace</p>
                    </div>
                    <Link
                      href="/admin"
                      className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-lg hover:bg-emerald-50 transition-all shadow shrink-0"
                      onClick={handleClose}
                    >
                      Launch Master Hub
                    </Link>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 font-medium">Or jump directly to a panel:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <Link href="/admin?tab=dashboard" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-tachometer-alt text-cyan-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Dashboard</h4>
                      <p className="text-gray-400 text-xs mt-1">Overview & analytics</p>
                    </Link>
                    <Link href="/admin?tab=blog-admin" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-blog text-orange-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Blog Admin</h4>
                      <p className="text-gray-400 text-xs mt-1">Manage blog posts</p>
                    </Link>
                    <Link href="/admin?tab=receipt" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-receipt text-green-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Receipt Generator</h4>
                      <p className="text-gray-400 text-xs mt-1">Create receipts</p>
                    </Link>
                    <Link href="/admin?tab=offer-admin" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-gift text-pink-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Offer Admin</h4>
                      <p className="text-gray-400 text-xs mt-1">Manage special offers</p>
                    </Link>
                    <Link href="/admin?tab=products" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-box text-blue-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Manage Products</h4>
                      <p className="text-gray-400 text-xs mt-1">Marketplace products</p>
                    </Link>
                    <Link href="/admin?tab=add-product" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-plus-circle text-green-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Add Product</h4>
                      <p className="text-gray-400 text-xs mt-1">Quick add new product</p>
                    </Link>
                    <Link href="/admin?tab=orders" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-shopping-cart text-yellow-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">View Orders</h4>
                      <p className="text-gray-400 text-xs mt-1">Track customer orders</p>
                    </Link>
                    <Link href="/admin?tab=categories" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-tags text-purple-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Categories</h4>
                      <p className="text-gray-400 text-xs mt-1">Organize products</p>
                    </Link>
                    <Link href="/admin?tab=bookings" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-calendar-alt text-red-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Bookings</h4>
                      <p className="text-gray-400 text-xs mt-1">Service appointments</p>
                    </Link>
                    <Link href="/admin?tab=forum-admin" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-users-gear text-indigo-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Forum Admin</h4>
                      <p className="text-gray-400 text-xs mt-1">Manage technicians</p>
                    </Link>
                    <Link href="/admin?tab=banner-admin" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-bell text-red-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Global Banner</h4>
                      <p className="text-gray-400 text-xs mt-1">Site announcements</p>
                    </Link>
                    <Link href="/admin?tab=email-leads" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-envelope-open-text text-blue-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Email Leads</h4>
                      <p className="text-gray-400 text-xs mt-1">Customer lead collection</p>
                    </Link>
                    <Link href="/admin?tab=email-marketing" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-paper-plane text-red-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Email Marketing</h4>
                      <p className="text-gray-400 text-xs mt-1">Send HTML campaigns</p>
                    </Link>
                    <Link href="/admin?tab=newsletter-popup" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-envelope text-indigo-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Newsletter Popup</h4>
                      <p className="text-gray-400 text-xs mt-1">Popup settings & stats</p>
                    </Link>
                    <Link href="/admin?tab=ads-admin" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-ad text-yellow-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Manage Ads</h4>
                      <p className="text-gray-400 text-xs mt-1">Custom ad banners</p>
                    </Link>
                    <Link href="/admin?tab=discount-codes" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-ticket-alt text-teal-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Discount Codes</h4>
                      <p className="text-gray-400 text-xs mt-1">Manage promo codes</p>
                    </Link>
                    <Link href="/admin?tab=bulk-upload" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-file-upload text-green-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Bulk Upload</h4>
                      <p className="text-gray-400 text-xs mt-1">Upload multiple products</p>
                    </Link>
                    <Link href="/admin?tab=bridge-gallery" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fas fa-bridge-water text-blue-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Bridge Gallery Admin</h4>
                      <p className="text-gray-400 text-xs mt-1">Manage project photos</p>
                    </Link>
                    <Link href="/admin?tab=facebook-auto" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3.5 transition-all hover:scale-[1.03] group" onClick={handleClose}>
                      <i className="fab fa-facebook text-blue-500 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
                      <h4 className="text-white font-semibold text-sm">Facebook Auto</h4>
                      <p className="text-gray-400 text-xs mt-1">Auto-post & integrations</p>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image 
             src={BRAND_LOGO_SRC}
             alt={`${BRAND_NAME} Logo`}
             width={56}
             height={56}
             className="footer-logo"
             style={{ width: 'auto' }}
              />
            </div>
            <p className="text-gray-200 mb-6 max-w-md leading-relaxed">
              Professional computer and mobile repair services in Freetown, Sierra Leone. 
              We provide expert repairs with real-time tracking, AI-powered support, and genuine parts warranty.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                  <i className="fas fa-phone text-primary-400 text-sm"></i>
                </div>
                <span className="text-gray-300 text-sm">+232 33 399391</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                  <i className="fas fa-envelope text-primary-400 text-sm"></i>
                </div>
                <span className="text-gray-300 text-sm">support@itservicesfreetown.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center mt-0.5">
                  <i className="fas fa-map-marker-alt text-primary-400 text-sm"></i>
                </div>
                <span className="text-gray-300 text-sm">
                  #1 Regent Highway, Jui Junction<br />
                  Freetown, Sierra Leone
                </span>
              </div>
            </div>

            {/* Social Links */}
                        <div className="flex space-x-4">
              <a 
                href="https://facebook.com/itservicefreetown" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our Facebook page"
                className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-facebook-f" aria-hidden="true"></i>
              </a>
              <a 
                href="https://twitter.com/itservicesft" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-twitter" aria-hidden="true"></i>
              </a>
              <a 
                href="https://instagram.com/itservicesfreetown" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
              <a 
                href="https://youtube.com/@itservicesfreetown" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit our YouTube channel"
                className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-youtube" aria-hidden="true"></i>
              </a>
              <a 
                href="https://wa.me/23233399391" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-whatsapp" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b-2 border-red-500 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-home mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Home</span>
                </Link>
              </li>
              {/* Special Shop Link */}
              <li>
                <Link 
                  href="/marketplace" 
                  className="relative inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <i className="fas fa-shopping-bag text-white drop-shadow-lg relative z-10"></i>
                  <span className="drop-shadow-lg relative z-10">Shop Now</span>
                  <span className="text-sm animate-bounce inline-block relative z-10">🔥</span>
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300 -z-10"></span>
                </Link>
              </li>
              <li>
                <Link href="/book-appointment" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-calendar-alt mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Book Appointment</span>
                </Link>
              </li>
              <li>
                <Link href="/track-repair" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-search mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Track Repair</span>
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-robot mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">AI Support</span>
                </Link>
              </li>
              <li>
                <Link href="/repair-guides" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-book-medical mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Repair Guides</span>
                </Link>
              </li>
              <li>
                <Link href="/forum" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-users mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform font-semibold text-white">Tech Forum</span>
                </Link>
              </li>
              <li>
                <Link href="/troubleshoot" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-wrench mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Troubleshoot</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b-2 border-red-500 pb-2 inline-block">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-desktop mr-3 text-red-500 w-4"></i>
                Computer Repair
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-mobile-alt mr-3 text-red-500 w-4"></i>
                Mobile Repair
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-network-wired mr-3 text-red-500 w-4"></i>
                Network Setup
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-hdd mr-3 text-red-500 w-4"></i>
                Data Recovery
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-unlock-alt mr-3 text-red-500 w-4"></i>
                Mobile Unlocking
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-microchip mr-3 text-red-500 w-4"></i>
                Motherboard Repair
              </li>
            </ul>

            {/* Business Hours */}
            <div className="mt-6 p-4 bg-red-900/20 rounded-xl border border-red-500/30">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                <i className="fas fa-clock text-red-400 mr-2"></i>
                Business Hours
              </h4>
              <p className="text-gray-200 text-xs">
                Monday - Friday<br />
                <span className="text-red-400 font-medium">8:00 AM - 6:00 PM</span>
              </p>
              <p className="text-gray-200 text-xs mt-1">
                Saturday: <span className="text-red-400 font-medium">By Appointment</span>
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Subscribe */}
        <div className="border-t border-red-900/30 mt-8 pt-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold text-white mb-1">
              <i className="fas fa-envelope-open-text text-red-400 mr-2" aria-hidden="true" />
              Stay in the Loop
            </h3>
            <p className="text-gray-400 text-sm mb-5">
              Get repair tips, device guides, and exclusive offers delivered to your inbox.
            </p>

            {nlStatus === 'success' ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/30 px-5 py-3 text-sm font-semibold text-green-400">
                <i className="fas fa-check-circle" aria-hidden="true" />
                You&apos;re subscribed! Check your inbox for updates.
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                data-no-analytics="true"
              >
                <input
                  type="email"
                  value={nlEmail}
                  onChange={(e) => setNlEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  aria-label="Email address for newsletter"
                  className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={nlStatus === 'loading'}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-60 px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 disabled:scale-100 whitespace-nowrap"
                >
                  {nlStatus === 'loading' ? (
                    <><i className="fas fa-spinner fa-spin mr-1" aria-hidden="true" /> Subscribing…</>
                  ) : (
                    <><i className="fas fa-paper-plane mr-1" aria-hidden="true" /> Subscribe</>
                  )}
                </button>
              </form>
            )}

            {(nlStatus === 'duplicate' || nlStatus === 'error') && (
              <p className={`mt-3 text-xs font-medium ${nlStatus === 'duplicate' ? 'text-amber-400' : 'text-red-400'}`}>
                <i className={`fas ${nlStatus === 'duplicate' ? 'fa-info-circle' : 'fa-exclamation-circle'} mr-1`} aria-hidden="true" />
                {nlError}
              </p>
            )}
          </div>
        </div>

        {/* Legal Links */}

        <div className="border-t border-red-900/30 mt-8 pt-6">
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-red-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms" className="text-gray-400 hover:text-red-400 transition-colors">
              Terms of Service
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/disclaimer" className="text-gray-400 hover:text-red-400 transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-red-900/30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex flex-col text-gray-300 text-sm">
                <span>© {new Date().getFullYear()} IT Services Freetown. All rights reserved.</span>
                <span className="mt-1">1 Regent High way, Jui Junction, East Freetown</span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span className="flex items-center">
                  <i className="fas fa-shield-alt mr-1 text-red-400"></i>
                  Genuine Parts
                </span>
                <span className="flex items-center">
                  <i className="fas fa-certificate mr-1 text-red-400"></i>
                  Certified Technicians
                </span>
                <span className="flex items-center">
                  <i className="fas fa-clock mr-1 text-red-400"></i>
                  Real-time Tracking
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowAdminPanel(true)}
                className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
                title="Admin Access"
              >
                <i className="fas fa-lock"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
