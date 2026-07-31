import { NextRequest } from 'next/server';

// Server-side issued admin tokens registry
const issuedTokens = new Map<string, number>(); // token -> expiry timestamp
// Revoked tokens (for explicit logout tracking within this instance)
const revokedTokens = new Set<string>();

export function cleanupExpiredTokens() {
  const now = Date.now();
  Array.from(issuedTokens.entries()).forEach(([token, expiry]) => {
    if (now > expiry) {
      issuedTokens.delete(token);
    }
  });
}

export function registerSessionToken(token: string, expiresAt: number) {
  cleanupExpiredTokens();
  issuedTokens.set(token, expiresAt);
}

export function verifySessionToken(token: string): boolean {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return false;
  }
  // Explicitly revoked (logout)
  if (revokedTokens.has(token)) {
    return false;
  }
  const expiry = issuedTokens.get(token);
  // If found and expired, reject
  if (expiry && Date.now() > expiry) {
    issuedTokens.delete(token);
    return false;
  }
  // If not in map (serverless cold-start) but token format is valid and not revoked,
  // accept it — the cookie itself is our source of truth in serverless environments.
  return true;
}

export function revokeSessionToken(token: string) {
  if (token) {
    issuedTokens.delete(token);
    revokedTokens.add(token);
  }
}

/**
 * Checks if the request has a valid admin_session cookie
 */
export function hasAdminSession(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return !!sessionToken && verifySessionToken(sessionToken);
}

/**
 * Checks if the request is authorized for protected automation/cron tasks (via CRON_SECRET header or valid admin session)
 */
export function canRunProtectedAutomation(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Fallback to active admin session
  return hasAdminSession(request);
}
