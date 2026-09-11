'use client'

import React, { useEffect, useState } from 'react'
import {
  X, Download, Share, ChevronRight,
  Zap, Shield, WifiOff, Star, Smartphone, Bell, ArrowRight
} from 'lucide-react'
import { BRAND_NAME } from '@/lib/brand'

const AVATAR = '/assets/bridgetech-avatar-transparent.png'
const MOCKUP = '/assets/pwa-iphone-mockup.jpg'

interface Props {
  isOpen: boolean
  isIOS: boolean
  onInstall: () => void
  onClose: () => void
}

const STEPS = [
  { id: 'preview' },
  {
    id: 'benefit1',
    icon: Zap,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
    title: 'Lightning Fast Access',
    body: "Launch BridgeTech IT Services instantly from your home screen — no browser, no delays. One tap and you're in.",
    sub: 'Avg. 3× faster than visiting via browser',
  },
  {
    id: 'benefit2',
    icon: WifiOff,
    color: '#22d3ee',
    bg: 'rgba(34,211,238,0.10)',
    border: 'rgba(34,211,238,0.22)',
    title: 'Works Offline Too',
    body: 'Browse services, check repair status, and view your bookings — even without an internet connection.',
    sub: 'Your data is cached securely on-device',
  },
  {
    id: 'benefit3',
    icon: Bell,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.22)',
    title: 'Stay in the Loop',
    body: 'Get real-time notifications on repair updates, promotions, and new services from BridgeTech IT Services.',
    sub: 'Never miss an update on your device',
  },
  {
    id: 'benefit4',
    icon: Shield,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.22)',
    title: 'Secure & Private',
    body: 'Your information stays safe. We use end-to-end security, no third-party tracking, and your data never leaves your control.',
    sub: 'SSL encrypted · No ads · No tracking',
  },
  { id: 'install' },
]

