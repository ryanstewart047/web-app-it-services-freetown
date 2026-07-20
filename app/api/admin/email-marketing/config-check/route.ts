import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const isConfigured = !!process.env.SMTP_USER && 
                      process.env.SMTP_USER !== 'your-email@gmail.com' &&
                      !!process.env.SMTP_PASS

  return NextResponse.json({ 
    configured: isConfigured,
    provider: process.env.SMTP_HOST || 'Not set'
  })
}
