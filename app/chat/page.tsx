'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { openChatFloat } from '@/lib/chat-float-controller'
import { DisplayAd, MultiplexAd } from '@/components/AdSense'
import PageBanner from '@/components/PageBanner'
import { 
  generateChatResponseClient, 
  isRepairTrackingQueryClient, 
  extractTrackingIdClient,
  handleRepairTrackingClient, 
  isCustomerLookupQuery,
  hasCustomerLookupInfo,
  handleCustomerLookup,
  isStaticDeployment 
} from '@/lib/groq-ai-client'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot' | 'agent'
  timestamp: Date
  type?: 'text' | 'system' | 'transfer' | 'tracking'
  trackingData?: any
}

const CHAT_SESSION_STORAGE_KEY = 'its-chat-support-session-v1'

const initialAssistantMessage =
  'Hello! I\'m Alison, your AI assistant at IT Services Freetown. How can I help you today?\n\n🔧 I can help you with:\n• Device troubleshooting and repair advice\n• Booking new appointments\n• **Tracking your existing repairs** (just provide your tracking ID)\n• **Finding your repair** by name, email, or phone number\n• General IT support questions\n• Connecting you with our live agents\n\nWhat would you like assistance with?'

const createMessage = (
  content: string,
  sender: 'user' | 'bot' | 'agent',
  type: 'text' | 'system' | 'transfer' | 'tracking' = 'text',
  trackingData?: any
): Message => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  content,
  sender,
  timestamp: new Date(),
  type,
  trackingData
})

const createInitialMessage = (): Message =>
  createMessage(initialAssistantMessage, 'bot')

const buildConversationHistory = (chatMessages: Message[]) =>
  chatMessages
    .filter(message => message.type !== 'system' && message.content.trim().length > 0)
    .map(message => ({
      role: message.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: message.content
    }))
    .slice(-12)

const hasPendingCustomerLookup = (chatMessages: Message[]) => {
  const recentText = chatMessages
    .slice(-6)
    .map(message => message.content.toLowerCase())
    .join(' ')

  return [
    'forgot my tracking',
    'lost my tracking',
    'find my repair',
    'find your repair',
    'provide one of the following',
    'your full name',
    'your email address',
    'your phone number',
    'please provide your tracking id'
  ].some(phrase => recentText.includes(phrase))
}

const isLostTrackingLookupMessage = (message: string) => {
  const msg = message.toLowerCase()

  return [
    'forgot my tracking',
    'lost my tracking',
    'do not have my tracking',
    'don\'t have my tracking',
    'dont have my tracking',
    'do not know my tracking',
    'don\'t know my tracking',
    'dont know my tracking',
    'find my repair',
    'find my tracking',
    'look up my repair',
    'lookup my repair'
  ].some(phrase => msg.includes(phrase))
}

