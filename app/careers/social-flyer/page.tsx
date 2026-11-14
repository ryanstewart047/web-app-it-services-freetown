'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Copy, 
  Check, 
  ArrowLeft, 
  Share2, 
  Printer, 
  Smartphone, 
  Image as LucideImage, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  Clock, 
  Phone, 
  MapPin, 
  ExternalLink 
} from 'lucide-react';
import html2canvas from 'html2canvas';

const ROLES_BY_CLUSTER = [
  {
    category: 'Digital & IT Hardware Specialists',
    badge: 'IT & Electronics',
    color: 'from-blue-600 to-indigo-700',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50/50',
    textColor: 'text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800',
    roles: [
      { id: 'printer-tech', title: 'Printer & Copier Techs', desc: 'HP, Canon, Epson, Ricoh repair' },
      { id: 'pc-laptop', title: 'Computer & Laptop Techs', desc: 'Screens, motherboards, OS installs' },
      { id: 'phone-tablet', title: 'Smartphone & Tablet Techs', desc: 'iPhone, Samsung, Tecno, Infinix' },
      { id: 'gaming-console', title: 'Gaming Console Techs', desc: 'PS4, PS5, Xbox HDMI & thermal' },
      { id: 'cctv-security', title: 'CCTV & Security Techs', desc: 'IP cameras, DVR/NVR, live feeds' },
      { id: 'networking-wifi', title: 'WiFi & Network Engineers', desc: 'Routers, office LAN & boosters' },
    ],
  },
  {
    category: 'Electrical & Clean Energy',
    badge: 'Power & Energy',
    color: 'from-amber-600 to-yellow-600',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/50',
    textColor: 'text-amber-950',
    badgeColor: 'bg-amber-100 text-amber-800',
    roles: [
      { id: 'electrician', title: 'Certified Electricians', desc: 'House wiring, panels & changeovers' },
      { id: 'solar-inverter', title: 'Solar & Inverter Techs', desc: 'Hybrid inverters & battery banks' },
      { id: 'generator-mechanic', title: 'Generator Mechanics', desc: 'Diesel/petrol servicing & AVR' },
      { id: 'audio-visual', title: 'Audio-Visual Techs', desc: 'TV mounting & church PA systems' },
      { id: 'satellite-dstv', title: 'Satellite & DSTV Installers', desc: 'Dish alignment & signal tracking' },
    ],
  },
  {
    category: 'Plumbing, Cooling & Appliances',
    badge: 'Mechanical & Cooling',
    color: 'from-cyan-600 to-teal-700',
    borderColor: 'border-cyan-200',
    bgColor: 'bg-cyan-50/50',
    textColor: 'text-cyan-950',
    badgeColor: 'bg-cyan-100 text-cyan-800',
    roles: [
      { id: 'plumber', title: 'Plumbers & Pipe Fitters', desc: 'PPR pipe welding & Geepee tanks' },
      { id: 'ac-refrigeration', title: 'AC & Fridge Techs', desc: 'Gas recharge & compressor swap' },
      { id: 'water-pump-borehole', title: 'Borehole & Pump Specialists', desc: 'Submersible pumps & control boxes' },
      { id: 'appliance-repair', title: 'Home Appliance Techs', desc: 'Washing machines & microwaves' },
      { id: 'auto-electrician', title: 'Auto-Electricians & OBD', desc: 'Computer scanning & starters' },
    ],
  },
  {
    category: 'Construction, Metal & Finishing',
    badge: 'Trades & Finishing',
    color: 'from-stone-700 to-slate-800',
    borderColor: 'border-stone-200',
    bgColor: 'bg-stone-50/50',
    textColor: 'text-stone-950',
    badgeColor: 'bg-stone-100 text-stone-800',
    roles: [
      { id: 'welder-metal', title: 'Welders & Metal Workers', desc: 'Burglar bars, gates & iron trusses' },
      { id: 'carpenter', title: 'Carpenters & Woodworkers', desc: 'Roofing, cabinets, doors & locks' },
      { id: 'mason-builder', title: 'Masons, Tilers & Builders', desc: 'Tile laying, plastering & brickwork' },
      { id: 'painter', title: 'Professional Painters', desc: 'Interior/exterior weatherproofing' },
    ],
  },
];

