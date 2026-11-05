import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return generateDemoKey();
}

export async function GET(request: NextRequest) {
  return generateDemoKey();
}

function generateDemoKey() {
  const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomSegment2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const demoKey = `BTFL-PRO-DEMO-${randomSegment}-${randomSegment2}`;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours validity

  return NextResponse.json({
    success: true,
    licenseKey: demoKey,
    plan: 'ForensicLens Pro (24-Hour Full Access Demo)',
    status: 'active',
    tier: 'pro',
    expiresAt,
    features: [
      'unlimited_scans',
      'ai_deepfake_detector',
      'high_res_ela',
      'gps_streetview',
      'pdf_dossier_export',
      'color_channels',
      'cryptographic_sha256'
    ],
    message: 'Demo license key successfully generated. Valid for 24 hours with all Pro features unlocked.'
  });
}
