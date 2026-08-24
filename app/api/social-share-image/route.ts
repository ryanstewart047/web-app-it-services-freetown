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

function detectImageContentType(bytes: Uint8Array, fallback: string) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (bytes.length >= 6 && String.fromCharCode(...Array.from(bytes.slice(0, 6))).startsWith('GIF')) {
    return 'image/gif';
  }

  return fallback.startsWith('image/') ? fallback.split(';')[0] : 'image/jpeg';
}

function isSafeExternalImageUrl(value: string) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;

    const hostname = url.hostname.toLowerCase();
    return !(
      hostname === 'localhost' ||
      hostname === '::1' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
}

async function proxyExternalImage(url: string, fallbackImage: string) {
  if (!isSafeExternalImageUrl(url)) {
    return NextResponse.redirect(fallbackImage);
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'User-Agent': 'BridgeTechSocialPreview/1.0',
      },
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.redirect(fallbackImage);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > 12 * 1024 * 1024) {
      return NextResponse.redirect(fallbackImage);
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': detectImageContentType(buffer, response.headers.get('content-type') || ''),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': 'inline',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.redirect(fallbackImage);
  }
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
    return proxyExternalImage(normalizeExternalImage(image), fallbackImage);
  }

  return NextResponse.redirect(fallbackImage);
}
