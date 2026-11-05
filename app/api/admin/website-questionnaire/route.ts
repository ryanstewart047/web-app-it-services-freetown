import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasAdminSession } from '@/lib/server/admin-session'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const page   = parseInt(searchParams.get('page') || '1', 10)
  const limit  = parseInt(searchParams.get('limit') || '20', 10)
  const skip   = (page - 1) * limit

  const where = status && status !== 'all' ? { status } : {}

  const [submissions, total] = await Promise.all([
    prisma.websiteQuestionnaire.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.websiteQuestionnaire.count({ where }),
  ])

  return NextResponse.json({ submissions, total, page, limit })
}

export async function PATCH(request: NextRequest) {
  if (!hasAdminSession(request)) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const body = await request.json()
  const data: Record<string, unknown> = {}

  if (body.status !== undefined)     data.status     = body.status
  if (body.adminNotes !== undefined) data.adminNotes = body.adminNotes

  const updated = await prisma.websiteQuestionnaire.update({
    where: { id },
    data,
  })

  return NextResponse.json({ success: true, submission: updated })
}

export async function DELETE(request: NextRequest) {
  if (!hasAdminSession(request)) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.websiteQuestionnaire.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
