'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [counters, setCounters] = useState({ customers: 0, hours: 0, success: 0 })
  const [slides, setSlides] = useState<Array<{ src: string; alt: string }>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handpicked images specifically for IT Services Freetown's vision
  const imagePool = [
    // Computer Repair & Hardware
    {
      src: "https://images.pexels.com/photos/3825582/pexels-photo-3825582.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Professional technician repairing computer motherboard - Expert hardware diagnostics"
    },
    {
      src: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Computer repair workstation with diagnostic tools - Professional IT services"
    },
    {
      src: "https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Laptop hardware repair and upgrade services - Expert computer maintenance"
    },
    
    // Mobile Device Repair
    {
      src: "https://images.pexels.com/photos/4350276/pexels-photo-4350276.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Mobile phone repair and unlocking services - Screen replacement specialists"
    },
    {
      src: "https://images.pexels.com/photos/6804595/pexels-photo-6804595.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Smartphone screen replacement and mobile repair services"
    },
    {
      src: "https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Mobile device motherboard repair - Advanced smartphone diagnostics"
    },
    
    // Web Development & Programming
    {
      src: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Web development coding workspace - Custom website design and development"
    },
    {
      src: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Professional web developer coding responsive websites"
    },
    {
      src: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Modern web development setup - E-commerce and business websites"
    },
    
    // Graphic Design & Digital Services
    {
      src: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Graphic design workspace - Logo design and brand identity services"
    },
    {
      src: "https://images.pexels.com/photos/265685/pexels-photo-265685.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Creative graphic design studio - Digital marketing and branding"
    },
    
    // Networking & IT Infrastructure
    {
      src: "https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Network server maintenance - IT infrastructure and system administration"
    },
    {
      src: "https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Network cables and IT infrastructure setup - Professional networking services"
    },
    
    // Data Recovery & Security
    {
      src: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Data security and recovery services - Cybersecurity solutions"
    },
    {
      src: "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Hard drive data recovery - Professional data restoration services"
    },
    
    // Business IT Solutions
    {
      src: "https://images.pexels.com/photos/3568520/pexels-photo-3568520.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Business IT support and consultation - Enterprise technology solutions"
    },
    {
      src: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Circuit board analysis - Advanced electronic repair and diagnostics"
    }
  ]

  // Function to get random unique slides
  const getRandomSlides = (count: number = 3) => {
    const shuffled = [...imagePool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  // Initialize random slides on component mount
  useEffect(() => {
    setSlides(getRandomSlides(3))
  }, [])

  // Auto-refresh slides with new random images every 30 seconds
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      setIsRefreshing(true)
      
      // Add a slight delay for visual effect
      setTimeout(() => {
        setSlides(getRandomSlides(3))
        setCurrentSlide(0) // Reset to first slide when refreshing
        setIsRefreshing(false)
      }, 500)
    }, 30000) // 30 seconds

    return () => clearInterval(autoRefreshInterval)
  }, [])

  // Auto-advance slides
  useEffect(() => {
    if (slides.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
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
    
    setTimeout(() => {
      setSlides(getRandomSlides(3))
      setCurrentSlide(0)
      setIsRefreshing(false)
    }, 500)
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
            {slides.length > 0 && (
              <div className={`image-slider-container relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden transition-all duration-500 ${isRefreshing ? 'opacity-75 scale-95' : 'opacity-100 scale-100'}`}>
                {/* Auto-refresh indicator */}
                {isRefreshing && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                    <div className="bg-white/90 rounded-full px-4 py-2 flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-gray-700">Loading new images...</span>
                    </div>
                  </div>
                )}
                
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
                  <button
                    className={`w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 group ${isRefreshing ? 'animate-spin' : ''}`}
                    onClick={refreshSlides}
                    disabled={isRefreshing}
                    title="Get new random images"
                  >
                    <i className="fas fa-refresh text-white text-sm group-hover:rotate-180 transition-transform duration-300"></i>
                  </button>
                  
                  {/* Auto-refresh timer indicator */}
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Auto-refresh active"></div>
                  
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`slider-dot w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      onClick={() => goToSlide(index)}
                      disabled={isRefreshing}
                    />
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                <button 
                  className="slider-arrow slider-prev absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                  onClick={prevSlide}
                  disabled={isRefreshing}
                >
                  <i className="fas fa-chevron-left text-white"></i>
                </button>
                <button 
                  className="slider-arrow slider-next absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                  onClick={nextSlide}
                  disabled={isRefreshing}
                >
                  <i className="fas fa-chevron-right text-white"></i>
                </button>
              </div>
            )}
            
            {/* Loading placeholder while slides are being randomized */}
            {slides.length === 0 && (
              <div className="w-full h-96 lg:h-[500px] rounded-2xl bg-gray-300 animate-pulse flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading fresh images...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
