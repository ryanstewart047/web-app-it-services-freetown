'use client'

import { useState, useEffect } from 'rea'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImageSlider from '@/components/ImageSlider'
import { motion } from 'framer-motion'
import CountUp from '@/components/CountUp'

export default function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-primary-950 z-50">
        <div className="text-center">
          <div className="mb-4 relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
          </div>
          <div className="text-white text-xl font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Text Left and Image Slider Right */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-800 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Professional <span className="text-red-500">IT</span> Services in Freetown
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Expert computer and mobile device repairs with real-time tracking and AI-powered support
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  <i className="fas fa-clock text-xl text-red-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Quick Turnaround</div>
                  <div className="font-semibold flex items-center">
                    <CountUp end={24} className="text-lg" /> Hour Service
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  <i className="fas fa-thumbs-up text-xl text-red-400"></i>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Satisfaction Rate</div>
                  <div className="font-semibold flex items-center">
                    <CountUp end={98} className="text-lg" />%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/book-appointment" 
                className="bg-white text-primary-950 px-6 sm:px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center"
              >
                Book Appointment
              </Link>
              <Link 
                href="/track-repair" 
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-6 sm:px-8 py-4 rounded-xl font-semibold hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 text-center"
              >
                Track Your Repair
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:ml-auto hidden lg:block"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInScale}
          >
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl shadow-2xl">
              <ImageSlider />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative overflow-hidden services-bg-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Repair Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional repair services for all your technology needs, with transparent pricing and quick turnaround times
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              variants={fadeInScale}
            >
              <div className="h-48 bg-gradient-to-r from-primary-800 to-primary-600 flex items-center justify-center p-6">
                <div className="w-32 h-32">
                  <img 
                    src="/assets/images/laptop-repair.svg"
                    alt="Laptop Repair" 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Computer Repair</h3>
                <p className="text-gray-600 mb-4">
                  Complete diagnostics and repair for laptops and desktops of all brands. We fix hardware and software issues.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>Hardware Troubleshooting</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>OS Installation & Recovery</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>Virus & Malware Removal</span>
                  </li>
                </ul>
                <div className="flex justify-between items-center">
                  <span className="text-primary-950 font-bold">From Le500,000</span>
                  <Link 
                    href="/book-appointment" 
                    className="bg-primary-950 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              variants={fadeInScale}
            >
              <div className="h-48 bg-gradient-to-r from-red-600 to-red-400 flex items-center justify-center p-6">
                <div className="w-32 h-32">
                  <img 
                    src="/assets/images/mobile-motherboard-repair.svg"
                    alt="Mobile Repair" 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smartphone Repair</h3>
                <p className="text-gray-600 mb-4">
                  Expert repairs for all smartphone brands. From screen replacements to complex motherboard repairs.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>Screen Replacement</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>Battery Replacement</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>Water Damage Recovery</span>
                  </li>
                </ul>
                <div className="flex justify-between items-center">
                  <span className="text-primary-950 font-bold">From Le300,000</span>
                  <Link 
                    href="/book-appointment" 
                    className="bg-primary-950 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              variants={fadeInScale}
            >
              <div className="h-48 bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center p-6">
                <div className="w-32 h-32">
                  <img 
                    src="/assets/images/mobile-unlocking.svg"
                    alt="Mobile Unlocking" 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile Unlocking</h3>
                <p className="text-gray-600 mb-4">
                  Unlock your device from any carrier restriction or unlock forgotten passwords and access your data.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>Carrier Unlocking</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>Password Recovery</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    <span>iCloud/Google Lock Removal</span>
                  </li>
                </ul>
                <div className="flex justify-between items-center">
                  <span className="text-primary-950 font-bold">From Le200,000</span>
                  <Link 
                    href="/book-appointment" 
                    className="bg-primary-950 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We combine technical expertise with innovative technology to provide you with the best repair experience
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div className="text-center group" variants={fadeInScale}>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-950 to-primary-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-clock text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600 text-sm">Track the status of your repair in real-time through our online system</p>
            </motion.div>
            <motion.div className="text-center group" variants={fadeInScale}>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-950 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-comments text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat Support</h3>
              <p className="text-gray-600 text-sm">Instant communication with our technicians and support team</p>
            </motion.div>
            <motion.div className="text-center group" variants={fadeInScale}>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-brain text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Troubleshooting</h3>
              <p className="text-gray-600 text-sm">Get instant repair suggestions powered by artificial intelligence</p>
            </motion.div>
            <motion.div className="text-center group" variants={fadeInScale}>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-check-circle text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 text-sm">All repairs come with warranty and satisfaction guarantee</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Track Record</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that speak for our commitment to excellence and customer satisfaction
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={1250} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Devices Repaired</p>
            </motion.div>
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={98} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Customer Satisfaction %</p>
            </motion.div>
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={24} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Hours Average Repair Time</p>
            </motion.div>
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={5} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Years Experience</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-red-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Your Device Fixed?</h2>
            <p className="text-xl mb-8 opacity-90">
              Book an appointment now and experience the future of IT repair services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/book-appointment" 
                className="bg-white text-primary-950 px-6 sm:px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center"
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
          </motion.div>
        </div>
      </section>
    </div>
  )
}port Link from 'next/link'
import ImageSlider from '@/components/ImageSlider'
import { motion } from 'framer-motion'
import CountUp from '@/components/CountUp'

