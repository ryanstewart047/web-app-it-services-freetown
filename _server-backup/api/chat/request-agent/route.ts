import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSessionId } from '@/lib/repair-tracking'
import { notificationService, agentAvailabilityService } from '@/lib/notification-service'

// POST /api/chat/request-agent - Request human agent for chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerEmail,
      deviceType,
      issueDescription,
      sessionId
    } = body

    // Validate required fields
    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: 'Customer name and email are required' }, { status: 400 })
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { email: customerEmail }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: 'N/A' // Will be updated when available
        }
      })
    }

    // Generate session ID if not provided
    const chatSessionId = sessionId || generateSessionId()

    // Find or create chat session
    let chatSession = await prisma.chatSession.findFirst({
      where: { 
        id: chatSessionId,
        customerId: customer.id
      }
    })

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          id: chatSessionId,
          customerId: customer.id,
          status: 'waiting-agent',
          startedAt: new Date()
        }
      })
    } else {
      // Update session status to waiting for agent
      chatSession = await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          status: 'waiting-agent'
        }
      })
    }

    // Check for available agents
    const availableAgent = agentAvailabilityService.getAvailableAgent(deviceType)

    if (availableAgent) {
      // Assign agent immediately
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: {
          technicianId: availableAgent,
          status: 'agent-joined'
        }
      })

      // Increment agent's active chats
      agentAvailabilityService.incrementActiveChats(availableAgent)

      // Notify the specific agent
      await notificationService.notifyAgentAssignment(
        availableAgent,
        chatSession.id,
        customer.name
      )

      return NextResponse.json({
        success: true,
        sessionId: chatSession.id,
        message: 'Agent found! You are being connected...',
        agentAssigned: true,
        estimatedWaitTime: 0
      })
    } else {
      // No agents available, add to queue
      const chatRequest = {
        sessionId: chatSession.id,
        customerName: customer.name,
        customerEmail: customer.email,
        deviceType: deviceType || 'unknown',
        issueDescription: issueDescription || 'General support request',
        timestamp: new Date()
      }

      // Notify all agents about the chat request
      await notificationService.notifyAgentsOfChatRequest(chatRequest)

      // Add system message to chat
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          content: 'You have been added to the queue. An agent will join shortly. Please stay connected.',
          sender: 'system',
          messageType: 'system'
        }
      })

      return NextResponse.json({
        success: true,
        sessionId: chatSession.id,
        message: 'You have been added to the queue. An agent will join shortly.',
        agentAssigned: false,
        estimatedWaitTime: 3 // minutes
      })
    }

  } catch (error) {
    console.error('Agent request error:', error)
    return NextResponse.json({ error: 'Failed to request agent' }, { status: 500 })
  }
}

// GET /api/chat/request-agent - Check agent status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        customer: true,
        technician: true
      }
    })

    if (!chatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 })
    }

    const response = {
      sessionId: chatSession.id,
      status: chatSession.status,
      agentAssigned: chatSession.status === 'agent-joined',
      agentName: chatSession.technician?.name || null,
      estimatedWaitTime: chatSession.status === 'waiting-agent' ? 3 : 0,
      startedAt: chatSession.startedAt,
      endedAt: chatSession.endedAt
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Agent status check error:', error)
    return NextResponse.json({ error: 'Failed to check agent status' }, { status: 500 })
  }
}
