import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { generateAppointmentId, APPOINTMENT_STATUSES } from '@/lib/repair-tracking'
import { notificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerName,
      email,
      phone,
      deviceType,
      deviceModel,
      issueDescription,
      preferredDate,
      preferredTime,
      address,
      serviceType
    } = body

    // Validate required fields
    if (!customerName || !email || !phone || !deviceType || !deviceModel || !issueDescription || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date and time are not in the past
    const appointmentDateTime = new Date(`${preferredDate}T${preferredTime}`)
    const now = new Date()
    
    if (appointmentDateTime <= now) {
      return NextResponse.json(
        { error: 'Appointment date and time must be in the future' },
        { status: 400 }
      )
    }

    // Validate business hours (8 AM to 6 PM)
    const hour = appointmentDateTime.getHours()
    if (hour < 8 || hour >= 18) {
      return NextResponse.json(
        { error: 'Appointments are only available between 8:00 AM and 6:00 PM' },
        { status: 400 }
      )
    }

    // Validate weekdays only (Monday = 1, Friday = 5)
    const dayOfWeek = appointmentDateTime.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        { error: 'Appointments are only available Monday through Friday' },
        { status: 400 }
      )
    }

    // Generate unique appointment ID
    const appointmentId = generateAppointmentId()

    // Create or find customer
    let customer = await prisma.customer.findUnique({
      where: { email }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          email,
          phone,
          address
        }
      })
    } else {
      // Update customer info if needed
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: customerName,
          phone,
          address: address || customer.address
        }
      })
    }

    // Create appointment with generated ID
    const appointment = await prisma.appointment.create({
      data: {
        id: appointmentId,
        customerId: customer.id,
        deviceType,
        deviceModel,
        issueDescription,
        serviceType,
        preferredDate,
        preferredTime,
        status: APPOINTMENT_STATUSES.CONFIRMED
      }
    })

    // Send confirmation email
    const emailData = emailTemplates.appointmentConfirmation({
      customerName,
      appointmentId: appointment.id,
      deviceType,
      deviceModel,
      issueDescription,
      serviceType,
      preferredDate,
      preferredTime
    })

    const emailResult = await sendEmail({
      to: email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    })

    // Notify agents about new appointment
    await notificationService.notifyAgentsOfChatRequest({
      sessionId: appointment.id,
      customerName,
      customerEmail: email,
      deviceType,
      issueDescription,
      timestamp: new Date()
    })

    return NextResponse.json({
      success: true,
      trackingId: appointment.id,
      appointment: {
        id: appointment.id,
        status: appointment.status,
        customerName,
        deviceType,
        deviceModel,
        preferredDate,
        preferredTime
      }
    })

  } catch (error) {
    console.error('Appointment booking error:', error)
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const appointmentId = searchParams.get('id')

    if (appointmentId) {
      // Get specific appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          customer: true,
          repair: {
            include: {
              timeline: true,
              technician: true
            }
          }
        }
      })

      if (!appointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ appointment })
    }

    if (email) {
      // Get appointments by customer email
      const appointments = await prisma.appointment.findMany({
        where: {
          customer: { email }
        },
        include: {
          customer: true,
          repair: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ appointments })
    }

    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve appointments' },
      { status: 500 }
    )
  }
}
