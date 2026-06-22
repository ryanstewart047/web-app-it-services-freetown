import { NextRequest, NextResponse } from 'next/server';
import { canRunProtectedAutomation } from '@/lib/server/admin-session';
import { runFacebookAutoPost } from '@/lib/server/facebook-auto-post';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!canRunProtectedAutomation(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runFacebookAutoPost({ triggeredBy: 'cron' });
  return NextResponse.json(result, { status: result.status === 'error' ? 500 : 200 });
}
