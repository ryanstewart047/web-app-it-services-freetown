import { NextRequest, NextResponse } from 'next/server';
import { getBannerSettings } from '@/lib/server/banner-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const banner = await getBannerSettings();
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch banner settings' },
      { status: 500 }
    );
  }
}
