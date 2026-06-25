import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_TOPICS = [
  "5 Essential Tips to Keep Your Laptop from Overheating in Freetown's Heat",
  "How to Protect Your Smartphone Screen from Scratches and Accidental Drops",
  "Warning Signs Your Computer Hard Drive is About to Fail (And How to Save Your Data)",
  "Easy Ways to Boost Your Home Wi-Fi Signal Strength and Speed",
  "Why You Should Stop Leaving Your Phone Plugs and Laptop Chargers in the Outlet",
  "How to Clean Your Phone Charging Port Safely (Fix Charging Issues)",
  "How to Secure Your Social Media Accounts from Hackers (2-Factor Authentication)",
  "What to Do Immediately if You Spill Water or Tea on Your Laptop"
]

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let settings = await prisma.weeklyNewsletterSettings.findUnique({
      where: { id: 'active' }
    })

    if (!settings) {
      settings = await prisma.weeklyNewsletterSettings.create({
        data: {
          id: 'active',
          enabled: false,
          topics: DEFAULT_TOPICS
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('[Newsletter Settings GET Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { enabled, subjectPrefix, topics } = await request.json()

    if (topics && !Array.isArray(topics)) {
      return NextResponse.json({ error: 'Topics must be an array of strings' }, { status: 400 })
    }

    const settings = await prisma.weeklyNewsletterSettings.upsert({
      where: { id: 'active' },
      update: {
        enabled: enabled ?? false,
        subjectPrefix: subjectPrefix ?? "IT Services Freetown: ",
        topics: topics ?? DEFAULT_TOPICS
      },
      create: {
        id: 'active',
        enabled: enabled ?? false,
        subjectPrefix: subjectPrefix ?? "IT Services Freetown: ",
        topics: topics ?? DEFAULT_TOPICS
      }
    })

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('[Newsletter Settings POST Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
