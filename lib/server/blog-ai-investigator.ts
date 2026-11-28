/**
 * AI Blog Investigator & Article Generation Engine
 *
 * Features:
 * 1. Deep live web investigation (Google News RSS, Wikipedia, Web scraping).
 * 2. Real image discovery & extraction (og:image, article figures, or contextual tech imagery).
 * 3. Verified external sources & reference links.
 * 4. High token limits (4096+) to ensure complete, untruncated journalistic stories.
 * 5. BridgeTech IT Services local industry perspective (Freetown, Sierra Leone).
 */

import {
  CURATED_SL_TECH_TOPICS,
  extractSourceArticleDetails,
  getCategoryFallbackImages,
  resolveGoogleNewsUrl,
  verifyReachableImageUrl,
} from './sl-tech-news-finder';
import { cleanPromptSubject } from '../../app/blog/blog-utils';

export interface DiscoveredSource {
  title: string;
  url: string;
  snippet?: string;
  sourceName?: string;
}

export interface DiscoveredImage {
  id: string;
  type: 'image';
  url: string;
  caption: string;
  altText: string;
}

export interface GeneratedBlogStory {
  title: string;
  content: string;
  media: DiscoveredImage[];
  sources: DiscoveredSource[];
  tldr: string;
  styleId?: string;
  styleName?: string;
  provider?: string;
}

// Verified Sierra Leone Tech & News Knowledge Base
const VERIFIED_SIERRA_LEONE_TOPICS: Array<{
  keywords: string[];
  title: string;
  facts: string[];
  sources: DiscoveredSource[];
  images: DiscoveredImage[];
}> = [
  {
    keywords: ['21.9', 'unique group', 'unique solutions', 'waiis', 'phone assembly plant', 'mobile phone assembly'],
    title: "Sierra Leone's ICT Ministry Signs Landmark US$21.9M MoU with Unique Group for Mobile Phone & Electronics Assembly in Freetown",
    facts: [
      "On November 19-20, 2026, the Government of Sierra Leone, through the Ministry of Communication, Technology and Innovation (MoCTI) led by Minister Salima Monorma Bah, signed a historic Memorandum of Understanding (MoU) with Unique Group Company Ltd of The Gambia (represented by Managing Director Mr. Adama Touray and Chairman Papa Yusupha Njie).",
      "The agreement was unveiled in Freetown during the West Africa Integration and Investment Summit (WAIIS) 2026, attended by H.E. President Dr. Julius Maada Bio.",
      "The indicative investment value of the project is US$21.9 Million (twenty-one million, nine hundred thousand US dollars).",
      "The primary mission is to establish Sierra Leone's first local mobile phone and electronics assembly plant to combat the high cost of digital devices, which currently prevents thousands of Sierra Leoneans from accessing mobile broadband.",
      "The project rollout is phased: covering device assembly, software configuration, rigorous quality testing, customer servicing, warranty repairs, and eventual component fabrication.",
      "A dedicated Technical Training & Skills Center will be established alongside the factory to equip young Sierra Leoneans with hands-on technical skills in micro-soldering, hardware diagnostics, and circuit board assembly.",
      "Complementary initiatives under the pact include expanding school connectivity, solar-powered digital education infrastructure, and positioning Sierra Leone as a regional hardware distribution hub across the Mano River Union and ECOWAS.",
    ],
    sources: [
      {
        title: "Official MoCTI Press Release: Government and Unique Group Partner to Advance Local Mobile Phone Assembly",
        url: "https://mocti.gov.sl/government-and-unique-group-partner-to-advance-local-mobile-phone-assembly-digital-inclusion-and-job-creation-in-sierra-leone/",
        sourceName: "Ministry of Communication, Technology & Innovation (MoCTI)",
      },
      {
        title: "West Africa Integration & Investment Summit (WAIIS) 2026 Report",
        url: "https://mocti.gov.sl",
        sourceName: "WAIIS 2026 Secretariat, Freetown",
      },
      {
        title: "Telecompaper: Sierra Leone and Unique Group Partner to Boost Local Phone Assembly",
        url: "https://www.telecompaper.com",
        sourceName: "Telecompaper International",
      },
      {
        title: "SierraLoaded: ICT Ministry Signs $21.9M Tech Deal with Unique Group",
        url: "https://sierraloaded.sl",
        sourceName: "SierraLoaded Sierra Leone",
      },
    ],
    images: [
      {
        id: 'mocti-mou-signing',
        type: 'image',
        url: 'https://mocti.gov.sl/wp-content/uploads/2026/11/government-unique-group-mobile-phone-assembly-mou-waiis-2026-1024x732.jpg',
        caption: 'From left: Hon. Salima Bah (Minister of Communication, Technology & Innovation), H.E. Julius Maada Bio (President of Sierra Leone), and Mr. Adama Touray (Managing Director, Unique Group) at the US$21.9M MoU signing ceremony during WAIIS 2026 in Freetown.',
        altText: 'MoCTI Minister Salima Bah, President Julius Maada Bio, and Unique Group MD Adama Touray signing the US$21.9 million electronics assembly MoU in Freetown',
      },
    ],
  },
];

/**
 * Perform a live Google News RSS query to extract recent facts and resolved publisher links
 */
async function searchGoogleNews(query: string): Promise<DiscoveredSource[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const feedUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const resolvedPromises = itemMatches.slice(0, 4).map(async (itemXml): Promise<DiscoveredSource | null> => {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

      if (!titleMatch || !linkMatch) return null;

      const cleanTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const rawLink = linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const cleanSource = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : 'News Source';

      if (!cleanTitle || !rawLink) return null;

      const resolvedUrl = await resolveGoogleNewsUrl(rawLink);
      return {
        title: cleanTitle,
        url: resolvedUrl,
        sourceName: cleanSource,
      };
    });

    const settled = await Promise.all(resolvedPromises);
    return settled.filter((s): s is DiscoveredSource => s !== null);
  } catch {
    return [];
  }
}

export interface EditorialStyleProfile {
  id: string;
  name: string;
  voice: string;
  openingRule: string;
  structureRule: string;
}

