'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, ShieldCheck, PenTool, Printer, Save, Plus, Trash2, Search,
  ArrowLeft, CheckCircle, Clock, Copy, Eye, Edit3, RefreshCw, Building,
  UserCheck, Mail, Phone, Calendar, AlertCircle, FileCheck
} from 'lucide-react';
import Link from 'next/link';
import { useAdminSession } from '../../../src/hooks/useAdminSession';
import { BRAND_NAME } from '@/lib/brand';

// ── Types ────────────────────────────────────────────────────────────────────
interface LegalDoc {
  id?: string;
  docNumber: string;
  docType: string;
  title: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  signerName: string;
  signerRole: string;
  signerEmail: string;
  signerPhone: string;
  recipientCompany: string;
  issueDate: string;
  nraRefNumber?: string;
  regStatusNote?: string;
  authorizationScope: string[];
  customDetails: string;
  signatureDataUrl?: string;
  status: string;
  createdAt?: string;
}

const DOC_TYPES = [
  { id: 'authorization_letter', label: 'Letter of Authorization', subtitle: 'For signatory & legal representative' },
  { id: 'sole_proprietor_declaration', label: 'Sole Proprietorship Declaration', subtitle: 'Proof of legal ownership & authority' },
  { id: 'board_resolution', label: 'Board / Management Resolution', subtitle: 'Formal resolution authorizing officer' },
  { id: 'tax_reg_declaration', label: 'Tax & Registration Status Statement', subtitle: 'Declaration with NRA / OARG ref number' },
];

const DEFAULT_SCOPES = [
  'Sign binding commercial contracts, agreements, and proposals',
  'Issue official invoices, receipts, and financial claims',
  'Submit official quotations, tenders, and vendor registration applications',
  'Receive payments and manage company supplier accounts',
  'Act as primary legal & operational contact person'
];

const fmtDate = (d?: string) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const blankDoc = (): LegalDoc => ({
  docNumber: `AUTH-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 900 + 100)}`,
  docType: 'authorization_letter',
  title: 'LETTER OF AUTHORIZATION',
  companyName: BRAND_NAME,
  companyAddress: '15 Siaka Stevens Street, Freetown, Sierra Leone',
  companyPhone: '+232 78 000 000 / +232 76 000 000',
  companyEmail: 'info@itservicesfreetown.com',
  signerName: 'Ryan Stewart',
  signerRole: 'Founder & Managing Director',
  signerEmail: 'ryan@itservicesfreetown.com',
  signerPhone: '+232 78 000 000',
  recipientCompany: 'Hemmersbach GmbH & Co. KG',
  issueDate: new Date().toISOString().split('T')[0],
  nraRefNumber: '',
  regStatusNote: 'Business registration and NRA Tax Certificate applications currently in progress with the Administrator and Registrar-General (OARG) and National Revenue Authority (NRA).',
  authorizationScope: [...DEFAULT_SCOPES],
  customDetails: '',
  signatureDataUrl: '',
  status: 'active'
});

const DRAFT_KEY = 'admin_legal_doc_draft';

