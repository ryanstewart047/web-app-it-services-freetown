'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleAdminMenu = () => {
    setAdminMenuOpen(!adminMenuOpen);
  };

  const closeAdminMenu = () => {
    setAdminMenuOpen(false);
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
            <Link href="/marketplace" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Shop</Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Book Appointment</Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Track Repair</Link>
            <Link href="/troubleshoot" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Troubleshoot</Link>
            <Link href="/chat" className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium">Chat Support</Link>
            
            {/* Admin Dropdown */}
            <div className="relative">
              <button 
                onClick={toggleAdminMenu}
                onBlur={() => setTimeout(closeAdminMenu, 200)}
                className="text-gray-700 hover:text-primary-950 px-3 py-2 text-sm font-medium flex items-center"
              >
                Admin <i className={`fas fa-chevron-down ml-1 text-xs transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`}></i>
              </button>
              {adminMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <Link href="/admin/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-950" onClick={closeAdminMenu}>
                    <i className="fas fa-box mr-2"></i> Manage Products
                  </Link>
                  <Link href="/admin/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-950" onClick={closeAdminMenu}>
                    <i className="fas fa-shopping-cart mr-2"></i> View Orders
                  </Link>
                  <Link href="/admin/categories" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-950" onClick={closeAdminMenu}>
                    <i className="fas fa-tags mr-2"></i> Manage Categories
                  </Link>
                  <Link href="/admin/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-950" onClick={closeAdminMenu}>
                    <i className="fas fa-calendar-alt mr-2"></i> View Bookings
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
            <Link href="/marketplace" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Shop</Link>
            <Link href="/book-appointment" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Book Appointment</Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Track Repair</Link>
            <Link href="/troubleshoot" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Troubleshoot</Link>
            <Link href="/chat" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>Chat Support</Link>
            
            {/* Admin Section for Mobile */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <p className="text-xs font-semibold text-gray-500 px-3 py-1 uppercase tracking-wider">Admin Panel</p>
              <Link href="/admin/products" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>
                <i className="fas fa-box mr-2"></i> Manage Products
              </Link>
              <Link href="/admin/orders" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>
                <i className="fas fa-shopping-cart mr-2"></i> View Orders
              </Link>
              <Link href="/admin/categories" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>
                <i className="fas fa-tags mr-2"></i> Manage Categories
              </Link>
              <Link href="/admin/bookings" className="text-gray-700 hover:text-primary-950 block px-3 py-2 text-base font-medium" onClick={closeMobileMenu}>
                <i className="fas fa-calendar-alt mr-2"></i> View Bookings
              </Link>
            </div>
            
            <Link href="/book-appointment" className="btn-primary text-sm px-4 py-2 w-full text-center mt-4" onClick={closeMobileMenu}>Book Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
