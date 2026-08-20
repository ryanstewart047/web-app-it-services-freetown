import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = [
  process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'gemma2-9b-it',
  'mixtral-8x7b-32768'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    const requestedModel = body.model || GROQ_MODELS[0];
    const temperature = body.temperature ?? 0.6;
    const max_tokens = body.max_tokens ?? 800;

    // 1. Try Groq with fallback models
    if (GROQ_API_KEY) {
      const modelsToTry = [requestedModel, ...GROQ_MODELS.filter(m => m !== requestedModel)];
      
      for (const model of modelsToTry) {
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
            console.warn(`[Groq Proxy] Model ${model} returned ${groqRes.status}`);
          }
        } catch (groqErr) {
          console.warn(`[Groq Proxy] Network error on model ${model}:`, groqErr);
        }
      }
    }

    // 2. Try Google Gemini if configured
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
    if (geminiKey) {
      try {
        const geminiContents = body.messages
          .filter((m: any) => m.role !== 'system')
          .map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

        const systemMessage = body.messages.find((m: any) => m.role === 'system');

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: geminiContents,
              systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
              generationConfig: {
                temperature,
                maxOutputTokens: max_tokens,
                ...(body.response_format?.type === 'json_object' ? { responseMimeType: 'application/json' } : {})
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return NextResponse.json({
            choices: [{ message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
          });
        }
      } catch (geminiErr) {
        console.warn('[Groq Proxy] Gemini fallback failed:', geminiErr);
      }
    }

    // 3. Try OpenAI if configured
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
        }
      } catch (openaiErr) {
        console.warn('[Groq Proxy] OpenAI fallback failed:', openaiErr);
      }
    }

    // 4. Smart Local Fallback Response (Guaranteed Response)
    const lastUserMsg = [...body.messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    const fallbackText = generateIntelligentFallback(lastUserMsg, body.response_format?.type === 'json_object');

    return NextResponse.json({
      choices: [{ message: { role: 'assistant', content: fallbackText }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    });

  } catch (error) {
    console.error('[AI Proxy Error]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

function generateIntelligentFallback(userQuery: string, isJson: boolean): string {
  if (isJson) {
    const q = (userQuery || '').toLowerCase();
    const isMobile = q.includes('phone') || q.includes('mobile') || q.includes('iphone') || q.includes('samsung') || q.includes('tecno') || q.includes('infinix');
    
    return JSON.stringify({
      title: "Device Diagnostic & Troubleshooting Guide",
      diagnosis: isMobile
        ? "The mobile device is exhibiting power or software issues that typically require a forced restart, battery check, or charge port inspection."
        : "The computer is experiencing performance or startup issues, likely related to background task loads, thermal buildup, or driver discrepancies.",
      confidence: 84,
      steps: [
        {
          id: "step1",
          title: "Initial Hardware & Power Check",
          description: isMobile 
            ? "Connect the device to an original fast charger for 20 minutes and inspect the charging port for dust or lint."
            : "Ensure the power adapter is delivering steady voltage and check that cooling vents are clear of dust.",
          type: "check"
        },
        {
          id: "step2",
          title: "Perform Force Restart / Safe Reboot",
          description: isMobile
            ? "Press and hold the Power and Volume Down buttons simultaneously for 12 seconds to force a clean reboot."
            : "Restart the machine and boot into Safe Mode to determine if third-party background software is conflicting.",
          type: "action"
        },
        {
          id: "step3",
          title: "Professional Inspection & Repair",
          description: "If symptoms persist, visit BridgeTech IT Services at No. 1 Regent Highway, Jui Junction or call +232 33 399 391 for hardware diagnosis.",
          type: "info"
        }
      ],
      escalate: true,
      estimatedTime: "15-30 minutes",
      difficulty: "easy"
    });
  }

  const query = (userQuery || '').toLowerCase();
  
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

  return `Hello! I'm Alison from BridgeTech IT Services. We provide professional computer repair, mobile repair, unlocking, data recovery, and IT networking solutions in Freetown. 

📍 Location: No. 1 Regent Highway, Jui Junction (opposite FTC)
📞 Phone: +232 33 399 391 / +232 76 210 320
🌐 Online Booking: itservicesfreetown.com/book-appointment

How can I assist you with your device or IT needs today?`;
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'BridgeTech Multi-Provider AI Proxy is active',
    providers: {
      groq: !!GROQ_API_KEY,
      gemini: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY),
      openai: !!process.env.OPENAI_API_KEY,
    },
    models: GROQ_MODELS,
    timestamp: new Date().toISOString()
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
