'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
            <Link href="/" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Home</Link>
            
            {/* Special Shop Button with Badge and Animation */}
            <Link 
              href="/marketplace" 
              className="relative group inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none"
            >
              <i className="fas fa-shopping-bag text-white"></i>
              <span>Shop Now</span>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-red-900 animate-bounce">
                🔥
              </span>
              {/* Glow effect */}
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-300"></span>
            </Link>
            
            <Link href="/blog" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Blog</Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Book Appointment</Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Track Repair</Link>
            <Link href="/troubleshoot" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Troubleshoot</Link>
            <Link href="/chat" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Chat Support</Link>
            
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
              className="relative flex items-center justify-center gap-2 mx-2 my-3 px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl shadow-lg transform active:scale-95 transition-all duration-300"
              onClick={closeMobileMenu}
            >
              <i className="fas fa-shopping-bag text-white"></i>
              <span>Shop Now</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold">
                🔥
              </span>
            </Link>
            
            <Link href="/blog" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Blog</Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Book Appointment</Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Track Repair</Link>
            <Link href="/troubleshoot" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Troubleshoot</Link>
            <Link href="/chat" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Chat Support</Link>
            
            <Link href="/book-appointment" className="btn-primary text-sm px-4 py-2 w-full text-center mt-4" onClick={closeMobileMenu}>Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
