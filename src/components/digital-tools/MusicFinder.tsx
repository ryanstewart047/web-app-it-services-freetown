'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface MusicTrack {
  id: string;
  youtubeId?: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  releaseYear?: number;
  durationMs: number;
  durationFormatted: string;
  previewUrl: string;
  downloadUrl: string;
  artworkUrlSmall: string;
  artworkUrlHD: string;
  isExplicit: boolean;
  isFullTrack?: boolean;
  source?: string;
  tags?: string[];
}

type DownloadFormat = 'mp3' | 'mp4' | 'cover';
type RepeatMode = 'off' | 'all' | 'one';

// 100% Clean Royalty-Free MP3 Library with diverse genres & search tags
const DEFAULT_ROYALTY_PLAYLIST: MusicTrack[] = [
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

// Fisher-Yates Dynamic Shuffle Algorithm
function shuffleTracks<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MusicFinder() {
  const [query, setQuery] = useState('');
  const [pastedUrl, setPastedUrl] = useState('');
  const [pastedTrack, setPastedTrack] = useState<MusicTrack | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Results dynamically randomized on initial mount
  const [results, setResults] = useState<MusicTrack[]>(DEFAULT_ROYALTY_PLAYLIST);
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Dynamic Track Shuffling on Page Load
  useEffect(() => {
    setResults(shuffleTracks(DEFAULT_ROYALTY_PLAYLIST));
  }, []);

  // Active Playback State
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playerDismissed, setPlayerDismissed] = useState(false);
  const [audioError, setAudioError] = useState('');

  // Playback Control Modes (Auto-Play, Repeat, Shuffle)
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // Download Modal & Action State
  const [downloadModalTrack, setDownloadModalTrack] = useState<MusicTrack | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('mp3');
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  // Moveable Floating Player Drag & Dock State
  const [playerPosition, setPlayerPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialLeft: number; initialTop: number } | null>(null);

  const getNavBottom = useCallback((): number => {
    if (typeof window === 'undefined') return 72;
    const header = document.getElementById('site-sticky-header') || document.querySelector('.sticky-header-container');
    if (header) {
      const rect = header.getBoundingClientRect();
      return Math.max(0, rect.bottom) + 8;
    }
    const nav = document.querySelector('nav');
    if (nav) {
      const rect = nav.getBoundingClientRect();
      return Math.max(0, rect.bottom) + 8;
    }
    return (window.innerWidth < 640 ? 68 : 76) + 8;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setPlayerPosition((prev) => {
        if (!prev || !playerRef.current) return prev;
        const rect = playerRef.current.getBoundingClientRect();
        const minX = 8;
        const maxX = Math.max(8, window.innerWidth - rect.width - 8);
        const minY = getNavBottom();
        const maxY = Math.max(minY, window.innerHeight - rect.height - 8);
        return {
          x: Math.min(Math.max(prev.x, minX), maxX),
          y: Math.min(Math.max(prev.y, minY), maxY),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getNavBottom]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, a, select, textarea')) {
      return;
    }
    if (!playerRef.current) return;
    const rect = playerRef.current.getBoundingClientRect();
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    };
    setIsDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !playerRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    const rect = playerRef.current.getBoundingClientRect();

    const minX = 8;
    const maxX = Math.max(8, window.innerWidth - rect.width - 8);
    const minY = getNavBottom();
    const maxY = Math.max(minY, window.innerHeight - rect.height - 8);

    const newLeft = Math.min(Math.max(dragStartRef.current.initialLeft + deltaX, minX), maxX);
    const newTop = Math.min(Math.max(dragStartRef.current.initialTop + deltaY, minY), maxY);

    setPlayerPosition({ x: newLeft, y: newTop });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const dockPlayerToBottom = () => {
    setPlayerPosition(null);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeQueue = isSearchMode && searchResults.length > 0 ? searchResults : results;
  const activeQueueRef = useRef<MusicTrack[]>(activeQueue);
  activeQueueRef.current = activeQueue;

  const activeTrackRef = useRef<MusicTrack | null>(activeTrack);
  activeTrackRef.current = activeTrack;

  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  repeatModeRef.current = repeatMode;

  const autoPlayNextRef = useRef<boolean>(autoPlayNext);
  autoPlayNextRef.current = autoPlayNext;

  const isShuffleRef = useRef<boolean>(isShuffle);
  isShuffleRef.current = isShuffle;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const extractYouTubeId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    const match = urlStr.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  useEffect(() => {
    const videoId = extractYouTubeId(pastedUrl.trim());
    if (videoId) {
      const track: MusicTrack = {
        id: `yt_pasted_${videoId}`,
        youtubeId: videoId,
        title: `YouTube Video (${videoId})`,
        artist: 'YouTube Video',
        album: 'Pasted Link',
        genre: 'Music / Video',
        durationMs: 210000,
        durationFormatted: 'YouTube',
        previewUrl: `https://www.youtube.com/watch?v=${videoId}`,
        downloadUrl: `https://www.youtube.com/watch?v=${videoId}`,
        artworkUrlSmall: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        artworkUrlHD: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        isFullTrack: true,
        source: 'YouTube Video',
        isExplicit: false,
      };
      setPastedTrack(track);
    } else {
      setPastedTrack(null);
    }
  }, [pastedUrl]);

  const playNextTrack = useCallback(() => {
    const queue = activeQueueRef.current;
    const current = activeTrackRef.current;
    const rep = repeatModeRef.current;
    const shuf = isShuffleRef.current;

    if (!queue.length) return;

    if (rep === 'one' && current) {
      const audio = audioRef.current;
      if (audio && !current.youtubeId) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    let nextIndex = 0;
    const currentIndex = queue.findIndex((r) => r.id === current?.id);

    if (shuf) {
      nextIndex = Math.floor(Math.random() * queue.length);
      if (nextIndex === currentIndex && queue.length > 1) {
        nextIndex = (nextIndex + 1) % queue.length;
      }
    } else {
      if (currentIndex === -1) {
        nextIndex = 0;
      } else if (currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (rep === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      setActiveTrack(nextTrack);
      setPlayerDismissed(false);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
    }
  }, []);

  const playPrevTrack = useCallback(() => {
    const queue = activeQueueRef.current;
    const current = activeTrackRef.current;
    if (!queue.length) return;

    const currentIndex = queue.findIndex((r) => r.id === current?.id);
    let prevIndex = 0;
    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    } else {
      prevIndex = queue.length - 1;
    }

    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      setActiveTrack(prevTrack);
      setPlayerDismissed(false);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
    }
  }, []);

  // Audio track change handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activeTrack || activeTrack.youtubeId) {
      audio.pause();
      return;
    }

    const streamUrl = activeTrack.previewUrl || activeTrack.downloadUrl;
    if (audio.src !== streamUrl) {
      audio.src = streamUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((e) => {
          console.warn('Playback autoplay block:', e.message);
          setAudioError('Click Play to start audio');
        });
      }
    }
  }, [activeTrack, isPlaying]);

  // MediaSession API setup
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !activeTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: activeTrack.title,
      artist: activeTrack.artist,
      album: activeTrack.album || 'Royalty-Free Audio',
      artwork: [
        { src: activeTrack.artworkUrlSmall || activeTrack.artworkUrlHD, sizes: '96x96', type: 'image/jpeg' },
        { src: activeTrack.artworkUrlHD || activeTrack.artworkUrlSmall, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    const audio = audioRef.current;

    navigator.mediaSession.setActionHandler('play', () => {
      if (audio && !activeTrack.youtubeId) {
        audio.play().catch(() => {});
      }
      setIsPlaying(true);
      navigator.mediaSession.playbackState = 'playing';
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (audio && !activeTrack.youtubeId) {
        audio.pause();
      }
      setIsPlaying(false);
      navigator.mediaSession.playbackState = 'paused';
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNextTrack();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevTrack();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && audio) {
        audio.currentTime = details.seekTime;
        setCurrentTime(details.seekTime);
      }
    });
  }, [activeTrack, playNextTrack, playPrevTrack]);

  // Sync volume/mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      const dur = audio.duration || (activeTrack?.durationMs ? activeTrack.durationMs / 1000 : 0);
      setDuration(dur);

      if (
        typeof window !== 'undefined' &&
        'mediaSession' in navigator &&
        'setPositionState' in navigator.mediaSession &&
        dur > 0 &&
        !isNaN(audio.currentTime)
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audio.playbackRate || 1.0,
            position: Math.min(audio.currentTime, dur),
          });
        } catch (_) {}
      }
    }
  };

  const togglePlayPause = () => {
    if (!activeTrack && activeQueue.length > 0) {
      playTrack(activeQueue[0]);
      return;
    }

    if (activeTrack?.youtubeId) {
      setIsPlaying(!isPlaying);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setAudioError('');
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch((e) => {
          console.warn('Play error:', e.message);
          setAudioError('Tap play again to start audio');
        });
    }
  };

  const playTrack = (track: MusicTrack) => {
    setActiveTrack(track);
    setPlayerDismissed(false);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  };

  const dismissPlayer = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setActiveTrack(null);
    setIsPlaying(false);
    setPlayerDismissed(true);
    setCurrentTime(0);
    setDuration(0);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  };

  // ── Music Search with Multi-Word OR Logic & Partial Substring Sensitivity ──
  const searchMusic = async (searchQuery: string, pageNum = 1, append = false) => {
    if (!searchQuery.trim()) return;

    const trimmed = searchQuery.trim();
    // Split into distinct lowercase keyword tokens for OR logic
    const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }
    setError('');

    // Compute immediate local royalty-free matches with partial OR logic
    const computeLocalScore = (track: MusicTrack): number => {
      const haystack = `${track.title} ${track.artist} ${track.album} ${track.genre} ${(track.tags || []).join(' ')}`.toLowerCase();
      let matchCount = 0;
      for (const token of tokens) {
        if (haystack.includes(token)) {
          matchCount++;
        }
      }
      return matchCount;
    };

    const immediateMatches = DEFAULT_ROYALTY_PLAYLIST.filter((track) => computeLocalScore(track) > 0)
      .sort((a, b) => computeLocalScore(b) - computeLocalScore(a));

    if (!append && immediateMatches.length > 0) {
      setSearchResults(immediateMatches);
      setIsSearchMode(true);
    }

    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(trimmed)}&limit=50&page=${pageNum}`);
      const data = await res.json();

      if (res.ok && data.results && data.results.length > 0) {
        // Merge without duplicate IDs
        const existingMap = new Map<string, MusicTrack>();
        if (append) {
          searchResults.forEach((t) => existingMap.set(t.id, t));
        } else {
          immediateMatches.forEach((t) => existingMap.set(t.id, t));
        }

        data.results.forEach((t: MusicTrack) => {
          if (!existingMap.has(t.id)) {
            existingMap.set(t.id, t);
          }
        });

        const combined = Array.from(existingMap.values());
        setSearchResults(combined);
        setIsSearchMode(true);
        setHasMore(data.hasMore || false);
      } else {
        if (!append && immediateMatches.length === 0) {
          setError(`No tracks found matching "${trimmed}". Showing shuffled playlist.`);
          setIsSearchMode(false);
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error(err);
      if (immediateMatches.length === 0) {
        setError('Network error while searching music. Showing shuffled playlist.');
        setIsSearchMode(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsSearchMode(false);
    setSearchResults([]);
    setError('');
    setHasMore(false);
    // Dynamic re-shuffle when returning to default playlist
    setResults(shuffleTracks(DEFAULT_ROYALTY_PLAYLIST));
  };

  const handleShufflePlaylist = () => {
    if (isSearchMode && searchResults.length > 0) {
      setSearchResults(shuffleTracks(searchResults));
    } else {
      setResults(shuffleTracks(DEFAULT_ROYALTY_PLAYLIST));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMusic(query, 1, false);
  };

  const handleChipClick = (genreKeyword: string) => {
    setQuery(genreKeyword);
    searchMusic(genreKeyword, 1, false);
  };

  const openDownloadModal = (track: MusicTrack, format: DownloadFormat = 'mp3') => {
    setDownloadModalTrack(track);
    setSelectedFormat(format);
    setCopiedLink(false);
  };

  const copyTrackLink = async (track: MusicTrack) => {
    const url = track.youtubeId
      ? `https://www.youtube.com/watch?v=${track.youtubeId}`
      : (track.downloadUrl || track.previewUrl);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch (_) {
      window.prompt('Copy link:', url);
    }
  };

  const handleDownloadArtwork = async (track: MusicTrack) => {
    try {
      const imgUrl = track.artworkUrlHD || track.artworkUrlSmall;
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(track.artist || 'music').replace(/[^a-z0-9]/gi, '_')}_${(track.title || 'track').replace(/[^a-z0-9]/gi, '_')}_cover.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (_) {
      window.open(track.artworkUrlHD || track.artworkUrlSmall, '_blank');
    }
  };

  const displayList = isSearchMode && searchResults.length > 0 ? searchResults : results;
  const showPopupPlayer = !!activeTrack && !playerDismissed;

  return (
    <div className={`bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6 text-slate-900 ${showPopupPlayer ? 'pb-48 sm:pb-40' : 'pb-8'}`}>
      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (autoPlayNextRef.current) {
            playNextTrack();
          } else {
            setIsPlaying(false);
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'paused';
            }
          }
        }}
        onError={() => {
          if (activeTrack && audioRef.current?.src && audioRef.current.src !== '' && typeof window !== 'undefined' && audioRef.current.src !== window.location.href) {
            setAudioError('Stream unavailable. Select another song.');
            setIsPlaying(false);
          }
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-red-600/20">
            <i className="fas fa-headphones"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">Royalty-Free MP3 Music Finder</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <i className="fas fa-bolt text-[9px]"></i> Screen-Off Audio Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Plays seamlessly song-to-song. 100% royalty-free background tracks for videos, vlogs, and podcasts.
            </p>
          </div>
        </div>

        {/* Global Controls: Play All, Shuffle & AutoPlay */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (displayList.length > 0) playTrack(displayList[0]);
            }}
            className="py-2 px-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs"
          >
            <i className="fas fa-play"></i>
            <span>Play All</span>
          </button>
          <button
            onClick={handleShufflePlaylist}
            className="py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700"
            title="Shuffle Track Order"
          >
            <i className="fas fa-shuffle text-red-600"></i>
            <span>Shuffle</span>
          </button>
          <button
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              autoPlayNext
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Auto-Play Next Song"
          >
            <i className="fas fa-forward-step"></i>
            <span>Auto: {autoPlayNext ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Optional: Paste YouTube URL or Song Link */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <i className="fab fa-youtube text-red-600 text-sm"></i>
          <span>Paste Any YouTube Video or Audio Link to Preview &amp; Download</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            placeholder="Paste YouTube song link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
            className="w-full px-4 py-3 pl-10 pr-24 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 text-sm font-mono transition-all"
          />
          <i className="fab fa-youtube absolute left-3 top-1/2 -translate-y-1/2 text-red-600 text-base"></i>
          {pastedUrl && (
            <button
              onClick={() => { setPastedUrl(''); setPastedTrack(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {pastedTrack && (
          <div className="p-3 bg-white rounded-xl border border-red-300 flex items-center justify-between gap-2 shadow-xs">
            <span className="text-xs font-bold text-emerald-700 truncate">✓ Track Loaded: {pastedTrack.title}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => playTrack(pastedTrack)}
                className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 shadow-xs"
              >
                <i className="fas fa-play"></i> Play Video
              </button>
              <button
                onClick={() => openDownloadModal(pastedTrack, 'mp3')}
                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 shadow-xs"
              >
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flexible Partial OR Search Input Bar & Quick Genre Chips */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              // Trigger instant partial search as user types or when multi-words are typed
              if (!val.trim()) {
                clearSearch();
              } else if (val.trim().length >= 2) {
                searchMusic(val, 1, false);
              }
            }}
            placeholder="Search multiple keywords (e.g. afro piano, lofi guitar, upbeat acoustic)..."
            className="w-full px-4 py-3.5 pl-12 pr-32 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-red-500 text-sm transition-all shadow-xs"
          />
          <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base"></i>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSearchMode && (
              <button
                type="button"
                onClick={clearSearch}
                className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                title="Clear Search"
              >
                <i className="fas fa-xmark"></i>
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <span>Search</span>}
            </button>
          </div>
        </form>

        {/* Quick Genre Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase mr-1">Quick Play:</span>
          {['Afrobeats', 'Amapiano', 'Lo-Fi Chill', 'Acoustic Guitar', 'Ambient Piano', 'Synthwave', 'EDM', 'Cinematic', 'Gospel', 'Reggae', 'Deep Focus'].map((genre) => {
            const isAfrican = genre === 'Afrobeats' || genre === 'Amapiano' || genre === 'Reggae';
            return (
              <button
                key={genre}
                onClick={() => handleChipClick(genre)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  isAfrican
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                }`}
              >
                {isAfrican && <i className="fas fa-fire mr-1 text-amber-600 text-[10px]"></i>}
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active YouTube Video Player Box if a YouTube Track is Selected */}
      {activeTrack?.youtubeId && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
              <i className="fab fa-youtube text-red-600"></i> Now Playing: {activeTrack.title}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openDownloadModal(activeTrack, 'mp3')}
                className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
              >
                <i className="fas fa-download"></i> Download
              </button>
              <button
                onClick={dismissPlayer}
                className="w-7 h-7 bg-slate-200 hover:bg-red-600 hover:text-white text-slate-600 rounded-lg flex items-center justify-center text-xs transition-colors"
                title="Close Video"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-200">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeTrack.youtubeId}?autoplay=1&enablejsapi=1&rel=0`}
              title={activeTrack.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {/* Audio Error Banner */}
      {audioError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <i className="fas fa-circle-info text-amber-600"></i> {audioError}
          </span>
          <button onClick={() => setAudioError('')} className="text-amber-700 hover:text-amber-900 text-xs shrink-0">
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Error / Status Bar */}
      {error && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <i className="fas fa-circle-info text-amber-600"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Results / Playlist Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-slate-700">
              {isSearchMode ? `Search Results (${displayList.length})` : `Curated Playlist (${displayList.length} Tracks)`}
            </span>
            {isSearchMode && (
              <button
                onClick={clearSearch}
                className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-full flex items-center gap-1 transition-colors border border-slate-200"
              >
                <i className="fas fa-xmark"></i> Clear
              </button>
            )}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Auto-Play Active
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <i className="fas fa-circle-notch fa-spin text-2xl mr-3 text-red-600"></i>
            <span className="text-sm">Searching royalty-free audio tracks...</span>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayList.map((track, idx) => {
              const isThisPlaying = activeTrack?.id === track.id && isPlaying;
              const isThisActive = activeTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isThisActive) {
                      togglePlayPause();
                    } else {
                      playTrack(track);
                    }
                  }}
                  className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isThisActive
                      ? 'bg-red-50/40 border-2 border-red-500 shadow-sm ring-1 ring-red-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  {/* Artwork Thumbnail with Play State */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img
                      src={track.artworkUrlSmall || track.artworkUrlHD}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <i className={`fas ${isThisPlaying ? 'fa-pause' : 'fa-play'} text-white text-sm`}></i>
                    </div>
                  </div>

                  {/* Track Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                      <h4 className={`text-xs font-bold truncate ${isThisActive ? 'text-red-700' : 'text-slate-900 group-hover:text-red-600'}`}>
                        {track.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{track.artist}</p>
                    {track.genre && (
                      <span className="text-[10px] text-slate-400">{track.genre}</span>
                    )}
                  </div>

                  {/* Duration & Download Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-400">{track.durationFormatted}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDownloadModal(track, 'mp3');
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 flex items-center justify-center text-xs transition-colors"
                      title="Download Options"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {isSearchMode && hasMore && !loadingMore && (
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              searchMusic(query, nextPage, true);
            }}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <i className="fas fa-ellipsis"></i> Load More Tracks
          </button>
        )}
        {loadingMore && (
          <div className="flex items-center justify-center py-4 text-slate-500 text-sm">
            <i className="fas fa-circle-notch fa-spin mr-2 text-red-600"></i> Loading more songs...
          </div>
        )}
      </div>

      {/* ── PERSISTENT MOVEABLE & DRAGGABLE FLOATING MP3 PLAYER BAR (Light Minimalist) ── */}
      {showPopupPlayer && (
        <div
          ref={playerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={
            playerPosition
              ? {
                  position: 'fixed',
                  left: `${playerPosition.x}px`,
                  top: `${Math.max(getNavBottom(), playerPosition.y)}px`,
                  margin: 0,
                  width: isPlayerMinimized ? 'auto' : 'min(94vw, 56rem)',
                  maxWidth: isPlayerMinimized ? '360px' : '56rem',
                }
              : undefined
          }
          className={`${
            playerPosition
              ? 'fixed z-[9999]'
              : 'fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 max-w-5xl mx-auto z-[9999]'
          } bg-white/95 border-2 border-slate-300 backdrop-blur-2xl ${
            playerPosition || isPlayerMinimized ? 'rounded-2xl sm:rounded-3xl' : 'sm:rounded-3xl rounded-t-2xl'
          } shadow-2xl text-slate-900 transition-all duration-100 ${
            isDragging ? 'ring-2 ring-red-500/40 shadow-red-500/20 cursor-grabbing select-none scale-[1.01]' : ''
          }`}
        >
          {/* Top Drag Handle Gripper Bar */}
          <div
            className={`w-full px-3 py-1.5 flex items-center justify-between border-b border-slate-200 cursor-grab active:cursor-grabbing select-none touch-none bg-slate-50/90 ${
              playerPosition || isPlayerMinimized ? 'rounded-t-2xl sm:rounded-t-3xl' : 'sm:rounded-t-3xl rounded-t-2xl'
            }`}
            title="Click & Drag to move player anywhere on your screen"
          >
            {/* Left: Drag Handle Indicator */}
            <div className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 transition-colors">
              <i className="fas fa-arrows-up-down-left-right text-red-600 text-xs"></i>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {isDragging ? 'Dragging...' : 'Drag To Move'}
              </span>
            </div>

            {/* Center: Gripper Pill Visual */}
            <div className="w-12 h-1 bg-slate-300 rounded-full hover:bg-red-500 transition-colors"></div>

            {/* Right: Dock & Minimize & Close Controls */}
            <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
              {playerPosition && (
                <button
                  type="button"
                  onClick={dockPlayerToBottom}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all shadow-xs"
                  title="Dock player back to bottom screen edge"
                >
                  <i className="fas fa-arrow-down text-[9px] text-red-600"></i>
                  <span>Dock</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPlayerMinimized(!isPlayerMinimized)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center text-xs transition-colors"
                title={isPlayerMinimized ? 'Expand full player controls' : 'Minimize to compact floating bar'}
              >
                <i className={`fas ${isPlayerMinimized ? 'fa-chevron-up text-red-600' : 'fa-chevron-down'}`}></i>
              </button>
              <button
                type="button"
                onClick={dismissPlayer}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 flex items-center justify-center text-xs transition-colors"
                title="Close Player"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Player Body: Minimized Pill Mode OR Full Controls Mode */}
          {isPlayerMinimized ? (
            /* Compact Floating Pill View */
            <div className="px-3.5 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`relative w-8 h-8 rounded-full overflow-hidden border border-red-500 flex-shrink-0 shadow-xs ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}>
                  <img
                    src={activeTrack.artworkUrlSmall || activeTrack.artworkUrlHD}
                    alt={activeTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 max-w-[130px] sm:max-w-[190px]">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{activeTrack.title}</h4>
                  <p className="text-[10px] text-red-600 font-semibold truncate">{activeTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black shadow-xs hover:bg-red-700 active:scale-95 transition-transform"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-0.5'}`}></i>
                </button>
                <button
                  type="button"
                  onClick={playNextTrack}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-colors"
                  title="Next Track"
                >
                  <i className="fas fa-forward-step"></i>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlayerMinimized(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-colors"
                  title="Expand Full Controls"
                >
                  <i className="fas fa-up-right-and-down-left-from-center text-[10px]"></i>
                </button>
              </div>
            </div>
          ) : (
            /* Full Controls View */
            <>
              {/* Progress Scrubber Bar */}
              <div className="px-4 pt-2.5 flex items-center gap-3 text-[11px] text-slate-500 font-mono" onPointerDown={(e) => e.stopPropagation()}>
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || (activeTrack.durationMs ? activeTrack.durationMs / 1000 : 100)}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = Number(e.target.value);
                    setCurrentTime(newTime);
                    if (audioRef.current && !activeTrack.youtubeId) {
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                  className="flex-1 accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span>{formatTime(duration || (activeTrack.durationMs ? activeTrack.durationMs / 1000 : 0))}</span>
              </div>

              <div className="px-4 pb-3 pt-2 flex items-center justify-between gap-2 sm:gap-4">
                {/* Song Meta & Animated Spinning Artwork */}
                <div className="flex items-center gap-2.5 min-w-0 max-w-[32%] sm:max-w-[38%]">
                  <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 border-red-500/60 flex-shrink-0 shadow-md ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}>
                    <img
                      src={activeTrack.artworkUrlSmall || activeTrack.artworkUrlHD}
                      alt={activeTrack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{activeTrack.title}</h4>
                    <p className="text-[10px] text-red-600 font-semibold truncate">{activeTrack.artist}</p>
                  </div>
                </div>

                {/* Central Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
                <div className="flex items-center gap-1.5 sm:gap-2.5" onPointerDown={(e) => e.stopPropagation()}>
                  {/* Shuffle */}
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                      isShuffle ? 'text-red-600 bg-red-50 border border-red-200' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Shuffle Queue"
                  >
                    <i className="fas fa-shuffle"></i>
                  </button>

                  {/* Prev Track */}
                  <button
                    onClick={playPrevTrack}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-transform active:scale-95 shadow-2xs"
                    title="Previous Track"
                  >
                    <i className="fas fa-backward-step"></i>
                  </button>

                  {/* Main Play / Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black flex items-center justify-center text-base shadow-sm transition-transform active:scale-95"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-0.5'}`}></i>
                  </button>

                  {/* Next Track */}
                  <button
                    onClick={playNextTrack}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs transition-transform active:scale-95 shadow-2xs"
                    title="Next Track"
                  >
                    <i className="fas fa-forward-step"></i>
                  </button>

                  {/* Repeat Button */}
                  <button
                    onClick={() => {
                      if (repeatMode === 'all') setRepeatMode('one');
                      else if (repeatMode === 'one') setRepeatMode('off');
                      else setRepeatMode('all');
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                      repeatMode !== 'off' ? 'text-red-600 bg-red-50 border border-red-200' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title={`Repeat: ${repeatMode.toUpperCase()}`}
                  >
                    <i className={`fas ${repeatMode === 'one' ? 'fa-repeat text-amber-600' : 'fa-repeat'}`}></i>
                    {repeatMode === 'one' && <span className="text-[8px] font-bold ml-0.5">1</span>}
                  </button>
                </div>

                {/* Volume, Save/Download */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
                  {/* Volume Slider */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const nextMute = !isMuted;
                        setIsMuted(nextMute);
                        if (audioRef.current) audioRef.current.muted = nextMute;
                      }}
                      className="text-slate-500 hover:text-slate-800 text-xs"
                    >
                      <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-xmark text-red-500' : 'fa-volume-high'}`}></i>
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        setIsMuted(false);
                        if (audioRef.current) {
                          audioRef.current.volume = v;
                          audioRef.current.muted = false;
                        }
                      }}
                      className="w-14 accent-red-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Download Modal Trigger */}
                  <button
                    onClick={() => openDownloadModal(activeTrack, 'mp3')}
                    className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <i className="fas fa-download"></i>
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* DOWNLOAD MODAL (Clean Light Minimalist) */}
      {downloadModalTrack && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDownloadModalTrack(null)}>
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setDownloadModalTrack(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full flex items-center justify-center transition-colors text-lg"
              title="Close"
            >
              <i className="fas fa-xmark"></i>
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-xs font-bold">
                <i className="fas fa-download"></i>
                <span>Download Audio &amp; Media</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 truncate px-4 pt-2">
                {downloadModalTrack.title}
              </h3>
              <p className="text-xs text-slate-500 truncate">{downloadModalTrack.artist}</p>
            </div>

            {/* Format Selector */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {(['mp3', 'mp4', 'cover'] as DownloadFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedFormat === fmt
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <i className={`fas ${fmt === 'mp3' ? 'fa-music text-red-600' : fmt === 'mp4' ? 'fa-video text-blue-600' : 'fa-image text-purple-600'}`}></i>
                  <span>{fmt === 'mp3' ? 'MP3' : fmt === 'mp4' ? 'MP4' : 'Cover'}</span>
                </button>
              ))}
            </div>

            {/* Download Server Options */}
            <div className="space-y-2.5 text-left">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                Select Option for .{selectedFormat.toUpperCase()}:
              </p>

              {downloadModalTrack.youtubeId ? (
                <>
                  {selectedFormat !== 'cover' && (
                    <>
                      {[
                        { label: 'Y2Mate High-Speed', icon: 'fa-bolt', color: 'text-amber-500', href: `https://y2mate.nu/en1/?url=https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}` },
                        { label: 'YT5s Direct', icon: 'fa-circle-play', color: 'text-blue-500', href: `https://yt5s.biz/en/watch?v=${downloadModalTrack.youtubeId}` },
                        { label: '9Buddy Multi-Format', icon: 'fa-wand-magic-sparkles', color: 'text-purple-500', href: `https://9buddy.com/p?url=https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}` },
                        { label: 'SSYouTube Mirror', icon: 'fa-youtube fab', color: 'text-red-600', href: `https://ssyoutube.com/watch?v=${downloadModalTrack.youtubeId}` },
                      ].map((s, i) => (
                        <a
                          key={i}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between transition-all group shadow-2xs"
                        >
                          <span className="flex items-center gap-2.5">
                            <i className={`fas ${s.icon} ${s.color} text-sm`}></i>
                            <span>Server {i + 1} — {s.label} {selectedFormat.toUpperCase()}</span>
                          </span>
                          <i className="fas fa-arrow-right text-slate-400 group-hover:text-red-600 transition-colors"></i>
                        </a>
                      ))}
                    </>
                  )}

                  {selectedFormat === 'cover' && (
                    <button
                      onClick={() => handleDownloadArtwork(downloadModalTrack)}
                      className="w-full p-3.5 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <i className="fas fa-image text-sm"></i>
                      <span>Download HD Cover Art Image</span>
                    </button>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => copyTrackLink(downloadModalTrack)}
                      className="flex-1 p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <i className="fas fa-copy text-blue-600"></i>
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <i className="fab fa-youtube text-red-600"></i>
                      <span>Open YouTube</span>
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {selectedFormat !== 'cover' && (
                    <a
                      href={downloadModalTrack.downloadUrl || downloadModalTrack.previewUrl}
                      download={`${downloadModalTrack.artist} - ${downloadModalTrack.title}.mp3`}
                      className="w-full p-3.5 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <i className="fas fa-download"></i>
                      <span>Direct Download .{selectedFormat.toUpperCase()}</span>
                    </a>
                  )}
                  {selectedFormat === 'cover' && (
                    <button
                      onClick={() => handleDownloadArtwork(downloadModalTrack)}
                      className="w-full p-3.5 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <i className="fas fa-image"></i>
                      <span>Download HD Cover Art Image</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
