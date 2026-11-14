'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Briefcase, 
  Check, 
  CheckCircle, 
  ShieldCheck, 
  Upload, 
  User, 
  Wallet, 
  Clock, 
  Wrench, 
  AlertCircle, 
  Award, 
  ArrowLeft,
  Phone,
  MapPin
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

function ApplyFormContent() {
  const searchParams = useSearchParams();
  const initialJobFromQuery = searchParams.get('job') || 'printer-tech';

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Application Form State
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobFromQuery);
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

  // Sync selected job if query param changes
  useEffect(() => {
    const jobParam = searchParams.get('job');
    if (jobParam) {
      setSelectedJobId(jobParam);
    }
  }, [searchParams]);

  // Load jobs catalog from API with image overrides
  useEffect(() => {
    fetch(`/api/careers?type=jobs&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
          if (data.overrides) setCategoryImages(data.overrides);
        }
      })
      .catch(err => console.error('Failed to load jobs catalog:', err))
      .finally(() => setLoadingJobs(false));

    fetch(`/api/on-demand?type=category_images&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.overrides) {
          setCategoryImages(data.overrides);
        }
      })
      .catch(err => console.error('Failed to load category image overrides:', err));
  }, []);

  // Sync WhatsApp with Phone if checked
  useEffect(() => {
    if (sameAsPhone) {
      setWhatsapp(phone);
    }
  }, [phone, sameAsPhone]);

  // Client-side image compressor helper
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
      const selectedJobObj = jobs.find(j => j.id === selectedJobId) || TRADE_CATEGORIES.find(c => c.id === selectedJobId);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || TRADE_CATEGORIES.find(c => c.id === selectedJobId);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Roles &amp; Requirements</span>
          </Link>
          <span className="text-xs text-gray-500 font-medium">
            Freetown, Sierra Leone
          </span>
        </div>

        {/* Success Confirmation Card */}
        {successTrackingId ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-bold">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
                Application Successfully Submitted!
              </h1>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{fullName}</strong>. Your candidate file has been recorded for the position of <strong>{selectedJob?.title || 'Specialized Role'}</strong>.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl max-w-sm mx-auto">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">
                Official Tracking ID
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-red-600 mt-0.5">
                {successTrackingId}
              </div>
            </div>

            <div className="text-left bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 space-y-2 max-w-lg mx-auto">
              <p className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>What Happens Next?</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px] sm:text-xs">
                <li>Our recruitment verification team will inspect your credentials within 24 to 48 hours.</li>
                <li>You will receive a call or WhatsApp message on <strong>{whatsapp || phone}</strong> to confirm your address and availability.</li>
                <li>Once approved, you will be onboarded to receive residential and commercial bookings across Freetown.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <a
                href={`https://wa.me/23233399391?text=${encodeURIComponent(`Hello BridgeTech Recruitment, I submitted an application for ${selectedJob?.title} (Ref: ${successTrackingId}). Name: ${fullName}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <i className="fab fa-whatsapp text-base" />
                <span>Notify Recruiter on WhatsApp</span>
              </a>

              <Link
                href="/careers"
                className="py-3 px-5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors flex items-center justify-center"
              >
                View Other Openings
              </Link>
            </div>
          </div>
        ) : (
          /* Main Application Form Container */
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Header Title */}
            <div className="border-b border-gray-200 pb-4 space-y-1.5">
              <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                BridgeTech Recruitment Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">
                Submit Job Application
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Applying for: <strong className="text-gray-900">{selectedJob?.title || 'Selected Trade'}</strong>. Fill in your details below to join our verified technician network in Freetown.
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

              {/* 4. Professional Certification & ID Uploads */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-600" />
                  <span>4. Professional Certification &amp; ID Uploads</span>
                </label>

                {/* CERTIFICATION UPLOAD */}
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
                    <span>Submit Job Application</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
}

export default function CareerApplicationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Loading Job Application Portal...</p>
        </div>
      </div>
    }>
      <ApplyFormContent />
    </Suspense>
  );
}
