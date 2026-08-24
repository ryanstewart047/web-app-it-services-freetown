import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { canRunProtectedAutomation } from '@/lib/server/admin-session'
import { generateNewsletterIssue } from '@/lib/server/email-ai-generator'

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Extend Vercel timeout to 60s for AI and email processing

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
  const isManual = request.nextUrl.searchParams.get('manual') === 'true'

  if (!canRunProtectedAutomation(request)) {
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
      return NextResponse.json({ message: 'Weekly automated newsletter is disabled. Enable it in Settings to run automatically, or use the Manual Blast button to send now.' })
    }

    // Check SMTP is configured
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    if (!smtpUser || smtpUser === 'your-email@gmail.com' || !smtpPass) {
      return NextResponse.json({
        success: false,
        error: 'Email service is not configured. Add SMTP_USER and SMTP_PASS to your Vercel environment variables, then redeploy.'
      }, { status: 503 })
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

    // 4. Generate newsletter content using AI (with multi-provider & template fallback)
    const { subject, content } = await generateNewsletterIssue(selectedTopic)

    // Clean, professional HTML content without AI image banner
    const finalContent = content

    // 5. Fetch subscribed newsletter recipients
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
          imageUrl: null,
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
                    <p style="font-size: 10px; color: #9ca3af; margin-top: 15px;">You received this email because you subscribed to our weekly newsletter.</p>
                    <p style="font-size: 10px; color: #9ca3af;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/unsubscribe?email=${encodeURIComponent(sub.email)}" style="color: #9ca3af; font-weight: normal; text-decoration: underline;">Unsubscribe</a> | 
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.itservicesfreetown.com'}/privacy" style="color: #9ca3af; font-weight: normal; text-decoration: underline;">Privacy Policy</a>
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
        imageUrl: null,
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
