import { NextResponse } from 'next/server';

// Lightweight connectivity probe — used by the offline page to confirm real network access.
// Returns 200 with no-cache headers so it is never served from cache.
export async function GET() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
