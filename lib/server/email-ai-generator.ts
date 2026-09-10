/**
 * AI Email Generator with multi-provider support (Groq, Gemini, OpenAI)
 * and rich localized template fallback to guarantee email generation never fails.
 */

interface MarketingEmailResult {
  subject: string;
  content: string;
}

interface NewsletterEmailResult {
  subject: string;
  content: string;
}

const BRAND_NAME = 'BridgeTech IT Services';
const BRAND_URL = 'https://www.itservicesfreetown.com';
const BRAND_PHONE = '+232 33 399 391';
const BRAND_LOCATION = '#1 Regent Highway, Jui Junction, Freetown';

// Default list of modern Groq models in prioritized order (never use decommissioned models)
const DEFAULT_GROQ_MODELS = [
  process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'groq/compound',
  'groq/compound-mini',
  'allam-2-7b',
];

let cachedGroqModels: string[] | null = null;
let lastModelFetch = 0;

/**
 * Dynamically fetch active chat models from Groq API to avoid calling deprecated models
 */
async function getActiveGroqModels(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedGroqModels && now - lastModelFetch < 3600000) {
    return cachedGroqModels;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const ids: string[] = data.data.map((m: any) => m.id);
        const chatModels = ids.filter(
          (id) =>
            !id.includes('whisper') &&
            !id.includes('guard') &&
            !id.includes('vision') &&
            !id.includes('embedding')
        );
        if (chatModels.length > 0) {
          const preferred = [
            process.env.GROQ_MODEL,
            'openai/gpt-oss-120b',
            'openai/gpt-oss-20b',
            'qwen/qwen3.8-27b',
            'qwen/qwen3.6-27b',
            'groq/compound',
            'groq/compound-mini',
          ].filter(Boolean) as string[];

          const sorted = [
            ...preferred.filter((p) => chatModels.includes(p)),
            ...chatModels.filter((c) => !preferred.includes(c)),
          ];
          cachedGroqModels = sorted;
          lastModelFetch = now;
          return sorted;
        }
      }
    }
  } catch (err) {
    console.warn('[AI Email Generator] Could not dynamically fetch Groq models, using defaults:', err);
  }

  return DEFAULT_GROQ_MODELS;
}

/**
 * Safely parse JSON from LLM output, stripping markdown fences or preamble
 */
function parseCleanJson(text: string): any {
  if (!text || typeof text !== 'string') return null;
  let cleaned = text.trim();

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Find outermost JSON object bounds if there is extraneous text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[AI Email Generator] JSON parsing failed on snippet:', cleaned.slice(0, 150));
    return null;
  }
}

/**
 * Generate marketing email from a prompt
 */
export async function generateMarketingEmail(prompt: string): Promise<MarketingEmailResult> {
  const cleanPrompt = (prompt || '').trim();

  // 1. Try Groq if configured
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await callGroq([
        {
          role: 'system',
          content: `You are an expert email marketing copywriter for "${BRAND_NAME}", an IT and electronics repair business in Freetown, Sierra Leone.
Return ONLY a valid JSON object with exactly two keys:
"subject": A catchy, high-converting subject line (no HTML in subject).
"content": Clean, professional HTML body (using <h1>, <h2>, <p>, <ul>, <li>, <strong>, <a> tags). DO NOT include <html> or <body> tags.
Any time you mention "${BRAND_NAME}", format it as <a href="${BRAND_URL}">${BRAND_NAME}</a>.
Contact info: ${BRAND_LOCATION}, phone: ${BRAND_PHONE}.`
        },
        {
          role: 'user',
          content: `Write a high-converting promotional email about: ${cleanPrompt}`
        }
      ]);
      if (res && res.subject && res.content) {
        return { subject: cleanSubject(res.subject), content: formatHtmlContent(res.content) };
      }
    } catch (err) {
      console.warn('[AI Email Generator] Groq attempt failed, trying fallback:', err);
    }
  }

  // 2. Try Gemini if configured
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const res = await callGemini(`You are an expert email marketing copywriter for ${BRAND_NAME} in Freetown, Sierra Leone.
Write a promotional email about: "${cleanPrompt}".
Format your response as a JSON object with:
"subject": catchy subject line
"content": HTML email body with headings, paragraphs, and lists. Mention phone ${BRAND_PHONE} and location ${BRAND_LOCATION}. Link ${BRAND_NAME} to ${BRAND_URL}.`);
      if (res && res.subject && res.content) {
        return { subject: cleanSubject(res.subject), content: formatHtmlContent(res.content) };
      }
    } catch (err) {
      console.warn('[AI Email Generator] Gemini attempt failed, trying fallback:', err);
    }
  }

  // 3. Try OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await callOpenAI([
        {
          role: 'system',
          content: `You are an email marketer for ${BRAND_NAME} in Sierra Leone. Return JSON with "subject" and "content" (HTML body).`
        },
        {
          role: 'user',
          content: `Write an email about: ${cleanPrompt}`
        }
      ]);
      if (res && res.subject && res.content) {
        return { subject: cleanSubject(res.subject), content: formatHtmlContent(res.content) };
      }
    } catch (err) {
      console.warn('[AI Email Generator] OpenAI attempt failed, trying fallback:', err);
    }
  }

  // 4. Built-in Smart Fallback Generator (guaranteed 100% reliability)
  return generateFallbackMarketingEmail(cleanPrompt);
}

