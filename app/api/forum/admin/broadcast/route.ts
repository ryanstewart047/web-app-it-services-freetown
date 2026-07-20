import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { createForumTopic } from '@/lib/github-forum-storage';

const prisma = new PrismaClient();

async function requireAdmin() {
  const adminToken = cookies().get('forum_admin_session')?.value;
  if (!adminToken) return null;

  const adminPayload = await verifySession(adminToken);
  if (adminPayload?.role !== 'superadmin') return null;

  return { id: 'master-admin', name: 'IT Services Freetown', role: 'superadmin', active: true };
}


export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, content, images } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const broadcastTitle = `[ADMIN BROADCAST] ${title}`;
    const maxImages = images?.slice(0, 2) || []; // Cap at 2 photos

    const result = await createForumTopic(broadcastTitle, content, `Admin: ${admin.name}`, maxImages);

    if (result.success) {
       return NextResponse.json({ success: true, id: result.id });
    } else {
       return NextResponse.json({ error: 'Failed to create broadcast in GitHub Engine' }, { status: 500 });
    }

  } catch (error) {
    console.error('Create Broadcast Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
