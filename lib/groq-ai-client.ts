/**
 * Client-side AI API Integration Service (Groq via Backend Proxy)
 * 🟢 ACTIVE: Groq llama-3.3-70b-specdec
 * SECURITY: API calls go through backend proxy to protect the API key
 */

const GROQ_PROXY_URL = '/api/groq'

// 🟢 ACTIVE: Groq
// 🔴 GEMINI (commented out — uncomment to switch back)
// const GEMINI_MODEL = 'gemini-1.5-flash'

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ConversationHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

interface GroqAPIResponse {
  choices: Array<{
    message: {
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface ChatContext {
  userMessage: string
  conversationHistory?: Array<string | ConversationHistoryMessage>
  systemContext?: string
}

interface CustomerLookupOptions {
  allowBareName?: boolean
}

interface TroubleshootingContext {
  deviceType: 'computer' | 'mobile'
  deviceModel?: string
  issueDescription: string
  symptoms?: string[]
}

/**
 * Detect if we should use client-side AI
 * For static exports, we always use client-side AI
 */
function isStaticDeployment(): boolean {
  // Always use client-side AI for static export deployments
  // This includes local dev, GitHub Pages, and custom domains
  return true
}

function normalizeConversationHistory(history?: Array<string | ConversationHistoryMessage>): ConversationHistoryMessage[] {
  if (!history) return []

  return history
    .map((entry) => {
      if (typeof entry === 'string') {
        return { role: 'user' as const, content: entry }
      }

      return {
        role: entry.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: entry.content
      }
    })
    .filter((entry) => entry.content.trim().length > 0)
    .slice(-12)
}

/**
 * Perform a lightweight, non-blocking DuckDuckGo web search for out-of-context/external queries
 */
async function searchWebForQuery(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const data = await res.json()

    if (data.AbstractText && data.AbstractText.trim().length > 0) {
      return `Web Search Context: ${data.AbstractText} (Source: ${data.AbstractSource || 'Web'})`
    }
    if (data.Answer && data.Answer.trim().length > 0) {
      return `Web Search Context: ${data.Answer}`
    }
    if (data.Definition && data.Definition.trim().length > 0) {
      return `Web Search Context: ${data.Definition}`
    }
    if (Array.isArray(data.RelatedTopics) && data.RelatedTopics.length > 0) {
      const firstTopic = data.RelatedTopics.find((t: any) => t.Text)
      if (firstTopic?.Text) {
        return `Web Search Context: ${firstTopic.Text}`
      }
    }
    return null
  } catch (e) {
    return null
  }
}

/**
 * Generate AI response for chat support (client-side)
 */
export async function generateChatResponseClient(context: ChatContext): Promise<string> {
  // Check if query is out-of-context or asking for external/general knowledge
  const queryLower = context.userMessage.toLowerCase()
  const isBusinessSpecific = [
    'bridgetech', 'repair', 'fix', 'laptop', 'computer', 'screen', 'phone', 'battery', 
    'unlock', 'frp', 'icloud', 'cost', 'price', 'freetown', 'jui', 'ryan', 'tracking', 
    'appointment', 'book', 'shirley', 'marketplace', 'forum', 'tool', 'forensic', 'convert', 'hours', 'contact'
  ].some(term => queryLower.includes(term))

  let webSearchSnippet: string | null = null
  if (!isBusinessSpecific && context.userMessage.trim().length > 4) {
    try {
      webSearchSnippet = await searchWebForQuery(context.userMessage)
    } catch (_) {}
  }

  const systemMessage = `You are Alison, the smart and friendly AI assistant for BridgeTech IT Services — a professional IT company in Freetown, Sierra Leone.

ABOUT THE BUSINESS:
- Name: BridgeTech IT Services
- Location: No. 1 Regent Highway, Jui Junction, Freetown (opposite Freetown Teachers College)
- Google Maps: https://maps.app.goo.gl/FHCthxNEvNYxB4tJ7
- Phone: +232 33 399 391 / +232 76 210 320
- Email: support@itservicesfreetown.com
- Website: www.itservicesfreetown.com
- Hours: Monday–Friday 8 AM – 6 PM | Saturday by appointment | Sunday Closed
- Services: Computer & laptop repair, mobile phone repair, device unlocking (FRP/iCloud/network), data recovery, digital forensics, networking & Wi-Fi setup, web development, POS software, on-site visits, and a digital tools suite (background remover, media converter, image converter, QR generator, and more)
- Marketplace: Sells laptops, phones, accessories, SSDs online at /marketplace
- Lead Technician: Ryan Josiah Stewart (IT graduate, Amity University India)
- Payment: Cash, Orange Money, Afrimoney, Bank Transfer
- Repair tracking IDs follow the format: ITS-XXXXXX-XXXX (check at /track-repair)
- Booking: itservicesfreetown.com/book-appointment
- Partner brand: Shirley's Stitches & Sweet — pastries, cakes, custom fashion (WhatsApp: +232 99 781 649)
${webSearchSnippet ? `\nLIVE WEB CONTEXT:\n${webSearchSnippet}\n` : ''}
YOUR BEHAVIOUR:
- Think freely and respond naturally — don't follow a script.
- Answer whatever the user asks directly and clearly, using your own intelligence.
- If it's a technical question (device issue, software problem, general IT), give a real, thoughtful, detailed answer.
- If it's about the business, answer accurately using the info above.
- If it's a general question unrelated to the business, answer it helpfully anyway — you're smart and knowledgeable.
- Keep conversation memory — reference what the user has already told you.
- NEVER re-introduce yourself after the first message. The user already knows who you are.
- NEVER ask for name/email/phone unless the user explicitly wants to look up or track a repair.
- When professional repair is needed, naturally mention the shop address and phone number.`;





  try {
    console.log('🔍 [CLIENT-SIDE] Calling AI via Backend Proxy:', context.userMessage)
    
    const historyMessages = normalizeConversationHistory(context.conversationHistory)
    const messages: GroqMessage[] = [
      { role: 'system', content: systemMessage },
      ...historyMessages,
      { role: 'user', content: context.userMessage }
    ]
    
    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.6,
      max_tokens: 1000,
      top_p: 0.95,
      stream: false
    }
    
    // Call our secure backend proxy
    const response = await fetch(GROQ_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CLIENT-SIDE] AI proxy error response:', errorText)
      throw new Error(`Backend proxy error: ${response.status} - ${errorText}`)
    }

    const data: GroqAPIResponse = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      const responseText = data.choices[0].message.content
      return responseText
    }
    
