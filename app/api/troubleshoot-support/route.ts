import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, email, deviceType, deviceModel, issueDescription, aiDiagnosis } = data;

    if (!email || !issueDescription || !name) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and issue description are required' },
        { status: 400 }
      );
    }

    // Configure NodeMailer Transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 1. Email to the Customer (Confirmation)
    const customerMailOptions = {
      from: `"IT Services Freetown Support" <${process.env.SMTP_USER}>`,
      to: email, // Customer's email
      subject: 'Support Ticket Received - IT Services Freetown',
      replyTo: process.env.SMTP_USER,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #040e40; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
             <h1 style="color: white; margin: 0;">IT Services Freetown</h1>
          </div>
          <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
            <h2>We have received your support ticket!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for reaching out to IT Services Freetown. This email is to confirm that we have successfully received your troubleshooting ticket.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <h3 style="margin-top: 0; color: #040e40;">Your Ticket Details:</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>Device Type:</strong> ${deviceType}</li>
                <li><strong>Model:</strong> ${deviceModel || 'Not specified'}</li>
              </ul>
              <p style="margin-bottom: 0;"><strong>Issue Description:</strong><br/>${issueDescription}</p>
            </div>

            <p>Our expert technicians are reviewing the AI diagnosis and will contact you shortly with the next steps.</p>
            <p>If you need immediate assistance, please reply directly to this email or call our support hotline.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">
              &copy; ${new Date().getFullYear()} IT Services Freetown. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    // 2. Email to the Technician (Notification)
    const technicianMailOptions = {
      from: `"Website AI Troubleshooter" <${process.env.SMTP_USER}>`,
      to: 'support@itservicesfreetown.com', // Main business email
      subject: `[New Ticket] ${deviceType} Support Request from ${email}`,
      replyTo: email, // This allows the technician to hit 'Reply' and talk to the customer
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">ACTION REQUIRED: New Support Ticket</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Customer Name:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone Number:</td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${phone}">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Customer Email:</td>
              <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Device Type:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${deviceType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Device Model:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${deviceModel || 'Not specified'}</td>
            </tr>
          </table>

          <h3 style="margin-top: 25px;">Issue Description:</h3>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #4b5563; margin-bottom: 20px;">
            ${issueDescription}
          </div>

          <h3>System / AI Context Provided:</h3>
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #f59e0b; color: #854d0e;">
            ${aiDiagnosis}
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="mailto:${email}" style="display: inline-block; padding: 14px 28px; background-color: #dc2626; color: white; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 16px;">
              Reply to ${name}
            </a>
            <p style="margin-top: 15px; font-size: 13px; color: #666;">
              Or click 'Reply' in your email client to talk to the customer directly.
            </p>
          </div>
        </div>
      `,
    };

    // Send both emails simultaneously
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(technicianMailOptions)
    ]);

    return NextResponse.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
