'use client';

import React, { useState, useRef } from 'react';

interface MusicTrack {
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

export default function MusicFinder() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [playerMode, setPlayerMode] = useState<'audio' | 'video'>('audio');
  const [error, setError] = useState('');

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

  const openTrack = (track: MusicTrack) => {
    setActiveTrack(track);
    setPlayerMode('audio');
  };

  const closePlayer = () => {
    setActiveTrack(null);
  };

  const getAudioProxyUrl = (track: MusicTrack, isDownload = false) => {
    const rawUrl = track.downloadUrl || track.previewUrl;
    const filename = `${track.artist} - ${track.title}.mp3`;
    return `/api/music/proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(filename)}${
      isDownload ? '&download=1' : ''
    }`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 text-xl font-bold">
          <i className="fab fa-youtube"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">YouTube Online Music & Song Finder</h2>
          <p className="text-xs text-slate-400">
            Search 100% full-length songs by Artist, Title or Keywords with Custom Player Popup & HD Art Downloads
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
            placeholder="Search YouTube songs, artists, albums, or song titles..."
            className="w-full px-4 py-3.5 pl-12 pr-28 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all shadow-inner"
          />
          <i className="fas fa-music absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base"></i>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 py-2 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md"
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
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Popular Searches:</span>
          {['Afrobeats', 'Sierra Leone Music', 'Gospel Songs', 'Hip Hop Hits', 'R&B', 'Acoustic', 'Reggae'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 bg-slate-950 hover:bg-red-600/20 hover:text-red-400 border border-slate-800 hover:border-red-500/40 rounded-full text-slate-400 transition-all text-xs"
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
            <span>Found <strong className="text-white font-mono">{results.length}</strong> YouTube full tracks</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Click any song to play full track in custom player</span>
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
                      ? 'border-red-500 shadow-lg shadow-red-900/40 bg-red-950/20'
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
                        className="text-sm font-bold text-white truncate leading-tight cursor-pointer hover:text-red-400 transition-colors"
                        title={track.title}
                      >
                        {track.title}
                      </h4>
                      <p className="text-xs text-red-400 font-medium truncate mt-0.5" title={track.artist}>
                        {track.artist}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px] flex-wrap">
                        <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300 font-mono">
                          {track.durationFormatted}
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold text-[9px]">
                          🎵 FULL SONG
                        </span>
                        <span className="text-slate-500 text-[10px]">YouTube</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => openTrack(track)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <i className={`fas ${isActive ? 'fa-volume-high text-white' : 'fa-play text-red-400'}`}></i>
                      <span>{isActive ? 'Now Playing' : 'Play Full Song'}</span>
                    </button>

                    {track.artworkUrlHD && (
                      <a
                        href={track.artworkUrlHD}
                        target="_blank"
                        download={`${track.artist}_${track.title}_cover.jpg`}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Download HD Cover Art"
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

      {/* POPUP CUSTOM MUSIC PLAYER MODAL */}
      {activeTrack && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-red-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            {/* Close Button */}
            <button
              onClick={closePlayer}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors z-10"
              title="Close Player"
            >
              <i className="fas fa-xmark text-lg"></i>
            </button>

            {/* Header Badge & Player Mode Selector */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-semibold">
                <i className="fab fa-youtube text-red-500"></i>
                <span>BridgeTech Full-Length Music Player</span>
              </div>

              {activeTrack.youtubeId && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setPlayerMode('audio')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      playerMode === 'audio' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fas fa-music"></i>
                    <span>Audio Mode</span>
                  </button>
                  <button
                    onClick={() => setPlayerMode('video')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      playerMode === 'video' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fas fa-video"></i>
                    <span>Video View</span>
                  </button>
                </div>
              )}
            </div>

            {/* Player View Container */}
            {activeTrack.youtubeId ? (
              <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
                {playerMode === 'video' ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${activeTrack.youtubeId}?autoplay=1&enablejsapi=1&rel=0`}
                      title={activeTrack.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center gap-4">
                    {/* Album Art Cover */}
                    <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-2xl shadow-red-900/50 group">
                      <img
                        src={activeTrack.artworkUrlHD || activeTrack.artworkUrlSmall}
                        alt={activeTrack.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-red-600 rounded-full p-1.5 shadow-lg">
                        <i className="fas fa-music text-white text-xs animate-pulse"></i>
                      </div>
                    </div>

                    {/* YouTube Embedded Audio Frame */}
                    <div className="w-full aspect-video h-20 rounded-xl overflow-hidden opacity-90 border border-slate-800">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${activeTrack.youtubeId}?autoplay=1&enablejsapi=1&rel=0`}
                        title={activeTrack.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Non-YouTube track fallback audio player */
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-xl">
                  <img src={activeTrack.artworkUrlHD || activeTrack.artworkUrlSmall} alt={activeTrack.title} className="w-full h-full object-cover" />
                </div>
                <audio controls autoPlay src={getAudioProxyUrl(activeTrack, false)} className="w-full h-10 rounded-lg" />
              </div>
            )}

            {/* Song Meta Details */}
            <div>
              <h3 className="text-base font-bold text-white truncate px-2">{activeTrack.title}</h3>
              <p className="text-xs text-red-400 font-semibold truncate mt-0.5">{activeTrack.artist}</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Full-Length Song • Duration: {activeTrack.durationFormatted}
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={activeTrack.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/30 hover:scale-[1.02]"
              >
                <i className="fab fa-youtube"></i>
                <span>Open on YouTube</span>
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

            {/* Prev / Next Track Navigation */}
            {results.length > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <button
                  onClick={() => {
                    const idx = results.findIndex(r => r.id === activeTrack.id);
                    if (idx > 0) openTrack(results[idx - 1]);
                  }}
                  disabled={results.findIndex(r => r.id === activeTrack.id) === 0}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all"
                >
                  <i className="fas fa-backward-step"></i> Previous Track
                </button>

                <span className="font-mono text-[11px]">
                  {results.findIndex(r => r.id === activeTrack.id) + 1} of {results.length}
                </span>

                <button
                  onClick={() => {
                    const idx = results.findIndex(r => r.id === activeTrack.id);
                    if (idx < results.length - 1) openTrack(results[idx + 1]);
                  }}
                  disabled={results.findIndex(r => r.id === activeTrack.id) === results.length - 1}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all"
                >
                  Next Track <i className="fas fa-forward-step"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
