import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-utils';
import { fetchForumReplies, addForumReply } from '@/lib/github-forum-storage';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const replies = await fetchForumReplies(parseInt(params.id, 10));
    return NextResponse.json(replies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('forum_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.technician.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ error: 'Technician not found' }, { status: 401 });

    const { content, images } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    const maxImages = images?.slice(0, 2) || []; 

    const result = await addForumReply(parseInt(params.id, 10), content, user.name, maxImages);

    if (result.success) {
       return NextResponse.json({ success: true });
    } else {
       return NextResponse.json({ error: 'Failed to add reply to GitHub Engine' }, { status: 500 });
    }

  } catch (error) {
    console.error('Create Reply Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
