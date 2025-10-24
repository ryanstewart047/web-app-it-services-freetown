// CRITICAL: Declare runtime FIRST before any imports
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    deploymentCheck: 'Oct 24 2025 - Build 2'
  })
}

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'Test POST endpoint working'
  })
}
