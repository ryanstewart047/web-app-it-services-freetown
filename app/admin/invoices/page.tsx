'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText, Plus, Trash2, Printer, Download, Save, Search, Eye,
  ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, TrendingUp,
  User, Building2, Phone, Mail, MapPin, CreditCard, Copy, Edit3, RefreshCw,
  Sparkles, Check, ChevronDown, ChevronUp, Settings
} from 'lucide-react';
import Link from 'next/link';
import { useAdminSession } from '../../../src/hooks/useAdminSession';
import { BRAND_NAME, BRAND_LOGO_SRC, BRAND_LOGO_DARK_SRC, BRAND_LOGO_FALLBACK_SRC } from '@/lib/brand';

// ── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CompanyInfo {
  companyName: string;
  companyTagline: string;
  companyAddress: string;
  companyCityCountry: string;
  companyPhone: string;
  companyEmail: string;
  payTo?: string;
}

interface Invoice extends CompanyInfo {
  id?: string;
  invoiceNumber: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientTaxId: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  amountPaid: number;
  totalAmount: number;
  balanceDue: number;
  payTo?: string;
  notes: string;
  paymentInstructions: string;
  createdAt?: string;
  updatedAt?: string;
}

// ── Default Constants ────────────────────────────────────────────────────────
const DEFAULT_COMPANY_INFO: CompanyInfo = {
  companyName: BRAND_NAME || 'BridgeTech IT Services',
  companyTagline: 'Professional IT Services & Hardware Repairs',
  companyAddress: 'No 1 Regent Highway, Jui Junction, Freetown',
  companyCityCountry: 'Freetown, Sierra Leone',
  companyPhone: '+232 33 399 391 / +232 76 210 320',
  companyEmail: 'support@itservicesfreetown.com',
  payTo: 'BridgeTech IT Services',
};

