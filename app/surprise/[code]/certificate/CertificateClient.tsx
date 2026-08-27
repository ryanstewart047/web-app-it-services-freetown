'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Download, ExternalLink, Lock, MessageCircle, Printer, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { type SurpriseReveal } from '@/lib/surprise-reveal-storage';
import { renderMasterCertificate } from '@/lib/certificate-renderer';

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
      await renderMasterCertificate({
        canvas,
        recipientName: reveal.recipientName,
        achievement: reveal.achievement,
        message: reveal.message,
        imageUrl: reveal.imageUrl,
        code: reveal.code,
        presenterName: reveal.presenterName,
        isWatermarked: false,
      });

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
              <p className="text-xs text-amber-300 font-bold">BridgeTec Surprise Studio · Verification ID: {reveal.code}</p>
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
              presenterName={reveal.presenterName}
              code={reveal.code}
              inline={true}
            />
          </div>
        )}
      </div>
    </main>
  );
}
