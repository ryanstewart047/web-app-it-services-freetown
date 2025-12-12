'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setSupportDropdownOpen(false);
    setMobileDropdownOpen(false);
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
            <Link href="/" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Home</Link>
            
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
            
            <Link href="/blog" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/blog' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Blog</Link>
            <Link href="/book-appointment" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/book-appointment' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Book Appointment</Link>
            <Link href="/track-repair" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/track-repair' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Track Repair</Link>
            <Link href="/troubleshoot" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/troubleshoot' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Troubleshoot</Link>
            
            {/* Get Support Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleSupportDropdown}
                className="text-gray-700 hover:text-[#040e40] px-3 py-2 text-sm font-medium inline-flex items-center gap-1"
              >
                Get Support
                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${supportDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {supportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
                  <Link 
                    href="/chat" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#040e40] hover:text-white transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-comments mr-2"></i>Chat Support
                  </Link>
                  <Link 
                    href="/contact" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#040e40] hover:text-white transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-envelope mr-2"></i>Contact Us
                  </Link>
                  <Link 
                    href="/about" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#040e40] hover:text-white transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-info-circle mr-2"></i>About Us
                  </Link>
                  <Link 
                    href="/faq" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#040e40] hover:text-white transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-question-circle mr-2"></i>FAQ
                  </Link>
                  <div className="my-1 border-t border-gray-200"></div>
                  <Link 
                    href="/privacy" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#040e40] hover:text-white transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-shield-alt mr-2"></i>Privacy Policy
                  </Link>
                  <Link 
                    href="/terms" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#040e40] hover:text-white transition-colors duration-200"
                    onClick={() => setSupportDropdownOpen(false)}
                  >
                    <i className="fas fa-file-contract mr-2"></i>Terms of Service
                  </Link>
                  <Link 
                    href="/disclaimer" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#040e40] hover:text-white transition-colors duration-200"
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
                    href="/faq"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-question-circle w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">FAQ</span>
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
            
            <Link href="/book-appointment" className="btn-primary text-sm px-4 py-2 w-full text-center mt-4" onClick={closeMobileMenu}>Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
