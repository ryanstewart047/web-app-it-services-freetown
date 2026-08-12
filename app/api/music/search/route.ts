import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 }, { status: 200 });
    }

    const cleanQuery = query.trim();
    const results: any[] = [];
    const seenIds = new Set<string>();

    // 1. YouTube Search Scraper (100% Full-Length Songs)
    try {
      const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery + ' music song')}`;
      const ytRes = await fetch(ytSearchUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        next: { revalidate: 180 },
      });

      if (ytRes.ok) {
        const html = await ytRes.text();
        const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);

        if (match && match[1]) {
          const ytData = JSON.parse(match[1]);
          const contents =
            ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
              ?.itemSectionRenderer?.contents || [];

          contents.forEach((item: any) => {
            if (item.videoRenderer && results.length < limit) {
              const v = item.videoRenderer;
              const videoId = v.videoId;
              const title = v.title?.runs?.[0]?.text || 'Untitled Song';
              const artist = v.ownerText?.runs?.[0]?.text || 'Unknown Artist';
              const durationFormatted = v.lengthText?.simpleText || '3:45';

              if (videoId && !seenIds.has(videoId)) {
                seenIds.add(videoId);

                // Convert "3:45" formatted time to Ms
                const parts = durationFormatted.split(':').map(Number);
                let durationMs = 180000;
                if (parts.length === 2) durationMs = (parts[0] * 60 + parts[1]) * 1000;
                if (parts.length === 3) durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;

                results.push({
                  id: `yt_${videoId}`,
                  youtubeId: videoId,
                  title: title.replace(/\[.*?\]|\(.*?\)/g, '').trim() || title,
                  artist: artist.replace(/ - Topic|VEVO/g, '').trim(),
                  album: 'YouTube Full Track',
                  genre: 'Music',
                  durationMs,
                  durationFormatted,
                  previewUrl: `https://www.youtube.com/watch?v=${videoId}`,
                  downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
                  artworkUrlSmall: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                  artworkUrlHD: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                  isFullTrack: true,
                  source: 'YouTube Music (100% Full Song)',
                  isExplicit: false,
                });
              }
            }
          });
        }
      }
    } catch (e) {
      console.error('YouTube Search Scrape Error:', e);
    }

    // 2. Jamendo Music API (Full-Length Free Tracks)
    try {
      const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=56d30ee7&format=json&limit=15&namesearch=${encodeURIComponent(
        cleanQuery
      )}&include=musicinfo`;
      const jamendoRes = await fetch(jamendoUrl, {
        headers: { 'User-Agent': 'BridgeTech-DigitalTools/1.0' },
        next: { revalidate: 300 },
      });

      if (jamendoRes.ok) {
        const jamendoData = await jamendoRes.json();
        if (jamendoData.results && Array.isArray(jamendoData.results)) {
          jamendoData.results.forEach((item: any) => {
            const trackId = `jamendo_${item.id}`;
            if (!seenIds.has(trackId) && (item.audio || item.audiodownload)) {
              seenIds.add(trackId);
              const durationSec = item.duration || 0;
              results.push({
                id: trackId,
                title: item.name || 'Untitled Song',
                artist: item.artist_name || 'Unknown Artist',
                album: item.album_name || 'Single',
                genre: item.musicinfo?.tags?.genres?.[0] || 'Music',
                releaseYear: item.releasedate ? new Date(item.releasedate).getFullYear() : undefined,
                durationMs: durationSec * 1000,
                durationFormatted: formatSeconds(durationSec),
                previewUrl: item.audio || item.audiodownload,
                downloadUrl: item.audiodownload || item.audio,
                artworkUrlSmall: item.album_image || item.image || '',
                artworkUrlHD: item.album_image || item.image || '',
                isFullTrack: true,
                source: 'Jamendo Music (Full Track)',
                isExplicit: false,
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('Jamendo API Error:', e);
    }

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      total: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Music Search Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search music' },
      { status: 500 }
    );
  }
}

function formatSeconds(totalSeconds: number): string {
  if (!totalSeconds) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
