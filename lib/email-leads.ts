import { prisma } from '@/lib/prisma'

interface EmailLeadInput {
  email: string
  name?: string
  phone?: string
  source: 'appointment' | 'order' | 'troubleshoot' | 'donation' | 'forum' | 'receipt' | 'newsletter'
}

/**
 * Silently capture a customer email lead from any form submission.
 * Duplicate emails from the same source are skipped gracefully.
 * Errors never propagate — the main form operation is never blocked.
 */
export async function captureEmailLead(input: EmailLeadInput): Promise<void> {
  try {
    if (!input.email || !input.email.includes('@')) return

    const normalizedEmail = input.email.toLowerCase().trim()

    // Check for an existing lead with the same email + source before creating
    const existing = await prisma.emailLead.findFirst({
      where: { email: normalizedEmail, source: input.source },
      select: { id: true },
    })

    if (existing) return // already captured — skip silently

    await prisma.emailLead.create({
      data: {
        email: normalizedEmail,
        name: input.name?.trim() || null,
        phone: input.phone?.trim() || null,
        source: input.source,
      },
    })
  } catch (error) {
    // Silently log — never throw
    console.warn('[EmailLead] Failed to capture lead:', error)
  }
}
