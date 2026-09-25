import nodemailer from 'nodemailer'

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
  note?: string
  notConfigured?: boolean
  isHardBounce?: boolean
}

export function isPermanentBounce(error: any): boolean {
  if (!error) return false
  const msg = (error.message || '').toLowerCase()
  const response = (error.response || '').toLowerCase()
  const code = error.responseCode

  // Sender rate limits, quota, connection issues are NOT recipient bounces
  if (
    msg.includes('daily user sending limit') ||
    response.includes('daily user sending limit') ||
    msg.includes('too many login attempts') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('try again later') ||
    response.includes('try again later') ||
    code === 421 || code === 450 || code === 451 || code === 452
  ) {
    return false
  }

  // Network/socket errors are NOT bounces
  if (
    error.code === 'ETIMEDOUT' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'EAI_AGAIN' ||
    error.code === 'ENOTFOUND'
  ) {
    return false
  }

  // Resend sandbox testing limitation is NOT a recipient bounce
  if (msg.includes('only send testing emails') || response.includes('only send testing emails')) {
    return false
  }

  // 550 / 551 / 553 / 554 permanent rejection because recipient does not exist
  if (code === 550 || code === 551 || code === 553 || code === 554) {
    if (
      msg.includes('user unknown') ||
      msg.includes('does not exist') ||
      msg.includes('invalid recipient') ||
      msg.includes('recipient address rejected') ||
      msg.includes('no such user') ||
      msg.includes('mailbox unavailable') ||
      msg.includes('address rejected') ||
      response.includes('5.1.1') ||
      response.includes('does not exist') ||
      response.includes('invalid recipient') ||
      response.includes('user unknown')
    ) {
      return true
    }
  }

  return false
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const isSecure = port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

export async function sendEmail({ to, subject, html, text }: EmailData): Promise<SendEmailResult> {
  try {
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS

    // 1. Check if SMTP is configured
    if (!smtpUser || smtpUser === 'your-email@gmail.com' || !smtpPass) {
      // Check if Resend API key is available as an alternative
      if (process.env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM || 'BridgeTech IT Services <onboarding@resend.dev>',
              to: [to],
              subject,
              html,
              text,
            }),
          })
          if (resendRes.ok) {
            const data = await resendRes.json()
            return { success: true, messageId: data.id }
          } else {
            const errorData = await resendRes.json().catch(() => ({}))
            return { 
              success: false, 
              error: errorData.message || `Resend error (${resendRes.status})`,
              isHardBounce: isPermanentBounce(errorData)
            }
          }
        } catch (resendErr) {
          console.warn('[Email] Resend attempt failed:', resendErr)
        }
      }

      console.warn('[Email] SMTP service not configured (SMTP_USER/SMTP_PASS missing).')
      return { 
        success: false, 
        notConfigured: true, 
        isHardBounce: false,
        error: 'Email service is not configured. Please add SMTP_USER and SMTP_PASS to environment variables.' 
      }
    }

    const transporter = getTransporter()
    const fromAddress = process.env.EMAIL_FROM || `"BridgeTech IT Services" <${smtpUser}>`

    const result = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text,
    })
    console.log('[Email] Sent successfully to', to, 'Message ID:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error: any) {
    console.error('[Email] Sending failed to', to, ':', error)
    return { 
      success: false, 
      error: error.message || 'Sending failed',
      isHardBounce: isPermanentBounce(error)
    }
  }
}

