'use client';

import React, { useState } from 'react';
import Image from 'next/image';

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
  artworkUrlSmall: string;
  artworkUrlHD: string;
  trackViewUrl: string;
  collectionViewUrl: string;
  isExplicit: boolean;
  isFullTrack?: boolean;
}

export default function MusicFinder() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
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
          setError(`No songs found matching "${searchQuery}". Try different keywords or artist name.`);
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 text-xl font-bold">
          <i className="fas fa-magnifying-glass-wave"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Online Music & Artwork Search</h2>
          <p className="text-xs text-slate-400">Search songs by Artist, Track Title, or Keywords with HD Artwork & Audio Preview</p>
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
            className="w-full px-4 py-3.5 pl-12 pr-28 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
          />
          <i className="fas fa-music absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base"></i>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
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
          {['Afrobeats', 'Sierra Leone Music', 'Gospel', 'Hip Hop', 'R&B', 'Acoustic Instrumental'].map((chip) => (
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

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Found <strong className="text-white font-mono">{results.length}</strong> songs</span>
            <span>Click any track to listen & download artwork</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {results.map((track) => {
              const isPlaying = activeTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`bg-slate-950 border rounded-2xl p-4 transition-all hover:scale-[1.01] flex flex-col justify-between ${
                    isPlaying
                      ? 'border-blue-500 shadow-lg shadow-blue-900/30 bg-blue-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 group">
                      {track.artworkUrlSmall ? (
                        <img
                          src={track.artworkUrlSmall}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <i className="fas fa-music text-xl"></i>
                        </div>
                      )}
                      {track.previewUrl && (
                        <button
                          onClick={() => setActiveTrack(isPlaying ? null : track)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-all"
                          title={isPlaying ? 'Pause' : 'Play Audio Preview'}
                        >
                          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-lg`}></i>
                        </button>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate leading-tight" title={track.title}>
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
                            Preview Clip
                          </span>
                        )}
                        <span className="text-slate-500">{track.genre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    {track.previewUrl && (
                      <button
                        onClick={() => setActiveTrack(isPlaying ? null : track)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isPlaying
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <i className={`fas ${isPlaying ? 'fa-pause text-white' : 'fa-play text-blue-400'}`}></i>
                        <span>{isPlaying ? 'Pause' : track.isFullTrack ? 'Play Full Song' : 'Play Preview'}</span>
                      </button>
                    )}

                    {track.artworkUrlHD && (
                      <a
                        href={track.artworkUrlHD}
                        target="_blank"
                        download={`${track.artist}_${track.title}_cover.jpg`}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Download HD Album Cover Artwork"
                      >
                        <i className="fas fa-image text-emerald-400"></i>
                        <span>HD Cover</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom Audio Player Bar */}
      {activeTrack && (
        <div className="mt-6 p-4 bg-blue-950/80 border border-blue-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur shadow-2xl animate-slide-up">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-blue-500/30">
              <img src={activeTrack.artworkUrlSmall} alt={activeTrack.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{activeTrack.title}</p>
              <p className="text-[11px] text-blue-400 truncate">{activeTrack.artist}</p>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <audio
              controls
              autoPlay
              src={`/api/music/proxy?url=${encodeURIComponent(activeTrack.previewUrl)}&filename=${encodeURIComponent(`${activeTrack.artist}_${activeTrack.title}.mp3`)}`}
              className="w-full h-9 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeTrack.previewUrl && (
              <a
                href={`/api/music/proxy?url=${encodeURIComponent(activeTrack.previewUrl)}&filename=${encodeURIComponent(`${activeTrack.artist}_${activeTrack.title}.mp3`)}`}
                download={`${activeTrack.artist}_${activeTrack.title}_preview.mp3`}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <i className="fas fa-download"></i>
                <span>Download MP3 Audio</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
