import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateEmail } from '@/lib/email-validation'

function checkAuth(request: NextRequest): boolean {
  // Reuse the same session cookie the main admin page sets
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

// POST /api/admin/email-leads         → Add a single or batch list of email leads
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const leadsToAdd = Array.isArray(body) ? body : [body]

    if (leadsToAdd.length === 0) {
      return NextResponse.json({ error: 'No email leads provided' }, { status: 400 })
    }

    let addedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    for (const lead of leadsToAdd) {
      const email = lead.email?.trim()
      const name = lead.name?.trim() || null
      const phone = lead.phone?.trim() || null
      const source = lead.source?.trim() || 'manual'

      if (!email) {
        skippedCount++
        continue
      }

      // Strict validation on the server side
      const validation = validateEmail(email)
      if (!validation.isValid) {
        skippedCount++
        errors.push(`Skipped "${email}": ${validation.error}`)
        continue
      }

      const normalizedEmail = email.toLowerCase()

      // Check if this email + source already exists to prevent duplicate entries
      const existing = await prisma.emailLead.findFirst({
        where: {
          email: normalizedEmail,
          source: source,
        }
      })

      if (existing) {
        // If it exists, update the name and phone if provided
        await prisma.emailLead.update({
          where: { id: existing.id },
          data: {
            name: name || existing.name,
            phone: phone || existing.phone,
            deliveryFailed: false, // Reset failure status on manually re-adding
          }
        })
        addedCount++
      } else {
        // Create new record
        await prisma.emailLead.create({
          data: {
            email: normalizedEmail,
            name,
            phone,
            source,
            deliveryFailed: false,
          }
        })
        addedCount++
      }
    }

    return NextResponse.json({
      success: true,
      added: addedCount,
      skipped: skippedCount,
      errors: errors.slice(0, 10),
    })
  } catch (error) {
    console.error('Failed to save email leads:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/email-leads          → JSON list
// GET /api/admin/email-leads?format=csv → CSV download
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')
  const source = searchParams.get('source') // optional filter
  const search = searchParams.get('search') // optional search

  const where: any = {}
  if (source && source !== 'all') where.source = source
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }

  const leads = await prisma.emailLead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  if (format === 'csv') {
    const header = 'Name,Email,Phone,Source,Date\n'
    const rows = leads.map((l) => {
      const date = new Date(l.createdAt).toLocaleDateString('en-GB')
      const name = (l.name || '').replace(/,/g, ' ')
      const email = l.email.replace(/,/g, ' ')
      const phone = (l.phone || '').replace(/,/g, ' ')
      return `"${name}","${email}","${phone}","${l.source}","${date}"`
    })
    const csv = header + rows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="email-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  // Return JSON with stats
  const stats = await prisma.emailLead.groupBy({
    by: ['source'],
    _count: { source: true },
  })

  return NextResponse.json({
    leads,
    total: leads.length,
    stats: stats.map((s) => ({ source: s.source, count: s._count.source })),
  })
}

// DELETE leads matching an email address OR delete all failed leads if failed=true
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const failed = searchParams.get('failed')

  if (failed === 'true') {
    const result = await prisma.emailLead.deleteMany({ where: { deliveryFailed: true } })
    return NextResponse.json({ success: true, deleted: result.count })
  }

  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email or failed=true required' }, { status: 400 })

  const normalizedEmail = email.toLowerCase().trim()
  const result = await prisma.emailLead.deleteMany({ where: { email: normalizedEmail } })
  return NextResponse.json({ success: true, deleted: result.count })
}
