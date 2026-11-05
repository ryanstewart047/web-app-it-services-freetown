'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, Download, ExternalLink, FileText, Lock, MessageCircle, Printer, RotateCcw, Share2, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
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

  const handleDownloadPng = () => {
    if (!certDataUrl) return;
    const link = document.createElement('a');
    const safeName = (reveal.recipientName || 'Celebrant').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeName}_Official_Certificate.png`;
    link.href = certDataUrl;
    link.click();
  };

  const handleDownloadPdf = async () => {
    if (!certDataUrl) return;
    setDownloadingPdf(true);
    try {
      // Create landscape A4 PDF (297mm x 210mm)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.addImage(certDataUrl, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
      const safeName = (reveal.recipientName || 'Celebrant').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${safeName}_Official_Certificate.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Could not generate PDF. Please use Download PNG.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    if (!certDataUrl) return;

    let iframe = document.getElementById('cert-print-iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'cert-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reveal.recipientName} - Official Certificate</title>
          <style>
            @page {
              size: landscape;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: #000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              display: block;
            }
            @media print {
              body {
                background: transparent;
              }
              img {
                width: 100%;
                height: 100vh;
                object-fit: contain;
              }
            }
          </style>
        </head>
        <body>
          <img id="cert-img" src="${certDataUrl}" alt="Certificate" />
        </body>
      </html>
    `);
    doc.close();

    const img = doc.getElementById('cert-img') as HTMLImageElement | null;
    if (img) {
      const triggerPrint = () => {
        setTimeout(() => {
          try {
            iframe?.contentWindow?.focus();
            iframe?.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print error, fallback to window.print', e);
            window.print();
          }
        }, 300);
      };

      if (img.complete) {
        triggerPrint();
      } else {
        img.onload = triggerPrint;
      }
    }
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
                onClick={handleDownloadPdf}
                disabled={downloadingPdf || !certDataUrl}
                className="cursor-pointer flex-1 min-w-[200px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all select-none active:scale-[0.98] disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{downloadingPdf ? 'Generating PDF...' : 'Download Certificate (PDF)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!certDataUrl}
                className="cursor-pointer py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 border border-amber-500/30 transition-all select-none active:scale-[0.98] disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={!certDataUrl}
                className="cursor-pointer py-3.5 px-5 rounded-2xl bg-slate-850 hover:bg-slate-750 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors select-none active:scale-[0.98] disabled:opacity-50"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Print</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🏆 Official Certificate of Recognition for ${reveal.recipientName} - ${reveal.achievement}!\n\nDownload & View Certificate 👉 ${certificateUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all select-none active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Certificate</span>
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
