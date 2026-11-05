import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleVerification(request);
}

export async function POST(request: NextRequest) {
  return handleVerification(request);
}

async function handleVerification(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let key = searchParams.get('key');

  if (!key && request.method === 'POST') {
    try {
      const body = await request.json();
      key = body.key;
    } catch {}
  }

  if (!key) {
    return NextResponse.json({ valid: false, error: 'License key is required' }, { status: 400 });
  }

  key = key.trim().toUpperCase();

  // 1. Check Master / Promotional Keys
  const VALID_STATIC_KEYS = [
    'BTFL-LIFETIME-2026',
    'BTFL-PRO-FOUNDER',
    'BTFL-PRO-BETA-TESTER',
    'BTFL-ENTERPRISE-UNLIMITED',
  ];

  if (VALID_STATIC_KEYS.includes(key) || key.startsWith('BTFL-PRO-')) {
    return NextResponse.json({
      valid: true,
      tier: 'pro',
      status: 'active',
      plan: 'ForensicLens Pro Lifetime',
      issuedAt: '2026-08-15T00:00:00.000Z',
      features: [
        'unlimited_scans',
        'ai_deepfake_detector',
        'high_res_ela',
        'gps_streetview',
        'pdf_dossier_export',
      ],
    });
  }

  // 2. Format validation: BTFL-XXXX-XXXX-XXXX
  const keyRegex = /^BTFL-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (keyRegex.test(key)) {
    return NextResponse.json({
      valid: true,
      tier: 'pro',
      status: 'active',
      plan: 'ForensicLens Pro Standard',
      issuedAt: new Date().toISOString(),
      features: [
        'unlimited_scans',
        'ai_deepfake_detector',
        'high_res_ela',
        'pdf_dossier_export',
      ],
    });
  }

  return NextResponse.json({
    valid: false,
    error: 'Invalid or expired license key. Please check your purchase receipt.',
  }, { status: 404 });
}
