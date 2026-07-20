import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const token = cookies().get('forum_session')?.value;
    
    // 1. Silent Heartbeat Update (if authenticated)
    if (token) {
      const payload = await verifySession(token);
      if (payload?.userId) {
        // Ping their presence and check status
        const technician = await prisma.technician.update({
          where: { id: payload.userId },
          data: { isOnline: true, lastSeen: new Date() }
        }).catch(err => {
          console.error("Heartbeat error on ID:", payload.userId);
          return null;
        });
        
        // Eject if password was reset actively
        if (technician?.requiresPasswordChange) {
           cookies().delete('forum_session');
           return NextResponse.json({ error: 'Session revoked', requirePasswordChange: true }, { status: 401 });
        }
      }
    }

    // 2. Fetch Aggregated Metrics
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [totalMembers, onlineMembers] = await Promise.all([
      prisma.technician.count({ where: { active: true } }),
      prisma.technician.count({
        where: {
          active: true,
          isOnline: true,
          lastSeen: {
            gte: fiveMinsAgo
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      totalMembers,
      onlineMembers
    });

  } catch (error) {
    console.error('Heartbeat Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
