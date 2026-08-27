'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Download, ExternalLink, Lock, MessageCircle, Printer, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { type SurpriseReveal } from '@/lib/surprise-reveal-storage';

import ProtectedCertificatePreview from '@/components/digital-tools/ProtectedCertificatePreview';

interface CertificateClientProps {
  reveal: SurpriseReveal;
  shareUrl: string;
  certificateUrl: string;
}

export default function CertificateClient({ reveal, shareUrl, certificateUrl }: CertificateClientProps) {
  const [generating, setGenerating] = useState(false);
  const [certDataUrl, setCertDataUrl] = useState<string | null>(null);
  const isPaid = reveal.paymentStatus === 'approved';

  const renderCertificate = async () => {
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

      // Recipient photo in circular gold luxury frame
      const photoSize = 170;
      const photoX = 800 - photoSize / 2;
      const photoY = 120;

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = reveal.imageUrl;
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
      ctx.fillText(reveal.recipientName, 800, 580);

      // Underline bar
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(450, 610, 700, 4);

      // Achievement
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText(reveal.achievement, 800, 690);

      // Personal message
      if (reveal.message) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 26px sans-serif';
        const msgText = `"${reveal.message.slice(0, 130)}"`;
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
      ctx.fillText(`Official Verification ID: ${reveal.code} · BridgeTech IT Services`, 800, 905);

      // Digital Certificate Security Hash
      const fakeHash = `SIG-SHA256:${Buffer.from(reveal.code + (reveal.recipientName || '')).toString('base64').slice(0, 16).toUpperCase() || '7F9A2B4E8C1D'}`;
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

      const url = canvas.toDataURL('image/png');
      setCertDataUrl(url);
    } catch (e) {
      console.warn('Certificate render failed:', e);
    }
  };

  useEffect(() => {
    if (isPaid) {
      void renderCertificate();
    }
  }, [reveal, isPaid]);

  const handleDownload = () => {
    if (!certDataUrl) return;
    const link = document.createElement('a');
    link.download = `${reveal.recipientName.replace(/\s+/g, '_')}_Official_Certificate.png`;
    link.href = certDataUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!certDataUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${reveal.recipientName} - Certificate</title>
          <style>
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #000; height: 100vh; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
            @media print {
              body { background: transparent; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${certDataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href={shareUrl}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay Surprise
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white">Official Printable Certificate</h1>
              <p className="text-xs text-amber-300 font-bold">BridgeTech Celebration Verification ID: {reveal.code}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPaid ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-black">
                <CheckCircle2 className="w-4 h-4" /> Payment Approved &amp; Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 text-xs font-black">
                <Lock className="w-4 h-4" /> Pending Payment Approval
              </span>
            )}
          </div>
        </div>

        {/* Certificate Display */}
        {isPaid ? (
          <div className="rounded-3xl border border-amber-400/30 bg-slate-900/90 p-4 sm:p-6 shadow-2xl overflow-hidden text-center space-y-6">
            {certDataUrl ? (
              <div className="rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.15)] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={certDataUrl}
                  alt={`Certificate for ${reveal.recipientName}`}
                  className="w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-500 text-sm">
                Rendering High-Resolution Certificate...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all"
              >
                <Download className="w-4 h-4" /> Download Certificate (PNG)
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🏆 Official Certificate of Recognition for ${reveal.recipientName} - ${reveal.achievement}!\n\nDownload & View Certificate 👉 ${certificateUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Share Certificate on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ProtectedCertificatePreview
              recipientName={reveal.recipientName}
              achievement={reveal.achievement}
              message={reveal.message}
              imageUrl={reveal.imageUrl}
              code={reveal.code}
              inline={true}
            />
          </div>
        )}
      </div>
    </main>
  );
}
