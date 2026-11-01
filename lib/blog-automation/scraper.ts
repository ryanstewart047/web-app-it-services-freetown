import { ScrapedArticle } from './types';

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Strips HTML boilerplate and extracts main article text
 */
function cleanHtmlContent(html: string): string {
  // Remove scripts, styles, embeds, noscript
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '');

  // Extract from <article> if available
  const articleMatch = text.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch) {
    text = articleMatch[0];
  } else {
    // Or main tag
    const mainMatch = text.match(/<main[\s\S]*?<\/main>/i);
    if (mainMatch) {
      text = mainMatch[0];
    }
  }

  // Convert common blocks to newlines
  text = text
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–');

  // Normalize excessive whitespace and line breaks
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20); // Filter out short fragments, menus, buttons

  return lines.join('\n\n').trim();
}

/**
 * Scrapes an article URL with 75s timeout and browser headers,
 * falling back to RSS body if the live website blocks or paywalls the request.
 */
export async function scrapeArticleContent(
  url: string,
  source: string,
  fallbackTitle: string,
  fallbackContent?: string
): Promise<ScrapedArticle | null> {
  const controller = new AbortController();
  // 75-second timeout (satisfies the 60-90s requirement to avoid 408s)
  const timeoutMs = 75000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let cleanText = '';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      cleanText = cleanHtmlContent(html);
    } else {
      console.warn(`[Scraper] HTTP ${res.status} for ${url}, attempting RSS content fallback.`);
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[Scraper] Live fetch failed for ${url} (${err.message}), attempting RSS content fallback.`);
  }

  // If live scraping yielded insufficient text, fall back to RSS article text
  if ((!cleanText || cleanText.length < 150) && fallbackContent) {
    const cleanedFallback = cleanHtmlContent(fallbackContent);
    if (cleanedFallback && cleanedFallback.length >= 80) {
      console.log(`[Scraper] Successfully extracted ${cleanedFallback.length} chars from RSS content fallback.`);
      cleanText = cleanedFallback;
    }
  }

  if (!cleanText || cleanText.length < 80) {
    console.warn(`[Scraper] Incomplete or unparseable content from: ${url}`);
    return null;
  }

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  return {
    title: fallbackTitle,
    url,
    source,
    cleanText: cleanText.slice(0, 15000), // Cap at 15k chars for prompt token hygiene
    wordCount,
  };
}
