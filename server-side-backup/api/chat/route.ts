import { NextRequest, NextResponse } from 'next/server'
import { generateChatResponse, isRepairTrackingQuery, extractTrackingId } from '@/lib/google-ai-service'

// Mock repair tracking data (in production, this would come from a database)
const mockRepairData: Record<string, any> = {
  'TRK-001': {
    trackingId: 'TRK-001',
    device: 'iPhone 12',
    issue: 'Cracked screen replacement',
    status: 'In Progress',
    estimatedCompletion: '2025-09-26',
    technician: 'John Doe',
    notes: 'Screen ordered, will be replaced tomorrow morning'
  },
  'TRK-002': {
    trackingId: 'TRK-002',
    device: 'Dell Laptop',
    issue: 'Virus removal and system cleanup',
    status: 'Completed',
    estimatedCompletion: '2025-09-25',
    technician: 'Jane Smith',
    notes: 'System cleaned and optimized. Ready for pickup.'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Check if this is a repair tracking query
    if (isRepairTrackingQuery(message)) {
      const trackingId = extractTrackingId(message)
      
      if (trackingId && mockRepairData[trackingId]) {
        const repairData = mockRepairData[trackingId]
        const trackingResponse = `📋 **Repair Status for ${trackingId}**

**Device:** ${repairData.device}
**Issue:** ${repairData.issue}
**Status:** ${repairData.status}
**Technician:** ${repairData.technician}
**Est. Completion:** ${repairData.estimatedCompletion}

**Notes:** ${repairData.notes}

${repairData.status === 'Completed' ? '✅ Your device is ready for pickup!' : '⏳ We\'ll notify you when it\'s ready.'}

Need more details? Call us or visit our location.`

        return NextResponse.json({
          success: true,
          response: trackingResponse,
          source: 'repair_tracking',
          trackingData: repairData
        })
      } else if (trackingId) {
        return NextResponse.json({
          success: true,
          response: `❌ Sorry, I couldn't find a repair with tracking ID "${trackingId}". Please double-check the ID or contact us for assistance.

Valid format examples: TRK-001, TRK-002, etc.`,
          source: 'repair_tracking'
        })
      } else {
        return NextResponse.json({
          success: true,
          response: `🔍 To track your repair, please provide your tracking ID (format: TRK-XXX).

You can find this ID on your repair receipt or in the confirmation email we sent you.

Don't have your tracking ID? No problem! Contact us with your name and phone number, and we'll look it up for you.`,
          source: 'repair_tracking'
        })
      }
    }

    // Generate AI response for general queries
    const aiResponse = await generateChatResponse({
      userMessage: message,
      systemContext: 'chat_support'
    })

    return NextResponse.json({
      success: true,
      response: aiResponse,
      source: 'ai_chat'
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Fallback response
    const fallbackResponse = `I apologize, but I'm experiencing technical difficulties right now. 

Here's how you can get help:
• 📞 Call us directly for immediate assistance
• 💬 Try rephrasing your question
• 🔄 Refresh the page and try again

For urgent repairs, please visit our location in Freetown. We're here to help! 🛠️`

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      source: 'fallback'
    })
  }
}