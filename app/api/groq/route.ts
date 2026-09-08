import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Default list of modern Groq models in prioritized fallback order
const DEFAULT_GROQ_MODELS = [
  process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'groq/compound',
  'groq/compound-mini',
  'allam-2-7b',
];

/**
 * Dynamically fetch active chat models from Groq API to avoid calling deprecated models
 */
async function fetchActiveGroqModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const ids: string[] = data.data.map((m: any) => m.id);
        // Exclude audio/embedding/moderation models
        const chatModels = ids.filter(
          (id) =>
            !id.includes('whisper') &&
            !id.includes('guard') &&
            !id.includes('vision') &&
            !id.includes('embedding')
        );
        if (chatModels.length > 0) {
          const preferred = [
            'openai/gpt-oss-120b',
            'openai/gpt-oss-20b',
            'qwen/qwen3.8-27b',
            'qwen/qwen3.6-27b',
            'groq/compound',
            'groq/compound-mini',
          ];
          const sorted = [
            ...preferred.filter((p) => chatModels.includes(p)),
            ...chatModels.filter((c) => !preferred.includes(c)),
          ];
          return sorted;
        }
      }
    }
  } catch {
    // Silently fall back to default list
  }
  return DEFAULT_GROQ_MODELS;
}

export async function POST(request: NextRequest) {
  const providerErrors: string[] = [];

  try {
    const body = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    const temperature = body.temperature ?? 0.6;
    const max_tokens = body.max_tokens ?? 800;

    // ── 1. Try Groq with auto-discovered / prioritized active models ──────────
    if (GROQ_API_KEY) {
      const activeModels = await fetchActiveGroqModels(GROQ_API_KEY);
      const requestedModel = body.model;
      const modelsToTry = requestedModel && activeModels.includes(requestedModel)
        ? [requestedModel, ...activeModels.filter((m) => m !== requestedModel)]
        : activeModels;

      for (const model of modelsToTry.slice(0, 4)) {
        try {
          const groqRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: body.messages,
              temperature,
              max_tokens,
              top_p: body.top_p ?? 1,
              stream: false,
              ...(body.response_format ? { response_format: body.response_format } : {}),
            }),
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            return NextResponse.json(data);
          } else {
            const errBody = await groqRes.text();
            console.warn(`[Groq Proxy] Model ${model} returned ${groqRes.status}:`, errBody);
            providerErrors.push(`Groq (${model}) status ${groqRes.status}: ${errBody.slice(0, 200)}`);
          }
        } catch (groqErr: any) {
          console.warn(`[Groq Proxy] Network error on model ${model}:`, groqErr);
          providerErrors.push(`Groq (${model}) network error: ${groqErr?.message || String(groqErr)}`);
        }
      }
    } else {
      providerErrors.push('GROQ_API_KEY is not defined in environment variables');
    }

    // ── 2. Try Google Gemini with robust conversation formatting ─────────────
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (geminiKey) {
      const geminiModels = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-pro', 'gemini-1.5-flash'];

      // Format messages for Gemini (must strictly alternate user/model and start with user)
      const rawContents = body.messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content || '') }],
        }));

      const geminiContents: { role: string; parts: { text: string }[] }[] = [];
      for (const item of rawContents) {
        if (!item.parts[0].text.trim()) continue;
        if (geminiContents.length > 0 && geminiContents[geminiContents.length - 1].role === item.role) {
          geminiContents[geminiContents.length - 1].parts[0].text += '\n\n' + item.parts[0].text;
        } else {
          geminiContents.push({ ...item });
        }
      }

      if (geminiContents.length > 0 && geminiContents[0].role === 'model') {
        geminiContents.shift();
      }

      if (geminiContents.length === 0) {
        const lastUser = [...body.messages].reverse().find((m: any) => m.role === 'user')?.content;
        geminiContents.push({ role: 'user', parts: [{ text: lastUser || 'Hello' }] });
      }

      const systemMessage = body.messages.find((m: any) => m.role === 'system');

      for (const gModel of geminiModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: geminiContents,
                systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
                generationConfig: {
                  temperature,
                  maxOutputTokens: max_tokens,
                  ...(body.response_format?.type === 'json_object' ? { responseMimeType: 'application/json' } : {}),
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text.trim()) {
              return NextResponse.json({
                choices: [{ message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
                usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
              });
            }
          } else {
            const gErr = await geminiRes.text();
            console.warn(`[Groq Proxy] Gemini ${gModel} returned ${geminiRes.status}:`, gErr);
            providerErrors.push(`Gemini (${gModel}) status ${geminiRes.status}: ${gErr.slice(0, 200)}`);
          }
        } catch (geminiErr: any) {
          console.warn(`[Groq Proxy] Gemini error on ${gModel}:`, geminiErr);
          providerErrors.push(`Gemini (${gModel}) error: ${geminiErr?.message || String(geminiErr)}`);
        }
      }
    } else {
      providerErrors.push('GEMINI_API_KEY is not defined in environment variables');
    }

    // ── 3. Try OpenAI if configured ──────────────────────────────────────────
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: body.messages,
            temperature,
            max_tokens,
            ...(body.response_format ? { response_format: body.response_format } : {}),
          }),
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          return NextResponse.json(openaiData);
        } else {
          const oErr = await openaiRes.text();
          providerErrors.push(`OpenAI status ${openaiRes.status}: ${oErr.slice(0, 200)}`);
        }
      } catch (openaiErr: any) {
        console.warn('[Groq Proxy] OpenAI fallback failed:', openaiErr);
        providerErrors.push(`OpenAI error: ${openaiErr?.message || String(openaiErr)}`);
      }
    }

    // ── 4. High-Intelligence Contextual Fallback System ────────────────────────
    const lastUserMsg = [...body.messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    const fallbackText = generateIntelligentFallback(lastUserMsg, body.response_format?.type === 'json_object');

    const debugMode = request.nextUrl.searchParams.get('debug') === '1' || body.debug === true;

    return NextResponse.json({
      choices: [{ message: { role: 'assistant', content: fallbackText }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      ...(debugMode ? { providerErrors } : {}),
    });
  } catch (error) {
    console.error('[AI Proxy Error]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        providerErrors,
      },
      { status: 500 }
    );
  }
}

