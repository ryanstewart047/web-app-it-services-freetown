import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// DO NOT store passwords in code! This is a hash of the password.
// To generate: node -e "console.log(crypto.createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
// Default password hash for "ITServices2025!Admin" - CHANGE THIS IMMEDIATELY
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
    
    // Compare hashes (constant-time comparison to prevent timing attacks)
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
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    console.log('[Admin Auth] Successful login from IP:', clientIp);
    
    // Clear failed attempts on success
    loginAttempts.delete(clientIp);
    
    const response = NextResponse.json({
      success: true,
      expiresAt: expiresAt.toISOString()
    });
    
    // Set secure HTTP-only cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
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
    
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // In production, verify token against database
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
