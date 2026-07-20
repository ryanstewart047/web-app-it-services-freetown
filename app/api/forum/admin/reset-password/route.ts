import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function requireAdmin() {
  const adminToken = cookies().get('forum_admin_session')?.value;
  if (!adminToken) return null;

  const adminPayload = await verifySession(adminToken);
  if (adminPayload?.role !== 'superadmin') return null;

  return { id: 'master-admin', name: 'IT Services Freetown', role: 'superadmin', active: true };
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userToReset = await prisma.technician.findUnique({ where: { id: userId } });
    if (!userToReset) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate a secure temporary password
    const temporaryPassword = crypto.randomBytes(6).toString('hex'); // 12-char string
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    await prisma.technician.update({
      where: { id: userId },
      data: { passwordHash, requiresPasswordChange: true },
    });

    // Send the password via email
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

      const mailOptions = {
        from: `"IT Services Freetown" <${process.env.SMTP_USER}>`,
        to: userToReset.email,
        subject: 'Your Forum Account Password Has Been Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #040e40; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
               <h1 style="color: white; margin: 0;">Account Reset</h1>
            </div>
            <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
              <h2>Hello ${userToReset.name},</h2>
              <p>Your password for the IT Services Freetown Technician Forum has been reset by an administrator.</p>
              
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; text-align: center;">
                <p style="margin-bottom: 5px; color: #666;">Your One-Time Temporary Password is:</p>
                <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #040e40; font-family: monospace;">${temporaryPassword}</div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Forum</a>
              </div>

              <p style="color: #dc2626; font-weight: bold;">Important:</p>
              <ul>
                <li>This is a one-time use password.</li>
                <li>You will be required to choose a new password immediately upon logging in.</li>
              </ul>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} IT Services Freetown. All rights reserved.<br/>
                1 Regent High way, Jui Junction, East Freetown
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully and email sent',
      temporaryPassword,
    });
  } catch (error: any) {
    console.error('Password Reset Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