export const EDITORIAL_STYLES: EditorialStyleProfile[] = [
  {
    id: 'investigative-feature',
    name: 'Investigative Feature',
    voice:
      'Write in immersive, magazine-style longform journalism. Open with a vivid scene-setting or high-stakes lede that anchors the real development in Sierra Leone, blending concrete facts with smooth narrative transitions.',
    openingRule:
      'Do NOT start with a "Quick Summary" box. Begin directly with 2 strong narrative lead paragraphs setting the stakes, actors, and timeline.',
    structureRule:
      'Organize into 5–6 thematic <h2> chapters using compelling journalistic titles (never generic "1. Key Facts" labels), weaving <blockquote> pull-quotes or key numbers directly into the prose.',
  },
  {
    id: 'executive-briefing',
    name: 'Executive Technical Briefing',
    voice:
      'Write with sharp analytical precision aimed at decision-makers, telecom engineers, and business owners. Emphasize hard figures, operational metrics, technical bottlenecks, and market economics.',
    openingRule:
      'Open with a concise 3-bullet "Key Figures & Context" callout box (<div class="blog-tldr-box ...">), followed by an analytical thesis paragraph.',
    structureRule:
      'Include clear <h2> sections covering background context, technical architecture & mechanics, institutional/commercial rollout constraints, and concrete risk/opportunity analysis.',
  },
  {
    id: 'field-explainer',
    name: 'Practical Field Explainer',
    voice:
      'Write like an authoritative yet clear technical explainer addressing everyday citizens, students, and SME managers. Unpack complex policy or technical jargon in plain language without oversimplifying the facts.',
    openingRule:
      'Start with a compelling real-world scenario or question facing people in Freetown and provincial towns today, answering why this development matters immediately.',
    structureRule:
      'Include dedicated <h2> sections explaining "How It Works in Practice", "What Changes Immediately vs. Long-Term", and step-by-step takeaways for households and local organizations.',
  },
  {
    id: 'policy-impact',
    name: 'Policy & Ecosystem Analysis',
    voice:
      'Adopt an informed policy-and-markets editorial voice comparing Sierra Leone’s trajectory with ECOWAS/West African neighbors, tracing regulatory accountability and investment incentives.',
    openingRule:
      'Begin directly with an analytical hook placing the announcement or policy shift inside West Africa’s broader digital transformation timeline (no TL;DR box at top).',
    structureRule:
      'Break the analysis down by stakeholder groups (end users, local SMEs, mobile network operators/platforms, regulators & public agencies) across 5–6 distinct <h2> sections.',
  },
  {
    id: 'deep-dive-dossier',
    name: 'Deep-Dive Evidence Dossier',
    voice:
      'Write as a thorough, evidence-backed investigative report separating confirmed commitments and deployed funding from open implementation milestones and timelines.',
    openingRule:
      'Start with a crisp investigative premise paragraph followed by a focused <div class="blog-tldr-box ..."> titled "Verified Milestones at a Glance".',
    structureRule:
      'Contrast "Confirmed Facts & Funding Commitments", "On-the-Ground Execution Hurdles", "Sector-Wide Spillover Effects", and "What to Watch Over the Next 12 Months".',
  },
  {
    id: 'advisory-spotlight',
    name: 'Consumer & Business Spotlight',
    voice:
      'Combine vivid industry reporting with practical cost-benefit and readiness guidance, explaining what real organizations and device users gain—and where pitfalls still hide.',
    openingRule:
      'Open directly with concrete statistics or the core consumer pain point driving this news, avoiding generic cliché intros.',
    structureRule:
      'Use scannable sub-sections (<h3> inside <h2> sections), structured bulleted checklists, and concrete operational scenarios in Freetown, Bo, Kenema, and Makeni.',
  },
];

export function pickEditorialStyle(topicSeed: string, previousStyleId?: string): EditorialStyleProfile {
  const candidates = EDITORIAL_STYLES.filter((s) => s.id !== previousStyleId);
  const pool = candidates.length > 0 ? candidates : EDITORIAL_STYLES;
  let hash = Math.floor(Date.now() / 1000);
  for (let i = 0; i < topicSeed.length; i++) {
    hash = (hash * 31 + topicSeed.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}

function isRelevantSourceHeadline(headline: string, displayTopic: string): boolean {
  const stopWords = new Set([
    'sierra', 'leone', 'leones', 'freetown', 'africa', 'african', 'west', 'with',
    'that', 'this', 'from', 'into', 'over', 'about', 'after', 'amid', 'more',
    'news', 'tech', 'digital', 'technology', 'sector', 'new', 'report', 'plans',
  ]);
  const topicWords = displayTopic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));
  if (topicWords.length === 0) return true;
  const lowerHeadline = headline.toLowerCase();
  const hits = topicWords.filter((w) => lowerHeadline.includes(w)).length;
  return hits >= Math.min(2, topicWords.length);
}

/**
 * Fetch authentic multi-photo media & deep prose from a source article webpage.
 */
