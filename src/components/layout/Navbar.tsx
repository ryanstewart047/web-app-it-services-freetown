'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BRAND_LOGO_SRC, BRAND_NAME } from '@/lib/brand';

function MegaMenuLink({ href, icon, title, description, color, bg }: { 
  href: string; 
  icon: string; 
  title: string; 
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <Link 
      href={href}
      className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-gray-100`}
    >
      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-12`}>
        <i className={`${icon} ${color} text-lg`}></i>
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">{title}</h4>
        <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [blogDropdownOpen, setBlogDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setSupportDropdownOpen(false);
    setBlogDropdownOpen(false);
    setMobileDropdownOpen(false);
  };

  const toggleSupportDropdown = () => {
    setSupportDropdownOpen(!supportDropdownOpen);
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blogTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSupportDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setSupportDropdownOpen(false);
    }, 200); // 200ms delay to make it smooth and avoid accidental closing
  };

  const handleBlogMouseEnter = () => {
    if (blogTimeoutRef.current) clearTimeout(blogTimeoutRef.current);
    setBlogDropdownOpen(true);
  };

  const handleBlogMouseLeave = () => {
    blogTimeoutRef.current = setTimeout(() => {
      setBlogDropdownOpen(false);
    }, 200);
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [supportDropdownOpen]);

  // Close blog dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (blogRef.current && !blogRef.current.contains(event.target as Node)) {
        setBlogDropdownOpen(false);
      }
    };

    if (blogDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (blogTimeoutRef.current) clearTimeout(blogTimeoutRef.current);
    };
  }, [blogDropdownOpen]);

  return (
    <nav className="bg-white shadow-lg w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src={BRAND_LOGO_SRC}
                alt={`${BRAND_NAME} Logo`}
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
            
            {/* Blog Mega Menu (Desktop) */}
            <div 
              className="relative" 
              onMouseEnter={handleBlogMouseEnter}
              onMouseLeave={handleBlogMouseLeave}
              ref={blogRef}
            >
              <Link 
                href="/blog" 
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  blogDropdownOpen || pathname === '/blog' ? 'text-red-600 font-semibold' : 'text-gray-700 hover:text-[#040e40]'
                }`}
              >
                Blog
                <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${blogDropdownOpen ? 'rotate-180' : ''}`}></i>
              </Link>
              
              {/* Mega Menu Container */}
              <div 
                onClick={() => setBlogDropdownOpen(false)}
                className={`absolute right-0 mt-0 w-[500px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 transition-all duration-300 origin-top-right before:absolute before:inset-x-0 before:-top-4 before:h-4 before:content-[''] ${
                  blogDropdownOpen 
                    ? 'opacity-100 translate-y-2 pointer-events-auto scale-100' 
                    : 'opacity-0 translate-y-4 pointer-events-none scale-95'
                }`}
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Column 1: Popular Topics */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Popular Topics</h3>
                    <div className="space-y-2">
                      <MegaMenuLink 
                        href="/blog?search=computer%20repair" 
                        icon="fas fa-laptop" 
                        title="PC & Laptop Repair" 
                        description="Guides on troubleshooting and hardware repair"
                        color="text-blue-600"
                        bg="bg-blue-50"
                      />
                      <MegaMenuLink 
                        href="/blog?search=power%20surge" 
                        icon="fas fa-bolt" 
                        title="Power Protection" 
                        description="Surge protectors, stabilizers, and UPS advice"
                        color="text-amber-600"
                        bg="bg-amber-50"
                      />
                      <MegaMenuLink 
                        href="/blog?search=backup" 
                        icon="fas fa-hdd" 
                        title="Data & Backups" 
                        description="Backup strategies for home and business data"
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                      />
                    </div>
                  </div>

                  {/* Column 2: Tech Guides */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Hardware Guides</h3>
                    <div className="space-y-2">
                      <MegaMenuLink 
                        href="/blog?search=ssd" 
                        icon="fas fa-microchip" 
                        title="SSD vs HDD Storage" 
                        description="Speed & reliability comparison for local setups"
                        color="text-indigo-600"
                        bg="bg-indigo-50"
                      />
                      <MegaMenuLink 
                        href="/blog?search=troubleshooting" 
                        icon="fas fa-tools" 
                        title="DIY Troubleshooting" 
                        description="Common issues you can fix yourself"
                        color="text-purple-600"
                        bg="bg-purple-50"
                      />
                      <MegaMenuLink 
                        href="/blog?search=business" 
                        icon="fas fa-briefcase" 
                        title="Business Technology" 
                        description="Best IT solutions for local organizations"
                        color="text-rose-600"
                        bg="bg-rose-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Mega Menu Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-medium italic">New Guides Published Weekly</span>
                  <Link href="/blog" className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider flex items-center gap-1">
                    View All Articles <i className="fas fa-arrow-right text-[8px]"></i>
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/forum" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname?.startsWith('/forum') ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>
              <i className="fas fa-users mr-1"></i> Tech Forum
            </Link>

            <Link href="/book-appointment" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/book-appointment' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Book Appointment</Link>
            <Link href="/track-repair" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/track-repair' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Track Repair</Link>
            <Link href="/troubleshoot" className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${pathname === '/troubleshoot' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Troubleshoot</Link>
            
            {/* Get Support Mega Menu (Desktop) */}
            <div 
              className="relative" 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              ref={dropdownRef}
            >
              <button 
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  supportDropdownOpen ? 'text-red-600' : 'text-gray-700 hover:text-[#040e40]'
                }`}
              >
                Get Support
                <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${supportDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {/* Mega Menu Container */}
              <div 
                onClick={() => setSupportDropdownOpen(false)}
                className={`absolute right-0 mt-0 w-[600px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 transition-all duration-300 origin-top-right before:absolute before:inset-x-0 before:-top-4 before:h-4 before:content-[''] ${
                  supportDropdownOpen 
                    ? 'opacity-100 translate-y-2 pointer-events-auto scale-100' 
                    : 'opacity-0 translate-y-4 pointer-events-none scale-95'
                }`}
              >
                <div className="grid grid-cols-3 gap-8">
                  {/* Column 1: Support Resources */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Support Resources</h3>
                    <div className="space-y-2">
                      <MegaMenuLink
                        href="/repair-cost-checker-freetown"
                        icon="fas fa-calculator"
                        title="Repair Cost Checker"
                        description="Estimate repair prices before booking"
                        color="text-red-600"
                        bg="bg-red-50"
                      />
                      <MegaMenuLink
                        href="/repair-showcase"
                        icon="fas fa-camera-retro"
                        title="Repair Showcase"
                        description="Before & After repair gallery"
                        color="text-teal-600"
                        bg="bg-teal-50"
                      />
                      <MegaMenuLink
                        href="/repair-guides" 
                        icon="fas fa-book-medical" 
                        title="Repair Guides" 
                        description="Step-by-step tech tutorials"
                        color="text-blue-600"
                        bg="bg-blue-50"
                      />
                      <MegaMenuLink 
                        href="/chat" 
                        icon="fas fa-comments" 
                        title="Chat Support" 
                        description="Real-time help from experts"
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                      />
                      <MegaMenuLink 
                        href="/faq" 
                        icon="fas fa-question-circle" 
                        title="Common FAQs" 
                        description="Quick answers to your questions"
                        color="text-purple-600"
                        bg="bg-purple-50"
                      />
                    </div>
                  </div>

                  {/* Column 2: Connect with Us */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Connect</h3>
                    <div className="space-y-2">
                      <MegaMenuLink 
                        href="/contact" 
                        icon="fas fa-envelope" 
                        title="Contact Us" 
                        description="Our team is here to help"
                        color="text-red-600"
                        bg="bg-red-50"
                      />
                      <MegaMenuLink 
                        href="/about" 
                        icon="fas fa-info-circle" 
                        title="Our Story" 
                        description="Learn about IT Services Freetown"
                        color="text-[#040e40]"
                        bg="bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Column 3: Legal & Trust */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Legal & Policy</h3>
                    <div className="space-y-2">
                      <MegaMenuLink 
                        href="/privacy" 
                        icon="fas fa-shield-alt" 
                        title="Privacy Policy" 
                        description="Your data security matters"
                        color="text-gray-600"
                        bg="bg-gray-50"
                      />
                      <MegaMenuLink 
                        href="/terms" 
                        icon="fas fa-file-contract" 
                        title="Terms of Service" 
                        description="Rules for using our platform"
                        color="text-gray-600"
                        bg="bg-gray-50"
                      />
                      <MegaMenuLink 
                        href="/disclaimer" 
                        icon="fas fa-exclamation-triangle" 
                        title="Disclaimer" 
                        description="Essential service information"
                        color="text-amber-600"
                        bg="bg-amber-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Mega Menu Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-gray-500 font-medium italic">Expert Technicians Online</span>
                  </div>
                  <Link href="/book-appointment" className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider flex items-center gap-1">
                    Book Service Now <i className="fas fa-arrow-right text-[8px]"></i>
                  </Link>
                </div>
              </div>
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

            <Link href="/forum" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-users w-5 mr-3 text-[#040e40]"></i>Tech Forum
            </Link>

            <Link href="/book-appointment" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-calendar-check w-5 mr-3 text-[#040e40]"></i>Book Appointment
            </Link>
            <Link href="/track-repair" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-search w-5 mr-3 text-[#040e40]"></i>Track Repair
            </Link>
            <Link href="/troubleshoot" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-tools w-5 mr-3 text-[#040e40]"></i>Troubleshoot
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
                    href="/repair-cost-checker-freetown"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-calculator w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">Repair Cost Checker</span>
                  </Link>
                  <Link
                    href="/repair-showcase"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-camera-retro w-5 text-teal-600"></i>
                    <span className="ml-3 font-medium">Repair Showcase</span>
                  </Link>
                  <Link
                    href="/repair-guides"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-white hover:text-[#040e40] active:bg-red-100 transition-all border-b border-gray-200/50"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-book-medical w-5 text-red-600"></i>
                    <span className="ml-3 font-medium">Repair Guides</span>
                  </Link>
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
