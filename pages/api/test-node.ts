// Using Pages Router API format which defaults to Node.js runtime
import type { NextApiRequest, NextApiResponse } from 'next'

// Explicitly disable Edge runtime
export const config = {
  runtime: 'nodejs',
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    status: 'ok',
    message: 'Pages Router API test - Node.js runtime',
    timestamp: new Date().toISOString(),
    runtime: 'nodejs'
  })
}