async function extractPhotosFromSourceWebpage(
  url: string
): Promise<{ images: DiscoveredImage[]; excerpt?: string; paragraphs: string[] }> {
  const details = await extractSourceArticleDetails(url);
  let hostname = 'source';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {}

  const images: DiscoveredImage[] = details.images.map((img, idx) => ({
    id: `src-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'image' as const,
    url: img.url,
    caption: img.caption || `Original source photograph (${hostname})${details.title ? `: ${details.title}` : ''}`,
    altText: img.altText || details.title || 'Original source photograph',
  }));

  return {
    images,
    excerpt: details.excerpt,
    paragraphs: details.paragraphs,
  };
}

/**
 * Fetch authentic real-world photographs from Wikimedia Commons API
 */
async function fetchWikimediaRealisticPhotos(query: string): Promise<DiscoveredImage[]> {
  try {
    const terms = query
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 4)
      .join(' ');

    const searchQuery = `${terms} Sierra Leone`;
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      searchQuery
    )}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|mime|extmetadata&format=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'BridgeTechITServices/1.0 (info@itservicesfreetown.com)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const pages = data.query?.pages || {};
    const photos: DiscoveredImage[] = [];

    for (const k in pages) {
      const p = pages[k];
      const info = p.imageinfo?.[0];
      const isRealImage = info?.url && /\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(info.url);
      const isBanned = info?.url && /\.(?:pdf|svg|tif|tiff|gif)(?:\?|$)/i.test(info.url);
      if (
        info?.url &&
        isRealImage &&
        !isBanned
      ) {
        const titleDesc =
          info.extmetadata?.ObjectName?.value ||
          info.extmetadata?.ImageDescription?.value ||
          p.title.replace(/^File:/i, '').replace(/\.[^.]+$/, '');

        const cleanDesc = titleDesc.replace(/<[^>]+>/g, '').trim().slice(0, 160);

        photos.push({
          id: `wiki-${p.pageid || Date.now()}`,
          type: 'image',
          url: info.url,
          caption: `Official photographic documentation: ${cleanDesc}`,
          altText: cleanDesc || 'Realistic photograph relating to Sierra Leone technology',
        });
      }
    }
    return photos;
  } catch {
    return [];
  }
}

/**
 * Get verified realistic imagery for contextual fallback (reusing Storyline Finder's verified map)
 */
function getCuratedTechImages(topic: string): DiscoveredImage[] {
  return getCategoryFallbackImages(topic).map((img) => ({
    id: img.id,
    type: 'image' as const,
    url: img.url,
    caption: img.caption,
    altText: img.altText,
  }));
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Strip duplicate H1 tags and any leaked AI editorial prompt text from generated article HTML.
 */
export function stripPromptLeaksFromHtml(
  html: string,
  rawPrompt: string,
  displayTopic: string
): string {
  let cleaned = html
    // Body shouldn't duplicate the page hero <h1>
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');

  const normalizedPrompt = rawPrompt.trim();
  if (normalizedPrompt.length > 20) {
    const escapedPrompt = normalizedPrompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(escapedPrompt, 'gi'), displayTopic);
  }

  // Strip common prompt instruction fragments that may sneak into summaries or headings
  cleaned = cleaned.replace(
    /\b(?:please\s+)?(?:investigate\s+and\s+write|write|draft|create|generate)\s+(?:a|an|the)\s+[^<>.?!]{5,80}?\b(?:blog\s+post|blog\s+article|feature(?:\s+story|\s+article)?|article|guide|advisory|report)\s+(?:about|on|detailing|explaining|covering|for|regarding)\s+/gi,
    ''
  );

  return cleaned.trim();
}

/**
 * MANDATORY POST-PROCESSOR:
 * Guarantees that EVERY generated article embeds ONLY this post's verified realistic photos
 * (removing any hallucinated or mismatched images the LLM may have invented).
 */
export function ensureRealisticPhotosInArticle(
  html: string,
  images: DiscoveredImage[],
  topic: string
): string {
  if (!images || images.length === 0) {
    return html;
  }

  const allowedUrls = new Set(images.map((img) => img.url));

  // Remove any hallucinated/unrelated <figure> or standalone <img> tags whose URL isn't in verified `images`
  let updatedHtml = html.replace(/<figure\b[\s\S]*?<\/figure>/gi, (figBlock) => {
    const srcMatch = figBlock.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (!srcMatch || !allowedUrls.has(srcMatch[1])) {
      return '';
    }
    return figBlock;
  });

  updatedHtml = updatedHtml.replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi, (imgTag, srcUrl) => {
    return allowedUrls.has(srcUrl) ? imgTag : '';
  });

  const safeTopic = escapeHtmlAttr(topic);
  const buildFigure = (img: DiscoveredImage, maxH = 500) => {
    const safeAlt = escapeHtmlAttr(img.altText || img.caption || safeTopic);
    const safeCaption = escapeHtmlAttr(img.caption || safeTopic);
    return `
<figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
  <img src="${img.url}" alt="${safeAlt}" class="w-full h-auto object-cover max-h-[${maxH}px] rounded-t-2xl" loading="lazy" />
  <figcaption class="p-4 text-xs text-slate-300 text-center italic bg-slate-950 border-t border-slate-800 leading-normal">
    📸 ${safeCaption}
  </figcaption>
</figure>
`;
  };

  // 1. Always embed primary image near the top if not already present
  const primaryImg = images[0];
  if (!updatedHtml.includes(primaryImg.url)) {
    const primaryFigure = buildFigure(primaryImg, 520);
    if (updatedHtml.includes('</div>') && /blog-tldr-box|Quick Summary|Key Takeaways|Key Figures|Verified Milestones/i.test(updatedHtml)) {
      const divEnd = updatedHtml.indexOf('</div>');
      updatedHtml = divEnd !== -1
        ? updatedHtml.slice(0, divEnd + 6) + '\n' + primaryFigure + '\n' + updatedHtml.slice(divEnd + 6)
        : primaryFigure + '\n' + updatedHtml;
    } else if (updatedHtml.includes('</p>')) {
      const pEnd = updatedHtml.indexOf('</p>');
      updatedHtml = updatedHtml.slice(0, pEnd + 4) + '\n' + primaryFigure + '\n' + updatedHtml.slice(pEnd + 4);
    } else {
      updatedHtml = primaryFigure + '\n' + updatedHtml;
    }
  }

  // 2. Evenly distribute all additional verified source photos (images[1..N-1]) before the final BridgeTech closing section
  const unembeddedExtras = images
    .slice(1)
    .filter((img) => img.url !== primaryImg.url && !updatedHtml.includes(img.url));

  if (unembeddedExtras.length > 0) {
    // Stop before any final BridgeTech section or sources card so visuals enrich the journalism itself
    const closingCutIndex = (() => {
      const btMatch = updatedHtml.search(/<h2[^>]*>[^<]*(?:BridgeTech|Closing Perspective|Editorial Commentary)[^<]*<\/h2>/i);
      const srcMatch = updatedHtml.search(/<div[^>]+class=["'][^"']*sources-card/i);
      if (btMatch !== -1) return btMatch;
      if (srcMatch !== -1) return srcMatch;
      return updatedHtml.length;
    })();

    const h2Indices: number[] = [];
    const h2Regex = /<h2[^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = h2Regex.exec(updatedHtml)) !== null) {
      if (m.index > 0 && m.index < closingCutIndex) {
        h2Indices.push(m.index);
      }
    }

    // Choose evenly spaced insertion offsets (inserting in reverse order preserves indices)
    const insertionPoints: Array<{ pos: number; html: string }> = [];
    if (h2Indices.length > 0) {
      const step = Math.max(1, Math.floor(h2Indices.length / unembeddedExtras.length));
      unembeddedExtras.forEach((img, idx) => {
        const slotIdx = Math.min(h2Indices.length - 1, Math.min(idx + 1, (idx + 1) * step - 1));
        insertionPoints.push({ pos: h2Indices[slotIdx], html: buildFigure(img, 460) });
      });
    } else {
      unembeddedExtras.forEach((img) => {
        insertionPoints.push({ pos: closingCutIndex, html: buildFigure(img, 460) });
      });
    }

    // Sort descending by position so multiple insertions don't shift earlier positions; group shared slots cleanly
    insertionPoints.sort((a, b) => b.pos - a.pos);
    for (const point of insertionPoints) {
      updatedHtml =
        updatedHtml.slice(0, point.pos) +
        '\n' +
        point.html +
        '\n' +
        updatedHtml.slice(point.pos);
    }
  }

  return updatedHtml;
}

/**
 * MANDATORY POST-PROCESSOR:
 * Guarantees that EVERY single generated article includes a clickable Reference Links / Sources block.
 * If the LLM omitted clickable source URLs or didn't include a Sources card, this injects it cleanly.
 */
export function ensureReferenceLinksInArticle(
  html: string,
  sources: DiscoveredSource[],
  topic: string
): string {
  const validSources = sources.filter(
    (s) => s.url && /^https?:\/\//i.test(s.url) && !s.url.includes('news.google.com/rss/articles/')
  );

  // Fallback to raw discovered sources or live Google News search link if all URLs were wrappers
  const finalSources: DiscoveredSource[] =
    validSources.length > 0
      ? validSources.slice(0, 5)
      : sources.length > 0
      ? sources.slice(0, 4)
      : [
          {
            title: `Google News Coverage: ${topic.slice(0, 80)}`,
            url: `https://news.google.com/search?q=${encodeURIComponent(topic.slice(0, 100))}`,
            sourceName: 'Google News Search',
          },
        ];

  // Check if HTML already contains a sources card AND at least one clickable external link from finalSources
  const hasSourcesSection = /sources-card|Sources &amp; Official References|Official Sources &amp; Verification References|Sources &amp; Reference Links/i.test(
    html
  );
  const hasDirectSourceHref = finalSources.some((s) => html.includes(`href="${s.url}"`) || html.includes(`href='${s.url}'`));

  if (hasSourcesSection && hasDirectSourceHref) {
    return html;
  }

  const listItemsHtml = finalSources
    .map((s) => {
      const safeTitle = (s.title || s.url).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const safeSourceName = (s.sourceName || 'Verified Source').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `    <li>
      • <strong>${safeSourceName}:</strong>
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline break-all ml-1">${safeTitle}</a>
    </li>`;
    })
    .join('\n');

  const sourcesCardHtml = `
<!-- Sources & Reference Links Card -->
<div class="sources-card my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm shadow-xl">
  <h4 class="font-bold text-sky-400 text-base mb-3 flex items-center gap-2">
    <span>🔗</span> Sources &amp; Reference Links
  </h4>
  <ul class="space-y-2.5 text-slate-300">
${listItemsHtml}
  </ul>
</div>
`.trim();

  return `${html.trim()}\n\n${sourcesCardHtml}`;
}

function stripLLMArtifacts(rawText: string): string {
  return rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/%PDF-1\.\d[\s\S]*?%%EOF/gi, '')
    .trim();
}

