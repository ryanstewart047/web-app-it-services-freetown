'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [counters, setCounters] = useState({ customers: 0, hours: 0, success: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Your custom uploaded images for IT Services Freetown
  const slides = [
    {
      src: "/assets/images/slide01.jpg",
      alt: "IT Services Freetown - Professional Computer and Mobile Repair Services"
    },
    {
      src: "/assets/images/slide02.jpg",
      alt: "Expert Phone Repair and Mobile Device Services in Freetown"
    },
    {
      src: "/assets/images/slide03.jpg",
      alt: "Quality IT Solutions and Technology Services"
    },
    {
      src: "/assets/images/slider001.jpg",
      alt: "Professional IT Support and Computer Maintenance"
    },
    {
      src: "/assets/images/iphone-repair.jpg",
      alt: "iPhone and Smartphone Repair Specialists"
    },
    {
      src: "/assets/images/mobile-unlock1.jpg",
      alt: "Mobile Phone Unlocking and Network Services"
    }
  ]

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // 5 seconds
    return () => clearInterval(interval)
  }, [slides.length])

  // Counter animation
  useEffect(() => {
    const animateCounters = () => {
      const targets = { customers: 1000, hours: 24, success: 98 }
      const duration = 2000
      const steps = 60
      const increment = {
        customers: targets.customers / steps,
        hours: targets.hours / steps,
        success: targets.success / steps
      }

      let step = 0
      const timer = setInterval(() => {
        step++
        setCounters({
          customers: Math.min(Math.floor(increment.customers * step), targets.customers),
          hours: Math.min(Math.floor(increment.hours * step), targets.hours),
          success: Math.min(Math.floor(increment.success * step), targets.success)
        })

        if (step >= steps) {
          clearInterval(timer)
          setCounters(targets)
        }
      }, duration / steps)
    }

    const timer = setTimeout(animateCounters, 500)
    return () => clearTimeout(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const refreshSlides = () => {
    setIsRefreshing(true)
    // Shuffle to a random slide
    const randomSlide = Math.floor(Math.random() * slides.length)
    setCurrentSlide(randomSlide)
    // Reset refreshing state after animation
    setTimeout(() => setIsRefreshing(false), 500)
  }

  return (
    <section id="home" className="hero-section">
      <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Side - Text Content */}
          <div className="text-left">
            <h1 className="hero-title">
              Freetown&apos;s #1 Computer & Mobile Repair Experts
            </h1>
            <p className="hero-subtitle">
              🏆 1000+ devices repaired with 95% success rate. Same-day service, 1-month warranty, and real-time tracking. 
              From cracked screens to motherboard repairs - we fix it all with genuine parts at unbeatable prices.
            </p>
            
            {/* Enhanced Value Propositions */}
            <div className="flex flex-wrap gap-3 my-6">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">✅ Same Day Service</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">🛡️ 1-Month Warranty</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">💯 Free Diagnostics</span>
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">⚡ Expert Technicians</span>
            </div>
            
            {/* Buttons */}
            <div className="hero-buttons justify-start">
              <Link href="/book-appointment" 
                 className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4 text-center rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center">
                 <i className="fas fa-calendar-plus mr-2"></i>Book Repair Now
              </Link>
              <Link href="/track-repair" 
                 className="bg-white hover:bg-gray-100 text-lg px-8 py-4 text-center rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg border-2 border-white inline-flex items-center ml-4"
                 style={{color: '#040e40'}}>
                 <i className="fas fa-search mr-2"></i>Track Your Repair
              </Link>
            </div>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{counters.customers}+</div>
                <div className="text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{counters.hours}hrs</div>
                <div className="text-sm text-white/80">Average Turnaround</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{counters.success}%</div>
                <div className="text-sm text-white/80">Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Image Slider */}
          <div className="relative">
            <div className="image-slider-container relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden">
              {slides.map((slide, index) => (
                <div
                  key={`${slide.src}-${index}`}
                  className={`image-slide absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
              
              {/* Navigation Dots */}
              <div className="absolute bottom-4 right-4 flex space-x-2 items-center">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`slider-dot w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
              
              {/* Refresh Button */}
              <button 
                className={`absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                onClick={refreshSlides}
                title="Refresh slides"
              >
                <i className="fas fa-sync-alt text-white"></i>
              </button>
              
              {/* Navigation Arrows */}
              <button 
                className="slider-arrow slider-prev absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                onClick={prevSlide}
              >
                <i className="fas fa-chevron-left text-white"></i>
              </button>
              <button 
                className="slider-arrow slider-next absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                onClick={nextSlide}
              >
                <i className="fas fa-chevron-right text-white"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
