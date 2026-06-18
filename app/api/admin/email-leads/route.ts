import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(request: NextRequest): boolean {
  // Reuse the same session cookie the main admin page sets
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
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