    throw new Error('No response generated')
  } catch (error) {
    console.error('❌ [CLIENT-SIDE] Error calling AI via proxy:', error)
    return generateFallbackChatResponse(context.userMessage)
  }
}

/**
 * Minimal fallback used only when the AI API is completely unreachable.
 * The AI model handles all real responses — this is just a connectivity error notice.
 */
function generateFallbackChatResponse(_userMessage: string): string {
  return `I'm sorry, I'm having a moment of trouble connecting. Please try again in a few seconds, or reach us directly at **+232 33 399 391** or **support@itservicesfreetown.com**.`
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
  const systemMessage = `You are a senior device repair technician AI for "BridgeTech IT Services" — a professional repair shop at No. 1 Regent Highway, Jui Junction, Freetown, Sierra Leone (Phone: +232 33 399 391 / +232 76 210 320).

You specialise in accurate, real-world device diagnosis across:
- Windows PCs & laptops: boot failures, BSOD, thermal throttling, RAM/HDD/SSD failure, driver conflicts, malware, motherboard faults, power issues
- Mac computers: kernel panics, T2 chip issues, SMC/NVRAM resets, spinning beachball, storage failure, display faults
- Android phones (all brands — Samsung, Tecno, Infinix, Itel, Oppo, Huawei, Xiaomi, etc.): black screen, boot loops, charging port failure, battery swell, speaker/mic/camera faults, FRP/iCloud lock, software crashes
- iPhones/iPads: boot loop, activation lock, Face ID failure, Touch ID, charging IC, display issues, iOS update failures, water damage
- General: data recovery, virus/malware, networking, overheating, liquid damage

## DIAGNOSIS RULES — FOLLOW STRICTLY
1. Base your diagnosis ONLY on the specific symptoms and device described — do NOT give generic advice
2. Identify the single most likely root cause first, then mention secondary possibilities
3. Set confidence score accurately — high (85–95%) only when symptoms clearly match a known failure pattern; medium (65–84%) for ambiguous cases; low (50–64%) for unclear cases
4. Troubleshooting steps must be in logical order (safe quick checks first, then deeper steps, professional repair last)
5. Each step must reference the actual symptom — do NOT write steps that are irrelevant to the described issue
6. If the device model is provided, tailor steps specifically to that model (e.g. Samsung Galaxy A54 has different charging IC than a Tecno Spark 20)
7. Set escalate: true ONLY when the issue clearly requires hardware repair tools or professional disassembly
8. estimatedTime should reflect real-world repair/troubleshooting time, not a vague range
9. difficulty: "easy" = user can fix at home; "medium" = technical but doable; "hard" = requires professional tools
10. Do NOT add steps that don't apply to the described issue. Quality over quantity — 3 focused steps beats 6 irrelevant ones

Device type: ${context.deviceType}
${context.deviceModel ? `Device model: ${context.deviceModel}` : 'Device model: Not specified'}
Issue described: ${context.issueDescription}

Respond with ONLY a valid JSON object. No markdown, no explanation outside the JSON:
{
  "diagnosis": "Specific root cause explanation based on the symptoms described, 1-2 sentences",
  "confidence": 82,
  "steps": [
    {
      "id": "step1",
      "title": "Short action title",
      "description": "Specific, actionable instruction relevant to this exact issue and device",
      "type": "check"
    }
  ],
  "escalate": false,
  "estimatedTime": "10-20 minutes",
  "difficulty": "easy"
}

step type must be one of: "check" (verify/observe), "action" (do something), "info" (important note)
Provide 3 to 5 steps only. Make every step count.`

  try {
    console.log('🔍 [CLIENT-SIDE] Calling Groq AI via Backend Proxy for troubleshooting:', context)
    
    const messages: GroqMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Device: ${context.deviceType}${context.deviceModel ? ` (${context.deviceModel})` : ''}. Problem: ${context.issueDescription}. Diagnose this and give me accurate troubleshooting steps as JSON.` }
    ]
    
    const requestBody = {
      model: 'llama-3.1-8b-instant',  // Handled by backend proxy
      messages: messages,
      temperature: 0.5,
      max_tokens: 1000,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" }  // Request JSON response
    }
    
    console.log('📤 [CLIENT-SIDE] Request body preview:', {
      deviceType: context.deviceType,
      issue: context.issueDescription,
      model: 'llama-3.1-8b-instant'
    })
    
    // Call our secure backend proxy instead of Groq directly
    const response = await fetch(GROQ_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 [CLIENT-SIDE] Backend proxy response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [CLIENT-SIDE] Backend proxy error response:', errorText)
      
      // Check for specific error types
      if (response.status === 401) {
        console.error('🚫 [CLIENT-SIDE] API Key is invalid or expired')
      } else if (response.status === 400) {
        console.error('📝 [CLIENT-SIDE] Bad request - check API format')
      } else if (response.status === 429) {
        console.error('⏱️ [CLIENT-SIDE] Rate limit exceeded')
      } else {
        console.error('🌐 [CLIENT-SIDE] Network or backend error')
      }
      
      throw new Error(`Backend proxy error: ${response.status} - ${errorText}`)
    }

    const data: GroqAPIResponse = await response.json()
    console.log('✅ [CLIENT-SIDE] Groq AI response received via proxy')
    console.log('💬 [CLIENT-SIDE] Tokens used:', data.usage)
    
    if (data.choices && data.choices.length > 0) {
      const responseText = data.choices[0].message.content
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
              description: 'If the issue persists, bring your device to BridgeTech IT Services for professional assessment.',
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
            description: 'If BSOD persists, bring to BridgeTech IT Services for hardware testing and professional repair.',
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
            description: 'For persistent issues, visit BridgeTech IT Services for professional system optimization.',
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
            description: 'Power issues often require hardware testing. Bring to BridgeTech IT Services for diagnosis.',
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
            description: 'If battery still drains quickly, visit BridgeTech IT Services for battery replacement.',
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
            description: 'Visit BridgeTech IT Services for screen replacement - we use quality parts with warranty.',
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
        description: 'For complex issues, bring your device to BridgeTech IT Services for expert diagnosis and repair.',
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
  const trackingKeywords = ['track', 'tracking', 'status', 'repair status', 'order', 'trk-', 'its-', 'where is my']
  const hasKeyword = trackingKeywords.some(keyword => message.toLowerCase().includes(keyword))
  
  // Also check if the message contains a tracking ID pattern
  const hasTrackingId = extractTrackingIdClient(message) !== null
  
  return hasKeyword || hasTrackingId
}

/**
 * Extract tracking ID from message
 */
export function extractTrackingIdClient(message: string): string | null {
  // Look for patterns like ITS-250926-1001, ITS-XXXXXX-XXXX, or old TRK-001 format
  const newPattern = /\b(ITS[-]\d{6}[-]\d{4})\b/i
  const oldPattern = /\b(TRK[-]?\d+)\b/i
  
  const newMatch = message.match(newPattern)
  if (newMatch) return newMatch[1].toUpperCase()
  
  const oldMatch = message.match(oldPattern)
  return oldMatch ? oldMatch[1].toUpperCase() : null
}

/**
 * Mock repair tracking data
 */
const mockRepairDataClient: Record<string, any> = {
  'ITS-250926-1001': {
    trackingId: 'ITS-250926-1001',
    device: 'iPhone 14',
    issue: 'Screen replacement',
    status: 'In Progress',
    estimatedCompletion: '2025-10-25',
    technician: 'John Doe',
    notes: 'Parts have arrived. Screen replacement scheduled for tomorrow.'
  },
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
 * Fetch real repair data from the API
 */
async function fetchRepairFromApi(trackingId: string): Promise<any | null> {
  try {
    const response = await fetch(`/api/analytics/repairs?trackingId=${encodeURIComponent(trackingId)}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const repair = await response.json();
    if (repair && repair.trackingId) {
      return {
        trackingId: repair.trackingId,
        device: repair.deviceType || repair.device || 'Unknown device',
        issue: repair.issueDescription || repair.issue || 'Repair service',
        status: repair.status || 'received',
        estimatedCompletion: repair.estimatedCompletion || new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleDateString(),
        technician: repair.technician || 'Assigned technician',
        notes: repair.notes || repair.diagnosticNotes || 'No additional notes.',
        customerName: repair.customerName,
        cost: repair.totalCost || repair.cost
      };
    }
    return null;
  } catch (error) {
    console.warn('Repair API lookup failed:', error);
    return null;
  }
}

