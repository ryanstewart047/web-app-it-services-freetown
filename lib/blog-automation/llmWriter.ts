import { ScrapedArticle, GeneratedBlogDraft } from './types';

const PROHIBITED_WORDS = [
  'delve',
  'testament',
  'landscape',
  'revolutionizing',
  'fast-paced',
  'paramount',
  'look no further',
  'tapestry',
  'furthermore',
  'in conclusion',
];

const SYSTEM_PROMPT = `You are an expert technology journalist and SEO content strategist writing for a highly engaged, tech-savvy audience. Your goal is to transform raw tech news into a compelling, deeply insightful, and human-sounding blog post. Rely strictly on the facts provided in the raw source text. Do not invent timelines, statistics, or quotes.

STRICTLY PROHIBITED WORDS: delve, testament, landscape, revolutionizing, fast-paced, paramount, look no further, tapestry, furthermore, in conclusion.
SENTENCE STRUCTURE: Vary sentence length. Use punchy, short sentences for impact, followed by longer, more complex thoughts.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "metaTitle": "SEO Meta Title under 60 chars",
  "metaDescription": "SEO Meta Description under 150 chars compelling a click",
  "tldr": "2-3 crisp bullet points summarizing the news for AI search crawlers and fast readers",
  "h1Title": "Catchy Hook Title / H1",
  "bodyContent": "HTML string containing 3 to 4 sections with descriptive <h2> subheadings (e.g. <h2>Why This Matters</h2>, <h2>The Engineering Trade-Offs</h2>). Break up text with short paragraphs (no more than 3-4 sentences each). Use clean HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>.",
  "bottomLine": "HTML string for The Bottom Line / Final Thought <h2> section with a strong closing thought or open-ended question.",
  "editorNotes": "2-3 specific suggestions where the human editor can inject local context, internal links, or personal commentary."
}`;

function sanitizeProhibitedWords(text: string): string {
  let cleaned = text;
  for (const word of PROHIBITED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => {
      // Replace with natural synonyms
      if (/delve/i.test(match)) return 'examine';
      if (/testament/i.test(match)) return 'evidence';
      if (/landscape/i.test(match)) return 'sector';
      if (/revolutionizing/i.test(match)) return 'reshaping';
      if (/fast-paced/i.test(match)) return 'rapid';
      if (/paramount/i.test(match)) return 'vital';
      if (/look no further/i.test(match)) return 'here is what counts';
      if (/tapestry/i.test(match)) return 'network';
      if (/furthermore/i.test(match)) return 'also';
      if (/in conclusion/i.test(match)) return 'to wrap up';
      return '';
    });
  }
  return cleaned;
}

function parseCleanJson(raw: string): any {
  let text = raw.trim();
  // Strip markdown code fences if model returned ```json ... ```
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    // Attempt relaxed regex extraction
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw err;
  }
}

let cachedGeminiModels: string[] | null = null;
let lastGeminiFetch = 0;

/**
 * Dynamically fetch active Gemini models for this key to prevent 404s
 */
async function getActiveGeminiModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedGeminiModels && now - lastGeminiFetch < 3600000) {
    return cachedGeminiModels;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace(/^models\//, ''));

        if (supported.length > 0) {
          const preferredOrder = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-2.0-flash',
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash-8b',
            'gemini-1.0-pro',
            'gemini-pro',
          ];
          const sorted = [
            ...preferredOrder.filter((p) => supported.includes(p)),
            ...supported.filter((s: string) => !preferredOrder.includes(s)),
          ];
          console.log('[LLM Writer] Available Gemini models:', sorted.slice(0, 4));
          cachedGeminiModels = sorted;
          lastGeminiFetch = now;
          return sorted;
        }
      }
    }
  } catch (err: any) {
    console.warn('[LLM Writer] Model list query failed, using known safe defaults:', err.message);
  }

  return ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-pro'];
}

let cachedGroqModels: string[] | null = null;
let lastGroqFetch = 0;

