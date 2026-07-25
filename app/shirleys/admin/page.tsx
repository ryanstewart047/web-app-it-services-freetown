'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react'
import type { ShirleyGalleryItem, ShirleyGalleryMediaType } from '@/lib/shirley-gallery-storage'

type Status = { type: 'success' | 'error' | 'info'; message: string } | null

const emptyForm = {
  title: '',
  caption: '',
  type: 'image' as ShirleyGalleryMediaType,
  mediaUrl: '',
  active: true,
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }

    if (host.includes('youtube.com')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube.com/embed/${id}` : ''
    }

    if (host.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id ? `https://player.vimeo.com/video/${id}` : ''
    }
  } catch {
    return ''
  }

  return ''
}

function GalleryPreview({ item }: { item: ShirleyGalleryItem }) {
  const embedUrl = item.type === 'video' ? getEmbedUrl(item.url) : ''

  if (item.type === 'video') {
    return embedUrl ? (
      <iframe
        src={embedUrl}
        title={item.title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <video src={item.url} controls className="h-full w-full object-cover" preload="metadata" />
    )
  }

  return <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
}

export default function ShirleyGalleryAdminPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [items, setItems] = useState<ShirleyGalleryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  const visibleCount = useMemo(() => items.filter((item) => item.active).length, [items])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch('/api/shirleys/admin/auth', { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      const isAuthenticated = response.ok && data.authenticated
      setAuthenticated(isAuthenticated)

      if (isAuthenticated) {
        await fetchItems()
      }
    } catch {
      setAuthenticated(false)
    } finally {
      setAuthChecked(true)
    }
  }

  async function fetchItems() {
    setLoading(true)
    setStatus(null)

    try {
      const response = await fetch('/api/admin/shirleys/gallery', { cache: 'no-store' })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not load gallery.')
      }

      setItems(data.items || [])
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not load gallery.',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setStatus(null)

    try {
      const response = await fetch('/api/shirleys/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid password.')
      }

      setAuthenticated(true)
      setPassword('')
      setStatus({ type: 'success', message: 'Logged in.' })
      await fetchItems()
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Login failed.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/shirleys/admin/auth', { method: 'DELETE' }).catch(() => null)
    setAuthenticated(false)
    setItems([])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setStatus(null)

    try {
      const payload = new FormData()
      payload.append('title', form.title)
      payload.append('caption', form.caption)
      payload.append('type', form.type)
      payload.append('mediaUrl', form.mediaUrl)
      payload.append('active', String(form.active))

      if (file) {
        payload.append('file', file)
      }

      const response = await fetch('/api/admin/shirleys/gallery', {
        method: 'POST',
        body: payload,
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not save gallery item.')
      }

      setForm(emptyForm)
      setFile(null)
      setFileInputKey((key) => key + 1)
      setStatus({ type: 'success', message: 'Gallery item added.' })
      await fetchItems()
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not save gallery item.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(item: ShirleyGalleryItem) {
    setStatus(null)

    try {
      const response = await fetch('/api/admin/shirleys/gallery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not update item.')
      }

      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, active: !entry.active } : entry))
      )
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not update item.',
      })
    }
  }

  async function deleteItem(item: ShirleyGalleryItem) {
    if (!confirm(`Delete "${item.title}" from the gallery?`)) return
    setStatus(null)

    try {
      const response = await fetch(`/api/admin/shirleys/gallery?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Could not delete item.')
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id))
      setStatus({ type: 'success', message: 'Gallery item deleted.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Could not delete item.',
      })
    }
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffdf8] text-[#2f1f2a]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8a2746]" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#fffdf8] px-4 py-10 text-[#2f1f2a] sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center">
          <form onSubmit={handleLogin} className="w-full rounded-[1.5rem] border border-[#8a2746]/15 bg-white p-6 shadow-xl shadow-[#8a2746]/10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8a2746] text-white">
              <Lock className="h-7 w-7" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8a2746]">Shirley admin</p>
            <h1 className="mt-2 text-3xl font-black">Gallery login</h1>
            <p className="mt-3 text-sm leading-6 text-[#6d4c57]">
              Enter Shirley's gallery password to manage her work gallery.
            </p>

            <label className="mt-6 block text-sm font-bold text-[#4d3039]">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#8a2746]/15 bg-[#fffdf8] px-4 py-3 text-[#2f1f2a] outline-none transition focus:border-[#8a2746]"
                autoComplete="current-password"
                required
              />
            </label>

            {status && (
              <p className={`mt-4 rounded-2xl px-4 py-3 text-sm font-bold ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8a2746] px-5 py-3 font-black text-white transition hover:bg-[#6f1f38] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
              Login
            </button>
            <Link href="/shirleys" className="mt-4 inline-flex w-full justify-center text-sm font-bold text-[#8a2746]">
              Back to Shirley's page
            </Link>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#2f1f2a]">
      <header className="border-b border-[#8a2746]/15 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8a2746]">Shirley's Stiches & Sweet</p>
            <h1 className="mt-2 text-3xl font-black">Gallery admin</h1>
            <p className="mt-1 text-sm text-[#6d4c57]">{visibleCount} public item{visibleCount === 1 ? '' : 's'} showing.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchItems}
              className="inline-flex items-center gap-2 rounded-full border border-[#8a2746]/15 bg-white px-4 py-2 text-sm font-black text-[#8a2746] transition hover:bg-[#f8edf2]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              href="/shirleys"
              className="inline-flex items-center gap-2 rounded-full bg-[#2f6f6a] px-4 py-2 text-sm font-black text-white transition hover:bg-[#255955]"
            >
              <Eye className="h-4 w-4" />
              View page
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-[#8a2746] px-4 py-2 text-sm font-black text-white transition hover:bg-[#6f1f38]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <form onSubmit={handleSubmit} className="h-fit rounded-[1.5rem] border border-[#8a2746]/15 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7c948] text-[#2f1f2a]">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">Add work</h2>
              <p className="text-sm text-[#6d4c57]">Photos, short clips, or hosted video links.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-[#4d3039]">
              Title
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-[#8a2746]/15 bg-[#fffdf8] px-4 py-3 text-[#2f1f2a] outline-none transition focus:border-[#8a2746]"
                placeholder="Fresh pastry tray"
                required
              />
            </label>

            <label className="block text-sm font-bold text-[#4d3039]">
              Caption
              <textarea
                value={form.caption}
                onChange={(event) => setForm({ ...form, caption: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-2xl border border-[#8a2746]/15 bg-[#fffdf8] px-4 py-3 text-[#2f1f2a] outline-none transition focus:border-[#8a2746]"
                placeholder="A short note about the order or design."
              />
            </label>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f8edf2] p-1">
              {[
                { value: 'image', label: 'Image', icon: ImageIcon },
                { value: 'video', label: 'Video', icon: Video },
              ].map((option) => {
                const Icon = option.icon
                const active = form.type === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: option.value as ShirleyGalleryMediaType })}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${active ? 'bg-white text-[#8a2746] shadow-sm' : 'text-[#6d4c57] hover:bg-white/60'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                )
              })}
            </div>

            <label className="block text-sm font-bold text-[#4d3039]">
              Upload file
              <input
                key={fileInputKey}
                type="file"
                accept={form.type === 'video' ? 'video/*' : 'image/*'}
                onChange={(event) => setFile(event.currentTarget.files?.[0] || null)}
                className="mt-2 block w-full rounded-2xl border border-dashed border-[#8a2746]/30 bg-[#fffdf8] px-4 py-3 text-sm text-[#6d4c57] file:mr-3 file:rounded-full file:border-0 file:bg-[#8a2746] file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
              />
            </label>

            <label className="block text-sm font-bold text-[#4d3039]">
              Media URL
              <input
                type="url"
                value={form.mediaUrl}
                onChange={(event) => setForm({ ...form, mediaUrl: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-[#8a2746]/15 bg-[#fffdf8] px-4 py-3 text-[#2f1f2a] outline-none transition focus:border-[#8a2746]"
                placeholder="https://..."
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-[#fffdf8] px-4 py-3 text-sm font-bold text-[#4d3039]">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm({ ...form, active: event.target.checked })}
                className="h-5 w-5 rounded border-[#8a2746]/20 text-[#8a2746]"
              />
              Show on public gallery
            </label>

            {status && (
              <p className={`rounded-2xl px-4 py-3 text-sm font-bold ${status.type === 'error' ? 'bg-red-50 text-red-700' : status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f8edf2] text-[#8a2746]'}`}>
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#8a2746] px-5 py-3 font-black text-white transition hover:bg-[#6f1f38] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              Add to gallery
            </button>
          </div>
        </form>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Gallery items</h2>
              <p className="text-sm text-[#6d4c57]">{items.length} total item{items.length === 1 ? '' : 's'}</p>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-[#8a2746]" />}
          </div>

          {items.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[#8a2746]/25 bg-white p-10 text-center">
              <Camera className="mx-auto h-10 w-10 text-[#8a2746]" />
              <p className="mt-4 font-black">No gallery items yet.</p>
              <p className="mt-2 text-sm text-[#6d4c57]">Add Shirley's first photo or video to start the public showcase.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-[#8a2746]/10 bg-white shadow-sm">
                  <div className="aspect-[4/3] bg-[#f8edf2]">
                    <GalleryPreview item={item} />
                  </div>
                  <div className="space-y-4 p-4">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black text-[#2f1f2a]">{item.title}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          {item.active ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                      {item.caption && <p className="mt-2 text-sm leading-6 text-[#6d4c57]">{item.caption}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#8a2746]/15 px-3 py-2 text-xs font-black text-[#8a2746] transition hover:bg-[#f8edf2]"
                      >
                        {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {item.active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(item)}
                        className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
