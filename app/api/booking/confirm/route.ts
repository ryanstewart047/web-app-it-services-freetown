import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      trackingId,
      customerName,
      email,
      phone,
      address,
      deviceType,
      deviceModel,
      serviceType,
      issueDescription,
      preferredDate,
      preferredTime,
    } = body

    // Validate required fields
    if (!trackingId || !customerName || !email || !deviceType || !serviceType || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      )
    }

    const results = {
      customerEmail: { success: false, error: '' },
      adminEmail: { success: false, error: '' },
    }

    // 1. Send customer confirmation email
    try {
      const customerTemplate = emailTemplates.appointmentConfirmation({
        customerName,
        appointmentId: trackingId,
        deviceType,
        deviceModel: deviceModel || 'Not specified',
        issueDescription: issueDescription || 'Not specified',
        serviceType,
        preferredDate,
        preferredTime,
      })

      const customerResult = await sendEmail({
        to: email,
        subject: customerTemplate.subject,
        html: customerTemplate.html,
        text: customerTemplate.text,
      })

      results.customerEmail = { success: customerResult.success, error: customerResult.error || '' }
    } catch (err) {
      console.error('Failed to send customer confirmation:', err)
      results.customerEmail = { success: false, error: (err as Error).message }
    }

    // 2. Send admin notification email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER
    if (adminEmail) {
      try {
        const adminTemplate = emailTemplates.adminBookingNotification({
          trackingId,
          customerName,
          email,
          phone: phone || 'Not provided',
          address: address || 'Not provided',
          deviceType,
          deviceModel: deviceModel || 'Not specified',
          serviceType,
          issueDescription: issueDescription || 'Not specified',
          preferredDate,
          preferredTime,
          submittedAt: new Date().toISOString(),
        })

        const adminResult = await sendEmail({
          to: adminEmail,
          subject: adminTemplate.subject,
          html: adminTemplate.html,
          text: adminTemplate.text,
        })

        results.adminEmail = { success: adminResult.success, error: adminResult.error || '' }
      } catch (err) {
        console.error('Failed to send admin notification:', err)
        results.adminEmail = { success: false, error: (err as Error).message }
      }
    } else {
      results.adminEmail = { success: false, error: 'No admin email configured (set ADMIN_EMAIL or SMTP_USER)' }
    }

    return NextResponse.json({
      success: true,
      trackingId,
      emails: results,
    })
  } catch (error) {
    console.error('Booking confirmation API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
