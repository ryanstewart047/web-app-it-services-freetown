import { NextResponse } from 'next/server';
import { fetchPublishedBlogPosts } from '@/lib/github-blog-storage';
import { BRAND_NAME, BRAND_SITE_URL } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Dedicated Google News Sitemap (/news-sitemap.xml)
 * Follows Google News Sitemap 0.9 specification:
 * Lists published news articles from the past 48 hours.
 */
export async function GET() {
  let posts: any[] = [];
  try {
    posts = await fetchPublishedBlogPosts();
  } catch (error) {
    console.error('[News Sitemap] Failed to fetch published blog posts:', error);
  }

  const fortyEightHoursMs = 48 * 60 * 60 * 1000;
  const nowMs = Date.now();

  const recentNewsPosts = (posts || [])
    .filter((post) => {
      const pubStr = post.publishedAt || post.date;
      if (!pubStr) return false;
      const pubMs = new Date(pubStr).getTime();
      return !isNaN(pubMs) && nowMs - pubMs <= fortyEightHoursMs;
    })
    .slice(0, 1000);

  const urlEntries = recentNewsPosts
    .map((post) => {
      const postUrl = `${BRAND_SITE_URL}/blog/${post.id}`;
      const pubDateIso = new Date(post.publishedAt || post.date).toISOString();

      return `  <url>
    <loc>${escapeXml(postUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(BRAND_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDateIso}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
