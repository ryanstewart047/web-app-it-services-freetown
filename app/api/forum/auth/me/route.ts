import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const token = cookies().get('forum_session')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifySession(token);
    
    if (!payload?.userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const technician = await prisma.technician.findUnique({ 
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        expertise: true,
        profilePhoto: true,
        isOnline: true,
        createdAt: true
      }
    });

    if (!technician) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Bump their lastSeen dynamically upon fetching 'me'
    await prisma.technician.update({
      where: { id: technician.id },
      data: { isOnline: true, lastSeen: new Date() }
    });

    return NextResponse.json({
      authenticated: true,
      user: technician
    });

  } catch (error) {
    console.error('Auth Check Error:', error);
    return NextResponse.json({ authenticated: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
