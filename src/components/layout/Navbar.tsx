'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setMobileDropdownOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(false);
  };

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDesktopDropdownOpen(false);
      }
    };

    if (desktopDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [desktopDropdownOpen]);

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/assets/logo.png" 
                alt="IT Services Freetown Logo" 
                width={56} 
                height={56} 
                className="h-12 sm:h-14 hover:opacity-80 transition-opacity cursor-pointer"
                style={{ width: 'auto' }}
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[#040e40] px-3 py-2 text-sm font-medium transition-colors">Home</Link>
            
            {/* Special Shop Button with Badge and Animation */}
            <Link 
              href="/marketplace" 
              className="relative group inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
            >
              <i className="fas fa-shopping-bag text-white drop-shadow-lg relative z-10"></i>
              <span className="drop-shadow-lg relative z-10">Shop Now</span>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold animate-bounce z-20">
                🔥
              </span>
              {/* Glow effect */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-300 -z-10"></span>
            </Link>
            
            <Link href="/blog" className="text-gray-700 hover:text-[#040e40] px-3 py-2 text-sm font-medium transition-colors">Blog</Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-[#040e40] px-3 py-2 text-sm font-medium transition-colors">Book Appointment</Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-[#040e40] px-3 py-2 text-sm font-medium transition-colors">Track Repair</Link>
            
            {/* Get Support Dropdown - Brand Colors */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                className="text-gray-700 hover:text-[#040e40] px-3 py-2 text-sm font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                Get Support
                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${desktopDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {desktopDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-[60] border-2 border-[#040e40]/10">
                  <Link 
                    href="/chat"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#040e40] transition-all"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    <i className="fas fa-comments w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">Chat Support</span>
                  </Link>
                  <Link 
                    href="/contact"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#040e40] transition-all"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    <i className="fas fa-envelope w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">Contact Us</span>
                  </Link>
                  <Link 
                    href="/about"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#040e40] transition-all"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    <i className="fas fa-info-circle w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">About Us</span>
                  </Link>
                  <div className="my-1 border-t border-gray-200"></div>
                  <Link 
                    href="/privacy"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#040e40] transition-all"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    <i className="fas fa-shield-alt w-5 text-[#040e40]"></i>
                    <span className="ml-3 font-medium">Privacy Policy</span>
                  </Link>
                  <Link 
                    href="/terms"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#040e40] transition-all"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    <i className="fas fa-file-contract w-5 text-[#040e40]"></i>
                    <span className="ml-3 font-medium">Terms of Service</span>
                  </Link>
                  <Link 
                    href="/disclaimer"
                    className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#040e40] transition-all"
                    onClick={() => setDesktopDropdownOpen(false)}
                  >
                    <i className="fas fa-exclamation-triangle w-5 text-[#040e40]"></i>
                    <span className="ml-3 font-medium">Disclaimer</span>
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/book-appointment" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg">Book Now</Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-[#040e40] focus:outline-none transition-colors"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-50 bg-white border-t shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-home w-5 mr-3 text-[#040e40]"></i>Home
            </Link>
            
            {/* Special Shop Button for Mobile */}
            <Link 
              href="/marketplace" 
              className="relative inline-flex items-center justify-center gap-1.5 mx-2 my-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 rounded-md shadow-sm active:scale-95 transition-all duration-300"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-shopping-bag text-white text-xs"></i>
              <span>Shop Now</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold animate-bounce">
                🔥
              </span>
            </Link>
            
            <Link href="/blog" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-blog w-5 mr-3 text-[#040e40]"></i>Blog
            </Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-calendar-check w-5 mr-3 text-[#040e40]"></i>Book Appointment
            </Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-search w-5 mr-3 text-[#040e40]"></i>Track Repair
            </Link>
            
            {/* Get Support Dropdown for Mobile - Brand Colors */}
            <div className="pt-2">
              <button 
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                type="button"
                className="w-full text-left text-gray-700 hover:text-[#040e40] hover:bg-gray-50 px-4 py-3 text-base font-medium rounded-lg transition-all flex items-center justify-between"
              >
                <span>
                  <i className="fas fa-headset w-5 mr-3 text-[#040e40]"></i>Get Support
                </span>
                <i className={`fas fa-chevron-down text-sm transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {mobileDropdownOpen && (
                <div className="mt-2 ml-6 mr-2 bg-gradient-to-br from-gray-50 to-red-50 rounded-lg border-2 border-[#040e40]/10 overflow-hidden">
                  <Link
                    href="/chat"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-comments w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">Chat Support</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-envelope w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">Contact Us</span>
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-info-circle w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">About Us</span>
                  </Link>
                  <Link
                    href="/privacy"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-shield-alt w-5 text-[#040e40]"></i>
                    <span className="ml-3 font-medium">Privacy Policy</span>
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-file-contract w-5 text-[#040e40]"></i>
                    <span className="ml-3 font-medium">Terms of Service</span>
                  </Link>
                  <Link
                    href="/disclaimer"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-exclamation-triangle w-5 text-[#040e40]"></i>
                    <span className="ml-3 font-medium">Disclaimer</span>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="px-2 pt-4">
              <Link href="/book-appointment" className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg text-sm font-semibold transition-colors shadow-md" onClick={closeMobileMenu}>
                <i className="fas fa-calendar-check mr-2"></i>Book Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
