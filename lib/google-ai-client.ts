/**
 * Client-side Google AI API Integration Service
 * Works directly in the browser for static deployments
 */

const GOOGLE_API_KEY = 'AIzaSyAQ1FUxW3TaMO_6VsXwVvy9O9Sc0e0yDYA'
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

interface GoogleAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface ChatContext {
  userMessage: string
  conversationHistory?: string[]
  systemContext?: string
}

interface TroubleshootingContext {
  deviceType: 'computer' | 'mobile'
  deviceModel?: string
  issueDescription: string
  symptoms?: string[]
}

/**
 * Detect if we're in a static deployment (GitHub Pages)
 */
function isStaticDeployment(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check if we're on GitHub Pages or other static hosting
  const hostname = window.location.hostname
  return hostname.includes('github.io') || 
         hostname.includes('pages.dev') || 
         hostname.includes('netlify.app') ||
         hostname.includes('vercel.app') ||
         // Add your custom domain here
         hostname === 'itservicesfreetown.com'
}

/**
 * Generate AI response for chat support (client-side)
 */
export async function generateChatResponseClient(context: ChatContext): Promise<string> {
  const systemPrompt = `You are a helpful IT support assistant for "IT Services Freetown" - a computer and mobile repair service in Freetown, Sierra Leone. 

Your role:
- Provide technical support and troubleshooting advice
- Help users book appointments and track repairs
- Be friendly, professional, and knowledgeable
- Focus on computer and mobile device issues
- Provide step-by-step solutions when possible
- Know that the business offers same-day repair service with 1-month warranty

Guidelines:
- Keep responses concise but helpful (max 200 words)
- Use clear, simple language
- Suggest booking an appointment for complex hardware issues
- For repair tracking, ask for tracking ID if not provided
- Be empathetic and patient with frustrated customers

Business info:
- Location: Freetown, Sierra Leone
- Services: Computer repair, mobile repair, data recovery, virus removal
- Same-day service available
- 1-month warranty on all repairs

User message: ${context.userMessage}

Please provide a helpful response:`

  try {
    console.log('Calling Google AI API (client-side) for chat:', context.userMessage)
    
    const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }]
      })
    })

    console.log('Google AI API response status (client-side):', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google API error response:', errorText)
      throw new Error(`Google API error: ${response.status} - ${errorText}`)
    }

    const data: GoogleAIResponse = await response.json()
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text
      console.log('AI chat response (client-side):', responseText)
      return responseText
    }
    
    throw new Error('No response generated')
  } catch (error) {
    console.error('Error calling Google AI API (client-side):', error)
    throw new Error('Failed to generate AI response')
  }
}

/**
 * Generate AI troubleshooting diagnosis (client-side)
 */
export async function generateTroubleshootingResponseClient(context: TroubleshootingContext): Promise<{
  diagnosis: string
  confidence: number
  steps: Array<{
    id: string
    title: string
    description: string
    type: 'check' | 'action' | 'info'
  }>
  escalate: boolean
  estimatedTime: string
  difficulty: 'easy' | 'medium' | 'hard'
}> {
  const systemPrompt = `You are an expert IT technician for "IT Services Freetown" providing diagnostic analysis and troubleshooting steps.

Your task:
- Analyze device issues and provide structured troubleshooting steps
- Assess difficulty level and time requirements
- Determine if professional repair is needed
- Focus on ${context.deviceType} devices

Device: ${context.deviceType}
${context.deviceModel ? `Model: ${context.deviceModel}` : ''}
Issue: ${context.issueDescription}

Provide a JSON response with this structure:
{
  "diagnosis": "Brief explanation of likely cause",
  "confidence": 85,
  "steps": [
    {
      "id": "step1",
      "title": "Step title",
      "description": "Detailed instructions",
      "type": "check"
    }
  ],
  "escalate": false,
  "estimatedTime": "15-30 minutes",
  "difficulty": "easy"
}

Provide 3-6 troubleshooting steps. Be specific and practical. Response must be valid JSON only.`

  try {
    console.log('Calling Google AI API (client-side) for troubleshooting:', context)
    
    const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }]
      })
    })

    console.log('Google AI API response status (client-side):', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google API error response:', errorText)
      throw new Error(`Google API error: ${response.status} - ${errorText}`)
    }

    const data: GoogleAIResponse = await response.json()
    console.log('Google AI API response data (client-side):', data)
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text
      console.log('AI troubleshooting response text (client-side):', responseText)
      
      // Try to parse JSON response
      try {
        // Clean up the response text (remove markdown code blocks if present)
        const cleanResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
        console.log('Cleaned response for parsing (client-side):', cleanResponse)
        
        const parsedResponse = JSON.parse(cleanResponse)
        
        // Validate required fields
        if (!parsedResponse.diagnosis || !parsedResponse.steps || !Array.isArray(parsedResponse.steps)) {
          console.error('Invalid response structure (client-side):', parsedResponse)
          throw new Error('Invalid response structure')
        }
        
        console.log('Successfully parsed AI response (client-side):', parsedResponse)
        return parsedResponse
      } catch (parseError) {
        console.error('Error parsing JSON response (client-side):', parseError)
        console.log('Original response text:', responseText)
        
        // Fallback response if JSON parsing fails
        return {
          diagnosis: `Based on your ${context.deviceType} issue: "${context.issueDescription}", this requires systematic troubleshooting.`,
          confidence: 70,
          steps: [
            {
              id: 'step1',
              title: 'Initial Assessment',
              description: 'Check if the device shows any visible signs of damage or unusual behavior patterns.',
              type: 'check' as const
            },
            {
              id: 'step2',
              title: 'Basic Restart',
              description: 'Power off the device completely, wait 30 seconds, then power it back on.',
              type: 'action' as const
            },
            {
              id: 'step3',
              title: 'Professional Diagnosis',
              description: 'If the issue persists, bring your device to IT Services Freetown for professional assessment.',
              type: 'info' as const
            }
          ],
          escalate: true,
          estimatedTime: '15-30 minutes',
          difficulty: 'medium' as const
        }
      }
    }
    
    throw new Error('No response generated')
  } catch (error) {
    console.error('Error calling Google AI API for troubleshooting (client-side):', error)
    throw new Error('Failed to generate troubleshooting response')
  }
}

