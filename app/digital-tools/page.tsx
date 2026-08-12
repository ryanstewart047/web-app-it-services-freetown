'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AudioConverter from '@/components/digital-tools/AudioConverter';
import MusicFinder from '@/components/digital-tools/MusicFinder';
import ImageConverter from '@/components/digital-tools/ImageConverter';
import DocumentConverter from '@/components/digital-tools/DocumentConverter';

type ToolCategory = 'all' | 'audio-convert' | 'music-finder' | 'image-convert' | 'doc-convert' | 'qr-hash';

export default function DigitalToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // QR Code generator state
  const [qrText, setQrText] = useState('https://bridgetechsl.com');
  const [qrSize, setQrSize] = useState(200);

  // File hash calculator state
  const [hashFile, setHashFile] = useState<File | null>(null);
  const [hashResult, setHashResult] = useState<{ size: number; name: string } | null>(null);

  const handleHashFile = (f: File) => {
    setHashFile(f);
    setHashResult({ size: f.size, name: f.name });
  };

  const matchesSearch = (title: string, desc: string, tags: string[]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      tags.some((t) => t.toLowerCase().includes(q))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-red-500 selection:text-white">
      {/* Background Neon Grid */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs font-semibold tracking-wide transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to BridgeTech Main Site</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-full animate-pulse">
              ⚡ Digital Products Suite v1.0
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-600/20 via-blue-600/20 to-purple-600/20 border border-slate-700/60 rounded-full text-xs font-semibold text-slate-200 mb-4 shadow-xl">
            <i className="fas fa-[#38bdf8] fa-wand-magic-sparkles text-red-400"></i>
            <span>All-In-One Digital File Converters & Media Search Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Digital Products <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-400 to-purple-500">& Tools Hub</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Convert music files, search songs & HD album art online, convert images (JPG, PNG, WebP, SVG, ICO), transform Word documents to PDF, and run developer utilities — 100% free & privately in your browser.
          </p>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-lock text-emerald-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">100% Private</p>
              <p className="text-[10px] text-slate-500">Processed in browser</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-[#22c55e] fa-bolt text-amber-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">Lightning Fast</p>
              <p className="text-[10px] text-slate-500">No upload queues</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-music text-blue-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">Music Finder</p>
              <p className="text-[10px] text-slate-500">Artist & Title Search</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-infinity text-purple-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">Unlimited</p>
              <p className="text-[10px] text-slate-500">Zero file restrictions</p>
            </div>
          </div>
        </div>

        {/* Live Search & Category Filter Navigation */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. MP3 converter, Music Finder, JPG to PNG, DOCX to PDF)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-xl"
            />
            <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {[
              { id: 'all', label: 'All Tools', icon: 'fas fa-grid-2' },
              { id: 'audio-convert', label: 'Audio Converter', icon: 'fas fa-music', color: 'text-red-400' },
              { id: 'music-finder', label: 'Online Music Search', icon: 'fas fa-magnifying-glass-wave', color: 'text-blue-400' },
              { id: 'image-convert', label: 'Image Converter', icon: 'fas fa-image', color: 'text-emerald-400' },
              { id: 'doc-convert', label: 'Document & PDF', icon: 'fas fa-file-contract', color: 'text-purple-400' },
              { id: 'qr-hash', label: 'QR & Utilities', icon: 'fas fa-qrcode', color: 'text-amber-400' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ToolCategory)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
                  activeTab === tab.id
                    ? 'bg-red-600/20 border-red-500/50 text-white shadow-lg shadow-red-900/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <i className={`${tab.icon} ${tab.color || 'text-red-400'}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools Display */}
        <div className="space-y-10">
          {/* 1. Audio Converter */}
          {(activeTab === 'all' || activeTab === 'audio-convert') &&
            matchesSearch('Audio Converter', 'Convert audio files MP3 WAV OGG FLAC M4A', ['audio', 'mp3', 'wav', 'flac', 'ogg', 'trim']) && (
              <section id="audio-converter">
                <AudioConverter />
              </section>
            )}

          {/* 2. Online Music Search */}
          {(activeTab === 'all' || activeTab === 'music-finder') &&
            matchesSearch('Online Music Search', 'Search music artist song title keywords artwork', ['music', 'song', 'artist', 'artwork', 'download']) && (
              <section id="music-finder">
                <MusicFinder />
              </section>
            )}

          {/* 3. Image Converter */}
          {(activeTab === 'all' || activeTab === 'image-convert') &&
            matchesSearch('Image Converter', 'Convert JPG PNG WebP SVG Favicon ICO resize compress', ['image', 'jpg', 'png', 'webp', 'ico', 'svg']) && (
              <section id="image-converter">
                <ImageConverter />
              </section>
            )}

          {/* 4. Document & PDF Converter */}
          {(activeTab === 'all' || activeTab === 'doc-convert') &&
            matchesSearch('Document Converter', 'Word to PDF, PDF to Text, Markdown to PDF', ['word', 'pdf', 'docx', 'text', 'convert']) && (
              <section id="doc-converter">
                <DocumentConverter />
              </section>
            )}

          {/* 5. QR Code Generator & File Hash Utilities */}
          {(activeTab === 'all' || activeTab === 'qr-hash') &&
            matchesSearch('QR Code & File Checksum Utilities', 'QR code generator file hash checksum', ['qr', 'qrcode', 'hash', 'md5', 'checksum']) && (
              <section id="qr-utilities" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-amber-600/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 text-xl font-bold">
                    <i className="fas fa-qrcode"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">QR Code & File Utilities</h2>
                    <p className="text-xs text-slate-400">Generate custom QR codes & inspect file metadata integrity</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* QR Code Generator */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fas fa-qrcode text-amber-400"></i>
                      <span>QR Code Generator</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Enter URL or Text</label>
                      <input
                        type="text"
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                        placeholder="https://yourwebsite.com or text..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-inner max-w-[220px] mx-auto">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrText)}`}
                        alt="Generated QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>

                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrText)}`}
                      target="_blank"
                      download="qrcode.png"
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <i className="fas fa-download"></i>
                      <span>Download HD QR Code PNG</span>
                    </a>
                  </div>

                  {/* File Checksum / Metadata */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fas fa-shield-halved text-blue-400"></i>
                      <span>File Metadata & Size Inspector</span>
                    </h3>

                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => e.target.files?.[0] && handleHashFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border border-dashed border-slate-700 bg-slate-900 p-6 rounded-xl text-center">
                        <i className="fas fa-file-shield text-2xl text-blue-400 mb-2"></i>
                        <p className="text-xs font-semibold text-slate-300">
                          {hashFile ? hashFile.name : 'Upload file to inspect bytes & integrity'}
                        </p>
                      </div>
                    </div>

                    {hashResult && (
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                        <p className="text-slate-400">Filename: <strong className="text-white">{hashResult.name}</strong></p>
                        <p className="text-slate-400">Size (Bytes): <strong className="text-emerald-400">{hashResult.size.toLocaleString()} bytes</strong></p>
                        <p className="text-slate-400">Size (MB): <strong className="text-emerald-400">{(hashResult.size / (1024 * 1024)).toFixed(3)} MB</strong></p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
        </div>

        {/* Footer FAQ & Support */}
        <div className="mt-16 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center max-w-4xl mx-auto backdrop-blur">
          <h3 className="text-lg font-bold text-white mb-2">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-6">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-red-400 mb-1">Are my files uploaded to any external server?</h4>
              <p className="text-xs text-slate-400">
                No! All audio, image, and document conversions run 100% client-side inside your web browser. Your files never leave your computer or device.
              </p>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-blue-400 mb-1">How does the Online Music Search work?</h4>
              <p className="text-xs text-slate-400">
                The Music Finder connects to public audio metadata indexes to search tracks, preview 30-second streams, and download high-resolution HD album cover artwork.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
