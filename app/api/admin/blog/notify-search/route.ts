import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasAdminSession } from '@/lib/server/admin-session';
import { BRAND_SITE_URL } from '@/lib/brand';

export const dynamic = 'force-dynamic';

/**
 * Revalidates public blog, RSS, and sitemap caches and pings Google's WebSub (PubSubHubbub) hub
 * whenever a blog post is published or updated so Google collects new posts immediately.
 */
export async function POST(request: NextRequest) {
  const isAdmin = hasAdminSession(request);
  if (!isAdmin && process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }
  }

  try {
    const body = await request.json().catch(() => ({}));
    const postId = body.postId ? String(body.postId) : null;

    // 1. Invalidate Next.js ISR / Route Caches immediately
    revalidatePath('/blog');
    if (postId) {
      revalidatePath(`/blog/${postId}`);
    }
    revalidatePath('/rss.xml');
    revalidatePath('/feed.xml');
    revalidatePath('/sitemap.xml');
    revalidatePath('/news-sitemap.xml');

    // 2. Notify Google's official WebSub / PubSubHubbub hub for RSS feed instant crawling
    const feedUrls = [`${BRAND_SITE_URL}/rss.xml`, `${BRAND_SITE_URL}/feed.xml`];
    const websubResults = await Promise.allSettled(
      feedUrls.map(async (feedUrl) => {
        const res = await fetch('https://pubsubhubbub.appspot.com/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            'hub.mode': 'publish',
            'hub.url': feedUrl,
          }).toString(),
        });
        return { feedUrl, status: res.status, ok: res.ok };
      })
    );

    return NextResponse.json({
      success: true,
      revalidated: ['/blog', '/rss.xml', '/feed.xml', '/sitemap.xml', '/news-sitemap.xml'],
      websub: websubResults.map((r) => (r.status === 'fulfilled' ? r.value : { ok: false })),
    });
  } catch (err: any) {
    console.error('[Blog Notify Search] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Notification failed' },
      { status: 500 }
    );
  }
}
