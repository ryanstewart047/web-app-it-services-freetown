'use client'

import { useState, useEffect, useRef } from 'react'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { openChatFloat } from '@/lib/chat-float-controller'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  timestamp: Date
  type?: 'text' | 'system' | 'transfer' | 'tracking'
  trackingData?: any
}

export default function Chat() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 1600
  });
  
  // Initialize scroll animations
  useScrollAnimations()
  
  const [isClient, setIsClient] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today?\n\n🔧 I can help you with:\n• Device troubleshooting and repair advice\n• Booking new appointments\n• **Tracking your existing repairs** (just provide your tracking ID)\n• General IT support questions\n• Connecting you with our live agents\n\nWhat would you like assistance with?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getBotResponse = async (userMessage: string) => {
    setIsTyping(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        const messageType = data.source === 'repair_tracking' ? 'tracking' : 'text'
        addMessage(data.response, 'bot', messageType, data.trackingData)
      } else {
        addMessage("I'm sorry, I'm having trouble responding right now. Please try again or contact us directly.", 'bot')
      }
    } catch (error) {
      console.error('Error calling chat API:', error)
      addMessage("I'm sorry, I'm having trouble responding right now. Please try again or contact us directly.", 'bot')
    }
    
    setIsTyping(false)
  }

  const addMessage = (content: string, sender: 'user' | 'bot' | 'agent', type: 'text' | 'system' | 'transfer' | 'tracking' = 'text', trackingData?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      type,
      trackingData
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    addMessage(inputMessage, 'user')
    const userMsg = inputMessage
    setInputMessage('')
    
    getBotResponse(userMsg)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Chat Support</h1>
            <p className="text-gray-600">Get instant help from our AI assistant or connect with a live technician</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-white"></i>
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-sm opacity-90">Automated Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Online</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : message.sender === 'agent'
                      ? 'bg-green-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'system' ? (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="fas fa-info-circle"></i>
                      <span>{message.content}</span>
                    </div>
                  ) : message.type === 'tracking' && message.trackingData ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm font-semibold">
                        <i className="fas fa-clipboard-list text-blue-500"></i>
                        <span>Repair Status Found</span>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{message.trackingData.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            message.trackingData.status === 'completed' ? 'bg-green-100 text-green-800' :
                            message.trackingData.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            message.trackingData.status === 'ready-for-pickup' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.trackingData.status.charAt(0).toUpperCase() + message.trackingData.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div><strong>Device:</strong> {message.trackingData.deviceType} - {message.trackingData.deviceModel}</div>
                          <div><strong>Customer:</strong> {message.trackingData.customerName}</div>
                          {message.trackingData.estimatedCompletion && (
                            <div><strong>Est. Completion:</strong> {new Date(message.trackingData.estimatedCompletion).toLocaleDateString()}</div>
                          )}
                          {message.trackingData.cost && (
                            <div><strong>Est. Cost:</strong> Le {message.trackingData.cost.toLocaleString()}</div>
                          )}
                        </div>
                        
                        {message.trackingData.notes && (
                          <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                            <strong>Latest Update:</strong> {message.trackingData.notes}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs opacity-70 mt-2">
                        {isClient ? message.timestamp.toLocaleTimeString() : '--:--:--'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-line text-sm">{message.content}</div>
                      <p className="text-xs opacity-70 mt-1">
                        {isClient ? message.timestamp.toLocaleTimeString() : '--:--:--'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t p-4">
            <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  addMessage('I need help booking an appointment', 'user')
                  getBotResponse('book appointment')
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                Book Appointment
              </button>
              <button
                onClick={() => {
                  addMessage('I want to track my repair', 'user')
                  getBotResponse('track my repair')
                }}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                <i className="fas fa-search mr-1"></i>
                Track Repair
              </button>
              <button
                onClick={() => {
                  addMessage('TRK-001', 'user')
                  getBotResponse('TRK-001')
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                Demo: TRK-001
              </button>
              <button
                onClick={() => {
                  addMessage('I want to talk to a human agent', 'user')
                  addMessage('Great! I\'ll connect you to WhatsApp where you can chat directly with our expert technicians.', 'bot', 'system')
                  
                  // Open chat float with pre-filled message after a brief delay
                  setTimeout(() => {
                    const prefilledMessage = `Hi! I need to speak with a human agent about my device issue. I was chatting on your website and need further assistance.`
                    addMessage('💬 Opening WhatsApp chat for direct communication with our experts...', 'bot', 'system')
                    openChatFloat(prefilledMessage)
                  }, 1500)
                }}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                Connect to Agent
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
