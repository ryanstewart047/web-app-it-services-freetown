import { NextRequest, NextResponse } from 'next/server'
import { generateMarketingEmail } from '@/lib/server/email-ai-generator'

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateMarketingEmail(prompt)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[AI Email Gen] Error:', error)
    return NextResponse.json({ error: (error as Error).message || 'Failed to generate email content' }, { status: 500 })
  }
}
