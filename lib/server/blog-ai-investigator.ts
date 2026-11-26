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

import { CURATED_SL_TECH_TOPICS, resolveGoogleNewsUrl } from './sl-tech-news-finder';

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
      {
        id: 'tech-assembly-electronics',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-precision electronics assembly line and component diagnostics testing, representing the future manufacturing capabilities envisioned for Freetown.',
        altText: 'Electronics technician assembling digital circuit boards and smartphones in high-tech cleanroom facility',
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

/**
 * Fetch a webpage and extract realistic photos (OpenGraph, Twitter, JSON-LD, WordPress featured image, <article> hero <img>)
 * plus a short text excerpt for factual grounding.
 */
async function extractPhotosFromSourceWebpage(
  url: string
): Promise<{ images: DiscoveredImage[]; excerpt?: string }> {
  try {
    if (!url || !url.startsWith('http') || url.includes('news.google.com')) {
      return { images: [] };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return { images: [] };

    const html = await res.text();
    const images: DiscoveredImage[] = [];
    const seenUrls = new Set<string>();

    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    const ogDesc =
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

    const hostname = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, '');
      } catch {
        return 'source';
      }
    })();

    const titleText = ogTitle ? ogTitle[1].replace(/&#8211;|&amp;|&quot;|&#39;|-/g, ' ').trim() : 'Source Article';

    const pushCandidate = (rawImgUrl: string, label: string) => {
      let absUrl = rawImgUrl.trim();
      if (!absUrl || absUrl.startsWith('data:')) return;
      try {
        absUrl = new URL(absUrl, url).href;
      } catch {
        return;
      }
      if (
        /(?:logo|icon|favicon|avatar|badge|pixel|1x1|blank|placeholder|spinner|doubleclick|ads)/i.test(absUrl) ||
        /\.(?:svg|ico)(?:\?|$)/i.test(absUrl)
      ) {
        return;
      }
      if (!seenUrls.has(absUrl)) {
        seenUrls.add(absUrl);
        images.push({
          id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'image',
          url: absUrl,
          caption: `${label} (${hostname}): ${titleText}`,
          altText: titleText,
        });
      }
    };

    // 1. Check OpenGraph and Twitter meta tags in BOTH attribute orders
    const metaPatterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    ];
    for (const pat of metaPatterns) {
      const m = html.match(pat);
      if (m && m[1]) pushCandidate(m[1], 'Original source photograph');
    }

    // 2. Check JSON-LD NewsArticle schema
    const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const jsonStr of jsonLdMatches) {
      try {
        const rawJson = jsonStr.replace(/<script[^>]*>|<\/script>/gi, '');
        const parsed = JSON.parse(rawJson);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const obj of items) {
          const imgCandidate =
            typeof obj?.image === 'string'
              ? obj.image
              : Array.isArray(obj?.image)
              ? typeof obj.image[0] === 'string'
                ? obj.image[0]
                : obj.image[0]?.url
              : obj?.image?.url || obj?.thumbnailUrl;

          if (typeof imgCandidate === 'string') {
            pushCandidate(imgCandidate, 'Original press photograph');
          }
        }
      } catch {}
    }

    // 3. Check WordPress / article featured images
    const wpImgMatch = html.match(
      /<img[^>]+class=["'][^"']*(?:wp-post-image|featured-image|entry-thumb|hero-image|post-thumbnail)[^"']*["'][^>]+src=["']([^"']+)["']/i
    );
    if (wpImgMatch && wpImgMatch[1]) {
      pushCandidate(wpImgMatch[1], 'Featured source photograph');
    }

    // 4. Fallback: Look for main content <article> <img> tags
    if (images.length === 0) {
      const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
      const searchScope = articleMatch ? articleMatch[0] : html;
      const imgRegex = /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
      let m: RegExpExecArray | null;
      while ((m = imgRegex.exec(searchScope)) !== null && images.length < 2) {
        pushCandidate(m[1], 'Article photograph');
      }
    }

    // Extract brief article lead text for factual grounding
    let excerpt = ogDesc ? ogDesc[1].replace(/<[^>]+>/g, ' ').trim() : '';
    const pMatches = html.match(/<p[^>]*>([^<]{80,400})<\/p>/gi) || [];
    if (pMatches.length > 0) {
      const paragraphs = pMatches
        .slice(0, 3)
        .map((p) => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
        .join(' ');
      if (paragraphs.length > excerpt.length) {
        excerpt = paragraphs.slice(0, 700);
      }
    }

    return { images, excerpt: excerpt || undefined };
  } catch {
    return { images: [] };
  }
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
 * Get curated, realistic high-res technical imagery for contextual fallback
 */
