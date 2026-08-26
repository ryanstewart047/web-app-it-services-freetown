import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
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

async function resolveImageAsBase64(imageUrl: string): Promise<string> {
  const cleanUrl = imageUrl.trim();
  if (!cleanUrl) return '';

  // 1. Data URL
  if (cleanUrl.startsWith('data:image/')) {
    return cleanUrl;
  }

  // 2. Local public file path
  if (cleanUrl.startsWith('/')) {
    try {
      const localPath = path.join(process.cwd(), 'public', cleanUrl.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        const buffer = fs.readFileSync(localPath);
        const contentType = detectImageContentType(buffer, 'image/jpeg');
        return `data:${contentType};base64,${buffer.toString('base64')}`;
      }
    } catch {}
  }

  // 3. External HTTP/HTTPS URL
  if (/^https?:\/\//i.test(cleanUrl)) {
    try {
      const response = await fetch(normalizeExternalImage(cleanUrl), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BridgeTechPreview/1.0)',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType = detectImageContentType(
          buffer,
          response.headers.get('content-type') || 'image/jpeg'
        );
        return `data:${contentType};base64,${buffer.toString('base64')}`;
      }
    } catch {}
  }

  // Fallback to local slide image
  try {
    const fallbackPath = path.join(process.cwd(), 'public', 'assets', 'images', 'slide01.jpg');
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }
  } catch {}

  return '';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || searchParams.get('id') || '';

    let rawImageUrl = '';
    if (code) {
      const reveal = await getSurpriseReveal(code);
      if (reveal?.imageUrl) {
        rawImageUrl = reveal.imageUrl;
      }
    }

    const imageSrc = await resolveImageAsBase64(rawImageUrl);

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #050811 0%, #0d1527 50%, #050811 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Ambient background glow accents */}
          <div
            style={{
              position: 'absolute',
              width: '650px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
              top: '115px',
              left: '275px',
            }}
          />

          {/* Main Container: Compact photo on left, Gradient 'Click Me' button adjacent on right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
              padding: '36px 56px',
              borderRadius: '36px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '2px solid rgba(245, 158, 11, 0.35)',
              boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Left side: Very small, cleanly framed recipient photo */}
            <div
              style={{
                display: 'flex',
                width: '160px',
                height: '160px',
                borderRadius: '26px',
                overflow: 'hidden',
                border: '4px solid #f59e0b',
                boxShadow: '0 10px 30px rgba(245, 158, 11, 0.4)',
                background: '#1e293b',
                flexShrink: 0,
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Reveal"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '60px',
                  }}
                >
                  🎁
                </div>
              )}
            </div>

            {/* Right side / Adjacent: Sleek gradient button saying 'Click Me' */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                padding: '24px 54px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 45%, #ea580c 100%)',
                color: '#0f172a',
                fontSize: '46px',
                fontWeight: 900,
                letterSpacing: '0.5px',
                boxShadow: '0 16px 40px rgba(245, 158, 11, 0.45)',
                border: '2px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <span>Click Me</span>
              <span style={{ fontSize: '38px', marginLeft: '4px' }}>✨</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('[Surprise Reveal OG] Generation error:', error);
    return new Response('Failed to generate preview image', { status: 500 });
  }
}
