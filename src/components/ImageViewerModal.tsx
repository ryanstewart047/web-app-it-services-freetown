'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';

export interface ImageViewerModalProps {
  isOpen: boolean;
  src: string | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

/**
 * Helper to safely convert any data URL or image URL to a Blob URL
 * and open it in a new tab without being blocked by browser security restrictions.
 */
export function openImageInNewTab(dataUrl: string, filename?: string) {
  try {
    if (!dataUrl) return;

    if (dataUrl.startsWith('data:')) {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const byteString = atob(parts[1] || parts[0]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank');
      if (!win) {
        // Fallback to trigger download if popup blocker blocked it
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = (filename || 'image').toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      window.open(dataUrl, '_blank');
    }
  } catch (err) {
    console.error('Failed to open image in new tab:', err);
  }
}

/**
 * Helper to download an image directly
 */
export function downloadImage(dataUrl: string, filename?: string) {
  try {
    if (!dataUrl) return;
    const a = document.createElement('a');
    if (dataUrl.startsWith('data:')) {
      const parts = dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const byteString = atob(parts[1] || parts[0]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      a.href = blobUrl;
    } else {
      a.href = dataUrl;
    }
    a.download = (filename || 'downloaded-image').toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('Failed to download image:', err);
  }
}

export default function ImageViewerModal({
  isOpen,
  src,
  title = 'Full Size Image',
  subtitle,
  onClose,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(1);

  // Reset zoom whenever modal opens with new image
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
    }
  }, [isOpen, src]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5));
      if (e.key === '0') setZoom(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-black/60 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Percentage / Reset */}
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-colors"
            title="Reset Zoom (0)"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Open in Safe New Tab */}
          <button
            type="button"
            onClick={() => openImageInNewTab(src, title)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            title="Open in new window (Safe Blob)"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Download Image */}
          <button
            type="button"
            onClick={() => downloadImage(src, title)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
            title="Save Image to Computer / Phone"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-red-600/80 text-white transition-colors ml-1"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image View Area */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
        onClick={onClose}
      >
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-150 cursor-default"
          style={{ transform: `scale(${zoom})` }}
          onClick={e => e.stopPropagation()}
        >
          <img
            src={src}
            alt={title}
            className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-lg shadow-2xl border border-white/10 bg-neutral-900"
          />
        </div>
      </div>

      {/* Bottom Hint Bar */}
      <div className="py-2 text-center text-[11px] text-gray-500 bg-black/60 border-t border-white/5">
        <span>Click outside or press <strong>ESC</strong> to close • Use <strong>+/-</strong> to zoom</span>
      </div>
    </div>
  );
}
