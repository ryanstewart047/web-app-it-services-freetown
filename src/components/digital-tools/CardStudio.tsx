'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  CreditCard,
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  QrCode,
  Download,
  Printer,
  Sparkles,
  Eye,
  RotateCw,
  Layers,
  Palette,
  FileText,
  Upload,
  Check,
  Share2,
  Copy,
  Grid,
  Shield,
  Award,
  Briefcase,
  Sliders,
  Trash2,
  Smartphone,
  CheckCircle2,
  Cpu,
  HardHat,
  Landmark,
  Car,
  HeartPulse,
  Paintbrush,
  Sparkle,
  Maximize2,
  ExternalLink,
  Search,
  Filter,
  Camera,
  Scissors,
  Utensils,
  Home,
  Scale,
  Zap,
  Wrench,
  Trees,
  Cake,
  ShieldCheck,
  Waves,
  FlaskConical,
  Wifi,
  Flame,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ZoomIn,
  Move,
} from 'lucide-react';

export type CardCategory = 'all' | 'business' | 'id_badge' | 'complementary' | 'vip_pass';
export type CardOrientation = 'landscape' | 'portrait';

export type TemplateStyleGroup =
  | 'all'
  | 'curved_artistic'
  | 'patterns'
  | '3d_luxury'
  | 'modern_tech'
  | 'corporate_legal'
  | 'trades_construction'
  | 'lifestyle_beauty'
  | 'creative_colorful'
  | 'minimal_simple';

export interface CardTemplateConfig {
  id: string;
  name: string;
  category: TemplateStyleGroup;
  industry: string;
  tagline: string;
  theme: 'dark' | 'light' | 'colorful';
  defaultAccent: string;
  defaultSecondary: string;
  badgeIcon: string;
  previewGradient: string;
  drawCard: (
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    isPort: boolean,
    isBack: boolean,
    data: CardData,
    qrImg: HTMLImageElement | null,
    photoImg: HTMLImageElement | null,
    logoImg: HTMLImageElement | null,
    bgImg: HTMLImageElement | null
  ) => void;
}

export interface CardData {
  // Identity
  fullName: string;
  jobTitle: string;
  companyName: string;
  tagline: string;
  department: string;
  idNumber: string;
  bloodGroup: string;
  issueDate: string;
  expiryDate: string;

  // Contact
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  socialHandle: string;

  // Backside
  backTitle: string;
  backSubtitle: string;
  disclaimer: string;
  emergencyContact: string;

  // Media
  photoUrl: string | null;
  logoUrl: string | null;

  // QR Code Settings
  qrType: 'vcard' | 'website' | 'custom_text';
  qrCustomText: string;

  // Visual Customization & Sliders
  templateId: string;
  orientation: CardOrientation;
  accentColor: string;
  secondaryColor: string;
  tertiaryColor?: string; // 3rd wave/shimmer accent color
  cardBgColor?: string; // Card canvas base background color
  textColor?: string; // Full Name, Company Name & Main Headings
  subTextColor?: string; // Job Title, Tagline, Contact Details & Labels
  badgeColor?: string; // Microchip, NFC contactless waves & crest badges
  qrColor?: string; // QR code foreground
  qrBgColor?: string; // QR code background container
  bgOpacity: number;
  showChip: boolean;
  showContactless: boolean;
  showBarcode: boolean;
  showMasterCircles: boolean;
  showCutMarks: boolean;

  // Position & Size Bars
  contentAlign: 'left' | 'center' | 'right';
  logoPosition: 'left' | 'center' | 'right';
  fontScale: number; // 0.8 to 1.3
  curveIntensity: number; // 0.4 to 1.6
  cornerRadius: number; // 20 to 50
  previewZoom: number; // 75 to 125

  // Background Image & Overlay
  bgImageUrl: string | null;
  bgImageOpacity: number; // 0.0 to 1.0
  bgTintColor: string; // hex color overlaid on bg image
  bgTintOpacity: number; // 0.0 to 0.9

  // Wave Overlay Controls
  showWavePattern?: boolean; // toggle wave pattern overlay on/off
  waveOpacity: number; // 0.0 to 1.0 — opacity of the colored curved wave layer
  waveGradientPreset?: 'card_colors' | 'vivid_chroma' | 'sunset_flame' | 'emerald_jade' | 'cyber_neon' | 'liquid_gold' | 'arctic_frost';
  wavePattern:
    | 'bezier'
    | 'sine'
    | 'ripple'
    | 'diagonal_lines'
    | 'concentric'
    | 'chevron'
    | 'dot_matrix'
    | 'isometric_cube'
    | 'circuit_flux'
    | 'gradient_ribbon_mesh'
    | 'aurora_curtain'
    | 'topographic_streamlines'
    | 'guilloche_spiro'
    | 'guilloche_rosette_medallion'
    | 'guilloche_fluted_waves'
    | 'guilloche_moire_grid'
    | 'guilloche_rhodonea_rose'
    | 'guilloche_infinity_lemniscate'
    | 'guilloche_braided_sinusoid'
    | 'lissajous_harmonics'
    | 'dna_helix'
    | 'fluid_vortex'; // wave decoration pattern
}

// ── COLOR VALIDATION & SAFE COLOR HELPERS ───────────────────────────────────────
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color.trim());
}

export function safeColor(color: string | undefined | null, fallback: string = '#F59E0B'): string {
  if (!color || typeof color !== 'string') return fallback;
  const trimmed = color.trim();
  if (isValidHexColor(trimmed)) return trimmed;
  if (/^(rgb|hsl)a?\(.*\)$/i.test(trimmed)) return trimmed;
  return fallback;
}

