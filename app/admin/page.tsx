'use client';

import { useEffect, useMemo, useState } from 'react';

interface AnalyticsSnapshot {
  totalVisitors?: number;
  uniqueVisitors?: number;
  bounceRate?: number;
  avgSessionDuration?: number;
}

interface FormSubmission {
  formType?: string;
  timestamp?: string;
  originalTimestamp?: string;
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
  const [deleting, setDeleting] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Check for saved session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      if (response.ok) {
        setIsAuthenticated(true);
        void loadData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent analytics tracking
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword('');
        void loadData();
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear session cookie on server
      const response = await fetch('/api/admin/auth', { method: 'DELETE' });
      
      if (!response.ok) {
        console.error('Logout failed on server');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local state
    setIsAuthenticated(false);
    setPassword('');
    setAnalytics({});
    setForms({});
    setRepairs({});
    
    // Force page reload to clear any cached state
    window.location.reload();
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

  const deleteSensitiveData = async () => {
    if (!confirm('Are you sure you want to delete all form submissions containing passwords or sensitive data? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/analytics/forms', {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Successfully removed ${result.removedCount} sensitive submissions. ${result.remainingCount} submissions remain.`);
        await loadData(); // Refresh the data
      } else {
        alert(`❌ Failed to clean data: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting sensitive data:', error);
      alert('❌ Error deleting sensitive data. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const deleteFormSubmission = async (originalTimestamp: string, displayTimestamp: string, formType: string) => {
    if (!confirm(`Delete this ${formType} submission from ${displayTimestamp}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/analytics/forms/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: originalTimestamp, formType })
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Submission deleted successfully');
        await loadData(); // Refresh the data
      } else {
        alert(`❌ Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('❌ Error deleting submission. Please try again.');
    }
  };

  const toggleSubmissionSelection = (timestamp: string) => {
    setSelectedSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(timestamp)) {
        newSet.delete(timestamp);
      } else {
        newSet.add(timestamp);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (!forms.recentSubmissions) return;
    
    const visibleSubmissions = forms.recentSubmissions.slice(0, 6);
    const allSelected = visibleSubmissions.every(sub => 
      selectedSubmissions.has(sub.originalTimestamp || sub.timestamp || '')
    );

    if (allSelected) {
      setSelectedSubmissions(new Set());
    } else {
      const newSet = new Set<string>();
      visibleSubmissions.forEach(sub => {
        const timestamp = sub.originalTimestamp || sub.timestamp || '';
        if (timestamp) newSet.add(timestamp);
      });
      setSelectedSubmissions(newSet);
    }
  };

  const bulkDeleteSubmissions = async () => {
    if (selectedSubmissions.size === 0) return;

    // Capture submission details NOW before any state changes
    const submissionsToDelete = (forms.recentSubmissions?.filter(sub => 
      selectedSubmissions.has(sub.originalTimestamp || sub.timestamp || '')
    ) || []).map(sub => ({
      timestamp: sub.originalTimestamp || sub.timestamp || '',
      displayTimestamp: sub.timestamp || '',
      formType: sub.formType || 'unknown'
    }));

    const count = submissionsToDelete.length;
    if (count === 0) return;

    if (!confirm(`Delete ${count} selected submission${count > 1 ? 's' : ''}?`)) {
      return;
    }

    setBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Delete each submission using the captured data
      for (const submission of submissionsToDelete) {
        try {
          const response = await fetch('/api/analytics/forms/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              timestamp: submission.timestamp, 
              formType: submission.formType
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            const result = await response.json();
            console.error(`Failed to delete ${submission.formType} from ${submission.displayTimestamp}:`, result.error);
            failCount++;
          }
        } catch (error) {
          console.error('Error deleting submission:', error);
          failCount++;
        }
      }

      // Show result
      if (successCount > 0 && failCount === 0) {
        alert(`✅ Successfully deleted ${successCount} submission${successCount > 1 ? 's' : ''}`);
      } else if (successCount > 0 && failCount > 0) {
        alert(`⚠️ Deleted ${successCount} submission${successCount > 1 ? 's' : ''}, ${failCount} failed`);
      } else {
        alert(`❌ Failed to delete submissions`);
      }

      // Clear selection and refresh
      setSelectedSubmissions(new Set());
      await loadData();
    } catch (error) {
      console.error('Error during bulk delete:', error);
      alert('❌ Error deleting submissions. Please try again.');
    } finally {
      setBulkDeleting(false);
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

          <form onSubmit={handleAuth} className="space-y-6 bg-white px-8 py-10 dark:bg-gray-900" data-no-analytics="true">
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
                  href="/receipt"
                  className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Receipt Generator
                </a>
                <a
                  href="/offer-admin"
                  className="inline-flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Manage Offers
                </a>
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
            <OverviewStat label="Revenue" value={`Le ${(repairs.totalRevenue ?? 0).toLocaleString()}`} accent="text-orange-500" />
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
        <div className="flex items-center justify-between">
          <SectionHeader title="Forms" description="Capture insights, track submissions, and monitor engagement across funnels." />
          <button
            onClick={deleteSensitiveData}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? 'Deleting...' : 'Delete Sensitive Data'}
          </button>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="grid gap-4 min-[480px]:grid-cols-2 md:grid-cols-3">
            <StatPill label="Submissions" value={forms.totalSubmissions ?? 0} />
            <StatPill label="Views" value={forms.totalViews ?? 0} />
            <StatPill label="Conversion rate" value={`${forms.overallConversionRate ?? 0}%`} />
          </div>

          {forms.recentSubmissions && forms.recentSubmissions.length > 0 ? (
            <>
              {selectedSubmissions.size > 0 && (
                <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/30">
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {selectedSubmissions.size} submission{selectedSubmissions.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={bulkDeleteSubmissions}
                    disabled={bulkDeleting}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
                  </button>
                </div>
              )}
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                  <thead className="bg-gray-50 text-left uppercase tracking-wide dark:bg-gray-800/60">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={forms.recentSubmissions.slice(0, 6).every(sub => 
                            selectedSubmissions.has(sub.originalTimestamp || sub.timestamp || '')
                          )}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800"
                        />
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Form</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Submitted</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Key details</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {forms.recentSubmissions.slice(0, 6).map((submission, index) => {
                      const timestamp = submission.originalTimestamp || submission.timestamp || '';
                      const isSelected = selectedSubmissions.has(timestamp);
                      
                      return (
                        <tr 
                          key={`${submission.timestamp ?? index}-${index}`} 
                          className={`hover:bg-gray-50/70 dark:hover:bg-gray-800/60 ${isSelected ? 'bg-red-50/50 dark:bg-red-900/20' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSubmissionSelection(timestamp)}
                              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800"
                            />
                          </td>
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
                          <td className="px-4 py-3">
                            <button
                              onClick={() => deleteFormSubmission(
                                submission.originalTimestamp || submission.timestamp || '', 
                                submission.timestamp || '',
                                submission.formType || 'unknown'
                              )}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
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
        <StatPill label="Live revenue" value={`Le ${(repairs.totalRevenue ?? 0).toLocaleString()}`} />
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
                        <span>Le {repair.totalCost}</span>
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
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total cost (Le)</span>
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
