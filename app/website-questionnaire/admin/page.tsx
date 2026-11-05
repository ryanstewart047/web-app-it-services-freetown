'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import {
  ArrowLeft, RefreshCw, Trash2, ChevronDown, ChevronUp, Download,
  Search, Filter, CheckCircle2, Eye, MessageSquare, Phone, Mail,
  Globe, DollarSign, Clock, Building2, User, Calendar, FileText,
  Palette, Layers, Sparkles, AlertCircle, Copy, ExternalLink, Share2
} from 'lucide-react'
import { downloadQuestionnairePDF, downloadBlankQuestionnairePDF } from '@/lib/website-questionnaire-pdf'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Submission {
  id: string
  organizationName: string
  contactName: string
  email: string
  phone: string | null
  address: string | null
  businessRegistration: string | null
  preferredContactMethod: string | null
  websitePurpose: string
  siteType: string
  hasExistingDomain: boolean
  domainStatus: string | null
  existingDomain: string | null
  hasExistingBranding: boolean
  brandingDescription: string | null
  brandColors: string | null
  hasHighQualityPhotos: boolean
  photosDescription: string | null
  hasContent: boolean
  contentDescription: string | null
  wantsContentWriting: boolean
  wantsGraphicDesign: boolean
  pageCount: string | null
  needsHosting: boolean
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
  targetDeadline: string | null
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
  '200-500': '$200 – $500',
  '500-1000': '$500 – $1,000',
  'under-1000': 'Under $1,000',
  '1000-3000': '$1,000–$3,000',
  '3000-10000': '$3,000–$10,000',
  '10000+': '$10,000+',
  'flexible': 'Flexible',
}

const TIMELINE_LABELS: Record<string, string> = {
  'urgent-2weeks': 'ASAP (<2 wks)',
  '1-month': '1 Month',
  '2-3-months': '2–3 Months',
  'flexible': 'Flexible',
}

