import { NextRequest, NextResponse } from 'next/server';
import {
  getSavedAnnouncements,
  saveAnnouncement,
  updateSavedAnnouncement,
  deleteSavedAnnouncement,
  updateBannerSettings,
} from '@/lib/server/banner-store';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return Boolean(sessionToken);
}

// GET /api/admin/banner/announcements - Fetch all saved announcements
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const announcements = await getSavedAnnouncements();
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('[Announcements API] Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved announcements' },
      { status: 500 }
    );
  }
}

// POST /api/admin/banner/announcements - Create new, update, or publish an announcement
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 1. Action: Direct Publish to Live Banner
    if (body.action === 'publish') {
      if (!body.message) {
        return NextResponse.json(
          { error: 'Announcement message is required to publish.' },
          { status: 400 }
        );
      }

      const updatedBanner = await updateBannerSettings({
        enabled: true,
        message: body.message,
        link: body.link,
        buttonText: body.buttonText,
        color: body.color || 'bg-red-600',
      });

      // Also ensure it's saved/updated in the announcements library
      await saveAnnouncement({
        id: body.id,
        title: body.title,
        message: body.message,
        link: body.link,
        buttonText: body.buttonText,
        color: body.color,
      });

      const announcements = await getSavedAnnouncements();
      return NextResponse.json({
        success: true,
        message: 'Announcement published live to global banner!',
        banner: updatedBanner,
        announcements,
      });
    }

    // 2. Action: Save to Library
    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { error: 'Announcement message cannot be empty.' },
        { status: 400 }
      );
    }

    const saved = await saveAnnouncement({
      id: body.id,
      title: body.title,
      message: body.message,
      link: body.link,
      buttonText: body.buttonText,
      color: body.color,
    });

    const announcements = await getSavedAnnouncements();
    return NextResponse.json({
      success: true,
      saved,
      announcements,
    });
  } catch (error) {
    console.error('[Announcements API] Failed to save announcement:', error);
    return NextResponse.json(
      { error: 'Failed to save announcement' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/banner/announcements - Edit an existing saved announcement
export async function PUT(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, message, link, buttonText, color } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required for editing.' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Announcement message cannot be empty.' },
        { status: 400 }
      );
    }

    const updated = await updateSavedAnnouncement(id, {
      title,
      message,
      link,
      buttonText,
      color,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Announcement not found.' },
        { status: 404 }
      );
    }

    const announcements = await getSavedAnnouncements();
    return NextResponse.json({
      success: true,
      announcement: updated,
      announcements,
    });
  } catch (error) {
    console.error('[Announcements API] Failed to update announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banner/announcements - Permanent delete
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let id: string | null = request.nextUrl.searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required for permanent deletion.' },
        { status: 400 }
      );
    }

    const deleted = await deleteSavedAnnouncement(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Announcement not found or already deleted.' },
        { status: 404 }
      );
    }

    const announcements = await getSavedAnnouncements();
    return NextResponse.json({
      success: true,
      message: 'Announcement permanently deleted.',
      deletedId: id,
      announcements,
    });
  } catch (error) {
    console.error('[Announcements API] Failed to delete announcement:', error);
    return NextResponse.json(
      { error: 'Failed to permanently delete announcement' },
      { status: 500 }
    );
  }
}
