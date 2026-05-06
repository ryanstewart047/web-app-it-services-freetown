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

// DELETE a single lead
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.emailLead.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
