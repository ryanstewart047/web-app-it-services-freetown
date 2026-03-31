import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth-utils';
import { uploadForumImage } from '@/lib/github-forum-storage';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const token = cookies().get('forum_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifySession(token);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { base64Data, fileName } = await req.json();

    if (!base64Data || !fileName) {
      return NextResponse.json({ error: 'Missing file data' }, { status: 400 });
    }

    const uploadResult = await uploadForumImage(base64Data, fileName);

    if (uploadResult.success) {
      return NextResponse.json({ success: true, url: uploadResult.url });
    } else {
      return NextResponse.json({ error: 'GitHub Storage rejected the file' }, { status: 500 });
    }
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
