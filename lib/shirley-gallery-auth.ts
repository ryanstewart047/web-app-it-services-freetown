import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const SESSION_TOKEN_REGEX = /^[a-f0-9]{64}$/
const DEFAULT_ADMIN_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'
export const SHIRLEY_ADMIN_PASSWORD_HASH =
  process.env.SHIRLEY_ADMIN_PASSWORD_HASH ||
  process.env.ADMIN_PASSWORD_HASH ||
  DEFAULT_ADMIN_HASH

export function hashShirleyAdminPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function createShirleyAdminSessionToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function isValidShirleyAdminSession(request: NextRequest) {
  const shirleySession = request.cookies.get('shirley_admin_session')?.value
  const mainAdminSession = request.cookies.get('admin_session')?.value

  return Boolean(
    (shirleySession && SESSION_TOKEN_REGEX.test(shirleySession)) ||
    (mainAdminSession && SESSION_TOKEN_REGEX.test(mainAdminSession))
  )
}

export function requireShirleyGalleryAdmin(request: NextRequest): NextResponse | null {
  if (isValidShirleyAdminSession(request)) {
    return null
  }

  return NextResponse.json(
    { error: 'Unauthorized: Shirley gallery admin login required.' },
    { status: 401 }
  )
}
