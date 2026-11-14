'use client';

import Link from 'next/link';
import { TRADE_CATEGORIES } from '@/lib/on-demand-categories';
import { 
  Printer, 
  Share2, 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Wallet, 
  ExternalLink 
} from 'lucide-react';

const CLUSTERS = [
  {
    title: 'Digital & IT Hardware',
    tag: 'Tech Cluster',
    icon: 'fas fa-microchip',
    color: 'border-blue-500/40 bg-blue-500/5 text-blue-400',
    headerBg: 'bg-blue-600',
    roles: [
      { id: 'printer-tech', title: 'Printer & Copier Tech', desc: 'HP, Canon, Epson, Ricoh — paper jams, printheads, errors' },
      { id: 'pc-laptop', title: 'Computer & Laptop Tech', desc: 'Motherboards, screens, charging ports & OS installs' },
      { id: 'phone-tablet', title: 'Smartphone & Tablet Tech', desc: 'Screen replacements, battery swaps & flex ribbon fixes' },
      { id: 'gaming-console', title: 'Gaming Console Tech', desc: 'PS4, PS5, Xbox HDMI ports, power supply & thermal rework' },
      { id: 'cctv-security', title: 'CCTV & Security Tech', desc: 'Analog/IP cameras, DVR/NVR setup & mobile live feeds' },
      { id: 'networking-wifi', title: 'WiFi & Network Engineer', desc: 'Router config, office LAN trunking & signal boosters' },
    ],
  },
  {
    title: 'Electrical & Clean Energy',
    tag: 'Power Cluster',
    icon: 'fas fa-bolt',
    color: 'border-amber-500/40 bg-amber-500/5 text-amber-400',
    headerBg: 'bg-amber-600',
    roles: [
      { id: 'electrician', title: 'Certified Electrician', desc: 'NPA/EDSA wiring, distribution boards & changeover switches' },
      { id: 'solar-inverter', title: 'Solar & Inverter Tech', desc: 'Hybrid inverters, lithium battery banks & roof mounting' },
      { id: 'generator-mechanic', title: 'Generator Mechanic', desc: 'Diesel & petrol engines, AVR calibration & major servicing' },
      { id: 'audio-visual', title: 'Audio-Visual Tech', desc: 'TV mounting up to 85", PA systems & church sound mixers' },
      { id: 'satellite-dstv', title: 'Satellite & DSTV Installer', desc: 'Dish signal alignment, LNB swaps & multi-room cabling' },
    ],
  },
  {
    title: 'Plumbing, Cooling & Appliances',
    tag: 'Mechanical Cluster',
    icon: 'fas fa-wrench',
    color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400',
    headerBg: 'bg-emerald-600',
    roles: [
      { id: 'plumber', title: 'Master Plumber', desc: 'PPR hot-fusion welding, Geepee tanks & bathroom fittings' },
      { id: 'ac-refrigeration', title: 'AC & Fridge Engineer', desc: 'Gas recharge (R410A/R32), compressor swap & deep washing' },
      { id: 'water-pump-borehole', title: 'Borehole & Pump Specialist', desc: 'Submersible & surface pressure pumps, control boxes' },
      { id: 'appliance-repair', title: 'Home Appliance Tech', desc: 'Washing machine PCBs, microwaves & electric ovens' },
      { id: 'auto-electrician', title: 'Auto-Electrician & OBD', desc: 'Computer vehicle diagnostics, alternators & starters' },
    ],
  },
  {
    title: 'Construction, Metal & Finishing',
    tag: 'Trades Cluster',
    icon: 'fas fa-hammer',
    color: 'border-rose-500/40 bg-rose-500/5 text-rose-400',
    headerBg: 'bg-rose-600',
    roles: [
      { id: 'welder-metal', title: 'Welder & Metal Fabricator', desc: 'Burglar bars, security gates, iron doors & metal trusses' },
      { id: 'carpenter', title: 'Carpenter & Joiner', desc: 'Kitchen cabinets, roofing timber, doors & locks' },
      { id: 'mason-builder', title: 'Mason, Tiler & Builder', desc: 'Porcelain/ceramic tiling, concrete screed & plastering' },
      { id: 'painter', title: 'Professional Painter', desc: 'Putty screeding, interior/exterior coating & clean finishing' },
    ],
  },
];