const PAGE_COUNT_LABELS: Record<string, string> = {
  '1-landing': '1 Page (Landing)',
  '3-5-pages': '3–5 Pages',
  '6-10-pages': '6–10 Pages',
  '10-plus': '10+ Pages',
  'unsure': 'Unsure',
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
    'ID', 'Submitted', 'Organisation', 'Contact', 'Email', 'Phone', 'Address', 'Tax ID / Business Reg', 'Preferred Contact',
    'Site Type', 'Page Count', 'Budget', 'Timeline', 'Target Deadline', 'Status',
    'Domain Status', 'Domain Name', 'Brand Colors', 'Has Branding', 'Has Photos',
    'Has Content', 'Wants Copywriting', 'Wants Graphics', 'Needs Hosting', 'Needs CMS',
    'Needs Ecommerce', 'Needs Booking', 'Needs Multilingual', 'Needs SEO', 'Can Maintain',
    'Purpose', 'Target Audience', 'Competitors', 'Integrations', 'Social Media',
    'Inspiration URLs', 'Additional Notes', 'Admin Notes',
  ]
  const rows = submissions.map(s => [
    s.id,
    new Date(s.createdAt).toLocaleDateString(),
    s.organizationName, s.contactName, s.email, s.phone ?? '',
    `"${(s.address ?? '').replace(/"/g, '""')}"`,
    `"${(s.businessRegistration ?? '').replace(/"/g, '""')}"`,
    s.preferredContactMethod ?? 'whatsapp',
    SITE_TYPE_LABELS[s.siteType] ?? s.siteType,
    PAGE_COUNT_LABELS[s.pageCount ?? ''] ?? s.pageCount ?? '',
    BUDGET_LABELS[s.budgetRange ?? ''] ?? s.budgetRange ?? '',
    TIMELINE_LABELS[s.timeline ?? ''] ?? s.timeline ?? '',
    s.targetDeadline ?? '',
    s.status,
    s.domainStatus ?? (s.hasExistingDomain ? 'have-domain' : 'need-domain'),
    s.existingDomain ?? '',
    `"${(s.brandColors ?? '').replace(/"/g, '""')}"`,
    s.hasExistingBranding ? 'Yes' : 'No',
    s.hasHighQualityPhotos ? 'Yes' : 'No',
    s.hasContent ? 'Yes' : 'No',
    s.wantsContentWriting ? 'Yes' : 'No',
    s.wantsGraphicDesign ? 'Yes' : 'No',
    s.needsHosting ? 'Yes' : 'No',
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

  // Parse brand colors
  let brandColorsParsed: { primary?: string; secondary?: string; accent?: string } | null = null
  if (sub.brandColors) {
    try {
      const parsed = JSON.parse(sub.brandColors)
      if (typeof parsed === 'object') brandColorsParsed = parsed
    } catch {
      // not JSON
    }
  }

  const isNeedDomain = sub.domainStatus === 'need-domain'
  const isHaveDomain = sub.domainStatus === 'have-domain' || sub.hasExistingDomain

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
              <p className="font-bold text-[#040e40] truncate text-base">{sub.organizationName}</p>
              <p className="text-sm text-gray-500">
                {sub.contactName} · {sub.email}
                {sub.preferredContactMethod && (
                  <span className="ml-1.5 inline-block text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                    via {sub.preferredContactMethod}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {statusBadge(sub.status)}
              <span className="text-xs text-gray-400">
                {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {sub.siteType && (
              <span className="text-xs bg-[#040e40]/10 text-[#040e40] px-2 py-0.5 rounded font-medium">
                {SITE_TYPE_LABELS[sub.siteType] ?? sub.siteType}
              </span>
            )}
            {sub.pageCount && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                📄 {PAGE_COUNT_LABELS[sub.pageCount] ?? sub.pageCount}
              </span>
            )}
            {sub.budgetRange && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                💰 {BUDGET_LABELS[sub.budgetRange] ?? sub.budgetRange}
              </span>
            )}
            {sub.timeline && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                ⏱ {TIMELINE_LABELS[sub.timeline] ?? sub.timeline}
              </span>
            )}
            {isNeedDomain && (
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                🌐 Needs Domain Reg.
              </span>
            )}
            {sub.wantsContentWriting && (
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-200">
                ✍️ Wants Copywriting
              </span>
            )}
            {sub.wantsGraphicDesign && (
              <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded border border-rose-200">
                🎨 Wants Graphics
              </span>
            )}
            {sub.needsHosting && (
              <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                ☁️ Needs Hosting
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {sub.phone && (
              <a href={`tel:${sub.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#ef4444] transition">
                <Phone className="w-4 h-4 text-[#ef4444]" /> {sub.phone}
              </a>
            )}
            <a href={`mailto:${sub.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#ef4444] transition">
              <Mail className="w-4 h-4 text-[#ef4444]" /> {sub.email}
            </a>
            {sub.phone && (
              <a
                href={`https://wa.me/${sub.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${sub.contactName}, thank you for submitting your website brief with BridgeTech.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-700 hover:underline font-semibold"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Client
              </a>
            )}
            {sub.address && (
              <div className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2 md:col-span-1">
                <span className="text-[#ef4444] font-bold">📍</span> <span className="truncate">{sub.address}</span>
              </div>
            )}
            {sub.businessRegistration && (
              <div className="flex items-center gap-2 text-sm text-gray-700 sm:col-span-2 md:col-span-1">
                <span className="text-[#040e40] font-bold">🏢</span> <span>Reg/TIN: {sub.businessRegistration}</span>
              </div>
            )}
          </div>

          {/* Domain & Hosting status */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-1">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Domain & Hosting Requirements</p>
            <div className="text-xs text-amber-800 flex flex-wrap gap-x-6 gap-y-1">
              <div>
                <strong>Domain:</strong>{' '}
                {isNeedDomain
                  ? `Needs Registration ${sub.existingDomain ? `(Requested: "${sub.existingDomain}")` : '(No domain yet)'}`
                  : isHaveDomain
                  ? `Already Owned ${sub.existingDomain ? `("${sub.existingDomain}")` : ''}`
                  : 'Guidance Needed'}
              </div>
              <div>
                <strong>Hosting & Business Email:</strong> {sub.needsHosting ? 'Yes (BridgeTech Cloud Package)' : 'Not requested'}
              </div>
            </div>
          </div>

          {/* Brand Colors if present */}
          {brandColorsParsed && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" /> Client Brand Color Palette
              </p>
              <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                {brandColorsParsed.primary && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md shadow-sm border border-black/10" style={{ backgroundColor: brandColorsParsed.primary }} />
                    <span className="text-xs font-mono font-bold text-gray-800">Primary: {brandColorsParsed.primary}</span>
                  </div>
                )}
                {brandColorsParsed.secondary && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md shadow-sm border border-black/10" style={{ backgroundColor: brandColorsParsed.secondary }} />
                    <span className="text-xs font-mono font-bold text-gray-800">Secondary: {brandColorsParsed.secondary}</span>
                  </div>
                )}
                {brandColorsParsed.accent && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md shadow-sm border border-black/10" style={{ backgroundColor: brandColorsParsed.accent }} />
                    <span className="text-xs font-mono font-bold text-gray-800">Accent: {brandColorsParsed.accent}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Website Purpose</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{sub.websitePurpose}</p>
          </div>

          {/* Features grid */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features & Capabilities</p>
            <div className="flex flex-wrap gap-2">
              <Pill on={isHaveDomain}               label="Has Domain" />
              <Pill on={sub.hasExistingBranding}   label="Has Branding" />
              <Pill on={sub.hasHighQualityPhotos}  label="Quality Photos" />
              <Pill on={sub.hasContent}             label="Content Ready" />
              <Pill on={sub.wantsContentWriting}    label="Developer Copywriting" />
              <Pill on={sub.wantsGraphicDesign}     label="Developer Graphics" />
              <Pill on={sub.needsHosting}           label="Hosting & Email" />
              <Pill on={sub.needsCMS}               label="Needs CMS" />
              <Pill on={sub.needsEcommerce}         label="E-Commerce" />
              <Pill on={sub.needsBooking}           label="Booking System" />
              <Pill on={sub.needsMultilingual}      label="Multi-language" />
              <Pill on={sub.needsSEO}               label="SEO" />
              <Pill on={sub.canMaintainSelf}        label="Self-Maintain" />
            </div>
          </div>

          {/* Optional text fields */}
          {[
            { label: 'Branding Description',       val: sub.brandingDescription },
            { label: 'Photos Description',         val: sub.photosDescription },
            { label: 'Content Description',        val: sub.contentDescription },
            { label: 'Integrations',               val: sub.integrations },
            { label: 'Target Audience',            val: sub.targetAudience },
            { label: 'Competitors / Inspiration',  val: sub.competitors },
            { label: 'Specific Target Deadline',   val: sub.targetDeadline },
            { label: 'Social Media',               val: sub.socialMediaLinks },
            { label: 'Inspiration URLs',           val: sub.inspirationUrls },
            { label: 'Additional Notes',           val: sub.additionalNotes },
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
      fetchData()
    } catch {
      toast.error('Failed to delete submission')
    }
  }

  const filtered = submissions.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.organizationName.toLowerCase().includes(q) ||
      s.contactName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone ?? '').toLowerCase().includes(q) ||
      (s.websitePurpose ?? '').toLowerCase().includes(q) ||
      (s.existingDomain ?? '').toLowerCase().includes(q)
    )
  })

  const counts = {
    all:       submissions.length,
    new:       submissions.filter(s => s.status === 'new').length,
    reviewed:  submissions.filter(s => s.status === 'reviewed').length,
    contacted: submissions.filter(s => s.status === 'contacted').length,
    closed:    submissions.filter(s => s.status === 'closed').length,
  }

  if (authed === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#040e40] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-slate-50 ${isIframe ? 'p-4' : 'p-6 sm:p-8'}`}>
      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Top bar with BridgeTech brand logo */}
        <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            {!isIframe && (
              <button
                onClick={() => router.push('/admin')}
                className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <Image
                src="/assets/bridgetech-avatar-transparent.png"
                alt="BridgeTech Logo Shield"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-[#040e40]">Website Project Briefs</h1>
                  <span className="text-[10px] bg-red-100 text-[#ef4444] font-extrabold px-1.5 py-0.5 rounded">INTAKE</span>
                </div>
                <p className="text-xs text-gray-500">{total} total client submissions</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/website-questionnaire"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold transition shadow-sm"
              title="Open public questionnaire form in a clean new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Form</span>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://www.itservicesfreetown.com/website-questionnaire')
                toast.success('Shareable link copied to clipboard!')
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#040e40] hover:bg-[#0a1a5c] text-white text-xs font-bold transition shadow-sm"
              title="Copy public questionnaire link to share with customers"
            >
              <Copy className="w-3.5 h-3.5 text-[#ef4444]" />
              <span className="hidden sm:inline">Copy Link</span>
            </button>
            <button
              onClick={() => {
                downloadBlankQuestionnairePDF()
                toast.success('Downloading blank form PDF...')
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
              title="Download a blank printable form"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" /> <span className="hidden sm:inline">Blank Form</span> (PDF)
            </button>
            <button
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ─── Shareable Client Questionnaire Link Banner ─── */}
        <div className="bg-gradient-to-r from-[#040e40] via-[#0a1a5c] to-[#040e40] rounded-2xl p-4 sm:p-5 text-white shadow-md border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/30 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm text-white">Shareable Client Discovery Brief</p>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LIVE PUBLIC URL
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                Send this link to any customer requesting a website. Opens in a clean, distraction-free view with its own preview card.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto shrink-0">
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white/90 truncate max-w-full sm:max-w-xs select-all">
              <Globe className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
              <span className="truncate">https://www.itservicesfreetown.com/website-questionnaire</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://www.itservicesfreetown.com/website-questionnaire')
                toast.success('Shareable link copied to clipboard!')
              }}
              className="px-3.5 py-2 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
              title="Copy link to clipboard"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <a
              href="/website-questionnaire"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shrink-0"
              title="Open public form in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open</span>
            </a>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'new', 'reviewed', 'contacted', 'closed'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition capitalize shrink-0 ${
                  filterStatus === st
                    ? 'bg-[#040e40] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {st} {counts[st] !== undefined && `(${counts[st]})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 text-gray-800"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="w-8 h-8 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading briefs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-700">No submissions found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try clearing your search query' : 'When customers complete the website questionnaire, they will show up here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => (
              <SubmissionCard
                key={sub.id}
                sub={sub}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function WebsiteQuestionnaireAdmin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#040e40] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WebsiteQuestionnaireAdminInner />
    </Suspense>
  )
}
