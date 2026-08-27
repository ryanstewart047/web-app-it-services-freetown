'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Award, Crown, Eye, Lock, MessageCircle, ShieldAlert, Sparkles, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderMasterCertificate } from '@/lib/certificate-renderer';

interface ProtectedCertificatePreviewProps {
  recipientName: string;
  achievement: string;
  message?: string;
  imageUrl: string;
  presenterName?: string;
  code?: string;
  onUnlockClick?: () => void;
  inline?: boolean;
}

export default function ProtectedCertificatePreview({
  recipientName,
  achievement,
  message,
  imageUrl,
  presenterName,
  code = 'PREVIEW-SAMPLE',
  onUnlockClick,
  inline = false,
}: ProtectedCertificatePreviewProps) {
  const [isOpen, setIsOpen] = useState(inline);
  const [screenShieldActive, setScreenShieldActive] = useState(false);
  const [certDataUrl, setCertDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render the watermarked certificate onto canvas
  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      try {
        const canvas = document.createElement('canvas');
        await renderMasterCertificate({
          canvas,
          recipientName,
          achievement,
          message,
          imageUrl,
          code,
          presenterName,
          isWatermarked: true,
        });

        if (isMounted) {
          setCertDataUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      } catch (err) {
        console.warn('Watermark rendering error:', err);
      }
    };

    void render();

    return () => {
      isMounted = false;
    };
  }, [recipientName, achievement, message, imageUrl, presenterName, code]);

  // Anti-Screenshot & Screen Capture Detection Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setScreenShieldActive(true);
        setTimeout(() => setScreenShieldActive(false), 3000);
      }

      // Intercept Ctrl+P or Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setScreenShieldActive(true);
        if (onUnlockClick) onUnlockClick();
        setTimeout(() => setScreenShieldActive(false), 2500);
      }

      // Intercept Ctrl+S or Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }

      // Intercept Mac screenshot shortcuts (Cmd+Shift+3/4/5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        setScreenShieldActive(true);
        setTimeout(() => setScreenShieldActive(false), 3000);
      }
    };

    // When window blurs / loses focus (e.g. screenshot tool opened), activate shield
    const handleBlur = () => {
      setScreenShieldActive(true);
    };
    const handleFocus = () => {
      setTimeout(() => setScreenShieldActive(false), 500);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [onUnlockClick]);

  const defaultUnlockWhatsApp = () => {
    const text = `Hello BridgeTec! I saw the preview of the Certificate for ${recipientName || 'my celebrant'} (Code: ${code}). I would like to pay Le 25 via Orange Money/AfriMoney to unlock the official printable high-resolution copy!`;
    window.open(`https://wa.me/23233399391?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleActionClick = () => {
    if (onUnlockClick) {
      onUnlockClick();
    } else {
      defaultUnlockWhatsApp();
    }
  };

  const previewCardContent = (
    <div
      className="relative select-none overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-slate-950 p-4 sm:p-5 shadow-2xl space-y-4"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* Top Bar Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/20 pb-3">
        <div className="flex items-center gap-2 text-amber-300 font-black text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Official Certificate Preview (Watermarked)</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
          <Lock className="w-3 h-3" /> Unlicensed Preview
        </div>
      </div>

      {/* Certificate Display Area with Multi-Layer Protection Shield */}
      <div className="relative rounded-xl overflow-hidden border border-amber-400/30 bg-black shadow-inner">
        {certDataUrl ? (
          <div className="relative">
            {/* Visual Canvas Rendering */}
            <img
              src={certDataUrl}
              alt="Protected Certificate Preview"
              className={`w-full object-contain pointer-events-none transition-all duration-300 ${
                screenShieldActive ? 'blur-md opacity-30 scale-95' : 'blur-0 opacity-100 scale-100'
              }`}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Holographic Security Pattern Overlay (Blocks clean capture) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay"
              style={{
                backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#ffffff 1px, #000000 1px)`,
                backgroundSize: '32px 32px',
                backgroundPosition: '0 0, 16px 16px',
              }}
            />

            {/* Watermark Diagonal Banner */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rotate-[-18deg] bg-amber-500/10 border-y border-amber-400/25 px-6 py-1.5 text-center w-full">
                <p className="text-amber-300/50 font-bold tracking-widest text-[10px] uppercase">
                  SAMPLE PREVIEW · NOT FOR PRINT
                </p>
              </div>
            </div>

            {/* Anti-Screenshot Warning Shield (Triggers on Screen Tool Detection) */}
            {screenShieldActive && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center text-white backdrop-blur-md">
                <ShieldAlert className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
                <h4 className="text-sm font-black text-amber-300">Protected Certificate Sample</h4>
                <p className="text-xs text-slate-300 max-w-xs mt-1">
                  High-resolution printable copy and official rights unlock upon payment confirmation (Le 25).
                </p>
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="mt-3 px-4 py-2 bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-lg"
                >
                  Unlock Printable Certificate
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
            Preparing Protected Preview...
          </div>
        )}
      </div>

      {/* Prominent Sales Prompt & CTA Box */}
      <div className="rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-black text-white">Love how this certificate looks?</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Unlock the official high-resolution, watermark-free printable certificate with {recipientName}&apos;s photo for just <strong className="text-amber-300 font-bold">Le 25</strong>!
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-black text-amber-300 font-mono block leading-tight">Le 25</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">One-Time</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-300">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 text-orange-300 px-2 py-0.5 font-bold border border-orange-500/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/payments/orange-money.png" alt="Orange Money" className="w-3.5 h-3.5 rounded object-contain" />
            Orange Money (*144#)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 text-fuchsia-300 px-2 py-0.5 font-bold border border-fuchsia-500/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/payments/afrimoney-icon.png" alt="AfriMoney" className="w-3.5 h-3.5 rounded object-contain" />
            AfriMoney (*161#)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 text-blue-300 px-2 py-0.5 font-bold border border-blue-500/30">
            PayPal / Card
          </span>
          <span className="text-slate-400">· USSD mobile trigger &amp; desktop QR code</span>
        </div>

        <button
          type="button"
          onClick={handleActionClick}
          className="cursor-pointer w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all select-none active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Unlock Official Printable Certificate (Le 25)</span>
        </button>
      </div>
    </div>
  );

  if (inline) {
    return previewCardContent;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md select-none"
      >
        <Eye className="w-4 h-4 text-amber-400" />
        <span>Preview Certificate (Protected Sample)</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl my-8 text-white"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 z-30 rounded-full p-2 bg-slate-900/90 text-slate-400 hover:bg-white/20 hover:text-white transition-colors border border-white/10"
              >
                <X className="h-4 w-4" />
              </button>

              {previewCardContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
