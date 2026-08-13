'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import AudioConverter from '@/components/digital-tools/AudioConverter';
import MusicFinder from '@/components/digital-tools/MusicFinder';
import ImageConverter from '@/components/digital-tools/ImageConverter';
import DocumentConverter from '@/components/digital-tools/DocumentConverter';

type ToolCategory = 'all' | 'audio-convert' | 'music-finder' | 'image-convert' | 'doc-convert' | 'qr-hash';

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
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <i className="fas fa-key text-amber-400"></i>
        <span>Password Generator</span>
      </h3>

      {/* Password Output */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-3 pr-24 font-mono text-sm text-emerald-400 break-all min-h-[52px] flex items-center">
        <span>{password}</span>
        <button
          onClick={copy}
          className={`absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      {/* Strength Meter */}
      {strength > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-slate-800'}`} />
            ))}
          </div>
          <p className="text-[11px] text-slate-400">Strength: <span className="text-white font-semibold">{strengthLabel}</span></p>
        </div>
      )}

      {/* Length Slider */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
          <span>Password Length</span>
          <span className="text-amber-400 font-mono">{length} chars</span>
        </div>
        <input type="range" min={8} max={64} value={length} onChange={e => setLength(Number(e.target.value))}
          className="w-full accent-amber-500" />
      </div>

      {/* Character Options */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Uppercase (A–Z)', val: upper, set: setUpper },
          { label: 'Lowercase (a–z)', val: lower, set: setLower },
          { label: 'Numbers (0–9)', val: numbers, set: setNumbers },
          { label: 'Symbols (!@#$)', val: symbols, set: setSymbols },
        ].map(({ label, val, set }) => (
          <label key={label} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input type="checkbox" checked={val} onChange={e => set(e.target.checked)}
              className="accent-amber-500 rounded" />
            {label}
          </label>
        ))}
      </div>

      <button onClick={generate}
        className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md">
        <i className="fas fa-arrows-rotate"></i>
        <span>Generate New Password</span>
      </button>
    </div>
  );
}

// ── Color Palette Generator ────────────────────────────────────────────────────
function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#ef4444');
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
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <i className="fas fa-palette text-purple-400"></i>
        <span>Color Palette Generator</span>
      </h3>

      <div className="flex items-center gap-3">
        <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)}
          className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-0 p-0.5" />
        <div>
          <p className="text-xs font-semibold text-slate-300">Base Color</p>
          <p className="text-xs font-mono text-purple-400">{baseColor.toUpperCase()}</p>
          <p className="text-[11px] text-slate-500">Click swatch to generate palette</p>
        </div>
        <button onClick={generatePalette}
          className="ml-auto py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
          <i className="fas fa-wand-magic-sparkles"></i>
          <span>Generate</span>
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {palette.map((color, i) => (
          <button key={i} onClick={() => copy(color)}
            className="group flex flex-col items-center gap-1" title={color}>
            <div className="w-full aspect-square rounded-xl border-2 border-transparent group-hover:border-white/40 transition-all shadow-md"
              style={{ backgroundColor: color }} />
            <span className="text-[9px] font-mono text-slate-400 group-hover:text-white transition-colors">
              {copiedColor === color ? '✓ Copied' : color.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-500 text-center">Click any swatch to copy its HEX code</p>
    </div>
  );
}

// ── Word Count & Text Analyzer ─────────────────────────────────────────────────
function TextAnalyzer() {
  const [text, setText] = useState('');

  const words  = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars  = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const lines  = text ? text.split('\n').length : 0;
  const sentences = text.match(/[.!?]+/g)?.length || 0;
  const readTime  = Math.max(1, Math.ceil(words / 200));
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;

  const topWords = (() => {
    if (!text.trim()) return [];
    const freq: Record<string, number> = {};
    text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3).forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 5);
  })();

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 col-span-full">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <i className="fas fa-text-width text-blue-400"></i>
        <span>Word Count & Text Analyzer</span>
      </h3>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        placeholder="Paste or type your text here to analyze word count, reading time, character count, and more..."
        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
      />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Words',       val: words,          color: 'text-blue-400' },
          { label: 'Characters',  val: chars,          color: 'text-purple-400' },
          { label: 'No Spaces',   val: charsNoSpace,   color: 'text-pink-400' },
          { label: 'Lines',       val: lines,          color: 'text-cyan-400' },
          { label: 'Sentences',   val: sentences,      color: 'text-amber-400' },
          { label: 'Paragraphs',  val: paragraphs,     color: 'text-emerald-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-slate-900 p-3 rounded-xl text-center border border-slate-800">
            <p className={`text-lg font-bold font-mono ${color}`}>{val.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {words > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-3">
          <span>📖 Read time: <strong className="text-white">{readTime} min</strong></span>
          <span>⌨️ Avg word: <strong className="text-white">{words > 0 ? (charsNoSpace / words).toFixed(1) : 0} chars</strong></span>
          {topWords.length > 0 && (
            <span>🔤 Top words: {topWords.map(([w, n]) => <strong key={w} className="text-white"> {w}({n})</strong>)}</span>
          )}
        </div>
      )}

      {text && (
        <button onClick={() => setText('')}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5">
          <i className="fas fa-xmark"></i> Clear Text
        </button>
      )}
    </div>
  );
}

