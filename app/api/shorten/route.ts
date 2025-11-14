import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store URLs in a JSON file for persistence
const STORAGE_FILE = path.join(process.cwd(), 'data', 'short-urls.json');

function ensureStorageFile() {
  const dir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORAGE_FILE)) {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify({}));
  }
}

function getUrlMap(): Record<string, string> {
  ensureStorageFile();
  const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveUrlMap(map: Record<string, string>) {
  ensureStorageFile();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(map, null, 2));
}

function generateShortCode(url: string): string {
  // Extract product slug from marketplace URL
  const match = url.match(/\/marketplace\/([^/?]+)/);
  if (match) {
    const slug = match[1];
    // Create a short code from the slug (first 8 chars)
    return slug.substring(0, 8).toLowerCase();
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
    const urlMap = getUrlMap();
    urlMap[shortCode] = url;
    saveUrlMap(urlMap);
    
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
    
    const urlMap = getUrlMap();
    const originalUrl = urlMap[code];
    
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