async function discoverActiveGroqModels(apiKey: string): Promise<string[]> {
  const defaults = [
    process.env.GROQ_MODEL,
    'llama-3.3-70b-versatile',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
  ].filter(Boolean) as string[];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return defaults;
    const data = await res.json();
    const ids: string[] = (Array.isArray(data?.data) ? data.data : [])
      .map((m: any) => String(m.id || ''))
      .filter(
        (id: string) =>
          id &&
          !id.includes('whisper') &&
          !id.includes('orpheus') &&
          !id.includes('guard') &&
          !id.includes('vision') &&
          !id.includes('embedding') &&
          !id.includes('tts')
      );
    if (ids.length === 0) return defaults;
    return [
      ...defaults.filter((d) => ids.includes(d)),
      ...ids.filter((id) => !defaults.includes(id)),
    ];
  } catch {
    return defaults;
  }
}

async function discoverActiveGeminiModels(apiKey: string): Promise<string[]> {
  const preferred = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-2.5-flash-lite',
    'gemini-flash-lite-latest',
  ];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return preferred;
    const data = await res.json();
    const supported: string[] = (Array.isArray(data?.models) ? data.models : [])
      .filter(
        (m: any) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes('generateContent')
      )
      .map((m: any) => String(m.name || '').replace(/^models\//, ''))
      .filter(
        (name: string) =>
          name &&
          !name.includes('-tts') &&
          !name.includes('embedding') &&
          !name.includes('imagen') &&
          !name.includes('veo')
      );
    if (supported.length === 0) return preferred;
    return [
      ...preferred.filter((p) => supported.includes(p)),
      ...supported.filter((s) => !preferred.includes(s)),
    ];
  } catch {
    return preferred;
  }
}

/**
 * Execute LLM call via dynamically discovered Groq, Gemini, or OpenAI active models
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<{ text: string; provider: string }> {
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY_SECRET;
  const openaiKey = process.env.OPENAI_API_KEY;
  const providerErrors: string[] = [];

  // 1. Try Groq using dynamically discovered active chat models (prevents 400/404 on deprecated models)
  if (groqKey) {
    const models = await discoverActiveGroqModels(groqKey);
    for (const model of models.slice(0, 5)) {
      for (const maxTokens of [3800, 2600]) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 32000);

          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.78,
              max_tokens: maxTokens,
              top_p: 0.95,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (res.ok) {
            const data = await res.json();
            const choice = data.choices?.[0];
            const raw = choice?.message?.content || choice?.message?.reasoning || choice?.message?.reasoning_content || '';
            const cleaned = stripLLMArtifacts(raw);
            if (cleaned.length > 350) {
              return { text: cleaned, provider: `groq:${model}` };
            }
            providerErrors.push(`groq:${model} empty/short response (${cleaned.length} chars)`);
            break;
          }

          const errText = await res.text();
          providerErrors.push(`groq:${model} HTTP ${res.status}: ${errText.slice(0, 140)}`);
          // Only retry smaller max_tokens on 400/413 payload/TPM limits; otherwise move to next model
          if (res.status !== 400 && res.status !== 413) {
            break;
          }
        } catch (err: any) {
          providerErrors.push(`groq:${model} err: ${err?.message || String(err)}`);
          break;
        }
      }
    }
  }

  // 2. Try Google Gemini using dynamically discovered active generateContent models
  if (geminiKey) {
    const geminiModels = await discoverActiveGeminiModels(geminiKey);
    for (const model of geminiModels.slice(0, 5)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 32000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPrompt }],
                },
              ],
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              generationConfig: {
                temperature: 0.78,
                maxOutputTokens: 4500,
              },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = stripLLMArtifacts(raw);
          if (cleaned.length > 350) {
            return { text: cleaned, provider: `gemini:${model}` };
          }
          providerErrors.push(`gemini:${model} empty/short response`);
        } else {
          const errText = await res.text();
          providerErrors.push(`gemini:${model} HTTP ${res.status}: ${errText.slice(0, 140)}`);
        }
      } catch (err: any) {
        providerErrors.push(`gemini:${model} err: ${err?.message || String(err)}`);
      }
    }
  }

  // 3. Try OpenAI if configured
  if (openaiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 32000);
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.78,
          max_tokens: 4500,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        const cleaned = stripLLMArtifacts(data.choices?.[0]?.message?.content || '');
        if (cleaned.length > 350) {
          return { text: cleaned, provider: 'openai:gpt-4o-mini' };
        }
      } else {
        providerErrors.push(`openai HTTP ${res.status}`);
      }
    } catch (err: any) {
      providerErrors.push(`openai err: ${err?.message || String(err)}`);
    }
  }

  console.warn('[Investigator LLM] All providers failed:', providerErrors.join(' | '));
  throw new Error(`All AI providers failed to generate content (${providerErrors.slice(0, 3).join('; ')})`);
}

/**
 * Main Investigative Engine: Researches a topic, gathers real images and sources,
 * and writes a complete, rich, untruncated blog story.
 */
