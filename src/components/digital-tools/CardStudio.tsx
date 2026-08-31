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
} from 'lucide-react';

export type CardCategory = 'all' | 'business' | 'id_badge' | 'complementary' | 'vip_pass';
export type CardOrientation = 'landscape' | 'portrait';

export type TemplateStyleGroup =
  | 'all'
  | 'popular'
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
    logoImg: HTMLImageElement | null
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

  // Visual Customization
  templateId: string;
  orientation: CardOrientation;
  accentColor: string;
  secondaryColor: string;
  bgOpacity: number;
  showChip: boolean;
  showBarcode: boolean;
  showCutMarks: boolean;
}

// ── COLOR PRESETS PALETTE ───────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'Imperial Gold', hex: '#F59E0B' },
  { name: 'Electric Cyan', hex: '#06B6D4' },
  { name: 'Royal Sapphire', hex: '#2563EB' },
  { name: 'Emerald Jade', hex: '#10B981' },
  { name: 'Crimson Ruby', hex: '#E11D48' },
  { name: 'Sunset Amber', hex: '#F97316' },
  { name: 'Cyber Violet', hex: '#8B5CF6' },
  { name: 'Rose Gold', hex: '#FB7185' },
  { name: 'Deep Teal', hex: '#0D9488' },
  { name: 'Platinum Slate', hex: '#94A3B8' },
  { name: 'Bronze Ochre', hex: '#D97706' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

// ── MASTER DESIGN TEMPLATES ─────────────────────────────────────────────────────
const MASTER_TEMPLATES: CardTemplateConfig[] = [
  // 1. EXECUTIVE 3D OBSIDIAN & GOLD (3D / Luxury / Company)
  {
    id: 'executive_3d_gold',
    name: 'Executive 3D Obsidian & Gold',
    category: '3d_luxury',
    industry: 'Executive / Corporate / VIP',
    tagline: 'Deep carbon weave, 3D beveled gold ribbon, metallic crest',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#D97706',
    badgeIcon: '👑',
    previewGradient: 'from-amber-500/40 via-slate-900 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, '#0a0d14');
      bgGrad.addColorStop(0.5, '#121824');
      bgGrad.addColorStop(1, '#05070a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Carbon Weave Pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let x = 0; x < W; x += 12) {
        for (let y = 0; y < H; y += 12) {
          if ((x + y) % 24 === 0) ctx.fillRect(x, y, 6, 6);
        }
      }

      // 3D Beveled Diagonal Gold Ribbon
      const primary = data.accentColor || '#F59E0B';
      const goldRibbon = ctx.createLinearGradient(0, 0, W, H);
      goldRibbon.addColorStop(0, primary);
      goldRibbon.addColorStop(0.3, '#FDE68A');
      goldRibbon.addColorStop(0.6, primary);
      goldRibbon.addColorStop(1, '#92400E');

      ctx.save();
      ctx.fillStyle = goldRibbon;
      ctx.beginPath();
      if (isPort) {
        ctx.moveTo(0, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, 18);
        ctx.lineTo(0, 48);
      } else {
        ctx.moveTo(W * 0.72, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H);
        ctx.lineTo(W * 0.62, H);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = primary;
      ctx.lineWidth = 3;
      ctx.strokeRect(22, 22, W - 44, H - 44);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, W - 60, H - 60);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', 'rgba(255,255,255,0.7)', photoImg, logoImg, '👑');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 2. MODERN REAL ESTATE & ARCHITECTURE (Real Estate / Modern)
  {
    id: 'real_estate_skyline',
    name: 'Metropolitan Real Estate & Skyline',
    category: 'corporate_legal',
    industry: 'Real Estate / Property / Architecture',
    tagline: 'Split geometry, modern architectural blueprint grid & skyline',
    theme: 'dark',
    defaultAccent: '#38BDF8',
    defaultSecondary: '#F59E0B',
    badgeIcon: '🏢',
    previewGradient: 'from-sky-500/30 via-slate-900 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#38BDF8';
      ctx.fillStyle = '#081021';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 28) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 28) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      const skyY = H * 0.75;
      const bWidth = W / 14;
      for (let i = 0; i < 14; i++) {
        const bHeight = 40 + ((i * 37) % 90);
        ctx.fillRect(i * bWidth, skyY - bHeight, bWidth - 4, bHeight + H * 0.25);
      }

      const stripe = ctx.createLinearGradient(0, 0, W, 0);
      stripe.addColorStop(0, primary);
      stripe.addColorStop(1, '#6366F1');
      ctx.fillStyle = stripe;
      ctx.fillRect(0, 0, W, 8);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#94a3b8', photoImg, logoImg, '🏢');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 3. CYBER & AI TECHNOLOGY (Technology / Cool / 3D)
  {
    id: 'cyber_ai_neon',
    name: 'Cybernetic AI & Quantum Grid',
    category: 'modern_tech',
    industry: 'Technology / Software / AI / Cyber',
    tagline: 'Electric neon cyan & violet aura, data node streams & glassmorphism',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#8B5CF6',
    badgeIcon: '⚡',
    previewGradient: 'from-cyan-500/30 via-violet-950 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#06B6D4';
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      const g1 = ctx.createRadialGradient(W * 0.85, H * 0.2, 10, W * 0.85, H * 0.2, 320);
      g1.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 10, W * 0.15, H * 0.85, 280);
      g2.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1.5;
      for (let x = 60; x < W; x += 110) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H * 0.45);
        ctx.lineTo(x + 40, H * 0.45 + 40);
        ctx.lineTo(x + 40, H);
        ctx.stroke();

        ctx.fillStyle = primary;
        ctx.beginPath();
        ctx.arc(x + 40, H * 0.45 + 40, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#cbd5e1', photoImg, logoImg, '⚡');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 4. LAWYER, LEGAL & JUSTICE (Corporate / Professional / Elegant)
  {
    id: 'legal_justice_prestige',
    name: 'Chambers Legal & Jurisprudence',
    category: 'corporate_legal',
    industry: 'Lawyers / Legal / Notary / Consulting',
    tagline: 'Rich burgundy-navy, classical double pinstripes & scales of justice',
    theme: 'dark',
    defaultAccent: '#EAB308',
    defaultSecondary: '#1E3A8A',
    badgeIcon: '⚖️',
    previewGradient: 'from-amber-600/30 via-slate-900 to-blue-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#EAB308';
      ctx.fillStyle = '#060d1f';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(24, 24, W - 48, H - 48);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(32, 32, W - 64, H - 64);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#cbd5e1', photoImg, logoImg, '⚖️');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 5. CONSTRUCTION, CONTRACTOR & HANDYMAN (Construction / Trades)
  {
    id: 'construction_heavy_duty',
    name: 'Industrial Construction & Engineering',
    category: 'trades_construction',
    industry: 'Construction / Contractor / Handyman / Electrician',
    tagline: 'Heavy matte graphite, safety amber hazard chevron & structural steel',
    theme: 'dark',
    defaultAccent: '#F59E0B',
    defaultSecondary: '#EF4444',
    badgeIcon: '🏗️',
    previewGradient: 'from-amber-500/40 via-stone-900 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#F59E0B';
      ctx.fillStyle = '#111317';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 3;
      for (let i = -W; i < W * 2; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + H * 0.7, H);
        ctx.stroke();
      }

      const hazH = isPort ? 16 : 18;
      const hazY = isPort ? H - 24 : H - 28;
      ctx.fillStyle = primary;
      ctx.fillRect(0, hazY, W, hazH);

      ctx.fillStyle = '#000000';
      for (let x = -40; x < W + 40; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, hazY);
        ctx.lineTo(x + 14, hazY);
        ctx.lineTo(x, hazY + hazH);
        ctx.lineTo(x - 14, hazY + hazH);
        ctx.closePath();
        ctx.fill();
      }

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e2e8f0', photoImg, logoImg, '🏗️');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 6. BEAUTY, SALON & SPA (Beauty / Elegant / Cute)
  {
    id: 'beauty_spa_rosegold',
    name: 'Velvet Rose Gold & Botanical Spa',
    category: 'lifestyle_beauty',
    industry: 'Beauty / Cosmetics / Hair Salon / Spa / Nails',
    tagline: 'Soft rose blush marble, gold foil botanical wreath & haute couture type',
    theme: 'dark',
    defaultAccent: '#FB7185',
    defaultSecondary: '#F59E0B',
    badgeIcon: '✨',
    previewGradient: 'from-rose-500/30 via-purple-950 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#FB7185';
      ctx.fillStyle = '#130a17';
      ctx.fillRect(0, 0, W, H);

      const rGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, 30, W * 0.5, H * 0.5, W * 0.6);
      rGrad.addColorStop(0, 'rgba(251, 113, 133, 0.18)');
      rGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = rGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, W - 44, H - 44);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#f1f5f9', photoImg, logoImg, '🌸');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 7. VINTAGE BARBER & GROOMING (Barber / Cool / Retro)
  {
    id: 'barber_vintage_grooming',
    name: 'Vintage Gentleman Barber & Shave',
    category: 'lifestyle_beauty',
    industry: 'Barbershop / Men Grooming / Tattoo Studio',
    tagline: 'Aged mahogany leather texture, crossed straight razors & vintage badge',
    theme: 'dark',
    defaultAccent: '#D97706',
    defaultSecondary: '#B91C1C',
    badgeIcon: '✂️',
    previewGradient: 'from-amber-700/40 via-stone-900 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#D97706';
      ctx.fillStyle = '#140e0b';
      ctx.fillRect(0, 0, W, H);

      const poleW = 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, poleW, H);
      for (let y = -20; y < H + 20; y += 24) {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, y, poleW, 10);
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, y + 12, poleW, 10);
      }

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(26, 20, W - 46, H - 40);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#d6d3d1', photoImg, logoImg, '✂️');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 8. RESTAURANT, CHEF & CULINARY (Restaurant / Bakery / Food)
  {
    id: 'culinary_gastronomy',
    name: 'Artisan Culinary & Fine Dining',
    category: 'lifestyle_beauty',
    industry: 'Restaurant / Chef / Catering / Bakery / Cafe',
    tagline: 'Warm terracotta & copper gold, bespoke culinary fork/knife crest',
    theme: 'dark',
    defaultAccent: '#F97316',
    defaultSecondary: '#EAB308',
    badgeIcon: '🍴',
    previewGradient: 'from-orange-600/30 via-stone-950 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#F97316';
      ctx.fillStyle = '#0f0c0a';
      ctx.fillRect(0, 0, W, H);

      const rad = ctx.createRadialGradient(W * 0.5, H * 0.3, 10, W * 0.5, H * 0.3, 260);
      rad.addColorStop(0, 'rgba(249, 115, 22, 0.15)');
      rad.addColorStop(1, 'transparent');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 24, W - 48, H - 48);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fed7aa', photoImg, logoImg, '🍴');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 9. PHOTOGRAPHY & STUDIO ARTS (Photography / Creative)
  {
    id: 'photography_aperture',
    name: 'Luminous Aperture & Lens Studio',
    category: 'creative_colorful',
    industry: 'Photography / Videography / Film / Media',
    tagline: 'Matte jet-black, multi-blade golden camera aperture lens graphic',
    theme: 'dark',
    defaultAccent: '#EAB308',
    defaultSecondary: '#3B82F6',
    badgeIcon: '📷',
    previewGradient: 'from-yellow-500/30 via-slate-900 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#EAB308';
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, W, H);

      const ax = isPort ? W * 0.5 : W * 0.78;
      const ay = isPort ? H * 0.3 : H * 0.5;
      const aRadius = isPort ? 110 : 130;

      ctx.save();
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ax, ay, aRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, W - 44, H - 44);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e5e5e5', photoImg, logoImg, '📷');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 10. CLEANING SERVICES & SPARKLE (Cleaning / Simple)
  {
    id: 'cleaning_sparkle_fresh',
    name: 'Crystal Clean & Sparkle Hygiene',
    category: 'trades_construction',
    industry: 'Cleaning Services / Janitorial / Hygiene / Laundry',
    tagline: 'Fresh aqua mint, gleaming sparkle bubbles & shield emblem',
    theme: 'dark',
    defaultAccent: '#06B6D4',
    defaultSecondary: '#3B82F6',
    badgeIcon: '✨',
    previewGradient: 'from-cyan-400/30 via-blue-950 to-slate-950',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#06B6D4';
      ctx.fillStyle = '#06101e';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#e0f2fe', photoImg, logoImg, '🧹');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 11. ELECTRICIAN & POWER SURGE (Electrician / Trades)
  {
    id: 'electrician_power_surge',
    name: 'High Voltage Electrical Engineering',
    category: 'trades_construction',
    industry: 'Electrician / Power / Solar / HVAC',
    tagline: 'High-voltage lightning pulse chevron, carbon grid & surge lines',
    theme: 'dark',
    defaultAccent: '#FACC15',
    defaultSecondary: '#F97316',
    badgeIcon: '⚡',
    previewGradient: 'from-yellow-400/30 via-amber-950 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#FACC15';
      ctx.fillStyle = '#0b0c10';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fef08a', photoImg, logoImg, '⚡');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 12. MINIMALIST SWISS MONOCHROME (Minimal / Simple / Modern)
  {
    id: 'minimal_swiss_monochrome',
    name: 'Minimalist Swiss Studio White',
    category: 'minimal_simple',
    industry: 'Design / Architecture / Fashion / Consulting',
    tagline: 'Stark white & obsidian black, Swiss typographic grid, bold red dot',
    theme: 'light',
    defaultAccent: '#DC2626',
    defaultSecondary: '#0F172A',
    badgeIcon: '⚪',
    previewGradient: 'from-white via-slate-100 to-slate-300',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#DC2626';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, 14, H);

      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(isPort ? W - 45 : W - 50, 45, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, '#0F172A', '#0F172A', '#475569', photoImg, logoImg, '▪️');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, '#0F172A', '#0F172A', qrImg);
      }
    },
  },

  // 13. CREATIVE VIBRANT AURORA (Colorful / Creative / Cool)
  {
    id: 'creative_vibrant_aurora',
    name: 'Creative Aurora & Prism Mesh',
    category: 'creative_colorful',
    industry: 'Creative Agencies / Creators / Freelancers / Media',
    tagline: 'Fluid multi-stop neon mesh gradient with frosted glass overlay',
    theme: 'colorful',
    defaultAccent: '#F43F5E',
    defaultSecondary: '#8B5CF6',
    badgeIcon: '🎨',
    previewGradient: 'from-rose-500 via-purple-600 to-cyan-500',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#F43F5E';
      const mesh = ctx.createLinearGradient(0, 0, W, H);
      mesh.addColorStop(0, '#1e1b4b');
      mesh.addColorStop(0.4, '#311042');
      mesh.addColorStop(1, '#0f172a');
      ctx.fillStyle = mesh;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, W - 44, H - 44);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#fed7aa', photoImg, logoImg, '🎨');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },

  // 14. INSURANCE & FIDUCIARY WEALTH (Insurance / Finance)
  {
    id: 'insurance_fiduciary_emerald',
    name: 'Fiduciary Wealth & Security Shield',
    category: 'corporate_legal',
    industry: 'Insurance / Financial Advisors / Wealth Management',
    tagline: 'Deep emerald forest, silver guilloche arcs & fiduciary crest',
    theme: 'dark',
    defaultAccent: '#10B981',
    defaultSecondary: '#34D399',
    badgeIcon: '🛡️',
    previewGradient: 'from-emerald-500/30 via-slate-900 to-black',
    drawCard: (ctx, W, H, isPort, isBack, data, qrImg, photoImg, logoImg) => {
      const primary = data.accentColor || '#10B981';
      ctx.fillStyle = '#022119';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = primary;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(22, 22, W - 44, H - 44);

      if (!isBack) {
        renderStandardFrontContent(ctx, W, H, isPort, data, primary, '#ffffff', '#a7f3d0', photoImg, logoImg, '🛡️');
      } else {
        renderStandardBackContent(ctx, W, H, isPort, data, primary, '#ffffff', qrImg);
      }
    },
  },
];

