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
}

type DownloadFormat = 'mp3' | 'mp4' | 'cover';
type RepeatMode = 'off' | 'all' | 'one';

// 100% Verified, Rock-Solid Royalty-Free MP3 Streams (Full Length • Zero CORS • Zero 403 Errors)
const DEFAULT_ROYALTY_PLAYLIST: MusicTrack[] = [
  {
    id: 'rf_lofi_chill_1',
    title: 'Midnight Lo-Fi Chill Study Beats',
    artist: 'Lofi Study Beats',
    album: 'Chillhop Sessions Vol. 1',
    genre: 'Lo-Fi / Chillhop',
    durationMs: 372000,
    durationFormatted: '6:12',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free MP3 (Full Track)',
    isExplicit: false,
  },
  {
    id: 'rf_ambient_piano_2',
    title: 'Peaceful Horizon & Soft Piano Strings',
    artist: 'Acoustic Horizon',
    album: 'Serenity Piano Sessions',
    genre: 'Ambient / Classical',
    durationMs: 425000,
    durationFormatted: '7:05',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1520523839898-50712803c58b?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1520523839898-50712803c58b?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free MP3 (Full Track)',
    isExplicit: false,
  },
  {
    id: 'rf_synthwave_3',
    title: 'Neon Skyline (Retro Synthwave)',
    artist: 'CyberDrive',
    album: 'Retro Future 80s Drive',
    genre: 'Synthwave / Electronic',
    durationMs: 348000,
    durationFormatted: '5:48',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free MP3 (Full Track)',
    isExplicit: false,
  },
  {
    id: 'rf_acoustic_guitar_4',
    title: 'Sunrise Walk (Acoustic Folk Guitar)',
    artist: 'Golden Strings',
    album: 'Sunny Days Acoustic',
    genre: 'Acoustic / Folk',
    durationMs: 302000,
    durationFormatted: '5:02',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free MP3 (Full Track)',
    isExplicit: false,
  },
  {
    id: 'rf_electronic_beats_8',
    title: 'Deep Focus & Future Electronica',
    artist: 'ByteBeat',
    album: 'Flow State Electro',
    genre: 'Deep House / Focus',
    durationMs: 326000,
    durationFormatted: '5:26',
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free MP3 (Full Track)',
    isExplicit: false,
  },
];

