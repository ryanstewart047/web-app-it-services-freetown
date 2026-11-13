'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TradeCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  type: 'tech' | 'trade';
}

const TRADE_CATEGORIES: TradeCategory[] = [
  // Specialized Tech
  {
    id: 'printer-tech',
    title: 'Printer & Copier Repair',
    subtitle: 'HP, Canon, Epson, Ricoh laser/inkjet, rollers & error code fixes',
    icon: 'fas fa-print',
    color: 'from-blue-600 to-indigo-600',
    badge: 'Specialized Tech',
    type: 'tech',
  },
  {
    id: 'gaming-console',
    title: 'Gaming Console Repair',
    subtitle: 'PS4, PS5, Xbox Series, Switch — HDMI ports, overheating & pads',
    icon: 'fas fa-gamepad',
    color: 'from-purple-600 to-pink-600',
    badge: 'Specialized Tech',
    type: 'tech',
  },
  {
    id: 'cctv-security',
    title: 'CCTV & Security Systems',
    subtitle: 'Camera mounting, DVR/NVR setup, mobile streaming & repairs',
    icon: 'fas fa-video',
    color: 'from-cyan-600 to-blue-600',
    badge: 'Specialized Tech',
    type: 'tech',
  },
  {
    id: 'solar-inverter',
    title: 'Solar & Inverter Systems',
    subtitle: 'Hybrid inverters, battery banks, solar panel wiring & diagnostics',
    icon: 'fas fa-solar-panel',
    color: 'from-amber-500 to-orange-600',
    badge: 'Energy & Power',
    type: 'tech',
  },
  {
    id: 'networking-wifi',
    title: 'Networking & Wi-Fi Setup',
    subtitle: 'Office LAN cabling, router config, mesh Wi-Fi & signal boost',
    icon: 'fas fa-network-wired',
    color: 'from-teal-600 to-emerald-600',
    badge: 'IT Infrastructure',
    type: 'tech',
  },
  {
    id: 'audio-visual',
    title: 'TV & Projector Mounting',
    subtitle: 'Smart TV wall mounting, conference projector setup & audio',
    icon: 'fas fa-tv',
    color: 'from-red-600 to-rose-600',
    badge: 'Specialized Tech',
    type: 'tech',
  },
  // Trades & Artisans
  {
    id: 'electrician',
    title: 'Certified Electricians',
    subtitle: 'House rewiring, breaker faults, generator changeovers & lighting',
    icon: 'fas fa-bolt',
    color: 'from-amber-600 to-yellow-600',
    badge: 'Certified Trade',
    type: 'trade',
  },
  {
    id: 'plumber',
    title: 'Plumbers & Pipe Fitters',
    subtitle: 'Water pumps, leak repair, overhead tank plumbing & drainage',
    icon: 'fas fa-faucet',
    color: 'from-sky-600 to-blue-700',
    badge: 'Certified Trade',
    type: 'trade',
  },
  {
    id: 'ac-refrigeration',
    title: 'AC & Refrigeration',
    subtitle: 'Split AC servicing, gas refilling, compressor repair & cooling',
    icon: 'fas fa-snowflake',
    color: 'from-indigo-600 to-blue-500',
    badge: 'Certified Trade',
    type: 'trade',
  },
  {
    id: 'welder-metal',
    title: 'Welders & Metal Fabricators',
    subtitle: 'Burglar bars, security metal gates, custom welding & railings',
    icon: 'fas fa-fire',
    color: 'from-orange-600 to-red-600',
    badge: 'Fabrication',
    type: 'trade',
  },
  {
    id: 'carpenter',
    title: 'Carpenters & Woodworkers',
    subtitle: 'Door hanging, lock repairs, bespoke cabinets, roofing & desks',
    icon: 'fas fa-hammer',
    color: 'from-amber-700 to-orange-800',
    badge: 'Artisan',
    type: 'trade',
  },
  {
    id: 'mason-builder',
    title: 'Masons, Tilers & Builders',
    subtitle: 'Floor tiling, brick/block laying, plastering & structural repair',
    icon: 'fas fa-trowel',
    color: 'from-stone-600 to-stone-800',
    badge: 'Construction',
    type: 'trade',
  },
  {
    id: 'painter',
    title: 'Professional Painters',
    subtitle: 'Interior & exterior painting, weatherproofing & damp coating',
    icon: 'fas fa-paint-roller',
    color: 'from-emerald-600 to-green-700',
    badge: 'Finishing',
    type: 'trade',
  },
];

