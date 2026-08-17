'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const NEURAL_REMOVER_MODULE_URL = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.0/dist/index.mjs';
const NEURAL_REMOVER_ASSET_PATH = 'https://staticimgly.com/@imgly/background-removal-data/1.5.0/dist/';

type NeuralBackgroundRemovalFn = (
  image: ImageData | ArrayBuffer | Uint8Array | Blob | URL | string,
  config?: Record<string, unknown>
) => Promise<Blob>;

type Rgb = { r: number; g: number; b: number };

// Studio backdrop presets
const STUDIO_PRESETS = [
  { id: 'transparent', name: 'Transparent', value: 'transparent', previewClass: 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950' },
  { id: 'white', name: 'Passport White', value: '#FFFFFF', previewClass: 'bg-white' },
  { id: 'id-blue', name: 'ID Blue', value: '#1D70B8', previewClass: 'bg-[#1D70B8]' },
  { id: 'studio-slate', name: 'Studio Slate', value: '#1E293B', previewClass: 'bg-slate-800' },
  { id: 'sunset', name: 'Warm Sunset', value: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)', previewClass: 'bg-gradient-to-br from-orange-500 to-pink-600' },
  { id: 'cyber', name: 'Neon Cyber', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #9333ea 100%)', previewClass: 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600' },
];

const clamp = (value: number, min = 0, max = 255) => Math.max(min, Math.min(max, value));

const getPixel = (data: Uint8ClampedArray, width: number, pixelIndex: number): Rgb => {
  const offset = pixelIndex * 4;
  return {
    r: data[offset],
    g: data[offset + 1],
    b: data[offset + 2],
  };
};

const weightedColorDistance = (a: Rgb, b: Rgb) => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114);
};

const nearestPaletteMatch = (color: Rgb, palette: Rgb[]) => {
  let bestColor = palette[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const paletteColor of palette) {
    const distance = weightedColorDistance(color, paletteColor);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestColor = paletteColor;
    }
  }

  return { color: bestColor, distance: bestDistance };
};

