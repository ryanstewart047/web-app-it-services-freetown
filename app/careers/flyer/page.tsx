'use client';

import Link from 'next/link';
import { 
  Printer, 
  Share2, 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Wallet, 
  Award,
  ExternalLink 
} from 'lucide-react';

const CLUSTERS = [
  {
    title: 'Digital & IT Hardware Specialists',
    tag: 'Tech Cluster',
    icon: 'fas fa-microchip',
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
    roles: [
      { id: 'electrician', title: 'Certified Electrician', desc: 'EDSA wiring, distribution boards & changeover switches' },
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
    `NOW HIRING IN FREETOWN: 20 Specialized Technician & Artisan Roles with BridgeTech! Keep 85% of job billings + weekly mobile money payouts. View flyer and apply online here: https://www.itservicesfreetown.com/careers`
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans print:bg-white print:text-black">
      
      {/* Top Action Bar (Hidden when Printing) */}
      <nav className="print:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Application Portal</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 border border-gray-300 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-gray-700" />
              <span>Print / Save PDF</span>
            </button>

            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </a>

            <Link
              href="/careers/apply"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-colors shadow-xs"
            >
              <span>Apply Online &rarr;</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* FLYER PAPER (Formatted for Clean White A4 / Letter Display) */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 print:p-0 print:max-w-full">
        
        <div className="bg-white border border-gray-300 print:border-none rounded-2xl p-6 sm:p-10 space-y-7 shadow-sm">
          
          {/* FLYER HEADER */}
          <header className="border-b-2 border-gray-900 pb-5 space-y-3">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-lg">
                  BT
                </div>
                <div>
                  <h1 className="text-sm font-black uppercase tracking-wider text-gray-950">
                    BridgeTech IT Services · On-Demand Network
                  </h1>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Freetown, Sierra Leone · Certified Technician &amp; Artisan Hub
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300 uppercase tracking-wide">
                Official Recruitment Drive 2026
              </span>
            </div>

            {/* Title */}
            <div className="pt-1">
              <h2 className="text-2xl sm:text-4xl font-black text-gray-950 uppercase tracking-tight leading-tight">
                We Are Hiring: <span className="text-red-600">20 Specialized Roles</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 font-medium leading-relaxed">
                Calling all vetted technicians, mechanics, and master tradespeople across Freetown. Partner with BridgeTech to receive verified customer call-outs in your neighborhood.
              </p>
            </div>

            {/* 4 Clean Highlight Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900">Keep 85% Pay</div>
                  <div className="text-[10px] text-gray-500">Highest Net in SL</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900">Weekly Payouts</div>
                  <div className="text-[10px] text-gray-500">Orange / Afrimoney</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900">14-Day Warranty</div>
                  <div className="text-[10px] text-gray-500">BridgeTech Guarantee</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-gray-900">Local Call-Outs</div>
                  <div className="text-[10px] text-gray-500">Freetown &amp; Suburbs</div>
                </div>
              </div>
            </div>

          </header>

          {/* THE 20 ROLES (4 CLEAN CLUSTERS) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
                Directory of 20 Open Technician &amp; Trade Positions
              </h3>
              <span className="text-[11px] font-bold text-red-600">
                Immediate Openings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLUSTERS.map(cluster => (
                <div
                  key={cluster.title}
                  className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-gray-900 text-white flex items-center justify-center text-[10px]">
                        <i className={cluster.icon} />
                      </span>
                      <h4 className="font-bold text-xs text-gray-900">
                        {cluster.title}
                      </h4>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                      {cluster.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {cluster.roles.map(r => (
                      <div key={r.id} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-gray-900 font-bold block">
                            {r.title}
                          </strong>
                          <span className="text-[11px] text-gray-600 leading-snug block">
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

          {/* CANDIDATE REQUIREMENTS & CERTIFICATIONS */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Who Can Apply? (Requirements &amp; Certifications)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-900 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <span><strong>Experience:</strong> Minimum 1 year practical field experience in your selected trade.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-900 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <span><strong>Certifications (Advantage):</strong> NCTVA, TVET, City &amp; Guilds, Trade Test certificate, or apprenticeship testimonial.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-900 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <span><strong>Tools of the Trade:</strong> Must own or have access to standard professional tools required for the job.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-900 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <span><strong>Identification:</strong> Valid National ID Card, Voter ID, Driver License or Passport.</span>
              </div>
            </div>
          </section>

          {/* CALL TO ACTION & CONTACT FOOTER */}
          <footer className="border-t-2 border-gray-900 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-wide text-red-600">
                How to Apply (Fast &amp; Free)
              </div>
              <div className="text-xs font-semibold text-gray-900">
                Apply online via our portal or message our recruitment team on WhatsApp.
              </div>
              <p className="text-[11px] text-gray-500">
                Hotline / WhatsApp: +232 33 399391 · 24 Rawdon Street, Freetown
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 print:hidden">
              <a
                href="https://wa.me/23233399391?text=Hello%20BridgeTech%20Recruitment%2C%20I%20am%20applying%20for%20a%20technician%20role%20on%20the%20On-Demand%20Network."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <i className="fab fa-whatsapp text-sm" />
                <span>WhatsApp Apply</span>
              </a>

              <Link
                href="/careers/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <span>Online Application Portal</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Print Only Footer */}
            <div className="hidden print:block text-right text-xs text-gray-600 space-y-0.5">
              <p><strong>Apply Online:</strong> www.itservicesfreetown.com/careers</p>
              <p><strong>Recruitment WhatsApp:</strong> +232 33 399391</p>
            </div>

          </footer>

        </div>

      </main>

    </div>
  );
}