/**
 * Dynamically fetch active Groq models for this key to avoid decommissioned models
 */
async function getActiveGroqModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedGroqModels && now - lastGroqFetch < 3600000) {
    return cachedGroqModels;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const ids: string[] = data.data
          .map((m: any) => m.id)
          .filter(
            (id: string) =>
              !id.includes('whisper') &&
              !id.includes('guard') &&
              !id.includes('vision') &&
              !id.includes('embedding') &&
              !id.includes('mixtral') // Avoid decommissioned mixtral
          );

        if (ids.length > 0) {
          const preferredOrder = [
            process.env.GROQ_MODEL,
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'llama-3.1-70b-versatile',
            'llama3-70b-8192',
            'llama3-8b-8192',
          ].filter(Boolean) as string[];

          const sorted = [
            ...preferredOrder.filter((p) => ids.includes(p)),
            ...ids.filter((i) => !preferredOrder.includes(i)),
          ];
          console.log('[LLM Writer] Available Groq models:', sorted.slice(0, 4));
          cachedGroqModels = sorted;
          lastGroqFetch = now;
          return sorted;
        }
      }
    }
  } catch (err: any) {
    console.warn('[LLM Writer] Groq model list failed, using known safe defaults:', err.message);
  }

  return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama-3.1-70b-versatile'];
}

/**
 * Call Google Gemini API with timeout and active models
 */
async function callGemini(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY_SECRET;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured in environment variables');
  }

  const models = await getActiveGeminiModels(apiKey);
  const errors: string[] = [];

  for (const model of models.slice(0, 4)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nIMPORTANT: Output MUST be strictly a single raw JSON object matching the requested schema without any markdown formatting or commentary.\n\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`${model} HTTP ${response.status}: ${errText.slice(0, 160)}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = parseCleanJson(rawText);
        if (parsed && (parsed.h1Title || parsed.bodyContent || parsed.title)) {
          console.log(`[LLM Writer] Gemini generated article successfully with ${model}`);
          return parsed;
        }
      }
      throw new Error(`${model} returned unparseable content`);
    } catch (err: any) {
      console.warn(`[LLM Writer] Gemini (${model}) failed:`, err.message);
      errors.push(err.message);
    }
  }

  throw new Error(`All Gemini models failed: ${errors.join('; ')}`);
}

/**
 * Call Groq API with timeout and active models
 */
async function callGroq(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in environment variables');
  }

  const models = await getActiveGroqModels(apiKey);
  const errors: string[] = [];

  for (const model of models.slice(0, 4)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const isJsonModeSupported = model.includes('llama');

      const bodyPayload: any = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      };

      if (isJsonModeSupported) {
        bodyPayload.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`${model} HTTP ${response.status}: ${errText.slice(0, 160)}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = parseCleanJson(rawText);
        if (parsed && (parsed.h1Title || parsed.bodyContent || parsed.title)) {
          console.log(`[LLM Writer] Groq generated article successfully with ${model}`);
          return parsed;
        }
      }
      throw new Error(`${model} returned unparseable content`);
    } catch (err: any) {
      console.warn(`[LLM Writer] Groq (${model}) failed:`, err.message);
      errors.push(err.message);
    }
  }

  throw new Error(`All Groq models failed: ${errors.join('; ')}`);
}

/**
 * Call OpenAI API (Safety fallback if both Gemini and Groq fail)
 */
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('Empty response from OpenAI');

  return parseCleanJson(rawText);
}

/**
 * Executes LLM generation with automatic bidirectional fallback between Gemini and Groq
 */
