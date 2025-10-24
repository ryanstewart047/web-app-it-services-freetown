// Pages Router API - Always uses Node.js runtime
import type { NextApiRequest, NextApiResponse } from 'next'

// Explicitly disable Edge runtime
export const config = {
  runtime: 'nodejs',
}

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  // Handle GET for health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Groq AI proxy is running',
      hasApiKey: !!GROQ_API_KEY,
      timestamp: new Date().toISOString()
    })
  }

  // Handle POST for AI requests
  if (req.method === 'POST') {
    // Check for API key
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set in environment variables')
      return res.status(500).json({
        error: 'API configuration error. Please contact support.'
      })
    }

    try {
      const body = req.body
      
      // Validate request body
      if (!body.messages || !Array.isArray(body.messages)) {
        return res.status(400).json({
          error: 'Invalid request: messages array required'
        })
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
        return res.status(response.status).json({
          error: 'AI service temporarily unavailable',
          details: response.statusText
        })
      }

      const data = await response.json()
      console.log('Successfully received response from Groq API')
      
      return res.status(200).json(data)

    } catch (error) {
      console.error('Proxy error:', error)
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' })
}
