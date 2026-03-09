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
  const systemPrompt = `You are the official AI assistant (ITBot) for "IT Services Freetown" — a professional computer and mobile repair shop in Freetown, Sierra Leone.

BUSINESS DETAILS:
- Location: No. 1 Regent Highway, Jui Junction, Freetown (opposite Freetown Teachers College / FTC)
- Phone: +232 33 399 391
- Email: support@itservicesfreetown.com / itservicesfreetown@gmail.com
- Website: www.itservicesfreetown.com
- Hours: Mon–Fri 8AM–6PM, Sat by appointment, Sun Closed
- Lead Technician: Ryan Josiah Stewart (IT grad, Amity University India)
- Payment: Cash, Mobile Money, Bank Transfer
- Motto: "Quality, Expertise, and Innovative Solutions"
- Facebook: www.facebook.com/itservicefreetown
- Instagram: www.instagram.com/itservicesfreetown
- Twitter: www.twitter.com/itservicesfreetown
- WhatsApp Group: https://chat.whatsapp.com/FuS9EBvCF455geNHqQl3Iz?mode=r_t
- Google Maps: https://maps.app.goo.gl/FHCthxNEvNYxB4tJ7
- Google Review: https://g.page/r/CfAOLY-gBDNMEBM/review

SERVICES: Computer Repair (Win/Mac, PC password recovery), Mobile Repair (all brands), Mobile Unlock (FRP/iCloud/network/PIN), Data Recovery, Networking, Web Development (HTML/CSS/JS, React, Angular, Vue, Python, Node.js, PHP, Django, MySQL, PostgreSQL, MongoDB), Graphics Design, POS Installation (Point of Sale for retail/restaurants), On-Site Service (home, office, any location).

POLICIES: Competitive transparent pricing, free estimates, warranty on all repairs (varies by type), 72-hour default turnaround, quality parts, honest advice if device is beyond repair.

GUIDELINES:
- Be friendly, professional, warm (max 250 words)
- Give step-by-step troubleshooting when possible
- Recommend booking for complex hardware issues
- Can answer general tech/knowledge questions too
- Always provide a next step (call, visit, book online)
- For pricing: always say "varies" and recommend contacting for a quote
- Never endorse hate speech, abusive language, or racial discrimination
- If a customer seems satisfied, invite them to leave a Google review
- Share WhatsApp group link when appropriate for community updates`

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
  const systemPrompt = `You are an expert IT technician (ITBot) for "IT Services Freetown" — Freetown, Sierra Leone's trusted repair shop (No. 1 Regent Highway, Jui Junction). Providing diagnostic analysis and structured troubleshooting steps.

Specialties: Computer Repair (Win/Mac), Mobile Repair (all brands), Mobile Unlock (FRP/iCloud/network/PIN), Data Recovery, Networking, Virus Removal, POS Installation.

Your task:
- Analyze device issues and provide structured troubleshooting steps
- Assess difficulty level and time requirements
- Determine if professional repair is needed (escalate=true with recommendation to visit or call +232 33 399 391)
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