async function generateWithFallback(systemPrompt: string, userPrompt: string): Promise<any> {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY_SECRET
  );
  const hasGroq = Boolean(process.env.GROQ_API_KEY || process.env.GROQ_KEY);
  const preferGroq = process.env.PRIMARY_LLM?.toLowerCase() === 'groq';

  // Determine provider execution order
  const providers = preferGroq
    ? [
        { name: 'Groq', fn: () => callGroq(systemPrompt, userPrompt), available: hasGroq },
        { name: 'Gemini', fn: () => callGemini(systemPrompt, userPrompt), available: hasGemini },
      ]
    : [
        { name: 'Gemini', fn: () => callGemini(systemPrompt, userPrompt), available: hasGemini },
        { name: 'Groq', fn: () => callGroq(systemPrompt, userPrompt), available: hasGroq },
      ];

  const providerErrors: string[] = [];

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const nextProvider = providers[i + 1];

    if (!provider.available) {
      console.log(`[LLM Writer] ${provider.name} API key not found in env, skipping.`);
      continue;
    }

    try {
      console.log(`[LLM Writer] Attempting generation with primary provider: ${provider.name}...`);
      const result = await provider.fn();
      return result;
    } catch (err: any) {
      const errorMsg = `${provider.name} failed (${err.message})`;
      providerErrors.push(errorMsg);

      if (nextProvider && nextProvider.available) {
        console.warn(
          `[LLM Fallback Alert] ⚠️ ${provider.name} failed. Initiating fallback to ${nextProvider.name} to complete the job...`
        );
      } else {
        console.warn(`[LLM Writer] ${provider.name} failed:`, err.message);
      }
    }
  }

  // Final backup: If OpenAI is configured, try it
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('[LLM Writer] Both Gemini and Groq failed. Initiating emergency fallback to OpenAI...');
      return await callOpenAI(systemPrompt, userPrompt);
    } catch (openAiErr: any) {
      providerErrors.push(`OpenAI failed (${openAiErr.message})`);
    }
  }

  throw new Error(`All LLM providers failed. Errors: ${providerErrors.join(' | ')}`);
}

/**
 * Generates an automated tech blog post draft from raw scraped text
 */
export async function generateBlogDraft(article: ScrapedArticle): Promise<GeneratedBlogDraft> {
  const userPrompt = `Transform this raw tech news article into an insightful, human-sounding publication draft.

SOURCE OUTLET: ${article.source}
SOURCE URL: ${article.url}
ORIGINAL HEADLINE: ${article.title}

RAW EXTRACTED ARTICLE TEXT:
"""
${article.cleanText}
"""

Remember:
- No prohibited AI clichés (delve, testament, landscape, etc.)
- Short punchy paragraphs
- Dedicate a section to "Why This Matters"
- Output strictly in valid JSON format.`;

  // Execute generation with automatic fallback between Gemini and Groq
  const result = await generateWithFallback(SYSTEM_PROMPT, userPrompt);

  const metaTitle = sanitizeProhibitedWords(result.metaTitle || article.title).slice(0, 60);
  const metaDescription = sanitizeProhibitedWords(
    result.metaDescription || result.tldr || article.title
  ).slice(0, 150);
  const h1Title = sanitizeProhibitedWords(result.h1Title || article.title);
  const tldr = sanitizeProhibitedWords(result.tldr || '');
  const bodyContent = sanitizeProhibitedWords(result.bodyContent || '');
  const bottomLine = sanitizeProhibitedWords(result.bottomLine || '');
  const editorNotes = sanitizeProhibitedWords(result.editorNotes || '');

  // Build the complete combined content ready for the blog editor
  const combinedContent = `
<div class="blog-tldr-box p-4 rounded-xl mb-6 bg-slate-900/50 border border-slate-700">
  <p class="font-bold text-sky-400 mb-2">⚡ Quick Summary / Key Takeaways</p>
  <div class="text-slate-300 text-sm space-y-1">${tldr.replace(/\n/g, '<br/>')}</div>
</div>

${bodyContent}

<hr class="my-8 border-slate-800" />

${bottomLine}
`.trim();

  return {
    metaTitle,
    metaDescription,
    tldr,
    h1Title,
    bodyContent,
    bottomLine,
    editorNotes,
    combinedContent,
  };
}
