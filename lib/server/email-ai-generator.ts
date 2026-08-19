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
  imagePrompt: string;
}

const BRAND_NAME = 'BridgeTech IT Services';
const BRAND_URL = 'https://www.itservicesfreetown.com';
const BRAND_PHONE = '+232 33 399 391';
const BRAND_LOCATION = '#1 Regent Highway, Jui Junction, Freetown';

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
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
  if (geminiKey) {
    try {
      const res = await callGemini(geminiKey, `You are an expert email marketing copywriter for ${BRAND_NAME} in Freetown, Sierra Leone.
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
Return ONLY a valid JSON object with three keys:
"subject": Catchy subject line (no HTML).
"content": Clean, highly informative, readable HTML body explaining the tech topic with tips, solutions, and advice.
"imagePrompt": Descriptive prompt for a clean vector illustration representing this topic (e.g. "A modern illustration of a laptop on a clean desk with repair tools, vector art, flat design, white background").
Any time you mention "${BRAND_NAME}", format it as <a href="${BRAND_URL}">${BRAND_NAME}</a>.
Contact: ${BRAND_LOCATION}, Phone: ${BRAND_PHONE}.`
        },
        {
          role: 'user',
          content: `Write an informative weekly tech newsletter issue explaining: ${cleanTopic}`
        }
      ]);
      if (res && res.subject && res.content) {
        return {
          subject: cleanSubject(res.subject),
          content: formatHtmlContent(res.content),
          imagePrompt: res.imagePrompt || cleanTopic
        };
      }
    } catch (err) {
      console.warn('[AI Newsletter Generator] Groq failed, trying fallback:', err);
    }
  }

  // 2. Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
  if (geminiKey) {
    try {
      const res = await callGemini(geminiKey, `Write a weekly tech newsletter for ${BRAND_NAME} in Freetown about "${cleanTopic}".
Return JSON with "subject", "content" (HTML body), and "imagePrompt" (vector art prompt).`);
      if (res && res.subject && res.content) {
        return {
          subject: cleanSubject(res.subject),
          content: formatHtmlContent(res.content),
          imagePrompt: res.imagePrompt || cleanTopic
        };
      }
    } catch (err) {
      console.warn('[AI Newsletter Generator] Gemini failed:', err);
    }
  }

  // 3. Built-in Curated Fallback Newsletter
  return generateFallbackNewsletter(cleanTopic);
}

/* ---------------- Helper API Callers ---------------- */

async function callGroq(messages: Array<{ role: string; content: string }>): Promise<any> {
  const models = ['llama-3.1-8b-instant', 'llama3-70b-8192', 'gemma2-9b-it'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
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
        throw new Error(`Groq HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All Groq models failed');
}

async function callGemini(apiKey: string, prompt: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (rawText) {
    return JSON.parse(rawText);
  }
  throw new Error('Invalid Gemini response');
}

async function callOpenAI(messages: Array<{ role: string; content: string }>): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (content) {
    return JSON.parse(content);
  }
  throw new Error('Invalid OpenAI response');
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

function generateFallbackNewsletter(topic: string): NewsletterEmailResult {
  return {
    subject: `🛡️ Tech Insights: ${topic}`,
    imagePrompt: `A clean, modern illustration of computer and phone repair technology with tools and digital elements, vector art, flat design, white background`,
    content: `
      <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">${topic}</h1>
      <p>Hello Tech Community,</p>
      <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights newsletter! Today, we are focusing on practical guidance to keep your electronics operating safely and efficiently.</p>

      <div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#166534;margin-top:0;">🔑 Key Takeaways &amp; Best Practices:</h3>
        <ul style="color:#334155;line-height:1.8;padding-left:20px;">
          <li><strong>Keep it Clean &amp; Ventilated:</strong> Dust buildup and humidity can severely throttle your processor and battery life. Clean air vents regularly.</li>
          <li><strong>Use Stable Power Surge Protection:</strong> Fluctuations in power outlets can damage sensitive internal power ICs. Always use quality surge protectors.</li>
          <li><strong>Perform Regular System Backups:</strong> Ensure your crucial business and personal files are backed up to external drives or cloud storage.</li>
          <li><strong>Address Warning Signs Early:</strong> Unusual fan noises, sudden battery drain, or unexpected shutdowns should be diagnosed immediately before component failure.</li>
        </ul>
      </div>

      <p>Taking a few minutes for preventive maintenance can add years of life to your valuable smartphones, laptops, and office computers.</p>

      <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
        <h4 style="color:#0f172a;margin-top:0;">Need Hands-On Assistance?</h4>
        <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Our expert technicians at <a href="${BRAND_URL}">${BRAND_NAME}</a> are always available for free diagnostic checks and genuine hardware servicing.</p>
        <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Schedule a Free Checkup</a>
      </div>

      <p style="font-size:14px;color:#64748b;">Have a tech question or need a quick repair? Reach out via WhatsApp or call at <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a>.</p>
    `
  };
}
