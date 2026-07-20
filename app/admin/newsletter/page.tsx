'use client'

import { useEffect, useState } from 'react'
import { Mail, Save, ToggleLeft, ToggleRight, Clock, Type, AlignLeft, MousePointer, Users, ArrowLeft, RefreshCw } from 'lucide-react'

interface NewsletterSettings {
  enabled: boolean
  delaySeconds: number
  headline: string
  bodyText: string
  buttonText: string
}

interface Stats {
  total: number
  thisWeek: number
  thisMonth: number
}

const DEFAULTS: NewsletterSettings = {
  enabled: true,
  delaySeconds: 8,
  headline: 'Stay in the Loop',
  bodyText: 'Join thousands of Freetown residents getting weekly computer and mobile repair tips, exclusive service updates, and special offers delivered right to your inbox.',
  buttonText: 'Subscribe Now',
}

export default function NewsletterAdminPage() {
  const [settings, setSettings] = useState<NewsletterSettings>(DEFAULTS)
  const [stats, setStats] = useState<Stats>({ total: 0, thisWeek: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [settingsRes, leadsRes] = await Promise.all([
        fetch('/api/admin/newsletter-settings'),
        fetch('/api/admin/email-leads?source=newsletter'),
      ])

      if (settingsRes.status === 401 || leadsRes.status === 401) {
        window.location.href = '/admin'
        return
      }

      const settingsData = await settingsRes.json()
      setSettings({
        enabled: settingsData.enabled ?? true,
        delaySeconds: settingsData.delaySeconds ?? 8,
        headline: settingsData.headline ?? DEFAULTS.headline,
        bodyText: settingsData.bodyText ?? DEFAULTS.bodyText,
        buttonText: settingsData.buttonText ?? DEFAULTS.buttonText,
      })

      const leadsData = await leadsRes.json()
      const leads = leadsData.leads ?? []
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      setStats({
        total: leadsData.total ?? 0,
        thisWeek: leads.filter((l: any) => new Date(l.createdAt) >= oneWeekAgo).length,
        thisMonth: leads.filter((l: any) => new Date(l.createdAt) >= oneMonthAgo).length,
      })
    } catch (e) {
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/newsletter-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(data.error || 'Failed to save')
      }
    } catch (e) {
      setError('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <a href="/admin" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </a>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-indigo-200">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Newsletter Popup</h1>
                <p className="text-sm text-slate-500">Control the "Stay in the Loop" popup shown to visitors</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Settings Panel */}
          <div className="space-y-5 lg:col-span-2">

            {/* Enable / Disable Toggle */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-bold text-slate-900">Popup Status</h2>
                <p className="text-xs text-slate-500 mt-0.5">Toggle the popup on or off for all site visitors</p>
              </div>
              <div className="px-6 py-5">
                <button
                  onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 transition ${
                    settings.enabled
                      ? 'border-green-200 bg-green-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-slate-400'}`} />
                    <div className="text-left">
                      <p className={`font-bold text-sm ${settings.enabled ? 'text-green-800' : 'text-slate-700'}`}>
                        {settings.enabled ? 'Popup is ACTIVE' : 'Popup is DISABLED'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {settings.enabled ? 'Visitors will see the newsletter popup' : 'The popup will not appear for anyone'}
                      </p>
                    </div>
                  </div>
                  {settings.enabled
                    ? <ToggleRight className="h-8 w-8 text-green-600 flex-shrink-0" />
                    : <ToggleLeft className="h-8 w-8 text-slate-400 flex-shrink-0" />
                  }
                </button>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="font-bold text-slate-900">Popup Content</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize what visitors see in the popup</p>
              </div>
              <div className="space-y-5 px-6 py-5">

                {/* Delay */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Delay before popup appears
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={60}
                      step={1}
                      value={settings.delaySeconds}
                      onChange={e => setSettings(s => ({ ...s, delaySeconds: parseInt(e.target.value) }))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-center text-sm font-bold text-slate-800">
                      {settings.delaySeconds}s
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {settings.delaySeconds === 0 ? 'Shows instantly on page load' : `Shows after ${settings.delaySeconds} seconds`}
                  </p>
                </div>

                {/* Headline */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Type className="h-4 w-4 text-slate-400" />
                    Headline
                  </label>
                  <input
                    type="text"
                    value={settings.headline}
                    maxLength={100}
                    onChange={e => setSettings(s => ({ ...s, headline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    placeholder="Stay in the Loop"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">{settings.headline.length}/100</p>
                </div>

                {/* Body Text */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <AlignLeft className="h-4 w-4 text-slate-400" />
                    Body Text
                  </label>
                  <textarea
                    value={settings.bodyText}
                    maxLength={500}
                    rows={4}
                    onChange={e => setSettings(s => ({ ...s, bodyText: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 resize-none"
                    placeholder="Join thousands of Freetown residents…"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">{settings.bodyText.length}/500</p>
                </div>

                {/* Button Text */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <MousePointer className="h-4 w-4 text-slate-400" />
                    Subscribe Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.buttonText}
                    maxLength={60}
                    onChange={e => setSettings(s => ({ ...s, buttonText: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    placeholder="Subscribe Now"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-5">
            {/* Subscriber Stats */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">Subscriber Stats</h2>
                <p className="text-xs text-slate-500 mt-0.5">Newsletter signups via popup</p>
              </div>
              <div className="divide-y divide-slate-50 px-5">
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Total</span>
                  </div>
                  <span className="text-xl font-black text-slate-900">{loading ? '—' : stats.total}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                      <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">This Month</span>
                  </div>
                  <span className="text-xl font-black text-emerald-700">{loading ? '—' : stats.thisMonth}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">This Week</span>
                  </div>
                  <span className="text-xl font-black text-blue-700">{loading ? '—' : stats.thisWeek}</span>
                </div>
              </div>
              <div className="px-5 pb-5">
                <a
                  href="/admin/email-leads"
                  className="block w-full rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-center text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                >
                  View All Subscribers →
                </a>
              </div>
            </div>

            {/* Live Preview */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">Live Preview</h2>
                <p className="text-xs text-slate-500 mt-0.5">How the popup looks to visitors</p>
              </div>
              <div className="p-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#040e40] to-red-600 flex-shrink-0">
                      <Mail className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{settings.headline || '—'}</p>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed line-clamp-3">{settings.bodyText || '—'}</p>
                  <div className="rounded-lg bg-gradient-to-r from-[#040e40] to-red-600 px-3 py-1.5 text-center text-xs font-bold text-white">
                    {settings.buttonText || '—'}
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                  {settings.enabled
                    ? `Appears after ${settings.delaySeconds}s`
                    : '⚠ Popup is currently disabled'}
                </p>
              </div>
            </div>

            {/* Quick links */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-bold text-slate-900">Quick Links</h2>
              </div>
              <div className="divide-y divide-slate-50">
                <a href="/admin/email-marketing" className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Email Marketing
                </a>
                <a href="/admin/email-leads" className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <Users className="h-4 w-4 text-slate-400" />
                  All Email Leads
                </a>
                <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <MousePointer className="h-4 w-4 text-slate-400" />
                  View Live Site ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Save button (bottom) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:to-purple-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : saved ? '✓ Changes Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
