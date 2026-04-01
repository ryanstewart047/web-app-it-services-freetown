import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid transmission cipher.' }, { status: 400 });
    }

    const hashedInput = hashPassword(password);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(hashedInput),
      Buffer.from(ADMIN_PASSWORD_HASH)
    );

    if (!isValid) {
      // Prevent timing attacks
      await new Promise(r => setTimeout(r, 1000));
      return NextResponse.json({ error: 'Invalid master cipher.' }, { status: 401 });
    }

    // Generate special session token denoting superadmin bypass
    const token = await createSession('master-admin', 'superadmin');

    // Attach to cookies
    cookies().set('forum_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forum Admin Auth Error:', error);
    return NextResponse.json({ error: 'Server authentication anomaly.' }, { status: 500 });
  }
}

export async function GET() {
   const token = cookies().get('forum_admin_session')?.value;
   if (!token) return NextResponse.json({ authenticated: false });
   
   return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
   cookies().delete('forum_admin_session');
   return NextResponse.json({ success: true });
}
