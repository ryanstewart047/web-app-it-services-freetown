import { NextRequest, NextResponse } from 'next/server';
import { uploadSocialShareMedia } from '@/lib/short-url-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function hasAdminSession(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return Boolean(sessionToken && /^[a-f0-9]{64}$/.test(sessionToken));
}

function sanitizeFileName(fileName: unknown) {
  const value = typeof fileName === 'string' ? fileName : 'social-preview.jpg';
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'social-preview.jpg';
}

function getBase64ByteSize(dataUrl: string) {
  const clean = dataUrl.includes(',') ? dataUrl.split(',').pop() || '' : dataUrl;
  return Math.ceil((clean.length * 3) / 4);
}

export async function POST(request: NextRequest) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ success: false, error: 'Admin authentication is required.' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let base64Content = '';
    let fileName = 'social-preview.jpg';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ success: false, error: 'Upload an image file.' }, { status: 400 });
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ success: false, error: 'Only image uploads are supported.' }, { status: 400 });
      }

      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ success: false, error: 'Image files must be 8MB or smaller.' }, { status: 413 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      base64Content = `data:${file.type};base64,${buffer.toString('base64')}`;
      fileName = sanitizeFileName(file.name);
    } else {
      const body = await request.json();
      base64Content = typeof body.image === 'string' ? body.image : '';
      fileName = sanitizeFileName(body.fileName);

      if (!base64Content.startsWith('data:image/')) {
        return NextResponse.json({ success: false, error: 'Upload a valid image.' }, { status: 400 });
      }

      if (getBase64ByteSize(base64Content) > MAX_IMAGE_BYTES) {
        return NextResponse.json({ success: false, error: 'Image files must be 8MB or smaller.' }, { status: 413 });
      }
    }

    const upload = await uploadSocialShareMedia(base64Content, fileName);
    const isInlineImage = upload.url.startsWith('data:');

    return NextResponse.json({
      success: true,
      fileName: upload.fileName,
      inline: isInlineImage,
      ...(isInlineImage ? {} : { url: upload.url }),
    });
  } catch (error) {
    console.error('[Social Share Media] Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Could not upload the social preview image.',
      },
      { status: 500 }
    );
  }
}
