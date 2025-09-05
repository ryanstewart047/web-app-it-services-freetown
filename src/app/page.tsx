'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImageSlider from '@/components/ImageSlider'
import ServicesPopup from '@/components/ServicesPopup'

export default function Home() {
  const [showLoader, setShowLoader] = useState(true)
  const [showServicesPopup, setShowServicesPopup] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 3000) // Show loader for 3 seconds

    return () => clearTimeout(timer)
  }, [])

  if (showLoader) {
    return (
      <div className="fixed inset-0 bg-primary flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">IT Services Freetown</h2>
          <p className="text-white/80">Loading your repair solutions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Text Left and Image Slider Right */}
      <section className="bg-gradient-to-br from-primary via-blue-800 to-danger text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-danger/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            {/* Left Side - Text Content */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Professional IT Services in Freetown
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                Expert computer and mobile repairs with real-time tracking and AI-powered support. 
                We fix all types of devices with genuine parts and provide excellent warranty coverage.
              </p>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-start mb-12">
                <Link 
                  href="/book-appointment" 
                  className="bg-white text-primary px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center"
                >
                  Book Repair Now
                </Link>
                <Link 
                  href="/track-repair" 
                  className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  Track Your Repair
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1250+</div>
                  <div className="text-sm text-white/80">Devices Fixed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-sm text-white/80">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24hrs</div>
                  <div className="text-sm text-white/80">Avg Repair Time</div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Image Slider */}
            <div className="relative">
              <ImageSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive IT repair services with cutting-edge technology and expert technicians
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Computer Repair Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-desktop text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Computer Repair</h3>
              <p className="text-gray-600 mb-4">Desktop, laptop, and workstation repairs with genuine parts and warranty</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Hardware diagnostics</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Software troubleshooting</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Data recovery</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Performance optimization</span>
                </li>
              </ul>
            </div>

            {/* Mobile Repair Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-mobile-alt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Repair</h3>
              <p className="text-gray-600 mb-4">Smartphone and tablet repairs for all major brands and models</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Screen replacement</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Battery service</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Water damage repair</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Software restoration</span>
                </li>
              </ul>
            </div>

            {/* Network Setup Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6">
                <i className="fas fa-network-wired text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Network Setup</h3>
              <p className="text-gray-600 mb-4">Professional network installation and configuration services</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Wi-Fi setup</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Network security</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>Cable installation</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <i className="fas fa-check-circle text-danger mr-2"></i>
                  <span>System integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets exceptional service for the best repair experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-clock text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor your repair status in real-time with detailed progress updates</p>
            </div>
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-danger rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-comments text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat Support</h3>
              <p className="text-gray-600 text-sm">Instant communication with our technicians and support team</p>
            </div>
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-brain text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Troubleshooting</h3>
              <p className="text-gray-600 text-sm">Get instant repair suggestions powered by artificial intelligence</p>
            </div>
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-check-circle text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">All repairs come with warranty and satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Track Record</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that speak for our commitment to excellence and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1250</div>
              <p className="text-gray-600 font-medium">Devices Repaired</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">98</div>
              <p className="text-gray-600 font-medium">Customer Satisfaction %</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24</div>
              <p className="text-gray-600 font-medium">Hours Average Repair Time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <p className="text-gray-600 font-medium">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-primary via-blue-800 to-danger text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-danger/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Your Device Fixed?</h2>
          <p className="text-xl mb-8 opacity-90">
            Book an appointment now and experience the future of IT repair services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/book-appointment" 
              className="bg-white text-primary px-6 sm:px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center"
            >
              Schedule Appointment
            </Link>
            <Link 
              href="/troubleshoot" 
              className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-4 rounded-xl font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 text-center"
            >
              Try AI Troubleshooting
            </Link>
          </div>
        </div>
      </section>

      {/* Services Popup */}
      <ServicesPopup 
        isOpen={showServicesPopup} 
        onClose={() => setShowServicesPopup(false)} 
      />
    </div>
  )
}
