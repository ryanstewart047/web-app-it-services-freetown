'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  timestamp: Date
  type?: 'text' | 'system' | 'transfer'
}

interface ChatSession {
  id: string
  status: 'active' | 'waiting' | 'ended'
  agent?: {
    name: string
    role: string
    avatar: string
  }
}

const botResponses = [
  "I understand you're having an issue with your device. Let me help you with that.",
  "Based on what you've described, I can suggest a few troubleshooting steps.",
  "That sounds like a common issue. Let me connect you with one of our human technicians who can provide more specific assistance.",
  "I'm analyzing your problem. Would you like me to transfer you to a live agent for immediate help?",
  "I can help you book an appointment or provide some initial troubleshooting steps. What would you prefer?"
]

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you with your device today?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ])
  
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatSession, setChatSession] = useState<ChatSession>({
    id: 'chat_' + Date.now(),
    status: 'active'
  })
  const [showAgentTransfer, setShowAgentTransfer] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (content: string, sender: 'user' | 'bot' | 'agent', type: 'text' | 'system' | 'transfer' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
      type
    }
    setMessages(prev => [...prev, newMessage])
  }

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      let response = botResponses[Math.floor(Math.random() * botResponses.length)]
      
      // Simple keyword-based responses
      if (userMessage.toLowerCase().includes('appointment') || userMessage.toLowerCase().includes('book')) {
        response = "I can help you book an appointment. What type of device needs repair and what's the issue?"
      } else if (userMessage.toLowerCase().includes('track') || userMessage.toLowerCase().includes('status')) {
        response = "I can help you track your repair. Do you have your repair ID number?"
      } else if (userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
        response = "Our pricing depends on the type of repair. Computer repairs start from $50, mobile repairs from $30. Would you like a detailed quote?"
      }
      
      addMessage(response, 'bot')
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const connectToAgent = () => {
    setShowAgentTransfer(true)
    addMessage('Connecting you to a live agent...', 'bot', 'system')
    
    setTimeout(() => {
      setChatSession({
        ...chatSession,
        status: 'active',
        agent: {
          name: 'Sarah Johnson',
          role: 'Senior Technician',
          avatar: '/api/placeholder/32/32'
        }
      })
      addMessage('Hi! I\'m Sarah, a senior technician. I\'m here to help you with your device issue.', 'agent')
      setShowAgentTransfer(false)
    }, 3000)
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    addMessage(inputMessage, 'user')
    const userMsg = inputMessage
    setInputMessage('')
    
    if (chatSession.agent) {
      // Simulate agent response
      setTimeout(() => {
        addMessage('Thank you for that information. Let me check our system...', 'agent')
      }, 1000)
    } else {
      simulateBotResponse(userMsg)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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
                  {chatSession.agent ? (
                    <i className="fas fa-user text-white"></i>
                  ) : (
                    <i className="fas fa-robot text-white"></i>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {chatSession.agent ? chatSession.agent.name : 'AI Assistant'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {chatSession.agent ? chatSession.agent.role : 'Automated Support'}
                  </p>
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
                  {message.type === 'system' && (
                    <div className="flex items-center space-x-2 text-sm">
                      <i className="fas fa-info-circle"></i>
                      <span>{message.content}</span>
                    </div>
                  )}
                  {message.type !== 'system' && (
                    <>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
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
          {!chatSession.agent && (
            <div className="border-t p-4">
              <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    addMessage('I need help booking an appointment', 'user')
                    simulateBotResponse('book appointment')
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => {
                    addMessage('I want to track my repair', 'user')
                    simulateBotResponse('track repair')
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  Track Repair
                </button>
                <button
                  onClick={connectToAgent}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                >
                  Connect to Agent
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
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
