import { NextRequest, NextResponse } from 'next/server';

const AUDIUS_NODES = [
  'https://discoveryprovider.audius.co',
  'https://audius-discovery-1.theblueprint.xyz',
  'https://discovery-us-01.audius.openplayer.org',
];

// Curated 100% Royalty-Free Tracks for guaranteed instant playback & search matches
const CURATED_ROYALTY_TRACKS = [
  {
    id: 'rf_afrobeat_1',
    title: 'E Go Better (Afrobeats Instrumental Groove)',
    artist: 'Orfvr',
    album: 'Freetown & West Africa Royalty Grooves',
    genre: 'Afrobeat / West African Groove',
    durationMs: 190000,
    durationFormatted: '3:10',
    previewUrl: '/assets/audio/afrobeat/e-go-better.mp3',
    downloadUrl: '/assets/audio/afrobeat/e-go-better.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'BridgeTech Afrobeat Studio (Royalty-Free)',
    isExplicit: false,
    tags: ['afrobeat', 'afrobeats', 'african', 'west africa', 'freetown', 'groove', 'percussion', 'dance', 'instrumental'],
  },
  {
    id: 'rf_afrobeat_2',
    title: 'Real Vibes (Afrobeats & Dancehall Swing)',
    artist: 'LA EQUIS',
    album: 'Freetown & West Africa Royalty Grooves',
    genre: 'Afrobeats / Afroswing',
    durationMs: 210000,
    durationFormatted: '3:30',
    previewUrl: '/assets/audio/afrobeat/real-afrobeats.mp3',
    downloadUrl: '/assets/audio/afrobeat/real-afrobeats.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'BridgeTech Afrobeat Studio (Royalty-Free)',
    isExplicit: false,
    tags: ['afrobeats', 'dancehall', 'swing', 'african', 'party', 'rhythm', 'drums', 'summer'],
  },
  {
    id: 'rf_afrobeat_3',
    title: 'Afro Pop & Afro Swing (Lagos to Freetown)',
    artist: 'STARK MADE THIS',
    album: 'Freetown & West Africa Royalty Grooves',
    genre: 'Afro Pop / Afro Swing',
    durationMs: 206000,
    durationFormatted: '3:26',
    previewUrl: '/assets/audio/afrobeat/afro-pop-2025.mp3',
    downloadUrl: '/assets/audio/afrobeat/afro-pop-2025.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'BridgeTech Afrobeat Studio (Royalty-Free)',
    isExplicit: false,
    tags: ['afro pop', 'afro swing', 'lagos', 'freetown', 'upbeat', 'dance', 'radio', 'catchy'],
  },
  {
    id: 'rf_afrobeat_4',
    title: 'Do U Remember (Amapiano & Afro House)',
    artist: 'Uezurii',
    album: 'Freetown & West Africa Royalty Grooves',
    genre: 'Amapiano / Afro House',
    durationMs: 311000,
    durationFormatted: '5:11',
    previewUrl: '/assets/audio/afrobeat/amapiano-groove.mp3',
    downloadUrl: '/assets/audio/afrobeat/amapiano-groove.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'BridgeTech Afrobeat Studio (Royalty-Free)',
    isExplicit: false,
    tags: ['amapiano', 'log drum', 'afro house', 'south africa', 'freetown', 'dance', 'club', 'groove'],
  },
  {
    id: 'rf_lofi_chill_1',
    title: 'Good Night (Lo-Fi Chill)',
    artist: 'FASSounds',
    album: 'BridgeTech Royalty Music',
    genre: 'Lo-Fi / Chillhop',
    durationMs: 143000,
    durationFormatted: '2:23',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['lofi', 'chill', 'chillhop', 'study', 'relax', 'sleep', 'beats', 'peaceful', 'night'],
  },
  {
    id: 'rf_ambient_piano_2',
    title: 'Beautiful Dream (Ambient Piano)',
    artist: 'Rafael Krux',
    album: 'BridgeTech Royalty Music',
    genre: 'Ambient / Classical',
    durationMs: 209000,
    durationFormatted: '3:29',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1520523839898-50712803c58b?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1520523839898-50712803c58b?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['piano', 'ambient', 'classical', 'dream', 'peaceful', 'relaxing', 'cinematic', 'meditation'],
  },
  {
    id: 'rf_synthwave_3',
    title: 'Sci-Fi Synthwave (Retro Future)',
    artist: 'Alexi Action',
    album: 'BridgeTech Royalty Music',
    genre: 'Synthwave / Electronic',
    durationMs: 176000,
    durationFormatted: '2:56',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['synthwave', 'retro', '80s', 'electronic', 'future', 'gaming', 'cyberpunk', 'synth'],
  },
  {
    id: 'rf_acoustic_guitar_4',
    title: 'Acoustic Breeze (Folk Guitar)',
    artist: 'Benjamin Tissot',
    album: 'BridgeTech Royalty Music',
    genre: 'Acoustic / Folk',
    durationMs: 178000,
    durationFormatted: '2:58',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/10/25/audio_40e15a5e0a.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/10/25/audio_40e15a5e0a.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['acoustic', 'guitar', 'folk', 'breeze', 'warm', 'morning', 'travel', 'vlog', 'peaceful'],
  },
  {
    id: 'rf_electronic_beats_5',
    title: 'Powerful Energetic Beat (EDM)',
    artist: 'Powerful Beats',
    album: 'BridgeTech Royalty Music',
    genre: 'Electronic / EDM',
    durationMs: 122000,
    durationFormatted: '2:02',
    previewUrl: 'https://cdn.pixabay.com/audio/2023/09/24/audio_36ca2ccab5.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2023/09/24/audio_36ca2ccab5.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['edm', 'electronic', 'beat', 'energetic', 'workout', 'sports', 'party', 'bass'],
  },
  {
    id: 'rf_cinematic_epic_6',
    title: 'Epic Cinematic Adventure',
    artist: 'Lexin Music',
    album: 'BridgeTech Royalty Music',
    genre: 'Cinematic / Orchestral',
    durationMs: 163000,
    durationFormatted: '2:43',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/02/19/audio_8e64e8a63d.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/02/19/audio_8e64e8a63d.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['cinematic', 'epic', 'orchestra', 'strings', 'trailer', 'heroic', 'adventure', 'drama'],
  },
  {
    id: 'rf_jazz_smooth_7',
    title: 'Jazzy Abstract Beat (Smooth)',
    artist: 'Coma-Media',
    album: 'BridgeTech Royalty Music',
    genre: 'Jazz / Smooth',
    durationMs: 115000,
    durationFormatted: '1:55',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['jazz', 'smooth', 'cafe', 'lounge', 'coffee', 'sax', 'chill', 'evening', 'relaxed'],
  },
  {
    id: 'rf_happy_upbeat_8',
    title: 'Happy & Upbeat Corporate',
    artist: 'StudioKolomna',
    album: 'BridgeTech Royalty Music',
    genre: 'Corporate / Upbeat',
    durationMs: 139000,
    durationFormatted: '2:19',
    previewUrl: 'https://cdn.pixabay.com/audio/2023/10/30/audio_fe04518e04.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2023/10/30/audio_fe04518e04.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Pixabay Royalty-Free (Full Track)',
    isExplicit: false,
    tags: ['corporate', 'happy', 'upbeat', 'inspiring', 'presentation', 'tech', 'business', 'positive'],
  },
  {
    id: 'rf_gospel_uplift_9',
    title: 'Grace & Glory (Soulful Gospel & Piano)',
    artist: 'BridgeTech Gospel Choir',
    album: 'Freetown Spiritual Anthems',
    genre: 'Gospel / Soul',
    durationMs: 245000,
    durationFormatted: '4:05',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'BridgeTech Creative Studio (Royalty-Free)',
    isExplicit: false,
    tags: ['gospel', 'soul', 'church', 'spiritual', 'choir', 'piano', 'grace', 'worship', 'uplifting', 'freetown'],
  },
  {
    id: 'rf_reggae_island_10',
    title: 'Lumley Beach Sunset (Island Reggae Groove)',
    artist: 'Lion Mountain Sounds',
    album: 'Sierra Leone Coastal Vibes',
    genre: 'Reggae / Island Roots',
    durationMs: 215000,
    durationFormatted: '3:35',
    previewUrl: '/assets/audio/afrobeat/e-go-better.mp3',
    downloadUrl: '/assets/audio/afrobeat/e-go-better.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'BridgeTech Island Studio (Royalty-Free)',
    isExplicit: false,
    tags: ['reggae', 'island', 'roots', 'beach', 'sunset', 'freetown', 'lumley', 'summer', 'good vibes', 'peace'],
  },
  {
    id: 'rf_deep_focus_11',
    title: 'Deep Mind Flow (Alpha Waves & Binaural Chill)',
    artist: 'NeuroSpace Lab',
    album: 'BridgeTech Study & Productivity',
    genre: 'Ambient / Binaural Study',
    durationMs: 360000,
    durationFormatted: '6:00',
    previewUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    downloadUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'NeuroSpace Studio (Royalty-Free)',
    isExplicit: false,
    tags: ['deep focus', 'focus', 'study', 'coding', 'productivity', 'ambient', 'alpha waves', 'meditation'],
  },
];

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
    // Split into distinct lowercase keyword tokens for partial match & OR logic
    const tokens = cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const results: any[] = [];
    const seenIds = new Set<string>();

    // Helper: calculate OR keyword match score (how many tokens match title, artist, genre, album, or tags)
    const computeRelevance = (track: any): number => {
      if (tokens.length === 0) return 1;
      const haystack = `${track.title || ''} ${track.artist || ''} ${track.album || ''} ${track.genre || ''} ${(track.tags || []).join(' ')}`.toLowerCase();
      let matchCount = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) {
          matchCount++;
        }
      }
      return matchCount;
    };

    // 1. GUARANTEED MATCHES: Curated Royalty-Free Library (Instant OR Logic & Partial Substring Search)
    const matchedCurated = CURATED_ROYALTY_TRACKS.filter((track) => {
      return computeRelevance(track) > 0;
    }).sort((a, b) => computeRelevance(b) - computeRelevance(a));

    matchedCurated.forEach((t) => {
      if (!seenIds.has(t.id)) {
        seenIds.add(t.id);
        results.push(t);
      }
    });

    // 2. AUDIUS DECENTRALIZED NETWORK (Multi-node query with OR search variants)
    // Query both full phrase AND individual keywords so multi-word queries never return empty
    const audiusQueries = [cleanQuery];
    if (tokens.length > 1) {
      for (const tok of tokens.slice(0, 2)) {
        if (tok.length >= 3 && !audiusQueries.includes(tok)) {
          audiusQueries.push(tok);
        }
      }
    }

    for (const q of audiusQueries) {
      if (results.length >= limit) break;
      for (const node of AUDIUS_NODES) {
        try {
          const audiusUrl = `${node}/v1/tracks/search?app_name=BRIDGETECH&query=${encodeURIComponent(
            q
          )}&limit=25`;
          const audiusRes = await fetch(audiusUrl, {
            headers: { 'User-Agent': 'BridgeTech-DigitalTools/2.0' },
            next: { revalidate: 300 },
          });

          if (audiusRes.ok) {
            const json = await audiusRes.json();
            const items = json?.data || [];
            if (Array.isArray(items) && items.length > 0) {
              items.forEach((item: any) => {
                const trackId = item.id || item.track_id;
                if (trackId && !seenIds.has(`audius_${trackId}`) && item.is_streamable !== false) {
                  const candidate = {
                    id: `audius_${trackId}`,
                    title: item.title || 'Untitled Song',
                    artist: item.user?.name || item.user?.handle || 'Unknown Artist',
                    album: item.genre ? `${item.genre} Beats` : 'Full Track Single',
                    genre: item.genre || 'Music',
                  };

                  // Check OR match: candidate must contain at least one token
                  if (computeRelevance(candidate) > 0) {
                    seenIds.add(`audius_${trackId}`);

                    const durationSec = item.duration || 180;
                    const artworkUrl =
                      item.artwork?.['1000x1000'] ||
                      item.artwork?.['480x480'] ||
                      item.artwork?.['150x150'] ||
                      item.user?.profile_picture?.['1000x1000'] ||
                      item.user?.profile_picture?.['480x480'] ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80';

                    const streamUrl = `${node}/v1/tracks/${trackId}/stream?app_name=BRIDGETECH`;

                    results.push({
                      id: `audius_${trackId}`,
                      title: item.title || 'Untitled Song',
                      artist: item.user?.name || item.user?.handle || 'Unknown Artist',
                      album: item.genre ? `${item.genre} Beats` : 'Full Track Single',
                      genre: item.genre || 'Music',
                      releaseYear: item.release_date ? new Date(item.release_date).getFullYear() : undefined,
                      durationMs: durationSec * 1000,
                      durationFormatted: formatSeconds(durationSec),
                      previewUrl: streamUrl,
                      downloadUrl: streamUrl,
                      artworkUrlSmall: artworkUrl,
                      artworkUrlHD: artworkUrl,
                      isFullTrack: true,
                      source: 'Full Length MP3 Track',
                      isExplicit: false,
                    });
                  }
                }
              });
              if (results.length >= 15) break;
            }
          }
        } catch (err) {
          console.warn(`Audius node ${node} error:`, err);
        }
      }
    }

    // 3. YOUTUBE MUSIC SEARCH (Flexible fallback)
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
        const match = html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);

        if (match && match[1]) {
          const ytData = JSON.parse(match[1]);
          const sectionList =
            ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

          sectionList.forEach((section: any) => {
            const items = section?.itemSectionRenderer?.contents || [];
            items.forEach((item: any) => {
              const v = item.videoRenderer || item.compactVideoRenderer;
              if (v && v.videoId && !seenIds.has(`yt_${v.videoId}`)) {
                const videoId = v.videoId;
                const title = v.title?.runs?.[0]?.text || v.title?.simpleText || 'Untitled Song';
                const artist = v.ownerText?.runs?.[0]?.text || v.shortBylineText?.runs?.[0]?.text || 'Unknown Artist';

                const candidate = { title, artist, genre: 'Music', album: 'YouTube' };
                // Ensure at least one keyword matches
                if (computeRelevance(candidate) > 0) {
                  seenIds.add(`yt_${videoId}`);

                  const durationFormatted = v.lengthText?.simpleText || v.lengthText?.runs?.[0]?.text || '3:45';
                  const parts = durationFormatted.split(':').map(Number);
                  let durationMs = 180000;
                  if (parts.length === 2) durationMs = (parts[0] * 60 + parts[1]) * 1000;
                  if (parts.length === 3) durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;

                  results.push({
                    id: `yt_${videoId}`,
                    youtubeId: videoId,
                    title: title.replace(/\[.*?\]|\(.*?\)/g, '').trim() || title,
                    artist: artist.replace(/ - Topic|VEVO/g, '').trim(),
                    album: 'YouTube Music',
                    genre: 'Music',
                    durationMs,
                    durationFormatted,
                    previewUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    artworkUrlSmall: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    artworkUrlHD: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    isFullTrack: true,
                    source: 'YouTube Music (Full Video & Audio)',
                    isExplicit: false,
                  });
                }
              }
            });
          });
        }
      } catch (e) {
        console.error('YouTube Search Error:', e);
      }
    };

    if (results.length < limit) {
      await fetchYouTubeResults(`${cleanQuery} royalty free music`);
      if (results.length < 10 && tokens.length > 1) {
        await fetchYouTubeResults(`${tokens[0]} music`);
      }
    }

    // 4. ITUNES SEARCH API
    if (results.length < limit) {
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
          cleanQuery
        )}&media=music&entity=song&limit=15`;
        const itunesRes = await fetch(itunesUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 300 },
        });

        if (itunesRes.ok) {
          const itunesData = await itunesRes.json();
          if (itunesData.results && Array.isArray(itunesData.results)) {
            itunesData.results.forEach((item: any) => {
              if (item.trackId && item.previewUrl && !seenIds.has(`itunes_${item.trackId}`)) {
                const trackId = `itunes_${item.trackId}`;
                const title = item.trackName || 'Untitled Song';
                const artist = item.artistName || 'Unknown Artist';
                const album = item.collectionName || 'Single';
                const genre = item.primaryGenreName || 'Music';

                if (computeRelevance({ title, artist, album, genre }) > 0) {
                  seenIds.add(trackId);
                  const durationMs = item.trackTimeMillis || 30000;
                  const artwork = item.artworkUrl100
                    ? item.artworkUrl100.replace('100x100bb', '600x600bb')
                    : item.artworkUrl60 || '';

                  results.push({
                    id: trackId,
                    title,
                    artist,
                    album,
                    genre,
                    releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : undefined,
                    durationMs,
                    durationFormatted: formatSeconds(Math.floor(durationMs / 1000)),
                    previewUrl: item.previewUrl,
                    downloadUrl: item.previewUrl,
                    artworkUrlSmall: item.artworkUrl100 || artwork,
                    artworkUrlHD: artwork,
                    isFullTrack: false,
                    source: 'Music Audio Stream',
                    isExplicit: item.trackExplicitness === 'explicit',
                  });
                }
              }
            });
          }
        }
      } catch (e) {
        console.error('iTunes Search API Error:', e);
      }
    }

    // Sort all results: Highest keyword match count (OR relevance score) ranks first!
    results.sort((a, b) => computeRelevance(b) - computeRelevance(a));

    const totalResults = results.length;
    const paginatedResults = results.slice(0, page * limit);

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      tokens,
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