const SAVED_INVOICES_KEY = 'saved_invoices';
const DRAFT_KEY = 'admin_invoice_draft';
const COMPANY_INFO_KEY = 'admin_company_info';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `Le ${Number(n || 0).toLocaleString('en-SL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().split('T')[0];
const genInvoiceNo = () => {
  const d = new Date();
  const seq = Math.floor(Math.random() * 900) + 100;
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${seq}`;
};
const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft:     { label: 'Draft',     color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',   icon: <Edit3 className="w-3 h-3" /> },
  pending:   { label: 'Pending',   color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   icon: <Clock className="w-3 h-3" /> },
  part_paid: { label: 'Part Paid', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',     icon: <CreditCard className="w-3 h-3" /> },
  paid:      { label: 'Paid',      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: <CheckCircle className="w-3 h-3" /> },
  overdue:   { label: 'Overdue',   color: 'bg-red-500/20 text-red-300 border-red-500/40',        icon: <AlertTriangle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-slate-600/20 text-slate-400 border-slate-600/40', icon: <XCircle className="w-3 h-3" /> },
};

const PAYMENT_TERMS = ['Due on Receipt', 'Net 7', 'Net 14', 'Net 30', 'Net 60'];
const DEFAULT_PAYMENT_INSTRUCTIONS = `Payment can be made via:
• Orange Money: +232 33 399 391
• Africell Money: +232 76 210 320
• Bank Transfer: Sierra Leone Commercial Bank
  Account Name: BridgeTech IT Services
  Account No: 0123456789
• Cash / Card: Payable at our office, No. 1 Regent Highway, Jui Junction`;

const emptyItem = (): InvoiceItem => ({
  id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

const getSavedCompanyInfo = (): CompanyInfo => {
  if (typeof window === 'undefined') return DEFAULT_COMPANY_INFO;
  try {
    const saved = localStorage.getItem(COMPANY_INFO_KEY);
    if (saved) return { ...DEFAULT_COMPANY_INFO, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_COMPANY_INFO;
};

const blankInvoice = (): Invoice => {
  const company = getSavedCompanyInfo();
  return {
    invoiceNumber: genInvoiceNo(),
    ...company,
    payTo: company.payTo || company.companyName || 'BridgeTech IT Services',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientTaxId: '',
    invoiceDate: today(),
    dueDate: addDays(today(), 14),
    paymentTerms: 'Net 14',
    status: 'pending',
    items: [emptyItem()],
    subtotal: 0,
    taxRate: 15,
    taxAmount: 0,
    discountAmount: 0,
    amountPaid: 0,
    totalAmount: 0,
    balanceDue: 0,
    notes: '',
    paymentInstructions: DEFAULT_PAYMENT_INSTRUCTIONS,
  };
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function InvoicesAdminPage() {
  const { showIdleWarning, getRemainingTime } = useAdminSession({
    idleTimeout: 10 * 60 * 1000,
    warningTime: 60 * 1000,
  });

  const printRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'builder' | 'history'>('builder');
  const [invoice, setInvoice] = useState<Invoice>(blankInvoice());
  const [savedInvoices, setSavedInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewMode, setPreviewMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [companySavedMsg, setCompanySavedMsg] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // ── Restore draft on mount ─────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.invoiceNumber) {
          setInvoice(prev => ({ ...prev, ...parsed }));
          if (parsed._savedAt) setLastSaved(parsed._savedAt);
          setDraftRestored(true);
        }
      }
    } catch {}
  }, []);

  // ── Auto-Save draft ────────────────────────────────────────────────────────
  useEffect(() => {
    const hasData = invoice.clientName || invoice.clientCompany || invoice.items.some(i => i.description);
    if (!hasData) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...invoice, _savedAt: ts }));
        setLastSaved(ts);
      } catch {}
      setIsSaving(false);
    }, 750);
    return () => clearTimeout(timer);
  }, [invoice]);

  // ── Recalculate totals whenever items, tax, discount, or amountPaid change ──
  useEffect(() => {
    const subtotal = invoice.items.reduce((s, i) => s + (Number(i.total) || 0), 0);
    const taxAmount = parseFloat(((subtotal * (Number(invoice.taxRate) || 0)) / 100).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount - (Number(invoice.discountAmount) || 0)).toFixed(2));
    const balanceDue = parseFloat((Math.max(0, totalAmount - (Number(invoice.amountPaid) || 0))).toFixed(2));
    setInvoice(prev => ({ ...prev, subtotal, taxAmount, totalAmount, balanceDue }));
  }, [invoice.items, invoice.taxRate, invoice.discountAmount, invoice.amountPaid]);

  // ── Payment terms → due date auto-fill ────────────────────────────────────
  useEffect(() => {
    const days = parseInt(invoice.paymentTerms.replace('Net ', '')) || 0;
    const due = days > 0 ? addDays(invoice.invoiceDate, days) : invoice.invoiceDate;
    setInvoice(prev => ({ ...prev, dueDate: due }));
  }, [invoice.paymentTerms, invoice.invoiceDate]);

  const notify = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Save Company Default Info ──────────────────────────────────────────────
  const handleSaveCompanyDefaults = () => {
    try {
      const companyInfo: CompanyInfo = {
        companyName: invoice.companyName || DEFAULT_COMPANY_INFO.companyName,
        companyTagline: invoice.companyTagline || DEFAULT_COMPANY_INFO.companyTagline,
        companyAddress: invoice.companyAddress || DEFAULT_COMPANY_INFO.companyAddress,
        companyCityCountry: invoice.companyCityCountry || DEFAULT_COMPANY_INFO.companyCityCountry,
        companyPhone: invoice.companyPhone || DEFAULT_COMPANY_INFO.companyPhone,
        companyEmail: invoice.companyEmail || DEFAULT_COMPANY_INFO.companyEmail,
        payTo: invoice.payTo || DEFAULT_COMPANY_INFO.payTo || DEFAULT_COMPANY_INFO.companyName,
      };
      localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(companyInfo));
      setCompanySavedMsg(true);
      notify('success', 'Provider details saved as default for future invoices!');
      setTimeout(() => setCompanySavedMsg(false), 3000);
    } catch {}
  };

  // ── Item CRUD ──────────────────────────────────────────────────────────────
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = parseFloat((Number(updated.quantity || 0) * Number(updated.unitPrice || 0)).toFixed(2));
        }
        return updated;
      })
    }));
  };

  const addItem = () => setInvoice(prev => ({ ...prev, items: [...prev.items, emptyItem()] }));
  const removeItem = (id: string) => {
    if (invoice.items.length <= 1) return;
    setInvoice(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  // ── Load & Sync Invoices (Offline & Online Resilient) ─────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    // 1. Instantly load from localStorage
    let localList: Invoice[] = [];
    try {
      const local = localStorage.getItem(SAVED_INVOICES_KEY);
      if (local) {
        localList = JSON.parse(local);
        setSavedInvoices(localList);
      }
    } catch {}

    // 2. Fetch from API & Merge
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/invoices?${params}`);
      if (res.ok) {
        const apiData = await res.json();
        if (Array.isArray(apiData)) {
          // Merge API data with localStorage data
          const map = new Map<string, Invoice>();
          // Put local invoices first
          for (const item of localList) {
            if (item.invoiceNumber) map.set(item.invoiceNumber, item);
          }
          // Merge / override with server invoices
          for (const item of apiData) {
            if (item.invoiceNumber) {
              const existing = map.get(item.invoiceNumber);
              map.set(item.invoiceNumber, {
                ...DEFAULT_COMPANY_INFO,
                ...existing,
                ...item,
                items: Array.isArray(item.items) ? item.items : (existing?.items || [emptyItem()])
              });
            }
          }
          const merged = Array.from(map.values()).sort((a, b) => {
            const da = new Date(a.createdAt || a.invoiceDate).getTime();
            const db = new Date(b.createdAt || b.invoiceDate).getTime();
            return db - da;
          });
          setSavedInvoices(merged);
          localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.warn('API fetch failed, displaying local invoices:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (tab === 'history') fetchInvoices();
  }, [tab, fetchInvoices]);

  // ── Save Invoice (Guaranteed Client & Server Sync) ───────────────────────────
  const saveInvoice = async () => {
    if (!invoice.clientName.trim()) {
      notify('error', 'Client name is required.');
      return;
    }
    setSaving(true);

    const invoiceToSave: Invoice = {
      ...invoice,
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to localStorage immediately
    try {
      const local = localStorage.getItem(SAVED_INVOICES_KEY);
      let list: Invoice[] = local ? JSON.parse(local) : [];
      const idx = list.findIndex(i => i.invoiceNumber === invoiceToSave.invoiceNumber);
      if (idx >= 0) {
        list[idx] = invoiceToSave;
      } else {
        list.unshift(invoiceToSave);
      }
      localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(list));
      setSavedInvoices(list);
      localStorage.removeItem(DRAFT_KEY);
      setLastSaved(null);
      setDraftRestored(false);
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    // 2. Sync to Server API
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceToSave),
      });
      if (res.ok) {
        notify('success', `Invoice ${invoice.invoiceNumber} saved successfully!`);
      } else {
        const err = await res.json().catch(() => ({}));
        notify('success', `Invoice saved locally! (${err.error || 'Server sync pending'})`);
      }
    } catch {
      notify('success', `Invoice ${invoice.invoiceNumber} saved locally!`);
    } finally {
      setSaving(false);
    }
  };

  const deleteInvoice = async (invNo: string) => {
    if (!confirm(`Delete invoice ${invNo}? This cannot be undone.`)) return;

    // Delete locally
    try {
      const local = localStorage.getItem(SAVED_INVOICES_KEY);
      if (local) {
        const filtered = JSON.parse(local).filter((i: Invoice) => i.invoiceNumber !== invNo);
        localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(filtered));
        setSavedInvoices(filtered);
      }
    } catch {}

    // Delete from API
    try {
      await fetch(`/api/invoices?invoiceNumber=${invNo}`, { method: 'DELETE' });
      notify('success', 'Invoice deleted.');
    } catch {
      notify('success', 'Invoice removed locally.');
    }
  };

  const loadInvoice = (inv: Invoice) => {
    const safeItems = Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : [emptyItem()];
    setInvoice({
      ...DEFAULT_COMPANY_INFO,
      ...inv,
      items: safeItems
    });
    setTab('builder');
    setPreviewMode(false);
    notify('success', `Loaded Invoice ${inv.invoiceNumber}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const duplicateInvoice = (inv: Invoice) => {
    const safeItems = Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : [emptyItem()];
    const dup: Invoice = {
      ...DEFAULT_COMPANY_INFO,
      ...inv,
      id: undefined,
      invoiceNumber: genInvoiceNo(),
      invoiceDate: today(),
      dueDate: addDays(today(), 14),
      status: 'pending',
      amountPaid: 0,
      items: safeItems.map(i => ({ ...i, id: `item_${Date.now()}_${Math.random().toString(36).slice(2,6)}` })),
    };
    setInvoice(dup);
    setTab('builder');
    setPreviewMode(false);
    notify('success', `Duplicated as new invoice ${dup.invoiceNumber}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateStatus = async (invNo: string, status: string) => {
    // Update local state and storage
    let updatedInv: Invoice | null = null;
    const updatedList = savedInvoices.map(i => {
      if (i.invoiceNumber === invNo) {
        updatedInv = { ...i, status };
        return updatedInv;
      }
      return i;
    });
    setSavedInvoices(updatedList);
    try {
      localStorage.setItem(SAVED_INVOICES_KEY, JSON.stringify(updatedList));
    } catch {}

    if (updatedInv) {
      try {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedInv),
        });
      } catch {}
    }
  };

  // ── Standalone Robust Print Handler ───────────────────────────────────────
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
          <title>Invoice_${invoice.invoiceNumber}</title>
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
              margin: 8mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
              -webkit-font-smoothing: antialiased;
            }
            .print-wrapper {
              width: 100% !important;
              max-width: 820px !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              padding: 0 !important;
            }
            @media print {
              body { background: #ffffff !important; padding: 0 !important; }
              .print-wrapper { width: 100% !important; max-width: 100% !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
              .no-print { display: none !important; }
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

  // Analytics
  const totalIssued = savedInvoices.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalCollected = savedInvoices.reduce((s, i) => s + (Number(i.amountPaid) || 0), 0);
  const totalPending = savedInvoices.reduce((s, i) => s + (Number(i.balanceDue) || 0), 0);
  const paidCount = savedInvoices.filter(i => i.status === 'paid').length;
  const overdueCount = savedInvoices.filter(i => i.status === 'overdue').length;

  // ────────────────────────────────────────────────────────────────────────────
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
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
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
              <FileText className="w-8 h-8 text-red-500" />
              Invoice Generator & Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">Create, customize, manage, and print commercial invoices with editable business credentials</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setInvoice(blankInvoice());
                localStorage.removeItem(DRAFT_KEY);
                setLastSaved(null);
                setDraftRestored(false);
                setPreviewMode(false);
                setTab('builder');
                notify('success', 'Ready for new invoice!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all border border-white/10"
            >
              <Plus className="w-4 h-4" /> New Invoice
            </button>
            <button
              onClick={() => setTab(tab === 'builder' ? 'history' : 'builder')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${tab === 'history' ? 'bg-[#dc2626] border-red-500 text-white shadow-lg' : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'}`}
            >
              {tab === 'history' ? <><FileText className="w-4 h-4" /> Builder</> : <><Search className="w-4 h-4" /> Invoices History ({savedInvoices.length})</>}
            </button>
          </div>
        </div>

        {/* Auto-Save Status Bar */}
        <div className="bg-[#040e40]/60 border border-blue-500/30 rounded-xl px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSaving ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSaving ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-blue-200 font-medium">
              {isSaving ? 'Saving draft...' : lastSaved ? `Draft auto-saved at ${lastSaved}` : 'Auto-Save enabled (Local & Database)'}
            </span>
            {draftRestored && (
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Draft Restored</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(lastSaved || draftRestored) && (
              <button
                onClick={() => {
                  localStorage.removeItem(DRAFT_KEY);
                  setInvoice(blankInvoice());
                  setLastSaved(null);
                  setDraftRestored(false);
                  notify('success', 'Draft cleared');
                }}
                className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Discard Draft
              </button>
            )}
          </div>
        </div>

        {/* ── BUILDER TAB ────────────────────────────────────────────────────── */}
        {tab === 'builder' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* ── LEFT: Form ──────────────────────────────────────────────── */}
            <div className={`space-y-5 ${previewMode ? 'hidden xl:block' : ''}`}>

              {/* ── Provider / Company Details (Fully Editable) ── */}
              <div className="bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowCompanyDetails(!showCompanyDetails)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        Provider / Business Information (From)
                        <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">Editable</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {invoice.companyName} · {invoice.companyCityCountry}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {showCompanyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Company Settings */}
                {showCompanyDetails && (
                  <div className="mt-5 pt-5 border-t border-white/10 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" /> Business / Company Name
                        </label>
                        <input
                          value={invoice.companyName}
                          onChange={e => setInvoice(p => ({ ...p, companyName: e.target.value }))}
                          placeholder="e.g. BridgeTech IT Services"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Tagline / Subtitle
                        </label>
                        <input
                          value={invoice.companyTagline}
                          onChange={e => setInvoice(p => ({ ...p, companyTagline: e.target.value }))}
                          placeholder="e.g. Professional IT Services & Hardware Repairs"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" /> Street Address
                        </label>
                        <input
                          value={invoice.companyAddress}
                          onChange={e => setInvoice(p => ({ ...p, companyAddress: e.target.value }))}
                          placeholder="e.g. No 1 Regent Highway, Jui Junction, Freetown"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" /> City & Country
                        </label>
                        <input
                          value={invoice.companyCityCountry}
                          onChange={e => setInvoice(p => ({ ...p, companyCityCountry: e.target.value }))}
                          placeholder="e.g. Freetown, Sierra Leone"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-blue-400" /> Phone Numbers
                        </label>
                        <input
                          value={invoice.companyPhone}
                          onChange={e => setInvoice(p => ({ ...p, companyPhone: e.target.value }))}
                          placeholder="e.g. +232 33 399 391 / +232 76 210 320"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address
                        </label>
                        <input
                          value={invoice.companyEmail}
                          onChange={e => setInvoice(p => ({ ...p, companyEmail: e.target.value }))}
                          placeholder="e.g. support@itservicesfreetown.com"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="text-xs text-slate-300 font-medium mb-1 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Default Pay To Name (Account / Payee Name)
                        </label>
                        <input
                          value={invoice.payTo || ''}
                          onChange={e => setInvoice(p => ({ ...p, payTo: e.target.value }))}
                          placeholder="e.g. BridgeTech IT Services / Account Name"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleSaveCompanyDefaults}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow"
                      >
                        <Save className="w-3.5 h-3.5" /> Save as Default Provider Info
                      </button>
                      {companySavedMsg && (
                        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Saved as default!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Meta */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Invoice Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Invoice Number</label>
                    <input value={invoice.invoiceNumber} onChange={e => setInvoice(p => ({ ...p, invoiceNumber: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Status</label>
                    <select value={invoice.status} onChange={e => setInvoice(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Invoice Date</label>
                    <input type="date" value={invoice.invoiceDate} onChange={e => setInvoice(p => ({ ...p, invoiceDate: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Payment Terms</label>
                    <select value={invoice.paymentTerms} onChange={e => setInvoice(p => ({ ...p, paymentTerms: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500">
                      {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
                    <input type="date" value={invoice.dueDate} onChange={e => setInvoice(p => ({ ...p, dueDate: e.target.value }))}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-red-400" /> Bill To (Client Details)
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Client Name *', key: 'clientName', placeholder: 'Full Name', icon: <User className="w-3.5 h-3.5" /> },
                    { label: 'Company / Organisation', key: 'clientCompany', placeholder: 'Company Name', icon: <Building2 className="w-3.5 h-3.5" /> },
                    { label: 'Phone', key: 'clientPhone', placeholder: '+232 78 000 000', icon: <Phone className="w-3.5 h-3.5" /> },
                    { label: 'Email', key: 'clientEmail', placeholder: 'email@example.com', icon: <Mail className="w-3.5 h-3.5" /> },
                    { label: 'Tax ID / Business Reg.', key: 'clientTaxId', placeholder: 'TIN-0000000', icon: <CreditCard className="w-3.5 h-3.5" /> },
                  ].map(f => (
                    <div key={f.key} className={f.key === 'clientAddress' ? 'col-span-2' : ''}>
                      <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">{f.icon} {f.label}</label>
                      <input value={(invoice as any)[f.key]} onChange={e => setInvoice(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-600" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</label>
                    <textarea value={invoice.clientAddress} onChange={e => setInvoice(p => ({ ...p, clientAddress: e.target.value }))}
                      placeholder="Street, City, Country" rows={2}
                      className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 resize-none placeholder-slate-600" />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest">Services / Items</h2>
                  <button onClick={addItem} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-all border border-red-500/30 font-medium">
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-[10px] text-slate-500 uppercase tracking-widest px-1">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-3 text-right">Unit Price</div>
                    <div className="col-span-1 text-right">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  {invoice.items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center group">
                      <div className="col-span-5">
                        <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Service or product description"
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-slate-600" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 text-center" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 text-right font-mono" />
                      </div>
                      <div className="col-span-1 text-right text-xs text-slate-300 font-mono">
                        {(item.total || 0).toLocaleString()}
                      </div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => removeItem(item.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Calculation */}
                <div className="mt-6 border-t border-white/10 pt-5 space-y-2.5">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono">{fmt(invoice.subtotal)}</span>
                  </div>
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-300">NRA Value Added Tax (VAT %)</label>
                        <p className="text-[11px] text-slate-400">Standard Sierra Leone NRA VAT rate is 15%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {[
                          { label: '15% VAT (NRA)', rate: 15 },
                          { label: '5% Reduced', rate: 5 },
                          { label: '0% Exempt', rate: 0 },
                        ].map(preset => (
                          <button
                            key={preset.rate}
                            type="button"
                            onClick={() => setInvoice(p => ({ ...p, taxRate: preset.rate }))}
                            className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${
                              invoice.taxRate === preset.rate 
                                ? 'bg-red-600 border-red-500 text-white' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                        <input type="number" min="0" max="100" step="0.5" value={invoice.taxRate} onChange={e => setInvoice(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))}
                          className="w-20 bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-white text-sm text-right focus:ring-2 focus:ring-red-500 font-mono" />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                      <span className="font-medium">Calculated VAT ({invoice.taxRate}% NRA)</span>
                      <span className="font-mono text-red-400 font-bold">+ {fmt(invoice.taxAmount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm text-slate-400">Discount (Le)</label>
                    <input type="number" min="0" value={invoice.discountAmount} onChange={e => setInvoice(p => ({ ...p, discountAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-32 bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-white text-sm text-right focus:ring-2 focus:ring-red-500 font-mono" />
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Discount</span>
                      <span className="font-mono text-emerald-400">- {fmt(invoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-white border-t border-white/10 pt-3">
                    <span>Total</span>
                    <span className="font-mono text-blue-300">{fmt(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-sm text-slate-400">Amount Paid / Deposit (Le)</label>
                    <input type="number" min="0" value={invoice.amountPaid} onChange={e => setInvoice(p => ({ ...p, amountPaid: parseFloat(e.target.value) || 0 }))}
                      className="w-36 bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-white text-sm text-right focus:ring-2 focus:ring-red-500 font-mono" />
                  </div>
                  {invoice.amountPaid > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Amount Paid</span>
                      <span className="font-mono text-emerald-400">- {fmt(invoice.amountPaid)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl border-t-2 border-red-500/50 pt-3">
                    <span className="text-white">Balance Due</span>
                    <span className={`font-mono ${invoice.balanceDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{fmt(invoice.balanceDue)}</span>
                  </div>

                  {/* Pay To Option under Balance Due */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 mt-1 border-t border-white/10 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <div>
                      <label className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-red-400" /> Pay To Option
                      </label>
                      <p className="text-[10px] text-slate-400">Recipient/Payee name displayed under Balance Due on the invoice</p>
                    </div>
                    <input
                      type="text"
                      value={invoice.payTo || ''}
                      onChange={e => setInvoice(p => ({ ...p, payTo: e.target.value }))}
                      placeholder="e.g. BridgeTech IT Services / Account Name"
                      className="w-full sm:w-60 bg-slate-950 border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:ring-2 focus:ring-red-500 font-semibold placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes & Payment Instructions */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-widest font-bold">Notes & Terms</label>
                  <textarea value={invoice.notes} onChange={e => setInvoice(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Additional notes, warranty terms, device serials..."
                    rows={3} className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 resize-y placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block uppercase tracking-widest font-bold">Payment Details & Instructions</label>
                  <textarea value={invoice.paymentInstructions} onChange={e => setInvoice(p => ({ ...p, paymentInstructions: e.target.value }))}
                    rows={6} className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-red-500 resize-y font-mono text-xs" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={saveInvoice} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#040e40] via-[#0c1f72] to-[#dc2626] hover:from-[#03092b] hover:to-[#b91c1c] disabled:opacity-50 rounded-xl font-bold transition-all shadow-xl text-white">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save & Retain Invoice'}
                </button>
                <button onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all xl:hidden border border-white/10 font-medium">
                  <Eye className="w-4 h-4" /> {previewMode ? 'Edit' : 'Preview'}
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all border border-red-500/50 shadow-lg font-bold">
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
              </div>
            </div>

            {/* ── RIGHT: Live Preview ─────────────────────────────────────── */}
            <div className={`${!previewMode ? 'hidden xl:block' : ''}`}>
              <div className="sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Printable Preview (Branded)
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-bold shadow-md">
                      <Printer className="w-3.5 h-3.5" /> Print / PDF
                    </button>
                    <button onClick={() => setPreviewMode(false)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all xl:hidden">
                      <Edit3 className="w-3.5 h-3.5" /> Edit Form
                    </button>
                  </div>
                </div>

                {/* Invoice Document (Branded Printable Unit) */}
                <div ref={printRef} className="bg-white rounded-2xl shadow-2xl text-slate-900 overflow-hidden border border-slate-200" style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>

                  {/* Header: Site Brand Navy to Red Gradient */}
                  <div className="px-8 py-6 text-white" style={{ background: 'linear-gradient(135deg, #040e40 0%, #0a1b68 55%, #dc2626 100%)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-28 h-20 rounded-xl bg-white/10 p-2 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                          <img
                            src={BRAND_LOGO_DARK_SRC}
                            alt={invoice.companyName || BRAND_NAME}
                            className="w-full h-full object-contain filter drop-shadow-md"
                            onError={(e) => { (e.target as HTMLImageElement).src = BRAND_LOGO_SRC; }}
                          />
                        </div>
                        <div>
                          <div className="text-2xl font-black tracking-tight text-white">{invoice.companyName || BRAND_NAME}</div>
                          <div className="text-red-100 text-xs font-medium mt-0.5">{invoice.companyTagline || 'Professional IT Services & Hardware Repairs'}</div>
                          <div className="text-blue-100 text-xs mt-0.5">{invoice.companyPhone} · {invoice.companyEmail}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-3xl font-black tracking-widest text-white/30 uppercase">INVOICE</div>
                        <div className="text-lg font-mono font-bold mt-0.5 text-white">{invoice.invoiceNumber}</div>
                        <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm
                          ${invoice.status === 'paid' ? 'bg-emerald-500 text-white'
                          : invoice.status === 'overdue' ? 'bg-red-600 text-white'
                          : invoice.status === 'part_paid' ? 'bg-blue-600 text-white'
                          : invoice.status === 'draft' ? 'bg-slate-500 text-white'
                          : 'bg-amber-500 text-white'}`}>
                          {STATUS_CONFIG[invoice.status]?.label || invoice.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-6 space-y-6">

                    {/* Dates Row */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      {[
                        { label: 'Issue Date', value: invoice.invoiceDate, color: 'border-l-4 border-[#040e40]' },
                        { label: 'Payment Terms', value: invoice.paymentTerms, color: 'border-l-4 border-indigo-600' },
                        { label: 'Due Date', value: invoice.dueDate, color: 'border-l-4 border-[#dc2626]' },
                      ].map(d => (
                        <div key={d.label} className={`bg-slate-50 rounded-lg p-3 border border-slate-200/80 ${d.color}`}>
                          <div className="text-slate-400 uppercase tracking-widest text-[9px] font-bold mb-0.5">{d.label}</div>
                          <div className="font-bold text-slate-800 text-sm">{d.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Bill To & Provider */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Provider / From */}
                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
                        <div className="text-[10px] text-[#040e40] uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#040e40] inline-block"></span> Provider / From
                        </div>
                        <div className="font-extrabold text-slate-900 text-sm">{invoice.companyName || BRAND_NAME}</div>
                        <div className="text-xs text-slate-600 mt-1">{invoice.companyAddress || 'No 1 Regent Highway, Jui Junction, Freetown'}</div>
                        <div className="text-xs text-slate-600">{invoice.companyCityCountry || 'Freetown, Sierra Leone'}</div>
                        <div className="text-xs text-slate-600 mt-1 font-mono">{invoice.companyPhone || '+232 33 399 391 / +232 76 210 320'}</div>
                        {invoice.companyEmail && <div className="text-xs text-slate-500">{invoice.companyEmail}</div>}
                      </div>

                      {/* Billed To */}
                      <div className="bg-red-50/60 rounded-xl p-4 border border-red-200/70">
                        <div className="text-[10px] text-[#dc2626] uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#dc2626] inline-block"></span> Billed To
                        </div>
                        <div className="font-extrabold text-slate-900 text-sm">{invoice.clientName || <span className="text-slate-400 italic">Client Name Not Specified</span>}</div>
                        {invoice.clientCompany && <div className="text-xs text-slate-700 font-semibold">{invoice.clientCompany}</div>}
                        {invoice.clientEmail && <div className="text-xs text-slate-600">{invoice.clientEmail}</div>}
                        {invoice.clientPhone && <div className="text-xs text-slate-600 font-mono">{invoice.clientPhone}</div>}
                        {invoice.clientAddress && <div className="text-xs text-slate-600 mt-1 whitespace-pre-line">{invoice.clientAddress}</div>}
                        {invoice.clientTaxId && <div className="text-xs text-slate-500 mt-1 font-mono">TIN: {invoice.clientTaxId}</div>}
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="rounded-xl overflow-hidden border border-slate-200">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ backgroundColor: '#040e40', color: '#ffffff' }}>
                            <th className="text-left px-4 py-3 font-bold uppercase tracking-wider w-10">#</th>
                            <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Description</th>
                            <th className="text-center px-4 py-3 font-bold uppercase tracking-wider w-16">Qty</th>
                            <th className="text-right px-4 py-3 font-bold uppercase tracking-wider w-28">Unit Price</th>
                            <th className="text-right px-4 py-3 font-bold uppercase tracking-wider w-32">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {invoice.items.filter(i => i.description).map((item, idx) => (
                            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                              <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                              <td className="px-4 py-3 text-slate-800 font-semibold">{item.description}</td>
                              <td className="px-4 py-3 text-center text-slate-700 font-mono font-medium">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-slate-700 font-mono">{fmt(item.unitPrice)}</td>
                              <td className="px-4 py-3 text-right text-slate-900 font-mono font-bold">{fmt(item.total)}</td>
                            </tr>
                          ))}
                          {invoice.items.filter(i => i.description).length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No items added to invoice</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-80 bg-slate-50/90 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-mono font-semibold">{fmt(invoice.subtotal)}</span></div>
                        <div className="flex justify-between text-slate-700 font-medium">
                          <span>Value Added Tax (VAT {invoice.taxRate}%)</span>
                          <span className="font-mono font-bold text-slate-800">+ {fmt(invoice.taxAmount)}</span>
                        </div>
                        {invoice.discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-semibold"><span>Discount</span><span className="font-mono">- {fmt(invoice.discountAmount)}</span></div>}
                        <div className="flex justify-between font-extrabold text-sm border-t border-slate-200 pt-2 text-slate-900"><span>Grand Total</span><span className="font-mono text-[#040e40]">{fmt(invoice.totalAmount)}</span></div>
                        {invoice.amountPaid > 0 && <div className="flex justify-between text-emerald-700 font-semibold"><span>Amount Paid / Deposit</span><span className="font-mono">- {fmt(invoice.amountPaid)}</span></div>}
                        <div className={`flex justify-between font-black text-base border-t-2 pt-2 ${invoice.balanceDue > 0 ? 'border-red-400 text-[#dc2626]' : 'border-emerald-400 text-emerald-700'}`}>
                          <span>Balance Due</span>
                          <span className="font-mono">{fmt(invoice.balanceDue)}</span>
                        </div>

                        {/* Pay To Option under Balance Due */}
                        {invoice.payTo && (
                          <div className="flex justify-between items-center text-xs border-t border-slate-200/90 pt-2 mt-1 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200/60">
                            <span className="text-slate-600 uppercase tracking-wider text-[10px] font-black flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#040e40]"></span> Pay To:
                            </span>
                            <span className="font-extrabold text-[#040e40] font-sans text-xs">{invoice.payTo}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Instructions */}
                    {invoice.paymentInstructions && (
                      <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                        <div className="text-[10px] text-[#040e40] uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#040e40]" /> Payment Details & Instructions
                        </div>
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{invoice.paymentInstructions}</pre>
                      </div>
                    )}

                    {/* Notes */}
                    {invoice.notes && (
                      <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/80">
                        <div className="text-[10px] text-amber-800 uppercase tracking-widest font-black mb-1">Notes & Terms</div>
                        <p className="text-xs text-slate-700 leading-relaxed">{invoice.notes}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 font-medium">
                      Thank you for choosing <span className="font-bold text-[#040e40]">{invoice.companyName || BRAND_NAME}</span>! · {invoice.companyAddress || 'No 1 Regent Highway, Jui Junction, Freetown'}
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

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Invoiced', value: fmt(totalIssued), color: 'from-[#040e40]/40 to-blue-900/30 border-blue-500/30', text: 'text-blue-200' },
                { label: 'Collected', value: fmt(totalCollected), color: 'from-emerald-900/30 to-emerald-800/20 border-emerald-500/30', text: 'text-emerald-300' },
                { label: 'Balance Pending', value: fmt(totalPending), color: 'from-amber-900/30 to-amber-800/20 border-amber-500/30', text: 'text-amber-300' },
                { label: 'Paid Invoices', value: paidCount.toString(), color: 'from-emerald-950/40 to-emerald-900/30 border-emerald-500/30', text: 'text-emerald-300' },
                { label: 'Overdue', value: overdueCount.toString(), color: 'from-red-950/40 to-red-900/30 border-red-500/30', text: 'text-red-300' },
              ].map(c => (
                <div key={c.label} className={`bg-gradient-to-br ${c.color} border rounded-xl p-4`}>
                  <div className="text-xs text-slate-400 mb-1">{c.label}</div>
                  <div className={`text-xl font-bold ${c.text}`}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search client, company, invoice number..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-white/15 rounded-lg text-white text-sm focus:ring-2 focus:ring-red-500">
                <option value="all">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={fetchInvoices} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all border border-white/10">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button onClick={() => { setInvoice(blankInvoice()); setTab('builder'); setPreviewMode(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all shadow-md">
                <Plus className="w-3.5 h-3.5" /> New Invoice
              </button>
            </div>

            {/* Invoice Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {loading && savedInvoices.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-red-400" />
                  Loading invoices...
                </div>
              ) : savedInvoices.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No invoices found</p>
                  <p className="text-slate-600 text-sm mt-1">Create your first invoice using the builder</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr className="text-xs text-slate-400 uppercase tracking-widest">
                        <th className="text-left px-5 py-3">Invoice #</th>
                        <th className="text-left px-5 py-3">Client</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Date</th>
                        <th className="text-left px-5 py-3 hidden lg:table-cell">Due</th>
                        <th className="text-right px-5 py-3">Total</th>
                        <th className="text-right px-5 py-3 hidden md:table-cell">Balance</th>
                        <th className="text-center px-5 py-3">Status</th>
                        <th className="text-right px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {savedInvoices.map(inv => {
                        const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending;
                        return (
                          <tr key={inv.invoiceNumber} className="hover:bg-white/5 transition-colors group">
                            <td className="px-5 py-3.5 font-mono text-red-400 text-xs font-bold">{inv.invoiceNumber}</td>
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-white">{inv.clientName}</div>
                              {inv.clientCompany && <div className="text-xs text-slate-500">{inv.clientCompany}</div>}
                            </td>
                            <td className="px-5 py-3.5 text-slate-400 text-xs hidden md:table-cell">{inv.invoiceDate}</td>
                            <td className="px-5 py-3.5 text-slate-400 text-xs hidden lg:table-cell">{inv.dueDate}</td>
                            <td className="px-5 py-3.5 text-right font-mono text-white text-xs">{fmt(inv.totalAmount)}</td>
                            <td className={`px-5 py-3.5 text-right font-mono text-xs font-bold hidden md:table-cell ${inv.balanceDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {fmt(inv.balanceDue)}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <select value={inv.status} onChange={e => updateStatus(inv.invoiceNumber, e.target.value)}
                                className={`text-[10px] font-bold uppercase tracking-wide border rounded-full px-2.5 py-1 cursor-pointer bg-transparent transition-all ${sc.color}`}>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                  <option key={k} value={k} className="bg-slate-900 text-white">{v.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => loadInvoice(inv)} title="Edit / View in Builder" className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all">
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => duplicateInvoice(inv)} title="Duplicate as New" className="p-1.5 hover:bg-purple-500/20 rounded-lg text-purple-400 transition-all">
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteInvoice(inv.invoiceNumber)} title="Delete" className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