const buildBackgroundPalette = (samples: Rgb[], maxClusters = 6) => {
  if (samples.length === 0) return [{ r: 255, g: 255, b: 255 }];

  const clusterCount = Math.min(maxClusters, samples.length);
  const centers = Array.from({ length: clusterCount }, (_, index) => {
    const sampleIndex = Math.floor((index / Math.max(1, clusterCount - 1)) * (samples.length - 1));
    return { ...samples[sampleIndex] };
  });

  for (let iteration = 0; iteration < 8; iteration++) {
    const sums = centers.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));

    for (const sample of samples) {
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      centers.forEach((center, index) => {
        const distance = weightedColorDistance(sample, center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      sums[nearestIndex].r += sample.r;
      sums[nearestIndex].g += sample.g;
      sums[nearestIndex].b += sample.b;
      sums[nearestIndex].count++;
    }

    sums.forEach((sum, index) => {
      if (sum.count > 0) {
        centers[index] = {
          r: sum.r / sum.count,
          g: sum.g / sum.count,
          b: sum.b / sum.count,
        };
      }
    });
  }

  return centers;
};

export default function ImageBackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<'neural' | 'fallback' | null>(null);

  // Background Customization State
  const [selectedPreset, setSelectedPreset] = useState<string>('white');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  // Comparison Slider State (0 to 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'cutout' | 'original'>('slider');

  // Manual Tolerance / Sensitivity Adjuster
  const [tolerance, setTolerance] = useState<number>(30);
  const [edgeSmoothing, setEdgeSmoothing] = useState<number>(2);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSlider = useRef<boolean>(false);
  const processedObjectUrlRef = useRef<string | null>(null);

  const replaceProcessedImage = useCallback((url: string | null, isObjectUrl = false) => {
    if (processedObjectUrlRef.current) {
      URL.revokeObjectURL(processedObjectUrlRef.current);
      processedObjectUrlRef.current = null;
    }

    if (isObjectUrl && url) {
      processedObjectUrlRef.current = url;
    }

    setProcessedImage(url);
  }, []);

  useEffect(() => {
    return () => {
      if (processedObjectUrlRef.current) {
        URL.revokeObjectURL(processedObjectUrlRef.current);
      }
    };
  }, []);

  // ── Load browser neural segmentation model dynamically to keep Next.js SSR safe ──
  const loadNeuralBackgroundRemoval = useCallback(async (): Promise<NeuralBackgroundRemovalFn | null> => {
    if (typeof window === 'undefined') return null;
    if ((window as any).__bridgeTechBgRemoval) {
      return (window as any).__bridgeTechBgRemoval as NeuralBackgroundRemovalFn;
    }

    try {
      const imglyModule: any = await import(/* webpackIgnore: true */ NEURAL_REMOVER_MODULE_URL);
      const removeBackground = imglyModule?.default || imglyModule?.removeBackground;

      if (typeof removeBackground === 'function') {
        (window as any).__bridgeTechBgRemoval = removeBackground;
        return removeBackground as NeuralBackgroundRemovalFn;
      }
    } catch (loadError) {
      console.warn('Neural background remover failed to load:', loadError);
    }

    return null;
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, or HEIC).');
      return;
    }

    setError(null);
    replaceProcessedImage(null);
    setProcessingMode(null);
    setCustomBgImage(null);
    setSelectedPreset('white');
    setOriginalFileName(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        setOriginalImage(dataUrl);
        // Automatically start AI background removal
        processImageRemoval(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── High-Precision Adaptive Saliency & Contour Matting Engine ────────────────
  const processWithAdaptiveMatting = (
    imageSrc: string,
    tol: number,
    smooth: number
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Failed to initialize canvas context.'));
          return;
        }

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const pixelCount = width * height;
        const perimeterSamples: Rgb[] = [];
        const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 90));

        for (let x = 0; x < width; x += sampleStep) {
          perimeterSamples.push(getPixel(data, width, x));
          perimeterSamples.push(getPixel(data, width, (height - 1) * width + x));
        }
        for (let y = 0; y < height; y += sampleStep) {
          perimeterSamples.push(getPixel(data, width, y * width));
          perimeterSamples.push(getPixel(data, width, y * width + width - 1));
        }

        const backgroundPalette = buildBackgroundPalette(perimeterSamples);
        const bgDistance = new Float32Array(pixelCount);
        const strictBackgroundDistance = 16 + tol * 1.15;
        const looseBackgroundDistance = 34 + tol * 2.2;
        const connectedEdgeDistance = 22 + tol * 1.7;
        const cx = width / 2;
        const cy = height / 2;

        for (let index = 0; index < pixelCount; index++) {
          bgDistance[index] = nearestPaletteMatch(getPixel(data, width, index), backgroundPalette).distance;
        }

        const backgroundMask = new Uint8Array(pixelCount);
        const queue = new Int32Array(pixelCount);
        let head = 0;
        let tail = 0;

        const seedBackground = (index: number) => {
          if (backgroundMask[index] || bgDistance[index] > looseBackgroundDistance) return;
          backgroundMask[index] = 1;
          queue[tail++] = index;
        };

        for (let x = 0; x < width; x++) {
          seedBackground(x);
          seedBackground((height - 1) * width + x);
        }
        for (let y = 0; y < height; y++) {
          seedBackground(y * width);
          seedBackground(y * width + width - 1);
        }

        const maybeAddNeighbor = (parentIndex: number, neighborIndex: number) => {
          if (neighborIndex < 0 || neighborIndex >= pixelCount || backgroundMask[neighborIndex]) return;

          const parentColor = getPixel(data, width, parentIndex);
          const neighborColor = getPixel(data, width, neighborIndex);
          const localContinuity = weightedColorDistance(parentColor, neighborColor);
          const x = neighborIndex % width;
          const y = Math.floor(neighborIndex / width);
          const centerDistance = Math.sqrt(Math.pow((x - cx) / cx, 2) + Math.pow((y - cy) / cy, 2));
          const centerProtection = Math.max(0, 1 - centerDistance) * (18 + tol * 0.35);
          const adjustedLooseDistance = looseBackgroundDistance - centerProtection;

          const isSmoothConnectedBackground =
            bgDistance[neighborIndex] < adjustedLooseDistance &&
            localContinuity < connectedEdgeDistance;

          if (bgDistance[neighborIndex] < strictBackgroundDistance || isSmoothConnectedBackground) {
            backgroundMask[neighborIndex] = 1;
            queue[tail++] = neighborIndex;
          }
        };

        while (head < tail) {
          const index = queue[head++];
          const x = index % width;

          if (x > 0) maybeAddNeighbor(index, index - 1);
          if (x < width - 1) maybeAddNeighbor(index, index + 1);
          if (index >= width) maybeAddNeighbor(index, index - width);
          if (index < pixelCount - width) maybeAddNeighbor(index, index + width);
        }

        // Remove tiny foreground islands caused by image compression or patterned backgrounds.
        const visited = new Uint8Array(pixelCount);
        const componentQueue = new Int32Array(pixelCount);
        const minIslandArea = Math.max(24, pixelCount * 0.00045);
        const softIslandArea = Math.max(160, pixelCount * 0.0035);

        for (let start = 0; start < pixelCount; start++) {
          if (backgroundMask[start] || visited[start]) continue;

          let componentHead = 0;
          let componentTail = 0;
          let centerHits = 0;
          visited[start] = 1;
          componentQueue[componentTail++] = start;

          while (componentHead < componentTail) {
            const index = componentQueue[componentHead++];
            const x = index % width;
            const y = Math.floor(index / width);
            const inMainSubjectZone =
              Math.abs((x - cx) / cx) < 0.72 &&
              Math.abs((y - cy) / cy) < 0.82;

            if (inMainSubjectZone) centerHits++;

            const inspectNeighbor = (neighborIndex: number) => {
              if (neighborIndex < 0 || neighborIndex >= pixelCount) return;
              if (visited[neighborIndex] || backgroundMask[neighborIndex]) return;
              visited[neighborIndex] = 1;
              componentQueue[componentTail++] = neighborIndex;
            };

            if (x > 0) inspectNeighbor(index - 1);
            if (x < width - 1) inspectNeighbor(index + 1);
            if (index >= width) inspectNeighbor(index - width);
            if (index < pixelCount - width) inspectNeighbor(index + width);
          }

          const isTinyNoise = componentTail < minIslandArea;
          const isOffCenterSpeckle = componentTail < softIslandArea && centerHits < componentTail * 0.08;

          if (isTinyNoise || isOffCenterSpeckle) {
            for (let i = 0; i < componentTail; i++) {
              backgroundMask[componentQueue[i]] = 1;
            }
          }
        }

        const alphaMap = new Uint8ClampedArray(pixelCount);
        const edgeRadius = Math.max(1, smooth);

        for (let index = 0; index < pixelCount; index++) {
          if (backgroundMask[index]) {
            alphaMap[index] = 0;
            continue;
          }

          const x = index % width;
          const y = Math.floor(index / width);
          let touchesBackground = false;

          for (let dy = -edgeRadius; dy <= edgeRadius && !touchesBackground; dy++) {
            for (let dx = -edgeRadius; dx <= edgeRadius; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              if (backgroundMask[ny * width + nx]) {
                touchesBackground = true;
                break;
              }
            }
          }

          if (!touchesBackground) {
            alphaMap[index] = 255;
            continue;
          }

          const matte = (bgDistance[index] - strictBackgroundDistance * 0.68) /
            Math.max(1, looseBackgroundDistance - strictBackgroundDistance * 0.68);
          alphaMap[index] = Math.round(clamp(matte, 0.18, 1) * 255);
        }

        for (let index = 0; index < pixelCount; index++) {
          const offset = index * 4;
          const alpha = alphaMap[index] / 255;

          if (alpha > 0 && alpha < 1) {
            const pixelColor = getPixel(data, width, index);
            const { color: nearestBackground } = nearestPaletteMatch(pixelColor, backgroundPalette);
            const decontaminateStrength = (1 - alpha) * 0.48;

            data[offset] = clamp(pixelColor.r + (pixelColor.r - nearestBackground.r) * decontaminateStrength);
            data[offset + 1] = clamp(pixelColor.g + (pixelColor.g - nearestBackground.g) * decontaminateStrength);
            data[offset + 2] = clamp(pixelColor.b + (pixelColor.b - nearestBackground.b) * decontaminateStrength);
          }

          data[offset + 3] = alphaMap[index];
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => reject(new Error('Failed to load image into memory.'));
      img.src = imageSrc;
    });
  };

  // ── Main Background Removal Orchestrator ─────────────────────────────────────
  const processImageRemoval = async (imageSrc: string) => {
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStage('Initializing AI segmentation engine...');
    setError(null);

    try {
      // 1. Attempt to load deep learning neural model via dynamic CDN
      setProgressPercent(25);
      setProgressStage('Loading professional neural cutout model...');
      const removeBackground = await loadNeuralBackgroundRemoval();

      if (removeBackground) {
        setProgressPercent(45);
        setProgressStage('Neural model isolating the main subject...');
        
        const blob = await removeBackground(imageSrc, {
          publicPath: NEURAL_REMOVER_ASSET_PATH,
          model: 'medium',
          proxyToWorker: true,
          debug: false,
          progress: (_key: string, current: number, total: number) => {
            if (total > 0) {
              const pct = Math.round((current / total) * 40) + 50;
              setProgressPercent(Math.min(pct, 95));
              setProgressStage(`Downloading and processing AI model (${Math.round((current / total) * 100)}%)...`);
            }
          },
          output: {
            format: 'image/png',
            quality: 1.0,
            type: 'foreground',
          },
        });

        const url = URL.createObjectURL(blob);
        replaceProcessedImage(url, true);
        setProcessingMode('neural');
        setProgressPercent(100);
        setProgressStage('Subject isolated on white studio background.');
      } else {
        // 2. High-precision Adaptive Saliency Matting Fallback
        setProgressPercent(50);
        setProgressStage('Using advanced local edge-connected matting...');
        const resultUrl = await processWithAdaptiveMatting(imageSrc, tolerance, edgeSmoothing);
        setProgressPercent(100);
        setProgressStage('Foreground extracted on white studio background.');
        replaceProcessedImage(resultUrl);
        setProcessingMode('fallback');
      }
    } catch (err: any) {
      console.warn('Neural network fallback to contour matting:', err);
      try {
        setProgressStage('Neural model unavailable. Refining with local contour matting...');
        const resultUrl = await processWithAdaptiveMatting(imageSrc, tolerance, edgeSmoothing);
        replaceProcessedImage(resultUrl);
        setProcessingMode('fallback');
        setProgressPercent(100);
      } catch (fallbackErr: any) {
        setError('Failed to remove background. Please try another image.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Comparison Slider Interaction Handlers ───────────────────────────────────
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseDown = () => {
    isDraggingSlider.current = true;
  };

  const handleMouseUp = () => {
    isDraggingSlider.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider.current) {
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // ── Export Full Resolution Image with Selected Studio Backdrop ───────────────
  const handleDownload = async (
    format: 'png' | 'jpg' = 'png',
    backgroundOverride?: string
  ) => {
    if (!processedImage) return;
    const exportPreset = backgroundOverride || selectedPreset;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Render custom background
      if (exportPreset === 'transparent' && format === 'png') {
        // Leave canvas transparent
      } else if (exportPreset === 'custom-image' && customBgImage) {
        const bgImg = new Image();
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          triggerSave(canvas, format, exportPreset);
        };
        bgImg.src = customBgImage;
        return;
      } else if (exportPreset !== 'transparent') {
        const preset = STUDIO_PRESETS.find((p) => p.id === exportPreset);
        const fillValue = preset?.value || (exportPreset === 'white' ? '#FFFFFF' : customColor);

        if (fillValue.startsWith('linear-gradient')) {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          if (exportPreset === 'sunset') {
            grad.addColorStop(0, '#f97316');
            grad.addColorStop(1, '#db2777');
          } else if (exportPreset === 'cyber') {
            grad.addColorStop(0, '#06b6d4');
            grad.addColorStop(0.5, '#3b82f6');
            grad.addColorStop(1, '#9333ea');
          }
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = fillValue;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // JPG requires solid white if transparent
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      triggerSave(canvas, format, exportPreset);
    };
    img.src = processedImage;
  };

  const triggerSave = (canvas: HTMLCanvasElement, format: 'png' | 'jpg', exportPreset: string) => {
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'png' ? undefined : 0.95;
    const dataUrl = canvas.toDataURL(mime, quality);
    const suffixByPreset: Record<string, string> = {
      transparent: 'transparent-cutout',
      white: 'white-background',
      'id-blue': 'id-blue-background',
      'studio-slate': 'studio-slate-background',
      sunset: 'sunset-background',
      cyber: 'cyber-background',
      'custom-color': 'custom-background',
      'custom-image': 'photo-background',
    };

    const link = document.createElement('a');
    link.download = `${originalFileName || 'image'}-${suffixByPreset[exportPreset] || 'background-removed'}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-900/30">
            <i className="fas fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">AI Image Background Remover</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                <i className="fas fa-brain text-[9px]"></i> Neural Segmentation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              100% Free & Unlimited • Automatic subject detection • Hair-strand precision • 1-Click Studio Backdrops
            </p>
          </div>
        </div>

        {processedImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <i className="fas fa-arrow-up-from-bracket"></i>
              <span>New Photo</span>
            </button>
            <button
              onClick={() => handleDownload('png', 'white')}
              className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-purple-900/30 flex items-center gap-2"
            >
              <i className="fas fa-download"></i>
              <span>Download White PNG</span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
        }}
      />
      <input
        ref={bgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev.target?.result) {
                setCustomBgImage(ev.target.result as string);
                setSelectedPreset('custom-image');
              }
            };
            reader.readAsDataURL(e.target.files[0]);
          }
        }}
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
          <i className="fas fa-circle-exclamation text-rose-400"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace */}
      {!originalImage ? (
        /* Upload Area */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-slate-700 hover:border-purple-500/80 bg-slate-950/60 hover:bg-slate-900/50 rounded-3xl p-12 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[340px]"
        >
          <div className="w-20 h-20 bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400 rounded-3xl flex items-center justify-center text-3xl mb-4 transition-all group-hover:scale-110 shadow-inner">
            <i className="fas fa-cloud-arrow-up"></i>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Drop your image here, or <span className="text-purple-400 underline">browse</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Supports portraits, headshots, product photography, pets, logos, and graphic assets (PNG, JPG, WEBP).
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-slate-400">
              ⚡ On-Device AI
            </span>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-slate-400">
              🔒 100% Private (No Cloud Upload)
            </span>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-slate-400">
              ✨ Full HD Export
            </span>
          </div>
        </div>
      ) : (
        /* Processing & Results Workspace */
        <div className="space-y-6">
          {/* Progress Indicator */}
          {isProcessing && (
            <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300 font-semibold flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin text-purple-400"></i>
                  {progressStage}
                </span>
                <span className="font-mono font-bold text-purple-400">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Interactive Preview Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stage (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              {/* View Mode Tabs */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setViewMode('slider')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'slider' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Before / After Slider ↔
                  </button>
                  <button
                    onClick={() => setViewMode('cutout')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'cutout' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cutout View
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'original' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {viewMode === 'slider' ? 'Drag slider left / right to inspect' : ''}
                </span>
              </div>

              {/* Visual Container */}
              <div
                ref={sliderContainerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative w-full aspect-[4/3] max-h-[500px] rounded-3xl overflow-hidden border border-slate-800 select-none shadow-2xl flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950"
              >
                {/* Backdrop Layer */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    backgroundColor:
                      selectedPreset !== 'transparent' && selectedPreset !== 'custom-image'
                        ? STUDIO_PRESETS.find((p) => p.id === selectedPreset)?.value || customColor
                        : 'transparent',
                    backgroundImage:
                      customBgImage
                        ? `url(${customBgImage})`
                        : selectedPreset === 'sunset' || selectedPreset === 'cyber'
                        ? STUDIO_PRESETS.find((p) => p.id === selectedPreset)?.value
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>

                {/* Case 1: Original View Only */}
                {viewMode === 'original' && originalImage && (
                  <img
                    src={originalImage}
                    alt="Original"
                    className="relative z-10 max-h-full max-w-full object-contain pointer-events-none"
                  />
                )}

                {/* Case 2: Cutout View Only */}
                {viewMode === 'cutout' && (
                  <img
                    src={processedImage || originalImage || ''}
                    alt="Processed Cutout"
                    className="relative z-10 max-h-full max-w-full object-contain pointer-events-none"
                  />
                )}

                {/* Case 3: Interactive Split-View Slider */}
                {viewMode === 'slider' && originalImage && (
                  <>
                    {/* Processed Cutout (Bottom Layer) */}
                    <img
                      src={processedImage || originalImage}
                      alt="Cutout Result"
                      className="absolute inset-0 m-auto max-h-full max-w-full object-contain pointer-events-none z-10"
                    />

                    {/* Original Image (Clipped Top Layer) */}
                    <div
                      className="absolute inset-0 overflow-hidden z-20 pointer-events-none"
                      style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                    >
                      <img
                        src={originalImage}
                        alt="Original View"
                        className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
                      />
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300">
                        ORIGINAL
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 bg-purple-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-200 z-30 pointer-events-none">
                      AI CUTOUT
                    </div>

                    {/* Split Divider Line & Draggable Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white z-30 cursor-ew-resize shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-900 text-xs font-black">
                        ↔
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar Studio Controls (1 col) */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <i className="fas fa-palette text-purple-400"></i>
                <span>Studio Backdrop Replacer</span>
              </h3>

              {/* Preset Backdrops Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {STUDIO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setCustomBgImage(null);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      selectedPreset === preset.id
                        ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/40'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg border border-slate-700 shadow-sm ${preset.previewClass}`}></div>
                    <span className="text-[10px] font-semibold text-slate-300 truncate w-full">{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Color & Upload Custom Backdrop */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400 block">Custom Color or Photo:</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedPreset('custom-color');
                        setCustomBgImage(null);
                      }}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-300">{customColor.toUpperCase()}</span>
                  </div>

                  <button
                    onClick={() => bgInputRef.current?.click()}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all shrink-0"
                    title="Upload Custom Image Backdrop"
                  >
                    <i className="fas fa-image text-purple-400"></i>
                    <span>Photo</span>
                  </button>
                </div>
              </div>

              {/* Edge Refinement & Sensitivity Slider */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Sensitivity Refiner</span>
                  <span className="font-mono text-purple-400">{tolerance}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={tolerance}
                  disabled={processingMode === 'neural'}
                  onChange={(e) => {
                    const newTol = Number(e.target.value);
                    setTolerance(newTol);
                    if (originalImage && processingMode !== 'neural') {
                      setIsProcessing(true);
                      setProgressStage('Refining local matting edges...');
                      processWithAdaptiveMatting(originalImage, newTol, edgeSmoothing)
                        .then((url) => {
                          replaceProcessedImage(url);
                          setProcessingMode('fallback');
                        })
                        .catch(() => {
                          setError('Unable to refine the image. Please try a different sensitivity.');
                        })
                        .finally(() => {
                          setIsProcessing(false);
                        });
                    }
                  }}
                  className={`w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg ${
                    processingMode === 'neural' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                />
                <p className="text-[10px] text-slate-500">
                  {processingMode === 'neural'
                    ? 'Neural cutout active. Local sensitivity is only used if the fallback engine runs.'
                    : 'Increase sensitivity for stronger colored-background removal; lower it to preserve fine edges.'}
                </p>
              </div>

              {/* Export Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  onClick={() => handleDownload('png', 'white')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-transform active:scale-95"
                >
                  <i className="fas fa-download"></i>
                  <span>Download White Background PNG</span>
                </button>
                <button
                  onClick={() => handleDownload('png', 'transparent')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  <i className="fas fa-layer-group"></i>
                  <span>Download Transparent Cutout</span>
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  <i className="fas fa-file-image"></i>
                  <span>Download Current Backdrop JPG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
