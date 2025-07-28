import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

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
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        deviceType,
        deviceModel,
        issueDescription,
        serviceType,
        preferredDate,
        preferredTime,
        status: 'confirmed'
      }
    })

    // Send confirmation email
    const emailData = emailTemplates.appointmentConfirmation({
      customerName,
      appointmentId: appointment.id,
      date: preferredDate,
      time: preferredTime,
      deviceType,
      deviceModel
    })

    await sendEmail({
      to: email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    })

    return NextResponse.json({
      success: true,
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
              notes: {
                where: { isPublic: true }
              },
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
