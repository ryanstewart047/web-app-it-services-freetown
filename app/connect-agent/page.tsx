'use client'

import { useEffect } from 'react'
import { openChatFloat } from '@/lib/chat-float-controller'

export default function ConnectAgentPage() {
  useEffect(() => {
    // Auto-open the chat when this page loads
    openChatFloat("Hi! I&apos;d like to connect with an agent for support.")
    
    // Optional: redirect to home page after opening chat
    const timer = setTimeout(() => {
      window.location.href = '/'
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Connecting to Agent</h1>
        <p className="text-gray-600">
          Opening chat window... You&apos;ll be redirected to the main page in a moment.
        </p>
      </div>
    </div>
  )
}