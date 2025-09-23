'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { ChatFloatController } from '@/lib/chat-float-controller'

export default function StaticChatFloat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isDesktop, setIsDesktop] = useState(false)
  const [justOpened, setJustOpened] = useState(false)

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // High frequency
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1) // Lower frequency
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // Fallback: try to play a simple beep using HTML5 audio
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLagSUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+b2unQkBSuEzfLag==')
        audio.volume = 0.3
        audio.play()
      } catch (fallbackError) {
        console.log('Audio notification not available')
      }
    }
  }

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 640)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Listen for global chat float events
  useEffect(() => {
    const controller = ChatFloatController.getInstance()
    
    const unsubscribe = controller.subscribe((shouldOpen: boolean, prefilledMessage?: string) => {
      const wasOpen = isOpen
      setIsOpen(shouldOpen)
      
      // Play sound when opening the chat (not when closing)
      if (shouldOpen && !wasOpen) {
        playNotificationSound()
      }
      
      if (prefilledMessage) {
        setMessage(prefilledMessage)
        setJustOpened(true)
        // Remove the highlight after animation completes
        setTimeout(() => setJustOpened(false), 2000)
      }
    })

    return unsubscribe
  }, [isOpen])

  // Check for auto-open chat URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('openchat') === 'true') {
      // Auto-open chat with agent connection message
      setTimeout(() => {
        const controller = ChatFloatController.getInstance()
        controller.openChat("Hi! I&apos;d like to connect with an agent for support.")
        
        // Clean up the URL parameter
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }, 500)
    }
  }, [])

  const handleChatToggle = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    
    // Play sound when opening the chat (not when closing)
    if (newIsOpen) {
      playNotificationSound()
    }
  }

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
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 sm:hidden"
          style={{ zIndex: 9997 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Float Button */}
      <div className="chat-float-container">
        <button
          onClick={handleChatToggle}
          className={`chat-float-button bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            justOpened ? 'animate-pulse ring-4 ring-red-300' : ''
          }`}
          aria-label="Open chat"
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className={`bg-white rounded-lg shadow-xl border transform transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
          }`}
          style={{
            position: 'fixed',
            bottom: isDesktop ? '6rem' : '5rem',
            left: isDesktop ? 'auto' : '1rem',
            right: '1rem',
            width: isDesktop ? '20rem' : 'auto',
            zIndex: 9998,
            maxWidth: isDesktop ? '20rem' : 'calc(100vw - 2rem)',
            margin: isDesktop ? '0' : '0 auto'
          }}
        >
          <div className="bg-red-600 text-white p-4 rounded-t-lg relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Need Help?</h3>
                <p className="text-sm opacity-90">Send us a message via WhatsApp</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>          <form onSubmit={handleSubmit} className="p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your IT issue..."
              className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              required
            />
            
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Send via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </form>
          
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
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
