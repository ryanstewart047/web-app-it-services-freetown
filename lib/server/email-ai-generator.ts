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
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
  if (geminiKey) {
    try {
      const res = await callGemini(geminiKey, `Write a clean, professional weekly tech newsletter for ${BRAND_NAME} in Freetown about "${cleanTopic}".
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

  // 3. Built-in Curated Fallback Newsletter
  return generateFallbackNewsletter(cleanTopic);
}

/* ---------------- Helper API Callers ---------------- */

async function callGroq(messages: Array<{ role: string; content: string }>): Promise<any> {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama-3.3-70b-specdec'];
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
  const lower = topic.toLowerCase();

  // 1. Social Media / 2FA / Account Security
  if (lower.includes('social media') || lower.includes('2-factor') || lower.includes('hacker') || lower.includes('security') || lower.includes('password') || lower.includes('2fa')) {
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

  // 2. Laptop Overheating / Thermal Management
  if (lower.includes('overheat') || lower.includes('heat') || lower.includes('fan') || lower.includes('temperature')) {
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

  // 3. Screen Protection
  if (lower.includes('screen') || lower.includes('drop') || lower.includes('scratch') || lower.includes('glass')) {
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

  // 4. Hard Drive & SSD Health / Data Loss
  if (lower.includes('hard drive') || lower.includes('hdd') || lower.includes('ssd') || lower.includes('fail') || lower.includes('data recovery')) {
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

  // 5. Water / Liquid Damage
  if (lower.includes('water') || lower.includes('spill') || lower.includes('liquid') || lower.includes('tea') || lower.includes('coffee')) {
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

  // 6. Default Fallback
  return {
    subject: `🛡️ Tech Insights: ${topic}`,
    content: `
      <h1 style="color:#0f172a;font-size:24px;font-weight:800;margin-bottom:16px;">${topic}</h1>
      <p>Hello Tech Community,</p>
      <p>Welcome to this week's edition of the <a href="${BRAND_URL}">${BRAND_NAME}</a> Tech Insights newsletter! Today, we are exploring essential guidance on <strong>${topic}</strong> to help you keep your digital life running smoothly.</p>

      <div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:18px;border-radius:8px;margin:20px 0;">
        <h3 style="color:#166534;margin-top:0;">🔑 Key Action Points &amp; Best Practices:</h3>
        <ul style="color:#334155;line-height:1.9;padding-left:20px;">
          <li><strong>Understand the Root Cause:</strong> Most electronic malfunctions stem from power surges, dust accumulation, outdated software, or heat degradation.</li>
          <li><strong>Regular Preventive Maintenance:</strong> Cleaning ports, replacing thermal paste every 18 months, and maintaining clean airflow prevents 80% of hardware failures.</li>
          <li><strong>Adopt Strong Security Measures:</strong> Use 2-factor authentication, secure cloud backups, and avoid untrusted software downloads.</li>
          <li><strong>Seek Professional Help Early:</strong> Addressing minor symptoms early (battery swelling, fan noise, slow boot times) saves you from costly major component replacements.</li>
        </ul>
      </div>

      <div style="background-color:#f8fafc;padding:20px;border-radius:12px;margin:25px 0;text-align:center;border:1px dashed #cbd5e1;">
        <h4 style="color:#0f172a;margin-top:0;">Need Expert Diagnostics or Device Servicing?</h4>
        <p style="color:#64748b;font-size:14px;margin-bottom:15px;">Our certified repair technicians at <a href="${BRAND_URL}">${BRAND_NAME}</a> are here to provide free diagnostic checks and genuine hardware servicing in Freetown.</p>
        <a href="${BRAND_URL}/book-appointment" style="display:inline-block;background-color:#dc2626;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Schedule a Free Checkup</a>
      </div>

      <p style="font-size:14px;color:#64748b;">Have a tech question or need a quick repair? Reach out via WhatsApp or call at <a href="tel:+23233399391" style="color:#dc2626;font-weight:bold;">${BRAND_PHONE}</a>.</p>
    `
  };
}
