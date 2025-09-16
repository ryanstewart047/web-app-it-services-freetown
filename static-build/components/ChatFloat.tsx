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
    <div className="chat-float-container fixed bottom-6 right-6 z-[9999]">
      <div className="relative">
        {/* Pulse ring animation (behind the button) */}
        <div className="absolute -inset-2 bg-primary/30 rounded-full animate-ping pointer-events-none"></div>
        
        {/* Chat bubble with pulse animation - Using button for better click handling */}
        <button
          onClick={handleChatClick}
          className="chat-float-button group relative z-10 block bg-primary hover:bg-primary/90 text-white p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 cursor-pointer min-w-[60px] min-h-[60px]"
          style={{ pointerEvents: 'auto', border: 'none' }}
          title="Open Chat Support"
        >
          <div className="flex items-center space-x-2 justify-center">
            <i className="fas fa-comments text-xl"></i>
            <span className="hidden md:block font-medium">Chat Support</span>
          </div>
        </button>
        
        {/* Close button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsVisible(false)
          }}
          className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors z-20 cursor-pointer"
          style={{ pointerEvents: 'auto', border: 'none' }}
          title="Close chat support"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  )
}
