'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

type BgMode = 'transparent' | 'solid' | 'gradient';

interface BgPreset {
  id: string;
  name: string;
  type: BgMode;
  value: string;
  previewClass: string;
}

const BG_PRESETS: BgPreset[] = [
  { id: 'trans', name: 'Transparent', type: 'transparent', value: 'transparent', previewClass: 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px] bg-slate-800' },
  { id: 'white', name: 'Passport White', type: 'solid', value: '#FFFFFF', previewClass: 'bg-white' },
  { id: 'id-blue', name: 'ID Blue', type: 'solid', value: '#1D70B8', previewClass: 'bg-[#1D70B8]' },
  { id: 'studio-black', name: 'Studio Black', type: 'solid', value: '#0F172A', previewClass: 'bg-slate-900' },
  { id: 'red', name: 'Crimson Red', type: 'solid', value: '#DC2626', previewClass: 'bg-red-600' },
  { id: 'emerald', name: 'Emerald', type: 'solid', value: '#059669', previewClass: 'bg-emerald-600' },
  { id: 'grad-studio', name: 'Studio Glow', type: 'gradient', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', previewClass: 'bg-gradient-to-br from-slate-800 to-slate-950' },
  { id: 'grad-sunset', name: 'Warm Glow', type: 'gradient', value: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)', previewClass: 'bg-gradient-to-br from-orange-500 to-pink-600' },
  { id: 'grad-cyan', name: 'Neon Cyber', type: 'gradient', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', previewClass: 'bg-gradient-to-br from-cyan-500 to-blue-600' },
];

export default function ImageBackgroundRemover() {
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [tolerance, setTolerance] = useState<number>(32);
  const [feather, setFeather] = useState<number>(3);
  const [edgeRefinement, setEdgeRefinement] = useState<number>(50);
  const [bgMode, setBgMode] = useState<BgMode>('transparent');
  const [solidColor, setSolidColor] = useState<string>('#FFFFFF');
  const [activePreset, setActivePreset] = useState<string>('trans');
  const [viewMode, setViewMode] = useState<'processed' | 'split' | 'original'>('processed');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [hasProcessed, setHasProcessed] = useState<boolean>(false);

  // Canvas refs
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load user image
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSourceImg(img);
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Main Background Removal & Saliency Algorithm
  const processRemoval = useCallback(() => {
    if (!sourceImg) return;
    setIsProcessing(true);

    setTimeout(() => {
      const w = sourceImg.naturalWidth;
      const h = sourceImg.naturalHeight;

      // 1. Create source canvas
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = w;
      srcCanvas.height = h;
      const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
      if (!srcCtx) return;
      srcCtx.drawImage(sourceImg, 0, 0);
      const srcData = srcCtx.getImageData(0, 0, w, h);
      const srcPixels = srcData.data;

      // 2. Sample boundary pixels to determine background colors
      // Sample top, bottom, left, right edges and corners
      const bgSamples: number[][] = [];
      const sampleStep = Math.max(1, Math.floor(Math.min(w, h) / 40));

      for (let x = 0; x < w; x += sampleStep) {
        // Top edge
        const idxTop = (0 * w + x) * 4;
        bgSamples.push([srcPixels[idxTop], srcPixels[idxTop + 1], srcPixels[idxTop + 2]]);
        // Bottom edge
        const idxBot = ((h - 1) * w + x) * 4;
        bgSamples.push([srcPixels[idxBot], srcPixels[idxBot + 1], srcPixels[idxBot + 2]]);
      }

      for (let y = 0; y < h; y += sampleStep) {
        // Left edge
        const idxLeft = (y * w + 0) * 4;
        bgSamples.push([srcPixels[idxLeft], srcPixels[idxLeft + 1], srcPixels[idxLeft + 2]]);
        // Right edge
        const idxRight = (y * w + (w - 1)) * 4;
        bgSamples.push([srcPixels[idxRight], srcPixels[idxRight + 1], srcPixels[idxRight + 2]]);
      }

      // Compute average and dominant background color
      let avgR = 0, avgG = 0, avgB = 0;
      for (const s of bgSamples) {
        avgR += s[0];
        avgG += s[1];
        avgB += s[2];
      }
      avgR /= bgSamples.length;
      avgG /= bgSamples.length;
      avgB /= bgSamples.length;

      // 3. Generate initial alpha mask based on color distance and edge contrast
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
      if (!maskCtx) return;
      const maskData = maskCtx.createImageData(w, h);
      const maskPixels = maskData.data;

      const tolSq = tolerance * tolerance * 3.2;
      const centerDistMax = Math.sqrt((w / 2) * (w / 2) + (h / 2) * (h / 2));

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = srcPixels[idx];
          const g = srcPixels[idx + 1];
          const b = srcPixels[idx + 2];

          // Compute minimum distance to any background sample
          let minSampleDistSq = Infinity;
          for (let s = 0; s < bgSamples.length; s += 2) {
            const dr = r - bgSamples[s][0];
            const dg = g - bgSamples[s][1];
            const db = b - bgSamples[s][2];
            const dSq = dr * dr + dg * dg + db * db;
            if (dSq < minSampleDistSq) {
              minSampleDistSq = dSq;
            }
          }

          // Compute distance to average background
          const dAvgR = r - avgR;
          const dAvgG = g - avgG;
          const dAvgB = b - avgB;
          const distAvgSq = dAvgR * dAvgR + dAvgG * dAvgG + dAvgB * dAvgB;
          const effectiveDist = Math.min(minSampleDistSq, distAvgSq);

          // Center bias (subjects are usually centered)
          const dxCenter = x - w / 2;
          const dyCenter = y - h / 2;
          const distToCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
          const centerFactor = 1.0 - (distToCenter / centerDistMax) * 0.25;

          // Saliency threshold
          let alpha = 255;
          if (effectiveDist < tolSq) {
            // Smooth gradient transition near boundaries
            const ratio = Math.sqrt(effectiveDist) / Math.sqrt(tolSq);
            alpha = Math.max(0, Math.min(255, Math.floor(ratio * 255 * centerFactor)));
          }

          maskPixels[idx] = alpha;
          maskPixels[idx + 1] = alpha;
          maskPixels[idx + 2] = alpha;
          maskPixels[idx + 3] = 255;
        }
      }

      maskCtx.putImageData(maskData, 0, 0);

      // 4. Render to output canvas with selected background
      const outputCanvas = outputCanvasRef.current;
      if (outputCanvas) {
        outputCanvas.width = w;
        outputCanvas.height = h;
        const outCtx = outputCanvas.getContext('2d');
        if (outCtx) {
          outCtx.clearRect(0, 0, w, h);

          // Draw background if solid or gradient
          if (bgMode === 'solid') {
            outCtx.fillStyle = solidColor;
            outCtx.fillRect(0, 0, w, h);
          } else if (bgMode === 'gradient') {
            const grad = outCtx.createLinearGradient(0, 0, w, h);
            if (activePreset === 'grad-sunset') {
              grad.addColorStop(0, '#f97316');
              grad.addColorStop(1, '#db2777');
            } else if (activePreset === 'grad-cyan') {
              grad.addColorStop(0, '#06b6d4');
              grad.addColorStop(1, '#3b82f6');
            } else {
              grad.addColorStop(0, '#1e293b');
              grad.addColorStop(1, '#0f172a');
            }
            outCtx.fillStyle = grad;
            outCtx.fillRect(0, 0, w, h);
          }

          // Composite foreground using alpha mask
          const fgCanvas = document.createElement('canvas');
          fgCanvas.width = w;
          fgCanvas.height = h;
          const fgCtx = fgCanvas.getContext('2d');
          if (fgCtx) {
            fgCtx.drawImage(sourceImg, 0, 0);
            fgCtx.globalCompositeOperation = 'destination-in';
            // Apply soft feathering if requested
            if (feather > 0) {
              fgCtx.filter = `blur(${feather * 0.4}px)`;
            }
            fgCtx.drawImage(maskCanvas, 0, 0);
            fgCtx.filter = 'none';

            outCtx.drawImage(fgCanvas, 0, 0);
          }
        }
      }

      setIsProcessing(false);
      setHasProcessed(true);
    }, 40);
  }, [sourceImg, tolerance, feather, bgMode, solidColor, activePreset]);

  // Re-run on settings change if image loaded
  useEffect(() => {
    if (sourceImg) {
      processRemoval();
    }
  }, [sourceImg, tolerance, feather, bgMode, solidColor, activePreset, processRemoval]);

  // Download HD Result
  const handleDownload = (format: 'png' | 'jpg' = 'png') => {
    const canvas = outputCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${fileName || 'image'}-bg-removed.${format}`;
    link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white text-xl shadow-lg shadow-cyan-900/40">
            <i className="fas fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">AI Image Background Remover</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                100% Free • HD
              </span>
            </div>
            <p className="text-xs text-slate-400">Remove image backgrounds instantly with high accuracy, customizable colors, and studio gradients.</p>
          </div>
        </div>

        {sourceImg && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('png')}
              className="py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <i className="fas fa-download"></i>
              <span>Download HD PNG</span>
            </button>
            <button
              onClick={() => { setSourceImg(null); setHasProcessed(false); }}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
              title="Reset Image"
            >
              <i className="fas fa-xmark"></i>
            </button>
          </div>
        )}
      </div>

      {/* Upload Zone or Interactive Workspace */}
      {!sourceImg ? (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 p-10 sm:p-14 rounded-3xl text-center transition-all group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-cloud-arrow-up"></i>
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Upload an Image to Remove Background
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Drag and drop any portrait, product, animal, or graphic. Supports JPG, PNG, WEBP, and HEIC up to 4K resolution.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl text-xs transition-colors border border-slate-700">
              <i className="fas fa-image"></i>
              <span>Choose Image File</span>
            </div>
          </div>
        </div>
      ) : (
        /* Active Workspace */
        <div className="space-y-6">
          {/* Main Visual Display & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canvas Display View */}
            <div className="lg:col-span-2 space-y-3">
              <div
                ref={containerRef}
                className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 flex items-center justify-center"
              >
                {/* Result Canvas */}
                <canvas
                  ref={outputCanvasRef}
                  className="max-w-full max-h-full object-contain"
                />

                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-cyan-400">
                    <i className="fas fa-circle-notch fa-spin text-2xl"></i>
                    <span className="text-xs font-bold tracking-wider">Refining Edge Saliency...</span>
                  </div>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Original: {sourceImg.naturalWidth} × {sourceImg.naturalHeight} px</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <i className="fas fa-check-circle text-[10px]"></i> Processed On-Device
                </span>
              </div>
            </div>

            {/* Editing Controls & Background Presets */}
            <div className="space-y-5 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Background Options
                </h4>

                {/* Preset Swatches */}
                <div className="grid grid-cols-3 gap-2">
                  {BG_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setActivePreset(preset.id);
                        setBgMode(preset.type);
                        if (preset.type === 'solid') setSolidColor(preset.value);
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        activePreset === preset.id
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md shadow-cyan-950'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg border border-white/20 ${preset.previewClass}`}></span>
                      <span className="text-[10px] font-bold truncate max-w-full">{preset.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Solid Color Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="color"
                    value={solidColor}
                    onChange={(e) => {
                      setSolidColor(e.target.value);
                      setBgMode('solid');
                      setActivePreset('custom');
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                  />
                  <div className="text-xs">
                    <span className="text-slate-300 font-bold block">Custom Color</span>
                    <span className="text-[10px] text-slate-500 font-mono">{solidColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Accuracy & Edge Tuning
                  </h4>

                  {/* Removal Sensitivity */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                      <span>Sensitivity / Tolerance</span>
                      <span className="text-cyan-400 font-mono">{tolerance}</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={75}
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  {/* Edge Softness / Feathering */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                      <span>Edge Feathering</span>
                      <span className="text-cyan-400 font-mono">{feather} px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      value={feather}
                      onChange={(e) => setFeather(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleDownload('png')}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <i className="fas fa-download"></i>
                  <span>Download Transparent PNG</span>
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
                >
                  <i className="fas fa-file-image"></i>
                  <span>Download as JPG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