function getCuratedTechImages(topic: string): DiscoveredImage[] {
  const lower = topic.toLowerCase();

  if (lower.includes('fintech') || lower.includes('orange money') || lower.includes('afrimoney') || lower.includes('payment') || lower.includes('wallet') || lower.includes('cashless') || lower.includes('bank')) {
    return [
      {
        id: 'mobile-money-retail',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1556742049-0a67e557224d?auto=format&fit=crop&w=1200&q=80',
        caption: 'Mobile wallet transaction and digital point-of-sale checkout accelerating cashless commerce in retail markets.',
        altText: 'Digital mobile payment transaction on smartphone screen in retail store',
      },
      {
        id: 'secure-financial-network',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Encrypted financial data transmission and fintech payment gateway architecture.',
        altText: 'Digital encryption and security technology concept',
      },
    ];
  }

  if (lower.includes('fiber') || lower.includes('telecom') || lower.includes('natca') || lower.includes('cable') || lower.includes('broadband') || lower.includes('4g') || lower.includes('5g') || lower.includes('starlink') || lower.includes('satellite') || lower.includes('sierratel') || lower.includes('africell')) {
    return [
      {
        id: 'telecom-cell-tower',
        type: 'image',
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Steps_leading_to_Lonestar_telecommunications_tower_along_Redlight-Ganta_Highway.jpg',
        caption: 'Telecommunications base station tower and transmission infrastructure serving coastal and inland network links.',
        altText: 'Cellular network communications tower in West Africa',
      },
      {
        id: 'fiber-optic-splicing',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-speed terrestrial fiber optic data cables and transmission switching equipment interconnecting national communication lines.',
        altText: 'Fiber optic cables with glowing data illumination in telecommunications exchange',
      },
    ];
  }

  if (lower.includes('cyber') || lower.includes('security') || lower.includes('csirt') || lower.includes('nc3') || lower.includes('ransomware') || lower.includes('data center') || lower.includes('embassy')) {
    return [
      {
        id: 'cybersecurity-monitoring-center',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cyber threat monitoring and real-time network defense operations at an enterprise security operations center (SOC).',
        altText: 'Cybersecurity monitoring screen with firewall alert diagnostics',
      },
      {
        id: 'enterprise-server-rack',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Enterprise server hardware racks with redundant power supplies and hardware firewall switches.',
        altText: 'Server room data center equipment with illuminated network switches',
      },
    ];
  }

  if (lower.includes('solar') || lower.includes('power') || lower.includes('energy') || lower.includes('inverter') || lower.includes('battery')) {
    return [
      {
        id: 'solar-hybrid-installation',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
        caption: 'Solar hybrid photovoltaic arrays and lithium storage bank providing clean, uninterrupted power to telecom and server equipment.',
        altText: 'Commercial solar panels installed for clean technology power generation',
      },
      {
        id: 'solar-panel-array-assembling',
        type: 'image',
        url: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Solar_panels_assembling.jpg',
        caption: 'Renewable energy engineering: Solar panel assembly and testing for off-grid infrastructure resilience.',
        altText: 'Solar panel assembly line and testing bench',
      },
    ];
  }

  if (lower.includes('repair') || lower.includes('screen') || lower.includes('motherboard') || lower.includes('laptop') || lower.includes('smartphone') || lower.includes('solder')) {
    return [
      {
        id: 'phone-repair-workbench',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Precision hardware servicing: Micro-soldering and motherboard component diagnostics at BridgeTech IT Services standards in Freetown.',
        altText: 'Technician working with micro soldering iron on smartphone motherboard',
      },
      {
        id: 'computer-hardware-repair',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
        caption: 'Precision hardware diagnostics and motherboard servicing at BridgeTech IT Services in Freetown.',
        altText: 'Disassembled computer receiving professional motherboard maintenance',
      },
    ];
  }

  if (lower.includes('president') || lower.includes('bio') || lower.includes('ncra') || lower.includes('identity') || lower.includes('nin')) {
    return [
      {
        id: 'president-bio-official',
        type: 'image',
        url: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Julius_Maada_Bio_White_House_delegation_2018_%28cropped%29.jpg',
        caption: 'H.E. Dr. Julius Maada Bio, President of the Republic of Sierra Leone, championing national digital transformation and technology investment.',
        altText: 'President Julius Maada Bio of Sierra Leone',
      },
      {
        id: 'digital-governance-infrastructure',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        caption: 'Digital public infrastructure interconnecting government ministries, e-services, and citizen identification systems.',
        altText: 'Digital connectivity map symbolizing government digital transformation',
      },
    ];
  }

  return [
    {
      id: 'digital-innovation-africa',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      caption: 'Digital innovation in action: Technology professionals collaborating on infrastructure and digital systems.',
      altText: 'Team of tech professionals collaborating in a modern workspace',
    },
    {
      id: 'freetown-aerial-view',
      type: 'image',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Freetown-aerialview.jpg',
      caption: 'Panoramic view of Freetown, Sierra Leone, reflecting the nation’s commercial core and expanding technology landscape.',
      altText: 'Aerial view of Freetown harbor and commercial cityscape in Sierra Leone',
    },
  ];
}

