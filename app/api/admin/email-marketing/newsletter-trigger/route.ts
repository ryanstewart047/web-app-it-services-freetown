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

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { testEmail, topic } = await request.json()

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email address is required' }, { status: 400 })
    }

    // Pick topic: if provided use it, otherwise calculate the next rotating topic
    let selectedTopic = topic
    if (!selectedTopic) {
      const settings = await prisma.weeklyNewsletterSettings.findUnique({
        where: { id: 'active' }
      })

      const topics = Array.isArray(settings?.topics) 
        ? (settings.topics as string[]) 
        : DEFAULT_TOPICS

      const recentLogs = await prisma.weeklyNewsletterLog.findMany({
        where: { status: 'success' },
        orderBy: { createdAt: 'desc' },
        take: topics.length - 1
      })

      const recentlySentTopics = recentLogs.map(log => log.topic)
      let availableTopics = topics.filter(t => !recentlySentTopics.includes(t))
      if (availableTopics.length === 0) {
        availableTopics = topics
      }
      selectedTopic = availableTopics[0] || DEFAULT_TOPICS[0]
    }

    console.log(`[Newsletter Trigger] Generating test email for: "${selectedTopic}" to: ${testEmail}`)

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not configured.')
    }

    // Generate content
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

    // Generate illustration URL
    const encodedPrompt = encodeURIComponent(`${imagePrompt || selectedTopic}, vector illustration, digital art, clean white background`)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true`

    // Inject the generated illustration into the top of the email body
    const finalContent = `
      <div style="text-align: center; margin-bottom: 25px; background-color: #f8fafc; padding: 15px; border-radius: 16px;">
        <img src="${imageUrl}" alt="${selectedTopic}" style="max-width: 100%; height: auto; border-radius: 12px; display: block; margin: 0 auto;" />
      </div>
      <div style="background-color: #fef08a; border-left: 4px solid #eab308; padding: 12px; margin-bottom: 20px; border-radius: 4px; font-size: 13px; color: #854d0e;">
        <strong>⚠️ TEST EMAIL PREVIEW:</strong> This is a test email sent manually from the IT Services Freetown Admin Dashboard.
      </div>
      ${content}
    `

    const settings = await prisma.weeklyNewsletterSettings.findUnique({
      where: { id: 'active' }
    })

    // Send the test email
    const result = await sendEmail({
      to: testEmail,
      subject: `[TEST] ${settings?.subjectPrefix || ''}${subject}`,
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
              <p>You received this email because you are an administrator testing the weekly newsletter settings.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/unsubscribe?email=${encodeURIComponent(testEmail)}">Unsubscribe</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/privacy">Privacy Policy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to send test email')
    }

    return NextResponse.json({
      success: true,
      topic: selectedTopic,
      subject: subject,
      recipient: testEmail
    })

  } catch (error: any) {
    console.error('[Newsletter Test Trigger Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
