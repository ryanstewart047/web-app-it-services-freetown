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
} from 'lucide-react';

export type CardCategory = 'business' | 'id_badge' | 'complementary' | 'vip_pass';
export type CardOrientation = 'landscape' | 'portrait';

export type BgCategory =
  | 'technology'
  | 'construction'
  | 'corporate'
  | 'finance'
  | 'automotive'
  | 'medical'
  | 'creative'
  | 'minimal';

export interface BackgroundPreset {
  id: string;
  category: BgCategory;
  name: string;
  desc: string;
  theme: 'dark' | 'light';
  draw: (ctx: CanvasRenderingContext2D, W: number, H: number, opacity: number, primary: string, secondary: string) => void;
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

  // Visual Customization
  category: CardCategory;
  orientation: CardOrientation;
  backgroundId: string;
  bgCategory: BgCategory;
  bgOpacity: number; // 0 to 1
  accentColor: string;
  secondaryColor: string;
  isLightMode: boolean;
  showChip: boolean;
  showBarcode: boolean;
  showCutMarks: boolean;
}

// ── INDUSTRY BACKGROUND PRESETS (CANVAS PROCEDURAL ENGINES) ─────────────────────
const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // 1. TECHNOLOGY & AI & CYBER
  {
    id: 'tech_circuit',
    category: 'technology',
    name: 'Cyber Circuit Grid',
    desc: 'Integrated semiconductor traces with logic node junctions.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary) => {
      ctx.save();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = opacity;

      // Circuit grid lines
      for (let x = 40; x < W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H * 0.4);
        ctx.lineTo(x + 30, H * 0.4 + 30);
        ctx.lineTo(x + 30, H);
        ctx.stroke();

        // Node junction points
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.arc(x + 30, H * 0.4 + 30, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  },
  {
    id: 'tech_matrix_grid',
    category: 'technology',
    name: 'Neural Matrix Grid',
    desc: 'High-density computational coordinate mesh.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary, secondary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // Glowing focal point
      const rad = ctx.createRadialGradient(W * 0.8, H * 0.2, 10, W * 0.8, H * 0.2, 280);
      rad.addColorStop(0, primary);
      rad.addColorStop(1, 'transparent');
      ctx.fillStyle = rad;
      ctx.globalAlpha = opacity * 0.8;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    },
  },

  // 2. CONSTRUCTION & ENGINEERING & ARCHITECTURE
  {
    id: 'const_blueprint',
    category: 'construction',
    name: 'Architect Blueprint',
    desc: 'Technical drafting grid with geometric construction lines.',
    theme: 'dark',
    draw: (ctx, W, H, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;

      // Small grid
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Major structural diagonals
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(W * 0.5, H);
      ctx.moveTo(W * 0.5, 0); ctx.lineTo(W, H);
      ctx.stroke();

      // Blueprint measurement circle
      ctx.beginPath();
      ctx.arc(W * 0.85, H * 0.3, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
  },
  {
    id: 'const_isometric_grid',
    category: 'construction',
    name: 'Structural Steel Beams',
    desc: 'Heavy structural truss angles and dimensional framework.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;

      for (let i = -W; i < W * 2; i += 70) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + H * 0.8, H);
        ctx.stroke();
      }
      ctx.restore();
    },
  },

  // 3. CORPORATE & EXECUTIVE & CONSULTING
  {
    id: 'corp_gold_guilloche',
    category: 'corporate',
    name: 'Executive Gold Guilloche',
    desc: 'Prestige luxury metallic ornamental borders and security foil.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 1.5;

      for (let r = 20; r <= 80; r += 15) {
        ctx.strokeRect(r, r, W - r * 2, H - r * 2);
      }

      // Intersecting corner arcs
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(W, H, 160, Math.PI, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    },
  },
  {
    id: 'corp_carbon_weave',
    category: 'corporate',
    name: 'Obsidian Carbon Weave',
    desc: 'Micro-woven aerodynamic carbon fiber weave texture.',
    theme: 'dark',
    draw: (ctx, W, H, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ffffff';
      for (let x = 0; x < W; x += 12) {
        for (let y = 0; y < H; y += 12) {
          if ((x + y) % 24 === 0) ctx.fillRect(x, y, 6, 6);
        }
      }
      ctx.restore();
    },
  },

  // 4. FINANCE & BANKING & WEALTH
  {
    id: 'fin_security_waves',
    category: 'finance',
    name: 'Securities Guilloche Waves',
    desc: 'Banknote security engraving waveforms and monetary geometry.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary, secondary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 1.2;

      for (let i = -50; i < H + 50; i += 18) {
        ctx.strokeStyle = i % 36 === 0 ? primary : secondary;
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.bezierCurveTo(W * 0.25, i + 40, W * 0.75, i - 40, W, i);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: 'fin_emerald_currency',
    category: 'finance',
    name: 'Emerald Bullion Ribbon',
    desc: 'Wealth management dual diagonal emerald banner.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, primary);
      grad.addColorStop(0.5, 'transparent');
      grad.addColorStop(1, '#059669');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(W * 0.6, 0);
      ctx.lineTo(W, 0);
      ctx.lineTo(W * 0.4, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
  },

  // 5. AUTOMOTIVE & TRANSPORT & LOGISTICS
  {
    id: 'auto_speed_velocity',
    category: 'automotive',
    name: 'Speed Velocity Lines',
    desc: 'High-speed aerodynamic motion blur and carbon accents.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 3;

      for (let y = 30; y < H; y += 45) {
        const len = (y * 1.5) % W;
        ctx.beginPath();
        ctx.moveTo(W - len, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
    },
  },

  // 6. HEALTHCARE & MEDICAL & SCIENCE
  {
    id: 'med_pulse_ecg',
    category: 'medical',
    name: 'Cardio Pulse & ECG Wave',
    desc: 'Clean medical heart rhythm waveform with cross matrix.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;

      const y = H * 0.68;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W * 0.35, y);
      ctx.lineTo(W * 0.38, y - 40);
      ctx.lineTo(W * 0.42, y + 50);
      ctx.lineTo(W * 0.46, y - 70);
      ctx.lineTo(W * 0.50, y + 30);
      ctx.lineTo(W * 0.53, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.restore();
    },
  },

  // 7. CREATIVE & AGENCY & MEDIA
  {
    id: 'art_sunset_aurora',
    category: 'creative',
    name: 'Creative Sunset Aurora',
    desc: 'Vibrant violet-to-amber mesh light spheres.',
    theme: 'dark',
    draw: (ctx, W, H, opacity, primary, secondary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      const g1 = ctx.createRadialGradient(W * 0.8, H * 0.2, 20, W * 0.8, H * 0.2, 340);
      g1.addColorStop(0, primary);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 20, W * 0.15, H * 0.85, 300);
      g2.addColorStop(0, secondary);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    },
  },

  // 8. MINIMALIST & PEARL
  {
    id: 'min_clean_slate',
    category: 'minimal',
    name: 'Minimalist Studio Border',
    desc: 'Ultra clean geometric pinstripe frame with left accent blade.',
    theme: 'light',
    draw: (ctx, W, H, opacity, primary) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, 14, H);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 24, W - 48, H - 48);
      ctx.restore();
    },
  },
];

