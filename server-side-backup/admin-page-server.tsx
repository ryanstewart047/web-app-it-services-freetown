'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FormSubmission {
  id: string;
  timestamp: string;
  type: string;
  data: any;
  status: 'new' | 'viewed' | 'responded';
}

interface RepairTracking {
  trackingId: string;
  customerName: string;
  customerEmail: string;
  deviceType: string;
  issue: string;
  status: 'received' | 'diagnosing' | 'in-progress' | 'ready' | 'completed';
  dateReceived: string;
  estimatedCompletion?: string;
}

interface AnalyticsData {
  visitors: {
    totalVisitors: number;
    uniqueVisitors: number;
    totalSessions: number;
    topPages: Array<{ path: string; visits: number }>;
    trafficSources: Array<{ source: string; visits: number }>;
  };
  forms: {
    totalSubmissions: number;
    overallConversionRate: number;
    recentSubmissions: FormSubmission[];
  };
  errors: {
    totalErrors: number;
    pendingErrors: number;
    topErrors: Array<{ message: string; count: number }>;
  };
  financial: {
    revenue: {
      monthly: number;
      growth: { monthly: number };
    };
  };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'forms' | 'tracking' | 'analytics'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [repairItems, setRepairItems] = useState<RepairTracking[]>([]);
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = 'admin2024';

