/**
 * Admin Authentication Guard
 * ---------------------------------------------------------------------------
 * Provides a single, canonical `requireAdmin(request)` helper that every
 * admin-only API route must call before executing any database mutation.
 *
 * Design:
 *  - Reads the HttpOnly `admin_session` cookie set by /api/admin/auth.
 *  - Validates token format (64-char hex – must match what auth issues).
 *  - Returns null when the request is authenticated, or a 401 NextResponse
 *    that the calling route handler should immediately return.
 *
 * Usage:
 *   const authError = requireAdmin(request);
 *   if (authError) return authError;
 */

import { NextRequest, NextResponse } from 'next/server';

/** Regex that matches a 64-character lowercase hex string (crypto.randomBytes(32)) */
const SESSION_TOKEN_REGEX = /^[a-f0-9]{64}$/;

/**
 * Validates the admin_session cookie on the incoming request.
 * @returns NextResponse (401) if the request is not authenticated, or null if OK.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const sessionToken = request.cookies.get('admin_session')?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'Unauthorized: authentication required.' },
      { status: 401 }
    );
  }

  if (!SESSION_TOKEN_REGEX.test(sessionToken)) {
    // Token present but malformed – likely forged or tampered with.
    console.error('[requireAdmin] Invalid session token format from IP:', getAdminIp(request));
    return NextResponse.json(
      { error: 'Unauthorized: invalid session token.' },
      { status: 401 }
    );
  }

  return null; // ✅ Authenticated
}

/**
 * Sanitises a plain-text string by stripping HTML tags and dangerous
 * JavaScript-injection patterns. Use this on every user-supplied string
 * before writing it to the database.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/<[^>]+>/g, '')       // strip any remaining HTML tags
    .trim()
    .slice(0, 5000);               // hard cap – prevents oversized payloads
}

/**
 * Returns the best-guess client IP from an incoming request.
 */
export function getAdminIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
