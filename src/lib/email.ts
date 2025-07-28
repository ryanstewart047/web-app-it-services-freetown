import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
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
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@itservicesfreetown.com',
      to,
      subject,
      html,
      text,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

export const emailTemplates = {
  appointmentConfirmation: (data: {
    customerName: string
    appointmentId: string
    date: string
    time: string
    deviceType: string
    deviceModel: string
  }) => ({
    subject: `Appointment Confirmed - ${data.appointmentId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #040e40; color: white; padding: 20px; text-align: center;">
          <h1>Appointment Confirmed</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${data.customerName},</p>
          <p>Your repair appointment has been confirmed with the following details:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Appointment ID:</strong> ${data.appointmentId}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Device:</strong> ${data.deviceType} - ${data.deviceModel}</p>
          </div>
          <p>We'll send you updates as your repair progresses. You can track your repair status at any time using your appointment ID.</p>
          <p>Thank you for choosing IT Services Freetown!</p>
        </div>
      </div>
    `,
    text: `Appointment Confirmed - ${data.appointmentId}\n\nDear ${data.customerName},\n\nYour repair appointment has been confirmed for ${data.date} at ${data.time} for your ${data.deviceType} - ${data.deviceModel}.\n\nAppointment ID: ${data.appointmentId}\n\nThank you for choosing IT Services Freetown!`
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
