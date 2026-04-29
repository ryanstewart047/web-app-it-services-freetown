import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// 🟢 ACTIVE: Google Gemini API
// ============================================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-1.5-flash'  // Higher free quota: 60 req/min vs 15 for 2.0-flash
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ============================================================
// 🔴 GROQ (commented out — uncomment to switch back)
// ============================================================
// const GROQ_API_KEY = process.env.GROQ_API_KEY
// const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(request: NextRequest) {

  // ── Gemini key check ─────────────────────────────────────
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables')
    return NextResponse.json(
      { error: 'API configuration error. Please contact support.' },
      { status: 500 }
    )
  }

  // ── Groq key check (commented out) ──────────────────────
  // if (!GROQ_API_KEY) {
  //   console.error('GROQ_API_KEY is not set in environment variables')
  //   return NextResponse.json(
  //     { error: 'API configuration error. Please contact support.' },
  //     { status: 500 }
  //   )
  // }

  try {
    const body = await request.json()

    // Validate request body (same format as before — OpenAI style)
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    // ── Convert OpenAI-style messages → Gemini format ────────
    // Extract system message and user/assistant messages separately
    const systemMessage = body.messages.find((m: any) => m.role === 'system')
    const conversationMessages = body.messages.filter((m: any) => m.role !== 'system')

    const geminiContents = conversationMessages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const geminiBody: any = {
      contents: geminiContents,
      generationConfig: {
        temperature: body.temperature || 0.6,
        maxOutputTokens: body.max_tokens || 512,
        topP: body.top_p || 1,
      }
    }

    // Add system instruction if present
    if (systemMessage) {
      geminiBody.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      }
    }

    // If JSON mode was requested, tell Gemini to respond in JSON
    if (body.response_format?.type === 'json_object') {
      geminiBody.generationConfig.responseMimeType = 'application/json'
    }

    console.log('Forwarding request to Google Gemini API...')

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', response.status, errorData)

      // On rate limit, retry once after a short delay
      if (response.status === 429) {
        console.warn('Gemini rate limit hit, retrying after 2s...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        const retry = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody),
        })
        if (!retry.ok) {
          const retryError = await retry.text()
          console.error('Gemini retry also failed:', retry.status, retryError)
          return NextResponse.json(
            { error: 'AI service temporarily unavailable — rate limit exceeded. Please try again in a moment.', details: retry.statusText },
            { status: 429 }
          )
        }
        const retryData = await retry.json()
        const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text || ''
        return NextResponse.json({
          choices: [{ message: { role: 'assistant', content: retryText }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        })
      }

      return NextResponse.json(
        { error: 'AI service temporarily unavailable', details: response.statusText },
        { status: response.status }
      )
    }

    const geminiData = await response.json()
    console.log('Successfully received response from Gemini API')

    // ── Convert Gemini response → OpenAI-style format ────────
    // So the client code needs zero changes
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const openAIStyleResponse = {
      choices: [
        {
          message: { role: 'assistant', content: text },
          finish_reason: geminiData.candidates?.[0]?.finishReason || 'stop'
        }
      ],
      usage: {
        prompt_tokens: geminiData.usageMetadata?.promptTokenCount || 0,
        completion_tokens: geminiData.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: geminiData.usageMetadata?.totalTokenCount || 0,
      }
    }

    return NextResponse.json(openAIStyleResponse)

    // ── Groq forwarding logic (commented out) ────────────────
    // const response = await fetch(GROQ_API_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${GROQ_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: body.model || 'mixtral-8x7b-32768',
    //     messages: body.messages,
    //     temperature: body.temperature || 0.7,
    //     max_tokens: body.max_tokens || 1024,
    //     stream: false,
    //   }),
    // })
    // if (!response.ok) {
    //   const errorData = await response.text()
    //   console.error('Groq API error:', response.status, errorData)
    //   return NextResponse.json(
    //     { error: 'AI service temporarily unavailable', details: response.statusText },
    //     { status: response.status }
    //   )
    // }
    // const data = await response.json()
    // console.log('Successfully received response from Groq API')
    // return NextResponse.json(data)

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

// Handle GET for testing/health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'AI proxy is running (Google Gemini)',
    hasApiKey: !!GEMINI_API_KEY,
    model: GEMINI_MODEL,
    timestamp: new Date().toISOString()
  })

  // Groq health check (commented out)
  // return NextResponse.json({
  //   status: 'ok',
  //   message: 'Groq AI proxy is running',
  //   hasApiKey: !!GROQ_API_KEY,
  //   timestamp: new Date().toISOString()
  // })
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

