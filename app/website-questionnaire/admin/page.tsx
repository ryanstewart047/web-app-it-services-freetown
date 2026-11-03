'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import {
  ArrowLeft, RefreshCw, Trash2, ChevronDown, ChevronUp, Download,
  Search, Filter, CheckCircle2, Eye, MessageSquare, Phone, Mail,
  Globe, DollarSign, Clock, Building2, User, Calendar, FileText
} from 'lucide-react'
import { downloadQuestionnairePDF, downloadBlankQuestionnairePDF } from '@/lib/website-questionnaire-pdf'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Submission {
  id: string
  organizationName: string
  contactName: string
  email: string
  phone: string | null
  websitePurpose: string
  siteType: string
  hasExistingDomain: boolean
  existingDomain: string | null
  hasExistingBranding: boolean
  brandingDescription: string | null
  hasHighQualityPhotos: boolean
  photosDescription: string | null
  hasContent: boolean
  contentDescription: string | null
  canMaintainSelf: boolean
  needsCMS: boolean
  needsEcommerce: boolean
  needsBooking: boolean
  needsMultilingual: boolean
  needsSEO: boolean
  integrations: string | null
  targetAudience: string | null
  competitors: string | null
  budgetRange: string | null
  timeline: string | null
  socialMediaLinks: string | null
  inspirationUrls: string | null
  additionalNotes: string | null
  status: string
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: 'New',       color: 'text-blue-700',   bg: 'bg-blue-100' },
  reviewed:  { label: 'Reviewed',  color: 'text-yellow-700', bg: 'bg-yellow-100' },
  contacted: { label: 'Contacted', color: 'text-green-700',  bg: 'bg-green-100' },
  closed:    { label: 'Closed',    color: 'text-gray-500',   bg: 'bg-gray-100' },
}

function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? STATUS_META.new
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
      {meta.label}
    </span>
  )
}

const SITE_TYPE_LABELS: Record<string, string> = {
  static: 'Static / Brochure', dynamic: 'Dynamic / CMS', ecommerce: 'E-Commerce',
  portfolio: 'Portfolio / Gallery', unsure: 'Not Sure Yet',
}

const BUDGET_LABELS: Record<string, string> = {
  'under-1000': 'Under $1,000', '1000-3000': '$1,000–$3,000', '3000-10000': '$3,000–$10,000',
  '10000+': '$10,000+', 'flexible': 'Flexible',
}

const TIMELINE_LABELS: Record<string, string> = {
  'urgent-2weeks': 'ASAP (<2 wks)', '1-month': '1 Month', '2-3-months': '2–3 Months', 'flexible': 'Flexible',
}

