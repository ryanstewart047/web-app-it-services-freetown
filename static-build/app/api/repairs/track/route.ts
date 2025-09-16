import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { trackingId } = await request.json()
    
    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      )
    }

    // For now, we'll use the repair ID as tracking ID
    // In a real implementation, you'd add a trackingId field to the Repair model
    const repair = await prisma.repair.findFirst({
      where: { trackingId },
      include: {
        customer: true,
        timeline: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!repair) {
      return NextResponse.json(
        { error: 'Repair not found. Please check your tracking ID.' },
        { status: 404 }
      )
    }

    // Calculate estimated completion if not set
    let estimatedCompletion = repair.estimatedCompletion
    if (!estimatedCompletion && repair.status !== 'completed') {
      const createdDate = new Date(repair.createdAt)
      const daysToAdd = getEstimatedDays(repair.status)
      const estimated = new Date(createdDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000))
      estimatedCompletion = estimated.toISOString().split('T')[0] // Format as YYYY-MM-DD
    }

    return NextResponse.json({
      success: true,
      repair: {
        trackingId: `RT-${repair.id.slice(-8).toUpperCase()}`,
        customerName: repair.customer.name,
        deviceType: repair.deviceType,
        deviceModel: repair.deviceModel,
        issue: repair.issueDescription,
        status: repair.status,
        statusLabel: getStatusLabel(repair.status),
        estimatedCompletion,
        estimatedCost: repair.estimatedCost,
        createdAt: repair.createdAt,
        updatedAt: repair.updatedAt,
        progress: getStatusProgress(repair.status),
        timeline: repair.timeline.map((item: any) => ({
          step: item.step,
          status: item.status,
          timestamp: item.timestamp,
          description: item.description
        })),
        notes: repair.notes || '' // notes is a string field, not a relation
      }
    })

  } catch (error) {
    console.error('Repair tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track repair. Please try again.' },
      { status: 500 }
    )
  }
}

function getStatusLabel(status: string): string {
  const labels = {
    'received': 'Received',
    'diagnostic': 'Diagnosing Issue',
    'parts-ordered': 'Waiting for Parts',
    'in-repair': 'Under Repair',
    'testing': 'Testing & Quality Check',
    'completed': 'Repair Completed',
    'ready-pickup': 'Ready for Pickup'
  }
  return labels[status as keyof typeof labels] || status
}

function getStatusProgress(status: string): number {
  const progress = {
    'received': 15,
    'diagnostic': 30,
    'parts-ordered': 45,
    'in-repair': 70,
    'testing': 85,
    'completed': 95,
    'ready-pickup': 100
  }
  return progress[status as keyof typeof progress] || 15
}

function getEstimatedDays(status: string): number {
  const days = {
    'received': 3,
    'diagnostic': 2,
    'parts-ordered': 5,
    'in-repair': 2,
    'testing': 1,
    'completed': 0,
    'ready-pickup': 0
  }
  return days[status as keyof typeof days] || 3
}