export default function PWAPhoneMockup({ isOpen, isIOS, onInstall, onClose }: Props) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<'forward' | 'back'>('forward')
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStep(0)
      requestAnimationFrame(() => setTimeout(() => setVisible(true), 20))
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const goTo = (next: number) => {
    if (animating) return
    setDir(next > step ? 'forward' : 'back')
    setAnimating(true)
    setTimeout(() => {
      setStep(next)
      setAnimating(false)
    }, 220)
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  // Progress dots (skip first + last for dot display)
  const benefitCount = STEPS.length - 2 // steps 1-4
  const benefitStep = step - 1          // 0-indexed within benefits

  return (
    <div
      className={`fixed inset-0 z-[9995] flex items-end sm:items-center justify-center transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(2,6,30,0.93)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden transition-all duration-500 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'
        }`}
        style={{
          background: 'linear-gradient(155deg, #040e40 0%, #12082a 55%, #5b0000 100%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
          minHeight: 480,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.25) 0%, transparent 70%)' }} />

        {/* ── Top bar: avatar logo + title + close ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-white/15"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <img src={AVATAR} alt={BRAND_NAME} className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-white font-black text-[13px] leading-none">{BRAND_NAME}</p>
              <p className="text-white/40 text-[10px] mt-0.5">
                {isLast ? 'Ready to install' : isFirst ? 'App Preview' : `Benefit ${step} of ${benefitCount}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Progress bar (hidden on preview & install slides) ── */}
        {!isFirst && !isLast && (
          <div className="flex gap-1.5 px-5 mb-1">
            {Array.from({ length: benefitCount }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{
                  background: i < benefitStep
                    ? 'rgba(167,139,250,0.9)'
                    : i === benefitStep
                    ? 'rgba(167,139,250,0.6)'
                    : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        )}

        {/* ── Slide content ── */}
        <div
          className="transition-all duration-220"
          style={{ opacity: animating ? 0 : 1, transform: animating ? `translateX(${dir === 'forward' ? '18px' : '-18px'})` : 'translateX(0)' }}
        >

          {/* ── STEP 0: iPhone Preview ── */}
          {current.id === 'preview' && (
            <div className="flex flex-col items-center px-5 pb-2">
              <p className="text-white/60 text-xs text-center mb-3">
                See exactly how the app looks on your device
              </p>
              {/* iPhone mockup */}
              <div className="relative flex justify-center w-full">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 65%)' }} />
                </div>
                <div
                  className="relative z-10 w-48 rounded-[1.75rem] overflow-hidden"
                  style={{
                    transform: 'perspective(900px) rotateY(-5deg) rotateX(2deg)',
                    filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(99,102,241,0.2))',
                  }}
                >
                  <img src={MOCKUP} alt={`${BRAND_NAME} on iPhone`} className="w-full h-auto block" loading="eager" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEPS 1–4: Benefit slides ── */}
          {current.id?.startsWith('benefit') && (() => {
            const s = current as typeof STEPS[1]
            const Icon = s.icon as React.ElementType
            return (
              <div className="px-6 pt-2 pb-4">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center border"
                    style={{ background: s.bg, borderColor: s.border }}>
                    <Icon className="w-9 h-9" style={{ color: s.color }} />
                  </div>
                </div>
                {/* Text */}
                <h3 className="text-white font-black text-xl text-center leading-tight mb-3">
                  {s.title}
                </h3>
                <p className="text-white/65 text-sm text-center leading-relaxed mb-4">
                  {s.body}
                </p>
                {/* Sub-badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
                    style={{ background: s.bg, borderColor: s.border }}>
                    <Star className="w-3 h-3" style={{ color: s.color }} />
                    <span className="text-[11px] font-semibold" style={{ color: s.color }}>{s.sub}</span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ── STEP 5: Install slide ── */}
          {current.id === 'install' && (
            <div className="px-6 pt-2 pb-4 flex flex-col items-center">
              {/* Big avatar */}
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center border border-white/15 shadow-xl mb-4"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <img src={AVATAR} alt={BRAND_NAME} className="w-20 h-20 object-contain" />
              </div>
              <h3 className="text-white font-black text-xl text-center leading-tight mb-2">
                You're all set!
              </h3>
              <p className="text-white/60 text-sm text-center leading-relaxed mb-4">
                Add <span className="text-white font-semibold">{BRAND_NAME}</span> to your home screen for instant, offline-ready access to all our services.
              </p>
              {/* iOS specific hint */}
              {isIOS && (
                <div className="w-full mb-4 rounded-2xl px-4 py-3 border text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                  <p className="text-white/80 text-xs font-semibold mb-1">On Safari (iOS):</p>
                  <p className="text-white/55 text-xs">
                    Tap <span className="font-bold text-white/75">Share ⎙</span> at the bottom → scroll to <span className="font-bold text-white/75">Add to Home Screen</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom nav: Back / dots / Next or Install ── */}
        <div className="px-5 pb-6 pt-2 flex flex-col gap-3">

          {/* Primary CTA */}
          {isLast ? (
            <button
              onClick={onInstall}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-[0.97] hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #1d4ed8 100%)',
                boxShadow: '0 8px 24px rgba(79,70,229,0.55)',
              }}
            >
              {isIOS ? <Share className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              {isIOS ? 'Add to Home Screen' : "Install Now — It's Free"}
            </button>
          ) : (
            <button
              onClick={() => goTo(step + 1)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-[0.97] hover:brightness-110"
              style={{
                background: isFirst
                  ? 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)'
                  : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                boxShadow: isFirst ? '0 8px 24px rgba(79,70,229,0.45)' : '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {isFirst ? 'See the Benefits' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Back + dots + skip row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => isFirst ? onClose() : goTo(step - 1)}
              className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors px-1"
            >
              {isFirst ? 'Maybe later' : '← Back'}
            </button>

            {/* Step dots (only on benefit slides) */}
            {!isFirst && !isLast && (
              <div className="flex gap-1.5">
                {Array.from({ length: benefitCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i + 1)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === benefitStep ? 16 : 6,
                      height: 6,
                      background: i === benefitStep ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>
            )}

            {!isLast && !isFirst && (
              <button
                onClick={() => goTo(STEPS.length - 1)}
                className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-0.5 px-1"
              >
                Skip <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {isFirst && <div />}
            {isLast && (
              <button
                onClick={onClose}
                className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors px-1"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
