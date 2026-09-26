'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CreditCard,
  Sparkles,
  RotateCw,
  Eye,
  ShieldCheck,
  Wand2,
  Gift,
  FileCheck,
  Search,
  Music,
  FileText,
  QrCode,
  Lock,
  ArrowRight,
  ExternalLink,
  Cpu,
  Fingerprint,
  Crown,
  Palette,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { BRAND_AVATAR_TRANSPARENT_SRC } from '@/lib/brand';

export interface DigitalToolsHeaderProps {
  onSelectTool: (toolId: string) => void;
  activeToolId?: string | null;
}

// ── 4 DISTINCT 3D ID CARD DESIGNS ──────────────────────────────────────────────
interface CardDesign {
  id: string;
  name: string;
  badge: string;
  category: string;
  icon: React.ReactNode;
  themeColor: string;
  accentGradient: string;
  cardBackground: string;
  borderStyle: string;
  orgName: string;
  orgSub: string;
  avatarUrl: string;
  avatarFallback: string;
  personName: string;
  personRole: string;
  staffId: string;
  dept: string;
  clearance: string;
  expiry: string;
  hologramType: 'gold' | 'cyan' | 'vip' | 'sunset';
  barcodeNum: string;
  backNotes: string;
}

const CARD_DESIGNS: CardDesign[] = [
  {
    id: 'corporate',
    name: 'Corporate Executive ID',
    badge: 'Official Staff',
    category: 'Enterprise',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    themeColor: '#eab308', // amber-500
    accentGradient: 'from-blue-600 via-indigo-600 to-amber-500',
    cardBackground: 'linear-gradient(145deg, #040e40 0%, #0a1b5c 50%, #020720 100%)',
    borderStyle: 'border-amber-400/40 shadow-amber-500/20',
    orgName: 'BRIDGETECH IT SERVICES',
    orgSub: 'TECHNOLOGY & INNOVATION DIVISION',
    avatarUrl: '/assets/avatars/3d-cards/corporate-cto.jpg',
    avatarFallback: 'MK',
    personName: 'DR. MOHAMED S. KAMARA',
    personRole: 'CHIEF TECHNOLOGY OFFICER',
    staffId: 'BT-8842-EXEC',
    dept: 'INFRASTRUCTURE & ARCHITECTURE',
    clearance: 'LEVEL 5 • UNRESTRICTED ACCESS',
    expiry: 'DEC 2028',
    hologramType: 'gold',
    barcodeNum: '98402-4882-9901',
    backNotes: 'Property of BridgeTech IT Services. If found, return to #1 Regent Highway, Jui Junction, Freetown, Sierra Leone.',
  },
  {
    id: 'cyber',
    name: 'Cyber & Forensics Pass',
    badge: 'Security Agent',
    category: 'Forensics',
    icon: <Fingerprint className="w-3.5 h-3.5" />,
    themeColor: '#06b6d4', // cyan-500
    accentGradient: 'from-cyan-500 via-teal-500 to-emerald-400',
    cardBackground: 'linear-gradient(145deg, #03171b 0%, #08282c 45%, #020b0d 100%)',
    borderStyle: 'border-cyan-400/40 shadow-cyan-500/20',
    orgName: 'DIGITAL FORENSICS DIVISION',
    orgSub: 'CYBER INTELLIGENCE & INCIDENT RESPONSE',
    avatarUrl: '/assets/avatars/3d-cards/cyber-agent.jpg',
    avatarFallback: 'SK',
    personName: 'SARAH M. KABIA',
    personRole: 'LEAD FORENSIC & DEEPFAKE ANALYST',
    staffId: 'DF-9012-CYBER',
    dept: 'MEDIA AUTHENTICATION LAB',
    clearance: 'CRITICAL SECURITY CLEARANCE',
    expiry: 'NOV 2027',
    hologramType: 'cyan',
    barcodeNum: '77219-5014-8832',
    backNotes: 'Authorized forensic credential. Strictly non-transferable. Subject to national digital security protocol.',
  },
  {
    id: 'vip',
    name: 'VIP Platinum Access',
    badge: 'Executive VIP',
    category: 'Luxury Pass',
    icon: <Crown className="w-3.5 h-3.5" />,
    themeColor: '#f59e0b', // amber-500
    accentGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    cardBackground: 'linear-gradient(145deg, #111113 0%, #1f1f24 50%, #0a0a0c 100%)',
    borderStyle: 'border-yellow-500/50 shadow-yellow-500/20',
    orgName: 'BRIDGETECH EXECUTIVE LOUNGE',
    orgSub: 'VIP CONCIERGE & PRIORITY SERVICES',
    avatarUrl: '/assets/avatars/3d-cards/vip-executive.jpg',
    avatarFallback: 'AC',
    personName: 'ALEXANDER E. COLE',
    personRole: 'MANAGING PARTNER & FOUNDER',
    staffId: 'VIP-0017-PLAT',
    dept: 'STRATEGIC CLIENT RELATIONS',
    clearance: 'ALL-ACCESS VIP PRIVILEGES',
    expiry: 'OCT 2029',
    hologramType: 'vip',
    barcodeNum: '10044-8812-4491',
    backNotes: 'Confers expedited service, 24/7 dedicated support, and unlimited digital workshop consultations.',
  },
  {
    id: 'creative',
    name: 'Creative Studio Pass',
    badge: 'Design Lead',
    category: 'Studio',
    icon: <Palette className="w-3.5 h-3.5" />,
    themeColor: '#ec4899', // pink-500
    accentGradient: 'from-purple-500 via-rose-500 to-amber-400',
    cardBackground: 'linear-gradient(145deg, #20082c 0%, #350f4a 45%, #0f0316 100%)',
    borderStyle: 'border-rose-400/40 shadow-rose-500/20',
    orgName: 'BRIDGETECH CREATIVE LABS',
    orgSub: 'UI/UX & MULTIMEDIA INNOVATION',
    avatarUrl: '/assets/avatars/3d-cards/creative-lead.jpg',
    avatarFallback: 'MC',
    personName: 'MARIAM J. CONTEH',
    personRole: 'PRINCIPAL UI/UX ARCHITECT',
    staffId: 'UX-4401-STUDIO',
    dept: '3D GRAPHICS & PRODUCT LAB',
    clearance: 'STUDIO MASTER ACCESS',
    expiry: 'JUN 2028',
    hologramType: 'sunset',
    barcodeNum: '55381-6629-1104',
    backNotes: 'Official creative media credential. Scannable portfolio vCard enabled on reverse side.',
  },
];

