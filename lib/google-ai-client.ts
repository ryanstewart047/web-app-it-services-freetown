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
    console.log('🔍 [CLIENT-SIDE] Calling Google AI API for chat:', context.userMessage)
    console.log('🔑 [CLIENT-SIDE] API Key available:', GOOGLE_API_KEY ? 'Yes' : 'No')
    console.log('🌐 [CLIENT-SIDE] API URL:', GOOGLE_API_URL)
    
    const requestBody = {
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }]
    }
    console.log('📤 [CLIENT-SIDE] Request body:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 [CLIENT-SIDE] Google AI API response status:', response.status)
    console.log('📥 [CLIENT-SIDE] Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CLIENT-SIDE] Google API error response:', errorText)
      throw new Error(`Google API error: ${response.status} - ${errorText}`)
    }

    const data: GoogleAIResponse = await response.json()
    console.log('✅ [CLIENT-SIDE] Google AI API response data:', data)
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text
      console.log('💬 [CLIENT-SIDE] AI chat response:', responseText)
      return responseText
    }
    
    throw new Error('No response generated')
  } catch (error) {
    console.error('❌ [CLIENT-SIDE] Error calling Google AI API:', error)
    console.log('🔄 [CLIENT-SIDE] Using fallback response for:', context.userMessage)
    
    // Provide a contextual fallback response based on the user's message
    const fallbackResponse = generateFallbackChatResponse(context.userMessage)
    return fallbackResponse
  }
}

/**
 * Generate contextual fallback response for chat when AI API fails
 */
function generateFallbackChatResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  
  // Device issues
  if (msg.includes('slow') || msg.includes('performance')) {
    return `I understand you're experiencing performance issues. Here are some quick tips:

🔧 **Quick Fixes:**
• Restart your device
• Close unnecessary applications
• Check available storage space
• Run a virus scan if it's a computer

For thorough diagnosis and professional repair, visit IT Services Freetown. We offer same-day service with a 1-month warranty!

Need immediate help? Call **+23233399391** or visit our location in Freetown.`
  }
  
  // Won't turn on issues
  if (msg.includes("won't turn on") || msg.includes("not starting") || msg.includes("dead")) {
    return `Power issues can be tricky! Here's what to try:

🔋 **Power Troubleshooting:**
• Check if the power cable/charger is working
• Try a different power outlet
• For laptops: Remove battery, hold power button for 30 seconds
• For phones: Try charging for 30 minutes before attempting to turn on

If these steps don't work, bring your device to IT Services Freetown for professional diagnosis. We specialize in power-related repairs!`
  }
  
  // Screen issues
  if (msg.includes('screen') || msg.includes('display') || msg.includes('cracked')) {
    return `Screen problems need professional attention:

📱💻 **Screen Issues:**
• Cracked screens should be replaced promptly to prevent further damage
• Display problems could be hardware or software related
• Black screens may indicate power or connection issues

Visit IT Services Freetown for screen repairs and replacements. We use quality parts and offer same-day service with a 1-month warranty.

📍 Located in Freetown - bringing your device in for assessment is the best approach for screen issues.`
  }
  
  // Booking appointments
  if (msg.includes('appointment') || msg.includes('book') || msg.includes('schedule')) {
    return `📅 **Booking Your Repair Appointment:**

We make it easy to get your device fixed:
• Same-day service available
• 1-month warranty on all repairs
• Professional technicians
• Competitive pricing

To book your appointment:
📞 Call **+23233399391**
📍 Visit our location in Freetown
💬 Use the chat button on our website

What type of device needs repair? I can provide more specific guidance for your situation.`
  }
  
  // Default helpful response
  return `Thank you for contacting IT Services Freetown! 👋

I'm here to help with your tech issues. While I'm having trouble with my advanced AI features right now, I can still assist you:

🛠️ **Our Services:**
• Computer repair (hardware & software)
• Mobile device repair
• Data recovery
• Virus removal
• Same-day service with 1-month warranty

📞 **Get Immediate Help:**
• Call **+23233399391** for urgent issues
• Visit our location in Freetown
• Use our troubleshooting tool for step-by-step guidance

What specific issue are you experiencing? I'll do my best to help!`
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
    console.log('🔍 [CLIENT-SIDE] Calling Google AI API for troubleshooting:', context)
    console.log('🔑 [CLIENT-SIDE] API Key available:', GOOGLE_API_KEY ? 'Yes' : 'No')
    
    const requestBody = {
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }]
    }
    console.log('📤 [CLIENT-SIDE] Request body preview:', {
      deviceType: context.deviceType,
      issue: context.issueDescription,
      promptLength: systemPrompt.length
    })
    
    const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 [CLIENT-SIDE] Google AI API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CLIENT-SIDE] Google API error response:', errorText)
      
      // Check for specific error types
      if (response.status === 403) {
        console.error('🚫 [CLIENT-SIDE] API Key may be invalid or lacks permissions')
      } else if (response.status === 400) {
        console.error('📝 [CLIENT-SIDE] Bad request - check API format')
      } else {
        console.error('🌐 [CLIENT-SIDE] Network or CORS error likely')
      }
      
      throw new Error(`Google API error: ${response.status} - ${errorText}`)
    }

    const data: GoogleAIResponse = await response.json()
    console.log('✅ [CLIENT-SIDE] Google AI API response received:', !!data.candidates)
    
    if (data.candidates && data.candidates.length > 0) {
      const responseText = data.candidates[0].content.parts[0].text
      console.log('🛠️ [CLIENT-SIDE] AI troubleshooting response length:', responseText.length)
      
      // Try to parse JSON response
      try {
        // Clean up the response text (remove markdown code blocks if present)
        const cleanResponse = responseText.replace(/```json\n?|\n?```/g, '').trim()
        console.log('🧹 [CLIENT-SIDE] Cleaned response preview:', cleanResponse.substring(0, 200) + '...')
        
        const parsedResponse = JSON.parse(cleanResponse)
        
        // Validate required fields
        if (!parsedResponse.diagnosis || !parsedResponse.steps || !Array.isArray(parsedResponse.steps)) {
          console.error('❌ [CLIENT-SIDE] Invalid response structure:', parsedResponse)
          throw new Error('Invalid response structure')
        }
        
        console.log('✅ [CLIENT-SIDE] Successfully parsed AI response with', parsedResponse.steps?.length, 'steps')
        return parsedResponse
      } catch (parseError) {
        console.error('❌ [CLIENT-SIDE] Error parsing JSON response:', parseError)
        console.log('📄 [CLIENT-SIDE] Raw response text:', responseText)
        
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
    console.error('❌ [CLIENT-SIDE] Error calling Google AI API for troubleshooting:', error)
    console.log('🔄 [CLIENT-SIDE] Using contextual fallback for:', context.deviceType, '-', context.issueDescription)
    
    // Generate a comprehensive fallback response based on the context
    return generateFallbackTroubleshootingResponse(context)
  }
}

