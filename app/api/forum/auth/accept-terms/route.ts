import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST() {
  try {
    const token = cookies().get('forum_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    await prisma.technician.update({
      where: { id: payload.userId },
      data: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept Terms Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
