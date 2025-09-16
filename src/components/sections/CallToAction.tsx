'use client'

import Link from 'next/link'

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-600 text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Get Your Device Fixed?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of satisfied customers who trust us with their valuable devices
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/book-appointment"
            className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center"
          >
            <i className="fas fa-calendar-plus mr-2"></i>
            Book Appointment Now
          </Link>
          
          <Link 
            href="/chat"
            className="bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 border border-white/30 inline-flex items-center"
          >
            <i className="fas fa-comments mr-2"></i>
            Chat with Expert
          </Link>
        </div>
      </div>
    </section>
  )
}