/**
 * Check if a message is related to repair tracking
 */
export function isRepairTrackingQueryClient(message: string): boolean {
  const trackingKeywords = ['track', 'tracking', 'status', 'repair status', 'order', 'trk-', 'where is my']
  return trackingKeywords.some(keyword => message.toLowerCase().includes(keyword))
}

/**
 * Extract tracking ID from message
 */
export function extractTrackingIdClient(message: string): string | null {
  // Look for patterns like TRK-001, TRK001, or similar
  const trackingPattern = /\b(TRK[-]?\d+)\b/i
  const match = message.match(trackingPattern)
  return match ? match[1].toUpperCase() : null
}

/**
 * Mock repair tracking data
 */
const mockRepairDataClient: Record<string, any> = {
  'TRK-001': {
    trackingId: 'TRK-001',
    device: 'iPhone 12',
    issue: 'Cracked screen replacement',
    status: 'In Progress',
    estimatedCompletion: '2025-09-26',
    technician: 'John Doe',
    notes: 'Screen ordered, will be replaced tomorrow morning'
  },
  'TRK-002': {
    trackingId: 'TRK-002',
    device: 'Dell Laptop',
    issue: 'Virus removal and system cleanup',
    status: 'Completed',
    estimatedCompletion: '2025-09-25',
    technician: 'Jane Smith',
    notes: 'System cleaned and optimized. Ready for pickup.'
  }
}

/**
 * Handle repair tracking queries (client-side)
 */
export function handleRepairTrackingClient(message: string): {
  response: string
  source: string
  trackingData?: any
} {
  const trackingId = extractTrackingIdClient(message)
  
  if (trackingId && mockRepairDataClient[trackingId]) {
    const repairData = mockRepairDataClient[trackingId]
    const trackingResponse = `📋 **Repair Status for ${trackingId}**

**Device:** ${repairData.device}
**Issue:** ${repairData.issue}
**Status:** ${repairData.status}
**Technician:** ${repairData.technician}
**Est. Completion:** ${repairData.estimatedCompletion}

**Notes:** ${repairData.notes}

${repairData.status === 'Completed' ? '✅ Your device is ready for pickup!' : '⏳ We\'ll notify you when it\'s ready.'}

Need more details? Call us or visit our location.`

    return {
      response: trackingResponse,
      source: 'repair_tracking',
      trackingData: repairData
    }
  } else if (trackingId) {
    return {
      response: `❌ Sorry, I couldn't find a repair with tracking ID "${trackingId}". Please double-check the ID or contact us for assistance.

Valid format examples: TRK-001, TRK-002, etc.`,
      source: 'repair_tracking'
    }
  } else {
    return {
      response: `🔍 To track your repair, please provide your tracking ID (format: TRK-XXX).

You can find this ID on your repair receipt or in the confirmation email we sent you.

Don't have your tracking ID? No problem! Contact us with your name and phone number, and we'll look it up for you.`,
      source: 'repair_tracking'
    }
  }
}

/**
 * Export the detection function
 */
export { isStaticDeployment }