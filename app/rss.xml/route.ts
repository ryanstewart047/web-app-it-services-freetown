import { NextResponse } from 'next/server';
import { fetchBlogPosts } from '@/lib/github-blog-storage';
import { BRAND_NAME, BRAND_SITE_URL } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache and revalidate every hour

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
  },
  {
    title: 'Laptop Running Slow: Practical Performance Recovery',
    link: `${BRAND_SITE_URL}/repair-guides#laptop-running-slow-recovery`,
    description:
      'Fix common laptop slowdown causes including startup bloat, failing hard drives, thermal overheating, dust accumulation, and malware.',
    pubDate: new Date('2026-09-05T00:00:00Z').toUTCString(),
    category: 'Computer Maintenance',
    author: BRAND_NAME,
  },
  {
    title: 'Water Damage Response: First 60 Minutes Checklist for Mobile Devices',
    link: `${BRAND_SITE_URL}/repair-guides#water-damage-first-60-minutes`,
    description:
      'Immediate emergency actions that reduce corrosion and data loss risk for smartphones and laptops exposed to liquids or rain.',
    pubDate: new Date('2026-09-10T00:00:00Z').toUTCString(),
    category: 'Emergency Guide',
    author: BRAND_NAME,
  },
  {
    title: 'Cracked Screen: Repair vs Replace Decision Guide',
    link: `${BRAND_SITE_URL}/repair-guides#cracked-screen-repair-replace`,
    description:
      'Understand cost factors, device age, replacement part quality tiers (OLED, LCD, Original), and data safety before repairing cracked phone screens.',
    pubDate: new Date('2026-09-15T00:00:00Z').toUTCString(),
    category: 'Mobile Repair',
    author: BRAND_NAME,
  },
  {
    title: 'Battery Health and Safe Charging Habits in West Africa',
    link: `${BRAND_SITE_URL}/repair-guides#battery-health-safe-charging`,
    description:
      'Improve smartphone and laptop battery lifespan with optimal charging habits, heat management in local tropical weather, and safe power surge tips.',
    pubDate: new Date('2026-09-20T00:00:00Z').toUTCString(),
    category: 'Hardware Care',
    author: BRAND_NAME,
  },
  {
    title: 'Data Backup Before Service: Customer Security Checklist',
    link: `${BRAND_SITE_URL}/repair-guides#backup-before-repair-checklist`,
    description:
      'Prepare your phone or computer for repair intake with full data backup, account logout, and privacy protection protocols.',
    pubDate: new Date('2026-09-25T00:00:00Z').toUTCString(),
    category: 'Data Protection',
    author: BRAND_NAME,
  },
];

export async function GET() {
  const feedUrl = `${BRAND_SITE_URL}/rss.xml`;
  const siteUrl = BRAND_SITE_URL;
  const siteTitle = `${BRAND_NAME} - Computer & Mobile Repair Guides, Tech News & IT Services Freetown`;
  const siteDescription =
    'Latest technology news, smartphone and computer repair guides, hardware maintenance tips, and professional IT services in Freetown, Sierra Leone.';

  let blogPosts: any[] = [];
  try {
    blogPosts = await fetchBlogPosts();
  } catch (error) {
    console.error('Error fetching blog posts for RSS feed:', error);
  }

  // Map blog posts to RSS items
  const blogItems = (blogPosts || []).map((post) => {
    const postLink = `${siteUrl}/blog/${post.id}`;
    const plainExcerpt = stripHtml(post.content || '').slice(0, 300);
    const pubDate = toRfc822Date(post.date);

    return `    <item>
      <title>${escapeXml(post.title || 'Tech Update')}</title>
      <link>${escapeXml(postLink)}</link>
      <guid isPermaLink="true">${escapeXml(postLink)}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.author || BRAND_NAME)}</author>
      <category>Tech News</category>
      <description>${escapeXml(plainExcerpt || post.title)}...</description>
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
      <author>${escapeXml(guide.author)}</author>
      <category>${escapeXml(guide.category)}</category>
      <description>${escapeXml(guide.description)}</description>
      <content:encoded><![CDATA[<p>${guide.description}</p><p><a href="${guide.link}">Read full guide on BridgeTech IT Services</a></p>]]></content:encoded>
    </item>`;
  });

  const allItems = [...blogItems, ...guideItems].join('\n');
  const lastBuildDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/assets/images/slide01.jpg</url>
      <title>${escapeXml(BRAND_NAME)}</title>
      <link>${siteUrl}</link>
    </image>
${allItems}
  </channel>
</rss>`.trim();

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
