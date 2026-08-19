import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { generateNewsletterIssue } from '@/lib/server/email-ai-generator'

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

    const { subject, content, imagePrompt } = await generateNewsletterIssue(selectedTopic)

    // Generate illustration URL
    const encodedPrompt = encodeURIComponent(`${imagePrompt || selectedTopic}, vector illustration, digital art, clean white background`)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=600&height=400&nologo=true`

    // Inject the generated illustration into the top of the email body
    const finalContent = `
      <div style="text-align: center; margin-bottom: 25px; background-color: #f8fafc; padding: 15px; border-radius: 16px;">
        <img src="${imageUrl}" alt="${selectedTopic}" style="max-width: 100%; height: auto; border-radius: 12px; display: block; margin: 0 auto;" />
      </div>
      <div style="background-color: #fef08a; border-left: 4px solid #eab308; padding: 12px; margin-bottom: 20px; border-radius: 4px; font-size: 13px; color: #854d0e;">
        <strong>⚠️ TEST EMAIL PREVIEW:</strong> This is a test email sent manually from the BridgeTech IT Services Admin Dashboard.
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
              <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7;">
                <p style="font-size: 14px; margin-bottom: 10px; font-weight: bold; color: #0f172a;">Quick Links:</p>
                <p style="font-size: 13px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}" style="margin: 0 10px;">Homepage</a> |
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/marketplace" style="margin: 0 10px;">Shop Products</a> |
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/book-appointment" style="margin: 0 10px;">Book a Repair</a> |
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/chat" style="margin: 0 10px;">Live Chat</a> |
                  <a href="https://wa.me/23233399391" style="margin: 0 10px;">WhatsApp Support</a>
                </p>
              </div>
              <p><strong><a href="https://www.itservicesfreetown.com" style="color: #333;">BridgeTech IT Services</a></strong><br>#1 Regent Highway, Jui Junction | Freetown, Sierra Leone</p>
              <p style="font-size: 10px; color: #9ca3af; margin-top: 15px;">You received this email because you are an administrator testing the weekly newsletter settings.</p>
              <p style="font-size: 10px; color: #9ca3af;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/unsubscribe?email=${encodeURIComponent(testEmail)}" style="color: #9ca3af; font-weight: normal; text-decoration: underline;">Unsubscribe</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/privacy" style="color: #9ca3af; font-weight: normal; text-decoration: underline;">Privacy Policy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (!result.success || result.note === 'Email service not configured') {
      const msg = result.note === 'Email service not configured'
        ? 'SMTP is not configured. Add SMTP_USER and SMTP_PASS to your environment variables.'
        : (result.error || 'Failed to send test email')
      throw new Error(msg)
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
