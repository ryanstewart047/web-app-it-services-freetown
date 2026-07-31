import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verify2FACodeAsync } from '@/lib/server/admin-2fa';
import { registerSessionToken } from '@/lib/server/admin-session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pendingToken, method, code } = body;

    if (!pendingToken || typeof pendingToken !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing pending verification token.' },
        { status: 400 }
      );
    }

    if (!method || (method !== 'email' && method !== 'totp')) {
      return NextResponse.json(
        { error: 'Invalid verification method. Must be "email" or "totp".' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required.' },
        { status: 400 }
      );
    }

    // Verify code against 2FA engine
    const verification = await verify2FACodeAsync(pendingToken, method, code);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || 'Verification failed.' },
        { status: 401 }
      );
    }

    // 2FA code verified! Issue full admin session token & cookie
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    registerSessionToken(sessionToken, expiresAt.getTime());

    const response = NextResponse.json({
      success: true,
      message: '2FA Verification successful! Logged in.',
      expiresAt: expiresAt.toISOString()
    });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log(`[Admin 2FA] Successful 2FA login via ${method.toUpperCase()}`);

    return response;
  } catch (error) {
    console.error('[Admin 2FA Verification Error]:', error);
    return NextResponse.json(
      { error: '2FA verification failed due to server error.' },
      { status: 500 }
    );
  }
}
