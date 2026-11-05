import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasAdminSession } from '@/lib/server/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const drafts = await prisma.automatedBlogDraft.findMany({
      where: {
        status: 'draft',
        isPublished: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ success: true, drafts });
  } catch (err: any) {
    console.error('[API Blog Drafts] Fetch error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Draft ID required' }, { status: 400 });
  }

  try {
    await prisma.automatedBlogDraft.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
