import { NextResponse } from 'next/server';
import { fetchPublishedBlogPosts } from '@/lib/github-blog-storage';
import { BRAND_NAME, BRAND_SITE_URL } from '@/lib/brand';
import { getPostCategory, getPrimaryImage } from '../blog/blog-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Fresh feed every 60 seconds for rapid Google News/Discover pickup

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function toRfc822Date(dateString?: string): string {
  if (!dateString) return new Date().toUTCString();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function inferImageMimeType(url: string): string {
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function normalizeImageUrl(rawUrl?: string): string {
  const fallback = `${BRAND_SITE_URL}/assets/images/slide01.jpg`;
  if (!rawUrl) return fallback;
  let url = rawUrl.trim();
  if (url.startsWith('/')) url = `${BRAND_SITE_URL}${url}`;
  if (url.includes('github.com') && url.includes('/blob/')) {
    url = url
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/')
      .replace(/[?&]raw=true/, '');
  }
  return url.startsWith('http') ? url : fallback;
}

// Evergreen repair guides to guarantee a rich feed even if external APIs have delays
const EVERGREEN_GUIDES = [
  {
    title: 'Phone Not Charging: Step-by-Step Diagnosis',
    link: `${BRAND_SITE_URL}/repair-guides#phone-not-charging-diagnosis`,
    description:
      'Identify whether a mobile charging issue is caused by the cable, adapter, charging port, battery, or motherboard with a safe check sequence in Sierra Leone.',
    pubDate: new Date('2026-09-01T00:00:00Z').toUTCString(),
    category: 'Repair Guide',
    author: BRAND_NAME,
    image: `${BRAND_SITE_URL}/assets/images/slide01.jpg`,
  },
  {
    title: 'Laptop Running Slow: Practical Performance Recovery',
    link: `${BRAND_SITE_URL}/repair-guides#laptop-running-slow-recovery`,
    description:
      'Fix common laptop slowdown causes including startup bloat, failing hard drives, thermal overheating, dust accumulation, and malware.',
    pubDate: new Date('2026-09-05T00:00:00Z').toUTCString(),
    category: 'Computer Maintenance',
    author: BRAND_NAME,
    image: `${BRAND_SITE_URL}/assets/images/slide01.jpg`,
  },
  {
    title: 'Water Damage Response: First 60 Minutes Checklist for Mobile Devices',
    link: `${BRAND_SITE_URL}/repair-guides#water-damage-first-60-minutes`,
    description:
      'Immediate emergency actions that reduce corrosion and data loss risk for smartphones and laptops exposed to liquids or rain.',
    pubDate: new Date('2026-09-10T00:00:00Z').toUTCString(),
    category: 'Emergency Guide',
    author: BRAND_NAME,
    image: `${BRAND_SITE_URL}/assets/images/slide01.jpg`,
  },
  {
    title: 'Cracked Screen: Repair vs Replace Decision Guide',
    link: `${BRAND_SITE_URL}/repair-guides#cracked-screen-repair-replace`,
    description:
      'Understand cost factors, device age, replacement part quality tiers (OLED, LCD, Original), and data safety before repairing cracked phone screens.',
    pubDate: new Date('2026-09-15T00:00:00Z').toUTCString(),
    category: 'Mobile Repair',
    author: BRAND_NAME,
    image: `${BRAND_SITE_URL}/assets/images/slide01.jpg`,
  },
  {
    title: 'Battery Health and Safe Charging Habits in West Africa',
    link: `${BRAND_SITE_URL}/repair-guides#battery-health-safe-charging`,
    description:
      'Improve smartphone and laptop battery lifespan with optimal charging habits, heat management in local tropical weather, and safe power surge tips.',
    pubDate: new Date('2026-09-20T00:00:00Z').toUTCString(),
    category: 'Hardware Care',
    author: BRAND_NAME,
    image: `${BRAND_SITE_URL}/assets/images/slide01.jpg`,
  },
  {
    title: 'Data Backup Before Service: Customer Security Checklist',
    link: `${BRAND_SITE_URL}/repair-guides#backup-before-repair-checklist`,
    description:
      'Prepare your phone or computer for repair intake with full data backup, account logout, and privacy protection protocols.',
    pubDate: new Date('2026-09-25T00:00:00Z').toUTCString(),
    category: 'Data Protection',
    author: BRAND_NAME,
    image: `${BRAND_SITE_URL}/assets/images/slide01.jpg`,
  },
];

export async function GET() {
  const feedUrl = `${BRAND_SITE_URL}/rss.xml`;
  const siteUrl = BRAND_SITE_URL;
  const siteTitle = `${BRAND_NAME} - Tech News, Repair Guides & IT Services Freetown`;
  const siteDescription =
    'Latest Sierra Leone technology news, smartphone and computer repair guides, hardware maintenance tips, and professional IT services in Freetown.';

  let blogPosts: any[] = [];
  try {
    blogPosts = await fetchPublishedBlogPosts();
  } catch (error) {
    console.error('Error fetching blog posts for RSS feed:', error);
  }

  // Sort newest first by full ISO timestamp
  const sortedPosts = [...(blogPosts || [])].sort((a, b) => {
    const aTime = new Date(a.publishedAt || a.date || 0).getTime();
    const bTime = new Date(b.publishedAt || b.date || 0).getTime();
    return bTime - aTime;
  });

  // Map published blog posts to Google News / Discover compatible RSS items
  const blogItems = sortedPosts.map((post) => {
    const postLink = `${siteUrl}/blog/${post.id}`;
    const plainExcerpt = stripHtml(post.content || '').slice(0, 320);
    const pubDate = toRfc822Date(post.publishedAt || post.date);
    const category = getPostCategory(post) || 'Tech News';
    const imageUrl = normalizeImageUrl(getPrimaryImage(post));
    const mimeType = inferImageMimeType(imageUrl);
    const authorName = post.author || BRAND_NAME;

    return `    <item>
      <title>${escapeXml(post.title || 'Tech Update')}</title>
      <link>${escapeXml(postLink)}</link>
      <guid isPermaLink="true">${escapeXml(postLink)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${escapeXml(authorName)}</dc:creator>
      <category>${escapeXml(category)}</category>
      <description>${escapeXml(plainExcerpt || post.title)}</description>
      <media:content url="${escapeXml(imageUrl)}" medium="image" type="${mimeType}" width="1200" />
      <media:thumbnail url="${escapeXml(imageUrl)}" />
      <enclosure url="${escapeXml(imageUrl)}" type="${mimeType}" length="0" />
      <content:encoded><![CDATA[${post.content || ''}]]></content:encoded>
    </item>`;
  });

  // Map evergreen guides to RSS items
  const guideItems = EVERGREEN_GUIDES.map((guide) => {
    return `    <item>
      <title>${escapeXml(guide.title)}</title>
      <link>${escapeXml(guide.link)}</link>
      <guid isPermaLink="true">${escapeXml(guide.link)}</guid>
      <pubDate>${guide.pubDate}</pubDate>
      <dc:creator>${escapeXml(guide.author)}</dc:creator>
      <category>${escapeXml(guide.category)}</category>
      <description>${escapeXml(guide.description)}</description>
      <media:content url="${escapeXml(guide.image)}" medium="image" type="image/jpeg" width="1200" />
      <enclosure url="${escapeXml(guide.image)}" type="image/jpeg" length="0" />
      <content:encoded><![CDATA[<p>${guide.description}</p><p><a href="${guide.link}">Read full guide on BridgeTech IT Services</a></p>]]></content:encoded>
    </item>`;
  });

  const allItems = [...blogItems, ...guideItems].join('\n');
  const lastBuildDate = sortedPosts[0]
    ? toRfc822Date(sortedPosts[0].updatedAt || sortedPosts[0].publishedAt || sortedPosts[0].date)
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}/blog</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>15</ttl>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub"/>
    <image>
      <url>${siteUrl}/assets/images/slide01.jpg</url>
      <title>${escapeXml(BRAND_NAME)}</title>
      <link>${siteUrl}/blog</link>
    </image>
${allItems}
  </channel>
</rss>`.trim();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
