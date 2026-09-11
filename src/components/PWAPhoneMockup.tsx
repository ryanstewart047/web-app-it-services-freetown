'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share, Star, Zap, Shield, Wrench } from 'lucide-react'
import { BRAND_NAME } from '@/lib/brand'

interface PWAPhoneMockupProps {
  isOpen: boolean
  isIOS: boolean
  onInstall: () => void
  onClose: () => void
}

export default function PWAPhoneMockup({ isOpen, isIOS, onInstall, onClose }: PWAPhoneMockupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setTimeout(() => setVisible(true), 20))
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[9995] flex items-end sm:items-center justify-center transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(2,6,30,0.92)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden transition-all duration-500 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'
        }`}
        style={{
          background: 'linear-gradient(155deg, #040e40 0%, #12082a 55%, #5b0000 100%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.3) 0%, transparent 70%)' }} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.13)' }}
          aria-label="Close"
        >
          <X className="w-4 h-4 text-white" strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="pt-6 pb-1 px-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-3 border"
            style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)' }}>
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">App Preview</span>
          </div>
          <h2 className="text-white font-black text-lg leading-tight">{BRAND_NAME}</h2>
          <p className="text-white/50 text-xs mt-1">See how it looks on your phone</p>
        </div>

        {/* ── iPhone mockup image ── */}
        <div className="relative flex justify-center px-6 py-3">
          {/* Bloom glow behind phone */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 65%)' }} />
          </div>

          <div
            className="relative z-10 w-52 rounded-[2rem] overflow-hidden"
            style={{
              transform: 'perspective(900px) rotateY(-6deg) rotateX(2deg)',
              filter: 'drop-shadow(0 28px 52px rgba(0,0,0,0.75)) drop-shadow(0 0 28px rgba(99,102,241,0.25))',
            }}
          >
            <img
              src="/assets/pwa-iphone-mockup.jpg"
              alt={`${BRAND_NAME} app preview on iPhone`}
              className="w-full h-auto block"
              loading="eager"
            />
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex justify-center gap-2 px-5 pb-2 flex-wrap">
          {[
            { icon: Shield, label: 'Secure' },
            { icon: Zap, label: 'Offline Ready' },
            { icon: Star, label: 'Fast Access' },
            { icon: Wrench, label: 'Full Features' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border"
              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.11)' }}
            >
              <Icon className="w-2.5 h-2.5 text-indigo-300" />
              <span className="text-[10px] font-semibold text-white/65">{label}</span>
            </div>
          ))}
        </div>

        {/* iOS share hint */}
        {isIOS && (
          <p className="text-center text-white/40 text-[10px] px-6 pt-1 pb-0">
            Tap <span className="text-white/65 font-semibold">Share ⎙</span> → <span className="text-white/65 font-semibold">Add to Home Screen</span>
          </p>
        )}

        {/* Action buttons */}
        <div className="px-5 pt-3 pb-6 flex flex-col gap-2">
          <button
            onClick={onInstall}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-[0.97] hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #1d4ed8 100%)',
              boxShadow: '0 8px 24px rgba(79,70,229,0.5)',
            }}
          >
            {isIOS ? <Share className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {isIOS ? 'Add to Home Screen' : "Install Now — It's Free"}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-white/35 hover:text-white/55 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
