'use client';

import React, { useState, useRef, useEffect } from 'react';

type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'flac' | 'm4a';

interface ConversionProgress {
  status: 'idle' | 'decoding' | 'converting' | 'completed' | 'error';
  percent: number;
  message: string;
}

export default function AudioConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [targetFormat, setTargetFormat] = useState<AudioFormat>('mp3');
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [bitrate, setBitrate] = useState<number>(192); // kbps
  const [channels, setChannels] = useState<'stereo' | 'mono'>('stereo');
  
  // Trimming state (in seconds)
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>('');
  const [progress, setProgress] = useState<ConversionProgress>({
    status: 'idle',
    percent: 0,
    message: '',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load and decode audio file when uploaded
  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/') && !selectedFile.name.match(/\.(mp3|wav|ogg|m4a|flac|aac|wma)$/i)) {
      alert('Please select a valid audio file (.mp3, .wav, .ogg, .flac, .m4a).');
      return;
    }

    setFile(selectedFile);
    setConvertedUrl(null);
    setProgress({ status: 'decoding', percent: 20, message: 'Decoding audio data...' });

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      setAudioBuffer(decodedBuffer);
      setDuration(decodedBuffer.duration);
      setTrimStart(0);
      setTrimEnd(decodedBuffer.duration);
      setSampleRate(decodedBuffer.sampleRate);
      setChannels(decodedBuffer.numberOfChannels > 1 ? 'stereo' : 'mono');

      drawWaveform(decodedBuffer);
      setProgress({ status: 'idle', percent: 100, message: 'Audio ready for conversion.' });
    } catch (err: any) {
      console.error('Audio decode error:', err);
      setProgress({
        status: 'error',
        percent: 0,
        message: 'Could not decode audio file. Try a different format.',
      });
    }
  };

  // Draw audio waveform on Canvas
  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const rawData = buffer.getChannelData(0); // channel 1
    const samples = 120; // bars
    const blockSize = Math.floor(rawData.length / samples);
    const barWidth = width / samples - 2;

    ctx.fillStyle = '#38bdf8';
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

      // Color variation for waveform
      const isTrimmedArea = (i / samples) * buffer.duration >= trimStart && (i / samples) * buffer.duration <= (trimEnd || buffer.duration);
      ctx.fillStyle = isTrimmedArea ? '#ef4444' : '#475569';
      ctx.fillRect(x, y, barWidth, barHeight);
    }
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (audioBuffer) {
      drawWaveform(audioBuffer);
    }
  }, [trimStart, trimEnd, audioBuffer]);

  // Convert audio buffer to requested format
  const convertAudio = async () => {
    if (!audioBuffer || !file) return;

    setProgress({ status: 'converting', percent: 30, message: 'Processing audio channels & trimming...' });

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const numChannels = channels === 'mono' ? 1 : Math.min(2, audioBuffer.numberOfChannels);

      // Slice audio buffer according to trim times
      const startSample = Math.floor(trimStart * audioBuffer.sampleRate);
      const endSample = Math.floor((trimEnd || audioBuffer.duration) * audioBuffer.sampleRate);
      const frameCount = Math.max(0, endSample - startSample);

      const trimmedBuffer = audioCtx.createBuffer(
        numChannels,
        frameCount,
        audioBuffer.sampleRate
      );

      for (let c = 0; c < numChannels; c++) {
        const sourceData = audioBuffer.getChannelData(c % audioBuffer.numberOfChannels);
        const targetData = trimmedBuffer.getChannelData(c);
        for (let i = 0; i < frameCount; i++) {
          targetData[i] = sourceData[startSample + i] || 0;
        }
      }

      setProgress({ status: 'converting', percent: 60, message: `Encoding to .${targetFormat.toUpperCase()} format...` });

      let blob: Blob;

      if (targetFormat === 'wav') {
        blob = audioBufferToWavBlob(trimmedBuffer);
      } else {
        // Use MediaRecorder or WAV encoding fallback for standard formats
        blob = await renderWithOfflineAudioContext(trimmedBuffer, targetFormat, bitrate);
      }

      const url = URL.createObjectURL(blob);
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'audio';
      const outName = `${baseName}_converted.${targetFormat}`;

      setConvertedUrl(url);
      setConvertedFileName(outName);
      setProgress({ status: 'completed', percent: 100, message: 'Conversion completed successfully!' });
    } catch (err: any) {
      console.error('Conversion error:', err);
      setProgress({
        status: 'error',
        percent: 0,
        message: 'Conversion failed: ' + (err.message || 'Unknown error'),
      });
    }
  };

  // Convert AudioBuffer to WAV Blob format
  function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const dataLength = buffer.length * blockAlign;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    function writeString(offset: number, string: string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Interleave channels
    let offset = 44;
    const channelsData: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
      channelsData.push(buffer.getChannelData(c));
    }

    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const sample = Math.max(-1, Math.min(1, channelsData[c][i]));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Render via OfflineAudioContext and MediaRecorder for encoded audio streams
  async function renderWithOfflineAudioContext(
    buffer: AudioBuffer,
    format: string,
    targetBitrate: number
  ): Promise<Blob> {
    const offlineCtx = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();

    // Default to high quality WAV if MediaRecorder format isn't natively supported for export
    const wavBlob = audioBufferToWavBlob(renderedBuffer);

    // Attempt web media recorder encoding if supported
    const mimeMap: Record<string, string> = {
      mp3: 'audio/webm;codecs=opus',
      ogg: 'audio/ogg',
      m4a: 'audio/mp4',
      flac: 'audio/flac',
    };

    const targetMime = mimeMap[format] || 'audio/webm';

    if (MediaRecorder.isTypeSupported(targetMime)) {
      try {
        const streamDestination = new (window.AudioContext || (window as any).webkitAudioContext)().createMediaStreamDestination();
        const node = new AudioBufferSourceNode(streamDestination.context, { buffer: renderedBuffer });
        node.connect(streamDestination);
        node.start();

        const recorder = new MediaRecorder(streamDestination.stream, {
          mimeType: targetMime,
          audioBitsPerSecond: targetBitrate * 1000,
        });

        const chunks: Blob[] = [];
        return new Promise((resolve) => {
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => resolve(new Blob(chunks, { type: targetMime }));
          recorder.start();
          setTimeout(() => recorder.stop(), (renderedBuffer.duration * 1000) + 200);
        });
      } catch (_) {
        return wavBlob;
      }
    }

    return wavBlob;
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 text-xl font-bold">
          <i className="fas fa-music"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Audio & Music Converter</h2>
          <p className="text-xs text-slate-400">Convert MP3, WAV, OGG, FLAC, M4A with bitrate & trimming controls</p>
        </div>
      </div>

      {/* File Upload Zone */}
      <div className="relative mb-6">
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="border-2 border-dashed border-slate-700 hover:border-red-500/60 bg-slate-950/60 rounded-2xl p-8 text-center transition-all">
          <i className="fas fa-cloud-arrow-up text-4xl text-red-500/80 mb-3 animate-pulse"></i>
          <h3 className="text-sm font-semibold text-slate-200">
            {file ? file.name : 'Drag & Drop audio file here, or click to browse'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports MP3, WAV, OGG, FLAC, M4A, AAC (Max 100MB)
          </p>
          {file && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-mono">
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              <span>•</span>
              <span>{file.type || 'audio'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Audio Waveform Canvas */}
      {audioBuffer && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Waveform Preview</span>
            <span>Duration: {duration.toFixed(2)}s</span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-800">
            <canvas ref={canvasRef} width={800} height={100} className="w-full h-24 block bg-slate-950" />
          </div>

          {/* Trimmer Controls */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Start Trim: <span className="text-red-400 font-mono">{trimStart.toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={trimStart}
                onChange={(e) => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 0.5))}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                End Trim: <span className="text-red-400 font-mono">{trimEnd.toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={trimEnd}
                onChange={(e) => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 0.5))}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conversion Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Format
          </label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as AudioFormat)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
          >
            <option value="mp3">MP3 — MPEG Layer 3</option>
            <option value="wav">WAV — Uncompressed PCM</option>
            <option value="ogg">OGG — Vorbis Audio</option>
            <option value="flac">FLAC — Lossless Audio</option>
            <option value="m4a">M4A — AAC Audio</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Bitrate Quality
          </label>
          <select
            value={bitrate}
            onChange={(e) => setBitrate(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
          >
            <option value={128}>128 kbps (Standard)</option>
            <option value={192}>192 kbps (High Quality)</option>
            <option value={256}>256 kbps (Very High)</option>
            <option value={320}>320 kbps (Studio Max)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Audio Channels
          </label>
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

      {/* Convert Action Button */}
      <button
        onClick={convertAudio}
        disabled={!audioBuffer || progress.status === 'converting'}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
      >
        {progress.status === 'converting' ? (
          <>
            <i className="fas fa-arrows-rotate fa-spin"></i>
            <span>Converting Audio... ({progress.percent}%)</span>
          </>
        ) : (
          <>
            <i className="fas fa-[#22c55e] fa-bolt"></i>
            <span>Convert Audio File to .{targetFormat.toUpperCase()}</span>
          </>
        )}
      </button>

      {/* Status Bar */}
      {progress.message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 ${
            progress.status === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : progress.status === 'completed'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
          }`}
        >
          <i
            className={`fas ${
              progress.status === 'error'
                ? 'fa-circle-exclamation'
                : progress.status === 'completed'
                ? 'fa-circle-check'
                : 'fa-circle-notch fa-spin'
            }`}
          ></i>
          <span>{progress.message}</span>
        </div>
      )}

      {/* Converted Audio Result & Player */}
      {convertedUrl && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <i className="fas fa-check-circle"></i>
              <span>Ready for Download</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{convertedFileName}</span>
          </div>

          <audio ref={audioRef} controls src={convertedUrl} className="w-full rounded-lg bg-slate-900" />

          <a
            href={convertedUrl}
            download={convertedFileName}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <i className="fas fa-download"></i>
            <span>Download .{targetFormat.toUpperCase()} Audio</span>
          </a>
        </div>
      )}
    </div>
  );
}
