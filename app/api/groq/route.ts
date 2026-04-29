import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// 🟢 ACTIVE: Groq API
// ============================================================
const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

// ============================================================
// 🔴 GEMINI (commented out — uncomment to switch back)
// ============================================================
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY
// const GEMINI_MODEL = 'gemini-1.5-flash'
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export async function POST(request: NextRequest) {

  // ── Groq key check ───────────────────────────────────────
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables')
    return NextResponse.json(
      { error: 'API configuration error. Please contact support.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    console.log('Forwarding request to Groq API...')

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: body.messages,
        temperature: body.temperature || 0.6,
        max_tokens: body.max_tokens || 512,
        top_p: body.top_p || 1,
        stream: false,
        ...(body.response_format ? { response_format: body.response_format } : {}),
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Groq API error:', response.status, errorData)
      return NextResponse.json(
        { error: 'AI service temporarily unavailable', details: response.statusText },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Successfully received response from Groq API')
    return NextResponse.json(data)

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// ── Gemini POST logic (commented out) ───────────────────────
// To switch back to Gemini, uncomment the constants above and replace
// the POST handler with the Gemini version below.
//
// const geminiContents = conversationMessages.map((msg) => ({
//   role: msg.role === 'assistant' ? 'model' : 'user',
//   parts: [{ text: msg.content }]
// }))
// const geminiBody = {
//   contents: geminiContents,
//   systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
//   generationConfig: { temperature: 0.6, maxOutputTokens: 512, topP: 1 }
// }
// const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//   method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(geminiBody)
// })
// const geminiData = await res.json()
// const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
// return NextResponse.json({ choices: [{ message: { role: 'assistant', content: text }, finish_reason: 'stop' }] })

// Handle GET for health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Groq AI proxy is running',
    hasApiKey: !!GROQ_API_KEY,
    model: GROQ_MODEL,
    timestamp: new Date().toISOString()
  })
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
