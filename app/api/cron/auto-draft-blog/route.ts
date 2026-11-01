import { NextRequest, NextResponse } from 'next/server';
import { canRunProtectedAutomation } from '@/lib/server/admin-session';
import { runBlogAutomationPipeline } from '@/lib/blog-automation/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed execution time for Vercel Hobby/Pro serverless function

export async function GET(request: NextRequest) {
  if (!canRunProtectedAutomation(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runBlogAutomationPipeline({ maxArticles: 2 });
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (err: any) {
    console.error('[Cron Auto Draft] Execution failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!canRunProtectedAutomation(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const maxArticles = typeof body.maxArticles === 'number' ? body.maxArticles : 2;

    const result = await runBlogAutomationPipeline({ maxArticles });
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (err: any) {
    console.error('[Manual Auto Draft] Execution failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
