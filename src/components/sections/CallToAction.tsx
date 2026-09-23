'use client'

import Link from 'next/link'

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-[#040e40] via-[#040e40] to-red-600 text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#040e40]/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6" data-animate="fade">
          Ready to Get Your Device Fixed?
        </h2>
        <p className="text-xl mb-8 opacity-90" data-animate="fade">
          Join thousands of satisfied customers who trust us with their valuable devices
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center items-center" data-animate="scale">
          <Link 
            href="/book-appointment"
            className="bg-red-600 hover:bg-red-700 text-white text-base sm:text-lg px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl inline-flex items-center gap-2"
          >
            <i className="fas fa-calendar-check text-lg"></i>
            <span>Book Repair Appointment</span>
          </Link>

          <a 
            href="https://wa.me/23233399391?text=Hello%20BridgeTech,%20I%20need%20help%20with%20my%20device%20repair"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-base sm:text-lg px-7 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl inline-flex items-center gap-2"
          >
            <i className="fab fa-whatsapp text-xl"></i>
            <span>WhatsApp Instant Support</span>
          </a>

          <Link 
            href="/digital-tools"
            className="bg-white/10 hover:bg-white/20 text-white text-base sm:text-lg px-6 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-white/30 inline-flex items-center gap-2 backdrop-blur-sm"
          >
            <i className="fas fa-wand-magic-sparkles text-amber-300"></i>
            <span>Free Digital Tools Studio</span>
          </Link>
        </div>

        {/* Trust Badges & Direct Hotline */}
        <div className="mt-10 pt-8 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-white/90">
          <span className="flex items-center gap-1.5">
            <i className="fas fa-check-circle text-emerald-400"></i>
            <span>Free Diagnostic Assessment</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-shield-alt text-amber-400"></i>
            <span>1-Month Repair Warranty</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-bolt text-red-400"></i>
            <span>Same-Day Turnaround Available</span>
          </span>
          <span className="flex items-center gap-1.5 font-bold text-white bg-white/10 px-3 py-1 rounded-full">
            <i className="fas fa-phone-alt text-red-400"></i>
            <span>Hotline: +232 33 399 391</span>
          </span>
        </div>
      </div>
    </section>
  )
}