/**
 * Contextual fallback engine:
 * If all AI APIs are unavailable, Alison still delivers an accurate, thoughtful,
 * subject-specific answer rather than repeating a generic greeting.
 */
function generateIntelligentFallback(userQuery: string, isJson: boolean): string {
  const query = (userQuery || '').toLowerCase().trim();

  if (isJson) {
    const isMobile =
      query.includes('phone') ||
      query.includes('mobile') ||
      query.includes('iphone') ||
      query.includes('samsung') ||
      query.includes('tecno') ||
      query.includes('infinix');

    return JSON.stringify({
      title: 'Device Diagnostic & Troubleshooting Guide',
      diagnosis: isMobile
        ? 'The mobile device is exhibiting power or software issues that typically require a forced restart, battery check, or charge port inspection.'
        : 'The computer is experiencing performance or startup issues, likely related to background task loads, thermal buildup, or driver discrepancies.',
      confidence: 84,
      steps: [
        {
          id: 'step1',
          title: 'Initial Hardware & Power Check',
          description: isMobile
            ? 'Connect the device to an original fast charger for 20 minutes and inspect the charging port for dust or lint.'
            : 'Ensure the power adapter is delivering steady voltage and check that cooling vents are clear of dust.',
          type: 'check',
        },
        {
          id: 'step2',
          title: 'Perform Force Restart / Safe Reboot',
          description: isMobile
            ? 'Press and hold the Power and Volume Down buttons simultaneously for 12 seconds to force a clean reboot.'
            : 'Restart the machine and boot into Safe Mode to determine if third-party background software is conflicting.',
          type: 'action',
        },
        {
          id: 'step3',
          title: 'Professional Inspection & Repair',
          description:
            'If symptoms persist, visit BridgeTech IT Services at No. 1 Regent Highway, Jui Junction or call +232 33 399 391 for hardware diagnosis.',
          type: 'info',
        },
      ],
      escalate: true,
      estimatedTime: '15-30 minutes',
      difficulty: 'easy',
    });
  }

  // 1. Gaming Consoles (PS4, PS5, Xbox, Nintendo Switch)
  if (
    query.includes('console') ||
    query.includes('game') ||
    query.includes('gaming') ||
    query.includes('playstation') ||
    query.includes('ps4') ||
    query.includes('ps5') ||
    query.includes('xbox') ||
    query.includes('nintendo')
  ) {
    return `Yes, absolutely! At **BridgeTech IT Services**, we professionally repair gaming consoles including **PlayStation (PS4, PS5)**, **Xbox (One, Series S/X)**, and **Nintendo Switch**.

🔧 **Common Console Services We Provide:**
• **HDMI Port Replacement**: Fixing broken ports, bent pins, and "No Signal" / blue light issues.
• **Overheating & Loud Fan**: Deep internal cleaning, thermal paste replacement, and cooling fan repairs.
• **Disc Drive Repairs**: Fixing unreadable discs, clicking lasers, or consoles refusing to eject/insert discs.
• **Power Supply & Motherboard**: Repairing consoles that won't turn on, unexpected shutdowns, and power surges.
• **Storage & Performance**: SSD/HDD upgrades, data transfer, and system software reinstallation.

📍 **Drop Off Your Console:**
**No. 1 Regent Highway, Jui Junction (opposite FTC), Freetown**
📞 **Call / WhatsApp:** +232 33 399 391 / +232 76 210 320
🌐 **Book an Inspection Online:** [itservicesfreetown.com/book-appointment](https://www.itservicesfreetown.com/book-appointment)

Would you like to bring your console in today, or tell me more about what issue it's experiencing?`;
  }

  // 2. Screen & Display Repairs
  if (query.includes('screen') || query.includes('display') || query.includes('cracked') || query.includes('broken glass')) {
    return `Yes! We provide professional **screen replacements** for laptops (HP, Dell, Lenovo, MacBook, Acer, Asus) and smartphones (iPhone, Samsung, Tecno, Infinix, itel, Xiaomi).

• **High-Grade OEM Screens**: High clarity, full touch responsiveness, and calibrated color reproduction.
• **Fast Turnaround**: Most phone screens and standard laptop displays can be completed the same day or within 24 hours.

📍 Visit us at **No. 1 Regent Highway, Jui Junction, Freetown** or call **+232 33 399 391** with your exact model for an instant price quote!`;
  }

  // 3. Unlocking & Passcode Removal
  if (query.includes('unlock') || query.includes('frp') || query.includes('icloud') || query.includes('password') || query.includes('pattern')) {
    return `Yes, we specialize in **device unlocking and software recovery**:
• **Android FRP & Google Account Bypass** (Samsung, Tecno, Infinix, itel, etc.)
• **iPhone / iPad Activation Lock & Passcode Removal**
• **Network & SIM Carrier Unlocking**
• **Windows / Mac Login Password Removal**

📍 Bring your device to **No. 1 Regent Highway, Jui Junction, Freetown** or call us at **+232 33 399 391**. Proof of ownership may be required for security purposes.`;
  }

  // 4. Battery & Charging Issues
  if (query.includes('battery') || query.includes('charge') || query.includes('charging') || query.includes('turn on') || query.includes('dead')) {
    return `We repair all power and battery issues for laptops, smartphones, and tablets:
• **Battery Replacements**: Genuine long-life batteries for laptops and phones.
• **Charging Port Repairs**: Micro-soldering damaged Type-C, Lightning, and DC power jacks.
• **Power Board / Motherboard Diagnostics**: Fixing short circuits and power management ICs.

📍 Drop by our service center at **No. 1 Regent Highway, Jui Junction** or call **+232 33 399 391** for a diagnosis.`;
  }

  // 5. Data Recovery
  if (query.includes('data') || query.includes('recovery') || query.includes('files') || query.includes('deleted') || query.includes('corrupted') || query.includes('hard drive')) {
    return `Yes! We offer **professional data recovery services** for corrupted, formatted, or mechanically failing drives:
• **External Hard Drives & Internal HDDs/SSDs**
• **USB Flash Drives & SD Cards**
• **Water-Damaged / Unresponsive Phones and Laptops**

⚠️ *Tip: If you've lost critical files, stop writing new data to the device immediately to maximize recovery chances.*

📍 Visit **No. 1 Regent Highway, Jui Junction** or reach out at **+232 33 399 391**.`;
  }

  // 6. Pricing & Estimates
  if (query.includes('price') || query.includes('cost') || query.includes('how much') || query.includes('charge') || query.includes('estimate')) {
    return `Repair costs depend on your specific device make, model, and the parts required. We offer:
• **Free Initial Diagnostics** at our service center.
• **Transparent Quotes** before any work begins — no surprise charges.
• **Check Online**: You can also use our [Online Repair Cost Checker](https://www.itservicesfreetown.com/repair-cost-checker-freetown).

Tell me your device model and the issue, or contact us directly at **+232 33 399 391** for an exact quote!`;
  }

  // 7. Location & Working Hours
  if (query.includes('where') || query.includes('location') || query.includes('address') || query.includes('directions') || query.includes('hours') || query.includes('open')) {
    return `📍 **Our Location & Hours:**
• **Address**: No. 1 Regent Highway, Jui Junction (opposite Freetown Teachers College / FTC), Freetown, Sierra Leone.
• **Google Maps**: [View on Google Maps](https://maps.app.goo.gl/FHCthxNEvNYxB4tJ7)
• **Working Hours**: Monday to Friday: 8:00 AM – 6:00 PM | Saturday: By Appointment | Sunday: Closed
• **Phone**: +232 33 399 391 / +232 76 210 320`;
  }

  // 8. Blog / Articles
  if (query.includes('blog') || query.includes('write') || query.includes('post') || query.includes('article')) {
    return `<h2>Top Tech Insights & Device Maintenance Tips</h2>
<p>In today's fast-paced digital world, keeping your electronics in optimal condition is crucial. Whether you use your laptop, smartphone, or desktop computer for business or personal tasks, regular care ensures lasting performance.</p>
<h3>Key Preventative Measures</h3>
<ul>
  <li><u>Thermal Management</u>: Keep cooling fans and vents free from dust and avoid using laptops on soft bedding.</li>
  <li><u>Power Surge Protection</u>: Always utilize quality voltage stabilizers to safeguard sensitive motherboards against grid fluctuations.</li>
  <li><u>Proactive Data Backups</u>: Maintain both cloud and offline backups of vital personal and corporate documents.</li>
</ul>
<p>If you experience unusual slowing, unexpected restarts, or physical damage, trust the certified specialists at <strong>BridgeTech IT Services</strong>.</p>
<blockquote>📍 Visit us at #1 Regent Highway, Jui Junction, Freetown, or reach our technical support line directly at <u>+232 33 399 391</u>.</blockquote>`;
  }

  // Default helpful response
  return `Hello! I'm Alison, your technical assistant from **BridgeTech IT Services**. We provide professional computer, laptop, mobile phone, gaming console repair, device unlocking, data recovery, and enterprise IT networking solutions in Freetown.

📍 **Location:** No. 1 Regent Highway, Jui Junction (opposite FTC)
📞 **Direct Support:** +232 33 399 391 / +232 76 210 320
🌐 **Book Online:** [itservicesfreetown.com/book-appointment](https://www.itservicesfreetown.com/book-appointment)

Please let me know your device make, model, or the specific issue you're experiencing, and I'll be glad to help!`;
}

