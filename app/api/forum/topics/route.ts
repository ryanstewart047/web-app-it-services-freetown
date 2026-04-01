import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-utils';
import { fetchForumTopics, createForumTopic } from '@/lib/github-forum-storage';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topics = await fetchForumTopics();
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = cookies().get('forum_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.technician.findUnique({ where: { id: payload.userId } });
    if (!user || user.requiresPasswordChange) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, content, images } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const maxImages = images?.slice(0, 2) || []; // Cap at 2 photos

    const result = await createForumTopic(title, content, user.name, maxImages);

    if (result.success) {
       return NextResponse.json({ success: true, id: result.id });
    } else {
       return NextResponse.json({ error: 'Failed to create topic in GitHub Engine' }, { status: 500 });
    }

  } catch (error) {
    console.error('Create Topic Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
