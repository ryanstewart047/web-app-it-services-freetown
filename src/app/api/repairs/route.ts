import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRepairId, getStatusMessage } from '@/lib/repair-tracking'
import { sendEmail, emailTemplates } from '@/lib/email'
import { notificationService } from '@/lib/notification-service'

// GET /api/repairs - Get repair status by tracking ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const trackingId = searchParams.get('trackingId')

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required' }, { status: 400 })
    }

    // Find repair by tracking ID
    const repair = await prisma.repair.findFirst({
      where: { trackingId },
      include: {
        customer: true,
        appointment: true
      }
    })

    if (!repair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }

    const response = {
      trackingId: repair.trackingId,
      status: repair.status,
      statusMessage: getStatusMessage(repair.status),
      deviceType: repair.deviceType,
      deviceModel: repair.deviceModel,
      issueDescription: repair.issueDescription,
      estimatedCost: repair.estimatedCost,
      actualCost: repair.actualCost,
      dateReceived: repair.dateReceived,
      estimatedCompletion: repair.estimatedCompletion,
      dateCompleted: repair.dateCompleted,
      notes: repair.notes,
      customerName: repair.customer.name,
      customerEmail: repair.customer.email,
      customerPhone: repair.customer.phone
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching repair:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/repairs - Create a new repair record (typically from appointment)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      appointmentId,
      customerId,
      deviceType,
      deviceModel,
      issueDescription,
      estimatedCost,
      estimatedCompletion,
      notes
    } = body

    // Validate required fields
    if (!appointmentId || !customerId || !deviceType || !deviceModel || !issueDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate tracking ID
    const trackingId = generateRepairId()

    // Create repair record
    const repair = await prisma.repair.create({
      data: {
        trackingId,
        customerId,
        appointmentId,
        deviceType,
        deviceModel,
        issueDescription,
        status: 'received',
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        estimatedCompletion: estimatedCompletion || null,
        notes: notes || '',
        dateReceived: new Date()
      },
      include: {
        customer: true,
        appointment: true
      }
    })

    // Send repair created notification email
    const customer = repair.customer
    await sendEmail({
      to: customer.email,
      ...emailTemplates.repairUpdate({
        customerName: customer.name,
        trackingId: repair.trackingId,
        status: 'RECEIVED',
        statusMessage: getStatusMessage('RECEIVED'),
        deviceType: repair.deviceType,
        deviceModel: repair.deviceModel,
        estimatedCost: repair.estimatedCost,
        estimatedCompletion: repair.estimatedCompletion ? new Date(repair.estimatedCompletion) : null
      })
    })

    // Notify agents about new repair
    notificationService.notifyAgents('repair_created', {
      trackingId: repair.trackingId,
      customerName: customer.name,
      deviceType: repair.deviceType,
      deviceModel: repair.deviceModel,
      issueDescription: repair.issueDescription
    })

    return NextResponse.json({
      success: true,
      repair: {
        trackingId: repair.trackingId,
        status: repair.status,
        statusMessage: getStatusMessage(repair.status)
      }
    })
  } catch (error) {
    console.error('Error creating repair:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/repairs - Update repair status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      trackingId,
      status,
      estimatedCost,
      actualCost,
      estimatedCompletion,
      dateCompleted,
      notes
    } = body

    if (!trackingId || !status) {
      return NextResponse.json({ error: 'Tracking ID and status are required' }, { status: 400 })
    }

    // Find existing repair
    const existingRepair = await prisma.repair.findFirst({
      where: { trackingId },
      include: { customer: true }
    })

    if (!existingRepair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 })
    }

    // Update repair
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (estimatedCost !== undefined) updateData.estimatedCost = parseFloat(estimatedCost)
    if (actualCost !== undefined) updateData.actualCost = parseFloat(actualCost)
    if (estimatedCompletion) updateData.estimatedCompletion = new Date(estimatedCompletion)
    if (dateCompleted) updateData.dateCompleted = new Date(dateCompleted)
    if (notes !== undefined) updateData.notes = notes

    const updatedRepair = await prisma.repair.update({
      where: { id: existingRepair.id },
      data: updateData,
      include: { customer: true }
    })

    // Send status update email
    const customer = updatedRepair.customer
    await sendEmail({
      to: customer.email,
      ...emailTemplates.repairUpdate({
        customerName: customer.name,
        trackingId: updatedRepair.trackingId,
        status: updatedRepair.status,
        statusMessage: getStatusMessage(updatedRepair.status),
        deviceType: updatedRepair.deviceType,
        deviceModel: updatedRepair.deviceModel,
        estimatedCost: updatedRepair.estimatedCost,
        actualCost: updatedRepair.actualCost,
        estimatedCompletion: updatedRepair.estimatedCompletion ? new Date(updatedRepair.estimatedCompletion) : null,
        dateCompleted: updatedRepair.dateCompleted
      })
    })

    // Notify customer about status change
    notificationService.notifyCustomer(customer.email, 'repair_status_updated', {
      trackingId: updatedRepair.trackingId,
      status: updatedRepair.status,
      statusMessage: getStatusMessage(updatedRepair.status)
    })

    return NextResponse.json({
      success: true,
      repair: {
        trackingId: updatedRepair.trackingId,
        status: updatedRepair.status,
        statusMessage: getStatusMessage(updatedRepair.status)
      }
    })
  } catch (error) {
    console.error('Error updating repair:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
