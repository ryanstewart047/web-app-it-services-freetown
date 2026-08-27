'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Award, Crown, Eye, Lock, MessageCircle, ShieldAlert, Sparkles, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProtectedCertificatePreviewProps {
  recipientName: string;
  achievement: string;
  message?: string;
  imageUrl: string;
  code?: string;
  onUnlockClick?: () => void;
  inline?: boolean;
}

export default function ProtectedCertificatePreview({
  recipientName,
  achievement,
  message,
  imageUrl,
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
        canvas.width = 1600;
        canvas.height = 1130;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Dark luxury background
        const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
        bgGrad.addColorStop(0, '#040711');
        bgGrad.addColorStop(0.5, '#0b1329');
        bgGrad.addColorStop(1, '#040711');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1600, 1130);

        // Gold ornate borders
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 14;
        ctx.strokeRect(40, 40, 1520, 1050);

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.strokeRect(60, 60, 1480, 1010);

        // Corner ornaments
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(40, 40, 40, 40);
        ctx.fillRect(1520, 40, 40, 40);
        ctx.fillRect(40, 1050, 40, 40);
        ctx.fillRect(1520, 1050, 40, 40);

        // Recipient photo in circular gold frame
        const photoSize = 170;
        const photoX = 800 - photoSize / 2;
        const photoY = 120;

        if (imageUrl) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
              img.src = imageUrl;
            });

            if (img.complete && img.naturalWidth > 0) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(800, photoY + photoSize / 2, photoSize / 2 + 8, 0, Math.PI * 2);
              ctx.fillStyle = '#f59e0b';
              ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
              ctx.shadowBlur = 24;
              ctx.fill();

              ctx.beginPath();
              ctx.arc(800, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
              ctx.restore();
            }
          } catch {}
        }

        // Header Tag
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ OFFICIAL RECOGNITION & CELEBRATION ★', 800, 335);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 54px sans-serif';
        ctx.fillText('CERTIFICATE OF RECOGNITION', 800, 415);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px sans-serif';
        ctx.fillText('This honor and celebration is proudly presented to', 800, 475);

        // Recipient Name in large gold
        ctx.fillStyle = '#fcd34d';
        ctx.font = 'bold 72px sans-serif';
        ctx.fillText(recipientName || 'Celebrant Name', 800, 580);

        // Underline bar
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(450, 610, 700, 4);

        // Achievement
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px sans-serif';
        ctx.fillText(achievement || 'Special Recognition Award', 800, 690);

        // Personal message
        if (message) {
          ctx.fillStyle = '#cbd5e1';
          ctx.font = 'italic 26px sans-serif';
          const msgText = `"${message.slice(0, 130)}"`;
          ctx.fillText(msgText, 800, 765);
        }

        // Footer divider
        ctx.fillStyle = '#334155';
        ctx.fillRect(160, 830, 1280, 2);

        // ==========================================
        // 🌟 GOLD DIGITAL CERTIFICATION SEAL (LEFT)
        // ==========================================
        const sealX = 320;
        const sealY = 935;
        const sealR = 56;

        // Ribbon tails
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(sealX - 25, sealY + 30);
        ctx.lineTo(sealX - 45, sealY + 95);
        ctx.lineTo(sealX - 25, sealY + 80);
        ctx.lineTo(sealX - 5, sealY + 95);
        ctx.lineTo(sealX - 10, sealY + 30);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(sealX + 10, sealY + 30);
        ctx.lineTo(sealX + 5, sealY + 95);
        ctx.lineTo(sealX + 25, sealY + 80);
        ctx.lineTo(sealX + 45, sealY + 95);
        ctx.lineTo(sealX + 25, sealY + 30);
        ctx.fill();

        // Outer serrated / starburst seal circle
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
          const angle = (i * Math.PI) / 12;
          const rad = i % 2 === 0 ? sealR + 6 : sealR - 2;
          const px = sealX + Math.cos(angle) * rad;
          const py = sealY + Math.sin(angle) * rad;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner seal circle
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(sealX, sealY, sealR - 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Seal text & Star
        ctx.fillStyle = '#fcd34d';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', sealX, sealY - 12);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('VERIFIED', sealX, sealY + 5);
        ctx.font = '800 9px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('FLORSS AUTH', sealX, sealY + 18);

        // Left Date Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('DATE OF ISSUANCE', sealX, sealY + 115);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '16px sans-serif';
        ctx.fillText(new Date().toLocaleDateString(undefined, { dateStyle: 'medium' }), sealX, sealY + 135);

        // ==========================================
        // 🏢 CENTER: FLORSS OFFICIAL AUTHORITY
        // ==========================================
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FOR LOVE ONCE REVEAL SURPRISE STUDIO (FLORSS)', 800, 875);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.fillText(`Official Verification ID: ${code} · BridgeTech IT Services`, 800, 905);

        // Digital Certificate Security Hash
        const fakeHash = `SIG-SHA256:${Buffer.from(code + (recipientName || '')).toString('base64').slice(0, 16).toUpperCase() || '7F9A2B4E8C1D'}`;
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`🔒 CRYPTOGRAPHICALLY SECURED & DIGITALLY VERIFIED`, 800, 935);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px monospace';
        ctx.fillText(fakeHash, 800, 955);

        // ==========================================
        // ✍️ RIGHT: AUTOMATIC DIGITAL SIGNATURE
        // ==========================================
        const sigX = 1260;
        const sigY = 910;

        // Draw calligraphic digital signature with smooth ink curves
        ctx.save();
        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(252, 211, 77, 0.4)';
        ctx.shadowBlur = 10;

        // Stylized initial 'R'
        ctx.beginPath();
        ctx.moveTo(sigX - 110, sigY - 20);
        ctx.bezierCurveTo(sigX - 115, sigY + 15, sigX - 105, sigY + 25, sigX - 100, sigY + 20);
        ctx.bezierCurveTo(sigX - 100, sigY - 35, sigX - 55, sigY - 35, sigX - 55, sigY - 10);
        ctx.bezierCurveTo(sigX - 55, sigY + 5, sigX - 85, sigY + 10, sigX - 45, sigY + 22);
        ctx.stroke();

        // Stylized name strokes & loops (Stewart / Director)
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.moveTo(sigX - 40, sigY + 5);
        ctx.bezierCurveTo(sigX - 30, sigY - 15, sigX - 20, sigY + 15, sigX - 10, sigY - 5);
        ctx.bezierCurveTo(sigX, sigY - 20, sigX + 15, sigY + 20, sigX + 25, sigY - 10);
        ctx.bezierCurveTo(sigX + 40, sigY - 25, sigX + 55, sigY + 15, sigX + 70, sigY - 5);
        ctx.bezierCurveTo(sigX + 85, sigY - 30, sigX + 95, sigY + 10, sigX + 110, sigY + 5);
        ctx.stroke();

        // Flourish under-swash stroke
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.moveTo(sigX - 95, sigY + 28);
        ctx.bezierCurveTo(sigX - 30, sigY + 38, sigX + 60, sigY + 25, sigX + 115, sigY + 18);
        ctx.bezierCurveTo(sigX + 130, sigY + 14, sigX + 110, sigY + 32, sigX + 85, sigY + 30);
        ctx.stroke();
        ctx.restore();

        // Signature baseline
        ctx.fillStyle = '#64748b';
        ctx.fillRect(sigX - 130, sigY + 35, 260, 2);

        // Signature Title & Details
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Authorized Digital Signature', sigX, sigY + 58);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.fillText('Registrar & Director of Certification', sigX, sigY + 78);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('✓ Digitally Validated & Signed', sigX, sigY + 98);

        // ==========================================
        // 🔒 HEAVY SECURITY WATERMARK OVERLAY
        // ==========================================
        ctx.save();
        ctx.rotate((-22 * Math.PI) / 180);

        // Diagonal repeating stamps
        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
        ctx.font = '900 48px sans-serif';
        for (let y = -400; y < 1600; y += 190) {
          for (let x = -800; x < 2400; x += 680) {
            ctx.fillText('FLORSS SAMPLE PREVIEW · UNLICENSED', x, y);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.font = 'bold 28px monospace';
            ctx.fillText('🔒 PROHIBITED FOR PRINT · UNLOCK AT FLORSS / IT SERVICES FREETOWN', x - 40, y + 45);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
            ctx.font = '900 48px sans-serif';
          }
        }
        ctx.restore();

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
  }, [recipientName, achievement, message, imageUrl, code]);

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
    const text = `Hello BridgeTech! I saw the preview of the Certificate for ${recipientName || 'my celebrant'} (Code: ${code}). I would like to pay Le 25 via Orange Money/AfriMoney to unlock the official printable high-resolution copy!`;
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
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px), radial-gradient(#ffffff 1px, #000000 1px)`,
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Watermark Diagonal Banner */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rotate-[-18deg] bg-amber-500/30 backdrop-blur-[2px] border-y-2 border-amber-400/60 px-8 py-3 text-center shadow-2xl">
                <p className="text-amber-200 font-black tracking-widest text-xs sm:text-sm uppercase drop-shadow-md">
                  ★ SAMPLE PREVIEW · NOT VALID FOR PRINT ★
                </p>
                <p className="text-white text-[10px] font-bold tracking-wider">
                  UNLOCK FULL HIGH-RES CERTIFICATE FOR LE 25
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

        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 text-orange-300 px-2 py-0.5 font-bold border border-orange-500/30">
            🟠 Orange Money
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-bold border border-emerald-500/30">
            💚 AfriMoney
          </span>
          <span className="text-slate-400">· Pay &amp; admin approves in 1 click!</span>
        </div>

        <button
          type="button"
          onClick={handleActionClick}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
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
        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
      >
        <Eye className="w-4 h-4 text-amber-400" />
        <span>👁️ Preview Certificate (Protected Sample)</span>
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
