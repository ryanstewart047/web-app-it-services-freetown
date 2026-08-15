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

// Curated High-Quality Royalty-Free Stream Playlist (100% Free & Background Playable with Screen Off)
const DEFAULT_ROYALTY_PLAYLIST: MusicTrack[] = [
  {
    id: 'rf_lofi_chill',
    title: 'Midnight Breeze (Lo-Fi Chill)',
    artist: 'Lofi Dreamer',
    album: 'Royalty-Free Chill Beats',
    genre: 'Lo-Fi / Chillhop',
    durationMs: 145000,
    durationFormatted: '2:25',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    downloadUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free Stream',
    isExplicit: false,
  },
  {
    id: 'rf_ambient_piano',
    title: 'Peaceful Horizon (Ambient Piano)',
    artist: 'Acoustic Horizon',
    album: 'Serenity Vol. 1',
    genre: 'Ambient / Classical',
    durationMs: 168000,
    durationFormatted: '2:48',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    downloadUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1520523839898-50712803c58b?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1520523839898-50712803c58b?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free Stream',
    isExplicit: false,
  },
  {
    id: 'rf_synthwave_cyber',
    title: 'Neon Skyline (Synthwave)',
    artist: 'CyberDrive',
    album: 'Retro Future 80s',
    genre: 'Synthwave / Electronic',
    durationMs: 182000,
    durationFormatted: '3:02',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c97a29e46a.mp3?filename=synthwave-80s-125074.mp3',
    downloadUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c97a29e46a.mp3?filename=synthwave-80s-125074.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free Stream',
    isExplicit: false,
  },
  {
    id: 'rf_acoustic_morning',
    title: 'Sunrise Walk (Acoustic Guitar)',
    artist: 'Golden Strings',
    album: 'Sunny Days',
    genre: 'Acoustic / Folk',
    durationMs: 135000,
    durationFormatted: '2:15',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=acoustic-guitar-loop-f-91bpm-108874.mp3',
    downloadUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=acoustic-guitar-loop-f-91bpm-108874.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free Stream',
    isExplicit: false,
  },
  {
    id: 'rf_deep_focus',
    title: 'Deep Coding Focus (Electronica)',
    artist: 'ByteBeat',
    album: 'Flow State',
    genre: 'Deep House / Focus',
    durationMs: 195000,
    durationFormatted: '3:15',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=electronic-future-beats-117997.mp3',
    downloadUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=electronic-future-beats-117997.mp3',
    artworkUrlSmall: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    artworkUrlHD: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    isFullTrack: true,
    source: 'Royalty-Free Stream',
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

  // Playback Control Modes (AutoPlay, Repeat, Shuffle)
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(false);

  const [downloadModalTrack, setDownloadModalTrack] = useState<MusicTrack | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('mp3');
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');

  // Audio element reference for background screen-off playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Extract YouTube Video ID
  const extractYouTubeId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    const match = urlStr.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  // Detect pasted YouTube URL
  useEffect(() => {
    const videoId = extractYouTubeId(pastedUrl.trim());
    if (videoId) {
      const track: MusicTrack = {
        id: `yt_pasted_${videoId}`,
        youtubeId: videoId,
        title: `YouTube Audio (${videoId})`,
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
        source: 'YouTube Link',
        isExplicit: false,
      };
      setPastedTrack(track);
    } else {
      setPastedTrack(null);
    }
  }, [pastedUrl]);

  // ── Auto-Select Next Track Logic ───────────────────────────────────────────
  const playNextTrack = useCallback(() => {
    if (!results.length) return;
    if (repeatMode === 'one' && activeTrack) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      return;
    }

    let nextIndex = 0;
    const currentIndex = results.findIndex((r) => r.id === activeTrack?.id);

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * results.length);
      if (nextIndex === currentIndex && results.length > 1) {
        nextIndex = (nextIndex + 1) % results.length;
      }
    } else {
      if (currentIndex === -1) {
        nextIndex = 0;
      } else if (currentIndex < results.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 'all') {
        nextIndex = 0; // Loop to start
      } else {
        setIsPlaying(false);
        return; // End of playlist
      }
    }

    const nextTrack = results[nextIndex];
    if (nextTrack) {
      setActiveTrack(nextTrack);
      setIsPlaying(true);
    }
  }, [results, activeTrack, repeatMode, isShuffle]);

  const playPrevTrack = useCallback(() => {
    if (!results.length) return;
    const currentIndex = results.findIndex((r) => r.id === activeTrack?.id);
    let prevIndex = 0;

    if (currentIndex > 0) {
      prevIndex = currentIndex - 1;
    } else {
      prevIndex = results.length - 1;
    }

    const prevTrack = results[prevIndex];
    if (prevTrack) {
      setActiveTrack(prevTrack);
      setIsPlaying(true);
    }
  }, [results, activeTrack]);

  // ── Background Playback with Screen Off (MediaSession API) ───────────────────
  useEffect(() => {
    if (!activeTrack) return;

    // 1. Setup HTML5 Audio element
    if (audioRef.current && activeTrack.previewUrl && !activeTrack.youtubeId) {
      audioRef.current.src = activeTrack.previewUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.log('Autoplay deferred until user interaction:', e);
      });
    }

    // 2. Register with OS MediaSession for Lock-Screen, Headphone & Screen-Off Playback
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeTrack.title,
        artist: activeTrack.artist,
        album: activeTrack.album || 'BridgeTech Royalty Music Player',
        artwork: [
          { src: activeTrack.artworkUrlSmall || activeTrack.artworkUrlHD, sizes: '96x96', type: 'image/jpeg' },
          { src: activeTrack.artworkUrlHD || activeTrack.artworkUrlSmall, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNextTrack();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevTrack();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, [activeTrack, playNextTrack, playPrevTrack]);

  // Handle Play/Pause Toggle
  const togglePlayPause = () => {
    if (!activeTrack && results.length > 0) {
      setActiveTrack(results[0]);
      setIsPlaying(true);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    }
  };

  // Search Online Music
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
        const combined = append ? [...results, ...data.results] : data.results;
        setResults(combined);
        setTotalResults(data.total || combined.length);
        setHasMore(data.hasMore || false);
      } else {
        if (!append) {
          setError(`No songs found matching "${searchQuery}". Showing default royalty-free playlist.`);
          setResults(DEFAULT_ROYALTY_PLAYLIST);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection error while searching online music.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur space-y-6 pb-28">
      {/* Hidden HTML5 Audio Element for Continuous Screen-Off Playback */}
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          if (autoPlayNext) {
            playNextTrack();
          } else {
            setIsPlaying(false);
          }
        }}
        onError={() => {
          setIsPlaying(false);
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-red-600 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-900/30">
            <i className="fas fa-headphones"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Royalty-Free MP3 Music Player</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <i className="fas fa-bolt text-[9px]"></i> Screen-Off MP3 Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Plays automatically from one song to the next. Continuous background audio even when your phone or screen is turned off.
            </p>
          </div>
        </div>

        {/* Global AutoPlay & Play All Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (results.length > 0) {
                setActiveTrack(results[0]);
                setIsPlaying(true);
              }
            }}
            className="py-2 px-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:opacity-90 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <i className="fas fa-play"></i>
            <span>Play Playlist</span>
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
            <span>Auto-Play: {autoPlayNext ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Paste YouTube URL or Song Link */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <label className="block text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <i className="fas fa-link"></i>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {pastedTrack && (
          <div className="p-3 bg-slate-900 rounded-xl border border-red-500/40 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-400 truncate">✓ Track Loaded: {pastedTrack.title}</span>
            <button
              onClick={() => { setActiveTrack(pastedTrack); setIsPlaying(true); }}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
            >
              <i className="fas fa-play"></i> Play Now
            </button>
          </div>
        )}
      </div>

      {/* Search Input Bar & Genre Chips */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search thousands of royalty-free songs, lofi, beats, acoustic, electronic..."
            className="w-full px-4 py-3.5 pl-12 pr-28 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm transition-all shadow-inner"
          />
          <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base"></i>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <span>Search</span>}
          </button>
        </form>

        {/* Quick Genre Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase mr-1">Quick Play:</span>
          {['Lo-Fi Chill', 'Acoustic Guitar', 'Synthwave', 'Ambient Piano', 'Deep Focus', 'Beats'].map((genre) => (
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
          <span className="font-bold uppercase tracking-wider text-slate-300">
            Queue Playlist ({results.length} Tracks)
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Auto-Continuous Play Enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((track, idx) => {
            const isThisPlaying = activeTrack?.id === track.id && isPlaying;
            const isThisActive = activeTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isThisActive) {
                    togglePlayPause();
                  } else {
                    setActiveTrack(track);
                    setIsPlaying(true);
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
      </div>

      {/* ── PERSISTENT DOCKED MP3 PLAYER BAR (Plays Even with Screen Off) ── */}
      {activeTrack && (
        <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto z-40 bg-slate-900/95 border-2 border-cyan-500/50 backdrop-blur-xl rounded-3xl p-4 shadow-2xl shadow-black/80 space-y-2.5 animate-slide-up">
          {/* Progress Scrubber Bar */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || activeTrack.durationMs / 1000 || 100}
              value={currentTime}
              onChange={(e) => {
                const newTime = Number(e.target.value);
                setCurrentTime(newTime);
                if (audioRef.current) audioRef.current.currentTime = newTime;
              }}
              className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span>{formatTime(duration || activeTrack.durationMs / 1000)}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Song Meta & Animated Spinning Artwork */}
            <div className="flex items-center gap-3 min-w-0 max-w-[30%] sm:max-w-[40%]">
              <div className={`relative w-10 h-10 rounded-full overflow-hidden border border-cyan-500/50 flex-shrink-0 shadow-md ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}>
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
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Shuffle Button */}
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                  isShuffle ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Shuffle Queue"
              >
                <i className="fas fa-shuffle"></i>
              </button>

              {/* Prev Track */}
              <button
                onClick={playPrevTrack}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs transition-transform active:scale-95"
                title="Previous Track"
              >
                <i className="fas fa-backward-step"></i>
              </button>

              {/* Main Play / Pause Button */}
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black flex items-center justify-center text-base shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play ml-0.5'}`}></i>
              </button>

              {/* Next Track */}
              <button
                onClick={playNextTrack}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs transition-transform active:scale-95"
                title="Next Track (Auto-Select)"
              >
                <i className="fas fa-forward-step"></i>
              </button>

              {/* Repeat Mode Button */}
              <button
                onClick={() => {
                  if (repeatMode === 'all') setRepeatMode('one');
                  else if (repeatMode === 'one') setRepeatMode('off');
                  else setRepeatMode('all');
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                  repeatMode !== 'off' ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={`Repeat Mode: ${repeatMode.toUpperCase()}`}
              >
                <i className={`fas ${repeatMode === 'one' ? 'fa-repeat text-amber-400' : 'fa-repeat'}`}></i>
                {repeatMode === 'one' && <span className="text-[8px] font-bold ml-0.5">1</span>}
              </button>
            </div>

            {/* Volume & Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Volume Slider (Hidden on small mobile) */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      const nextMute = !isMuted;
                      setIsMuted(nextMute);
                      audioRef.current.muted = nextMute;
                    }
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
                  className="w-16 accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Download Option */}
              <button
                onClick={() => openDownloadModal(activeTrack, 'mp3')}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
              >
                <i className="fas fa-download"></i>
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Options Modal */}
      {downloadModalTrack && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <button
              onClick={() => setDownloadModalTrack(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
                <i className="fas fa-download"></i>
                <span>Download Audio Track</span>
              </div>
              <h3 className="text-base font-bold text-white truncate px-4 pt-2">
                {downloadModalTrack.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">{downloadModalTrack.artist}</p>
            </div>

            <div className="space-y-2 text-left pt-2">
              <a
                href={downloadModalTrack.downloadUrl || downloadModalTrack.previewUrl}
                download={`${downloadModalTrack.artist} - ${downloadModalTrack.title}.mp3`}
                className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-between transition-all shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-music"></i>
                  <span>Direct MP3 Audio Download</span>
                </span>
                <i className="fas fa-download"></i>
              </a>

              <button
                onClick={() => handleDownloadArtwork(downloadModalTrack)}
                className="w-full p-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white flex items-center justify-between transition-all shadow-lg shadow-purple-900/30"
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-image"></i>
                  <span>Download High-Resolution Cover Art</span>
                </span>
                <i className="fas fa-download"></i>
              </button>

              <button
                onClick={() => copyTrackLink(downloadModalTrack)}
                className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <i className="fas fa-copy text-blue-400"></i>
                <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Track Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