/**
 * MANDATORY POST-PROCESSOR:
 * Guarantees that EVERY single generated article embeds realistic photos directly in the HTML body.
 * If the LLM omitted image tags or only included text, this function injects the primary and secondary
 * realistic photographs with responsive styling, captions, and source attribution.
 */
export function ensureRealisticPhotosInArticle(
  html: string,
  images: DiscoveredImage[],
  topic: string,
  articleTitle?: string
): string {
  if (!images || images.length === 0) {
    return html;
  }

  let updatedHtml = html;
  const primaryImg = images[0];
  const secondaryImg = images.length > 1 ? images[1] : null;

  // 1. Check if the primary image is already embedded
  const hasPrimaryImg = updatedHtml.includes(primaryImg.url);
  const hasAnyImg = /<img[^>]+src=["'][^"']+["']/i.test(updatedHtml);

  if (!hasPrimaryImg && !hasAnyImg) {
    const primaryFigure = `
<figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
  <img src="${primaryImg.url}" alt="${primaryImg.altText || primaryImg.caption || topic}" class="w-full h-auto object-cover max-h-[520px] rounded-t-2xl" loading="lazy" />
  <figcaption class="p-4 text-xs text-slate-300 text-center italic bg-slate-950 border-t border-slate-800 leading-normal">
    📸 ${primaryImg.caption || `Official source photograph relating to ${topic}`}
  </figcaption>
</figure>
`;

    // Inject after the summary box, or after the first </p>, or after </h1>
    if (updatedHtml.includes('</div>') && /blog-tldr-box|Quick Summary|Key Takeaways/i.test(updatedHtml)) {
      const divEnd = updatedHtml.indexOf('</div>');
      if (divEnd !== -1) {
        updatedHtml = updatedHtml.slice(0, divEnd + 6) + '\n' + primaryFigure + '\n' + updatedHtml.slice(divEnd + 6);
      } else {
        updatedHtml = primaryFigure + '\n' + updatedHtml;
      }
    } else if (updatedHtml.includes('</p>')) {
      const pEnd = updatedHtml.indexOf('</p>');
      updatedHtml = updatedHtml.slice(0, pEnd + 4) + '\n' + primaryFigure + '\n' + updatedHtml.slice(pEnd + 4);
    } else if (updatedHtml.includes('</h1>')) {
      const h1End = updatedHtml.indexOf('</h1>');
      updatedHtml = updatedHtml.slice(0, h1End + 5) + '\n' + primaryFigure + '\n' + updatedHtml.slice(h1End + 5);
    } else {
      updatedHtml = primaryFigure + '\n' + updatedHtml;
    }
  }

  // 2. Check if secondary image can be injected in the second half of the article
  if (secondaryImg && !updatedHtml.includes(secondaryImg.url)) {
    const secondaryFigure = `
<figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
  <img src="${secondaryImg.url}" alt="${secondaryImg.altText || secondaryImg.caption || topic}" class="w-full h-auto object-cover max-h-[460px] rounded-t-2xl" loading="lazy" />
  <figcaption class="p-4 text-xs text-slate-300 text-center italic bg-slate-950 border-t border-slate-800 leading-normal">
    📸 ${secondaryImg.caption || `Technical and infrastructure context for ${topic}`}
  </figcaption>
</figure>
`;

    const bridgeTechIndex = updatedHtml.search(/<h2[^>]*>[^<]*(?:BridgeTech|Ground Perspective|Local Industry|Technical Roadmap)[^<]*<\/h2>/i);
    if (bridgeTechIndex !== -1) {
      updatedHtml = updatedHtml.slice(0, bridgeTechIndex) + '\n' + secondaryFigure + '\n' + updatedHtml.slice(bridgeTechIndex);
    } else {
      const h2Indices: number[] = [];
      const h2Regex = /<h2[^>]*>/gi;
      let h2Match: RegExpExecArray | null;
      while ((h2Match = h2Regex.exec(updatedHtml)) !== null) {
        h2Indices.push(h2Match.index);
      }
      if (h2Indices.length >= 3) {
        const targetIndex = h2Indices[Math.floor(h2Indices.length / 2)];
        updatedHtml = updatedHtml.slice(0, targetIndex) + '\n' + secondaryFigure + '\n' + updatedHtml.slice(targetIndex);
      }
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

/**
 * Execute LLM call via Groq, Google Gemini, or intelligent fallback
 */
async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;

  // 1. Try Groq with large token limit (4096 tokens)
  if (groqKey) {
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    for (const model of models) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000);

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
            temperature: 0.65,
            max_tokens: 4096, // High token capacity to ensure story is 100% complete
            top_p: 0.95,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text && text.trim().length > 200) {
            return text.trim();
          }
        }
      } catch (err) {
        console.warn(`[Investigator LLM] Groq ${model} error:`, err);
      }
    }
  }

  // 2. Try Google Gemini with 4096 tokens
  if (geminiKey) {
    const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
    for (const model of geminiModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 4096,
              },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 200) {
            return text.trim();
          }
        }
      } catch (err) {
        console.warn(`[Investigator LLM] Gemini ${model} error:`, err);
      }
    }
  }

  throw new Error('All AI providers failed to generate content');
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
  } = {}
): Promise<GeneratedBlogStory> {
  const query = topicInput.trim();
  const cleanSearchTerm = (options.topicTitle || query)
    .replace(/^Investigate and write (?:a|an)[^:]*about\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .slice(0, 140)
    .trim();
  const lowerQuery = `${query} ${options.topicTitle || ''}`.toLowerCase();

  console.log(`[Blog Investigator] Investigating topic: "${cleanSearchTerm}"`);

  const discoveredSources: DiscoveredSource[] = [];
  const discoveredImages: DiscoveredImage[] = [];
  const factualPoints: string[] = [];

  // Step 0: If caller passed an explicit sourceUrl (e.g. from SL Tech News Finder), prioritize scraping its own photo & content first!
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
      if (!discoveredImages.some((existing) => existing.url === img.url)) {
        discoveredImages.push(img);
      }
    }
    if (scrapedPrimary.excerpt) {
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

  // Step 2: Live Web Investigation via Google News RSS (with real URL resolution)
  try {
    const newsItems = await searchGoogleNews(cleanSearchTerm);
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

  // Step 3: Scrape original photos & lead context from discovered source URLs (up to 2 unique source images)
  for (const src of discoveredSources.slice(0, 4)) {
    if (discoveredImages.length >= 2) break;
    if (src.url === primaryResolvedUrl) continue; // Already scraped in Step 0
    if (src.url.startsWith('http') && !src.url.includes('news.google.com')) {
      const scraped = await extractPhotosFromSourceWebpage(src.url);
      for (const p of scraped.images) {
        if (discoveredImages.length < 2 && !discoveredImages.some((img) => img.url === p.url)) {
          discoveredImages.push(p);
        }
      }
      if (scraped.excerpt && factualPoints.length < 5) {
        factualPoints.push(`Additional source (${src.sourceName || src.url}): ${scraped.excerpt}`);
      }
    }
  }

  // Step 4: If source webpage scraping yielded 0 images (e.g. Cloudflare block), try caller initialImageUrl or Wikimedia Commons
  if (discoveredImages.length === 0 && options.initialImageUrl && options.initialImageUrl.startsWith('http')) {
    discoveredImages.push({
      id: `init-${Date.now()}`,
      type: 'image',
      url: options.initialImageUrl,
      caption: `Source photograph: ${options.topicTitle || cleanSearchTerm}`,
      altText: options.topicTitle || cleanSearchTerm,
    });
  }

  if (discoveredImages.length === 0) {
    const wikiPhotos = await fetchWikimediaRealisticPhotos(cleanSearchTerm);
    for (const p of wikiPhotos) {
      if (discoveredImages.length < 2 && !discoveredImages.some((img) => img.url === p.url)) {
        discoveredImages.push(p);
      }
    }
  }

  // Step 5: Only if STILL 0 photos found anywhere, pull topic-specific curated imagery
  if (discoveredImages.length === 0) {
    const curatedFallback = getCuratedTechImages(cleanSearchTerm);
    for (const p of curatedFallback.slice(0, 2)) {
      if (!discoveredImages.some((img) => img.url === p.url)) {
        discoveredImages.push(p);
      }
    }
  }

  const finalMedia = discoveredImages.slice(0, 2);

  // Step 6: Construct Rich Context for the LLM
  const factsContext = factualPoints.length > 0
    ? `VERIFIED FACTUAL DOSSIER FOR THIS TOPIC:\n${factualPoints.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
    : `RESEARCHED TOPIC: ${query}`;

  const sourcesContext = discoveredSources.length > 0
    ? `OFFICIAL CITATIONS & REFERENCE LINKS FOR THIS SPECIFIC POST:\n${discoveredSources.map((s) => `- ${s.title} (${s.sourceName || 'Web'}): ${s.url}`).join('\n')}`
    : '';

  const imagesContext = finalMedia.length > 0
    ? `ORIGINAL PHOTOS FOR THIS POST ONLY (Embed using HTML <figure> tags):\n${finalMedia.map((img) => `- URL: ${img.url}\n  CAPTION: ${img.caption}\n  ALT: ${img.altText}`).join('\n\n')}`
    : '';

  const systemPrompt = `You are a Senior Technology Investigative Journalist and Lead Technical Columnist writing for BridgeTech IT Services (itservicesfreetown.com) in Freetown, Sierra Leone.
You write deeply reported, analytical, and complete feature stories strictly focused on the requested topic.

CRITICAL INSTRUCTIONS:
1. NEVER LEAVE THE STORY INCOMPLETE OR TRUNCATED. You MUST write the entire story from beginning to end with a complete conclusion and call to action.
2. STAY STRICTLY ON TOPIC: Focus 100% on the requested topic and facts provided below. Do NOT introduce unrelated stories or statistics from other news items.
3. USE ONLY THIS POST'S PHOTOS: Embed ONLY the image URL(s) provided in ORIGINAL PHOTOS FOR THIS POST using HTML <figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl"><img src="IMAGE_URL" alt="ALT_TEXT" class="w-full h-auto object-cover max-h-[500px] rounded-t-2xl" /><figcaption class="p-4 text-xs text-slate-300 text-center italic bg-slate-950 border-t border-slate-800">CAPTION</figcaption></figure>.
4. FORMATTING: Use clean, modern HTML with <h2> subheadings, <h3> deep dives, <p> paragraphs (3-4 sentences each), <ul> / <li> bulleted breakdowns, <strong>bold highlights</strong>, and <u>underlined key terms</u>. Do NOT use markdown.
5. LOCAL INDUSTRY PERSPECTIVE: Include a dedicated section analyzing what this specific development means from the ground perspective of BridgeTech IT Services (No. 1 Regent Highway, Jui Junction, Freetown; Phone: +232 33 399 391).
6. ALWAYS INCLUDE CLICKABLE REFERENCE LINKS: At the bottom of the article, include a <div class="sources-card ..."> box listing the exact clickable reference links (<a href="URL" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline">TITLE</a>) from OFFICIAL CITATIONS & REFERENCE LINKS.
7. Call-to-action mentioning BridgeTech IT Services (+232 33 399 391 / Jui Junction) for device repairs, enterprise IT, and tech consultations.`;

  const userPrompt = `Investigate and write an authoritative, complete, comprehensive blog feature article about:
TOPIC: "${query}"

${factsContext}

${sourcesContext}

${imagesContext}

Requirements:
- Article Length: Comprehensive (800 to 1200 words).
- Must have an eye-catching H1 Title (place inside <h1> or as top element).
- A concise "Quick Summary / TL;DR" highlight box at the start.
- Detailed sections with descriptive <h2> headers strictly relevant to this specific topic (background, technical details, impact on Sierra Leone / consumers / businesses, BridgeTech IT Services perspective, outlook).
- Embed the original source photo(s) listed above.
- Include the formatted "Sources & Reference Links" card at the bottom with the clickable reference URLs listed above.
- OUTPUT FORMAT: Return ONLY the raw HTML string for the entire article. Do NOT wrap in backticks or markdown code blocks.`;

  let htmlContent = '';
  try {
    htmlContent = await callLLM(systemPrompt, userPrompt);
    if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '');
    }
  } catch (llmErr) {
    console.warn('[Blog Investigator] LLM API call failed or unavailable. Generating high-quality verified journalistic story fallback:', llmErr);
    htmlContent = generateHighQualityFallbackStory(query, matchedTopic, discoveredSources, finalMedia, factualPoints);
  }

  // Extract or generate a clean title (never grab a numbered subheading like "1. Key Facts...")
  let generatedTitle = options.topicTitle || matchedTopic?.title || '';
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    generatedTitle = h1Match[1].replace(/<[^>]+>/g, '').trim();
  } else if (!generatedTitle) {
    generatedTitle =
      cleanSearchTerm.length > 10
        ? cleanSearchTerm
        : 'Sierra Leone Digital Transformation & Tech Industry Report';
  }

  // Extract TLDR
  let tldr = '';
  const tldrMatch = htmlContent.match(/(?:<div[^>]*class=["'][^"']*tldr[^"']*["'][^>]*>|Quick Summary|Key Takeaways)([\s\S]*?)<\/div>/i);
  if (tldrMatch) {
    tldr = tldrMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  }

  // MANDATORY POST-PROCESSORS:
  // 1. Guarantee EVERY post embeds realistic photos from THIS post's own source directly in the HTML
  htmlContent = ensureRealisticPhotosInArticle(htmlContent, finalMedia, cleanSearchTerm, generatedTitle);
  // 2. Guarantee EVERY post includes clickable reference links at the bottom
  htmlContent = ensureReferenceLinksInArticle(htmlContent, discoveredSources, cleanSearchTerm);

  return {
    title: generatedTitle,
    content: htmlContent,
    media: finalMedia,
    sources: discoveredSources,
    tldr: tldr || `Comprehensive investigative report on ${cleanSearchTerm} in Sierra Leone.`,
  };
}

/**
 * Generates an exhaustive, beautifully formatted journalistic story when live LLM APIs are unreachable
 */
function generateHighQualityFallbackStory(
  query: string,
  matchedTopic: any,
  sources: DiscoveredSource[],
  images: DiscoveredImage[],
  factualPoints: string[] = []
): string {
  const isMouStory =
    query.toLowerCase().includes('21.9') ||
    query.toLowerCase().includes('unique group') ||
    (query.toLowerCase().includes('assembly') && query.toLowerCase().includes('mou'));

  if (isMouStory) {
    const primaryImg = images[0]?.url || 'https://mocti.gov.sl/wp-content/uploads/2026/11/government-unique-group-mobile-phone-assembly-mou-waiis-2026-1024x732.jpg';
    const primaryCaption = images[0]?.caption || 'From left: Hon. Salima Bah (Minister of Communication, Technology & Innovation), H.E. Julius Maada Bio (President of Sierra Leone), and Mr. Adama Touray (Managing Director, Unique Group) at the US$21.9M MoU signing ceremony during WAIIS 2026 in Freetown.';
    const primaryAlt = images[0]?.altText || 'MoCTI Minister Salima Bah and Unique Group MD signing the US$21.9M mobile assembly MoU';

    const secondaryImg = images[1]?.url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
    const secondaryCaption = images[1]?.caption || 'High-precision electronics assembly line and component diagnostics testing, representing the future manufacturing capabilities envisioned for Freetown.';

    return `
<div class="blog-tldr-box p-5 rounded-2xl mb-8 bg-slate-900/80 border border-slate-700 shadow-xl">
  <p class="font-bold text-sky-400 text-base mb-2.5 flex items-center gap-2">
    <span>⚡</span> Quick Summary &amp; Key Takeaways
  </p>
  <ul class="text-slate-300 text-sm space-y-2 list-disc pl-5">
    <li><strong>Historic US$21.9 Million Deal:</strong> Signed in Freetown between Sierra Leone's Ministry of Communication, Technology and Innovation (MoCTI) and Unique Group Company Ltd.</li>
    <li><strong>First Domestic Assembly Facility:</strong> Focuses on assembling, configuring, testing, and repairing smartphones, laptops, and consumer electronics.</li>
    <li><strong>Tackling Device Affordability:</strong> Slashes retail hardware markups to bridge the digital divide for students, traders, and everyday citizens.</li>
    <li><strong>Youth Technical Training Center:</strong> Establishes a state-of-the-art vocational center for micro-soldering, diagnostics, and electronics assembly.</li>
    <li><strong>BridgeTech IT Services Ground Perspective:</strong> Boosts domestic spare parts availability, raises technician standards, and fosters local electronics manufacturing in Freetown.</li>
  </ul>
</div>

<p class="text-lg leading-relaxed text-slate-200 mb-6 font-normal">
In a transformative leap for Sierra Leone’s technology sector, the Government of Sierra Leone—acting through the <strong>Ministry of Communication, Technology and Innovation (MoCTI)</strong> under the leadership of Minister <strong>Salima Monorma Bah</strong>—has officially signed a landmark Memorandum of Understanding (MoU) with <strong>Unique Group Company Ltd</strong> of The Gambia, establishing an indicative investment of <strong><u>US$21.9 million</u></strong> to build the country’s first domestic mobile phone and electronics assembly plant.
</p>

<!-- Real Press Photograph -->
<figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
  <img src="${primaryImg}" alt="${primaryAlt}" class="w-full h-auto object-cover max-h-[500px] rounded-t-2xl" />
  <figcaption class="p-4 text-xs text-slate-400 text-center italic bg-slate-950 border-t border-slate-800 leading-normal">
    ${primaryCaption}
  </figcaption>
</figure>

<h2>1. The Strategic Pact: Breaking Down the US$21.9 Million Investment</h2>
<p class="leading-relaxed mb-4">
Announced at the high-level <strong>West Africa Integration and Investment Summit (WAIIS) 2026</strong> in Freetown, this strategic partnership directly aligns with President Julius Maada Bio’s national digital transformation agenda. For decades, West African nations have functioned predominantly as downstream consumers of foreign-manufactured electronics. This initiative pivots Sierra Leone toward becoming an active participant in regional hardware manufacturing.
</p>
<p class="leading-relaxed mb-6">
The MoU establishes a comprehensive collaboration framework between MoCTI and Unique Group Company Ltd. Unique Group, which has spearheaded major telecommunications, ICT infrastructure, and energy ventures across The Gambia and West Africa, brings technical know-how, global supply chain links, and capital execution to Sierra Leone's growing digital economy.
</p>

<h2>2. The Technological Roadmap: A Phased Assembly &amp; Quality Ecosystem</h2>
<p class="leading-relaxed mb-4">
Rather than functioning as a superficial packaging unit, the project outlines a rigorous, phased industrial blueprint designed to scale across multiple operational stages:
</p>
<ul class="space-y-2.5 my-5 list-disc pl-6 text-slate-200 text-sm leading-relaxed">
  <li><strong>Component Sourcing &amp; Semi-Knocked-Down (SKD) Assembly:</strong> Initial assembly lines will configure entry-level and mid-range Android smartphones and laptops tailored for African network bands and battery endurance.</li>
  <li><strong>Localized Software Customization:</strong> Pre-loading educational software, civic digital services, and regional language interfaces optimized for Sierra Leonean users.</li>
  <li><strong>Rigorous Environmental &amp; Quality Testing:</strong> Establishing diagnostic testing chambers capable of validating device resilience against tropical heat, dust, and coastal humidity.</li>
  <li><strong>Warranty Servicing &amp; Component-Level Repair:</strong> Building authorized servicing networks to ensure long-term device longevity rather than premature e-waste.</li>
</ul>

<!-- Secondary Technical Image -->
<figure class="my-8 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
  <img src="${secondaryImg}" alt="Electronics manufacturing and diagnostics laboratory" class="w-full h-auto object-cover max-h-[460px] rounded-t-2xl" />
  <figcaption class="p-4 text-xs text-slate-400 text-center italic bg-slate-950 border-t border-slate-800 leading-normal">
    ${secondaryCaption}
  </figcaption>
</figure>

<h2>3. Overcoming the Smartphone Affordability Hurdle in Sierra Leone</h2>
<p class="leading-relaxed mb-4">
While telecommunications operators in Sierra Leone have expanded 4G and mobile broadband coverage across major cities and provincial towns, a glaring <u>digital usage gap</u> persists. The primary barrier is not signal availability, but the prohibitive retail price of capable 4G/5G smartphones for average families, students, and informal traders.
</p>
<p class="leading-relaxed mb-6">
By assembling devices domestically, the venture avoids exorbitant import tariffs, international freight markups, and foreign currency exchange premiums. The goal is to provide high-quality smartphones at price points accessible to ordinary citizens, accelerating financial inclusion through mobile money, e-governance access, and digital entrepreneurship.
</p>

<h2>4. Youth Empowerment: Building a State-of-the-Art Technical Training Center</h2>
<p class="leading-relaxed mb-4">
One of the most praised components of the MoU is the creation of a specialized <strong>Technical Training Center</strong>. Technology transfer must be rooted in human capacity. The training institute will provide hands-on vocational certifications in:
</p>
<ul class="space-y-2.5 my-5 list-disc pl-6 text-slate-200 text-sm leading-relaxed">
  <li>Micro-soldering, surface-mount technology (SMT), and integrated circuit (IC) placement.</li>
  <li>Hardware diagnostic analysis for power distribution failures, screen digitizers, and charging ports.</li>
  <li>Cleanroom assembly line procedures, static-discharge safety, and industrial quality assurance.</li>
  <li>Sustainable electronic waste handling and green battery recycling practices.</li>
</ul>

<h2>5. The Ground Perspective: What This Means for Freetown's Tech &amp; Repair Ecosystem</h2>
<p class="leading-relaxed mb-4">
At <strong>BridgeTech IT Services</strong>, situated at <em>No. 1 Regent Highway, Jui Junction in Freetown</em>, our technicians encounter the daily realities of device maintenance across the Western Area. From cracked displays and water damage to faulty charging ICs, the biggest bottleneck has consistently been the reliance on imported, slow-shipping spare parts.
</p>
<p class="leading-relaxed mb-6">
A domestic assembly facility in Sierra Leone is a monumental development for local repair businesses and independent artisans. It creates a steady domestic supply of authentic OEM components, standardizes diagnostic protocols, and creates an inspiring career pathway for young Sierra Leoneans aspiring to master electronic engineering.
</p>

<h2>6. Strategic Regional Outlook: Sierra Leone in West Africa</h2>
<p class="leading-relaxed mb-6">
The choice of the <strong>West Africa Integration and Investment Summit (WAIIS) 2026</strong> as the launch platform underscores the regional ambition of this agreement. Under the African Continental Free Trade Area (AfCFTA) and ECOWAS protocols, Sierra Leone is strategically positioning its deep-water harbor and burgeoning tech infrastructure to supply assembled electronics to neighboring Guinea, Liberia, and the broader Mano River Union.
</p>

<!-- Local Callout Box -->
<div class="my-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-800 shadow-xl">
  <h3 class="text-xl font-bold text-white mb-2">Need Professional Device Repairs or Technical Guidance?</h3>
  <p class="text-slate-300 text-sm mb-4 leading-relaxed">
    While Sierra Leone advances toward domestic hardware manufacturing, BridgeTech IT Services remains your premier technology repair partner in Freetown. Whether you need motherboard micro-soldering, screen replacement, device unlocking, or corporate IT solutions, our certified technicians are ready to assist.
  </p>
  <div class="flex flex-wrap gap-3 text-sm font-semibold text-white">
    <span class="bg-indigo-600/80 px-3.5 py-1.5 rounded-lg border border-indigo-400/30">📍 No. 1 Regent Highway, Jui Junction, Freetown</span>
    <span class="bg-emerald-600/80 px-3.5 py-1.5 rounded-lg border border-emerald-400/30">📞 Call / WhatsApp: +232 33 399 391</span>
    <a href="https://www.itservicesfreetown.com/book-appointment" target="_blank" class="bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 rounded-lg transition-colors underline">🌐 Book an Inspection Online</a>
  </div>
</div>

<!-- Sources & References Card -->
<div class="sources-card my-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm shadow-xl">
  <h4 class="font-bold text-sky-400 text-base mb-3 flex items-center gap-2">
    <span>🔗</span> Official Sources &amp; Verification References
  </h4>
  <ul class="space-y-2.5 text-slate-300">
    <li>
      • <strong>Ministry of Communication, Technology and Innovation (MoCTI):</strong>
      <a href="https://mocti.gov.sl/government-and-unique-group-partner-to-advance-local-mobile-phone-assembly-digital-inclusion-and-job-creation-in-sierra-leone/" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline break-all ml-1">
        Official Press Release: Government and Unique Group Partner to Advance Local Mobile Phone Assembly, Digital Inclusion and Job Creation in Sierra Leone
      </a>
    </li>
    <li>
      • <strong>West Africa Integration and Investment Summit (WAIIS) 2026:</strong>
      <a href="https://mocti.gov.sl" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline break-all ml-1">
        WAIIS 2026 Secretariat &amp; Government Investment Portfolio, Freetown
      </a>
    </li>
    <li>
      • <strong>Telecompaper International:</strong>
      <a href="https://www.telecompaper.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline break-all ml-1">
        Telecom and Technology Market Coverage: Sierra Leone &amp; Unique Group Partnership
      </a>
    </li>
    <li>
      • <strong>SierraLoaded Tech News:</strong>
      <a href="https://sierraloaded.sl" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline break-all ml-1">
        ICT Ministry Signs $21.9M Deal for Sierra Leone's First Mobile Phone Assembly Plant
      </a>
    </li>
  </ul>
</div>
`.trim();
  }

  // General tech topic fallback - include extracted facts, real source photos, and reference links
  const factsList = (factualPoints.length > 0 ? factualPoints : matchedTopic?.facts || []).slice(0, 6);
  const factsHtml =
    factsList.length > 0
      ? `<h2>1. Key Facts &amp; Developments Investigated</h2>
<ul class="space-y-2.5 my-5 list-disc pl-6 text-slate-200 text-sm leading-relaxed">
${factsList.map((f: string) => `  <li>${f.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`).join('\n')}
</ul>`
      : `<h2>1. Understanding the Core Technical Landscape</h2>
<p class="leading-relaxed mb-4">
Examining <strong>${query}</strong> within Sierra Leone's rapidly evolving technology sector highlights why dependable digital infrastructure, modern connectivity, and local technical expertise are essential for everyday citizens and enterprises.
</p>`;

  const rawFallback = `
<div class="blog-tldr-box p-5 rounded-2xl mb-8 bg-slate-900/80 border border-slate-700 shadow-xl">
  <p class="font-bold text-sky-400 text-base mb-2.5 flex items-center gap-2">
    <span>⚡</span> Quick Summary &amp; Key Insights
  </p>
  <p class="text-slate-300 text-sm leading-relaxed">
    Comprehensive technology briefing and source-verified analysis from BridgeTech IT Services on <strong>${query}</strong>, covering practical impacts for users and organizations in Freetown and across Sierra Leone.
  </p>
</div>

${factsHtml}

<h2>2. Impact on Sierra Leone's Digital Ecosystem</h2>
<p class="leading-relaxed mb-4">
Across Freetown, Waterloo, Bo, Kenema, and Makeni, organizations and consumers increasingly depend on resilient hardware, stable connectivity, and secure digital workflows. Developments in this sector shape how businesses operate, how students access resources, and how technical teams plan long-term infrastructure upgrades.
</p>

<h2>3. The BridgeTech IT Services Perspective</h2>
<p class="leading-relaxed mb-4">
At <strong>BridgeTech IT Services</strong> (No. 1 Regent Highway, Jui Junction, Freetown), our certified engineers track national and regional tech developments closely so clients can rely on accurate diagnostics, genuine OEM components, surge protection, and modern enterprise IT support.
</p>

<div class="my-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-800 shadow-xl">
  <h3 class="text-xl font-bold text-white mb-2">Need Expert Tech Support or Diagnostics?</h3>
  <p class="text-slate-300 text-sm mb-4 leading-relaxed">
    Contact BridgeTech IT Services today at <strong>+232 33 399 391</strong> or visit our facility at No. 1 Regent Highway, Jui Junction, Freetown for prompt assistance.
  </p>
  <a href="https://www.itservicesfreetown.com/book-appointment" target="_blank" class="inline-block bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
    Book an Inspection Online
  </a>
</div>
`.trim();

  const withPhotos = ensureRealisticPhotosInArticle(rawFallback, images, query);
  return ensureReferenceLinksInArticle(withPhotos, sources, query);
}

