'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  alt?: string
}

export function BeforeAfterSlider({ beforeImage, afterImage, alt = 'Before and After Repair' }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
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
    <div
      ref={containerRef}
      className="relative w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden cursor-ew-resize select-none bg-slate-200"
      onMouseDown={(e) => {
        setIsDragging(true)
        handleMove(e.clientX)
      }}
      onTouchStart={(e) => {
        setIsDragging(true)
        handleMove(e.touches[0].clientX)
      }}
    >
      {/* Before Image (Background) */}
      <div className="absolute inset-0">
        <Image src={beforeImage} alt={`Before: ${alt}`} fill className="object-cover" />
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm z-10">
          Before
        </div>
      </div>

      {/* After Image (Clipped) */}
      <div 
        className="absolute inset-0 border-r-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image src={afterImage} alt={`After: ${alt}`} fill className="object-cover" />
        <div className="absolute top-4 right-4 bg-emerald-600/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
             style={{ opacity: sliderPosition > 80 ? 0 : 1, transition: 'opacity 0.2s' }}>
          After
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-lg z-30"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center -ml-[1px]">
          <div className="w-1 h-4 border-l-2 border-r-2 border-slate-300 gap-1" />
        </div>
      </div>
    </div>
  )
}