// ── Text to Speech ─────────────────────────────────────────────────────────────
function TextToSpeech() {
  const [text, setText] = useState('Welcome to BridgeTech Digital Tools Hub. The ultimate free online file converter and media suite.');
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(v);
    };
    load();
    speechSynthesis.onvoiceschanged = load;
    return () => { speechSynthesis.cancel(); };
  }, []);

  const speak = () => {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (voices[selectedVoice]) utter.voice = voices[selectedVoice];
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    speechSynthesis.speak(utter);
  };

  const stop = () => { speechSynthesis.cancel(); setSpeaking(false); };

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <i className="fas fa-volume-high text-cyan-400"></i>
        <span>Text to Speech</span>
      </h3>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
        placeholder="Type text to speak aloud..."
        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
      />

      {voices.length > 0 && (
        <select value={selectedVoice} onChange={e => setSelectedVoice(Number(e.target.value))}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
          {voices.map((v, i) => <option key={i} value={i}>{v.name} ({v.lang})</option>)}
        </select>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Speed', val: rate, set: setRate, min: 0.5, max: 2, step: 0.1, color: 'accent-cyan-500', unit: 'x' },
          { label: 'Pitch', val: pitch, set: setPitch, min: 0.5, max: 2, step: 0.1, color: 'accent-purple-500', unit: '' },
          { label: 'Volume', val: volume, set: setVolume, min: 0, max: 1, step: 0.1, color: 'accent-emerald-500', unit: '%' },
        ].map(({ label, val, set, min, max, step, color, unit }) => (
          <div key={label}>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{label}</span>
              <span className="font-mono">{unit === '%' ? Math.round(val * 100) + '%' : val.toFixed(1) + unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))} className={`w-full ${color}`} />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={speak} disabled={speaking || !text.trim()}
          className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50">
          <i className={`fas ${speaking ? 'fa-wave-square fa-pulse' : 'fa-play'}`}></i>
          <span>{speaking ? 'Speaking…' : 'Speak Text'}</span>
        </button>
        {speaking && (
          <button onClick={stop}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
            <i className="fas fa-stop"></i> Stop
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DigitalToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // QR Code generator state
  const [qrText, setQrText] = useState('https://www.itservicesfreetown.com/digital-tools');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // File metadata state
  const [hashFile, setHashFile] = useState<File | null>(null);
  const [hashResult, setHashResult] = useState<{ size: number; name: string; type: string; lastModified: string } | null>(null);

  const handleHashFile = (f: File) => {
    setHashFile(f);
    setHashResult({
      size: f.size,
      name: f.name,
      type: f.type || 'Unknown',
      lastModified: new Date(f.lastModified).toLocaleString(),
    });
  };

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(qrText.trim() || ' ', {
      width: 420,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#040e40',
        light: '#ffffff',
      },
    }).then((url) => {
      if (active) setQrDataUrl(url);
    }).catch(() => {
      if (active) setQrDataUrl('');
    });

    return () => { active = false; };
  }, [qrText]);

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
              Digital Products Suite v2.1
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-600/20 via-blue-600/20 to-purple-600/20 border border-slate-700/60 rounded-full text-xs font-semibold text-slate-200 mb-4 shadow-xl">
            <i className="fas fa-wand-magic-sparkles text-red-400"></i>
            <span>All-in-one local converters, previews, and media tools</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Digital Products <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-400 to-purple-500">& Tools Hub</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Convert video audio to real MP3, export WebM/MP4 frames to PNG or JPEG, convert DOCX and text to PDF, search music previews, create QR codes, generate passwords, analyze text, and run everyday digital utilities from one polished hub.
          </p>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-lock text-emerald-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">Local Converters</p>
              <p className="text-[10px] text-slate-500">Files stay in browser</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-bolt text-amber-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">Lightning Fast</p>
              <p className="text-[10px] text-slate-500">No upload queues</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-music text-blue-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">Media Preview</p>
              <p className="text-[10px] text-slate-500">Video, audio, PDF</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center">
              <i className="fas fa-infinity text-purple-400 text-lg mb-1"></i>
              <p className="text-xs font-bold text-white">No Sign-in</p>
              <p className="text-[10px] text-slate-500">Open web tools</p>
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
              placeholder="Search tools (e.g. MP3 converter, WebM to JPG, DOCX to PDF, Password, QR code)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-xl"
            />
            <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {[
              { id: 'all',           label: 'All Tools',           icon: 'fas fa-grid-2',               color: 'text-white' },
              { id: 'audio-convert', label: 'Audio Converter',     icon: 'fas fa-music',                color: 'text-red-400' },
              { id: 'music-finder',  label: 'Online Music Search', icon: 'fas fa-magnifying-glass-wave', color: 'text-blue-400' },
              { id: 'image-convert', label: 'Image Converter',     icon: 'fas fa-image',                color: 'text-emerald-400' },
              { id: 'doc-convert',   label: 'Document & PDF',      icon: 'fas fa-file-contract',        color: 'text-purple-400' },
              { id: 'qr-hash',       label: 'QR & Utilities',      icon: 'fas fa-qrcode',               color: 'text-amber-400' },
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
                <i className={`${tab.icon} ${tab.color}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools Display */}
        <div className="space-y-10">
          {/* 1. Audio Converter */}
          {(activeTab === 'all' || activeTab === 'audio-convert') &&
            matchesSearch('Audio Converter', 'Convert audio files MP3 WAV OGG WebM MP4 video', ['audio', 'mp3', 'wav', 'webm', 'ogg', 'mp4', 'trim']) && (
              <section id="audio-converter">
                <AudioConverter />
              </section>
            )}

          {/* 2. Online Music Search */}
          {(activeTab === 'all' || activeTab === 'music-finder') &&
            matchesSearch('Online Music Search', 'Search music artist song title keywords artwork full track', ['music', 'song', 'artist', 'artwork', 'download', 'jamendo']) && (
              <section id="music-finder">
                <MusicFinder />
              </section>
            )}

          {/* 3. Image Converter */}
          {(activeTab === 'all' || activeTab === 'image-convert') &&
            matchesSearch('Image Converter', 'Convert JPG PNG WebP SVG resize compress WebM MP4 video frame', ['image', 'jpg', 'png', 'webp', 'svg', 'resize', 'video', 'frame', 'webm']) && (
              <section id="image-converter">
                <ImageConverter />
              </section>
            )}

          {/* 4. Document & PDF Converter */}
          {(activeTab === 'all' || activeTab === 'doc-convert') &&
            matchesSearch('Document Converter', 'Word to PDF, PDF to Text, Markdown to PDF, text editor', ['word', 'pdf', 'docx', 'text', 'convert']) && (
              <section id="doc-converter">
                <DocumentConverter />
              </section>
            )}

          {/* 5. QR Code Generator, File Metadata, Password Generator, Color Palette, Text Analyzer, TTS */}
          {(activeTab === 'all' || activeTab === 'qr-hash') &&
            matchesSearch('QR Code, Password Generator, Color Palette, Text Analyzer, Text to Speech, File Inspector', 'QR code generator file hash checksum password color speech word count', ['qr', 'qrcode', 'hash', 'password', 'color', 'palette', 'speech', 'words', 'tts', 'analyzer']) && (
              <section id="qr-utilities" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur space-y-8">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-600/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 text-xl font-bold">
                    <i className="fas fa-toolbox"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">QR Code, Utilities & Developer Tools</h2>
                    <p className="text-xs text-slate-400">Password generator, color palette creator, QR code maker, text analyzer, text-to-speech & file inspector</p>
                  </div>
                </div>

                {/* Row 1: QR Code + File Inspector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        src={qrDataUrl}
                        alt="Generated QR Code"
                        className="w-48 h-48 object-contain"
                      />
                    </div>

                    <a
                      href={qrDataUrl}
                      download="qrcode.png"
                      className={`w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md ${!qrDataUrl ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <i className="fas fa-download"></i>
                      <span>Download HD QR Code PNG</span>
                    </a>
                  </div>

                  {/* File Metadata Inspector */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fas fa-shield-halved text-blue-400"></i>
                      <span>File Metadata Inspector</span>
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
                          {hashFile ? hashFile.name : 'Upload any file to inspect metadata'}
                        </p>
                      </div>
                    </div>

                    {hashResult && (
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                        <p className="text-slate-400">Filename: <strong className="text-white">{hashResult.name}</strong></p>
                        <p className="text-slate-400">Type: <strong className="text-blue-400">{hashResult.type}</strong></p>
                        <p className="text-slate-400">Size: <strong className="text-emerald-400">{hashResult.size.toLocaleString()} bytes ({(hashResult.size / (1024*1024)).toFixed(3)} MB)</strong></p>
                        <p className="text-slate-400">Modified: <strong className="text-purple-400">{hashResult.lastModified}</strong></p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Password Generator + Color Palette */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PasswordGenerator />
                  <ColorPaletteGenerator />
                </div>

                {/* Row 3: Text-to-Speech + Word Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextToSpeech />
                  <div className="space-y-4">
                    {/* Placeholder box for extra utility if needed */}
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 h-full flex flex-col items-center justify-center text-center gap-3">
                      <i className="fas fa-clock text-slate-600 text-4xl"></i>
                      <p className="text-slate-500 text-sm font-medium">More Utilities Coming Soon</p>
                      <p className="text-slate-600 text-xs">Unit Converter, Timer & Stopwatch, Base64 Encoder, JSON Formatter…</p>
                    </div>
                  </div>
                </div>

                {/* Row 4: Full-width Text Analyzer */}
                <div className="grid grid-cols-1 gap-6">
                  <TextAnalyzer />
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
                Audio, image, video-frame, QR, password, and DOCX/PDF generation tools run in your browser. Music search uses online sources for public metadata/previews, but uploaded converter files stay on your device.
              </p>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-blue-400 mb-1">How does the Online Music Search work?</h4>
              <p className="text-xs text-slate-400">
                The Music Finder uses public music/video metadata sources for previews and cover art. Direct downloads are offered only when a source provides a legitimate downloadable audio file.
              </p>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 mb-1">How do I generate a secure password?</h4>
              <p className="text-xs text-slate-400">
                Use the Password Generator in the QR & Utilities section. Select character types (uppercase, lowercase, numbers, symbols), set your desired length, and click Generate. Your password is created using the browser&apos;s cryptographically secure random number generator.
              </p>
            </div>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 mb-1">Can I convert MP4 video to MP3?</h4>
              <p className="text-xs text-slate-400">
                Yes! The Audio Converter supports MP4 video files. Upload your video, select MP3 as the output format, adjust bitrate quality, and click Convert to extract the full audio track as a clean downloadable MP3.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
