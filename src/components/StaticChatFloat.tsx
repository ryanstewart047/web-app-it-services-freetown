'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function StaticChatFloat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // For static deployment, redirect to contact methods
    if (message.trim()) {
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/23233399391?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
      setMessage('')
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Chat Float Button */}
      <div className="chat-float-container">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="chat-float-button bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          aria-label="Open chat"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="bg-red-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Need Help?</h3>
            <p className="text-sm opacity-90">Send us a message via WhatsApp</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your IT issue..."
              className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
            
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Send via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </form>
          
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-600">
              📞 Call: +232 33 399 391<br />
              📧 Email: support@itservicesfreetown.com<br />
              📍 Location: 1 Regent Highway, Jui Junction
            </p>
          </div>
        </div>
      )}
    </>
  )
}