function Pill({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${on ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
      {on ? '✓' : '✗'} {label}
    </span>
  )
}

function exportCSV(submissions: Submission[]) {
  const headers = [
    'ID', 'Submitted', 'Organisation', 'Contact', 'Email', 'Phone', 'Site Type',
    'Budget', 'Timeline', 'Status', 'Has Domain', 'Has Branding', 'Has Photos',
    'Has Content', 'Needs CMS', 'Needs Ecommerce', 'Needs Booking', 'Needs Multilingual',
    'Needs SEO', 'Can Maintain', 'Purpose', 'Target Audience', 'Competitors',
    'Integrations', 'Social Media', 'Inspiration URLs', 'Additional Notes', 'Admin Notes',
  ]
  const rows = submissions.map(s => [
    s.id,
    new Date(s.createdAt).toLocaleDateString(),
    s.organizationName, s.contactName, s.email, s.phone ?? '',
    SITE_TYPE_LABELS[s.siteType] ?? s.siteType,
    BUDGET_LABELS[s.budgetRange ?? ''] ?? s.budgetRange ?? '',
    TIMELINE_LABELS[s.timeline ?? ''] ?? s.timeline ?? '',
    s.status,
    s.hasExistingDomain ? 'Yes' : 'No',
    s.hasExistingBranding ? 'Yes' : 'No',
    s.hasHighQualityPhotos ? 'Yes' : 'No',
    s.hasContent ? 'Yes' : 'No',
    s.needsCMS ? 'Yes' : 'No',
    s.needsEcommerce ? 'Yes' : 'No',
    s.needsBooking ? 'Yes' : 'No',
    s.needsMultilingual ? 'Yes' : 'No',
    s.needsSEO ? 'Yes' : 'No',
    s.canMaintainSelf ? 'Yes' : 'No',
    `"${(s.websitePurpose ?? '').replace(/"/g, '""')}"`,
    `"${(s.targetAudience ?? '').replace(/"/g, '""')}"`,
    `"${(s.competitors ?? '').replace(/"/g, '""')}"`,
    `"${(s.integrations ?? '').replace(/"/g, '""')}"`,
    `"${(s.socialMediaLinks ?? '').replace(/"/g, '""')}"`,
    `"${(s.inspirationUrls ?? '').replace(/"/g, '""')}"`,
    `"${(s.additionalNotes ?? '').replace(/"/g, '""')}"`,
    `"${(s.adminNotes ?? '').replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `website-questionnaires-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Card component ───────────────────────────────────────────────────────────

function SubmissionCard({
  sub, onStatusChange, onDelete,
}: {
  sub: Submission
  onStatusChange: (id: string, status: string, notes: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [editStatus, setEditStatus] = useState(sub.status)
  const [editNotes, setEditNotes] = useState(sub.adminNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function save() {
    setSaving(true)
    await onStatusChange(sub.id, editStatus, editNotes)
    setSaving(false)
  }

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all ${expanded ? 'border-[#ef4444]' : 'border-gray-100'} shadow-sm`}>
      {/* Summary row */}
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#040e40] flex items-center justify-center text-white font-bold text-sm shrink-0">
          {sub.organizationName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-[#040e40] truncate">{sub.organizationName}</p>
              <p className="text-sm text-gray-500">{sub.contactName} · {sub.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {statusBadge(sub.status)}
              <span className="text-xs text-gray-400">{new Date(sub.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {sub.siteType && (
              <span className="text-xs bg-[#040e40]/10 text-[#040e40] px-2 py-0.5 rounded font-medium">
                {SITE_TYPE_LABELS[sub.siteType] ?? sub.siteType}
              </span>
            )}
            {sub.budgetRange && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">
                {BUDGET_LABELS[sub.budgetRange] ?? sub.budgetRange}
              </span>
            )}
            {sub.timeline && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                {TIMELINE_LABELS[sub.timeline] ?? sub.timeline}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              downloadQuestionnairePDF(sub, { submissionId: sub.id })
              toast.success('Downloading brief PDF...')
            }}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#ef4444] transition"
            title="Download response as PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 shrink-0"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-6 pt-4 space-y-5">

          {/* Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sub.phone && (
              <a href={`tel:${sub.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#ef4444] transition">
                <Phone className="w-4 h-4 text-[#ef4444]" /> {sub.phone}
              </a>
            )}
            <a href={`mailto:${sub.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#ef4444] transition">
              <Mail className="w-4 h-4 text-[#ef4444]" /> {sub.email}
            </a>
            {sub.existingDomain && (
              <a href={`https://${sub.existingDomain}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#ef4444] transition">
                <Globe className="w-4 h-4 text-[#ef4444]" /> {sub.existingDomain}
              </a>
            )}
          </div>

          {/* Purpose */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Website Purpose</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{sub.websitePurpose}</p>
          </div>

          {/* Features grid */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features & Capabilities</p>
            <div className="flex flex-wrap gap-2">
              <Pill on={sub.hasExistingDomain}    label="Existing Domain" />
              <Pill on={sub.hasExistingBranding}  label="Has Branding" />
              <Pill on={sub.hasHighQualityPhotos} label="Quality Photos" />
              <Pill on={sub.hasContent}            label="Content Ready" />
              <Pill on={sub.needsCMS}              label="Needs CMS" />
              <Pill on={sub.needsEcommerce}        label="E-Commerce" />
              <Pill on={sub.needsBooking}          label="Booking System" />
              <Pill on={sub.needsMultilingual}     label="Multi-language" />
              <Pill on={sub.needsSEO}              label="SEO" />
              <Pill on={sub.canMaintainSelf}       label="Self-Maintain" />
            </div>
          </div>

          {/* Optional text fields */}
          {[
            { label: 'Branding Description',  val: sub.brandingDescription },
            { label: 'Photos Description',    val: sub.photosDescription },
            { label: 'Content Description',   val: sub.contentDescription },
            { label: 'Integrations',          val: sub.integrations },
            { label: 'Target Audience',       val: sub.targetAudience },
            { label: 'Competitors / Inspiration', val: sub.competitors },
            { label: 'Social Media',          val: sub.socialMediaLinks },
            { label: 'Inspiration URLs',      val: sub.inspirationUrls },
            { label: 'Additional Notes',      val: sub.additionalNotes },
          ].filter(f => f.val).map(f => (
            <div key={f.label}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{f.label}</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">{f.val}</p>
            </div>
          ))}

          {/* Admin controls */}
          <div className="bg-[#040e40]/5 rounded-2xl p-4 space-y-3 border border-[#040e40]/10">
            <p className="text-xs font-bold text-[#040e40] uppercase tracking-wider">Admin Controls</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Update Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 bg-white"
                >
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add internal notes here…"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 bg-white resize-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#040e40] hover:bg-[#0a1a5c] text-white text-xs font-bold transition disabled:opacity-60"
              >
                {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadQuestionnairePDF(sub, { submissionId: sub.id })
                  toast.success('Downloading brief PDF...')
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#040e40] text-xs font-bold transition border border-gray-200"
              >
                <Download className="w-3.5 h-3.5 text-[#ef4444]" /> Download PDF
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#ef4444] text-xs font-bold transition border border-red-200"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-semibold">Confirm delete?</span>
                  <button onClick={() => onDelete(sub.id)} className="px-3 py-1.5 rounded-lg bg-[#ef4444] text-white text-xs font-bold">Yes, Delete</button>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

function WebsiteQuestionnaireAdminInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isIframe = searchParams?.get('iframe') === '1'

  const [authed, setAuthed] = useState<boolean | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  // ── Auth check ──
  useEffect(() => {
    fetch('/api/admin/website-questionnaire?limit=1')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null }
        return r.json()
      })
      .then(d => { if (d) setAuthed(true) })
      .catch(() => router.push('/admin'))
  }, [router])

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res  = await fetch(`/api/admin/website-questionnaire?${params}`)
      const data = await res.json()
      setSubmissions(data.submissions ?? [])
      setTotal(data.total ?? 0)
    } catch {
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { if (authed) fetchData() }, [authed, fetchData])

  // ── Actions ──
  async function handleStatusChange(id: string, status: string, adminNotes: string) {
    try {
      const res = await fetch(`/api/admin/website-questionnaire?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes }),
      })
      if (!res.ok) throw new Error()
      toast.success('Submission updated')
      fetchData()
    } catch {
      toast.error('Failed to update submission')
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/website-questionnaire?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Submission deleted')
      setSubmissions(prev => prev.filter(s => s.id !== id))
      setTotal(t => t - 1)
    } catch {
      toast.error('Failed to delete submission')
    }
  }

  // ── Filter by search ──
  const filtered = submissions.filter(s => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.organizationName.toLowerCase().includes(q) ||
      s.contactName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone ?? '').includes(q)
    )
  })

  // ── Status counts ──
  const counts: Record<string, number> = { all: submissions.length }
  submissions.forEach(s => { counts[s.status] = (counts[s.status] ?? 0) + 1 })

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#ef4444]/30 border-t-[#ef4444] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* ─── Top bar ─── */}
      {!isIframe ? (
        <div className="bg-[#040e40] text-white px-4 py-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/admin')} className="p-2 rounded-lg hover:bg-white/10 transition" title="Back to Admin Dashboard">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <Image
                  src="/assets/bridgetech-avatar-transparent.png"
                  alt="BridgeTech"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tight text-white leading-none">BridgeTech</span>
                  <span className="text-[8px] font-extrabold tracking-widest text-[#ef4444] uppercase leading-tight mt-0.5">IT SERVICES</span>
                </div>
              </div>
              <span className="hidden sm:block text-white/30">|</span>
              <span className="hidden sm:block text-sm font-semibold text-white/80">Website Questionnaires</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  downloadBlankQuestionnairePDF()
                  toast.success('Downloading blank questionnaire PDF...')
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-semibold transition text-white"
                title="Download a blank printable intake form for offline client meetings"
              >
                <FileText className="w-3.5 h-3.5 text-[#ef4444]" /> Blank Form (PDF)
              </button>
              <button
                onClick={() => exportCSV(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={fetchData}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/bridgetech-avatar-transparent.png"
                alt="BridgeTech"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-bold text-[#040e40]">Website Questionnaires</h2>
                  <span className="text-[9px] font-extrabold text-[#ef4444] uppercase bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">BridgeTech</span>
                </div>
                <p className="text-[11px] text-gray-500">Client discovery briefs & project specifications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  downloadBlankQuestionnairePDF()
                  toast.success('Downloading blank questionnaire PDF...')
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
                title="Download a blank printable intake form for offline client meetings"
              >
                <FileText className="w-3.5 h-3.5 text-[#ef4444]" /> Blank Form (PDF)
              </button>
              <button
                onClick={() => exportCSV(filtered)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" /> Export CSV
              </button>
              <button
                onClick={fetchData}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ─── Stats strip ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { key: 'all',       label: 'Total',     color: 'bg-[#040e40] text-white' },
            { key: 'new',       label: 'New',        color: 'bg-blue-600 text-white' },
            { key: 'reviewed',  label: 'Reviewed',   color: 'bg-yellow-500 text-white' },
            { key: 'contacted', label: 'Contacted',  color: 'bg-green-600 text-white' },
            { key: 'closed',    label: 'Closed',     color: 'bg-gray-400 text-white' },
          ].map(st => (
            <button
              key={st.key}
              onClick={() => setFilterStatus(st.key)}
              className={`rounded-2xl px-4 py-3 text-center transition-all shadow-sm border-2 ${
                filterStatus === st.key
                  ? `${st.color} border-transparent scale-105 shadow-md`
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-2xl font-extrabold">{counts[st.key] ?? 0}</p>
              <p className="text-xs font-semibold opacity-80">{st.label}</p>
            </button>
          ))}
        </div>

        {/* ─── Search & filter bar ─── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 text-sm bg-white"
            />
          </div>
          <a
            href="/website-questionnaire"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-bold transition shadow-sm"
          >
            <Eye className="w-4 h-4" /> View Public Form
          </a>
        </div>

        {/* ─── List ─── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-gray-400 text-lg">No submissions found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterStatus !== 'all' ? `No ${filterStatus} submissions.` : 'Share the questionnaire link with your customers to get started.'}
            </p>
            <a
              href="/website-questionnaire"
              target="_blank"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-[#040e40] text-white text-sm font-bold hover:bg-[#0a1a5c] transition"
            >
              Open Public Form →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
              <SubmissionCard
                key={s.id}
                sub={s}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Shareable link */}
        <div className="bg-[#040e40] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-white font-bold text-sm">📎 Shareable Questionnaire Link</p>
            <p className="text-white/50 text-xs mt-0.5">Share this with customers requesting a website</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-lg font-mono">
              https://www.itservicesfreetown.com/website-questionnaire
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://www.itservicesfreetown.com/website-questionnaire')
                toast.success('Link copied!')
              }}
              className="px-3 py-1.5 rounded-lg bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold transition"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WebsiteQuestionnaireAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-[#ef4444]/30 border-t-[#ef4444] rounded-full animate-spin" />
        </div>
      }
    >
      <WebsiteQuestionnaireAdminInner />
    </Suspense>
  )
}
