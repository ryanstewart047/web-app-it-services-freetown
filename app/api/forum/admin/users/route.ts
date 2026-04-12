import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';

const prisma = new PrismaClient();

// Only the dedicated forum_admin_session cookie grants admin access.
// The forum_session fallback has been intentionally removed to prevent
// privilege escalation when a regular technician session is still active.
async function requireAdmin() {
  const adminToken = cookies().get('forum_admin_session')?.value;
  if (!adminToken) return null;

  const adminPayload = await verifySession(adminToken);
  if (adminPayload?.role !== 'superadmin') return null;

  return { id: 'master-admin', name: 'IT Services Freetown', role: 'superadmin', active: true };
}


export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SIX_MINS_AGO = new Date(Date.now() - 6 * 60 * 1000);

    // Auto-correct stale "online" flags: if lastSeen is older than 6 minutes,
    // the client session timed out without calling logout (e.g. closed browser tab).
    await prisma.technician.updateMany({
      where: {
        isOnline: true,
        lastSeen: { lt: SIX_MINS_AGO }
      },
      data: { isOnline: false }
    });

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

    // Return a computed isOnline field so the UI reflects real presence
    const enriched = technicians.map(t => ({
      ...t,
      isOnline: t.isOnline && t.lastSeen != null && new Date(t.lastSeen) >= SIX_MINS_AGO
    }));

    return NextResponse.json({ technicians: enriched });
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

    const userToDelete = await prisma.technician.findUnique({ where: { id: userId } });
    if (!userToDelete) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.technician.delete({
      where: { id: userId },
    });
    
    // Send termination email
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"IT Services Freetown" <${process.env.SMTP_USER}>`,
        to: userToDelete.email,
        subject: 'Notice: Your Forum Account Has Been Deleted',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #040e40; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
               <h1 style="color: white; margin: 0;">Account Deleted</h1>
            </div>
            <div style="padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
              <h2>Hello ${userToDelete.name},</h2>
              <p>This is to inform you that your account on the IT Services Freetown Technician Forum has been permanently deleted by an administrator.</p>
              
              <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #fecaca; text-align: center;">
                <p style="margin-bottom: 0; color: #991b1b; font-weight: bold;">Your access has been revoked.</p>
              </div>

              <p>If you believe this was in error, please contact management or the system administrator directly.</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} IT Services Freetown. All rights reserved.<br/>
                1 Regent High way, Jui Junction, East Freetown
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send deletion email:', emailError);
    }

    return NextResponse.json({ success: true, message: 'User deleted permanently.' });
  } catch (error: any) {
    console.error('Admin Delete User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
