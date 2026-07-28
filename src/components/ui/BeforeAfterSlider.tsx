'use client'

import { useState, useRef, useEffect } from 'react'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  alt?: string
}

export function BeforeAfterSlider({ beforeImage, afterImage, alt = 'Before and After Repair' }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [beforeError, setBeforeError] = useState(false)
  const [afterError, setAfterError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(position)
  }

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!isDragging) return
    handleMove((e as MouseEvent).clientX)
  }

  const handleTouchMove = (e: TouchEvent | React.TouchEvent) => {
    if (!isDragging) return
    handleMove((e as TouchEvent).touches[0].clientX)
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    const handleTouchEnd = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove as any)
      window.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove as any)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging])

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden cursor-ew-resize select-none bg-slate-900 shadow-inner border border-slate-700/40"
        onMouseDown={(e) => {
          setIsDragging(true)
          handleMove(e.clientX)
        }}
        onTouchStart={(e) => {
          setIsDragging(true)
          handleMove(e.touches[0].clientX)
        }}
      >
        {/* Before Image (Background Layer) */}
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          {!beforeError ? (
            <img
              src={beforeImage}
              alt={`BEFORE (Damaged): ${alt}`}
              className="w-full h-full object-cover"
              onError={() => setBeforeError(true)}
            />
          ) : (
            <div className="p-6 text-center space-y-2 text-rose-300 bg-gradient-to-br from-slate-900 to-rose-950/60 w-full h-full flex flex-col items-center justify-center">
              <span className="text-3xl">🛠️</span>
              <p className="font-bold text-lg">Damaged Device (Before Fix)</p>
              <p className="text-xs text-rose-200/70 max-w-xs">Device brought in with heavy physical damage & malfunction.</p>
            </div>
          )}

          {/* BEFORE Badge */}
          <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 bg-rose-600/90 text-white px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-rose-200 animate-pulse" />
            BEFORE (Damaged)
          </div>
        </div>

        {/* After Image (Foreground Clipped Layer) */}
        <div
          className="absolute inset-0 border-r-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.6)] z-20 overflow-hidden bg-slate-900 flex items-center justify-center"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          {!afterError ? (
            <img
              src={afterImage}
              alt={`AFTER (Repaired): ${alt}`}
              className="w-full h-full object-cover"
              onError={() => setAfterError(true)}
            />
          ) : (
            <div className="p-6 text-center space-y-2 text-emerald-300 bg-gradient-to-br from-slate-900 to-emerald-950/60 w-full h-full flex flex-col items-center justify-center">
              <span className="text-3xl">✨</span>
              <p className="font-bold text-lg">Fully Restored (After Fix)</p>
              <p className="text-xs text-emerald-200/70 max-w-xs">Repaired, tested, and restored to 100% working condition.</p>
            </div>
          )}

          {/* AFTER Badge */}
          <div
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 bg-emerald-600/90 text-white px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase shadow-lg backdrop-blur-md transition-opacity duration-200"
            style={{ opacity: sliderPosition > 85 ? 0 : 1 }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
            AFTER (Fixed)
          </div>
        </div>

        {/* Divider Bar & Grab Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-30 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-9 h-9 bg-white text-slate-900 rounded-full shadow-xl flex items-center justify-center border-2 border-slate-900 font-bold text-xs select-none">
            ↔
          </div>
        </div>
      </div>

      {/* Helper instruction */}
      <p className="text-center text-xs text-slate-500 font-medium">
        👈 Slide left or right to compare Before & After repair details 👉
      </p>
    </div>
  )
}
