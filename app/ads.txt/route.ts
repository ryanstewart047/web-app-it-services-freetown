import { NextResponse } from 'next/server';

export async function GET() {
  const content = `google.com, pub-9989697800650646, DIRECT, f08c47fec0942fa0
google.com, pub-9989697800650646, RESELLER, f08c47fec0942fa0`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
