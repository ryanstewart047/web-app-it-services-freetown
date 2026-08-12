import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = searchParams.get('limit') || '25';

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 }, { status: 200 });
    }

    // Query iTunes Search API (no API key required, reliable, high quality artwork & preview audio)
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
      query
    )}&media=music&entity=song&limit=${limit}`;

    const res = await fetch(itunesUrl, {
      headers: {
        'User-Agent': 'BridgeTech-DigitalTools/1.0',
      },
      next: { revalidate: 300 }, // Cache search for 5 mins
    });

    if (!res.ok) {
      throw new Error(`Music search provider error: ${res.statusText}`);
    }

    const data = await res.json();

    const formattedResults = (data.results || []).map((item: any) => ({
      id: String(item.trackId || item.collectionId || Math.random()),
      title: item.trackName || item.collectionName || 'Unknown Title',
      artist: item.artistName || 'Unknown Artist',
      album: item.collectionName || 'Single / Unknown Album',
      genre: item.primaryGenreName || 'Music',
      releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined,
      durationMs: item.trackTimeMillis || 0,
      durationFormatted: formatDuration(item.trackTimeMillis || 0),
      previewUrl: item.previewUrl || '',
      artworkUrlSmall: item.artworkUrl60 || item.artworkUrl100 || '',
      artworkUrlHD: item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '1000x1000bb')
        : item.artworkUrl60 || '',
      trackViewUrl: item.trackViewUrl || '',
      collectionViewUrl: item.collectionViewUrl || '',
      isExplicit: item.trackExplicitness === 'explicit',
    }));

    return NextResponse.json({
      success: true,
      query,
      total: formattedResults.length,
      results: formattedResults,
    });
  } catch (error: any) {
    console.error('Music Search Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search music' },
      { status: 500 }
    );
  }
}

function formatDuration(ms: number): string {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
