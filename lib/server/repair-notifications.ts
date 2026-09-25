import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

export interface AutoEmailParams {
  existingRepair: {
    id: string
    trackingId: string
    status: string
    deviceType: string
    deviceModel?: string | null
    actualCost?: number | null
    estimatedCost?: number | null
    diagnosticNotes?: string | null
    diagnosticImages?: any
    timeline?: Array<{ step: string; status: string }>
    customer?: {
      name: string
      email: string
      phone?: string
    } | null
  }
  newStatus?: string
  newNotes?: string
  newTotalCost?: number | null
}

/**
 * Evaluates whether an auto-email should be sent for a repair status update,
 * sends it asynchronously without blocking, and records a timeline step.
 */
export async function handleRepairStatusAutoEmail({
  existingRepair,
  newStatus,
  newNotes,
  newTotalCost
}: AutoEmailParams): Promise<{ sent: boolean; reason?: string }> {
  try {
    if (!newStatus || existingRepair.status === newStatus) {
      return { sent: false, reason: 'Status unchanged' }
    }

    // Log progress in RepairTimeline table
    try {
      await prisma.repairTimeline.create({
        data: {
          repairId: existingRepair.id,
          step: newStatus,
          status: newStatus,
          timestamp: new Date(),
          description: newNotes || `Status updated from ${existingRepair.status} to ${newStatus}`
        }
      })
    } catch (timelineErr) {
      console.warn('[RepairNotifications] Failed to write repair timeline entry:', timelineErr)
    }

    const email = existingRepair.customer?.email?.trim()
    const customerName = existingRepair.customer?.name || 'Valued Customer'
    const deviceType = existingRepair.deviceType || 'Device'
    const deviceModel = existingRepair.deviceModel || undefined
    const totalCost = typeof newTotalCost === 'number'
      ? newTotalCost
      : (existingRepair.actualCost ?? existingRepair.estimatedCost ?? 0)

    // Check if email is valid and not a placeholder
    if (!email || !email.includes('@') || email.endsWith('@placeholder.com')) {
      return { sent: false, reason: 'No valid customer email' }
    }

    // 1. COMPLETED: Auto email notification
    if (newStatus === 'completed') {
      const template = emailTemplates.repairCompleted({
        customerName,
        repairId: existingRepair.trackingId,
        deviceType,
        deviceModel,
        totalCost,
        notes: newNotes || undefined
      })

      const res = await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      return { sent: res.success, reason: res.success ? 'Completed email sent' : res.error }
    }

    // 2. CANCELLED: ONLY when device dropoff is confirmed AND repair reached diagnosed state
    if (newStatus === 'cancelled') {
      const reachedDiagnosed =
        existingRepair.status === 'diagnosed' ||
        existingRepair.status === 'in-progress' ||
        existingRepair.status === 'ready-for-pickup' ||
        existingRepair.status === 'completed' ||
        Boolean(existingRepair.diagnosticNotes) ||
        (Array.isArray(existingRepair.diagnosticImages) && existingRepair.diagnosticImages.length > 0) ||
        existingRepair.timeline?.some(t => t.step === 'diagnosed' || t.status === 'diagnosed')

      if (!reachedDiagnosed) {
        console.log(`[RepairNotifications] Skipping cancellation email for ${existingRepair.trackingId}: device was not diagnosed before cancellation.`)
        return { sent: false, reason: 'Cancelled before diagnosed stage - email skipped' }
      }

      const template = emailTemplates.repairCancelled({
        customerName,
        repairId: existingRepair.trackingId,
        deviceType,
        deviceModel,
        cancellationReason: newNotes || 'Cancelled by admin / technician.'
      })

      const res = await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      return { sent: res.success, reason: res.success ? 'Cancelled email sent' : res.error }
    }

    // 3. TERMINAL or READY-FOR-PICKUP: Reminder to immediately collect device with legal disclaimer
    if (newStatus === 'terminal' || newStatus === 'ready-for-pickup') {
      const template = emailTemplates.repairCollectionReminder({
        customerName,
        repairId: existingRepair.trackingId,
        deviceType,
        deviceModel,
        status: newStatus,
        customMessage: newNotes || undefined
      })

      const res = await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      return { sent: res.success, reason: res.success ? 'Collection reminder sent' : res.error }
    }

    return { sent: false, reason: 'No auto-email rule matched status' }
  } catch (err: any) {
    console.error('[RepairNotifications] Auto-email error:', err)
    return { sent: false, reason: err.message || 'Unknown error' }
  }
}

