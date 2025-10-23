/**
 * Google AI API Integration Service
 * Handles communication with Google's Generative AI API
 */

const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY || 'AIzaSyAQ1FUxW3TaMO_6VsXwVvy9O9Sc0e0yDYA'
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

// Validate API key at startup
if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your-api-key-here') {
  console.error('Google AI API key is not properly configured')
}

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
 * Generate AI response for chat support
 */
export async function generateChatResponse(context: ChatContext): Promise<string> {
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
- 1-month warranty on all repairs`

  const prompt = `${systemPrompt}\n\nUser message: ${context.userMessage}\n\nPlease provide a helpful response:`

  try {
    const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`)
    }

    const data: GoogleAIResponse = await response.json()
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text
    }
    
    throw new Error('No response generated')
  } catch (error) {
    console.error('Error calling Google AI API:', error)
    throw new Error('Failed to generate AI response')
  }
}

/**
 * Generate AI troubleshooting diagnosis
 */
export async function generateTroubleshootingResponse(context: TroubleshootingContext): Promise<{
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
  "confidence": 85, // percentage 0-100
  "steps": [
    {
      "id": "step1",
      "title": "Step title",
      "description": "Detailed instructions",
      "type": "check" // or "action" or "info"
    }
  ],
  "escalate": false, // true if needs professional repair
  "estimatedTime": "15-30 minutes",
  "difficulty": "easy" // easy, medium, or hard
}

Provide 3-6 troubleshooting steps. Be specific and practical.`

  try {
    console.log('Calling Google AI API for troubleshooting:', { deviceType: context.deviceType, issueDescription: context.issueDescription })
    
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

    console.log('Google AI API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google API error response:', errorText)
      throw new Error(`Google API error: ${response.status} - ${errorText}`)
    }

    const data: GoogleAIResponse = await response.json()
    console.log('Google AI API response data:', JSON.stringify(data, null, 2))
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text
      console.log('AI response text:', responseText)
      
      // Try to parse JSON response
      try {
        // Clean up the response text (remove markdown code blocks if present)
        const cleanResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
        console.log('Cleaned response for parsing:', cleanResponse)
        
        const parsedResponse = JSON.parse(cleanResponse)
        
        // Validate required fields
        if (!parsedResponse.diagnosis || !parsedResponse.steps || !Array.isArray(parsedResponse.steps)) {
          console.error('Invalid response structure:', parsedResponse)
          throw new Error('Invalid response structure')
        }
        
        console.log('Successfully parsed AI response:', parsedResponse)
        return parsedResponse
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError)
        console.log('Original response text:', responseText)
        
        // Fallback response if JSON parsing fails
        return {
          diagnosis: responseText.substring(0, 200) + '...',
          confidence: 70,
          steps: [
            {
              id: 'step1',
              title: 'Initial Check',
              description: 'Follow the troubleshooting advice provided above',
              type: 'check' as const
            }
          ],
          escalate: true,
          estimatedTime: '30-45 minutes',
          difficulty: 'medium' as const
        }
      }
    }
    
    throw new Error('No response generated')
  } catch (error) {
    console.error('Error calling Google AI API for troubleshooting:', error)
    throw new Error('Failed to generate troubleshooting response')
  }
}

/**
 * Check if a message is related to repair tracking
 */
export function isRepairTrackingQuery(message: string): boolean {
  const trackingKeywords = ['track', 'tracking', 'status', 'repair status', 'order', 'trk-', 'where is my']
  return trackingKeywords.some(keyword => message.toLowerCase().includes(keyword))
}

/**
 * Extract tracking ID from message
 */
export function extractTrackingId(message: string): string | null {
  // Look for patterns like TRK-001, TRK001, or similar
  const trackingPattern = /\b(TRK[-]?\d+)\b/i
  const match = message.match(trackingPattern)
  return match ? match[1].toUpperCase() : null
}