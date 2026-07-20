import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const token = cookies().get('forum_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Must provide current password to delete account.' }, { status: 400 });
    }

    const technician = await prisma.technician.findUnique({ where: { id: payload.userId } });
    if (!technician || !technician.passwordHash) {
      return NextResponse.json({ error: 'Technician not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, technician.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
    }

    // Delete the technician
    await prisma.technician.delete({ where: { id: payload.userId } });

    // Invalidate session
    cookies().delete('forum_session');

    return NextResponse.json({ success: true, message: 'Account permanently terminated.' });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
