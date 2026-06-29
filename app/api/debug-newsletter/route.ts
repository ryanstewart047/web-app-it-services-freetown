import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.weeklyNewsletterSettings.findUnique({
      where: { id: 'active' }
    })
    const logs = await prisma.weeklyNewsletterLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    const subscribers = await prisma.emailLead.findMany({
      where: { source: 'newsletter' }
    })
    return NextResponse.json({ settings, logs, subscribers })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
