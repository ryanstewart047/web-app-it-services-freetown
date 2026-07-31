import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { registerSessionToken, verifySessionToken, revokeSessionToken } from '@/lib/server/admin-session';
import { get2FAConfig, createPending2FASession } from '@/lib/server/admin-2fa';

export const dynamic = 'force-dynamic';

// Admin password hash - MUST be set in environment variables
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// Rate limiting store (in production, use Redis or database)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt) return false;
  
  // Reset after 15 minutes
  if (now > attempt.resetTime) {
    loginAttempts.delete(ip);
    return false;
  }
  
  // Max 5 attempts per 15 minutes
  return attempt.count >= 5;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000 // 15 minutes
    });
  } else {
    attempt.count++;
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    
    // Check rate limiting
    if (isRateLimited(clientIp)) {
      console.error('[Admin Auth] Rate limit exceeded for IP:', clientIp);
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { password } = body;
    
    // Validate input
    if (!password || typeof password !== 'string') {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Hash the provided password
    const hashedPassword = hashPassword(password);
    
    // Compare hashes (constant-time comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(hashedPassword),
      Buffer.from(ADMIN_PASSWORD_HASH)
    );
    
    if (!isValid) {
      recordFailedAttempt(clientIp);
      console.error('[Admin Auth] Invalid password attempt from IP:', clientIp);
      
      // Add delay to slow down brute force
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Clear failed attempts on success
    loginAttempts.delete(clientIp);

    // Check 2FA Configuration
    const twoFAConfig = get2FAConfig();

    if (twoFAConfig.enabled) {
      // 2FA is active: Create pending session & generate/send Email OTP
      const { pendingToken, emailSent, emailNote } = await createPending2FASession(clientIp);
      
      // Obfuscate recipient email for privacy (e.g. ad***@itservicesfreetown.com)
      const recipient = twoFAConfig.recipientEmail || 'admin@itservicesfreetown.com';
      const parts = recipient.split('@');
      const obfuscatedEmail = parts[0].length > 2 
        ? `${parts[0].slice(0, 2)}***@${parts[1]}` 
        : `${parts[0]}***@${parts[1]}`;

      return NextResponse.json({
        success: true,
        requires2FA: true,
        pendingToken,
        mode: twoFAConfig.mode, // 'email' | 'totp' | 'both'
        hasTotp: !!twoFAConfig.totpSecret,
        emailSent,
        emailNote,
        recipientEmail: obfuscatedEmail
      });
    }
    
    // If 2FA disabled, directly issue admin session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    registerSessionToken(sessionToken, expiresAt.getTime());
    
    const response = NextResponse.json({
      success: true,
      requires2FA: false,
      expiresAt: expiresAt.toISOString()
    });
    
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('[Admin Auth] Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Verify session endpoint
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    
    if (!sessionToken || !verifySessionToken(sessionToken)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('[Admin Auth] Verification error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const tokenToRevoke = request.cookies.get('admin_session')?.value;
    if (tokenToRevoke) {
      revokeSessionToken(tokenToRevoke);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('[Admin Auth] Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
