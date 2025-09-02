import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, deviceType, deviceModel } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if we have API key configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        response: getFallbackResponse(message),
        isAI: false
      })
    }

    try {
      // Create system prompt based on context
      let systemPrompt = `You are a helpful IT support assistant for IT Services Freetown, a computer and mobile repair shop in Freetown, Sierra Leone. 
      
      You specialize in:
      - Computer repairs (desktops, laptops)
      - Mobile device repairs (smartphones, tablets)
      - Basic troubleshooting
      - Hardware diagnostics
      - Software issues
      
      Guidelines:
      - Be friendly, professional, and empathetic
      - Provide practical, step-by-step troubleshooting advice
      - If the issue seems complex or requires physical inspection, suggest booking an appointment
      - If you can't help or the customer needs immediate assistance, offer to connect them with a human agent
      - Keep responses concise but helpful (under 200 words)
      - Use simple language that non-technical users can understand
      
      Business information:
      - Location: 1 Regent Highway, Jui Junction, Freetown
      - Phone: +232 33 399 391
      - Email: support@itservicesfreetown.com
      - Hours: Mon-Sat 8AM-6PM`

      if (deviceType && deviceModel) {
        systemPrompt += `\n\nCustomer's device: ${deviceType} - ${deviceModel}`
      }

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })

      // Create the prompt with context
      const fullPrompt = `${systemPrompt}\n\nCustomer message: ${message}`

      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const aiResponse = response.text() || getFallbackResponse(message)

      // Save the conversation to database if sessionId provided
      if (sessionId) {
        try {
          // Find or create customer
          let customer = await prisma.customer.findFirst({
            where: { id: sessionId }
          })

          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                id: sessionId,
                name: 'Anonymous User',
                email: `user_${sessionId}@temp.local`,
                phone: 'N/A'
              }
            })
          }

          // Find or create chat session
          let chatSession = await prisma.chatSession.findFirst({
            where: { customerId: customer.id, status: 'active' }
          })

          if (!chatSession) {
            chatSession = await prisma.chatSession.create({
              data: {
                customerId: customer.id,
                status: 'active'
              }
            })
          }

          // Save user message
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              content: message,
              sender: 'user'
            }
          })

          // Save AI response
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              content: aiResponse,
              sender: 'bot'
            }
          })
        } catch (dbError) {
          console.error('Database error:', dbError)
          // Don't fail the request if DB save fails
        }
      }

      return NextResponse.json({
        success: true,
        response: aiResponse,
        isAI: true
      })

    } catch (geminiError) {
      console.error('Gemini API error:', geminiError)
      
      // Return fallback response if Gemini fails
      return NextResponse.json({
        success: true,
        response: getFallbackResponse(message),
        isAI: false
      })
    }

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message. Please try again.' },
      { status: 500 }
    )
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Basic keyword matching for common issues
  if (lowerMessage.includes('computer') && (lowerMessage.includes('start') || lowerMessage.includes('boot'))) {
    return "I can help you troubleshoot that! First, let's check if the power cable is securely connected. Can you confirm the power light is on? Also, try holding the power button for 10 seconds to fully shut down, then restart."
  }
  
  if (lowerMessage.includes('phone') && (lowerMessage.includes('battery') || lowerMessage.includes('drain'))) {
    return "Battery drain can be caused by several factors. Let's check: 1) Go to Settings > Battery to see which apps use the most power, 2) Enable battery saver mode, 3) Reduce screen brightness, 4) Close unused background apps. Would you like me to walk you through any of these steps?"
  }
  
  if (lowerMessage.includes('repair') && lowerMessage.includes('status')) {
    return "I can help you check your repair status! Do you have your repair ticket number? It should be in the format RT-XXXXXX. You can also visit our Track Repair page for real-time updates."
  }
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
    return "I'd be happy to help you book an appointment! You can either use our online booking system or I can connect you with an agent. What type of device needs repair - computer or mobile?"
  }
  
  if (lowerMessage.includes('human') || lowerMessage.includes('agent') || lowerMessage.includes('person')) {
    return "I'll connect you with one of our live technicians right away. Please hold while I transfer you..."
  }
  
  if (lowerMessage.includes('slow') || lowerMessage.includes('performance')) {
    return "Slow performance can have several causes. For computers: try restarting, check for Windows updates, run disk cleanup, and close unnecessary programs. For phones: restart the device, close background apps, and clear cache. Would you like detailed steps for any of these?"
  }
  
  if (lowerMessage.includes('virus') || lowerMessage.includes('malware')) {
    return "If you suspect malware, don't panic! First, disconnect from the internet if possible. Run a full system scan with your antivirus software. If you don't have one, I'd recommend bringing your device to our shop for professional cleaning and protection setup."
  }
  
  if (lowerMessage.includes('screen') && (lowerMessage.includes('broken') || lowerMessage.includes('crack'))) {
    return "Sorry to hear about your broken screen! For screen repairs, it's best to bring your device to our shop for proper assessment. We offer free diagnostics and can provide a quote for the repair. Our location is 1 Regent Highway, Jui Junction, Freetown."
  }
  
  // Default response
  return "I understand you need help with that. Let me see what I can do to assist you. Could you provide more details about the specific issue you're experiencing? Or would you like me to connect you with one of our human technicians?"
}