/**
 * Search repairs by customer info (name, email, phone)
 */
async function searchRepairsByCustomerInfoClient(info: {
  name?: string;
  email?: string;
  phone?: string;
}): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (info.name) params.set('customerName', info.name);
    if (info.email) params.set('customerEmail', info.email);
    if (info.phone) params.set('customerPhone', info.phone);

    const response = await fetch(`/api/analytics/repairs?${params.toString()}`, {
      cache: 'no-store'
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (data.repairs && Array.isArray(data.repairs)) {
      return data.repairs.map((r: any) => ({
        trackingId: r.trackingId,
        device: r.deviceType || r.device || 'Unknown device',
        deviceModel: r.deviceModel,
        issue: r.issueDescription || r.issue || 'Repair service',
        status: r.status || 'received',
        estimatedCompletion: r.estimatedCompletion || new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleDateString(),
        customerName: r.customerName,
        cost: r.totalCost || r.cost
      }));
    }
    return [];
  } catch (error) {
    console.warn('Customer search API failed:', error);
    return [];
  }
}

/**
 * Extract customer info (name, email, phone) from a chat message.
 * Returns null if no identifiable info found.
 */
function extractCustomerInfo(message: string, options: CustomerLookupOptions = {}): { name?: string; email?: string; phone?: string } | null {
  const info: { name?: string; email?: string; phone?: string } = {};

  // Extract email
  const emailMatch = message.match(/[\w.\-+]+@[\w.\-]+\.\w{2,}/i);
  if (emailMatch) info.email = emailMatch[0];

  // Extract phone number (various formats: +23233399391, 232-33-399391, 033399391, etc.)
  const phoneMatch = message.match(/(?:\+?\d{1,3}[\s\-]?)?\d[\d\s\-]{6,14}\d/);
  if (phoneMatch) {
    const cleaned = phoneMatch[0].replace(/[\s\-]/g, '');
    if (cleaned.length >= 7) info.phone = cleaned;
  }

  // If we found email or phone, return
  if (info.email || info.phone) return info;

  // Otherwise look for a name pattern in the context of "my name is..." or "I am..."
  const namePatterns = [
    /(?:my name is|i am|i'm|this is|name:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /(?:name is|called)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
  ];
  for (const pattern of namePatterns) {
    const nameMatch = message.match(pattern);
    if (nameMatch && nameMatch[1]) {
      info.name = nameMatch[1].trim();
      return info;
    }
  }

  if (options.allowBareName) {
    const bareName = message.trim().replace(/\s+/g, ' ');
    const words = bareName.split(' ').filter(Boolean);
    const commonNonNames = new Set([
      'yes', 'no', 'ok', 'okay', 'thanks', 'thank you', 'hello', 'hi', 'hey',
      'track repair', 'book appointment', 'call me', 'help me'
    ]);

    const looksLikeBareName =
      words.length >= 1 &&
      words.length <= 4 &&
      !commonNonNames.has(bareName.toLowerCase()) &&
      /^[a-zA-Z][a-zA-Z.'-]*(\s+[a-zA-Z][a-zA-Z.'-]*){0,3}$/.test(bareName);

    if (looksLikeBareName) {
      info.name = bareName;
      return info;
    }
  }

  return null;
}

