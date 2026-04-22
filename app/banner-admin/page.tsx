'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const THEMES = [
  { label: 'Safety Red', value: 'bg-red-600', hex: '#dc2626' },
  { label: 'Deep Blue', value: 'bg-blue-700', hex: '#1d4ed8' },
  { label: 'Emerald Green', value: 'bg-emerald-600', hex: '#059669' },
  { label: 'Orange Alert', value: 'bg-orange-600', hex: '#ea580c' },
  { label: 'Dark Charcoal', value: 'bg-gray-900', hex: '#111827' },
];

export default function BannerAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    enabled: false,
    message: '',
    link: '',
    color: 'bg-red-600',
  });

  useEffect(() => {
    fetch('/api/admin/banner')
      .then(res => {
        if (res.status === 401) { router.push('/admin'); return null; }
        return res.json();
      })
      .then(data => { if (data) setSettings(data); })
      .catch(() => setError('Failed to load banner settings.'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to update banner settings. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const selectedTheme = THEMES.find(t => t.value === settings.color) ?? THEMES[0];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Admin Panel</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50 sm:text-3xl">
            Global Notification Banner
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Control the site-wide announcement bar shown to all visitors.
          </p>
        </div>
        <a
          href="/admin"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Admin
        </a>
      </div>

      {/* Live Preview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Live Preview</p>
        <div className={`${settings.color} rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-inner transition-all duration-300`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <svg className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <p className="truncate text-sm font-medium text-white">
              {settings.message || 'Your announcement message will appear here...'}
            </p>
          </div>
          {settings.link && (
            <span className="shrink-0 rounded-full border border-white/40 px-3 py-1 text-xs font-semibold text-white">
              Learn More →
            </span>
          )}
        </div>
        {!settings.enabled && (
          <p className="text-xs text-amber-600 dark:text-amber-400">⚠ Banner is currently disabled — toggle it on to make it visible.</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">

        {/* Enable / Disable */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Banner Visibility</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Show or hide the banner site-wide.</p>
          </div>
          <button
            type="button"
            onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              settings.enabled ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Announcement Message <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={settings.message}
            onChange={e => setSettings(prev => ({ ...prev, message: e.target.value }))}
            placeholder="e.g. 🚨 Special Discount: 20% off all iPhone screen repairs this week!"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        {/* Action Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Action Link <span className="text-gray-400 font-normal">(Optional)</span></label>
          <input
            type="text"
            value={settings.link || ''}
            onChange={e => setSettings(prev => ({ ...prev, link: e.target.value }))}
            placeholder="https://wa.me/23233399391 or /repairs"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <p className="text-xs text-gray-400">Adds a &quot;Learn More&quot; button that links here when the banner is clicked.</p>
        </div>

        {/* Theme */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Visual Theme</label>
          <div className="flex flex-wrap gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.value}
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, color: theme.value }))}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                  settings.color === theme.value
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200 dark:border-red-400 dark:bg-red-900/30 dark:text-red-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <span className="h-3 w-3 rounded-full shrink-0" style={{ background: theme.hex }} />
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error/Success */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Banner settings updated successfully!
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-500"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving changes...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Banner Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