export default function Home() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading IT Services...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading IT Services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Text Left and Image Slider Right */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-800 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            {/* Left Side - Text Content */}
            <motion.div 
              className="text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Professional IT Services in Freetown
              </motion.h1>
              <motion.p 
                className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                Expert computer and mobile repairs with real-time tracking and AI-powered support. 
                We fix all types of devices with genuine parts and provide excellent warranty coverage.
              </motion.p>
              
              {/* Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-start mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <Link 
                  href="/book-appointment" 
                  className="bg-white text-blue-950 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center"
                >
                  Book Repair Now
                </Link>
                <Link 
                  href="/track-repair" 
                  className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105 text-center"
                >
                  Track Your Repair
                </Link>
              </motion.div>
              
              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    <CountUp end={1250} suffix="+" className="text-2xl font-bold text-white" />
                  </div>
                  <div className="text-sm text-white/80">Devices Fixed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    <CountUp end={98} suffix="%" className="text-2xl font-bold text-white" />
                  </div>
                  <div className="text-sm text-white/80">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    <CountUp end={24} suffix="hrs" className="text-2xl font-bold text-white" />
                  </div>
                  <div className="text-sm text-white/80">Avg Repair Time</div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Side - Image Slider */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <ImageSlider />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative overflow-hidden services-bg-pattern">
        {/* Background Design Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 opacity-70"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/2"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <svg className="absolute top-0 left-0 w-full h-64 text-primary/5" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Our Expertise</span>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Our Services</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              We provide comprehensive IT repair services with cutting-edge technology and expert technicians
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {/* Computer Repair Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg service-card scroll-reveal group cursor-pointer relative overflow-hidden border border-transparent hover:border-primary/20 transition-all duration-500">
              {/* Card accent decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-800 opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="icon-wrapper w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <i className="fas fa-desktop text-2xl text-white group-hover:scale-110 transition-transform duration-300"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">Computer Repair</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">Desktop, laptop, and workstation repairs with genuine parts and warranty</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-primary group-hover:scale-110 transition-all duration-300"></i>
                    <span>Hardware diagnostics</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-primary group-hover:scale-110 transition-all duration-300"></i>
                    <span>Software troubleshooting</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-primary group-hover:scale-110 transition-all duration-300"></i>
                    <span>Data recovery</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-primary group-hover:scale-110 transition-all duration-300"></i>
                    <span>Performance optimization</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Repair Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg service-card scroll-reveal group cursor-pointer relative overflow-hidden border border-transparent hover:border-red-500/20 transition-all duration-500">
              {/* Card accent decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 rounded-full bg-gradient-to-tr from-red-600 to-red-800 opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-pink-600 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="icon-wrapper w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                  <i className="fas fa-mobile-alt text-2xl text-white group-hover:scale-110 transition-transform duration-300"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">Mobile Repair</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">Smartphone and tablet repairs for all major brands and models</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>Screen replacement</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>Battery service</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>Water damage repair</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-red-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>Software restoration</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Network Setup Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg service-card scroll-reveal group cursor-pointer relative overflow-hidden border border-transparent hover:border-purple-500/20 transition-all duration-500">
              {/* Card accent decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-800 opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-indigo-600 to-green-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="icon-wrapper w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <i className="fas fa-network-wired text-2xl text-white group-hover:scale-110 transition-transform duration-300"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">Network Setup</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">Professional network installation and configuration services</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>Wi-Fi setup</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>Network security</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>Cable installation</span>
                  </li>
                  <li className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                    <i className="fas fa-check-circle text-danger mr-2 group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300"></i>
                    <span>System integration</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets exceptional service for the best repair experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group scroll-reveal">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-clock text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Tracking</h3>
              <p className="text-gray-600 text-sm">Monitor your repair status in real-time with detailed progress updates</p>
            </div>
            <div className="text-center group scroll-reveal">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-950 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-comments text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat Support</h3>
              <p className="text-gray-600 text-sm">Instant communication with our technicians and support team</p>
            </div>
            <div className="text-center group scroll-reveal">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <i className="fas fa-brain text-2xl text-white"></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Troubleshooting</h3>
              <p className="text-gray-600 text-sm">Get instant repair suggestions powered by artificial intelligence</p>
            </div>
            <div className="text-center group scroll-reveal">
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
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Track Record</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that speak for our commitment to excellence and customer satisfaction
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={1250} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Devices Repaired</p>
            </motion.div>
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={98} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Customer Satisfaction %</p>
            </motion.div>
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={24} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Hours Average Repair Time</p>
            </motion.div>
            <motion.div className="text-center" variants={fadeInScale}>
              <div className="text-4xl font-bold text-primary-950 mb-2">
                <CountUp end={5} className="text-4xl font-bold text-primary-950" />
              </div>
              <p className="text-gray-600 font-medium">Years Experience</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-red-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Your Device Fixed?</h2>
          <p className="text-xl mb-8 opacity-90">
            Book an appointment now and experience the future of IT repair services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/book-appointment" 
              className="bg-white text-primary-950 px-6 sm:px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center"
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
    </div>
  )
}
