import { NextRequest, NextResponse } from 'next/server';
import { getShortUrlRecord } from '@/lib/short-url-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getBaseUrl(request: NextRequest) {
  return (
    request.nextUrl.origin ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.itservicesfreetown.com'
  ).replace(/\/$/, '');
}

function normalizeExternalImage(image: string) {
  if (image.includes('github.com') && image.includes('/blob/')) {
    return image
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/')
      .replace(/[?&]raw=true/, '');
  }

  return image;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const baseUrl = getBaseUrl(request);
  const fallbackImage = `${baseUrl}/assets/images/slide01.jpg`;

  if (!code) {
    return NextResponse.redirect(fallbackImage);
  }

  const record = await getShortUrlRecord(code);
  const image = record?.metadata?.image?.trim();

  if (!image) {
    return NextResponse.redirect(fallbackImage);
  }

  if (image.startsWith('data:')) {
    const match = image.match(/^data:([^;,]+)(;base64)?,(.*)$/);

    if (!match) {
      return NextResponse.redirect(fallbackImage);
    }

    const contentType = match[1] || 'image/jpeg';
    const isBase64 = Boolean(match[2]);
    const payload = match[3] || '';
    const buffer = isBase64
      ? Buffer.from(payload, 'base64')
      : Buffer.from(decodeURIComponent(payload), 'utf8');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  if (image.startsWith('/')) {
    return NextResponse.redirect(`${baseUrl}${image}`);
  }

  if (/^https?:\/\//i.test(image)) {
    return NextResponse.redirect(normalizeExternalImage(image));
  }

  return NextResponse.redirect(fallbackImage);
}