// Enhanced email templates
export const emailTemplates = {
  appointmentConfirmation: (data: {
    customerName: string
    appointmentId: string
    deviceType: string
    deviceModel: string
    issueDescription: string
    serviceType: string
    preferredDate: string
    preferredTime: string
  }) => ({
    subject: `Appointment Confirmed - ${data.appointmentId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { background: #1f2937; color: white; padding: 20px; text-align: center; }
          .social-links { margin: 15px 0; }
          .social-links a { display: inline-block; margin: 0 8px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.15); text-align: center; line-height: 36px; text-decoration: none; color: white; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed!</h1>
            <p>Your IT repair appointment has been successfully booked</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Thank you for choosing BridgeTech IT Services. Your appointment has been confirmed with the following details:</p>
            
            <div class="info-box">
              <strong>Appointment ID:</strong> ${data.appointmentId}<br>
              <strong>Device:</strong> ${data.deviceType} - ${data.deviceModel}<br>
              <strong>Issue:</strong> ${data.issueDescription}<br>
              <strong>Service Type:</strong> ${data.serviceType}<br>
              <strong>Scheduled:</strong> ${data.preferredDate} at ${data.preferredTime}
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Please arrive 10 minutes before your scheduled time</li>
              <li>Bring your device and any accessories</li>
              <li>Have your ID and proof of purchase ready</li>
              <li>We'll provide a detailed diagnosis and estimate</li>
            </ul>
            
            <a href="https://www.itservicesfreetown.com/track-repair" class="button">Track Your Repair</a>
            
            <p>If you need to reschedule or have any questions, please contact us at +232 33 399 391.</p>
          </div>
          <div class="footer">
            <div class="social-links">
              <a href="https://www.facebook.com/itservicesfreetown" title="Facebook">&#xf09a;</a>
              <a href="https://www.instagram.com/itservicesfreetown" title="Instagram">&#xf16d;</a>
              <a href="https://x.com/itservicesft" title="X (Twitter)">&#x1D54F;</a>
              <a href="https://wa.me/23233399391" title="WhatsApp">&#xf232;</a>
              <a href="https://www.tiktok.com/@itservicesfreetown" title="TikTok">&#x266B;</a>
            </div>
            <p style="margin:10px 0 0;">BridgeTech IT Services<br>
            1 Regent Highway, Jui Junction<br>
            Freetown, Sierra Leone<br>
            +232 33 399 391</p>
            <p style="margin:10px 0 0; font-size:12px; color:#9ca3af;">© 2026 BridgeTech IT Services. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Appointment Confirmed - ${data.appointmentId}

Dear ${data.customerName},

Your IT repair appointment has been confirmed:

Appointment ID: ${data.appointmentId}
Device: ${data.deviceType} - ${data.deviceModel}
Issue: ${data.issueDescription}
Service Type: ${data.serviceType}
Scheduled: ${data.preferredDate} at ${data.preferredTime}

Please arrive 10 minutes early with your device and ID.

Contact us: +232 33 399 391
BridgeTech IT Services`
  }),

  repairUpdate: (data: {
    customerName: string
    trackingId: string
    status: string
    statusMessage: string
    deviceType: string
    deviceModel: string
    estimatedCost?: number | null
    actualCost?: number | null
    estimatedCompletion?: Date | null
    dateCompleted?: Date | null
  }) => ({
    subject: `Repair Update - ${data.trackingId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #040e40 0%, #1c1891 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #040e40; padding: 15px; margin: 20px 0; }
          .status-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #ff0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #040e40; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Repair Status Update</h1>
            <p>Your device repair progress update</p>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>We have an update on your device repair:</p>
            
            <div class="info-box">
              <strong>Tracking ID:</strong> ${data.trackingId}<br>
              <strong>Device:</strong> ${data.deviceType} - ${data.deviceModel}<br>
              <strong>Current Status:</strong> ${data.status.toUpperCase()}
            </div>
            
            <div class="status-box">
              <strong>Update:</strong> ${data.statusMessage}
            </div>
            
            ${data.estimatedCost ? `<p><strong>Estimated Cost:</strong> $${data.estimatedCost}</p>` : ''}
            ${data.actualCost ? `<p><strong>Final Cost:</strong> $${data.actualCost}</p>` : ''}
            ${data.estimatedCompletion ? `<p><strong>Estimated Completion:</strong> ${data.estimatedCompletion.toLocaleDateString()}</p>` : ''}
            ${data.dateCompleted ? `<p><strong>Completed On:</strong> ${data.dateCompleted.toLocaleDateString()}</p>` : ''}
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-repair" class="button">Track Your Repair</a>
            
            <p>If you have any questions, please contact us at +232 33 399 391.</p>
          </div>
          <div class="footer">
            <p>BridgeTech IT Services<br>
            1 Regent Highway, Jui Junction<br>
            Freetown, Sierra Leone<br>
            +232 33 399 391</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Repair Update - ${data.trackingId}

Dear ${data.customerName},

Tracking ID: ${data.trackingId}
Device: ${data.deviceType} - ${data.deviceModel}
Status: ${data.status.toUpperCase()}

Update: ${data.statusMessage}

${data.estimatedCost ? `Estimated Cost: $${data.estimatedCost}` : ''}
${data.actualCost ? `Final Cost: $${data.actualCost}` : ''}
${data.estimatedCompletion ? `Estimated Completion: ${data.estimatedCompletion.toLocaleDateString()}` : ''}
${data.dateCompleted ? `Completed: ${data.dateCompleted.toLocaleDateString()}` : ''}

Contact us: +232 33 399 391
BridgeTech IT Services`
  }),

  adminBookingNotification: (data: {
    trackingId: string
    customerName: string
    email: string
    phone: string
    address: string
    deviceType: string
    deviceModel: string
    serviceType: string
    issueDescription: string
    preferredDate: string
    preferredTime: string
    submittedAt: string
  }) => ({
    subject: `🔔 New Booking - ${data.trackingId} | ${data.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 25px; text-align: center; }
          .content { padding: 25px; }
          .info-box { background: #f8f9fa; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
          .customer-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
          .device-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
          .label { font-weight: bold; color: #374151; display: inline-block; min-width: 140px; }
          .value { color: #1f2937; }
          .priority-badge { display: inline-block; background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; font-size: 12px; }
          .action-btn { display: inline-block; background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin: 10px 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0;">🔔 New Booking Received</h1>
            <p style="margin:5px 0 0;">Tracking ID: ${data.trackingId}</p>
          </div>
          <div class="content">
            <p>A new repair appointment has been submitted on the website.</p>

            <div class="customer-box">
              <h3 style="margin-top:0; color:#2563eb;">👤 Customer Details</h3>
              <p><span class="label">Name:</span> <span class="value">${data.customerName}</span></p>
              <p><span class="label">Email:</span> <span class="value"><a href="mailto:${data.email}">${data.email}</a></span></p>
              <p><span class="label">Phone:</span> <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span></p>
              <p><span class="label">Address:</span> <span class="value">${data.address}</span></p>
            </div>

            <div class="device-box">
              <h3 style="margin-top:0; color:#16a34a;">💻 Device & Service</h3>
              <p><span class="label">Device Type:</span> <span class="value">${data.deviceType}</span></p>
              <p><span class="label">Model/Brand:</span> <span class="value">${data.deviceModel}</span></p>
              <p><span class="label">Service Type:</span> <span class="value">${data.serviceType}</span></p>
              <p><span class="label">Issue:</span> <span class="value">${data.issueDescription}</span></p>
            </div>

            <div class="info-box">
              <h3 style="margin-top:0; color:#dc2626;">📅 Appointment Schedule</h3>
              <p><span class="label">Preferred Date:</span> <span class="value">${data.preferredDate}</span></p>
              <p><span class="label">Preferred Time:</span> <span class="value">${data.preferredTime}</span></p>
              <p><span class="label">Submitted:</span> <span class="value">${new Date(data.submittedAt).toLocaleString('en-GB', { timeZone: 'Africa/Freetown' })}</span></p>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="mailto:${data.email}?subject=RE: Your Booking ${data.trackingId}" class="action-btn">📧 Reply to Customer</a>
              <a href="tel:${data.phone}" class="action-btn" style="background:#16a34a;">📞 Call Customer</a>
            </div>
          </div>
          <div class="footer">
            <p>BridgeTech IT Services - Admin Notification<br>
            This email was auto-generated from the booking system.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `NEW BOOKING RECEIVED - ${data.trackingId}

Customer: ${data.customerName}
Email: ${data.email}
Phone: ${data.phone}
Address: ${data.address}

Device: ${data.deviceType} - ${data.deviceModel}
Service: ${data.serviceType}
Issue: ${data.issueDescription}

Scheduled: ${data.preferredDate} at ${data.preferredTime}
Submitted: ${data.submittedAt}

---
BridgeTech IT Services - Auto-generated notification`
  }),

  repairStatusUpdate: (data: {
    customerName: string
    repairId: string
    status: string
    deviceType: string
    message: string
  }) => ({
    subject: `Repair Update - ${data.repairId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #040e40; color: white; padding: 20px; text-align: center;">
          <h1>Repair Status Update</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${data.customerName},</p>
          <p>We have an update on your ${data.deviceType} repair:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Repair ID:</strong> ${data.repairId}</p>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Update:</strong> ${data.message}</p>
          </div>
          <p>You can track your repair progress at any time on our website.</p>
          <p>Thank you for your patience!</p>
        </div>
      </div>
    `,
    text: `Repair Status Update - ${data.repairId}\n\nDear ${data.customerName},\n\nStatus: ${data.status}\nUpdate: ${data.message}\n\nTrack your repair progress on our website.\n\nThank you!`
  }),

  repairCompleted: (data: {
    customerName: string
    repairId: string
    deviceType: string
    deviceModel?: string
    totalCost: number | string
    notes?: string
  }) => ({
    subject: `✅ Repair Completed – ${data.repairId} | Collect Your Device`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 18px; font-size: 13px; margin-bottom: 10px; letter-spacing: 1px; }
          .content { padding: 30px 28px; }
          .info-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 18px; margin: 20px 0; border-radius: 0 10px 10px 0; }
          .label { font-weight: bold; color: #374151; display: inline-block; min-width: 130px; }
          .value { color: #1f2937; }
          .action-btn { display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px auto; font-weight: bold; font-size: 15px; }
          .disclaimer { background: #fefce8; border: 1px solid #fde047; padding: 14px; border-radius: 8px; font-size: 12px; color: #713f12; margin-top: 20px; }
          .footer { background: #1f2937; color: #9ca3af; padding: 18px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">✅ REPAIR COMPLETE</div>
            <h1 style="margin:10px 0 4px; font-size: 26px;">Your Device is Ready!</h1>
            <p style="margin:0; opacity:0.85;">Repair ID: ${data.repairId}</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.customerName}</strong>,</p>
            <p>Great news! Your <strong>${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''}</strong> has been fully repaired and is ready for collection. 🎉</p>

            <div class="info-box">
              <h3 style="margin-top:0; color:#15803d;">📋 Repair Summary</h3>
              <p><span class="label">Repair ID:</span> <span class="value"><strong>${data.repairId}</strong></span></p>
              <p><span class="label">Device:</span> <span class="value">${data.deviceType}${data.deviceModel ? ` – ${data.deviceModel}` : ''}</span></p>
              <p style="margin-bottom:0;"><span class="label">Total Cost:</span> <span class="value" style="font-size:17px; font-weight:bold; color:#15803d;">Le ${typeof data.totalCost === 'number' ? data.totalCost.toLocaleString() : data.totalCost}</span></p>
              ${data.notes ? `<p style="margin-top:10px; font-size:13px; color:#374151;"><span class="label">Notes:</span> <span class="value">${data.notes}</span></p>` : ''}
            </div>

            <div style="text-align:center;">
              <a href="https://www.itservicesfreetown.com/track-repair" class="action-btn">📍 Track Your Repair</a>
            </div>

            <div class="disclaimer">
              ⚠️ <strong>Please collect your device promptly.</strong> Repaired devices must be collected within <strong>48 hours</strong> of completion. BridgeTech IT Services is not responsible for any device left uncollected beyond 48 hours, and uncollected devices may be treated as abandoned under our storage policy.
            </div>

            <p style="margin-top:20px; font-size:14px; color:#6b7280;">To collect your device, visit our shop at <strong>#1 Regent Highway, Jui Junction, Freetown</strong>. Please bring a valid ID. We're open Monday–Saturday, 9am–6pm.</p>
          </div>
          <div class="footer">
            <p style="margin:0;"><strong>BridgeTech IT Services</strong></p>
            <p style="margin:5px 0 0;">#1 Regent Highway, Jui Junction, Freetown &nbsp;|&nbsp; <a href="tel:+23233399391" style="color:#dc2626; text-decoration:none;">+232 33 399 391</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `✅ REPAIR COMPLETED – ${data.repairId}\n\nDear ${data.customerName},\n\nYour ${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''} repair is complete and ready for collection!\n\nRepair ID: ${data.repairId}\nTotal Cost: Le ${data.totalCost}\n${data.notes ? `Notes: ${data.notes}\n` : ''}\nPlease collect your device at:\n#1 Regent Highway, Jui Junction, Freetown\nMon–Sat, 9am–6pm | +232 33 399 391\n\nIMPORTANT: Devices must be collected within 48 hours. Devices left uncollected beyond 48 hours may be treated as abandoned.\n\nThank you for choosing BridgeTech IT Services!`
  }),

  repairCancelled: (data: {
    customerName: string
    repairId: string
    deviceType: string
    deviceModel?: string
    cancellationReason?: string
  }) => ({
    subject: `❌ Repair Cancelled – ${data.repairId} | Collect Your Device`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 18px; font-size: 13px; margin-bottom: 10px; letter-spacing: 1px; }
          .content { padding: 30px 28px; }
          .info-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 18px; margin: 20px 0; border-radius: 0 10px 10px 0; }
          .label { font-weight: bold; color: #374151; display: inline-block; min-width: 130px; }
          .value { color: #1f2937; }
          .action-btn { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px auto; font-weight: bold; font-size: 15px; }
          .disclaimer { background: #fef9c3; border: 1px solid #fde047; padding: 14px; border-radius: 8px; font-size: 12px; color: #713f12; margin-top: 20px; }
          .footer { background: #1f2937; color: #9ca3af; padding: 18px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">❌ REPAIR CANCELLED</div>
            <h1 style="margin:10px 0 4px; font-size: 26px;">Repair Has Been Cancelled</h1>
            <p style="margin:0; opacity:0.85;">Repair ID: ${data.repairId}</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.customerName}</strong>,</p>
            <p>We regret to inform you that your repair for the <strong>${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''}</strong> has been cancelled after the diagnostic phase.</p>

            <div class="info-box">
              <h3 style="margin-top:0; color:#b91c1c;">📋 Repair Details</h3>
              <p><span class="label">Repair ID:</span> <span class="value"><strong>${data.repairId}</strong></span></p>
              <p><span class="label">Device:</span> <span class="value">${data.deviceType}${data.deviceModel ? ` – ${data.deviceModel}` : ''}</span></p>
              ${data.cancellationReason ? `<p style="margin-bottom:0;"><span class="label">Reason:</span> <span class="value">${data.cancellationReason}</span></p>` : ''}
            </div>

            <p style="color:#374151;">Your device has been secured and is ready for you to collect at your earliest convenience.</p>

            <div style="text-align:center;">
              <a href="https://www.itservicesfreetown.com/track-repair" class="action-btn">📍 Track Your Repair</a>
            </div>

            <div class="disclaimer">
              ⚠️ <strong>Please collect your device promptly.</strong> Your device must be collected within <strong>48 hours</strong> of cancellation. BridgeTech IT Services is not responsible for any device left uncollected beyond 48 hours, and uncollected devices may be treated as abandoned under our storage policy. Please collect your device immediately.
            </div>

            <p style="margin-top:20px; font-size:14px; color:#6b7280;">Visit us at <strong>#1 Regent Highway, Jui Junction, Freetown</strong>. Please bring a valid ID. We're open Monday–Saturday, 9am–6pm. If you have questions, call us at <a href="tel:+23233399391" style="color:#dc2626;">+232 33 399 391</a>.</p>
          </div>
          <div class="footer">
            <p style="margin:0;"><strong>BridgeTech IT Services</strong></p>
            <p style="margin:5px 0 0;">#1 Regent Highway, Jui Junction, Freetown &nbsp;|&nbsp; <a href="tel:+23233399391" style="color:#dc2626; text-decoration:none;">+232 33 399 391</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `❌ REPAIR CANCELLED – ${data.repairId}\n\nDear ${data.customerName},\n\nYour repair for the ${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''} has been cancelled.\n\nRepair ID: ${data.repairId}\n${data.cancellationReason ? `Reason: ${data.cancellationReason}\n` : ''}\nYour device is ready for collection at:\n#1 Regent Highway, Jui Junction, Freetown\nMon–Sat, 9am–6pm | +232 33 399 391\n\nIMPORTANT DISCLAIMER: Devices must be collected within 48 hours of cancellation. BridgeTech IT Services is not responsible for devices left uncollected beyond 48 hours, after which devices may be treated as abandoned. Please collect your device immediately.\n\nBridgeTech IT Services`
  }),

  repairCollectionReminder: (data: {
    customerName: string
    repairId: string
    deviceType: string
    deviceModel?: string
    status: string
    daysSinceUpdate?: number
    customMessage?: string
  }) => ({
    subject: `🔔 URGENT: Collect Your Device Within 48 Hours – ${data.repairId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 18px; font-size: 13px; margin-bottom: 10px; letter-spacing: 1px; }
          .content { padding: 30px 28px; }
          .info-box { background: #fffbeb; border-left: 4px solid #d97706; padding: 18px; margin: 20px 0; border-radius: 0 10px 10px 0; }
          .label { font-weight: bold; color: #374151; display: inline-block; min-width: 130px; }
          .value { color: #1f2937; }
          .action-btn { display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px auto; font-weight: bold; font-size: 15px; }
          .disclaimer { background: #fef2f2; border: 1px solid #fca5a5; padding: 14px; border-radius: 8px; font-size: 12px; color: #7f1d1d; margin-top: 20px; line-height: 1.6; }
          .footer { background: #1f2937; color: #9ca3af; padding: 18px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">🔔 COLLECTION REMINDER</div>
            <h1 style="margin:10px 0 4px; font-size: 26px;">Please Collect Your Device!</h1>
            <p style="margin:0; opacity:0.85;">Repair ID: ${data.repairId}</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.customerName}</strong>,</p>
            <p>This is an urgent reminder that your <strong>${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''}</strong> is ready for collection at our shop. Please collect your device within <strong>48 hours</strong>.</p>

            ${data.customMessage ? `<div style="background:#f8fafc; border-left:4px solid #3b82f6; padding:14px; margin:15px 0; border-radius:4px; font-size:14px; color:#1e293b;"><strong>Message from BridgeTech:</strong><br>${data.customMessage}</div>` : ''}

            <div class="info-box">
              <h3 style="margin-top:0; color:#b45309;">📋 Device Details</h3>
              <p><span class="label">Repair ID:</span> <span class="value"><strong>${data.repairId}</strong></span></p>
              <p><span class="label">Device:</span> <span class="value">${data.deviceType}${data.deviceModel ? ` – ${data.deviceModel}` : ''}</span></p>
              <p style="margin-bottom:0;"><span class="label">Status:</span> <span class="value" style="font-weight:bold; text-transform:capitalize;">${data.status.replace(/-/g, ' ')}</span></p>
              ${data.daysSinceUpdate ? `<p style="margin-top:8px; font-size:12px; color:#92400e;">⏳ Your device has been waiting for <strong>${data.daysSinceUpdate} day(s)</strong> since the last update.</p>` : ''}
            </div>

            <div style="text-align:center;">
              <a href="https://www.itservicesfreetown.com/track-repair" class="action-btn">📍 Track Your Repair</a>
            </div>

            <div class="disclaimer">
              <strong>⚠️ LEGAL DISCLAIMER – 48-HOUR COLLECTION POLICY</strong><br><br>
              BridgeTech IT Services has fulfilled its obligation to notify you that your device is ready for collection. Please be advised:<br><br>
              • <strong>Devices must be collected within 48 hours</strong> of reaching terminal status (completed, cancelled, or ready-for-pickup).<br>
              • <strong>After 48 hours</strong>, storage fees may be applied at management's discretion.<br>
              • <strong>After 48 hours of non-collection</strong>, BridgeTech IT Services reserves the right to treat the device as abandoned property, with no further liability to the owner.<br>
              • BridgeTech IT Services accepts no responsibility for any damage, loss, or deterioration of devices left in our custody beyond 48 hours.<br><br>
              By engaging our repair services, you agreed to collect your device in a timely manner as outlined in our Terms & Conditions.
            </div>

            <p style="margin-top:20px; font-size:14px; color:#6b7280;">Visit us at <strong>#1 Regent Highway, Jui Junction, Freetown</strong>. Please bring a valid ID. We're open Monday–Saturday, 9am–6pm. Questions? Call us: <a href="tel:+23233399391" style="color:#d97706;">+232 33 399 391</a>.</p>
          </div>
          <div class="footer">
            <p style="margin:0;"><strong>BridgeTech IT Services</strong></p>
            <p style="margin:5px 0 0;">#1 Regent Highway, Jui Junction, Freetown &nbsp;|&nbsp; <a href="tel:+23233399391" style="color:#dc2626; text-decoration:none;">+232 33 399 391</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `🔔 URGENT: COLLECT YOUR DEVICE WITHIN 48 HOURS – ${data.repairId}\n\nDear ${data.customerName},\n\nThis is an important reminder to collect your ${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''}.\n\nRepair ID: ${data.repairId}\nStatus: ${data.status}\n${data.daysSinceUpdate ? `Waiting: ${data.daysSinceUpdate} day(s) since last update\n` : ''}${data.customMessage ? `Message: ${data.customMessage}\n` : ''}\nCollect at:\n#1 Regent Highway, Jui Junction, Freetown\nMon–Sat, 9am–6pm | +232 33 399 391\n\nLEGAL DISCLAIMER:\nDevices must be collected within 48 hours of reaching terminal status. After 48 hours, storage fees may apply and uncollected devices may be treated as abandoned property, with no further liability on BridgeTech IT Services. BridgeTech IT Services accepts no responsibility for damage or loss of devices left beyond 48 hours.\n\nBridgeTech IT Services`
  }),

  repairCustomNotification: (data: {
    customerName: string
    repairId: string
    deviceType: string
    deviceModel?: string
    status: string
    subject?: string
    message: string
  }) => ({
    subject: data.subject || `Update regarding your repair – ${data.repairId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #040e40 0%, #1e3a8a 100%); color: white; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 18px; font-size: 13px; margin-bottom: 10px; letter-spacing: 1px; }
          .content { padding: 30px 28px; }
          .message-box { background: #f8fafc; border-left: 4px solid #2563eb; padding: 18px; margin: 20px 0; border-radius: 0 10px 10px 0; font-size: 14px; color: #1e293b; line-height: 1.6; }
          .info-box { background: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 15px 0; font-size: 13px; }
          .label { font-weight: bold; color: #475569; display: inline-block; min-width: 120px; }
          .action-btn { display: inline-block; background: #040e40; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px auto; font-weight: bold; font-size: 14px; }
          .disclaimer { background: #fefce8; border: 1px solid #fde047; padding: 12px; border-radius: 8px; font-size: 11px; color: #713f12; margin-top: 20px; }
          .footer { background: #1f2937; color: #9ca3af; padding: 18px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">📢 SERVICE UPDATE</div>
            <h1 style="margin:10px 0 4px; font-size: 24px;">Message from BridgeTech</h1>
            <p style="margin:0; opacity:0.85;">Repair ID: ${data.repairId}</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.customerName}</strong>,</p>
            <p>We are reaching out to you regarding your repair for the <strong>${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''}</strong>.</p>

            <div class="message-box">
              ${data.message.replace(/\n/g, '<br>')}
            </div>

            <div class="info-box">
              <p style="margin:4px 0;"><span class="label">Repair ID:</span> <strong>${data.repairId}</strong></p>
              <p style="margin:4px 0;"><span class="label">Device:</span> ${data.deviceType}${data.deviceModel ? ` – ${data.deviceModel}` : ''}</p>
              <p style="margin:4px 0;"><span class="label">Current Status:</span> <strong style="text-transform:capitalize;">${data.status.replace(/-/g, ' ')}</strong></p>
            </div>

            <div style="text-align:center;">
              <a href="https://www.itservicesfreetown.com/track-repair" class="action-btn">📍 Track Your Repair Online</a>
            </div>

            <div class="disclaimer">
              ℹ️ <strong>Collection Policy:</strong> Repaired or terminal devices must be collected within 48 hours. BridgeTech IT Services is not responsible for devices left uncollected past 48 hours.
            </div>

            <p style="margin-top:20px; font-size:13px; color:#6b7280;">If you have any questions or need further assistance, please contact us at <a href="tel:+23233399391" style="color:#2563eb;">+232 33 399 391</a> or visit us at #1 Regent Highway, Jui Junction, Freetown.</p>
          </div>
          <div class="footer">
            <p style="margin:0;"><strong>BridgeTech IT Services</strong></p>
            <p style="margin:5px 0 0;">#1 Regent Highway, Jui Junction, Freetown &nbsp;|&nbsp; <a href="tel:+23233399391" style="color:#dc2626; text-decoration:none;">+232 33 399 391</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `📢 UPDATE REGARDING REPAIR ${data.repairId}\n\nDear ${data.customerName},\n\nDevice: ${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''}\nStatus: ${data.status}\n\nMessage:\n${data.message}\n\nTrack repair: https://www.itservicesfreetown.com/track-repair\nContact: +232 33 399 391 | #1 Regent Highway, Jui Junction, Freetown\n\nBridgeTech IT Services`
  }),

  noShowFollowUp: (data: {
    customerName: string
    repairId: string
    deviceType: string
    deviceModel?: string
    appointmentDate?: string
    customMessage?: string
  }) => ({
    subject: `👋 We Missed You! – Still Need Help with Your ${data.deviceType}? | ${data.repairId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 32px 24px; text-align: center; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 50px; padding: 6px 18px; font-size: 13px; margin-bottom: 10px; letter-spacing: 1px; }
          .content { padding: 30px 28px; }
          .info-box { background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 18px; margin: 20px 0; border-radius: 0 10px 10px 0; }
          .label { font-weight: bold; color: #374151; display: inline-block; min-width: 130px; }
          .value { color: #1f2937; }
          .action-btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 10px 6px; font-weight: bold; font-size: 14px; }
          .action-btn-green { display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 10px 6px; font-weight: bold; font-size: 14px; }
          .note-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 8px; font-size: 13px; color: #1e40af; margin-top: 20px; line-height: 1.6; }
          .footer { background: #1f2937; color: #9ca3af; padding: 18px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">👋 WE MISSED YOU</div>
            <h1 style="margin:10px 0 4px; font-size: 26px;">Do You Still Need Our Help?</h1>
            <p style="margin:0; opacity:0.85;">Booking Reference: ${data.repairId}</p>
          </div>
          <div class="content">
            <p>Dear <strong>${data.customerName}</strong>,</p>
            <p>We noticed that you had a booking with us${data.appointmentDate ? ` on <strong>${data.appointmentDate}</strong>` : ''} for your <strong>${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''}</strong>, but we didn't get to see you. We hope everything is okay on your end! 😊</p>

            <div class="info-box">
              <h3 style="margin-top:0; color:#6d28d9;">📋 Booking Details</h3>
              <p><span class="label">Booking Ref:</span> <span class="value"><strong>${data.repairId}</strong></span></p>
              <p><span class="label">Device:</span> <span class="value">${data.deviceType}${data.deviceModel ? ` – ${data.deviceModel}` : ''}</span></p>
              ${data.appointmentDate ? `<p style="margin-bottom:0;"><span class="label">Scheduled Date:</span> <span class="value">${data.appointmentDate}</span></p>` : ''}
            </div>

            ${data.customMessage ? `<div style="background:#f8fafc; border-left:4px solid #4f46e5; padding:14px; margin:15px 0; border-radius:4px; font-size:14px; color:#1e293b;"><strong>Message from BridgeTech:</strong><br>${data.customMessage}</div>` : ''}

            <p style="color:#374151;">If you still need help fixing your device, we're ready to assist you! You can:</p>
            <ul style="color:#374151; line-height:2;">
              <li>Walk into our shop — no appointment needed</li>
              <li>Book a new appointment online</li>
              <li>Call or WhatsApp us directly</li>
            </ul>

            <div style="text-align:center; margin:25px 0;">
              <a href="https://www.itservicesfreetown.com/book-appointment" class="action-btn">📅 Book New Appointment</a>
              <a href="https://wa.me/23233399391" class="action-btn-green">💬 WhatsApp Us</a>
            </div>

            <div class="note-box">
              ℹ️ <strong>No pressure at all!</strong> If you've already had the device fixed elsewhere or no longer need the service, no worries — we totally understand. We just wanted to check in and let you know we're still here whenever you need us. 🙌
            </div>

            <p style="margin-top:24px; font-size:13px; color:#6b7280;">
              Visit us at <strong>#1 Regent Highway, Jui Junction, Freetown</strong> — Mon–Sat, 9am–6pm.<br>
              Call or WhatsApp: <a href="tel:+23233399391" style="color:#4f46e5;">+232 33 399 391</a>
            </p>
          </div>
          <div class="footer">
            <p style="margin:0;"><strong>BridgeTech IT Services</strong></p>
            <p style="margin:5px 0 0;">#1 Regent Highway, Jui Junction, Freetown &nbsp;|&nbsp; <a href="tel:+23233399391" style="color:#dc2626; text-decoration:none;">+232 33 399 391</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `👋 WE MISSED YOU – ${data.repairId}\n\nDear ${data.customerName},\n\nWe noticed you had a booking${data.appointmentDate ? ` on ${data.appointmentDate}` : ''} for your ${data.deviceType}${data.deviceModel ? ` (${data.deviceModel})` : ''} but we didn't get to see you. We hope all is well!\n\nBooking Ref: ${data.repairId}\nDevice: ${data.deviceType}${data.deviceModel ? ` – ${data.deviceModel}` : ''}${data.appointmentDate ? `\nScheduled: ${data.appointmentDate}` : ''}${data.customMessage ? `\n\nMessage: ${data.customMessage}` : ''}\n\nIf you still need help, we're here for you:\n• Walk in anytime — no appointment needed\n• Book online: https://www.itservicesfreetown.com/book-appointment\n• WhatsApp: https://wa.me/23233399391\n• Call: +232 33 399 391\n\nNo pressure if you've sorted it out — we just wanted to check in!\n\n#1 Regent Highway, Jui Junction, Freetown\nMon–Sat, 9am–6pm\n\nBridgeTech IT Services`
  }),

  orderConfirmation: (data: {
    orderNumber: string;
    customerName: string;
    total: number;
    items: { name: string; quantity: number; price: number }[];
    paymentMethod: string;
  }) => ({
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #040e40; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Thank You for Your Order!</h1>
          <p style="margin: 10px 0 0; opacity: 0.8;">Order ${data.orderNumber}</p>
        </div>
        <div style="padding: 30px; background-color: white;">
          <p>Hi ${data.customerName},</p>
          <p>We've received your order and we're getting it ready for you. You'll receive another email once your order has been processed.</p>
          
          <div style="margin: 30px 0; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Order Summary</h3>
            ${data.items.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">${item.name} x ${item.quantity}</span>
                <span style="font-weight: bold; color: #111827;">Le ${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between;">
              <span style="font-weight: bold; color: #111827; font-size: 18px;">Total</span>
              <span style="font-weight: bold; color: #dc2626; font-size: 18px;">Le ${data.total.toLocaleString()}</span>
            </div>
          </div>

          <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Payment Method:</strong> ${data.paymentMethod.replace('_', ' ').toUpperCase()}</p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">If you have any questions, please contact our support team at <a href="tel:+23233399391" style="color: #040e40; text-decoration: none;">+232 33 399 391</a>.</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">© 2026 BridgeTech IT Services. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `Order Confirmation - ${data.orderNumber}\n\nHi ${data.customerName},\n\nThank you for your order! Your total is Le ${data.total.toLocaleString()}.\n\nItems:\n${data.items.map(item => `- ${item.name} x ${item.quantity}: Le ${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n\nPayment Method: ${data.paymentMethod}\n\nContact us: +232 33 399 391`
  }),
  newsletterConfirmation: (data: {
    email: string
  }) => ({
    subject: '🎉 Welcome to BridgeTech IT Services Newsletter!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #040e40 0%, #dc2626 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #040e40 0%, #dc2626 100%); padding: 40px 20px; text-align: center; color: white;">
          <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 30px;">
            ✉️
          </div>
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome!</h1>
          <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">You're now part of our community</p>
        </div>
        
        <div style="padding: 40px 30px; background: white;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing to <strong>BridgeTech IT Services's Newsletter</strong>! 🎊
          </p>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #fef2f2 100%); border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #040e40; margin-top: 0;">What You'll Get:</h3>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
              <li>✅ Weekly computer & mobile repair tips</li>
              <li>✅ Exclusive service updates & special offers</li>
              <li>✅ Tech troubleshooting guides</li>
              <li>✅ First access to new services</li>
              <li>✅ Freetown-specific tech news</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0;">
            Our newsletter is curated for residents and businesses in Freetown who want to keep their devices running smoothly. Expect practical advice, special discounts, and valuable insights delivered straight to your inbox every week.
          </p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              <strong>Need immediate help?</strong><br>
              <a href="tel:+23233399391" style="color: #dc2626; text-decoration: none; font-weight: bold;">Call us: +232 33 399 391</a>
            </p>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-top: 25px;">
            <strong>P.S.</strong> Check your email next Monday for your first exclusive tip from our expert technicians!
          </p>
        </div>
        
        <div style="background: #f3f4f6; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 13px; margin: 10px 0;">
            <strong>BridgeTech IT Services</strong><br>
            #1 Regent Highway, Jui Junction, Freetown, Sierra Leone<br>
            <a href="tel:+23233399391" style="color: #dc2626; text-decoration: none;">+232 33 399 391</a> | 
            <a href="https://itservicesfreetown.com" style="color: #dc2626; text-decoration: none;">Visit Our Website</a>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0;">
            You received this email because you subscribed to our newsletter.<br>
            <a href="%unsubscribe_url%" style="color: #6b7280; text-decoration: none;">Unsubscribe from this list</a>
          </p>
        </div>
      </div>
    `,
    text: `Welcome to BridgeTech IT Services Newsletter!

Thank you for subscribing! You're now part of our community.

WHAT YOU'LL GET:
✓ Weekly computer & mobile repair tips
✓ Exclusive service updates & special offers
✓ Tech troubleshooting guides
✓ First access to new services
✓ Freetown-specific tech news

Expect practical advice, special discounts, and valuable insights delivered to your inbox every week.

NEED IMMEDIATE HELP?
Call us: +232 33 399 391

---
BridgeTech IT Services
#1 Regent Highway, Jui Junction, Freetown, Sierra Leone
+232 33 399 391`
  }),

  adminOrderNotification: (data: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    items: { name: string; quantity: number }[];
    paymentMethod: string;
  }) => ({
    subject: `🔔 New Order - ${data.orderNumber} | ${data.customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #dc2626; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">New Order Received!</h2>
          <p style="margin: 5px 0 0;">${data.orderNumber}</p>
        </div>
        <div style="padding: 25px;">
          <h3 style="color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Customer Details</h3>
          <p><strong>Name:</strong> ${data.customerName}</p>
          <p><strong>Phone:</strong> ${data.customerPhone}</p>
          <p><strong>Payment:</strong> ${data.paymentMethod}</p>

          <h3 style="color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 25px;">Items Ordered</h3>
          <ul style="padding-left: 20px; color: #374151;">
            ${data.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join('')}
          </ul>
          
          <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">Total Amount: Le ${data.total.toLocaleString()}</p>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="tel:${data.customerPhone}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Call Customer</a>
          </div>
        </div>
      </div>
    `,
    text: `NEW ORDER - ${data.orderNumber}\n\nCustomer: ${data.customerName}\nPhone: ${data.customerPhone}\nPayment: ${data.paymentMethod}\n\nItems:\n${data.items.map(item => `- ${item.name} x ${item.quantity}`).join('\n')}\n\nTotal: Le ${data.total.toLocaleString()}`
  }),

  twoFactorVerificationCode: (data: { code: string; expiresMinutes: number }) => ({
    subject: `🔐 Your BridgeTech IT Services Admin 2FA Security Code: ${data.code}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%); padding: 30px 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; color: #ffffff; letter-spacing: 0.5px;">🛡️ Master Admin Verification</h2>
          <p style="margin: 6px 0 0; color: #fecaca; font-size: 14px;">BridgeTech IT Services Centralized Security</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <p style="font-size: 15px; color: #94a3b8; margin-top: 0;">Use the 6-digit security code below to complete your login to the Master Admin Panel:</p>
          
          <div style="margin: 28px 0; background: #1e293b; border: 1px dashed #ef4444; border-radius: 12px; padding: 20px; display: inline-block;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #f8fafc; text-shadow: 0 0 10px rgba(239, 68, 68, 0.4);">${data.code}</span>
          </div>

          <p style="font-size: 13px; color: #ef4444; margin-bottom: 24px; font-weight: 600;">⏱️ This code expires in ${data.expiresMinutes} minutes.</p>

          <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; border-top: 1px solid #334155; padding-top: 20px;">
            If you did not attempt to log in to the BridgeTech IT Services Master Admin Panel, please ignore this email or change your admin credentials immediately.
          </p>
        </div>
        <div style="background: #090d16; padding: 16px; text-align: center; font-size: 12px; color: #475569;">
          BridgeTech IT Services Security Operations • #1 Regent Highway, Jui Junction
        </div>
      </div>
    `,
    text: `Your BridgeTech IT Services Admin 2FA Code is: ${data.code}\n\nThis code will expire in ${data.expiresMinutes} minutes.\nIf you did not request this code, please secure your admin credentials.`
  }),

  surprisePaymentSubmitted: (data: {
    recipientName: string;
    achievement: string;
    planName: string;
    amount: string;
    paymentMethod: string;
    code: string;
    revealUrl: string;
  }) => ({
    subject: `🎉 Payment Confirmation Received: ${data.recipientName}'s Certificate`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1120; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 30px 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; color: #ffffff;">🌟 Payment Received & Under Review</h2>
          <p style="margin: 6px 0 0; color: #fef3c7; font-size: 14px;">BridgeTech Celebration & Recognition Studio</p>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; color: #e2e8f0; margin-top: 0;">Hello,</p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
            We received your payment confirmation for <strong style="color: #fcd34d;">${data.recipientName}</strong>'s official Certificate of Recognition.
          </p>

          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;"><strong>Recipient:</strong> <span style="color: #ffffff;">${data.recipientName}</span></p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;"><strong>Achievement:</strong> <span style="color: #ffffff;">${data.achievement}</span></p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;"><strong>Selected Plan:</strong> <span style="color: #f59e0b; font-weight: bold;">${data.planName} (${data.amount})</span></p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;"><strong>Payment Method:</strong> <span style="color: #ffffff;">${data.paymentMethod}</span></p>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong>Celebration Code:</strong> <code style="color: #fcd34d; font-family: monospace;">${data.code}</code></p>
          </div>

          <p style="font-size: 13px; color: #cbd5e1; line-height: 1.5;">
            Our admin team is verifying your payment. Once approved, you will receive a follow-up email and WhatsApp message with your <strong>Direct Certificate Download Link</strong>!
          </p>

          <div style="text-align: center; margin: 28px 0 10px;">
            <a href="${data.revealUrl}" style="background: #f59e0b; color: #0f172a; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block;">
              View Live Surprise Reveal ↗
            </a>
          </div>
        </div>
        <div style="background: #060911; padding: 16px; text-align: center; font-size: 12px; color: #475569;">
          BridgeTech IT Services • #1 Regent Highway, Jui Junction, Freetown • WhatsApp: +232 33 399 391
        </div>
      </div>
    `,
    text: `Payment confirmation received for ${data.recipientName}'s Certificate (${data.planName} - ${data.amount}). Once admin approves, you will receive your direct certificate download link!\nView reveal: ${data.revealUrl}`
  }),

  surpriseCertificateApproved: (data: {
    recipientName: string;
    achievement: string;
    certificateUrl: string;
    revealUrl: string;
    code: string;
  }) => ({
    subject: `🏆 Certificate Unlocked: Official Recognition for ${data.recipientName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b1120; border: 1px solid #d97706; border-radius: 16px; overflow: hidden; color: #f8fafc; box-shadow: 0 10px 30px rgba(217, 119, 6, 0.2);">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); padding: 32px 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 26px; color: #0f172a; font-weight: 900;">🏆 CERTIFICATE APPROVED & UNLOCKED</h2>
          <p style="margin: 6px 0 0; color: #451a03; font-size: 14px; font-weight: 700;">BridgeTech Celebration & Recognition Studio</p>
        </div>
        <div style="padding: 30px 24px; text-align: center;">
          <p style="font-size: 16px; color: #fcd34d; font-weight: 700; margin-top: 0;">Congratulations!</p>
          <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
            Payment for <strong style="color: #ffffff;">${data.recipientName}</strong>'s official Certificate of Recognition has been approved!
          </p>

          <div style="background: #1e293b; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #94a3b8;"><strong>Recipient:</strong> <span style="color: #fcd34d; font-weight: bold; font-size: 16px;">${data.recipientName}</span></p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;"><strong>Achievement:</strong> <span style="color: #ffffff;">${data.achievement}</span></p>
            <p style="margin: 0; font-size: 13px; color: #94a3b8;"><strong>Verification ID:</strong> <code style="color: #fcd34d; font-family: monospace;">${data.code}</code></p>
          </div>

          <div style="margin: 28px 0;">
            <a href="${data.certificateUrl}" style="background: linear-gradient(to right, #f59e0b, #d97706); color: #0f172a; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
              📥 Download High-Resolution Certificate
            </a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; margin: 20px 0 0;">
            You can also open and replay the live animated reveal page anytime:<br>
            <a href="${data.revealUrl}" style="color: #f59e0b; text-decoration: underline;">${data.revealUrl}</a>
          </p>
        </div>
        <div style="background: #060911; padding: 16px; text-align: center; font-size: 12px; color: #475569;">
          BridgeTech IT Services • #1 Regent Highway, Jui Junction, Freetown • WhatsApp: +232 33 399 391
        </div>
      </div>
    `,
    text: `Your Certificate for ${data.recipientName} is approved!\nDownload here: ${data.certificateUrl}\nView reveal: ${data.revealUrl}`
  })
}
