'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Phone, MessageCircle, Copy, CheckCircle, Smartphone, User, Shield, Camera, FileText, ArrowRight, LogIn, Image as LucideImage, MapPin, Mail } from 'lucide-react';

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
  // Tech & Electronics
  {
    id: 'printer-tech',
    title: 'Printer & Copier Repair',
    subtitle: 'HP, Canon, Epson, Ricoh — paper jams, printheads, power faults & error codes',
    icon: 'fas fa-print',
    color: 'from-blue-600 to-indigo-600',
    badge: 'Tech Specialist',
    type: 'tech',
  },
  {
    id: 'gaming-console',
    title: 'Gaming Console Repair',
    subtitle: 'PlayStation (PS4/PS5), Xbox & Switch — HDMI ports, overheating & controller fix',
    icon: 'fas fa-gamepad',
    color: 'from-purple-600 to-pink-600',
    badge: 'Tech Specialist',
    type: 'tech',
  },
  {
    id: 'cctv-security',
    title: 'CCTV & Security Cameras',
    subtitle: 'Camera installation, recorder setup, phone live-view & wire repairs',
    icon: 'fas fa-video',
    color: 'from-cyan-600 to-blue-600',
    badge: 'Security Tech',
    type: 'tech',
  },
  {
    id: 'solar-inverter',
    title: 'Solar & Inverter Systems',
    subtitle: 'Battery banks, solar panels, hybrid inverters & backup wiring',
    icon: 'fas fa-solar-panel',
    color: 'from-amber-500 to-orange-600',
    badge: 'Power & Solar',
    type: 'tech',
  },
  {
    id: 'networking-wifi',
    title: 'Wi-Fi & Office Cabling',
    subtitle: 'Office internet cables, router setup, Wi-Fi booster & network setup',
    icon: 'fas fa-network-wired',
    color: 'from-teal-600 to-emerald-600',
    badge: 'IT Cabling',
    type: 'tech',
  },
  {
    id: 'audio-visual',
    title: 'TV & Projector Mounting',
    subtitle: 'Wall mounting for smart TVs, conference room projectors & audio systems',
    icon: 'fas fa-tv',
    color: 'from-red-600 to-rose-600',
    badge: 'Audio & Video',
    type: 'tech',
  },
  // Home & Office Trades
  {
    id: 'electrician',
    title: 'Certified Electricians',
    subtitle: 'House rewiring, circuit breaker trips, generator changeover switches & sockets',
    icon: 'fas fa-bolt',
    color: 'from-amber-600 to-yellow-600',
    badge: 'Certified Trade',
    type: 'trade',
  },
  {
    id: 'plumber',
    title: 'Plumbers & Pipe Fitters',
    subtitle: 'Water pumps, leaking pipes, overhead water tanks & bathroom fittings',
    icon: 'fas fa-faucet',
    color: 'from-sky-600 to-blue-700',
    badge: 'Certified Trade',
    type: 'trade',
  },
  {
    id: 'ac-refrigeration',
    title: 'AC & Fridge Technicians',
    subtitle: 'Split AC servicing, gas refilling, compressor repairs & cooling faults',
    icon: 'fas fa-snowflake',
    color: 'from-indigo-600 to-blue-500',
    badge: 'Certified Trade',
    type: 'trade',
  },
  {
    id: 'welder-metal',
    title: 'Welders & Metal Workers',
    subtitle: 'Burglar bars, security metal gates, iron railings & custom metal welding',
    icon: 'fas fa-fire',
    color: 'from-orange-600 to-red-600',
    badge: 'Fabrication',
    type: 'trade',
  },
  {
    id: 'carpenter',
    title: 'Carpenters & Woodworkers',
    subtitle: 'Door hanging, lock repairs, kitchen cabinets, office desks & roofing',
    icon: 'fas fa-hammer',
    color: 'from-amber-700 to-orange-800',
    badge: 'Artisan',
    type: 'trade',
  },
  {
    id: 'mason-builder',
    title: 'Masons, Tilers & Builders',
    subtitle: 'Floor tiling, bricklaying, wall plastering & building repairs',
    icon: 'fas fa-trowel',
    color: 'from-stone-600 to-stone-800',
    badge: 'Construction',
    type: 'trade',
  },
  {
    id: 'painter',
    title: 'Professional Painters',
    subtitle: 'Interior & exterior painting, weatherproofing & damp wall coating',
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

  // Customer Submission
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [customerSuccessTrackingId, setCustomerSuccessTrackingId] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Artisan Mode: 'register' vs 'login'
  const [artisanMode, setArtisanMode] = useState<'register' | 'login'>('register');

  // Artisan Registration Form State
  const [artisanName, setArtisanName] = useState('');
  const [artisanPhone, setArtisanPhone] = useState('');
  const [artisanPassword, setArtisanPassword] = useState('');
  const [artisanAddress, setArtisanAddress] = useState(''); // Mandatory (Must)
  const [artisanEmail, setArtisanEmail] = useState(''); // Optional
  const [artisanWhatsapp, setArtisanWhatsapp] = useState('');
  const [artisanMomo, setArtisanMomo] = useState('');
  const [artisanMomoNetwork, setArtisanMomoNetwork] = useState<'orange' | 'afri'>('orange');
  const [artisanTrade, setArtisanTrade] = useState('Printer & Copier Repair');
  const [artisanSecondary, setArtisanSecondary] = useState('');
  const [artisanExperience, setArtisanExperience] = useState('3');
  const [artisanCoverage, setArtisanCoverage] = useState<string[]>(['Central Freetown', 'Lumley']);
  const [artisanIdNumber, setArtisanIdNumber] = useState('');
  const [artisanBio, setArtisanBio] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Photos: Profile Photo + Strictly 2 ID Card Photos (Front and Back)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [idCardFrontPhoto, setIdCardFrontPhoto] = useState<string | null>(null);
  const [idCardBackPhoto, setIdCardBackPhoto] = useState<string | null>(null);

  // Hidden file input refs for Camera Shot vs Gallery Selection
  const profileCameraRef = useRef<HTMLInputElement>(null);
  const profileGalleryRef = useRef<HTMLInputElement>(null);
  const idFrontCameraRef = useRef<HTMLInputElement>(null);
  const idFrontGalleryRef = useRef<HTMLInputElement>(null);
  const idBackCameraRef = useRef<HTMLInputElement>(null);
  const idBackGalleryRef = useRef<HTMLInputElement>(null);

  // Payment Catch Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingProId, setPendingProId] = useState<string>('');
  const [paymentTransactionRef, setPaymentTransactionRef] = useState('');
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Artisan Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loggedInPro, setLoggedInPro] = useState<any | null>(null);
  const [loggedInJobs, setLoggedInJobs] = useState<any[]>([]);
  const [artisanError, setArtisanError] = useState<string | null>(null);
  const [artisanSuccess, setArtisanSuccess] = useState<string | null>(null);

  // Forgot Password / Account Recovery State
  const [resetMode, setResetMode] = useState<'idle' | 'request' | 'verify'>('idle');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetDelivery, setResetDelivery] = useState<'whatsapp' | 'email'>('whatsapp');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResponseData, setResetResponseData] = useState<any>(null);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeTab, filterType]);

  const selectedCategoryObj = TRADE_CATEGORIES.find(c => c.id === selectedCategory) || TRADE_CATEGORIES[0];

  const filteredCategories = TRADE_CATEGORIES.filter(cat => {
    if (filterType === 'all') return true;
    return cat.type === filterType;
  });

  const handleSelectCategory = (cat: TradeCategory) => {
    setSelectedCategory(cat.id);
    const formEl = document.getElementById('request-booking-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Image Upload to Base64
  const handleImageFile = (file: File, type: 'profile' | 'idFront' | 'idBack') => {
    if (file.size > 8 * 1024 * 1024) {
      alert('Photo is larger than 8MB. Please choose a smaller photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        if (type === 'profile') setProfilePhoto(e.target.result);
        if (type === 'idFront') setIdCardFrontPhoto(e.target.result);
        if (type === 'idBack') setIdCardBackPhoto(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Customer Request
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError(null);

    if (!customerName.trim() || !phone.trim() || !problemDescription.trim()) {
      setCustomerError('Please enter your full name, phone number, and what needs fixing.');
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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit service request');
      }

      setCustomerSuccessTrackingId(data.trackingId);
    } catch (err: any) {
      setCustomerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  // Pre-validate Artisan Registration & Open Payment Catch Popup
  const handlePreSubmitArtisan = (e: React.FormEvent) => {
    e.preventDefault();
    setArtisanError(null);

    if (!artisanName.trim() || !artisanPhone.trim() || !artisanTrade.trim()) {
      setArtisanError('Please fill in your full legal name, phone number, and trade.');
      return;
    }

    if (!artisanAddress.trim()) {
      setArtisanError('Please provide your residential / physical address in Freetown (mandatory).');
      return;
    }

    if (!artisanPassword || artisanPassword.length < 4) {
      setArtisanError('Please set a password of at least 4 digits/characters for your account.');
      return;
    }

    if (!profilePhoto) {
      setArtisanError('Please take or upload a full-size photo of yourself before proceeding.');
      return;
    }

    if (!idCardFrontPhoto) {
      setArtisanError('Please take or upload the FRONT side photo of your ID card.');
      return;
    }

    if (!idCardBackPhoto) {
      setArtisanError('Please take or upload the BACK side photo of your ID card.');
      return;
    }

    if (!agreedTerms) {
      setArtisanError('Please agree to the BridgeTech 15% platform management terms.');
      return;
    }

    // Generate reference ID and open payment catch popup
    const generatedId = `PRO-${Math.floor(1000 + Math.random() * 9000)}`;
    setPendingProId(generatedId);
    setShowPaymentModal(true);
  };

  // Complete Payment & Save Profile
  const handleConfirmPaymentAndRegister = async () => {
    setIsConfirmingPayment(true);
    setArtisanError(null);

    try {
      const res = await fetch('/api/on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_pro',
          id: pendingProId,
          fullName: artisanName,
          phone: artisanPhone,
          password: artisanPassword,
          whatsapp: artisanWhatsapp || artisanPhone,
          email: artisanEmail.trim() || undefined,
          address: artisanAddress.trim(),
          mobileMoneyNumber: artisanMomo || artisanPhone,
          mobileMoneyProvider: artisanMomoNetwork,
          primaryTrade: artisanTrade,
          secondarySkills: artisanSecondary || undefined,
          yearsOfExperience: artisanExperience,
          coverageAreas: artisanCoverage,
          nationalIdNumber: artisanIdNumber || undefined,
          profilePhoto: profilePhoto || undefined,
          idCardFrontPhoto: idCardFrontPhoto || undefined,
          idCardBackPhoto: idCardBackPhoto || undefined,
          idCardPhoto: idCardFrontPhoto || undefined,
          onboardingPaymentRef: paymentTransactionRef.trim() || 'Paid via Mobile Money',
          bioOrWorkSummary: artisanBio || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      setShowPaymentModal(false);
      setArtisanSuccess(`Your profile has been created! Reference ID: ${data.proId}. Our dispatch team will verify your payment and activate your jobs dashboard.`);
      setLoggedInPro(data.pro);
    } catch (err: any) {
      setArtisanError(err.message || 'Error completing registration');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  // Artisan Login
  const handleArtisanLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtisanError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login_pro',
          phone: loginPhone,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Sign in failed');
      }

      setLoggedInPro(data.pro);
      setLoggedInJobs(data.assignedJobs || []);
    } catch (err: any) {
      setArtisanError(err.message || 'Invalid login details');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ── ACCOUNT RECOVERY HANDLERS ──
  const handleRequestReset = async () => {
    if (!resetIdentifier.trim()) {
      setResetError('Please enter your phone number or email address.');
      return;
    }
    setResetError(null);
    setIsResetting(true);
    try {
      const res = await fetch('/api/on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_reset_code',
          identifier: resetIdentifier.trim(),
          delivery: resetDelivery,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not send reset code. Check your phone number or email.');
      }
      setResetResponseData(data);
      setResetSuccess(`Reset code sent! ${data.maskedTarget ? `Sent to: ${data.maskedTarget}` : ''}`);
      setResetMode('verify');
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset code.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleVerifyReset = async () => {
    if (!resetCodeInput.trim() || resetCodeInput.trim().length < 6) {
      setResetError('Please enter the 6-digit code you received.');
      return;
    }
    if (!resetNewPassword.trim() || resetNewPassword.trim().length < 4) {
      setResetError('New password must be at least 4 characters.');
      return;
    }
    setResetError(null);
    setIsResetting(true);
    try {
      const res = await fetch('/api/on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_reset_code',
          identifier: resetIdentifier.trim(),
          code: resetCodeInput.trim(),
          newPassword: resetNewPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired code.');
      }
      // Auto-login after successful reset
      setLoggedInPro(data.pro);
      setLoggedInJobs(data.assignedJobs || []);
      // Clear reset state
      setResetMode('idle');
      setResetIdentifier('');
      setResetCodeInput('');
      setResetNewPassword('');
      setResetResponseData(null);
      setResetError(null);
      setResetSuccess(null);
    } catch (err: any) {
      setResetError(err.message || 'Failed to verify code.');
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleCoverageArea = (area: string) => {
    setArtisanCoverage(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-red-500 selection:text-white">

      {/* ── CLEAN WHITE HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200/80 pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider mb-4 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>BridgeTech On-Demand Services · Freetown</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Find a Trusted Technician in <span className="text-red-600">Freetown</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-4 leading-relaxed">
            Need an expert right now? From printer repairs and gaming consoles to certified electricians and plumbers — we send a vetted professional to your door with a <strong>14-day warranty</strong>.
          </p>

          {/* Value Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-8 text-left scroll-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Shield className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">100% Vetted</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">ID card &amp; background checked</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">14-Day Warranty</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">If it breaks again, we fix it free</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Smartphone className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Fast Call-Out</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Emergency or scheduled visits</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-sm hover:shadow transition-shadow">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Official Invoicing</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Clear price quotes in Leones</p>
            </div>
          </div>

          {/* Simple Tab Switcher */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('customer')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'customer'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>I Need a Service (Book a Pro)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('artisan')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'artisan'
                    ? 'bg-[#040e40] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="fas fa-hard-hat text-xs" />
                <span>I Am a Technician (Join Network)</span>
                <span className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-amber-400 text-slate-900 text-[10px] rounded font-black">
                  Keep 85%
                </span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── TAB 1: CUSTOMER BOOKING FLOW ── */}
      {activeTab === 'customer' && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
          
          {/* Step 1: Service Categories Grid */}
          <section className="space-y-4 scroll-reveal opacity-0 translate-y-8 transition-all duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Step 1 of 2</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Choose the Service You Need</h2>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All (13)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('tech')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'tech' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Tech &amp; Electronics
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('trade')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === 'trade' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Home &amp; Trades
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredCategories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 relative ${
                      isSelected
                        ? 'bg-red-50/50 border-red-500 ring-2 ring-red-500/20 shadow-md'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                      <i className={`${cat.icon} text-lg`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {cat.badge}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-red-600">
                            <i className="fas fa-check-circle" /> Selected
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-tight mt-1 line-clamp-2">
                        {cat.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2: Request Form */}
          <section id="request-booking-form" className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-reveal opacity-0 translate-y-8 transition-all duration-700">
            
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Step 2 of 2</span>
                <h3 className="text-xl font-black text-slate-900">Tell Us What Needs Fixing</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selected: <strong className="text-slate-900">{selectedCategoryObj.title}</strong>
                </p>
              </div>

              {customerError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <i className="fas fa-exclamation-circle shrink-0 text-sm" />
                  <span>{customerError}</span>
                </div>
              )}

              {customerSuccessTrackingId ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Your Request Has Been Received!</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                      We are matching the nearest qualified technician in your area. You will receive a phone confirmation shortly.
                    </p>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 inline-block shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Your Tracking ID</span>
                    <span className="font-mono text-2xl font-black text-red-600">{customerSuccessTrackingId}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/23233399391?text=${encodeURIComponent(
                        `Hello BridgeTech, I just booked an on-demand service: ${selectedCategoryObj.title}. My Tracking ID is ${customerSuccessTrackingId}. Please confirm dispatch.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow"
                    >
                      <i className="fab fa-whatsapp text-sm" /> Confirm Instantly on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSuccessTrackingId(null);
                        setProblemDescription('');
                      }}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Book Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Area in Freetown *
                      </label>
                      <select
                        value={locationArea}
                        onChange={e => setLocationArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                      >
                        {FREETOWN_AREAS.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        How Urgent Is It? *
                      </label>
                      <select
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                      >
                        <option value="24h">Standard (Within 24 Hours)</option>
                        <option value="emergency">🚨 Emergency (Within 2–4 Hours)</option>
                        <option value="flexible">Flexible / Next Available Day</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street Address or Landmark *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Lumley Police Station, Yellow Building opposite church"
                      value={addressDetails}
                      onChange={e => setAddressDetails(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      What is the Problem? *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Please explain simply what is broken or what you need installed. E.g., 'Epson printer papers getting stuck and ink light blinking' or 'Breaker board tripping whenever AC turns on'..."
                      value={problemDescription}
                      onChange={e => setProblemDescription(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Mariama Kamara"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="e.g. 076 000 000"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="e.g. 076 000 000"
                        value={whatsapp}
                        onChange={e => setWhatsapp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                      <input
                        type="email"
                        placeholder="For receipt &amp; invoice"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingCustomer}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmittingCustomer ? (
                      <>
                        <i className="fas fa-spinner fa-spin" /> Dispatching Request...
                      </>
                    ) : (
                      <>
                        <span>Submit Request &amp; Send Technician</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Assurance */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>How You Are Protected</span>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Verified Identity:</strong> Every technician provides their National ID and full photo before entering the network.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>14-Day Warranty:</strong> If the repair fails or faults recur within 14 days, we fix it at no extra cost.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Transparent Quotes:</strong> Clear prices in Leones with optional installment plans.</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold block text-slate-900 mb-0.5">Need immediate phone support?</span>
                  Call our service desk: <strong>076210320</strong> / <strong>088294631</strong>
                </div>
              </div>

              {/* Technician Invitation */}
              <div className="bg-gradient-to-br from-slate-900 to-[#040e40] text-white rounded-3xl p-6 space-y-3 shadow-md">
                <span className="px-2.5 py-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded uppercase">
                  Technicians &amp; Artisans
                </span>
                <h4 className="text-base font-extrabold text-white leading-tight">
                  Want more high-paying clients in Freetown?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join our verified team, get regular job dispatches, and keep 85% of your earnings.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('artisan')}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Sign In or Apply as a Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </section>

        </main>
      )}

      {/* ── TAB 2: ARTISAN ONBOARDING & SIGN IN FLOW ── */}
      {activeTab === 'artisan' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
              Artisans &amp; Technicians Network
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              Join the BridgeTech Pro Network
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Get steady residential and corporate jobs across Freetown. We manage customer bookings, secure payment deposits, and disburse <strong>85%</strong> straight to your mobile money.
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Register */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setArtisanMode('register')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  artisanMode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create New Pro Profile
              </button>
              <button
                type="button"
                onClick={() => setArtisanMode('login')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  artisanMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Existing Account</span>
              </button>
            </div>
          </div>

          {/* If Logged In: Show Profile Dashboard */}
          {loggedInPro ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-4">
                  {loggedInPro.profilePhoto ? (
                    <img
                      src={loggedInPro.profilePhoto}
                      alt={loggedInPro.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                      {loggedInPro.fullName[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900">{loggedInPro.fullName}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        loggedInPro.status === 'verified_active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {loggedInPro.status === 'verified_active' ? 'Verified Active' : 'Under Review'}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 font-bold">{loggedInPro.primaryTrade}</p>
                    <p className="text-[11px] text-slate-500 font-mono">ID: {loggedInPro.id} &bull; Phone: {loggedInPro.phone}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoggedInPro(null);
                    setArtisanSuccess(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>

              {/* Status Notice */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Le 30 Commitment Fee Status:</span>
                  <span className={`font-black uppercase text-[11px] ${
                    loggedInPro.onboardingFeeStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {loggedInPro.onboardingFeeStatus === 'paid' ? '✓ Paid & Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Payout Mobile Money:</span>
                  <span className="font-mono font-bold text-slate-900">{loggedInPro.mobileMoneyNumber} ({loggedInPro.mobileMoneyProvider})</span>
                </div>
                {loggedInPro.address && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-700">Residential Address:</span>
                    <span className="font-medium text-slate-900 text-right">{loggedInPro.address}</span>
                  </div>
                )}
                {loggedInPro.email && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Email Address:</span>
                    <span className="font-mono text-slate-900">{loggedInPro.email}</span>
                  </div>
                )}
              </div>

              {/* Assigned Jobs */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                  Your Dispatched Jobs ({loggedInJobs.length})
                </h4>
                {loggedInJobs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center">
                    No active jobs assigned yet. Our operations team will notify you via call and WhatsApp when a job matches your area.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {loggedInJobs.map((job: any) => (
                      <div key={job.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-mono font-bold text-red-600">{job.id}</span>
                          <p className="font-bold text-slate-900">{job.customerName} &bull; {job.locationArea}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-md">{job.problemDescription}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-emerald-600 block">
                            {job.proPayoutAmount ? `Le ${job.proPayoutAmount.toLocaleString()}` : 'Pending Quote'}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase">{job.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : artisanMode === 'login' ? (
            /* ── ARTISAN LOGIN / FORGOT PASSWORD FLOW ── */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-md mx-auto space-y-4">

              {/* ── STAGE: Normal Login ── */}
              {resetMode === 'idle' && (
                <>
                  <div className="text-center border-b border-slate-200 pb-3">
                    <h3 className="text-lg font-black text-slate-900">Sign In to Your Pro Account</h3>
                    <p className="text-xs text-slate-500">Enter your registered phone number and password.</p>
                  </div>

                  {artisanError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                      {artisanError}
                    </div>
                  )}

                  <form onSubmit={handleArtisanLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Registered Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 076 000 000"
                        value={loginPhone}
                        onChange={e => setLoginPhone(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 bg-[#040e40] hover:bg-[#06155e] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isLoggingIn ? 'Signing In...' : 'Sign In to Dashboard'}
                    </button>
                  </form>

                  <div className="flex flex-col items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setResetMode('request'); setResetError(null); setResetSuccess(null); }}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      🔑 Forgot your password?
                    </button>
                    <p className="text-center text-xs text-slate-500">
                      Don&apos;t have a profile yet?{' '}
                      <button
                        type="button"
                        onClick={() => setArtisanMode('register')}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Create one now
                      </button>
                    </p>
                  </div>
                </>
              )}

              {/* ── STAGE: Request Reset Code ── */}
              {resetMode === 'request' && (
                <>
                  <div className="text-center border-b border-slate-200 pb-3">
                    <div className="text-3xl mb-1">🔑</div>
                    <h3 className="text-lg font-black text-slate-900">Reset Your Password</h3>
                    <p className="text-xs text-slate-500">We will send you a 6-digit code to verify it&apos;s you.</p>
                  </div>

                  {resetError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{resetError}</div>
                  )}

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Phone Number or Email</label>
                      <input
                        type="text"
                        placeholder="e.g. 076 000 000 or you@email.com"
                        value={resetIdentifier}
                        onChange={e => setResetIdentifier(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Enter the phone or email you registered with.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">How should we send the code?</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setResetDelivery('whatsapp')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${resetDelivery === 'whatsapp' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-600 border-slate-300 hover:border-green-400'}`}
                        >
                          <i className="fab fa-whatsapp" /> WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => setResetDelivery('email')}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${resetDelivery === 'email' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}
                        >
                          ✉ Email
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRequestReset}
                      disabled={isResetting}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isResetting ? 'Sending...' : 'Send My Reset Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setResetMode('idle'); setResetError(null); }}
                      className="w-full text-xs text-slate-500 hover:text-slate-800 font-semibold py-1"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </>
              )}

              {/* ── STAGE: Enter Code + New Password ── */}
              {resetMode === 'verify' && (
                <>
                  <div className="text-center border-b border-slate-200 pb-3">
                    <div className="text-3xl mb-1">📲</div>
                    <h3 className="text-lg font-black text-slate-900">Enter Your Reset Code</h3>
                    <p className="text-xs text-slate-500">
                      {resetResponseData?.maskedTarget
                        ? <>Code sent to <strong>{resetResponseData.maskedTarget}</strong>. It expires in 15 minutes.</>
                        : 'Check your phone or email for the 6-digit code.'}
                    </p>
                  </div>

                  {resetError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">{resetError}</div>
                  )}
                  {resetSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs">{resetSuccess}</div>
                  )}

                  {/* Show the code on-screen (since no live SMS/email gateway) */}
                  {resetResponseData?.code && (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-1">
                      <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Your Reset Code</p>
                      <p className="text-3xl font-black text-amber-800 tracking-widest font-mono">{resetResponseData.code}</p>
                      <p className="text-[10px] text-amber-600">Copy this code and enter it below.</p>
                    </div>
                  )}

                  {/* WhatsApp link to send code via message */}
                  {resetDelivery === 'whatsapp' && resetResponseData?.whatsappUrl && (
                    <a
                      href={resetResponseData.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl"
                    >
                      <i className="fab fa-whatsapp text-sm" />
                      Open WhatsApp to Send Code to Yourself
                    </a>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="e.g. 482910"
                        value={resetCodeInput}
                        onChange={e => setResetCodeInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold tracking-widest text-center focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="Choose a new password (min. 4 characters)"
                        value={resetNewPassword}
                        onChange={e => setResetNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyReset}
                      disabled={isResetting}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isResetting ? 'Verifying...' : '✓ Confirm & Set New Password'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setResetMode('request'); setResetError(null); setResetSuccess(null); }}
                      className="w-full text-xs text-slate-500 hover:text-slate-800 font-semibold py-1"
                    >
                      ← Try a Different Number / Email
                    </button>
                  </div>
                </>
              )}

            </div>
          ) : (
            /* ── ARTISAN REGISTRATION FORM ── */
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Artisan Application</span>
                <h3 className="text-xl font-black text-slate-900">Create Your Pro Profile</h3>
                <p className="text-xs text-slate-500">
                  Please provide clear information. A full photo and valid ID are required for customer safety.
                </p>
              </div>

              {artisanError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <i className="fas fa-exclamation-circle shrink-0 text-sm" />
                  <span>{artisanError}</span>
                </div>
              )}

              {artisanSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                  {artisanSuccess}
                </div>
              )}

              <form onSubmit={handlePreSubmitArtisan} className="space-y-5">
                
                {/* ── HIDDEN FILE INPUTS FOR CAMERA SHOT VS GALLERY SELECTION ── */}
                <input
                  ref={profileCameraRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'profile')}
                />
                <input
                  ref={profileGalleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'profile')}
                />

                <input
                  ref={idFrontCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'idFront')}
                />
                <input
                  ref={idFrontGalleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'idFront')}
                />

                <input
                  ref={idBackCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'idBack')}
                />
                <input
                  ref={idBackGalleryRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'idBack')}
                />

                {/* ── SECTION 1: APPLICANT PHOTO & ID CARD UPLOADS ── */}
                <div className="space-y-4 p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>Identity Verification Photos</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      On mobile, tap <strong>Camera Shot</strong> to take a photo instantly or <strong>From Gallery</strong> to pick an existing image.
                    </p>
                  </div>

                  {/* 1. Full Photo of Yourself */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-red-600" />
                      <span>1. Full-Size Photo of Yourself *</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Take a clear selfie or upload a full photo of yourself so customers can recognize you on arrival.
                    </p>

                    {profilePhoto ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={profilePhoto}
                          alt="Profile preview"
                          className="w-24 h-28 object-cover rounded-xl border-2 border-emerald-500 shadow-sm"
                        />
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md block w-fit">
                            ✓ Photo Uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() => setProfilePhoto(null)}
                            className="text-xs text-red-600 hover:text-red-700 font-bold underline"
                          >
                            Remove or Retake
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-white border border-slate-300 rounded-xl space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => profileCameraRef.current?.click()}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Camera className="w-3.5 h-3.5 text-red-400" />
                            <span>Take Camera Shot</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => profileGalleryRef.current?.click()}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors"
                          >
                            <LucideImage className="w-3.5 h-3.5 text-blue-500" />
                            <span>Select from Gallery</span>
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 block">Clear headshot or full-body photo (JPG/PNG, max 8MB)</span>
                      </div>
                    )}
                  </div>

                  {/* 2. ID Card Photos (Strictly Two Photos: Front and Back) */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>2. ID Card Photos (Strictly 2 Photos: Front &amp; Back) *</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Upload your Voter ID Card, National ID, or Passport. Both front and back are required for verification.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* ID FRONT */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Front Side of ID *</span>
                          {idCardFrontPhoto && (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ Front Added
                            </span>
                          )}
                        </div>

                        {idCardFrontPhoto ? (
                          <div className="space-y-1.5">
                            <img
                              src={idCardFrontPhoto}
                              alt="ID Front preview"
                              className="w-full h-28 object-cover rounded-lg border border-blue-400 shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setIdCardFrontPhoto(null)}
                              className="text-xs text-red-600 hover:text-red-700 font-bold underline block"
                            >
                              Retake Front
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => idFrontCameraRef.current?.click()}
                                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                              >
                                <Camera className="w-3 h-3 text-red-400" />
                                <span>Camera Shot</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => idFrontGalleryRef.current?.click()}
                                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-slate-200"
                              >
                                <LucideImage className="w-3 h-3 text-blue-500" />
                                <span>From Gallery</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block text-center">Capture the front face of your ID</span>
                          </div>
                        )}
                      </div>

                      {/* ID BACK */}
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Back Side of ID *</span>
                          {idCardBackPhoto && (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ Back Added
                            </span>
                          )}
                        </div>

                        {idCardBackPhoto ? (
                          <div className="space-y-1.5">
                            <img
                              src={idCardBackPhoto}
                              alt="ID Back preview"
                              className="w-full h-28 object-cover rounded-lg border border-blue-400 shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setIdCardBackPhoto(null)}
                              className="text-xs text-red-600 hover:text-red-700 font-bold underline block"
                            >
                              Retake Back
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => idBackCameraRef.current?.click()}
                                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs"
                              >
                                <Camera className="w-3 h-3 text-red-400" />
                                <span>Camera Shot</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => idBackGalleryRef.current?.click()}
                                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-slate-200"
                              >
                                <LucideImage className="w-3 h-3 text-blue-500" />
                                <span>From Gallery</span>
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block text-center">Capture the back face of your ID</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ibrahim Mansaray"
                      value={artisanName}
                      onChange={e => setArtisanName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Trade / Specialty *</label>
                    <select
                      value={artisanTrade}
                      onChange={e => setArtisanTrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                    >
                      {TRADE_CATEGORIES.map(c => (
                        <option key={c.id} value={c.title}>{c.title}</option>
                      ))}
                      <option value="Other Specialist">Other Specialty</option>
                    </select>
                  </div>
                </div>

                {/* Mandatory Address (Must) and Optional Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-600" />
                      <span>Full Residential Address in Freetown * <span className="text-red-600 font-black">(Must)</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Wilkinson Road, near NP Junction, Freetown"
                      value={artisanAddress}
                      onChange={e => setArtisanAddress(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Must be your physical home or workshop address.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address <span className="text-slate-400 font-normal">(Optional)</span></span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. yourname@gmail.com"
                      value={artisanEmail}
                      onChange={e => setArtisanEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Optional. For electronic statements and receipts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Calls) *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 076 000 000"
                      value={artisanPhone}
                      onChange={e => setArtisanPhone(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Create Account Password *</label>
                    <input
                      type="password"
                      placeholder="At least 4 characters"
                      value={artisanPassword}
                      onChange={e => setArtisanPassword(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={artisanExperience}
                      onChange={e => setArtisanExperience(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Mobile Money Payout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">
                      Mobile Money Number for Your Payouts *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 076 000 000"
                      value={artisanMomo}
                      onChange={e => setArtisanMomo(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Network Provider *</label>
                    <select
                      value={artisanMomoNetwork}
                      onChange={e => setArtisanMomoNetwork(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                    >
                      <option value="orange">Orange Money</option>
                      <option value="afri">Afrimoney</option>
                    </select>
                  </div>
                </div>

                {/* Operating Areas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Areas in Freetown You Can Work In:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FREETOWN_AREAS.map(a => {
                      const checked = artisanCoverage.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleCoverageArea(a)}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center justify-between ${
                            checked
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{a}</span>
                          {checked && <span className="text-emerald-600 font-bold text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs text-slate-700 leading-snug">
                      I agree that BridgeTech keeps a <strong>15% platform fee</strong> on completed jobs while I receive 85%. I agree to pay the one-time <strong>Le 30 commitment fee</strong> to activate my verified account.
                    </span>
                  </label>
                </div>

                {/* Catch Button: Pops up the payment modal */}
                <button
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>Submit &amp; Pay Le 30 Commitment Fee</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </main>
      )}

      {/* ── POPUP: LE 30 COMMITMENT FEE PAYMENT MODAL (Matching Shop Payment System) ── */}
      {showPaymentModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setShowPaymentModal(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <div 
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden pointer-events-auto transform transition-all duration-300 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-[#040e40] p-5 sm:p-6 text-center text-white flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-red-600 shadow-sm">
                  <Phone className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black mb-1">Complete Your Commitment Fee</h2>
                <p className="text-xs sm:text-sm text-red-100">Mobile Money Payment Instructions</p>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-slate-900">
                
                {/* Reference & Amount */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-500 text-xs sm:text-sm">Pro Applicant ID:</span>
                    <span className="text-slate-900 font-mono font-bold text-sm sm:text-base">{pendingProId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs sm:text-sm">Onboarding Fee:</span>
                    <span className="text-emerald-600 font-black text-xl font-mono">Le 30</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  To verify your identity and activate your account, pay the <strong>Le 30</strong> commitment fee using Orange Money or AfriMoney below:
                </p>

                {/* Orange Money */}
                <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                        OM
                      </div>
                      <span className="font-extrabold text-sm text-orange-950">Orange Money</span>
                    </div>
                    <span className="text-xs font-mono font-black text-orange-900">076210320</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <a
                      href="tel:*144*2*2*241586%23"
                      className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold text-center shadow-sm"
                    >
                      Dial USSD (*144#)
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('076210320', 'orange')}
                      className="px-3 py-2 bg-white border border-orange-300 text-orange-800 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedField === 'orange' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* AfriMoney */}
                <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                        AF
                      </div>
                      <span className="font-extrabold text-sm text-red-950">AfriMoney</span>
                    </div>
                    <span className="text-xs font-mono font-black text-red-900">088294631</span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <a
                      href="tel:*161*6*2*088294631%23"
                      className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold text-center shadow-sm"
                    >
                      Dial USSD (*161#)
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('088294631', 'afri')}
                      className="px-3 py-2 bg-white border border-red-300 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedField === 'afri' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Transaction Ref Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Enter Your Mobile Money Transaction ID / Reference:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OM-TXN-12345 or AFRI-98765"
                    value={paymentTransactionRef}
                    onChange={e => setPaymentTransactionRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-red-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    Copy the transaction ID from your SMS receipt and paste it above.
                  </p>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmPaymentAndRegister}
                  disabled={isConfirmingPayment}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isConfirmingPayment ? (
                    <>
                      <i className="fas fa-spinner fa-spin" /> Verifying &amp; Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm Payment &amp; Complete Registration</span>
                    </>
                  )}
                </button>

                {/* WhatsApp Help */}
                <div className="text-center pt-2">
                  <a
                    href={`https://wa.me/23233399391?text=${encodeURIComponent(
                      `Hello BridgeTech, I am paying the Le 30 commitment fee for my Artisan Profile (${pendingProId}). Name: ${artisanName}. Kindly verify my payment.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 hover:underline font-bold inline-flex items-center gap-1.5"
                  >
                    <i className="fab fa-whatsapp text-sm" />
                    <span>Send Payment Screenshot via WhatsApp</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
