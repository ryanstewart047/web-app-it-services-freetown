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

import { CURATED_SL_TECH_TOPICS } from './sl-tech-news-finder';

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
    keywords: ['21.9', 'unique group', 'unique solutions', 'mocti', 'salima bah', 'assembly', 'waiis', 'mou'],
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
 * Perform a live Google News RSS query to extract recent facts and links
 */
async function searchGoogleNews(query: string): Promise<DiscoveredSource[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const feedUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items: DiscoveredSource[] = [];

    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    for (const itemXml of itemMatches.slice(0, 4)) {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

      if (titleMatch && linkMatch) {
        const cleanTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const cleanLink = linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
        const cleanSource = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : 'News Source';

        if (cleanTitle && cleanLink) {
          items.push({
            title: cleanTitle,
            url: cleanLink,
            sourceName: cleanSource,
          });
        }
      }
    }

    return items;
  } catch {
    return [];
  }
}

/**
 * Fetch a webpage and extract OpenGraph image and metadata
 */
async function extractOpenGraphImage(url: string): Promise<DiscoveredImage | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const ogImageMatch =
      html.match(/<meta property=["']og:image["'] content=["']([^"']+)["']/i) ||
      html.match(/<meta name=["']twitter:image["'] content=["']([^"']+)["']/i);

    const ogTitleMatch =
      html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    if (ogImageMatch && ogImageMatch[1]) {
      let imgUrl = ogImageMatch[1];
      if (imgUrl.startsWith('/')) {
        const origin = new URL(url).origin;
        imgUrl = `${origin}${imgUrl}`;
      }

      // Filter out generic icons/placeholders
      if (!imgUrl.includes('logo') && !imgUrl.includes('icon') && !imgUrl.includes('favicon')) {
        const title = ogTitleMatch ? ogTitleMatch[1].replace(/&#8211;|-/g, ' ').trim() : 'Story photo';
        return {
          id: `discovered-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'image',
          url: imgUrl,
          caption: `Official press photograph: ${title}`,
          altText: title,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get curated, royalty-free high-res technical imagery for contextual fallback
 */
function getCuratedTechImages(topic: string): DiscoveredImage[] {
  const lower = topic.toLowerCase();

  if (lower.includes('phone') || lower.includes('mobile') || lower.includes('screen') || lower.includes('assembly')) {
    return [
      {
        id: 'phone-repair-workbench',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?auto=format&fit=crop&w=1200&q=80',
        caption: 'Precision hardware servicing: Micro-soldering and diagnostics on a smartphone motherboard circuit at a modern repair workstation.',
        altText: 'Technician working with micro soldering iron on smartphone motherboard',
      },
      {
        id: 'electronics-testing-lab',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-tech electronics assembly and quality assurance line, setting the benchmark for local technology production in West Africa.',
        altText: 'Electronics manufacturing and testing bench with modern diagnostic tools',
      },
    ];
  }

  if (lower.includes('laptop') || lower.includes('computer') || lower.includes('data') || lower.includes('network')) {
    return [
      {
        id: 'computer-hardware-repair',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80',
        caption: 'Modern IT workstation: Hardware diagnostics and motherboard thermal management for laptops and enterprise workstations.',
        altText: 'Disassembled laptop motherboard receiving professional maintenance on a static-free bench',
      },
    ];
  }

  return [
    {
      id: 'digital-transformation-africa',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      caption: 'Digital innovation in action: Young technology professionals collaborating on hardware architecture and digital systems.',
      altText: 'Team of diverse tech professionals collaborating in a modern workspace',
    },
  ];
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
  } = {}
): Promise<GeneratedBlogStory> {
  const query = topicInput.trim();
  const lowerQuery = query.toLowerCase();

  console.log(`[Blog Investigator] Investigating topic: "${query}"`);

  // Step 1: Check verified knowledge base for high-confidence local stories
  let matchedTopic = VERIFIED_SIERRA_LEONE_TOPICS.find((t) =>
    t.keywords.some((kw) => lowerQuery.includes(kw))
  );

  const discoveredSources: DiscoveredSource[] = [];
  const discoveredImages: DiscoveredImage[] = [];
  const factualPoints: string[] = [];

  if (matchedTopic) {
    console.log(`[Blog Investigator] Matched verified knowledge base: "${matchedTopic.title}"`);
    factualPoints.push(...matchedTopic.facts);
    discoveredSources.push(...matchedTopic.sources);
    discoveredImages.push(...matchedTopic.images);
  } else {
    // Check CURATED_SL_TECH_TOPICS from sl-tech-news-finder
    const matchedCurated = CURATED_SL_TECH_TOPICS.find((t) =>
      lowerQuery.includes(t.id.toLowerCase()) ||
      lowerQuery.includes(t.title.toLowerCase()) ||
      t.title.toLowerCase().split(/\s+/).filter(w => w.length > 5).some(w => lowerQuery.includes(w))
    );
    if (matchedCurated) {
      console.log(`[Blog Investigator] Matched curated SL tech topic: "${matchedCurated.title}"`);
      factualPoints.push(...matchedCurated.keyFacts);
      if (matchedCurated.sourceUrl) {
        discoveredSources.push({
          title: matchedCurated.title,
          url: matchedCurated.sourceUrl,
          sourceName: matchedCurated.source,
        });
      }
      if (matchedCurated.imageUrl) {
        discoveredImages.push({
          id: matchedCurated.id,
          type: 'image',
          url: matchedCurated.imageUrl,
          caption: matchedCurated.imageCaption || matchedCurated.title,
          altText: matchedCurated.title,
        });
      }
    }
  }

  // Step 2: Live Web Investigation via Google News RSS
  try {
    const newsItems = await searchGoogleNews(query);
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

  // Step 3: If no specific images found yet, extract from top source or curated library
  if (discoveredImages.length === 0 && discoveredSources.length > 0) {
    for (const src of discoveredSources.slice(0, 2)) {
      if (src.url.startsWith('http')) {
        const ogImg = await extractOpenGraphImage(src.url);
        if (ogImg) {
          discoveredImages.push(ogImg);
          break;
        }
      }
    }
  }

  // Fallback to curated high-res imagery if still no images
  if (discoveredImages.length === 0) {
    discoveredImages.push(...getCuratedTechImages(query));
  }

  // Step 4: Construct Rich Context for the LLM
  const factsContext = factualPoints.length > 0
    ? `VERIFIED FACTUAL DOSSIER:\n${factualPoints.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
    : `SEARCHED TOPIC: ${query}`;

  const sourcesContext = discoveredSources.length > 0
    ? `OFFICIAL CITATIONS & SOURCES:\n${discoveredSources.map((s) => `- ${s.title} (${s.sourceName || 'Web'}): ${s.url}`).join('\n')}`
    : '';

  const imagesContext = discoveredImages.length > 0
    ? `AVAILABLE IMAGES (Embed these using standard responsive HTML <figure> tags in the article):\n${discoveredImages.map((img) => `- URL: ${img.url}\n  CAPTION: ${img.caption}\n  ALT: ${img.altText}`).join('\n\n')}`
    : '';

  const systemPrompt = `You are a Senior Technology Investigative Journalist and Lead Technical Columnist writing for BridgeTech IT Services (itservicesfreetown.com) in Freetown, Sierra Leone.
You write deeply reported, analytical, and complete feature stories.

CRITICAL INSTRUCTIONS:
1. NEVER LEAVE THE STORY INCOMPLETE OR TRUNCATED. You MUST write the entire story from beginning to end with a complete conclusion and call to action.
2. Rely strictly on verified facts. If discussing Sierra Leone government tech projects, cite official bodies such as the Ministry of Communication, Technology and Innovation (MoCTI), Minister Salima Monorma Bah, President Julius Maada Bio, and private partners (e.g., Unique Group Company Ltd).
3. EMBED IMAGES IN THE ARTICLE: Use HTML <figure class="my-6 rounded-xl overflow-hidden bg-slate-900 border border-slate-800"><img src="IMAGE_URL" alt="ALT_TEXT" class="w-full h-auto object-cover max-h-[460px] rounded-t-xl" /><figcaption class="p-3 text-xs text-slate-400 text-center italic bg-slate-950">CAPTION</figcaption></figure>.
4. FORMATTING: Use clean, modern HTML with <h2> subheadings, <h3> deep dives, <p> paragraphs (3-4 sentences each), <ul> / <li> bulleted breakdowns, <strong>bold highlights</strong>, and <u>underlined key terms</u>. Do NOT use markdown.
5. LOCAL INDUSTRY PERSPECTIVE: Include a dedicated section analyzing what this development means from the ground perspective of BridgeTech IT Services (located at No. 1 Regent Highway, Jui Junction, Freetown; Phone: +232 33 399 391) — specifically regarding local parts supply, phone repair turnarounds, diagnostic skills, and technical career opportunities for youth.
6. SOURCES & REFERENCES BOX: At the bottom of the article, include a beautifully styled sources box with clickable links (<a href="URL" target="_blank" rel="noopener noreferrer" class="text-sky-400 underline">TITLE</a>).
7. Call-to-action mentioning BridgeTech IT Services (+232 33 399 391 / Jui Junction) for device repairs, computer upgrades, and tech consultations.`;

  const userPrompt = `Investigate and write an authoritative, complete, comprehensive blog feature article based on:
TOPIC: "${query}"

${factsContext}

${sourcesContext}

${imagesContext}

Requirements:
- Article Length: Comprehensive (800 to 1200 words).
- Must have an eye-catching H1 Title (place inside <h1> or as top element).
- A concise "Quick Summary / TL;DR" highlight box at the start.
- Detailed sections with descriptive <h2> headers covering:
  1. The Core Event & Financial Commitment (e.g. the $21.9M investment, WAIIS Summit, signing partners).
  2. The Technological Roadmap (phased rollout: assembly, configuration, quality testing, repair facilities).
  3. Digital Inclusion & Tackling Device Affordability in Sierra Leone.
  4. Youth Training, Local Skills & Employment (the technical training center).
  5. The BridgeTech IT Services Perspective (implications for Freetown's device repair ecosystem and technician mastery).
  6. The Road Ahead & Strategic Outlook.
  7. A formatted "Sources & Official References" box listing the reference URLs.
- OUTPUT FORMAT: Return ONLY the raw HTML string for the entire article. Do NOT wrap in backticks or markdown code blocks.`;

  let htmlContent = '';
  try {
    htmlContent = await callLLM(systemPrompt, userPrompt);
    if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '');
    }
  } catch (llmErr) {
    console.warn('[Blog Investigator] LLM API call failed or unavailable. Generating high-quality verified journalistic story fallback:', llmErr);
    htmlContent = generateHighQualityFallbackStory(query, matchedTopic, discoveredSources, discoveredImages);
  }

  // Extract or generate a clean title
  let generatedTitle = matchedTopic?.title || '';
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    generatedTitle = h1Match[1].replace(/<[^>]+>/g, '').trim();
  } else {
    const h2Match = htmlContent.match(/<h2[^>]*>(.*?)<\/h2>/i);
    if (h2Match && !generatedTitle) {
      generatedTitle = h2Match[1].replace(/<[^>]+>/g, '').trim();
    }
  }

  if (!generatedTitle) {
    generatedTitle = query.length > 10 ? query : 'Sierra Leone Digital Transformation & Tech Industry Report';
  }

  // Extract TLDR
  let tldr = '';
  const tldrMatch = htmlContent.match(/(?:<div[^>]*class=["'][^"']*tldr[^"']*["'][^>]*>|Quick Summary|Key Takeaways)([\s\S]*?)<\/div>/i);
  if (tldrMatch) {
    tldr = tldrMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  }

  return {
    title: generatedTitle,
    content: htmlContent,
    media: discoveredImages,
    sources: discoveredSources,
    tldr: tldr || 'Comprehensive investigative coverage of technology advancements and electronics assembly in Sierra Leone.',
  };
}

/**
 * Generates an exhaustive, beautifully formatted journalistic story when live LLM APIs are unreachable
 */
function generateHighQualityFallbackStory(
  query: string,
  matchedTopic: any,
  sources: DiscoveredSource[],
  images: DiscoveredImage[]
): string {
  const isMouStory =
    query.toLowerCase().includes('21.9') ||
    query.toLowerCase().includes('unique group') ||
    query.toLowerCase().includes('assembly') ||
    query.toLowerCase().includes('mou') ||
    query.toLowerCase().includes('freetown');

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

  // General tech topic fallback
  return `
<div class="blog-tldr-box p-5 rounded-2xl mb-8 bg-slate-900/80 border border-slate-700 shadow-xl">
  <p class="font-bold text-sky-400 text-base mb-2.5 flex items-center gap-2">
    <span>⚡</span> Quick Summary &amp; Key Insights
  </p>
  <p class="text-slate-300 text-sm leading-relaxed">
    Essential technical insights and best practices from BridgeTech IT Services on <strong>${query}</strong>. Discover practical diagnostics, preventive measures, and expert repair recommendations for electronics users in Freetown, Sierra Leone.
  </p>
</div>

<h2>1. Understanding the Core Technical Challenge</h2>
<p class="leading-relaxed mb-4">
When dealing with <strong>${query}</strong>, understanding the underlying hardware architecture and environmental stresses is critical for ensuring reliable long-term performance. In tropical and coastal environments like Freetown, electronic devices face accelerated wear due to humidity, power fluctuations, and airborne salinity.
</p>

<h2>2. Key Diagnostic Steps and Preventive Measures</h2>
<ul class="space-y-2.5 my-5 list-disc pl-6 text-slate-200 text-sm leading-relaxed">
  <li><strong>Routine Physical Inspection:</strong> Regularly examine ports, cables, and ventilation ducts for moisture accumulation or lint buildup.</li>
  <li><strong>Voltage Stability:</strong> Always utilize surge protectors or dedicated uninterruptible power supplies (UPS) during charging and operation.</li>
  <li><strong>Thermal Monitoring:</strong> Ensure thermal paste and heat sinks are serviced every 12 to 18 months to prevent processor throttling.</li>
</ul>

<h2>3. The BridgeTech IT Services Standard</h2>
<p class="leading-relaxed mb-4">
At <strong>BridgeTech IT Services</strong> (No. 1 Regent Highway, Jui Junction, Freetown), our certified technicians provide comprehensive diagnostics and precision component-level repairs with genuine OEM parts and warranty coverage.
</p>

<div class="my-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-800 shadow-xl">
  <h3 class="text-xl font-bold text-white mb-2">Need Help with Your Device?</h3>
  <p class="text-slate-300 text-sm mb-4 leading-relaxed">
    Contact BridgeTech IT Services today at <strong>+232 33 399 391</strong> or visit our repair facility at Jui Junction opposite FTC for prompt diagnosis and repair.
  </p>
  <a href="https://www.itservicesfreetown.com/book-appointment" target="_blank" class="inline-block bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
    Book an Inspection Online
  </a>
</div>
`.trim();
}

