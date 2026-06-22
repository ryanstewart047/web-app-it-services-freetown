'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Save,
  Send,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface Settings {
  enabled: boolean;
  intervalHours: number;
  messageTemplate: string;
  linkUrl: string;
  topics: string[];
  photoUrls: string[];
  hashtags: string[];
  lastPostAt: string | null;
  nextPostAfter: string | null;
  updatedAt: string | null;
}

interface ConfigStatus {
  hasPageId: boolean;
  hasAccessToken: boolean;
  graphVersion: string;
  ready: boolean;
}

interface LogEntry {
  id: string;
  status: string;
  triggeredBy: string;
  topic: string | null;
  message: string | null;
  photoUrl: string | null;
  facebookPostId: string | null;
  facebookPhotoId: string | null;
  error: string | null;
  createdAt: string;
}

const DEFAULT_SETTINGS: Settings = {
  enabled: false,
  intervalHours: 24,
  messageTemplate:
    '{topic}\n\nNeed help with a phone, laptop, or computer in Freetown? Book a diagnostic with IT Services Freetown today.\n\n{link}\n\n{hashtags}',
  linkUrl: 'https://www.itservicesfreetown.com/book-appointment',
  topics: [
    '5 signs your laptop needs a professional service',
    'How to protect your phone charging port from damage',
    'Why same-day diagnostics can save repair costs',
  ],
  photoUrls: [
    'https://www.itservicesfreetown.com/assets/images/iphone-repair.jpg',
    'https://www.itservicesfreetown.com/assets/images/slider001.jpg',
  ],
  hashtags: ['ITServicesFreetown', 'FreetownTech', 'PhoneRepair', 'ComputerRepair'],
  lastPostAt: null,
  nextPostAfter: null,
  updatedAt: null,
};

const DEFAULT_CONFIG: ConfigStatus = {
  hasPageId: false,
  hasAccessToken: false,
  graphVersion: 'v23.0',
  ready: false,
};

function toLines(values: string[]) {
  return values.join('\n');
}