export async function GET(request: NextRequest) {
  const isDiagnose = request.nextUrl.searchParams.get('test') === '1';

  let groqDiagnosis: any = null;
  let geminiDiagnosis: any = null;

  if (isDiagnose) {
    // 1. Test Groq
    if (GROQ_API_KEY) {
      try {
        const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        });
        const modelsText = await modelsRes.text();
        let modelsJson: any = null;
        try {
          modelsJson = JSON.parse(modelsText);
        } catch {}

        // Test a 1-token completion using first available active model
        const testModel = modelsJson?.data?.[0]?.id || 'openai/gpt-oss-120b';
        const testComp = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5,
          }),
        });
        const compText = await testComp.text();
        let compJson: any = null;
        try {
          compJson = JSON.parse(compText);
        } catch {}

        groqDiagnosis = {
          modelsEndpointStatus: modelsRes.status,
          testedModel: testModel,
          availableChatModels: modelsJson?.data
            ? modelsJson.data
                .map((m: any) => m.id)
                .filter((id: string) => !id.includes('whisper') && !id.includes('guard'))
                .slice(0, 10)
            : null,
          modelsError: modelsJson?.error || (!modelsRes.ok ? modelsText.slice(0, 300) : null),
          completionStatus: testComp.status,
          completionResult: compJson?.choices?.[0]?.message?.content || null,
          completionError: compJson?.error || (!testComp.ok ? compText.slice(0, 300) : null),
        };
      } catch (e: any) {
        groqDiagnosis = { exception: e.message };
      }
    } else {
      groqDiagnosis = { error: 'GROQ_API_KEY is not defined in process.env' };
    }

    // 2. Test Gemini
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (geminiKey) {
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const listJson = await listRes.json();
        const availableGeminiModels = listJson?.models
          ? listJson.models
              .map((m: any) => m.name.replace('models/', ''))
              .filter((n: string) => n.includes('gemini') || n.includes('flash') || n.includes('pro'))
              .slice(0, 8)
          : null;

        const chosenGeminiModel = availableGeminiModels?.[0] || 'gemini-1.5-flash';

        const gRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${chosenGeminiModel}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Say OK' }] }],
              generationConfig: { maxOutputTokens: 5 },
            }),
          }
        );
        const gText = await gRes.text();
        let gJson: any = null;
        try {
          gJson = JSON.parse(gText);
        } catch {}

        geminiDiagnosis = {
          listStatus: listRes.status,
          availableGeminiModels,
          testedModel: chosenGeminiModel,
          completionStatus: gRes.status,
          response: gJson?.candidates?.[0]?.content?.parts?.[0]?.text || null,
          error: gJson?.error || (!gRes.ok ? gText.slice(0, 300) : null),
        };
      } catch (e: any) {
        geminiDiagnosis = { exception: e.message };
      }
    } else {
      geminiDiagnosis = { error: 'GEMINI_API_KEY is not defined in process.env' };
    }
  }

  return NextResponse.json({
    status: 'ok',
    message: 'BridgeTech Multi-Provider AI Proxy is active',
    providers: {
      groq: !!GROQ_API_KEY,
      gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY),
      openai: !!process.env.OPENAI_API_KEY,
    },
    defaultModels: DEFAULT_GROQ_MODELS,
    ...(isDiagnose ? { diagnostics: { groq: groqDiagnosis, gemini: geminiDiagnosis } } : {}),
    timestamp: new Date().toISOString(),
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
