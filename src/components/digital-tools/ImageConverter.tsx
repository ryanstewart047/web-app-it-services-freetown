'use client';

import React, { useState, useRef, useEffect } from 'react';

type ImageFormat = 'png' | 'jpeg' | 'webp' | 'ico' | 'bmp';

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<number>(0.92); // 0 to 1
  
  // Dimensions
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#ffffff'); // background for transparent images converted to JPG

  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [convertedName, setConvertedName] = useState<string>('');
  const [converting, setConverting] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select a valid image file (.jpg, .png, .webp, .svg, .bmp).');
      return;
    }

    setFile(selectedFile);
    setConvertedUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
      };
      img.src = src;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      const ratio = origHeight / origWidth;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      const ratio = origWidth / origHeight;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const convertImage = () => {
    if (!imageSrc || !file) return;

    setConverting(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = targetWidth || img.naturalWidth;
      const h = targetHeight || img.naturalHeight;

      canvas.width = targetFormat === 'ico' ? 64 : w;
      canvas.height = targetFormat === 'ico' ? 64 : h;

      // Fill background if converting transparent image to JPEG
      if (targetFormat === 'jpeg') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let mimeType = `image/${targetFormat}`;
      if (targetFormat === 'ico') mimeType = 'image/x-icon';

      const dataUrl = canvas.toDataURL(mimeType, quality);
      setConvertedUrl(dataUrl);

      // Estimate byte size
      const head = `data:${mimeType};base64,`;
      const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
      setConvertedSize(sizeInBytes);

      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
      const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      setConvertedName(`${baseName}_converted.${ext}`);

      setConverting(false);
    };

    img.src = imageSrc;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 text-xl font-bold">
          <i className="fas fa-image"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Image Converter & Resizer</h2>
          <p className="text-xs text-slate-400">Convert JPG, PNG, WebP, SVG & Favicon ICO with custom quality & dimensions</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="relative mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/60 rounded-2xl p-8 text-center transition-all">
          <i className="fas fa-file-image text-4xl text-emerald-500/80 mb-3 animate-pulse"></i>
          <h3 className="text-sm font-semibold text-slate-200">
            {file ? file.name : 'Drag & Drop image file here, or click to upload'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports JPG, PNG, WebP, SVG, BMP, ICO (Max 50MB)
          </p>
          {file && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono">
              <span>{(file.size / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span>{origWidth}x{origHeight} px</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview & Options */}
      {imageSrc && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Image Preview */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
            <img
              src={imageSrc}
              alt="Original preview"
              className="max-h-56 max-w-full object-contain rounded-lg border border-slate-800 shadow-md"
            />
            <p className="text-[11px] font-mono text-slate-500 mt-2">
              Original: {origWidth} x {origHeight} px ({file ? (file.size / 1024).toFixed(1) : 0} KB)
            </p>
          </div>

          {/* Options Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Convert To Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="png">PNG — Portable Network Graphics (Lossless)</option>
                <option value="jpeg">JPG / JPEG — Joint Photographic Experts Group</option>
                <option value="webp">WebP — Modern Web Format (Compressed)</option>
                <option value="ico">ICO — Website Favicon (64x64 icon)</option>
                <option value="bmp">BMP — Bitmap Image</option>
              </select>
            </div>

            {/* Quality Slider (For JPEG / WebP) */}
            {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Image Quality & Compression</span>
                  <span className="text-emerald-400 font-mono">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            )}

            {/* Background Color for JPG */}
            {targetFormat === 'jpeg' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Transparency Background Color (for transparent PNGs)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-300">{bgColor}</span>
                </div>
              </div>
            )}

            {/* Resize Dimensions */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>Resize Dimensions (px)</span>
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`text-xs flex items-center gap-1 transition-colors ${
                    lockAspect ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  <i className={`fas ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
                  <span>Lock Ratio</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={targetWidth || ''}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={targetHeight || ''}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={convertImage}
        disabled={!imageSrc || converting}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
      >
        {converting ? (
          <>
            <i className="fas fa-circle-notch fa-spin"></i>
            <span>Converting Image...</span>
          </>
        ) : (
          <>
            <i className="fas fa-wand-magic-sparkles"></i>
            <span>Convert Image to .{targetFormat.toUpperCase()}</span>
          </>
        )}
      </button>

      {/* Result Display */}
      {convertedUrl && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <i className="fas fa-check-circle"></i>
              <span>Image Converted Successfully!</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{convertedName}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4">
              <img src={convertedUrl} alt="Converted" className="w-16 h-16 object-contain rounded-lg border border-slate-800" />
              <div>
                <p className="text-xs font-bold text-white">{targetWidth} x {targetHeight} px</p>
                <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                  {(convertedSize / 1024).toFixed(1)} KB
                </p>
                {file && file.size > 0 && (
                  <p className="text-[11px] text-slate-500">
                    {convertedSize < file.size
                      ? `Saved ${Math.round((1 - convertedSize / file.size) * 100)}% size!`
                      : `Size adjusted for quality`}
                  </p>
                )}
              </div>
            </div>

            <a
              href={convertedUrl}
              download={convertedName}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
            >
              <i className="fas fa-download"></i>
              <span>Download Image</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