const FREETOWN_AREAS = [
  'Aberdeen',
  'Lumley',
  'Juba & Goderich',
  'Wilberforce & Spur Road',
  'Congo Cross & Brookfields',
  'Central Freetown',
  'Hill Station & Regent',
  'Kissy & Cline Town',
  'Wellington',
  'Calaba Town',
  'Hastings & Waterloo',
  'Other Western Area',
];

export default function OnDemandServicesPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'artisan'>('customer');
  const [filterType, setFilterType] = useState<'all' | 'tech' | 'trade'>('all');

  // Customer Form State
  const [selectedCategory, setSelectedCategory] = useState<string>('printer-tech');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [locationArea, setLocationArea] = useState('Central Freetown');
  const [addressDetails, setAddressDetails] = useState('');
  const [urgency, setUrgency] = useState<'emergency' | '24h' | 'flexible'>('24h');
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  // Customer Submission State
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [customerSuccessTrackingId, setCustomerSuccessTrackingId] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Artisan Form State
  const [artisanName, setArtisanName] = useState('');
  const [artisanPhone, setArtisanPhone] = useState('');
  const [artisanWhatsapp, setArtisanWhatsapp] = useState('');
  const [artisanMomo, setArtisanMomo] = useState('');
  const [artisanMomoNetwork, setArtisanMomoNetwork] = useState<'orange' | 'afri'>('orange');
  const [artisanTrade, setArtisanTrade] = useState('Printer & Copier Repair');
  const [artisanSecondary, setArtisanSecondary] = useState('');
  const [artisanExperience, setArtisanExperience] = useState('3');
  const [artisanCoverage, setArtisanCoverage] = useState<string[]>(['Central Freetown', 'Lumley']);
  const [artisanIdNumber, setArtisanIdNumber] = useState('');
  const [artisanPaymentRef, setArtisanPaymentRef] = useState('');
  const [artisanBio, setArtisanBio] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Artisan Submission State
  const [isSubmittingArtisan, setIsSubmittingArtisan] = useState(false);
  const [artisanSuccessId, setArtisanSuccessId] = useState<string | null>(null);
  const [artisanError, setArtisanError] = useState<string | null>(null);

  // Filter Categories
  const filteredCategories = TRADE_CATEGORIES.filter(cat => {
    if (filterType === 'all') return true;
    return cat.type === filterType;
  });

  const selectedCategoryObj = TRADE_CATEGORIES.find(c => c.id === selectedCategory) || TRADE_CATEGORIES[0];

  const handleSelectCategory = (cat: TradeCategory) => {
    setSelectedCategory(cat.id);
    // Smooth scroll to form on mobile
    const formEl = document.getElementById('request-booking-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError(null);

    if (!customerName.trim() || !phone.trim() || !problemDescription.trim()) {
      setCustomerError('Please provide your name, phone number, and a description of the issue.');
      return;
    }

    setIsSubmittingCustomer(true);
    try {
      const res = await fetch('/api/on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_request',
          category: selectedCategory,
          categoryTitle: selectedCategoryObj.title,
          customerName,
          phone,
          whatsapp: whatsapp || phone,
          email: email || undefined,
          locationArea,
          addressDetails,
          urgency,
          problemDescription,
          preferredDate: preferredDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit service request');
      }

      setCustomerSuccessTrackingId(data.trackingId);
    } catch (err: any) {
      setCustomerError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const handleArtisanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtisanError(null);

    if (!artisanName.trim() || !artisanPhone.trim() || !artisanTrade.trim()) {
      setArtisanError('Please fill in your full name, phone number, and primary trade.');
      return;
    }

    if (!agreedTerms) {
      setArtisanError('Please agree to the BridgeTech 15% platform commission terms to proceed.');
      return;
    }

    setIsSubmittingArtisan(true);
    try {
      const res = await fetch('/api/on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_pro',
          fullName: artisanName,
          phone: artisanPhone,
          whatsapp: artisanWhatsapp || artisanPhone,
          mobileMoneyNumber: artisanMomo || artisanPhone,
          mobileMoneyProvider: artisanMomoNetwork,
          primaryTrade: artisanTrade,
          secondarySkills: artisanSecondary || undefined,
          yearsOfExperience: artisanExperience,
          coverageAreas: artisanCoverage,
          nationalIdNumber: artisanIdNumber || undefined,
          onboardingPaymentRef: artisanPaymentRef || undefined,
          bioOrWorkSummary: artisanBio || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setArtisanSuccessId(data.proId);
    } catch (err: any) {
      setArtisanError(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmittingArtisan(false);
    }
  };

  const toggleCoverageArea = (area: string) => {
    setArtisanCoverage(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#040e40] via-slate-900 to-slate-950 border-b border-slate-800 pt-10 pb-12 sm:pt-16 sm:pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black tracking-wider uppercase">
              <i className="fas fa-bolt text-xs animate-pulse" />
              <span>BridgeTech Pro Network · Freetown</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              On-Demand <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400">Services</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Connect with vetted, background-checked professionals across Freetown. From printer specialists and gaming console repair to certified electricians, plumbers, and builders — backed by the <strong>BridgeTech 15% Quality Guarantee</strong>.
            </p>

            {/* Value Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 text-left">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <i className="fas fa-shield-alt text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">100% Vetted Pros</h4>
                  <p className="text-[10px] text-slate-400">ID &amp; skill checked</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <i className="fas fa-medal text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">14-Day Guarantee</h4>
                  <p className="text-[10px] text-slate-400">Guaranteed quality</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <i className="fas fa-stopwatch text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Fast Dispatch</h4>
                  <p className="text-[10px] text-slate-400">Emergency &amp; 24h</p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <i className="fas fa-file-invoice-dollar text-xs" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">Fair Invoicing</h4>
                  <p className="text-[10px] text-slate-400">Leones &amp; installments</p>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="pt-6">
              <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('customer')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                    activeTab === 'customer'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-user-check text-xs" />
                  <span>Request a Pro (Book Service)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('artisan')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                    activeTab === 'artisan'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-hard-hat text-xs" />
                  <span>Join as a Pro (For Artisans &amp; Techs)</span>
                  <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] rounded font-mono">
                    Keep 85%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TAB 1: CUSTOMER BOOKING FLOW ── */}
      {activeTab === 'customer' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
          
          {/* Section 1: Category Picker */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">1. Select Required Service</h2>
                <p className="text-xs text-slate-400">Choose a trade below to auto-fill your request.</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All (13)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('tech')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'tech' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-microchip mr-1" /> Tech &amp; Consoles
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('trade')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'trade' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <i className="fas fa-wrench mr-1" /> Home &amp; Trades
                </button>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCategories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-200 relative group flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/30 shadow-xl'
                        : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                      <i className={`${cat.icon} text-lg`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {cat.badge}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-red-400">
                            <i className="fas fa-check-circle" /> Selected
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-sm text-white group-hover:text-red-400 transition-colors leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-tight mt-1 line-clamp-2">
                        {cat.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Booking Form & Summary */}
          <div id="request-booking-form" className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400">Step 2 of 2</span>
                <h3 className="text-xl font-black text-white">Describe Your Job Request</h3>
                <p className="text-xs text-slate-400">
                  Selected Service: <strong className="text-white">{selectedCategoryObj.title}</strong>
                </p>
              </div>

              {customerError && (
                <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle shrink-0" />
                  <span>{customerError}</span>
                </div>
              )}

              {customerSuccessTrackingId ? (
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/60 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                    <i className="fas fa-check" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Request Successfully Dispatched!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Your service request has been logged and assigned for pro matching.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 inline-block">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Your Tracking ID</span>
                    <span className="font-mono text-xl font-black text-emerald-400">{customerSuccessTrackingId}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/23278123456?text=${encodeURIComponent(
                        `Hello BridgeTech, I just booked an On-Demand Service: ${selectedCategoryObj.title}. My Tracking ID is ${customerSuccessTrackingId}. Kindly confirm dispatch.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <i className="fab fa-whatsapp text-sm" /> Message on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSuccessTrackingId(null);
                        setProblemDescription('');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Book Another Service
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  
                  {/* Location & Urgency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Location / Area in Freetown *
                      </label>
                      <select
                        value={locationArea}
                        onChange={e => setLocationArea(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                      >
                        {FREETOWN_AREAS.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Urgency Level *
                      </label>
                      <select
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                      >
                        <option value="emergency">🚨 Emergency (Within 2-4 Hours)</option>
                        <option value="24h">⏱️ Standard (Within 24 Hours)</option>
                        <option value="flexible">📅 Flexible / Scheduled</option>
                      </select>
                    </div>
                  </div>

                  {/* Street Address / Landmark */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Street Address or Landmark *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Lumley Police Station, Blue House"
                      value={addressDetails}
                      onChange={e => setAddressDetails(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Problem Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Problem Details / Scope of Work *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Please describe what is faulty or what you need installed. E.g., 'Epson L805 printer double light blinking', or 'Distribution board tripping whenever AC starts', or 'PS5 no display after power surge'..."
                      value={problemDescription}
                      onChange={e => setProblemDescription(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Samuel Kargbo"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (Calls) *</label>
                      <input
                        type="tel"
                        placeholder="e.g. +232 7X XXXXXX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +232 7X XXXXXX"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="For digital invoice &amp; receipt"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingCustomer}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmittingCustomer ? (
                      <>
                        <i className="fas fa-spinner fa-spin" /> Dispatching Request...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane" /> Submit Request &amp; Match Pro
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar / Trust Card */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                  <i className="fas fa-shield-virus text-emerald-400" />
                  <span>The BridgeTech Guarantee</span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>15% Quality Escrow:</strong> We hold payment until you confirm the job is completed properly.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Direct Accountability:</strong> If an artisan fails or defects appear within 14 days, BridgeTech rectifies it.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <i className="fas fa-check-circle text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Official Invoices:</strong> Full digital receipt and PDF invoice available for corporate records.</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-snug">
                  <span className="font-bold text-white block mb-0.5">Need Urgent Phone Booking?</span>
                  Call our operational hotline at <strong>+232 78 123 456</strong> or visit our office.
                </div>
              </div>

              {/* Artisan recruitment callout */}
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">For Technicians</span>
                </div>
                <h4 className="text-sm font-extrabold text-white leading-tight">
                  Are you a skilled technician or artisan in Freetown?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join our verified network, get regular corporate and domestic clients, and keep 85% of your labor earnings.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('artisan')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Apply to Join Pro Network</span>
                  <i className="fas fa-arrow-right text-[10px]" />
                </button>
              </div>
            </div>

          </div>

        </main>
      )}

      {/* ── TAB 2: ARTISAN / TALENT ONBOARDING FLOW ── */}
      {activeTab === 'artisan' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
              Artisan &amp; Specialist Recruitment
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Join the BridgeTech Pro Network</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Get steady client leads in Freetown with zero marketing hassle. We secure client deposits, generate invoices, and disburse <strong>85%</strong> directly to your mobile money.
            </p>
          </div>

          {/* Commitment Fee Box */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                  <i className="fas fa-coins" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">One-Time Onboarding &amp; Verification Fee</h4>
                  <p className="text-[11px] text-amber-300/80">Proves commitment &amp; verifies account identity</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase font-semibold block">Commitment Fee</span>
                <span className="text-xl font-black text-amber-400 font-mono">Le 30</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2 font-bold text-orange-400 mb-1">
                  <i className="fas fa-mobile-alt" />
                  <span>Orange Money</span>
                </div>
                <p className="text-[11px] text-slate-300">Dial <strong>*144#</strong> &rarr; Send Money to: <strong>+232 78 123 456</strong></p>
                <p className="text-[10px] text-slate-500 mt-1">Reference: <em>Your Full Name</em></p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="flex items-center gap-2 font-bold text-red-400 mb-1">
                  <i className="fas fa-mobile-alt" />
                  <span>Afrimoney</span>
                </div>
                <p className="text-[11px] text-slate-300">Dial <strong>*161#</strong> &rarr; Send Money to: <strong>+232 88 123 456</strong></p>
                <p className="text-[10px] text-slate-500 mt-1">Reference: <em>Your Full Name</em></p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Enter your transaction reference code in the form below. Once received, our operations team verifies your credentials and activates your account within 24 hours.
            </p>
          </div>

          {/* Artisan Application Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
            
            {artisanError && (
              <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <i className="fas fa-exclamation-triangle shrink-0" />
                <span>{artisanError}</span>
              </div>
            )}

            {artisanSuccessId ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-500/60 rounded-2xl text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  <i className="fas fa-check" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Application Received!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Your Pro Profile has been created and logged for onboarding verification.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 inline-block">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pro Reference ID</span>
                  <span className="font-mono text-xl font-black text-emerald-400">{artisanSuccessId}</span>
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Our dispatch manager will review your trade credentials and confirm the Le 30 commitment fee before notifying you of jobs in your area.
                </p>
                <a
                  href={`https://wa.me/23278123456?text=${encodeURIComponent(
                    `Hello BridgeTech, I have submitted my Artisan Pro application for ${artisanTrade}. My Reference ID is ${artisanSuccessId}. Kindly verify my account.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  <i className="fab fa-whatsapp text-sm" /> Confirm on WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleArtisanSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ibrahim Mansaray"
                      value={artisanName}
                      onChange={e => setArtisanName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Primary Trade / Specialty *</label>
                    <select
                      value={artisanTrade}
                      onChange={e => setArtisanTrade(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {TRADE_CATEGORIES.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                      <option value="Other Specialist">Other Specialty</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (Calls) *</label>
                    <input
                      type="tel"
                      placeholder="e.g. +232 7X XXXXXX"
                      value={artisanPhone}
                      onChange={e => setArtisanPhone(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +232 7X XXXXXX"
                      value={artisanWhatsapp}
                      onChange={e => setArtisanWhatsapp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={artisanExperience}
                      onChange={e => setArtisanExperience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Mobile Money for Payouts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Mobile Money Number for Job Payouts *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +232 78 000 000"
                      value={artisanMomo}
                      onChange={e => setArtisanMomo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Network Provider *</label>
                    <select
                      value={artisanMomoNetwork}
                      onChange={e => setArtisanMomoNetwork(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="orange">Orange Money</option>
                      <option value="afri">Afrimoney</option>
                    </select>
                  </div>
                </div>

                {/* Voter / National ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      National ID / Voter ID Number (for security check)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VOT-XXXXXX or NIN"
                      value={artisanIdNumber}
                      onChange={e => setArtisanIdNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-300 mb-1">
                      Le 30 Commitment Payment Reference / TXN ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. OM-TXN-12345 or Cash at Office"
                      value={artisanPaymentRef}
                      onChange={e => setArtisanPaymentRef(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Operating Coverage Areas */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Operating Areas in Freetown (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FREETOWN_AREAS.map(area => {
                      const checked = artisanCoverage.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleCoverageArea(area)}
                          className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center justify-between ${
                            checked
                              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{area}</span>
                          {checked && <i className="fas fa-check text-[10px] text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bio / Experience Summary */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Previous Experience &amp; Tools Owned
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state your key expertise (e.g. 'Expert in repairing PS4/PS5 HDMI ports and liquid metal', or '8 years experience with commercial 3-phase wiring and generator changeover switches')..."
                    value={artisanBio}
                    onChange={e => setArtisanBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Terms Agreement */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs text-slate-300 leading-snug">
                      I agree to the <strong>15% BridgeTech platform fee</strong> on all jobs dispatched through the network, commit to honest and professional workmanship, and confirm payment of the <strong>Le 30 commitment fee</strong>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingArtisan || !agreedTerms}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmittingArtisan ? (
                    <>
                      <i className="fas fa-spinner fa-spin" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle" /> Submit Application &amp; Join Pro Network
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </main>
      )}

    </div>
  );
}