function fromLines(value: string) {
  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled yet';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusClasses(status: string) {
  if (status === 'success') return 'border-green-200 bg-green-50 text-green-800';
  if (status === 'error') return 'border-red-200 bg-red-50 text-red-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export default function FacebookAutoPostAdminPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [config, setConfig] = useState<ConfigStatus>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [topicsText, setTopicsText] = useState(toLines(DEFAULT_SETTINGS.topics));
  const [photoUrlsText, setPhotoUrlsText] = useState(toLines(DEFAULT_SETTINGS.photoUrls));
  const [hashtagsText, setHashtagsText] = useState(toLines(DEFAULT_SETTINGS.hashtags));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const preview = useMemo(() => {
    const topic = fromLines(topicsText)[0] || DEFAULT_SETTINGS.topics[0];
    const hashtags = fromLines(hashtagsText)
      .map(tag => `#${tag.replace(/^#+/, '').replace(/\s+/g, '')}`)
      .join(' ');

    return settings.messageTemplate
      .split('{topic}').join(topic)
      .split('{link}').join(settings.linkUrl)
      .split('{hashtags}').join(hashtags)
      .trim();
  }, [hashtagsText, settings.linkUrl, settings.messageTemplate, topicsText]);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/facebook-auto-post');
      if (response.status === 401) {
        window.location.href = '/admin';
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard');
      }

      const nextSettings = data.settings || DEFAULT_SETTINGS;
      setSettings(nextSettings);
      setConfig(data.config || DEFAULT_CONFIG);
      setLogs(data.logs || []);
      setTopicsText(toLines(nextSettings.topics || []));
      setPhotoUrlsText(toLines(nextSettings.photoUrls || []));
      setHashtagsText(toLines(nextSettings.hashtags || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Facebook auto poster');
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...settings,
        topics: fromLines(topicsText),
        photoUrls: fromLines(photoUrlsText),
        hashtags: fromLines(hashtagsText),
      };

      const response = await fetch('/api/admin/facebook-auto-post', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSettings(data.settings);
      setConfig(data.config || config);
      setLogs(data.logs || logs);
      setMessage('Settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function postNow() {
    if (!confirm('Publish a random Facebook post now?')) {
      return;
    }

    setPosting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/facebook-auto-post', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.error || 'Failed to publish Facebook post');
      }

      setSettings(data.settings || settings);
      setConfig(data.config || config);
      setMessage('Facebook post published.');
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish Facebook post');
      await loadDashboard();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <a href="/admin" className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            </a>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <span className="text-lg font-bold leading-none">f</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">Facebook Auto Poster</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Schedule random service tips with photos for your Facebook page.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={postNow}
            disabled={posting || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post Now
          </button>
          <button
            onClick={saveSettings}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.25fr,0.75fr]">
        <section className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setSettings(current => ({ ...current, enabled: !current.enabled }))}
              className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
                settings.enabled
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              <div>
                <p className={`text-sm font-semibold ${settings.enabled ? 'text-green-800' : 'text-slate-700 dark:text-slate-200'}`}>
                  {settings.enabled ? 'Automation is active' : 'Automation is paused'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  The cron endpoint checks this setting before posting.
                </p>
              </div>
              {settings.enabled ? <ToggleRight className="h-8 w-8 text-green-600" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <Clock className="h-4 w-4 text-slate-400" />
                Minimum hours between posts
              </span>
              <input
                type="number"
                min={1}
                max={168}
                value={settings.intervalHours}
                onChange={event => setSettings(current => ({ ...current, intervalHours: Number(event.target.value) }))}
                className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="mt-2 block text-xs text-slate-500">
                Vercel Hobby checks once daily. Use an external scheduler for faster intervals.
              </span>
            </label>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                <CalendarClock className="h-4 w-4 text-slate-400" />
                Schedule
              </span>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>Last post: {formatDate(settings.lastPostAt)}</p>
                <p>Next eligible: {formatDate(settings.nextPostAfter)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-100">Message Template</label>
            <p className="mt-1 text-xs text-slate-500">
              Available tokens: {'{topic}'}, {'{link}'}, {'{hashtags}'}
            </p>
            <textarea
              value={settings.messageTemplate}
              onChange={event => setSettings(current => ({ ...current, messageTemplate: event.target.value }))}
              rows={7}
              maxLength={2000}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <label className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Link URL</span>
            <input
              type="url"
              value={settings.linkUrl}
              onChange={event => setSettings(current => ({ ...current, linkUrl: event.target.value }))}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>

          <div className="grid gap-5 lg:grid-cols-3">
            <TextareaList
              label="Random Topics"
              value={topicsText}
              onChange={setTopicsText}
              rows={9}
            />
            <TextareaList
              label="Photo URLs"
              icon={<ImageIcon className="h-4 w-4 text-slate-400" />}
              value={photoUrlsText}
              onChange={setPhotoUrlsText}
              rows={9}
            />
            <TextareaList
              label="Hashtags"
              value={hashtagsText}
              onChange={setHashtagsText}
              rows={9}
            />
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Facebook API Status</h2>
            <div className="mt-4 space-y-3">
              <ConfigRow label="FACEBOOK_PAGE_ID" ready={config.hasPageId} />
              <ConfigRow label="FACEBOOK_PAGE_ACCESS_TOKEN" ready={config.hasAccessToken} />
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <span className="text-slate-500">Graph API</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{config.graphVersion}</span>
              </div>
            </div>
            {!config.ready && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Add the Facebook page ID and long-lived page access token in your deployment environment before enabling automation.</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Preview</h2>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-wrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {preview}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Runs</h2>
            <div className="mt-4 space-y-3">
              {logs.length === 0 ? (
                <p className="text-sm text-slate-500">No posts have been attempted yet.</p>
              ) : logs.map(log => (
                <div key={log.id} className={`rounded-lg border p-3 text-xs ${statusClasses(log.status)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold capitalize">{log.status}</span>
                    <span>{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2">{log.topic || log.error || 'Run completed'}</p>
                  {log.facebookPostId && <p className="mt-1 font-mono text-[11px]">Post: {log.facebookPostId}</p>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TextareaList({
  label,
  value,
  onChange,
  rows,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  icon?: ReactNode;
}) {
  return (
    <label className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {icon}
        {label}
      </span>
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        rows={rows}
        className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <span className="mt-2 block text-xs text-slate-500">One per line</span>
    </label>
  );
}

function ConfigRow({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
      <span className="text-slate-500">{label}</span>
      <span className={`inline-flex items-center gap-1 font-semibold ${ready ? 'text-green-700' : 'text-amber-700'}`}>
        {ready ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {ready ? 'Ready' : 'Missing'}
      </span>
    </div>
  );
}
