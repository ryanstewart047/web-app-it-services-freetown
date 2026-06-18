import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

// POST /api/newsletter/subscribe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    // Basic validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Check for existing lead with this email across all sources
    const existing = await prisma.emailLead.findFirst({
      where: {
        email: normalizedEmail,
      },
    })

    if (existing) {
      if (existing.source === 'newsletter' && !existing.deliveryFailed) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter.' },
          { status: 409 } // 409 Conflict
        )
      }

      // If it exists but with another source (or if it previously failed), update it to newsletter and reset deliveryFailed
      await prisma.emailLead.update({
        where: { id: existing.id },
        data: {
          source: 'newsletter',
          name: name?.trim() || existing.name,
          deliveryFailed: false,
        },
      })
    } else {
      // Create the new newsletter subscription
      await prisma.emailLead.create({
        data: {
          email: normalizedEmail,
          name: name?.trim() || null,
          source: 'newsletter',
        },
      })
    }

    // Send confirmation email to subscriber
    try {
      const emailTemplate = emailTemplates.newsletterConfirmation({ email: normalizedEmail });
      await sendEmail({
        to: normalizedEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
      console.log(`✅ Newsletter confirmation email sent to: ${normalizedEmail}`);
    } catch (error) {
      console.error('❌ Failed to send newsletter confirmation email:', error);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({ success: true, message: 'Successfully subscribed to our newsletter!' })
  } catch (error) {
    console.error('[Newsletter Subscribe] Error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
