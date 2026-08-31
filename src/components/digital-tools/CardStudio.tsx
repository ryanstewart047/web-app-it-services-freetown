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
} from 'lucide-react';

export type CardCategory = 'business' | 'id_badge' | 'complementary' | 'vip_pass';

export type CardOrientation = 'landscape' | 'portrait';

export type CardTemplate =
  | 'executive_gold'
  | 'modern_tech'
  | 'clean_minimal'
  | 'royal_emerald'
  | 'cyber_matrix'
  | 'sunset_creative';

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
  signatureUrl: string | null;

  // QR Code Settings
  qrType: 'vcard' | 'website' | 'custom_text';
  qrCustomText: string;

  // Visual Customization
  category: CardCategory;
  orientation: CardOrientation;
  template: CardTemplate;
  accentColor: string;
  secondaryColor: string;
  showChip: boolean;
  showBarcode: boolean;
  showCutMarks: boolean;
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
  disclaimer: 'This card remains the property of the issuing organization. If found, please return to the address on the reverse or call security.',
  emergencyContact: '+232 88 294 631',

  photoUrl: null,
  logoUrl: null,
  signatureUrl: null,

  qrType: 'vcard',
  qrCustomText: 'https://www.itservicesfreetown.com',

  category: 'business',
  orientation: 'landscape',
  template: 'executive_gold',
  accentColor: '#F59E0B',
  secondaryColor: '#3B82F6',
  showChip: true,
  showBarcode: true,
  showCutMarks: true,
};

const TEMPLATE_PRESETS: {
  id: CardTemplate;
  name: string;
  desc: string;
  badge: string;
  accent: string;
  secondary: string;
  previewBg: string;
}[] = [
  {
    id: 'executive_gold',
    name: 'Executive Obsidian & Gold',
    desc: 'Deep metallic carbon with gold guilloche foil borders & luxury typography.',
    badge: 'Luxury • VIP',
    accent: '#F59E0B',
    secondary: '#D97706',
    previewBg: 'from-amber-500/30 via-slate-900 to-black',
  },
  {
    id: 'modern_tech',
    name: 'Modern Cyber Slate',
    desc: 'Electric cyan-blue neon gradients, glassmorphism badge plates & tech grid.',
    badge: 'Tech • Modern',
    accent: '#06B6D4',
    secondary: '#3B82F6',
    previewBg: 'from-cyan-500/30 via-slate-900 to-slate-950',
  },
  {
    id: 'clean_minimal',
    name: 'Minimalist Ivory & Slate',
    desc: 'Ultra clean light pearl aesthetic with sharp geometric hierarchy.',
    badge: 'Classic • Crisp',
    accent: '#2563EB',
    secondary: '#475569',
    previewBg: 'from-slate-100 via-slate-200 to-slate-400',
  },
  {
    id: 'royal_emerald',
    name: 'Royal Emerald & Platinum',
    desc: 'Prestige forest emerald with platinum dual pin-stripes & heraldic badge.',
    badge: 'Prestige',
    accent: '#10B981',
    secondary: '#34D399',
    previewBg: 'from-emerald-600/30 via-slate-900 to-slate-950',
  },
  {
    id: 'sunset_creative',
    name: 'Creative Studio Sunset',
    desc: 'Vibrant violet-to-amber mesh gradient for agencies, studios & creators.',
    badge: 'Agency • Vibrant',
    accent: '#EC4899',
    secondary: '#F97316',
    previewBg: 'from-fuchsia-500/30 via-purple-900 to-orange-950',
  },
  {
    id: 'cyber_matrix',
    name: 'Official Security & Matrix',
    desc: 'High-security guilloche micro-patterns, dual hologram banner & barcode.',
    badge: 'Security • Official',
    accent: '#3B82F6',
    secondary: '#8B5CF6',
    previewBg: 'from-blue-600/30 via-indigo-950 to-slate-950',
  },
];

