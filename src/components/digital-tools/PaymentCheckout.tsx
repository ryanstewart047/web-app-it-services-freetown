'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Lock,
  Mail,
  MessageCircle,
  Monitor,
  Phone,
  PhoneCall,
  QrCode as QrIcon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';

export interface PaymentPlan {
  id: 'single' | 'monthly' | 'lifetime';
  name: string;
  badge?: string;
  slePrice: string;
  usdPrice: string;
  downloads: string;
  description: string;
  popular?: boolean;
}

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'single',
    name: 'Single Certificate',
    slePrice: 'Le 25',
    usdPrice: '$1.25',
    downloads: '1 HD Download',
    description: 'Full resolution watermark-free certificate with custom seal & photo.',
  },
  {
    id: 'monthly',
    name: 'Monthly Pass',
    badge: 'Best Value',
    slePrice: 'Le 150',
    usdPrice: '$7.50',
    downloads: '5 HD Downloads',
    description: 'Great for celebrating teams, families & multiple occasions this month.',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Lifetime VIP Pass',
    badge: 'VIP Unlimited',
    slePrice: 'Le 500',
    usdPrice: '$25.00',
    downloads: 'Unlimited HD Downloads',
    description: 'Lifetime access to all present & future certificate themes & reveal tools.',
  },
];

export type PaymentMethodType = 'orange_money' | 'afrimoney' | 'paypal';

const ORANGE_USSD_RAW = '*144*2*2*241586#';
const AFRI_USSD_RAW = '*161*6*2*088294631#';

// Encode for tel: protocol (the '#' must be %23)
const ORANGE_TEL_URI = 'tel:*144*2*2*241586%23';
const AFRI_TEL_URI = 'tel:*161*6*2*088294631%23';

// Official Orange Money Logo (using uploaded asset)
export function OrangeMoneyLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/payments/orange-money.png"
      alt="Orange Money"
      className={`${className} object-contain rounded-xl`}
    />
  );
}

// Official AfriMoney Logo (using uploaded asset)
export function AfriMoneyLogo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/payments/afrimoney-icon.png"
      alt="AfriMoney"
      className={`${className} object-contain rounded-xl`}
    />
  );
}

// Full AfriMoney Wordmark
export function AfriMoneyFullLogo({ className = 'h-6' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/payments/afrimoney.png"
      alt="AfriMoney"
      className={`${className} object-contain`}
    />
  );
}

// Official PayPal SVG Logo
export function PayPalLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#003087" />
      <g transform="translate(11, 10)">
        {/* Back dark blue P */}
        <path
          d="M6.2 26.5H1.5L5.8 1.2C6 0.5 6.7 0 7.4 0H16.8C20.4 0 23.1 1 24.2 3.1C25.1 4.7 25 7 24.1 9.4C22.6 13.5 19.3 15.8 15 15.8H10.4C9.7 15.8 9.1 16.3 9 17L7.6 25.5C7.4 26.1 6.9 26.5 6.2 26.5Z"
          fill="#0079C1"
        />
        {/* Front light blue P */}
        <path
          d="M10.8 28H6.5C5.8 28 5.3 27.5 5.4 26.8L8.2 9.5C8.3 8.8 8.9 8.3 9.6 8.3H18.2C21.8 8.3 24.5 9.3 25.6 11.4C26.5 13 26.4 15.3 25.5 17.7C24 21.8 20.7 24.1 16.4 24.1H13.6C12.9 24.1 12.3 24.6 12.2 25.3L10.8 28Z"
          fill="#00457C"
          fillOpacity="0.6"
        />
        <path
          d="M9.8 27H6.5L9.2 9.5H18.2C21.8 9.5 24.5 10.5 25.6 12.6C26.5 14.2 26.4 16.5 25.5 18.9C24 23 20.7 25.3 16.4 25.3H13.6C12.9 25.3 12.3 25.8 12.2 26.5L11.2 32.8C11.1 33.3 10.7 33.7 10.2 33.7H6.8L8.2 24.8L9.8 27Z"
          fill="#0079C1"
        />
        <path
          d="M9.6 8.3C8.9 8.3 8.3 8.8 8.2 9.5L5.4 26.8C5.3 27.5 5.8 28 6.5 28H10.8L12.2 25.3C12.3 24.6 12.9 24.1 13.6 24.1H16.4C20.7 24.1 24 21.8 25.5 17.7C26.4 15.3 26.5 13 25.6 11.4C24.5 9.3 21.8 8.3 18.2 8.3H9.6Z"
          fill="#0079C1"
        />
        <path
          d="M10.2 18.2L9.2 24.8L12.2 24.8C12.9 24.8 13.5 24.3 13.6 23.6L14.4 18.2H10.2Z"
          fill="#00457C"
        />
      </g>
    </svg>
  );
}

