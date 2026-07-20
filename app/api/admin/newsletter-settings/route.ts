import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

const DEFAULTS = {
  id: 'active',
  enabled: true,
  delaySeconds: 8,
  headline: 'Stay in the Loop',
  bodyText:
    'Join thousands of Freetown residents getting weekly computer and mobile repair tips, exclusive service updates, and special offers delivered right to your inbox.',
  buttonText: 'Subscribe Now',
}

// GET — public (used by the popup component on every page)
export async function GET() {
  try {
    const settings = await prisma.newsletterSettings.findUnique({
      where: { id: 'active' },
    })
    return NextResponse.json(settings ?? DEFAULTS)
  } catch (error) {
    console.error('[NewsletterSettings GET]', error)
    return NextResponse.json(DEFAULTS)
  }
}

// PUT — admin only
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { enabled, delaySeconds, headline, bodyText, buttonText } = body

    const settings = await prisma.newsletterSettings.upsert({
      where: { id: 'active' },
      update: {
        enabled: Boolean(enabled),
        delaySeconds: Math.max(0, parseInt(delaySeconds) || 8),
        headline: String(headline || DEFAULTS.headline).slice(0, 100),
        bodyText: String(bodyText || DEFAULTS.bodyText).slice(0, 500),
        buttonText: String(buttonText || DEFAULTS.buttonText).slice(0, 60),
      },
      create: {
        ...DEFAULTS,
        enabled: Boolean(enabled),
        delaySeconds: Math.max(0, parseInt(delaySeconds) || 8),
        headline: String(headline || DEFAULTS.headline).slice(0, 100),
        bodyText: String(bodyText || DEFAULTS.bodyText).slice(0, 500),
        buttonText: String(buttonText || DEFAULTS.buttonText).slice(0, 60),
      },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('[NewsletterSettings PUT]', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