export default function CardStudio() {
  const [data, setData] = useState<CardData>(DEFAULT_CARD_DATA);
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('both');
  const [activeTab, setActiveTab] = useState<'design' | 'content' | 'contacts' | 'media' | 'export'>('design');
  const [isExporting, setIsExporting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate vCard or URL QR Code
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
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR Code generation failed:', err));
  }, [data.qrType, data.qrCustomText, data.fullName, data.companyName, data.jobTitle, data.phone, data.whatsapp, data.email, data.website, data.address]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData((prev) => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Helper: Card Dimensions (in 300 DPI Pixels)
  // Standard CR80 / Business Card (3.5" x 2" = 1050 x 600 px @ 300 DPI)
  const cardDim = useMemo(() => {
    if (data.orientation === 'portrait') {
      return { width: 630, height: 1050, aspect: 'aspect-[630/1050]' };
    }
    return { width: 1050, height: 600, aspect: 'aspect-[1050/600]' };
  }, [data.orientation]);

  // Render Front Canvas
  const drawFront = useCallback(async () => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = cardDim.width;
    const H = cardDim.height;
    canvas.width = W;
    canvas.height = H;

    const isLight = data.template === 'clean_minimal';
    const primary = data.accentColor || '#F59E0B';
    const secondary = data.secondaryColor || '#3B82F6';

    // 1. Background Fill
    if (data.template === 'executive_gold') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0c0f17');
      grad.addColorStop(0.5, '#151922');
      grad.addColorStop(1, '#080a0f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Carbon weave pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let x = 0; x < W; x += 12) {
        for (let y = 0; y < H; y += 12) {
          if ((x + y) % 24 === 0) ctx.fillRect(x, y, 6, 6);
        }
      }

      // Gold guilloche lines & border
      ctx.strokeStyle = primary;
      ctx.lineWidth = 4;
      ctx.strokeRect(28, 28, W - 56, H - 56);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(36, 36, W - 72, H - 72);

      // Corner gold ornaments
      ctx.fillStyle = primary;
      const cs = 16;
      ctx.fillRect(28, 28, cs, 4);
      ctx.fillRect(28, 28, 4, cs);
      ctx.fillRect(W - 28 - cs, 28, cs, 4);
      ctx.fillRect(W - 32, 28, 4, cs);
      ctx.fillRect(28, H - 32, cs, 4);
      ctx.fillRect(28, H - 28 - cs, 4, cs);
      ctx.fillRect(W - 28 - cs, H - 32, cs, 4);
      ctx.fillRect(W - 32, H - 28 - cs, 4, cs);
    } else if (data.template === 'modern_tech') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#040d1a');
      grad.addColorStop(0.7, '#0b1b2f');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Cyber Grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Neon Top Banner
      const banner = ctx.createLinearGradient(0, 0, W, 0);
      banner.addColorStop(0, primary);
      banner.addColorStop(1, secondary);
      ctx.fillStyle = banner;
      ctx.fillRect(0, 0, W, 8);
    } else if (data.template === 'clean_minimal') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f8fafc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Elegant Left accent bar
      ctx.fillStyle = primary;
      ctx.fillRect(0, 0, 12, H);

      // Subtle border
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, W - 40, H - 40);
    } else if (data.template === 'royal_emerald') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.5, '#064e3b');
      grad.addColorStop(1, '#021c15');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Platinum pinstripes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, W - 60, H - 60);

      ctx.fillStyle = primary;
      ctx.fillRect(30, 30, W - 60, 6);
    } else if (data.template === 'sunset_creative') {
      const grad = ctx.createRadialGradient(W * 0.2, H * 0.3, 50, W * 0.5, H * 0.5, W);
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Vibrant mesh light spheres
      const s1 = ctx.createRadialGradient(W * 0.85, H * 0.2, 10, W * 0.85, H * 0.2, 350);
      s1.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
      s1.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = s1;
      ctx.fillRect(0, 0, W, H);

      const s2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 10, W * 0.15, H * 0.85, 320);
      s2.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
      s2.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = s2;
      ctx.fillRect(0, 0, W, H);
    } else {
      // cyber_matrix
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(1, '#050811');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Security guilloche waves
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < H; i += 24) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.bezierCurveTo(W * 0.33, i + 30, W * 0.66, i - 30, W, i);
        ctx.stroke();
      }
    }

    // 2. Draw Company Logo or Emblem
    let logoDrawn = false;
    if (data.logoUrl) {
      try {
        const logoImg = new window.Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise((res) => {
          logoImg.onload = res;
          logoImg.onerror = res;
          logoImg.src = data.logoUrl!;
        });
        if (logoImg.width > 0) {
          const lSize = data.orientation === 'portrait' ? 80 : 70;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(data.orientation === 'portrait' ? W / 2 - lSize / 2 : 60, 50, lSize, lSize, 12);
          ctx.clip();
          ctx.drawImage(logoImg, data.orientation === 'portrait' ? W / 2 - lSize / 2 : 60, 50, lSize, lSize);
          ctx.restore();
          logoDrawn = true;
        }
      } catch {}
    }

    // If no custom logo, draw vector brand emblem
    if (!logoDrawn) {
      const lx = data.orientation === 'portrait' ? W / 2 - 32 : 60;
      const ly = 50;
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.roundRect(lx, ly, 64, 64, 14);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.companyName.charAt(0) || 'B', lx + 32, ly + 34);
    }

    // 3. Draw Company Name & Slogan
    ctx.textAlign = data.orientation === 'portrait' ? 'center' : 'left';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = '900 24px Inter, sans-serif';

    const compX = data.orientation === 'portrait' ? W / 2 : logoDrawn ? 145 : 140;
    const compY = data.orientation === 'portrait' ? 145 : 75;
    ctx.fillText(data.companyName.toUpperCase(), compX, compY);

    if (data.tagline) {
      ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.6)';
      ctx.font = '500 13px Inter, sans-serif';
      ctx.fillText(data.tagline, compX, compY + 22);
    }

    // 4. Draw Smart EMV Chip (if enabled)
    if (data.showChip && data.category === 'id_badge') {
      const chipX = data.orientation === 'portrait' ? 60 : W - 140;
      const chipY = data.orientation === 'portrait' ? 200 : 50;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, 65, 48, 8);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Chip internal circuit lines
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(chipX + 22, chipY);
      ctx.lineTo(chipX + 22, chipY + 48);
      ctx.moveTo(chipX + 43, chipY);
      ctx.lineTo(chipX + 43, chipY + 48);
      ctx.moveTo(chipX, chipY + 24);
      ctx.lineTo(chipX + 65, chipY + 24);
      ctx.stroke();
    }

    // 5. Draw Photo / Avatar (for ID Badges and Portrait Cards)
    const hasPhoto = Boolean(data.photoUrl);
    if (hasPhoto || data.category === 'id_badge') {
      const pSize = data.orientation === 'portrait' ? 170 : 150;
      const px = data.orientation === 'portrait' ? W / 2 - pSize / 2 : 60;
      const py = data.orientation === 'portrait' ? 180 : 160;

      // Photo Frame & Glow
      ctx.save();
      ctx.fillStyle = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(px, py, pSize, pSize, 24);
      ctx.fill();

      ctx.strokeStyle = primary;
      ctx.lineWidth = 4;
      ctx.stroke();

      if (data.photoUrl) {
        try {
          const photoImg = new window.Image();
          photoImg.crossOrigin = 'anonymous';
          await new Promise((res) => {
            photoImg.onload = res;
            photoImg.onerror = res;
            photoImg.src = data.photoUrl!;
          });
          ctx.beginPath();
          ctx.roundRect(px + 4, py + 4, pSize - 8, pSize - 8, 20);
          ctx.clip();
          ctx.drawImage(photoImg, px + 4, py + 4, pSize - 8, pSize - 8);
        } catch {}
      } else {
        // Placeholder User Icon
        ctx.fillStyle = isLight ? '#94a3b8' : 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(px + pSize / 2, py + pSize / 2 - 16, 32, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + pSize / 2, py + pSize + 20, 52, Math.PI, 0);
        ctx.fill();
      }
      ctx.restore();
    }

    // 6. Draw Full Name & Title
    const nameX = data.orientation === 'portrait' ? W / 2 : hasPhoto || data.category === 'id_badge' ? 245 : 65;
    const nameY = data.orientation === 'portrait' ? (hasPhoto ? 390 : 260) : 210;

    ctx.textAlign = data.orientation === 'portrait' ? 'center' : 'left';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = '900 36px Inter, sans-serif';
    ctx.fillText(data.fullName, nameX, nameY);

    // Job Title with pill/accent line
    ctx.fillStyle = primary;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText(data.jobTitle.toUpperCase(), nameX, nameY + 28);

    if (data.department) {
      ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.5)';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillText(`Dept: ${data.department}`, nameX, nameY + 48);
    }

    // 7. Draw Contact Details Icons & Text (Landscape Front)
    if (data.orientation === 'landscape') {
      const startX = hasPhoto || data.category === 'id_badge' ? 245 : 65;
      const startY = 320;
      const lineH = 34;

      const contacts = [
        { icon: '📞', text: data.phone },
        { icon: '✉️', text: data.email },
        { icon: '🌐', text: data.website },
        { icon: '📍', text: data.address },
      ].filter((c) => c.text);

      contacts.forEach((c, idx) => {
        const col = idx < 2 ? 0 : 1;
        const row = idx % 2;
        const cx = startX + col * 340;
        const cy = startY + row * lineH;

        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = isLight ? '#1e293b' : 'rgba(255,255,255,0.85)';
        ctx.fillText(`${c.icon}  ${c.text}`, cx, cy);
      });
    } else {
      // Portrait Contact Grid
      const startY = hasPhoto ? 480 : 340;
      const items = [
        { label: 'ID NUMBER', val: data.idNumber, col: primary },
        { label: 'BLOOD GROUP', val: data.bloodGroup, col: isLight ? '#0f172a' : '#ffffff' },
        { label: 'ISSUE DATE', val: data.issueDate, col: isLight ? '#64748b' : 'rgba(255,255,255,0.7)' },
        { label: 'EXPIRY DATE', val: data.expiryDate, col: isLight ? '#64748b' : 'rgba(255,255,255,0.7)' },
      ];

      items.forEach((item, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const ix = col === 0 ? W * 0.25 : W * 0.75;
        const iy = startY + row * 65;

        ctx.textAlign = 'center';
        ctx.fillStyle = isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(item.label, ix, iy);

        ctx.fillStyle = item.col;
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillText(item.val, ix, iy + 22);
      });

      // Bottom Barcode on Portrait
      if (data.showBarcode) {
        const barY = H - 95;
        ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
        for (let b = 80; b < W - 80; b += 8) {
          const bw = (b % 16 === 0 ? 4 : 2);
          ctx.fillRect(b, barY, bw, 40);
        }
        ctx.textAlign = 'center';
        ctx.font = 'mono 11px monospace';
        ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.6)';
        ctx.fillText(data.idNumber, W / 2, barY + 56);
      }
    }

    // 8. Draw Cut/Bleed Marks (if enabled)
    if (data.showCutMarks) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      const cLen = 16;
      // Top Left
      ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(12, cLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(cLen, 12); ctx.stroke();
      // Top Right
      ctx.beginPath(); ctx.moveTo(W - 12, 0); ctx.lineTo(W - 12, cLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W, 12); ctx.lineTo(W - cLen, 12); ctx.stroke();
      // Bottom Left
      ctx.beginPath(); ctx.moveTo(12, H); ctx.lineTo(12, H - cLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, H - 12); ctx.lineTo(cLen, H - 12); ctx.stroke();
      // Bottom Right
      ctx.beginPath(); ctx.moveTo(W - 12, H); ctx.lineTo(W - 12, H - cLen); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W, H - 12); ctx.lineTo(W - cLen, H - 12); ctx.stroke();
    }
  }, [cardDim, data]);

  // Render Back Canvas
  const drawBack = useCallback(async () => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = cardDim.width;
    const H = cardDim.height;
    canvas.width = W;
    canvas.height = H;

    const isLight = data.template === 'clean_minimal';
    const primary = data.accentColor || '#F59E0B';

    // 1. Background Fill (matches front)
    if (data.template === 'executive_gold') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0c0f17');
      grad.addColorStop(1, '#05070a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, W - 56, H - 56);
    } else if (data.template === 'clean_minimal') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, W - 40, H - 40);
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0b1329');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // 2. Draw Magnetic Stripe or Top Security Banner
    const stripeH = data.orientation === 'portrait' ? 48 : 56;
    ctx.fillStyle = isLight ? '#1e293b' : '#05070d';
    ctx.fillRect(0, 36, W, stripeH);

    // 3. Draw QR Code (High Res)
    if (qrDataUrl) {
      try {
        const qrImg = new window.Image();
        qrImg.crossOrigin = 'anonymous';
        await new Promise((res) => {
          qrImg.onload = res;
          qrImg.onerror = res;
          qrImg.src = qrDataUrl;
        });

        const qrSize = data.orientation === 'portrait' ? 180 : 190;
        const qx = data.orientation === 'portrait' ? W / 2 - qrSize / 2 : 70;
        const qy = data.orientation === 'portrait' ? 150 : 150;

        // White border around QR for scanability
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(qx - 8, qy - 8, qrSize + 16, qrSize + 16, 12);
        ctx.fill();

        ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);
      } catch {}
    }

    // 4. Backside Content & Instructions
    const tx = data.orientation === 'portrait' ? W / 2 : 310;
    const ty = data.orientation === 'portrait' ? 380 : 170;

    ctx.textAlign = data.orientation === 'portrait' ? 'center' : 'left';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.font = '900 20px Inter, sans-serif';
    ctx.fillText(data.backTitle, tx, ty);

    ctx.fillStyle = primary;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(data.backSubtitle, tx, ty + 24);

    // Disclaimer
    ctx.fillStyle = isLight ? '#64748b' : 'rgba(255,255,255,0.6)';
    ctx.font = '11px Inter, sans-serif';

    // Wrap disclaimer text
    const words = data.disclaimer.split(' ');
    let line = '';
    let lineY = ty + 60;
    const maxW = data.orientation === 'portrait' ? W - 100 : W - 360;

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

    // Emergency Contact
    if (data.emergencyContact) {
      lineY += 28;
      ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(`Emergency Security: ${data.emergencyContact}`, tx, lineY);
    }

    // Bottom Official Tag & Web Link
    const botY = H - 45;
    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`${data.companyName.toUpperCase()} · ${data.website}`, W / 2, botY);
  }, [cardDim, data, qrDataUrl]);

  // Re-draw canvases when data changes
  useEffect(() => {
    drawFront();
    drawBack();
  }, [drawFront, drawBack]);

  // ── EXPORT ENGINE (300 DPI PDF, Multi-Page, A4 Sheet, PNG) ────────────────────

  // Download Single Card PDF (Front + Back)
  const downloadSinglePdf = async () => {
    setIsExporting(true);
    try {
      const frontCanvas = frontCanvasRef.current;
      const backCanvas = backCanvasRef.current;
      if (!frontCanvas || !backCanvas) return;

      const isPort = data.orientation === 'portrait';
      // Standard Card 85.6mm x 54mm (CR80)
      const pdfW = isPort ? 54 : 85.6;
      const pdfH = isPort ? 85.6 : 54;

      const pdf = new jsPDF({
        orientation: isPort ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfW, pdfH],
      });

      // Page 1: Front
      const frontImg = frontCanvas.toDataURL('image/png');
      pdf.addImage(frontImg, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');

      // Page 2: Back
      pdf.addPage([pdfW, pdfH], isPort ? 'portrait' : 'landscape');
      const backImg = backCanvas.toDataURL('image/png');
      pdf.addImage(backImg, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');

      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_Card_Front_Back.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Download A4 Print Sheet (Fits 8–10 Cards with Cutting Guides)
  const downloadA4PrintSheet = async () => {
    setIsExporting(true);
    try {
      const frontCanvas = frontCanvasRef.current;
      const backCanvas = backCanvasRef.current;
      if (!frontCanvas || !backCanvas) return;

      // Standard A4: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const cardW = 85.6;
      const cardH = 54.0;
      const marginX = 14.0;
      const marginY = 18.0;
      const spacingX = 10.0;
      const spacingY = 12.0;

      const frontImg = frontCanvas.toDataURL('image/png');
      const backImg = backCanvas.toDataURL('image/png');

      // Page 1: 8 Front Cards
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`BridgeTec Card Studio — Print Sheet (Front Side) — ${data.fullName}`, 14, 12);

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          const x = marginX + c * (cardW + spacingX);
          const y = marginY + r * (cardH + spacingY);

          pdf.addImage(frontImg, 'PNG', x, y, cardW, cardH, undefined, 'FAST');

          // Draw crop guide lines
          pdf.setDrawColor(180, 180, 180);
          pdf.setLineWidth(0.1);
          pdf.rect(x, y, cardW, cardH);
        }
      }

      // Page 2: 8 Back Cards (Mirrored horizontally for double-sided alignment)
      pdf.addPage('a4', 'portrait');
      pdf.text(`BridgeTec Card Studio — Print Sheet (Back Side) — ${data.fullName}`, 14, 12);

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          // Mirrored column for duplex back-to-back printing
          const mirroredCol = c === 0 ? 1 : 0;
          const x = marginX + mirroredCol * (cardW + spacingX);
          const y = marginY + r * (cardH + spacingY);

          pdf.addImage(backImg, 'PNG', x, y, cardW, cardH, undefined, 'FAST');
          pdf.rect(x, y, cardW, cardH);
        }
      }

      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_A4_Print_Sheet_8Cards.pdf`);
    } catch (err) {
      console.error('A4 Sheet Export Error:', err);
      alert('Failed to generate A4 print sheet.');
    } finally {
      setIsExporting(false);
    }
  };

  // Download High-Res PNG
  const downloadPng = (side: 'front' | 'back') => {
    const canvas = side === 'front' ? frontCanvasRef.current : backCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `${data.fullName.replace(/\s+/g, '_')}_Card_${side.toUpperCase()}.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
  };

  // Instant Browser Print
  const handlePrint = () => {
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    if (!frontCanvas || !backCanvas) return;

    const frontData = frontCanvas.toDataURL('image/png');
    const backData = backCanvas.toDataURL('image/png');

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
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.fullName} - Business & ID Card</title>
          <style>
            @page { size: auto; margin: 8mm; }
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; font-family: sans-serif; }
            .card-wrapper { text-align: center; }
            img { width: 85.6mm; height: 54mm; object-fit: contain; border-radius: 4mm; box-shadow: 0 0 1px #888; }
            .label { font-size: 10px; color: #666; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <img src="${frontData}" />
            <div class="label">Front Side (3.37" x 2.125" / 85.6mm x 54mm)</div>
          </div>
          <div class="card-wrapper">
            <img src="${backData}" />
            <div class="label">Back Side (vCard QR Scannable)</div>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.parent.document.body.removeChild(window.frameElement); }, 1500);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

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
                  300 DPI Print Studio
                </span>
                <span className="text-xs font-bold text-slate-400">• Multi-Side • vCard QR</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Business &amp; ID Card Generator
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Create ultra-high quality printable business cards, corporate badges, complement cards &amp; NFC contact cards with live 3D preview and multi-card A4 print sheets.
              </p>
            </div>
          </div>

          {/* Action Export Buttons Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={downloadSinglePdf}
              disabled={isExporting}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download Card PDF'}</span>
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

      {/* ── MAIN STUDIO GRID: PREVIEW + CONTROLS ──────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE VISUAL CANVAS PREVIEW (Cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Side Toggle Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSide('both')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'both' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dual View (Front &amp; Back)
              </button>
              <button
                onClick={() => setActiveSide('front')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'front' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Front Side Only
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeSide === 'back' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Back Side (QR Code)
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pr-2">
              {data.orientation === 'landscape' ? '3.5" × 2" (85.6 × 54mm)' : '2" × 3.5" (54 × 85.6mm)'}
            </div>
          </div>

          {/* Live Card Canvases */}
          <div className="space-y-6">
            {/* FRONT SIDE PREVIEW */}
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
                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 p-2 sm:p-4 shadow-2xl flex items-center justify-center">
                  <canvas
                    ref={frontCanvasRef}
                    className={`w-full max-w-[560px] ${cardDim.aspect} rounded-2xl shadow-2xl object-contain`}
                  />
                </div>
              </div>
            )}

            {/* BACK SIDE PREVIEW */}
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
                <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-950 p-2 sm:p-4 shadow-2xl flex items-center justify-center">
                  <canvas
                    ref={backCanvasRef}
                    className={`w-full max-w-[560px] ${cardDim.aspect} rounded-2xl shadow-2xl object-contain`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STUDIO CONFIGURATION TABS & CONTROLS (Cols 5) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'design', label: 'Design', icon: Palette },
              { id: 'content', label: 'Identity', icon: User },
              { id: 'contacts', label: 'Contacts', icon: Phone },
              { id: 'media', label: 'Media & QR', icon: QrCode },
              { id: 'export', label: 'Print/PDF', icon: Printer },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
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

          {/* TAB 1: DESIGN TEMPLATES & ORIENTATION */}
          {activeTab === 'design' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Card Type &amp; Purpose</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'business', label: 'Business Card', icon: Briefcase },
                    { id: 'id_badge', label: 'Corporate ID Badge', icon: Shield },
                    { id: 'complementary', label: 'Complement Slip', icon: FileText },
                    { id: 'vip_pass', label: 'VIP Pass / Badge', icon: Award },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setData({ ...data, category: cat.id as CardCategory })}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        data.category === cat.id
                          ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <cat.icon className={`w-4 h-4 ${data.category === cat.id ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Orientation</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setData({ ...data, orientation: 'landscape' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      data.orientation === 'landscape'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <span>Landscape (Horizontal)</span>
                  </button>
                  <button
                    onClick={() => setData({ ...data, orientation: 'portrait' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      data.orientation === 'portrait'
                        ? 'border-amber-500 bg-amber-500/10 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <span>Portrait (Vertical)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Choose Design Template</label>
                <div className="space-y-2.5">
                  {TEMPLATE_PRESETS.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() =>
                        setData({
                          ...data,
                          template: tmpl.id,
                          accentColor: tmpl.accent,
                          secondaryColor: tmpl.secondary,
                        })
                      }
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        data.template === tmpl.id
                          ? 'border-amber-500 bg-gradient-to-r ' + tmpl.previewBg + ' text-white ring-1 ring-amber-500/50'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-md"
                          style={{ backgroundColor: tmpl.accent }}
                        />
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-2">
                            <span>{tmpl.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-white/10">
                              {tmpl.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{tmpl.desc}</p>
                        </div>
                      </div>
                      {data.template === tmpl.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Primary Accent</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={data.accentColor}
                      onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-white">{data.accentColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Secondary Accent</label>
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <input
                      type="color"
                      value={data.secondaryColor}
                      onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-white">{data.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITY & PERSONA CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Job Title / Role *</label>
                  <input
                    type="text"
                    value={data.jobTitle}
                    onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                    placeholder="e.g. Lead Consultant"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={data.department}
                    onChange={(e) => setData({ ...data, department: e.target.value })}
                    placeholder="e.g. Executive Board"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Company / Organization *</label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="e.g. BridgeTec Digital"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Tagline / Motto</label>
                <input
                  type="text"
                  value={data.tagline}
                  onChange={(e) => setData({ ...data, tagline: e.target.value })}
                  placeholder="e.g. Empowering Digital Transformation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
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

          {/* TAB 3: CONTACT CHANNELS */}
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
                <label className="text-[11px] font-bold text-slate-300 block mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={data.whatsapp}
                  onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
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
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Physical Address / City</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  placeholder="15 Wilkinson Road, Freetown"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA UPLOADS & QR CODE CONFIG */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              {/* Photo & Logo Uploads */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 block">ID / Portrait Photo</label>
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
                  <label className="text-[11px] font-bold text-slate-300 block">Company Logo</label>
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

              {/* QR Code Mode Selector */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Smart Scannable QR Mode</span>
                  <span className="text-amber-400 font-mono text-[10px]">Instant Phone Sync</span>
                </label>

                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[
                    { id: 'vcard', label: 'vCard Contact' },
                    { id: 'website', label: 'Website Link' },
                    { id: 'custom_text', label: 'Custom Text' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setData({ ...data, qrType: mode.id as any })}
                      className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                        data.qrType === mode.id ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {data.qrType === 'vcard' && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                    <Smartphone className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      When anyone scans this QR with their smartphone camera, your full name, company, phone, email &amp; website will be saved directly into their contacts!
                    </span>
                  </div>
                )}

                {data.qrType === 'custom_text' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Custom Link / Message</label>
                    <input
                      type="text"
                      value={data.qrCustomText}
                      onChange={(e) => setData({ ...data, qrCustomText: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PRINT & EXPORT OPTIONS */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-blue-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Commercial Print Standards
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Export in standard ISO 7810 ID-1 (CR80) dimensions (85.60 × 53.98 mm) at 300 DPI vector clarity with automatic 3mm bleed and cut marks.
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