export function hasCustomerLookupInfo(message: string, options: CustomerLookupOptions = {}): boolean {
  return extractCustomerInfo(message, options) !== null;
}

/**
 * Check if a message is a customer trying to find their tracking ID.
 * Only fires on explicit repair-lookup intent — NOT on general phrases like
 * "my phone is overheating" or "my battery is dead".
 */
export function isCustomerLookupQuery(message: string): boolean {
  const msg = message.toLowerCase();

  // Explicit repair-lookup phrases only — must clearly signal intent to
  // find or check a repair ticket, not just describe a device problem.
  const explicitLookupPhrases = [
    'find my repair', 'find my tracking', 'look up my repair', 'lookup my repair',
    'my tracking id', "don't have my tracking", 'lost my tracking',
    'forgot my tracking', "don't know my tracking", 'what is my tracking',
    'where is my repair', 'check my repair', 'can you find my repair',
    'i dropped off my', 'i brought my device', 'i submitted a repair',
    'i booked a repair', 'i booked an appointment',
    'my name is', 'my email is',
    'my phone number is', 'my contact number is'
  ];

  // "my repair" alone is too broad — only match when a lookup-intent word is present
  const hasMYRepair = msg.includes('my repair') &&
    ['find', 'look', 'check', 'where', 'status', 'track'].some(w => msg.includes(w));

  return hasMYRepair || explicitLookupPhrases.some(phrase => msg.includes(phrase));
}