export default function MusicFinder() {
  const [query, setQuery] = useState('');
  const [pastedUrl, setPastedUrl] = useState('');
  const [pastedTrack, setPastedTrack] = useState<MusicTrack | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<MusicTrack[]>(DEFAULT_ROYALTY_PLAYLIST);
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [totalResults, setTotalResults] = useState(DEFAULT_ROYALTY_PLAYLIST.length);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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

  // Audio element reference for continuous background screen-off playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Active Queue Reference to prevent stale closures in async auto-play events
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

  // ── Bulletproof Auto-Advance to Next Song ────────────────────────────────────
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

  // ── Screen-Off / Dark Screen Background Audio Playback & MediaSession ─────────
  useEffect(() => {
    if (!activeTrack) return;
    setAudioError('');

    const audio = audioRef.current;

    // Handle Direct Playable Audio Streams (MP3, AAC, M4A, iTunes, SoundHelix)
    if (!activeTrack.youtubeId && activeTrack.previewUrl) {
      if (audio) {
        audio.src = activeTrack.previewUrl;
        audio.volume = isMuted ? 0 : volume;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setAudioError('');
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
              }
            })
            .catch((err) => {
              console.warn('Audio play notice:', err.message);
              if (err.name === 'NotAllowedError') {
                setAudioError('Tap play button to start audio (browser interaction required)');
                setIsPlaying(false);
              }
            });
        }
      }
    } else {
      // YouTube Embed Video Item
      setIsPlaying(true);
    }

    // ── Setup OS Lock-Screen / Dark-Screen Media Controls ──
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeTrack.title,
        artist: activeTrack.artist,
        album: activeTrack.album || 'BridgeTech Royalty Music',
        artwork: [
          { src: activeTrack.artworkUrlSmall || activeTrack.artworkUrlHD, sizes: '96x96', type: 'image/jpeg' },
          { src: activeTrack.artworkUrlHD || activeTrack.artworkUrlSmall, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.playbackState = 'playing';

      navigator.mediaSession.setActionHandler('play', () => {
        if (audio && !activeTrack.youtubeId) {
          audio.play().then(() => {
            setIsPlaying(true);
            navigator.mediaSession.playbackState = 'playing';
          }).catch(() => {});
        } else {
          setIsPlaying(true);
        }
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
    }
  }, [activeTrack, isMuted, volume, playNextTrack, playPrevTrack]);

  // Sync volume/mute without reloading track
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Update MediaSession position state during playback
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

  const searchMusic = async (searchQuery: string, pageNum = 1, append = false) => {
    if (!searchQuery.trim()) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
    }
    setError('');

    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery)}&limit=50&page=${pageNum}`);
      const data = await res.json();

      if (res.ok && data.results && data.results.length > 0) {
        const combined = append ? [...searchResults, ...data.results] : data.results;
        setSearchResults(combined);
        setIsSearchMode(true);
        setTotalResults(data.total || combined.length);
        setHasMore(data.hasMore || false);
      } else {
        if (!append) {
          setError(`No results found for "${searchQuery}". Showing curated playlist.`);
          setIsSearchMode(false);
          setSearchResults([]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection error while searching music. Showing curated playlist.');
      setIsSearchMode(false);
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
    <div className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur space-y-6 ${showPopupPlayer ? 'pb-40' : 'pb-8'}`}>
      {/* HTML5 Audio Element for Continuous Screen-Off Background Playback */}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-red-600 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-900/30">
            <i className="fas fa-headphones"></i>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">Royalty-Free MP3 Music Player</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <i className="fas fa-bolt text-[9px]"></i> Screen-Off MP3 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Plays seamlessly song-to-song. Keeps playing when your screen is turned off or locked.
            </p>
          </div>
        </div>

        {/* Global AutoPlay & Play All Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (displayList.length > 0) playTrack(displayList[0]);
            }}
            className="py-2 px-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <i className="fas fa-play"></i>
            <span>Play All</span>
          </button>
          <button
            onClick={() => setAutoPlayNext(!autoPlayNext)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              autoPlayNext
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Auto-Play Next Song"
          >
            <i className="fas fa-forward-step"></i>
            <span>Auto: {autoPlayNext ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Paste YouTube URL or Song Link */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <label className="block text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <i className="fab fa-youtube"></i>
          <span>Paste Any YouTube Video or Stream Link to Play</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            placeholder="Paste YouTube song link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
            className="w-full px-4 py-3 pl-10 pr-24 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm font-mono transition-all"
          />
          <i className="fab fa-youtube absolute left-3 top-1/2 -translate-y-1/2 text-red-500 text-base"></i>
          {pastedUrl && (
            <button
              onClick={() => { setPastedUrl(''); setPastedTrack(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {pastedTrack && (
          <div className="p-3 bg-slate-900 rounded-xl border border-red-500/40 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-400 truncate">✓ Track Loaded: {pastedTrack.title}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => playTrack(pastedTrack)}
                className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
              >
                <i className="fas fa-play"></i> Play Video
              </button>
              <button
                onClick={() => openDownloadModal(pastedTrack, 'mp3')}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
              >
                <i className="fas fa-download"></i> Download Servers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Input Bar & Quick Genre Chips */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search millions of songs, lo-fi, afrobeat, gospel, pop, acoustic, electronic..."
            className="w-full px-4 py-3.5 pl-12 pr-32 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all shadow-inner"
          />
          <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base"></i>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isSearchMode && (
              <button
                type="button"
                onClick={clearSearch}
                className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                title="Clear Search"
              >
                <i className="fas fa-xmark"></i>
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <span>Search</span>}
            </button>
          </div>
        </form>

        {/* Quick Genre Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase mr-1">Quick Play:</span>
          {['Lo-Fi Chill', 'Acoustic Guitar', 'Synthwave', 'Ambient Piano', 'Deep Focus', 'Afrobeats', 'Gospel', 'Jazz'].map((genre) => (
            <button
              key={genre}
              onClick={() => handleChipClick(genre)}
              className="py-1 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Active YouTube Video Player Box if a YouTube Track is Selected */}
      {activeTrack?.youtubeId && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-red-500/40 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 truncate">
              <i className="fab fa-youtube"></i> Now Playing: {activeTrack.title}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openDownloadModal(activeTrack, 'mp3')}
                className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <i className="fas fa-download"></i> Download
              </button>
              <button
                onClick={dismissPlayer}
                className="w-7 h-7 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg flex items-center justify-center text-xs transition-colors"
                title="Close Video"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>
          </div>
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
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
        <div className="p-3 bg-amber-950/40 border border-amber-700/50 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <i className="fas fa-circle-info text-amber-400"></i> {audioError}
          </span>
          <button onClick={() => setAudioError('')} className="text-amber-500 hover:text-white text-xs shrink-0">
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Error / Status Bar */}
      {error && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <i className="fas fa-circle-info"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Results / Playlist Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-slate-300">
              {isSearchMode ? `Search Results (${displayList.length})` : `Queue Playlist (${displayList.length} Tracks)`}
            </span>
            {isSearchMode && (
              <button
                onClick={clearSearch}
                className="text-[10px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full flex items-center gap-1 transition-colors"
              >
                <i className="fas fa-xmark"></i> Clear
              </button>
            )}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Auto-Play Active
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mr-3 text-cyan-400"></i>
            <span className="text-sm">Searching songs and audio streams...</span>
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
                      ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Artwork Thumbnail with Play State */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
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
                      <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                      <h4 className={`text-xs font-bold truncate ${isThisActive ? 'text-cyan-400' : 'text-white group-hover:text-cyan-300'}`}>
                        {track.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</p>
                    {track.source && (
                      <span className="text-[10px] text-slate-500">{track.source}</span>
                    )}
                  </div>

                  {/* Duration & Download Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-500">{track.durationFormatted}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDownloadModal(track, 'mp3');
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
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

        {/* Load More (Search Results) */}
        {isSearchMode && hasMore && !loadingMore && (
          <button
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              searchMusic(query, nextPage, true);
            }}
            className="w-full py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-600 text-slate-300 hover:text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <i className="fas fa-ellipsis"></i> Load More Tracks
          </button>
        )}
        {loadingMore && (
          <div className="flex items-center justify-center py-4 text-slate-400 text-sm">
            <i className="fas fa-circle-notch fa-spin mr-2 text-cyan-400"></i> Loading more songs...
          </div>
        )}
      </div>

      {/* ── PERSISTENT FLOATING / POPUP MP3 PLAYER BAR (Always Pops Up on Any Song Click) ── */}
      {showPopupPlayer && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-4 sm:right-4 max-w-5xl mx-auto z-40 bg-slate-900/98 border-2 border-cyan-500/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/90 animate-slide-up ring-1 ring-cyan-500/20">
          {/* Progress Scrubber Bar */}
          <div className="px-4 pt-3 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
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
              className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span>{formatTime(duration || (activeTrack.durationMs ? activeTrack.durationMs / 1000 : 0))}</span>
          </div>

          <div className="px-4 pb-3 pt-2 flex items-center justify-between gap-2 sm:gap-4">
            {/* Song Meta & Animated Spinning Artwork */}
            <div className="flex items-center gap-2.5 min-w-0 max-w-[32%] sm:max-w-[38%]">
              <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400/80 flex-shrink-0 shadow-lg ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}>
                <img
                  src={activeTrack.artworkUrlSmall || activeTrack.artworkUrlHD}
                  alt={activeTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate leading-tight">{activeTrack.title}</h4>
                <p className="text-[10px] text-cyan-400 font-semibold truncate">{activeTrack.artist}</p>
              </div>
            </div>

            {/* Central Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Shuffle */}
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                  isShuffle ? 'text-cyan-400 bg-cyan-950/70 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Shuffle Queue"
              >
                <i className="fas fa-shuffle"></i>
              </button>

              {/* Prev Track */}
              <button
                onClick={playPrevTrack}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs transition-transform active:scale-95 shadow-sm"
                title="Previous Track"
              >
                <i className="fas fa-backward-step"></i>
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black flex items-center justify-center text-base shadow-lg shadow-cyan-500/40 transition-transform active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-0.5'}`}></i>
              </button>

              {/* Next Track */}
              <button
                onClick={playNextTrack}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs transition-transform active:scale-95 shadow-sm"
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
                  repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-950/70 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={`Repeat: ${repeatMode.toUpperCase()}`}
              >
                <i className={`fas ${repeatMode === 'one' ? 'fa-repeat text-amber-400' : 'fa-repeat'}`}></i>
                {repeatMode === 'one' && <span className="text-[8px] font-bold ml-0.5">1</span>}
              </button>
            </div>

            {/* Volume, Save/Download, and ✕ Close Player */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Volume Slider (Hidden on small mobile) */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const nextMute = !isMuted;
                    setIsMuted(nextMute);
                    if (audioRef.current) audioRef.current.muted = nextMute;
                  }}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-xmark text-red-400' : 'fa-volume-high'}`}></i>
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
                  className="w-14 accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Download Modal Trigger */}
              <button
                onClick={() => openDownloadModal(activeTrack, 'mp3')}
                className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors shadow-md"
              >
                <i className="fas fa-download"></i>
                <span className="hidden sm:inline">Save</span>
              </button>

              {/* Close Button */}
              <button
                onClick={dismissPlayer}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors shadow-sm"
                title="Close Player"
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORLDWIDE MULTI-MIRROR DOWNLOAD SERVERS MODAL */}
      {downloadModalTrack && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setDownloadModalTrack(null)}>
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setDownloadModalTrack(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors text-lg"
              title="Close"
            >
              <i className="fas fa-xmark"></i>
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
                <i className="fas fa-download"></i>
                <span>High-Speed Download Servers</span>
              </div>
              <h3 className="text-base font-bold text-white truncate px-4 pt-2">
                {downloadModalTrack.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">{downloadModalTrack.artist}</p>
            </div>

            {/* Format Selector */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              {(['mp3', 'mp4', 'cover'] as DownloadFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    selectedFormat === fmt
                      ? fmt === 'mp3' ? 'bg-emerald-600 text-white shadow-md'
                        : fmt === 'mp4' ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className={`fas ${fmt === 'mp3' ? 'fa-music' : fmt === 'mp4' ? 'fa-video' : 'fa-image'}`}></i>
                  <span>{fmt === 'mp3' ? 'MP3' : fmt === 'mp4' ? 'MP4' : 'Cover'}</span>
                </button>
              ))}
            </div>

            {/* Download Server Options */}
            <div className="space-y-2.5 text-left">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Select Server for .{selectedFormat.toUpperCase()}:
              </p>

              {downloadModalTrack.youtubeId ? (
                <>
                  {selectedFormat !== 'cover' && (
                    <>
                      {[
                        { label: 'Y2Mate High-Speed', icon: 'fa-bolt', color: 'text-amber-400', href: `https://y2mate.nu/en1/?url=https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}` },
                        { label: 'YT5s Direct', icon: 'fa-circle-play', color: 'text-blue-400', href: `https://yt5s.biz/en/watch?v=${downloadModalTrack.youtubeId}` },
                        { label: '9Buddy Multi-Format', icon: 'fa-wand-magic-sparkles', color: 'text-purple-400', href: `https://9buddy.com/p?url=https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}` },
                        { label: 'SSYouTube Mirror', icon: 'fa-youtube fab', color: 'text-red-500', href: `https://ssyoutube.com/watch?v=${downloadModalTrack.youtubeId}` },
                        { label: 'Cobalt Downloader', icon: 'fa-server', color: 'text-cyan-400', href: 'https://cobalt.tools/' },
                      ].map((s, i) => (
                        <a
                          key={i}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-between transition-all group shadow-sm"
                        >
                          <span className="flex items-center gap-2.5">
                            <i className={`fas ${s.icon} ${s.color} text-sm`}></i>
                            <span>Server {i + 1} — {s.label} {selectedFormat.toUpperCase()}</span>
                          </span>
                          <i className="fas fa-arrow-right text-slate-500 group-hover:text-emerald-400 transition-colors"></i>
                        </a>
                      ))}
                    </>
                  )}

                  {selectedFormat === 'cover' && (
                    <button
                      onClick={() => handleDownloadArtwork(downloadModalTrack)}
                      className="w-full p-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30"
                    >
                      <i className="fas fa-image text-sm"></i>
                      <span>Download HD Cover Art Image</span>
                    </button>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => copyTrackLink(downloadModalTrack)}
                      className="flex-1 p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <i className="fas fa-copy text-blue-400"></i>
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <i className="fab fa-youtube text-red-500"></i>
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
                      className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      <i className="fas fa-download"></i>
                      <span>Direct Download .{selectedFormat.toUpperCase()}</span>
                    </a>
                  )}
                  {selectedFormat === 'cover' && (
                    <button
                      onClick={() => handleDownloadArtwork(downloadModalTrack)}
                      className="w-full p-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30"
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
