import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, phone, expertise, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existingTech = await prisma.technician.findUnique({ where: { email } });
    if (existingTech) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const technician = await prisma.technician.create({
      data: {
        name,
        email,
        phone: phone || '',
        expertise: expertise || 'General Support',
        passwordHash,
        isOnline: true,
        lastSeen: new Date()
      }
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
        role: technician.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
