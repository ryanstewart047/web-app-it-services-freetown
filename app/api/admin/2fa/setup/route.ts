import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/server/admin-session';
import { get2FAConfig, save2FAConfig, generateTOTPSetup } from '@/lib/server/admin-2fa';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return !!sessionToken && verifySessionToken(sessionToken);
}

// GET: Fetch 2FA status and Google Authenticator QR Code setup
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = get2FAConfig();
    const totpSetup = await generateTOTPSetup('BridgeTech IT Services Admin');

    return NextResponse.json({
      success: true,
      config: {
        enabled: config.enabled,
        mode: config.mode,
        recipientEmail: config.recipientEmail,
        hasTotpSecret: !!config.totpSecret
      },
      totp: {
        secret: totpSetup.secret,
        qrCodeUrl: totpSetup.qrCodeUrl,
        otpauthUrl: totpSetup.otpauthUrl,
        secretFromEnv: totpSetup.secretFromEnv
      }
    });
  } catch (error) {
    console.error('[2FA Setup GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch 2FA setup details' },
      { status: 500 }
    );
  }
}

// POST: Update 2FA settings
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, mode, recipientEmail, totpSecret } = body;

    const updated = save2FAConfig({
      ...(typeof enabled === 'boolean' ? { enabled } : {}),
      ...(mode && ['email', 'totp', 'both'].includes(mode) ? { mode } : {}),
      ...(recipientEmail && typeof recipientEmail === 'string' ? { recipientEmail } : {}),
      ...(totpSecret && typeof totpSecret === 'string' ? { totpSecret } : {})
    });

    return NextResponse.json({
      success: true,
      message: '2FA settings updated successfully!',
      config: {
        enabled: updated.enabled,
        mode: updated.mode,
        recipientEmail: updated.recipientEmail,
        hasTotpSecret: !!updated.totpSecret
      }
    });
  } catch (error) {
    console.error('[2FA Setup POST Error]:', error);
    return NextResponse.json(
      { error: 'Failed to update 2FA settings' },
      { status: 500 }
    );
  }
}
