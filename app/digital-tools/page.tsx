'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';
import AudioConverter from '@/components/digital-tools/AudioConverter';
import MusicFinder from '@/components/digital-tools/MusicFinder';
import ImageConverter from '@/components/digital-tools/ImageConverter';
import DocumentConverter from '@/components/digital-tools/DocumentConverter';
import FileMetadataInspector from '@/components/digital-tools/FileMetadataInspector';
import ImageBackgroundRemover from '@/components/digital-tools/ImageBackgroundRemover';
import { BRAND_AVATAR_TRANSPARENT_SRC, BRAND_NAME } from '@/lib/brand';

type ToolCategory = 'all' | 'image' | 'pdf' | 'audio' | 'utilities';

interface ToolItem {
  id: string;
  title: string;
  desc: string;
  category: ToolCategory;
  badge?: string;
  popular?: boolean;
  isNew?: boolean;
  icon: string;
  gradient: string;
  tags: string[];
}

const ALL_TOOLS: ToolItem[] = [
  {
    id: 'bg-remover',
    title: 'Remove Image Background',
    desc: 'AI background eraser with high accuracy, edge feathering, solid colors & studio gradients.',
    category: 'image',
    badge: 'AI High Accuracy',
    popular: true,
    isNew: true,
    icon: 'fas fa-wand-magic-sparkles',
    gradient: 'from-cyan-500 to-blue-600',
    tags: ['background', 'remove', 'transparent', 'png', 'erase', 'cutout', 'photo', 'portrait', 'id'],
  },
  {
    id: 'forensics',
    title: 'AI Forensic & Deepfake Inspector',
    desc: 'Error Level Analysis (ELA), AI diffusion pattern detector, EXIF camera tags & GPS maps.',
    category: 'image',
    badge: 'Forensic Standard',
    popular: true,
    icon: 'fas fa-fingerprint',
    gradient: 'from-emerald-500 to-teal-600',
    tags: ['forensics', 'exif', 'deepfake', 'ai detector', 'metadata', 'gps', 'ela', 'camera', 'fake'],
  },
  {
    id: 'audio-converter',
    title: 'Video & Audio to MP3 Converter',
    desc: 'Extract and convert MP4, WebM, WAV, OGG, M4A to pure 320kbps MP3 audio.',
    category: 'audio',
    badge: 'Fast',
    popular: true,
    icon: 'fas fa-music',
    gradient: 'from-red-500 to-rose-600',
    tags: ['mp3', 'audio', 'video to mp3', 'wav', 'ogg', 'convert', 'extract', 'sound', 'trim'],
  },
  {
    id: 'image-converter',
    title: 'Image Converter & Video Frame Grabber',
    desc: 'Convert JPG, PNG, WEBP, SVG, resize with aspect ratio lock, and capture high-res video frames.',
    category: 'image',
    badge: 'HD Quality',
    icon: 'fas fa-image',
    gradient: 'from-blue-500 to-indigo-600',
    tags: ['image', 'convert', 'resize', 'compress', 'jpg', 'png', 'webp', 'svg', 'frame', 'video'],
  },
  {
    id: 'doc-converter',
    title: 'Word DOCX & Text to PDF Converter',
    desc: 'Convert Word .docx, markdown, and text documents into clean printable PDF files.',
    category: 'pdf',
    badge: 'Essential',
    popular: true,
    icon: 'fas fa-file-pdf',
    gradient: 'from-purple-500 to-violet-600',
    tags: ['pdf', 'word', 'docx', 'document', 'convert', 'text to pdf', 'print'],
  },
  {
    id: 'music-finder',
    title: 'Royalty-Free Music & Audio Finder',
    desc: 'Search, preview, and download thousands of high-quality creative tracks and beats.',
    category: 'audio',
    badge: 'Free Music',
    icon: 'fas fa-headphones',
    gradient: 'from-amber-500 to-orange-600',
    tags: ['music', 'song', 'royalty free', 'beats', 'audio', 'download', 'preview'],
  },
  {
    id: 'qr-generator',
    title: 'HD QR Code Generator',
    desc: 'Create custom high-resolution QR codes for websites, WiFi, WhatsApp, and contact cards.',
    category: 'utilities',
    badge: 'Instant',
    icon: 'fas fa-qrcode',
    gradient: 'from-amber-500 to-yellow-500',
    tags: ['qr', 'qrcode', 'generator', 'wifi', 'url', 'barcode'],
  },
  {
    id: 'tts-engine',
    title: 'Natural Voice Text-to-Speech',
    desc: 'Convert written text into natural human speech with adjustable pitch, speed, and accents.',
    category: 'audio',
    badge: 'Natural Voice',
    icon: 'fas fa-volume-high',
    gradient: 'from-teal-500 to-cyan-600',
    tags: ['tts', 'text to speech', 'voice', 'audio', 'read', 'speech'],
  },
  {
    id: 'password-gen',
    title: 'Cryptographic Password Generator',
    desc: 'Generate ultra-secure, cryptographically random passwords with custom symbols and length.',
    category: 'utilities',
    badge: 'Secure',
    icon: 'fas fa-key',
    gradient: 'from-rose-500 to-pink-600',
    tags: ['password', 'generator', 'security', 'crypto', 'random', 'pin'],
  },
  {
    id: 'color-palette',
    title: 'Color Palette & Shade Studio',
    desc: 'Generate harmonious color palettes, monochromatic tints, and complementary Hex/HSL codes.',
    category: 'utilities',
    badge: 'Design',
    icon: 'fas fa-palette',
    gradient: 'from-purple-500 to-pink-500',
    tags: ['color', 'palette', 'hex', 'hsl', 'designer', 'scheme', 'picker'],
  },
  {
    id: 'text-analyzer',
    title: 'Word Count & Text Statistics',
    desc: 'Detailed word count, reading time estimate, character statistics, and frequency analytics.',
    category: 'utilities',
    badge: 'Analytics',
    icon: 'fas fa-align-left',
    gradient: 'from-indigo-500 to-blue-500',
    tags: ['word count', 'text', 'reading time', 'characters', 'analyzer', 'sentences'],
  },
];

