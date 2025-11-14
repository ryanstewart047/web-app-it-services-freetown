import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for short URLs (in production, use a database)
const urlMap = new Map<string, string>();

function generateShortCode(url: string): string {
  // Extract product slug from marketplace URL
  const match = url.match(/\/marketplace\/([^/?]+)/);
  if (match) {
    const slug = match[1];
    // Create a short code from the slug (first 6 chars or hash)
    return slug.substring(0, 6).toLowerCase();
  }
  
  // Fallback: generate random 6-character code
  return Math.random().toString(36).substring(2, 8);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Generate short code
    const shortCode = generateShortCode(url);
    
    // Store mapping
    urlMap.set(shortCode, url);
    
    // Create short URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.itservicesfreetown.com';
    const shortUrl = `${baseUrl}/s/${shortCode}`;
    
    console.log(`Created short URL: ${shortUrl} -> ${url}`);
    
    return NextResponse.json({
      shortUrl,
      originalUrl: url,
      shortCode
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
    
    const originalUrl = urlMap.get(code);
    
    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Short URL not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      originalUrl,
      shortCode: code
    });
  } catch (error) {
    console.error('Error retrieving short URL:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve URL' },
      { status: 500 }
    );
  }
}