// ── COMPOSITE CONTENT RENDERERS ────────────────────────────────────────────────
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
  defaultIcon: string
) {
  if (isPort) {
    const logoSize = 60;
    const logoX = W / 2 - logoSize / 2;
    const logoY = 46;

    if (logoImg && logoImg.width > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } else {
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.companyName.charAt(0) || defaultIcon, W / 2, logoY + logoSize / 2 + 1);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.font = '900 20px Inter, sans-serif';
    ctx.fillText(data.companyName.toUpperCase(), W / 2, 134);

    if (data.tagline) {
      ctx.fillStyle = subTextColor;
      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillText(data.tagline, W / 2, 154);
    }

    const pSize = 160;
    const px = W / 2 - pSize / 2;
    const py = 180;

    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect(px, py, pSize, pSize, 22);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    if (photoImg && photoImg.width > 0) {
      ctx.beginPath();
      ctx.roundRect(px + 4, py + 4, pSize - 8, pSize - 8, 18);
      ctx.clip();
      ctx.drawImage(photoImg, px + 4, py + 4, pSize - 8, pSize - 8);
    } else {
      ctx.fillStyle = subTextColor;
      ctx.beginPath();
      ctx.arc(W / 2, py + 62, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(W / 2, py + pSize + 22, 58, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.font = '900 28px Inter, sans-serif';
    ctx.fillText(data.fullName, W / 2, 380);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(data.jobTitle.toUpperCase(), W / 2, 404);

    if (data.department) {
      ctx.fillStyle = subTextColor;
      ctx.font = '600 12px Inter, sans-serif';
      ctx.fillText(`Dept: ${data.department}`, W / 2, 424);
    }

    const blockY = 465;
    const metrics = [
      { label: 'ID NUMBER', val: data.idNumber, col: accentColor },
      { label: 'BLOOD GROUP', val: data.bloodGroup, col: textColor },
      { label: 'ISSUE DATE', val: data.issueDate, col: subTextColor },
      { label: 'EXPIRY DATE', val: data.expiryDate, col: subTextColor },
    ];

    metrics.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const mx = col === 0 ? W * 0.28 : W * 0.72;
      const my = blockY + row * 58;

      ctx.fillStyle = subTextColor;
      ctx.font = 'bold 9.5px Inter, sans-serif';
      ctx.fillText(m.label, mx, my);

      ctx.fillStyle = m.col;
      ctx.font = 'bold 14.5px Inter, sans-serif';
      ctx.fillText(m.val, mx, my + 18);
    });

    const contactY = 600;
    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(`📞  ${data.phone}`, W / 2, contactY);
    ctx.fillText(`✉️  ${data.email}`, W / 2, contactY + 26);
    ctx.fillText(`🌐  ${data.website}`, W / 2, contactY + 52);

    if (data.showBarcode) {
      const barY = H - 128;
      ctx.fillStyle = textColor;
      for (let b = 70; b < W - 70; b += 7) {
        const bw = b % 14 === 0 ? 3.5 : 1.5;
        ctx.fillRect(b, barY, bw, 34);
      }
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = subTextColor;
      ctx.fillText(data.idNumber, W / 2, barY + 48);
    }
  } else {
    const logoSize = 64;
    const logoX = 52;
    const logoY = 48;

    if (logoImg && logoImg.width > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } else {
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.companyName.charAt(0) || defaultIcon, logoX + logoSize / 2, logoY + logoSize / 2 + 1);
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = textColor;
    ctx.font = '900 24px Inter, sans-serif';
    ctx.fillText(data.companyName.toUpperCase(), 132, 74);

    if (data.tagline) {
      ctx.fillStyle = subTextColor;
      ctx.font = '500 13px Inter, sans-serif';
      ctx.fillText(data.tagline, 132, 98);
    }

    const nameY = 205;
    ctx.fillStyle = textColor;
    ctx.font = '900 38px Inter, sans-serif';
    ctx.fillText(data.fullName, 52, nameY);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 17px Inter, sans-serif';
    ctx.fillText(data.jobTitle.toUpperCase(), 52, nameY + 30);

    if (data.department) {
      ctx.fillStyle = subTextColor;
      ctx.font = '600 13px Inter, sans-serif';
      ctx.fillText(`Dept: ${data.department}`, 52, nameY + 54);
    }

    const startY = 328;
    const contacts = [
      { icon: '📞', text: data.phone },
      { icon: '✉️', text: data.email },
      { icon: '🌐', text: data.website },
      { icon: '📍', text: data.address },
    ].filter((c) => c.text);

    contacts.forEach((c, idx) => {
      const col = idx < 2 ? 0 : 1;
      const row = idx % 2;
      const cx = 52 + col * 370;
      const cy = startY + row * 38;

      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(`${c.icon}  ${c.text}`, cx, cy);
    });
  }

  if (data.showCutMarks) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
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
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 32, W, isPort ? 44 : 52);

  if (qrImg && qrImg.width > 0) {
    const qrSize = isPort ? 175 : 185;
    const qx = isPort ? W / 2 - qrSize / 2 : 65;
    const qy = isPort ? 135 : 140;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qx - 8, qy - 8, qrSize + 16, qrSize + 16, 12);
    ctx.fill();
    ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);
  }

  const tx = isPort ? W / 2 : 290;
  const ty = isPort ? 355 : 160;

  ctx.textAlign = isPort ? 'center' : 'left';
  ctx.fillStyle = textColor;
  ctx.font = '900 20px Inter, sans-serif';
  ctx.fillText(data.backTitle, tx, ty);

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 12.5px Inter, sans-serif';
  ctx.fillText(data.backSubtitle, tx, ty + 24);

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
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
    ctx.fillStyle = textColor;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`Emergency Security: ${data.emergencyContact}`, tx, lineY);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText(`${data.companyName.toUpperCase()} · ${data.website}`, W / 2, H - 40);
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

  templateId: 'executive_3d_gold',
  orientation: 'landscape',
  accentColor: '#F59E0B',
  secondaryColor: '#D97706',
  bgOpacity: 0.4,
  showChip: true,
  showBarcode: true,
  showCutMarks: true,
};

