import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { verifySession, hashPassword } from '@/lib/auth-utils';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function requireAdmin() {
  // Check for standalone master admin session first
  const adminToken = cookies().get('forum_admin_session')?.value;
  if (adminToken) {
    const adminPayload = await verifySession(adminToken);
    if (adminPayload?.role === 'superadmin') {
      return { id: 'master-admin', name: 'IT Services Freetown', role: 'superadmin', active: true };
    }
  }

  const token = cookies().get('forum_session')?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload?.userId) return null;

  const user = await prisma.technician.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== 'admin') return null;

  return user;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a secure temporary password
    const temporaryPassword = crypto.randomBytes(6).toString('hex'); // 12-char string, e.g. "a1b2c3d4e5f6"
    const passwordHash = await hashPassword(temporaryPassword);

    await prisma.technician.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // In a fully automated flow, we would use nodemailer to send this to the associated email.
    // However, displaying it lets the admin copy it securely regardless of email transport availability.
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      temporaryPassword,
    });
  } catch (error: any) {
    console.error('Password Reset Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
