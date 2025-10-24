// Simplified test endpoint to debug the issue
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    
    return res.status(200).json({
      status: 'ok',
      message: 'Simple groq test endpoint',
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      method: req.method,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return res.status(500).json({
      error: 'Error in handler',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
