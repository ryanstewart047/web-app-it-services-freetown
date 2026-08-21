import { NextRequest, NextResponse } from 'next/server';
import { normalizeShortUrlRecord, readShortUrlMap, writeShortUrlMap, type ShortUrlMetadata } from '@/lib/short-url-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function hasAdminSession(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  return Boolean(sessionToken && /^[a-f0-9]{64}$/.test(sessionToken));
}

function generateShortCodePrefix(url: string): string {
  // Extract product slug from marketplace URL
  const marketMatch = url.match(/\/marketplace\/([^/?#]+)/);
  if (marketMatch) {
    return marketMatch[1].substring(0, 10).toLowerCase().replace(/[^a-z0-9_-]/g, '');
  }

  // Extract blog ID from blog URL
  const blogMatch = url.match(/\/blog\/([^/?#]+)/);
  if (blogMatch) {
    return `b-${blogMatch[1].substring(0, 8).toLowerCase().replace(/[^a-z0-9_-]/g, '')}`;
  }

  return 'share';
}

function generateUniqueShortCode(urlMap: Record<string, unknown>, url: string): string {
  const prefix = generateShortCodePrefix(url).slice(0, 12) || 'share';

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 9);
    const code = `${prefix}-${suffix}`;
    if (!urlMap[code]) return code;
  }

  return `${prefix}-${Date.now().toString(36)}`;
}

export async function POST(request: NextRequest) {
  try {
    if (!hasAdminSession(request)) {
      return NextResponse.json({ error: 'Admin authentication is required.' }, { status: 401 });
    }

    const body = await request.json();
    const url = typeof body === 'string' ? body : body.url;
    const metadata: ShortUrlMetadata | undefined = body.metadata || (body.title ? {
      title: body.title,
      description: body.description,
      price: body.price,
      tag: body.tag,
      image: body.image,
      theme: body.theme,
      fit: body.fit,
      scale: body.scale,
      positionX: body.positionX,
      positionY: body.positionY,
      layout: body.layout || 'photo-only',
      previewType: body.previewType || 'product',
    } : undefined);
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Store mapping (backward compatible with plain string or rich record)
    const urlMap = await readShortUrlMap();
    const shortCode = generateUniqueShortCode(urlMap, url);
    if (metadata) {
      urlMap[shortCode] = {
        url,
        metadata
      };
    } else {
      urlMap[shortCode] = url;
    }
    await writeShortUrlMap(urlMap);
    
    // Create short URL (using request origin or env)
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.itservicesfreetown.com';
    const shortUrl = `${baseUrl}/s/${shortCode}`;
    
    console.log(`Created short URL: ${shortUrl} -> ${url}`);
    
    return NextResponse.json({
      shortUrl,
      originalUrl: url,
      shortCode,
      metadata
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }
    
    const urlMap = await readShortUrlMap();
    const originalUrl = normalizeShortUrlRecord(urlMap[code]);
    
    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Short URL not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      originalUrl: originalUrl.url,
      shortCode: code,
      metadata: originalUrl.metadata,
    });
  } catch (error) {
    console.error('Error retrieving short URL:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve URL' },
      { status: 500 }
    );
  }
}
