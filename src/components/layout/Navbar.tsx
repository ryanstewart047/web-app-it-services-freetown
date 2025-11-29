'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setSupportDropdownOpen(false);
  };

  const toggleSupportDropdown = () => {
    setSupportDropdownOpen(!supportDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSupportDropdownOpen(false);
      }
    };

    if (supportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [supportDropdownOpen]);

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-40">
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
            <Link href="/" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Home</Link>
            
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
            
            <Link href="/blog" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Blog</Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Book Appointment</Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Track Repair</Link>
            <Link href="/troubleshoot" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Troubleshoot</Link>
            
            {/* Get Support Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleSupportDropdown}
                className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium inline-flex items-center gap-1"
              >
                Get Support
                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${supportDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {supportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
                  <Link 
                    href="/chat" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-comments mr-2"></i>Chat Support
                  </Link>
                  <Link 
                    href="/contact" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-envelope mr-2"></i>Contact Us
                  </Link>
                  <Link 
                    href="/privacy" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-shield-alt mr-2"></i>Privacy Policy
                  </Link>
                  <Link 
                    href="/terms" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-file-contract mr-2"></i>Terms of Service
                  </Link>
                  <Link 
                    href="/disclaimer" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-exclamation-triangle mr-2"></i>Disclaimer
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/book-appointment" className="btn-primary text-sm px-4 py-2">Book Now</Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary-950 focus:outline-none focus:text-primary-950"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link href="/" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Home</Link>
            
            {/* Special Shop Button for Mobile */}
            <Link 
              href="/marketplace" 
              className="relative inline-flex items-center justify-center gap-2 mx-2 my-2 px-3 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 rounded-lg shadow-md transform active:scale-95 transition-all duration-300"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-shopping-bag text-white drop-shadow-lg text-sm"></i>
              <span className="drop-shadow-lg">Shop Now</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold animate-bounce">
                🔥
              </span>
            </Link>
            
            <Link href="/blog" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Blog</Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Book Appointment</Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Track Repair</Link>
            <Link href="/troubleshoot" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Troubleshoot</Link>
            
            {/* Get Support Dropdown for Mobile */}
            <div className="px-3 py-2">
              <button 
                onClick={toggleSupportDropdown}
                className="text-gray-700 hover:text-primary-950 text-base font-medium inline-flex items-center gap-2 w-full justify-between"
              >
                Get Support
                <i className={`fas fa-chevron-down text-sm transition-transform duration-200 ${supportDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {supportDropdownOpen && (
                <div className="mt-2 ml-4 space-y-1 bg-gray-50 rounded-md py-2 animate-fadeIn">
                  <Link 
                    href="/chat" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-comments mr-2"></i>Chat Support
                  </Link>
                  <Link 
                    href="/contact" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-envelope mr-2"></i>Contact Us
                  </Link>
                  <Link 
                    href="/privacy" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-shield-alt mr-2"></i>Privacy Policy
                  </Link>
                  <Link 
                    href="/terms" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-file-contract mr-2"></i>Terms of Service
                  </Link>
                  <Link 
                    href="/disclaimer" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-exclamation-triangle mr-2"></i>Disclaimer
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/book-appointment" className="btn-primary text-sm px-4 py-2 w-full text-center mt-4" onClick={closeMobileMenu}>Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
