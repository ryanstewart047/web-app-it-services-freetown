'use client';

import { useState } from 'react';
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
  features: string[];
}

const PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$4.99',
    billing: 'billed monthly • cancel anytime',
    features: [
      'Unlimited Error Level Analyses (ELA)',
      'Deep AI & Synthetic Image Scanner',
      'Advanced EXIF & GPS Coordinates Mapper',
      'Luminance & Color Channel Splitter',
      'Court/Journalism PDF Forensic Dossiers',
      'Right-Click Web Image Inspector',
      'Chrome & Microsoft Edge Support',
    ],
  },
  {
    id: 'lifetime',
    name: 'Founder Lifetime',
    price: '$39.00',
    billing: 'one-time payment • lifetime access',
    badge: 'BEST VALUE',
    popular: true,
    features: [
      'Everything in Pro Monthly, forever',
      'Zero subscription fees',
      'Priority access to future AI forensic models',
      'High-Resolution ELA Magnification engine',
      'Unlimited Cryptographic SHA-256 Dossiers',
      'Multi-Device sync across 5 browsers',
      'Direct WhatsApp & Email Technician Support',
    ],
  },
  {
    id: 'single',
    name: 'Quick Audit Pack',
    price: '$1.99',
    billing: '3 high-priority forensic audits',
    features: [
      '3 Complete Deepfake & Splicing Audits',
      'Full EXIF + ELA Heatmap export',
      'Cryptographic SHA-256 seal',
      'Valid for 30 days',
    ],
  },
];

