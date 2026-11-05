import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'
import { validateEmail } from '@/lib/email-validation'

// POST /api/newsletter/subscribe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    // Validate email strictly (blocks disposable domains and dot stuffing)
    const validation = validateEmail(email)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

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
