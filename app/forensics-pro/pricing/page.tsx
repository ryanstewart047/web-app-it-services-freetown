'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BRAND_AVATAR_TRANSPARENT_SRC, BRAND_NAME } from '@/lib/brand';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing: string;
  badge?: string;
  popular?: boolean;
  buttonText: string;
  isFree?: boolean;
  features: string[];
}

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Community Free',
    price: '$0.00',
    billing: 'free forever • no card required',
    buttonText: 'Install Free Extension',
    isFree: true,
    features: [
      '5 Daily Forensic & ELA Image Audits',
      'Standard Error Level Analysis (ELA)',
      'Basic Hardware EXIF Metadata (Camera Make/Model)',
      'Basic Image Dimensions & Size Summary',
      'Right-Click Web Image Inspector',
      'Chrome & Microsoft Edge Extension Access',
    ],
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$4.99',
    billing: 'billed monthly • cancel anytime',
    buttonText: 'Get Pro Monthly ($4.99)',
    features: [
      'Unlimited Forensic & ELA Analyses (No Daily Limits)',
      'Full Multi-Compression ELA (70% - 98% quality scales)',
      'Deep AI & Synthetic Image Signature Scanner',
      'AI Generator Detection (Midjourney, DALL-E, SD, Flux)',
      'GPS Geolocation Coordinates & Google Maps Link',
      'Luminance Gradient & Shadow Consistency Filter',
      'Color Channel Splitter (RGB, Solarise, Sobel Edges)',
      'Export Official Cryptographic SHA-256 PDF Dossiers',
    ],
  },
  {
    id: 'lifetime',
    name: 'Founder Lifetime',
    price: '$39.00',
    billing: 'one-time payment • lifetime access',
    badge: 'BEST VALUE',
    popular: true,
    buttonText: 'Get Lifetime License ($39)',
    features: [
      'Everything in Pro Monthly, FOREVER',
      'Zero monthly subscription fees',
      'High-Resolution ELA Magnification Engine (up to 40x)',
      'Priority updates to new synthetic AI models',
      'Unlimited Court & Journalism-Ready PDF Dossiers',
      'Multi-device license (up to 5 browsers/PCs)',
      'Direct Priority Technician Support from BridgeTech',
    ],
  },
];

// Client-side card brand helper
function detectCardBrand(num: string) {
  const clean = num.replace(/\D/g, '');
  if (/^4/.test(clean)) return { name: 'Visa', icon: 'fa-cc-visa', color: 'text-blue-400', cvcLen: 3 };
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return { name: 'Mastercard', icon: 'fa-cc-mastercard', color: 'text-orange-400', cvcLen: 3 };
  if (/^3[47]/.test(clean)) return { name: 'Amex', icon: 'fa-cc-amex', color: 'text-cyan-400', cvcLen: 4 };
  if (/^(6011|65|64[4-9]|622)/.test(clean)) return { name: 'Discover', icon: 'fa-cc-discover', color: 'text-amber-400', cvcLen: 3 };
  if (/^(30[0-5]|36|38)/.test(clean)) return { name: 'Diners', icon: 'fa-cc-diners-club', color: 'text-sky-400', cvcLen: 3 };
  if (/^(2131|1800|35)/.test(clean)) return { name: 'JCB', icon: 'fa-cc-jcb', color: 'text-emerald-400', cvcLen: 3 };
  return { name: 'Card', icon: 'fa-credit-card', color: 'text-slate-400', cvcLen: 3 };
}

