'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Phone, Mail, Clock, MessageSquare } from 'lucide-react'
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
      const message = userMessage.toLowerCase()
      if (message.includes('appointment') || message.includes('book')) {
        response = "I can help you book an appointment. Would you like me to redirect you to our booking page, or would you prefer to speak with a human agent?"
      } else if (message.includes('track') || message.includes('status')) {
        response = "I can help you track your repair. Do you have your tracking ID? Or would you like me to connect you with an agent?"
      } else if (message.includes('price') || message.includes('cost')) {
        response = "Pricing depends on the specific issue and device. Let me transfer you to one of our technicians who can provide accurate pricing information."
        setShowAgentTransfer(true)
      } else if (message.includes('emergency') || message.includes('urgent')) {
        response = "I understand this is urgent. Let me immediately connect you with one of our available technicians."
        setShowAgentTransfer(true)
      }
      
      addMessage(response, 'bot')
      setIsTyping(false)
      
      // Randomly suggest agent transfer
      if (Math.random() > 0.7 && !showAgentTransfer) {
        setTimeout(() => {
          addMessage("Would you like me to connect you with a human technician for more detailed assistance?", 'bot')
          setShowAgentTransfer(true)
        }, 2000)
      }
    }, 1500 + Math.random() * 1000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return
    
    addMessage(inputMessage, 'user')
    const userMsg = inputMessage
    setInputMessage('')
    
    // Simulate bot response
    simulateBotResponse(userMsg)
  }

  const handleTransferToAgent = () => {
    setIsTyping(true)
    setShowAgentTransfer(false)
    
    setTimeout(() => {
      addMessage('Connecting you to a live agent...', 'bot', 'system')
      setIsTyping(false)
      
      setTimeout(() => {
        setChatSession(prev => ({
          ...prev,
          status: 'active',
          agent: {
            name: 'Sarah Johnson',
            role: 'Senior Technician',
            avatar: 'SJ'
          }
        }))
        
        addMessage('Hi! I\'m Sarah, one of our senior technicians. I\'ve reviewed your conversation and I\'m here to help. What specific issue are you experiencing?', 'agent')
        toast.success('Connected to live agent!')
      }, 2000)
    }, 1000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageIcon = (sender: string) => {
    switch (sender) {
      case 'bot':
        return <Bot className="w-4 h-4" />
      case 'agent':
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {chatSession.agent ? `Chat with ${chatSession.agent.name}` : 'AI Support Chat'}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {chatSession.agent ? `${chatSession.agent.role} - Online` : 'AI Assistant - Online'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-primary rounded-lg hover:bg-gray-100">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.sender === 'user' ? 'ml-3' : 'mr-3'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                      message.sender === 'user' ? 'bg-primary' : 
                      message.sender === 'agent' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {message.sender === 'user' ? 'You' : 
                       message.sender === 'agent' ? chatSession.agent?.avatar || 'A' : 'AI'}
                    </div>
                  </div>
                  
                  {/* Message Content */}
                  <div className={`px-4 py-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary text-white' 
                      : message.type === 'system'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex mr-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {chatSession.agent ? chatSession.agent.avatar : 'AI'}
                  </div>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Agent Transfer Button */}
            {showAgentTransfer && !chatSession.agent && (
              <div className="flex justify-center">
                <button
                  onClick={handleTransferToAgent}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Connect to Live Agent
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                addMessage('I would like to book an appointment for my device repair', 'user')
                simulateBotResponse('book appointment')
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900 mb-2">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule a repair service</p>
            </button>
            <button
              onClick={() => {
                addMessage('I want to track my repair status', 'user')
                simulateBotResponse('track repair status')
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900 mb-2">Track Repair</h3>
              <p className="text-sm text-gray-600">Check repair progress</p>
            </button>
            <button
              onClick={() => {
                addMessage('What are your service prices?', 'user')
                simulateBotResponse('price cost pricing')
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <h3 className="font-medium text-gray-900 mb-2">Pricing Info</h3>
              <p className="text-sm text-gray-600">Get service pricing</p>
            </button>
          </div>
        </div>
      </div>

      {/* Support Hours */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Support Hours</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
                <p className="mt-2 font-medium">Live agents available during business hours. AI support is available 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