export function hexToRgba(hexColor: string, alpha: number = 1, fallback: string = '#F59E0B'): string {
  const c = safeColor(hexColor, fallback);
  let hex = c.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((x) => x + x).join('');
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(245, 158, 11, ${alpha})`;
}

// ── COLOR PRESETS PALETTE ───────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'BridgeTech Blue', hex: '#040E40' },
  { name: 'Mastercard Gold', hex: '#F59E0B' },
  { name: 'Sunset Amber', hex: '#F97316' },
  { name: 'Neon Magenta', hex: '#EC4899' },
  { name: 'Electric Cyan', hex: '#06B6D4' },
  { name: 'Royal Sapphire', hex: '#2563EB' },
  { name: 'Cyber Violet', hex: '#8B5CF6' },
  { name: 'Emerald Jade', hex: '#10B981' },
  { name: 'Crimson Ruby', hex: '#E11D48' },
  { name: 'Rose Gold', hex: '#FB7185' },
  { name: 'Titanium Silver', hex: '#94A3B8' },
  { name: 'Deep Teal', hex: '#0D9488' },
];

// ── HELPER: DRAW REALISTIC 3D EMV CHIP & CONTACTLESS SYMBOL ─────────────────────
function drawEmvChip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isGold: boolean = true) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  const chipGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (isGold) {
    chipGrad.addColorStop(0, '#fef08a');
    chipGrad.addColorStop(0.25, '#d97706');
    chipGrad.addColorStop(0.5, '#fef9c3');
    chipGrad.addColorStop(0.75, '#b45309');
    chipGrad.addColorStop(1, '#fef08a');
  } else {
    chipGrad.addColorStop(0, '#f1f5f9');
    chipGrad.addColorStop(0.3, '#94a3b8');
    chipGrad.addColorStop(0.6, '#ffffff');
    chipGrad.addColorStop(1, '#64748b');
  }

  ctx.fillStyle = chipGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = isGold ? '#78350f' : '#334155';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.strokeStyle = isGold ? '#92400e' : '#475569';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x + w * 0.35, y);
  ctx.lineTo(x + w * 0.35, y + h);
  ctx.moveTo(x + w * 0.65, y);
  ctx.lineTo(x + w * 0.65, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.5);
  ctx.lineTo(x + w * 0.35, y + h * 0.5);
  ctx.moveTo(x + w * 0.65, y + h * 0.5);
  ctx.lineTo(x + w, y + h * 0.5);
  ctx.stroke();

  ctx.fillStyle = isGold ? '#b45309' : '#475569';
  ctx.beginPath();
  ctx.roundRect(x + w * 0.38, y + h * 0.3, w * 0.24, h * 0.4, 3);
  ctx.stroke();

  ctx.restore();
}

function drawContactlessSymbol(ctx: CanvasRenderingContext2D, x: number, y: number, color: string = 'rgba(255,255,255,0.7)') {
  ctx.save();
  ctx.strokeStyle = safeColor(color, 'rgba(255,255,255,0.7)');
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  const radii = [8, 15, 22, 29];
  radii.forEach((r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();
  });
  ctx.restore();
}

function drawInterlockingCircles(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, primary: string, secondary: string) {
  ctx.save();
  ctx.globalAlpha = 0.85;

  ctx.fillStyle = safeColor(primary, '#F59E0B');
  ctx.beginPath();
  ctx.arc(x - r * 0.6, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = safeColor(secondary, '#EF4444');
  ctx.beginPath();
  ctx.arc(x + r * 0.6, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── 3D SPECULAR SHEEN & CARD BEVEL ──────────────────────────────────────────────
function apply3DCardLightingAndBevel(ctx: CanvasRenderingContext2D, W: number, H: number, isPort: boolean, cornerRadius: number = 38) {
  ctx.save();

  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  sheen.addColorStop(0.28, 'rgba(255, 255, 255, 0.05)');
  sheen.addColorStop(0.48, 'transparent');
  sheen.addColorStop(0.7, 'rgba(255, 255, 255, 0.03)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  const radius = Math.max(16, cornerRadius || (isPort ? 34 : 38));

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1, 1, W - 2, H - 2, radius);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(3, 3, W - 6, H - 6, Math.max(12, radius - 2));
  ctx.stroke();

  ctx.restore();
}

// ── BACKGROUND IMAGE RENDERER ───────────────────────────────────────────────────
function drawBackgroundImage(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  bgImg: HTMLImageElement | null,
  bgImageOpacity: number,
  bgTintColor: string,
  bgTintOpacity: number
) {
  if (!bgImg || bgImg.width === 0) return;
  ctx.save();

  // Draw background photo at given opacity
  ctx.globalAlpha = Math.max(0, Math.min(1, bgImageOpacity));

  // Cover-fit: scale to fill card while maintaining aspect ratio
  const scaleW = W / bgImg.width;
  const scaleH = H / bgImg.height;
  const scale = Math.max(scaleW, scaleH);
  const drawW = bgImg.width * scale;
  const drawH = bgImg.height * scale;
  const offsetX = (W - drawW) / 2;
  const offsetY = (H - drawH) / 2;
  ctx.drawImage(bgImg, offsetX, offsetY, drawW, drawH);

  // Apply color tint overlay over the image
  if (bgTintOpacity > 0.01) {
    ctx.globalAlpha = Math.max(0, Math.min(0.92, bgTintOpacity));
    ctx.fillStyle = safeColor(bgTintColor, '#000000');
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}

// ── WAVE PATTERN DECORATOR ──────────────────────────────────────────────────────
// Draws beautiful auxiliary wave-line patterns on top of base gradients
function drawWavePatternDecorator(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  isPort: boolean,
  pattern: CardData['wavePattern'],
  primaryColor: string,
  secondaryColor: string,
  tertiaryColor: string,
  waveOpacity: number,
  curveIntensity: number,
  gradientPreset?: CardData['waveGradientPreset']
) {
  if (waveOpacity < 0.02) return;
  const k = Math.max(0.4, Math.min(2.0, curveIntensity));
  const primary = safeColor(primaryColor, '#F59E0B');
  const secondary = safeColor(secondaryColor, '#EC4899');
  const tertiary = safeColor(tertiaryColor, '#38BDF8');

  // Gradient Color Palette Resolver
  const getGradientColors = () => {
    switch (gradientPreset) {
      case 'vivid_chroma':
        return ['#F97316', '#EC4899', '#8B5CF6', '#06B6D4', '#10B981'];
      case 'sunset_flame':
        return ['#F43F5E', '#FB923C', '#FACC15', '#EA580C', '#BE123C'];
      case 'emerald_jade':
        return ['#10B981', '#06B6D4', '#059669', '#34D399', '#3B82F6'];
      case 'cyber_neon':
        return ['#A855F7', '#EC4899', '#06B6D4', '#3B82F6', '#10B981'];
      case 'liquid_gold':
        return ['#F59E0B', '#FEF08A', '#D97706', '#B45309', '#FBBF24'];
      case 'arctic_frost':
        return ['#38BDF8', '#818CF8', '#C084FC', '#E0F2FE', '#0284C7'];
      default: // 'card_colors'
        return [primary, secondary, tertiary, '#ffffff', primary];
    }
  };

  const palette = getGradientColors();

  // Create a reusable multi-stop linear gradient along canvas diagonal
  const createCanvasGrad = (x0: number, y0: number, x1: number, y1: number) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    palette.forEach((c, idx) => {
      g.addColorStop(idx / (palette.length - 1), c);
    });
    return g;
  };

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, waveOpacity));

  switch (pattern) {
    case 'gradient_ribbon_mesh': {
      // 3D Undulating Multi-Ribbon Gradient Mesh
      const numRibbons = Math.round(9 * k);
      for (let r = 0; r < numRibbons; r++) {
        const t = r / (numRibbons - 1);
        const grad = createCanvasGrad(0, 0, W, H);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5 + (1 - t) * 2;
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.85 - t * 0.45);
        ctx.beginPath();
        const baseH = isPort ? H * (0.3 + t * 0.45) : H * (0.4 + t * 0.45);
        const amp = (isPort ? 45 : 65) * k;
        const phase = t * Math.PI * 1.5;
        const length = isPort ? H : W;
        for (let x = -20; x <= length + 20; x += 6) {
          const y = baseH + Math.sin((x / length) * Math.PI * 3 + phase) * amp;
          if (isPort) {
            x === -20 ? ctx.moveTo(y, x) : ctx.lineTo(y, x);
          } else {
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'aurora_curtain': {
      // Radiant vertical Aurora Borealis curtain waves
      const numRays = Math.round(28 * k);
      const stepX = W / numRays;
      for (let i = 0; i < numRays; i++) {
        const x = i * stepX;
        const grad = ctx.createLinearGradient(x, 0, x, H);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.3, hexToRgba(palette[i % palette.length], 0.7));
        grad.addColorStop(0.7, hexToRgba(palette[(i + 2) % palette.length], 0.85));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = stepX * 1.5;
        ctx.beginPath();
        const waveOffset = Math.sin((i / numRays) * Math.PI * 4 * k) * (isPort ? 40 : 60);
        ctx.moveTo(x + waveOffset, 0);
        ctx.bezierCurveTo(x + waveOffset + 30, H * 0.35, x - waveOffset - 30, H * 0.65, x + waveOffset, H);
        ctx.stroke();
      }
      break;
    }

    case 'topographic_streamlines': {
      // Fluid aerodynamic contour streamlines
      const numLines = Math.round(14 * k);
      for (let i = 0; i < numLines; i++) {
        const t = i / numLines;
        const grad = createCanvasGrad(0, H * t, W, H * (1 - t));
        ctx.strokeStyle = grad;
        ctx.lineWidth = i % 4 === 0 ? 2.8 : 1.4;
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.3 + t * 0.6);
        ctx.beginPath();
        const startY = isPort ? H * (0.15 + t * 0.7) : H * (0.2 + t * 0.7);
        ctx.moveTo(-30, startY);
        ctx.bezierCurveTo(
          W * (0.3 + Math.sin(t * Math.PI * 2) * 0.15 * k),
          startY - (isPort ? 70 : 90) * k,
          W * (0.65 + Math.cos(t * Math.PI * 2) * 0.15 * k),
          startY + (isPort ? 70 : 90) * k,
          W + 30,
          startY + Math.sin(t * 5) * 20
        );
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'guilloche_spiro': {
      // Banknote security guilloche rosette waves
      const cx = isPort ? W * 0.5 : W * 0.8;
      const cy = isPort ? H * 0.3 : H * 0.5;
      const R = (isPort ? W * 0.42 : H * 0.42) * k;
      const r = R * 0.35;
      const d = R * 0.65;

      const grad = createCanvasGrad(0, 0, W, H);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let theta = 0; theta < Math.PI * 12; theta += 0.04) {
        const x = cx + (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
        const y = cy + (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);
        theta === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }

    case 'guilloche_rosette_medallion': {
      // Central multi-lobe banknote security medallion rosette seal
      const cx = isPort ? W * 0.5 : W * 0.8;
      const cy = isPort ? H * 0.32 : H * 0.5;
      const maxR = (isPort ? W * 0.45 : H * 0.45) * k;
      const lobes = 12;

      for (let ring = 1; ring <= 8; ring++) {
        const rRatio = ring / 8;
        const radius = maxR * rRatio;
        const amp = (maxR * 0.12) * Math.sin(ring);
        const grad = createCanvasGrad(cx - radius, cy - radius, cx + radius, cy + radius);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.1 + (ring % 2 === 0 ? 0.8 : 0);
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.5 + rRatio * 0.5);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.03) {
          const modR = radius + Math.sin(a * lobes + ring * 0.4) * amp;
          const px = cx + modR * Math.cos(a);
          const py = cy + modR * Math.sin(a);
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'guilloche_fluted_waves': {
      // Swiss watchmaker fluted wave lathe pattern (dense oscillating sine bundles)
      const numStrands = Math.round(24 * k);
      const grad = createCanvasGrad(0, 0, W, H);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.0;
      const length = isPort ? H : W;
      const mid = isPort ? W * 0.5 : H * 0.5;

      for (let s = 0; s < numStrands; s++) {
        const t = s / numStrands;
        const offset = (s - numStrands / 2) * (isPort ? 7 : 5);
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.4 + Math.sin(t * Math.PI) * 0.55);
        ctx.beginPath();
        for (let x = -20; x <= length + 20; x += 3) {
          const freq1 = (x / length) * Math.PI * 6;
          const freq2 = (x / length) * Math.PI * 14;
          const y = mid + offset + Math.sin(freq1 + s * 0.12) * (isPort ? 45 : 55) * k + Math.cos(freq2 + s * 0.2) * (isPort ? 15 : 20) * k;
          if (isPort) {
            x === -20 ? ctx.moveTo(y, x) : ctx.lineTo(y, x);
          } else {
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'guilloche_moire_grid': {
      // Dual-grid optical moiré interference security waves
      const numLines = Math.round(18 * k);
      const grad1 = createCanvasGrad(0, 0, W, H);
      const grad2 = createCanvasGrad(W, 0, 0, H);

      for (let i = 0; i < numLines; i++) {
        const t = i / numLines;
        // Grid 1
        ctx.strokeStyle = grad1;
        ctx.lineWidth = 1.2;
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.55);
        ctx.beginPath();
        const y1 = H * (0.1 + t * 0.8);
        for (let x = 0; x <= W; x += 5) {
          const cy = y1 + Math.sin((x / W) * Math.PI * 5 + t * 2) * 30 * k;
          x === 0 ? ctx.moveTo(x, cy) : ctx.lineTo(x, cy);
        }
        ctx.stroke();
        ctx.restore();

        // Grid 2 (slightly shifted frequency creating moiré fringes)
        ctx.strokeStyle = grad2;
        ctx.lineWidth = 1.0;
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.45);
        ctx.beginPath();
        const y2 = H * (0.12 + t * 0.8);
        for (let x = 0; x <= W; x += 5) {
          const cy = y2 + Math.sin((x / W) * Math.PI * 5.2 + t * 2.2 + 0.5) * 32 * k;
          x === 0 ? ctx.moveTo(x, cy) : ctx.lineTo(x, cy);
        }
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'guilloche_rhodonea_rose': {
      // Mathematical Rhodonea polar rose curves
      const cx = isPort ? W * 0.5 : W * 0.8;
      const cy = isPort ? H * 0.32 : H * 0.5;
      const maxR = (isPort ? W * 0.44 : H * 0.44) * k;
      const petalPetals = [4, 6, 8, 12];

      petalPetals.forEach((p, pIdx) => {
        const grad = createCanvasGrad(cx - maxR, cy - maxR, cx + maxR, cy + maxR);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.7 - pIdx * 0.12);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 4; a += 0.03) {
          const r = maxR * (0.6 + pIdx * 0.12) * Math.cos((p / 2) * a);
          const px = cx + r * Math.cos(a + pIdx * 0.2);
          const py = cy + r * Math.sin(a + pIdx * 0.2);
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      });
      break;
    }

    case 'guilloche_infinity_lemniscate': {
      // Infinity lemniscate figure-8 orbital wave ribbons
      const cx = isPort ? W * 0.5 : W * 0.75;
      const cy = isPort ? H * 0.35 : H * 0.5;
      const a = (isPort ? W * 0.42 : W * 0.32) * k;
      const numCurves = Math.round(16 * k);

      for (let i = 0; i < numCurves; i++) {
        const tRatio = i / numCurves;
        const grad = createCanvasGrad(cx - a, cy - a, cx + a, cy + a);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.4 + tRatio * 0.5);
        ctx.beginPath();
        const scale = 1 - tRatio * 0.35;
        const rot = i * 0.08;
        for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.04) {
          const denom = 1 + Math.sin(t) * Math.sin(t);
          const lx = (a * scale * Math.cos(t)) / denom;
          const ly = (a * scale * Math.sin(t) * Math.cos(t)) / denom;
          // Rotate
          const rx = lx * Math.cos(rot) - ly * Math.sin(rot);
          const ry = lx * Math.sin(rot) + ly * Math.cos(rot);
          t === 0 ? ctx.moveTo(cx + rx, cy + ry) : ctx.lineTo(cx + rx, cy + ry);
        }
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'guilloche_braided_sinusoid': {
      // Tri-axial braided sinusoidal wave ribbons
      const numRibbons = 3;
      const length = isPort ? H : W;
      const mid = isPort ? W * 0.5 : H * 0.55;
      const amp = (isPort ? 55 : 70) * k;

      for (let r = 0; r < numRibbons; r++) {
        const phase = (r / numRibbons) * Math.PI * 2;
        const grad = createCanvasGrad(0, 0, W, H);
        for (let strand = -3; strand <= 3; strand++) {
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.4;
          ctx.save();
          ctx.globalAlpha = waveOpacity * (0.7 - Math.abs(strand) * 0.15);
          ctx.beginPath();
          const offset = strand * 5;
          for (let x = -20; x <= length + 20; x += 4) {
            const y = mid + offset + Math.sin((x / length) * Math.PI * 4 + phase) * amp;
            if (isPort) {
              x === -20 ? ctx.moveTo(y, x) : ctx.lineTo(y, x);
            } else {
              x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      break;
    }

    case 'lissajous_harmonics': {
      // Glowing mathematical Lissajous figure orbital wave loops
      const cx = isPort ? W * 0.5 : W * 0.75;
      const cy = isPort ? H * 0.32 : H * 0.5;
      const A = (isPort ? W * 0.42 : W * 0.32) * k;
      const B = (isPort ? H * 0.28 : H * 0.38) * k;
      const a = 3;
      const b = 4;
      const delta = Math.PI / 2;

      for (let layer = 0; layer < 4; layer++) {
        const grad = createCanvasGrad(cx - A, cy - B, cx + A, cy + B);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3 - layer * 0.6;
        ctx.save();
        ctx.globalAlpha = waveOpacity * (0.8 - layer * 0.18);
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.03) {
          const x = cx + A * (1 - layer * 0.12) * Math.sin(a * t + delta + layer * 0.2);
          const y = cy + B * (1 - layer * 0.12) * Math.sin(b * t);
          t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'dna_helix': {
      // 3D Twisting bio-tech double helix wave strands
      const numPoints = Math.round(28 * k);
      const length = isPort ? H : W;
      const step = length / numPoints;
      const mid = isPort ? W * 0.5 : H * 0.55;
      const amp = (isPort ? 45 : 55) * k;

      for (let i = 0; i < numPoints; i++) {
        const pos = i * step;
        const ang = (i / numPoints) * Math.PI * 6;
        const y1 = mid + Math.sin(ang) * amp;
        const y2 = mid - Math.sin(ang) * amp;

        // Connector rung
        const rungGrad = ctx.createLinearGradient(0, y1, 0, y2);
        rungGrad.addColorStop(0, palette[0]);
        rungGrad.addColorStop(1, palette[1]);
        ctx.strokeStyle = rungGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (isPort) {
          ctx.moveTo(y1, pos); ctx.lineTo(y2, pos);
        } else {
          ctx.moveTo(pos, y1); ctx.lineTo(pos, y2);
        }
        ctx.stroke();

        // Node dots
        ctx.fillStyle = palette[i % palette.length];
        ctx.beginPath();
        if (isPort) {
          ctx.arc(y1, pos, 3.5, 0, Math.PI * 2);
          ctx.arc(y2, pos, 3.5, 0, Math.PI * 2);
        } else {
          ctx.arc(pos, y1, 3.5, 0, Math.PI * 2);
          ctx.arc(pos, y2, 3.5, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      break;
    }

    case 'fluid_vortex': {
      // Dual swirl whirlpool spiral wave streams
      const sx = isPort ? W * 0.5 : W * 0.8;
      const sy = isPort ? H * 0.35 : H * 0.5;
      const numArms = 8;
      for (let arm = 0; arm < numArms; arm++) {
        const baseAng = (arm / numArms) * Math.PI * 2;
        const grad = createCanvasGrad(sx, sy, sx + W * 0.5, sy + H * 0.5);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let r = 10; r < Math.max(W, H) * 0.7 * k; r += 8) {
          const ang = baseAng + (r / 45) * k;
          const px = sx + r * Math.cos(ang);
          const py = sy + r * Math.sin(ang);
          r === 10 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      break;
    }

    case 'sine': {
      // Multi-frequency sine waveforms rendered with gradient strokes
      const layers = [
        { amp: 55 * k, freq: 2.5, phase: 0, lw: 3.0 },
        { amp: 40 * k, freq: 3.8, phase: 0.9, lw: 2.2 },
        { amp: 25 * k, freq: 6.2, phase: 1.7, lw: 1.5 },
        { amp: 70 * k, freq: 1.2, phase: 2.5, lw: 4.0, alpha: 0.4 },
      ];
      layers.forEach((l, idx) => {
        ctx.save();
        if (l.alpha) ctx.globalAlpha *= l.alpha;
        ctx.strokeStyle = createCanvasGrad(0, 0, W, H);
        ctx.lineWidth = l.lw;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const midY = isPort ? H * 0.4 : H * 0.5;
        for (let x = 0; x <= W; x += 6) {
          const y = midY + Math.sin((x / W) * Math.PI * l.freq + l.phase) * l.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      });
      break;
    }

    case 'ripple': {
      // Expanding ripple rings emanating from two focal points
      const foci = isPort
        ? [{ x: W * 0.5, y: H * 0.28 }, { x: W * 0.5, y: H * 0.72 }]
        : [{ x: W * 0.25, y: H * 0.5 }, { x: W * 0.75, y: H * 0.5 }];

      foci.forEach((focus, fi) => {
        for (let r = 30; r < Math.max(W, H) * 0.85 * k; r += 36) {
          const alpha = Math.max(0.04, 0.65 - (r / (Math.max(W, H) * 0.85 * k)) * 0.6);
          ctx.save();
          ctx.globalAlpha *= alpha;
          ctx.strokeStyle = createCanvasGrad(focus.x - r, focus.y - r, focus.x + r, focus.y + r);
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(focus.x, focus.y, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });
      break;
    }

    case 'diagonal_lines': {
      // Fine diagonal gradient hatching stripes
      const spacing = Math.round(22 / k);
      const lw = 1.4;
      for (let i = -H; i < W + H; i += spacing) {
        ctx.strokeStyle = createCanvasGrad(i, 0, i + H, H);
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + H, H);
        ctx.stroke();
      }
      break;
    }

    case 'concentric': {
      // Concentric rounded rectangles — gradient frame glow
      const steps = Math.round(8 * k);
      for (let s = 1; s <= steps; s++) {
        const progress = s / steps;
        const inset = s * (Math.min(W, H) * 0.055);
        const alpha = (1 - progress) * 0.75;
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.strokeStyle = createCanvasGrad(inset, inset, W - inset, H - inset);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const r = Math.max(8, 38 - inset * 0.5);
        ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, r);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'chevron': {
      // Gradient V-shaped chevron arrow wave stripes
      const chevH = Math.round(34 * k);
      const steps = Math.ceil(H / chevH) + 2;
      for (let s = -1; s < steps; s++) {
        const baseY = s * chevH;
        const alpha = 0.6 - (Math.abs(s - steps / 2) / (steps / 2)) * 0.35;
        ctx.save();
        ctx.globalAlpha *= Math.max(0.08, alpha);
        ctx.strokeStyle = createCanvasGrad(0, baseY, W, baseY + chevH);
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(0, baseY + chevH * 0.5);
        ctx.lineTo(W * 0.5, baseY);
        ctx.lineTo(W, baseY + chevH * 0.5);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'dot_matrix': {
      // Cyber LED micro-dot array with gradient fading
      const dotSpacing = Math.round(26 / k);
      for (let x = 14; x < W; x += dotSpacing) {
        for (let y = 14; y < H; y += dotSpacing) {
          const dist = Math.sqrt(Math.pow(x - W * 0.5, 2) + Math.pow(y - H * 0.5, 2));
          const alpha = Math.max(0.06, 0.7 - dist / (Math.max(W, H) * 0.6));
          ctx.save();
          ctx.globalAlpha *= alpha;
          const colorIdx = (Math.floor(x / dotSpacing) + Math.floor(y / dotSpacing)) % palette.length;
          ctx.fillStyle = palette[colorIdx];
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      break;
    }

    case 'isometric_cube': {
      // 3D Isometric wireframe cube matrix with gradient strokes
      const size = Math.round(44 * k);
      ctx.lineWidth = 1.4;
      for (let y = -size; y < H + size; y += size * 1.5) {
        for (let x = -size; x < W + size; x += Math.sqrt(3) * size) {
          ctx.strokeStyle = createCanvasGrad(x - size, y - size, x + size, y + size);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const ang = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + size * Math.cos(ang);
            const py = y + size * Math.sin(ang);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x, y); ctx.lineTo(x, y - size);
          ctx.moveTo(x, y); ctx.lineTo(x + size * Math.cos(Math.PI / 6), y + size * Math.sin(Math.PI / 6));
          ctx.moveTo(x, y); ctx.lineTo(x - size * Math.cos(Math.PI / 6), y + size * Math.sin(Math.PI / 6));
          ctx.stroke();
        }
      }
      break;
    }

    case 'circuit_flux': {
      // Microchip circuit traces with PCB solder nodes and glowing gradients
      const traces = [
        [0, H * 0.25, W * 0.3, H * 0.25, W * 0.45, H * 0.5, W * 0.75, H * 0.5, W, H * 0.5],
        [0, H * 0.7, W * 0.25, H * 0.7, W * 0.4, H * 0.85, W * 0.8, H * 0.85, W, H * 0.85],
        [W * 0.6, 0, W * 0.6, H * 0.3, W * 0.85, H * 0.3, W * 0.85, H],
      ];
      traces.forEach((pts, ti) => {
        ctx.strokeStyle = createCanvasGrad(pts[0], pts[1], pts[pts.length - 2], pts[pts.length - 1]);
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.stroke();
        for (let i = 0; i < pts.length; i += 2) {
          ctx.fillStyle = palette[i % palette.length];
          ctx.beginPath(); ctx.arc(pts[i], pts[i + 1], 4.5, 0, Math.PI * 2); ctx.fill();
        }
      });
      break;
    }

    default: // 'bezier' — multiple sweeping Bezier curves with rich gradients
    {
      const bezierLayers = [
        { offY: 0, lw: 4.0, phase: 0, alpha: 0.9 },
        { offY: isPort ? 50 : 35, lw: 3.0, phase: Math.PI * 0.4, alpha: 0.75 },
        { offY: isPort ? 100 : 70, lw: 2.0, phase: Math.PI * 0.8, alpha: 0.6 },
        { offY: isPort ? 150 : 105, lw: 1.5, phase: Math.PI * 1.2, alpha: 0.45 },
        { offY: isPort ? -50 : -35, lw: 4.5, phase: Math.PI * 1.6, alpha: 0.35 },
      ];
      bezierLayers.forEach((l) => {
        ctx.save();
        ctx.globalAlpha *= l.alpha;
        ctx.strokeStyle = createCanvasGrad(0, 0, W, H);
        ctx.lineWidth = l.lw;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (isPort) {
          const midY = H * 0.42 + l.offY;
          ctx.moveTo(-40, midY);
          ctx.bezierCurveTo(W * (0.38 * k), midY - 90 * k, W * (0.62 * k), midY + 90 * k, W + 40, midY + l.phase * 10);
        } else {
          const midY = H * 0.52 + l.offY;
          ctx.moveTo(-40, midY);
          ctx.bezierCurveTo(W * (0.32 * k), midY - 70 * k, W * (0.68 * k), midY + 70 * k, W + 40, midY + l.phase * 6);
        }
        ctx.stroke();
        ctx.restore();
      });
      break;
    }
  }

  ctx.restore();
}

// ── MASTER TEMPLATES COLLECTION (EXPANDED ARTISTIC CURVED DESIGNS) ──────────────
const MASTER_TEMPLATES: CardTemplateConfig[] = [
  // ══════════════════════════════════════════════════════════════════
  // ── 1. ARTISTIC CURVED DESIGNS (9 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 1.1 FLUID CHROMA WAVE
  {
    id: 'fluid_chroma_wave',
    name: 'Fluid Chroma Wave & Sunset Flame',
    category: 'curved_artistic',
    industry: 'Modern Studio / Creative / Agency',
    tagline: 'Multi-layered 3D Bezier curved waves in sunset amber, magenta & violet',
    theme: 'colorful',
    defaultAccent: '#F97316',
    defaultSecondary: '#EC4899',
    badgeIcon: '🌊',
    previewGradient: 'from-orange-500 via-rose-500 to-purple-700',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F97316');
      const secondary = safeColor(data.secondaryColor, '#EC4899');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0a0914');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Layer 1: Violet Deep Wave
      const w1 = ctx.createLinearGradient(0, 0, W, H);
      w1.addColorStop(0, '#3b0764');
      w1.addColorStop(0.5, '#701a75');
      w1.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = w1;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * (0.35 - (k - 1) * 0.1));
        ctx.bezierCurveTo(W * 0.5, H * (0.2 * k), W * 0.5, H * (0.6 * k), W, H * 0.45);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      } else {
        ctx.moveTo(0, H * (0.55 - (k - 1) * 0.15));
        ctx.bezierCurveTo(W * 0.35, H * (0.2 * k), W * 0.65, H * (0.8 * k), W, H * 0.35);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      }
      ctx.closePath();
      ctx.fill();

      // Layer 2: Magenta S-Wave
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      const w2 = ctx.createLinearGradient(0, 0, W, 0);
      w2.addColorStop(0, secondary);
      w2.addColorStop(1, '#8B5CF6');
      ctx.fillStyle = w2;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * (0.48 - (k - 1) * 0.1));
        ctx.bezierCurveTo(W * 0.4, H * (0.38 * k), W * 0.6, H * (0.75 * k), W, H * 0.62);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      } else {
        ctx.moveTo(0, H * (0.72 - (k - 1) * 0.15));
        ctx.bezierCurveTo(W * 0.4, H * (0.45 * k), W * 0.7, H * (0.95 * k), W, H * 0.58);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      }
      ctx.closePath();
      ctx.fill();

      // Layer 3: Sunset Ribbon
      const w3 = ctx.createLinearGradient(0, 0, W, H);
      w3.addColorStop(0, primary);
      w3.addColorStop(0.6, '#fb7185');
      w3.addColorStop(1, '#facc15');
      ctx.fillStyle = w3;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * (0.68 - (k - 1) * 0.1));
        ctx.bezierCurveTo(W * 0.45, H * (0.58 * k), W * 0.55, H * (0.92 * k), W, H * 0.82);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      } else {
        ctx.moveTo(0, H * (0.88 - (k - 1) * 0.15));
        ctx.bezierCurveTo(W * 0.45, H * (0.68 * k), W * 0.65, H * (1.1 * k), W, H * 0.78);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.restore();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, '#ffffff', '#ffffff', '#fed7aa', photoImg, logoImg, '🌊', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.2 PRISM RAINBOW HOLOGRAPHIC WAVE
  {
    id: 'prism_rainbow_wave',
    name: 'Prism Rainbow Hologram & Refraction',
    category: 'curved_artistic',
    industry: 'Creative / Fashion / Web3 / Design',
    tagline: 'Luminous iridescent multi-spectral curved light ribbons shimmering across slate',
    theme: 'colorful',
    defaultAccent: '#EC4899',
    defaultSecondary: '#06B6D4',
    badgeIcon: '🌈',
    previewGradient: 'from-pink-500 via-amber-400 to-cyan-400',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EC4899');
      const secondary = safeColor(data.secondaryColor, '#06B6D4');

      ctx.fillStyle = safeColor(data.cardBgColor, '#070b19');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const colors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#c084fc'];
      colors.forEach((c, idx) => {
        const offset = (idx - 3) * (18 * k);
        ctx.strokeStyle = c;
        ctx.lineWidth = 14;
        ctx.beginPath();
        if (isPort) {
          ctx.moveTo(-40, H * 0.4 + offset);
          ctx.bezierCurveTo(W * 0.4, H * 0.15 + offset, W * 0.6, H * 0.85 + offset, W + 40, H * 0.6 + offset);
        } else {
          ctx.moveTo(-40, H * 0.75 + offset);
          ctx.bezierCurveTo(W * 0.35, H * 0.2 + offset, W * 0.65, H * 0.95 + offset, W + 40, H * 0.4 + offset);
        }
        ctx.stroke();
      });
      ctx.restore();

      ctx.fillStyle = safeColor(data.cardBgColor, 'rgba(7, 11, 25, 0.45)');
      ctx.fillRect(0, 0, W, H);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e0f2fe', photoImg, logoImg, '🌈', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.3 COSMIC IRIDESCENT S-CURVE
  {
    id: 'cosmic_iridescent_curve',
    name: 'Cosmic Iridescent S-Curve & Aurora',
    category: 'curved_artistic',
    industry: 'High-Tech / AI / FinTech / Modern',
    tagline: 'Sweeping dual-tone curved wave splitting dark void and glowing neon teal',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#8B5CF6',
    badgeIcon: '🌌',
    previewGradient: 'from-cyan-500 via-teal-700 to-indigo-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#8B5CF6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#050711');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const sGrad = ctx.createLinearGradient(0, 0, W, H);
      sGrad.addColorStop(0, primary);
      sGrad.addColorStop(0.5, '#0ea5e9');
      sGrad.addColorStop(1, secondary);

      ctx.fillStyle = sGrad;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(W * 0.4, 0);
        ctx.bezierCurveTo(W * (1.1 * k), H * 0.35, -W * (0.1 * k), H * 0.65, W * 0.7, H);
        ctx.lineTo(W, H); ctx.lineTo(W, 0);
      } else {
        ctx.moveTo(W * 0.55, 0);
        ctx.bezierCurveTo(W * (0.85 * k), H * 0.3, W * (0.35 / k), H * 0.7, W * 0.75, H);
        ctx.lineTo(W, H); ctx.lineTo(W, 0);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e0f2fe', photoImg, logoImg, '🌌', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.4 SUNSET TROPIC DUAL-ARC
  {
    id: 'sunset_tropic_arcs',
    name: 'Sunset Tropic & Coral Dual-Arc',
    category: 'curved_artistic',
    industry: 'Hospitality / Travel / Lifestyle / Events',
    tagline: 'Warm tropical coral, apricot and gold sweeping curved double arcs',
    theme: 'colorful',
    defaultAccent: '#F97316',
    defaultSecondary: '#FB7185',
    badgeIcon: '🌺',
    previewGradient: 'from-amber-400 via-orange-500 to-rose-600',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F97316');
      const secondary = safeColor(data.secondaryColor, '#FB7185');

      ctx.fillStyle = safeColor(data.cardBgColor, '#1c0a18');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Arc 1
      const g1 = ctx.createLinearGradient(0, 0, W, H);
      g1.addColorStop(0, primary);
      g1.addColorStop(1, '#fde047');
      ctx.fillStyle = g1;
      ctx.beginPath();
      if (isPort) {
        ctx.arc(W * 0.5, H * 0.9, W * 0.75 * k, 0, Math.PI * 2);
      } else {
        ctx.arc(W * 0.85, H * 0.5, H * 0.85 * k, 0, Math.PI * 2);
      }
      ctx.fill();

      // Arc 2
      const g2 = ctx.createLinearGradient(0, 0, 0, H);
      g2.addColorStop(0, secondary);
      g2.addColorStop(1, '#a855f7');
      ctx.fillStyle = g2;
      ctx.beginPath();
      if (isPort) {
        ctx.arc(W * 0.5, H * 0.95, W * 0.52 * k, 0, Math.PI * 2);
      } else {
        ctx.arc(W * 0.9, H * 0.55, H * 0.6 * k, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, '#ffffff', '#ffffff', '#fed7aa', photoImg, logoImg, '🌺', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.5 LIQUID MOLTEN GOLD & CARBON WAVE
  {
    id: 'molten_gold_wave',
    name: 'Liquid Molten Gold & Carbon Wave',
    category: 'curved_artistic',
    industry: 'Luxury Real Estate / Private Wealth / VIP',
    tagline: 'Flowing 24K liquid gold wave ribbon over carbon obsidian texture',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#D97706',
    badgeIcon: '👑',
    previewGradient: 'from-amber-300 via-yellow-600 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#D97706');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0a0a0c');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Carbon texture lines
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 8) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Molten Gold Ribbon
      const goldGrad = ctx.createLinearGradient(0, 0, W, H);
      goldGrad.addColorStop(0, '#78350f');
      goldGrad.addColorStop(0.3, secondary);
      goldGrad.addColorStop(0.55, '#fef08a');
      goldGrad.addColorStop(0.75, primary);
      goldGrad.addColorStop(1, '#451a03');

      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * 0.45);
        ctx.bezierCurveTo(W * 0.4, H * (0.35 * k), W * 0.6, H * (0.85 * k), W, H * 0.65);
        ctx.lineTo(W, H * 0.85);
        ctx.bezierCurveTo(W * 0.6, H * (1.0 * k), W * 0.35, H * (0.55 * k), 0, H * 0.65);
      } else {
        ctx.moveTo(0, H * 0.65);
        ctx.bezierCurveTo(W * 0.35, H * (0.35 * k), W * 0.7, H * (1.05 * k), W, H * 0.55);
        ctx.lineTo(W, H * 0.8);
        ctx.bezierCurveTo(W * 0.7, H * (1.2 * k), W * 0.35, H * (0.55 * k), 0, H * 0.85);
      }
      ctx.closePath();
      ctx.fill();

      // Gold Sheen stroke
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fef08a', photoImg, logoImg, '👑', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.6 ELECTRIC CYBER SINE WAVE
  {
    id: 'electric_sine_wave',
    name: 'Electric Cyber Sine & Pulse Wave',
    category: 'curved_artistic',
    industry: 'Software / Cyber / AI / Audio / Music',
    tagline: 'Multi-harmonic audio frequency sine waveforms oscillating across dark space',
    theme: 'dark',
    defaultAccent: '#10B981',
    defaultSecondary: '#06B6D4',
    badgeIcon: '⚡',
    previewGradient: 'from-emerald-400 via-teal-600 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#10B981');
      const secondary = safeColor(data.secondaryColor, '#06B6D4');

      ctx.fillStyle = safeColor(data.cardBgColor, '#030d14');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Sine Wave Harmonics
      [1, 2, 3, 4].forEach((harmonic, idx) => {
        const color = idx % 2 === 0 ? primary : secondary;
        ctx.strokeStyle = hexToRgba(color, 0.7 - idx * 0.12);
        ctx.lineWidth = 3 - idx * 0.5;
        ctx.beginPath();
        const baseH = isPort ? H * (0.4 + idx * 0.08) : H * (0.55 + idx * 0.06);
        const amp = (isPort ? 35 : 45) * k;
        const freq = (harmonic * Math.PI * 2) / (isPort ? H : W);

        const length = isPort ? H : W;
        for (let t = 0; t <= length; t += 6) {
          const val = baseH + Math.sin(t * freq) * amp;
          if (isPort) {
            t === 0 ? ctx.moveTo(val, t) : ctx.lineTo(val, t);
          } else {
            t === 0 ? ctx.moveTo(t, val) : ctx.lineTo(t, val);
          }
        }
        ctx.stroke();
      });
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '⚡', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.7 ZENITH EMERALD & MINT FLUID WAVE
  {
    id: 'emerald_bio_flow',
    name: 'Zenith Emerald & Mint Fluid Wave',
    category: 'curved_artistic',
    industry: 'CleanTech / Biotech / Sustainability / Eco',
    tagline: 'Deep emerald base with translucent jade and mint organic flowing ribbons',
    theme: 'dark',
    defaultAccent: '#059669',
    defaultSecondary: '#34D399',
    badgeIcon: '🍃',
    previewGradient: 'from-emerald-500 via-teal-700 to-green-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#059669');
      const secondary = safeColor(data.secondaryColor, '#34D399');

      ctx.fillStyle = safeColor(data.cardBgColor, '#021814');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const jGrad = ctx.createLinearGradient(0, 0, W, H);
      jGrad.addColorStop(0, '#047857');
      jGrad.addColorStop(0.5, primary);
      jGrad.addColorStop(1, '#06B6D4');

      ctx.fillStyle = jGrad;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * 0.4);
        ctx.bezierCurveTo(W * (0.6 * k), H * 0.25, W * (0.4 / k), H * 0.75, W, H * 0.55);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      } else {
        ctx.moveTo(0, H * 0.65);
        ctx.bezierCurveTo(W * (0.4 * k), H * 0.35, W * (0.6 / k), H * 0.85, W, H * 0.45);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      }
      ctx.closePath();
      ctx.fill();

      // Mint Highlight Ribbon
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * 0.4);
        ctx.bezierCurveTo(W * (0.6 * k), H * 0.25, W * (0.4 / k), H * 0.75, W, H * 0.55);
      } else {
        ctx.moveTo(0, H * 0.65);
        ctx.bezierCurveTo(W * (0.4 * k), H * 0.35, W * (0.6 / k), H * 0.85, W, H * 0.45);
      }
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '🍃', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.8 ARTISAN ABSTRACT FLUID ACRYLIC
  {
    id: 'abstract_acrylic_swirl',
    name: 'Artisan Abstract Fluid Acrylic',
    category: 'curved_artistic',
    industry: 'Fine Arts / Interior Design / Architecture',
    tagline: 'Swirling high-contrast acrylic paint curves with marbling texture',
    theme: 'colorful',
    defaultAccent: '#EA580C',
    defaultSecondary: '#3B82F6',
    badgeIcon: '🎨',
    previewGradient: 'from-orange-500 via-purple-600 to-blue-500',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EA580C');
      const secondary = safeColor(data.secondaryColor, '#3B82F6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0f172a');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Swirl 1
      const swirl1 = ctx.createRadialGradient(W * 0.8, H * 0.2, 20, W * 0.8, H * 0.2, W * 0.7 * k);
      swirl1.addColorStop(0, primary);
      swirl1.addColorStop(0.5, '#ec4899');
      swirl1.addColorStop(1, 'transparent');
      ctx.fillStyle = swirl1;
      ctx.fillRect(0, 0, W, H);

      // Swirl 2
      const swirl2 = ctx.createRadialGradient(W * 0.2, H * 0.8, 20, W * 0.2, H * 0.8, W * 0.65 * k);
      swirl2.addColorStop(0, secondary);
      swirl2.addColorStop(0.6, '#8b5cf6');
      swirl2.addColorStop(1, 'transparent');
      ctx.fillStyle = swirl2;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fed7aa', photoImg, logoImg, '🎨', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.9 MINIMALIST STUDIO PEARL & CORAL RIBBON
  {
    id: 'minimal_flowing_ribbon',
    name: 'Minimalist Studio Pearl & Coral Ribbon',
    category: 'curved_artistic',
    industry: 'Boutique / Wellness / Luxury Consulting',
    tagline: 'Light porcelain backdrop with single elegant curved silk coral ribbon',
    theme: 'light',
    defaultAccent: '#F43F5E',
    defaultSecondary: '#FB7185',
    badgeIcon: '▪️',
    previewGradient: 'from-slate-100 via-rose-100 to-slate-200',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F43F5E');
      const secondary = safeColor(data.secondaryColor, '#FB7185');

      ctx.fillStyle = safeColor(data.cardBgColor, '#f8fafc');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Coral Ribbon
      const rGrad = ctx.createLinearGradient(0, 0, W, H);
      rGrad.addColorStop(0, hexToRgba(primary, 0.85));
      rGrad.addColorStop(1, hexToRgba(secondary, 0.45));

      ctx.fillStyle = rGrad;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(W, H * 0.45);
        ctx.bezierCurveTo(W * (0.2 / k), H * 0.6, W * (0.8 * k), H * 0.8, 0, H * 0.9);
        ctx.lineTo(0, H); ctx.lineTo(W, H);
      } else {
        ctx.moveTo(W * 0.4, 0);
        ctx.bezierCurveTo(W * (0.6 * k), H * 0.4, W * (0.3 / k), H * 0.7, W * 0.85, H);
        ctx.lineTo(W, H); ctx.lineTo(W, 0);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, '#0f172a', '#0f172a', '#475569', photoImg, logoImg, '▪️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, '#0f172a', '#0f172a', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.10 AURORA BOREALIS LUMINOUS GRADIENT WAVES
  {
    id: 'aurora_borealis_waves',
    name: 'Aurora Borealis Luminous Gradient Waves',
    category: 'curved_artistic',
    industry: 'Astronomy / Nordic Luxury / Eco Tourism / Creative',
    tagline: 'Luminous shifting northern lights gradient wave ribbons flowing across starry night void',
    theme: 'colorful',
    defaultAccent: '#10B981',
    defaultSecondary: '#8B5CF6',
    badgeIcon: '🌌',
    previewGradient: 'from-emerald-400 via-teal-500 to-indigo-900',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#10B981');
      const secondary = safeColor(data.secondaryColor, '#8B5CF6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#030814');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Aurora Wave Curtains
      const numWaves = 6;
      for (let w = 0; w < numWaves; w++) {
        const t = w / (numWaves - 1);
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.35, '#06B6D4');
        grad.addColorStop(0.7, secondary);
        grad.addColorStop(1, '#EC4899');

        ctx.fillStyle = grad;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.45 - t * 0.05);
        ctx.beginPath();
        const baseH = isPort ? H * (0.35 + t * 0.1) : H * (0.45 + t * 0.08);
        if (isPort) {
          ctx.moveTo(0, baseH);
          ctx.bezierCurveTo(W * 0.4 * k, baseH - 80 * k, W * 0.6 * k, baseH + 110 * k, W, baseH - 20);
          ctx.lineTo(W, H); ctx.lineTo(0, H);
        } else {
          ctx.moveTo(0, baseH);
          ctx.bezierCurveTo(W * 0.35 * k, baseH - 90 * k, W * 0.65 * k, baseH + 120 * k, W, baseH - 30);
          ctx.lineTo(W, H); ctx.lineTo(0, H);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '🌌', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.11 BANKNOTE SECURITY GUILLOCHE WAVE RIBBON
  {
    id: 'guilloche_luxury_banknote',
    name: 'Banknote Security Guilloche Wave Ribbon',
    category: 'curved_artistic',
    industry: 'Central Banking / Bullion Vaults / Diplomatic / Security',
    tagline: 'Ultra-high-definition banknote currency security guilloche intertwined wave ribbons',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#3B82F6',
    badgeIcon: '🏛️',
    previewGradient: 'from-amber-400 via-blue-900 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#3B82F6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0a101f');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const numStrands = 18;
      for (let s = 0; s < numStrands; s++) {
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#fef08a');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.65 - (s / numStrands) * 0.35);
        ctx.beginPath();
        const offY = (s - numStrands / 2) * (isPort ? 8 : 6);
        const midY = (isPort ? H * 0.45 : H * 0.55) + offY;
        const length = isPort ? H : W;
        for (let x = -20; x <= length + 20; x += 4) {
          const y = midY + Math.sin((x / length) * Math.PI * 4 + s * 0.18) * (isPort ? 55 : 65) * k;
          if (isPort) {
            x === -20 ? ctx.moveTo(y, x) : ctx.lineTo(y, x);
          } else {
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fde68a', photoImg, logoImg, '🏛️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 1.12 AERODYNAMIC WIND TUNNEL STREAMLINES
  {
    id: 'aerodynamic_wind_tunnel',
    name: 'Aerodynamic Wind Tunnel Vector Streamlines',
    category: 'curved_artistic',
    industry: 'Automotive Engineering / Aerospace / Yacht Racing',
    tagline: 'Precision velocity vector streamlines contouring around high-speed flow profiles',
    theme: 'dark',
    defaultAccent: '#38BDF8',
    defaultSecondary: '#EC4899',
    badgeIcon: '🏎️',
    previewGradient: 'from-sky-400 via-purple-700 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#38BDF8');
      const secondary = safeColor(data.secondaryColor, '#EC4899');

      ctx.fillStyle = safeColor(data.cardBgColor, '#060913');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const numStreams = 16;
      for (let i = 0; i < numStreams; i++) {
        const t = i / numStreams;
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#818cf8');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = i % 3 === 0 ? 2.5 : 1.2;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.35 + t * 0.55);
        ctx.beginPath();
        const startY = (isPort ? H * 0.15 : H * 0.2) + t * (isPort ? H * 0.7 : H * 0.65);
        ctx.moveTo(-30, startY);
        ctx.bezierCurveTo(
          W * 0.35 * k,
          startY - (isPort ? 65 : 85) * Math.sin(t * Math.PI) * k,
          W * 0.7 * k,
          startY + (isPort ? 65 : 85) * Math.cos(t * Math.PI) * k,
          W + 30,
          startY - 20
        );
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#bae6fd', photoImg, logoImg, '🏎️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 2. GEOMETRIC PATTERNS & TEXTURES CATEGORY (8 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 2.1 GEOMETRIC DIAMOND LATTICE
  {
    id: 'geometric_diamond_lattice',
    name: 'Diamond Lattice Luxury Sapphire',
    category: 'patterns',
    industry: 'Jewellers / Fashion / Architecture / Luxury Retail',
    tagline: 'Repeating diamond lattice geometric pattern in gold & deep navy sapphire',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#1E3A5F',
    badgeIcon: '🔷',
    previewGradient: 'from-amber-500 via-blue-950 to-slate-900',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      ctx.fillStyle = safeColor(data.cardBgColor, '#0d1a35');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const dSize = Math.round(52 * k);
      ctx.strokeStyle = hexToRgba(primary, 0.35);
      ctx.lineWidth = 1.5;
      for (let row = -1; row < H / dSize + 2; row++) {
        for (let col = -1; col < W / dSize + 2; col++) {
          const cx = col * dSize + (row % 2 === 0 ? 0 : dSize / 2);
          const cy = row * dSize * 0.75;
          ctx.beginPath();
          ctx.moveTo(cx, cy - dSize * 0.38);
          ctx.lineTo(cx + dSize * 0.5, cy);
          ctx.lineTo(cx, cy + dSize * 0.38);
          ctx.lineTo(cx - dSize * 0.5, cy);
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Corner accent diamonds
      [[W * 0.05, H * 0.08], [W * 0.95, H * 0.08], [W * 0.05, H * 0.92], [W * 0.95, H * 0.92]].forEach(([cx, cy]) => {
        const ds = 20;
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.moveTo(cx, cy - ds); ctx.lineTo(cx + ds, cy);
        ctx.lineTo(cx, cy + ds); ctx.lineTo(cx - ds, cy);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fde68a', photoImg, logoImg, '🔷', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.2 HEXAGON HONEYCOMB TECH
  {
    id: 'hexagon_honeycomb_tech',
    name: 'Hexagon Honeycomb Tech Pattern',
    category: 'patterns',
    industry: 'Biotech / Nanotechnology / Data Science / Cyber',
    tagline: 'Glowing hex cell honeycomb pattern — molecular precision meets cyber design',
    theme: 'dark',
    defaultAccent: '#10B981',
    defaultSecondary: '#06B6D4',
    badgeIcon: '🔬',
    previewGradient: 'from-emerald-500 via-cyan-700 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#10B981');
      const secondary = safeColor(data.secondaryColor, '#06B6D4');

      ctx.fillStyle = safeColor(data.cardBgColor, '#030d14');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const hexR = Math.round(34 * k);
      const hexW = hexR * 2;
      const hexH = Math.sqrt(3) * hexR;
      ctx.strokeStyle = hexToRgba(primary, 0.3);
      ctx.lineWidth = 1.2;
      for (let row = -1; row < H / hexH + 2; row++) {
        for (let col = -1; col < W / hexW + 2; col++) {
          const cx = col * hexW * 0.75;
          const cy = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);
          const dist = Math.sqrt(Math.pow(cx - W / 2, 2) + Math.pow(cy - H / 2, 2));
          const alpha = Math.max(0.08, 0.75 - dist / (Math.max(W, H) * 0.7));
          ctx.strokeStyle = dist < W * 0.35 ? hexToRgba(secondary, alpha) : hexToRgba(primary, alpha);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = cx + hexR * Math.cos(angle);
            const py = cy + hexR * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', hexToRgba(secondary, 0.9), photoImg, logoImg, '🔬', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.3 ART DECO GATSBY SUNBURST
  {
    id: 'art_deco_gatsby',
    name: 'Art Deco Gatsby Fan & Sunburst',
    category: 'patterns',
    industry: 'Event Planners / Luxury Hotels / Entertainment / VIP',
    tagline: 'Opulent 1920s Art Deco geometric fan & sunburst rays in gold on black',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#D97706',
    badgeIcon: '🎭',
    previewGradient: 'from-amber-600 via-yellow-500 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      ctx.fillStyle = safeColor(data.cardBgColor, '#0a0800');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const cx = isPort ? W * 0.5 : W * 0.85;
      const cy = isPort ? H * 0.12 : H * 0.5;
      const numRays = 24;
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2;
        const even = i % 2 === 0;
        ctx.strokeStyle = even ? hexToRgba(primary, 0.55) : hexToRgba('#fef08a', 0.25);
        ctx.lineWidth = even ? 2.5 * k : 1 * k;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * W * 0.85, cy + Math.sin(angle) * H * 0.85);
        ctx.stroke();
      }
      [60, 110, 160, 210, 260].forEach((r, i) => {
        ctx.strokeStyle = hexToRgba(primary, 0.35 - i * 0.05);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * k, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fde68a', photoImg, logoImg, '🎭', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.4 MOROCCAN ISLAMIC GEOMETRIC TILE
  {
    id: 'moroccan_tile_pattern',
    name: 'Moroccan Geometric Tile Pattern',
    category: 'patterns',
    industry: 'Interior Design / Architecture / Cultural / Hospitality',
    tagline: 'Intricate Islamic geometric tilework in teal, gold & ivory — rich heritage',
    theme: 'colorful',
    defaultAccent: '#0D9488',
    defaultSecondary: '#F59E0B',
    badgeIcon: '🕌',
    previewGradient: 'from-teal-600 via-amber-500 to-slate-800',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#0D9488');
      const secondary = safeColor(data.secondaryColor, '#F59E0B');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0d2020');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const tSize = Math.round(60 * k);
      for (let row = -1; row < H / tSize + 2; row++) {
        for (let col = -1; col < W / tSize + 2; col++) {
          const tx = col * tSize;
          const ty = row * tSize;
          const colors = (row + col) % 2 === 0 ? [primary, secondary] : [secondary, primary];
          ctx.strokeStyle = hexToRgba(colors[0], 0.4);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(tx + tSize * 0.5, ty);
          ctx.lineTo(tx + tSize, ty + tSize * 0.5);
          ctx.lineTo(tx + tSize * 0.5, ty + tSize);
          ctx.lineTo(tx, ty + tSize * 0.5);
          ctx.closePath();
          ctx.stroke();
          ctx.strokeStyle = hexToRgba(colors[1], 0.25);
          ctx.lineWidth = 0.8;
          ctx.strokeRect(tx + tSize * 0.15, ty + tSize * 0.15, tSize * 0.7, tSize * 0.7);
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, secondary, '#ffffff', '#fde68a', photoImg, logoImg, '🕌', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, secondary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.5 TOPOGRAPHIC CONTOUR MAP
  {
    id: 'topographic_contour',
    name: 'Topographic Contour Elevation Lines',
    category: 'patterns',
    industry: 'Geographers / Surveyors / Eco / Outdoor Brands',
    tagline: 'Fine topographic elevation contour map lines flowing across muted terrain tones',
    theme: 'light',
    defaultAccent: '#16A34A',
    defaultSecondary: '#84CC16',
    badgeIcon: '🗺️',
    previewGradient: 'from-green-200 via-emerald-100 to-teal-200',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#16A34A');
      const secondary = safeColor(data.secondaryColor, '#84CC16');

      ctx.fillStyle = safeColor(data.cardBgColor, '#f0fdf4');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const numContours = Math.round(12 * k);
      for (let i = 0; i < numContours; i++) {
        const t = i / numContours;
        const alpha = 0.15 + t * 0.3;
        const color = i % 3 === 0 ? primary : i % 3 === 1 ? secondary : '#0d9488';
        ctx.strokeStyle = hexToRgba(color, alpha);
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.beginPath();
        const seed = i * 137.5;
        const startY = H * (0.1 + t * 0.8);
        ctx.moveTo(-20, startY);
        ctx.bezierCurveTo(
          W * (0.25 + Math.sin(seed) * 0.15 * k),
          startY - H * 0.12 * k * Math.cos(seed),
          W * (0.6 + Math.sin(seed * 0.7) * 0.2 * k),
          startY + H * 0.1 * k * Math.sin(seed),
          W + 20,
          startY + H * 0.05 * Math.cos(seed)
        );
        ctx.stroke();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#14532d', '#166534', photoImg, logoImg, '🗺️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#14532d', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.6 JAPANESE SEIGAIHA OCEAN WAVES
  {
    id: 'japanese_seigaiha_waves',
    name: 'Japanese Seigaiha Waves Pattern',
    category: 'patterns',
    industry: 'Japanese Cuisine / Zen Wellness / Traditional Craft',
    tagline: 'Traditional Japanese Seigaiha overlapping concentric circular ocean wave scales',
    theme: 'dark',
    defaultAccent: '#0284C7',
    defaultSecondary: '#E0F2FE',
    badgeIcon: '🌊',
    previewGradient: 'from-sky-500 via-blue-900 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#0284C7');
      const secondary = safeColor(data.secondaryColor, '#E0F2FE');

      ctx.fillStyle = safeColor(data.cardBgColor, '#061325');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const waveR = Math.round(42 * k);
      ctx.lineWidth = 1.5;

      for (let y = -waveR; y < H + waveR * 2; y += waveR * 0.65) {
        const row = Math.floor(y / (waveR * 0.65));
        const offsetX = (row % 2 === 0) ? 0 : waveR;
        for (let x = -waveR + offsetX; x < W + waveR * 2; x += waveR * 2) {
          [1.0, 0.75, 0.5, 0.25].forEach((scale, i) => {
            ctx.strokeStyle = i === 0 ? hexToRgba(primary, 0.45) : hexToRgba(secondary, 0.25 - i * 0.05);
            ctx.beginPath();
            ctx.arc(x, y, waveR * scale, Math.PI, Math.PI * 2);
            ctx.stroke();
          });
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, secondary, '#ffffff', '#bae6fd', photoImg, logoImg, '🌊', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.7 OP-ART PERSPECTIVE CHECKERBOARD WARP
  {
    id: 'op_art_checker_warp',
    name: 'Op-Art Perspective Checkerboard Warp',
    category: 'patterns',
    industry: 'Avant-Garde / Gallery / Fashion / Visual FX',
    tagline: 'Hypnotic Op-Art optical illusion warped perspective checkered surface',
    theme: 'dark',
    defaultAccent: '#A855F7',
    defaultSecondary: '#EC4899',
    badgeIcon: '🏁',
    previewGradient: 'from-purple-600 via-pink-600 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#A855F7');
      const secondary = safeColor(data.secondaryColor, '#EC4899');

      ctx.fillStyle = safeColor(data.cardBgColor, '#090514');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const cols = 14;
      const rows = 10;
      const dx = W / cols;
      const dy = H / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 2 === 0) {
            const warpX = Math.sin((r / rows) * Math.PI * k) * 12;
            const warpY = Math.cos((c / cols) * Math.PI * k) * 8;
            ctx.fillStyle = r % 2 === 0 ? hexToRgba(primary, 0.4) : hexToRgba(secondary, 0.3);
            ctx.fillRect(c * dx + warpX, r * dy + warpY, dx - 2, dy - 2);
          }
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e9d5ff', photoImg, logoImg, '🏁', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.8 CHEVRON HERRINGBONE WEAVE
  {
    id: 'chevron_herringbone_luxury',
    name: 'Chevron Herringbone Luxury Weave',
    category: 'patterns',
    industry: 'High-End Tailoring / Timber & Flooring / Architecture',
    tagline: 'Precision repeating V-chevron herringbone weave pattern in charcoal & warm brass',
    theme: 'dark',
    defaultAccent: '#D97706',
    defaultSecondary: '#78350F',
    badgeIcon: '∧',
    previewGradient: 'from-amber-600 via-stone-800 to-zinc-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#D97706');
      ctx.fillStyle = safeColor(data.cardBgColor, '#14120e');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const stepY = Math.round(28 * k);
      const numCols = isPort ? 6 : 9;
      const colW = W / numCols;

      for (let c = 0; c < numCols; c++) {
        const cx = c * colW;
        ctx.strokeStyle = hexToRgba(primary, c % 2 === 0 ? 0.35 : 0.2);
        ctx.lineWidth = 2;
        for (let y = -stepY; y < H + stepY; y += stepY) {
          ctx.beginPath();
          if (c % 2 === 0) {
            ctx.moveTo(cx, y); ctx.lineTo(cx + colW, y + stepY * 0.5);
          } else {
            ctx.moveTo(cx, y + stepY * 0.5); ctx.lineTo(cx + colW, y);
          }
          ctx.stroke();
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fde68a', photoImg, logoImg, '∧', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 2.9 3D ISOMETRIC CUBE MATRIX
  {
    id: 'isometric_3d_cube_matrix',
    name: '3D Isometric Cube Matrix & Cyber Grid',
    category: 'patterns',
    industry: '3D Design / Metaverse / Gaming / High-Tech',
    tagline: 'Stepped 3D isometric cube blocks with neon wireframe cyan and emerald edges',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#10B981',
    badgeIcon: '🧊',
    previewGradient: 'from-cyan-400 via-teal-600 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#10B981');

      ctx.fillStyle = safeColor(data.cardBgColor, '#040d1a');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const cubeSize = Math.round(48 * k);
      const r3 = Math.sqrt(3);

      for (let row = -1; row < H / (cubeSize * 1.5) + 2; row++) {
        for (let col = -1; col < W / (cubeSize * r3) + 2; col++) {
          const cx = col * cubeSize * r3 + (row % 2 === 0 ? 0 : (cubeSize * r3) / 2);
          const cy = row * cubeSize * 1.5;

          // Top Face
          ctx.fillStyle = hexToRgba(primary, 0.25);
          ctx.beginPath();
          ctx.moveTo(cx, cy - cubeSize);
          ctx.lineTo(cx + (cubeSize * r3) / 2, cy - cubeSize / 2);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx - (cubeSize * r3) / 2, cy - cubeSize / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = hexToRgba(primary, 0.4);
          ctx.stroke();

          // Left Face
          ctx.fillStyle = hexToRgba(secondary, 0.18);
          ctx.beginPath();
          ctx.moveTo(cx - (cubeSize * r3) / 2, cy - cubeSize / 2);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx, cy + cubeSize);
          ctx.lineTo(cx - (cubeSize * r3) / 2, cy + cubeSize / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = hexToRgba(secondary, 0.3);
          ctx.stroke();

          // Right Face
          ctx.fillStyle = hexToRgba('#1e293b', 0.4);
          ctx.beginPath();
          ctx.moveTo(cx + (cubeSize * r3) / 2, cy - cubeSize / 2);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx, cy + cubeSize);
          ctx.lineTo(cx + (cubeSize * r3) / 2, cy + cubeSize / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = hexToRgba('#ffffff', 0.15);
          ctx.stroke();
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '🧊', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.10 BAUHAUS GEOMETRIC ARCHES & CIRCLES
  {
    id: 'bauhaus_geometric_minimal',
    name: 'Bauhaus Modern Arches & Spheres',
    category: 'patterns',
    industry: 'Modernist Architects / Design Studios / Curators',
    tagline: 'Bold Bauhaus abstract modernist arches, semi-circles and precision grid rules',
    theme: 'light',
    defaultAccent: '#EA580C',
    defaultSecondary: '#2563EB',
    badgeIcon: '📐',
    previewGradient: 'from-orange-500 via-amber-300 to-blue-600',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EA580C');
      const secondary = safeColor(data.secondaryColor, '#2563EB');

      ctx.fillStyle = safeColor(data.cardBgColor, '#f8f6f0');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Primary Arch
      ctx.fillStyle = primary;
      ctx.beginPath();
      const archX = isPort ? W * 0.75 : W * 0.82;
      const archY = isPort ? H * 0.25 : H * 0.5;
      const archR = (isPort ? W * 0.35 : H * 0.45) * k;
      ctx.arc(archX, archY, archR, Math.PI, 0);
      ctx.lineTo(archX + archR, archY + archR);
      ctx.lineTo(archX - archR, archY + archR);
      ctx.closePath();
      ctx.fill();

      // Secondary Cobalt Circle
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(isPort ? W * 0.25 : W * 0.2, isPort ? H * 0.8 : H * 0.8, (isPort ? 35 : 45) * k, 0, Math.PI * 2);
      ctx.fill();

      // Fine Grid Line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, archY); ctx.lineTo(W, archY);
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#0f172a', '#334155', photoImg, logoImg, '📐', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#0f172a', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.11 CYBER GOLD PCB CIRCUIT BOARD
  {
    id: 'cyber_circuit_board_pcb',
    name: 'Cyber Gold PCB Circuit Board Traces',
    category: 'patterns',
    industry: 'Hardware Engineers / Microelectronics / Robotics / IoT',
    tagline: 'High-density matte black PCB with gold electroplated circuit traces and via holes',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#10B981',
    badgeIcon: '⚡',
    previewGradient: 'from-amber-400 via-emerald-800 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#10B981');

      ctx.fillStyle = safeColor(data.cardBgColor, '#080c10');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // PCB Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Gilded Traces
      const traces = [
        [W * 0.05, H * 0.15, W * 0.4, H * 0.15, W * 0.55, H * 0.35, W * 0.85, H * 0.35],
        [W * 0.05, H * 0.85, W * 0.35, H * 0.85, W * 0.5, H * 0.65, W * 0.95, H * 0.65],
        [W * 0.7, 0, W * 0.7, H * 0.25, W * 0.85, H * 0.4, W * 0.85, H],
      ];

      traces.forEach((pts, ti) => {
        ctx.strokeStyle = ti === 0 ? primary : secondary;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = ti === 0 ? primary : secondary;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.stroke();

        // Solder pad via rings
        for (let i = 0; i < pts.length; i += 2) {
          ctx.fillStyle = '#080c10';
          ctx.strokeStyle = primary;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(pts[i], pts[i + 1], 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      });
      ctx.shadowBlur = 0;
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fde68a', photoImg, logoImg, '⚡', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.12 SACRED GEOMETRY FLOWER OF LIFE
  {
    id: 'sacred_geometry_flower_life',
    name: 'Sacred Geometry Flower of Life',
    category: 'patterns',
    industry: 'Wellness / Luxury Spa / Holistic Healing / Jewelry',
    tagline: 'Mesmerizing sacred geometry Flower of Life overlapping interlocking circles',
    theme: 'dark',
    defaultAccent: '#EC4899',
    defaultSecondary: '#8B5CF6',
    badgeIcon: '🌸',
    previewGradient: 'from-pink-500 via-purple-700 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EC4899');
      const secondary = safeColor(data.secondaryColor, '#8B5CF6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0c0717');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const cx = isPort ? W * 0.5 : W * 0.82;
      const cy = isPort ? H * 0.28 : H * 0.5;
      const circleR = (isPort ? 42 : 52) * k;

      ctx.strokeStyle = hexToRgba(primary, 0.4);
      ctx.lineWidth = 1.5;

      // Central circle
      ctx.beginPath(); ctx.arc(cx, cy, circleR, 0, Math.PI * 2); ctx.stroke();

      // 6 Surrounding circles
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i;
        const ox = cx + circleR * Math.cos(ang);
        const oy = cy + circleR * Math.sin(ang);
        ctx.strokeStyle = hexToRgba(secondary, 0.35);
        ctx.beginPath(); ctx.arc(ox, oy, circleR, 0, Math.PI * 2); ctx.stroke();
      }

      // Outer bounding ring
      ctx.strokeStyle = hexToRgba(primary, 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, circleR * 2, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fbcfe8', photoImg, logoImg, '🌸', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.13 ITALIAN TERRAZZO MOSAIC
  {
    id: 'terrazzo_modern_mosaic',
    name: 'Italian Terrazzo Marble Mosaic',
    category: 'patterns',
    industry: 'Interior Design / Ceramics / Boutique Cafe / Lifestyle',
    tagline: 'Scattered marble, terracotta and obsidian geometric fleck chips on warm stone',
    theme: 'light',
    defaultAccent: '#EA580C',
    defaultSecondary: '#0D9488',
    badgeIcon: '✨',
    previewGradient: 'from-orange-300 via-teal-200 to-amber-100',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EA580C');
      const secondary = safeColor(data.secondaryColor, '#0D9488');

      ctx.fillStyle = safeColor(data.cardBgColor, '#faf7f2');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const chipColors = [primary, secondary, '#3b82f6', '#1e293b', '#f59e0b', '#ec4899'];
      const chips = [
        [W * 0.1, H * 0.1, 14, 18, 0.4],
        [W * 0.3, H * 0.25, 22, 12, -0.6],
        [W * 0.8, H * 0.15, 18, 16, 0.8],
        [W * 0.65, H * 0.35, 12, 24, 0.2],
        [W * 0.15, H * 0.75, 26, 14, -0.3],
        [W * 0.45, H * 0.85, 16, 16, 0.7],
        [W * 0.85, H * 0.7, 24, 18, 0.5],
        [W * 0.9, H * 0.9, 14, 14, -0.8],
        [W * 0.5, H * 0.1, 10, 15, 0.3],
        [W * 0.05, H * 0.45, 18, 12, -0.2],
      ];

      chips.forEach(([x, y, w, h, rot], i) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = chipColors[i % chipColors.length];
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2 + 3, -h / 2 + 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(-w / 2 + 2, h / 2 - 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#1e293b', '#475569', photoImg, logoImg, '✨', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#1e293b', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.14 HOLOGRAPHIC HYPNOTIC ARCHIMEDEAN SPIRAL
  {
    id: 'holographic_hypnotic_spiral',
    name: 'Holographic Hypnotic Spiral Vortex',
    category: 'patterns',
    industry: 'Creative Directors / Music Festivals / Visual Artists',
    tagline: 'Hypnotic iridescent Archimedean spiral radiating outward with golden ratio arcs',
    theme: 'dark',
    defaultAccent: '#38BDF8',
    defaultSecondary: '#EC4899',
    badgeIcon: '🌀',
    previewGradient: 'from-sky-400 via-pink-500 to-indigo-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#38BDF8');
      const secondary = safeColor(data.secondaryColor, '#EC4899');

      ctx.fillStyle = safeColor(data.cardBgColor, '#050716');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const sx = isPort ? W * 0.5 : W * 0.82;
      const sy = isPort ? H * 0.28 : H * 0.5;

      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 10 * k; a += 0.1) {
        const r = a * 6;
        const px = sx + r * Math.cos(a);
        const py = sy + r * Math.sin(a);
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = primary;
      ctx.stroke();

      ctx.beginPath();
      for (let a = 0; a < Math.PI * 10 * k; a += 0.1) {
        const r = a * 6;
        const px = sx + r * Math.cos(a + Math.PI);
        const py = sy + r * Math.sin(a + Math.PI);
        a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = secondary;
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#bae6fd', photoImg, logoImg, '🌀', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.15 SOVEREIGN CENTRAL BANK MEDALLION & SEAL
  {
    id: 'guilloche_sovereign_medallion',
    name: 'Sovereign Banknote Medallion & Seal',
    category: 'patterns',
    industry: 'Central Banking / Bullion / Notary / Sovereign Wealth',
    tagline: 'Multi-lobed banknote currency seal with concentric geometric lathe rosettes in gold & sapphire',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#3B82F6',
    badgeIcon: '🏛️',
    previewGradient: 'from-amber-400 via-blue-900 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#3B82F6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#080d1a');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const cx = isPort ? W * 0.5 : W * 0.82;
      const cy = isPort ? H * 0.28 : H * 0.5;
      const maxR = (isPort ? W * 0.45 : H * 0.45) * k;

      // 10 Nested Lathe Rosettes
      for (let ring = 1; ring <= 10; ring++) {
        const rRatio = ring / 10;
        const curR = maxR * rRatio;
        const lobes = 8 + (ring % 3) * 4;
        const amp = (maxR * 0.1) * Math.sin(ring * 0.8);
        const grad = ctx.createLinearGradient(cx - curR, cy - curR, cx + curR, cy + curR);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#fef08a');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.5 + rRatio * 0.5);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.025) {
          const modR = curR + Math.sin(a * lobes + ring * 0.35) * amp;
          const px = cx + modR * Math.cos(a);
          const py = cy + modR * Math.sin(a);
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Guilloche Border Frame
      ctx.strokeStyle = hexToRgba(primary, 0.4);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(18, 18, W - 36, H - 36);
      ctx.strokeRect(22, 22, W - 44, H - 44);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fde68a', photoImg, logoImg, '🏛️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.16 SWISS WATCHMAKER FLUTED LATHE TAPISSERIE
  {
    id: 'guilloche_swiss_fluted_lathe',
    name: 'Swiss Watchmaker Fluted Guilloche Tapisserie',
    category: 'patterns',
    industry: 'Haute Horlogerie / Geneva Watchmakers / Luxury Dials',
    tagline: 'High-frequency interlocking micro-sine wave lathe guilloche tapisserie in royal sapphire',
    theme: 'dark',
    defaultAccent: '#38BDF8',
    defaultSecondary: '#818CF8',
    badgeIcon: '⌚',
    previewGradient: 'from-sky-400 via-indigo-900 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#38BDF8');
      const secondary = safeColor(data.secondaryColor, '#818CF8');

      ctx.fillStyle = safeColor(data.cardBgColor, '#060a17');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const numStrands = Math.round(30 * k);
      const length = isPort ? H : W;
      const mid = isPort ? W * 0.5 : H * 0.55;

      for (let s = 0; s < numStrands; s++) {
        const t = s / numStrands;
        const offset = (s - numStrands / 2) * (isPort ? 6 : 5);
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#c084fc');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.1;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.35 + Math.sin(t * Math.PI) * 0.6);
        ctx.beginPath();
        for (let x = -20; x <= length + 20; x += 3) {
          const y = mid + offset + Math.sin((x / length) * Math.PI * 6 + s * 0.15) * (isPort ? 45 : 55) * k + Math.cos((x / length) * Math.PI * 16 + s * 0.25) * (isPort ? 16 : 22) * k;
          if (isPort) {
            x === -20 ? ctx.moveTo(y, x) : ctx.lineTo(y, x);
          } else {
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#bae6fd', photoImg, logoImg, '⌚', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.17 IMPERIAL ROYAL TREATY GILDED LACE GUILLOCHE
  {
    id: 'guilloche_imperial_lace',
    name: 'Imperial Royal Treaty Gilded Lace Guilloche',
    category: 'patterns',
    industry: 'Diplomatic Corps / Treaty Seals / Heraldry / Luxury Estates',
    tagline: 'Intricate interwoven micro-lace security waves in imperial emerald & polished gold',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#10B981',
    badgeIcon: '⚜️',
    previewGradient: 'from-amber-400 via-emerald-800 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#10B981');

      ctx.fillStyle = safeColor(data.cardBgColor, '#03140f');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const numBands = 6;
      for (let b = 0; b < numBands; b++) {
        const baseY = (isPort ? H * 0.25 : H * 0.35) + b * (isPort ? 65 : 45) * k;
        const grad = ctx.createLinearGradient(0, baseY, W, baseY);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#fef08a');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;

        for (let sub = 0; sub < 4; sub++) {
          ctx.save();
          ctx.globalAlpha = waveAlpha * (0.5 - sub * 0.1);
          ctx.beginPath();
          const amp = (18 + sub * 8) * k;
          for (let x = -20; x <= W + 20; x += 4) {
            const y = baseY + Math.sin((x / W) * Math.PI * 8 + b * 0.5 + sub * 0.3) * amp + Math.cos((x / W) * Math.PI * 16 + sub * 0.5) * (amp * 0.4);
            x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '⚜️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.18 OPTICAL MOIRÉ INTERFERENCE HOLOGRAPHIC WAVES
  {
    id: 'guilloche_moire_matrix',
    name: 'Optical Moiré Interference Guilloche Waves',
    category: 'patterns',
    industry: 'Holography / Nanotech / Security Printing / Optics',
    tagline: 'Dual overlapping high-frequency harmonic grids creating floating 3D optical moiré fringes',
    theme: 'dark',
    defaultAccent: '#EC4899',
    defaultSecondary: '#06B6D4',
    badgeIcon: '🔮',
    previewGradient: 'from-pink-500 via-purple-700 to-cyan-500',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EC4899');
      const secondary = safeColor(data.secondaryColor, '#06B6D4');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0a0614');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const numLines = Math.round(22 * k);
      for (let i = 0; i < numLines; i++) {
        const t = i / numLines;
        // Primary grid
        const grad1 = ctx.createLinearGradient(0, 0, W, H);
        grad1.addColorStop(0, primary);
        grad1.addColorStop(1, '#8b5cf6');
        ctx.strokeStyle = grad1;
        ctx.lineWidth = 1.1;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.55);
        ctx.beginPath();
        const y1 = H * (0.1 + t * 0.8);
        for (let x = 0; x <= W; x += 4) {
          const cy = y1 + Math.sin((x / W) * Math.PI * 6 + t * 2) * 32 * k;
          x === 0 ? ctx.moveTo(x, cy) : ctx.lineTo(x, cy);
        }
        ctx.stroke();
        ctx.restore();

        // Secondary interferometry grid
        const grad2 = ctx.createLinearGradient(W, 0, 0, H);
        grad2.addColorStop(0, secondary);
        grad2.addColorStop(1, '#3b82f6');
        ctx.strokeStyle = grad2;
        ctx.lineWidth = 1.1;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.45);
        ctx.beginPath();
        const y2 = H * (0.12 + t * 0.8);
        for (let x = 0; x <= W; x += 4) {
          const cy = y2 + Math.sin((x / W) * Math.PI * 6.3 + t * 2.2 + 0.6) * 34 * k;
          x === 0 ? ctx.moveTo(x, cy) : ctx.lineTo(x, cy);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fbcfe8', photoImg, logoImg, '🔮', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.19 MATHEMATICAL RHODONEA ROSE BLOSSOM ROSETTE
  {
    id: 'guilloche_rhodonea_blossom',
    name: 'Mathematical Rhodonea Rose Blossom Guilloche',
    category: 'patterns',
    industry: 'Fine Fragrance / Luxury Cosmetics / Haute Couture',
    tagline: 'Multi-petaled mathematical polar rose curves generating delicate filigree rosettes',
    theme: 'dark',
    defaultAccent: '#FB7185',
    defaultSecondary: '#F59E0B',
    badgeIcon: '🌹',
    previewGradient: 'from-rose-500 via-purple-900 to-amber-500',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#FB7185');
      const secondary = safeColor(data.secondaryColor, '#F59E0B');

      ctx.fillStyle = safeColor(data.cardBgColor, '#14050d');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const cx = isPort ? W * 0.5 : W * 0.8;
      const cy = isPort ? H * 0.3 : H * 0.5;
      const maxR = (isPort ? W * 0.44 : H * 0.44) * k;
      const petals = [5, 7, 9, 12];

      petals.forEach((p, idx) => {
        const grad = ctx.createLinearGradient(cx - maxR, cy - maxR, cx + maxR, cy + maxR);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#f43f5e');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.7 - idx * 0.12);
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 4; a += 0.025) {
          const r = maxR * (0.55 + idx * 0.14) * Math.cos((p / 2) * a);
          const px = cx + r * Math.cos(a + idx * 0.3);
          const py = cy + r * Math.sin(a + idx * 0.3);
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fed7aa', photoImg, logoImg, '🌹', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.20 INFINITY LEMNISCATE DUAL-LOBE SECURITY RIBBON
  {
    id: 'guilloche_infinity_lemniscate_card',
    name: 'Infinity Lemniscate Dual-Lobe Security Ribbon',
    category: 'patterns',
    industry: 'Quantitative Finance / AI Hedge Funds / Cryptography',
    tagline: 'Flowing figure-8 lemniscate orbital wave ribbons with mathematical harmonic precision',
    theme: 'dark',
    defaultAccent: '#8B5CF6',
    defaultSecondary: '#38BDF8',
    badgeIcon: '♾️',
    previewGradient: 'from-purple-500 via-blue-800 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#8B5CF6');
      const secondary = safeColor(data.secondaryColor, '#38BDF8');

      ctx.fillStyle = safeColor(data.cardBgColor, '#080514');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const cx = isPort ? W * 0.5 : W * 0.75;
      const cy = isPort ? H * 0.32 : H * 0.5;
      const a = (isPort ? W * 0.44 : W * 0.34) * k;
      const numCurves = Math.round(20 * k);

      for (let i = 0; i < numCurves; i++) {
        const tRatio = i / numCurves;
        const grad = ctx.createLinearGradient(cx - a, cy - a, cx + a, cy + a);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#c084fc');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.35 + tRatio * 0.55);
        ctx.beginPath();
        const scale = 1 - tRatio * 0.4;
        const rot = i * 0.07;
        for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.035) {
          const denom = 1 + Math.sin(t) * Math.sin(t);
          const lx = (a * scale * Math.cos(t)) / denom;
          const ly = (a * scale * Math.sin(t) * Math.cos(t)) / denom;
          const rx = lx * Math.cos(rot) - ly * Math.sin(rot);
          const ry = lx * Math.sin(rot) + ly * Math.cos(rot);
          t === 0 ? ctx.moveTo(cx + rx, cy + ry) : ctx.lineTo(cx + rx, cy + ry);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e9d5ff', photoImg, logoImg, '♾️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.21 SOVEREIGN BOND CERTIFICATE ORNATE CORNER SPANDRELS
  {
    id: 'guilloche_certificate_spandrels',
    name: 'Sovereign Certificate Ornate Guilloche Spandrels',
    category: 'patterns',
    industry: 'Treasury Bonds / Royal Charters / Law Guilds / Academia',
    tagline: 'Classical banknote certificate ornate corner spandrel arabesques and micro-filigree borders',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#D97706',
    badgeIcon: '📜',
    previewGradient: 'from-amber-400 via-amber-800 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#D97706');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0c0a06');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // 4 Corner Guilloche Spandrels
      const corners = [
        { x: 24, y: 24, qx: 1, qy: 1 },
        { x: W - 24, y: 24, qx: -1, qy: 1 },
        { x: 24, y: H - 24, qx: 1, qy: -1 },
        { x: W - 24, y: H - 24, qx: -1, qy: -1 },
      ];

      corners.forEach((c) => {
        const spanR = (isPort ? 75 : 95) * k;
        for (let r = 15; r <= spanR; r += 7) {
          const grad = ctx.createLinearGradient(c.x, c.y, c.x + c.qx * r, c.y + c.qy * r);
          grad.addColorStop(0, primary);
          grad.addColorStop(0.5, '#fef08a');
          grad.addColorStop(1, secondary);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.1;
          ctx.save();
          ctx.globalAlpha = waveAlpha * (0.7 - (r / spanR) * 0.4);
          ctx.beginPath();
          for (let a = 0; a <= Math.PI / 2 + 0.05; a += 0.04) {
            const modR = r + Math.sin(a * 8) * (5 * k);
            const px = c.x + c.qx * modR * Math.cos(a);
            const py = c.y + c.qy * modR * Math.sin(a);
            a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.restore();
        }
      });

      // Border Frames
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, W - 40, H - 40);
      ctx.strokeRect(26, 26, W - 52, H - 52);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fde68a', photoImg, logoImg, '📜', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.22 TRI-AXIAL INTERWOVEN SINUSOIDAL BRAID
  {
    id: 'guilloche_triaxial_braid',
    name: 'Tri-Axial Interwoven Sinusoidal Security Braid',
    category: 'patterns',
    industry: 'High-Sec Identification / Military Intelligence / Security Pass',
    tagline: 'Three 3D braided harmonic sinusoidal wave ribbons twisting in phase-locked symmetry',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#EC4899',
    badgeIcon: '🧬',
    previewGradient: 'from-cyan-400 via-pink-600 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#EC4899');

      ctx.fillStyle = safeColor(data.cardBgColor, '#040b17');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const numRibbons = 3;
      const length = isPort ? H : W;
      const mid = isPort ? W * 0.5 : H * 0.55;
      const amp = (isPort ? 55 : 70) * k;

      for (let r = 0; r < numRibbons; r++) {
        const phase = (r / numRibbons) * Math.PI * 2;
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#8b5cf6');
        grad.addColorStop(1, secondary);

        for (let strand = -4; strand <= 4; strand++) {
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.3;
          ctx.save();
          ctx.globalAlpha = waveAlpha * (0.7 - Math.abs(strand) * 0.12);
          ctx.beginPath();
          const offset = strand * 4.5;
          for (let x = -20; x <= length + 20; x += 4) {
            const y = mid + offset + Math.sin((x / length) * Math.PI * 4 + phase) * amp;
            if (isPort) {
              x === -20 ? ctx.moveTo(y, x) : ctx.lineTo(y, x);
            } else {
              x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a5f3fc', photoImg, logoImg, '🧬', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.23 ROYAL MINT BULLION SUNBURST LATHE RAYS
  {
    id: 'guilloche_mint_aurum_sunburst',
    name: 'Royal Mint Bullion Sunburst Lathe Rays',
    category: 'patterns',
    industry: 'Precious Metals / Gold Mint / Numismatics / Royal Treasury',
    tagline: 'Radiating logarithmic cycloid sunburst lathe rays emanating from sovereign coin crest',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#FEF08A',
    badgeIcon: '🪙',
    previewGradient: 'from-amber-300 via-yellow-600 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#FEF08A');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0a0802');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const cx = isPort ? W * 0.5 : W * 0.82;
      const cy = isPort ? H * 0.28 : H * 0.5;
      const numRays = Math.round(48 * k);

      for (let i = 0; i < numRays; i++) {
        const ang = (i / numRays) * Math.PI * 2;
        const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(ang) * W, cy + Math.sin(ang) * H);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.4, secondary);
        grad.addColorStop(1, '#78350f');

        ctx.strokeStyle = grad;
        ctx.lineWidth = i % 2 === 0 ? 2.0 : 1.0;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.7 - (i % 3) * 0.15);
        ctx.beginPath();
        for (let r = 20; r < Math.max(W, H) * 0.9; r += 10) {
          const modAng = ang + Math.sin(r * 0.05 * k) * 0.15;
          const px = cx + r * Math.cos(modAng);
          const py = cy + r * Math.sin(modAng);
          r === 20 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Central Bullion Ring
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fef08a', photoImg, logoImg, '🪙', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 2.24 ENDLESS INTERLACED CELTIC SECURITY KNOT
  {
    id: 'guilloche_celtic_security_knot',
    name: 'Endless Interlaced Celtic Security Knotwork',
    category: 'patterns',
    industry: 'Heritage Guilds / Irish Whiskey / Craft / High-End Distilleries',
    tagline: 'Endless interwoven geometric security knots and braided ribbon loops in sapphire & bronze',
    theme: 'dark',
    defaultAccent: '#3B82F6',
    defaultSecondary: '#D97706',
    badgeIcon: '♾️',
    previewGradient: 'from-blue-500 via-amber-600 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#3B82F6');
      const secondary = safeColor(data.secondaryColor, '#D97706');

      ctx.fillStyle = safeColor(data.cardBgColor, '#060a14');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      const numLoops = 8;
      const loopW = (isPort ? W * 0.75 : H * 0.75) * k;
      const cx = isPort ? W * 0.5 : W * 0.8;
      const cy = isPort ? H * 0.3 : H * 0.5;

      for (let i = 0; i < numLoops; i++) {
        const ang = (i / numLoops) * Math.PI;
        const grad = ctx.createLinearGradient(cx - loopW / 2, cy - loopW / 2, cx + loopW / 2, cy + loopW / 2);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.5, '#60a5fa');
        grad.addColorStop(1, secondary);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.save();
        ctx.globalAlpha = waveAlpha * (0.65);
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2; t += 0.04) {
          const ex = (loopW * 0.45) * Math.cos(t);
          const ey = (loopW * 0.22) * Math.sin(2 * t);
          const rx = ex * Math.cos(ang) - ey * Math.sin(ang);
          const ry = ex * Math.sin(ang) + ey * Math.cos(ang);
          t === 0 ? ctx.moveTo(cx + rx, cy + ry) : ctx.lineTo(cx + rx, cy + ry);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#bfdbfe', photoImg, logoImg, '♾️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
    // ── 3. 3D & LUXURY CATEGORY (3 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 3.1 EXECUTIVE 3D OBSIDIAN & GOLD
  {
    id: 'executive_3d_gold',
    name: 'Executive 3D Obsidian & Gold',
    category: '3d_luxury',
    industry: 'C-Suite / Private Banking / Luxury Goods',
    tagline: 'Deep obsidian surface with brushed gold inlays, 3D EMV chip and NFC glyphs',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#D97706',
    badgeIcon: '👑',
    previewGradient: 'from-amber-400 via-zinc-800 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#D97706');

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#1c1917');
      bg.addColorStop(0.5, '#0c0a09');
      bg.addColorStop(1, '#18181b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Gold Bevel Inlay Border
      const inset = 18;
      const borderGrad = ctx.createLinearGradient(0, 0, W, H);
      borderGrad.addColorStop(0, primary);
      borderGrad.addColorStop(0.25, '#fef08a');
      borderGrad.addColorStop(0.5, secondary);
      borderGrad.addColorStop(0.75, '#fef08a');
      borderGrad.addColorStop(1, primary);

      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, radius - 8);
      ctx.stroke();

      // Ambient Gold Radial Glow
      const glow = ctx.createRadialGradient(W * 0.5, H * 0.5, 10, W * 0.5, H * 0.5, W * 0.6);
      glow.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', 'rgba(255,255,255,0.7)', photoImg, logoImg, '👑', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 3.2 PLATINUM TITANIUM & DIAMOND CARBON
  {
    id: 'platinum_titanium_diamond',
    name: 'Platinum Titanium & Diamond Carbon',
    category: '3d_luxury',
    industry: 'Centurion VIP / Supercar / Luxury Aviation',
    tagline: 'Brushed platinum titanium surface with laser-etched carbon micro-grid',
    theme: 'dark',
    defaultAccent: '#E2E8F0',
    defaultSecondary: '#94A3B8',
    badgeIcon: '💎',
    previewGradient: 'from-slate-200 via-slate-600 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#E2E8F0');
      const secondary = safeColor(data.secondaryColor, '#94A3B8');

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#1e293b');
      bg.addColorStop(0.5, '#0f172a');
      bg.addColorStop(1, '#020617');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      // Titanium brush streaks
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Platinum Inlay Frame
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(22, 22, W - 44, H - 44, radius - 10);
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', secondary, photoImg, logoImg, '💎', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 3.3 ROYAL EMERALD & ANTIQUE BRASS
  {
    id: 'royal_emerald_brass',
    name: 'Royal Emerald & Antique Brass Seal',
    category: '3d_luxury',
    industry: 'Royal Estates / Heritage Brands / Private Clubs',
    tagline: 'Deep velvet imperial emerald with engraved antique brass border and seal',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#059669',
    badgeIcon: '⚜️',
    previewGradient: 'from-amber-400 via-emerald-800 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#059669');

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#022c22');
      bg.addColorStop(0.6, '#064e3b');
      bg.addColorStop(1, '#021814');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;

      // Brass Corner Ornaments
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, W - 52, H - 52);
      ctx.strokeRect(32, 32, W - 64, H - 64);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '⚜️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 4. MODERN TECH & AI CATEGORY (4 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 4.1 CYBER MATRIX NEURAL GRID
  {
    id: 'cyber_neural_grid',
    name: 'Cyber Matrix Neural Grid',
    category: 'modern_tech',
    industry: 'AI / Machine Learning / Deep Tech',
    tagline: 'Dark sci-fi neural grid with glowing cyan data streams & matrix rain',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#8B5CF6',
    badgeIcon: '🤖',
    previewGradient: 'from-cyan-400 via-violet-700 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#8B5CF6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#020b14');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = hexToRgba(primary, 0.15);
      ctx.lineWidth = 1;
      const gridSize = Math.round(40 * k);
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      [0.25, 0.5, 0.75].forEach((pos, i) => {
        ctx.strokeStyle = i % 2 === 0 ? hexToRgba(primary, 0.6) : hexToRgba(secondary, 0.5);
        ctx.lineWidth = 2 + i;
        ctx.shadowColor = i % 2 === 0 ? primary : secondary;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        if (isPort) {
          ctx.moveTo(0, H * pos);
          ctx.bezierCurveTo(W * 0.4 * k, H * (pos - 0.15), W * 0.6 * k, H * (pos + 0.15), W, H * pos);
        } else {
          ctx.moveTo(W * pos, 0);
          ctx.lineTo(W * pos + H * 0.4 * k, H);
        }
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', hexToRgba(primary, 0.8), photoImg, logoImg, '🤖', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 4.2 HOLOGRAPHIC PRISMATIC FOIL
  {
    id: 'holographic_prism_foil',
    name: 'Holographic Prismatic Foil',
    category: 'modern_tech',
    industry: 'Startup / Innovation / Digital Product',
    tagline: 'Shimmering iridescent holographic foil surface with prismatic color shifts',
    theme: 'colorful',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#06B6D4',
    badgeIcon: '💎',
    previewGradient: 'from-amber-400 via-emerald-400 to-indigo-500',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#06B6D4');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0a0a12');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const foilColors = ['#f43f5e', '#f97316', '#fbbf24', '#4ade80', '#22d3ee', '#818cf8', '#e879f9'];
      foilColors.forEach((c, i) => {
        const grad = ctx.createLinearGradient(0, (H * i) / foilColors.length, W, (H * (i + 1)) / foilColors.length);
        grad.addColorStop(0, hexToRgba(c, 0.55));
        grad.addColorStop(0.5, hexToRgba(c, 0.15));
        grad.addColorStop(1, hexToRgba(foilColors[(i + 3) % foilColors.length], 0.55));
        ctx.fillStyle = grad;
        ctx.fillRect(0, (H * i) / foilColors.length, W, H / foilColors.length + 2);
      });
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', secondary, photoImg, logoImg, '💎', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 4.3 ELECTRIC BLUEPRINT
  {
    id: 'electric_blueprint',
    name: 'Electric Blueprint & Neon Schematic',
    category: 'modern_tech',
    industry: 'Engineering / Electronics / IoT / Hardware',
    tagline: 'Technical blueprint schematics with neon circuit traces glowing in the dark',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#10B981',
    badgeIcon: '⚙️',
    previewGradient: 'from-cyan-500 via-slate-900 to-emerald-900',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#10B981');

      ctx.fillStyle = safeColor(data.cardBgColor, '#031220');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = hexToRgba(primary, 0.18);
      ctx.lineWidth = 1;
      const gs = Math.round(30 * k);
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const traces = [
        [W * 0.15, H * 0.3, W * 0.6, H * 0.3, W * 0.6, H * 0.7, W * 0.85, H * 0.7],
        [W * 0.1, H * 0.55, W * 0.35, H * 0.55, W * 0.35, H * 0.2, W * 0.7, H * 0.2],
      ];
      traces.forEach((pts, ti) => {
        ctx.strokeStyle = ti === 0 ? primary : secondary;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = ti === 0 ? primary : secondary;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.stroke();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath(); ctx.arc(pts[0], pts[1], 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pts[pts.length - 2], pts[pts.length - 1], 5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', hexToRgba(secondary, 0.9), photoImg, logoImg, '⚙️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 4.4 QUANTUM NEON FLUX
  {
    id: 'quantum_neon_flux',
    name: 'Quantum Neon Flux & Particle Rays',
    category: 'modern_tech',
    industry: 'Quantum Computing / Photonics / Cloud / Security',
    tagline: 'Radial laser flux beams emanating from central quantum singularity',
    theme: 'dark',
    defaultAccent: '#8B5CF6',
    defaultSecondary: '#EC4899',
    badgeIcon: '⚛️',
    previewGradient: 'from-purple-500 via-pink-600 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#8B5CF6');
      const secondary = safeColor(data.secondaryColor, '#EC4899');

      ctx.fillStyle = safeColor(data.cardBgColor, '#06030d');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const qx = isPort ? W * 0.5 : W * 0.75;
      const qy = isPort ? H * 0.25 : H * 0.5;

      const qGlow = ctx.createRadialGradient(qx, qy, 10, qx, qy, W * 0.6 * k);
      qGlow.addColorStop(0, hexToRgba(primary, 0.6));
      qGlow.addColorStop(0.5, hexToRgba(secondary, 0.25));
      qGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = qGlow;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = hexToRgba('#ffffff', 0.25);
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(qx + Math.cos(ang) * W * 0.7, qy + Math.sin(ang) * H * 0.7);
        ctx.stroke();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', hexToRgba(secondary, 0.9), photoImg, logoImg, '⚛️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 5. CORPORATE & LEGAL CATEGORY (4 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 5.1 SLATE EXECUTIVE POWER STRIPE
  {
    id: 'slate_executive_stripe',
    name: 'Slate Executive Power Stripe',
    category: 'corporate_legal',
    industry: 'Corporate Law / Finance / Banking / Executive',
    tagline: 'Authoritative deep navy with bold gold executive power stripe',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#1E3A5F',
    badgeIcon: '⚖️',
    previewGradient: 'from-slate-900 via-blue-950 to-amber-800',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0d1b2a');
      bg.addColorStop(1, '#1a2c42');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const stripe = ctx.createLinearGradient(0, 0, 0, H);
      stripe.addColorStop(0, primary);
      stripe.addColorStop(0.3, '#fef08a');
      stripe.addColorStop(0.7, primary);
      stripe.addColorStop(1, '#92400e');
      if (isPort) {
        ctx.fillStyle = stripe;
        ctx.fillRect(0, 0, 14 * k, H);
        ctx.fillRect(W - 14 * k, 0, 14 * k, H);
      } else {
        ctx.fillStyle = stripe;
        ctx.fillRect(0, 0, W, 12 * k);
        ctx.fillRect(0, H - 12 * k, W, 12 * k);
      }
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 28, W - 56, H - 56);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', 'rgba(255,255,255,0.7)', photoImg, logoImg, '⚖️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 5.2 IVORY HELVETICA CORPORATE CLASSIC
  {
    id: 'ivory_helvetica_corporate',
    name: 'Ivory Helvetica Corporate Classic',
    category: 'corporate_legal',
    industry: 'Legal Firms / Government / Accounting / Insurance',
    tagline: 'Clean cream ivory with a single bold accent rule — Swiss corporate precision',
    theme: 'light',
    defaultAccent: '#1E3A5F',
    defaultSecondary: '#B45309',
    badgeIcon: '🏛️',
    previewGradient: 'from-amber-50 via-slate-100 to-blue-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#1E3A5F');
      ctx.fillStyle = safeColor(data.cardBgColor, '#f9f6f0');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.fillStyle = primary;
      if (isPort) {
        ctx.fillRect(0, 0, W, 8 * k);
        ctx.fillRect(0, H - 8 * k, W, 8 * k);
      } else {
        ctx.fillRect(0, 0, 10 * k, H);
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#1a1a2e', '#374151', photoImg, logoImg, '🏛️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#1a1a2e', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 5.3 SOVEREIGN GOLD CREST & PINSTRIPE
  {
    id: 'sovereign_gold_crest',
    name: 'Sovereign Gold Crest & Navy Pinstripe',
    category: 'corporate_legal',
    industry: 'Notary / Barrister / Wealth Management / Trust',
    tagline: 'Refined English bespoke pinstripe in Oxford navy with gilded crest border',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#1E40AF',
    badgeIcon: '🛡️',
    previewGradient: 'from-amber-400 via-blue-900 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      ctx.fillStyle = safeColor(data.cardBgColor, '#0a1526');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = 'rgba(255,255,255,0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 12) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, W - 40, H - 40);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#cbd5e1', photoImg, logoImg, '🛡️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 5.4 MANHATTAN FINANCIAL MONOLITH
  {
    id: 'manhattan_financial_monolith',
    name: 'Manhattan Financial Monolith',
    category: 'corporate_legal',
    industry: 'Wall Street / Hedge Fund / Private Equity / Fintech',
    tagline: 'Matte slate-black monolith with razor-thin chrome laser rules',
    theme: 'dark',
    defaultAccent: '#38BDF8',
    defaultSecondary: '#E2E8F0',
    badgeIcon: '🏙️',
    previewGradient: 'from-sky-400 via-slate-800 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#38BDF8');
      ctx.fillStyle = safeColor(data.cardBgColor, '#0b0f19');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, W, 4);
      ctx.fillRect(0, H - 4, W, 4);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#94a3b8', photoImg, logoImg, '🏙️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 6. TRADES & CONSTRUCTION CATEGORY (4 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 6.1 HARD HAT STEEL INDUSTRIAL
  {
    id: 'hardhat_steel_industrial',
    name: 'Hard Hat Steel Industrial',
    category: 'trades_construction',
    industry: 'Construction / Civil Engineering / Plumbing / HVAC',
    tagline: 'Rugged brushed steel texture with bold safety yellow and industrial stamp',
    theme: 'dark',
    defaultAccent: '#FBBF24',
    defaultSecondary: '#374151',
    badgeIcon: '🏗️',
    previewGradient: 'from-yellow-400 via-slate-700 to-slate-900',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#FBBF24');
      ctx.fillStyle = safeColor(data.cardBgColor, '#1c1f26');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 6) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

      ctx.fillStyle = primary;
      if (isPort) {
        ctx.fillRect(0, 0, W, 60 * k);
        ctx.fillStyle = '#1c1f26';
        for (let i = -60; i < W; i += 28) {
          ctx.beginPath();
          ctx.moveTo(i, 0); ctx.lineTo(i + 20, 0);
          ctx.lineTo(i + 20 + 60 * k, 60 * k); ctx.lineTo(i + 60 * k, 60 * k);
          ctx.closePath(); ctx.fill();
        }
      } else {
        ctx.fillRect(0, 0, W, 44 * k);
        ctx.fillStyle = '#1c1f26';
        for (let i = -44; i < W; i += 22) {
          ctx.beginPath();
          ctx.moveTo(i, 0); ctx.lineTo(i + 14, 0);
          ctx.lineTo(i + 14 + 44 * k, 44 * k); ctx.lineTo(i + 44 * k, 44 * k);
          ctx.closePath(); ctx.fill();
        }
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', 'rgba(255,255,255,0.7)', photoImg, logoImg, '🏗️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 6.2 FOREST LANDSCAPE & OUTDOORS
  {
    id: 'forest_landscape_outdoors',
    name: 'Forest & Landscape Outdoors Green',
    category: 'trades_construction',
    industry: 'Landscaping / Gardening / Forestry / Agriculture',
    tagline: 'Deep forest green with organic leaf-inspired curved flowing nature shapes',
    theme: 'dark',
    defaultAccent: '#16A34A',
    defaultSecondary: '#84CC16',
    badgeIcon: '🌿',
    previewGradient: 'from-green-600 via-emerald-800 to-slate-900',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#16A34A');
      const secondary = safeColor(data.secondaryColor, '#84CC16');

      ctx.fillStyle = safeColor(data.cardBgColor, '#0d2818');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const leaf = ctx.createLinearGradient(0, 0, W, H);
      leaf.addColorStop(0, primary);
      leaf.addColorStop(0.5, secondary);
      leaf.addColorStop(1, '#14532d');
      ctx.fillStyle = leaf;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * 0.6); ctx.bezierCurveTo(W * 0.6 * k, H * 0.4, W * 0.4 * k, H * 0.85, W, H * 0.7);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      } else {
        ctx.moveTo(0, H * 0.7); ctx.bezierCurveTo(W * 0.45 * k, H * 0.4, W * 0.55 * k, H * 0.95, W, H * 0.6);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, secondary, '#ffffff', '#bbf7d0', photoImg, logoImg, '🌿', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 6.3 PRECISION MACHINIST CARBON FIBER
  {
    id: 'machinist_carbon_fiber',
    name: 'Precision Machinist Carbon & Blaze',
    category: 'trades_construction',
    industry: 'Automotive / CNC Machining / Welding / Fabrication',
    tagline: 'High-tensile carbon weave with blaze orange safety accents and steel rivets',
    theme: 'dark',
    defaultAccent: '#EA580C',
    defaultSecondary: '#38BDF8',
    badgeIcon: '🔧',
    previewGradient: 'from-orange-500 via-neutral-800 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EA580C');
      ctx.fillStyle = safeColor(data.cardBgColor, '#141416');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.fillStyle = primary;
      if (isPort) {
        ctx.fillRect(0, 0, 10, H);
      } else {
        ctx.fillRect(0, 0, 12, H);
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fed7aa', photoImg, logoImg, '🔧', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 6.4 ARCHITECT DRAFTING BLUEPRINT
  {
    id: 'architect_blueprint_grid',
    name: 'Architect Drafting Vellum & Arcs',
    category: 'trades_construction',
    industry: 'Architects / Urban Planners / Interior Architecture',
    tagline: 'Classic drafting blueprint with compass arcs, dimension ticks and millimeter grid',
    theme: 'dark',
    defaultAccent: '#38BDF8',
    defaultSecondary: '#818CF8',
    badgeIcon: '📐',
    previewGradient: 'from-sky-500 via-blue-900 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#38BDF8');
      ctx.fillStyle = safeColor(data.cardBgColor, '#0f2744');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      const step = Math.round(25 * k);
      for (let x = 0; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W * 0.85, H * 0.5, H * 0.45 * k, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#bae6fd', photoImg, logoImg, '📐', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 7. LIFESTYLE & BEAUTY CATEGORY (4 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 7.1 BLUSH ROSE GOLD SPA
  {
    id: 'blush_rose_gold_spa',
    name: 'Blush Rose Gold & Marble Spa',
    category: 'lifestyle_beauty',
    industry: 'Spa / Beauty Salon / Wellness / Skincare',
    tagline: 'Luxurious soft blush pink with shimmering rose gold marble veining',
    theme: 'light',
    defaultAccent: '#FB7185',
    defaultSecondary: '#C084FC',
    badgeIcon: '🌸',
    previewGradient: 'from-pink-300 via-rose-200 to-purple-300',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#FB7185');
      const secondary = safeColor(data.secondaryColor, '#C084FC');

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#fdf2f8');
      bg.addColorStop(0.5, '#fce7f3');
      bg.addColorStop(1, '#f3e8ff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const shimmer = ctx.createLinearGradient(0, 0, W, H);
      shimmer.addColorStop(0, hexToRgba(primary, 0.25));
      shimmer.addColorStop(0.4, hexToRgba('#f9a8d4', 0.15));
      shimmer.addColorStop(0.7, hexToRgba(secondary, 0.2));
      shimmer.addColorStop(1, hexToRgba('#ddd6fe', 0.3));
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = hexToRgba(primary, 0.3);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.2, 0);
      ctx.bezierCurveTo(W * (0.35 * k), H * 0.25, W * (0.15 * k), H * 0.6, W * 0.4, H);
      ctx.stroke();

      ctx.strokeStyle = hexToRgba(secondary, 0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W * 0.75, 0);
      ctx.bezierCurveTo(W * (0.85 / k), H * 0.35, W * (0.6 * k), H * 0.65, W * 0.8, H);
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#3b0764', '#6b21a8', photoImg, logoImg, '🌸', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#3b0764', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 7.2 MIDNIGHT LUXURY MAKEUP
  {
    id: 'midnight_luxury_makeup',
    name: 'Midnight Luxury Makeup & Glam',
    category: 'lifestyle_beauty',
    industry: 'Makeup Artist / Fashion / Hair Salon / Lash Studio',
    tagline: 'Deep midnight black with shimmering gold dust and velvet rose petal gradient',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#FB7185',
    badgeIcon: '💄',
    previewGradient: 'from-rose-500 via-slate-950 to-amber-700',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#FB7185');

      const bg = ctx.createRadialGradient(W * 0.3, H * 0.3, 10, W * 0.5, H * 0.5, W * 0.7);
      bg.addColorStop(0, '#1a0a14');
      bg.addColorStop(0.5, '#0d0710');
      bg.addColorStop(1, '#050306');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const glow = ctx.createRadialGradient(0, H, 10, 0, H, W * 0.75 * k);
      glow.addColorStop(0, hexToRgba(secondary, 0.5));
      glow.addColorStop(0.5, hexToRgba(secondary, 0.15));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const glow2 = ctx.createRadialGradient(W, 0, 10, W, 0, W * 0.6 * k);
      glow2.addColorStop(0, hexToRgba(primary, 0.45));
      glow2.addColorStop(0.6, hexToRgba(primary, 0.1));
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', hexToRgba(secondary, 0.9), photoImg, logoImg, '💄', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 7.3 BOTANICAL ORGANIC HERBAL
  {
    id: 'botanical_organic_herbal',
    name: 'Botanical Organic Sage & Herbal',
    category: 'lifestyle_beauty',
    industry: 'Aromatherapy / Herbalist / Yoga / Natural Cosmetics',
    tagline: 'Serene sage green with delicate botanical vine silhouettes and cream paper',
    theme: 'light',
    defaultAccent: '#059669',
    defaultSecondary: '#D97706',
    badgeIcon: '🌿',
    previewGradient: 'from-emerald-100 via-teal-100 to-amber-100',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#059669');
      ctx.fillStyle = safeColor(data.cardBgColor, '#f2f8f5');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = hexToRgba(primary, 0.25);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(isPort ? W * 0.5 : W * 0.85, isPort ? H * 0.8 : H * 0.5, isPort ? W * 0.45 : H * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#064e3b', '#047857', photoImg, logoImg, '🌿', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#064e3b', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 7.4 LAVENDER GOLD LUXURY FOIL
  {
    id: 'lavender_gold_luxury',
    name: 'Lavender Velvet & Gold Leaf Foil',
    category: 'lifestyle_beauty',
    industry: 'Luxury Fragrance / Aesthetic Clinic / Couture',
    tagline: 'Soft lavender mist with gilded 24K gold foil trim and botanical geometry',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#C084FC',
    badgeIcon: '✨',
    previewGradient: 'from-purple-400 via-pink-400 to-amber-300',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');
      const secondary = safeColor(data.secondaryColor, '#C084FC');

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#2e1065');
      bg.addColorStop(0.5, '#4c1d95');
      bg.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, W - 48, H - 48);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', secondary, photoImg, logoImg, '✨', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 8. CREATIVE & COLORFUL CATEGORY (4 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 8.1 POP ART NEON BURST
  {
    id: 'pop_art_neon_burst',
    name: 'Pop Art Neon Burst & Confetti',
    category: 'creative_colorful',
    industry: 'Artists / Illustrators / Music / Entertainment',
    tagline: 'Explosive pop art neon confetti burst with bold vivid color blocks',
    theme: 'colorful',
    defaultAccent: '#F43F5E',
    defaultSecondary: '#FBBF24',
    badgeIcon: '🎉',
    previewGradient: 'from-rose-500 via-yellow-400 to-violet-600',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F43F5E');
      const secondary = safeColor(data.secondaryColor, '#FBBF24');

      ctx.fillStyle = safeColor(data.cardBgColor, '#fafafa');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const confettiColors = [primary, secondary, '#8B5CF6', '#06B6D4', '#10B981'];
      const confetti = [
        [W * 0.05, H * 0.08, W * 0.3, H * 0.25],
        [W * 0.7, H * 0.05, W * 0.25, H * 0.2],
        [W * 0.6, H * 0.78, W * 0.35, H * 0.18],
        [W * 0.0, H * 0.7, W * 0.28, H * 0.22],
        [W * 0.35, H * 0.55, W * 0.3, H * 0.15],
      ];
      confetti.forEach(([x, y, w, h], i) => {
        const r = ctx.createLinearGradient(x, y, x + w * k, y + h * k);
        r.addColorStop(0, confettiColors[i % confettiColors.length]);
        r.addColorStop(1, confettiColors[(i + 2) % confettiColors.length]);
        ctx.fillStyle = r;
        ctx.beginPath();
        ctx.roundRect(x, y, w * k, h * k, 12);
        ctx.fill();
      });
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#111827', '#374151', photoImg, logoImg, '🎉', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#111827', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 8.2 RETRO GRADIENT SUNSET VIBE
  {
    id: 'retro_gradient_vibe',
    name: 'Retro Gradient Sunset 80s Vibe',
    category: 'creative_colorful',
    industry: 'Photographer / Content Creator / DJ / Media',
    tagline: 'Bold 80s retrowave synthwave neon horizon sunset gradient',
    theme: 'colorful',
    defaultAccent: '#F97316',
    defaultSecondary: '#8B5CF6',
    badgeIcon: '🌅',
    previewGradient: 'from-orange-500 via-pink-500 to-violet-700',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F97316');
      const secondary = safeColor(data.secondaryColor, '#8B5CF6');

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const retro = ctx.createLinearGradient(0, 0, 0, H);
      retro.addColorStop(0, '#1a0533');
      retro.addColorStop(0.35, secondary);
      retro.addColorStop(0.6, primary);
      retro.addColorStop(0.8, '#FBBF24');
      retro.addColorStop(1, '#FEF08A');
      ctx.fillStyle = retro;
      ctx.fillRect(0, 0, W, H);

      const horizon = H * 0.55;
      ctx.strokeStyle = hexToRgba(primary, 0.5);
      ctx.lineWidth = 1.5;
      for (let y = 0; y < H * 0.5; y += 22 * k) {
        ctx.beginPath(); ctx.moveTo(0, horizon + y); ctx.lineTo(W, horizon + y); ctx.stroke();
      }
      for (let i = -3; i <= 10; i++) {
        const x = W * 0.5 + i * W * 0.08 * k;
        ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(W * 0.5, horizon); ctx.stroke();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, '#FBBF24', '#ffffff', '#fde68a', photoImg, logoImg, '🌅', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 8.3 MEMPHIS GEOMETRIC FUSION
  {
    id: 'memphis_geometric_fusion',
    name: 'Memphis 90s Geometric Fusion',
    category: 'creative_colorful',
    industry: 'Fashion / Graphic Design / Podcasters / Youth Brands',
    tagline: 'Playful 90s Memphis design with squiggles, triangles and pastel blocks',
    theme: 'colorful',
    defaultAccent: '#EC4899',
    defaultSecondary: '#3B82F6',
    badgeIcon: '⚡',
    previewGradient: 'from-pink-400 via-yellow-300 to-blue-400',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EC4899');
      const secondary = safeColor(data.secondaryColor, '#3B82F6');

      ctx.fillStyle = safeColor(data.cardBgColor, '#fefce8');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.fillStyle = primary;
      ctx.beginPath(); ctx.arc(W * 0.85, H * 0.25, 45, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = secondary;
      ctx.fillRect(W * 0.7, H * 0.65, 80, 50);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H * 0.85);
      ctx.lineTo(W * 0.18, H * 0.78);
      ctx.lineTo(W * 0.26, H * 0.85);
      ctx.lineTo(W * 0.34, H * 0.78);
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#0f172a', '#334155', photoImg, logoImg, '⚡', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#0f172a', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 8.4 ACRYLIC PASTEL CANVAS SWIRL
  {
    id: 'acrylic_pastel_canvas',
    name: 'Acrylic Pastel Canvas & Splash',
    category: 'creative_colorful',
    industry: 'Ceramics / Handcrafted Goods / Artisans / Floral',
    tagline: 'Soft pastel acrylic brushstrokes with tactile watercolor paper grain',
    theme: 'colorful',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#F43F5E',
    badgeIcon: '🖌️',
    previewGradient: 'from-cyan-200 via-rose-200 to-amber-100',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#F43F5E');

      ctx.fillStyle = safeColor(data.cardBgColor, '#fffdfa');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      const b1 = ctx.createLinearGradient(0, 0, W, H);
      b1.addColorStop(0, hexToRgba(primary, 0.45));
      b1.addColorStop(1, hexToRgba(secondary, 0.35));
      ctx.fillStyle = b1;
      ctx.beginPath();
      ctx.arc(W * 0.75, H * 0.4, W * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#1e293b', '#475569', photoImg, logoImg, '🖌️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#1e293b', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // ── 9. MINIMAL & SWISS CATEGORY (4 Templates)
  // ══════════════════════════════════════════════════════════════════

  // ── 9.1 PURE WHITE SWISS GRID
  {
    id: 'pure_white_swiss_grid',
    name: 'Pure White Swiss Grid Minimal',
    category: 'minimal_simple',
    industry: 'Architects / Designers / Consultants / Analysts',
    tagline: 'Razor-sharp Swiss grid system — maximum white space, single color accent',
    theme: 'light',
    defaultAccent: '#1E3A5F',
    defaultSecondary: '#94A3B8',
    badgeIcon: '⬜',
    previewGradient: 'from-white via-slate-100 to-blue-100',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#1E3A5F');
      ctx.fillStyle = safeColor(data.cardBgColor, '#ffffff');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, W, 8);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 8, W, 1);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#111827', '#6b7280', photoImg, logoImg, '⬜', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#111827', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 9.2 CHARCOAL INK MONO
  {
    id: 'charcoal_ink_mono',
    name: 'Charcoal Ink Monochrome Studio',
    category: 'minimal_simple',
    industry: 'Writers / Publishers / Editors / Filmmakers',
    tagline: 'Raw charcoal texture with bold typographic layout — editorial monochrome',
    theme: 'dark',
    defaultAccent: '#ffffff',
    defaultSecondary: '#94A3B8',
    badgeIcon: '◼',
    previewGradient: 'from-zinc-900 via-neutral-800 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#ffffff');
      ctx.fillStyle = safeColor(data.cardBgColor, '#111111');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let x = 0; x < W; x += 4) { ctx.fillRect(x, 0, 2, H); }
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      if (isPort) {
        ctx.strokeRect(30, 30, W - 60, H - 60);
      } else {
        ctx.beginPath();
        ctx.moveTo(0, H * 0.5 * k);
        ctx.lineTo(W, H * 0.5 * k);
        ctx.stroke();
      }
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#94a3b8', photoImg, logoImg, '◼', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 9.3 WABI-SABI SAND & ZEN CIRCLE
  {
    id: 'wabi_sabi_sand',
    name: 'Wabi-Sabi Sand & Zen Enso Circle',
    category: 'minimal_simple',
    industry: 'Tea Houses / Meditation / Artisanal Ceramics / Therapy',
    tagline: 'Warm textured sandstone canvas with brush-painted Zen Enso circle',
    theme: 'light',
    defaultAccent: '#B45309',
    defaultSecondary: '#78350F',
    badgeIcon: '⭕',
    previewGradient: 'from-amber-100 via-stone-200 to-amber-50',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#B45309');
      ctx.fillStyle = safeColor(data.cardBgColor, '#faf6f0');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = hexToRgba(primary, 0.4);
      ctx.lineWidth = 6;
      ctx.beginPath();
      const ex = isPort ? W * 0.5 : W * 0.85;
      const ey = isPort ? H * 0.75 : H * 0.5;
      ctx.arc(ex, ey, isPort ? W * 0.35 : H * 0.35, 0.2, Math.PI * 1.85);
      ctx.stroke();
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#292524', '#57534e', photoImg, logoImg, '⭕', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#292524', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 9.4 NORDIC FROST ARCTIC MINIMAL
  {
    id: 'nordic_frost_minimal',
    name: 'Nordic Frost Arctic Glass',
    category: 'minimal_simple',
    industry: 'Scandinavian Design / Lighting / Nordic Tech',
    tagline: 'Cool arctic frost white with icy glacier cyan borders and hairline typography',
    theme: 'light',
    defaultAccent: '#0284C7',
    defaultSecondary: '#38BDF8',
    badgeIcon: '❄️',
    previewGradient: 'from-sky-100 via-slate-50 to-blue-200',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const waveAlpha = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#0284C7');
      ctx.fillStyle = safeColor(data.cardBgColor, '#f8fafc');
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = waveAlpha;
      ctx.strokeStyle = hexToRgba(primary, 0.25);
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, W - 32, H - 32);
      ctx.restore();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#0f172a', '#475569', photoImg, logoImg, '❄️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#0f172a', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },
];

// ── COMPOSITE CONTENT RENDERERS WITH DYNAMIC POSITIONING & FONT SCALE ───────────
function renderStandardFrontContent(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  isPort: boolean,
  data: CardData,
  accentColor: string,
  textColor: string,
  subTextColor: string,
  photoImg: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  defaultIcon: string,
  bgImg: HTMLImageElement | null = null
) {
  const accent = safeColor(data.accentColor || accentColor, '#F59E0B');
  const secondary = safeColor(data.secondaryColor, '#EC4899');
  const tertiary = safeColor(data.tertiaryColor, '#38BDF8');
  const textCol = safeColor(data.textColor || textColor, '#FFFFFF');
  const subTextCol = safeColor(data.subTextColor || subTextColor, '#cbd5e1');
  const badgeCol = safeColor(data.badgeColor || data.accentColor || accentColor, '#F59E0B');
  const fScale = data.fontScale || 1.0;
  const align = data.contentAlign || (isPort ? 'center' : 'left');

  // ── Draw optional background image with opacity + tint overlay ──────────────
  if (bgImg) {
    drawBackgroundImage(ctx, W, H, bgImg, data.bgImageOpacity ?? 0.35, data.bgTintColor ?? '#000000', data.bgTintOpacity ?? 0.55);
  }

  // ── Draw wave pattern decorator layer ─────────────────────────────────────
  const curWaveOpacity = typeof data.waveOpacity === 'number' ? data.waveOpacity : 1.0;
  if (data.showWavePattern !== false && data.wavePattern && curWaveOpacity > 0.01) {
    drawWavePatternDecorator(
      ctx, W, H, isPort,
      data.wavePattern,
      data.accentColor,
      data.secondaryColor,
      data.tertiaryColor || '#38BDF8',
      curWaveOpacity,
      data.curveIntensity ?? 1.0,
      data.waveGradientPreset
    );
  }

  if (isPort) {
    // 1. Top Lanyard Badge Slot
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 32, 14, 64, 10, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Company Logo & Title (Position based on logoPosition)
    const logoSize = 58;
    let logoX = W / 2 - logoSize / 2;
    if (data.logoPosition === 'left') logoX = 55;
    else if (data.logoPosition === 'right') logoX = W - 55 - logoSize;
    const logoY = 38;

    if (logoImg && logoImg.width > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.stroke();
    } else {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(26 * fScale)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.companyName.charAt(0) || defaultIcon, logoX + logoSize / 2, logoY + logoSize / 2 + 1);
    }

    // Company Name & Tagline
    ctx.textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
    const textAnchorX = align === 'left' ? 55 : align === 'right' ? W - 55 : W / 2;
    ctx.fillStyle = textCol;
    ctx.font = `900 ${Math.round(21 * fScale)}px Inter, sans-serif`;
    ctx.fillText(data.companyName.toUpperCase(), textAnchorX, 126);

    if (data.tagline) {
      ctx.fillStyle = subTextCol;
      ctx.font = `500 ${Math.round(11.5 * fScale)}px Inter, sans-serif`;
      ctx.fillText(data.tagline, textAnchorX, 145);
    }

    // 3. ID Photo Frame
    const pSize = 165;
    const px = W / 2 - pSize / 2;
    const py = 172;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(px, py, pSize, pSize, 22);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    if (photoImg && photoImg.width > 0) {
      ctx.beginPath();
      ctx.roundRect(px + 4, py + 4, pSize - 8, pSize - 8, 18);
      ctx.clip();
      ctx.drawImage(photoImg, px + 4, py + 4, pSize - 8, pSize - 8);
    } else {
      ctx.fillStyle = subTextCol;
      ctx.beginPath();
      ctx.arc(W / 2, py + 64, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W / 2, py + pSize + 22, 60, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // 4. Name & Job Title Pill
    ctx.textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
    ctx.fillStyle = textCol;
    ctx.font = `900 ${Math.round(27 * fScale)}px Inter, sans-serif`;
    ctx.fillText(data.fullName, textAnchorX, 375);

    const titleText = data.jobTitle.toUpperCase();
    ctx.font = `bold ${Math.round(12.5 * fScale)}px Inter, sans-serif`;
    const titleMetrics = ctx.measureText(titleText);
    const pillW = Math.min(W - 80, titleMetrics.width + 36);
    const pillH = 28;
    const pillX = align === 'left' ? 55 : align === 'right' ? W - 55 - pillW : W / 2 - pillW / 2;
    const pillY = 390;

    ctx.fillStyle = hexToRgba(accent, 0.2);
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.fillText(titleText, pillX + pillW / 2, pillY + 18);

    if (data.department) {
      ctx.textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
      ctx.fillStyle = subTextCol;
      ctx.font = `600 ${Math.round(12 * fScale)}px Inter, sans-serif`;
      ctx.fillText(`Department: ${data.department}`, textAnchorX, 436);
    }

    // 5. 4 Glass Data Tiles
    const blockY = 462;
    const metrics = [
      { label: 'ID NUMBER', val: data.idNumber, col: accent },
      { label: 'BLOOD GROUP', val: data.bloodGroup, col: textCol },
      { label: 'ISSUE DATE', val: data.issueDate, col: subTextCol },
      { label: 'EXPIRY DATE', val: data.expiryDate, col: subTextCol },
    ];

    metrics.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const tileW = 230;
      const tileH = 50;
      const tx = col === 0 ? 55 : W - 55 - tileW;
      const ty = blockY + row * 58;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(tx, ty, tileW, tileH, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = subTextCol;
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText(m.label, tx + 14, ty + 18);

      ctx.fillStyle = m.col;
      ctx.font = `bold ${Math.round(14 * fScale)}px Inter, sans-serif`;
      ctx.fillText(m.val, tx + 14, ty + 38);
    });

    // 6. Contact Section
    const contactY = 598;
    ctx.textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
    ctx.font = `${Math.round(12.5 * fScale)}px Inter, sans-serif`;
    ctx.fillStyle = textCol;
    ctx.fillText(`📞  ${data.phone}`, textAnchorX, contactY);
    ctx.fillText(`✉️  ${data.email}`, textAnchorX, contactY + 25);
    ctx.fillText(`🌐  ${data.website}`, textAnchorX, contactY + 50);

    // 7. EMV Chip & NFC
    if (data.showChip) {
      drawEmvChip(ctx, 55, H - 155, 52, 38, true);
    }
    if (data.showContactless) {
      drawContactlessSymbol(ctx, W - 75, H - 135, accent);
    }

    // 8. Barcode
    if (data.showBarcode) {
      const barY = H - 95;
      ctx.fillStyle = textCol;
      for (let b = 80; b < W - 80; b += 7) {
        const bw = b % 14 === 0 ? 3.5 : 1.5;
        ctx.fillRect(b, barY, bw, 28);
      }
      ctx.font = 'bold 10.5px monospace';
      ctx.fillStyle = subTextCol;
      ctx.textAlign = 'center';
      ctx.fillText(data.idNumber, W / 2, barY + 40);
    }
  } else {
    // Landscape Layout
    const logoSize = 62;
    let logoX = 52;
    if (data.logoPosition === 'center') logoX = W / 2 - logoSize / 2;
    else if (data.logoPosition === 'right') logoX = W - 140 - logoSize;
    const logoY = 46;

    if (logoImg && logoImg.width > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.stroke();
    } else {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(28 * fScale)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.companyName.charAt(0) || defaultIcon, logoX + logoSize / 2, logoY + logoSize / 2 + 1);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = textCol;
    ctx.font = `900 ${Math.round(24 * fScale)}px Inter, sans-serif`;
    ctx.fillText(data.companyName.toUpperCase(), logoX + logoSize + 16, 72);

    if (data.tagline) {
      ctx.fillStyle = subTextCol;
      ctx.font = `500 ${Math.round(13 * fScale)}px Inter, sans-serif`;
      ctx.fillText(data.tagline, logoX + logoSize + 16, 96);
    }

    // Top Right Chip & Wave
    if (data.showChip) {
      drawEmvChip(ctx, W - 140, 48, 64, 46, true);
    }
    if (data.showContactless) {
      drawContactlessSymbol(ctx, W - 180, 70, accent);
    }

    // Middle Name & Title (Aligned based on contentAlign)
    const nameY = 210;
    const nameX = align === 'center' ? W / 2 : align === 'right' ? W - 52 : 52;
    ctx.textAlign = align;

    ctx.fillStyle = textCol;
    ctx.font = `900 ${Math.round(38 * fScale)}px Inter, sans-serif`;
    ctx.fillText(data.fullName, nameX, nameY);

    ctx.fillStyle = accent;
    ctx.font = `bold ${Math.round(17 * fScale)}px Inter, sans-serif`;
    ctx.fillText(data.jobTitle.toUpperCase(), nameX, nameY + 30);

    if (data.department) {
      ctx.fillStyle = subTextCol;
      ctx.font = `600 ${Math.round(13 * fScale)}px Inter, sans-serif`;
      ctx.fillText(`Dept: ${data.department}`, nameX, nameY + 54);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`${data.idNumber || 'BT-8842-SL'}  •  ${data.issueDate}  EXP: ${data.expiryDate}`, nameX, nameY + 84);

    // Contacts (2 Columns)
    const startY = 360;
    const contacts = [
      { icon: '📞', text: data.phone },
      { icon: '✉️', text: data.email },
      { icon: '🌐', text: data.website },
      { icon: '📍', text: data.address },
    ].filter((c) => c.text);

    contacts.forEach((c, idx) => {
      const col = idx < 2 ? 0 : 1;
      const row = idx % 2;
      const cx = 52 + col * 380;
      const cy = startY + row * 38;

      ctx.textAlign = 'left';
      ctx.font = `${Math.round(14 * fScale)}px Inter, sans-serif`;
      ctx.fillStyle = textCol;
      ctx.fillText(`${c.icon}  ${c.text}`, cx, cy);
    });

    if (data.showMasterCircles) {
      drawInterlockingCircles(ctx, W - 85, H - 75, 26, accent, data.secondaryColor || '#EF4444');
    }
  }

  if (data.showCutMarks) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    const cl = 16;
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(10, cl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(cl, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 10, 0); ctx.lineTo(W - 10, cl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W, 10); ctx.lineTo(W - cl, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, H); ctx.lineTo(10, H - cl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H - 10); ctx.lineTo(cl, H - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 10, H); ctx.lineTo(W - 10, H - cl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W, H - 10); ctx.lineTo(W - cl, H - 10); ctx.stroke();
  }
}

function renderStandardBackContent(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  isPort: boolean,
  data: CardData,
  accentColor: string,
  textColor: string,
  qrImg: HTMLImageElement | null
) {
  const accent = safeColor(accentColor, '#F59E0B');
  const textCol = safeColor(textColor, '#FFFFFF');

  const stripeH = isPort ? 56 : 64;
  const stripeY = isPort ? 32 : 40;

  const magGrad = ctx.createLinearGradient(0, stripeY, 0, stripeY + stripeH);
  magGrad.addColorStop(0, '#030508');
  magGrad.addColorStop(0.5, '#1e2533');
  magGrad.addColorStop(1, '#030508');
  ctx.fillStyle = magGrad;
  ctx.fillRect(0, stripeY, W, stripeH);

  const sigX = isPort ? 45 : 55;
  const sigY = isPort ? 110 : 125;
  const sigW = isPort ? W - 90 : W * 0.46;
  const sigH = 46;

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(sigX, sigY, sigW, sigH, 6);
  ctx.fill();

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 1;
  for (let sx = sigX; sx < sigX + sigW; sx += 12) {
    ctx.beginPath();
    ctx.moveTo(sx, sigY);
    ctx.lineTo(sx + sigH, sigY + sigH);
    ctx.stroke();
  }

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 9px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('AUTHORIZED SIGNATURE — NOT VALID UNLESS SIGNED', sigX + 10, sigY + 16);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'italic bold 16px "Brush Script MT", cursive, sans-serif';
  ctx.fillText(data.fullName, sigX + 24, sigY + 36);

  const qrSize = isPort ? 180 : 190;
  const qx = isPort ? W / 2 - qrSize / 2 : W - qrSize - 65;
  const qy = isPort ? 180 : 135;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(qx - 8, qy - 8, qrSize + 16, qrSize + 16, 14);
  ctx.fill();

  if (qrImg && qrImg.width > 0) {
    ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);
  }
  ctx.restore();

  const tx = isPort ? W / 2 : 55;
  const ty = isPort ? 415 : 205;

  ctx.textAlign = isPort ? 'center' : 'left';
  ctx.fillStyle = textCol;
  ctx.font = '900 21px Inter, sans-serif';
  ctx.fillText(data.backTitle, tx, ty);

  ctx.fillStyle = accent;
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText(data.backSubtitle, tx, ty + 24);

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '11.5px Inter, sans-serif';

  const words = data.disclaimer.split(' ');
  let line = '';
  let lineY = ty + 56;
  const maxW = isPort ? W - 90 : W * 0.46;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxW && n > 0) {
      ctx.fillText(line, tx, lineY);
      line = words[n] + ' ';
      lineY += 19;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, tx, lineY);

  if (data.emergencyContact) {
    lineY += 28;
    ctx.fillStyle = textCol;
    ctx.font = 'bold 12.5px Inter, sans-serif';
    ctx.fillText(`Emergency Security: ${data.emergencyContact}`, tx, lineY);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText(`${data.companyName.toUpperCase()} · ${data.website}`, W / 2, H - 34);
}

const DEFAULT_CARD_DATA: CardData = {
  fullName: 'Alexander R. Cole',
  jobTitle: 'Chief Technology Officer',
  companyName: 'BridgeTec Digital Services',
  tagline: 'Empowering Enterprise Excellence',
  department: 'Software & Infrastructure',
  idNumber: 'BT-8842-SL',
  bloodGroup: 'O+',
  issueDate: '01 / 2026',
  expiryDate: '12 / 2028',

  phone: '+232 33 399 391',
  whatsapp: '+232 33 399 391',
  email: 'alexander.cole@bridgetec.sl',
  website: 'www.itservicesfreetown.com',
  address: '15 Wilkinson Road, Freetown, Sierra Leone',
  socialHandle: '@bridgetec_sl',

  backTitle: 'OFFICIAL CORPORATE CREDENTIAL',
  backSubtitle: 'Scan QR code to save full contact vCard directly to your smartphone.',
  disclaimer: 'This card remains property of the issuing organization. If found, please return to the address on the reverse or call security.',
  emergencyContact: '+232 88 294 631',

  photoUrl: null,
  logoUrl: null,

  qrType: 'vcard',
  qrCustomText: 'https://www.itservicesfreetown.com',

  templateId: 'fluid_chroma_wave',
  orientation: 'landscape',
  accentColor: '#F97316',
  secondaryColor: '#EC4899',
  tertiaryColor: '#38BDF8',
  cardBgColor: '#0a0914',
  textColor: '#FFFFFF',
  subTextColor: '#cbd5e1',
  badgeColor: '#F59E0B',
  bgOpacity: 0.4,
  showChip: true,
  showContactless: true,
  showBarcode: true,
  showMasterCircles: true,
  showCutMarks: false,

  contentAlign: 'left',
  logoPosition: 'left',
  fontScale: 1.0,
  curveIntensity: 1.0,
  cornerRadius: 38,
  previewZoom: 100,

  bgImageUrl: null,
  bgImageOpacity: 0.35,
  bgTintColor: '#000000',
  bgTintOpacity: 0.55,

  showWavePattern: true,
  waveOpacity: 1.0,
  waveGradientPreset: 'card_colors',
  wavePattern: 'bezier',
};

export default function CardStudio() {
  const [data, setData] = useState<CardData>(DEFAULT_CARD_DATA);
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');
  const [activeTab, setActiveTab] = useState<'templates' | 'position_size' | 'identity' | 'contacts' | 'media_qr' | 'export'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<TemplateStyleGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);

  const cardPinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);

  // ── Auto-Save & Navigation Guard State ──────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const isLoadedFromStorageRef = useRef(false);

  // Auto-load previously customized card data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bridgetec_card_studio_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.warn('Auto-load card data warning:', e);
    } finally {
      isLoadedFromStorageRef.current = true;
    }
  }, []);

  // Auto-save card data to localStorage on changes (debounced 350ms)
  useEffect(() => {
    if (!isLoadedFromStorageRef.current) return;
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('bridgetec_card_studio_data_v2', JSON.stringify(data));
        setSaveStatus('saved');
      } catch (err) {
        try {
          // Quota fallback: persist configuration without large image data strings
          const stripped = { ...data, photoUrl: null, logoUrl: null, bgImageUrl: null };
          localStorage.setItem('bridgetec_card_studio_data_v2', JSON.stringify(stripped));
          setSaveStatus('saved');
        } catch {
          console.warn('Auto-save error:', err);
        }
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [data]);

  // Warning to confirm page refresh or page close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Reset card back to pristine default settings
  const handleResetToDefault = () => {
    if (window.confirm('Reset this card to original default template settings? Your custom edits will be cleared.')) {
      try {
        localStorage.removeItem('bridgetec_card_studio_data_v2');
      } catch {}
      setData(DEFAULT_CARD_DATA);
    }
  };

  useEffect(() => {
    if (data.photoUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { photoImgRef.current = img; drawCanvases(); };
      img.src = data.photoUrl;
    } else {
      photoImgRef.current = null;
    }
  }, [data.photoUrl]);

  useEffect(() => {
    if (data.logoUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { logoImgRef.current = img; drawCanvases(); };
      img.src = data.logoUrl;
    } else {
      logoImgRef.current = null;
    }
  }, [data.logoUrl]);

  useEffect(() => {
    if (data.bgImageUrl) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { bgImgRef.current = img; drawCanvases(); };
      img.src = data.bgImageUrl;
    } else {
      bgImgRef.current = null;
    }
  }, [data.bgImageUrl]);

  const cardDim = useMemo(() => {
    if (data.orientation === 'portrait') {
      return {
        width: 600,
        height: 1050,
        aspect: 'aspect-[600/1050]',
        containerClass: 'max-w-[340px] max-h-[595px]',
      };
    }
    return {
      width: 1050,
      height: 600,
      aspect: 'aspect-[1050/600]',
      containerClass: 'max-w-[560px] max-h-[320px]',
    };
  }, [data.orientation]);

  useEffect(() => {
    let text = data.website;
    if (data.qrType === 'vcard') {
      text = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${data.fullName}`,
        `ORG:${data.companyName}`,
        `TITLE:${data.jobTitle}`,
        `TEL;TYPE=WORK,VOICE:${data.phone}`,
        `TEL;TYPE=CELL:${data.whatsapp}`,
        `EMAIL;TYPE=PREF,INTERNET:${data.email}`,
        `URL:${data.website.startsWith('http') ? data.website : `https://${data.website}`}`,
        `ADR;TYPE=WORK:;;${data.address};;;;`,
        'END:VCARD',
      ].join('\n');
    } else if (data.qrType === 'custom_text') {
      text = data.qrCustomText || data.website;
    }

    QRCode.toDataURL(text, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        setQrDataUrl(url);
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { qrImgRef.current = img; drawCanvases(); };
        img.src = url;
      })
      .catch((err) => console.warn('QR error:', err));
  }, [data.qrType, data.qrCustomText, data.fullName, data.companyName, data.jobTitle, data.phone, data.whatsapp, data.email, data.website, data.address]);

  const activeTemplate = useMemo(() => {
    return MASTER_TEMPLATES.find((t) => t.id === data.templateId) || MASTER_TEMPLATES[0];
  }, [data.templateId]);

  const drawCanvases = useCallback(() => {
    const W = cardDim.width;
    const H = cardDim.height;
    const isPort = data.orientation === 'portrait';

    const frontCanvas = frontCanvasRef.current;
    if (frontCanvas) {
      frontCanvas.width = W;
      frontCanvas.height = H;
      const ctx = frontCanvas.getContext('2d');
      if (ctx && activeTemplate) {
        activeTemplate.drawCard(ctx, W, H, isPort, false, data, qrImgRef.current, photoImgRef.current, logoImgRef.current, bgImgRef.current);
      }
    }

    const backCanvas = backCanvasRef.current;
    if (backCanvas) {
      backCanvas.width = W;
      backCanvas.height = H;
      const ctx = backCanvas.getContext('2d');
      if (ctx && activeTemplate) {
        activeTemplate.drawCard(ctx, W, H, isPort, true, data, qrImgRef.current, photoImgRef.current, logoImgRef.current, bgImgRef.current);
      }
    }
  }, [cardDim, data, activeTemplate]);

  useEffect(() => {
    drawCanvases();
  }, [drawCanvases]);

  // Fix black screen on view switch: ensure canvases are always fresh on activeSide change
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      drawCanvases();
    });
    return () => cancelAnimationFrame(raf);
  }, [activeSide, drawCanvases]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / (rect.height / 2)) * 8;
    const rotY = (x / (rect.width / 2)) * 8;
    setTilt({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Pinch-to-zoom directly on the card preview container with two fingers
  const handleCardTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      cardPinchRef.current = {
        startDist: Math.hypot(dx, dy),
        startZoom: data.previewZoom || 100,
      };
    }
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && cardPinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / cardPinchRef.current.startDist;
      const newZoom = Math.round(Math.min(140, Math.max(60, cardPinchRef.current.startZoom * scale)));
      setData((prev) => ({ ...prev, previewZoom: newZoom }));
    }
  };

  const handleCardTouchEnd = () => {
    cardPinchRef.current = null;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl' | 'bgImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenStudioWindow = () => {
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (!frontCanvas || !backCanvas) return;

    const w = window.open('', '_blank');
    if (!w) {
      alert('Please allow popups to open the full design studio window.');
      return;
    }

    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.fullName} - 3D Master Card Studio</title>
          <style>
            body { margin: 0; background: #020617; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; box-sizing: border-box; }
            h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
            .badge { display: inline-block; background: #f59e0b; color: #000; font-size: 11px; font-weight: 900; padding: 4px 10px; border-radius: 999px; margin-bottom: 12px; }
            p { color: #94a3b8; font-size: 13px; margin-top: 0; margin-bottom: 28px; }
            .grid { display: flex; flex-wrap: wrap; gap: 32px; justify-content: center; max-width: 1200px; perspective: 1200px; }
            .card { background: #0a0f1d; border: 1px solid rgba(255,255,255,0.1); border-radius: 26px; padding: 18px; box-shadow: 0 30px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2); text-align: center; }
            img { width: 100%; max-width: 500px; border-radius: 18px; display: block; box-shadow: 0 15px 35px rgba(0,0,0,0.6); }
            .label { font-size: 12px; font-weight: bold; color: #f59e0b; margin-top: 14px; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <div class="badge">3D MASTERCARD LUXURY PREVIEW</div>
          <h1>${data.fullName} — ${data.companyName}</h1>
          <p>ISO/IEC 7810 ID-1 Standard 300 DPI Export Clarity</p>
          <div class="grid">
            <div class="card">
              <img src="${frontCanvas.toDataURL('image/png')}" />
              <div class="label">FRONT SIDE (300 DPI)</div>
            </div>
            <div class="card">
              <img src="${backCanvas.toDataURL('image/png')}" />
              <div class="label">BACK SIDE (SCANNABLE VCARD)</div>
            </div>
          </div>
        </body>
      </html>
    `);
    w.document.close();
  };

  const downloadSinglePdf = async () => {
    setIsExporting(true);
    try {
      const frontCanvas = frontCanvasRef.current;
      const backCanvas = backCanvasRef.current;
      if (!frontCanvas || !backCanvas) return;

      const isPort = data.orientation === 'portrait';
      const pdfW = isPort ? 54.0 : 85.6;
      const pdfH = isPort ? 85.6 : 54.0;

      const pdf = new jsPDF({
        orientation: isPort ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfW, pdfH],
      });

      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      pdf.addPage([pdfW, pdfH], isPort ? 'portrait' : 'landscape');
      pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');

      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_3D_Card_300DPI.pdf`);
    } catch {
      alert('Failed to generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadA4PrintSheet = async () => {
    setIsExporting(true);
    try {
      const frontCanvas = frontCanvasRef.current;
      const backCanvas = backCanvasRef.current;
      if (!frontCanvas || !backCanvas) return;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const cardW = 85.6;
      const cardH = 54.0;
      const marginX = 14.0;
      const marginY = 18.0;
      const spacingX = 10.0;
      const spacingY = 12.0;

      const fImg = frontCanvas.toDataURL('image/png');
      const bImg = backCanvas.toDataURL('image/png');

      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(`BridgeTec 3D Card Studio — Front Sheet (${data.fullName})`, 14, 12);

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          const x = marginX + c * (cardW + spacingX);
          const y = marginY + r * (cardH + spacingY);
          pdf.addImage(fImg, 'PNG', x, y, cardW, cardH, undefined, 'FAST');
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x, y, cardW, cardH);
        }
      }

      pdf.addPage('a4', 'portrait');
      pdf.text(`BridgeTec 3D Card Studio — Back Sheet (${data.fullName})`, 14, 12);

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          const mirroredCol = c === 0 ? 1 : 0;
          const x = marginX + mirroredCol * (cardW + spacingX);
          const y = marginY + r * (cardH + spacingY);
          pdf.addImage(bImg, 'PNG', x, y, cardW, cardH, undefined, 'FAST');
          pdf.rect(x, y, cardW, cardH);
        }
      }

      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_A4_8Cards_Duplex.pdf`);
    } catch {
      alert('Failed to generate A4 print sheet.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPng = (side: 'front' | 'back') => {
    const canvas = side === 'front' ? frontCanvasRef.current : backCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `${data.fullName.replace(/\s+/g, '_')}_${side.toUpperCase()}_300DPI.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
  };

  const handlePrint = () => {
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (!frontCanvas || !backCanvas) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`
      <!DOCTYPE html><html><head><style>
        @page { size: auto; margin: 8mm; }
        body { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 20px; font-family: sans-serif; }
        img { width: 85.6mm; height: 54mm; object-fit: contain; border-radius: 3.18mm; box-shadow: 0 0 1px #888; }
      </style></head><body>
        <div><img src="${frontCanvas.toDataURL('image/png')}" /></div>
        <div><img src="${backCanvas.toDataURL('image/png')}" /></div>
        <script>window.onload=function(){window.focus();window.print();setTimeout(function(){window.parent.document.body.removeChild(window.frameElement);},1500);};</script>
      </body></html>
    `);
    doc.close();
  };

  const filteredTemplates = useMemo(() => {
    return MASTER_TEMPLATES.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.industry.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  const zoomFactor = (data.previewZoom || 100) / 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── TOOL HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-amber-500/20">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  3D Modern Curved Luxury • 300 DPI
                </span>
                <span className="text-xs font-bold text-slate-400">• ISO 7810 Standard</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-Saved'}</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                3D Artistic Curved &amp; Business Card Studio
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Dynamic flowing Bezier curved colors, iridescent S-curves, position alignments, adjustable size bars, 3D EMV microchip, and print-ready duplex PDFs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetToDefault}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
              title="Reset card to default template settings"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleOpenStudioWindow}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-1.5 transition-all border border-cyan-500/30 shadow-md"
              title="Open full view in new window"
            >
              <ExternalLink className="w-4 h-4" />
              <span>3D New Window</span>
            </button>

            <button
              onClick={downloadSinglePdf}
              disabled={isExporting}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Download Card PDF'}</span>
            </button>

            <button
              onClick={downloadA4PrintSheet}
              disabled={isExporting}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all border border-slate-700 shadow-md"
            >
              <Grid className="w-4 h-4 text-cyan-400" />
              <span>8-Card A4 Sheet</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN STUDIO GRID ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE 3D CANVASES PREVIEW (7 Cols) — sticky so card stays visible while scrolling controls */}
        <div className="lg:col-span-7 space-y-5 lg:sticky lg:top-4 lg:self-start">
          {/* Side Toggle & Zoom Pill */}
          <div className="flex flex-wrap items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSide('both')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'both' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dual View
              </button>
              <button
                onClick={() => setActiveSide('front')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'front' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'back' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Back Side
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Zoom Controls — Visible on all mobile & desktop screens */}
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, previewZoom: Math.max(60, (prev.previewZoom || 100) - 10) }))}
                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-sm"
                  title="Zoom Out"
                >
                  −
                </button>
                <input
                  type="range"
                  min="60"
                  max="140"
                  step="5"
                  value={data.previewZoom || 100}
                  onChange={(e) => setData({ ...data, previewZoom: parseInt(e.target.value) })}
                  className="w-14 sm:w-20 accent-amber-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, previewZoom: Math.min(140, (prev.previewZoom || 100) + 10) }))}
                  className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center justify-center text-sm"
                  title="Zoom In"
                >
                  +
                </button>
                <span className="font-mono text-[11px] text-amber-300 w-8 text-center">{data.previewZoom || 100}%</span>
              </div>

              <div className="hidden lg:flex text-[11px] font-mono text-slate-400 items-center gap-1.5 pl-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {data.orientation === 'landscape' ? '85.6 × 54 mm' : '54 × 85.6 mm'}
              </div>
            </div>
          </div>

          {/* 3D Canvas Perspective Display Containers — both kept mounted in DOM to prevent black screen */}
          <div className="space-y-6">
            {/* Front Card Container */}
            <div className={`space-y-2 ${activeSide === 'both' || activeSide === 'front' ? 'block' : 'hidden'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Eye className="w-3.5 h-3.5" />
                  3D FRONT SIDE (ARTISTIC CURVED)
                </span>
                <div className="flex items-center gap-2">
                  {zoomFactor > 1.05 && (
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ↔ Scroll left/right
                    </span>
                  )}
                  <button
                    onClick={() => downloadPng('front')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Container on zoom up to 140% */}
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleCardTouchStart}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={handleCardTouchEnd}
                className="relative rounded-3xl overflow-x-auto overflow-y-hidden border border-slate-800 bg-slate-950 p-3 sm:p-6 lg:p-8 shadow-2xl transition-all touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                style={{ perspective: '1200px' }}
              >
                <div
                  className="min-w-fit mx-auto flex items-center justify-center"
                  style={{
                    paddingLeft: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 240)}px` : '0px',
                    paddingRight: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 240)}px` : '0px',
                    paddingTop: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 90)}px` : '0px',
                    paddingBottom: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 90)}px` : '0px',
                  }}
                >
                  <div
                    className="relative transition-transform duration-150 ease-out origin-center shrink-0"
                    style={{
                      transform: `scale(${zoomFactor}) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      className="absolute -inset-2 rounded-[32px] bg-black/60 blur-xl -z-10 pointer-events-none"
                      style={{ transform: 'translateZ(-20px)' }}
                    />

                    <canvas
                      ref={frontCanvasRef}
                      className={`w-full ${cardDim.containerClass} ${cardDim.aspect} rounded-[24px] shadow-2xl object-contain ring-1 ring-white/10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Back Card Container */}
            <div className={`space-y-2 ${activeSide === 'both' || activeSide === 'back' ? 'block' : 'hidden'}`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-blue-300">
                  <QrCode className="w-3.5 h-3.5" />
                  3D BACK SIDE (MAGNETIC STRIPE &amp; VCARD QR)
                </span>
                <div className="flex items-center gap-2">
                  {zoomFactor > 1.05 && (
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ↔ Scroll left/right
                    </span>
                  )}
                  <button
                    onClick={() => downloadPng('back')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PNG</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Container on zoom up to 140% */}
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleCardTouchStart}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={handleCardTouchEnd}
                className="relative rounded-3xl overflow-x-auto overflow-y-hidden border border-slate-800 bg-slate-950 p-3 sm:p-6 lg:p-8 shadow-2xl transition-all touch-pan-x overscroll-x-contain scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                style={{ perspective: '1200px' }}
              >
                <div
                  className="min-w-fit mx-auto flex items-center justify-center"
                  style={{
                    paddingLeft: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 240)}px` : '0px',
                    paddingRight: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 240)}px` : '0px',
                    paddingTop: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 90)}px` : '0px',
                    paddingBottom: zoomFactor > 1 ? `${Math.round((zoomFactor - 1) * 90)}px` : '0px',
                  }}
                >
                  <div
                    className="relative transition-transform duration-150 ease-out origin-center shrink-0"
                    style={{
                      transform: `scale(${zoomFactor}) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      className="absolute -inset-2 rounded-[32px] bg-black/60 blur-xl -z-10 pointer-events-none"
                      style={{ transform: 'translateZ(-20px)' }}
                    />

                    <canvas
                      ref={backCanvasRef}
                      className={`w-full ${cardDim.containerClass} ${cardDim.aspect} rounded-[24px] shadow-2xl object-contain ring-1 ring-white/10`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* RIGHT COLUMN: DESIGN TEMPLATE BROWSER & CONTROLS (5 Cols) — scrollable while card is sticky */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur">
          {/* Sticky sub-tab bar at top of controls panel */}
          <div className="p-5 sm:p-6 pb-3 space-y-4">
          {/* Sub-Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'templates', label: 'Designs', icon: Sparkles },
              { id: 'position_size', label: 'Layout/Bars', icon: Sliders },
              { id: 'identity', label: 'Identity', icon: User },
              { id: 'contacts', label: 'Contacts', icon: Phone },
              { id: 'media_qr', label: 'Media & QR', icon: QrCode },
              { id: 'export', label: 'Print/PDF', icon: Printer },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-0.5 rounded-xl text-[9.5px] font-bold flex flex-col items-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          </div>{/* end sticky tab-bar header wrapper */}

          {/* Scrollable tab content area */}
          <div className="lg:overflow-y-auto lg:max-h-[calc(100vh-220px)] px-4 sm:px-6 pb-5 sm:pb-6 space-y-6 overscroll-contain">

          {/* TAB 1: DESIGN TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-5">
              {/* Orientation Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Card Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setData({ ...data, orientation: 'landscape' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      data.orientation === 'landscape'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <span>Landscape (3.5" × 2")</span>
                  </button>
                  <button
                    onClick={() => setData({ ...data, orientation: 'portrait' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      data.orientation === 'portrait'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <span>Portrait (2" × 3.5")</span>
                  </button>
                </div>
              </div>

              {/* 3D Hardware Elements Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">3D Hardware Badges &amp; Embellishments</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setData({ ...data, showChip: !data.showChip })}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                      data.showChip ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <span>EMV Smart Chip</span>
                    {data.showChip && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setData({ ...data, showContactless: !data.showContactless })}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                      data.showContactless ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <span>Contactless NFC</span>
                    {data.showContactless && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setData({ ...data, showMasterCircles: !data.showMasterCircles })}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                      data.showMasterCircles ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <span>Dual Circles Crest</span>
                    {data.showMasterCircles && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setData({ ...data, showBarcode: !data.showBarcode })}
                    className={`py-2 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                      data.showBarcode ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    <span>Security Barcode</span>
                    {data.showBarcode && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                </div>
              </div>

              {/* ── COMPLETE CARD COLOR PALETTE STUDIO ────────────────────────────── */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Full Card Color Palette (Edit Every Color)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Live 3D Customizer
                  </span>
                </div>

                {/* 1-Click Master Palette Presets */}
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10.5px] font-bold text-slate-400 block">
                    ✨ One-Click Luxury Color Harmonies:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { name: '👑 Gold & Obsidian', p: '#F59E0B', s: '#D97706', t: '#FEF08A', bg: '#0A0914', txt: '#FFFFFF', sub: '#CBD5E1', b: '#F59E0B' },
                      { name: '⚡ Cyber Synth', p: '#EC4899', s: '#06B6D4', t: '#A855F7', bg: '#030712', txt: '#FFFFFF', sub: '#A5F3FC', b: '#06B6D4' },
                      { name: '🍃 Royal Emerald', p: '#10B981', s: '#059669', t: '#34D399', bg: '#021814', txt: '#FFFFFF', sub: '#A7F3D0', b: '#10B981' },
                      { name: '🌊 Deep Sapphire', p: '#38BDF8', s: '#3B82F6', t: '#818CF8', bg: '#040E40', txt: '#FFFFFF', sub: '#BAE6FD', b: '#38BDF8' },
                      { name: '🌅 Sunset Flame', p: '#F43F5E', s: '#FB923C', t: '#FACC15', bg: '#14050D', txt: '#FFFFFF', sub: '#FED7AA', b: '#F43F5E' },
                      { name: '🏛️ Sovereign Mint', p: '#F59E0B', s: '#3B82F6', t: '#FEF08A', bg: '#060A17', txt: '#FFFFFF', sub: '#FDE68A', b: '#F59E0B' },
                      { name: '🌸 Rose Velvet', p: '#FB7185', s: '#F43F5E', t: '#FEF08A', bg: '#18040D', txt: '#FFFFFF', sub: '#FBCFE8', b: '#FB7185' },
                      { name: '⚪ Minimal Swiss', p: '#0F172A', s: '#475569', t: '#2563EB', bg: '#FAFAFA', txt: '#0F172A', sub: '#475569', b: '#0F172A' },
                    ].map((pal) => (
                      <button
                        key={pal.name}
                        onClick={() =>
                          setData({
                            ...data,
                            accentColor: pal.p,
                            secondaryColor: pal.s,
                            tertiaryColor: pal.t,
                            cardBgColor: pal.bg,
                            textColor: pal.txt,
                            subTextColor: pal.sub,
                            badgeColor: pal.b,
                          })
                        }
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 text-[10px] font-bold transition-all"
                      >
                        <div className="flex -space-x-1 shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full ring-1 ring-black" style={{ backgroundColor: pal.p }} />
                          <span className="w-2.5 h-2.5 rounded-full ring-1 ring-black" style={{ backgroundColor: pal.s }} />
                          <span className="w-2.5 h-2.5 rounded-full ring-1 ring-black" style={{ backgroundColor: pal.bg }} />
                        </div>
                        <span className="truncate">{pal.name.split(' ')[1] || pal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7 Individual Color Pickers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Primary Wave / Accent Color */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-amber-300">1. Primary Wave / Hero Color</span>
                      <span className="font-mono text-slate-400 text-[10px]">{data.accentColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={safeColor(data.accentColor, '#F97316')}
                        onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.accentColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, accentColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#F97316"
                        className="w-full bg-slate-900 px-2 py-1 rounded-lg font-mono text-xs text-white border border-slate-800 uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* 2. Secondary Wave Color */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-rose-300">2. Secondary Wave Color</span>
                      <span className="font-mono text-slate-400 text-[10px]">{data.secondaryColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={safeColor(data.secondaryColor, '#EC4899')}
                        onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.secondaryColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, secondaryColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#EC4899"
                        className="w-full bg-slate-900 px-2 py-1 rounded-lg font-mono text-xs text-white border border-slate-800 uppercase focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* 3. Tertiary Shimmer / 3rd Wave Color */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-cyan-300">3. Tertiary Shimmer / Glow</span>
                      <span className="font-mono text-slate-400 text-[10px]">{data.tertiaryColor || '#38BDF8'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={safeColor(data.tertiaryColor || '#38BDF8', '#38BDF8')}
                        onChange={(e) => setData({ ...data, tertiaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.tertiaryColor || '#38BDF8'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, tertiaryColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#38BDF8"
                        className="w-full bg-slate-900 px-2 py-1 rounded-lg font-mono text-xs text-white border border-slate-800 uppercase focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* 4. Card Base Background Color */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-purple-300">4. Card Canvas Background</span>
                      <span className="font-mono text-slate-400 text-[10px]">{data.cardBgColor || '#0A0914'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={safeColor(data.cardBgColor || '#0A0914', '#0A0914')}
                        onChange={(e) => setData({ ...data, cardBgColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.cardBgColor || '#0A0914'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, cardBgColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#0A0914"
                        className="w-full bg-slate-900 px-2 py-1 rounded-lg font-mono text-xs text-white border border-slate-800 uppercase focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* 5. Primary Text Color */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-emerald-300">5. Name &amp; Headings Text</span>
                      <span className="font-mono text-slate-400 text-[10px]">{data.textColor || '#FFFFFF'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={safeColor(data.textColor || '#FFFFFF', '#FFFFFF')}
                        onChange={(e) => setData({ ...data, textColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.textColor || '#FFFFFF'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, textColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#FFFFFF"
                        className="w-full bg-slate-900 px-2 py-1 rounded-lg font-mono text-xs text-white border border-slate-800 uppercase focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* 6. Subtitle & Contact Text Color */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-sky-300">6. Subtitle &amp; Contact Text</span>
                      <span className="font-mono text-slate-400 text-[10px]">{data.subTextColor || '#CBD5E1'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={safeColor(data.subTextColor || '#CBD5E1', '#CBD5E1')}
                        onChange={(e) => setData({ ...data, subTextColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.subTextColor || '#CBD5E1'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, subTextColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#CBD5E1"
                        className="w-full bg-slate-900 px-2 py-1 rounded-lg font-mono text-xs text-white border border-slate-800 uppercase focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* 7. Badges & Hardware Embellishment Tint */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-amber-400">7. Microchip, Badges &amp; Icons Tint</span>
                      <span className="font-mono text-slate-400 text-[10px]">{data.badgeColor || data.accentColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={safeColor(data.badgeColor || data.accentColor, '#F59E0B')}
                        onChange={(e) => setData({ ...data, badgeColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.badgeColor || data.accentColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, badgeColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#F59E0B"
                        className="w-full bg-slate-900 px-2 py-1 rounded-lg font-mono text-xs text-white border border-slate-800 uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Swatch Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-400">Quick Primary Swatches:</span>
                  <div className="flex flex-wrap gap-1">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => setData({ ...data, accentColor: p.hex })}
                        title={p.name}
                        className="w-5 h-5 rounded-full border border-white/20 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                        style={{ backgroundColor: p.hex }}
                      >
                        {data.accentColor.toLowerCase() === p.hex.toLowerCase() && (
                          <Check className="w-2.5 h-2.5 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Style Category Filter Tabs */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Design Collections</label>
                  <span className="text-[10px] text-slate-500 font-mono">{filteredTemplates.length} designs</span>
                </div>

                <div className="flex flex-wrap sm:flex-wrap gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'All Designs' },
                    { id: 'curved_artistic', label: '🌊 Artistic Curved' },
                    { id: 'patterns', label: '✨ Geometric Patterns' },
                    { id: '3d_luxury', label: '👑 3D & Luxury' },
                    { id: 'modern_tech', label: '⚡ Tech & AI' },
                    { id: 'corporate_legal', label: '⚖️ Corporate & Legal' },
                    { id: 'trades_construction', label: '🏗️ Trades & Industry' },
                    { id: 'lifestyle_beauty', label: '🌸 Beauty & Spa' },
                    { id: 'creative_colorful', label: '🎨 Colorful & Creative' },
                    { id: 'minimal_simple', label: '⚪ Minimal & Swiss' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as TemplateStyleGroup)}
                      className={`py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500 text-black shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search styles (e.g. wave, curved, sunset, real estate, 3d)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() =>
                      setData({
                        ...data,
                        templateId: t.id,
                        accentColor: t.defaultAccent,
                        secondaryColor: t.defaultSecondary,
                      })
                    }
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      data.templateId === t.id
                        ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.previewGradient} flex items-center justify-center text-base shrink-0 shadow-md`}
                      >
                        <span>{t.badgeIcon}</span>
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-2">
                          <span>{t.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-white/10">
                            {t.industry.split('/')[0]}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 line-clamp-1 mt-0.5">{t.tagline}</p>
                      </div>
                    </div>
                    {data.templateId === t.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: POSITION SELECTION & ADJUSTABLE SIZE BARS */}
          {activeTab === 'position_size' && (
            <div className="space-y-5">
              {/* Content Alignment Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Desired Content Alignment</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setData({ ...data, contentAlign: 'left' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      data.contentAlign === 'left' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span>Left Align</span>
                  </button>
                  <button
                    onClick={() => setData({ ...data, contentAlign: 'center' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      data.contentAlign === 'center' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlignCenter className="w-4 h-4" />
                    <span>Center</span>
                  </button>
                  <button
                    onClick={() => setData({ ...data, contentAlign: 'right' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      data.contentAlign === 'right' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlignRight className="w-4 h-4" />
                    <span>Right Align</span>
                  </button>
                </div>
              </div>

              {/* Logo Position Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Logo Placement Position</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setData({ ...data, logoPosition: 'left' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      data.logoPosition === 'left' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Top-Left</span>
                  </button>
                  <button
                    onClick={() => setData({ ...data, logoPosition: 'center' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      data.logoPosition === 'center' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Top-Center</span>
                  </button>
                  <button
                    onClick={() => setData({ ...data, logoPosition: 'right' })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      data.logoPosition === 'right' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Top-Right</span>
                  </button>
                </div>
              </div>

              {/* Adjustable Size Bars / Sliders */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Adjustable Size &amp; Amplitude Bars</label>

                {/* 1. Typography Font Size Bar */}
                <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Typography Scale Bar</span>
                    <span className="text-amber-400 font-mono">{Math.round((data.fontScale || 1.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={data.fontScale || 1.0}
                    onChange={(e) => setData({ ...data, fontScale: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Compact (80%)</span>
                    <span>Standard (100%)</span>
                    <span>Large (130%)</span>
                  </div>
                </div>

                {/* 2. Curve Wave Intensity Bar */}
                <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Curve Wave Amplitude Bar</span>
                    <span className="text-amber-400 font-mono">{Math.round((data.curveIntensity || 1.0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.6"
                    step="0.1"
                    value={data.curveIntensity || 1.0}
                    onChange={(e) => setData({ ...data, curveIntensity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Subtle Waves (40%)</span>
                    <span>Balanced (100%)</span>
                    <span>Dramatic Arcs (160%)</span>
                  </div>
                </div>

                {/* 3. Card Corner Radius Bar */}
                <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Card Corner Roundness Bar</span>
                    <span className="text-amber-400 font-mono">{data.cornerRadius || 38}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="48"
                    step="2"
                    value={data.cornerRadius || 38}
                    onChange={(e) => setData({ ...data, cornerRadius: parseInt(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Slight (20px)</span>
                    <span>ISO Standard (38px)</span>
                    <span>Super Round (48px)</span>
                  </div>
                </div>

                {/* 4. Curved Wave & Art Opacity Regulator */}
                <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-amber-500/20 ring-1 ring-amber-500/10">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5" />
                      Curved Wave &amp; Art Opacity Regulator
                    </span>
                    <span className="text-amber-400 font-mono">
                      {(data.waveOpacity ?? 1.0) < 0.02 ? 'OFF' : `${Math.round((data.waveOpacity ?? 1.0) * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={data.waveOpacity ?? 1.0}
                    onChange={(e) => setData({ ...data, waveOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Clean Dark/Light (0%)</span>
                    <span>Subtle Glow (40%)</span>
                    <span>Full Vivid Color (100%)</span>
                  </div>
                </div>

                {/* 5. Wave Pattern Style Overlay with ON/OFF Toggle Button */}
                <div className="space-y-3.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Wave Pattern Overlay &amp; Gradient Lines
                      </span>
                    </div>
                    <button
                      onClick={() => setData({ ...data, showWavePattern: data.showWavePattern === false ? true : false })}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        data.showWavePattern !== false
                          ? 'bg-amber-500 text-black ring-2 ring-amber-400/50 hover:bg-amber-400'
                          : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          data.showWavePattern !== false ? 'bg-black animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <span>{data.showWavePattern !== false ? 'Overlay: ON' : 'Overlay: OFF'}</span>
                    </button>
                  </div>

                  {data.showWavePattern !== false ? (
                    <div className="space-y-3 pt-1 border-t border-slate-900">
                      {/* Gradient Wave Color Presets */}
                      <div>
                        <label className="text-[11px] font-bold text-amber-300 block mb-1.5 flex items-center justify-between">
                          <span>Gradient Wave Color Harmony</span>
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase">{data.waveGradientPreset || 'card_colors'}</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {[
                            { id: 'card_colors', label: '🎨 Card Colors', bg: 'from-amber-500 to-rose-500' },
                            { id: 'vivid_chroma', label: '🌈 Chroma', bg: 'from-orange-500 via-pink-500 to-cyan-400' },
                            { id: 'sunset_flame', label: '🌅 Sunset', bg: 'from-rose-500 via-orange-400 to-yellow-300' },
                            { id: 'emerald_jade', label: '🍃 Emerald', bg: 'from-emerald-400 via-teal-500 to-blue-500' },
                            { id: 'cyber_neon', label: '⚡ Cyber', bg: 'from-purple-500 via-cyan-400 to-emerald-400' },
                            { id: 'liquid_gold', label: '👑 Gold 24K', bg: 'from-amber-300 via-yellow-500 to-amber-700' },
                            { id: 'arctic_frost', label: '❄️ Frost Ice', bg: 'from-sky-300 via-blue-400 to-indigo-500' },
                          ].map((cp) => (
                            <button
                              key={cp.id}
                              onClick={() => setData({ ...data, waveGradientPreset: cp.id as CardData['waveGradientPreset'] })}
                              className={`py-1.5 px-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                                (data.waveGradientPreset || 'card_colors') === cp.id
                                  ? 'bg-amber-500 text-black shadow ring-2 ring-amber-400'
                                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${cp.bg} shrink-0`} />
                              <span className="truncate">{cp.label.split(' ')[1] || cp.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 16 Pattern Style Selection Grid */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                          Pattern Wave Lines Style (16 Available)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                          {[
                            { id: 'guilloche_spiro', label: '🌀 Guilloche Spiro', desc: 'Banknote currency security rosette loops' },
                            { id: 'guilloche_rosette_medallion', label: '🏛️ Bank Medallion', desc: 'Multi-lobed central banknote security seal' },
                            { id: 'guilloche_fluted_waves', label: '⌚ Swiss Fluted', desc: 'Watchmaker fluted wave lathe tapisserie' },
                            { id: 'guilloche_moire_grid', label: '🔮 Moiré Grid', desc: 'Dual-grid optical moiré interference waves' },
                            { id: 'guilloche_rhodonea_rose', label: '🌹 Rhodonea Rose', desc: 'Mathematical polar rose curve petals' },
                            { id: 'guilloche_infinity_lemniscate', label: '♾️ Lemniscate', desc: 'Infinity figure-8 orbital wave ribbons' },
                            { id: 'guilloche_braided_sinusoid', label: '🧬 Braided Waves', desc: 'Tri-axial interwoven sinusoidal braids' },
                            { id: 'gradient_ribbon_mesh', label: '〰️ 3D Ribbons', desc: 'Undulating 3D gradient mesh ribbons' },
                            { id: 'aurora_curtain', label: '🌌 Aurora', desc: 'Vertical shimmering aurora curtain rays' },
                            { id: 'topographic_streamlines', label: '🗺️ Streamlines', desc: 'Fluid aerodynamic contour flow lines' },
                            { id: 'lissajous_harmonics', label: '♾️ Lissajous', desc: 'Mathematical orbital laser wave figure-8' },
                            { id: 'dna_helix', label: '🧬 DNA Helix', desc: '3D twisting bio-tech double helix strands' },
                            { id: 'fluid_vortex', label: '🌪️ Vortex', desc: 'Dual-swirl whirlpool spiral stream arms' },
                            { id: 'bezier', label: '〜 Bezier', desc: 'Flowing multi-layer S-curves' },
                            { id: 'sine', label: '∿ Sine Wave', desc: 'Audio frequency harmonic waveforms' },
                            { id: 'ripple', label: '◎ Ripple', desc: 'Expanding circular sonic ripple rings' },
                            { id: 'diagonal_lines', label: '╲ Diagonal', desc: 'Engineering gradient stripe hatching' },
                            { id: 'concentric', label: '▢ Concentric', desc: 'Luxury frame glow rings' },
                            { id: 'chevron', label: '∧ Chevron', desc: 'Modern gradient arrow sweeps' },
                            { id: 'dot_matrix', label: '⠿ Dot Matrix', desc: 'Cyber LED micro-dot array' },
                            { id: 'isometric_cube', label: '⬡ Isometric', desc: '3D isometric cube wireframe' },
                            { id: 'circuit_flux', label: '⚡ PCB Circuit', desc: 'Microchip circuit traces & solder nodes' },
                          ].map((p) => (
                            <button
                              key={p.id}
                              onClick={() => setData({ ...data, wavePattern: p.id as CardData['wavePattern'] })}
                              title={p.desc}
                              className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                                data.wavePattern === p.id
                                  ? 'bg-amber-500 text-black shadow ring-2 ring-amber-400'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              <span className="text-sm leading-none">{p.label.split(' ')[0]}</span>
                              <span className="text-[8.5px] leading-tight text-center">{p.label.split(' ').slice(1).join(' ')}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-900">
                        <span className="truncate pr-2">
                          {
                            {
                              guilloche_spiro: 'Intricate banknote currency security guilloche spirograph waves',
                              guilloche_rosette_medallion: 'Multi-lobed central banknote security seal medallion rosette',
                              guilloche_fluted_waves: 'Swiss watchmaker fluted wave lathe tapisserie in dense oscillating sine bundles',
                              guilloche_moire_grid: 'Dual-grid optical moiré interference security wave matrix',
                              guilloche_rhodonea_rose: 'Mathematical Rhodonea polar rose curve filigree petals',
                              guilloche_infinity_lemniscate: 'Infinity lemniscate figure-8 orbital wave ribbons',
                              guilloche_braided_sinusoid: 'Tri-axial interwoven sinusoidal braided security ribbons',
                              gradient_ribbon_mesh: '3D undulating multi-ribbon gradient mesh curving across the card',
                              aurora_curtain: 'Radiant vertical Aurora Borealis shimmering curtain wave rays',
                              topographic_streamlines: 'Fluid aerodynamic topographic contour streamlines with gradient glow',
                              lissajous_harmonics: 'Mathematical Lissajous figure orbital laser loops with neon gradients',
                              dna_helix: '3D twisting bio-tech double helix strands connected by gradient rungs',
                              fluid_vortex: 'Dual-swirl whirlpool spiral wave arms rotating with smooth gradient transitions',
                              bezier: 'Sweeping multi-layer Bezier S-curves in rich gradient colors',
                              sine: 'Multi-frequency audio sine waveforms crossing the card face',
                              ripple: 'Expanding circular ripple rings emanating from focal points',
                              diagonal_lines: 'Fine diagonal stripe hatching — engineering blueprint feel',
                              concentric: 'Concentric rounded card-within-card luxury glow frames',
                              chevron: 'Repeating V-shaped chevron arrow stripes sweeping the card',
                              dot_matrix: 'Cyber LED micro-dot array matrix glowing across card face',
                              isometric_cube: '3D isometric wireframe cube geometric grid',
                              circuit_flux: 'Glow microchip circuit traces with PCB solder nodes',
                            }[data.wavePattern ?? 'bezier']
                          }
                        </span>
                        <button
                          onClick={() => setData({ ...data, showWavePattern: false })}
                          className="text-rose-400 hover:text-rose-300 font-bold whitespace-nowrap shrink-0"
                        >
                          Turn Off
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-center space-y-1.5">
                      <p className="text-[10.5px] text-slate-400">
                        Wave Pattern Overlay is currently <span className="text-amber-400 font-bold">OFF</span>.
                      </p>
                      <button
                        onClick={() => setData({ ...data, showWavePattern: true })}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold rounded-lg shadow transition-all"
                      >
                        ✨ Turn ON Wave Pattern Overlay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IDENTITY DATA */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  placeholder="e.g. Alexander R. Cole"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={data.jobTitle}
                    onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                    placeholder="e.g. Chief Technology Officer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={data.department}
                    onChange={(e) => setData({ ...data, department: e.target.value })}
                    placeholder="e.g. Software & Infra"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Company Name *</label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="e.g. BridgeTec Digital"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Company Tagline</label>
                <input
                  type="text"
                  value={data.tagline}
                  onChange={(e) => setData({ ...data, tagline: e.target.value })}
                  placeholder="e.g. Empowering Enterprise Excellence"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">ID Number</label>
                  <input
                    type="text"
                    value={data.idNumber}
                    onChange={(e) => setData({ ...data, idNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={data.issueDate}
                    onChange={(e) => setData({ ...data, issueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={data.expiryDate}
                    onChange={(e) => setData({ ...data, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="+232 33 399 391"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="contact@bridgetec.sl"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Website URL</label>
                <input
                  type="text"
                  value={data.website}
                  onChange={(e) => setData({ ...data, website: e.target.value })}
                  placeholder="www.itservicesfreetown.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  placeholder="15 Wilkinson Road, Freetown, Sierra Leone"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: MEDIA & QR */}
          {activeTab === 'media_qr' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 block">ID Photo</label>
                  <label className="cursor-pointer block border border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-3 text-center bg-slate-950 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'photoUrl')}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-300 font-bold block">
                      {data.photoUrl ? 'Change Photo' : 'Upload Photo'}
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 block">Logo</label>
                  <label className="cursor-pointer block border border-dashed border-slate-700 hover:border-amber-500 rounded-2xl p-3 text-center bg-slate-950 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'logoUrl')}
                      className="hidden"
                    />
                    <Building2 className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-300 font-bold block">
                      {data.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </span>
                  </label>
                </div>
              </div>

              {/* CARD BACKGROUND IMAGE UPLOAD */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    Card Background Image
                  </label>
                  {data.bgImageUrl && (
                    <button
                      onClick={() => setData({ ...data, bgImageUrl: null })}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove BG
                    </button>
                  )}
                </div>

                <label className="cursor-pointer block border-2 border-dashed border-amber-500/30 hover:border-amber-500 rounded-2xl p-4 text-center bg-slate-950 transition-colors relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'bgImageUrl')}
                    className="hidden"
                  />
                  {data.bgImageUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className="w-14 h-10 rounded-lg bg-cover bg-center border border-amber-500/40"
                        style={{ backgroundImage: `url(${data.bgImageUrl})` }}
                      />
                      <div className="text-left">
                        <div className="text-[10px] text-amber-300 font-black">✓ Background Image Set</div>
                        <div className="text-[9px] text-slate-400">Click to change the background image</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-6 h-6 text-amber-500/60 mx-auto mb-1.5" />
                      <span className="text-[11px] text-amber-300 font-bold block">Upload Card Background Image</span>
                      <span className="text-[9.5px] text-slate-500 block mt-0.5">JPG, PNG, WebP — Auto cover-fit to card</span>
                    </div>
                  )}
                </label>

                {/* Photo Opacity Slider */}
                {data.bgImageUrl && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-300">Background Image Opacity</span>
                        <span className="text-amber-400 font-mono">{Math.round((data.bgImageOpacity ?? 0.35) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={data.bgImageOpacity ?? 0.35}
                        onChange={(e) => setData({ ...data, bgImageOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Ghost (0%)</span>
                        <span>Balanced (35%)</span>
                        <span>Vivid (100%)</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-900 p-3 rounded-2xl border border-slate-800">
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="text-slate-300">Color Tint Overlay</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={safeColor(data.bgTintColor, '#000000')}
                            onChange={(e) => setData({ ...data, bgTintColor: e.target.value })}
                            className="w-6 h-5 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-amber-400 font-mono text-[10px]">{Math.round((data.bgTintOpacity ?? 0.55) * 100)}%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="0.92"
                        step="0.05"
                        value={data.bgTintOpacity ?? 0.55}
                        onChange={(e) => setData({ ...data, bgTintOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>No Tint (0%)</span>
                        <span>Medium (55%)</span>
                        <span>Max Tint (92%)</span>
                      </div>

                      {/* Quick Tint Presets */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {[
                          { label: 'Dark', color: '#000000', opacity: 0.60 },
                          { label: 'Navy', color: '#040E40', opacity: 0.65 },
                          { label: 'Amber', color: '#F59E0B', opacity: 0.45 },
                          { label: 'Crimson', color: '#E11D48', opacity: 0.50 },
                          { label: 'Teal', color: '#0D9488', opacity: 0.55 },
                          { label: 'Frost', color: '#f8fafc', opacity: 0.45 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setData({ ...data, bgTintColor: preset.color, bgTintOpacity: preset.opacity })}
                            title={preset.label}
                            className="w-6 h-6 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                            style={{ backgroundColor: preset.color }}
                          />
                        ))}
                        <span className="text-[9px] text-slate-500 self-center ml-1">Quick tint presets</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Scannable QR Code Action</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setData({ ...data, qrType: 'vcard' })}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                      data.qrType === 'vcard' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Save vCard to Phone
                  </button>
                  <button
                    onClick={() => setData({ ...data, qrType: 'website' })}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                      data.qrType === 'website' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Open Website URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRINT & EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-blue-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Commercial ISO 7810 Standard
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Export in standard CR80 format (85.60 × 53.98 mm) with 3.18mm rounded corners at 300 DPI vector clarity with automatic duplex A4 cutting sheets.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={downloadSinglePdf}
                  disabled={isExporting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Multi-Page PDF (Front &amp; Back)</span>
                </button>

                <button
                  onClick={downloadA4PrintSheet}
                  disabled={isExporting}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                  <Grid className="w-4 h-4 text-cyan-400" />
                  <span>Download 8-Card A4 Print Sheet (Duplex Ready)</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => downloadPng('front')}
                    className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5"
                  >
                    <span>Front PNG (300 DPI)</span>
                  </button>
                  <button
                    onClick={() => downloadPng('back')}
                    className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5"
                  >
                    <span>Back PNG (300 DPI)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>{/* end scrollable tab content area */}
        </div>{/* end right column */}
      </div>{/* end main studio grid */}
    </div>
  );
}