  useEffect(() => {
    if (isAuthenticated) {
      loadRealTimeData();
      const interval = setInterval(loadRealTimeData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

    const loadRealTimeData = async () => {
    setLoading(true);
    try {
      // Load form submissions from localStorage (real data)
      const storedSubmissions = localStorage.getItem('formSubmissions');
      if (storedSubmissions) {
        const submissions = JSON.parse(storedSubmissions);
        setFormSubmissions(submissions);
      }

      // Load repair tracking data and booking data
      const storedRepairs = localStorage.getItem('repairTrackingData');
      const storedBookings = localStorage.getItem('bookingData');
      
      let allRepairs: RepairTracking[] = [];

      if (storedRepairs) {
        allRepairs = [...allRepairs, ...JSON.parse(storedRepairs)];
      }

      if (storedBookings) {
        const bookings = JSON.parse(storedBookings);
        const repairData = bookings.map((booking: any) => ({
          trackingId: booking.id || `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          customerName: booking.customerName || 'Unknown Customer',
          customerEmail: booking.customerEmail || booking.email || 'No email provided',
          deviceType: booking.service || booking.deviceType || 'General Service',
          issue: booking.notes || booking.issue || 'Service request',
          status: 'received' as const,
          dateReceived: booking.createdAt || new Date().toISOString(),
        }));
        allRepairs = [...allRepairs, ...repairData];
      }

      setRepairItems(allRepairs);

      // Create analytics data from local storage data
      const analyticsData: AnalyticsData = {
        visitors: { 
          totalVisitors: parseInt(localStorage.getItem('totalVisitors') || '0'), 
          uniqueVisitors: parseInt(localStorage.getItem('uniqueVisitors') || '0'), 
          totalSessions: parseInt(localStorage.getItem('totalSessions') || '0'), 
          topPages: JSON.parse(localStorage.getItem('topPages') || '[]'), 
          trafficSources: JSON.parse(localStorage.getItem('trafficSources') || '[]') 
        },
        forms: { 
          totalSubmissions: formSubmissions.length, 
          overallConversionRate: formSubmissions.length > 0 ? (formSubmissions.length / Math.max(parseInt(localStorage.getItem('totalVisitors') || '1'), 1)) * 100 : 0, 
          recentSubmissions: formSubmissions.slice(-5) 
        },
        errors: { 
          totalErrors: parseInt(localStorage.getItem('totalErrors') || '0'), 
          pendingErrors: parseInt(localStorage.getItem('pendingErrors') || '0'), 
          topErrors: JSON.parse(localStorage.getItem('topErrors') || '[]') 
        },
        financial: { 
          revenue: { 
            monthly: parseFloat(localStorage.getItem('monthlyRevenue') || '0'), 
            growth: { monthly: parseFloat(localStorage.getItem('revenueGrowth') || '0') } 
          } 
        }
      };
      setAnalytics(analyticsData);

    } catch (err) {
      console.error('Error loading real-time data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFormStatus = (id: string, status: 'new' | 'viewed' | 'responded') => {
    const updatedSubmissions = formSubmissions.map(submission =>
      submission.id === id ? { ...submission, status } : submission
    );
    setFormSubmissions(updatedSubmissions);
    localStorage.setItem('formSubmissions', JSON.stringify(updatedSubmissions));
  };

  const updateRepairStatus = (trackingId: string, status: RepairTracking['status'], estimatedCompletion?: string) => {
    const updatedRepairs = repairItems.map(repair =>
      repair.trackingId === trackingId ? { ...repair, status, estimatedCompletion } : repair
    );
    setRepairItems(updatedRepairs);
    localStorage.setItem('repairTrackingData', JSON.stringify(updatedRepairs));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid access key. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Access Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Real-time Business Intelligence Dashboard
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="password" className="sr-only">
                Access Key
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Access Dashboard
              </button>
            </div>
          </form>
          <div className="text-center">
            <Link 
              href="/"
              className="text-sm text-red-600 hover:text-red-500"
            >
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow" style={{ borderTop: '4px solid #dc2626' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">IT Services Admin</h1>
                <p className="text-sm text-gray-500">Real-Time Business Intelligence Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                <span className="text-sm text-gray-500">{loading ? 'Updating...' : 'Live Data'}</span>
              </div>
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Site
              </Link>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'forms', name: 'Form Submissions', icon: '📝' },
                { id: 'tracking', name: 'Repair Tracking', icon: '🔧' },
                { id: 'analytics', name: 'Detailed Analytics', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Visitors</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics?.visitors?.totalVisitors || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {formatCurrency(analytics?.financial?.revenue?.monthly || 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Form Submissions</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {formSubmissions.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Repairs</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {repairItems.filter(item => item.status !== 'completed').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-l-4 border-red-500">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest website interactions and business metrics</p>
              </div>
              <ul className="divide-y divide-gray-200">
                {formSubmissions.slice(0, 5).map((submission, index) => (
                  <li key={submission.id} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-3 w-3 rounded-full ${
                          submission.status === 'new' ? 'bg-green-400' : 
                          submission.status === 'viewed' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`}></div>
                        <p className="ml-4 text-sm font-medium text-gray-900">
                          {submission.type} - {submission.status}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(submission.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
                {repairItems.slice(0, 3).map((repair, index) => (
                  <li key={`repair-${repair.trackingId}`} className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-3 w-3 bg-purple-400 rounded-full"></div>
                        <p className="ml-4 text-sm font-medium text-gray-900">
                          Repair {repair.trackingId} - {repair.status}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(repair.dateReceived).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
                {formSubmissions.length === 0 && repairItems.length === 0 && (
                  <li className="px-4 py-4">
                    <div className="text-sm text-gray-500 text-center">No recent activity</div>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}

        {activeTab === 'forms' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-l-4 border-blue-500">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Form Submissions</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage and respond to customer inquiries</p>
              </div>
              <button
                onClick={loadRealTimeData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-red-500"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate">
                          {JSON.stringify(submission.data).substring(0, 100)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          submission.status === 'new' ? 'bg-green-100 text-green-800' :
                          submission.status === 'viewed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={submission.status}
                          onChange={(e) => updateFormStatus(submission.id, e.target.value as any)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-red-500"
                        >
                          <option value="new">New</option>
                          <option value="viewed">Viewed</option>
                          <option value="responded">Responded</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {formSubmissions.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No form submissions</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by submitting a form on the website.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-l-4 border-yellow-500">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Repair Tracking</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Monitor and update repair status for customers</p>
              </div>
              <button
                onClick={loadRealTimeData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-red-500"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device/Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repairItems.map((repair) => (
                    <tr key={repair.trackingId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {repair.trackingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">{repair.customerName}</div>
                          <div className="text-gray-400">{repair.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">{repair.deviceType}</div>
                          <div className="text-gray-400">{repair.issue}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          repair.status === 'received' ? 'bg-gray-100 text-gray-800' :
                          repair.status === 'diagnosing' ? 'bg-yellow-100 text-yellow-800' :
                          repair.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          repair.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {repair.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={repair.status}
                          onChange={(e) => updateRepairStatus(repair.trackingId, e.target.value as any)}
                          className="border border-gray-300 rounded-md px-2 py-1 text-sm mr-2 focus:ring-2 focus:ring-red-500"
                        >
                          <option value="received">Received</option>
                          <option value="diagnosing">Diagnosing</option>
                          <option value="in-progress">In Progress</option>
                          <option value="ready">Ready for Pickup</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {repairItems.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No repair items</h3>
                  <p className="mt-1 text-sm text-gray-500">Repair tracking items will appear here when bookings are made.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Form Submissions</span>
                  <span className="text-sm font-medium">{formSubmissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Active Repair Items</span>
                  <span className="text-sm font-medium">{repairItems.filter(item => item.status !== 'completed').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completed Repairs</span>
                  <span className="text-sm font-medium">{repairItems.filter(item => item.status === 'completed').length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Data Refresh Rate</span>
                  <span className="text-sm font-medium flex items-center">
                    <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                    10 seconds
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium flex items-center">
                    <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