// ── COLOR PRESETS PALETTE ───────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'Imperial Gold', hex: '#F59E0B' },
  { name: 'Electric Cyan', hex: '#06B6D4' },
  { name: 'Royal Sapphire', hex: '#2563EB' },
  { name: 'Emerald Jade', hex: '#10B981' },
  { name: 'Crimson Ruby', hex: '#E11D48' },
  { name: 'Sunset Amber', hex: '#F97316' },
  { name: 'Cyber Violet', hex: '#8B5CF6' },
  { name: 'Titanium Silver', hex: '#94A3B8' },
  { name: 'Rose Quartz', hex: '#EC4899' },
  { name: 'Deep Teal', hex: '#0D9488' },
  { name: 'Bronze Copper', hex: '#B45309' },
  { name: 'Midnight Charcoal', hex: '#334155' },
];

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

  category: 'business',
  orientation: 'landscape',
  backgroundId: 'tech_circuit',
  bgCategory: 'technology',
  bgOpacity: 0.35,
  accentColor: '#F59E0B',
  secondaryColor: '#06B6D4',
  isLightMode: false,
  showChip: true,
  showBarcode: true,
  showCutMarks: true,
};

export default function CardStudio() {
  const [data, setData] = useState<CardData>(DEFAULT_CARD_DATA);
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');
  const [activeTab, setActiveTab] = useState<'background' | 'identity' | 'contacts' | 'media_qr' | 'export'>('background');
  const [isExporting, setIsExporting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── UNIVERSAL ISO/IEC 7810 (CR80) STANDARD 300 DPI RATIOS ───────────────────
  // Landscape: 1050 x 600 px (3.5" x 2" / 85.6 x 54mm)
  // Portrait:  600 x 1050 px (2" x 3.5" / 54 x 85.6mm) -> Perfectly balanced!
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

  // Generate Scannable vCard or Link QR Code
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
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR error:', err));
  }, [data.qrType, data.qrCustomText, data.fullName, data.companyName, data.jobTitle, data.phone, data.whatsapp, data.email, data.website, data.address]);

  // Handle Photo & Logo Uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Find active background preset
  const activeBgPreset = useMemo(() => {
    return BACKGROUND_PRESETS.find((p) => p.id === data.backgroundId) || BACKGROUND_PRESETS[0];
  }, [data.backgroundId]);

  // ── DRAW FRONT SIDE CANVAS (300 DPI) ──────────────────────────────────────────
  const drawFront = useCallback(async () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = cardDim.width;
    const H = cardDim.height;
    canvas.width = W;
    canvas.height = H;

    const isPort = data.orientation === 'portrait';
    const isLight = data.isLightMode;
    const primary = data.accentColor || '#F59E0B';
    const secondary = data.secondaryColor || '#06B6D4';

    // 1. Base Gradient Fill
    const baseGrad = ctx.createLinearGradient(0, 0, W, H);
    if (isLight) {
      baseGrad.addColorStop(0, '#ffffff');
      baseGrad.addColorStop(0.6, '#f8fafc');
      baseGrad.addColorStop(1, '#e2e8f0');
    } else {
      baseGrad.addColorStop(0, '#0a0d14');
      baseGrad.addColorStop(0.5, '#0f1420');
      baseGrad.addColorStop(1, '#05070a');
    }
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Procedural Industry Background Pattern with User Opacity
    if (activeBgPreset) {
      activeBgPreset.draw(ctx, W, H, data.bgOpacity, primary, secondary);
    }

    // 3. Card Outer Foil Trim
    ctx.strokeStyle = primary;
    ctx.lineWidth = isPort ? 3 : 3.5;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // ── PORTRAIT (VERTICAL) LAYOUT ENGINE ─────────────────────────────────────
    if (isPort) {
      // 1. Top Emblem / Logo
      let logoDrawn = false;
      if (data.logoUrl) {
        try {
          const lImg = new window.Image();
          lImg.crossOrigin = 'anonymous';
          await new Promise((res) => { lImg.onload = res; lImg.onerror = res; lImg.src = data.logoUrl!; });
          if (lImg.width > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(W / 2 - 32, 42, 64, 64, 14);
            ctx.clip();
            ctx.drawImage(lImg, W / 2 - 32, 42, 64, 64);
            ctx.restore();
            logoDrawn = true;
          }
        } catch {}
      }

      if (!logoDrawn) {
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.roundRect(W / 2 - 28, 42, 56, 56, 12);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.companyName.charAt(0) || 'B', W / 2, 70);
      }

      // Company Name & Tagline
      ctx.textAlign = 'center';
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = '900 20px Inter, sans-serif';
      ctx.fillText(data.companyName.toUpperCase(), W / 2, 128);

      if (data.tagline) {
        ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.6)';
        ctx.font = '500 11px Inter, sans-serif';
        ctx.fillText(data.tagline, W / 2, 146);
      }

      // 2. Center ID Photo (with balanced size and border)
      const pSize = 160;
      const px = W / 2 - pSize / 2;
      const py = 175;

      ctx.save();
      ctx.fillStyle = isLight ? '#e2e8f0' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(px, py, pSize, pSize, 22);
      ctx.fill();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 4;
      ctx.stroke();

      if (data.photoUrl) {
        try {
          const photoImg = new window.Image();
          photoImg.crossOrigin = 'anonymous';
          await new Promise((res) => { photoImg.onload = res; photoImg.onerror = res; photoImg.src = data.photoUrl!; });
          ctx.beginPath();
          ctx.roundRect(px + 4, py + 4, pSize - 8, pSize - 8, 18);
          ctx.clip();
          ctx.drawImage(photoImg, px + 4, py + 4, pSize - 8, pSize - 8);
        } catch {}
      } else {
        ctx.fillStyle = isLight ? '#94a3b8' : 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(W / 2, py + 62, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(W / 2, py + pSize + 20, 60, Math.PI, 0);
        ctx.fill();
      }
      ctx.restore();

      // 3. Name & Job Title
      ctx.textAlign = 'center';
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = '900 28px Inter, sans-serif';
      ctx.fillText(data.fullName, W / 2, 375);

      ctx.fillStyle = primary;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(data.jobTitle.toUpperCase(), W / 2, 400);

      if (data.department) {
        ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.6)';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.fillText(`Department: ${data.department}`, W / 2, 420);
      }

      // 4. Detail Metrics Block
      const blockY = 460;
      const metrics = [
        { label: 'ID NUMBER', val: data.idNumber, col: primary },
        { label: 'BLOOD GROUP', val: data.bloodGroup, col: isLight ? '#0f172a' : '#ffffff' },
        { label: 'ISSUE DATE', val: data.issueDate, col: isLight ? '#475569' : 'rgba(255,255,255,0.8)' },
        { label: 'EXPIRY DATE', val: data.expiryDate, col: isLight ? '#475569' : 'rgba(255,255,255,0.8)' },
      ];

      metrics.forEach((m, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const mx = col === 0 ? W * 0.28 : W * 0.72;
        const my = blockY + row * 60;

        ctx.fillStyle = isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(m.label, mx, my);

        ctx.fillStyle = m.col;
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillText(m.val, mx, my + 20);
      });

      // 5. Contact Phone & Email
      const contactY = 600;
      ctx.font = '13px Inter, sans-serif';
      ctx.fillStyle = isLight ? '#1e293b' : 'rgba(255,255,255,0.85)';
      ctx.fillText(`📞  ${data.phone}`, W / 2, contactY);
      ctx.fillText(`✉️  ${data.email}`, W / 2, contactY + 28);
      ctx.fillText(`🌐  ${data.website}`, W / 2, contactY + 56);

      // 6. Bottom Barcode
      if (data.showBarcode) {
        const barY = H - 130;
        ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
        for (let b = 70; b < W - 70; b += 7) {
          const bw = b % 14 === 0 ? 3.5 : 1.5;
          ctx.fillRect(b, barY, bw, 36);
        }
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.5)';
        ctx.fillText(data.idNumber, W / 2, barY + 52);
      }
    } else {
      // ── LANDSCAPE (HORIZONTAL) LAYOUT ENGINE ─────────────────────────────────
      let logoDrawn = false;
      if (data.logoUrl) {
        try {
          const lImg = new window.Image();
          lImg.crossOrigin = 'anonymous';
          await new Promise((res) => { lImg.onload = res; lImg.onerror = res; lImg.src = data.logoUrl!; });
          if (lImg.width > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(50, 45, 68, 68, 14);
            ctx.clip();
            ctx.drawImage(lImg, 50, 45, 68, 68);
            ctx.restore();
            logoDrawn = true;
          }
        } catch {}
      }

      if (!logoDrawn) {
        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.roundRect(50, 45, 64, 64, 14);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(data.companyName.charAt(0) || 'B', 82, 77);
      }

      // Company Name
      ctx.textAlign = 'left';
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillText(data.companyName.toUpperCase(), 135, 72);

      if (data.tagline) {
        ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.6)';
        ctx.font = '500 13px Inter, sans-serif';
        ctx.fillText(data.tagline, 135, 96);
      }

      // Smart Chip (ID badge)
      if (data.showChip && data.category === 'id_badge') {
        const cx = W - 130;
        const cy = 48;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.roundRect(cx, cy, 64, 46, 8);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Name & Title
      const nameY = 205;
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = '900 38px Inter, sans-serif';
      ctx.fillText(data.fullName, 52, nameY);

      ctx.fillStyle = primary;
      ctx.font = 'bold 17px Inter, sans-serif';
      ctx.fillText(data.jobTitle.toUpperCase(), 52, nameY + 30);

      if (data.department) {
        ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.5)';
        ctx.font = '600 13px Inter, sans-serif';
        ctx.fillText(`Dept: ${data.department}`, 52, nameY + 54);
      }

      // Contact Details Grid (2 Columns)
      const startY = 325;
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

        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = isLight ? '#1e293b' : 'rgba(255,255,255,0.85)';
        ctx.fillText(`${c.icon}  ${c.text}`, cx, cy);
      });
    }

    // Cut Marks
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
  }, [cardDim, data, activeBgPreset]);

  // ── DRAW BACK SIDE CANVAS (300 DPI) ───────────────────────────────────────────
  const drawBack = useCallback(async () => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = cardDim.width;
    const H = cardDim.height;
    canvas.width = W;
    canvas.height = H;

    const isPort = data.orientation === 'portrait';
    const isLight = data.isLightMode;
    const primary = data.accentColor || '#F59E0B';

    // Base background
    ctx.fillStyle = isLight ? '#f8fafc' : '#070a10';
    ctx.fillRect(0, 0, W, H);

    if (activeBgPreset) {
      activeBgPreset.draw(ctx, W, H, data.bgOpacity * 0.6, primary, data.secondaryColor);
    }

    ctx.strokeStyle = primary;
    ctx.lineWidth = isPort ? 2.5 : 3;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // Magnetic / Security Banner
    ctx.fillStyle = isLight ? '#1e293b' : '#030508';
    ctx.fillRect(0, 32, W, isPort ? 44 : 52);

    // Draw High Res QR Code
    if (qrDataUrl) {
      try {
        const qrImg = new window.Image();
        qrImg.crossOrigin = 'anonymous';
        await new Promise((res) => { qrImg.onload = res; qrImg.onerror = res; qrImg.src = qrDataUrl; });

        const qrSize = isPort ? 175 : 185;
        const qx = isPort ? W / 2 - qrSize / 2 : 65;
        const qy = isPort ? 135 : 140;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(qx - 8, qy - 8, qrSize + 16, qrSize + 16, 12);
        ctx.fill();

        ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);
      } catch {}
    }

    // Backside Copy
    const tx = isPort ? W / 2 : 290;
    const ty = isPort ? 355 : 160;

    ctx.textAlign = isPort ? 'center' : 'left';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = '900 20px Inter, sans-serif';
    ctx.fillText(data.backTitle, tx, ty);

    ctx.fillStyle = primary;
    ctx.font = 'bold 12.5px Inter, sans-serif';
    ctx.fillText(data.backSubtitle, tx, ty + 24);

    // Disclaimer
    ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.6)';
    ctx.font = '11px Inter, sans-serif';

    const words = data.disclaimer.split(' ');
    let line = '';
    let lineY = ty + 56;
    const maxW = isPort ? W - 90 : W - 340;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxW && n > 0) {
        ctx.fillText(line, tx, lineY);
        line = words[n] + ' ';
        lineY += 18;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, tx, lineY);

    if (data.emergencyContact) {
      lineY += 26;
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`Emergency Security Contact: ${data.emergencyContact}`, tx, lineY);
    }

    // Bottom Company Tag
    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`${data.companyName.toUpperCase()} · ${data.website}`, W / 2, H - 40);
  }, [cardDim, data, activeBgPreset, qrDataUrl]);

  useEffect(() => {
    drawFront();
    drawBack();
  }, [drawFront, drawBack]);

  // ── EXPORT ENGINE ─────────────────────────────────────────────────────────────
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

      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_Card_300DPI.pdf`);
    } catch (err) {
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

      // Page 1: 8 Fronts
      pdf.setFontSize(9);
      pdf.setTextColor(120);
      pdf.text(`BridgeTec Card Studio — Front Sheet (${data.fullName})`, 14, 12);

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          const x = marginX + c * (cardW + spacingX);
          const y = marginY + r * (cardH + spacingY);
          pdf.addImage(fImg, 'PNG', x, y, cardW, cardH, undefined, 'FAST');
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x, y, cardW, cardH);
        }
      }

      // Page 2: 8 Backs (Mirrored column for duplex alignment)
      pdf.addPage('a4', 'portrait');
      pdf.text(`BridgeTec Card Studio — Back Sheet (${data.fullName})`, 14, 12);

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
        img { width: 85.6mm; height: 54mm; object-fit: contain; border-radius: 3mm; box-shadow: 0 0 1px #888; }
      </style></head><body>
        <div><img src="${frontCanvas.toDataURL('image/png')}" /></div>
        <div><img src="${backCanvas.toDataURL('image/png')}" /></div>
        <script>window.onload=function(){window.focus();window.print();setTimeout(function(){window.parent.document.body.removeChild(window.frameElement);},1500);};</script>
      </body></html>
    `);
    doc.close();
  };

  // Filter background presets by selected category
  const filteredBgs = useMemo(() => {
    return BACKGROUND_PRESETS.filter((b) => b.category === data.bgCategory);
  }, [data.bgCategory]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── TOOL HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-amber-500/20">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  ISO 7810 Standard • 300 DPI
                </span>
                <span className="text-xs font-bold text-slate-400">• Industry Backgrounds</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Universal Business &amp; ID Card Studio
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Generate high-resolution printable business cards, staff badges &amp; VIP passes with industry backgrounds, editable color codes, and printable A4 duplex sheets.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={downloadSinglePdf}
              disabled={isExporting}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
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
              <span>8-Card A4 Print Sheet</span>
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

      {/* ── MAIN STUDIO WORKSPACE ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE CANVASES PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Side Toggle & Standard Dimension Info */}
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

            <div className="text-[11px] font-mono text-slate-400 pr-2">
              {data.orientation === 'landscape' ? 'Universal 85.6 × 54 mm (3.5" × 2")' : 'Universal 54 × 85.6 mm (2" × 3.5")'}
            </div>
          </div>

          {/* Canvas Render Containers */}
          <div className="space-y-6">
            {(activeSide === 'both' || activeSide === 'front') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Eye className="w-3.5 h-3.5" />
                    FRONT SIDE PREVIEW
                  </span>
                  <button
                    onClick={() => downloadPng('front')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PNG</span>
                  </button>
                </div>
                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 p-4 shadow-2xl flex items-center justify-center min-h-[280px]">
                  <canvas
                    ref={frontCanvasRef}
                    className={`w-full ${cardDim.containerClass} ${cardDim.aspect} rounded-2xl shadow-2xl object-contain`}
                  />
                </div>
              </div>
            )}

            {(activeSide === 'both' || activeSide === 'back') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <QrCode className="w-3.5 h-3.5" />
                    BACK SIDE (SCANNABLE VCARD QR)
                  </span>
                  <button
                    onClick={() => downloadPng('back')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PNG</span>
                  </button>
                </div>
                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 p-4 shadow-2xl flex items-center justify-center min-h-[280px]">
                  <canvas
                    ref={backCanvasRef}
                    className={`w-full ${cardDim.containerClass} ${cardDim.aspect} rounded-2xl shadow-2xl object-contain`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS & INDUSTRY BACKGROUND SELECTOR (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur space-y-6">
          {/* Sub-Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'background', label: 'Theme & BGs', icon: Palette },
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
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
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

          {/* TAB 1: BACKGROUND CATEGORIES, PRESETS & COLOR EDITING */}
          {activeTab === 'background' && (
            <div className="space-y-5">
              {/* Orientation Selector */}
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

              {/* Editable Color Codes (Direct Hex Edit + Auto Apply) */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Accent Color (Editable Hex Code)</label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Primary Color</span>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={data.accentColor}
                        onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.accentColor}
                        onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                        placeholder="#F59E0B"
                        className="w-full bg-transparent font-mono text-xs text-white focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">Secondary Color</span>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={data.secondaryColor}
                        onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={data.secondaryColor}
                        onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                        placeholder="#06B6D4"
                        className="w-full bg-transparent font-mono text-xs text-white focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Color Presets */}
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
                        <Check className="w-3 h-3 text-black drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Industry Categories */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Industry Background Categories</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'technology', label: 'Tech & AI', icon: Cpu },
                    { id: 'construction', label: 'Construction', icon: HardHat },
                    { id: 'corporate', label: 'Corporate', icon: Briefcase },
                    { id: 'finance', label: 'Finance', icon: Landmark },
                    { id: 'automotive', label: 'Car Rental', icon: Car },
                    { id: 'medical', label: 'Medical', icon: HeartPulse },
                    { id: 'creative', label: 'Creative', icon: Paintbrush },
                    { id: 'minimal', label: 'Minimalist', icon: Sparkle },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          const firstInCat = BACKGROUND_PRESETS.find((b) => b.category === cat.id);
                          setData({
                            ...data,
                            bgCategory: cat.id as BgCategory,
                            backgroundId: firstInCat ? firstInCat.id : data.backgroundId,
                            isLightMode: firstInCat?.theme === 'light',
                          });
                        }}
                        className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                          data.bgCategory === cat.id
                            ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${data.bgCategory === cat.id ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] leading-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Background Presets List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Available Designs for {data.bgCategory.toUpperCase()}</label>
                <div className="space-y-2">
                  {filteredBgs.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() =>
                        setData({
                          ...data,
                          backgroundId: preset.id,
                          isLightMode: preset.theme === 'light',
                        })
                      }
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        data.backgroundId === preset.id
                          ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-white block">{preset.name}</span>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">{preset.desc}</span>
                      </div>
                      {data.backgroundId === preset.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Background Opacity Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Background Pattern Opacity</span>
                  <span className="text-amber-400 font-mono">{Math.round(data.bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.9}
                  step={0.05}
                  value={data.bgOpacity}
                  onChange={(e) => setData({ ...data, bgOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY DATA */}
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

          {/* TAB 3: CONTACTS */}
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

          {/* TAB 4: MEDIA & QR */}
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

              {/* QR Settings */}
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

          {/* TAB 5: PRINT & EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-blue-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Commercial ISO 7810 Standard
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Export in standard CR80 format (85.60 × 53.98 mm) at 300 DPI vector clarity with automatic duplex A4 cutting sheets.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={downloadSinglePdf}
                  disabled={isExporting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
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
