'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'webm';
type ConverterTab = 'mp4-to-mp3' | 'audio-format';
type Mp3EncoderInstance = {
  encodeBuffer(left: Int16Array, right?: Int16Array): Uint8Array;
  flush(): Uint8Array;
};
type Mp3EncoderConstructor = new (channels: number, sampleRate: number, kbps: number) => Mp3EncoderInstance;
type LameJsRuntime = {
  Mp3Encoder: Mp3EncoderConstructor;
};
type LameJsWindow = Window & typeof globalThis & {
  lamejs?: LameJsRuntime;
};

interface ProgressState {
  phase: 'idle' | 'uploading' | 'decoding' | 'converting' | 'completed' | 'error';
  uploadPercent: number;   // 0–100 for file reading
  convertPercent: number;  // 0–100 for audio processing
  message: string;
}

const PHASE_COLORS: Record<ProgressState['phase'], string> = {
  idle: 'from-slate-600 to-slate-500',
  uploading: 'from-blue-600 to-cyan-500',
  decoding: 'from-violet-600 to-purple-500',
  converting: 'from-amber-500 to-orange-500',
  completed: 'from-emerald-500 to-green-400',
  error: 'from-red-600 to-rose-500',
};

const AUDIO_FORMAT_LABELS: Record<AudioFormat, string> = {
  mp3: 'MP3 - MPEG Audio (real .mp3)',
  wav: 'WAV - Uncompressed Audio',
  ogg: 'OGG - Opus Audio',
  webm: 'WebM - Opus Audio',
};

const AUDIO_FORMAT_MIME: Record<AudioFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg;codecs=opus',
  webm: 'audio/webm;codecs=opus',
};

let lamejsRuntimePromise: Promise<LameJsRuntime> | null = null;

function getBrowserLamejsRuntime(): LameJsRuntime | null {
  const runtime = (window as LameJsWindow).lamejs;
  return runtime?.Mp3Encoder ? runtime : null;
}

async function loadLamejsRuntime(): Promise<LameJsRuntime> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('MP3 encoder can only run in the browser.');
  }

  const loadedRuntime = getBrowserLamejsRuntime();
  if (loadedRuntime) return loadedRuntime;

  if (!lamejsRuntimePromise) {
    lamejsRuntimePromise = new Promise<LameJsRuntime>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-lamejs-runtime="true"]');
      const script = existingScript ?? document.createElement('script');

      const timeout = window.setTimeout(() => {
        reject(new Error('MP3 encoder script timed out while loading.'));
      }, 15000);

      const finish = () => {
        window.clearTimeout(timeout);
        const runtime = getBrowserLamejsRuntime();
        if (runtime) {
          resolve(runtime);
          return;
        }
        reject(new Error('MP3 encoder loaded without exposing Mp3Encoder.'));
      };

      const fail = () => {
        window.clearTimeout(timeout);
        reject(new Error('MP3 encoder script failed to load.'));
      };

      script.addEventListener('load', finish, { once: true });
      script.addEventListener('error', fail, { once: true });

      if (!existingScript) {
        script.src = '/vendor/lame.min.js';
        script.async = true;
        script.dataset.lamejsRuntime = 'true';
        document.head.appendChild(script);
      }
    }).catch((error: unknown) => {
      lamejsRuntimePromise = null;
      throw error;
    });
  }

  return lamejsRuntimePromise!;
}

