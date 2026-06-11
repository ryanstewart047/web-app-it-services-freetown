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

    // Check for an existing lead with the same email before creating
    const existing = await prisma.emailLead.findFirst({
      where: { email: normalizedEmail },
    })

    if (existing) {
      // Update fields if they are not already set in the database
      const updateData: any = {}
      if (!existing.name && input.name?.trim()) {
        updateData.name = input.name.trim()
      }
      if (!existing.phone && input.phone?.trim()) {
        updateData.phone = input.phone.trim()
      }
      // If the existing source is not 'newsletter' but the new source is 'newsletter',
      // update the source to 'newsletter' to subscribe them.
      if (existing.source !== 'newsletter' && input.source === 'newsletter') {
        updateData.source = 'newsletter'
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.emailLead.update({
          where: { id: existing.id },
          data: updateData,
        })
      }
      return // already captured — skip silently or update
    }

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