/**
 * Handle customer lookup by name/email/phone — find their tracking ID(s)
 */
export async function handleCustomerLookup(message: string, options: CustomerLookupOptions = {}): Promise<{
  response: string;
  source: string;
  trackingData?: any;
}> {
  const customerInfo = extractCustomerInfo(message, options);

  if (!customerInfo) {
    return {
      response: `🔍 I'd love to help you find your repair! To look it up, please provide one of the following:

📧 **Your email address** (used when booking)
📱 **Your phone number**
👤 **Your full name** (e.g. "My name is John Smith")

For example, you can say:
• "My email is john@example.com"
• "My phone number is 033399391"
• "My name is John Smith"`,
      source: 'customer_lookup'
    };
  }

  const repairs = await searchRepairsByCustomerInfoClient(customerInfo);

  if (repairs.length === 0) {
    const searchedWith = customerInfo.email
      ? `email "${customerInfo.email}"`
      : customerInfo.phone
      ? `phone "${customerInfo.phone}"`
      : `name "${customerInfo.name}"`;
    return {
      response: `❌ Sorry, I couldn't find any repairs associated with ${searchedWith}.

This could mean:
• The repair was booked under different contact info
• The details may have a slight difference

Please try:
• A different email, phone, or name
• Or call us at **+232 33 399 391** and we'll find it for you!`,
      source: 'customer_lookup'
    };
  }

  if (repairs.length === 1) {
    const r = repairs[0];
    const statusDisplay = r.status.charAt(0).toUpperCase() + r.status.slice(1).replace(/-/g, ' ');
    return {
      response: `✅ **Found your repair!**

📋 **Tracking ID:** \`${r.trackingId}\`
📱 **Device:** ${r.device}${r.deviceModel ? ` — ${r.deviceModel}` : ''}
🔧 **Issue:** ${r.issue}
📊 **Status:** ${statusDisplay}
${r.estimatedCompletion ? `⏱️ **Est. Completion:** ${(() => { const d = new Date(r.estimatedCompletion); return isNaN(d.getTime()) ? r.estimatedCompletion : d.toLocaleDateString(); })()}` : ''}
${r.cost ? `💰 **Cost:** Le ${r.cost.toLocaleString()}` : ''}

${r.status === 'completed' || r.status === 'ready-for-pickup' ? '✅ Your device is ready for pickup!' : '⏳ We\'re working on it — we\'ll notify you when it\'s ready.'}

You can track anytime at **itservicesfreetown.com/track-repair** using ID: **${r.trackingId}**`,
      source: 'repair_tracking',
      trackingData: {
        id: r.trackingId,
        status: r.status,
        deviceType: r.device,
        deviceModel: r.deviceModel || '',
        customerName: r.customerName,
        estimatedCompletion: r.estimatedCompletion,
        cost: r.cost
      }
    };
  }

  // Multiple repairs found
  let repairList = repairs.map((r: any, i: number) => {
    const statusDisplay = r.status.charAt(0).toUpperCase() + r.status.slice(1).replace(/-/g, ' ');
    return `**${i + 1}.** \`${r.trackingId}\` — ${r.device}${r.deviceModel ? ` (${r.deviceModel})` : ''} — **${statusDisplay}**`;
  }).join('\n');

  return {
    response: `✅ **Found ${repairs.length} repair(s) on your account:**

${repairList}

To see full details, share the tracking ID you're interested in, or visit **itservicesfreetown.com/track-repair**.`,
    source: 'customer_lookup'
  };
}

