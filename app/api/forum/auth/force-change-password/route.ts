import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession, createSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const resetToken = cookies().get('forum_reset_session')?.value;
    if (!resetToken) {
      return NextResponse.json({ error: 'Session expired. Please log in with your temporary password again.' }, { status: 401 });
    }

    const payload = await verifySession(resetToken);
    if (!payload?.userId || payload.role !== 'password_reset_pending') {
      return NextResponse.json({ error: 'Invalid session. Please log in again.' }, { status: 401 });
    }

    const technician = await prisma.technician.findUnique({ where: { id: payload.userId } });
    
    if (!technician || !technician.requiresPasswordChange) {
      return NextResponse.json({ error: 'This account does not require a password reset' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.technician.update({
      where: { id: technician.id },
      data: { 
        passwordHash, 
        requiresPasswordChange: false,
        isOnline: true,
        lastSeen: new Date()
      }
    });

    // Clear reset session
    cookies().delete('forum_reset_session');

    // Issue standard forum session
    const token = await createSession(technician.id, 'technician');
    
    cookies().set('forum_session', token, {
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
        role: technician.role,
        profilePhoto: technician.profilePhoto
      }
    });
  } catch (error) {
    console.error('Password Change Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