/**
 * Generate contextual fallback troubleshooting response when AI API fails
 */
function generateFallbackTroubleshootingResponse(context: TroubleshootingContext): {
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
} {
  const { deviceType, issueDescription } = context
  const issue = issueDescription.toLowerCase()
  
  // Computer-specific troubleshooting
  if (deviceType === 'computer') {
    // Blue screen issues
    if (issue.includes('blue screen') || issue.includes('bsod')) {
      return {
        diagnosis: "Blue Screen of Death (BSOD) typically indicates a system error, often related to hardware conflicts, driver issues, or memory problems.",
        confidence: 85,
        steps: [
          {
            id: 'step1',
            title: 'Note Error Code',
            description: 'Write down the error code displayed on the blue screen (e.g., SYSTEM_SERVICE_EXCEPTION).',
            type: 'check'
          },
          {
            id: 'step2',
            title: 'Safe Mode Boot',
            description: 'Restart and press F8 repeatedly during boot to access Safe Mode options.',
            type: 'action'
          },
          {
            id: 'step3',
            title: 'Update Drivers',
            description: 'In Safe Mode, update or roll back recently installed drivers.',
            type: 'action'
          },
          {
            id: 'step4',
            title: 'Memory Test',
            description: 'Run Windows Memory Diagnostic to check for RAM issues.',
            type: 'action'
          },
          {
            id: 'step5',
            title: 'Professional Diagnosis',
            description: 'If BSOD persists, bring to IT Services Freetown for hardware testing and professional repair.',
            type: 'info'
          }
        ],
        escalate: true,
        estimatedTime: '30-60 minutes',
        difficulty: 'hard'
      }
    }
    
    // Slow performance
    if (issue.includes('slow') || issue.includes('performance') || issue.includes('lag')) {
      return {
        diagnosis: "Slow computer performance can be caused by insufficient RAM, full storage, malware, or outdated hardware.",
        confidence: 80,
        steps: [
          {
            id: 'step1',
            title: 'Check Available Storage',
            description: 'Ensure you have at least 15% free space on your main drive (C:).',
            type: 'check'
          },
          {
            id: 'step2',
            title: 'Task Manager Review',
            description: 'Press Ctrl+Shift+Esc to open Task Manager and check which programs are using high CPU/Memory.',
            type: 'check'
          },
          {
            id: 'step3',
            title: 'Disable Startup Programs',
            description: 'In Task Manager > Startup tab, disable unnecessary programs from starting with Windows.',
            type: 'action'
          },
          {
            id: 'step4',
            title: 'Run Antivirus Scan',
            description: 'Perform a full system scan to check for malware or viruses.',
            type: 'action'
          },
          {
            id: 'step5',
            title: 'Professional Cleanup',
            description: 'For persistent issues, visit IT Services Freetown for professional system optimization.',
            type: 'info'
          }
        ],
        escalate: false,
        estimatedTime: '45-90 minutes',
        difficulty: 'medium'
      }
    }
    
    // Won't turn on
    if (issue.includes("won't turn on") || issue.includes("not starting") || issue.includes("dead")) {
      return {
        diagnosis: "Computer power issues can stem from power supply failure, motherboard problems, or loose connections.",
        confidence: 75,
        steps: [
          {
            id: 'step1',
            title: 'Check Power Connections',
            description: 'Ensure power cable is securely connected to both computer and wall outlet.',
            type: 'check'
          },
          {
            id: 'step2',
            title: 'Try Different Outlet',
            description: 'Test the power cable in a different working electrical outlet.',
            type: 'action'
          },
          {
            id: 'step3',
            title: 'Battery Reset (Laptops)',
            description: 'Remove battery, hold power button for 30 seconds, reconnect battery and try starting.',
            type: 'action'
          },
          {
            id: 'step4',
            title: 'Listen for Fans/Sounds',
            description: 'Note if you hear any fans, beeps, or see any lights when pressing power button.',
            type: 'check'
          },
          {
            id: 'step5',
            title: 'Professional Diagnosis',
            description: 'Power issues often require hardware testing. Bring to IT Services Freetown for diagnosis.',
            type: 'info'
          }
        ],
        escalate: true,
        estimatedTime: '15-30 minutes',
        difficulty: 'medium'
      }
    }
  }
  
  // Mobile-specific troubleshooting
  if (deviceType === 'mobile') {
    // Battery issues
    if (issue.includes('battery') || issue.includes('drain') || issue.includes('charge')) {
      return {
        diagnosis: "Battery issues can be caused by background apps, old battery, charging port problems, or software issues.",
        confidence: 85,
        steps: [
          {
            id: 'step1',
            title: 'Check Battery Usage',
            description: 'Go to Settings > Battery to see which apps are consuming the most power.',
            type: 'check'
          },
          {
            id: 'step2',
            title: 'Close Background Apps',
            description: 'Force close apps running in the background that you\'re not currently using.',
            type: 'action'
          },
          {
            id: 'step3',
            title: 'Try Different Charger',
            description: 'Test with a different charging cable and adapter to rule out charger issues.',
            type: 'action'
          },
          {
            id: 'step4',
            title: 'Restart Device',
            description: 'Power off completely and restart to clear any software issues.',
            type: 'action'
          },
          {
            id: 'step5',
            title: 'Professional Assessment',
            description: 'If battery still drains quickly, visit IT Services Freetown for battery replacement.',
            type: 'info'
          }
        ],
        escalate: issue.includes("won't charge"),
        estimatedTime: '20-40 minutes',
        difficulty: 'easy'
      }
    }
    
    // Screen issues
    if (issue.includes('screen') || issue.includes('display') || issue.includes('cracked')) {
      return {
        diagnosis: "Screen problems require professional repair, especially cracked screens which can worsen over time.",
        confidence: 90,
        steps: [
          {
            id: 'step1',
            title: 'Assess Damage',
            description: 'Note if the screen is cracked, unresponsive, or displaying incorrectly.',
            type: 'check'
          },
          {
            id: 'step2',
            title: 'Protect Screen',
            description: 'Apply screen protector or tape over cracks to prevent cuts and further damage.',
            type: 'action'
          },
          {
            id: 'step3',
            title: 'Test Touch Response',
            description: 'Check if touch functionality works in different areas of the screen.',
            type: 'check'
          },
          {
            id: 'step4',
            title: 'Backup Data',
            description: 'If screen works partially, backup important data immediately.',
            type: 'action'
          },
          {
            id: 'step5',
            title: 'Professional Repair',
            description: 'Visit IT Services Freetown for screen replacement - we use quality parts with warranty.',
            type: 'info'
          }
        ],
        escalate: true,
        estimatedTime: '10-20 minutes (assessment)',
        difficulty: 'easy'
      }
    }
  }
  
  // Generic fallback for any other issues
  return {
    diagnosis: `This ${deviceType} issue: "${issueDescription}" requires systematic troubleshooting to identify the root cause.`,
    confidence: 70,
    steps: [
      {
        id: 'step1',
        title: 'Document the Problem',
        description: 'Note exactly when the issue occurs, any error messages, and what you were doing when it started.',
        type: 'check'
      },
      {
        id: 'step2',
        title: 'Restart Device',
        description: 'Power off the device completely, wait 30 seconds, then power it back on.',
        type: 'action'
      },
      {
        id: 'step3',
        title: 'Check for Updates',
        description: 'Ensure your operating system and apps are updated to the latest versions.',
        type: 'action'
      },
      {
        id: 'step4',
        title: 'Test in Safe Mode',
        description: 'Try using the device in safe mode to see if the issue persists.',
        type: 'action'
      },
      {
        id: 'step5',
        title: 'Professional Diagnosis',
        description: 'For complex issues, bring your device to IT Services Freetown for expert diagnosis and repair.',
        type: 'info'
      }
    ],
    escalate: true,
    estimatedTime: '30-45 minutes',
    difficulty: 'medium'
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