// Featured tools shown in the header showcase
const FEATURED_TOOLS = [
  {
    id: 'card-studio',
    title: '3D Card & ID Studio',
    tag: '300 DPI Print',
    desc: 'Executive business cards & staff ID badges with live 3D preview, Guilloche security & print PDF.',
    icon: <CreditCard className="w-4 h-4" />,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'group-hover:border-amber-500/50',
  },
  {
    id: 'surprise-reveal',
    title: 'Surprise Reveal Studio',
    tag: 'Celebration FX',
    desc: 'Interactive viral unlock questionnaire with crowd cheers, audio effects & printable awards.',
    icon: <Gift className="w-4 h-4" />,
    gradient: 'from-rose-500 to-amber-500',
    glow: 'group-hover:border-rose-500/50',
  },
  {
    id: 'bg-remover',
    title: 'AI Background Remover',
    tag: '1-Click Cutout',
    desc: 'High-accuracy neural network background erasure with feathering and studio color backdrops.',
    icon: <Wand2 className="w-4 h-4" />,
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'group-hover:border-cyan-500/50',
  },
  {
    id: 'forensics',
    title: 'AI Forensic & Deepfake',
    tag: 'EXIF & ELA',
    desc: 'Error level analysis, generative AI pattern detection, camera EXIF tags & GPS verification.',
    icon: <Fingerprint className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'group-hover:border-emerald-500/50',
  },
  {
    id: 'audio-converter',
    title: 'Video & Audio to MP3',
    tag: '320kbps Audio',
    desc: 'Extract sound from video or convert audio formats to high-bitrate studio quality MP3.',
    icon: <Music className="w-4 h-4" />,
    gradient: 'from-red-500 to-rose-600',
    glow: 'group-hover:border-red-500/50',
  },
  {
    id: 'doc-converter',
    title: 'DOCX to PDF Engine',
    tag: 'Clean Vectors',
    desc: 'Transform Word documents and rich text into standard, print-ready duplex PDF files.',
    icon: <FileText className="w-4 h-4" />,
    gradient: 'from-purple-500 to-indigo-600',
    glow: 'group-hover:border-purple-500/50',
  },
];