// ── Password Generator ─────────────────────────────────────────────────────────
function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(0);

  const generate = useCallback(() => {
    let chars = '';
    if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { setPassword('Select at least one character type!'); return; }

    let pwd = '';
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) {
      pwd += chars[arr[i] % chars.length];
    }
    setPassword(pwd);
    setCopied(false);

    const score = [upper, lower, numbers, symbols].filter(Boolean).length;
    setStrength(Math.min(4, score + (length >= 20 ? 1 : 0)));
  }, [length, upper, lower, numbers, symbols]);

  useEffect(() => { generate(); }, [generate]);

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength - 1] || '';
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-blue-500'][strength - 1] || 'bg-slate-700';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-lg font-bold">
          <i className="fas fa-key"></i>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Cryptographic Password Generator</h3>
          <p className="text-xs text-slate-400">Generate high-entropy, cryptographically randomized passwords.</p>
        </div>
      </div>

      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-4 pr-24 font-mono text-base text-emerald-400 break-all min-h-[56px] flex items-center shadow-inner">
        <span>{password}</span>
        <button
          onClick={copy}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all shadow-md ${
            copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      {strength > 0 && (
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-800'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-400">Strength: <span className="text-white font-bold">{strengthLabel}</span></p>
        </div>
      )}

      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
          <span>Password Length</span>
          <span className="text-amber-400 font-mono font-bold text-sm">{length} characters</span>
        </div>
        <input type="range" min={8} max={64} value={length} onChange={e => setLength(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer" />
      </div>

      <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        {[
          { label: 'Uppercase (A–Z)', val: upper, set: setUpper },
          { label: 'Lowercase (a–z)', val: lower, set: setLower },
          { label: 'Numbers (0–9)', val: numbers, set: setNumbers },
          { label: 'Symbols (!@#$%)', val: symbols, set: setSymbols },
        ].map(({ label, val, set }) => (
          <label key={label} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input type="checkbox" checked={val} onChange={e => set(e.target.checked)}
              className="accent-amber-500 rounded w-4 h-4" />
            {label}
          </label>
        ))}
      </div>

      <button onClick={generate}
        className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-500 hover:opacity-90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg">
        <i className="fas fa-arrows-rotate"></i>
        <span>Generate New Password</span>
      </button>
    </div>
  );
}

// ── Color Palette Generator ────────────────────────────────────────────────────
function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#06b6d4');
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedColor, setCopiedColor] = useState('');

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0, s = 0, l = (max+min)/2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) { case r: h=(g-b)/d+(g<b?6:0); break; case g: h=(b-r)/d+2; break; case b: h=(r-g)/d+4; break; }
      h /= 6;
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1-l);
    const f = (n: number) => {
      const k = (n + h/30) % 12;
      const c = l - a * Math.max(-1, Math.min(k-3, 9-k, 1));
      return Math.round(255*c).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generatePalette = useCallback(() => {
    const [h, s, l] = hexToHsl(baseColor);
    const shades = [
      hslToHex(h, s, Math.min(95, l + 40)),
      hslToHex(h, s, Math.min(85, l + 25)),
      hslToHex(h, s, Math.min(75, l + 15)),
      baseColor,
      hslToHex(h, s, Math.max(20, l - 15)),
      hslToHex(h, s, Math.max(10, l - 30)),
      hslToHex(h, s, Math.max(5,  l - 45)),
      hslToHex((h + 30) % 360, s, l),
      hslToHex((h + 60) % 360, s, l),
      hslToHex((h + 180) % 360, s, l),
    ];
    setPalette(shades);
  }, [baseColor]);

  useEffect(() => { generatePalette(); }, [generatePalette]);

  const copy = async (c: string) => {
    await navigator.clipboard.writeText(c);
    setCopiedColor(c);
    setTimeout(() => setCopiedColor(''), 1500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg font-bold">
          <i className="fas fa-palette"></i>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Color Palette &amp; Shade Studio</h3>
          <p className="text-xs text-slate-400">Generate tints, shades, and complementary color schemes.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)}
          className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0" />
        <div>
          <p className="text-xs font-semibold text-slate-300">Selected Base Color</p>
          <p className="text-sm font-mono font-black text-cyan-400">{baseColor.toUpperCase()}</p>
        </div>
        <button onClick={generatePalette}
          className="ml-auto py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md">
          <i className="fas fa-wand-magic-sparkles"></i>
          <span>Regenerate</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {palette.map((color, i) => (
          <button key={i} onClick={() => copy(color)}
            className="group relative rounded-2xl overflow-hidden border border-slate-800 transition-all hover:scale-105 hover:shadow-xl text-left">
            <div className="h-16 w-full" style={{ backgroundColor: color }} />
            <div className="bg-slate-950 p-2.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase">{color}</span>
              <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">
                {copiedColor === color ? '✓ Copied' : 'Copy'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Text-to-Speech ─────────────────────────────────────────────────────────────
function TextToSpeech() {
  const [text, setText] = useState('Welcome to BridgeTech IT Services Digital Products Hub. All utilities are 100% free and run directly inside your browser.');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length) {
        setVoices(available);
        const naturalVoice = available.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en')) || available[0];
        if (naturalVoice && !selectedVoice) setSelectedVoice(naturalVoice.voiceURI || naturalVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoice]);

  const speak = () => {
    if (!text.trim() || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const chosen = voices.find(v => (v.voiceURI || v.name) === selectedVoice);
    if (chosen) utterance.voice = chosen;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = () => { setIsSpeaking(false); setIsPaused(false); };

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resume = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stop = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg font-bold">
          <i className="fas fa-volume-high"></i>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Natural Voice Text-to-Speech Engine</h3>
          <p className="text-xs text-slate-400">Convert any text to realistic human speech with voice controls.</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="Type or paste text to speak..."
        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors resize-none"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Voice Accent</label>
          <select
            value={selectedVoice}
            onChange={e => setSelectedVoice(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
          >
            {voices.map(v => (
              <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-1">
            <span>Speed</span>
            <span className="text-teal-400">{rate}x</span>
          </div>
          <input type="range" min={0.5} max={1.5} step={0.05} value={rate} onChange={e => setRate(Number(e.target.value))}
            className="w-full accent-teal-500" />
        </div>
        <div>
          <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase mb-1">
            <span>Pitch</span>
            <span className="text-teal-400">{pitch}x</span>
          </div>
          <input type="range" min={0.6} max={1.4} step={0.05} value={pitch} onChange={e => setPitch(Number(e.target.value))}
            className="w-full accent-teal-500" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {!isSpeaking ? (
          <button onClick={speak}
            className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
            <i className="fas fa-play"></i>
            <span>Speak Text</span>
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button onClick={pause}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                <i className="fas fa-pause"></i>
                <span>Pause</span>
              </button>
            ) : (
              <button onClick={resume}
                className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md">
                <i className="fas fa-play"></i>
                <span>Resume</span>
              </button>
            )}
            <button onClick={stop}
              className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700">
              <i className="fas fa-stop"></i>
              <span>Stop</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Text Analyzer ──────────────────────────────────────────────────────────────
function TextAnalyzer() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = trimmed ? (text.match(/[^.!?]+[.!?]+/g) || [text]).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0;
    const readTimeMinutes = Math.ceil(words / 200);

    return { words, chars, charsNoSpaces, sentences, paragraphs, readTimeMinutes };
  }, [text]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg font-bold">
          <i className="fas fa-align-left"></i>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Word Count &amp; Text Statistics</h3>
          <p className="text-xs text-slate-400">Detailed character metrics, word frequency, and reading time estimation.</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        placeholder="Paste article, essay, or copy here to analyze..."
        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
      />

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
        {[
          { label: 'Words', val: stats.words, color: 'text-indigo-400' },
          { label: 'Characters', val: stats.chars, color: 'text-blue-400' },
          { label: 'No Spaces', val: stats.charsNoSpaces, color: 'text-cyan-400' },
          { label: 'Sentences', val: stats.sentences, color: 'text-emerald-400' },
          { label: 'Paragraphs', val: stats.paragraphs, color: 'text-purple-400' },
          { label: 'Reading Time', val: `${stats.readTimeMinutes} min`, color: 'text-amber-400' },
        ].map((item) => (
          <div key={item.label} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">{item.label}</span>
            <span className={`text-lg font-black ${item.color}`}>{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN TINYWOW-STYLE DIGITAL TOOLS HUB ────────────────────────────────────────
export default function DigitalToolsPage() {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // QR Code generator state
  const [qrText, setQrText] = useState('https://www.itservicesfreetown.com/digital-tools');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Dark body background — matches page theme, prevents grey gap above global footer
  useEffect(() => {
    const body = document.body;
    body.style.backgroundColor = '#020617'; // slate-950
    return () => { body.style.backgroundColor = ''; };
  }, []);

  // Handle URL hash routing

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.toLowerCase().replace('#', '');
    if (!hash) return;

    if (hash.includes('bg') || hash.includes('background')) {
      setActiveToolId('bg-remover');
    } else if (hash.includes('meta') || hash.includes('forensic') || hash.includes('exif')) {
      setActiveToolId('forensics');
    } else if (hash.includes('audio') || hash.includes('mp3')) {
      setActiveToolId('audio-converter');
    } else if (hash.includes('image') || hash.includes('resize')) {
      setActiveToolId('image-converter');
    } else if (hash.includes('doc') || hash.includes('pdf')) {
      setActiveToolId('doc-converter');
    } else if (hash.includes('music')) {
      setActiveToolId('music-finder');
    } else if (hash.includes('qr')) {
      setActiveToolId('qr-generator');
    } else if (hash.includes('tts') || hash.includes('speech')) {
      setActiveToolId('tts-engine');
    } else if (hash.includes('password')) {
      setActiveToolId('password-gen');
    } else if (hash.includes('color') || hash.includes('palette')) {
      setActiveToolId('color-palette');
    } else if (hash.includes('text') || hash.includes('analyzer')) {
      setActiveToolId('text-analyzer');
    }
  }, []);

  // Generate QR code
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(qrText.trim() || ' ', {
      width: 420,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#040e40', light: '#ffffff' },
    }).then((url) => {
      if (active) setQrDataUrl(url);
    }).catch(() => {
      if (active) setQrDataUrl('');
    });

    return () => { active = false; };
  }, [qrText]);

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tool.title.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

  const activeToolObj = ALL_TOOLS.find(t => t.id === activeToolId);

  return (
    <div className="bg-slate-950 text-white selection:bg-cyan-500 selection:text-black pb-16">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-xs font-semibold tracking-wide transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Back to BridgeTech Main Site</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              100% Free Tools Hub
            </span>
          </div>
        </div>

        {/* Hero Section (TinyWow Style) */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 border border-slate-800 rounded-full text-xs font-bold text-slate-300 mb-4 shadow-xl">
            <i className="fas fa-wand-magic-sparkles text-cyan-400"></i>
            <span>All-in-One Online Media &amp; File Toolkit</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Free Digital Tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">For Everyone</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
            Remove image backgrounds, convert video to MP3, inspect AI &amp; EXIF metadata, convert documents to PDF, generate QR codes, and run everyday utilities with zero limits.
          </p>

          {/* Trust Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-1.5">
              <i className="fas fa-circle-check text-emerald-400"></i>
              <span>100% Free Forever</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <i className="fas fa-lock text-cyan-400"></i>
              <span>No Sign-Up Required</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <i className="fas fa-shield-halved text-purple-400"></i>
              <span>Private On-Device Execution</span>
            </div>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative shadow-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 11+ digital tools (e.g. remove background, mp3, pdf, qr, deepfake)..."
              className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
            />
            <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base"></i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl mx-auto">
          {[
            { id: 'all',       label: '🔥 All Tools',        count: ALL_TOOLS.length },
            { id: 'image',     label: '🖼️ Image Tools',     count: ALL_TOOLS.filter(t => t.category === 'image').length },
            { id: 'pdf',       label: '📄 PDF & Docs',       count: ALL_TOOLS.filter(t => t.category === 'pdf').length },
            { id: 'audio',     label: '🎵 Audio & Speech',   count: ALL_TOOLS.filter(t => t.category === 'audio').length },
            { id: 'utilities', label: '🛠️ Utilities',        count: ALL_TOOLS.filter(t => t.category === 'utilities').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as ToolCategory);
                setActiveToolId(null);
              }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === tab.id
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === tab.id ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── ACTIVE FOCUSED WORKSPACE (When a tool is opened) ── */}
        {activeToolId && (
          <div className="mb-14 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm bg-gradient-to-tr ${activeToolObj?.gradient}`}>
                  <i className={activeToolObj?.icon}></i>
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">{activeToolObj?.title}</h3>
                  <p className="text-xs text-slate-400">{activeToolObj?.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveToolId(null)}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <i className="fas fa-grid-2"></i>
                <span>Browse All Tools</span>
              </button>
            </div>

            {/* Render Selected Tool Component */}
            {activeToolId === 'bg-remover' && <ImageBackgroundRemover />}
            {activeToolId === 'forensics' && <FileMetadataInspector />}
            {activeToolId === 'audio-converter' && <AudioConverter />}
            {activeToolId === 'image-converter' && <ImageConverter />}
            {activeToolId === 'doc-converter' && <DocumentConverter />}
            {activeToolId === 'music-finder' && <MusicFinder />}
            {activeToolId === 'tts-engine' && <TextToSpeech />}
            {activeToolId === 'password-gen' && <PasswordGenerator />}
            {activeToolId === 'color-palette' && <ColorPaletteGenerator />}
            {activeToolId === 'text-analyzer' && <TextAnalyzer />}
            {activeToolId === 'qr-generator' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6 max-w-xl mx-auto">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-bold">
                    <i className="fas fa-qrcode"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">HD QR Code Generator</h3>
                    <p className="text-xs text-slate-400">Generate high-density scannable QR codes for any link or text.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Enter URL or Message</label>
                  <input
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="https://example.com or text..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-inner max-w-[240px] mx-auto">
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 object-contain" />
                  )}
                </div>

                <a
                  href={qrDataUrl}
                  download="qrcode-hd.png"
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <i className="fas fa-download"></i>
                  <span>Download High-Resolution PNG</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── THE ICONIC TINYWOW TOOL DIRECTORY GRID ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="fas fa-grid-2 text-cyan-400"></i>
              <span>Available Tools ({filteredTools.length})</span>
            </h2>
            {searchQuery && (
              <span className="text-xs text-slate-400">
                Found {filteredTools.length} tools matching &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                id={`tool-${tool.id}`}
                onClick={() => {
                  setActiveToolId(tool.id);
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className={`group relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  activeToolId === tool.id
                    ? 'bg-slate-900 border-cyan-500 shadow-2xl shadow-cyan-950/60 ring-2 ring-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 hover:shadow-xl hover:scale-[1.01]'
                }`}
              >
                {/* Badges */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg bg-gradient-to-tr ${tool.gradient} group-hover:scale-110 transition-transform`}>
                    <i className={tool.icon}></i>
                  </div>
                  {tool.badge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      tool.isNew
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                {/* Launch Button */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {tool.category}
                  </span>
                  <span className="font-bold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Use Tool</span>
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