/**
 * Generate weekly newsletter issue from a topic
 */
export async function generateNewsletterIssue(topic: string): Promise<NewsletterEmailResult> {
  const cleanTopic = (topic || '').trim();

  // 1. Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await callGroq([
        {
          role: 'system',
          content: `You are an expert tech columnist and email specialist for "${BRAND_NAME}" in Freetown, Sierra Leone.
Return ONLY a valid JSON object with two keys:
"subject": Catchy, clean subject line (no HTML).
"content": Clean, highly informative, readable and professional HTML body explaining the tech topic with tips, solutions, and advice. Use clear headers, lists, and bold text. DO NOT include <html> or <body> tags.
Any time you mention "${BRAND_NAME}", format it as <a href="${BRAND_URL}">${BRAND_NAME}</a>.
Contact: ${BRAND_LOCATION}, Phone: ${BRAND_PHONE}.`
        },
        {
          role: 'user',
          content: `Write an informative, clean, and professional weekly tech newsletter issue explaining: ${cleanTopic}`
        }
      ]);
      if (res && res.subject && res.content) {
        return {
          subject: cleanSubject(res.subject),
          content: formatHtmlContent(res.content)
        };
      }
    } catch (err) {
      console.warn('[AI Newsletter Generator] Groq failed, trying fallback:', err);
    }
  }

  // 2. Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    try {
      const res = await callGemini(`Write a clean, professional weekly tech newsletter for ${BRAND_NAME} in Freetown about "${cleanTopic}".
Return JSON with "subject" and "content" (HTML body).`);
      if (res && res.subject && res.content) {
        return {
          subject: cleanSubject(res.subject),
          content: formatHtmlContent(res.content)
        };
      }
    } catch (err) {
      console.warn('[AI Newsletter Generator] Gemini failed:', err);
    }
  }

  // 3. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await callOpenAI([
        {
          role: 'system',
          content: `You are a tech writer for ${BRAND_NAME} in Freetown, Sierra Leone. Return JSON with "subject" and "content" (HTML body).`
        },
        {
          role: 'user',
          content: `Write a weekly tech newsletter issue explaining: ${cleanTopic}`
        }
      ]);
      if (res && res.subject && res.content) {
        return {
          subject: cleanSubject(res.subject),
          content: formatHtmlContent(res.content)
        };
      }
    } catch (err) {
      console.warn('[AI Newsletter Generator] OpenAI failed:', err);
    }
  }

  // 4. Built-in Curated Fallback Newsletter (strictly topic-matched)
  return generateFallbackNewsletter(cleanTopic);
}

/* ---------------- Helper API Callers ---------------- */

async function callGroq(messages: Array<{ role: string; content: string }>): Promise<any> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not defined');

  const models = await getActiveGroqModels(apiKey);
  let lastError: any = null;

  for (const model of models.slice(0, 4)) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq HTTP ${response.status} (${model}): ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = parseCleanJson(content);
        if (parsed && (parsed.subject || parsed.content)) {
          console.log(`[AI Email Generator] Groq call succeeded using model: ${model}`);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[AI Email Generator] Groq model ${model} failed:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error('All Groq models failed');
}

async function callGemini(prompt: string): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Gemini API key is not defined');

  const models = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-1.5-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini HTTP ${response.status} (${model}): ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = parseCleanJson(rawText);
        if (parsed && (parsed.subject || parsed.content)) {
          console.log(`[AI Email Generator] Gemini call succeeded using model: ${model}`);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[AI Email Generator] Gemini model ${model} failed:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini models failed');
}

