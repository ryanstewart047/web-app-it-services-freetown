'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ServicesPopup from '@/components/ServicesPopup'

export default function Navbar() {
  const [showServicesPopup, setShowServicesPopup] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`bg-white shadow-sm border-b relative z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg bg-white/95 backdrop-blur-sm' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}>
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image 
                src="/assets/logo.png" 
                alt="IT Services Freetown Logo" 
                width={isScrolled ? 60 : 80} 
                height={isScrolled ? 60 : 80} 
                className="rounded-lg hover:scale-110 transition-all duration-300 group-hover:rotate-3 group-hover:shadow-lg"
              />
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary transition-all duration-300 font-medium relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <button 
                onClick={() => setShowServicesPopup(true)}
                className="text-gray-700 hover:text-primary transition-all duration-300 font-medium relative group"
              >
                Our Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </button>
              <Link href="/book-appointment" className="text-gray-700 hover:text-primary transition-all duration-300 font-medium relative group">
                Book Appointment
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/track-repair" className="text-gray-700 hover:text-primary transition-all duration-300 font-medium relative group">
                Track Repair
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/chat" className="text-gray-700 hover:text-primary transition-all duration-300 font-medium relative group">
                Live Chat
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/troubleshoot" className="text-gray-700 hover:text-primary transition-all duration-300 font-medium relative group">
                Troubleshoot
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              
              {/* CTA Button */}
              <Link 
                href="/book-appointment" 
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium transform hover:-translate-y-0.5"
              >
                Get Quote
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-primary transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-gray-100"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t py-4 animate-fade-in">
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-primary hover:bg-gray-50 font-medium px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-home mr-3"></i>Home
                </Link>
                <button 
                  onClick={() => {
                    setShowServicesPopup(true)
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-left text-gray-700 hover:text-primary hover:bg-gray-50 font-medium px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                >
                  <i className="fas fa-cogs mr-3"></i>Our Services
                </button>
                <Link 
                  href="/book-appointment" 
                  className="text-gray-700 hover:text-primary hover:bg-gray-50 font-medium px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-calendar-plus mr-3"></i>Book Appointment
                </Link>
                <Link 
                  href="/track-repair" 
                  className="text-gray-700 hover:text-primary hover:bg-gray-50 font-medium px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-search mr-3"></i>Track Repair
                </Link>
                <Link 
                  href="/chat" 
                  className="text-gray-700 hover:text-primary hover:bg-gray-50 font-medium px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-comments mr-3"></i>Live Chat
                </Link>
                <Link 
                  href="/troubleshoot" 
                  className="text-gray-700 hover:text-primary hover:bg-gray-50 font-medium px-4 py-3 rounded-lg mx-2 transition-all duration-300 hover:scale-105 hover:shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-tools mr-3"></i>Troubleshoot
                </Link>
                <Link 
                  href="/book-appointment" 
                  className="bg-primary text-white px-4 py-3 rounded-lg font-medium mx-4 text-center mt-4 hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="fas fa-quote-right mr-2"></i>Get Quote
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Services Popup */}
      <ServicesPopup 
        isOpen={showServicesPopup} 
        onClose={() => setShowServicesPopup(false)} 
      />
    </>
  )
}