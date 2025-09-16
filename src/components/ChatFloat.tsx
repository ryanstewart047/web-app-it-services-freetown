'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ChatFloat() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleChatClick = () => {
    window.location.href = '/chat'
  }

  return (
    <div className="chat-float-container fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]">
      <div className="relative">
        {/* Pulse ring animation (behind the button) */}
        <div className="absolute -inset-1 sm:-inset-2 bg-primary/30 rounded-full animate-ping pointer-events-none"></div>
        
        {/* Chat bubble with pulse animation - Using button for better click handling */}
        <button
          onClick={handleChatClick}
          className="chat-float-button group relative z-10 block bg-primary hover:bg-primary/90 text-white p-3 sm:p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer min-w-[56px] min-h-[56px] sm:min-w-[60px] sm:min-h-[60px] touch-manipulation"
          style={{ pointerEvents: 'auto', border: 'none' }}
          title="Open Chat Support"
        >
          <div className="flex items-center space-x-2 justify-center">
            <i className="fas fa-comments text-lg sm:text-xl"></i>
            <span className="hidden lg:block font-medium text-sm">Chat Support</span>
          </div>
        </button>
        
        {/* Close button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsVisible(false)
          }}
          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs transition-colors z-20 cursor-pointer touch-manipulation"
          style={{ pointerEvents: 'auto', border: 'none' }}
          title="Close chat support"
        >
          <i className="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>
  )
}
