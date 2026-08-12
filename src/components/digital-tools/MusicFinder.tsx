'use client';

import React, { useState, useEffect } from 'react';

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
  const [pastedUrl, setPastedUrl] = useState('');
  const [pastedTrack, setPastedTrack] = useState<MusicTrack | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [activeTrack, setActiveTrack] = useState<MusicTrack | null>(null);
  const [downloadModalTrack, setDownloadModalTrack] = useState<MusicTrack | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'mp4'>('mp3');
  const [error, setError] = useState('');

  // Extract YouTube Video ID from any YouTube URL format (watch, shorts, embed, mobile, shortened)
  const extractYouTubeId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    const match = urlStr.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  // Automatically detect pasted YouTube URL
  useEffect(() => {
    const videoId = extractYouTubeId(pastedUrl.trim());
    if (videoId) {
      const track: MusicTrack = {
        id: `yt_pasted_${videoId}`,
        youtubeId: videoId,
        title: `YouTube Media (${videoId})`,
        artist: 'YouTube Track',
        album: 'Pasted Link',
        genre: 'Music / Video',
        durationMs: 210000,
        durationFormatted: 'Full Track',
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

      if (res.ok && data.results) {
        if (append) {
          setResults(data.results);
        } else {
          setResults(data.results);
        }
        setTotalResults(data.total || data.results.length);
        setHasMore(data.hasMore || false);

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

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchMusic(query, nextPage, true);
  };

  const openTrack = (track: MusicTrack) => {
    setActiveTrack(track);
  };

  const closePlayer = () => {
    setActiveTrack(null);
  };

  const openDownloadModal = (track: MusicTrack, format: 'mp3' | 'mp4' = 'mp3') => {
    setDownloadModalTrack(track);
    setSelectedFormat(format);
  };

  // Download HD artwork directly to computer
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 text-2xl font-bold shadow-lg">
          <i className="fab fa-youtube"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">YouTube Online Music Search & Converter</h2>
          <p className="text-xs text-slate-400">
            Search 100% full-length songs with unlimited auto-load results or paste YouTube links for MP3/MP4 conversion
          </p>
        </div>
      </div>

      {/* Paste YouTube URL Converter Bar */}
      <div className="mb-8 bg-slate-950 p-5 rounded-2xl border border-red-500/30 shadow-xl space-y-3">
        <label className="block text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
          <i className="fas fa-link"></i>
          <span>Paste Any YouTube Link to Convert (MP3 / MP4 Download)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={pastedUrl}
            onChange={(e) => setPastedUrl(e.target.value)}
            placeholder="Paste YouTube video or song link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
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

        {/* Automatically detected YouTube Link Download Options Card */}
        {pastedTrack && (
          <div className="p-4 bg-slate-900 rounded-xl border border-red-500/40 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-400">YouTube Video Detected! Select Option:</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">ID: {pastedTrack.youtubeId}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => openTrack(pastedTrack)}
                className="py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <i className="fas fa-play"></i>
                <span>Play Video</span>
              </button>

              <button
                onClick={() => openDownloadModal(pastedTrack, 'mp3')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <i className="fas fa-music"></i>
                <span>Download MP3</span>
              </button>

              <button
                onClick={() => openDownloadModal(pastedTrack, 'mp4')}
                className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <i className="fas fa-video"></i>
                <span>Download MP4</span>
              </button>

              <button
                onClick={() => handleDownloadArtwork(pastedTrack)}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <i className="fas fa-image"></i>
                <span>Download Cover</span>
              </button>
            </div>
          </div>
        )}
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
          <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base"></i>
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
          {[...Array(9)].map((_, i) => (
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
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing <strong className="text-white font-mono">{results.length}</strong> of {totalResults || results.length} YouTube full tracks</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Click any song to play full video/audio in player</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[650px] overflow-y-auto pr-1 custom-scrollbar">
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
                    {/* Thumbnail */}
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
                        <i className="fas fa-play text-lg text-red-500"></i>
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
                      <span>{isActive ? 'Now Playing' : 'Play Song'}</span>
                    </button>

                    <button
                      onClick={() => openDownloadModal(track, 'mp3')}
                      className="py-2 px-3 bg-slate-900 hover:bg-emerald-600/20 hover:text-emerald-400 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-slate-300"
                      title="Download MP3 or MP4"
                    >
                      <i className="fas fa-download text-emerald-400"></i>
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Auto-Load / Load More Songs Button */}
          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="py-3 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl text-xs shadow-xl shadow-red-900/30 transition-all hover:scale-[1.02] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Loading More YouTube Tracks...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-down-short-wide"></i>
                    <span>Load More Song Results (+50 Tracks)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* POPUP FULL-SIZE MUSIC PLAYER MODAL */}
      {activeTrack && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-950 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            {/* Close Button */}
            <button
              onClick={closePlayer}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors z-20"
              title="Close Player"
            >
              <i className="fas fa-xmark text-lg"></i>
            </button>

            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 pr-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-bold">
                <i className="fab fa-youtube text-red-500 text-sm"></i>
                <span>BridgeTech Full-Length YouTube Player</span>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">{activeTrack.durationFormatted}</span>
            </div>

            {/* LARGE CRISP YOUTUBE PLAYER CONTAINER */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-2xl">
              {activeTrack.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeTrack.youtubeId}?autoplay=1&enablejsapi=1&rel=0`}
                  title={activeTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 space-y-3">
                  <i className="fas fa-music text-4xl text-blue-400"></i>
                  <audio controls autoPlay src={activeTrack.previewUrl} className="w-full max-w-md h-10 rounded-lg" />
                </div>
              )}
            </div>

            {/* Song Meta Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-900 pt-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-white truncate">{activeTrack.title}</h3>
                <p className="text-xs text-red-400 font-semibold truncate mt-0.5">{activeTrack.artist}</p>
              </div>

              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg shrink-0">
                100% Full Song
              </span>
            </div>

            {/* DOWNLOAD OPTIONS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => openDownloadModal(activeTrack, 'mp3')}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 hover:scale-[1.02]"
              >
                <i className="fas fa-music"></i>
                <span>Download MP3 Audio</span>
              </button>

              <button
                onClick={() => openDownloadModal(activeTrack, 'mp4')}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/30 hover:scale-[1.02]"
              >
                <i className="fas fa-video"></i>
                <span>Download MP4 Video</span>
              </button>

              <button
                onClick={() => handleDownloadArtwork(activeTrack)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <i className="fas fa-image"></i>
                <span>Download Cover Art (HD)</span>
              </button>
            </div>

            {/* Prev / Next Track Navigation */}
            {results.length > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400">
                <button
                  onClick={() => {
                    const idx = results.findIndex(r => r.id === activeTrack.id);
                    if (idx > 0) openTrack(results[idx - 1]);
                  }}
                  disabled={results.findIndex(r => r.id === activeTrack.id) === 0}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all"
                >
                  <i className="fas fa-backward-step"></i> Previous
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
                  Next <i className="fas fa-forward-step"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WORLDWIDE MULTI-MIRROR MP3 / MP4 DOWNLOAD SELECTOR MODAL */}
      {downloadModalTrack && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setDownloadModalTrack(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors"
              title="Close Download Modal"
            >
              <i className="fas fa-xmark text-lg"></i>
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
                <i className="fas fa-download text-emerald-400"></i>
                <span>High-Speed Download Servers</span>
              </div>
              <h3 className="text-base font-bold text-white truncate px-4 pt-2">
                {downloadModalTrack.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">{downloadModalTrack.artist}</p>
            </div>

            {/* Format Selector Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setSelectedFormat('mp3')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedFormat === 'mp3' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="fas fa-music"></i>
                <span>MP3 Audio</span>
              </button>

              <button
                onClick={() => setSelectedFormat('mp4')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedFormat === 'mp4' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="fas fa-video"></i>
                <span>MP4 Video</span>
              </button>
            </div>

            {/* Download Server Options (Multi-mirror for 100% worldwide availability!) */}
            <div className="space-y-2 text-left">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Select Download Server (100% Guaranteed Download):
              </p>

              {downloadModalTrack.youtubeId ? (
                <>
                  <a
                    href={`https://y2mate.nu/en1/?url=https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-between transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <i className="fas fa-bolt text-amber-400"></i>
                      <span>Server 1 — Y2Mate High-Speed {selectedFormat.toUpperCase()}</span>
                    </span>
                    <i className="fas fa-arrow-right text-slate-500 group-hover:text-emerald-400 transition-colors"></i>
                  </a>

                  <a
                    href={`https://yt5s.biz/en/watch?v=${downloadModalTrack.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-between transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <i className="fas fa-[#38bdf8] fa-circle-play text-blue-400"></i>
                      <span>Server 2 — YT5s Direct {selectedFormat.toUpperCase()}</span>
                    </span>
                    <i className="fas fa-arrow-right text-slate-500 group-hover:text-blue-400 transition-colors"></i>
                  </a>

                  <a
                    href={`https://9buddy.com/p?url=https://www.youtube.com/watch?v=${downloadModalTrack.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-between transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <i className="fas fa-wand-magic-sparkles text-purple-400"></i>
                      <span>Server 3 — 9Buddy Multi-Format Downloader</span>
                    </span>
                    <i className="fas fa-arrow-right text-slate-500 group-hover:text-purple-400 transition-colors"></i>
                  </a>

                  <a
                    href={`https://ssyoutube.com/watch?v=${downloadModalTrack.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-between transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <i className="fab fa-youtube text-red-500"></i>
                      <span>Server 4 — SSYouTube / SaveFrom</span>
                    </span>
                    <i className="fas fa-arrow-right text-slate-500 group-hover:text-red-400 transition-colors"></i>
                  </a>
                </>
              ) : (
                <a
                  href={downloadModalTrack.downloadUrl || downloadModalTrack.previewUrl}
                  download={`${downloadModalTrack.artist} - ${downloadModalTrack.title}.${selectedFormat}`}
                  className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <i className="fas fa-download"></i>
                  <span>Direct Download .{selectedFormat.toUpperCase()}</span>
                </a>
              )}

              <button
                onClick={() => handleDownloadArtwork(downloadModalTrack)}
                className="w-full p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-purple-400 flex items-center justify-center gap-2 transition-all"
              >
                <i className="fas fa-image"></i>
                <span>Download HD Cover Art Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
