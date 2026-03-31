import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';

const prisma = new PrismaClient();

// Helper to check admin auth
async function requireAdmin() {
  const token = cookies().get('forum_session')?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload?.userId) return null;

  const user = await prisma.technician.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== 'admin') return null;

  return user;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all technicians except the admin
    const technicians = await prisma.technician.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        expertise: true,
        isOnline: true,
        lastSeen: true,
        active: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ technicians });
  } catch (error) {
    console.error('Admin Fetch Users Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId, active } = await req.json();

    if (!userId || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent admin from blocking themselves
    if (userId === admin.id) {
       return NextResponse.json({ error: 'Cannot modify your own active status' }, { status: 400 });
    }

    const updatedUser = await prisma.technician.update({
      where: { id: userId },
      data: { active },
      select: { id: true, name: true, active: true }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Admin Update User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (userId === admin.id) {
       return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    await prisma.technician.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'User deleted permanently.' });
  } catch (error: any) {
    console.error('Admin Delete User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
