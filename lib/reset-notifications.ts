// Simple notification system for password resets
// In production, integrate with proper email service like SendGrid, Mailgun, or AWS SES

export interface NotificationConfig {
  adminEmail?: string;
  siteName: string;
  siteUrl: string;
}

const DEFAULT_CONFIG: NotificationConfig = {
  siteName: 'IT Services Freetown',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
  adminEmail: process.env.ADMIN_EMAIL || undefined
};

// Format reset token email content
export function formatResetTokenEmail(token: string, config: NotificationConfig = DEFAULT_CONFIG): {
  subject: string;
  htmlContent: string;
  textContent: string;
} {
  const resetUrl = `${config.siteUrl}/admin/reset-password?token=${token}`;
  
  return {
    subject: `Password Reset - ${config.siteName} Admin Panel`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937, #3b82f6, #dc2626); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset Request</h1>
          <p style="color: #f3f4f6; margin: 10px 0 0 0;">${config.siteName} Admin Panel</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h2 style="color: #374151; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            A password reset has been requested for your admin account. Use the token below to reset your password:
          </p>
          
          <div style="background: white; padding: 15px; border: 2px solid #e5e7eb; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #374151; font-weight: bold;">Reset Token:</p>
            <code style="background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-family: 'Courier New', monospace; color: #dc2626; font-size: 14px; word-break: break-all;">${token}</code>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              🔑 Reset Password Now
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⏰ Important:</strong> This token will expire in <strong>15 minutes</strong>. If you didn't request this reset, please ignore this email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated message from ${config.siteName}<br>
            <a href="${config.siteUrl}" style="color: #dc2626; text-decoration: none;">${config.siteUrl}</a>
          </p>
        </div>
      </div>
    `,
    textContent: `
Password Reset Request - ${config.siteName}

A password reset has been requested for your admin account.

Reset Token: ${token}

To reset your password, visit:
${resetUrl}

⏰ IMPORTANT: This token expires in 15 minutes.

If you didn't request this reset, please ignore this email.

---
${config.siteName}
${config.siteUrl}
    `
  };
}

// Log notification (for development/debugging)
export function logResetNotification(token: string, config: NotificationConfig = DEFAULT_CONFIG): void {
  const notification = formatResetTokenEmail(token, config);
  
  console.log('📧 Password Reset Notification');
  console.log('===============================');
  console.log('TO:', config.adminEmail || 'No email configured');
  console.log('SUBJECT:', notification.subject);
  console.log('RESET TOKEN:', token);
  console.log('RESET URL:', `${config.siteUrl}/admin/reset-password?token=${token}`);
  console.log('EXPIRES:', new Date(Date.now() + 15 * 60 * 1000).toLocaleString());
  console.log('===============================');
}

// Send email notification (stub for future implementation)
export async function sendResetNotification(token: string, config: NotificationConfig = DEFAULT_CONFIG): Promise<boolean> {
  // Log the notification for development
  logResetNotification(token, config);
  
  // TODO: Implement actual email sending
  // Example integrations:
  
  /* 
  // SendGrid Example:
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = formatResetTokenEmail(token, config);
  await sgMail.send({
    to: config.adminEmail,
    from: 'noreply@your-domain.com',
    subject: msg.subject,
    html: msg.htmlContent,
    text: msg.textContent
  });
  */
  
  /* 
  // Nodemailer Example:
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransporter({
    // Configure your email provider
  });
  
  const msg = formatResetTokenEmail(token, config);
  await transporter.sendMail({
    from: '"IT Services" <noreply@your-domain.com>',
    to: config.adminEmail,
    subject: msg.subject,
    html: msg.htmlContent,
    text: msg.textContent
  });
  */
  
  // For now, return true (development mode)
  return true;
}

// Get notification preview (for testing)
export function getResetNotificationPreview(token: string, config: NotificationConfig = DEFAULT_CONFIG): string {
  const notification = formatResetTokenEmail(token, config);
  return notification.htmlContent;
}