'use client';

import { useEffect, useMemo, useState } from 'react';

const DEFAULT_ADMIN_KEY = 'admin123';

// Get the current admin key from localStorage or use default
const getAdminKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin-key') || DEFAULT_ADMIN_KEY;
  }
  return DEFAULT_ADMIN_KEY;
};

interface AnalyticsSnapshot {
  totalVisitors?: number;
  uniqueVisitors?: number;
  bounceRate?: number;
  avgSessionDuration?: number;
}

interface FormSubmission {
  formType?: string;
  timestamp?: string;
  fields?: Record<string, string>;
}

interface FormSnapshot {
  totalSubmissions?: number;
  totalViews?: number;
  overallConversionRate?: number;
  recentSubmissions?: FormSubmission[];
}

interface RepairRecord {
  trackingId: string;
  deviceType?: string;
  customerName?: string;
  status?: string;
  lastUpdated?: string;
  issueSummary?: string;
  totalCost?: number;
}

interface RepairSnapshot {
  totalRepairs?: number;
  statusCounts?: Record<string, number>;
  averageCompletionDays?: number;
  totalRevenue?: number;
  allRepairs?: RepairRecord[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>({});
  const [forms, setForms] = useState<FormSnapshot>({});
  const [repairs, setRepairs] = useState<RepairSnapshot>({});
  
  // Settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Check for saved session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin-authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      void loadData();
    }
  }, []);

  const handleAuth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.trim() === getAdminKey().trim()) {
      setIsAuthenticated(true);
      localStorage.setItem('admin-authenticated', 'true');
      void loadData();
    } else {
      setError('Invalid access key. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin-authenticated');
    setPassword('');
    setAnalytics({});
    setForms({});
    setRepairs({});
    setShowSettings(false);
  };

  const handleChangeKey = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    // Verify current key
    if (currentKey.trim() !== getAdminKey().trim()) {
      setSettingsError('Current access key is incorrect.');
      return;
    }

    // Validate new key
    if (newKey.trim().length < 6) {
      setSettingsError('New access key must be at least 6 characters long.');
      return;
    }

    // Confirm keys match
    if (newKey.trim() !== confirmKey.trim()) {
      setSettingsError('New access key and confirmation do not match.');
      return;
    }

    // Save new key
    localStorage.setItem('admin-key', newKey.trim());
    setSettingsSuccess('Access key changed successfully!');
    
    // Clear form
    setTimeout(() => {
      setCurrentKey('');
      setNewKey('');
      setConfirmKey('');
      setShowSettings(false);
      setSettingsSuccess('');
    }, 2000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, formsRes, repairsRes] = await Promise.all([
        fetch('/api/analytics/visitor/'),
        fetch('/api/analytics/forms/'),
        fetch('/api/analytics/repairs/'),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      if (formsRes.ok) {
        const data = await formsRes.json();
        setForms(data);
      }

      if (repairsRes.ok) {
        const data = await repairsRes.json();
        setRepairs(data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusSummary = useMemo(() => {
    const counts = repairs.statusCounts ?? {};
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [repairs.statusCounts]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 p-8 text-white">
            <p className="text-sm uppercase tracking-[0.4em] text-red-100/80">Secure Area</p>
            <h2 className="mt-4 text-3xl font-semibold">Admin Control Access</h2>
            <p className="mt-2 text-sm text-red-100">
              Enter the admin key to reach live analytics, customer requests, and repair pipelines.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 bg-white px-8 py-10 dark:bg-gray-900">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Admin Access Key
              </label>
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-.895 3-2s-1.343-2-3-2-3 .895-3 2 1.343 2 3 2zm0 0v1a3 3 0 003 3h3a3 3 0 003-3v-1m-6 0v-1a3 3 0 00-3-3H9a3 3 0 00-3 3v1" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-900 shadow-sm transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-900/60"
                  placeholder="Enter admin key"
                />
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-500"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Unlock Dashboard
            </button>
          </form>

          <p className="px-8 pb-8 text-center text-xs text-gray-500 dark:text-gray-500">
            Protected & monitored — contact system administrator for support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <section id="overview" className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-800/70 dark:bg-gray-900">
          <div className="absolute right-0 top-0 h-48 w-48 translate-x-16 -translate-y-10 rounded-full bg-red-500/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:gap-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-500 dark:text-gray-500 sm:text-sm">Snapshot</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 sm:text-3xl">
                Welcome back! Here's the latest pulse on IT Services Freetown.
              </h2>
              <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                Monitor visitor growth, form activity, and repair progress across every service touchpoint.
              </p>
            </div>
            <div className="w-full self-start rounded-2xl border border-gray-200 bg-white/90 p-4 text-sm shadow-sm sm:max-w-md sm:p-5 dark:border-gray-800 dark:bg-gray-950/60">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">Quick controls</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh data
                </button>
                <a
                  href="/blog/admin"
                  className="inline-flex items-center gap-2 rounded-xl border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Blog Admin
                </a>
                <a
                  href="/social"
                  className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Receipt Generator
                </a>
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
                <span className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  {loading ? 'Syncing latest metrics…' : 'Data synced with live services'}
                </span>
              </div>
            </div>
          </div>
          <dl className="mt-8 grid gap-4 min-[480px]:grid-cols-2">
            <OverviewStat label="Total visitors" value={analytics.totalVisitors ?? 0} accent="text-blue-500" />
            <OverviewStat label="Total repairs" value={repairs.totalRepairs ?? 0} accent="text-purple-500" />
            <OverviewStat label="Form submissions" value={forms.totalSubmissions ?? 0} accent="text-emerald-500" />
            <OverviewStat label="Revenue" value={`$${(repairs.totalRevenue ?? 0).toLocaleString()}`} accent="text-orange-500" />
          </dl>
        </div>

        <div className="grid gap-4 min-[480px]:grid-cols-2">
          <SummaryCard
            title="Unique visitors"
            value={analytics.uniqueVisitors ?? 0}
            helper="Compared to last 7 days"
            iconBg="bg-blue-100 dark:bg-blue-900/40"
          />
          <SummaryCard
            title="Average session"
            value={`${analytics.avgSessionDuration ?? 0} min`}
            helper="Engagement quality"
            iconBg="bg-indigo-100 dark:bg-indigo-900/40"
          />
          <SummaryCard
            title="Forms viewed"
            value={forms.totalViews ?? 0}
            helper="Across all funnels"
            iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          />
          <SummaryCard
            title="Conversion"
            value={`${forms.overallConversionRate ?? 0}%`}
            helper="Submission rate"
            iconBg="bg-amber-100 dark:bg-amber-900/40"
          />
        </div>
      </section>

      <section id="analytics" className="space-y-6">
        <SectionHeader title="Analytics" description="Traffic and engagement signals across your digital touchpoints." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total visitors" value={analytics.totalVisitors ?? 0} trendLabel="All traffic" />
          <MetricCard label="Unique visitors" value={analytics.uniqueVisitors ?? 0} trendLabel="New users" />
          <MetricCard label="Bounce rate" value={`${analytics.bounceRate ?? 0}%`} trendLabel="Lower is better" />
          <MetricCard label="Avg session" value={`${analytics.avgSessionDuration ?? 0} min`} trendLabel="Time on site" />
        </div>
      </section>

      <section id="forms" className="space-y-6">
        <SectionHeader title="Forms" description="Capture insights, track submissions, and monitor engagement across funnels." />
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 min-[480px]:grid-cols-2 md:grid-cols-3">
            <StatPill label="Submissions" value={forms.totalSubmissions ?? 0} />
            <StatPill label="Views" value={forms.totalViews ?? 0} />
            <StatPill label="Conversion rate" value={`${forms.overallConversionRate ?? 0}%`} />
          </div>

          {forms.recentSubmissions && forms.recentSubmissions.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 text-left uppercase tracking-wide dark:bg-gray-800/60">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Form</th>
                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Submitted</th>
                    <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Key details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {forms.recentSubmissions.slice(0, 6).map((submission, index) => (
                    <tr key={`${submission.timestamp ?? index}-${index}`} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{submission.formType ?? 'Unknown form'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{submission.timestamp ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {submission.fields
                          ? Object.entries(submission.fields)
                              .slice(0, 2)
                              .map(([key, value]) => (
                                <div key={key} className="truncate text-xs">
                                  <span className="font-medium text-gray-600 dark:text-gray-300">{key}: </span>
                                  <span>{value}</span>
                                </div>
                              ))
                          : 'No details captured'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-500">
              No recent submissions to show. Once forms are submitted, they will appear here automatically.
            </p>
          )}
        </div>
      </section>

      <section id="repairs" className="space-y-6">
        <SectionHeader title="Repair operations" description="Track active jobs, update statuses, and keep customers informed." />
        <RepairManagement repairs={repairs} onUpdate={loadData} statusSummary={statusSummary} />
      </section>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Security</p>
                  <h2 className="mt-2 text-2xl font-semibold">Change Access Key</h2>
                </div>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setSettingsError('');
                    setSettingsSuccess('');
                    setCurrentKey('');
                    setNewKey('');
                    setConfirmKey('');
                  }}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Update your admin access key. You must verify your current key before setting a new one.
              </p>
            </div>

            <form onSubmit={handleChangeKey} className="space-y-5 p-6">
              <div className="space-y-2">
                <label htmlFor="current-key" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Access Key
                </label>
                <input
                  id="current-key"
                  type="password"
                  value={currentKey}
                  onChange={(e) => setCurrentKey(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-900/60"
                  placeholder="Enter current key"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="new-key" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Access Key
                </label>
                <input
                  id="new-key"
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-900/60"
                  placeholder="Enter new key (min. 6 characters)"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-key" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Access Key
                </label>
                <input
                  id="confirm-key"
                  type="password"
                  value={confirmKey}
                  onChange={(e) => setConfirmKey(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-900/60"
                  placeholder="Re-enter new key"
                />
              </div>

              {settingsError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-200">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{settingsError}</span>
                </div>
              )}

              {settingsSuccess && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/30 dark:text-green-200">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false);
                    setSettingsError('');
                    setSettingsSuccess('');
                    setCurrentKey('');
                    setNewKey('');
                    setConfirmKey('');
                  }}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-500"
                >
                  Update Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface RepairManagementProps {
  repairs: RepairSnapshot;
  onUpdate: () => void;
  statusSummary: Array<{ label: string; count: number }>;
}

function RepairManagement({ repairs, onUpdate, statusSummary }: RepairManagementProps) {
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    totalCost: '',
  });

  useEffect(() => {
    if (!selectedRepair) {
      setUpdateForm({ status: '', notes: '', totalCost: '' });
      return;
    }

    setUpdateForm({
      status: selectedRepair.status ?? '',
      notes: selectedRepair.issueSummary ?? '',
      totalCost: selectedRepair.totalCost ? String(selectedRepair.totalCost) : '',
    });
  }, [selectedRepair]);

  const updateRepair = async () => {
    if (!selectedRepair) return;

    try {
      const response = await fetch('/api/analytics/repairs/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: selectedRepair.trackingId,
          status: updateForm.status,
          notes: updateForm.notes,
          totalCost: updateForm.totalCost ? parseFloat(updateForm.totalCost) : undefined,
        }),
      });

      if (response.ok) {
        alert('Repair updated successfully!');
        setSelectedRepair(null);
        onUpdate();
      } else {
        alert('Failed to update repair');
      }
    } catch (err) {
      console.error('Error updating repair:', err);
      alert('Error updating repair');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <StatPill label="Total repairs" value={repairs.totalRepairs ?? 0} />
        <StatPill label="Average completion" value={`${repairs.averageCompletionDays ?? 0} days`} />
        <StatPill label="Live revenue" value={`$${(repairs.totalRevenue ?? 0).toLocaleString()}`} />
        <StatPill label="Statuses tracked" value={statusSummary.length} />
      </div>

      {statusSummary.length ? (
        <div className="flex w-full flex-wrap gap-2 rounded-2xl border border-gray-200 bg-white p-4 text-xs uppercase tracking-wide text-gray-600 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          {statusSummary.map((status) => (
            <span
              key={status.label}
              className="rounded-full border border-current px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-700 dark:border-gray-700 dark:text-gray-300"
            >
              {status.label}: {status.count}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[3fr,2fr]">
        <div className="space-y-4 overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="px-2 text-sm font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">Active queue</h3>
          <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-2">
            {repairs.allRepairs && repairs.allRepairs.length ? (
              repairs.allRepairs.map((repair) => (
                <button
                  key={repair.trackingId}
                  onClick={() => setSelectedRepair(repair)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition hover:border-red-400 hover:shadow-md dark:hover:border-red-500/60 ${
                    selectedRepair?.trackingId === repair.trackingId
                      ? 'border-red-500 bg-red-500/10 text-red-600 dark:border-red-400 dark:bg-red-500/10 dark:text-red-200'
                      : 'border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{repair.trackingId}</div>
                    <span className="rounded-full border border-current px-2 py-0.5 text-[11px] uppercase tracking-wide">
                      {repair.status ?? 'pending'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{repair.deviceType ?? 'Unknown device'}</span>
                    <span>•</span>
                    <span>{repair.customerName ?? 'No customer name'}</span>
                    {repair.totalCost ? (
                      <>
                        <span>•</span>
                        <span>${repair.totalCost}</span>
                      </>
                    ) : null}
                    {repair.lastUpdated ? (
                      <>
                        <span>•</span>
                        <span>Updated {repair.lastUpdated}</span>
                      </>
                    ) : null}
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-500">
                No repair jobs are currently being tracked. Pending jobs will show up here automatically.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">Update repair</h3>
            {selectedRepair ? (
              <button
                onClick={() => setSelectedRepair(null)}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500 transition hover:text-red-400"
              >
                Clear
              </button>
            ) : null}
          </div>

          {selectedRepair ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-600 shadow-inner dark:bg-gray-800/70 dark:text-gray-400">
                <p className="font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500">Editing</p>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:text-base">{selectedRepair.trackingId}</p>
                <p className="mt-1 text-sm sm:text-xs">{selectedRepair.issueSummary ?? 'No additional notes recorded.'}</p>
              </div>

              <label className="space-y-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                <select
                  value={updateForm.status}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Select status</option>
                  {['received', 'submitted', 'diagnosed', 'in-progress', 'completed', 'ready-for-pickup', 'cancelled'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Internal notes</span>
                <textarea
                  rows={3}
                  value={updateForm.notes}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="w-full resize-y rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Share technician notes or next steps"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total cost (USD)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={updateForm.totalCost}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, totalCost: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </label>

              <button
                onClick={updateRepair}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply update
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a repair from the queue to review its details and apply updates. Customers are notified automatically when changes are saved.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewStat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <dt className="text-[11px] font-medium uppercase tracking-[0.4em] text-gray-500 dark:text-gray-500 sm:text-xs">{label}</dt>
      <dd className={`mt-2 text-xl font-semibold sm:text-2xl ${accent}`}>{value}</dd>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  iconBg,
}: {
  title: string;
  value: string | number;
  helper: string;
  iconBg: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className={`mb-4 inline-flex h-9 w-9 items-center justify-center rounded-2xl sm:h-10 sm:w-10 ${iconBg}`}>
        <span className="text-lg">★</span>
      </div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500 sm:text-xs">{helper}</p>
      <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">{title}</h3>
      <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">{value}</p>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-red-500/80 dark:text-red-400/80 sm:text-xs">Section</p>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 sm:text-2xl">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, trendLabel }: { label: string; value: string | number; trendLabel: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-red-200 hover:shadow-md sm:p-5 dark:border-gray-800 dark:bg-gray-900">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500 sm:text-xs">{trendLabel}</p>
      <h3 className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</h3>
      <p className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">{value}</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500 sm:text-xs">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">{value}</p>
    </div>
  );
}
