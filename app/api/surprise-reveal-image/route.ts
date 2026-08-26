import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getSurpriseReveal } from '@/lib/surprise-reveal-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function detectImageContentType(bytes: Uint8Array, fallback: string): string {
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

function normalizeExternalImage(image: string): string {
  if (image.includes('github.com') && image.includes('/blob/')) {
    return image
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/')
      .replace(/[?&]raw=true/, '');
  }
  return image;
}

function isSafeExternalImageUrl(value: string): boolean {
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

function getFallbackBuffer(baseUrl: string): NextResponse {
  try {
    const fallbackPath = path.join(process.cwd(), 'public', 'assets', 'images', 'slide01.jpg');
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=3600',
          'Content-Disposition': 'inline',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
  } catch {}

  return NextResponse.redirect(`${baseUrl}/assets/images/slide01.jpg`);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code') || searchParams.get('id') || '';
  const baseUrl = (
    request.nextUrl.origin ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.itservicesfreetown.com'
  ).replace(/\/$/, '');

  if (!code) {
    return getFallbackBuffer(baseUrl);
  }

  const reveal = await getSurpriseReveal(code);
  const image = reveal?.imageUrl?.trim();

  if (!image) {
    return getFallbackBuffer(baseUrl);
  }

  // 1. Data URL (Base64 or URI encoded)
  if (image.startsWith('data:')) {
    const match = image.match(/^data:([^;,]+)(;base64)?,(.*)$/);
    if (!match) {
      return getFallbackBuffer(baseUrl);
    }

    const declaredContentType = match[1] || 'image/jpeg';
    const isBase64 = Boolean(match[2]);
    const payload = match[3] || '';

    try {
      const buffer = isBase64
        ? Buffer.from(payload, 'base64')
        : Buffer.from(decodeURIComponent(payload), 'utf8');

      if (buffer.length === 0) {
        return getFallbackBuffer(baseUrl);
      }

      const contentType = detectImageContentType(buffer, declaredContentType);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Disposition': 'inline',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch {
      return getFallbackBuffer(baseUrl);
    }
  }

  // 2. Local public file path
  if (image.startsWith('/')) {
    try {
      const localPath = path.join(process.cwd(), 'public', image.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const contentType = detectImageContentType(buffer, 'image/jpeg');

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Disposition': 'inline',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      }
    } catch {}

    return NextResponse.redirect(`${baseUrl}${image}`);
  }

  // 3. External HTTP/HTTPS image URL
  if (/^https?:\/\//i.test(image)) {
    const normalizedUrl = normalizeExternalImage(image);
    if (isSafeExternalImageUrl(normalizedUrl)) {
      try {
        const response = await fetch(normalizedUrl, {
          headers: {
            Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'User-Agent': 'BridgeTechSocialPreview/1.0',
          },
          redirect: 'follow',
          cache: 'no-store',
        });

        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          if (buffer.length > 0 && buffer.length <= 12 * 1024 * 1024) {
            const contentType = detectImageContentType(
              buffer,
              response.headers.get('content-type') || 'image/jpeg'
            );

            return new NextResponse(buffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Disposition': 'inline',
                'X-Content-Type-Options': 'nosniff',
              },
            });
          }
        }
      } catch {}
    }

    return getFallbackBuffer(baseUrl);
  }

  return getFallbackBuffer(baseUrl);
}
