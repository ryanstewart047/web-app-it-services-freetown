import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 400 });
    }

    const technician = await prisma.technician.findFirst({
      where: { verificationToken: token }
    });

    if (!technician) {
      return NextResponse.json({ error: 'Invalid or expired completely verification link.' }, { status: 400 });
    }

    // Activate the technician account
    await prisma.technician.update({
      where: { id: technician.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        isOnline: true,
        lastSeen: new Date()
      }
    });

    // Auto-login after successful verification so they don't have to type passwords again
    const sessionToken = await createSession(technician.id, 'technician');
    
    cookies().set('forum_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({
      success: true,
      user: {
        id: technician.id,
        name: technician.name,
        email: technician.email,
        role: technician.role
      }
    });
  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
