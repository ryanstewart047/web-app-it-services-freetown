import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    // Check if email exists in the database
    const technician = await prisma.technician.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Always return the same message to prevent email enumeration attacks
    // but only proceed with sending if the account actually exists
    if (!technician || !technician.active) {
      // We still return success to avoid revealing whether the email is registered
      return NextResponse.json({ success: true });
    }

    // Generate a secure temporary password
    const temporaryPassword = crypto.randomBytes(6).toString('hex'); // 12‑char hex
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Flag the account for mandatory password change
    await prisma.technician.update({
      where: { id: technician.id },
      data: { passwordHash, requiresPasswordChange: true },
    });

    // Send the temporary password by email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itservicesfreetown.com';
      const loginUrl = `${frontendUrl}/forum/auth/login`;

      await transporter.sendMail({
        from: `"IT Services Freetown" <${process.env.SMTP_USER}>`,
        to: technician.email,
        subject: 'Your Password Reset Request – SL Tech Stack Forum',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #040e40; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px;">Password Reset</h1>
              <p style="color: #93c5fd; margin: 6px 0 0; font-size: 13px; letter-spacing: 0.05em;">SL Tech Stack Forum</p>
            </div>
            <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="margin-top:0;">Hello ${technician.name},</h2>
              <p>We received a request to reset the password for your account registered with <strong>${technician.email}</strong>.</p>
              <p>Your one-time temporary password is below:</p>

              <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #c7d2fe; text-align: center;">
                <p style="margin: 0 0 8px; color: #555; font-size: 13px;">One-Time Temporary Password</p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e3a8a; font-family: monospace;">${temporaryPassword}</div>
              </div>

              <div style="text-align: center; margin: 28px 0;">
                <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Log In &amp; Set New Password</a>
              </div>

              <p style="color: #dc2626; font-weight: bold;">⚠ Important:</p>
              <ul style="color:#555; padding-left:20px;">
                <li>This temporary password is for <strong>one-time use only</strong>.</li>
                <li>You will be immediately prompted to choose a new password after logging in.</li>
                <li>If you did not request this reset, please contact us immediately.</li>
              </ul>

              <p style="font-size: 13px; color: #888;">Hotline: <strong>+23233399391</strong></p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;" />
              <p style="font-size: 11px; color: #999; text-align: center; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} IT Services Freetown. All rights reserved.<br/>
                1 Regent Highway, Jui Junction, East Freetown
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send forgot-password email:', emailError);
      // Still return success (password was reset in DB) – user can contact admin if email fails
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
