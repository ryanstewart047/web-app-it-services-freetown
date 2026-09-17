import { NextResponse } from 'next/server';
import { getPublicPartnersData } from '@/lib/server/partners-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPublicPartnersData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[API/Partners] Failed to fetch partners:', error);
    return NextResponse.json(
      { error: 'Failed to load partners' },
      { status: 500 }
    );
  }
}
