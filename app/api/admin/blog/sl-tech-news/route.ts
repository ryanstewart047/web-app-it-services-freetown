import { NextRequest, NextResponse } from 'next/server';
import { getSierraLeoneTechNews, SL_TECH_CATEGORIES } from '../../../../../lib/server/sl-tech-news-finder';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const forceLive = searchParams.get('refresh') === 'true';

    const result = await getSierraLeoneTechNews({
      query,
      category,
      forceLive,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      categories: result.categories,
      topics: result.topics,
    });
  } catch (error: any) {
    console.error('[API /api/admin/blog/sl-tech-news] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch Sierra Leone tech news',
        topics: [],
        categories: [...SL_TECH_CATEGORIES],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, category } = body;

    const result = await getSierraLeoneTechNews({
      query,
      category,
      forceLive: true,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      categories: result.categories,
      topics: result.topics,
    });
  } catch (error: any) {
    console.error('[API /api/admin/blog/sl-tech-news POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search Sierra Leone tech news',
      },
      { status: 500 }
    );
  }
}
