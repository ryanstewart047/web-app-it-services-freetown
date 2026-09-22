'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Trash2,
  Edit3,
  Check,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Send,
  Eye,
  X,
  Search,
  Plus,
  Radio,
  Clock,
  ChevronRight,
  Bookmark,
  RefreshCw,
} from 'lucide-react';
import { BannerSettings, SavedAnnouncement } from '@/lib/server/banner-store';

const THEMES = [
  { label: 'Safety Red', value: 'bg-red-600', hex: '#dc2626' },
  { label: 'Deep Blue', value: 'bg-blue-700', hex: '#1d4ed8' },
  { label: 'Emerald Green', value: 'bg-emerald-600', hex: '#059669' },
  { label: 'Orange Alert', value: 'bg-orange-600', hex: '#ea580c' },
  { label: 'Royal Purple', value: 'bg-purple-600', hex: '#9333ea' },
  { label: 'Amber Gold', value: 'bg-amber-600', hex: '#d97706' },
  { label: 'Dark Charcoal', value: 'bg-gray-900', hex: '#111827' },
];

export default function BannerAdminPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Active banner settings
  const [activeBanner, setActiveBanner] = useState<BannerSettings>({
    enabled: false,
    message: '',
    link: '',
    buttonText: 'Learn More',
    color: 'bg-red-600',
    lastUpdated: new Date().toISOString(),
  });

  // Saved announcements library
  const [savedAnnouncements, setSavedAnnouncements] = useState<SavedAnnouncement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form input state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    link: '',
    buttonText: 'Learn More',
    color: 'bg-red-600',
    enabled: true,
  });

  // Editing state: if non-null, we are updating an existing announcement
  const [editingId, setEditingId] = useState<string | null>(null);

  // Permanent delete modal state
  const [announcementToDelete, setAnnouncementToDelete] = useState<SavedAnnouncement | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Quick publishing loading state (id being published)
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Fetch banner settings & saved announcements
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/banner?t=' + Date.now(), { cache: 'no-store' });
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      if (!res.ok) throw new Error('Failed to load banner data');

      const data = await res.json();
      setActiveBanner({
        enabled: data.enabled ?? false,
        message: data.message ?? '',
        link: data.link ?? '',
        buttonText: data.buttonText ?? 'Learn More',
        color: data.color ?? 'bg-red-600',
        lastUpdated: data.lastUpdated ?? new Date().toISOString(),
      });

      // Default form data mirrors active banner on initial load
      setFormData({
        title: '',
        message: data.message ?? '',
        link: data.link ?? '',
        buttonText: data.buttonText ?? 'Learn More',
        color: data.color ?? 'bg-red-600',
        enabled: data.enabled ?? true,
      });

      if (Array.isArray(data.savedAnnouncements)) {
        setSavedAnnouncements(data.savedAnnouncements);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load banner settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Toggle active banner visibility on/off immediately
  const handleToggleVisibility = async () => {
    const nextEnabled = !activeBanner.enabled;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activeBanner,
          enabled: nextEnabled,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveBanner(prev => ({ ...prev, enabled: nextEnabled, lastUpdated: updated.lastUpdated }));
        showSuccess(`Banner ${nextEnabled ? 'activated live' : 'disabled'} on site!`);
      } else {
        setError('Failed to toggle banner visibility.');
      }
    } catch {
      setError('Network error while toggling banner.');
    } finally {
      setSaving(false);
    }
  };

  // Start editing a saved announcement
  const handleStartEdit = (announcement: SavedAnnouncement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title || '',
      message: announcement.message,
      link: announcement.link || '',
      buttonText: announcement.buttonText || 'Learn More',
      color: announcement.color,
      enabled: activeBanner.message === announcement.message ? activeBanner.enabled : true,
    });
    setError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Cancel editing and clear form
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      link: '',
      buttonText: 'Learn More',
      color: 'bg-red-600',
      enabled: true,
    });
    setError('');
  };

  // Save or update announcement in library only (without changing live site banner)
  const handleSaveToLibraryOnly = async () => {
    if (!formData.message.trim()) {
      setError('Announcement message is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingId) {
        // Update existing saved announcement
        const res = await fetch('/api/admin/banner/announcements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            title: formData.title,
            message: formData.message,
            link: formData.link,
            buttonText: formData.buttonText,
            color: formData.color,
          }),
        });

        if (!res.ok) throw new Error('Failed to update announcement');
        const data = await res.json();
        setSavedAnnouncements(data.announcements);
        showSuccess('Announcement updated in library!');
        handleCancelEdit();
      } else {
        // Create new saved announcement
        const res = await fetch('/api/admin/banner/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            message: formData.message,
            link: formData.link,
            buttonText: formData.buttonText,
            color: formData.color,
          }),
        });

        if (!res.ok) throw new Error('Failed to save announcement');
        const data = await res.json();
        setSavedAnnouncements(data.announcements);
        showSuccess('New announcement saved to library!');
        handleCancelEdit();
      }
    } catch (err: any) {
      setError(err.message || 'Error saving announcement.');
    } finally {
      setSaving(false);
    }
  };

  // Save to library AND publish as active live banner
  const handleSaveAndPublishLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setError('Announcement message is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/banner/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          id: editingId || undefined,
          title: formData.title,
          message: formData.message,
          link: formData.link,
          buttonText: formData.buttonText,
          color: formData.color,
        }),
      });

      if (!res.ok) throw new Error('Failed to publish banner');

      const data = await res.json();
      setActiveBanner({
        enabled: true,
        message: formData.message,
        link: formData.link,
        buttonText: formData.buttonText || 'Learn More',
        color: formData.color,
        lastUpdated: data.banner?.lastUpdated || new Date().toISOString(),
      });

      if (Array.isArray(data.announcements)) {
        setSavedAnnouncements(data.announcements);
      }

      showSuccess('🎉 Announcement published live on website!');
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to publish banner settings.');
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Apply any saved announcement to live site
  const handleQuickPublish = async (announcement: SavedAnnouncement) => {
    try {
      setPublishingId(announcement.id);
      setError('');

      const res = await fetch('/api/admin/banner/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          id: announcement.id,
          title: announcement.title,
          message: announcement.message,
          link: announcement.link,
          buttonText: announcement.buttonText,
          color: announcement.color,
        }),
      });

      if (!res.ok) throw new Error('Failed to apply announcement');

      const data = await res.json();
      setActiveBanner({
        enabled: true,
        message: announcement.message,
        link: announcement.link || '',
        buttonText: announcement.buttonText || 'Learn More',
        color: announcement.color,
        lastUpdated: data.banner?.lastUpdated || new Date().toISOString(),
      });

      if (Array.isArray(data.announcements)) {
        setSavedAnnouncements(data.announcements);
      }

      showSuccess(`Activated "${announcement.title || 'Announcement'}" live on site!`);
    } catch (err: any) {
      setError(err.message || 'Failed to activate announcement.');
    } finally {
      setPublishingId(null);
    }
  };

  // Permanent Delete Handler
  const handleConfirmPermanentDelete = async () => {
    if (!announcementToDelete) return;

    try {
      setDeleting(true);
      setError('');

      const res = await fetch(`/api/admin/banner/announcements?id=${encodeURIComponent(announcementToDelete.id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to permanently delete announcement');

      const data = await res.json();
      if (Array.isArray(data.announcements)) {
        setSavedAnnouncements(data.announcements);
      } else {
        setSavedAnnouncements(prev => prev.filter(i => i.id !== announcementToDelete.id));
      }

      // If we were editing this announcement, cancel edit
      if (editingId === announcementToDelete.id) {
        handleCancelEdit();
      }

      showSuccess('Announcement permanently deleted.');
      setAnnouncementToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Error deleting announcement.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter saved announcements by search query
  const filteredAnnouncements = useMemo(() => {
    if (!searchQuery.trim()) return savedAnnouncements;
    const q = searchQuery.toLowerCase();
    return savedAnnouncements.filter(
      item =>
        item.message.toLowerCase().includes(q) ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.buttonText && item.buttonText.toLowerCase().includes(q))
    );
  }, [savedAnnouncements, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
        <p className="text-sm font-semibold text-gray-500">Loading Announcement Manager...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-600 bg-red-50 dark:bg-red-950/50 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/50">
              Admin Suite
            </span>
            <span className="text-xs font-semibold text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-500">Global Announcements</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-black text-gray-900 dark:text-gray-50 sm:text-3xl tracking-tight">
            Global Banner &amp; Saved Messages
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, save, edit, and permanently delete site-wide announcement banners with instant live deployment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ← Back to Admin
          </Link>
          <button
            onClick={loadData}
            title="Reload banner data"
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Alerts / Toasts */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* ── LIVE PREVIEW & VISIBILITY STATUS ── */}
      <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Live Website Preview (Compact Marquee)
            </span>
          </div>

          {/* Quick Visibility Switch */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
              Status:{' '}
              {activeBanner.enabled ? (
                <span className="text-emerald-600 font-extrabold dark:text-emerald-400">🟢 Live Visible</span>
              ) : (
                <span className="text-gray-400 font-bold">⚪ Hidden</span>
              )}
            </span>
            <button
              type="button"
              onClick={handleToggleVisibility}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 ${
                activeBanner.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  activeBanner.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* The Banner Visual Strip */}
        <div
          className={`${
            editingId ? formData.color : activeBanner.color
          } rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-md transition-all duration-300 text-white overflow-hidden`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 overflow-hidden relative select-none">
              <p className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap animate-pulse">
                {(editingId ? formData.message : activeBanner.message) ||
                  'Your announcement message will continuously marquee scroll here...'}
              </p>
            </div>
          </div>

          {(editingId ? formData.link : activeBanner.link) && (
            <span className="shrink-0 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1">
              <span>{(editingId ? formData.buttonText : activeBanner.buttonText) || 'Learn More'}</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          )}

          <div className="shrink-0 p-1 text-white/80">
            <X className="w-3.5 h-3.5" />
          </div>
        </div>

        {!activeBanner.enabled && !editingId && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ Note: The banner is currently disabled site-wide. Visitors cannot see it until you toggle status on.
          </p>
        )}
      </div>

      {/* ── MAIN ANNOUNCEMENT EDITOR FORM ── */}
      <div
        ref={formRef}
        className={`space-y-6 rounded-3xl border p-6 shadow-sm transition-all sm:p-8 ${
          editingId
            ? 'border-amber-400 bg-amber-50/20 dark:border-amber-600 dark:bg-amber-950/20 ring-2 ring-amber-400/30'
            : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
        }`}
      >
        {/* Editing Mode Callout */}
        {editingId ? (
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2.5">
              <Edit3 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Editing Saved Announcement</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Update this announcement message below and choose to update in library or publish live.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-100 shadow-sm"
            >
              Cancel Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-red-600" />
                <span>Compose or Edit Announcement Message</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Type your message below. It will automatically save to your library for future re-use.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveAndPublishLive} className="space-y-5">
          {/* Title / Label */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Announcement Title / Label <span className="text-gray-400 font-normal">(For Library Reference)</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Weekend Screen Repair Deal, Rainy Season Notice, New 3D Studio"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Message (Required) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Announcement Message <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-gray-400">
                {formData.message.length} characters
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={formData.message}
              onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="e.g. 🚨 Special Discount: 20% off all iPhone and Samsung screen replacements this week! Walk-ins welcome at Jui Junction."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Action Link & Button Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Action Destination Link <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="e.g. /repair-showcase or https://wa.me/23233399391"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                Button Label <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={e => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                placeholder="e.g. Learn More, Book Repair, Claim Deal"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Theme Color Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              Visual Banner Theme
            </label>
            <div className="flex flex-wrap gap-2.5">
              {THEMES.map(theme => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: theme.value }))}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
                    formData.color === theme.value
                      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-300 dark:border-red-400 dark:bg-red-950/40 dark:text-red-300'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded-full shrink-0 shadow-inner" style={{ background: theme.hex }} />
                  <span>{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Live...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes & Publish Live' : 'Save & Publish Live on Website'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveToLibraryOnly}
              disabled={saving}
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Bookmark className="w-4 h-4 text-gray-500" />
              <span>{editingId ? 'Update in Library Only' : 'Save to Library Only'}</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full sm:w-auto py-3.5 px-4 rounded-2xl text-gray-500 hover:text-gray-800 text-sm font-semibold transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── SAVED ANNOUNCEMENTS LIBRARY ── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-50 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-red-600" />
              <span>Saved Announcement Messages Library</span>
              <span className="ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {savedAnnouncements.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select any announcement to edit, permanently delete, or instantly publish to the live site.
            </p>
          </div>

          {/* Quick Filter Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search saved announcements..."
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 py-2 text-xs text-gray-900 focus:outline-none focus:border-red-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-10 text-center space-y-3">
            <Bookmark className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-gray-500">
              {searchQuery ? `No saved announcements matching "${searchQuery}"` : 'No saved announcements yet.'}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Any announcement you compose above and save will appear here for easy editing, re-activation, and management.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAnnouncements.map((item) => {
              const isCurrentlyActive = activeBanner.enabled && activeBanner.message === item.message;
              const isEditingThis = editingId === item.id;
              const themeObj = THEMES.find(t => t.value === item.color) || THEMES[0];

              return (
                <div
                  key={item.id}
                  className={`rounded-3xl border p-5 transition-all shadow-sm relative overflow-hidden ${
                    isCurrentlyActive
                      ? 'border-emerald-500 bg-emerald-50/10 dark:border-emerald-600 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20'
                      : isEditingThis
                      ? 'border-amber-400 bg-amber-50/10 dark:border-amber-600 ring-2 ring-amber-400/40'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900'
                  }`}
                >
                  {/* Left Theme Strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2"
                    style={{ background: themeObj.hex }}
                  />

                  <div className="pl-2.5 space-y-3">
                    {/* Top Row: Title, Badges, Dates */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                          {item.title || 'Announcement'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: themeObj.hex }} />
                          {themeObj.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrentlyActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE ON SITE
                          </span>
                        )}
                        <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Announcement Message Body */}
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                      {item.message}
                    </p>

                    {/* Action Button Link Preview if any */}
                    {item.link && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">Action Button:</span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          {item.buttonText || 'Learn More'} →
                        </span>
                        <span className="truncate max-w-xs text-gray-400 text-[11px]">
                          {item.link}
                        </span>
                      </div>
                    )}

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        {/* 1-Click Publish Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickPublish(item)}
                          disabled={publishingId === item.id || isCurrentlyActive}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                            isCurrentlyActive
                              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-95'
                          }`}
                        >
                          {publishingId === item.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Applying...</span>
                            </>
                          ) : isCurrentlyActive ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Currently Live</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Apply &amp; Publish Live</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Edit</span>
                        </button>
                      </div>

                      {/* Permanent Delete Button */}
                      <button
                        type="button"
                        onClick={() => setAnnouncementToDelete(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white flex items-center gap-1.5 transition shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanent Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PERMANENT DELETE CONFIRMATION MODAL ── */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-50">
                  Permanent Delete Announcement?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Snippet of announcement being deleted */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 space-y-1">
              <span className="font-bold text-gray-900 dark:text-gray-100 block">
                {announcementToDelete.title || 'Announcement Message'}
              </span>
              <p className="line-clamp-3 text-gray-600 dark:text-gray-300 italic">
                &ldquo;{announcementToDelete.message}&rdquo;
              </p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to permanently remove this announcement from your saved library?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAnnouncementToDelete(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
