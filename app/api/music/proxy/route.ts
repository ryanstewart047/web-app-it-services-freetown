import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audioUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'audio_preview.mp3';

    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing audio URL parameter' }, { status: 400 });
    }

    // Fetch the remote audio stream
    const audioRes = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!audioRes.ok || !audioRes.body) {
      return NextResponse.json({ error: 'Failed to fetch audio stream' }, { status: audioRes.status });
    }

    const contentType = audioRes.headers.get('content-type') || 'audio/mpeg';

    // Stream the audio response back with proper headers
    return new NextResponse(audioRes.body as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Audio proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy audio stream' }, { status: 500 });
  }
}