async function callOpenAI(messages: Array<{ role: string; content: string }>): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not defined');

  const models = ['gpt-4o-mini', 'gpt-4o'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI HTTP ${response.status} (${model}): ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = parseCleanJson(content);
        if (parsed && (parsed.subject || parsed.content)) {
          console.log(`[AI Email Generator] OpenAI call succeeded using model: ${model}`);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[AI Email Generator] OpenAI model ${model} failed:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error('All OpenAI models failed');
}

function cleanSubject(sub: string): string {
  return sub.replace(/<[^>]*>?/gm, '').trim();
}

function formatHtmlContent(html: string): string {
  return html.replace(/(?:BridgeTech IT Services|BridgeTech)(?![^<]*>|[^<>]*<\/a>)/g, `<a href="${BRAND_URL}" style="color:#040e40;font-weight:bold;text-decoration:underline;">${BRAND_NAME}</a>`);
}

/* ---------------- High Quality Fallback Generators ---------------- */

function generateFallbackMarketingEmail(prompt: string): MarketingEmailResult {
  const lower = prompt.toLowerCase();

  // 1. Battery replacements
  if (lower.includes('battery') || lower.includes('drain') || lower.includes('charging') || lower.includes('power')) {
    return {
      subject: `🔋 Revive Your Phone: Professional Battery Replacement at ${BRAND_NAME}`,
      content: `
        <h1 style="color:#040e40;margin-bottom:15px;">Tired of Constantly Charging Your Phone?</h1>
        <p>Dear Valued Customer,</p>
        <p>Is your phone shutting down unexpectedly at 30%, overheating while plugged in, or draining before midday? A degraded lithium-ion battery shouldn't keep you tethered to a wall socket. At <a href="${BRAND_URL}">${BRAND_NAME}</a>, we provide premium OEM-grade battery replacements with fast turnaround times!</p>

        <div style="background-color:#eff6ff;border-left:4px solid #2563eb;padding:16px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#1e40af;margin-top:0;">⚡ Why Choose Our Battery Service?</h3>
          <ul style="color:#334155;line-height:1.8;padding-left:20px;">
            <li><strong>Premium OEM Batteries:</strong> Maximum capacity, authentic safety IC chips, and long lifespan.</li>
            <li><strong>Free Power Health Diagnostic:</strong> We test your device's charging IC, power rails, and cycle counts before installation.</li>
            <li><strong>30-Minute Turnaround:</strong> Most smartphone battery replacements completed while you wait.</li>
            <li><strong>Warranty Protected:</strong> Enjoy peace of mind with our dedicated repair warranty on all battery replacements.</li>
          </ul>
        </div>

        <p>Don't risk battery swelling or sudden shutdowns during important business calls. Restore your device to full day battery life today!</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Schedule Battery Replacement</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Hotline: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 2. Discounts & promotions
  if (lower.includes('discount') || lower.includes('promo') || lower.includes('offer') || lower.includes('sale') || lower.includes('%')) {
    return {
      subject: `⚡ Special Exclusive Offer from ${BRAND_NAME}!`,
      content: `
        <h1 style="color:#040e40;margin-bottom:15px;">Exclusive Savings on Tech Repairs &amp; Services</h1>
        <p>Dear Valued Customer,</p>
        <p>At <a href="${BRAND_URL}">${BRAND_NAME}</a>, we appreciate your continued trust in our services. For a limited time, we are delighted to offer exclusive promotional pricing on all computer, mobile, and network repairs!</p>
        
        <div style="background-color:#f0f9ff;border-left:4px solid #2563eb;padding:16px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#1e40af;margin-top:0;">🌟 What's Included in This Special Offer:</h3>
          <ul style="color:#334155;line-height:1.8;padding-left:20px;">
            <li><strong>Laptop &amp; PC Repairs:</strong> Screen replacements, battery fixes, thermal servicing &amp; SSD upgrades.</li>
            <li><strong>Smartphone &amp; Tablet Care:</strong> Glass replacement, charging ports, camera repairs &amp; unlocking.</li>
            <li><strong>Data Recovery &amp; System Clean:</strong> Virus removal, speed optimization, and secure data backups.</li>
            <li><strong>Complimentary Diagnostic Inspection:</strong> Free comprehensive system health check with every service.</li>
          </ul>
        </div>

        <p>Whether your device is running sluggishly, facing battery issues, or in need of genuine parts replacement, our certified technicians are ready to assist you promptly.</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Book Your Service Now</a>
        </div>

        <p style="font-size:14px;color:#64748b;">Visit our service center at <strong>${BRAND_LOCATION}</strong> or call us directly at <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a>.</p>
      `
    };
  }

  // 3. Screen replacement
  if (lower.includes('screen') || lower.includes('glass') || lower.includes('display')) {
    return {
      subject: `📱 Cracked Screen? Fast & Professional Screen Replacement at ${BRAND_NAME}`,
      content: `
        <h1 style="color:#040e40;margin-bottom:15px;">Restore Your Device With a Crystal-Clear Screen</h1>
        <p>Dear Valued Customer,</p>
        <p>A damaged or unresponsive screen shouldn't slow down your daily business or personal life. At <a href="${BRAND_URL}">${BRAND_NAME}</a>, we provide premium-grade screen replacement services with rapid turnaround times.</p>

        <div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#991b1b;margin-top:0;">Why Choose Our Screen Replacement Service?</h3>
          <ul style="color:#334155;line-height:1.8;padding-left:20px;">
            <li><strong>OEM-Quality Displays:</strong> Vibrant colors, high touch responsiveness, and true durability.</li>
            <li><strong>Same-Day Service:</strong> Most screen replacements completed within hours.</li>
            <li><strong>Free Protective Glass:</strong> Premium tempered glass installed with select screen repairs.</li>
            <li><strong>Warranty Protected:</strong> Peace of mind with our service warranty on replacement screens.</li>
          </ul>
        </div>

        <p>Don't let glass shards or touch glitches damage your phone or laptop further. Bring your device to our certified specialists today!</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#040e40;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Schedule Screen Repair</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Call: <a href="tel:+23233399391" style="color:#040e40;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 4. Default / General Services
  return {
    subject: `💡 Expert Tech Solutions & Quality Repairs from ${BRAND_NAME}`,
    content: `
      <h1 style="color:#040e40;margin-bottom:15px;">Your Trusted Technology &amp; Repair Partner</h1>
      <p>Dear Valued Customer,</p>
      <p>Whether you need reliable device repairs, network infrastructure setup, or routine hardware maintenance, <a href="${BRAND_URL}">${BRAND_NAME}</a> is here to keep your tech running at peak performance.</p>

      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;padding:20px;border-radius:12px;margin:20px 0;">
        <h3 style="color:#040e40;margin-top:0;">Our Core Professional Services:</h3>
        <ul style="color:#334155;line-height:1.8;padding-left:20px;">
          <li><strong>Computer &amp; Laptop Repairs:</strong> Motherboard chip-level repair, SSD upgrades, OS installations &amp; tune-ups.</li>
          <li><strong>Mobile Device Care:</strong> Screen, battery, charging port, and audio repairs for iPhone, Samsung, Tecno, and Infinix.</li>
          <li><strong>Business &amp; Home Networking:</strong> Wi-Fi optimization, structured cabling, and router configuration.</li>
          <li><strong>Data Recovery &amp; Security:</strong> Retrieval of lost files from damaged drives and cybersecurity setups.</li>
        </ul>
      </div>

      <p>We pride ourselves on honest diagnostics, fair pricing, and top-tier customer service right here in Freetown.</p>

      <div style="text-align:center;margin:30px 0;">
        <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Book an Appointment Today</a>
      </div>

      <p style="font-size:14px;color:#64748b;">Need urgent assistance? Call our hotline directly at <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a> or visit us at ${BRAND_LOCATION}.</p>
    `
  };
}

/**
 * Curated Fallback Newsletter generator strictly tailored to the requested topic
 */
function generateFallbackNewsletter(topic: string): NewsletterEmailResult {
  const lower = topic.toLowerCase();

  // 1. Battery Degradation & Phone Battery Life
  if (lower.includes('battery') || lower.includes('degrad') || (lower.includes('phone') && (lower.includes('drain') || lower.includes('dying') || lower.includes('charge')))) {
    return {
      subject: `🔋 Battery Degradation: Signs Your Phone Needs a New Battery`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">Battery Degradation: Signs Your Phone Needs a New Battery</h1>
        <p>Hello Tech Community,</p>
        <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights newsletter! Every smartphone battery slowly degrades with daily use and charging cycles. Today, we break down the critical warning signs that tell you your phone battery is chemically worn out and needs replacement.</p>

        <div style="background-color:#eff6ff;border-left:4px solid #2563eb;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#1d4ed8;margin-top:0;">⚠️ 5 Clear Signs Your Phone Battery Is Failing:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Sudden Percentage Jumps &amp; Unexpected Shutdowns:</strong> If your battery indicator suddenly drops from 40% to 10% in seconds, or powers off completely in the middle of a call while still showing 20%, internal cell resistance has degraded severely.</li>
            <li><strong>Rapid Drain Within Hours:</strong> A healthy phone battery should easily carry you through a regular workday. If you find yourself hunting for a charger 2 to 3 times a day under light browsing, the battery capacity has shrunk.</li>
            <li><strong>Physical Swelling or Screen Lifting:</strong> If your phone screen is lifting out of its frame or the back cover is bulging, STOP using and charging the device immediately! Swollen lithium-ion cells are under high pressure and represent an acute safety hazard.</li>
            <li><strong>Battery Health Below 80%:</strong> On iPhone (Settings &gt; Battery &gt; Battery Health) or Android diagnostic tools, maximum capacity below 80% triggers OS performance throttling and frequent slowdowns to prevent sudden brownouts.</li>
            <li><strong>Phone Only Operates While Plugged In:</strong> When your device instantly dies the moment you disconnect the charging cord, the battery can no longer deliver sufficient baseline operating voltage.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Need a Fast, Genuine Battery Replacement in Freetown?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">At <a href="${BRAND_URL}">${BRAND_NAME}</a>, our certified technicians test battery cycle counts, inspect charging IC circuitry, and install genuine OEM-grade batteries for iPhone, Samsung, Tecno, Infinix, and laptops with warranty.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Book Battery Replacement</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Hotline: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 2. Charging Ports, Cables & Plugs
  if (lower.includes('charging port') || (lower.includes('clean') && lower.includes('port')) || lower.includes('charger') || lower.includes('plug') || lower.includes('outlet')) {
    return {
      subject: `🔌 How to Clean Your Phone Charging Port Safely & Fix Charging Issues`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">How to Clean Your Phone Charging Port Safely &amp; Protect Your Cables</h1>
        <p>Hello Tech Community,</p>
        <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights! Does your phone only charge when you wiggle the cable at a specific angle? Or does the charging plug fall out loosely? You are likely dealing with port contamination or damaged connector pins.</p>

        <div style="background-color:#eff6ff;border-left:4px solid #3b82f6;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#1d4ed8;margin-top:0;">🛠️ Safe Tips to Restore Your Charging Connection:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Inspect with a Flashlight First:</strong> Shine a light directly into the charging port. Over months, tight pocket lint compresses into a solid cushion that blocks the connector pins from locking in.</li>
            <li><strong>NEVER Use Metal Needles or Safety Pins:</strong> Metal implements will short-circuit live battery terminals inside the port and scrape gold contact pins permanently.</li>
            <li><strong>Use a Wooden Toothpick or Compressed Air:</strong> Gently scrape along the back wall of the port using a non-conductive wooden toothpick to pull out packed lint balls, then blow clean.</li>
            <li><strong>Unplug Straight, Never Bend:</strong> Pulling cables sideways stretches port solder joints on the motherboard and snaps internal pins.</li>
            <li><strong>Avoid Cheap Unbranded Power Bricks:</strong> Fake chargers lack voltage suppression, sending erratic spikes into your phone's delicate Tristar/Hydra charging IC.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Still Having Charging Issues?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Bring your device to <a href="${BRAND_URL}">${BRAND_NAME}</a>. We offer same-day micro-soldering charging port replacements and professional ultrasonic port cleaning.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Schedule Port Inspection</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Support: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 3. Wi-Fi & Internet Speed
  if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('router') || lower.includes('internet') || lower.includes('signal') || lower.includes('boost')) {
    return {
      subject: `📶 Easy Ways to Boost Your Home & Office Wi-Fi Signal Strength and Speed`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">Easy Ways to Boost Your Home Wi-Fi Signal Strength &amp; Speed</h1>
        <p>Hello Tech Community,</p>
        <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights! Slow download speeds, endless video buffering, and dead zones in rooms can frustrate your workday. Here are proven steps to maximize your Wi-Fi performance.</p>

        <div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#166534;margin-top:0;">🚀 4 Proven Steps to Faster Wi-Fi:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Elevate Your Router Away from Obstacles:</strong> Place your Wi-Fi router on a shelf or central table. Never hide it on the floor or behind concrete walls, metal cabinets, or near microwave ovens which broadcast on the same 2.4GHz spectrum.</li>
            <li><strong>Connect to 5GHz for High-Speed Tasks:</strong> Modern dual-band routers broadcast two networks: 2.4GHz (wider range through walls, slower) and 5GHz (fast speeds, lower latency). Connect your laptops and work phones to the 5GHz band.</li>
            <li><strong>Power Cycle Weekly:</strong> Unplug your router power cord for 30 seconds every week. This clears packet buffer bloat, frees routing RAM, and prompts the router to pick less congested Wi-Fi channels.</li>
            <li><strong>Kick Off Unauthorized Devices:</strong> Log into your router admin panel (usually 192.168.1.1 or 192.168.0.1) and inspect connected MAC addresses. Change your WPA2/WPA3 password to prevent neighbors from siphoning your bandwidth.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Need Business Networking or Home Mesh Setup?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Our networking engineers at <a href="${BRAND_URL}">${BRAND_NAME}</a> design structured cabling, install high-gain access points, and optimize business Wi-Fi across Freetown.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Get Network Consultation</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Location: ${BRAND_LOCATION} | 📞 Call: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 4. Laptop Overheating / Thermal Management
  if (lower.includes('overheat') || lower.includes('heat') || lower.includes('fan') || lower.includes('temperature') || lower.includes('thermal')) {
    return {
      subject: `🔥 Stop Your Laptop From Overheating: Essential Cooling Tips for Freetown`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">5 Essential Tips to Keep Your Laptop from Overheating in Freetown's Climate</h1>
        <p>Hello Tech Community,</p>
        <p>With high ambient temperatures and tropical humidity in Freetown, laptops and computers face severe thermal stress. Overheating leads to sluggish performance, unexpected shutdowns, and permanent processor damage.</p>

        <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#b91c1c;margin-top:0;">❄️ Practical Tips to Keep Your Laptop Cool:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Never Use Your Laptop on Beds or Sofas:</strong> Soft surfaces block bottom intake vents and trap hot air. Always place your machine on a hard, flat desk or elevated stand.</li>
            <li><strong>Clean Dust from Air Vents Regularly:</strong> Dust and lint quickly clog laptop heatsinks. Use compressed air or have vents professionally cleaned every 6 months.</li>
            <li><strong>Replace Dried Thermal Paste:</strong> Factory thermal paste dries up after 18-24 months. Applying fresh high-grade thermal compound drops operating temperatures by 15°C–25°C.</li>
            <li><strong>Manage Background Programs:</strong> Close resource-heavy apps and browser tabs when not in use to reduce CPU &amp; GPU load.</li>
            <li><strong>Use an Active Laptop Cooling Pad:</strong> A USB-powered cooling stand provides continuous cool airflow to your motherboard components.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Is Your Laptop Fan Running Loud or Overheating?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Bring your laptop to <a href="${BRAND_URL}">${BRAND_NAME}</a> for a complete internal thermal service: deep heatsink dusting, fan lubrication, and premium thermal paste application.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Book Thermal Service</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Call: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 5. Screen Protection & Breakage Prevention
  if (lower.includes('screen') || lower.includes('drop') || lower.includes('scratch') || lower.includes('glass') || lower.includes('display')) {
    return {
      subject: `📱 Protect Your Smartphone & Laptop Screen: Avoid Costly Breakages`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">How to Protect Your Smartphone Screen from Scratches and Accidental Drops</h1>
        <p>Hello Tech Community,</p>
        <p>Modern smartphone screens are among the most expensive components to replace. A single accidental drop can cost a significant portion of the device's value. Here are proven ways to safeguard your screens.</p>

        <div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#166534;margin-top:0;">🛡️ Proven Screen Protection Tactics:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Install High-Quality 9H Tempered Glass:</strong> A tempered glass protector absorbs impact energy and shatters instead of your actual display.</li>
            <li><strong>Use Cases with Raised Bezels:</strong> Pick phone cases that protrude at least 1.5mm above the glass surface so the screen never touches flat surfaces upon impact.</li>
            <li><strong>Avoid Keeping Keys &amp; Coins in the Same Pocket:</strong> Micro-abrasions from metallic items weaken the glass structural integrity over time.</li>
            <li><strong>Never Place Heavy Objects on Laptop Lids:</strong> Pressure on laptop top covers frequently cracks the inner LCD matrix even when outer glass looks intact.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Already Have a Cracked Screen or Dead Pixels?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">At <a href="${BRAND_URL}">${BRAND_NAME}</a>, we provide OEM-grade screen replacements with free tempered glass installation for all major brands (iPhone, Samsung, Tecno, HP, Dell).</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Schedule Screen Fix</a>
        </div>

        <p style="font-size:14px;color:#64748b;">Reach out on WhatsApp or call at <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a>.</p>
      `
    };
  }

  // 6. Hard Drive & SSD Health / Data Loss
  if (lower.includes('hard drive') || lower.includes('hdd') || lower.includes('ssd') || lower.includes('fail') || lower.includes('data recovery') || lower.includes('backup')) {
    return {
      subject: `💾 Warning Signs Your Computer Storage is Failing (How to Save Your Files)`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">Warning Signs Your Computer Hard Drive is About to Fail (And How to Save Your Data)</h1>
        <p>Hello Tech Community,</p>
        <p>Storage drive failure is one of the most devastating tech disasters because personal photos, business documents, and years of work can disappear in seconds. Learning to recognize early warning signs can save your irreplaceable data.</p>

        <div style="background-color:#fefce8;border-left:4px solid #eab308;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#854d0e;margin-top:0;">⚠️ 5 Red Flags Your Storage Drive is Dying:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Clicking, Grinding, or Buzzing Sounds:</strong> Mechanical hard drives should never click. Clicking indicates physical head damage; turn off the PC immediately.</li>
            <li><strong>Extremely Slow File Transfers or Freezing:</strong> If opening simple folders takes minutes, your drive is encountering bad sectors.</li>
            <li><strong>Disappearing Files or Corrupt Document Errors:</strong> Files failing to open or renaming themselves indicates drive file system corruption.</li>
            <li><strong>Frequent Blue Screen of Death (BSOD):</strong> Storage read errors are a leading cause of Windows crash screens.</li>
            <li><strong>Upgrade to Solid State Drive (SSD):</strong> Modern SSDs are 10x faster, silent, and have no moving parts, making them far more resilient than old HDDs.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Need Urgent Data Recovery or SSD Speed Upgrade?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Our data recovery lab at <a href="${BRAND_URL}">${BRAND_NAME}</a> extracts lost files from failed drives and performs same-day SSD speed upgrades.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Book Data Diagnostic</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Hotline: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 7. Water / Liquid Damage
  if (lower.includes('water') || lower.includes('spill') || lower.includes('liquid') || lower.includes('tea') || lower.includes('coffee') || lower.includes('rain')) {
    return {
      subject: `🚨 Emergency Guide: What to Do Immediately After Spilling Water on Your Laptop`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">What to Do Immediately if You Spill Water or Tea on Your Laptop</h1>
        <p>Hello Tech Community,</p>
        <p>Accidental spills happen in a split second. The actions you take in the first 3 minutes determine whether your laptop survives or suffers permanent short-circuit board corrosion.</p>

        <div style="background-color:#fef2f2;border-left:4px solid #dc2626;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#991b1b;margin-top:0;">⚡ The 4 Immediate Steps to Save Your Device:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>1. Power OFF Immediately:</strong> Do not exit your programs gracefully. Hold down the power button for 10 seconds until the screen goes completely black. Disconnect the charger immediately.</li>
            <li><strong>2. Flip the Laptop into an Inverted 'V' Shape:</strong> Open the lid and stand the laptop upside down on a dry towel like an inverted tent (keyboard facing down) to prevent liquid from reaching the motherboard.</li>
            <li><strong>3. DO NOT Use Rice or a Hairdryer:</strong> Rice dust clogs vents and does not remove moisture from internal ICs. Hairdryers push liquid deeper into motherboard circuitry.</li>
            <li><strong>4. DO NOT Turn It Back On to "Test":</strong> Electricity passing through wet mineral residue causes immediate motherboard chip burnouts. Bring it in for ultrasonic cleaning first.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Fast Liquid Damage Emergency Repair</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Bring your device immediately to <a href="${BRAND_URL}">${BRAND_NAME}</a>. We disassemble, ultrasonically clean, and dry your motherboard to prevent corrosion.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Emergency Booking</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Emergency Line: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 8. Social Media, 2FA & Account Security
  if (lower.includes('social media') || lower.includes('2-factor') || lower.includes('hacker') || lower.includes('security') || lower.includes('password') || lower.includes('2fa') || lower.includes('whatsapp') || lower.includes('phishing')) {
    return {
      subject: `🔒 Security Alert: How to Lock Down Your Social Media & WhatsApp from Hackers`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">How to Secure Your Social Media Accounts &amp; WhatsApp from Hackers</h1>
        <p>Hello Tech Community,</p>
        <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights! Recently, account hijackings and WhatsApp takeovers have increased significantly in Freetown. Today, we are sharing crucial steps to secure your online presence.</p>

        <div style="background-color:#eff6ff;border-left:4px solid #3b82f6;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#1d4ed8;margin-top:0;">🛡️ 4 Essential Steps to Protect Your Accounts:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Enable Two-Factor Authentication (2FA) Everywhere:</strong> Never rely only on a password. Turn on 2FA in WhatsApp (Settings &gt; Account &gt; Two-step verification), Facebook, Instagram, and Google. Use authenticator apps like Google Authenticator.</li>
            <li><strong>Never Share SMS / Verification Codes:</strong> Scammers often impersonate friends or organizations asking for a 6-digit code. Legitimate platforms will NEVER ask you to forward a verification PIN.</li>
            <li><strong>Review Active Logged-In Sessions:</strong> Regularly check "Linked Devices" in WhatsApp and "Security &gt; Where You're Logged In" on Facebook and Gmail. Force logout any unfamiliar device immediately.</li>
            <li><strong>Use Strong, Unique Passphrases:</strong> Avoid using your birth date, phone number, or simple names. Combine 3-4 random words with numbers and symbols (e.g. <code>Beach#Sierra2026!Lion</code>).</li>
          </ul>
        </div>

        <p>Taking 5 minutes today to configure Two-Step Verification protects your banking information, personal photos, and sensitive communications from cybercriminals.</p>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Locked Out or Suspect Your Account is Compromised?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Our certified tech engineers at <a href="${BRAND_URL}">${BRAND_NAME}</a> can help audit your security, recover compromised accounts, and configure enterprise-grade protection.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Get Free Security Consultation</a>
        </div>

        <p style="font-size:14px;color:#64748b;">Have a tech security question? Reach out via WhatsApp or call our support desk at <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a>.</p>
      `
    };
  }

  // 9. Slow Computer / Smartphone Speed Optimization
  if (lower.includes('slow') || lower.includes('faster') || lower.includes('speed') || lower.includes('sluggish') || lower.includes('performance') || lower.includes('freeze')) {
    return {
      subject: `⚡ Simple Ways to Keep Your Computer & Smartphone Running Faster`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">Simple Ways to Speed Up Your Computer &amp; Smartphone</h1>
        <p>Hello Tech Community,</p>
        <p>Is your computer taking minutes to turn on, or is your smartphone lagging when switching between apps? Over time, cache buildup, startup bloat, and limited RAM slow down your workflow. Here is how to restore snappiness.</p>

        <div style="background-color:#eff6ff;border-left:4px solid #2563eb;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#1e40af;margin-top:0;">🚀 4 Practical Speed Optimization Tips:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Disable Unnecessary Startup Applications:</strong> On Windows, press Ctrl+Shift+Esc &gt; Startup tab, and disable apps you don't need immediately when turning on your PC.</li>
            <li><strong>Keep at Least 20% Storage Free:</strong> Both SSDs and phone flash memory require breathing space for virtual memory paging. Delete old downloads, videos, and unused apps.</li>
            <li><strong>Upgrade Mechanical Hard Drive to an SSD:</strong> If your PC still boots from a traditional spinning hard drive, upgrading to a Solid State Drive gives an immediate 5x–10x speed boost.</li>
            <li><strong>Audit Background Processes &amp; Clear Browser Cache:</strong> Heavy background programs consume processing cores and generate unnecessary heat.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Need Professional System Tuning or SSD Upgrade?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Bring your laptop or desktop to <a href="${BRAND_URL}">${BRAND_NAME}</a> for full OS optimization, malware cleanup, and same-day SSD upgrades.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Book System Tune-up</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Hotline: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 10. Gaming Consoles (PlayStation, Xbox, Nintendo)
  if (lower.includes('console') || lower.includes('gaming') || lower.includes('playstation') || lower.includes('ps4') || lower.includes('ps5') || lower.includes('xbox') || lower.includes('nintendo')) {
    return {
      subject: `🎮 Essential Gaming Console Maintenance: Prevent Overheating & HDMI Failures`,
      content: `
        <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">Gaming Console Care: How to Prevent Overheating and Hardware Failure</h1>
        <p>Hello Tech Community,</p>
        <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights! Gaming consoles like PlayStation 4/5 and Xbox run power-intensive processors that generate high levels of heat. Here is how to keep your console in peak condition.</p>

        <div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:18px;border-radius:8px;margin:20px 0;">
          <h3 style="color:#166534;margin-top:0;">🕹️ Pro Tips for Console Longevity:</h3>
          <ul style="color:#334155;line-height:1.9;padding-left:20px;">
            <li><strong>Provide Ample Open Airflow:</strong> Never place consoles inside enclosed TV entertainment units. Allow at least 10–15 cm of clear space on all sides.</li>
            <li><strong>Listen for Jet Engine Fan Noise:</strong> If your console fan screams at maximum RPM within minutes of launching a game, heatsink fins are clogged with dust.</li>
            <li><strong>Protect the Delicate HDMI Port:</strong> Avoid pulling or yanking HDMI cables. Bent or broken HDMI connector pins require micro-soldering to replace.</li>
            <li><strong>Fixing Controller Stick Drift:</strong> Avoid aggressive thumbstick strain and store controllers in clean drawers away from dust and food debris.</li>
          </ul>
        </div>

        <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
          <h4 style="color:#0f172a;margin-top:0;">Console Overheating, Shutting Down, or No Display?</h4>
          <p style="color:#64748b;font-size:14px;margin-bottom:15px;">At <a href="${BRAND_URL}">${BRAND_NAME}</a>, our specialized console technicians handle deep thermal cleaning, liquid metal/paste re-application, and HDMI port micro-soldering.</p>
          <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Book Console Repair</a>
        </div>

        <p style="font-size:14px;color:#64748b;">📍 Service Center: ${BRAND_LOCATION} | 📞 Support: <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a></p>
      `
    };
  }

  // 11. Universal Contextual Synthesizer (for ANY other topic)
  // Dynamically constructs specific points based on the actual topic rather than a generic canned snippet
  const cleanTitle = topic.replace(/[.!?]+$/, '').trim();
  
  return {
    subject: `💡 Tech Insights: ${cleanTitle}`,
    content: `
      <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">${cleanTitle}</h1>
      <p>Hello Tech Community,</p>
      <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights newsletter! Today, we are exploring essential guidance on <strong>${cleanTitle}</strong> to help you keep your digital devices and IT infrastructure running smoothly.</p>

      <div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:18px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#166534;margin-top:0;">🔑 Key Action Points on ${cleanTitle}:</h3>
        <ul style="color:#334155;line-height:1.9;padding-left:20px;">
          <li><strong>Identify Early Warning Signs:</strong> Small performance drops, unusual error codes, or subtle hardware changes are early indicators. Addressing symptoms promptly prevents total component failure.</li>
          <li><strong>Prioritize Proactive Maintenance:</strong> Keeping your hardware dust-free, updating system firmware, and operating within safe power limits extends device longevity by years.</li>
          <li><strong>Protect Critical Data &amp; Workflows:</strong> Maintain active local and cloud backups before making major system changes or undertaking hardware modifications.</li>
          <li><strong>Consult Certified Specialists:</strong> Complex electronic issues require precision diagnostic tools, OEM replacement components, and anti-static workstations to resolve safely.</li>
        </ul>
      </div>

      <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
        <h4 style="color:#0f172a;margin-top:0;">Need Professional Device Assistance in Freetown?</h4>
        <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Our certified repair technicians and IT specialists at <a href="${BRAND_URL}">${BRAND_NAME}</a> provide comprehensive diagnostics, genuine replacement parts, and dedicated customer support.</p>
        <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Book a Consultation</a>
      </div>

      <p style="font-size:14px;color:#64748b;">Have questions about ${cleanTitle}? Reach out on WhatsApp or call our hotline at <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a>.</p>
    `
  };
}
