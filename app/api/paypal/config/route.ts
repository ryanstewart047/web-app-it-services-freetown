import { NextResponse } from 'next/server';
import { getPublicPayPalClientId } from '@/lib/paypal';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = getPublicPayPalClientId();
  const mode = process.env.PAYPAL_MODE || 'live';

  return NextResponse.json({
    configured: Boolean(clientId),
    clientId: clientId || null,
    mode,
    currency: 'USD',
  });
}