export default function CareerAdvertFlyerPage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const shareText = encodeURIComponent(
    `🔥 NOW HIRING IN FREETOWN: 20 Specialized Technician & Artisan Roles! Keep 85% of job billings + weekly mobile money payouts. View flyer and apply online here: https://www.itservicesfreetown.com/careers`
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-600 selection:text-white print:bg-white print:text-black">
      
      {/* Top Action Bar (Hidden when Printing) */}
      <nav className="print:hidden sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Job Application Portal</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-all shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-red-400" />
              <span>Print / Save PDF</span>
            </button>

            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share on WhatsApp</span>
              <span className="sm:hidden">Share</span>
            </a>

            <Link
              href="/careers#apply"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-black text-white transition-all shadow-md"
            >
              <span>Apply Online &rarr;</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* FLYER CONTAINER (Formatted for Clean A4 / Web Display) */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-full">
        
        <div className="bg-slate-900 border-2 border-slate-800 print:border-none rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden print:bg-white print:text-black">
          
          {/* Subtle Ambient Glows */}
          <div className="print:hidden absolute -top-24 -left-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="print:hidden absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* FLYER HEADER */}
          <header className="relative border-b-2 border-slate-800 pb-6 print:border-black space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  BT
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-wider text-white print:text-black">
                    BridgeTech IT Services · On-Demand Network
                  </h1>
                  <p className="text-[11px] text-slate-400 print:text-gray-600 font-medium">
                    Freetown, Sierra Leone · Reg. Nationwide Tech &amp; Artisan Hub
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 print:text-red-700 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mass Recruitment Drive 2026</span>
              </div>
            </div>

            {/* Big Catchy Title */}
            <div className="pt-2">
              <h2 className="text-3xl sm:text-5xl font-black text-white print:text-black tracking-tight uppercase leading-none">
                We Are Hiring: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-400 print:text-red-600">20 Specialized Roles</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 print:text-gray-700 mt-2 font-medium max-w-3xl leading-relaxed">
                Calling all vetted technicians, engineers, mechanics, and master artisans in Freetown! Partner with BridgeTech to receive verified, guaranteed daily call-outs in your neighborhood.
              </p>
            </div>

            {/* 4 Key Benefit Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 print:border-gray-300 print:bg-gray-50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white print:text-black">Keep 85% Pay</div>
                  <div className="text-[10px] text-slate-400 print:text-gray-600">Highest Net in SL</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 print:border-gray-300 print:bg-gray-50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white print:text-black">Weekly Cashout</div>
                  <div className="text-[10px] text-slate-400 print:text-gray-600">Orange / Afrimoney</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 print:border-gray-300 print:bg-gray-50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white print:text-black">14-Day Warranty</div>
                  <div className="text-[10px] text-slate-400 print:text-gray-600">Backed by BridgeTech</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 print:border-gray-300 print:bg-gray-50 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white print:text-black">Local Call-Outs</div>
                  <div className="text-[10px] text-slate-400 print:text-gray-600">Across Freetown</div>
                </div>
              </div>
            </div>

          </header>

          {/* THE 20 JOBS LIST (4 CLUSTERS) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 print:text-gray-600">
                Official Directory of 20 Open Positions
              </h3>
              <span className="text-xs font-bold text-red-400 print:text-red-600">
                Immediate Openings Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2">
              {CLUSTERS.map((cluster, cIdx) => (
                <div
                  key={cluster.title}
                  className={`rounded-2xl border p-4 sm:p-5 space-y-3.5 ${cluster.color} print:border-gray-400 print:bg-white`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${cluster.headerBg} text-white flex items-center justify-center text-xs shadow`}>
                        <i className={cluster.icon} />
                      </div>
                      <h4 className="font-black text-sm text-white print:text-black">
                        {cluster.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 print:bg-gray-100 text-slate-300 print:text-gray-700">
                      {cluster.tag}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {cluster.roles.map((r, rIdx) => (
                      <div key={r.id} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5 print:text-red-700" />
                        <div>
                          <strong className="text-slate-100 print:text-black font-bold block">
                            {r.title}
                          </strong>
                          <span className="text-[11px] text-slate-400 print:text-gray-600 leading-snug block">
                            {r.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CANDIDATE REQUIREMENTS & QUALIFICATIONS */}
          <section className="bg-slate-950/70 border border-slate-800 print:border-gray-300 print:bg-gray-50 rounded-2xl p-5 sm:p-6 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 print:text-amber-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Who Can Apply? (Minimum Requirements)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 print:text-gray-700">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 print:bg-gray-200 text-white print:text-black font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span><strong>Hands-On Experience:</strong> Minimum 1 year practical field experience in your selected trade.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 print:bg-gray-200 text-white print:text-black font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span><strong>Tools of the Trade:</strong> Must own or have access to standard professional tools required for the job.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 print:bg-gray-200 text-white print:text-black font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span><strong>Valid Identification:</strong> National ID Card, Voter ID, Driver License or Passport required for vetting.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 print:bg-gray-200 text-white print:text-black font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <span><strong>Smartphone &amp; Mobile Money:</strong> Active WhatsApp number and Orange Money / Afrimoney account for weekly payouts.</span>
              </div>
            </div>
          </section>

          {/* CALL TO ACTION & CONTACT FOOTER */}
          <footer className="border-t-2 border-slate-800 pt-6 print:border-black flex flex-col sm:flex-row items-center justify-between gap-6">
            
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="text-xs font-black uppercase tracking-wider text-red-400 print:text-red-700">
                How to Apply: (2 Quick Options)
              </div>
              <div className="text-sm font-bold text-white print:text-black">
                Apply online through our portal or send your details directly via WhatsApp.
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Walk-in Desk: 24 Rawdon Street / Wilkinson Road, Freetown, Sierra Leone
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
              <a
                href="https://wa.me/23233399391?text=Hello%20BridgeTech%20Recruitment%2C%20I%20am%20applying%20for%20a%20technician%20role%20on%20the%20On-Demand%20Network."
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg flex items-center gap-2"
              >
                <i className="fab fa-whatsapp text-sm" />
                <span>Fast WhatsApp Apply</span>
              </a>

              <Link
                href="/careers#apply"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black transition-all shadow-xl flex items-center gap-1.5"
              >
                <span>Open Application Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Print Footer Details */}
            <div className="hidden print:block text-right text-xs text-gray-700">
              <p><strong>Website:</strong> www.itservicesfreetown.com/careers</p>
              <p><strong>Recruitment WhatsApp:</strong> +232 33 399391</p>
              <p><strong>Email:</strong> careers@itservicesfreetown.com</p>
            </div>

          </footer>

        </div>

      </main>

    </div>
  );
}