export default function CardStudio() {
  const [data, setData] = useState<CardData>(DEFAULT_CARD_DATA);
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');
  const [activeTab, setActiveTab] = useState<'templates' | 'identity' | 'contacts' | 'media_qr' | 'export'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<TemplateStyleGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const qrImgRef = useRef<HTMLImageElement | null>(null);

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
        activeTemplate.drawCard(ctx, W, H, isPort, false, data, qrImgRef.current, photoImgRef.current, logoImgRef.current);
      }
    }

    const backCanvas = backCanvasRef.current;
    if (backCanvas) {
      backCanvas.width = W;
      backCanvas.height = H;
      const ctx = backCanvas.getContext('2d');
      if (ctx && activeTemplate) {
        activeTemplate.drawCard(ctx, W, H, isPort, true, data, qrImgRef.current, photoImgRef.current, logoImgRef.current);
      }
    }
  }, [cardDim, data, activeTemplate]);

  useEffect(() => {
    drawCanvases();
  }, [drawCanvases]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'logoUrl') => {
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
          <title>${data.fullName} - BridgeTec Studio (Dev Mode)</title>
          <style>
            body { margin: 0; background: #020617; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; box-sizing: border-box; }
            h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
            .badge { display: inline-block; background: #f59e0b; color: #000; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 999px; margin-bottom: 12px; }
            p { color: #94a3b8; font-size: 13px; margin-top: 0; margin-bottom: 24px; }
            .grid { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; max-width: 1200px; }
            .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 20px; padding: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center; }
            img { width: 100%; max-width: 480px; border-radius: 12px; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .label { font-size: 12px; font-weight: bold; color: #f59e0b; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="badge">DEVELOPMENT &amp; DESIGN LAB PREVIEW</div>
          <h1>${data.fullName} — ${data.companyName}</h1>
          <p>ISO Standard 300 DPI High-Resolution Card Export Preview</p>
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

      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_Card_300DPI_Dev.pdf`);
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
      pdf.text(`BridgeTec Card Studio [DEV MODE] — Front Sheet (${data.fullName})`, 14, 12);

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
      pdf.text(`BridgeTec Card Studio [DEV MODE] — Back Sheet (${data.fullName})`, 14, 12);

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          const mirroredCol = c === 0 ? 1 : 0;
          const x = marginX + mirroredCol * (cardW + spacingX);
          const y = marginY + r * (cardH + spacingY);
          pdf.addImage(bImg, 'PNG', x, y, cardW, cardH, undefined, 'FAST');
          pdf.rect(x, y, cardW, cardH);
        }
      }

      pdf.save(`${data.fullName.replace(/\s+/g, '_')}_A4_8Cards_Duplex_Dev.pdf`);
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
    a.download = `${data.fullName.replace(/\s+/g, '_')}_${side.toUpperCase()}_300DPI_Dev.png`;
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── DEVELOPMENT MODE NOTICE BANNER ───────────────────────────────────── */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-amber-500/20">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-amber-400 uppercase tracking-wide">Development &amp; Design Lab Mode</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">INTERNAL TESTING</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Card Studio is unlocked for local testing &amp; layout polishing. All real-time canvas rendering, hex editing, and PDF generators are fully functional.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenStudioWindow}
          className="self-start sm:self-auto py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Full Dev Studio</span>
        </button>
      </div>

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
                  Design Studio Lab • 300 DPI
                </span>
                <span className="text-xs font-bold text-slate-400">• Top Industry Layouts</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Business &amp; ID Card Studio (Design Lab)
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Testing sandbox for 3D luxury designs, corporate &amp; trade templates (Real Estate, Tech, Legal, Beauty, Barber, Construction) with scannable vCard QR codes.
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

      {/* ── MAIN STUDIO GRID ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE CANVASES PREVIEW (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Side Toggle & Dimension Pill */}
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
              {data.orientation === 'landscape' ? 'ISO Standard 85.6 × 54 mm (3.5" × 2")' : 'ISO Standard 54 × 85.6 mm (2" × 3.5")'}
            </div>
          </div>

          {/* Canvas Displays */}
          <div className="space-y-6">
            {(activeSide === 'both' || activeSide === 'front') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Eye className="w-3.5 h-3.5" />
                    FRONT SIDE (300 DPI)
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

        {/* RIGHT COLUMN: DESIGN TEMPLATE BROWSER & CUSTOMIZATION (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur space-y-6">
          {/* Sub-Tabs */}
          <div className="grid grid-cols-5 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'templates', label: 'Designs', icon: Sparkles },
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

              {/* Editable Hex Colors */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Accent Colors (Editable Hex)</label>
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

              {/* Style Category Filter Tabs */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Design Collections &amp; Industries</label>
                  <span className="text-[10px] text-slate-500 font-mono">{filteredTemplates.length} designs</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Designs' },
                    { id: '3d_luxury', label: '👑 3D & Luxury' },
                    { id: 'modern_tech', label: '⚡ Tech & AI' },
                    { id: 'corporate_legal', label: '⚖️ Corporate & Legal' },
                    { id: 'trades_construction', label: '🏗️ Trades & Industry' },
                    { id: 'lifestyle_beauty', label: '✨ Beauty & Spa' },
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
                  placeholder="Search styles (e.g. real estate, barber, 3d, cleaning)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
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
