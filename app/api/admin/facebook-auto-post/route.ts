import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/server/admin-session';
import {
  clearFacebookAutoPostLogs,
  getFacebookAutoPostDashboard,
  runFacebookAutoPost,
  updateFacebookAutoPostSettings,
} from '@/lib/server/facebook-auto-post';

export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return unauthorized();
  }

  try {
    return NextResponse.json(await getFacebookAutoPostDashboard());
  } catch (error) {
    console.error('[FacebookAutoPost GET]', error);
    return NextResponse.json({ error: 'Failed to load Facebook auto post settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const settings = await updateFacebookAutoPostSettings(body);
    const dashboard = await getFacebookAutoPostDashboard();

    return NextResponse.json({
      success: true,
      settings,
      config: dashboard.config,
      logs: dashboard.logs,
    });
  } catch (error) {
    console.error('[FacebookAutoPost PUT]', error);
    return NextResponse.json({ error: 'Failed to save Facebook auto post settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return unauthorized();
  }

  try {
    const result = await runFacebookAutoPost({ force: true, triggeredBy: 'admin' });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[FacebookAutoPost POST]', error);
    return NextResponse.json({ error: 'Failed to publish Facebook post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return unauthorized();
  }

  try {
    const count = await clearFacebookAutoPostLogs();
    return NextResponse.json({ success: true, deleted: count });
  } catch (error) {
    console.error('[FacebookAutoPost DELETE]', error);
    return NextResponse.json({ error: 'Failed to clear logs' }, { status: 500 });
  }
}
