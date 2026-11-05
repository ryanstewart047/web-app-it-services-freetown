import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  createShirleyAdminSessionToken,
  hashShirleyAdminPassword,
  isValidShirleyAdminSession,
  SHIRLEY_ADMIN_PASSWORD_HASH,
} from '@/lib/shirley-gallery-auth'

export const dynamic = 'force-dynamic'

const loginAttempts = new Map<string, { count: number; resetTime: number }>()

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (!attempt) return false

  if (now > attempt.resetTime) {
    loginAttempts.delete(ip)
    return false
  }

  return attempt.count >= 5
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000,
    })
    return
  }

  attempt.count += 1
}

export async function GET(request: NextRequest) {
  if (!isValidShirleyAdminSession(request)) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      recordFailedAttempt(clientIp)
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    const hashedPassword = Buffer.from(hashShirleyAdminPassword(password))
    const storedPasswordHash = Buffer.from(SHIRLEY_ADMIN_PASSWORD_HASH)
    const isValid =
      hashedPassword.length === storedPasswordHash.length &&
      crypto.timingSafeEqual(hashedPassword, storedPasswordHash)

    if (!isValid) {
      recordFailedAttempt(clientIp)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    loginAttempts.delete(clientIp)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const response = NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() })

    response.cookies.set('shirley_admin_session', createShirleyAdminSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Shirley Admin Auth] Error:', error)
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })

  response.cookies.set('shirley_admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })

  return response
}
