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

/**
 * Call Google Gemini API
 */
async function callGemini(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Gemini API key is not configured');

  const models = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini ${model} HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = parseCleanJson(rawText);
        if (parsed && (parsed.h1Title || parsed.bodyContent)) {
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn(`[LLM Writer] Gemini (${model}) failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * Call Groq API
 */
async function callGroq(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

  const models = [
    process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'llama-3.3-70b-versatile',
  ];

  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq ${model} HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (rawText) {
        const parsed = parseCleanJson(rawText);
        if (parsed && (parsed.h1Title || parsed.bodyContent)) {
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn(`[LLM Writer] Groq (${model}) failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Groq models failed');
}

/**
 * Call OpenAI API
 */
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

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
  });

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

  let result: any = null;

  // Try providers in priority order: Gemini -> Groq -> OpenAI
  try {
    result = await callGemini(SYSTEM_PROMPT, userPrompt);
  } catch (geminiErr: any) {
    console.warn('[LLM Writer] Gemini fallback to Groq:', geminiErr.message);
    try {
      result = await callGroq(SYSTEM_PROMPT, userPrompt);
    } catch (groqErr: any) {
      console.warn('[LLM Writer] Groq fallback to OpenAI:', groqErr.message);
      result = await callOpenAI(SYSTEM_PROMPT, userPrompt);
    }
  }

  if (!result) {
    throw new Error('All LLM providers failed to generate content');
  }

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
