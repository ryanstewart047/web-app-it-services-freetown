import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const logs = await prisma.weeklyNewsletterLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 runs
    })

    return NextResponse.json({ logs })
  } catch (error: any) {
    console.error('[Newsletter Logs GET Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { count } = await prisma.weeklyNewsletterLog.deleteMany()
    return NextResponse.json({ success: true, deleted: count })
  } catch (error: any) {
    console.error('[Newsletter Logs DELETE Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
