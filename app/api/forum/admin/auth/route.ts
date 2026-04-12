import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

// Both hashes stored via env vars. Fallbacks are the hashed values of the defaults.
// Username hash: sha256("itsforumadmin")
const ADMIN_USERNAME_HASH = process.env.FORUM_ADMIN_USERNAME_HASH || 'd7d3825c166692fc8f42326731f4a9ba2c1a87c4031b94c0f0096d7dfd07299b';
// Password hash: sha256("admin")
const ADMIN_PASSWORD_HASH = process.env.FORUM_ADMIN_PASSWORD_HASH || '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Both fields are required
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
    }

    const hashedUsername = hashValue(username.trim());
    const hashedPassword = hashValue(password);

    // Both must match simultaneously to prevent partial brute-force
    const usernameMatch = crypto.timingSafeEqual(
      Buffer.from(hashedUsername),
      Buffer.from(ADMIN_USERNAME_HASH)
    );
    const passwordMatch = crypto.timingSafeEqual(
      Buffer.from(hashedPassword),
      Buffer.from(ADMIN_PASSWORD_HASH)
    );

    if (!usernameMatch || !passwordMatch) {
      // Fixed delay prevents timing attacks even when one field is correct
      await new Promise(r => setTimeout(r, 1200));
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    // Generate special session token for superadmin — completely separate from forum_session
    const token = await createSession('master-admin', 'superadmin');

    cookies().set('forum_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // upgraded from lax
      maxAge: 60 * 60 * 4, // 4 hours (reduced from 24h)
      path: '/'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forum Admin Auth Error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
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
