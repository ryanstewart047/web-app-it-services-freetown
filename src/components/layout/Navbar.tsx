'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BRAND_LOGO_SRC, BRAND_AVATAR_TRANSPARENT_SRC, BRAND_NAME } from '@/lib/brand';

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
  const [supportPopupOpen, setSupportPopupOpen] = useState(false);
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
    setSupportPopupOpen(false);
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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6 lg:gap-8">
          <div className="flex items-center flex-shrink-0 mr-6 sm:mr-8 lg:mr-10 xl:mr-12">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group py-1 flex-shrink-0">
              <Image 
                src={BRAND_AVATAR_TRANSPARENT_SRC}
                alt={`${BRAND_NAME} Avatar`}
                width={48} 
                height={48} 
                className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 object-contain group-hover:scale-105 transition-transform duration-200"
                priority
              />
              <div className="flex flex-col justify-center">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#040e40] leading-none">
                  BridgeTech
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.2em] text-red-600 uppercase leading-tight mt-0.5">
                  IT Services
                </span>
              </div>
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 2xl:gap-4 flex-shrink-0">
            <Link href="/" className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap flex-shrink-0 transition-all duration-200 ${pathname === '/' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Home</Link>
            
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

            {/* On-Demand Services Tab (Prominent on Navbar) */}
            <Link 
              href="/on-demand" 
              className={`px-3 py-2 text-xs xl:text-sm font-bold rounded-lg whitespace-nowrap flex-shrink-0 transition-all duration-200 flex items-center gap-1.5 ${
                pathname?.startsWith('/on-demand') 
                  ? 'bg-[#040e40] text-amber-400 font-bold shadow-sm' 
                  : 'text-gray-800 hover:text-amber-600 hover:bg-amber-50/70'
              }`}
            >
              <i className="fas fa-handshake text-amber-500"></i>
              <span>On-Demand Services</span>
              <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full uppercase tracking-wider">
                PROS
              </span>
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

            <Link href="/digital-tools" className={`px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap flex-shrink-0 transition-all duration-200 ${pathname?.startsWith('/digital-tools') ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>
              <i className="fas fa-wand-magic-sparkles text-red-500 mr-1"></i> Digital Tools
            </Link>

            <Link href="/search" aria-label="Search the site" className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${pathname === '/search' ? 'bg-[#040e40] text-red-500' : 'text-gray-700 hover:bg-slate-100 hover:text-[#040e40]'}`}>
              <i className="fas fa-search"></i>
            </Link>

            <Link href="/book-appointment" className={`hidden 2xl:inline-block px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap flex-shrink-0 transition-all duration-200 ${pathname === '/book-appointment' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Book Appointment</Link>
            <Link href="/track-repair" className={`px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap flex-shrink-0 transition-all duration-200 ${pathname === '/track-repair' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Track Repair</Link>
            <Link href="/troubleshoot" className={`px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap flex-shrink-0 transition-all duration-200 ${pathname === '/troubleshoot' ? 'bg-[#040e40] text-red-500 font-semibold' : 'text-gray-700 hover:text-[#040e40]'}`}>Troubleshoot</Link>
            
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
                        href="/on-demand"
                        icon="fas fa-handshake"
                        title="On-Demand Services"
                        description="Printers, consoles, electricians, plumbers & more"
                        color="text-amber-600"
                        bg="bg-amber-50"
                      />
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
                        href="/remote-support"
                        icon="fas fa-headset"
                        title="Remote Support"
                        description="Secure help for your device, anywhere"
                        color="text-red-600"
                        bg="bg-red-50"
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
                        description="Learn about BridgeTech IT Services"
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
            
            <Link href="/book-appointment" className="btn-primary text-xs xl:text-sm px-3.5 xl:px-4 py-2 whitespace-nowrap flex-shrink-0">Book Now</Link>
          </div>
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
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
        <div className="lg:hidden relative z-50 bg-white border-t shadow-lg">
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
            
            <Link href="/on-demand" className="text-gray-900 bg-amber-50/80 hover:bg-amber-100/80 block px-4 py-3 text-base font-bold rounded-lg transition-all border border-amber-200/60 my-1 flex items-center justify-between" onClick={closeMobileMenu}>
              <div className="flex items-center">
                <i className="fas fa-handshake w-5 mr-3 text-amber-600"></i>
                <span>On-Demand Services</span>
              </div>
              <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded uppercase">
                Pro Network
              </span>
            </Link>

            <Link href="/blog" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-blog w-5 mr-3 text-[#040e40]"></i>Blog
            </Link>

            <Link href="/digital-tools" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-wand-magic-sparkles w-5 mr-3 text-red-600"></i>Digital Tools Suite
            </Link>


            <Link href="/search" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-search w-5 mr-3 text-[#040e40]"></i>Search the site
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
            <Link href="/remote-support" className="text-gray-700 hover:text-[#040e40] hover:bg-gray-50 block px-4 py-3 text-base font-medium rounded-lg transition-all" onClick={closeMobileMenu}>
              <i className="fas fa-headset w-5 mr-3 text-red-600"></i>Remote Support
            </Link>
            
            {/* Get Support Button for Mobile - Triggers Pop-Up Modal */}
            <div className="pt-2">
              <button 
                onClick={() => setSupportPopupOpen(true)}
                type="button"
                className="w-full text-left text-gray-800 bg-red-50 hover:bg-red-100/80 border border-red-200 px-4 py-3 text-base font-bold rounded-xl transition-all flex items-center justify-between shadow-xs active:scale-[0.98]"
              >
                <span className="flex items-center">
                  <i className="fas fa-headset w-5 mr-3 text-red-600 text-lg"></i>
                  <span>Get Support</span>
                </span>
                <span className="flex items-center text-xs font-bold text-red-600 gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-red-200 shadow-xs">
                  <span>View All</span>
                  <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                </span>
              </button>
            </div>
            
            <Link href="/book-appointment" className="btn-primary text-sm px-4 py-2 w-full text-center mt-4" onClick={closeMobileMenu}>Book Now</Link>
          </div>
        </div>
      )}

      {/* ── GET SUPPORT MOBILE MODAL POPUP ── */}
      {supportPopupOpen && (
        <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Dark Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSupportPopupOpen(false)}
          />

          {/* Modal Sheet */}
          <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 animate-in fade-in slide-in-from-bottom-6 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#040e40] to-[#0a1e75] px-5 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-red-400">
                  <i className="fas fa-headset text-lg"></i>
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">Get Support</h3>
                  <p className="text-[11px] text-gray-300">Choose a service or support option</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSupportPopupOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl leading-none transition-colors"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Modal Scrollable List */}
            <div className="p-4 overflow-y-auto space-y-2 max-h-[calc(85vh-130px)] divide-y divide-gray-100">
              <div className="space-y-1.5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block">Quick Services</span>
                
                <Link
                  href="/on-demand"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-amber-50/70 border border-amber-200/60 bg-amber-50/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-amber-700">On-Demand Services</h4>
                      <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[9px] font-black rounded uppercase">NEW</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">Printers, consoles, electricians, welders, plumbers</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/repair-cost-checker-freetown"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-red-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-calculator"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-red-600">Repair Cost Checker</h4>
                    <p className="text-xs text-gray-500 truncate">Instant estimates before you book</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/remote-support"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-blue-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600">Remote Support</h4>
                    <p className="text-xs text-gray-500 truncate">Fast online fix anywhere in Sierra Leone</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/chat"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-emerald-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-comments"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-emerald-600">Live Chat Support</h4>
                    <p className="text-xs text-gray-500 truncate">Chat directly with a certified technician</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/track-repair"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-purple-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-search"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-purple-600">Track Your Repair</h4>
                    <p className="text-xs text-gray-500 truncate">Check the live status of your device repair</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>
              </div>

              <div className="space-y-1.5 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 block">Guides &amp; Company</span>

                <Link
                  href="/repair-guides"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-indigo-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-book-medical"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600">Repair Guides</h4>
                    <p className="text-xs text-gray-500 truncate">Step-by-step DIY troubleshooting guides</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/repair-showcase"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-teal-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-camera-retro"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-teal-600">Repair Showcase</h4>
                    <p className="text-xs text-gray-500 truncate">Before &amp; After photo gallery</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/contact"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-rose-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-rose-600">Contact Us</h4>
                    <p className="text-xs text-gray-500 truncate">Call, email, or visit our office</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/faq"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-amber-50/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-amber-600">FAQ</h4>
                    <p className="text-xs text-gray-500 truncate">Frequently asked questions</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>

                <Link
                  href="/about"
                  onClick={() => { setSupportPopupOpen(false); closeMobileMenu(); }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 text-base">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#040e40]">About Us</h4>
                    <p className="text-xs text-gray-500 truncate">BridgeTech IT Services team &amp; mission</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 text-xs group-hover:translate-x-0.5 transition-transform"></i>
                </Link>
              </div>
            </div>

            {/* Quick Contact Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold shrink-0">
              <a 
                href="https://wa.me/23233399391" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-green-700 hover:underline flex items-center gap-1.5"
              >
                <i className="fab fa-whatsapp text-sm"></i> WhatsApp Us
              </a>
              <a 
                href="tel:+23276210320" 
                className="text-blue-700 hover:underline flex items-center gap-1.5"
              >
                <i className="fas fa-phone-alt text-xs"></i> Call Support
              </a>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}
