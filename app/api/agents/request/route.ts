import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, customerEmail, reason } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Find the chat session
    let chatSession = await prisma.chatSession.findFirst({
      where: { 
        OR: [
          { id: sessionId },
          { customerId: sessionId }
        ]
      },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!chatSession) {
      // Create new session if not found
      let customer = await prisma.customer.findFirst({
        where: { id: sessionId }
      })

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            id: sessionId,
            name: customerEmail ? 'Customer' : 'Anonymous User',
            email: customerEmail || `user_${sessionId}@temp.local`,
            phone: 'N/A'
          }
        })
      }

      chatSession = await prisma.chatSession.create({
        data: {
          customerId: customer.id,
          status: 'waiting'
        },
        include: {
          customer: true,
          messages: true
        }
      })
    } else {
      // Update existing session to waiting status
      chatSession = await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { status: 'waiting' },
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      })
    }

    // Add system message about agent request
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        content: reason || 'Customer requested to speak with a human agent',
        sender: 'system',
        messageType: 'transfer'
      }
    })

    // Here you would typically:
    // 1. Send push notification to available agents
    // 2. Add to agent queue
    // 3. Send email/SMS alert to agents
    // 4. Update dashboard in real-time

    // For now, we'll simulate agent notification
    console.log('🚨 AGENT REQUEST ALERT 🚨')
    console.log(`Session: ${chatSession.id}`)
    console.log(`Customer: ${chatSession.customer.name} (${chatSession.customer.email})`)
    console.log(`Reason: ${reason || 'Customer requested human support'}`)
    console.log(`Time: ${new Date().toISOString()}`)

    // In a real implementation, you would:
    // - Send to queue (Redis/Database)
    // - Notify via WebSocket
    // - Send push notifications
    // - Email/SMS alerts
    
    // Get queue position safely
    let queuePosition = 0;
    try {
      queuePosition = await getQueuePosition();
    } catch (e) {
      console.error("Error getting queue position:", e);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Agent has been notified. Please wait while we connect you...',
      sessionId: chatSession.id,
      estimatedWaitTime: '2-5 minutes',
      queuePosition
    })

  } catch (error) {
    console.error('Agent request error:', error)
    return NextResponse.json(
      { error: 'Failed to request agent. Please try again.' },
      { status: 500 }
    )
  }
}

async function getQueuePosition(): Promise<number> {
  try {
    // Count how many sessions are waiting for agents
    const waitingCount = await prisma.chatSession.count({
      where: { status: 'waiting' }
    })
    
    return waitingCount;
  } catch (error) {
    console.error('Error getting queue position:', error);
    return 0;
  }
}

// GET endpoint to check agent availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'availability') {
      // Simulate agent availability
      // In a real system, you'd check actual agent status
      const availableAgents = [
        {
          id: 'agent_1',
          name: 'Ryan Stewart',
          status: 'online',
          specialization: 'Senior Technician',
          currentChats: 1,
          maxChats: 3
        },
        {
          id: 'agent_2', 
          name: 'Alison P Stewart',
          status: 'busy',
          specialization: 'Mobile Specialist',
          currentChats: 2,
          maxChats: 2
        },
        {
          id: 'agent_3',
          name: 'Paul Joe Stewart', 
          status: 'offline',
          specialization: 'Computer Expert',
          currentChats: 0,
          maxChats: 3
        }
      ]

      const onlineAgents = availableAgents.filter(agent => 
        agent.status === 'online' && agent.currentChats < agent.maxChats
      )

      return NextResponse.json({
        success: true,
        availableAgents: onlineAgents.length,
        totalAgents: availableAgents.length,
        estimatedWaitTime: onlineAgents.length > 0 ? '2-5 minutes' : '10-15 minutes',
        agents: availableAgents
      })
    }

    if (action === 'queue') {
      let queueCount = 0;
      try {
        queueCount = await getQueuePosition();
      } catch (e) {
        console.error("Error getting queue position:", e);
      }
      
      return NextResponse.json({
        success: true,
        queueLength: queueCount,
        estimatedWaitTime: queueCount === 0 ? 'Immediate' : `${queueCount * 3}-${queueCount * 5} minutes`
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Agent availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check agent availability' },
      { status: 500 }
    )
  }
}
