'use client';

import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  CheckCircle, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  ArrowRight, 
  Upload, 
  User, 
  Wallet, 
  Clock, 
  Wrench,
  AlertCircle,
  Award,
  Check
} from 'lucide-react';
import { TRADE_CATEGORIES } from '@/lib/on-demand-categories';

interface JobPosting {
  id: string;
  title: string;
  subtitle: string;
  department: string;
  icon: string;
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
  
  // Document Upload States
  const [idCardPhotoPreview, setIdCardPhotoPreview] = useState<string | null>(null);
  const [certificatePhotoPreview, setCertificatePhotoPreview] = useState<string | null>(null);

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

  // Image compressor helper
  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
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
          callback(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          callback(dataUrl);
        }
      };
      img.onerror = () => callback(dataUrl);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleIdCardFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file, setIdCardPhotoPreview);
  };

  const handleCertificateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file, setCertificatePhotoPreview);
  };

  const handleApplyClick = (jobId: string) => {
    setSelectedJobId(jobId);
    const formEl = document.getElementById('apply-form');
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
      setErrorMsg('Residential physical address in Freetown is mandatory for background verification');
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
          certificatePhoto: certificatePhotoPreview || undefined,
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* ── 1. PROFESSIONAL HEADER / HERO ── */}
      <section className="bg-white border-b border-gray-200 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Clean Main Title */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-950 tracking-tight leading-tight">
              Join Our Verified Technician &amp; Artisan Network
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              BridgeTech connects certified trade professionals and electronics technicians with daily residential and commercial jobs across Freetown. Receive reliable bookings, keep <strong>85% take-home pay</strong>, and get weekly mobile money payouts.
            </p>
          </div>

          {/* Clean Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#apply-form"
              className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* 4 Clean Value Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Keep 85% Take-Home</span>
              </div>
              <p className="text-xs text-gray-600">Standard 15% platform commission on completed call-outs.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Weekly Settlements</span>
              </div>
              <p className="text-xs text-gray-600">Direct cashout to your Orange Money or Afrimoney account.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>14-Day Warranty Backing</span>
              </div>
              <p className="text-xs text-gray-600">BridgeTech backs your craftsmanship with a standard customer warranty.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Local Freetown Jobs</span>
              </div>
              <p className="text-xs text-gray-600">Dispatched to call-outs within or near your residential zone.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. JOBS DIRECTORY SECTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        
        {/* Navigation & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Open Positions ({TRADE_CATEGORIES.length})
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Click &ldquo;Apply for Role&rdquo; on any position to quickly fill the form below.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title or tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
            />
          </div>
        </div>

        {/* Clean Department Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedDepartment === dept
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {dept === 'all' ? 'All Roles (20)' : dept}
            </button>
          ))}
        </div>

        {/* Jobs Grid */}
        {loadingJobs ? (
          <div className="p-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <i className="fas fa-circle-notch fa-spin text-red-600" />
            <span>Loading open roles...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-xl border border-gray-200 text-gray-500 space-y-2">
            <AlertCircle className="w-6 h-6 text-gray-400 mx-auto" />
            <p className="text-sm font-semibold">No positions found matching &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDepartment('all'); }}
              className="text-xs text-red-600 font-bold hover:underline"
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
                  className={`rounded-xl border bg-white overflow-hidden transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-600 ring-2 ring-red-600/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-40 overflow-hidden bg-gray-100">
                      <img
                        src={job.image}
                        alt={job.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-900/80 text-white backdrop-blur-xs">
                          {job.badge}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white">
                          Keep 85%
                        </span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="font-bold text-base text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-[11px] font-medium text-gray-500">
                          {job.department}
                        </p>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {job.subtitle}
                      </p>

                      <div className="pt-2 border-t border-gray-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block">
                          Key Requirements:
                        </span>
                        {job.requirements.slice(0, 2).map((req, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-0 border-t border-gray-50 flex items-center justify-between gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      {job.payEstimate}
                    </span>

                    <button
                      onClick={() => handleApplyClick(job.id)}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 hover:bg-red-600 text-gray-800 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Apply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ── 3. CANDIDATE APPLICATION FORM ── */}
      <section id="apply-form" className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 scroll-mt-6">
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="border-b border-gray-200 pb-4 space-y-1">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Step-by-Step Registration</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950">
              Submit Job Application
            </h2>
            <p className="text-xs text-gray-600">
              Applying for: <strong className="text-gray-900">{selectedJob?.title || 'Selected Trade'}</strong>. Complete the form below to apply.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitApplication} className="space-y-6">
            
            {/* 1. Job Role Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-red-600" />
                <span>1. Primary Job Role Applying For *</span>
              </label>

              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 font-medium focus:outline-none focus:border-red-600"
              >
                {TRADE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title} ({cat.badge})
                  </option>
                ))}
              </select>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Secondary Skills / Other Trades You Can Perform (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Also experienced with solar inverters, basic plumbing, auto diagnostics"
                  value={secondarySkills}
                  onChange={e => setSecondarySkills(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* 2. Personal & Contact Details */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-red-600" />
                <span>2. Personal &amp; Contact Details *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohamed A. Kamara"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Phone Calling Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +232 76 123456 or 076123456"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">WhatsApp Number *</label>
                    <label className="text-[11px] text-gray-500 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={e => setSameAsPhone(e.target.checked)}
                        className="rounded border-gray-300 text-red-600"
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
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Area & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Area in Freetown *</label>
                  <select
                    value={locationArea}
                    onChange={e => setLocationArea(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  >
                    {FREETOWN_AREAS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Residential Physical Address in Freetown (Mandatory) *</span>
                  <span className="text-[10px] text-red-600 font-medium">Required for vetting</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14 Sanders Street, Off Campbell Street, Freetown"
                  value={residentialAddress}
                  onChange={e => setResidentialAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* 3. Craftsmanship, Tools & Experience */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-600" />
                <span>3. Craftsmanship, Tools &amp; Experience *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Years of Field Experience *</label>
                  <select
                    value={yearsExperience}
                    onChange={e => setYearsExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="1-2">1 to 2 Years</option>
                    <option value="3-5">3 to 5 Years</option>
                    <option value="5-10">5 to 10 Years</option>
                    <option value="10+">Over 10 Years (Master)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Tool Ownership *</label>
                  <select
                    value={toolOwnership}
                    onChange={e => setToolOwnership(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="fully_equipped">Fully Equipped (All trade tools)</option>
                    <option value="basic_tools">Basic Hand/Power Tools</option>
                    <option value="partially_equipped">Partially Equipped</option>
                    <option value="need_tools">Need Tool Financing Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Mode of Transport *</label>
                  <select
                    value={transportMode}
                    onChange={e => setTransportMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="motorbike">Own Motorbike / Okada</option>
                    <option value="commercial">Commercial (Keke / Poda-Poda)</option>
                    <option value="private_car">Private Vehicle</option>
                    <option value="on_foot">On Foot (Immediate Neighborhood)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Availability *</label>
                <select
                  value={availability}
                  onChange={e => setAvailability(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                >
                  <option value="immediate_fulltime">Immediate Full-Time (Ready for daily jobs)</option>
                  <option value="emergency_oncall">Emergency On-Call (Fast 2-hour response)</option>
                  <option value="part_time">Part-Time (Selected days)</option>
                  <option value="weekends_only">Weekends Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Summary of Past Projects &amp; Work Experience (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Worked 3 years repairing HP & Canon photocopiers at offices, installed domestic solar systems in Goderich..."
                  value={workSummary}
                  onChange={e => setWorkSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* 4. Document & Certification Uploads */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-red-600" />
                <span>4. Professional Certification &amp; ID Uploads</span>
              </label>

              {/* CERTIFICATION UPLOAD (New Feature) */}
              <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Trade / Professional Certification (Recommended)</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Upload photo or scan of your certificate (NCTVA, City &amp; Guilds, TVET, Trade Test Certificate, Ministry of Labour certificate, or master apprenticeship testimonial).
                    </p>
                  </div>
                  {certificatePhotoPreview && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Uploaded ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-800 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>Choose Certificate File (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCertificateFile}
                      className="hidden"
                    />
                  </label>

                  {certificatePhotoPreview && (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-md overflow-hidden border border-gray-300 bg-white">
                        <img src={certificatePhotoPreview} alt="Certificate preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCertificatePhotoPreview(null)}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* NATIONAL ID UPLOAD */}
              <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>National ID Card / Passport / Voter Card</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Upload photo of your valid national ID card, passport, driver license, or voter registration card for verification.
                    </p>
                  </div>
                  {idCardPhotoPreview && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Uploaded ✓
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-800 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-gray-600" />
                    <span>Choose ID Photo (JPG/PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdCardFile}
                      className="hidden"
                    />
                  </label>

                  {idCardPhotoPreview && (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-md overflow-hidden border border-gray-300 bg-white">
                        <img src={idCardPhotoPreview} alt="ID preview" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIdCardPhotoPreview(null)}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  National ID / NIN / Voter Card Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. SL-ID-8492048"
                  value={nationalIdNumber}
                  onChange={e => setNationalIdNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* 5. Mobile Money Payout Account */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-red-600" />
                <span>5. Weekly Payout Account *</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Mobile Money Provider *</label>
                  <select
                    value={mobileMoneyProvider}
                    onChange={e => setMobileMoneyProvider(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  >
                    <option value="orange">Orange Money</option>
                    <option value="afrimoney">Afrimoney</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Registered Payout Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 076123456"
                    value={mobileMoneyNumber}
                    onChange={e => setMobileMoneyNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Declaration & Submission */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                By submitting, you certify that all information provided is accurate and true. You agree to undergo standard identity verification and adhere to the BridgeTech 14-Day Customer Warranty &amp; Professional Service Standards.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wide transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin text-sm" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>

          </form>

        </div>

      </section>

      {/* ── 4. SUCCESS CONFIRMATION MODAL ── */}
      {successTrackingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 text-center space-y-5 shadow-xl">
            
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-gray-950">
                Application Received
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{fullName}</strong>. Your candidate file has been recorded under reference ID:
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                Application Tracking ID
              </span>
              <div className="text-lg font-mono font-bold text-red-600">
                {successTrackingId}
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-normal">
              Our recruitment team will review your qualifications and contact you within <strong>48 to 72 hours</strong>.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href={`https://wa.me/23233399391?text=${encodeURIComponent(`Hello BridgeTech Recruitment, I submitted an application for ${selectedJob?.title} (Ref: ${successTrackingId}). Name: ${fullName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <i className="fab fa-whatsapp text-sm" />
                <span>Message Recruiter</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setSuccessTrackingId(null);
                  setFullName('');
                  setPhone('');
                  setResidentialAddress('');
                  setCertificatePhotoPreview(null);
                  setIdCardPhotoPreview(null);
                }}
                className="py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
