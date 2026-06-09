import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Check for existing newsletter subscription
    const existing = await prisma.emailLead.findFirst({
      where: {
        email: normalizedEmail,
        source: 'newsletter',
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already subscribed to our newsletter.' },
        { status: 409 } // 409 Conflict
      )
    }

    // Create the new newsletter subscription
    await prisma.emailLead.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        source: 'newsletter',
      },
    })

    return NextResponse.json({ success: true, message: 'Successfully subscribed to our newsletter!' })
  } catch (error) {
    console.error('[Newsletter Subscribe] Error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
