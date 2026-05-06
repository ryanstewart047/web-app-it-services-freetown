import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

function checkAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!sessionToken
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { subject, content, recipients } = await request.json()

    if (!subject || !content || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log(`[Email Marketing] Starting batch send to ${recipients.length} recipients...`)

    // We send emails in parallel, but you might want to chunk this for very large lists
    const results = await Promise.all(
      recipients.map(email => 
        sendEmail({
          to: email,
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 10px; color: #999; text-align: center; line-height: 1.4; }
                .footer a { color: #666; text-decoration: underline; }
                img { max-width: 100%; height: auto; display: block; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="main-content">
                  ${content}
                </div>
                <div class="footer">
                  <p>IT Services Freetown | #1 Regent Highway, Jui Junction | Freetown, Sierra Leone</p>
                  <p>You received this email because you are a valued customer of IT Services Freetown.</p>
                  <p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://itservicesfreetown.com'}/unsubscribe">Unsubscribe from this list</a> | 
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://itservicesfreetown.com'}/privacy">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        })
      )
    )

    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      failed: failCount 
    })
  } catch (error) {
    console.error('[Email Marketing] Error:', error)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}
