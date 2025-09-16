'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface ServicesPopupProps {
  isOpen: boolean
  onClose: () => void
}

export default function ServicesPopup({ isOpen, onClose }: ServicesPopupProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-200 shadow-lg"
        >
          <i className="fas fa-times text-lg"></i>
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          {/* Left Side - Image and Social Media */}
          <div className="bg-gradient-to-br from-primary-950 to-primary-800 p-8 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-950/90 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            {/* Main Image */}
            <div className="relative z-10 mb-8">
              <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <Image 
                  src="https://images.pexels.com/photos/3825582/pexels-photo-3825582.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="IT Services Freetown - Professional Computer and Mobile Repair"
                  width={224}
                  height={224}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            {/* Social Media Icons */}
            <div className="relative z-10">
              <h4 className="text-white text-lg font-semibold mb-4 text-center">Follow Us</h4>
              <div className="flex space-x-4 justify-center">
                <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary-950 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-facebook-f text-lg"></i>
                </a>
                <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary-950 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-instagram text-lg"></i>
                </a>
                <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary-950 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-whatsapp text-lg"></i>
                </a>
                <a href="#" className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary-950 transition-all duration-300 hover:scale-110">
                  <i className="fab fa-linkedin-in text-lg"></i>
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Side - Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            {/* Header */}
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              Professional IT Services in Freetown
            </h2>
            
            {/* Services List */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Services</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-red-500 text-lg"></i>
                  <span className="text-gray-700 font-medium">Computer Repair & Maintenance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-red-500 text-lg"></i>
                  <span className="text-gray-700 font-medium">Mobile Phone Repair</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-red-500 text-lg"></i>
                  <span className="text-gray-700 font-medium">Network Setup & Configuration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-red-500 text-lg"></i>
                  <span className="text-gray-700 font-medium">Data Recovery Services</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-red-500 text-lg"></i>
                  <span className="text-gray-700 font-medium">Software Installation & Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-red-500 text-lg"></i>
                  <span className="text-gray-700 font-medium">Hardware Upgrades</span>
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-phone text-primary-950 text-sm"></i>
                  <span className="text-gray-500 text-sm">Phone: +232 33 399 391</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-envelope text-primary-950 text-sm"></i>
                  <span className="text-gray-500 text-sm">Email: support@itservicesfreetown.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-map-marker-alt text-primary-950 text-sm mt-0.5"></i>
                  <span className="text-gray-500 text-sm">Address: #1 Regent Highway, Jui Junction, Freetown</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-8">
              <Link 
                href="/book-appointment"
                onClick={onClose}
                className="bg-primary-950 text-white w-full text-center py-3 text-lg font-semibold rounded-xl hover:bg-primary-800 transition-colors duration-300"
              >
                Book Appointment Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
