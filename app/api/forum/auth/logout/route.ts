import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const token = cookies().get('forum_session')?.value;
    
    if (token) {
      const payload = await verifySession(token);
      if (payload?.userId) {
        // Mark as offline immediately
        await prisma.technician.update({
          where: { id: payload.userId },
          data: { isOnline: false }
        });
      }
    }

    cookies().delete('forum_session');

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