interface PaymentCheckoutProps {
  recipientName: string;
  code: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentCheckout({
  recipientName,
  code,
  onClose,
  onSuccess,
}: PaymentCheckoutProps) {
  const [selectedPlan, setSelectedPlan] = useState<'single' | 'monthly' | 'lifetime'>('single');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('orange_money');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // QR Code canvases
  const orangeQrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const afriQrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePlan = PAYMENT_PLANS.find((p) => p.id === selectedPlan) || PAYMENT_PLANS[0];

  // Render QR Codes on desktop mount / method change
  useEffect(() => {
    if (orangeQrCanvasRef.current) {
      QRCode.toCanvas(orangeQrCanvasRef.current, ORANGE_TEL_URI, {
        width: 170,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch((e) => console.warn('QR error:', e));
    }
  }, [paymentMethod]);

  // PayPal Smart Buttons State
  const [paypalConfig, setPaypalConfig] = useState<{ configured: boolean; clientId: string | null; mode: string } | null>(null);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement | null>(null);

  // Fetch PayPal Config on mount
  useEffect(() => {
    fetch('/api/paypal/config')
      .then((res) => res.json())
      .then((data) => setPaypalConfig(data))
      .catch((err) => console.warn('Failed to load PayPal config:', err));
  }, []);

  // Initialize PayPal Buttons when method is paypal and config is loaded
  useEffect(() => {
    if (paymentMethod !== 'paypal' || !paypalConfig?.configured || !paypalConfig.clientId) return;

    let isMounted = true;
    const clientId = paypalConfig.clientId.trim();

    /** Poll for window.paypal to be ready — handles the case where the
     *  script tag already exists and its onload event already fired. */
    const waitForPayPal = (timeoutMs = 10000): Promise<void> =>
      new Promise((resolve, reject) => {
        if ((window as any).paypal) { resolve(); return; }
        const start = Date.now();
        const tick = () => {
          if ((window as any).paypal) { resolve(); return; }
          if (Date.now() - start > timeoutMs) { reject(new Error('PayPal SDK timed out')); return; }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });

    const loadSdkAndRender = async () => {
      setPaypalLoading(true);
      setPaypalError(null);

      try {
        const scriptId = 'paypal-sdk-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
          // Script not in DOM yet — inject it and wait for load
          script = document.createElement('script');
          script.id = scriptId;
          script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons`;
          script.async = true;
          await new Promise<void>((resolve, reject) => {
            script!.onload = () => resolve();
            script!.onerror = () => reject(new Error('PayPal SDK script failed to load'));
            document.body.appendChild(script!);
          });
        }

        // Whether we just injected or it was already there, wait for window.paypal
        await waitForPayPal();

        if (!isMounted) return;

        // Wait one more frame so React has committed the ref's DOM node
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        if (!isMounted || !paypalContainerRef.current) return;

        // Clear any previous render
        paypalContainerRef.current.innerHTML = '';

        const paypal = (window as any).paypal;
        if (!paypal?.Buttons) throw new Error('PayPal Buttons not available');

        const buttons = paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay',
            height: 44,
          },
          createOrder: async () => {
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                planId: selectedPlan,
                code,
                recipientName,
                customerEmail: customerEmail.trim(),
              }),
            });
            const data = await res.json();
            if (!data.success || !data.orderId) {
              throw new Error(data.error || 'Failed to create PayPal order');
            }
            return data.orderId;
          },
          onApprove: async (data: any) => {
            setSubmitting(true);
            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  code,
                  customerEmail: customerEmail.trim(),
                  customerPhone: customerPhone.trim(),
                  selectedPlan,
                }),
              });
              const captureData = await res.json();
              if (captureData.success) {
                setSubmitted(true);
                if (onSuccess) onSuccess();
              } else {
                alert(captureData.error || 'Payment capture failed.');
              }
            } catch (err: any) {
              alert(err.message || 'Payment capture error.');
            } finally {
              setSubmitting(false);
            }
          },
          onError: (err: any) => {
            console.warn('PayPal Button Error:', err);
            // Silently fall back — show PayPal.Me button without alarming message
            if (isMounted) setPaypalError('fallback');
          },
        });

        // Check if eligible before rendering (e.g. buyer country not supported)
        if (buttons.isEligible()) {
          await buttons.render(paypalContainerRef.current);
        } else {
          if (isMounted) setPaypalError('fallback');
        }
      } catch (err: any) {
        console.warn('PayPal SDK initialization failed:', err);
        if (isMounted) setPaypalError('fallback');
      } finally {
        if (isMounted) setPaypalLoading(false);
      }
    };

    void loadSdkAndRender();

    return () => {
      isMounted = false;
    };
  }, [paymentMethod, paypalConfig, selectedPlan, code, recipientName, customerEmail, customerPhone]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {}
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      alert('Please provide a valid email address to receive your official certificate.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/surprise-reveals/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          selectedPlan,
          paymentMethod,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
        if (data.waUrl) {
          window.open(data.waUrl, '_blank', 'noopener,noreferrer');
        }
      } else {
        alert(data.error || 'Could not submit payment confirmation.');
      }
    } catch (err: any) {
      alert('Failed to connect to verification server. Please contact WhatsApp +232 33 399 391.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPayPalCheckoutUrl = () => {
    const amount = activePlan.id === 'single' ? '1.25' : activePlan.id === 'monthly' ? '7.50' : '25.00';
    return `https://paypal.me/ryanjstewart047/${amount}USD`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl my-auto rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl text-left text-white overflow-hidden"
      >
        {/* Top Header Banner */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-5 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="cursor-pointer absolute right-4 top-4 rounded-full p-2.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">Unlock Official Certificate</h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Instant Verification
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Honoring <strong className="text-amber-300 font-bold">{recipientName}</strong> · Ref:{' '}
                <span className="font-mono text-white/90">{code}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {!submitted ? (
            <form onSubmit={handleSubmitProof} className="space-y-6">
              {/* 1. SELECT PAYMENT PLAN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    1. Select Plan
                  </label>
                  <span className="text-[11px] text-slate-400">All plans include HD Print file</span>
                </div>

                <div className="grid sm:grid-cols-3 gap-2.5">
                  {PAYMENT_PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`cursor-pointer relative rounded-2xl p-4 text-left border transition-all flex flex-col justify-between select-none ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/15 ring-2 ring-amber-400/40'
                            : 'border-white/10 bg-slate-900/70 hover:bg-slate-800 hover:border-white/20'
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-2.5 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm">
                            {plan.badge}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-200">{plan.name}</span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                            </div>
                          </div>

                          <div className="mt-2 flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-amber-300 font-mono">{plan.slePrice}</span>
                            <span className="text-[11px] text-slate-400 font-mono">({plan.usdPrice})</span>
                          </div>

                          <p className="text-[11px] font-bold text-emerald-400 mt-1">{plan.downloads}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-snug">{plan.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. SELECT PAYMENT METHOD */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  2. Choose Payment Method
                </label>

                <div className="grid sm:grid-cols-3 gap-2.5">
                  {/* Orange Money */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`cursor-pointer p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-left select-none ${
                      paymentMethod === 'orange_money'
                        ? 'border-orange-500 bg-orange-500/20 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/10'
                        : 'border-white/10 bg-slate-900/70 hover:bg-slate-800 hover:border-white/20'
                    }`}
                  >
                    <OrangeMoneyLogo className="w-10 h-10 shrink-0 pointer-events-none" />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">Orange Money</div>
                      <div className="text-[10px] text-orange-300 font-mono font-bold mt-0.5">USSD *144#</div>
                    </div>
                  </button>

                  {/* AfriMoney */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('afrimoney')}
                    className={`cursor-pointer p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-left select-none ${
                      paymentMethod === 'afrimoney'
                        ? 'border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'border-white/10 bg-slate-900/70 hover:bg-slate-800 hover:border-white/20'
                    }`}
                  >
                    <AfriMoneyLogo className="w-10 h-10 shrink-0 pointer-events-none" />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">AfriMoney</div>
                      <div className="text-[10px] text-emerald-300 font-mono font-bold mt-0.5">USSD *161#</div>
                    </div>
                  </button>

                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`cursor-pointer p-3.5 rounded-2xl border flex items-center gap-3 transition-all text-left select-none ${
                      paymentMethod === 'paypal'
                        ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10'
                        : 'border-white/10 bg-slate-900/70 hover:bg-slate-800 hover:border-white/20'
                    }`}
                  >
                    <PayPalLogo className="w-10 h-10 shrink-0 pointer-events-none" />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">PayPal / Card</div>
                      <div className="text-[10px] text-blue-300 font-mono font-bold mt-0.5">International</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. DYNAMIC METHOD INSTRUCTIONS & ACTIONS */}
              <div className="rounded-2xl border border-white/15 bg-slate-950/90 p-4 sm:p-5 space-y-4">
                {/* ORANGE MONEY PANEL */}
                {paymentMethod === 'orange_money' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <OrangeMoneyLogo className="w-6 h-6" />
                        <span className="text-xs font-black text-orange-400">Orange Money Payment ({activePlan.slePrice})</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">Code: 241586</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 items-center">
                      {/* Left: Mobile USSD Click Action */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <Smartphone className="w-4 h-4 text-orange-400" />
                          <span>Mobile One-Tap Dial</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Tap below to open your phone dialler with the official USSD payment string preloaded:
                        </p>

                        <a
                          href={ORANGE_TEL_URI}
                          className="cursor-pointer w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all select-none active:scale-[0.98]"
                        >
                          <PhoneCall className="w-4 h-4 shrink-0" />
                          <span>Dial {ORANGE_USSD_RAW}</span>
                        </a>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          <span className="font-mono font-bold text-orange-300">{ORANGE_USSD_RAW}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ORANGE_USSD_RAW, 'orange')}
                            className="cursor-pointer text-orange-400 font-bold hover:text-orange-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-500/10 transition-colors"
                          >
                            {copiedCode === 'orange' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode === 'orange' ? 'Copied' : 'Copy Code'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Desktop QR Code */}
                      <div className="border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4 flex flex-col items-center text-center space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                          <Monitor className="w-3.5 h-3.5 text-orange-400" />
                          <span>Desktop Scan to Dial</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white shadow-md">
                          <canvas ref={orangeQrCanvasRef} className="block w-28 h-28 sm:w-32 sm:h-32" />
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">
                          Scan with your phone camera to initiate dialling.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AFRIMONEY PANEL */}
                {paymentMethod === 'afrimoney' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2.5">
                        <AfriMoneyFullLogo className="h-6 w-auto" />
                        <span className="text-xs font-black text-fuchsia-300">Payment Steps ({activePlan.slePrice})</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">Agent: 088294631</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 items-center">
                      {/* Left: Mobile USSD Click Action */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                          <Smartphone className="w-4 h-4 text-fuchsia-400" />
                          <span>Mobile One-Tap Dial</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Tap below to open your phone dialler with the official AfriMoney code:
                        </p>

                        <a
                          href={AFRI_TEL_URI}
                          className="cursor-pointer w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#8A157C] to-[#F37023] hover:from-[#751169] hover:to-[#db6018] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#8A157C]/25 transition-all select-none active:scale-[0.98]"
                        >
                          <PhoneCall className="w-4 h-4 shrink-0" />
                          <span>Dial {AFRI_USSD_RAW}</span>
                        </a>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          <span className="font-mono font-bold text-fuchsia-300">{AFRI_USSD_RAW}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(AFRI_USSD_RAW, 'afri')}
                            className="cursor-pointer text-fuchsia-400 font-bold hover:text-fuchsia-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-fuchsia-500/10 transition-colors"
                          >
                            {copiedCode === 'afri' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode === 'afri' ? 'Copied' : 'Copy Code'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Right: Desktop QR Code */}
                      <div className="border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4 flex flex-col items-center text-center space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                          <Monitor className="w-3.5 h-3.5 text-fuchsia-400" />
                          <span>Desktop Scan to Dial</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white shadow-md">
                          <canvas ref={afriQrCanvasRef} className="block w-28 h-28 sm:w-32 sm:h-32" />
                        </div>
                        <p className="text-[10px] text-slate-400 max-w-[200px]">
                          Scan with your phone camera to initiate dialling.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAYPAL PANEL */}
                {paymentMethod === 'paypal' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <PayPalLogo className="w-6 h-6" />
                        <span className="text-xs font-black text-blue-400">PayPal &amp; Card Gateway ({activePlan.usdPrice})</span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Instant 1-Click Unlock
                      </span>
                    </div>

                    {/* Interactive PayPal Smart Buttons (Loads when API credentials present) */}
                    {paypalConfig?.configured && (
                      <div className="space-y-2.5">
                        <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                          <span>Pay with PayPal or Debit/Credit Card:</span>
                          <span className="text-amber-300 font-mono font-bold">{activePlan.usdPrice} USD</span>
                        </div>

                        {paypalLoading && (
                          <div className="h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                            Loading PayPal Gateway...
                          </div>
                        )}

                        {/* Smart Buttons container — hidden when fallback is active */}
                        <div
                          ref={paypalContainerRef}
                          className={`min-h-[44px] rounded-xl overflow-hidden ${paypalError ? 'hidden' : ''}`}
                        />

                        {/* Soft info note when buttons couldn't load — no alarming banner */}
                        {paypalError && !paypalLoading && (
                          <p className="text-[10px] text-slate-400 text-center">
                            PayPal gateway unavailable in your region — please use the direct link below.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Direct PayPal.Me Option — becomes primary when Smart Buttons fall back */}
                    <div className={`space-y-2.5 pt-2 border-t border-white/5 ${paypalError ? 'ring-1 ring-amber-500/20 rounded-2xl p-3 bg-amber-500/5' : ''}`}>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className={paypalError ? 'text-amber-300 font-semibold' : ''}>
                          {paypalError ? 'Pay directly via PayPal.Me:' : 'Alternative: Direct PayPal.Me Payment'}
                        </span>
                        <span className="font-mono text-blue-300">paypal.me/ryanjstewart047</span>
                      </div>

                      <a
                        href={getPayPalCheckoutUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] hover:from-[#005ea6] hover:to-[#00205b] text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all select-none active:scale-[0.98]"
                      >
                        <PayPalLogo className="w-4 h-4 shrink-0" />
                        <span>Open {activePlan.usdPrice} on PayPal.Me</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1 shrink-0" />
                      </a>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                        <span className="font-mono text-blue-300 truncate">https://paypal.me/ryanjstewart047/{activePlan.id === 'single' ? '1.25' : activePlan.id === 'monthly' ? '7.50' : '25.00'}USD</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`https://paypal.me/ryanjstewart047/${activePlan.id === 'single' ? '1.25' : activePlan.id === 'monthly' ? '7.50' : '25.00'}USD`, 'paypal')}
                          className="cursor-pointer text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-blue-500/10 transition-colors shrink-0 ml-2"
                        >
                          {copiedCode === 'paypal' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode === 'paypal' ? 'Copied' : 'Copy Link'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Official PayPal Buyer Protection · 256-bit Encrypted SSL.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. DELIVERY DETAILS */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  3. Delivery &amp; Verification Details
                </label>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      Email Address to receive Certificate *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 block mb-1">
                      WhatsApp Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +232 78 000 000"
                      className="w-full bg-slate-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-pointer w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 select-none active:scale-[0.99]"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <span>
                    {submitting
                      ? 'Submitting Proof...'
                      : `Confirm & Notify Admin on WhatsApp (${activePlan.slePrice})`}
                  </span>
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  Instant admin approval: your certificate unlocks directly on this screen and is sent to your email.
                </p>
              </div>
            </form>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-white">Payment Proof Submitted</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Thank you! We sent a confirmation to <strong className="text-white">{customerEmail}</strong>.
                Our team is verifying your payment and your high-resolution printable certificate will unlock automatically.
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md"
                >
                  Back to Celebration Experience
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
