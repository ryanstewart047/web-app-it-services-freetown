import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, phone, expertise, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // --- Strict email format validation ---
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // --- Block disposable / obviously fake email domains ---
    const BLOCKED_DOMAINS = [
      'mailinator.com', 'guerrillamail.com', 'trashmail.com', 'tempmail.com',
      'throwam.com', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
      'grr.la', 'mailnull.com', 'spamgourmet.com', 'fakeinbox.com', 'dispostable.com',
      'maildrop.cc', 'spamgourmet.org', 'spam4.me', 'tempr.email', 'discard.email',
      'example.com', 'test.com', 'sample.com'
    ];
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (!emailDomain || BLOCKED_DOMAINS.includes(emailDomain)) {
      return NextResponse.json({ error: 'This email domain is not allowed. Please use a real email address.' }, { status: 400 });
    }


    const existingTech = await prisma.technician.findUnique({ where: { email } });
    if (existingTech) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomUUID();

    const technician = await prisma.technician.create({
      data: {
        name,
        email,
        phone: phone || '',
        expertise: expertise || 'General Support',
        passwordHash,
        verificationToken,
        emailVerified: false,
        isOnline: false,
      }
    });

    // Send Verification Email via NodeMailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify token URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/forum/verify?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"Sierra Leone Technician Forum" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify your Technician Account',
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 40px; border-radius: 12px; border: 1px solid #1e293b;">
          <h2 style="color: #60a5fa; margin-bottom: 24px;">Welcome to the IT Services Freetown Forum!</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Hello ${name},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">To securely activate your Technician Dashboard and join the discussion, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">If you did not request this account, you can safely ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email inbox to verify your account.'
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
