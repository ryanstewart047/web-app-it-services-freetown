import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySession } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const topicId = params.id;
    const token = cookies().get('forum_session')?.value;
    let currentUserId = null;

    if (token) {
      const payload = await verifySession(token);
      if (payload?.userId) currentUserId = payload.userId;
    }

    const reactions = await prisma.forumReaction.findMany({
      where: { topicId },
    });

    const reactionMap: Record<string, { likes: number; dislikes: number; userReaction: boolean | null }> = {};

    reactions.forEach(reaction => {
      if (!reactionMap[reaction.commentId]) {
        reactionMap[reaction.commentId] = { likes: 0, dislikes: 0, userReaction: null };
      }

      if (reaction.isLike) {
        reactionMap[reaction.commentId].likes += 1;
      } else {
        reactionMap[reaction.commentId].dislikes += 1;
      }

      if (currentUserId && reaction.technicianId === currentUserId) {
        reactionMap[reaction.commentId].userReaction = reaction.isLike;
      }
    });

    return NextResponse.json(reactionMap);
  } catch (error) {
    console.error('Fetch Reactions Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('forum_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.technician.findUnique({ where: { id: payload.userId } });
    if (!user || user.requiresPasswordChange) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { commentId, isLike } = await req.json();

    if (!commentId || typeof isLike !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const existing = await prisma.forumReaction.findUnique({
      where: {
        commentId_technicianId: {
          commentId,
          technicianId: user.id
        }
      }
    });

    if (existing) {
      if (existing.isLike === isLike) {
        await prisma.forumReaction.delete({
          where: { id: existing.id }
        });
      } else {
        await prisma.forumReaction.update({
          where: { id: existing.id },
          data: { isLike }
        });
      }
    } else {
      await prisma.forumReaction.create({
        data: {
          commentId,
          topicId: params.id,
          technicianId: user.id,
          isLike
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle Reaction Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
