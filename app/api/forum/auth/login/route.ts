import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const technician = await prisma.technician.findUnique({ where: { email } });
    
    if (!technician || !technician.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, technician.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update their online presence
    await prisma.technician.update({
      where: { id: technician.id },
      data: { isOnline: true, lastSeen: new Date() }
    });

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
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
