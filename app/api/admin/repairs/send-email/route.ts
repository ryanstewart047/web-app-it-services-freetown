import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { sendManualRepairEmails, ManualEmailPayload } from '@/lib/server/repair-notifications'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request)
  if (authError) return authError

  try {
    const body: ManualEmailPayload = await request.json()
    const { trackingIds, templateType, customSubject, customMessage } = body

    if (!trackingIds || !Array.isArray(trackingIds) || trackingIds.length === 0) {
      return NextResponse.json(
        { error: 'trackingIds must be a non-empty array of tracking IDs' },
        { status: 400 }
      )
    }

    if (!templateType || !['completed', 'cancelled', 'collection_reminder', 'custom', 'no_show_followup'].includes(templateType)) {
      return NextResponse.json(
        { error: 'Invalid templateType. Must be one of: completed, cancelled, collection_reminder, custom, no_show_followup' },
        { status: 400 }
      )
    }

    const result = await sendManualRepairEmails({
      trackingIds,
      templateType,
      customSubject,
      customMessage
    })

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('[AdminRepairsSendEmail API] POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send repair emails' },
      { status: 500 }
    )
  }
}