export default function SocialFlyerStudioPage() {
  const [activeFormat, setActiveFormat] = useState<'square' | 'story' | 'ai-graphic'>('square');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const flyerRef = useRef<HTMLDivElement>(null);

  // Social Caption for WhatsApp & Facebook
  const socialCaptionText = `🚨 WE ARE HIRING IN FREETOWN! 🇸🇱
BridgeTech is recruiting qualified technicians and certified trade artisans for daily residential & commercial call-out jobs across Freetown!

💼 20 SPECIALIZED ROLES OPEN NOW:
1️⃣ Digital & IT Hardware:
• Printer & Copier Technicians
• Computer & Laptop Technicians
• Smartphone & Tablet Technicians
• Gaming Console Technicians
• CCTV & Security Technicians
• WiFi & Network Engineers

2️⃣ Electrical & Clean Energy:
• Certified Electricians
• Solar & Inverter Specialists
• Generator Mechanics (Diesel/Petrol)
• Audio-Visual & TV Mounting Techs
• Satellite & DSTV Installers

3️⃣ Plumbing, Cooling & Appliances:
• Plumbers & Pipe Fitters
• AC & Refrigeration Engineers
• Borehole & Water Pump Specialists
• Home Appliance Technicians
• Auto-Electricians & OBD Diagnostics

4️⃣ Construction, Metal & Finishing:
• Welders & Metal Fabricators
• Carpenters & Woodworkers
• Masons, Tilers & Builders
• Professional Painters

✨ WHY JOIN BRIDGETECH?
✅ Keep 85% Take-Home Pay (15% standard platform commission)
✅ Weekly Mobile Money Payouts (Orange Money & Afrimoney)
✅ Daily Jobs Dispatched in your Freetown Neighborhood
✅ 100% Free Application — No Registration Fees!

📲 APPLY ONLINE NOW (Takes 2 Minutes):
👉 https://www.itservicesfreetown.com/careers/apply

💬 WHATSAPP RECRUITMENT HOTLINE:
📞 +232 33 399391`;

  // Download flyer as high-res PNG
  const handleDownloadPNG = async () => {
    if (activeFormat === 'ai-graphic') {
      const link = document.createElement('a');
      link.href = '/images/careers/bridgetech_recruitment_flyer.jpg';
      link.download = 'bridgetech-recruitment-flyer-square.jpg';
      link.click();
      return;
    }

    if (!flyerRef.current) return;
    setIsExporting(true);

    try {
      // Temporarily ensure high resolution capture
      const canvas = await html2canvas(flyerRef.current, {
        scale: 2.5, // Crisp 300DPI equivalent
        useCORS: true,
        logging: false,
        backgroundColor: '#090d1a',
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `bridgetech-jobs-flyer-${activeFormat}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to export flyer canvas:', err);
      alert('Could not download image. Please try taking a screenshot or use the AI Graphic format.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialCaptionText).then(() => {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/careers"
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Careers Portal</span>
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Social Media Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Social Media Recruitment Flyer
            </h1>
            <p className="text-xs text-slate-400">
              High-resolution, ready-to-share graphics designed for WhatsApp Status, Instagram, and Facebook.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyCaption}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
              title="Copy formatted WhatsApp/Facebook text post with all 20 jobs"
            >
              {copiedCaption ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Caption Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span>Copy Post Caption</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              type="button"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Generating PNG...' : 'Download Flyer (PNG)'}</span>
            </button>

            <Link
              href="/careers/flyer"
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-blue-400" />
              <span>A4 Printable</span>
            </Link>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFormat('square')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeFormat === 'square'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Square (1:1 · 1080×1080) — Instagram &amp; Facebook Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('story')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeFormat === 'story'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 rotate-90" />
            <span>Portrait Story (9:16 · 1080×1920) — WhatsApp Status &amp; Stories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormat('ai-graphic')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeFormat === 'ai-graphic'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Graphic Artwork (1024×1024) — High Impact Visual</span>
          </button>
        </div>

        {/* ── FLYER PREVIEW STAGE ── */}
        <div className="flex justify-center p-3 sm:p-6 bg-slate-900/60 border border-slate-800 rounded-3xl overflow-x-auto">
          
          {/* OPTION 1: AI Graphic Artwork Master */}
          {activeFormat === 'ai-graphic' ? (
            <div className="max-w-xl w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-4 text-center">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-slate-800 shadow-lg bg-black">
                <img
                  src="/images/careers/bridgetech_recruitment_flyer.jpg"
                  alt="BridgeTech Official Recruitment Flyer"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="/images/careers/bridgetech_recruitment_flyer.jpg"
                  download="bridgetech-recruitment-flyer.jpg"
                  className="flex-1 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Graphic (1024×1024 JPG)</span>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(socialCaptionText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            /* OPTION 2 & 3: Custom Rendered 20-Positions Social Flyer (Square 1:1 or Story 9:16) */
            <div
              ref={flyerRef}
              className={`bg-slate-950 text-white border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between select-none ${
                activeFormat === 'square'
                  ? 'w-[720px] max-w-full aspect-square p-6 sm:p-7'
                  : 'w-[520px] max-w-full aspect-[9/16] p-6 sm:p-7'
              }`}
              style={{
                background: 'linear-gradient(145deg, #070c1a 0%, #0d152a 50%, #070b18 100%)',
              }}
            >
              {/* Header Bar */}
              <div className="space-y-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[11px] font-black tracking-[0.25em] text-red-500 uppercase">
                      BridgeTech On-Demand Services · Freetown
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                    Sierra Leone 🇸🇱
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-none">
                      We Are Hiring!
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Now recruiting certified technicians &amp; trade artisans for daily call-out jobs.
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white uppercase tracking-wide inline-block shadow">
                      20 Specialized Roles
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Value Pillars Bar */}
              <div className="grid grid-cols-4 gap-2 py-2.5 my-1 border-b border-slate-800/80 text-center">
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-black text-emerald-400 leading-tight">Keep 85%</div>
                  <div className="text-[9px] text-slate-400 font-medium">Take-Home Pay</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-black text-blue-400 leading-tight">Weekly</div>
                  <div className="text-[9px] text-slate-400 font-medium">MoMo Payouts</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-black text-amber-400 leading-tight">Daily Jobs</div>
                  <div className="text-[9px] text-slate-400 font-medium">Freetown Wide</div>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-[11px] font-black text-purple-400 leading-tight">100% Free</div>
                  <div className="text-[9px] text-slate-400 font-medium">Zero Reg. Fee</div>
                </div>
              </div>

              {/* All 20 Roles Grid (Clean 2 or 4 Columns) */}
              <div className={`grid gap-2.5 my-auto ${activeFormat === 'square' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                {ROLES_BY_CLUSTER.map((cluster, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
                        <span className="text-[10px] font-black text-white truncate uppercase tracking-wide">
                          {cluster.category.split(' ')[0]}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${cluster.badgeColor}`}>
                          {cluster.roles.length} Roles
                        </span>
                      </div>

                      <div className="space-y-1">
                        {cluster.roles.map((role) => (
                          <div key={role.id} className="text-[10px] font-semibold text-slate-200 flex items-start gap-1 leading-tight">
                            <span className="text-red-500 font-bold shrink-0">•</span>
                            <span className="truncate">{role.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Call to Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 mt-1 space-y-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950/60 via-slate-900 to-red-950/60 border border-red-900/50 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">
                      Quick 2-Minute Application Online
                    </span>
                    <div className="text-xs sm:text-sm font-black text-white font-mono">
                      www.itservicesfreetown.com/careers
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Recruitment WhatsApp
                    </span>
                    <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                      +232 33 399391
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium px-1">
                  <span>Orange Money &amp; Afrimoney Direct Deposits</span>
                  <span>Western Area Urban &amp; Rural Call-Outs</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Ready to Paste Social Media Copy Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Pre-Formatted Social Media Caption</h3>
            </div>
            <button
              onClick={handleCopyCaption}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span>{copiedCaption ? 'Copied to Clipboard!' : 'Copy Caption'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {socialCaptionText}
          </div>
          <p className="text-[11px] text-slate-500">
            Tip: Download the flyer image above and paste this pre-formatted caption directly into WhatsApp Status, WhatsApp groups, Facebook, or Instagram!
          </p>
        </div>

      </div>
    </div>
  );
}
