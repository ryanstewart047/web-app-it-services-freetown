'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ChatFloat() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Chat bubble with pulse animation */}
        <Link href="/chat" className="group">
          <div className="bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center space-x-2">
            <i className="fas fa-comments text-xl"></i>
            <span className="hidden md:block font-medium">Chat Support</span>
          </div>
        </Link>
        
        {/* Pulse ring animation */}
        <div className="absolute -inset-2 bg-primary/30 rounded-full animate-ping"></div>
        
        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  )
}
