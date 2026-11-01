import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { FeedItem } from './types';

export const DEFAULT_TECH_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Wired Tech', url: 'https://www.wired.com/feed/category/gear/latest/rss' },
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/' },
];

/**
 * Creates a unique SHA-256 hash for deduplication
 */
export function hashGuid(rawGuidOrUrl: string): string {
  return crypto.createHash('sha256').update(rawGuidOrUrl.trim()).digest('hex');
}

/**
 * Clean XML CDATA and HTML entity decodes
 */
function cleanXmlText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Parse an RSS or Atom XML string without heavy dependencies
 */
export function parseRssXml(xml: string, sourceName: string): FeedItem[] {
  const items: FeedItem[] = [];

  // Match standard RSS <item> tags
  const rssItemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const itemXml of rssItemMatches) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const guidMatch = itemXml.match(/<guid[\s\S]*?>([\s\S]*?)<\/guid>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    const contentEncodedMatch = itemXml.match(/<content:encoded[\s\S]*?>([\s\S]*?)<\/content:encoded>/i);

    const title = cleanXmlText(titleMatch ? titleMatch[1] : '');
    let link = cleanXmlText(linkMatch ? linkMatch[1] : '');
    const guid = cleanXmlText(guidMatch ? guidMatch[1] : link);
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : undefined;
    const rawContent = contentEncodedMatch ? contentEncodedMatch[1] : (descMatch ? descMatch[1] : '');
    const fullFeedContent = cleanXmlText(rawContent);
    const summary = cleanXmlText(descMatch ? descMatch[1] : '');

    if (!link && guid.startsWith('http')) {
      link = guid;
    }

    if (title && (link || guid)) {
      const guidHash = hashGuid(guid || link);
      items.push({
        guid: guid || link,
        guidHash,
        title,
        link: link || guid,
        pubDate,
        source: sourceName,
        summary: summary.replace(/<[^>]*>/g, '').slice(0, 300),
        fullFeedContent: fullFeedContent || summary,
      });
    }
  }

  // Fallback for Atom <entry> tags if no RSS items found
  if (items.length === 0) {
    const atomEntryMatches = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
    for (const entryXml of atomEntryMatches) {
      const titleMatch = entryXml.match(/<title[\s\S]*?>([\s\S]*?)<\/title>/i);
      const linkMatch = entryXml.match(/<link[^>]+href=["']([^"']+)["']/i);
      const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/i);
      const summaryMatch = entryXml.match(/<summary[\s\S]*?>([\s\S]*?)<\/summary>/i);
      const contentMatch = entryXml.match(/<content[\s\S]*?>([\s\S]*?)<\/content>/i);

      const title = cleanXmlText(titleMatch ? titleMatch[1] : '');
      const link = linkMatch ? linkMatch[1].trim() : '';
      const guid = cleanXmlText(idMatch ? idMatch[1] : link);
      const summary = cleanXmlText(summaryMatch ? summaryMatch[1] : '');
      const fullFeedContent = cleanXmlText(contentMatch ? contentMatch[1] : summary);

      if (title && (link || guid)) {
        const guidHash = hashGuid(guid || link);
        items.push({
          guid: guid || link,
          guidHash,
          title,
          link: link || guid,
          source: sourceName,
          summary: summary.replace(/<[^>]*>/g, '').slice(0, 300),
          fullFeedContent: fullFeedContent || summary,
        });
      }
    }
  }

  return items;
}

/**
 * Fetches RSS feeds and filters out previously processed items
 */
export async function getUnprocessedFeedItems(limitPerFeed: number = 5): Promise<FeedItem[]> {
  const allCandidates: FeedItem[] = [];

  for (const feed of DEFAULT_TECH_FEEDS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BridgeTechFeedBot/1.0; +https://www.itservicesfreetown.com)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[RSS Parser] Feed ${feed.name} returned HTTP ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const items = parseRssXml(xml, feed.name);
      allCandidates.push(...items.slice(0, limitPerFeed));
    } catch (err: any) {
      console.warn(`[RSS Parser] Failed fetching ${feed.name}:`, err.message);
    }
  }

  if (allCandidates.length === 0) {
    return [];
  }

  // Deduplicate against database
  const hashes = allCandidates.map((i) => i.guidHash);
  const existingProcessed = await prisma.processedFeed.findMany({
    where: { guidHash: { in: hashes } },
    select: { guidHash: true },
  });

  const existingHashSet = new Set(existingProcessed.map((p) => p.guidHash));

  // Also check existing automated drafts by sourceUrl to ensure zero duplicates
  const urls = allCandidates.map((i) => i.link);
  const existingDrafts = await prisma.automatedBlogDraft.findMany({
    where: { sourceUrl: { in: urls } },
    select: { sourceUrl: true },
  });
  const existingUrlSet = new Set(existingDrafts.map((d) => d.sourceUrl));

  const unprocessed = allCandidates.filter(
    (item) => !existingHashSet.has(item.guidHash) && !existingUrlSet.has(item.link)
  );

  return unprocessed;
}
