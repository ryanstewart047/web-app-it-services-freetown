import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 }, { status: 200 });
    }

    const cleanQuery = query.trim();
    const results: any[] = [];
    const seenIds = new Set<string>();

    // Helper to scrape YouTube Search HTML
    const fetchYouTubeResults = async (searchKeyword: string) => {
      try {
        const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchKeyword)}`;
        const ytRes = await fetch(ytSearchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          next: { revalidate: 180 },
        });

        if (!ytRes.ok) return;
        const html = await ytRes.text();
        const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);

        if (match && match[1]) {
          const ytData = JSON.parse(match[1]);
          const sectionList =
            ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

          sectionList.forEach((section: any) => {
            const items = section?.itemSectionRenderer?.contents || [];
            items.forEach((item: any) => {
              const v = item.videoRenderer || item.compactVideoRenderer;
              if (v && v.videoId && !seenIds.has(v.videoId)) {
                const videoId = v.videoId;
                seenIds.add(videoId);

                const title = v.title?.runs?.[0]?.text || v.title?.simpleText || 'Untitled Song';
                const artist = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'Unknown Artist';
                const durationFormatted = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text || '3:45';

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
            });
          });
        }
      } catch (e) {
        console.error('YouTube Search Scrape Error:', e);
      }
    };

    // 1. Primary Query Search
    await fetchYouTubeResults(`${cleanQuery} music song`);

    // 2. Secondary Query Search if results are fewer than target limit to ensure rich results list!
    if (results.length < limit) {
      await fetchYouTubeResults(`${cleanQuery} full audio`);
    }

    // 3. Jamendo Music API (Full-Length Free Tracks supplement)
    try {
      const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=56d30ee7&format=json&limit=20&namesearch=${encodeURIComponent(
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

    const totalResults = results.length;
    const paginatedResults = results.slice(0, page * limit);

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      total: totalResults,
      page,
      hasMore: paginatedResults.length < totalResults,
      results: paginatedResults,
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