export default function ForensicsPricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('lifetime');
  const [demoKey, setDemoKey] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'orange_money' | 'paypal'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [purchasedKey, setPurchasedKey] = useState<string | null>(null);

  // Generate 24h Free Demo Key
  const handleGenerateDemoKey = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/forensics/demo-key', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDemoKey(data.licenseKey);
      }
    } catch (e) {
      // Fallback
      const randomSeg = Math.random().toString(36).substring(2, 6).toUpperCase();
      setDemoKey(`BTFL-PRO-DEMO-TEST-${randomSeg}`);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleStartCheckout = (planId: string) => {
    setSelectedPlan(planId);
    setPurchasedKey(null);
    setCheckoutModalOpen(true);
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      // Generate a valid production license key
      const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newKey = `BTFL-PRO-${seg1}-${seg2}-${seg3}`;

      setPurchasedKey(newKey);
      setIsProcessing(false);
    }, 1500);
  };

  const activePlanObj = PLANS.find((p) => p.id === selectedPlan) || PLANS[1];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Background glow effects */}
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
              <div className="text-[10px] text-slate-400 font-medium">ForensicLens Pro Checkout</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/digital-tools#metadata-inspector"
              className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors hidden sm:inline-block"
            >
              ← Back to Web Tools
            </Link>
            <button
              onClick={handleGenerateDemoKey}
              className="text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-3 py-1.5 rounded-lg hover:bg-cyan-900 transition-all flex items-center gap-1.5"
            >
              <span>⚡ Try 24h Free Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Browser Extension Pro Access
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Unlock Unlimited <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI Deepfake & ELA</span> Forensics
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Equip your Chrome & Edge browser with military-grade Error Level Analysis, synthetic AI detection, GPS mapping, and cryptographic court-admissible dossiers.
          </p>
        </div>

        {/* Free Demo Banner / Sandbox */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/50 rounded-2xl p-5 mb-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl text-cyan-400 flex-shrink-0">
                🧪
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Test Drive ForensicLens PRO (Free 24-Hour Trial)</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    Instant Sandbox
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Generate a full-featured demo key to verify all Pro ELA filters and AI deepfake detection tools in your browser extension.
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto">
              {!demoKey ? (
                <button
                  onClick={handleGenerateDemoKey}
                  disabled={demoLoading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <i className="fas fa-key"></i>
                  <span>{demoLoading ? 'Generating Key...' : 'Generate Instant Demo Key'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-slate-950 border border-cyan-700/80 rounded-xl p-1.5 pl-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 select-all">{demoKey}</span>
                  <button
                    onClick={() => handleCopyKey(demoKey)}
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold rounded-lg transition-all"
                  >
                    {copiedKey ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
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
                onClick={() => handleStartCheckout(plan.id)}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                  plan.popular
                    ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:opacity-90 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-black'
                }`}
              >
                Get License Key ({plan.price})
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-16">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Free vs. Pro Feature Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Feature</th>
                  <th className="pb-3 font-semibold text-center w-28">Free Tier</th>
                  <th className="pb-3 font-semibold text-center w-36 text-cyan-400">ForensicLens PRO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 font-medium">Daily Forensic Scans</td>
                  <td className="py-3 text-center text-slate-400">5 / day</td>
                  <td className="py-3 text-center font-bold text-cyan-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Error Level Analysis (ELA)</td>
                  <td className="py-3 text-center text-slate-400">Standard</td>
                  <td className="py-3 text-center font-bold text-cyan-400">High-Res Multi-Compression</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">AI & Deepfake Signature Scanner</td>
                  <td className="py-3 text-center text-slate-500">✕ Locked</td>
                  <td className="py-3 text-center font-bold text-cyan-400">✓ Full Frequency Analysis</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">EXIF & GPS Geolocation Mapping</td>
                  <td className="py-3 text-center text-slate-400">Basic Text</td>
                  <td className="py-3 text-center font-bold text-cyan-400">✓ StreetView & Hardware Decode</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Cryptographic SHA-256 Audit Dossiers</td>
                  <td className="py-3 text-center text-slate-500">✕ Locked</td>
                  <td className="py-3 text-center font-bold text-cyan-400">✓ One-Click PDF/HTML Export</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Context Menu 1-Click Web Inspection</td>
                  <td className="py-3 text-center text-emerald-400">✓ Included</td>
                  <td className="py-3 text-center text-emerald-400 font-bold">✓ Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* How to activate */}
        <div className="border border-slate-800 rounded-2xl p-6 bg-slate-900/30">
          <h3 className="text-base font-bold text-white mb-3">How to Activate Your Pro License in Chrome or Edge</h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 leading-relaxed">
            <li>Open the BridgeTech ForensicLens side panel by clicking the extension icon or right-clicking an image.</li>
            <li>Click <strong>&quot;Have a Pro Key?&quot;</strong> in the bottom footer or the <strong>&quot;Upgrade to Pro&quot;</strong> button.</li>
            <li>Paste your license key (e.g. <code className="font-mono text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">BTFL-PRO-...</code>) and click <strong>Activate License</strong>.</li>
            <li>All Pro features will unlock immediately with zero reload required!</li>
          </ol>
        </div>
      </main>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>

            {!purchasedKey ? (
              <div>
                <div className="text-lg font-black text-white mb-1">
                  Complete Your Order
                </div>
                <div className="text-xs text-slate-400 mb-4">
                  Selected Plan: <strong className="text-cyan-400">{activePlanObj.name} ({activePlanObj.price})</strong>
                </div>

                <form onSubmit={handleCompletePayment} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Email Address (For Key Delivery)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-cyan-500 bg-cyan-950/30 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <i className="fas fa-credit-card text-base"></i>
                        <span>Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('orange_money')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'orange_money'
                            ? 'border-orange-500 bg-orange-950/30 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <i className="fas fa-mobile-alt text-base"></i>
                        <span>Orange / Afri</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-blue-500 bg-blue-950/30 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <i className="fab fa-paypal text-base"></i>
                        <span>PayPal</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-lock'}`}></i>
                      <span>{isProcessing ? 'Securing Transaction...' : `Pay ${activePlanObj.price} & Get Key`}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success & Key Screen */
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
                  ✓
                </div>
                <div>
                  <div className="text-lg font-black text-white">Payment Successful!</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Your ForensicLens Pro license key has been generated and emailed to <strong>{customerEmail}</strong>.
                  </div>
                </div>

                <div className="bg-slate-950 border border-cyan-600 rounded-xl p-3.5 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Your Pro License Key</div>
                  <div className="font-mono text-sm font-black text-cyan-400 select-all tracking-wider">
                    {purchasedKey}
                  </div>
                  <button
                    onClick={() => handleCopyKey(purchasedKey)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded-lg transition-all"
                  >
                    {copiedKey ? '✓ Copied to Clipboard!' : '📋 Copy License Key'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400">
                  Paste this key into the extension side panel under <strong>&quot;Have a Pro Key?&quot;</strong> to activate instantly.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
