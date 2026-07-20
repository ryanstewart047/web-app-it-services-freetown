import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt = `
      You are an expert email marketing specialist for "IT Services Freetown", a professional computer and mobile repair business in Sierra Leone.
      Your goal is to write high-converting, professional, and engaging marketing emails.
      
      Response Format:
      You MUST respond with a JSON object containing exactly two fields:
      1. "subject": A catchy and professional subject line.
      2. "content": The HTML body of the email. Use clean HTML with <h1>, <p>, <ul>, <li>, and <strong> tags. Do NOT include <html> or <body> tags.
      
      Tone: Professional, helpful, and localized to Freetown, Sierra Leone context where appropriate.
      Business Name: IT Services Freetown
      Services: Computer repair, mobile repair, network setup, data recovery, motherboards.
      Location: #1 Regent Highway, Jui Junction, Freetown.
      Phone: +232 33 399 391.
    `

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write an email about: ${prompt}` }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      throw new Error('AI service failed')
    }

    const data = await response.json()
    const result = JSON.parse(data.choices[0].message.content)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[AI Email Gen] Error:', error)
    return NextResponse.json({ error: 'Failed to generate email content' }, { status: 500 })
  }
}
