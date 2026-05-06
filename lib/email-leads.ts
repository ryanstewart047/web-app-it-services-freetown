import { prisma } from '@/lib/prisma'

interface EmailLeadInput {
  email: string
  name?: string
  phone?: string
  source: 'appointment' | 'order' | 'troubleshoot' | 'donation' | 'forum' | 'receipt'
}

/**
 * Silently capture a customer email lead from any form submission.
 * Duplicate emails from the same source are skipped gracefully.
 * Errors never propagate — the main form operation is never blocked.
 */
export async function captureEmailLead(input: EmailLeadInput): Promise<void> {
  try {
    if (!input.email || !input.email.includes('@')) return

    await prisma.emailLead.create({
      data: {
        email: input.email.toLowerCase().trim(),
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
