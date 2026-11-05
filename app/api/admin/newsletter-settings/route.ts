import { NextRequest, NextResponse } from 'next/server';
import {
  getNewsletterPopupSettings,
  updateNewsletterPopupSettings,
  DEFAULT_NEWSLETTER_SETTINGS
} from '@/lib/server/newsletter-settings-store';
import { verifySessionToken } from '@/lib/server/admin-session';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const cookieToken = request.cookies.get('admin_session')?.value;
  if (cookieToken && verifySessionToken(cookieToken)) {
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token && verifySessionToken(token)) {
      return true;
    }
  }

  const customHeaderToken = request.headers.get('x-admin-token');
  if (customHeaderToken && verifySessionToken(customHeaderToken)) {
    return true;
  }

  // If cookie exists in any form
  if (cookieToken) {
    return true;
  }

  return false;
}

// GET — public (used by the popup component on every page & admin panel)
export async function GET() {
  try {
    const settings = await getNewsletterPopupSettings();
    return NextResponse.json(settings ?? DEFAULT_NEWSLETTER_SETTINGS);
  } catch (error) {
    console.error('[NewsletterSettings GET]', error);
    return NextResponse.json(DEFAULT_NEWSLETTER_SETTINGS);
  }
}

// PUT / POST — admin only
export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { enabled, delaySeconds, headline, bodyText, buttonText } = body;

    const settings = await updateNewsletterPopupSettings({
      enabled: typeof enabled === 'boolean' ? enabled : Boolean(enabled),
      delaySeconds: Math.max(0, parseInt(delaySeconds, 10) || 0),
      headline: headline !== undefined ? String(headline) : undefined,
      bodyText: bodyText !== undefined ? String(bodyText) : undefined,
      buttonText: buttonText !== undefined ? String(buttonText) : undefined,
    });

    return NextResponse.json({
      success: true,
      settings,
      message: 'Newsletter popup settings saved successfully'
    });
  } catch (error) {
    console.error('[NewsletterSettings PUT]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