export default function LegalDocumentsAdminPage() {
  const { showIdleWarning, getRemainingTime } = useAdminSession({
    idleTimeout: 10 * 60 * 1000,
    warningTime: 60 * 1000,
  });

  const printRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tab, setTab] = useState<'builder' | 'history'>('builder');
  const [doc, setDoc] = useState<LegalDoc>(blankDoc());
  const [savedDocs, setSavedDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  // ── Restore draft ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.signerName) {
          setDoc(parsed);
          if (parsed.signatureDataUrl) setHasSignature(true);
          if (parsed._savedAt) setLastSaved(parsed._savedAt);
          setDraftRestored(true);
        }
      }
    } catch {}
  }, []);

  // ── Auto-Save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doc.signerName) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...doc, _savedAt: ts }));
        setLastSaved(ts);
      } catch {}
      setIsSaving(false);
    }, 750);
    return () => clearTimeout(timer);
  }, [doc]);

  const notify = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Signature Canvas Functions ─────────────────────────────────────────────
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#040e40';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setDoc(prev => ({ ...prev, signatureDataUrl: dataUrl }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    setDoc(prev => ({ ...prev, signatureDataUrl: '' }));
  };

  // Load signature into canvas when restoring
  useEffect(() => {
    if (doc.signatureDataUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHasSignature(true);
        };
        img.src = doc.signatureDataUrl;
      }
    }
  }, [tab]);

  // ── Scope toggle ───────────────────────────────────────────────────────────
  const toggleScope = (item: string) => {
    setDoc(prev => {
      const exists = prev.authorizationScope.includes(item);
      return {
        ...prev,
        authorizationScope: exists
          ? prev.authorizationScope.filter(s => s !== item)
          : [...prev.authorizationScope, item]
      };
    });
  };

  const addCustomScope = (text: string) => {
    if (!text.trim()) return;
    setDoc(prev => ({ ...prev, authorizationScope: [...prev.authorizationScope, text.trim()] }));
  };

  // ── API Calls ──────────────────────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/legal-documents?${params}`);
      const data = await res.json();
      setSavedDocs(Array.isArray(data) ? data : []);
    } catch {
      setSavedDocs([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (tab === 'history') fetchDocs();
  }, [tab, fetchDocs]);

  const saveDocument = async () => {
    if (!doc.signerName.trim()) { notify('error', 'Signer name is required.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/legal-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        notify('success', `Document ${doc.docNumber} saved!`);
        localStorage.removeItem(DRAFT_KEY);
        setLastSaved(null);
        setDraftRestored(false);
      } else {
        const err = await res.json();
        notify('error', err.error || 'Failed to save document.');
      }
    } catch {
      notify('error', 'Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await fetch(`/api/legal-documents?id=${id}`, { method: 'DELETE' });
      notify('success', 'Document deleted.');
      fetchDocs();
    } catch {
      notify('error', 'Failed to delete.');
    }
  };

  const loadDoc = (d: LegalDoc) => {
    setDoc(d);
    setTab('builder');
    setPreviewMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Print Handler ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank', 'width=950,height=1100');
    if (!win) return;

    const headStyles = Array.from(document.querySelectorAll('head link[rel="stylesheet"], head style'))
      .map(el => el.outerHTML)
      .join('\n');

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title} - ${doc.docNumber}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${headStyles}
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            .print-wrapper {
              width: 100% !important;
              max-width: 800px !important;
              margin: 0 auto !important;
              background: #ffffff !important;
            }
            @media print {
              body { background: #ffffff !important; padding: 0 !important; }
              .print-wrapper { box-shadow: none !important; border: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${content.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#040e40]/70 to-slate-950 text-white">

      {/* Idle Warning */}
      {showIdleWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#dc2626] text-white text-center py-3 animate-pulse text-sm font-semibold">
          ⚠️ Session expiring in {getRemainingTime()}s — move your mouse to stay logged in.
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all
          ${notification.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-200'
            : 'bg-red-900/90 border-red-500/50 text-red-200'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-3 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-red-400 bg-clip-text text-transparent flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-red-500" />
              Legal & Authorization Letters
            </h1>
            <p className="text-slate-400 text-sm mt-1">Generate official proof of legal authority, authorization letters, and sole proprietor declarations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setDoc(blankDoc()); localStorage.removeItem(DRAFT_KEY); setLastSaved(null); setDraftRestored(false); setPreviewMode(false); setTab('builder'); }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all border border-white/10"
            >
              <Plus className="w-4 h-4" /> New Letter
            </button>
            <button
              onClick={() => setTab(tab === 'builder' ? 'history' : 'builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${tab === 'history' ? 'bg-[#dc2626] border-red-500 text-white shadow-lg' : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              {tab === 'history' ? <><FileText className="w-4 h-4" /> Builder</> : <><Search className="w-4 h-4" /> History</>}
            </button>
          </div>
        </div>

        {/* Auto-Save Status */}
        <div className="bg-[#040e40]/60 border border-blue-500/30 rounded-xl px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSaving ? 'bg-amber-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSaving ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-blue-200 font-medium">
              {isSaving ? 'Saving draft...' : lastSaved ? `Draft auto-saved at ${lastSaved}` : 'Auto-Save active'}
            </span>
            {draftRestored && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Restored</span>
            )}
          </div>
          {(lastSaved || draftRestored) && (
            <button onClick={() => { localStorage.removeItem(DRAFT_KEY); setDoc(blankDoc()); setLastSaved(null); setDraftRestored(false); }}
              className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Discard Draft
            </button>
          )}
        </div>

        {/* ── BUILDER TAB ────────────────────────────────────────────────────── */}
        {tab === 'builder' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* ── LEFT: Form ──────────────────────────────────────────────── */}
            <div className={`space-y-5 ${previewMode ? 'hidden xl:block' : ''}`}>

              {/* Document Type Selector */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Select Document Type</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOC_TYPES.map(dt => (
                    <button
                      key={dt.id}
                      onClick={() => setDoc(p => ({
                        ...p,
                        docType: dt.id,
                        title: dt.label.toUpperCase()
                      }))}
                      className={`text-left p-3.5 rounded-xl border transition-all ${doc.docType === dt.id ? 'bg-[#040e40] border-red-500 text-white shadow-lg ring-1 ring-red-500' : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800'}`}
                    >
                      <div className="font-bold text-sm">{dt.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{dt.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Authorized Signer Details */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-red-400" /> Authorized Signer & Representative
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
                    <input value={doc.signerName} onChange={e => setDoc(p => ({ ...p, signerName: e.target.value }))}
                      placeholder="e.g. Ryan Stewart"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Title / Position *</label>
                    <input value={doc.signerRole} onChange={e => setDoc(p => ({ ...p, signerRole: e.target.value }))}
                      placeholder="e.g. Founder & Managing Director"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Email Address</label>
                    <input value={doc.signerEmail} onChange={e => setDoc(p => ({ ...p, signerEmail: e.target.value }))}
                      placeholder="e.g. ryan@itservicesfreetown.com"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Phone Contact</label>
                    <input value={doc.signerPhone} onChange={e => setDoc(p => ({ ...p, signerPhone: e.target.value }))}
                      placeholder="e.g. +232 78 000 000"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
              </div>

              {/* Recipient & Dates */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-red-400" /> Recipient & Date Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Recipient / Partner Company</label>
                    <input value={doc.recipientCompany} onChange={e => setDoc(p => ({ ...p, recipientCompany: e.target.value }))}
                      placeholder="e.g. Hemmersbach GmbH & Co. KG or TO WHOM IT MAY CONCERN"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Document Reference No.</label>
                    <input value={doc.docNumber} onChange={e => setDoc(p => ({ ...p, docNumber: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm font-mono focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Issue Date</label>
                    <input type="date" value={doc.issueDate} onChange={e => setDoc(p => ({ ...p, issueDate: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">NRA Ref. Number (Workaround)</label>
                    <input value={doc.nraRefNumber || ''} onChange={e => setDoc(p => ({ ...p, nraRefNumber: e.target.value }))}
                      placeholder="e.g. NRA-REF-2026-0811 (Optional)"
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm font-mono focus:ring-2 focus:ring-red-500 placeholder-slate-600" />
                  </div>
                </div>
              </div>

              {/* Authorization Powers & Scope */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Authorized Powers & Scope</h2>
                <div className="space-y-2.5">
                  {DEFAULT_SCOPES.map(scope => {
                    const checked = doc.authorizationScope.includes(scope);
                    return (
                      <label key={scope} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-blue-950/40 border-blue-500/50 text-white' : 'bg-slate-900/40 border-white/10 text-slate-400'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleScope(scope)}
                          className="mt-0.5 rounded border-slate-700 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs leading-relaxed font-medium">{scope}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <label className="text-xs text-slate-400 mb-1 block">Registration Status Note (Workaround)</label>
                  <textarea value={doc.regStatusNote || ''} onChange={e => setDoc(p => ({ ...p, regStatusNote: e.target.value }))}
                    rows={2} placeholder="Note on pending OARG / NRA registration..."
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 resize-none text-xs" />
                </div>
              </div>

              {/* On-Screen Interactive Signature Pad */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-red-400" /> Screen Digital Signature Pad
                  </h2>
                  {hasSignature && (
                    <button onClick={clearSignature} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-medium">
                      <Trash2 className="w-3.5 h-3.5" /> Clear Signature
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Draw your signature below using touch screen, mouse, or stylus:</p>
                <div className="bg-white rounded-xl p-2 border-2 border-dashed border-slate-300">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-32 touch-none cursor-crosshair bg-white rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span>Signer: <strong className="text-white">{doc.signerName || 'Ryan Stewart'}</strong></span>
                  <span className={hasSignature ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {hasSignature ? '✓ Signature captured' : 'Draw above to sign'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={saveDocument} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#040e40] via-[#0c1f72] to-[#dc2626] hover:from-[#03092b] hover:to-[#b91c1c] disabled:opacity-50 rounded-xl font-bold transition-all shadow-xl text-white">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Document'}
                </button>
                <button onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all xl:hidden border border-white/10 font-medium">
                  <Eye className="w-4 h-4" /> {previewMode ? 'Edit' : 'Preview'}
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all border border-red-500/50 shadow-lg font-bold">
                  <Printer className="w-4 h-4" /> Print / Download PDF
                </button>
              </div>
            </div>

            {/* ── RIGHT: Branded Live Preview ─────────────────────────────── */}
            <div className={`${!previewMode ? 'hidden xl:block' : ''}`}>
              <div className="sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Official Letterhead Preview</h2>
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-bold shadow-md">
                      <Printer className="w-3.5 h-3.5" /> Print / PDF
                    </button>
                    <button onClick={() => setPreviewMode(false)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all xl:hidden">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>

                {/* Formal Letterhead Document Container */}
                <div ref={printRef} className="bg-white rounded-2xl shadow-2xl text-slate-900 overflow-hidden border border-slate-200" style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>

                  {/* Top Color Accent Line */}
                  <div className="h-3 w-full" style={{ background: 'linear-gradient(90deg, #040e40 0%, #0a1b68 60%, #dc2626 100%)' }}></div>

                  <div className="p-8 space-y-6">

                    {/* Official Letterhead Header */}
                    <div className="flex items-start justify-between border-b-2 border-[#040e40] pb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-900 p-2 flex items-center justify-center shrink-0 shadow-md">
                          <img src="/assets/logo.png" alt={doc.companyName} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                        <div>
                          <div className="text-2xl font-black tracking-tight text-[#040e40] uppercase">{doc.companyName}</div>
                          <div className="text-xs text-red-600 font-bold mt-0.5">Professional IT Services & Solutions</div>
                          <div className="text-xs text-slate-600 mt-1">{doc.companyAddress}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Tel: {doc.companyPhone} · Email: {doc.companyEmail}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400 font-mono">Ref: <strong className="text-slate-800">{doc.docNumber}</strong></div>
                        <div className="text-xs text-slate-400 font-mono mt-1">Date: <strong className="text-slate-800">{fmtDate(doc.issueDate)}</strong></div>
                      </div>
                    </div>

                    {/* Recipient Address */}
                    <div className="text-xs text-slate-700 space-y-1">
                      <div className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">To:</div>
                      <div className="font-extrabold text-slate-900 text-sm">{doc.recipientCompany || 'TO WHOM IT MAY CONCERN'}</div>
                      <div className="text-slate-500">Partner Management & Vendor Onboarding Department</div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                      <h2 className="text-base font-black tracking-widest text-[#040e40] uppercase">{doc.title}</h2>
                      <p className="text-[10px] text-red-600 font-bold tracking-wider uppercase mt-0.5">Formal Proof of Legal Signatory Authority</p>
                    </div>

                    {/* Document Body Text */}
                    <div className="text-xs text-slate-800 leading-relaxed space-y-4">
                      <p>
                        This official letter serves as formal authorization and verification of legal authority for <strong className="text-[#040e40] font-black">{doc.companyName}</strong>.
                      </p>
                      <p>
                        We hereby confirm and declare that:
                      </p>

                      {/* Signer Identity Box */}
                      <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-200/80 space-y-1.5 text-xs">
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Authorized Person:</span>
                          <span className="col-span-2 font-black text-slate-900 text-sm">{doc.signerName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <span className="text-slate-500 font-medium">Title / Capacity:</span>
                          <span className="col-span-2 font-bold text-[#040e40]">{doc.signerRole}</span>
                        </div>
                        {doc.signerEmail && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-slate-500 font-medium">Contact Email:</span>
                            <span className="col-span-2 font-mono text-slate-800">{doc.signerEmail}</span>
                          </div>
                        )}
                        {doc.signerPhone && (
                          <div className="grid grid-cols-3 gap-2">
                            <span className="text-slate-500 font-medium">Phone Number:</span>
                            <span className="col-span-2 font-mono text-slate-800">{doc.signerPhone}</span>
                          </div>
                        )}
                      </div>

                      <p className="font-semibold text-slate-900">
                        {doc.signerName} possesses full legal authority to execute the following operational, commercial, and legal actions on behalf of {doc.companyName}:
                      </p>

                      {/* Scope List */}
                      <ul className="space-y-1.5 pl-2">
                        {doc.authorizationScope.map((scope, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-600 font-bold shrink-0">✓</span>
                            <span className="text-slate-800 font-medium">{scope}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Reference / Workaround details if provided */}
                      {(doc.nraRefNumber || doc.regStatusNote) && (
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1">
                          <div className="font-bold text-[#040e40] text-[11px] uppercase tracking-wide">Registration & Regulatory References:</div>
                          {doc.nraRefNumber && (
                            <div>• NRA Application Reference Number: <strong className="font-mono text-slate-900">{doc.nraRefNumber}</strong></div>
                          )}
                          {doc.regStatusNote && (
                            <div className="text-slate-600 italic mt-0.5">• {doc.regStatusNote}</div>
                          )}
                        </div>
                      )}

                      <p>
                        This authorization remains valid and in full effect for all commercial proceedings, supplier onboarding, and contractual dealings with {doc.recipientCompany || 'partner organizations'}.
                      </p>
                    </div>

                    {/* Sign-Off & Signature Box */}
                    <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                      <div className="space-y-1 text-xs">
                        <div className="text-slate-500">Issued by:</div>
                        <div className="font-extrabold text-[#040e40] text-sm">{doc.companyName}</div>
                        <div className="text-slate-500">Freetown, Sierra Leone</div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-xs text-slate-500 mb-1">Authorized Signatory:</div>
                        {doc.signatureDataUrl ? (
                          <div className="inline-block border-b border-slate-400 pb-1">
                            <img src={doc.signatureDataUrl} alt="Signature" className="h-14 object-contain max-w-48 mx-auto" />
                          </div>
                        ) : (
                          <div className="h-12 w-48 border-b-2 border-slate-400 border-dashed flex items-center justify-center text-[10px] text-slate-400 italic">
                            [ Signature On File / Screen ]
                          </div>
                        )}
                        <div className="font-black text-slate-900 text-sm mt-1">{doc.signerName}</div>
                        <div className="text-xs font-bold text-red-600">{doc.signerRole}</div>
                      </div>
                    </div>

                    {/* Letterhead Footer */}
                    <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400 font-medium">
                      {doc.companyName} · Official Authorization Document · Freetown, Sierra Leone
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ────────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search legal letters..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <button onClick={fetchDocs} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all border border-white/10">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={() => { setDoc(blankDoc()); setTab('builder'); setPreviewMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all shadow-md">
                <Plus className="w-3.5 h-3.5" /> New Document
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {loading ? (
                <div className="text-center py-16 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-red-400" />
                  Loading documents...
                </div>
              ) : savedDocs.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No legal letters found</p>
                  <p className="text-slate-600 text-sm mt-1">Generate your first authorization letter using the builder</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr className="text-xs text-slate-400 uppercase tracking-widest">
                        <th className="text-left px-5 py-3">Ref #</th>
                        <th className="text-left px-5 py-3">Document Title</th>
                        <th className="text-left px-5 py-3">Authorized Signer</th>
                        <th className="text-left px-5 py-3">Recipient</th>
                        <th className="text-left px-5 py-3">Date</th>
                        <th className="text-right px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {savedDocs.map(d => (
                        <tr key={d.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-5 py-3.5 font-mono text-red-400 text-xs font-bold">{d.docNumber}</td>
                          <td className="px-5 py-3.5 font-medium text-white">{d.title}</td>
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-white">{d.signerName}</div>
                            <div className="text-xs text-slate-500">{d.signerRole}</div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 text-xs">{d.recipientCompany}</td>
                          <td className="px-5 py-3.5 text-slate-400 text-xs">{d.issueDate}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => loadDoc(d)} title="Edit" className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteDoc(d.id!)} title="Delete" className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
