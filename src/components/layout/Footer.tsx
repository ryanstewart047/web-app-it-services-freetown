'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Footer() {
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  return (
    <footer className="bg-gradient-to-br from-[#040e40] via-[#040e40] to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdminPanel(false)}>
            <div className="bg-gradient-to-br from-[#040e40] via-[#040e40] to-gray-900 border-2 border-red-500/50 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <i className="fas fa-shield-alt text-red-400 mr-3"></i>
                  Admin Panels
                </h3>
                <button 
                  onClick={() => setShowAdminPanel(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <p className="text-gray-300 text-sm mb-6">Access the admin panel to manage your business operations</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-tachometer-alt text-cyan-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Dashboard</h4>
              <p className="text-gray-400 text-xs mt-1">Overview & analytics</p>
            </Link>
            <Link 
              href="/blog/admin" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-blog text-orange-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Blog Admin</h4>
              <p className="text-gray-400 text-xs mt-1">Manage blog posts</p>
            </Link>
            <Link 
              href="/receipt" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-receipt text-green-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Receipt Generator</h4>
              <p className="text-gray-400 text-xs mt-1">Create receipts</p>
            </Link>
            <Link 
              href="/offer-admin" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-gift text-pink-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Offer Admin</h4>
              <p className="text-gray-400 text-xs mt-1">Manage special offers</p>
            </Link>
            <Link 
              href="/admin/products" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-box text-blue-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Manage Products</h4>
              <p className="text-gray-400 text-xs mt-1">Marketplace products</p>
            </Link>
            <Link 
              href="/admin/add-product" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-plus-circle text-green-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Add Product</h4>
              <p className="text-gray-400 text-xs mt-1">Quick add new product</p>
            </Link>
            <Link 
              href="/admin/orders" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-shopping-cart text-yellow-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">View Orders</h4>
              <p className="text-gray-400 text-xs mt-1">Track customer orders</p>
            </Link>
            <Link 
              href="/admin/categories" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-tags text-purple-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Categories</h4>
              <p className="text-gray-400 text-xs mt-1">Organize products</p>
            </Link>
            <Link 
              href="/admin/bookings" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 transition-all hover:scale-105 group"
              onClick={() => setShowAdminPanel(false)}
            >
              <i className="fas fa-calendar-alt text-red-400 text-2xl mb-2 block group-hover:scale-110 transition-transform"></i>
              <h4 className="text-white font-semibold text-sm">Bookings</h4>
              <p className="text-gray-400 text-xs mt-1">Service appointments</p>
            </Link>
          </div>
        </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image 
             src="/assets/logo.png"
             alt="IT Services Freetown Logo"
             width={56}
             height={56}
             className="footer-logo"
             style={{ width: 'auto' }}
              />
            </div>
            <p className="text-gray-200 mb-6 max-w-md leading-relaxed">
              Professional computer and mobile repair services in Freetown, Sierra Leone. 
              We provide expert repairs with real-time tracking, AI-powered support, and genuine parts warranty.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                  <i className="fas fa-phone text-primary-400 text-sm"></i>
                </div>
                <span className="text-gray-300 text-sm">+232 33 399391</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                  <i className="fas fa-envelope text-primary-400 text-sm"></i>
                </div>
                <span className="text-gray-300 text-sm">support@itservicesfreetown.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center mt-0.5">
                  <i className="fas fa-map-marker-alt text-primary-400 text-sm"></i>
                </div>
                <span className="text-gray-300 text-sm">
                  #1 Regent Highway, Jui Junction<br />
                  Freetown, Sierra Leone
                </span>
              </div>
            </div>

            {/* Social Links */}
                        <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://whatsapp.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-all duration-200 hover:scale-110"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b-2 border-red-500 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-home mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/book-appointment" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-calendar-alt mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Book Appointment</span>
                </Link>
              </li>
              <li>
                <Link href="/track-repair" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-search mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Track Repair</span>
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-robot mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">AI Support</span>
                </Link>
              </li>
              <li>
                <Link href="/troubleshoot" className="text-gray-200 hover:text-red-400 transition-colors text-sm flex items-center group">
                  <i className="fas fa-wrench mr-3 text-red-500 w-4"></i>
                  <span className="group-hover:translate-x-1 transition-transform">Troubleshoot</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white border-b-2 border-red-500 pb-2 inline-block">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-desktop mr-3 text-red-500 w-4"></i>
                Computer Repair
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-mobile-alt mr-3 text-red-500 w-4"></i>
                Mobile Repair
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-network-wired mr-3 text-red-500 w-4"></i>
                Network Setup
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-hdd mr-3 text-red-500 w-4"></i>
                Data Recovery
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-unlock-alt mr-3 text-red-500 w-4"></i>
                Mobile Unlocking
              </li>
              <li className="text-gray-200 text-sm flex items-center">
                <i className="fas fa-microchip mr-3 text-red-500 w-4"></i>
                Motherboard Repair
              </li>
            </ul>

            {/* Business Hours */}
            <div className="mt-6 p-4 bg-red-900/20 rounded-xl border border-red-500/30">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                <i className="fas fa-clock text-red-400 mr-2"></i>
                Business Hours
              </h4>
              <p className="text-gray-200 text-xs">
                Monday - Saturday<br />
                <span className="text-red-400 font-medium">9:00 AM - 6:00 PM</span>
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-red-900/30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-300 text-sm">
                © {new Date().getFullYear()} IT Services Freetown. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span className="flex items-center">
                  <i className="fas fa-shield-alt mr-1 text-red-400"></i>
                  Genuine Parts
                </span>
                <span className="flex items-center">
                  <i className="fas fa-certificate mr-1 text-red-400"></i>
                  Certified Technicians
                </span>
                <span className="flex items-center">
                  <i className="fas fa-clock mr-1 text-red-400"></i>
                  Real-time Tracking
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowAdminPanel(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all hover:scale-105 shadow-lg"
              >
                <i className="fas fa-shield-alt"></i>
                <span>Admin Panels</span>
              </button>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