export default function DigitalToolsHeader({ onSelectTool, activeToolId }: DigitalToolsHeaderProps) {
  const [selectedDesignIndex, setSelectedDesignIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt tracking state
  const [tilt, setTilt] = useState({ x: 6, y: -10 });
  const [glare, setGlare] = useState({ x: 50, y: 30, opacity: 0.25 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentDesign = CARD_DESIGNS[selectedDesignIndex];

  // Mouse move 3D tilt calculation
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tilt angle range: -18 to +18 deg
    const rotateY = ((x - centerX) / centerX) * 16;
    const rotateX = -((y - centerY) / centerY) * 16;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.45,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Smoothly return to gentle resting perspective
    setTilt({ x: 6, y: -10 });
    setGlare({ x: 50, y: 30, opacity: 0.2 });
  }, []);

  // Cycle designs automatically every 6 seconds if not hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setSelectedDesignIndex((prev) => (prev + 1) % CARD_DESIGNS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <section className="relative overflow-hidden pt-2 pb-12 sm:pb-16 border-b border-slate-800/80">
      {/* Dynamic ambient backdrop illumination */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[480px] h-[480px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Top micro-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-slate-800/60 text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-semibold tracking-wide transition-colors group"
        >
          <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[11px] group-hover:-translate-x-0.5 transition-transform">
            ←
          </span>
          <span>Return to BridgeTech Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            300 DPI Executive Print Engine
          </span>
          <span className="hidden sm:inline-flex px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold rounded-full items-center gap-1.5">
            <Zap className="w-3 h-3" />
            100% Client-Side Private
          </span>
        </div>
      </div>

      {/* Main 2-Column Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Hero Typography & Suite Feature Showcase */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Main Title Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-full text-xs font-bold text-slate-300 shadow-xl backdrop-blur">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-orange-400">
              Interactive 3D ID Card Studio &amp; Digital Suite
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-white leading-[1.12]">
            Next-Gen 3D Cards &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
              Free Digital Toolkit
            </span>
          </h1>

          <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed max-w-2xl">
            Design executive <strong>300 DPI business cards</strong>, high-security <strong>staff ID badges</strong>, and VIP passes with instant live 3D preview. Plus, access our complete suite of <strong>AI background removers</strong>, deepfake forensic detectors, media converters, and utilities with zero limits.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => onSelectTool('card-studio')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Launch 3D Card Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('tools-directory-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all hover:border-slate-600"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Explore All 13+ Free Tools</span>
            </button>
          </div>

          {/* Featured Tools Quick-Access Carousel / Grid */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Featured Creative &amp; Media Tools
              </span>
              <span className="text-[10px] text-slate-500">Click to open instantly</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {FEATURED_TOOLS.map((tool) => {
                const isActive = activeToolId === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className={`group text-left p-2.5 rounded-xl border transition-all relative overflow-hidden ${
                      isActive
                        ? 'bg-slate-900 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs bg-gradient-to-tr ${tool.gradient} shadow-sm`}>
                        {tool.icon}
                      </span>
                      <span className="text-[10px] font-black text-slate-300 truncate group-hover:text-white">
                        {tool.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-amber-400/90 block truncate pl-0.5">
                      {tool.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Animated 3D ID Card Stage */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          {/* 3D Stage Container */}
          <div
            className="relative w-full max-w-[260px] sm:max-w-[280px] flex flex-col items-center select-none"
            style={{ perspective: '1200px' }}
          >
            {/* Lanyard Top Attachment Simulation */}
            <div className="relative z-20 flex flex-col items-center mb-[-12px]">
              {/* Lanyard Strap Strip */}
              <div className="w-10 h-10 bg-gradient-to-b from-blue-900 via-indigo-800 to-slate-900 rounded-t-md shadow-md flex items-center justify-center border-x border-t border-slate-700">
                <span className="text-[8px] font-black text-amber-400 tracking-tighter uppercase rotate-90">
                  BRIDGETECH
                </span>
              </div>
              {/* Metallic Clip */}
              <div className="w-12 h-3.5 bg-gradient-to-r from-slate-400 via-slate-100 to-slate-400 rounded-sm shadow-lg border border-slate-500 relative flex items-center justify-center">
                <div className="w-2.5 h-1.5 bg-slate-800 rounded-full" />
              </div>
              {/* Card Slot Punch */}
              <div className="w-9 h-2 bg-slate-950/80 rounded-full border border-slate-700/60 mt-1 shadow-inner" />
            </div>

            {/* The 3D Interactive Card Object */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative w-[220px] sm:w-[240px] h-[330px] sm:h-[350px] rounded-3xl cursor-grab active:cursor-grabbing transition-transform duration-200 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y + 180}deg) scale(1.02)`
                  : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`,
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              {/* Ambient 3D Dynamic Drop Shadow */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-300"
                style={{
                  boxShadow: `0 ${20 + Math.abs(tilt.x) * 2}px ${40 + Math.abs(tilt.y) * 2}px -10px rgba(0,0,0,0.8), 0 0 35px ${currentDesign.themeColor}33`,
                }}
              />

              {/* ── CARD FRONT FACE ── */}
              <div
                className={`absolute inset-0 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden border ${currentDesign.borderStyle}`}
                style={{
                  background: currentDesign.cardBackground,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Guilloche / Security Wave Background Overlay */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 30%, ${currentDesign.themeColor} 0%, transparent 40%), repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 4px, rgba(255,255,255,0.06) 5px, transparent 6px)`,
                  }}
                />

                {/* Dynamic Holographic Specular Glare */}
                <div
                  className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}), transparent 70%)`,
                  }}
                />

                {/* Front Top: Organization Header & Microchip */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 p-1 backdrop-blur border border-white/20 flex items-center justify-center">
                        <Image
                          src={BRAND_AVATAR_TRANSPARENT_SRC}
                          alt="BridgeTech"
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-white tracking-wider leading-none">
                          {currentDesign.orgName}
                        </h4>
                        <p className="text-[8px] font-semibold text-slate-400 tracking-tight mt-0.5">
                          {currentDesign.orgSub}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-white/10 text-white border border-white/20">
                      {currentDesign.badge}
                    </span>
                  </div>

                  {/* Golden Smart Card Contact Chip & NFC Waves */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200/80 shadow-inner flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-yellow-800/40" />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-yellow-800/40" />
                      <div className="w-5 h-4 border border-yellow-800/40 rounded-sm" />
                    </div>

                    {/* Hologram Stamp */}
                    <div className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-400/20 via-pink-400/20 to-cyan-400/20 border border-white/30 backdrop-blur text-[8px] font-extrabold text-white flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>300 DPI VERIFIED</span>
                    </div>
                  </div>
                </div>

                {/* Front Middle: Avatar Photo & Personal Credentials */}
                <div className="relative z-10 flex items-center gap-4 py-3">
                  {/* Photo Frame with Security Rim */}
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0 bg-slate-900">
                    <Image
                      src={currentDesign.avatarUrl}
                      alt={currentDesign.personName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent py-0.5 text-center">
                      <span className="text-[8px] font-black text-emerald-400 tracking-tighter">
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      Holder Name:
                    </span>
                    <h3 className="text-sm font-black text-white leading-tight truncate">
                      {currentDesign.personName}
                    </h3>
                    <p className="text-[10px] font-extrabold text-amber-400 leading-snug line-clamp-2">
                      {currentDesign.personRole}
                    </p>
                    <div className="pt-1 text-[8px] font-mono text-slate-400 space-y-0.5">
                      <p>ID: <span className="text-white font-bold">{currentDesign.staffId}</span></p>
                      <p>DEPT: <span className="text-slate-300">{currentDesign.dept}</span></p>
                    </div>
                  </div>
                </div>

                {/* Front Bottom: Security Clearance & Barcode / QR */}
                <div className="relative z-10 pt-2 border-t border-white/15 flex items-end justify-between">
                  <div>
                    <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      SECURITY CLEARANCE
                    </span>
                    <span className="text-[9px] font-black text-white tracking-wider">
                      {currentDesign.clearance}
                    </span>
                    <p className="text-[8px] font-mono text-slate-400 mt-0.5">
                      EXP: <span className="text-amber-300 font-bold">{currentDesign.expiry}</span>
                    </p>
                  </div>

                  {/* High Density QR / Barcode */}
                  <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-md flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-950" />
                  </div>
                </div>
              </div>

              {/* ── CARD BACK FACE ── */}
              <div
                className={`absolute inset-0 rounded-3xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden border ${currentDesign.borderStyle}`}
                style={{
                  background: currentDesign.cardBackground,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Magnetic Stripe on Back */}
                <div className="space-y-4">
                  <div className="w-[calc(100%+3rem)] -mx-6 h-10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-slate-700 shadow-inner flex items-center px-4">
                    <div className="w-full h-2 bg-gradient-to-r from-amber-500/30 via-yellow-400/50 to-amber-500/30" />
                  </div>

                  {/* Signature Panel */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                      <span>AUTHORIZED SIGNATURE</span>
                      <span>NOT VALID UNLESS SIGNED</span>
                    </div>
                    <div className="w-full h-8 bg-slate-100 rounded-md p-1.5 flex items-center justify-between border border-slate-300">
                      <span className="font-serif italic text-xs text-slate-800 font-bold tracking-wider">
                        {currentDesign.personName.split(' ')[1] || 'Authorized'}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-600">
                        CCV 941
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back Middle: Legal / Operational Terms */}
                <div className="space-y-2 py-2 text-[8px] text-slate-300/80 leading-relaxed">
                  <p>{currentDesign.backNotes}</p>
                  <p className="text-[7px] text-slate-400">
                    Emergency Contact: +232 33 399 391 • support@itservicesfreetown.com
                  </p>
                </div>

                {/* Back Bottom: Scannable 1D Barcode Pattern */}
                <div className="space-y-1 pt-2 border-t border-white/15 text-center">
                  {/* Simulated Code 128 Barcode */}
                  <div className="h-9 w-full bg-white rounded-md p-1 flex items-center justify-center gap-0.5 overflow-hidden">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full bg-black ${
                          i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] font-bold tracking-widest text-slate-300">
                    {currentDesign.barcodeNum}
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Card Interactive Controls */}
            <div className="w-full mt-6 space-y-3">
              {/* Flip Button & Interactive Prompt */}
              <div className="flex items-center justify-between gap-2 px-1">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Flip Card ({isFlipped ? 'Show Front' : 'Show Back'})</span>
                </button>

                <button
                  onClick={() => onSelectTool('card-studio')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customize in 3D Studio</span>
                </button>
              </div>

              {/* Design Switcher Pills */}
              <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
                {CARD_DESIGNS.map((design, idx) => {
                  const isSelected = selectedDesignIndex === idx;
                  return (
                    <button
                      key={design.id}
                      onClick={() => {
                        setSelectedDesignIndex(idx);
                        setIsFlipped(false);
                      }}
                      className={`py-2 px-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-b from-slate-800 to-slate-950 text-white border border-amber-400/50 shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={isSelected ? 'text-amber-400 scale-110' : 'text-slate-400'}>
                        {design.icon}
                      </span>
                      <span className="truncate max-w-[64px]">{design.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