// Client-side Luhn Check
function checkLuhn(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isNaN(digit)) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export default function ForensicsPricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('lifetime');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  
  // Card form states
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [billingZip, setBillingZip] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const brandInfo = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
  const isCardLuhnValid = useMemo(() => checkLuhn(cardNumber), [cardNumber]);

  const handlePlanClick = (plan: PricingPlan) => {
    if (plan.isFree) {
      window.location.href = '/digital-tools#metadata-inspector';
      return;
    }
    setSelectedPlan(plan.id);
    setPurchasedKey(null);
    setErrorMessage(null);
    setCheckoutModalOpen(true);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 19);
    let formatted = '';
    // Format 4-4-4-4 for standard cards or 4-6-5 for Amex
    if (raw.startsWith('34') || raw.startsWith('37')) {
      // Amex format: 4 - 6 - 5
      if (raw.length > 10) formatted = `${raw.slice(0, 4)} ${raw.slice(4, 10)} ${raw.slice(10, 15)}`;
      else if (raw.length > 4) formatted = `${raw.slice(0, 4)} ${raw.slice(4, 10)}`;
      else formatted = raw;
    } else {
      formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    
    // Auto-fix single digit months > 1 (e.g. typing '5' -> '05/')
    if (raw.length === 1 && parseInt(raw, 10) > 1) {
      raw = `0${raw}`;
    }

    // Validate month <= 12
    if (raw.length >= 2) {
      const month = parseInt(raw.slice(0, 2), 10);
      if (month > 12) {
        raw = `12${raw.slice(2)}`;
      } else if (month === 0) {
        raw = `01${raw.slice(2)}`;
      }
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side strict pre-checks
    if (!customerName || customerName.trim().length < 3) {
      setErrorMessage('Please enter your full cardholder name.');
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const cleanCardDigits = cardNumber.replace(/\D/g, '');
    if (cleanCardDigits.length < 13) {
      setErrorMessage('Please enter a complete 15 or 16-digit card number.');
      return;
    }

    if (!isCardLuhnValid) {
      setErrorMessage('❌ Invalid card number: Checksum validation failed. Please check for typos.');
      return;
    }

    // Expiry check
    if (!cardExpiry || !cardExpiry.includes('/') || cardExpiry.split('/')[1]?.length < 2) {
      setErrorMessage('Please enter a valid expiration date (MM/YY).');
      return;
    }

    const [expM, expY] = cardExpiry.split('/').map((s) => parseInt(s.trim(), 10));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (expY < currentYear || (expY === currentYear && expM < currentMonth)) {
      setErrorMessage(`❌ Card Expired: The expiration date (${cardExpiry}) is in the past.`);
      return;
    }

    if (cardCvc.length < brandInfo.cvcLen) {
      setErrorMessage(`Security code (CVC) must be ${brandInfo.cvcLen} digits for ${brandInfo.name}.`);
      return;
    }

    if (!billingZip || billingZip.trim().length < 3) {
      setErrorMessage('Please enter your billing ZIP/postal code.');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/forensics/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          customerName,
          customerEmail,
          cardNumber,
          cardExpiry,
          cardCvc,
          billingZip,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPurchasedKey(data.licenseKey);
      } else {
        setErrorMessage(data.error || 'Payment failed: Could not authorize card with issuing bank.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'A connection error occurred. Please check your internet and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activePlanObj = PLANS.find((p) => p.id === selectedPlan) || PLANS[2];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={BRAND_AVATAR_TRANSPARENT_SRC}
              alt={BRAND_NAME}
              width={36}
              height={36}
              className="object-contain group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="text-base font-black tracking-tight text-white leading-none">
                BridgeTech <span className="text-red-500">Forensics</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">ForensicLens Pro Official Store</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/digital-tools#metadata-inspector"
              className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
            >
              ← Back to Web Tools
            </Link>
            <button
              onClick={() => handlePlanClick(PLANS[2])}
              className="text-xs font-bold bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white px-3.5 py-1.5 rounded-lg transition-all shadow-md"
            >
              Get Pro ($39)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            ForensicLens Pro Licensing
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Forensic Investigation</span> Tier
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            From basic community audits to unlimited deepfake detection, high-resolution ELA magnification, and exportable legal court dossiers.
          </p>
        </div>

        {/* Pricing Cards Grid (Free, Monthly, Lifetime) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-slate-900/90 border-cyan-500 shadow-2xl shadow-cyan-950/50 scale-105 z-10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="text-base font-bold text-white mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                </div>
                <div className="text-xs text-slate-400 mb-6">{plan.billing}</div>

                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <i className="fas fa-check text-cyan-400 mt-0.5 flex-shrink-0"></i>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                  plan.popular
                    ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:opacity-90 text-white'
                    : plan.isFree
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-black'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-16">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Comprehensive Plan Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Capability</th>
                  <th className="pb-3 font-semibold text-center w-32">Community Free</th>
                  <th className="pb-3 font-semibold text-center w-40 text-cyan-400">ForensicLens PRO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 font-medium">Daily Image Scans</td>
                  <td className="py-3 text-center text-slate-400">5 / day</td>
                  <td className="py-3 text-center font-bold text-cyan-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Error Level Analysis (ELA)</td>
                  <td className="py-3 text-center text-slate-400">Standard 88% JPEG</td>
                  <td className="py-3 text-center font-bold text-cyan-400">Multi-Scale (70% - 98% + 40x Contrast)</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Deep AI & Synthetic Signature Detection</td>
                  <td className="py-3 text-center text-slate-500">✕ Basic</td>
                  <td className="py-3 text-center font-bold text-cyan-400">✓ Full Spectral & Diffusion Markers</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Full Hardware EXIF & GPS Coordinates</td>
                  <td className="py-3 text-center text-slate-400">Summary Only</td>
                  <td className="py-3 text-center font-bold text-cyan-400">✓ Complete Raw IFD Table + Maps</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Cryptographic SHA-256 PDF Dossiers</td>
                  <td className="py-3 text-center text-slate-500">✕ Locked</td>
                  <td className="py-3 text-center font-bold text-cyan-400">✓ Court & Journalism Admissible</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Right-Click Web Image Inspector</td>
                  <td className="py-3 text-center text-emerald-400">✓ Included</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓ Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border border-slate-800 rounded-2xl p-6 bg-slate-900/30 space-y-4">
          <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
          <div className="space-y-3 text-xs text-slate-400">
            <div>
              <strong className="text-slate-200 block mb-0.5">How does the license key work?</strong>
              After checkout, you immediately receive a unique key (e.g. <code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">BTFL-PRO-XXXX-XXXX-XXXX</code>) on-screen and via email. Enter this in the extension to activate Pro instantly.
            </div>
            <div>
              <strong className="text-slate-200 block mb-0.5">Which payment methods are accepted?</strong>
              We accept all major <strong>Credit and Debit Cards (Visa, Mastercard, American Express, Discover)</strong> with real-time bank verification and 256-bit SSL encryption.
            </div>
            <div>
              <strong className="text-slate-200 block mb-0.5">Does the extension work on Edge and Brave?</strong>
              Yes! Because ForensicLens is built on Manifest V3, it runs natively on Google Chrome, Microsoft Edge, Brave, and Opera.
            </div>
          </div>
        </div>
      </main>

      {/* Credit / Debit Card Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            {!purchasedKey ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <div className="text-lg font-black text-white">
                    Secure Bank Card Checkout
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-6">
                  Selected Plan: <strong className="text-cyan-400">{activePlanObj.name} ({activePlanObj.price})</strong>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <i className="fas fa-triangle-exclamation text-red-400 mt-0.5 flex-shrink-0"></i>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ryan Stewart"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Email Address (For Key)
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Card Number
                      </label>
                      <div className="flex items-center gap-1 text-xs">
                        <i className={`fab ${brandInfo.icon} ${brandInfo.color}`}></i>
                        <span className={`text-[10px] font-bold ${brandInfo.color}`}>{brandInfo.name}</span>
                        {cardNumber.length >= 15 && (
                          <span className={`text-[10px] ml-1 font-bold ${isCardLuhnValid ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCardLuhnValid ? '✓ Valid' : '✕ Invalid Number'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className={`w-full bg-slate-950 border rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none tracking-wider ${
                          cardNumber.length >= 15 && !isCardLuhnValid
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-slate-700 focus:border-cyan-500'
                        }`}
                      />
                      <i className={`fab ${brandInfo.icon} absolute right-3 top-1/2 -translate-y-1/2 ${brandInfo.color}`}></i>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Expires (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 font-mono text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        maxLength={brandInfo.cvcLen}
                        required
                        placeholder={brandInfo.cvcLen === 4 ? '1234' : '123'}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, brandInfo.cvcLen))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 font-mono text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Billing ZIP
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ZIP / Postal"
                        value={billingZip}
                        onChange={(e) => setBillingZip(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 text-center focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-lock'}`}></i>
                      <span>{isProcessing ? 'Verifying with Bank & Checking Funds...' : `Authorize & Pay ${activePlanObj.price}`}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                    <span>🔒 256-Bit Bank Level Encryption</span>
                    <span>•</span>
                    <span>Direct Merchant Payout</span>
                  </div>
                </form>
              </div>
            ) : (
              /* Success & Key Screen */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-950/50">
                  ✓
                </div>
                <div>
                  <div className="text-xl font-black text-white">Payment Authorized & Verified!</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Your ForensicLens Pro license key has been verified and sent to <strong>{customerEmail}</strong>.
                  </div>
                </div>

                <div className="bg-slate-950 border-2 border-cyan-500 rounded-2xl p-4 space-y-3">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Your Pro License Key</div>
                  <div className="font-mono text-base font-black text-cyan-400 select-all tracking-widest bg-slate-900 py-2 rounded-lg border border-slate-800">
                    {purchasedKey}
                  </div>
                  <button
                    onClick={() => handleCopyKey(purchasedKey)}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs rounded-xl transition-all shadow-md"
                  >
                    {copiedKey ? '✓ Copied to Clipboard!' : '📋 Copy License Key'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <strong>How to activate:</strong> Open the BridgeTech ForensicLens extension side panel, click <strong>&quot;Have a Pro Key?&quot;</strong> in the footer, paste your key, and click <strong>Activate License</strong>.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
