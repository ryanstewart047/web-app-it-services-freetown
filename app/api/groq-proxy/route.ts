import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(request: NextRequest) {
  // Check for API key
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables')
    return NextResponse.json(
      { error: 'API configuration error. Please contact support.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    console.log('Forwarding request to Groq API...')

    // Forward request to Groq API with secure key from environment
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: body.model || 'mixtral-8x7b-32768',
        messages: body.messages,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 1024,
        stream: false,
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

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
