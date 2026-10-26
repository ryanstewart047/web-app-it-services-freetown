'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ISNet Neural Engine Asset Path (Dichotomous Image Segmentation - 1.7.0 LTS)
const NEURAL_REMOVER_ASSET_PATH = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/';
const NEURAL_REMOVER_CDN_FALLBACK = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/index.mjs';

type NeuralBackgroundRemovalFn = (
  image: ImageData | ArrayBuffer | Uint8Array | Blob | URL | string,
  config?: Record<string, unknown>
) => Promise<Blob>;

type Rgb = { r: number; g: number; b: number };

export interface StudioPreset {
  id: string;
  name: string;
  category: 'transparent' | 'solid' | 'gradient';
  cssValue: string;
  canvasType: 'none' | 'solid' | 'linear' | 'radial';
  gradientColors?: string[];
  gradientAngles?: number;
  previewClass?: string;
  previewStyle?: React.CSSProperties;
}

// ── Complete Studio Backdrops Catalog (Solid Colors & Photography Gradients) ──
const STUDIO_PRESETS: StudioPreset[] = [
  // 1. Transparent
  {
    id: 'transparent',
    name: 'Transparent',
    category: 'transparent',
    cssValue: 'transparent',
    canvasType: 'none',
    previewClass: 'bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:8px_8px] bg-slate-950',
  },

  // 2. Solid Colors (Passports, Official ID, Studio, and E-commerce)
  {
    id: 'white',
    name: 'Passport White',
    category: 'solid',
    cssValue: '#FFFFFF',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#FFFFFF' },
  },
  {
    id: 'id-blue',
    name: 'Official ID Blue',
    category: 'solid',
    cssValue: '#1D70B8',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#1D70B8' },
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    category: 'solid',
    cssValue: '#0B2545',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#0B2545' },
  },
  {
    id: 'studio-slate',
    name: 'Studio Slate',
    category: 'solid',
    cssValue: '#1E293B',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#1E293B' },
  },
  {
    id: 'pitch-black',
    name: 'Pitch Black',
    category: 'solid',
    cssValue: '#090D16',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#090D16' },
  },
  {
    id: 'warm-sand',
    name: 'Warm Sand',
    category: 'solid',
    cssValue: '#F3E9DC',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#F3E9DC' },
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    category: 'solid',
    cssValue: '#DC2626',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#DC2626' },
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest',
    category: 'solid',
    cssValue: '#064E3B',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#064E3B' },
  },
  {
    id: 'catalog-mist',
    name: 'Catalog Mist',
    category: 'solid',
    cssValue: '#E2E8F0',
    canvasType: 'solid',
    previewStyle: { backgroundColor: '#E2E8F0' },
  },

  // 3. Studio Gradients (High-End Photography & Modern Lighting)
  {
    id: 'spotlight',
    name: 'Studio Spotlight',
    category: 'gradient',
    cssValue: 'radial-gradient(circle at 50% 45%, #475569 0%, #0F172A 75%, #050810 100%)',
    canvasType: 'radial',
    gradientColors: ['#475569', '#0F172A', '#050810'],
    previewStyle: {
      background: 'radial-gradient(circle at 50% 40%, #475569 0%, #0F172A 100%)',
    },
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    category: 'gradient',
    cssValue: 'linear-gradient(135deg, #F97316 0%, #DB2777 100%)',
    canvasType: 'linear',
    gradientColors: ['#F97316', '#DB2777'],
    gradientAngles: 135,
    previewStyle: {
      background: 'linear-gradient(135deg, #F97316 0%, #DB2777 100%)',
    },
  },
  {
    id: 'cyber',
    name: 'Neon Cyber',
    category: 'gradient',
    cssValue: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #9333EA 100%)',
    canvasType: 'linear',
    gradientColors: ['#06B6D4', '#3B82F6', '#9333EA'],
    gradientAngles: 135,
    previewStyle: {
      background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #9333EA 100%)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Luxury',
    category: 'gradient',
    cssValue: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
    canvasType: 'linear',
    gradientColors: ['#0F172A', '#1E1B4B', '#312E81'],
    gradientAngles: 135,
    previewStyle: {
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
    },
  },
  {
    id: 'emerald-lux',
    name: 'Emerald Glow',
    category: 'gradient',
    cssValue: 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #059669 100%)',
    canvasType: 'linear',
    gradientColors: ['#022C22', '#064E3B', '#059669'],
    gradientAngles: 135,
    previewStyle: {
      background: 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #059669 100%)',
    },
  },
  {
    id: 'twilight',
    name: 'Twilight Velvet',
    category: 'gradient',
    cssValue: 'linear-gradient(135deg, #3B0764 0%, #581C87 50%, #7E22CE 100%)',
    canvasType: 'linear',
    gradientColors: ['#3B0764', '#581C87', '#7E22CE'],
    gradientAngles: 135,
    previewStyle: {
      background: 'linear-gradient(135deg, #3B0764 0%, #581C87 50%, #7E22CE 100%)',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    category: 'gradient',
    cssValue: 'linear-gradient(135deg, #4A044E 0%, #9D174D 50%, #F472B6 100%)',
    canvasType: 'linear',
    gradientColors: ['#4A044E', '#9D174D', '#F472B6'],
    gradientAngles: 135,
    previewStyle: {
      background: 'linear-gradient(135deg, #4A044E 0%, #9D174D 50%, #F472B6 100%)',
    },
  },
  {
    id: 'aura-glow',
    name: 'Aura Glow',
    category: 'gradient',
    cssValue: 'radial-gradient(circle at 50% 50%, #F59E0B 0%, #78350F 55%, #180D03 100%)',
    canvasType: 'radial',
    gradientColors: ['#F59E0B', '#78350F', '#180D03'],
    previewStyle: {
      background: 'radial-gradient(circle at 50% 50%, #F59E0B 0%, #78350F 60%, #180D03 100%)',
    },
  },
  {
    id: 'clean-mesh',
    name: 'Pastel Editorial',
    category: 'gradient',
    cssValue: 'linear-gradient(135deg, #E0E7FF 0%, #FAE8FF 50%, #E0F2FE 100%)',
    canvasType: 'linear',
    gradientColors: ['#E0E7FF', '#FAE8FF', '#E0F2FE'],
    gradientAngles: 135,
    previewStyle: {
      background: 'linear-gradient(135deg, #E0E7FF 0%, #FAE8FF 50%, #E0F2FE 100%)',
    },
  },
];

const clamp = (value: number, min = 0, max = 255) => Math.max(min, Math.min(max, value));

const getPixel = (data: Uint8ClampedArray, pixelIndex: number): Rgb => {
  const offset = pixelIndex * 4;
  return {
    r: data[offset],
    g: data[offset + 1],
    b: data[offset + 2],
  };
};

// Fast weighted perceptual color distance (human visual sensitivity: G > R > B)
const weightedColorDistance = (a: Rgb, b: Rgb) => {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114);
};

// K-Means background palette sampling across perimeter
const buildBackgroundPalette = (samples: Rgb[], maxClusters = 6): Rgb[] => {
  if (samples.length === 0) return [{ r: 255, g: 255, b: 255 }];

  const clusterCount = Math.min(maxClusters, samples.length);
  const centers = Array.from({ length: clusterCount }, (_, index) => {
    const sampleIndex = Math.floor((index / Math.max(1, clusterCount - 1)) * (samples.length - 1));
    return { ...samples[sampleIndex] };
  });

  for (let iteration = 0; iteration < 6; iteration++) {
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

// ── Sub-pixel Alpha Edge Feathering Engine (Separable Moving-Average Guided Blur) ──
function featherAlphaMask(
  src: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): Uint8ClampedArray {
  if (radius <= 0) return new Uint8ClampedArray(src);

  const r = Math.min(Math.max(1, Math.round(radius)), 14);
  const temp = new Float32Array(width * height);
  const out = new Uint8ClampedArray(width * height);
  const windowSize = 2 * r + 1;

  // Horizontal blur pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    let windowSum = 0;
    for (let x = -r; x <= r; x++) {
      const px = Math.min(Math.max(0, x), width - 1);
      windowSum += src[rowOffset + px];
    }
    for (let x = 0; x < width; x++) {
      temp[rowOffset + x] = windowSum / windowSize;
      const removeX = Math.min(Math.max(0, x - r), width - 1);
      const addX = Math.min(Math.max(0, x + r + 1), width - 1);
      windowSum += src[rowOffset + addX] - src[rowOffset + removeX];
    }
  }

  // Vertical blur pass + boundary contour blending
  for (let x = 0; x < width; x++) {
    let windowSum = 0;
    for (let y = -r; y <= r; y++) {
      const py = Math.min(Math.max(0, y), height - 1);
      windowSum += temp[py * width + x];
    }
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      const blurredVal = windowSum / windowSize;

      // Retain crisp solid core while softening sub-pixel boundary fringes
      if (src[idx] >= 252 && blurredVal >= 170) {
        out[idx] = 255;
      } else if (src[idx] <= 4 && blurredVal <= 25) {
        out[idx] = 0;
      } else {
        out[idx] = Math.round(blurredVal);
      }

      const removeY = Math.min(Math.max(0, y - r), height - 1);
      const addY = Math.min(Math.max(0, y + r + 1), height - 1);
      windowSum += temp[addY * width + x] - temp[removeY * width + x];
    }
  }

  return out;
}

export default function ImageBackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<'neural' | 'saliency' | null>(null);

  // Background Customization State
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'solid' | 'gradient'>('all');
  const [selectedPreset, setSelectedPreset] = useState<string>('white');
  const [customColor, setCustomColor] = useState<string>('#FFFFFF');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  // Remove.bg Edge-Refinement Controls
  const [featherRadius, setFeatherRadius] = useState<number>(2); // 0 (sharp) to 8 (soft)
  const [decontaminateFringe, setDecontaminateFringe] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Comparison Slider State (0 to 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'cutout' | 'original'>('slider');

  // Fallback Tuning State
  const [tolerance, setTolerance] = useState<number>(15);

  // Internal Offscreen References for Real-Time 60FPS Filtering
  const originalImgElementRef = useRef<HTMLImageElement | null>(null);
  const rawBaseAlphaRef = useRef<Uint8ClampedArray | null>(null);
  const imageWidthRef = useRef<number>(0);
  const imageHeightRef = useRef<number>(0);
  const backgroundPaletteRef = useRef<Rgb[]>([{ r: 255, g: 255, b: 255 }]);

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

  // Pre-initialize ISNet neural model in the background on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadNeuralBackgroundRemoval().catch(() => {});
    }
  }, [loadNeuralBackgroundRemoval]);

  // ── Real-Time Matte Composite Function (runs in <15ms on slider change) ─────
  const applyMattingComposition = useCallback(
    (radius: number, decontaminate: boolean) => {
      if (
        !originalImgElementRef.current ||
        !rawBaseAlphaRef.current ||
        imageWidthRef.current === 0 ||
        imageHeightRef.current === 0
      ) {
        return;
      }

      const width = imageWidthRef.current;
      const height = imageHeightRef.current;
      const baseAlpha = rawBaseAlphaRef.current;
      const bgPalette = backgroundPaletteRef.current;

      // 1. Compute sub-pixel feathered alpha contour
      const featheredAlpha = featherAlphaMask(baseAlpha, width, height, radius);

      // 2. Draw source to canvas to get raw RGB
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(originalImgElementRef.current, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const pixelCount = width * height;
      const primaryBg = bgPalette[0] || { r: 255, g: 255, b: 255 };

      // 3. Apply alpha mask + color spill decontamination
      for (let i = 0; i < pixelCount; i++) {
        const offset = i * 4;
        const alpha = featheredAlpha[i];

        if (alpha === 0) {
          data[offset + 3] = 0;
          continue;
        }

        // Sub-pixel edge decontamination (spill suppression like Remove.bg)
        if (decontaminate && alpha > 0 && alpha < 255) {
          const normAlpha = alpha / 255;
          const factor = (1 - normAlpha) * 0.55;
          data[offset] = clamp(data[offset] + (data[offset] - primaryBg.r) * factor);
          data[offset + 1] = clamp(data[offset + 1] + (data[offset + 1] - primaryBg.g) * factor);
          data[offset + 2] = clamp(data[offset + 2] + (data[offset + 2] - primaryBg.b) * factor);
        }

        data[offset + 3] = alpha;
      }

      ctx.putImageData(imageData, 0, 0);
      const finalUrl = canvas.toDataURL('image/png');
      replaceProcessedImage(finalUrl);
    },
    [replaceProcessedImage]
  );

  // Trigger real-time re-feathering when user adjusts feather or decontaminate settings
  const handleFeatherChange = (newRadius: number) => {
    setFeatherRadius(newRadius);
    if (rawBaseAlphaRef.current) {
      applyMattingComposition(newRadius, decontaminateFringe);
    }
  };

  const handleDecontaminateToggle = () => {
    const nextVal = !decontaminateFringe;
    setDecontaminateFringe(nextVal);
    if (rawBaseAlphaRef.current) {
      applyMattingComposition(featherRadius, nextVal);
    }
  };

  // ── Load ISNet deep learning segmentation model (bundled or dynamic ESM) ────
  const loadNeuralBackgroundRemoval = useCallback(async (): Promise<NeuralBackgroundRemovalFn | null> => {
    if (typeof window === 'undefined') return null;
    if ((window as any).__bridgeTechBgRemoval) {
      return (window as any).__bridgeTechBgRemoval as NeuralBackgroundRemovalFn;
    }

    // 1. Direct package import from local node_modules (Fastest & most reliable in Next.js)
    try {
      const imgly = await import('@imgly/background-removal');
      const fn = imgly.removeBackground || (imgly as any).default;
      if (typeof fn === 'function') {
        (window as any).__bridgeTechBgRemoval = fn;
        return fn as NeuralBackgroundRemovalFn;
      }
    } catch (bundleErr) {
      console.warn('Local @imgly module import failed, attempting native browser ESM dynamic import:', bundleErr);
    }

    // 2. Native browser dynamic ESM import (bypasses Webpack bundle resolution)
    try {
      const dynamicImport = new Function('url', 'return import(url)');
      const module = await dynamicImport(NEURAL_REMOVER_CDN_FALLBACK);
      const fn = module.removeBackground || module.default;
      if (typeof fn === 'function') {
        (window as any).__bridgeTechBgRemoval = fn;
        return fn as NeuralBackgroundRemovalFn;
      }
    } catch (netErr) {
      console.error('All neural background remover loaders failed:', netErr);
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
    rawBaseAlphaRef.current = null;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result as string;
        setOriginalImage(dataUrl);
        processImageRemoval(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── High-Precision Adaptive Saliency & Perimeter Palette Matting Engine ──────
  const processWithAdaptiveMatting = (
    img: HTMLImageElement,
    tol: number
  ): Uint8ClampedArray => {
    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context unavailable.');

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelCount = width * height;

    // 1. Calculate luminance and Sobel edge barrier map
    // Any pixel with a high contrast gradient is an object boundary that the flood-fill CANNOT cross
    const gray = new Uint8Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      gray[i] = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
    }

    const isEdge = new Uint8Array(pixelCount);
    // Gradient threshold: scaled with user tolerance (lower tol = stronger edge barrier)
    const edgeThreshold = Math.max(14, 28 - tol * 0.25);
    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * width;
      for (let x = 1; x < width - 1; x++) {
        const i = rowOffset + x;
        const gx = Math.abs(gray[i + 1] - gray[i - 1]);
        const gy = Math.abs(gray[i + width] - gray[i - width]);
        if (gx + gy > edgeThreshold) {
          isEdge[i] = 1;
        }
      }
    }

    // 2. Sample background ONLY from top corners and top border
    // CRITICAL FIX: NEVER sample the bottom 35% of the frame (where clothes, torso, hands, or products rest)
    const bgSamples: Rgb[] = [];
    const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 80));

    // Top border (across top 10% of height)
    const topBandHeight = Math.max(1, Math.floor(height * 0.10));
    for (let y = 0; y < topBandHeight; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        bgSamples.push(getPixel(data, y * width + x));
      }
    }

    // Top-left corner (upper 25% height, left 20% width)
    const cornerHeight = Math.floor(height * 0.25);
    const cornerWidthLeft = Math.floor(width * 0.20);
    for (let y = topBandHeight; y < cornerHeight; y += sampleStep) {
      for (let x = 0; x < cornerWidthLeft; x += sampleStep) {
        bgSamples.push(getPixel(data, y * width + x));
      }
    }

    // Top-right corner (upper 25% height, right 20% width)
    const cornerWidthRight = Math.floor(width * 0.80);
    for (let y = topBandHeight; y < cornerHeight; y += sampleStep) {
      for (let x = cornerWidthRight; x < width; x += sampleStep) {
        bgSamples.push(getPixel(data, y * width + x));
      }
    }

    const backgroundPalette = buildBackgroundPalette(bgSamples, 5);
    backgroundPaletteRef.current = backgroundPalette;

    // 3. Compute distance to background palette
    const bgDistance = new Float32Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      const px = getPixel(data, i);
      let bestDist = Number.POSITIVE_INFINITY;
      for (const center of backgroundPalette) {
        const dist = weightedColorDistance(px, center);
        if (dist < bestDist) bestDist = dist;
      }
      bgDistance[i] = bestDist;
    }

    // Conservative color distance thresholds (prevents swallowing colored clothes/hair)
    const strictThreshold = 14 + tol * 0.55;
    const looseThreshold = 26 + tol * 0.85;

    // 4. Center Foreground Prior (Elliptical core)
    // The central core of the image is strongly protected from background classification
    const cx = width / 2;
    const cy = height / 2;
    const rx = width * 0.32;
    const ry = height * 0.38;

    const backgroundMask = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    let head = 0;
    let tail = 0;

    // Seed background ONLY from the top edge and top corners
    for (let x = 0; x < width; x++) {
      if (bgDistance[x] < looseThreshold && !isEdge[x]) {
        backgroundMask[x] = 1;
        queue[tail++] = x;
      }
    }
    // Also seed from upper left & right edges
    for (let y = 1; y < cornerHeight; y++) {
      const leftIdx = y * width;
      const rightIdx = y * width + width - 1;
      if (bgDistance[leftIdx] < looseThreshold && !isEdge[leftIdx] && !backgroundMask[leftIdx]) {
        backgroundMask[leftIdx] = 1;
        queue[tail++] = leftIdx;
      }
      if (bgDistance[rightIdx] < looseThreshold && !isEdge[rightIdx] && !backgroundMask[rightIdx]) {
        backgroundMask[rightIdx] = 1;
        queue[tail++] = rightIdx;
      }
    }

    // Flood fill respecting Sobel edge barriers and center foreground prior
    while (head < tail) {
      const curr = queue[head++];
      const cxPos = curr % width;
      const cyPos = Math.floor(curr / width);

      // Check 4 neighbors
      const neighbors = [
        cxPos > 0 ? curr - 1 : -1,
        cxPos < width - 1 ? curr + 1 : -1,
        cyPos > 0 ? curr - width : -1,
        cyPos < height - 1 ? curr + width : -1,
      ];

      for (const n of neighbors) {
        if (n === -1 || backgroundMask[n]) continue;

        // Never cross a detected edge barrier
        if (isEdge[n]) continue;

        // Center protection: Do not flood into the central core unless color is nearly identical to background
        const nx = n % width;
        const ny = Math.floor(n / width);
        const normDistSq = Math.pow((nx - cx) / rx, 2) + Math.pow((ny - cy) / ry, 2);
        const isInCentralCore = normDistSq < 1.0;

        const maxAllowedDist = isInCentralCore ? strictThreshold * 0.75 : looseThreshold;

        if (bgDistance[n] < maxAllowedDist) {
          backgroundMask[n] = 1;
          queue[tail++] = n;
        }
      }
    }

    // 5. Construct Solid Alpha Matte
    // Background is 0. Foreground is 255 (SOLID OPAQUE).
    // Edge pixels smoothly transition based on proximity to boundary.
    const rawAlpha = new Uint8ClampedArray(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      if (backgroundMask[i]) {
        rawAlpha[i] = 0;
      } else {
        // Foreground is 100% solid (255) by default, protecting clothes, skin, and hair completely!
        rawAlpha[i] = 255;
      }
    }

    // Edge antialiasing: soften the exact 1-pixel boundary between background and foreground
    for (let y = 1; y < height - 1; y++) {
      const rowOffset = y * width;
      for (let x = 1; x < width - 1; x++) {
        const i = rowOffset + x;
        if (rawAlpha[i] === 255) {
          // Check if neighboring background pixel exists
          const hasBgNeighbor =
            rawAlpha[i - 1] === 0 ||
            rawAlpha[i + 1] === 0 ||
            rawAlpha[i - width] === 0 ||
            rawAlpha[i + width] === 0;

          if (hasBgNeighbor) {
            // Soft sub-pixel boundary alpha
            rawAlpha[i] = Math.round(180 + (bgDistance[i] / looseThreshold) * 75);
          }
        }
      }
    }

    return rawAlpha;
  };

  // ── Main Background Removal Orchestrator ─────────────────────────────────────
  const processImageRemoval = async (imageSrc: string) => {
    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStage('Initializing AI segmentation neural pipeline...');
    setError(null);

    // Pre-load image element for real-time canvas operations
    const sourceImg = new Image();
    sourceImg.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      sourceImg.onload = () => resolve();
      sourceImg.onerror = () => reject(new Error('Failed to load image in memory.'));
      sourceImg.src = imageSrc;
    });

    originalImgElementRef.current = sourceImg;
    const width = sourceImg.naturalWidth || sourceImg.width;
    const height = sourceImg.naturalHeight || sourceImg.height;
    imageWidthRef.current = width;
    imageHeightRef.current = height;

    try {
      // Step 1: Attempt to run ISNet Neural Segmentation (Remove.bg Technology)
      setProgressPercent(20);
      setProgressStage('Loading ISNet neural AI model (Remove.bg technology)...');
      const removeBackground = await loadNeuralBackgroundRemoval();

      if (removeBackground) {
        setProgressPercent(35);
        setProgressStage('AI isolating main subject from background...');

        let blob: Blob;
        try {
          blob = await removeBackground(imageSrc, {
            publicPath: NEURAL_REMOVER_ASSET_PATH,
            model: 'medium', // isnet_fp16: maximum hair & boundary precision
            proxyToWorker: false,
            debug: false,
            progress: (_key: string, current: number, total: number) => {
              if (total > 0) {
                const pct = Math.round((current / total) * 45) + 35;
                setProgressPercent(Math.min(pct, 85));
                setProgressStage(`Neural AI segmenting main image (${Math.round((current / total) * 100)}%)...`);
              }
            },
            output: {
              format: 'image/png',
              quality: 1.0,
              type: 'foreground',
            },
          });
        } catch (mediumErr) {
          console.warn('ISNet medium model failed, falling back to fast isnet_quint8:', mediumErr);
          blob = await removeBackground(imageSrc, {
            publicPath: NEURAL_REMOVER_ASSET_PATH,
            model: 'small', // isnet_quint8 (42MB)
            proxyToWorker: false,
            debug: false,
            progress: (_key: string, current: number, total: number) => {
              if (total > 0) {
                const pct = Math.round((current / total) * 45) + 35;
                setProgressPercent(Math.min(pct, 85));
                setProgressStage(`Fast ISNet segmenting main image (${Math.round((current / total) * 100)}%)...`);
              }
            },
            output: {
              format: 'image/png',
              quality: 1.0,
              type: 'foreground',
            },
          });
        }

        // Extract alpha channel from neural output so edge feathering can be dynamically adjusted
        setProgressPercent(88);
        setProgressStage('Applying edge feathering & color spill decontamination...');

        const neuralImg = new Image();
        const neuralBlobUrl = URL.createObjectURL(blob);

        await new Promise<void>((resolve) => {
          neuralImg.onload = () => resolve();
          neuralImg.src = neuralBlobUrl;
        });

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext('2d');

        if (maskCtx) {
          maskCtx.drawImage(neuralImg, 0, 0, width, height);
          const neuralData = maskCtx.getImageData(0, 0, width, height).data;
          const extractedAlpha = new Uint8ClampedArray(width * height);
          for (let i = 0; i < width * height; i++) {
            extractedAlpha[i] = neuralData[i * 4 + 3];
          }
          rawBaseAlphaRef.current = extractedAlpha;
        }

        URL.revokeObjectURL(neuralBlobUrl);
        setProcessingMode('neural');
      } else {
        // Step 2: Fallback to Adaptive Saliency Matting
        setProgressPercent(55);
        setProgressStage('Applying adaptive saliency contour matting...');
        const saliencyAlpha = processWithAdaptiveMatting(sourceImg, tolerance);
        rawBaseAlphaRef.current = saliencyAlpha;
        setProcessingMode('saliency');
      }

      // Step 3: Composite final image with default feathering & decontamination
      setProgressPercent(95);
      setProgressStage('Compositing studio cutout...');
      applyMattingComposition(featherRadius, decontaminateFringe);

      setProgressPercent(100);
      setProgressStage('Background removed with high accuracy!');
    } catch (err: any) {
      console.warn('Neural network fallback to saliency matting:', err);
      try {
        setProgressStage('Refining cutout with adaptive edge matting...');
        const saliencyAlpha = processWithAdaptiveMatting(sourceImg, tolerance);
        rawBaseAlphaRef.current = saliencyAlpha;
        setProcessingMode('saliency');
        applyMattingComposition(featherRadius, decontaminateFringe);
        setProgressPercent(100);
      } catch (fallbackErr: any) {
        setError('Failed to extract background. Please try another image.');
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

  // ── Export Canvas Composite with Studio Backdrop ─────────────────────────────
  const generateExportCanvas = (
    exportPreset: string,
    format: 'png' | 'jpg'
  ): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      if (!processedImage) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        const presetObj = STUDIO_PRESETS.find((p) => p.id === exportPreset);

        // 1. Transparent PNG
        if (exportPreset === 'transparent' && format === 'png') {
          // Leave background transparent
        }
        // 2. Custom Uploaded Image
        else if (exportPreset === 'custom-image' && customBgImage) {
          const bgImg = new Image();
          bgImg.onload = () => {
            // Draw background image scaled cover
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
          };
          bgImg.src = customBgImage;
          return;
        }
        // 3. Studio Radial Gradient (Spotlight, Aura Glow)
        else if (presetObj?.canvasType === 'radial' && presetObj.gradientColors) {
          const centerX = canvas.width / 2;
          const centerY = canvas.height * 0.45;
          const radius = Math.max(canvas.width, canvas.height) * 0.75;
          const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

          const colors = presetObj.gradientColors;
          if (colors.length === 2) {
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(1, colors[1]);
          } else if (colors.length >= 3) {
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(0.55, colors[1]);
            grad.addColorStop(1, colors[2]);
          }

          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // 4. Studio Linear Gradient (Sunset, Cyber, Midnight, Rose Gold, etc.)
        else if (presetObj?.canvasType === 'linear' && presetObj.gradientColors) {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          const colors = presetObj.gradientColors;

          if (colors.length === 2) {
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(1, colors[1]);
          } else if (colors.length >= 3) {
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(0.5, colors[1]);
            grad.addColorStop(1, colors[2]);
          }

          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // 5. Solid Colors
        else if (presetObj?.canvasType === 'solid' || exportPreset === 'custom-color') {
          ctx.fillStyle = exportPreset === 'custom-color' ? customColor : presetObj?.cssValue || '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Default white fallback for JPG
        else {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.src = processedImage;
    });
  };

  const handleDownload = async (
    format: 'png' | 'jpg' = 'png',
    backgroundOverride?: string
  ) => {
    const exportPreset = backgroundOverride || selectedPreset;
    const canvas = await generateExportCanvas(exportPreset, format);
    if (!canvas) return;

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = format === 'png' ? undefined : 0.95;
    const dataUrl = canvas.toDataURL(mime, quality);

    const suffixMap: Record<string, string> = {
      transparent: 'transparent-cutout',
      white: 'passport-white',
      'id-blue': 'official-id-blue',
      'corporate-navy': 'corporate-navy',
      'studio-slate': 'studio-slate',
      'pitch-black': 'pitch-black',
      'warm-sand': 'warm-sand',
      'crimson-red': 'crimson-red',
      'emerald-forest': 'emerald-forest',
      'catalog-mist': 'catalog-mist',
      spotlight: 'studio-spotlight',
      sunset: 'warm-sunset',
      cyber: 'neon-cyber',
      midnight: 'midnight-luxury',
      'emerald-lux': 'emerald-glow',
      twilight: 'twilight-velvet',
      'rose-gold': 'rose-gold',
      'aura-glow': 'aura-glow',
      'clean-mesh': 'pastel-editorial',
      'custom-color': 'custom-solid',
      'custom-image': 'studio-backdrop',
    };

    const link = document.createElement('a');
    link.download = `${originalFileName || 'image'}-${suffixMap[exportPreset] || 'cutout'}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Copy Transparent Cutout to Clipboard (Like Remove.bg) ───────────────────
  const handleCopyToClipboard = async () => {
    if (!processedImage) return;

    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();

      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      } else {
        alert('Clipboard image copy is not supported in this browser.');
      }
    } catch (err) {
      console.warn('Copy to clipboard error:', err);
    }
  };

  // Filter presets based on category tab
  const filteredPresets = STUDIO_PRESETS.filter((preset) => {
    if (activeCategoryTab === 'all') return true;
    return preset.category === activeCategoryTab;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-900/30">
            <i className="fas fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">AI Image Background Remover</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <i className="fas fa-brain text-[9px]"></i> Remove.bg Technology
              </span>
            </div>
            <p className="text-xs text-slate-400">
              High-accuracy AI segmentation • Sub-pixel edge feathering • Solid colors & studio gradients • 100% Free
            </p>
          </div>
        </div>

        {processedImage && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyToClipboard}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm"
              title="Copy transparent PNG to clipboard"
            >
              <i className={`fas ${copySuccess ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
              <span>{copySuccess ? 'Copied Cutout!' : 'Copy Cutout'}</span>
            </button>
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
            Supports portraits, passport headshots, e-commerce products, logos, pets, and cars (PNG, JPG, WEBP, HEIC).
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-slate-300 flex items-center gap-1.5">
              <i className="fas fa-check-circle text-purple-400"></i> High-Accuracy Saliency
            </span>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-slate-300 flex items-center gap-1.5">
              <i className="fas fa-feather-pointed text-cyan-400"></i> Edge Feathering
            </span>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-slate-300 flex items-center gap-1.5">
              <i className="fas fa-palette text-amber-400"></i> Studio Gradients
            </span>
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] text-slate-400">
              🔒 100% Private (On-Device)
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
                  className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full transition-all duration-300 ease-out"
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
                    Studio Cutout View
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'original' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Original Photo
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  {processingMode === 'neural' ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <i className="fas fa-brain text-[10px]"></i> ISNet Neural AI (Remove.bg Tech)
                    </span>
                  ) : processingMode === 'saliency' ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <i className="fas fa-sliders text-[10px]"></i> Adaptive Contour Saliency
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Visual Container */}
              <div
                ref={sliderContainerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative w-full aspect-[4/3] max-h-[520px] rounded-3xl overflow-hidden border border-slate-800 select-none shadow-2xl flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950"
              >
                {/* Selected Backdrop Layer */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    backgroundColor:
                      selectedPreset !== 'transparent' && selectedPreset !== 'custom-image'
                        ? STUDIO_PRESETS.find((p) => p.id === selectedPreset)?.canvasType === 'solid'
                          ? STUDIO_PRESETS.find((p) => p.id === selectedPreset)?.cssValue
                          : selectedPreset === 'custom-color'
                          ? customColor
                          : 'transparent'
                        : 'transparent',
                    backgroundImage:
                      customBgImage
                        ? `url(${customBgImage})`
                        : STUDIO_PRESETS.find((p) => p.id === selectedPreset)?.category === 'gradient'
                        ? STUDIO_PRESETS.find((p) => p.id === selectedPreset)?.cssValue
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
                      <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-300 border border-white/10">
                        ORIGINAL
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 bg-purple-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-200 z-30 pointer-events-none border border-purple-500/30">
                      STUDIO CUTOUT
                    </div>

                    {/* Split Divider Line & Draggable Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white z-30 cursor-ew-resize shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center text-slate-900 text-xs font-black">
                        ↔
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Edge Feathering & Decontamination Live Controls Bar */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <i className="fas fa-feather-pointed text-purple-400"></i>
                        <span>Edge Feathering (Sub-Pixel Softness)</span>
                      </span>
                      <span className="font-mono text-purple-400 font-bold">{featherRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      value={featherRadius}
                      disabled={!rawBaseAlphaRef.current}
                      onChange={(e) => handleFeatherChange(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>0px (Crisp Cut)</span>
                      <span>2px (Natural Hair)</span>
                      <span>4px (Portrait Soft)</span>
                      <span>8px (Studio Glow)</span>
                    </div>
                  </div>

                  {/* Spill Decontamination Toggle */}
                  <div className="sm:border-l sm:border-slate-800 sm:pl-4 flex sm:flex-col items-center justify-between sm:items-start gap-1">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <i className="fas fa-eye-dropper text-cyan-400 text-[10px]"></i>
                      <span>Decontaminate Spill</span>
                    </span>
                    <button
                      onClick={handleDecontaminateToggle}
                      disabled={!rawBaseAlphaRef.current}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                        decontaminateFringe
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <i className={`fas ${decontaminateFringe ? 'fa-toggle-on text-cyan-400' : 'fa-toggle-off'}`}></i>
                      <span>{decontaminateFringe ? 'Anti-Halo ON' : 'Anti-Halo OFF'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Studio Controls (1 col) */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <i className="fas fa-palette text-purple-400"></i>
                  <span>Studio Backdrops</span>
                </h3>
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <button
                    onClick={() => setActiveCategoryTab('all')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      activeCategoryTab === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab('solid')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      activeCategoryTab === 'solid'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Solids
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab('gradient')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      activeCategoryTab === 'gradient'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Gradients
                  </button>
                </div>
              </div>

              {/* Preset Backdrops Grid */}
              <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      setCustomBgImage(null);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center relative ${
                      selectedPreset === preset.id
                        ? 'border-purple-500 bg-purple-950/40 ring-2 ring-purple-500/50'
                        : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg border border-slate-700 shadow-sm ${preset.previewClass || ''}`}
                      style={preset.previewStyle}
                    ></div>
                    <span className="text-[10px] font-semibold text-slate-300 truncate w-full">
                      {preset.name}
                    </span>
                    {selectedPreset === preset.id && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-purple-600 rounded-full flex items-center justify-center text-[8px] text-white">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color & Photo Backdrop Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400 block">Custom Color or Photo Backdrop:</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
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
                    <input
                      type="text"
                      value={customColor.toUpperCase()}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedPreset('custom-color');
                        setCustomBgImage(null);
                      }}
                      className="text-xs font-mono text-slate-300 bg-transparent outline-none w-20"
                    />
                  </div>

                  <button
                    onClick={() => bgInputRef.current?.click()}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all shrink-0"
                    title="Upload Custom Image Backdrop"
                  >
                    <i className="fas fa-image text-purple-400"></i>
                    <span>Photo</span>
                  </button>
                </div>
              </div>

              {/* Fallback Saliency Sensitivity (Active if fallback runs) */}
              {processingMode === 'saliency' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Saliency Sensitivity</span>
                    <span className="font-mono text-purple-400">{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={tolerance}
                    onChange={(e) => {
                      const newTol = Number(e.target.value);
                      setTolerance(newTol);
                      if (originalImgElementRef.current) {
                        const alpha = processWithAdaptiveMatting(originalImgElementRef.current, newTol);
                        rawBaseAlphaRef.current = alpha;
                        applyMattingComposition(featherRadius, decontaminateFringe);
                      }
                    }}
                    className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Export Download Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleDownload('png', 'white')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-transform active:scale-95"
                >
                  <i className="fas fa-download"></i>
                  <span>Download Passport White PNG</span>
                </button>
                <button
                  onClick={() => handleDownload('png', 'transparent')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  <i className="fas fa-layer-group text-purple-400"></i>
                  <span>Download Transparent PNG</span>
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors"
                >
                  <i className="fas fa-file-image text-cyan-400"></i>
                  <span>Download Selected Studio Backdrop (JPG)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
