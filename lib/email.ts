import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailData) {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
      console.log('Email service not configured. Would send:', { to, subject })
      console.log('To configure email, update SMTP_USER and SMTP_PASS in .env.local')
      return { success: true, messageId: 'dev-mode', note: 'Email service not configured' }
    }

    const result = await transporter.sendMail({
      from: `"IT Services Freetown" <${process.env.SMTP_USER || 'noreply@itservicesfreetown.com'}>`,
      to,
      subject,
      html,
      text,
    })
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: (error as Error).message }
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
            <p>Thank you for choosing IT Services Freetown. Your appointment has been confirmed with the following details:</p>
            
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
            <p style="margin:10px 0 0;">IT Services Freetown<br>
            1 Regent Highway, Jui Junction<br>
            Freetown, Sierra Leone<br>
            +232 33 399 391</p>
            <p style="margin:10px 0 0; font-size:12px; color:#9ca3af;">© 2026 IT Services Freetown. All rights reserved.</p>
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
IT Services Freetown`
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
            <p>IT Services Freetown<br>
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
IT Services Freetown`
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
            <p>IT Services Freetown - Admin Notification<br>
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
IT Services Freetown - Auto-generated notification`
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
    totalCost: number
    pickupInstructions: string
  }) => ({
    subject: `Repair Completed - ${data.repairId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #22c55e; color: white; padding: 20px; text-align: center;">
          <h1>Repair Completed!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${data.customerName},</p>
          <p>Great news! Your ${data.deviceType} repair has been completed successfully.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Repair ID:</strong> ${data.repairId}</p>
            <p><strong>Total Cost:</strong> $${data.totalCost}</p>
            <p><strong>Pickup Instructions:</strong> ${data.pickupInstructions}</p>
          </div>
          <p>Your device is ready for pickup. Please bring a valid ID and your repair receipt.</p>
          <p>Thank you for choosing IT Services Freetown!</p>
        </div>
      </div>
    `,
    text: `Repair Completed - ${data.repairId}\n\nDear ${data.customerName},\n\nYour ${data.deviceType} repair is complete!\n\nTotal Cost: $${data.totalCost}\nPickup Instructions: ${data.pickupInstructions}\n\nThank you for choosing IT Services Freetown!`
  })
}