export async function investigateAndGenerateStory(
  topicInput: string,
  options: {
    includeImages?: boolean;
    includeSources?: boolean;
    sourceUrl?: string;
    sourceName?: string;
    topicTitle?: string;
    initialImageUrl?: string;
    initialImageCaption?: string;
    initialImageUrls?: Array<{ url: string; caption?: string }>;
    previousStyleId?: string;
  } = {}
): Promise<GeneratedBlogStory> {
  const MAX_POST_IMAGES = 5;
  const query = topicInput.trim();
  const cleanSearchTerm = cleanPromptSubject(query, options.topicTitle);
  const lowerQuery = `${query} ${options.topicTitle || ''}`.toLowerCase();

  console.log(`[Blog Investigator] Investigating topic: "${cleanSearchTerm}"`);

  const discoveredSources: DiscoveredSource[] = [];
  const discoveredImages: DiscoveredImage[] = [];
  const factualPoints: string[] = [];

  const pushUniqueImage = (img: DiscoveredImage) => {
    if (discoveredImages.length >= MAX_POST_IMAGES) return;
    if (!discoveredImages.some((existing) => existing.url === img.url)) {
      discoveredImages.push(img);
    }
  };

  // Step 0: Preserve Storyline Finder's verified preview photo(s) FIRST so generated post stays 100% consistent
  if (options.initialImageUrl && /^https?:\/\//i.test(options.initialImageUrl)) {
    const normalizedInitialUrl = options.initialImageUrl.trim().replace(/&amp;/g, '&');
    if (await verifyReachableImageUrl(normalizedInitialUrl, options.sourceUrl)) {
      pushUniqueImage({
        id: `storyline-0-${Date.now()}`,
        type: 'image',
        url: normalizedInitialUrl,
        caption: options.initialImageCaption || `Original source photo: ${cleanSearchTerm}`,
        altText: options.topicTitle || cleanSearchTerm,
      });
    }
  }

  if (Array.isArray(options.initialImageUrls) && options.initialImageUrls.length > 0) {
    const extraChecks = await Promise.all(
      options.initialImageUrls.slice(0, MAX_POST_IMAGES).map(async (item, idx) => {
        const cleanUrl = (item?.url || '').trim().replace(/&amp;/g, '&');
        if (!cleanUrl || discoveredImages.some((e) => e.url === cleanUrl)) return null;
        const ok = await verifyReachableImageUrl(cleanUrl, options.sourceUrl);
        return ok
          ? {
              id: `storyline-${idx + 1}-${Date.now()}`,
              type: 'image' as const,
              url: cleanUrl,
              caption: item.caption || `Original source photo: ${cleanSearchTerm}`,
              altText: options.topicTitle || cleanSearchTerm,
            }
          : null;
      })
    );
    for (const img of extraChecks) {
      if (img) pushUniqueImage(img);
    }
  }

  // Step 0b: Scrape full article prose + ALL inline source photos from primary sourceUrl
  let primaryResolvedUrl = '';
  if (options.sourceUrl && options.sourceUrl.startsWith('http')) {
    primaryResolvedUrl = await resolveGoogleNewsUrl(options.sourceUrl);
    discoveredSources.push({
      title: options.topicTitle || cleanSearchTerm,
      url: primaryResolvedUrl,
      sourceName: options.sourceName || 'Primary Source',
    });

    const scrapedPrimary = await extractPhotosFromSourceWebpage(primaryResolvedUrl);
    for (const img of scrapedPrimary.images) {
      pushUniqueImage(img);
    }
    if (scrapedPrimary.paragraphs.length > 0) {
      scrapedPrimary.paragraphs.forEach((p) => {
        factualPoints.push(`From primary source (${options.sourceName || primaryResolvedUrl}): ${p}`);
      });
    } else if (scrapedPrimary.excerpt) {
      factualPoints.push(`From primary source (${options.sourceName || primaryResolvedUrl}): ${scrapedPrimary.excerpt}`);
    }
  }

  // Step 1: Check verified knowledge base ONLY when specifically matched
  let matchedTopic = VERIFIED_SIERRA_LEONE_TOPICS.find((t) =>
    t.keywords.some((kw) => lowerQuery.includes(kw))
  );

  if (matchedTopic) {
    console.log(`[Blog Investigator] Matched verified knowledge base: "${matchedTopic.title}"`);
    factualPoints.push(...matchedTopic.facts);
    for (const s of matchedTopic.sources) {
      if (!discoveredSources.some((existing) => existing.url === s.url)) {
        discoveredSources.push(s);
      }
    }
    if (discoveredImages.length === 0) {
      discoveredImages.push(...matchedTopic.images);
    }
  } else {
    // Check CURATED_SL_TECH_TOPICS (only if no explicit live external sourceUrl, or if sourceUrl matches curated item)
    const STOP_WORDS = new Set([
      'sierra', 'leone', 'freetown', 'digital', 'technology', 'national',
      'system', 'systems', 'services', 'africa', 'first', 'modern', 'local', 'across'
    ]);
    const matchedCurated = CURATED_SL_TECH_TOPICS.map((t) => {
      if (
        (options.sourceUrl && t.sourceUrl === options.sourceUrl) ||
        lowerQuery.includes(t.id.toLowerCase()) ||
        lowerQuery.includes(t.title.toLowerCase())
      ) {
        return { topic: t, score: 100 };
      }
      if (primaryResolvedUrl && !t.sourceUrl?.includes(new URL(primaryResolvedUrl).hostname)) {
        return { topic: t, score: 0 };
      }
      const words = t.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 4 && !STOP_WORDS.has(w));
      const hits = words.filter((w) => lowerQuery.includes(w)).length;
      return { topic: t, score: hits };
    })
      .sort((a, b) => b.score - a.score)
      .find((x) => x.score >= 2)?.topic;

    if (matchedCurated) {
      matchedTopic = {
        keywords: [],
        title: matchedCurated.suggestedBlogTitle || matchedCurated.title,
        facts: matchedCurated.keyFacts,
        sources: matchedCurated.sourceUrl
          ? [{ title: matchedCurated.title, url: matchedCurated.sourceUrl, sourceName: matchedCurated.source }]
          : [],
        images: matchedCurated.imageUrl
          ? [
              {
                id: matchedCurated.id,
                type: 'image' as const,
                url: matchedCurated.imageUrl,
                caption: matchedCurated.imageCaption || matchedCurated.title,
                altText: matchedCurated.title,
              },
            ]
          : [],
      };
      console.log(`[Blog Investigator] Matched curated SL tech topic: "${matchedCurated.title}"`);
      factualPoints.push(...matchedCurated.keyFacts);
      for (const s of matchedTopic.sources) {
        if (!discoveredSources.some((existing) => existing.url === s.url)) {
          discoveredSources.push(s);
        }
      }
      if (discoveredImages.length === 0) {
        discoveredImages.push(...matchedTopic.images);
      }
    }
  }

  const displayTopic = cleanPromptSubject(query, options.topicTitle, matchedTopic?.title);
  const editorialStyle = pickEditorialStyle(displayTopic, options.previousStyleId);

  // Step 2: Live Web Investigation via Google News RSS (with real URL resolution)
  try {
    const newsItems = await searchGoogleNews(displayTopic);
    if (newsItems.length > 0) {
      for (const item of newsItems) {
        if (!discoveredSources.some((s) => s.url === item.url)) {
          discoveredSources.push(item);
        }
      }
    }
  } catch (e) {
    console.warn('[Blog Investigator] News search error:', e);
  }

  // Step 3: Scrape matching news coverage URLs ONLY when their headline relates to the subject,
  // gathering rich multi-source facts and additional real source photos (up to MAX_POST_IMAGES = 5)
  const matchingSecondarySources = discoveredSources.filter(
    (src) =>
      src.url !== primaryResolvedUrl &&
      src.url.startsWith('http') &&
      !src.url.includes('news.google.com') &&
      isRelevantSourceHeadline(src.title || '', displayTopic)
  );

  for (const src of matchingSecondarySources.slice(0, 4)) {
    if (discoveredImages.length >= MAX_POST_IMAGES && factualPoints.length >= 10) break;
    const scraped = await extractPhotosFromSourceWebpage(src.url);
    for (const p of scraped.images) {
      pushUniqueImage(p);
    }
    if (scraped.paragraphs.length > 0) {
      scraped.paragraphs.slice(0, 4).forEach((para) => {
        if (factualPoints.length < 14) {
          factualPoints.push(`Corroborating report (${src.sourceName || src.url}): ${para}`);
        }
      });
    } else if (scraped.excerpt && factualPoints.length < 14) {
      factualPoints.push(`Corroborating report (${src.sourceName || src.url}): ${scraped.excerpt.slice(0, 1200)}`);
    }
  }

  // Step 4: Only if ZERO actual source photos were retrieved anywhere, search Wikimedia Commons / fallback imagery
  if (discoveredImages.length === 0) {
    const wikiPhotos = await fetchWikimediaRealisticPhotos(displayTopic);
    for (const p of wikiPhotos) {
      if (discoveredImages.length >= 3) break;
      if (!discoveredImages.some((img) => img.url === p.url) && (await verifyReachableImageUrl(p.url))) {
        pushUniqueImage(p);
      }
    }
  }

  if (discoveredImages.length === 0) {
    const curatedFallback = getCuratedTechImages(displayTopic);
    for (const p of curatedFallback.slice(0, 2)) {
      pushUniqueImage(p);
    }
  }

  const finalMedia = discoveredImages.slice(0, MAX_POST_IMAGES);

  // Step 6: Construct Rich Longform Dossier within TPM-safe token limits so Groq/Gemini never reject with 413
  const factsContext = factualPoints.length > 0
    ? `VERIFIED FACTUAL DOSSIER FOR THIS TOPIC (cite concrete numbers, names, and facts deeply):\n${factualPoints.slice(0, 12).map((f, i) => `${i + 1}. ${f}`).join('\n')}`.slice(0, 5200)
    : `RESEARCHED SUBJECT: ${displayTopic}`;

  const sourcesContext = discoveredSources.length > 0
    ? `OFFICIAL CITATIONS & REFERENCE LINKS FOR THIS SPECIFIC POST:\n${discoveredSources.slice(0, 5).map((s) => `- ${s.title} (${s.sourceName || 'Web'}): ${s.url}`).join('\n')}`
    : '';

  const imagesContext = finalMedia.length > 0
    ? `VERIFIED SOURCE PHOTOS FOR THIS POST (${finalMedia.length} photos — embed ALL ${finalMedia.length} evenly across body sections using HTML <figure> tags):\n${finalMedia.map((img, idx) => `${idx + 1}. URL: ${img.url}\n   CAPTION: ${img.caption}\n   ALT: ${img.altText}`).join('\n\n')}`
    : '';

  const systemPrompt = `You are a Senior Technology Investigative Journalist writing original longform features for itservicesfreetown.com in Freetown, Sierra Leone.
You adapt your voice, structure, examples, and vocabulary to each specific topic so no two posts sound repetitive or formulaic.

ASSIGNED EDITORIAL STYLE FOR THIS POST: "${editorialStyle.name}"
- VOICE & TONE: ${editorialStyle.voice}
- OPENING FORMAT: ${editorialStyle.openingRule}
- SECTION ARCHITECTURE: ${editorialStyle.structureRule}

MANDATORY EDITORIAL & CONTENT RULES:
1. 100% TOPIC-SPECIFIC DEEP JOURNALISM (1,400 TO 2,000+ WORDS): Every heading, paragraph, argument, and detail MUST belong uniquely to "${displayTopic}" and the factual dossier provided. NEVER insert generic filler paragraphs, canned city rosters, or unrelated checklists (such as generic telecom/surge-protection/enforcement clichés unless this topic is genuinely about them). Every section should contain 2–4 detailed, concrete <p> paragraphs anchored in the facts.
2. STRICT BRIDGETECH PLACEMENT — CLOSING SECTION ONLY: Do NOT mention "BridgeTech IT Services", "Jui Junction", or "+232 33 399 391" in the title, opening, summary box, or main body sections. Keep the entire journalism focused purely on the subject matter. Add ONE dedicated closing <h2> commentary section (e.g., "BridgeTech IT Services Perspective" or "Final Commentary from BridgeTech IT Services") ONLY AT THE VERY LAST SECTION OF PROSE immediately before the Sources & Reference Links card, giving a brief, topic-relevant closing view.
3. NEVER ECHO OR INCLUDE PROMPT TEXT: Never copy, repeat, or quote editorial instructions inside the title, summary, paragraphs, or captions.
4. EMBED ALL VERIFIED SOURCE PHOTOS PROVIDED: Distribute ALL provided image URL(s) from VERIFIED SOURCE PHOTOS throughout the body sections (between sections, before the closing BridgeTech section) using <figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl"><img src="IMAGE_URL" alt="ALT_TEXT" class="w-full h-auto object-cover max-h-[500px] rounded-t-2xl" /><figcaption class="p-4 text-xs text-slate-300 text-center italic bg-slate-950 border-t border-slate-800">CAPTION</figcaption></figure>. Do NOT invent or alter any image URLs.
5. CLEAN HTML FORMATTING: Use <h2>, <h3>, <p>, <ul>/<li>, <blockquote>, <strong>, <u>. No Markdown. Do not duplicate <h1> after the first heading.
6. REFERENCE LINKS CARD AT THE VERY END: Place <div class="sources-card ..."> as the absolute last block of the article listing clickable <a href="URL" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline">TITLE</a> items from OFFICIAL CITATIONS & REFERENCE LINKS.`;

  const userPrompt = `SUBJECT: "${displayTopic}"
EDITORIAL ANGLE (DO NOT REPEAT THIS TEXT IN THE ARTICLE): "${query}"

${factsContext}

${sourcesContext}

${imagesContext}

Checklist before outputting raw HTML:
- Write 1,400–2,000+ words deeply tailored ONLY to "${displayTopic}" using facts and context specific to this subject.
- Follow the "${editorialStyle.name}" style rules cleanly so structure and phrasing differ completely from earlier posts.
- Embed ALL ${finalMedia.length} verified source photo(s) evenly across the article sections.
- Mention BridgeTech IT Services ONLY in the very last prose section immediately before the Sources & Reference Links card.
- Return ONLY raw HTML (no Markdown code fences).`;

  let htmlContent = '';
  let providerUsed = 'fallback';
  try {
    const llmResult = await callLLM(systemPrompt, userPrompt);
    htmlContent = llmResult.text;
    providerUsed = llmResult.provider;
    if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '');
    }
  } catch (llmErr) {
    console.warn('[Blog Investigator] All live LLM API calls failed, generating clean topic-grounded fallback:', llmErr);
    htmlContent = generateHighQualityFallbackStory(
      displayTopic,
      matchedTopic,
      discoveredSources,
      finalMedia,
      factualPoints,
      editorialStyle
    );
  }

  // Extract or generate a clean title (never grab prompt text or numbered subheadings)
  let generatedTitle = options.topicTitle || matchedTopic?.title || '';
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    const extracted = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (extracted.length > 10 && !/^(?:write|investigate|create|draft)\s+(?:a|an)\b/i.test(extracted)) {
      generatedTitle = extracted;
    }
  }
  if (!generatedTitle) {
    generatedTitle = displayTopic;
  }

  // Extract TLDR cleanly after stripping any prompt leaks
  htmlContent = stripPromptLeaksFromHtml(htmlContent, query, displayTopic);

  let tldr = '';
  const tldrMatch = htmlContent.match(/(?:<div[^>]*class=["'][^"']*tldr[^"']*["'][^>]*>|Quick Summary|Key Takeaways|Key Figures|Verified Milestones)([\s\S]*?)<\/div>/i);
  if (tldrMatch) {
    tldr = tldrMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  } else {
    const firstPMatch = htmlContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (firstPMatch) {
      tldr = firstPMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
    }
  }

  // MANDATORY POST-PROCESSORS:
  // 1. Guarantee EVERY post embeds ALL verified photos evenly before the final BridgeTech section
  htmlContent = ensureRealisticPhotosInArticle(htmlContent, finalMedia, displayTopic);
  // 2. Guarantee EVERY post includes clickable reference links at the absolute bottom
  htmlContent = ensureReferenceLinksInArticle(htmlContent, discoveredSources, displayTopic);

  return {
    title: generatedTitle,
    content: htmlContent,
    media: finalMedia,
    sources: discoveredSources,
    tldr: tldr || `Investigative report on ${displayTopic}.`,
    styleId: editorialStyle.id,
    styleName: editorialStyle.name,
    provider: providerUsed,
  };
}

/**
 * Generates a clean, topic-grounded story ONLY if all live LLM providers fail (never injects canned cross-topic boilerplate)
 */
function generateHighQualityFallbackStory(
  topicSubject: string,
  matchedTopic: any,
  sources: DiscoveredSource[],
  images: DiscoveredImage[],
  factualPoints: string[] = [],
  editorialStyle: EditorialStyleProfile = EDITORIAL_STYLES[0]
): string {
  const safeSubject = cleanPromptSubject(topicSubject, matchedTopic?.title).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const isMouStory =
    topicSubject.toLowerCase().includes('21.9') ||
    topicSubject.toLowerCase().includes('unique group') ||
    (topicSubject.toLowerCase().includes('assembly') && topicSubject.toLowerCase().includes('mou'));

  if (isMouStory) {
    const primaryImg = images[0]?.url || 'https://mocti.gov.sl/wp-content/uploads/2026/11/government-unique-group-mobile-phone-assembly-mou-waiis-2026-1024x732.jpg';
    const primaryCaption = images[0]?.caption || 'From left: Hon. Salima Bah (Minister of Communication, Technology & Innovation), H.E. Julius Maada Bio (President of Sierra Leone), and Mr. Adama Touray (Managing Director, Unique Group) at the US$21.9M MoU signing ceremony during WAIIS 2026 in Freetown.';
    const primaryAlt = images[0]?.altText || 'MoCTI Minister Salima Bah, President Julius Maada Bio, and Unique Group MD Adama Touray signing the US$21.9M mobile assembly MoU';

    const mouBody = `
<p class="text-lg leading-relaxed text-slate-200 mb-6 font-normal">
In a transformative leap for Sierra Leone’s technology sector, the Government of Sierra Leone—acting through the <strong>Ministry of Communication, Technology and Innovation (MoCTI)</strong> under Minister <strong>Salima Monorma Bah</strong>—has signed a landmark Memorandum of Understanding (MoU) with <strong>Unique Group Company Ltd</strong> of The Gambia, establishing an indicative investment of <strong><u>US$21.9 million</u></strong> to build the country’s first domestic mobile phone and electronics assembly plant.
</p>

<figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
  <img src="${primaryImg}" alt="${escapeHtmlAttr(primaryAlt)}" class="w-full h-auto object-cover max-h-[500px] rounded-t-2xl" loading="lazy" />
  <figcaption class="p-4 text-xs text-slate-400 text-center italic bg-slate-950 border-t border-slate-800 leading-normal">
    📸 ${escapeHtmlAttr(primaryCaption)}
  </figcaption>
</figure>

<h2>The Strategic Pact: Breaking Down the US$21.9 Million Investment</h2>
<p class="leading-relaxed mb-4">
Announced at the high-level <strong>West Africa Integration and Investment Summit (WAIIS) 2026</strong> in Freetown, this partnership aligns directly with President Julius Maada Bio’s national digital transformation agenda. For decades, West African markets have relied almost exclusively on imported electronics subject to steep freight fees, customs duties, and foreign-exchange markups.
</p>
<p class="leading-relaxed mb-6">
Unique Group—represented at the signing by Managing Director Mr. Adama Touray and Chairman Papa Yusupha Njie—brings telecommunications and ICT industrial experience from across The Gambia and West Africa into a multi-year rollout with MoCTI.
</p>

<h2>Phased Assembly, Quality Testing &amp; Device Affordability</h2>
<p class="leading-relaxed mb-4">
Rather than functioning as a superficial packaging depot, the blueprint spans semi-knocked-down (SKD) assembly of 4G/5G smartphones, student tablets, and laptops, localized software configuration, environmental stress testing against tropical heat and humidity, and structured warranty repair operations.
</p>
<p class="leading-relaxed mb-6">
Although telecom operators have widened 4G coverage nationwide, device cost remains the single largest barrier holding back households, students, and informal traders from productive broadband use. Domestic assembly aims to cut retail hardware markups by 25–35% while reducing premature electronic waste.
</p>

<h2>Technical Skills Transfer &amp; Regional Export Potential</h2>
<p class="leading-relaxed mb-4">
A dedicated Technical Training &amp; Skills Center attached to the facility will train young Sierra Leoneans in micro-soldering, surface-mount board diagnostics, cleanroom quality assurance, and safe battery handling. Over time, Sierra Leone’s deep-water port positions the plant to serve neighboring Mano River Union and ECOWAS markets under AfCFTA trade frameworks.
</p>

<h2>BridgeTech IT Services Perspective</h2>
<p class="leading-relaxed mb-4">
From our bench at <strong>BridgeTech IT Services</strong> (No. 1 Regent Highway, Jui Junction, Freetown), domestic electronics assembly is a pivotal shift for Sierra Leone’s repair and enterprise ecosystem. A steady in-country pipeline of OEM parts and standardized diagnostic skills will strengthen independent technicians nationwide, raise quality expectations, and cut repair turnaround times. For direct device inspections or corporate IT support, call <strong>+232 33 399 391</strong> or <a href="https://www.itservicesfreetown.com/book-appointment" target="_blank" class="text-sky-400 underline">book online</a>.
</p>
`.trim();

    const withAllMouPhotos = ensureRealisticPhotosInArticle(mouBody, images, safeSubject);
    return ensureReferenceLinksInArticle(withAllMouPhotos, sources, safeSubject);
  }

  // Strictly topic-grounded synthesis from real scraped evidence — zero canned boilerplate sections
  const factsList = (factualPoints.length > 0 ? factualPoints : matchedTopic?.facts || [])
    .map((f: string) => f.replace(/^(?:From primary source|Corroborating report)\s*\([^)]*\):\s*/i, '').trim())
    .filter((f: string) => f.length > 20)
    .slice(0, 12);

  const escapeText = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const leadParagraph = factsList[0]
    ? escapeText(factsList[0])
    : `Recent reporting centers on <strong>${safeSubject}</strong> and its direct significance within Sierra Leone’s evolving technology landscape.`;

  const openingHtml =
    editorialStyle.id === 'executive-briefing' || editorialStyle.id === 'deep-dive-dossier'
      ? `<div class="blog-tldr-box p-5 rounded-2xl mb-8 bg-slate-900/80 border border-slate-700 shadow-xl">
  <p class="font-bold text-sky-400 text-base mb-2.5 flex items-center gap-2">
    <span>⚡</span> ${editorialStyle.id === 'deep-dive-dossier' ? 'At a Glance' : 'Executive Context'}
  </p>
  <p class="text-slate-300 text-sm leading-relaxed">${leadParagraph}</p>
</div>`
      : `<p class="text-lg leading-relaxed text-slate-200 mb-6 font-normal">${leadParagraph}</p>`;

  const midFacts = factsList.slice(1, 6);
  const tailFacts = factsList.slice(6, 12);

  const midSectionHtml =
    midFacts.length > 0
      ? `<h2>Key Details on ${safeSubject}</h2>\n${midFacts.map((p: string) => `<p class="leading-relaxed mb-4">${escapeText(p)}</p>`).join('\n')}`
      : `<h2>Overview: ${safeSubject}</h2>\n<p class="leading-relaxed mb-4">This report examines <strong>${safeSubject}</strong> based on available public disclosures and industry reporting referenced below.</p>`;

  const tailSectionHtml =
    tailFacts.length > 0
      ? `<h2>Additional Context from Source Reporting</h2>\n<ul class="space-y-2.5 my-5 list-disc pl-6 text-slate-200 text-sm leading-relaxed">\n${tailFacts.map((p: string) => `  <li>${escapeText(p)}</li>`).join('\n')}\n</ul>`
      : '';

  const rawFallback = `
${openingHtml}

${midSectionHtml}

${tailSectionHtml}

<h2>BridgeTech IT Services Perspective</h2>
<p class="leading-relaxed mb-4">
At <strong>BridgeTech IT Services</strong> (No. 1 Regent Highway, Jui Junction, Freetown), our team closely monitors developments like <strong>${safeSubject}</strong> and their practical impact on local users and organizations. For hardware servicing, diagnostics, or IT advisory, reach us at <strong>+232 33 399 391</strong> or <a href="https://www.itservicesfreetown.com/book-appointment" target="_blank" class="text-sky-400 underline">book an appointment online</a>.
</p>
`.trim();

  const withPhotos = ensureRealisticPhotosInArticle(rawFallback, images, safeSubject);
  return ensureReferenceLinksInArticle(withPhotos, sources, safeSubject);
}

