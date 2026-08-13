'use client';

import React, { useEffect, useRef, useState } from 'react';

type ImageFormat = 'png' | 'jpeg' | 'webp';
type SourceKind = 'image' | 'video';

const IMAGE_FORMAT_LABELS: Record<ImageFormat, string> = {
  png: 'PNG - lossless with transparency',
  jpeg: 'JPG / JPEG - best for social sharing',
  webp: 'WebP - modern compressed web image',
};

const IMAGE_FORMAT_MIME: Record<ImageFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceKind, setSourceKind] = useState<SourceKind>('image');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png');
  const [quality, setQuality] = useState<number>(0.92);

  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [captureTime, setCaptureTime] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [convertedName, setConvertedName] = useState<string>('');
  const [converting, setConverting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [videoSrc, convertedUrl]);

  const resetOutput = () => {
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setConvertedUrl(null);
    setConvertedSize(0);
    setConvertedName('');
  };

  const handleFileChange = (selectedFile: File) => {
    const isImageFile = selectedFile.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif|bmp|ico)$/i.test(selectedFile.name);
    const isVideoFile = selectedFile.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi|3gp)$/i.test(selectedFile.name);

    if (!isImageFile && !isVideoFile) {
      alert('Please select a valid image or video file (.jpg, .png, .webp, .svg, .mp4, .webm, .mov).');
      return;
    }

    if (videoSrc) URL.revokeObjectURL(videoSrc);
    resetOutput();
    setFile(selectedFile);
    setSourceKind(isVideoFile ? 'video' : 'image');
    setImageSrc(null);
    setVideoSrc(null);
    setOrigWidth(0);
    setOrigHeight(0);
    setTargetWidth(0);
    setTargetHeight(0);
    setVideoDuration(0);
    setCaptureTime(0);
    setStatusMessage('');

    if (isVideoFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setVideoSrc(objectUrl);
      setTargetFormat('jpeg');
      setStatusMessage('Load the video preview, choose a timestamp, then export the frame.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
      };
      img.onerror = () => setStatusMessage('This image preview could not be decoded by your browser.');
      img.src = src;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      setTargetHeight(Math.round(val * (origHeight / origWidth)));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      setTargetWidth(Math.round(val * (origWidth / origHeight)));
    }
  };

  const handleVideoMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    setOrigWidth(width);
    setOrigHeight(height);
    setTargetWidth(width);
    setTargetHeight(height);
    setVideoDuration(video.duration || 0);

    const firstGoodFrame = Math.min(1, Math.max(0, video.duration ? video.duration * 0.05 : 0));
    setCaptureTime(firstGoodFrame);
    if (Number.isFinite(firstGoodFrame)) video.currentTime = firstGoodFrame;
  };

  const seekVideo = (time: number) => new Promise<void>((resolve, reject) => {
    const video = videoRef.current;
    if (!video) return reject(new Error('Video preview is not ready yet.'));

    const boundedTime = Math.min(Math.max(time, 0), Math.max(video.duration || 0, 0));
    if (Math.abs(video.currentTime - boundedTime) < 0.05) {
      resolve();
      return;
    }

    const done = () => {
      video.removeEventListener('seeked', done);
      resolve();
    };
    video.addEventListener('seeked', done, { once: true });
    video.currentTime = boundedTime;
  });

  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image preview for conversion.'));
    img.src = src;
  });

  const convertImage = async () => {
    if (!file || (sourceKind === 'image' && !imageSrc) || (sourceKind === 'video' && !videoSrc)) return;

    setConverting(true);
    setStatusMessage(sourceKind === 'video' ? 'Capturing video frame...' : 'Rendering image...');

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available in this browser.');

      const width = Math.max(1, Math.round(targetWidth || origWidth || 1280));
      const height = Math.max(1, Math.round(targetHeight || origHeight || 720));
      canvas.width = width;
      canvas.height = height;

      if (targetFormat === 'jpeg') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }

      if (sourceKind === 'video') {
        const video = videoRef.current;
        if (!video) throw new Error('Video preview is not ready yet.');
        await seekVideo(captureTime);
        ctx.drawImage(video, 0, 0, width, height);
      } else if (imageSrc) {
        const img = await loadImage(imageSrc);
        ctx.drawImage(img, 0, 0, width, height);
      }

      const mimeType = IMAGE_FORMAT_MIME[targetFormat];
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (output) => output ? resolve(output) : reject(new Error(`Your browser could not export ${targetFormat.toUpperCase()}.`)),
          mimeType,
          targetFormat === 'png' ? undefined : quality
        );
      });

      resetOutput();
      const url = URL.createObjectURL(blob);
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || (sourceKind === 'video' ? 'video-frame' : 'image');
      const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      setConvertedUrl(url);
      setConvertedSize(blob.size);
      setConvertedName(`${baseName}_${sourceKind === 'video' ? 'frame' : 'converted'}.${ext}`);
      setStatusMessage(sourceKind === 'video' ? 'Frame exported successfully.' : 'Image converted successfully.');
    } catch (error: any) {
      console.error('Image conversion error:', error);
      setStatusMessage(error.message || 'Image conversion failed.');
    } finally {
      setConverting(false);
    }
  };

  const canConvert = !!file && (sourceKind === 'video' ? !!videoSrc : !!imageSrc);

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 text-xl font-bold">
          <i className="fas fa-image"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Image & Video Frame Converter</h2>
          <p className="text-xs text-slate-400">Convert images or export MP4/WebM frames as PNG, JPEG, or WebP with custom dimensions</p>
        </div>
      </div>

      <div className="relative mb-6">
        <input
          type="file"
          accept="image/*,video/*,.svg,.webm,.mp4,.mov,.mkv,.avi,.3gp"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/60 rounded-2xl p-8 text-center transition-all">
          <i className={`fas ${sourceKind === 'video' && file ? 'fa-file-video' : 'fa-file-image'} text-4xl text-emerald-500/80 mb-3 animate-pulse`}></i>
          <h3 className="text-sm font-semibold text-slate-200">
            {file ? file.name : 'Drag & drop image or video file here, or click to upload'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports JPG, PNG, WebP, SVG plus MP4, MOV, and WebM frame export
          </p>
          {file && (
            <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono">
              <span>{(file.size / 1024).toFixed(1)} KB</span>
              {origWidth > 0 && origHeight > 0 && (
                <>
                  <span>*</span>
                  <span>{origWidth}x{origHeight} px</span>
                </>
              )}
              <span>*</span>
              <span>{sourceKind === 'video' ? 'Video frame' : 'Image'}</span>
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-300">
          <i className="fas fa-circle-info mr-2"></i>
          {statusMessage}
        </div>
      )}

      {canConvert && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[240px]">
            {sourceKind === 'video' && videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                playsInline
                onLoadedMetadata={handleVideoMetadata}
                className="max-h-64 w-full rounded-lg border border-slate-800 bg-black shadow-md"
              />
            ) : (
              <img
                src={imageSrc || ''}
                alt="Original preview"
                className="max-h-56 max-w-full object-contain rounded-lg border border-slate-800 shadow-md"
              />
            )}

            <p className="text-[11px] font-mono text-slate-500 mt-2">
              Source: {origWidth || 0} x {origHeight || 0} px ({file ? (file.size / 1024).toFixed(1) : 0} KB)
            </p>

            {sourceKind === 'video' && videoDuration > 0 && (
              <div className="mt-3 w-full space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>Frame timestamp</span>
                  <span className="font-mono text-emerald-400">{formatDuration(captureTime)} / {formatDuration(videoDuration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  value={captureTime}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setCaptureTime(next);
                    if (videoRef.current) videoRef.current.currentTime = next;
                  }}
                  className="w-full accent-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Export Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as ImageFormat)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {(['png', 'jpeg', 'webp'] as ImageFormat[]).map(format => (
                  <option key={format} value={format}>{IMAGE_FORMAT_LABELS[format]}</option>
                ))}
              </select>
            </div>

            {(targetFormat === 'jpeg' || targetFormat === 'webp') && (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Image Quality</span>
                  <span className="text-emerald-400 font-mono">{Math.round(quality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            )}

            {targetFormat === 'jpeg' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Background Color
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

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span>Output Dimensions (px)</span>
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`text-xs flex items-center gap-1 transition-colors ${lockAspect ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  <i className={`fas ${lockAspect ? 'fa-link' : 'fa-link-slash'}`}></i>
                  <span>Lock Ratio</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Width</label>
                  <input
                    type="number"
                    min={1}
                    value={targetWidth || ''}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Height</label>
                  <input
                    type="number"
                    min={1}
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

      <button
        onClick={convertImage}
        disabled={!canConvert || converting}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
      >
        {converting ? (
          <>
            <i className="fas fa-circle-notch fa-spin"></i>
            <span>{sourceKind === 'video' ? 'Exporting Frame...' : 'Converting Image...'}</span>
          </>
        ) : (
          <>
            <i className="fas fa-wand-magic-sparkles"></i>
            <span>{sourceKind === 'video' ? 'Export Video Frame' : 'Convert Image'} to .{targetFormat.toUpperCase()}</span>
          </>
        )}
      </button>

      {convertedUrl && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <i className="fas fa-check-circle"></i>
              <span>{sourceKind === 'video' ? 'Video Frame Exported!' : 'Image Converted Successfully!'}</span>
            </div>
            <span className="text-xs font-mono text-slate-400 truncate">{convertedName}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4 min-w-0">
              <img src={convertedUrl} alt="Converted preview" className="w-20 h-20 object-contain rounded-lg border border-slate-800 bg-slate-950" />
              <div>
                <p className="text-xs font-bold text-white">{targetWidth} x {targetHeight} px</p>
                <p className="text-xs font-mono text-emerald-400 font-semibold mt-0.5">
                  {(convertedSize / 1024).toFixed(1)} KB
                </p>
                {file && file.size > 0 && sourceKind === 'image' && (
                  <p className="text-[11px] text-slate-500">
                    {convertedSize < file.size
                      ? `Saved ${Math.round((1 - convertedSize / file.size) * 100)}% size`
                      : 'Size adjusted for selected quality'}
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
              <span>Download {sourceKind === 'video' ? 'Frame' : 'Image'}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
