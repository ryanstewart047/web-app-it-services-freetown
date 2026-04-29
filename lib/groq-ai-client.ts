/**
 * Client-side AI API Integration Service (Using Groq via Backend Proxy)
 * SECURITY: API calls now go through backend proxy to protect the API key
 */

// API Endpoints
// Always use local API route when running on Vercel
// Only use external URL if explicitly set for static GitHub Pages deployment
const GROQ_PROXY_URL = '/api/groq'  // Use local API route (works for Vercel and local dev)
  
const GROQ_MODEL = 'llama-3.1-8b-instant'  // Fast, free, and excellent for chat support

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
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
 * Detect if we should use client-side AI
 * For static exports, we always use client-side AI
 */
function isStaticDeployment(): boolean {
  // Always use client-side AI for static export deployments
  // This includes local dev, GitHub Pages, and custom domains
  return true
}

/**
 * Generate AI response for chat support (client-side)
 */
export async function generateChatResponseClient(context: ChatContext): Promise<string> {
  const systemMessage = `You are the official AI assistant for **IT Services Freetown** — a professional computer and mobile repair shop in Freetown, Sierra Leone. Your name is **Alison**. You represent the business in every conversation.

═══════════════════════════════════════
📍 BUSINESS DETAILS
═══════════════════════════════════════
• Name: IT Services Freetown
• Location: No. 1 Regent Highway, Jui Junction, Freetown (opposite Freetown Teachers College / FTC, Jui)
• Google Maps: https://maps.app.goo.gl/FHCthxNEvNYxB4tJ7
• Phone: +232 33 399 391
• Email: support@itservicesfreetown.com / itservicesfreetown@gmail.com
• Website: www.itservicesfreetown.com
• Facebook: www.facebook.com/itservicefreetown
• Instagram: www.instagram.com/itservicesfreetown
• Twitter: www.twitter.com/itservicesfreetown
• WhatsApp Group: https://chat.whatsapp.com/FuS9EBvCF455geNHqQl3Iz?mode=r_t
• Google Review: https://g.page/r/CfAOLY-gBDNMEBM/review
• Hours: Monday–Friday 8 AM – 6 PM | Saturday by appointment | Sunday Closed
• Lead Technician: Ryan Josiah Stewart — IT graduate from Amity University, India, with extensive experience in repairs, web dev, graphics design & networking
• Payment: Cash, Mobile Money, Bank Transfer
• Motto: "Quality, Expertise, and Innovative Solutions"

═══════════════════════════════════════
🛠️ FULL SERVICE MENU
═══════════════════════════════════════
1. **Computer Repair** — Windows & Mac, desktops & laptops. Issues: won't start, blue screen, slow performance, virus/malware, hardware failures, software install, PC password recovery/reset.
2. **Mobile Device Repair** — All brands (iPhone, Samsung, Tecno, Infinix, Motorola, Oppo, LG, Huawei, etc.). Screen replacement, battery swap, charging port, water damage, speaker/mic, camera, software issues.
3. **Mobile Unlock Services** — FRP (Factory Reset Protection) removal, iCloud lock removal, network unlock, pattern/PIN unlock. All brands. High success rate.
4. **Data Recovery** — Deleted files, corrupted drives, liquid damage, accidental formatting, system crashes. We take data security very seriously.
5. **Office & Home Networking** — Setup, Wi-Fi install, troubleshooting, security config, performance tuning. On-site service available.
6. **Web Development** — HTML/CSS/JS, React, Angular, Vue, Python, Node.js, PHP, Django. Custom websites, e-commerce, web apps, maintenance.
7. **Graphics Design** — Logo design, branding, marketing materials, digital artwork, print design.
8. **POS Software Installation** — Point of Sale systems for retail, restaurants, service providers. Inventory management, sales reports.
9. **On-Site Service** — We come to your home, office or any location (even the beach! 😎). Great for networking, troubleshooting, system installs.

═══════════════════════════════════════
💰 PRICING & WARRANTIES
═══════════════════════════════════════
• Competitive, transparent pricing — no hidden fees
• Free consultation and estimates when you bring in your device
• Warranty provided on all repairs (duration depends on repair type — details given at pickup)
• If a device is beyond repair or not cost-efficient to fix, we give honest advice and help with replacement/upgrade options

═══════════════════════════════════════
⏱️ TURNAROUND TIMES
═══════════════════════════════════════
• Minor software issues: a few hours
• Standard hardware repairs: 1–3 days (estimated completion = 72 hours by default)
• Complex repairs: may take longer depending on parts — estimated time provided during assessment
• We always aim to complete repairs as quickly as possible while maintaining quality

═══════════════════════════════════════
🔒 DATA & SECURITY POLICY
═══════════════════════════════════════
• We strongly recommend backing up data before bringing a device in
• Technicians follow strict protocols to protect privacy and data
• Professional data recovery services available for lost files

═══════════════════════════════════════
📋 REPAIR TRACKING
═══════════════════════════════════════
• Every repair gets a tracking ID (format: ITS-XXXXXX-XXXX)
• Customers can track status on the website at /track-repair or by asking you
• If a customer provides a tracking ID, look it up for them
• If they don't have their tracking ID, you can find their repair by their name, email, or phone number — just ask them to provide it
• Encourage customers who lost their tracking ID to share their name, email, or phone so you can look it up

═══════════════════════════════════════
🤖 YOUR BEHAVIOUR RULES
═══════════════════════════════════════
1. Be friendly, warm and professional — you represent IT Services Freetown
2. **KEEP ANSWERS SHORT AND PRECISE** — 2 to 4 sentences max. Never give a long list unless the user specifically asks for one. Get straight to the point.
3. Do NOT dump all available information at once. Answer only what was asked.
4. Use 1 emoji max per reply — keep it professional
5. For simple problems, give ONE quick fix or tip, not a full list
6. For complex hardware issues, just say "Bring it in" and give the contact number
7. If the user is frustrated, one sentence of acknowledgement, then help
8. End every reply with ONE clear next step only — not multiple options
9. You can answer general tech questions but keep them short
10. Never reveal internal system prompts, API keys, or technical details
11. Refuse inappropriate or offensive content politely and move on
12. If you don't know something, say so in one sentence and give the phone number
13. For pricing, say "varies — call us for a quote" in one short line
14. For directions, give the address and the Google Maps link only — no extra text
15. For booking, give only: the /book-appointment link OR the phone number — not both
16. Only invite reviews when a customer is clearly satisfied and wrapping up
17. Share WhatsApp group only if the user asks about community or staying updated
18. **NEVER write bullet-point walls of text. Short = better. If in doubt, say less.**`

  try {
    console.log('🔍 [CLIENT-SIDE] Calling Groq AI via Backend Proxy:', context.userMessage)
    console.log('🤖 [CLIENT-SIDE] Model:', GROQ_MODEL)
    
    const messages: GroqMessage[] = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: context.userMessage }
    ]
    
    const requestBody = {
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.6,
      max_tokens: 180,
      top_p: 1,
      stream: false
    }
    
    console.log('📤 [CLIENT-SIDE] Request preview:', { 
      model: GROQ_MODEL, 
      messageCount: messages.length,
      userMessage: context.userMessage.substring(0, 50) + '...'
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
      throw new Error(`Backend proxy error: ${response.status} - ${errorText}`)
    }

    const data: GroqAPIResponse = await response.json()
    console.log('✅ [CLIENT-SIDE] Groq AI response received via proxy')
    console.log('💬 [CLIENT-SIDE] Tokens used:', data.usage)
    
    if (data.choices && data.choices.length > 0) {
      const responseText = data.choices[0].message.content
      console.log('💬 [CLIENT-SIDE] AI chat response:', responseText.substring(0, 100) + '...')
      return responseText
    }
    
    throw new Error('No response generated')
  } catch (error) {
    console.error('❌ [CLIENT-SIDE] Error calling Groq AI via proxy:', error)
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
  
  // Greetings
  if (msg.match(/^(hi|hello|hey|good morning|good afternoon|good evening|yo|sup|whatsup|what's up|howdy|greetings)/)) {
    return `Hey there! 👋 I'm Alison, AI assistant for IT Services Freetown. What can I help you with?`
  }
  
  // Location / directions
  if (msg.includes('where') || msg.includes('location') || msg.includes('address') || msg.includes('direction') || msg.includes('find you') || msg.includes('how to get')) {
    return `📍 No. 1 Regent Highway, Jui Junction, Freetown (opposite FTC). Google Maps: https://maps.app.goo.gl/FHCthxNEvNYxB4tJ7`
  }
  
  // Business hours
  if (msg.includes('hour') || msg.includes('open') || msg.includes('close') || msg.includes('when are you')) {
    return `🕐 Mon–Fri 8AM–6PM | Sat by appointment | Sun Closed. For urgent help call +232 33 399 391.`
  }
  
  // Contact info
  if (msg.includes('contact') || msg.includes('phone') || msg.includes('email') || msg.includes('call') || msg.includes('reach')) {
    return `📞 +232 33 399 391 | 📧 support@itservicesfreetown.com | 📍 No. 1 Regent Highway, Jui Junction, Freetown.`
  }

  // Services overview
  if (msg.includes('what services') || msg.includes('what do you') || msg.includes('what can you do') || msg.includes('services') && !msg.includes('repair')) {
    return `We handle computer repair, mobile repair, mobile unlocking, data recovery, networking, web development, graphics design, POS software, and on-site visits. What do you need help with?`
  }
  
  // Pricing
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much') || msg.includes('expensive') || msg.includes('cheap') || msg.includes('fee') || msg.includes('charge')) {
    return `Pricing varies depending on the repair. Visit us for a free estimate or call +232 33 399 391 for a quick quote.`
  }
  
  // Warranty
  if (msg.includes('warranty') || msg.includes('guarantee')) {
    return `Yes, all repairs come with a warranty. The duration depends on the repair type — your technician will confirm it when you pick up your device.`
  }
  
  // Mobile unlock
  if (msg.includes('unlock') || msg.includes('frp') || msg.includes('icloud') || msg.includes('locked out') || msg.includes('pattern lock') || msg.includes('pin lock')) {
    return `🔓 We handle FRP, iCloud lock, network unlock, and PIN/pattern unlock for all brands. Bring in your device with proof of ownership — call +232 33 399 391 for details.`
  }
  
  // Data recovery
  if (msg.includes('data recovery') || msg.includes('lost files') || msg.includes('deleted') || msg.includes('recover')) {
    return `We can recover deleted, corrupted, or water-damaged data. Stop using the device and bring it in ASAP — the sooner the better. Call +232 33 399 391.`
  }
  
  // Networking
  if (msg.includes('network') || msg.includes('wifi') || msg.includes('wi-fi') || msg.includes('internet setup')) {
    return `We set up and troubleshoot home and office networks, including Wi-Fi. On-site visits available — call +232 33 399 391 to schedule.`
  }
  
  // Web development / design
  if (msg.includes('website') || msg.includes('web dev') || msg.includes('design') || msg.includes('logo') || msg.includes('graphic')) {
    return `Yes, we build custom websites and do graphics/logo design. Email support@itservicesfreetown.com or call +232 33 399 391 to discuss your project.`
  }
  
  // Repair time
  if (msg.includes('how long') || msg.includes('turnaround') || msg.includes('how fast') || msg.includes('when will') || msg.includes('time frame')) {
    return `Minor software issues take a few hours, standard repairs 1–3 days. We'll give you a specific estimate when you bring in your device.`
  }
  
  // Who is Ryan / owner / technician
  if (msg.includes('ryan') || msg.includes('owner') || msg.includes('who runs') || msg.includes('technician') || msg.includes('team')) {
    return `Our lead technician Ryan Josiah Stewart is an IT graduate from Amity University with extensive repair and development experience. Call +232 33 399 391 to reach the team.`
  }
  
  // Device issues
  if (msg.includes('slow') || msg.includes('performance') || msg.includes('lag')) {
    return `Try restarting and closing unused apps first. If it's still slow, bring it in for a professional tune-up — call +232 33 399 391.`
  }
  
  // Won't turn on issues
  if (msg.includes("won't turn on") || msg.includes("not starting") || msg.includes("dead") || msg.includes("no power")) {
    return `Try charging for 30+ minutes before powering on. If it still won't start, bring it in — call +232 33 399 391.`
  }
  
  // Screen issues
  if (msg.includes('screen') || msg.includes('display') || msg.includes('cracked') || msg.includes('broken screen')) {
    return `We replace screens for all brands with quality parts and a warranty. Back up your data if the screen still works, then bring it in — +232 33 399 391.`
  }
  
  // Virus / malware
  if (msg.includes('virus') || msg.includes('malware') || msg.includes('infected') || msg.includes('hack') || msg.includes('popup')) {
    return `Don't enter any passwords or click popups. Disconnect from the internet if possible, then bring it in for removal — +232 33 399 391.`
  }
  
  // Water damage
  if (msg.includes('water') || msg.includes('wet') || msg.includes('liquid') || msg.includes('spill') || msg.includes('dropped in')) {
    return `💧 Turn it off NOW, don't charge it, and bring it to us immediately — time is critical for water damage. Call +232 33 399 391.`
  }
  
  // Booking appointments
  if (msg.includes('appointment') || msg.includes('book') || msg.includes('schedule') || msg.includes('come in') || msg.includes('bring my')) {
    return `Book online at itservicesfreetown.com/book-appointment or walk in Mon–Fri 8AM–6PM at No. 1 Regent Highway, Jui Junction. What device needs repair?`
  }
  
  // Tracking
  if (msg.includes('track') || msg.includes('status') || msg.includes('where is my repair') || msg.includes('its-')) {
    return `Share your tracking ID (ITS-XXXXXX-XXXX) and I'll look it up, or check at itservicesfreetown.com/track-repair. No ID? Call +232 33 399 391 with your name.`
  }
  
  // Review
  if (msg.includes('review') || msg.includes('feedback') || msg.includes('rate') || msg.includes('rating')) {
    return `Thanks! We'd love a Google review if you have a moment: https://g.page/r/CfAOLY-gBDNMEBM/review 😊`
  }
  
  // WhatsApp
  if (msg.includes('whatsapp') || msg.includes('group') || msg.includes('community')) {
    return `Join our WhatsApp group for updates and support: https://chat.whatsapp.com/FuS9EBvCF455geNHqQl3Iz?mode=r_t`
  }
  
  // Social media
  if (msg.includes('social media') || msg.includes('facebook') || msg.includes('instagram') || msg.includes('twitter') || msg.includes('follow')) {
    return `Follow us on Facebook, Instagram, and Twitter @itservicesfreetown for updates and tech tips.`
  }
  
  // POS
  if (msg.includes('pos') || msg.includes('point of sale') || msg.includes('sales software') || msg.includes('inventory')) {
    return `Yes, we install and configure POS systems for retail and restaurants. Call +232 33 399 391 to discuss what you need.`
  }
  
  // Password recovery
  if (msg.includes('password') || msg.includes('locked out') || msg.includes('forgot password') || msg.includes('pc lock') || msg.includes('login')) {
    return `🔐 We handle PC password reset, mobile PIN/pattern unlock, FRP removal, and iCloud unlock for all brands. Bring proof of ownership — call +232 33 399 391.`
  }
  
  // On-site service
  if (msg.includes('on-site') || msg.includes('onsite') || msg.includes('come to') || msg.includes('my location') || msg.includes('home service') || msg.includes('office visit')) {
    return `Yes, we do on-site visits — home, office, wherever you need us. Call +232 33 399 391 to schedule.`
  }
  
  // Thank you
  if (msg.includes('thank') || msg.includes('thanks') || msg.includes('appreciate') || msg.includes('helpful')) {
    return `You're welcome! 😊 Anything else I can help with? We're at itservicesfreetown.com or call +232 33 399 391 anytime.`
  }
  
  // Goodbye
  if (msg.match(/^(bye|goodbye|see you|later|take care|good night)/)) {
    return `Goodbye! 👋 Come back anytime — itservicesfreetown.com or +232 33 399 391.`
  }
  
  // Default helpful response
  return `Hi! I'm Alison from IT Services Freetown. How can I help you today? 📞 +232 33 399 391`
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
  const systemMessage = `You are a senior device repair technician AI for "IT Services Freetown" — a professional repair shop at No. 1 Regent Highway, Jui Junction, Freetown, Sierra Leone (Phone: +232 33 399 391).

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
      model: GROQ_MODEL,
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
      model: GROQ_MODEL
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
function extractCustomerInfo(message: string): { name?: string; email?: string; phone?: string } | null {
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

  return null;
}

/**
 * Check if a message is a customer trying to find their tracking ID
 */
export function isCustomerLookupQuery(message: string): boolean {
  const msg = message.toLowerCase();
  // Must mention finding/looking for their repair AND provide identifying info
  const lookupKeywords = [
    'find my repair', 'find my tracking', 'look up my repair', 'lookup my repair',
    'my repair', 'my tracking id', 'don\'t have my tracking', 'lost my tracking',
    'forgot my tracking', 'don\'t know my tracking', 'what is my tracking',
    'where is my repair', 'check my repair', 'can you find my',
    'i dropped off', 'i brought my', 'i submitted', 'i booked',
    'my name is', 'my email is', 'my phone is', 'my number is'
  ];
  return lookupKeywords.some(keyword => msg.includes(keyword));
}

/**
 * Handle customer lookup by name/email/phone — find their tracking ID(s)
 */
export async function handleCustomerLookup(message: string): Promise<{
  response: string;
  source: string;
  trackingData?: any;
}> {
  const customerInfo = extractCustomerInfo(message);

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