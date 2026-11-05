import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const audioUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'full_track.mp3';
    const isDownload = searchParams.get('download') === '1';

    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing audio URL parameter' }, { status: 400 });
    }

    // Pass incoming Byte Range headers if audio element is seeking/buffering
    const clientRange = request.headers.get('range');
    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    };

    if (clientRange) {
      headers['Range'] = clientRange;
    }

    const audioRes = await fetch(audioUrl, { headers });

    if (!audioRes.ok || !audioRes.body) {
      return NextResponse.json(
        { error: 'Failed to fetch audio stream' },
        { status: audioRes.status }
      );
    }

    const contentType = audioRes.headers.get('content-type') || 'audio/mpeg';
    const contentLength = audioRes.headers.get('content-length');
    const contentRange = audioRes.headers.get('content-range');

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Content-Disposition': `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(filename)}"`,
    };

    if (contentLength) responseHeaders['Content-Length'] = contentLength;
    if (contentRange) responseHeaders['Content-Range'] = contentRange;

    return new NextResponse(audioRes.body as any, {
      status: audioRes.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Audio proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy audio stream' }, { status: 500 });
  }
}
