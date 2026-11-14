'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Search, 
  Filter, 
  CheckCircle, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Printer, 
  Upload, 
  User, 
  Wallet, 
  Clock, 
  Star, 
  X, 
  ExternalLink,
  ChevronDown,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { TRADE_CATEGORIES } from '@/lib/on-demand-categories';

interface JobPosting {
  id: string;
  title: string;
  subtitle: string;
  department: string;
  icon: string;
  color: string;
  badge: string;
  type: 'tech' | 'trade';
  image: string;
  payEstimate: string;
  requirements: string[];
  keyTools: string[];
  location: string;
}

const FREETOWN_AREAS = [
  'Central Freetown',
  'Lumley',
  'Aberdeen',
  'Kissy',
  'Wellington',
  'Congo Cross',
  'Brookfields',
  'Goderich',
  'Juba / Hill Station',
  'Wilkinson Road',
  'Murray Town',
  'Calaba Town',
  'Waterloo',
  'Western Rural Area',
  'Other / Greater Freetown',
];

export default function CareersPortalPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [flyerModalOpen, setFlyerModalOpen] = useState(false);

  // Application Form State
  const [selectedJobId, setSelectedJobId] = useState<string>('printer-tech');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('male');
  const [locationArea, setLocationArea] = useState('Central Freetown');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [yearsExperience, setYearsExperience] = useState('1-2');
  const [secondarySkills, setSecondarySkills] = useState('');
  const [toolOwnership, setToolOwnership] = useState<'fully_equipped' | 'partially_equipped' | 'basic_tools' | 'need_tools'>('basic_tools');
  const [transportMode, setTransportMode] = useState<'motorbike' | 'commercial' | 'private_car' | 'on_foot'>('commercial');
  const [availability, setAvailability] = useState<'immediate_fulltime' | 'part_time' | 'weekends_only' | 'emergency_oncall'>('immediate_fulltime');
  const [workSummary, setWorkSummary] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'orange' | 'afrimoney'>('orange');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [idCardPhotoPreview, setIdCardPhotoPreview] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTrackingId, setSuccessTrackingId] = useState<string | null>(null);

  // Load jobs from API
  useEffect(() => {
    fetch('/api/careers?type=jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      })
      .catch(err => console.error('Failed to load jobs catalog:', err))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Sync WhatsApp with Phone if checked
  useEffect(() => {
    if (sameAsPhone) {
      setWhatsapp(phone);
    }
  }, [phone, sameAsPhone]);

  // Compress ID Card image preview
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setIdCardPhotoPreview(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          setIdCardPhotoPreview(dataUrl);
        }
      };
      img.onerror = () => setIdCardPhotoPreview(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyClick = (jobId: string) => {
    setSelectedJobId(jobId);
    const formEl = document.getElementById('apply');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter an active phone number');
      return;
    }
    if (!residentialAddress.trim()) {
      setErrorMsg('Residential address in Freetown is mandatory for verification');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedJobObj = jobs.find(j => j.id === selectedJobId);
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          jobId: selectedJobId,
          jobTitle: selectedJobObj?.title || 'Specialized Technician',
          fullName,
          phone,
          whatsapp: whatsapp || phone,
          email: email.trim() || undefined,
          gender,
          locationArea,
          residentialAddress,
          yearsExperience,
          secondarySkills: secondarySkills.trim() || undefined,
          toolOwnership,
          transportMode,
          availability,
          workSummary: workSummary.trim() || undefined,
          nationalIdNumber: nationalIdNumber.trim() || undefined,
          idCardPhoto: idCardPhotoPreview || undefined,
          mobileMoneyProvider,
          mobileMoneyNumber: mobileMoneyNumber || phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccessTrackingId(data.trackingId);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter jobs
  const departments = ['all', 'Digital & IT Hardware', 'Electrical & Clean Energy', 'Plumbing & Mechanical', 'Construction & Finishing'];

  const filteredJobs = jobs.filter(job => {
    const matchesDept = selectedDepartment === 'all' || job.department === selectedDepartment;
    const matchesSearch = !searchQuery.trim() || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-red-600 selection:text-white">
      
      {/* ── 1. HERO SECTION: RECRUITMENT DRIVE ── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 text-center">
          
          {/* Top Tag Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600/20 border border-red-500/40 text-red-400 uppercase tracking-widest flex items-center gap-1.5 shadow">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              <span>BridgeTech Careers &amp; Recruitment</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 border border-amber-400/30 text-amber-300">
              ⚡ 20 Specialized Roles Available in Freetown
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none">
              Turn Your Skills Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-400">Guaranteed Income</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Join Freetown’s #1 On-Demand Tech &amp; Artisan Network. Receive steady customer repair jobs, keep <strong>85% take-home pay</strong>, and get weekly mobile money settlements.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#apply"
              className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition-all shadow-xl shadow-red-600/25 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Apply Online (2-Min Form)</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setFlyerModalOpen(true)}
              type="button"
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold text-sm transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>View / Print Advert Flyer</span>
            </button>

            <Link
              href="/careers/flyer"
              className="px-4 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Flyer Fullpage</span>
            </Link>
          </div>

          {/* 4 Pillars of Why Work With BridgeTech */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto pt-6 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                <Wallet className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">Keep 85% Net</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Fair platform commission. Highest technician payout in Sierra Leone.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">Weekly Settlements</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Direct payout every Friday to your Orange Money or Afrimoney account.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">14-Day Warranty</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Official BridgeTech guarantee gives customers confidence to hire you.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm space-y-1">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">Local Call-Outs</h4>
              <p className="text-[11px] text-slate-400 leading-snug">Jobs assigned close to your home base (Lumley, Kissy, Central, etc.).</p>
            </div>
          </div>

        </div>

      </section>

      {/* ── 2. JOBS DIRECTORY SECTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        {/* Section Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest block">Available Positions</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Explore 20 Specialized Roles
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select a job card to view requirements and auto-populate your application form.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trade, skill or tool..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
        </div>

        {/* Department Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDepartment === dept
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-850'
              }`}
            >
              {dept === 'all' ? 'All Roles (20)' : dept}
            </button>
          ))}
        </div>

        {/* Jobs Grid */}
        {loadingJobs ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <i className="fas fa-circle-notch fa-spin text-red-500" />
            <span>Loading active job postings...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold">No jobs matching &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDepartment('all'); }}
              className="text-xs text-red-400 hover:underline font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map(job => {
              const isSelected = selectedJobId === job.id;

              return (
                <div
                  key={job.id}
                  className={`rounded-3xl border transition-all duration-300 flex flex-col bg-slate-900 overflow-hidden group ${
                    isSelected
                      ? 'border-red-500 ring-2 ring-red-500/30 shadow-xl shadow-red-500/10'
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-xl'
                  }`}
                >
                  {/* Photo Header */}
                  <div className="relative h-44 overflow-hidden bg-slate-950">
                    <img
                      src={job.image}
                      alt={job.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md text-white border border-white/20">
                        {job.badge}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow">
                        85% Take-Home
                      </span>
                    </div>

                    {/* Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${job.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                        <i className={`${job.icon} text-sm`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-sm text-white leading-tight drop-shadow-sm truncate">
                          {job.title}
                        </h3>
                        <p className="text-[10px] text-slate-300 truncate font-medium">
                          {job.department}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {job.subtitle}
                      </p>

                      {/* Earnings Estimate */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
                        <span className="text-slate-400 font-medium">Est. Pay:</span>
                        <strong className="text-emerald-400 font-bold">{job.payEstimate}</strong>
                      </div>

                      {/* Key Requirements */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Must Know:
                        </span>
                        {job.requirements.slice(0, 2).map((req, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <CheckCircle className="w-3 h-3 text-red-500 shrink-0" />
                            <span className="truncate">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" /> Freetown
                      </span>

                      <button
                        onClick={() => handleApplyClick(job.id)}
                        type="button"
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span>{isSelected ? '✓ Selected' : 'Apply for Role'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ── 3. CANDIDATE APPLICATION FORM ── */}
      <section id="apply" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 scroll-mt-10">
        
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative">
          
          {/* Header */}
          <div className="border-b border-slate-800 pb-5 space-y-1">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Candidate Registration Portal</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Submit Your Job Application
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Applying for: <strong className="text-white">{selectedJob?.title || 'Selected Trade'}</strong>. Fill in your genuine details. Applications are vetted within 48 to 72 hours.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitApplication} className="space-y-6">
            
            {/* ── STEP 1: JOB ROLE SELECTION ── */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-red-500" />
                <span>1. Select Primary Job Role Applying For *</span>
              </label>

              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-red-500"
              >
                {TRADE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title} ({cat.badge})
                  </option>
                ))}
              </select>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Secondary Skills / Additional Trades (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Also experienced with inverter batteries, auto wiring, wall tiling"
                  value={secondarySkills}
                  onChange={e => setSecondarySkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* ── STEP 2: PERSONAL & CONTACT INFO ── */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" />
                <span>2. Personal &amp; Contact Details *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohamed A. Kamara"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Active Calling Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +232 76 123456 or 076123456"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300">WhatsApp Number *</label>
                    <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={e => setSameAsPhone(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0"
                      />
                      <span>Same as phone</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +232 76 123456"
                    value={whatsapp}
                    onChange={e => { setWhatsapp(e.target.value); setSameAsPhone(false); }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Location & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Primary Area / Neighborhood in Freetown *</label>
                  <select
                    value={locationArea}
                    onChange={e => setLocationArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    {FREETOWN_AREAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Exact Residential Physical Address (Mandatory) *</span>
                  <span className="text-[10px] text-red-400">Required for background verification</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14 Sanders Street, Off Campbell Street, Freetown"
                  value={residentialAddress}
                  onChange={e => setResidentialAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* ── STEP 3: EXPERIENCE, TOOLS & AVAILABILITY ── */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-500" />
                <span>3. Craftsmanship, Tools &amp; Mobility *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Years of Field Experience *</label>
                  <select
                    value={yearsExperience}
                    onChange={e => setYearsExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="1-2">1 to 2 Years</option>
                    <option value="3-5">3 to 5 Years</option>
                    <option value="5-10">5 to 10 Years</option>
                    <option value="10+">Over 10 Years (Master)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Tool Ownership Status *</label>
                  <select
                    value={toolOwnership}
                    onChange={e => setToolOwnership(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="fully_equipped">Fully Equipped (All trade tools)</option>
                    <option value="basic_tools">Basic Hand/Power Tools</option>
                    <option value="partially_equipped">Partially Equipped</option>
                    <option value="need_tools">Need Tool Financing Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">How You Travel to Jobs *</label>
                  <select
                    value={transportMode}
                    onChange={e => setTransportMode(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="motorbike">Own Motorbike / Okada</option>
                    <option value="commercial">Commercial Transport (Keke / Poda-Poda)</option>
                    <option value="private_car">Private Vehicle</option>
                    <option value="on_foot">On Foot (Within immediate neighborhood)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Availability *</label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="immediate_fulltime">Immediate Full-Time (Ready for daily call-outs)</option>
                  <option value="emergency_oncall">Emergency On-Call (Fast 2-hour response)</option>
                  <option value="part_time">Part-Time (Selected days / afternoons)</option>
                  <option value="weekends_only">Weekends Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">
                  Brief Summary of Past Projects &amp; Work Experience (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Repaired HP printers at Sierra Leone commercial banks, installed 5kVA solar systems at Goderich residences, 4 years experience with Perkins diesel generators..."
                  value={workSummary}
                  onChange={e => setWorkSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* ── STEP 4: PAYOUT & IDENTIFICATION ── */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-500" />
                <span>4. Payout Account &amp; National ID Verification</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Weekly Payout Mobile Money Provider *</label>
                  <select
                    value={mobileMoneyProvider}
                    onChange={e => setMobileMoneyProvider(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="orange">Orange Money</option>
                    <option value="afrimoney">Afrimoney</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Mobile Money Registered Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 076123456"
                    value={mobileMoneyNumber}
                    onChange={e => setMobileMoneyNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">
                  National ID / NIN / Voter Card / Passport Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SL-ID-8492048"
                  value={nationalIdNumber}
                  onChange={e => setNationalIdNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* ID Card Photo Upload */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>Photo of ID Card / Certificate / Work Sample (Optional)</span>
                  <span className="text-[10px] text-slate-500">Supports JPG, PNG</span>
                </label>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs font-bold text-slate-300 hover:text-white transition-all">
                    <Upload className="w-3.5 h-3.5 text-red-500" />
                    <span>Upload ID or Work Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                    />
                  </label>

                  {idCardPhotoPreview && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-500/50">
                        <img src={idCardPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-emerald-400">Photo attached ✓</span>
                      <button
                        type="button"
                        onClick={() => setIdCardPhotoPreview(null)}
                        className="text-slate-500 hover:text-red-400 text-xs ml-1"
                      >
                        &times; Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms & Submission */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                By submitting this application, you declare that all information provided is true and accurate. You agree to undergo standard identity verification and adhere to the <strong>BridgeTech 14-Day Customer Warranty &amp; Quality Standard</strong>.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin text-sm" />
                    <span>Submitting Application to Recruitment Team...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Official Application &rarr;</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

      </section>

      {/* ── 4. SUCCESS CONFIRMATION MODAL ── */}
      {successTrackingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center shadow-2xl relative">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl shadow-lg">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Application Received Successfully
              </span>
              <h3 className="text-2xl font-black text-white">
                Welcome to BridgeTech Recruitment!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Thank you, <strong>{fullName}</strong>. Your candidate file has been registered under:
              </p>
            </div>

            {/* Reference Badge */}
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Official Application Reference ID
              </span>
              <div className="text-xl font-mono font-black text-amber-400 tracking-wider">
                {successTrackingId}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>📅 <strong>Next Steps:</strong> Our Freetown recruitment officers will review your craftsmanship file and call you within <strong>48 to 72 hours</strong> for a quick telephone or in-person interview.</p>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/23233399391?text=${encodeURIComponent(`Hello BridgeTech Recruitment, I just submitted my application for ${selectedJob?.title} (Ref: ${successTrackingId}). My name is ${fullName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <i className="fab fa-whatsapp text-sm" />
                <span>Confirm on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSuccessTrackingId(null);
                  setFullName('');
                  setPhone('');
                  setResidentialAddress('');
                }}
                className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Done / Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 5. ADVERT FLYER PREVIEW / PRINT MODAL ── */}
      {flyerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Bar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-white">BridgeTech Recruitment Advert Flyer</h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/careers/flyer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Standalone</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setFlyerModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Flyer Iframe or Scrollable View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <iframe
                src="/careers/flyer"
                title="Career Advert Flyer"
                className="w-full h-[650px] rounded-2xl border border-slate-800 bg-slate-900"
              />
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
              <span>Recruitment hotline: +232 33 399391 · 24 Rawdon St, Freetown</span>
              <button
                type="button"
                onClick={() => setFlyerModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
