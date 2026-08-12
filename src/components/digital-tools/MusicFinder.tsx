'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MusicTrack {
  id: string;
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
  trackViewUrl: string;
  collectionViewUrl: string;
  isExplicit: boolean;
  isFullTrack?: boolean;
  source?: string;
}

export default function MusicFinder() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [error, setError] = useState('');

  // Mini-player persistent state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchMusic = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery)}&limit=30`);
      const data = await res.json();

      if (res.ok && data.results) {
        setResults(data.results);
        if (data.results.length === 0) {
          setError(`No songs found matching "${searchQuery}". Try searching a different song title or artist.`);
        }
      } else {
        setError(data.error || 'Failed to fetch music metadata.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error while searching music online.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMusic(query);
  };

  const handleChipClick = (genreKeyword: string) => {
    setQuery(genreKeyword);
    searchMusic(genreKeyword);
  };

  const getAudioProxyUrl = (track: MusicTrack, isDownload = false) => {
    const rawUrl = track.downloadUrl || track.previewUrl;
    const filename = `${track.artist} - ${track.title}.mp3`;
    return `/api/music/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(filename)}${
      isDownload ? '&download=1' : ''
    }`;
  };

  const openTrack = (track: MusicTrack) => {
    setActiveTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveTrack(null);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 text-xl font-bold">
          <i className="fas fa-magnifying-glass"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Online Music & Artwork Search Engine</h2>
          <p className="text-xs text-slate-400">
            Search full songs by Artist, Track Title, or Keywords • Full-Length Popup Player & HD Cover Downloads
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type artist name, track title, album, or song keywords..."
            className="w-full px-4 py-3.5 pl-12 pr-28 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all shadow-inner"
          />
          <i className="fas fa-music absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base"></i>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md"
          >
            {loading ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-search"></i>
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Popular:</span>
          {['Afrobeats', 'Sierra Leone', 'Gospel', 'Hip Hop', 'R&B', 'Acoustic', 'Jazz', 'Reggae'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 bg-slate-950 hover:bg-blue-600/20 hover:text-blue-400 border border-slate-800 hover:border-blue-500/40 rounded-full text-slate-400 transition-all text-xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs mb-6 flex items-center gap-2">
          <i className="fas fa-circle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-16 h-16 rounded-xl bg-slate-800 shrink-0"></div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-slate-800 rounded-lg w-3/4"></div>
                  <div className="h-2.5 bg-slate-800 rounded-lg w-1/2"></div>
                  <div className="h-2 bg-slate-800 rounded-lg w-1/3"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Found <strong className="text-white font-mono">{results.length}</strong> tracks</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Click any track to open full-length popup player</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {results.map((track) => {
              const isActive = activeTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`bg-slate-950 border rounded-2xl p-4 transition-all hover:scale-[1.01] flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-500 shadow-lg shadow-blue-900/40 bg-blue-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Album Art */}
                    <div
                      onClick={() => openTrack(track)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 cursor-pointer group"
                    >
                      {track.artworkUrlSmall ? (
                        <img src={track.artworkUrlSmall} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <i className="fas fa-music text-xl"></i>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all">
                        <i className="fas fa-play text-lg"></i>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => openTrack(track)}
                        className="text-sm font-bold text-white truncate leading-tight cursor-pointer hover:text-blue-400 transition-colors"
                        title={track.title}
                      >
                        {track.title}
                      </h4>
                      <p className="text-xs text-blue-400 font-medium truncate mt-0.5" title={track.artist}>
                        {track.artist}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{track.album}</p>

                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] flex-wrap">
                        <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono">
                          {track.durationFormatted}
                        </span>
                        {track.isFullTrack ? (
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold text-[9px]">
                            🎵 FULL SONG
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[9px]">
                            Preview
                          </span>
                        )}
                        <span className="text-slate-600 text-[10px]">{track.genre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => openTrack(track)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <i className={`fas ${isActive ? 'fa-volume-high text-white' : 'fa-play text-blue-400'}`}></i>
                      <span>{isActive ? 'Now Playing' : 'Play in Popup'}</span>
                    </button>

                    {track.artworkUrlHD && (
                      <a
                        href={track.artworkUrlHD}
                        target="_blank"
                        download={`${track.artist}_${track.title}_cover.jpg`}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Download HD Album Cover Artwork"
                      >
                        <i className="fas fa-image text-emerald-400"></i>
                        <span>HD Art</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* POPUP MUSIC PLAYER MODAL */}
      {activeTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            {/* Close Button */}
            <button
              onClick={closePlayer}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors z-10"
              title="Close Music Player"
            >
              <i className="fas fa-xmark text-lg"></i>
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold">
              <i className="fas fa-bolt text-amber-400"></i>
              <span>{activeTrack.isFullTrack ? '🎵 Full-Length Song Player' : 'Music Preview Player'}</span>
            </div>

            {/* Album Cover Art — spinning while playing */}
            <div className={`relative w-44 h-44 mx-auto rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-2xl shadow-blue-900/50 transition-all ${isPlaying ? 'border-blue-400 shadow-blue-500/30' : ''}`}>
              {activeTrack.artworkUrlHD || activeTrack.artworkUrlSmall ? (
                <img
                  src={activeTrack.artworkUrlHD || activeTrack.artworkUrlSmall}
                  alt={activeTrack.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                  <i className="fas fa-music text-4xl"></i>
                </div>
              )}
              {/* Playing indicator overlay */}
              {isPlaying && (
                <div className="absolute bottom-2 right-2 bg-blue-600/90 rounded-full p-1">
                  <i className="fas fa-wave-square text-white text-xs animate-pulse"></i>
                </div>
              )}
            </div>

            {/* Song Meta Details */}
            <div>
              <h3 className="text-lg font-bold text-white truncate px-2">{activeTrack.title}</h3>
              <p className="text-sm text-blue-400 font-semibold truncate mt-0.5">{activeTrack.artist}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {activeTrack.album} {activeTrack.releaseYear ? `• ${activeTrack.releaseYear}` : ''} {activeTrack.genre ? `• ${activeTrack.genre}` : ''}
              </p>
              {activeTrack.source && (
                <p className="text-[10px] text-slate-600 mt-0.5">Source: {activeTrack.source}</p>
              )}
            </div>

            {/* Full Track Audio Stream Player */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
              <audio
                ref={audioRef}
                controls
                autoPlay
                src={getAudioProxyUrl(activeTrack, false)}
                className="w-full h-10 rounded-lg"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500">
                  {activeTrack.isFullTrack ? '🎵 Full Track' : '▶ Preview'} — {activeTrack.durationFormatted}
                </span>
                <span>{formatTime(duration || 0)}</span>
              </div>
            </div>

            {/* Download Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={getAudioProxyUrl(activeTrack, true)}
                download={`${activeTrack.artist} - ${activeTrack.title}.mp3`}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 hover:scale-[1.02]"
              >
                <i className="fas fa-download"></i>
                <span>Download MP3</span>
              </a>

              {activeTrack.artworkUrlHD && (
                <a
                  href={activeTrack.artworkUrlHD}
                  target="_blank"
                  download={`${activeTrack.artist} - ${activeTrack.title}_cover.jpg`}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <i className="fas fa-image text-emerald-400"></i>
                  <span>Download Cover Art</span>
                </a>
              )}
            </div>

            {/* Navigate Results */}
            {results.length > 1 && (
              <div className="flex items-center justify-center gap-3 pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    const idx = results.findIndex(r => r.id === activeTrack.id);
                    if (idx > 0) openTrack(results[idx - 1]);
                  }}
                  disabled={results.findIndex(r => r.id === activeTrack.id) === 0}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all"
                >
                  <i className="fas fa-backward-step"></i> Prev
                </button>
                <span className="text-[11px] text-slate-500">
                  {results.findIndex(r => r.id === activeTrack.id) + 1} / {results.length}
                </span>
                <button
                  onClick={() => {
                    const idx = results.findIndex(r => r.id === activeTrack.id);
                    if (idx < results.length - 1) openTrack(results[idx + 1]);
                  }}
                  disabled={results.findIndex(r => r.id === activeTrack.id) === results.length - 1}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all"
                >
                  Next <i className="fas fa-forward-step"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