/**
 * Handle repair tracking queries (client-side)
 */
export async function handleRepairTrackingClient(message: string): Promise<{
  response: string
  source: string
  trackingData?: any
}> {
  const trackingId = extractTrackingIdClient(message)
  
  if (trackingId) {
    // Try real API first
    const apiData = await fetchRepairFromApi(trackingId);
    // Fall back to mock data if API returns nothing
    const repairData = apiData || mockRepairDataClient[trackingId];

    if (repairData) {
      const statusDisplay = repairData.status.charAt(0).toUpperCase() + repairData.status.slice(1).replace(/-/g, ' ')
      const trackingResponse = `📋 **Repair Status for ${trackingId}**

**Device:** ${repairData.device || repairData.deviceType || 'N/A'}
**Issue:** ${repairData.issue || repairData.issueDescription || 'N/A'}
**Status:** ${statusDisplay}
${repairData.technician ? `**Technician:** ${repairData.technician}` : ''}
**Est. Completion:** ${(() => { if (!repairData.estimatedCompletion) return '72 Hours'; const d = new Date(repairData.estimatedCompletion); return isNaN(d.getTime()) ? repairData.estimatedCompletion : d.toLocaleDateString(); })()}
${repairData.customerName ? `**Customer:** ${repairData.customerName}` : ''}
${repairData.cost ? `**Cost:** $${repairData.cost}` : ''}

**Notes:** ${repairData.notes || 'No additional notes.'}

${repairData.status === 'completed' || repairData.status === 'Completed' || repairData.status === 'ready-for-pickup' ? '✅ Your device is ready for pickup!' : '⏳ We\'ll notify you when it\'s ready.'}

Need more details? Call us or visit our location.`

      return {
        response: trackingResponse,
        source: 'repair_tracking',
        trackingData: repairData
      }
    } else {
      return {
        response: `❌ Sorry, I couldn't find a repair with tracking ID "${trackingId}". Please double-check the ID or contact us for assistance.

Valid format examples: ITS-250926-1001, ITS-XXXXXX-XXXX`,
        source: 'repair_tracking'
      }
    }
  } else {
    return {
      response: `🔍 To track your repair, please provide your tracking ID (format: ITS-XXXXXX-XXXX).

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