export default function Chat() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 1600
  });
  
  // Initialize scroll animations
  useScrollAnimations()
  
  const [isClient, setIsClient] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => [createInitialMessage()])
  
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
    const savedMessages = window.sessionStorage.getItem(CHAT_SESSION_STORAGE_KEY)

    if (!savedMessages) return

    try {
      const parsedMessages = JSON.parse(savedMessages)

      if (!Array.isArray(parsedMessages)) return

      const restoredMessages = parsedMessages
        .filter((message: any) => typeof message?.content === 'string' && ['user', 'bot', 'agent'].includes(message?.sender))
        .map((message: any) => {
          const restoredTimestamp = message.timestamp ? new Date(message.timestamp) : new Date()

          return {
            ...message,
            timestamp: Number.isNaN(restoredTimestamp.getTime()) ? new Date() : restoredTimestamp,
            type: message.type || 'text'
          }
        })

      if (restoredMessages.length > 0) {
        setMessages(restoredMessages)
      }
    } catch (error) {
      console.warn('Unable to restore chat session:', error)
      window.sessionStorage.removeItem(CHAT_SESSION_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!isClient) return

    window.sessionStorage.setItem(
      CHAT_SESSION_STORAGE_KEY,
      JSON.stringify(messages.map(message => ({
        ...message,
        timestamp: message.timestamp.toISOString()
      })))
    )
  }, [isClient, messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getBotResponse = async (userMessage: string, previousMessages: Message[] = messages) => {
    setIsTyping(true)
    
    // Minimum typing delay (3 seconds) so the bot feels more natural
    const minDelay = new Promise(resolve => setTimeout(resolve, 3000))
    
    try {
      const conversationHistory = buildConversationHistory(previousMessages)
      const shouldAllowBareNameLookup = hasPendingCustomerLookup(previousMessages)
      const hasTrackingId = extractTrackingIdClient(userMessage) !== null
      const shouldRunLookupFollowUp =
        shouldAllowBareNameLookup && hasCustomerLookupInfo(userMessage, { allowBareName: true })
      const shouldRunDirectLookup =
        isCustomerLookupQuery(userMessage) &&
        (isLostTrackingLookupMessage(userMessage) || !isRepairTrackingQueryClient(userMessage))
      const shouldRunCustomerLookup =
        !hasTrackingId && (shouldRunLookupFollowUp || shouldRunDirectLookup)

      // Check if we're in a static deployment (GitHub Pages)
      const useClientSide = isStaticDeployment()
      console.log('Using client-side AI for chat:', useClientSide)
      
      if (useClientSide) {
        // Handle customer lookup by name/email/phone, including follow-up names after a lookup prompt
        if (shouldRunCustomerLookup) {
          const [lookupResult] = await Promise.all([
            handleCustomerLookup(userMessage, { allowBareName: shouldAllowBareNameLookup }),
            minDelay
          ])
          addMessage(lookupResult.response, 'bot',
            lookupResult.source === 'repair_tracking' ? 'tracking' : 'text',
            lookupResult.trackingData)
          setIsTyping(false)
          return
        }

        // Handle repair tracking queries first (client-side)
        if (isRepairTrackingQueryClient(userMessage)) {
          const [trackingResult] = await Promise.all([
            handleRepairTrackingClient(userMessage),
            minDelay
          ])
          addMessage(trackingResult.response, 'bot', 
            trackingResult.source === 'repair_tracking' ? 'tracking' : 'text', 
            trackingResult.trackingData)
          setIsTyping(false)
          return
        }

        // Use client-side Google AI API for static deployments
        const [aiResponse] = await Promise.all([
          generateChatResponseClient({
            userMessage,
            conversationHistory,
            systemContext: 'chat_support'
          }),
          minDelay
        ])
        
        addMessage(aiResponse, 'bot')
      } else {
        // Use server-side API for full Next.js deployments
        const [response] = await Promise.all([
          fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage, conversationHistory }),
          }),
          minDelay
        ])
        
        const data = await response.json()
        
        if (data.success) {
          const messageType = data.source === 'repair_tracking' ? 'tracking' : 'text'
          addMessage(data.response, 'bot', messageType, data.trackingData)
        } else {
          addMessage("I'm sorry, I'm having trouble responding right now. Please try again or contact us directly.", 'bot')
        }
      }
    } catch (error) {
      console.error('Error calling chat:', error)
      await minDelay // Still wait for natural feel even on error
      addMessage("I'm sorry, I'm having trouble responding right now. Please try again or contact us directly.", 'bot')
    }
    
    setIsTyping(false)
  }

  const addMessage = (content: string, sender: 'user' | 'bot' | 'agent', type: 'text' | 'system' | 'transfer' | 'tracking' = 'text', trackingData?: any) => {
    const newMessage = createMessage(content, sender, type, trackingData)
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    const userMsg = inputMessage.trim()
    const previousMessages = messages
    addMessage(userMsg, 'user')
    setInputMessage('')
    
    getBotResponse(userMsg, previousMessages)
  }

  const sendQuickMessage = (displayMessage: string, aiMessage = displayMessage) => {
    const previousMessages = messages
    addMessage(displayMessage, 'user')
    getBotResponse(aiMessage, previousMessages)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderMessageContent = (content: string) => {
    // Regex for URLs (including http, https, and common site paths)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|(?:\/|itservicesfreetown\.com\/)[a-zA-Z0-9\-\._~:\/\?#\[\]@!\$&'\(\)\*\+,;=%]+)/gi;
    
    // Regex for Bold text (**text**)
    const boldRegex = /\*\*([^*]+)\*\*/g;

    // Process bold text first by wrapping in placeholders, then handle URLs
    // This is a simple way to avoid conflicts between regexes
    let parts: (string | JSX.Element)[] = [content];

    // 1. Handle Bold
    let newParts: (string | JSX.Element)[] = [];
    parts.forEach(part => {
      if (typeof part === 'string') {
        const subParts = part.split(boldRegex);
        for (let i = 0; i < subParts.length; i++) {
          if (i % 2 === 1) {
            newParts.push(<strong key={`bold-${i}`} className="font-bold">{subParts[i]}</strong>);
          } else if (subParts[i]) {
            newParts.push(subParts[i]);
          }
        }
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;

    // 2. Handle URLs
    newParts = [];
    parts.forEach((part, partIdx) => {
      if (typeof part === 'string') {
        const subParts = part.split(urlRegex);
        const matches: string[] = part.match(urlRegex) || [];
        
        let matchIdx = 0;
        for (let i = 0; i < subParts.length; i++) {
          // The split with capturing group returns the matches at odd indices
          // But our regex has multiple groups or might be complex. 
          // Let's use a simpler approach: check if subParts[i] matches the regex.
          const isUrl = matches.includes(subParts[i]);
          
          if (isUrl) {
            let url = subParts[i];
            // Ensure URL is absolute for the href
            let href = url;
            if (url.startsWith('/')) {
              href = url; // Internal link
            } else if (!url.startsWith('http')) {
              href = `https://${url}`;
            }
            
            newParts.push(
              <a 
                key={`link-${partIdx}-${i}`} 
                href={href} 
                target={url.startsWith('/') ? '_self' : '_blank'}
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline font-bold bg-blue-50 px-1 rounded mx-0.5 inline-flex items-center"
              >
                {url.startsWith('/') ? <i className="fas fa-external-link-alt text-[10px] mr-1"></i> : null}
                {url}
              </a>
            );
          } else if (subParts[i]) {
            newParts.push(subParts[i]);
          }
        }
      } else {
        newParts.push(part);
      }
    });

    return newParts;
  };

  return (
    <>
      <LoadingOverlay show={isLoading} progress={progress} variant="modern" />
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          title="AI Chat Support"
          subtitle="Get instant help with your device issues"
          icon="fas fa-comments"
          compact
        />

      {/* Ad Banner - Top */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <DisplayAd />
      </div>

      {/* Chat Container */}
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
                        <i className="fas fa-clipboard-list text-red-600"></i>
                        <span>Repair Status Found</span>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{message.trackingData.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            message.trackingData.status === 'completed' ? 'bg-green-100 text-green-800' :
                            message.trackingData.status === 'in-progress' ? 'bg-red-100 text-red-800' :
                            message.trackingData.status === 'ready-for-pickup' ? 'bg-[#040e40]/20 text-[#040e40]' :
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
                          <div className="text-sm text-gray-700 bg-red-50 p-2 rounded border-l-4 border-red-400">
                            <strong>Latest Update:</strong> {message.trackingData.notes}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs opacity-70 mt-2">
                        {isClient ? message.timestamp.toLocaleTimeString() : '--:--:--'}
                      </p>
                    </div>
                  ) : (
                    <React.Fragment>
                      <div className="whitespace-pre-line text-sm">
                        {renderMessageContent(message.content)}
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {isClient ? message.timestamp.toLocaleTimeString() : '--:--:--'}
                      </p>
                    </React.Fragment>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: '0.6s', animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-1">Alison is typing</span>
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
                onClick={() => sendQuickMessage('I need help booking an appointment', 'book appointment')}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
              >
                Book Appointment
              </button>
              <button
                onClick={() => sendQuickMessage('I want to track my repair', 'track my repair')}
                className="px-3 py-1 bg-[#040e40]/10 text-[#040e40] rounded-full text-sm hover:bg-[#040e40]/20 transition-colors"
              >
                <i className="fas fa-search mr-1"></i>
                Track Repair
              </button>
              <button
                onClick={() => sendQuickMessage('I lost my tracking ID, can you find my repair?', 'find my repair, I lost my tracking ID')}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                <i className="fas fa-user-search mr-1"></i>
                Find My Repair
              </button>
              <button
                onClick={() => sendQuickMessage('ITS-250926-1001')}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                Demo: ITS-250926-1001
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

      {/* Ad Banner - Bottom */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <MultiplexAd />
      </div>
      </div>
    </>
  )
}
