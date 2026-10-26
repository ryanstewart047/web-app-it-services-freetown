import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateNewsletterIssue } from '@/lib/server/email-ai-generator'

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
  const authHeader = request.headers.get('authorization') || request.headers.get('x-admin-token')
  return Boolean(sessionToken || authHeader)
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const requestedTopic = typeof body?.topic === 'string' ? body.topic.trim() : ''

    // 1. Fetch settings to get configured topics and subject prefix
    const settings = await prisma.weeklyNewsletterSettings.findUnique({
      where: { id: 'active' }
    })

    const topics = Array.isArray(settings?.topics) && settings.topics.length > 0
      ? (settings.topics as string[])
      : DEFAULT_TOPICS

    // 2. Determine selected topic
    let selectedTopic = requestedTopic

    if (!selectedTopic) {
      // Find recently sent topics to select the next rotating topic
      const recentLogs = await prisma.weeklyNewsletterLog.findMany({
        where: { status: 'success' },
        orderBy: { createdAt: 'desc' },
        take: Math.max(1, topics.length - 1)
      })

      const recentlySentTopics = recentLogs.map(log => log.topic)
      let availableTopics = topics.filter(t => !recentlySentTopics.includes(t))
      if (availableTopics.length === 0) {
        availableTopics = topics
      }
      selectedTopic = availableTopics[0] || DEFAULT_TOPICS[0]
    }

    console.log(`[Newsletter AI Generator] Drafting content for topic: "${selectedTopic}"`)

    // 3. Generate content with AI
    const { subject, content } = await generateNewsletterIssue(selectedTopic)

    const prefix = settings?.subjectPrefix ? `${settings.subjectPrefix} ` : ''
    const fullSubject = subject.startsWith(prefix) ? subject : `${prefix}${subject}`

    return NextResponse.json({
      success: true,
      topic: selectedTopic,
      subject: fullSubject,
      content: content,
      topics: topics
    })
  } catch (error: any) {
    console.error('[Newsletter AI Generator] Error generating draft:', error)
    return NextResponse.json({
      error: error.message || 'Failed to generate newsletter draft with AI'
    }, { status: 500 })
  }
}
