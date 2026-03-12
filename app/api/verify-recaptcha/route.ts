import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'No reCAPTCHA token provided' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured');
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }

    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'reCAPTCHA verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json({ success: false, message: 'Verification error' }, { status: 500 });
  }
}