export interface ManualEmailPayload {
  trackingIds: string[]
  templateType: 'completed' | 'cancelled' | 'collection_reminder' | 'custom' | 'no_show_followup'
  customSubject?: string
  customMessage?: string
}

export interface SendResultDetail {
  trackingId: string
  email: string
  customerName: string
  success: boolean
  error?: string
}

/**
 * Manually sends individual or bulk emails to customers based on selected template.
 */
export async function sendManualRepairEmails({
  trackingIds,
  templateType,
  customSubject,
  customMessage
}: ManualEmailPayload): Promise<{
  total: number
  sentCount: number
  failedCount: number
  results: SendResultDetail[]
}> {
  if (!trackingIds || trackingIds.length === 0) {
    return { total: 0, sentCount: 0, failedCount: 0, results: [] }
  }

  const repairs = await prisma.repair.findMany({
    where: {
      trackingId: { in: trackingIds }
    },
    include: {
      customer: true,
      timeline: true,
      appointment: true
    }
  })

  const results: SendResultDetail[] = []
  let sentCount = 0
  let failedCount = 0

  for (const repair of repairs) {
    const email = repair.customer?.email?.trim()
    const customerName = repair.customer?.name || 'Customer'
    const deviceType = repair.deviceType || 'Device'
    const deviceModel = repair.deviceModel || undefined
    const totalCost = repair.actualCost ?? repair.estimatedCost ?? 0

    if (!email || !email.includes('@') || email.endsWith('@placeholder.com')) {
      results.push({
        trackingId: repair.trackingId,
        email: email || 'None',
        customerName,
        success: false,
        error: 'No valid customer email address'
      })
      failedCount++
      continue
    }

    try {
      let emailContent: { subject: string; html: string; text?: string }

      switch (templateType) {
        case 'completed':
          emailContent = emailTemplates.repairCompleted({
            customerName,
            repairId: repair.trackingId,
            deviceType,
            deviceModel,
            totalCost,
            notes: customMessage || repair.notes || undefined
          })
          break

        case 'cancelled':
          emailContent = emailTemplates.repairCancelled({
            customerName,
            repairId: repair.trackingId,
            deviceType,
            deviceModel,
            cancellationReason: customMessage || repair.notes || 'Repair cancelled.'
          })
          break

        case 'collection_reminder':
          const daysSinceUpdate = repair.updatedAt
            ? Math.floor((Date.now() - new Date(repair.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
            : undefined
          emailContent = emailTemplates.repairCollectionReminder({
            customerName,
            repairId: repair.trackingId,
            deviceType,
            deviceModel,
            status: repair.status,
            daysSinceUpdate,
            customMessage: customMessage || undefined
          })
          break

        case 'no_show_followup': {
          const rawDate = repair.appointment?.preferredDate || (repair as any).preferredDate
          let formattedDate: string | undefined
          if (rawDate) {
            const parsed = new Date(rawDate)
            formattedDate = isNaN(parsed.getTime()) ? rawDate : parsed.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          }
          emailContent = emailTemplates.noShowFollowUp({
            customerName,
            repairId: repair.trackingId,
            deviceType,
            deviceModel,
            appointmentDate: formattedDate,
            customMessage: customMessage || undefined
          })
          break
        }

        case 'custom':
        default:
          emailContent = emailTemplates.repairCustomNotification({
            customerName,
            repairId: repair.trackingId,
            deviceType,
            deviceModel,
            status: repair.status,
            subject: customSubject || `Update on your repair – ${repair.trackingId}`,
            message: customMessage || 'Please check the status of your repair online or contact us.'
          })
          break
      }

      const sendRes = await sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      })

      if (sendRes.success) {
        sentCount++
        results.push({
          trackingId: repair.trackingId,
          email,
          customerName,
          success: true
        })

        // Add note in repair timeline
        try {
          await prisma.repairTimeline.create({
            data: {
              repairId: repair.id,
              step: 'email_sent',
              status: repair.status,
              timestamp: new Date(),
              description: `Admin email sent (${templateType}) to ${email}`
            }
          })
        } catch (_) {}
      } else {
        failedCount++
        results.push({
          trackingId: repair.trackingId,
          email,
          customerName,
          success: false,
          error: sendRes.error || (sendRes.notConfigured ? 'Email service not configured' : 'Failed to send email')
        })
      }
    } catch (err: any) {
      failedCount++
      results.push({
        trackingId: repair.trackingId,
        email,
        customerName,
        success: false,
        error: err.message || 'Error occurred while sending'
      })
    }
  }

  return {
    total: repairs.length,
    sentCount,
    failedCount,
    results
  }
}
