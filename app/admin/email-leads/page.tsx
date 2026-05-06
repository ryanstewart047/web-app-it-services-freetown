'use client'

import { useEffect, useState } from 'react'
import { Download, Mail, Search, Filter, RefreshCw, Trash2, Users, TrendingUp, Calendar } from 'lucide-react'

interface EmailLead {
  id: string
  email: string
  name: string | null
  phone: string | null
  source: string
  createdAt: string
}

interface Stats {
  source: string
  count: number
}

const SOURCE_COLORS: Record<string, string> = {
  appointment: 'bg-blue-100 text-blue-700 border-blue-200',
  order: 'bg-green-100 text-green-700 border-green-200',
  troubleshoot: 'bg-orange-100 text-orange-700 border-orange-200',
  donation: 'bg-pink-100 text-pink-700 border-pink-200',
  forum: 'bg-purple-100 text-purple-700 border-purple-200',
  receipt: 'bg-teal-100 text-teal-700 border-teal-200',
}

const SOURCE_LABELS: Record<string, string> = {
  appointment: 'Appointment',
  order: 'Shop Order',
  troubleshoot: 'AI Support',
  donation: 'Donation',
  forum: 'Forum',
  receipt: 'In-Store Receipt',
}

export default function EmailLeadsPage() {
  const [leads, setLeads] = useState<EmailLead[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeSource, setActiveSource] = useState('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const fetchLeads = async (src = activeSource, q = search) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (src !== 'all') params.set('source', src)
      if (q) params.set('search', q)
      const res = await fetch(`/api/admin/email-leads?${params}`)
      if (res.status === 401) {
        window.location.href = '/admin'
        return
      }
      const data = await res.json()
      setLeads(data.leads || [])
      setStats(data.stats || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error('Failed to fetch leads:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    if (!confirm('This will import emails from all previous orders, appointments, and registrations. Continue?')) return
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/email-leads/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert(`Success! Imported ${data.syncCount} existing leads.`)
        fetchLeads()
      } else {
        alert('Sync failed: ' + data.error)
      }
    } catch (e) {
      alert('Error during sync')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => { fetchLeads() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads(activeSource, search)
  }

  const handleSourceFilter = (src: string) => {
    setActiveSource(src)
    fetchLeads(src, search)
  }

  const handleDownloadCSV = async () => {
    setDownloading(true)
    try {
      const params = new URLSearchParams({ format: 'csv' })
      if (activeSource !== 'all') params.set('source', activeSource)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/email-leads?${params}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email-leads-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this email lead?')) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/email-leads?id=${id}`, { method: 'DELETE' })
      setLeads(prev => prev.filter(l => l.id !== id))
      setTotal(prev => prev - 1)
    } finally {
      setDeleting(null)
    }
  }

  const sources = ['all', 'appointment', 'order', 'troubleshoot', 'donation', 'forum', 'receipt']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Email Leads</h1>
                <p className="text-sm text-slate-500">Collected from all customer forms</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Existing Data'}
            </button>
            <button
              onClick={() => fetchLeads()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={downloading || total === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {downloading ? 'Preparing…' : `Download CSV (${total})`}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Emails</p>
                <p className="text-2xl font-black text-slate-900">{total}</p>
              </div>
            </div>
          </div>
          {stats.slice(0, 3).map(s => (
            <div key={s.source} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {SOURCE_LABELS[s.source] || s.source}
                  </p>
                  <p className="text-2xl font-black text-slate-900">{s.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          {/* Source filter pills */}
          <div className="flex flex-wrap gap-2">
            {sources.map(src => (
              <button
                key={src}
                onClick={() => handleSourceFilter(src)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  activeSource === src
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white'
                }`}
              >
                {src === 'all' ? 'All Sources' : SOURCE_LABELS[src] || src}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="ml-auto flex min-w-[220px] items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search email or name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading leads…</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <Mail className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No email leads yet</p>
              <p className="text-xs text-slate-300">They will appear here as customers submit forms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Source</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.map(lead => (
                    <tr key={lead.id} className="transition hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        {lead.name || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={`mailto:${lead.email}`}
                          className="font-mono text-blue-600 transition hover:text-blue-800 hover:underline"
                        >
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="hover:text-slate-800 hover:underline">
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${SOURCE_COLORS[lead.source] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {SOURCE_LABELS[lead.source] || lead.source}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(lead.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deleting === lead.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deleting === lead.id ? '…' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to admin */}
        <div className="mt-6 text-center">
          <a href="/admin" className="text-sm font-semibold text-slate-400 transition hover:text-slate-600">
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
