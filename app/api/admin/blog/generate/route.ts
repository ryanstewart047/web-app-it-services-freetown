import { NextRequest, NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/server/admin-session';
import { investigateAndGenerateStory } from '@/lib/server/blog-ai-investigator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed execution time for Vercel/serverless

export async function POST(request: NextRequest) {
  // Check admin session, or allow dev environment
  const isAdmin = hasAdminSession(request);
  if (!isAdmin && process.env.NODE_ENV === 'production') {
    // If not authenticated via admin_session cookie, check if authorization header is present
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
  }

  try {
    const body = await request.json().catch(() => ({}));
    const topic = (body.topic || body.prompt || '').trim();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic or investigation prompt is required' },
        { status: 400 }
      );
    }

    const includeImages = body.includeImages !== false;
    const includeSources = body.includeSources !== false;
    const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl.trim() : undefined;
    const sourceName = typeof body.sourceName === 'string' ? body.sourceName.trim() : undefined;
    const topicTitle = typeof body.topicTitle === 'string' ? body.topicTitle.trim() : undefined;
    const initialImageUrl = typeof body.initialImageUrl === 'string' ? body.initialImageUrl.trim() : undefined;
    const initialImageCaption =
      typeof body.initialImageCaption === 'string' ? body.initialImageCaption.trim() : undefined;
    const initialImageUrls = Array.isArray(body.initialImageUrls) ? body.initialImageUrls : undefined;
    const previousStyleId = typeof body.previousStyleId === 'string' ? body.previousStyleId.trim() : undefined;

    console.log(`[API Blog Generate] Initiating story generation for: "${topicTitle || topic}"`);

    const result = await investigateAndGenerateStory(topic, {
      includeImages,
      includeSources,
      sourceUrl,
      sourceName,
      topicTitle,
      initialImageUrl,
      initialImageCaption,
      initialImageUrls,
      previousStyleId,
    });

    return NextResponse.json({
      success: true,
      title: result.title,
      content: result.content,
      media: result.media,
      sources: result.sources,
      tldr: result.tldr,
      styleId: result.styleId,
      styleName: result.styleName,
      provider: result.provider,
    });
  } catch (err: any) {
    console.error('[API Blog Generate] Generation failed:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to investigate and generate blog story',
      },
      { status: 500 }
    );
  }
}
