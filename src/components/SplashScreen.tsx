'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Check if user has already seen the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash')
    if (hasSeenSplash) {
      setIsVisible(false)
      return
    }

    // Progress bar simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 30)

    // Start fade out after 2.5 seconds
    const timer = setTimeout(() => {
      setIsAnimatingOut(true)
      sessionStorage.setItem('hasSeenSplash', 'true')
      
      // Fully remove after animation completes
      setTimeout(() => {
        setIsVisible(false)
      }, 800)
    }, 2800)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#040e40] transition-all duration-700 ease-in-out ${
        isAnimatingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className={`mb-8 relative transition-all duration-1000 ${isAnimatingOut ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            {/* Outer spinning glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600 to-blue-600 animate-spin opacity-30 blur-md"></div>
            
            {/* Logo Shadow/Glow */}
            <div className="absolute inset-4 rounded-full bg-white/10 backdrop-blur-sm shadow-2xl"></div>
            
            {/* Actual Logo */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 animate-breathe">
              <Image 
                src="/assets/logo.svg" 
                alt="IT Services Freetown Logo" 
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2 overflow-hidden">
            <span className="block animate-slideUp">
              IT SERVICES <span className="text-red-600">FREETOWN</span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base tracking-[0.3em] font-light uppercase opacity-0 animate-fadeIn" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            Freetown&apos;s #1 Tech Partner
          </p>
        </div>

        {/* Loading Progress */}
        <div className="mt-16 w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-4 text-[10px] text-gray-500 font-mono tracking-widest uppercase">
          Initializing System... {Math.round(progress)}%
        </div>
      </div>

      {/* CSS for custom animations that Tailwind doesn't have by default */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-slideUp {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
