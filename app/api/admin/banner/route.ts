import { NextRequest, NextResponse } from 'next/server';
import {
  getBannerSettings,
  updateBannerSettings,
  getSavedAnnouncements,
  saveAnnouncement,
} from '@/lib/server/banner-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [banner, savedAnnouncements] = await Promise.all([
      getBannerSettings(),
      getSavedAnnouncements(),
    ]);

    return NextResponse.json({
      ...banner,
      savedAnnouncements,
    });
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
      buttonText: data.buttonText,
      color: data.color,
    });

    if (data.message && data.message.trim()) {
      await saveAnnouncement({
        id: data.announcementId,
        title: data.title,
        message: data.message,
        link: data.link,
        buttonText: data.buttonText,
        color: data.color,
      });
    }

    const savedAnnouncements = await getSavedAnnouncements();

    return NextResponse.json({
      ...updated,
      savedAnnouncements,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update banner settings' },
      { status: 500 }
    );
  }
}
