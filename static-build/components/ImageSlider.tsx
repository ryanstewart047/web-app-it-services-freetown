'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageSlide {
  src: string
  alt: string
}

const slides: ImageSlide[] = [
  {
    src: "https://placehold.co/800x600/040e40/FFFFFF?text=Computer+Repair",
    alt: "Professional IT technician repairing a laptop"
  },
  {
    src: "https://placehold.co/800x600/ff0000/FFFFFF?text=Smartphone+Repair",
    alt: "Smartphone screen replacement service"
  },
  {
    src: "https://placehold.co/800x600/333333/FFFFFF?text=Motherboard+Repair",
    alt: "Detailed motherboard repair and diagnostics"
  },
  {
    src: "https://placehold.co/800x600/040e40/ff0000?text=Software+Services",
    alt: "Software installation and troubleshooting"
  }
]

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000) // Longer display time for each slide (5 seconds)

      return () => clearInterval(interval)
    }
  }, [isHovered, slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div 
      className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.22, 1, 0.36, 1],
            scale: { duration: 1.5 }
          }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentSlide].src}
            alt={slides[currentSlide].alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentSlide === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <motion.button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fas fa-chevron-left"></i>
      </motion.button>
      <motion.button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fas fa-chevron-right"></i>
      </motion.button>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide 
                ? 'bg-white' 
                : 'bg-white/50'
            }`}
            whileHover={{ scale: 1.5, backgroundColor: "rgba(255,255,255,0.75)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
      
      {/* Caption */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={currentSlide}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-white text-sm md:text-base">{slides[currentSlide].alt}</p>
      </motion.div>
    </div>
  )
}
