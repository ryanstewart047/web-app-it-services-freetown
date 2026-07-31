import { NextRequest, NextResponse } from 'next/server';
import { resendEmailOTP } from '@/lib/server/admin-2fa';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pendingToken } = body;

    if (!pendingToken || typeof pendingToken !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing pending verification token.' },
        { status: 400 }
      );
    }

    const result = await resendEmailOTP(pendingToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to resend verification email.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      pendingToken: result.newPendingToken,
      message: 'New 6-digit verification code sent to your email.'
    });
  } catch (error) {
    console.error('[Admin 2FA Resend Error]:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email.' },
      { status: 500 }
    );
  }
}
