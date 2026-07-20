import { NextRequest, NextResponse } from 'next/server';
import { getBannerSettings, updateBannerSettings } from '@/lib/server/banner-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const banner = await getBannerSettings();
    return NextResponse.json(banner);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch banner settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const updated = await updateBannerSettings({
      enabled: data.enabled,
      message: data.message,
      link: data.link,
      color: data.color
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update banner settings' },
      { status: 500 }
    );
  }
}