export default function AudioConverter() {
  const [activeTab, setActiveTab] = useState<ConverterTab>('mp4-to-mp3');
  const [file, setFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3');
  const [bitrate, setBitrate] = useState<number>(320);
  const [channels, setChannels] = useState<'stereo' | 'mono'>('stereo');

  // Trimming state (in seconds)
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>('');

  const [progress, setProgress] = useState<ProgressState>({
    phase: 'idle',
    uploadPercent: 0,
    convertPercent: 0,
    message: '',
  });

  // Drag-over state
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const convertedAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const audioFormatOptions = ([
    { value: 'mp3' as const, supported: true, note: 'Best social/media compatibility' },
    { value: 'wav' as const, supported: true, note: 'Largest file, highest compatibility' },
    {
      value: 'ogg' as const,
      supported: typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(AUDIO_FORMAT_MIME.ogg),
      note: 'Browser-dependent Opus export',
    },
    {
      value: 'webm' as const,
      supported: typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(AUDIO_FORMAT_MIME.webm),
      note: 'Small Opus file for web use',
    },
  ]);

  useEffect(() => {
    const selected = audioFormatOptions.find(option => option.value === targetFormat);
    if (selected && !selected.supported) setTargetFormat('mp3');
  }, [targetFormat]);

  // ── Auto-play converted result ────────────────────────────────────────────
  useEffect(() => {
    if (!convertedUrl) return;
    const t = setTimeout(() => {
      convertedAudioRef.current?.play().catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [convertedUrl]);

  // ─── File Processing ──────────────────────────────────────────────────────

  const processFile = useCallback(async (selectedFile: File) => {
    const isAudioFile = selectedFile.type.startsWith('audio/') ||
      /\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i.test(selectedFile.name);
    const isVideoFile = selectedFile.type.startsWith('video/') ||
      /\.(mp4|mov|webm|mkv|avi|3gp)$/i.test(selectedFile.name);

    if (!isAudioFile && !isVideoFile) {
      setProgress({ phase: 'error', uploadPercent: 0, convertPercent: 0, message: '❌ Unsupported file type. Please upload an MP4, MOV, WEBM, MP3, WAV, OGG, or FLAC file.' });
      return;
    }

    setFile(selectedFile);
    setIsVideo(!!isVideoFile);
    setConvertedUrl(null);
    setAudioBuffer(null);

    // ── Create preview URL and set DIRECTLY on DOM refs ──────────────────────
    // The video/audio elements are always in the DOM (just hidden via CSS),
    // so refs are guaranteed valid — no React re-render timing issues at all.
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    const previewUrl = URL.createObjectURL(selectedFile);
    setMediaPreviewUrl(previewUrl);

    // Reset both players first
    if (videoRef.current) { videoRef.current.src = ''; videoRef.current.load(); }
    if (audioRef.current) { audioRef.current.src = ''; audioRef.current.load(); }

    // Set src directly on the correct element and play
    if (isVideoFile) {
      if (videoRef.current) {
        videoRef.current.src = previewUrl;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = previewUrl;
        audioRef.current.load();
        audioRef.current.play().catch(() => {});
      }
    }

    // ── Phase 1: Upload / Reading ──────────────────────────────────────────
    setProgress({ phase: 'uploading', uploadPercent: 0, convertPercent: 0, message: '📂 Reading file from disk...' });

    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(prev => ({
            ...prev,
            uploadPercent: pct,
            message: `📂 Loading file... ${pct}%`,
          }));
        }
      };

      reader.onload = (e) => {
        setProgress(prev => ({ ...prev, uploadPercent: 100, message: '✅ File loaded! Decoding audio...' }));
        resolve(e.target!.result as ArrayBuffer);
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(selectedFile);
    });

    // ── Phase 2: Decode Audio ──────────────────────────────────────────────
    setProgress(prev => ({
      ...prev,
      phase: 'decoding',
      convertPercent: 10,
      message: isVideoFile ? '🎬 Decoding video audio track...' : '🎵 Decoding audio data...',
    }));

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

      setAudioBuffer(decodedBuffer);
      setDuration(decodedBuffer.duration);
      setTrimStart(0);
      setTrimEnd(decodedBuffer.duration);
      setChannels(decodedBuffer.numberOfChannels > 1 ? 'stereo' : 'mono');

      drawWaveform(decodedBuffer);

      setProgress({
        phase: 'idle',
        uploadPercent: 100,
        convertPercent: 100,
        message: isVideoFile
          ? '🎉 Video audio track extracted! Configure options and click Convert below.'
          : '🎉 Audio loaded! Configure options and click Convert below.',
      });
    } catch (err: any) {
      console.error('Decode error:', err);
      setProgress({
        phase: 'error',
        uploadPercent: 100,
        convertPercent: 0,
        message: '❌ Could not decode media file. Make sure it contains a valid audio track.',
      });
    }
  }, [mediaPreviewUrl]);

  // ─── Drag & Drop ──────────────────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, [processFile]);

  // ─── Waveform Canvas ──────────────────────────────────────────────────────

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const rawData = buffer.getChannelData(0);
    const samples = 120;
    const blockSize = Math.floor(rawData.length / samples);
    const barWidth = width / samples - 2;

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j]);
      }
      const avg = sum / blockSize;
      const barHeight = Math.max(4, avg * height * 0.9);
      const x = i * (barWidth + 2);
      const y = (height - barHeight) / 2;

      const pos = (i / samples) * buffer.duration;
      const inRange = pos >= trimStart && pos <= (trimEnd || buffer.duration);
      ctx.fillStyle = inRange ? '#ef4444' : '#334155';
      ctx.fillRect(x, y, barWidth, barHeight);
    }
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (audioBuffer) drawWaveform(audioBuffer);
  }, [trimStart, trimEnd, audioBuffer]);

  // ─── Conversion ───────────────────────────────────────────────────────────

  const convertAudio = async () => {
    if (!audioBuffer || !file) return;

    setConvertedUrl(null);

    setProgress(prev => ({ ...prev, phase: 'converting', convertPercent: 15, message: '⚙️ Preparing audio buffer...' }));
    await delay(100);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const numChannels = channels === 'mono' ? 1 : Math.min(2, audioBuffer.numberOfChannels);

      const startSample = Math.floor(trimStart * audioBuffer.sampleRate);
      const endSample = Math.floor((trimEnd || audioBuffer.duration) * audioBuffer.sampleRate);
      const frameCount = Math.max(1, endSample - startSample);

      setProgress(prev => ({ ...prev, convertPercent: 30, message: '✂️ Trimming audio to selected range...' }));
      await delay(120);

      const trimmedBuffer = audioCtx.createBuffer(numChannels, frameCount, audioBuffer.sampleRate);
      for (let c = 0; c < numChannels; c++) {
        const src = audioBuffer.getChannelData(c % audioBuffer.numberOfChannels);
        const dst = trimmedBuffer.getChannelData(c);
        for (let i = 0; i < frameCount; i++) dst[i] = src[startSample + i] || 0;
      }

      setProgress(prev => ({ ...prev, convertPercent: 55, message: `🔄 Encoding to .${targetFormat.toUpperCase()} format...` }));
      await delay(150);

      const blob = await encodeAudioBlob(trimmedBuffer, targetFormat, bitrate);

      setProgress(prev => ({ ...prev, convertPercent: 90, message: '💾 Finalizing output file...' }));
      await delay(100);

      const url = URL.createObjectURL(blob);
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'media';
      const outName = `${baseName}_converted.${targetFormat}`;

      setConvertedUrl(url);
      setConvertedFileName(outName);
      setProgress({
        phase: 'completed',
        uploadPercent: 100,
        convertPercent: 100,
        message: `✅ Successfully converted to .${targetFormat.toUpperCase()}! Click Download below.`,
      });
    } catch (err: any) {
      console.error('Conversion error:', err);
      setProgress({
        phase: 'error',
        uploadPercent: 100,
        convertPercent: 0,
        message: '❌ Conversion failed: ' + (err.message || 'Unknown error'),
      });
    }
  };

  // ─── Audio Encoding Helpers ───────────────────────────────────────────────

  function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sr = buffer.sampleRate;
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const arrBuf = new ArrayBuffer(44 + dataLength);
    const view = new DataView(arrBuf);
    const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };

    str(0, 'RIFF'); view.setUint32(4, 36 + dataLength, true); str(8, 'WAVE');
    str(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true); view.setUint32(24, sr, true);
    view.setUint32(28, sr * blockAlign, true); view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true); str(36, 'data'); view.setUint32(40, dataLength, true);

    let off = 44;
    const ch: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) ch.push(buffer.getChannelData(c));
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const s = Math.max(-1, Math.min(1, ch[c][i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        off += 2;
      }
    }
    return new Blob([arrBuf], { type: AUDIO_FORMAT_MIME.wav });
  }

  async function encodeAudioBlob(buffer: AudioBuffer, format: AudioFormat, targetBitrate: number): Promise<Blob> {
    if (format === 'mp3') return audioBufferToMp3Blob(buffer, targetBitrate);
    if (format === 'wav') return audioBufferToWavBlob(buffer);
    return renderWithMediaRecorder(buffer, format, targetBitrate);
  }

  async function audioBufferToMp3Blob(buffer: AudioBuffer, targetBitrate: number): Promise<Blob> {
    const lamejs = await loadLamejsRuntime();
    const channelCount = Math.min(2, buffer.numberOfChannels);
    const encoder = new lamejs.Mp3Encoder(channelCount, buffer.sampleRate, targetBitrate);
    const blockSize = 1152;
    const left = floatTo16BitPcm(buffer.getChannelData(0));
    const right = channelCount === 2
      ? floatTo16BitPcm(buffer.getChannelData(buffer.numberOfChannels > 1 ? 1 : 0))
      : undefined;
    const chunks: Uint8Array[] = [];

    for (let i = 0; i < left.length; i += blockSize) {
      const leftChunk = left.subarray(i, i + blockSize);
      const encoded = right
        ? encoder.encodeBuffer(leftChunk, right.subarray(i, i + blockSize))
        : encoder.encodeBuffer(leftChunk);
      if (encoded.length > 0) chunks.push(encoded);
    }

    const flushed = encoder.flush();
    if (flushed.length > 0) chunks.push(flushed);

    const blobParts: BlobPart[] = chunks.map((chunk) => {
      const copy = new Uint8Array(chunk.byteLength);
      copy.set(chunk);
      return copy.buffer as ArrayBuffer;
    });

    return new Blob(blobParts, { type: AUDIO_FORMAT_MIME.mp3 });
  }

  function floatTo16BitPcm(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return output;
  }

  async function renderWithMediaRecorder(buffer: AudioBuffer, format: AudioFormat, targetBitrate: number): Promise<Blob> {
    const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();
    const targetMime = AUDIO_FORMAT_MIME[format];

    if (MediaRecorder.isTypeSupported(targetMime)) {
      try {
        const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = actx.createMediaStreamDestination();
        const node = new AudioBufferSourceNode(actx, { buffer: renderedBuffer });
        node.connect(dest);
        node.start();

        const recorder = new MediaRecorder(dest.stream, {
          mimeType: targetMime,
          audioBitsPerSecond: targetBitrate * 1000,
        });
        const chunks: Blob[] = [];
        return new Promise((resolve) => {
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => resolve(new Blob(chunks, { type: targetMime }));
          recorder.start();
          setTimeout(() => recorder.stop(), renderedBuffer.duration * 1000 + 500);
        });
      } catch (_) {
        return audioBufferToWavBlob(renderedBuffer);
      }
    }
    return audioBufferToWavBlob(renderedBuffer);
  }

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // ─── Computed helpers ─────────────────────────────────────────────────────

  const uploadBarWidth = progress.uploadPercent;
  const convertBarWidth = progress.convertPercent;
  const phaseColor = PHASE_COLORS[progress.phase] || PHASE_COLORS.idle;
  const isConverting = progress.phase === 'converting';
  const isDecoding = progress.phase === 'decoding';
  const isUploading = progress.phase === 'uploading';
  const showUploadBar = progress.phase !== 'idle' || progress.uploadPercent > 0;
  const showConvertBar = (progress.phase === 'converting' || progress.phase === 'completed' || progress.phase === 'decoding') && convertBarWidth > 0;

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 text-xl">
          <i className="fas fa-file-video" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">MP4 to MP3 &amp; Audio Converter</h2>
          <p className="text-xs text-slate-400">Upload video or audio · preview in-browser · export real MP3, WAV, OGG or WebM</p>
        </div>
      </div>

      {/* ── Mode Tabs ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
        {([
          { key: 'mp4-to-mp3', label: 'Video to MP3', icon: 'fa-file-video', color: 'text-amber-400', fmt: 'mp3' as AudioFormat },
          { key: 'audio-format', label: '🎵 Audio Format Converter', icon: 'fa-music', color: 'text-blue-400', fmt: undefined },
        ] as const).map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setActiveTab(tab.key); if (tab.fmt) setTargetFormat(tab.fmt); }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === tab.key
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fas ${tab.icon} ${tab.color}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
      <div
        className={`relative mb-6 rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? 'border-red-500 bg-red-500/10 scale-[1.01]'
            : 'border-slate-700 hover:border-red-500/50 bg-slate-950/60'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={activeTab === 'mp4-to-mp3' ? 'video/*,.mp4,.mov,.webm,.mkv,.avi,.3gp' : 'audio/*,video/*,.mp4,.mov,.webm,.mkv,.avi,.3gp'}
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="p-8 text-center pointer-events-none">
          <i className={`fas ${activeTab === 'mp4-to-mp3' ? 'fa-file-video text-amber-500' : 'fa-file-audio text-red-500'} text-4xl mb-3 block ${!file ? 'animate-pulse' : ''}`} />
          <h3 className="text-sm font-semibold text-slate-200">
            {file ? file.name : activeTab === 'mp4-to-mp3' ? 'Drag & Drop MP4 Video Here' : 'Drag & Drop Audio / Video File Here'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'mp4-to-mp3' ? 'Supports MP4, MOV, WEBM, MKV, AVI - exports real MP3' : 'Supports MP3, MP4, WAV, OGG, WebM, M4A, MOV'}
          </p>
          {file && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-mono">
              <i className="fas fa-file" />
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              <span>•</span>
              <span>{isVideo ? 'Video File' : 'Audio File'}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Upload Progress Bar ────────────────────────────────────────────── */}
      {showUploadBar && (
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              {isUploading ? <i className="fas fa-cloud-upload-alt text-blue-400 animate-pulse" /> : <i className="fas fa-check-circle text-emerald-400" />}
              {isUploading ? 'Uploading file...' : 'File loaded'}
            </span>
            <span className="font-mono text-slate-300">{uploadBarWidth}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                isUploading ? 'from-blue-600 to-cyan-400' : 'from-emerald-500 to-green-400'
              } transition-all duration-300`}
              style={{ width: `${uploadBarWidth}%` }}
            >
              {isUploading && (
                <div className="h-full w-full bg-white/20 animate-[shimmer_1s_linear_infinite] rounded-full" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Status Message ─────────────────────────────────────────────────── */}
      {progress.message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium mb-5 flex items-center gap-2 ${
            progress.phase === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : progress.phase === 'completed'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : progress.phase === 'idle' && progress.uploadPercent === 100
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          }`}
        >
          <i
            className={`fas text-sm ${
              progress.phase === 'error' ? 'fa-circle-exclamation' :
              progress.phase === 'completed' ? 'fa-circle-check' :
              progress.phase === 'idle' && progress.uploadPercent === 100 ? 'fa-circle-check' :
              'fa-circle-notch fa-spin'
            }`}
          />
          <span>{progress.message}</span>
        </div>
      )}

      {/* ── Media Preview Player — always in DOM, shown/hidden via CSS ─────── */}
      {/* Elements must always be rendered so refs are always valid (no timing race) */}
      <div className={`mb-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 transition-all duration-300 ${file ? 'opacity-100' : 'hidden'}`}>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <i className={`fas ${isVideo ? 'fa-video text-blue-400' : 'fa-music text-red-400'}`} />
            <span>Preview — {isVideo ? 'Video File' : 'Audio Track'}</span>
            {duration > 0 && <span className="ml-2 font-mono text-slate-500">{formatDuration(duration)}</span>}
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <i className="fas fa-circle text-[6px] animate-pulse" /> Live Preview
          </span>
        </div>

        {/* Video player — always mounted, shown only for video files */}
        <video
          ref={videoRef}
          controls
          playsInline
          className={`w-full max-h-64 rounded-xl bg-black border border-slate-700 ${isVideo && file ? 'block' : 'hidden'}`}
        />

        {/* Audio player — always mounted, shown only for audio files */}
        <audio
          ref={audioRef}
          controls
          className={`w-full h-10 rounded-lg ${!isVideo && file ? 'block' : 'hidden'}`}
        />
      </div>

      {/* ── Waveform & Trimmer ─────────────────────────────────────────────── */}
      {audioBuffer && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>🌊 Waveform &amp; Trim Selection</span>
            <span className="text-red-400">Selected: {formatDuration(trimEnd - trimStart)}</span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800">
            <canvas ref={canvasRef} width={800} height={100} className="w-full h-24 block bg-slate-950" />
          </div>
          <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Start: <span className="text-red-400 font-mono">{trimStart.toFixed(1)}s</span>
              </label>
              <input
                type="range" min={0} max={duration} step={0.1} value={trimStart}
                onChange={(e) => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 0.5))}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                End: <span className="text-red-400 font-mono">{trimEnd.toFixed(1)}s</span>
              </label>
              <input
                type="range" min={0} max={duration} step={0.1} value={trimEnd}
                onChange={(e) => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 0.5))}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Conversion Options ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Output Format</label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as AudioFormat)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
          >
            {audioFormatOptions.map(option => (
              <option key={option.value} value={option.value} disabled={!option.supported}>
                {AUDIO_FORMAT_LABELS[option.value]}{option.supported ? ` (${option.note})` : ' - not supported in this browser'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bitrate Quality</label>
          <select
            value={bitrate}
            onChange={(e) => setBitrate(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
          >
            <option value={320}>320 kbps — Studio HD Max</option>
            <option value={256}>256 kbps — Very High</option>
            <option value={192}>192 kbps — High Quality</option>
            <option value={128}>128 kbps — Standard</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Audio Channels</label>
          <select
            value={channels}
            onChange={(e) => setChannels(e.target.value as 'stereo' | 'mono')}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
          >
            <option value="stereo">Stereo (2 Channels)</option>
            <option value="mono">Mono (1 Channel)</option>
          </select>
        </div>
      </div>

      {/* ── Convert Button ─────────────────────────────────────────────────── */}
      <button
        onClick={convertAudio}
        disabled={!audioBuffer || isConverting || isDecoding}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-5"
      >
        {isConverting ? (
          <>
            <i className="fas fa-arrows-rotate fa-spin" />
            <span>Converting... {convertBarWidth}%</span>
          </>
        ) : (
          <>
            <i className="fas fa-bolt text-amber-300" />
            <span>
              {isVideo
                ? `Extract Video Audio to .${targetFormat.toUpperCase()}`
                : `Convert Audio to .${targetFormat.toUpperCase()}`}
            </span>
          </>
        )}
      </button>

      {/* ── Conversion Progress Bar ────────────────────────────────────────── */}
      {showConvertBar && (
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-semibold flex items-center gap-1.5 ${isConverting ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isConverting ? (
                <><i className="fas fa-cog fa-spin" /> Converting audio...</>
              ) : isDecoding ? (
                <><i className="fas fa-microchip fa-spin text-violet-400" /> Decoding media...</>
              ) : (
                <><i className="fas fa-check-circle text-emerald-400" /> Conversion complete!</>
              )}
            </span>
            <span className={`font-mono font-bold ${isConverting ? 'text-amber-300' : 'text-emerald-300'}`}>
              {convertBarWidth}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${phaseColor} transition-all duration-500 relative overflow-hidden`}
              style={{ width: `${convertBarWidth}%` }}
            >
              {isConverting && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.2s linear infinite',
                  }}
                />
              )}
            </div>
          </div>

          {/* Conversion step indicators */}
          {(isConverting || progress.phase === 'completed') && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {[
                { label: 'Prepare', threshold: 20 },
                { label: 'Trim', threshold: 40 },
                { label: 'Encode', threshold: 65 },
                { label: 'Finalize', threshold: 90 },
                { label: 'Done', threshold: 100 },
              ].map((step) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                    convertBarWidth >= step.threshold
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : convertBarWidth > step.threshold - 25
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {convertBarWidth >= step.threshold ? (
                    <i className="fas fa-check text-[8px]" />
                  ) : convertBarWidth > step.threshold - 25 ? (
                    <i className="fas fa-spinner fa-spin text-[8px]" />
                  ) : (
                    <i className="fas fa-circle text-[6px]" />
                  )}
                  {step.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Converted File Player & Download ──────────────────────────────── */}
      {convertedUrl && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-4 animate-[fadeIn_0.4s_ease]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <i className="fas fa-check-circle" />
              <span>Converted Audio Ready</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{convertedFileName}</span>
          </div>

          <audio
            ref={convertedAudioRef}
            controls
            src={convertedUrl}
            className="w-full rounded-lg bg-slate-900"
          />

          <a
            href={convertedUrl}
            download={convertedFileName}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <i className="fas fa-download" />
            <span>Download .{targetFormat.toUpperCase()} Audio</span>
          </a>
        </div>
      )}

      {/* shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
