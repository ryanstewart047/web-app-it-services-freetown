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
  waveOpacity: number; // 0.2 to 1.0 — opacity of the colored curved wave layer
  wavePattern: 'bezier' | 'sine' | 'ripple' | 'diagonal_lines' | 'concentric' | 'chevron'; // wave decoration pattern
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
  waveOpacity: number,
  curveIntensity: number
) {
  if (waveOpacity < 0.02) return;
  const k = Math.max(0.4, Math.min(2.0, curveIntensity));
  const primary = safeColor(primaryColor, '#F59E0B');
  const secondary = safeColor(secondaryColor, '#EC4899');

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, waveOpacity));

  switch (pattern) {
    case 'sine': {
      // Multi-frequency sine waveforms rendered as smooth curves
      const layers = [
        { color: primary, amp: 55 * k, freq: 2.5, phase: 0, lw: 2.5 },
        { color: secondary, amp: 40 * k, freq: 3.8, phase: 0.9, lw: 1.8 },
        { color: '#ffffff', amp: 25 * k, freq: 6.2, phase: 1.7, lw: 1.0 },
        { color: primary, amp: 70 * k, freq: 1.2, phase: 2.5, lw: 3.5, alpha: 0.3 },
      ];
      layers.forEach((l) => {
        ctx.save();
        if (l.alpha) ctx.globalAlpha *= l.alpha;
        ctx.strokeStyle = l.color;
        ctx.lineWidth = l.lw;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
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
        const color = fi === 0 ? primary : secondary;
        for (let r = 30; r < Math.max(W, H) * 0.85 * k; r += 38) {
          const alpha = Math.max(0.04, 0.55 - (r / (Math.max(W, H) * 0.85 * k)) * 0.55);
          ctx.save();
          ctx.globalAlpha *= alpha;
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(focus.x, focus.y, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });
      break;
    }

    case 'diagonal_lines': {
      // Fine diagonal hatching stripes — classic engineering/blueprint feel
      const spacing = Math.round(24 / k);
      const lw = 1.2;
      const diagColors = [primary, secondary, '#ffffff'];
      for (let i = -(H); i < W + H; i += spacing) {
        const colorIdx = Math.floor(i / (spacing * 3)) % diagColors.length;
        ctx.strokeStyle = diagColors[Math.abs(colorIdx) % diagColors.length];
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + H, H);
        ctx.stroke();
      }
      break;
    }

    case 'concentric': {
      // Concentric rounded rectangles — card-within-card luxury glow
      const steps = Math.round(7 * k);
      for (let s = 1; s <= steps; s++) {
        const progress = s / steps;
        const inset = s * (Math.min(W, H) * 0.06);
        const alpha = (1 - progress) * 0.65;
        const color = s % 2 === 0 ? primary : secondary;
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const r = Math.max(8, 38 - inset * 0.5);
        ctx.roundRect(inset, inset, W - inset * 2, H - inset * 2, r);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'chevron': {
      // V-shaped chevron arrow wave stripes sweeping across the card
      const chevH = Math.round(36 * k);
      const steps = Math.ceil(H / chevH) + 2;
      for (let s = -1; s < steps; s++) {
        const baseY = s * chevH;
        const color = s % 2 === 0 ? primary : secondary;
        const alpha = 0.55 - (Math.abs(s - steps / 2) / (steps / 2)) * 0.3;
        ctx.save();
        ctx.globalAlpha *= Math.max(0.08, alpha);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
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

    default: // 'bezier' — multiple sweeping Bezier curves
    {
      const bezierLayers = [
        { color: primary, offY: 0, lw: 3.5, phase: 0 },
        { color: secondary, offY: isPort ? 60 : 40, lw: 2.5, phase: Math.PI * 0.4 },
        { color: '#ffffff', offY: isPort ? 120 : 80, lw: 1.5, phase: Math.PI * 0.8 },
        { color: secondary, offY: isPort ? 180 : 120, lw: 1.0, phase: Math.PI * 1.2 },
        { color: primary, offY: isPort ? -60 : -40, lw: 4.0, phase: Math.PI * 1.6, alpha: 0.4 },
      ];
      bezierLayers.forEach((l) => {
        ctx.save();
        if (l.alpha) ctx.globalAlpha *= l.alpha;
        ctx.strokeStyle = l.color;
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
  // ── 1. ARTISTIC CURVED: FLUID CHROMA WAVE (Sunset Amber & Magenta)
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
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F97316');
      const secondary = safeColor(data.secondaryColor, '#EC4899');

      ctx.fillStyle = '#0a0914';
      ctx.fillRect(0, 0, W, H);

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

  // ── 2. ARTISTIC CURVED: PRISM RAINBOW HOLOGRAPHIC WAVE (New!)
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
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#EC4899');
      const secondary = safeColor(data.secondaryColor, '#06B6D4');

      ctx.fillStyle = '#070b19';
      ctx.fillRect(0, 0, W, H);

      // Multi-spectral Spectrum Ribbon Lines
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

      // Translucent Frost Overlay
      ctx.fillStyle = 'rgba(7, 11, 25, 0.45)';
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

  // ── 3. ARTISTIC CURVED: COSMIC IRIDESCENT S-CURVE
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
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#8B5CF6');

      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, W, H);

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

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let offset = -40; offset <= 40; offset += 20) {
        ctx.beginPath();
        if (isPort) {
          ctx.moveTo(W * 0.4 + offset, 0);
          ctx.bezierCurveTo(W * (1.1 * k) + offset, H * 0.35, -W * (0.1 * k) + offset, H * 0.65, W * 0.7 + offset, H);
        } else {
          ctx.moveTo(W * 0.55 + offset, 0);
          ctx.bezierCurveTo(W * (0.85 * k) + offset, H * 0.3, W * (0.35 / k) + offset, H * 0.7, W * 0.75 + offset, H);
        }
        ctx.stroke();
      }

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e0f2fe', photoImg, logoImg, '🌌', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 4. ARTISTIC CURVED: SUNSET TROPIC DUAL ARCS (New!)
  {
    id: 'sunset_tropic_arcs',
    name: 'Sunset Tropic & Coral Dual-Arc',
    category: 'curved_artistic',
    industry: 'Hospitality / Travel / Lifestyle / Beauty',
    tagline: 'Sweeping dual-arc curved waves in peach nectar, coral & sunset purple',
    theme: 'colorful',
    defaultAccent: '#F97316',
    defaultSecondary: '#FB7185',
    badgeIcon: '🌺',
    previewGradient: 'from-amber-400 via-rose-500 to-indigo-800',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F97316');
      const secondary = safeColor(data.secondaryColor, '#FB7185');

      ctx.fillStyle = '#180a24';
      ctx.fillRect(0, 0, W, H);

      // Arc 1: Top Sunset Glow
      const arc1 = ctx.createRadialGradient(0, 0, 20, 0, 0, W * (0.85 * k));
      arc1.addColorStop(0, primary);
      arc1.addColorStop(0.6, secondary);
      arc1.addColorStop(1, 'transparent');
      ctx.fillStyle = arc1;
      ctx.fillRect(0, 0, W, H);

      // Arc 2: Bottom Deep Purple Curved Wave
      const arc2 = ctx.createLinearGradient(0, H, W, 0);
      arc2.addColorStop(0, '#431407');
      arc2.addColorStop(0.5, '#701a75');
      arc2.addColorStop(1, 'transparent');
      ctx.fillStyle = arc2;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.bezierCurveTo(W * 0.5, H * (0.6 / k), W * 0.8, H, W, H * 0.4);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, '#ffffff', '#ffffff', '#fed7aa', photoImg, logoImg, '🌺', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 5. ARTISTIC CURVED: LIQUID MOLTEN GOLD & CARBON WAVE
  {
    id: 'molten_gold_wave',
    name: 'Liquid Molten Gold & Carbon Wave',
    category: 'curved_artistic',
    industry: 'Luxury / Executive / VIP / Metal',
    tagline: 'Flowing 3D molten gold liquid ribbon across matte graphite carbon',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#D97706',
    badgeIcon: '✨',
    previewGradient: 'from-amber-400 via-amber-700 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F59E0B');

      ctx.fillStyle = '#0e1118';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let x = 0; x < W; x += 12) {
        for (let y = 0; y < H; y += 12) {
          if ((x + y) % 24 === 0) ctx.fillRect(x, y, 6, 6);
        }
      }

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 24;

      const goldRibbon = ctx.createLinearGradient(0, 0, W, H);
      goldRibbon.addColorStop(0, '#92400e');
      goldRibbon.addColorStop(0.2, '#fef08a');
      goldRibbon.addColorStop(0.45, primary);
      goldRibbon.addColorStop(0.7, '#fef9c3');
      goldRibbon.addColorStop(1, '#78350f');

      ctx.fillStyle = goldRibbon;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * 0.4);
        ctx.bezierCurveTo(W * (0.7 * k), H * 0.3, W * (0.3 / k), H * 0.75, W, H * 0.65);
        ctx.lineTo(W, H * 0.85);
        ctx.bezierCurveTo(W * 0.3, H * 0.95, W * 0.7, H * 0.5, 0, H * 0.6);
      } else {
        ctx.moveTo(W * (0.45 / k), 0);
        ctx.bezierCurveTo(W * (0.85 * k), H * 0.35, W * 0.35, H * 0.65, W * 0.8, H);
        ctx.lineTo(W, H); ctx.lineTo(W, 0);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fef08a', photoImg, logoImg, '👑', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 6. ARTISTIC CURVED: ELECTRIC NEON SINE WAVE (New!)
  {
    id: 'electric_sine_wave',
    name: 'Electric Cyber Sine & Pulse Wave',
    category: 'curved_artistic',
    industry: 'Music / Audio / Media / Cyber / Gaming',
    tagline: 'High-voltage sine wave audio frequency curves pulsing in electric cyan & lime',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#10B981',
    badgeIcon: '⚡',
    previewGradient: 'from-cyan-400 via-emerald-500 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#06B6D4');
      const secondary = safeColor(data.secondaryColor, '#10B981');

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      // Glowing Sine Waveform Curves
      for (let s = 0; s < 4; s++) {
        const opacity = 0.8 - s * 0.18;
        ctx.strokeStyle = s % 2 === 0 ? hexToRgba(primary, opacity) : hexToRgba(secondary, opacity);
        ctx.lineWidth = 3 - s * 0.5;
        ctx.beginPath();
        const baseAmp = (isPort ? 45 : 60) * k;
        const midY = isPort ? H * 0.45 + s * 14 : H * 0.55 + s * 18;
        for (let x = 0; x <= W; x += 10) {
          const y = midY + Math.sin((x / W) * Math.PI * 3 + s) * baseAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '⚡', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 7. ARTISTIC CURVED: ZENITH EMERALD & MINT FLUID WAVE
  {
    id: 'emerald_bio_flow',
    name: 'Zenith Emerald & Mint Fluid Wave',
    category: 'curved_artistic',
    industry: 'Bio-Tech / Green Tech / Sustainability / Medical',
    tagline: 'Organic flowing botanical curved ribbons in rich emerald, jade & mint glow',
    theme: 'dark',
    defaultAccent: '#10B981',
    defaultSecondary: '#06B6D4',
    badgeIcon: '🍃',
    previewGradient: 'from-emerald-400 via-teal-600 to-emerald-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#10B981');
      const secondary = safeColor(data.secondaryColor, '#06B6D4');

      ctx.fillStyle = '#021a14';
      ctx.fillRect(0, 0, W, H);

      const jGrad = ctx.createLinearGradient(0, 0, W, H);
      jGrad.addColorStop(0, '#047857');
      jGrad.addColorStop(0.5, primary);
      jGrad.addColorStop(1, secondary);

      ctx.fillStyle = jGrad;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, H * 0.55);
        ctx.bezierCurveTo(W * (0.6 * k), H * 0.45, W * 0.4, H * (0.85 * k), W, H * 0.75);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      } else {
        ctx.moveTo(0, H * 0.65);
        ctx.bezierCurveTo(W * (0.4 / k), H * 0.35, W * (0.6 * k), H * 0.85, W, H * 0.5);
        ctx.lineTo(W, H); ctx.lineTo(0, H);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '🍃', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 8. ARTISTIC CURVED: ABSTRACT FLUID ACRYLIC SWIRL
  {
    id: 'abstract_acrylic_swirl',
    name: 'Artisan Abstract Fluid Acrylic',
    category: 'curved_artistic',
    industry: 'Designers / Art Galleries / Fashion / Media',
    tagline: 'Dynamic multi-color curved fluid acrylic swirl in coral, teal & violet',
    theme: 'colorful',
    defaultAccent: '#F43F5E',
    defaultSecondary: '#3B82F6',
    badgeIcon: '🎨',
    previewGradient: 'from-rose-500 via-amber-400 to-indigo-600',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#F43F5E');
      const secondary = safeColor(data.secondaryColor, '#3B82F6');

      ctx.fillStyle = '#170c24';
      ctx.fillRect(0, 0, W, H);

      const b1 = ctx.createRadialGradient(W * 0.2, H * 0.2, 20, W * 0.2, H * 0.2, 340 * k);
      b1.addColorStop(0, primary);
      b1.addColorStop(0.7, hexToRgba(primary, 0.3));
      b1.addColorStop(1, 'transparent');
      ctx.fillStyle = b1;
      ctx.fillRect(0, 0, W, H);

      const b2 = ctx.createRadialGradient(W * 0.8, H * 0.8, 30, W * 0.8, H * 0.8, 320 * k);
      b2.addColorStop(0, secondary);
      b2.addColorStop(0.7, hexToRgba(secondary, 0.3));
      b2.addColorStop(1, 'transparent');
      ctx.fillStyle = b2;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.5;
      for (let r = 50; r < W * 0.9; r += 45) {
        ctx.beginPath();
        ctx.arc(W * 0.85, H * 0.15, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fed7aa', photoImg, logoImg, '🎨', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 9. ARTISTIC CURVED: MINIMALIST FLOWING RIBBON
  {
    id: 'minimal_flowing_ribbon',
    name: 'Minimalist Studio Pearl & Coral Ribbon',
    category: 'curved_artistic',
    industry: 'Architecture / Luxury Minimal / Executive',
    tagline: 'Pure ivory pearl card with a single dramatic flowing curved ribbon',
    theme: 'light',
    defaultAccent: '#E11D48',
    defaultSecondary: '#4F46E5',
    badgeIcon: '⚪',
    previewGradient: 'from-white via-rose-100 to-indigo-200',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      const k = data.curveIntensity || 1.0;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const primary = safeColor(data.accentColor, '#E11D48');
      const secondary = safeColor(data.secondaryColor, '#4F46E5');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      const rGrad = ctx.createLinearGradient(0, 0, W, H);
      rGrad.addColorStop(0, primary);
      rGrad.addColorStop(1, secondary);

      ctx.fillStyle = rGrad;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(W * 0.6, 0);
        ctx.bezierCurveTo(W * (1.1 * k), H * 0.4, 0, H * 0.6, W * 0.4, H);
        ctx.lineTo(W * 0.65, H);
        ctx.bezierCurveTo(0.2, H * 0.6, W * 1.2, H * 0.4, W * 0.8, 0);
      } else {
        ctx.moveTo(W * 0.68, 0);
        ctx.bezierCurveTo(W * (0.95 * k), H * 0.35, W * 0.4, H * 0.65, W * 0.85, H);
        ctx.lineTo(W, H); ctx.lineTo(W, 0);
      }
      ctx.closePath();
      ctx.fill();

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, '#0f172a', '#0f172a', '#475569', photoImg, logoImg, '▪️', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, '#0f172a', '#0f172a', qrImg);
      }

      apply3DCardLightingAndBevel(ctx, W, H, isPort, radius);
      ctx.restore();
    },
  },

  // ── 10. 3D LUXURY: EXECUTIVE 3D OBSIDIAN & GOLD
  {
    id: 'executive_3d_gold',
    name: 'Executive 3D Obsidian & Gold',
    category: '3d_luxury',
    industry: 'Executive / Corporate / VIP',
    tagline: 'Deep carbon weave, 3D beveled gold ribbon, EMV chip',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#D97706',
    badgeIcon: '👑',
    previewGradient: 'from-amber-500/40 via-slate-900 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg, bgImg) => {
      const radius = data.cornerRadius || (isPort ? 34 : 38);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, radius);
      ctx.clip();

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0c0f17');
      bg.addColorStop(0.45, '#161c2b');
      bg.addColorStop(1, '#05070a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let x = 0; x < W; x += 14) {
        for (let y = 0; y < H; y += 14) {
          if ((x + y) % 28 === 0) ctx.fillRect(x, y, 7, 7);
        }
      }

      const primary = safeColor(data.accentColor, '#F59E0B');
      const goldGrad = ctx.createLinearGradient(0, 0, W, H);
      goldGrad.addColorStop(0, primary);
      goldGrad.addColorStop(0.3, '#fef08a');
      goldGrad.addColorStop(0.6, primary);
      goldGrad.addColorStop(1, '#92400e');

      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 24); ctx.lineTo(0, 54);
      } else {
        ctx.moveTo(W * 0.72, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(W * 0.62, H);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(22, 22, W - 44, H - 44);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', 'rgba(255,255,255,0.7)', photoImg, logoImg, '👑', bgImg);
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
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
  const accent = safeColor(accentColor, '#F59E0B');
  const textCol = safeColor(textColor, '#FFFFFF');
  const subTextCol = safeColor(subTextColor, '#cbd5e1');
  const fScale = data.fontScale || 1.0;
  const align = data.contentAlign || (isPort ? 'center' : 'left');

  // ── Draw optional background image with opacity + tint overlay ──────────────
  if (bgImg) {
    drawBackgroundImage(ctx, W, H, bgImg, data.bgImageOpacity ?? 0.35, data.bgTintColor ?? '#000000', data.bgTintOpacity ?? 0.55);
  }

  // ── Draw wave pattern decorator layer ─────────────────────────────────────
  if (data.wavePattern && data.waveOpacity > 0.02) {
    drawWavePatternDecorator(
      ctx, W, H, isPort,
      data.wavePattern,
      data.accentColor,
      data.secondaryColor,
      data.waveOpacity ?? 0.7,
      data.curveIntensity ?? 1.0
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

  waveOpacity: 0.0,
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
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
        {/* LEFT COLUMN: LIVE 3D CANVASES PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Side Toggle & Zoom Pill */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSide('both')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'both' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dual View
              </button>
              <button
                onClick={() => setActiveSide('front')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'front' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'back' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Back Side
              </button>
            </div>

            <div className="flex items-center gap-3 pr-2">
              {/* Live Zoom Slider */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="range"
                  min="75"
                  max="125"
                  step="5"
                  value={data.previewZoom || 100}
                  onChange={(e) => setData({ ...data, previewZoom: parseInt(e.target.value) })}
                  className="w-20 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-[11px] text-amber-300 w-9 text-right">{data.previewZoom || 100}%</span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {data.orientation === 'landscape' ? '85.6 × 54 mm' : '54 × 85.6 mm'}
              </div>
            </div>
          </div>

          {/* 3D Canvas Perspective Display Containers */}
          <div className="space-y-6">
            {(activeSide === 'both' || activeSide === 'front') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Eye className="w-3.5 h-3.5" />
                    3D FRONT SIDE (ARTISTIC CURVED)
                  </span>
                  <button
                    onClick={() => downloadPng('front')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PNG</span>
                  </button>
                </div>

                <div
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl flex items-center justify-center min-h-[300px] transition-all"
                  style={{ perspective: '1200px' }}
                >
                  <div
                    className="relative transition-transform duration-150 ease-out"
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
            )}

            {(activeSide === 'both' || activeSide === 'back') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <QrCode className="w-3.5 h-3.5" />
                    3D BACK SIDE (MAGNETIC STRIPE &amp; VCARD QR)
                  </span>
                  <button
                    onClick={() => downloadPng('back')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PNG</span>
                  </button>
                </div>

                <div
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl flex items-center justify-center min-h-[300px] transition-all"
                  style={{ perspective: '1200px' }}
                >
                  <div
                    className="relative transition-transform duration-150 ease-out"
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
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DESIGN TEMPLATE BROWSER & CONTROLS (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur space-y-6">
          {/* Sub-Tabs */}
          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
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

              {/* Editable Hex Colors */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Accent Colors (Editable Hex)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Primary Color</span>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={safeColor(data.accentColor, '#F97316')}
                        onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.accentColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, accentColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#040E40"
                        className="w-full bg-transparent font-mono text-xs text-white focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Secondary Color</span>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={safeColor(data.secondaryColor, '#EC4899')}
                        onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.secondaryColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setData({ ...data, secondaryColor: val.startsWith('#') ? val : `#${val}` });
                        }}
                        placeholder="#EC4899"
                        className="w-full bg-transparent font-mono text-xs text-white focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setData({ ...data, accentColor: p.hex })}
                      title={p.name}
                      className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                      style={{ backgroundColor: p.hex }}
                    >
                      {data.accentColor.toLowerCase() === p.hex.toLowerCase() && (
                        <Check className="w-3 h-3 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Category Filter Tabs */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Design Collections</label>
                  <span className="text-[10px] text-slate-500 font-mono">{filteredTemplates.length} designs</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Designs' },
                    { id: 'curved_artistic', label: '🌊 Artistic Curved' },
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

                {/* 4. Wave Overlay Opacity Regulator */}
                <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-amber-500/20 ring-1 ring-amber-500/10">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5" />
                      Wave Overlay Opacity Regulator
                    </span>
                    <span className="text-amber-400 font-mono">
                      {data.waveOpacity < 0.02 ? 'OFF' : `${Math.round((data.waveOpacity ?? 0) * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={data.waveOpacity ?? 0}
                    onChange={(e) => setData({ ...data, waveOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Hidden (0%)</span>
                    <span>Subtle (40%)</span>
                    <span>Full (100%)</span>
                  </div>
                </div>

                {/* 5. Wave Pattern Selector */}
                {(data.waveOpacity ?? 0) > 0.02 && (
                  <div className="space-y-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <label className="text-xs font-bold text-slate-300 block">
                      Wave Pattern Style
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'bezier', label: '〜 Bezier', desc: 'Flowing S-curves' },
                        { id: 'sine', label: '∿ Sine Freq', desc: 'Audio waveforms' },
                        { id: 'ripple', label: '◎ Ripple', desc: 'Expanding rings' },
                        { id: 'diagonal_lines', label: '╲ Diagonal', desc: 'Stripe hatching' },
                        { id: 'concentric', label: '▢ Concentric', desc: 'Frame glow rings' },
                        { id: 'chevron', label: '∧ Chevron', desc: 'Arrow sweeps' },
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
                          <span className="text-[9px] leading-tight">{p.label.split(' ').slice(1).join(' ')}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1">
                      {
                        {
                          bezier: 'Sweeping multi-layer Bezier S-curves in primary & secondary accent colors',
                          sine: 'Multi-frequency audio sine waveforms crossing the card face',
                          ripple: 'Expanding circular ripple rings emanating from focal points',
                          diagonal_lines: 'Fine diagonal stripe hatching — engineering blueprint feel',
                          concentric: 'Concentric rounded card-within-card luxury glow frames',
                          chevron: 'Repeating V-shaped chevron arrow stripes sweeping the card',
                        }[data.wavePattern ?? 'bezier']
                      }
                    </p>
                  </div>
                )}
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
        </div>
      </div>
    </div>
  );
}
