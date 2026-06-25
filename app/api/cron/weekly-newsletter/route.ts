import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.1-8b-instant'

const DEFAULT_TOPICS = [
  "5 Essential Tips to Keep Your Laptop from Overheating in Freetown's Heat",
  "How to Protect Your Smartphone Screen from Scratches and Accidental Drops",
  "Warning Signs Your Computer Hard Drive is About to Fail (And How to Save Your Data)",
  "Easy Ways to Boost Your Home Wi-Fi Signal Strength and Speed",
  "Why You Should Stop Leaving Your Phone Plugs and Laptop Chargers in the Outlet",
  "How to Clean Your Phone Charging Port Safely (Fix Charging Issues)",
  "How to Secure Your Social Media Accounts from Hackers (2-Factor Authentication)",
  "What to Do Immediately if You Spill Water or Tea on Your Laptop"
]

export async function GET(request: NextRequest) {
  return handleNewsletterCron(request)
}

export async function POST(request: NextRequest) {
  return handleNewsletterCron(request)
}

async function handleNewsletterCron(request: NextRequest) {
  // 1. Authorization check
  const authHeader = request.headers.get('Authorization')
  const isCronSecretValid = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isDev = process.env.NODE_ENV === 'development'
  const isManual = request.nextUrl.searchParams.get('manual') === 'true'

  if (!isCronSecretValid && !isDev && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Fetch or initialize settings
    let settings = await prisma.weeklyNewsletterSettings.findUnique({
      where: { id: 'active' }
    })

    if (!settings) {
      settings = await prisma.weeklyNewsletterSettings.create({
        data: {
          id: 'active',
          enabled: false,
          topics: DEFAULT_TOPICS
        }
      })
    }

    if (!settings.enabled && !isManual) {
      return NextResponse.json({ message: 'Weekly automated newsletter is disabled.' })
    }

    // Parse topics
    const topics = Array.isArray(settings.topics) 
      ? (settings.topics as string[]) 
      : DEFAULT_TOPICS

    if (topics.length === 0) {
      return NextResponse.json({ error: 'No newsletter topics configured.' }, { status: 400 })
    }

    // 3. Smart Topic Rotation (LRU algorithm)
    // Fetch recent successful logs to avoid repeating topics
    const recentLogs = await prisma.weeklyNewsletterLog.findMany({
      where: { status: 'success' },
      orderBy: { createdAt: 'desc' },
      take: topics.length - 1 // Leave at least one topic choice
    })

    const recentlySentTopics = recentLogs.map(log => log.topic)
    
    // Filter out topics sent recently
    let availableTopics = topics.filter(topic => !recentlySentTopics.includes(topic))
    
    // If all topics have been cycled through, reset pool to all topics
    if (availableTopics.length === 0) {
      availableTopics = topics
    }

    // Pick the first available topic (or random from available)
    const selectedTopic = availableTopics[0]

    console.log(`[Weekly Newsletter] Selected Topic: "${selectedTopic}"`)

    // 4. Generate newsletter content using Groq AI
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not configured.')
    }

    const systemPrompt = `
      You are an expert email marketing specialist for "IT Services Freetown", a professional computer and mobile repair business in Sierra Leone.
      Your goal is to write high-converting, professional, and engaging weekly newsletter emails.
      
      Response Format:
      You MUST respond with a JSON object containing exactly three fields:
      1. "subject": A catchy and professional subject line.
      2. "content": The HTML body of the email. Use clean HTML with <h1>, <p>, <ul>, <li>, and <strong> tags. Do NOT include <html> or <body> tags. Keep it readable and highly informative.
      3. "imagePrompt": A highly descriptive prompt for an AI image generator to create a vector illustration representing this topic. Avoid text in the image. Example: "A professional illustration of a laptop with clean blue repair tools, flat design, white background."
      
      Tone: Friendly, highly informative, professional, and localized to Sierra Leone context where appropriate.
      Business Name: IT Services Freetown
      Location: #1 Regent Highway, Jui Junction, Freetown.
      Phone: +232 33 399 391.
    `

    const aiResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a newsletter issue explaining: ${selectedTopic}` }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`AI generation failed: ${await aiResponse.text()}`)
    }

    const data = await aiResponse.json()
    const { subject, content, imagePrompt } = JSON.parse(data.choices[0].message.content)

    // 5. Generate matching illustration using Pollinations.ai
    const encodedPrompt = encodeURIComponent(`${imagePrompt || selectedTopic}, vector illustration, digital art, clean white background`)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true`

    // Inject the generated illustration into the top of the email body
    const finalContent = `
      <div style="text-align: center; margin-bottom: 25px; background-color: #f8fafc; padding: 15px; border-radius: 16px;">
        <img src="${imageUrl}" alt="${selectedTopic}" style="max-width: 100%; height: auto; border-radius: 12px; display: block; margin: 0 auto;" />
      </div>
      ${content}
    `

    // 6. Fetch subscribed newsletter recipients
    const subscribers = await prisma.emailLead.findMany({
      where: { 
        source: 'newsletter',
        deliveryFailed: false
      }
    })

    if (subscribers.length === 0) {
      console.log('[Weekly Newsletter] No active subscribers found.')
      
      // Log as success but with 0 recipients
      await prisma.weeklyNewsletterLog.create({
        data: {
          status: 'success',
          topic: selectedTopic,
          subject: subject,
          imageUrl: imageUrl,
          recipients: 0,
          notes: 'No subscribers found'
        } as any // Use as any to prevent strict type errors before prisma client is re-generated
      })

      return NextResponse.json({
        success: true,
        topic: selectedTopic,
        recipients: 0,
        message: 'No active subscribers found.'
      })
    }

    console.log(`[Weekly Newsletter] Blasting to ${subscribers.length} subscribers...`)

    // 7. Batch send emails
    const sendResults = await Promise.all(
      subscribers.map(async (sub) => {
        try {
          const result = await sendEmail({
            to: sub.email,
            subject: `${settings?.subjectPrefix || ''}${subject}`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
                  .container { max-width: 600px; margin: 20px auto; padding: 30px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #71717a; text-align: center; line-height: 1.5; }
                  .footer a { color: #2563eb; text-decoration: none; font-weight: bold; }
                  .footer a:hover { text-decoration: underline; }
                  h1 { color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; }
                  p { margin-bottom: 16px; font-size: 15px; color: #334155; }
                  ul, ol { margin-bottom: 20px; padding-left: 20px; color: #334155; }
                  li { margin-bottom: 8px; font-size: 15px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="main-content">
                    ${finalContent}
                  </div>
                  <div class="footer">
                    <p><strong>IT Services Freetown</strong><br>#1 Regent Highway, Jui Junction | Freetown, Sierra Leone</p>
                    <p>You received this email because you subscribed to our weekly newsletter.</p>
                    <p>
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/unsubscribe?email=${encodeURIComponent(sub.email)}">Unsubscribe</a> | 
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/privacy">Privacy Policy</a>
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `
          })

          if (!result.success) {
            // Mark bounced emails
            await prisma.emailLead.update({
              where: { id: sub.id },
              data: { deliveryFailed: true }
            }).catch(() => {})
          }

          return result.success
        } catch {
          return false
        }
      })
    )

    const successCount = sendResults.filter(Boolean).length

    // 8. Update execution log & settings
    await prisma.weeklyNewsletterLog.create({
      data: {
        status: 'success',
        topic: selectedTopic,
        subject: subject,
        imageUrl: imageUrl,
        recipients: successCount
      }
    })

    await prisma.weeklyNewsletterSettings.update({
      where: { id: 'active' },
      data: { lastSentAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      topic: selectedTopic,
      subject: subject,
      recipients: successCount,
      totalSubscribers: subscribers.length
    })

  } catch (error: any) {
    console.error('[Weekly Newsletter Cron Error]:', error)
    
    // Log failures
    try {
      await prisma.weeklyNewsletterLog.create({
        data: {
          status: 'failed',
          topic: 'Automation Error',
          subject: 'Newsletter Generation Failed',
          recipients: 0,
          error: error.message || 'Unknown automation error'
        }
      })
    } catch (logErr) {
      console.error('Failed to log weekly newsletter error:', logErr)
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}
