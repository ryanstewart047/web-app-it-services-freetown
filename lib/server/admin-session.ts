import crypto from 'crypto';
import { NextRequest } from 'next/server';

export function hasAdminSession(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return !!sessionToken && /^[a-f0-9]{64}$/.test(sessionToken);
}

function safeCompare(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}

export function hasCronSecret(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const queryToken = request.nextUrl.searchParams.get('secret') || '';

  return safeCompare(bearerToken, secret) || safeCompare(queryToken, secret);
}

export function hasVercelCronUserAgent(request: NextRequest): boolean {
  return request.headers.get('user-agent') === 'vercel-cron/1.0';
}

export function canRunProtectedAutomation(request: NextRequest): boolean {
  return hasAdminSession(request) || hasCronSecret(request) || hasVercelCronUserAgent(request);
}
