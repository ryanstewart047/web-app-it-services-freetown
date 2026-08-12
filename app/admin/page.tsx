'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

// Helper: add ?iframe=1 to a URL (handles existing query strings)
function iframeUrl(url: string): string {
  if (!url || url.startsWith('/api/')) return url;
  return url.includes('?') ? `${url}&iframe=1` : `${url}?iframe=1`;
}

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
  paymentStatus?: string;
  lastUpdated?: string;
  issueSummary?: string;
  totalCost?: number;
  diagnosticNotes?: string;
  diagnosticImages?: any[];
}

interface RepairSnapshot {
  totalRepairs?: number;
  statusCounts?: Record<string, number>;
  averageCompletionDays?: number;
  totalRevenue?: number;
  allRepairs?: RepairRecord[];
}

interface OrdersSnapshot {
  totalRevenue?: number;
  totalOrders?: number;
}

interface AdminPanelItem {
  id: string;
  name: string;
  category: 'overview' | 'ecommerce' | 'services' | 'marketing';
  description: string;
  icon: string;
  color: string;
  url: string;
}

const ADMIN_PANELS: AdminPanelItem[] = [
  // Overview
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'overview',
    description: 'Overview, Repairs & Analytics',
    icon: 'fas fa-tachometer-alt',
    color: 'text-red-400',
    url: '/admin',
  },
  {
    id: 'banner-admin',
    name: 'Global Banner',
    category: 'overview',
    description: 'Site announcements',
    icon: 'fas fa-bullhorn',
    color: 'text-orange-400',
    url: '/banner-admin',
  },
  // E-Commerce & Inventory
  {
    id: 'products',
    name: 'Manage Products',
    category: 'ecommerce',
    description: 'Marketplace products',
    icon: 'fas fa-box-open',
    color: 'text-blue-400',
    url: '/admin/products',
  },
  {
    id: 'add-product',
    name: 'Add Product',
    category: 'ecommerce',
    description: 'Quick add new product',
    icon: 'fas fa-plus-circle',
    color: 'text-green-400',
    url: '/admin/add-product',
  },
  {
    id: 'bulk-upload',
    name: 'Bulk Upload',
    category: 'ecommerce',
    description: 'Upload multiple products',
    icon: 'fas fa-file-upload',
    color: 'text-cyan-400',
    url: '/admin/products/bulk-upload',
  },
  {
    id: 'orders',
    name: 'View Orders',
    category: 'ecommerce',
    description: 'Track customer orders',
    icon: 'fas fa-shopping-cart',
    color: 'text-yellow-400',
    url: '/admin/orders',
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    category: 'ecommerce',
    description: 'Create & manage invoices',
    icon: 'fas fa-file-invoice',
    color: 'text-indigo-400',
    url: '/admin/invoices',
  },
  {
    id: 'legal-documents',
    name: 'Legal & Authorization Letters',
    category: 'ecommerce',
    description: 'Generate proof of legal authority & sign',
    icon: 'fas fa-file-signature',
    color: 'text-red-400',
    url: '/admin/legal-documents',
  },
  {
    id: 'categories',
    name: 'Categories',
    category: 'ecommerce',
    description: 'Organize products',
    icon: 'fas fa-tags',
    color: 'text-purple-400',
    url: '/admin/categories',
  },
  {
    id: 'discount-codes',
    name: 'Discount Codes',
    category: 'ecommerce',
    description: 'Manage promo codes',
    icon: 'fas fa-ticket-alt',
    color: 'text-amber-400',
    url: '/admin/discount-codes',
  },
  {
    id: 'receipt',
    name: 'Receipt Generator',
    category: 'ecommerce',
    description: 'Create receipts',
    icon: 'fas fa-receipt',
    color: 'text-lime-400',
    url: '/receipt',
  },
  {
    id: 'offer-admin',
    name: 'Offer Admin',
    category: 'ecommerce',
    description: 'Manage special offers',
    icon: 'fas fa-gift',
    color: 'text-pink-400',
    url: '/offer-admin',
  },
  {
    id: 'ads-admin',
    name: 'Manage Ads',
    category: 'ecommerce',
    description: 'Custom ad banners',
    icon: 'fas fa-ad',
    color: 'text-yellow-500',
    url: '/ads-admin',
  },
  // Services & Community
  {
    id: 'bookings',
    name: 'Bookings',
    category: 'services',
    description: 'Service appointments',
    icon: 'fas fa-calendar-check',
    color: 'text-red-300',
    url: '/admin/bookings',
  },
  {
    id: 'forum-admin',
    name: 'Forum Admin',
    category: 'services',
    description: 'Manage technicians',
    icon: 'fas fa-users-gear',
    color: 'text-indigo-400',
    // Bridge redirects to /forum/admin and sets forum_admin_session cookie
    url: '/forum/admin',
  },
  {
    id: 'bridge-gallery',
    name: 'Bridge Gallery Admin',
    category: 'services',
    description: 'Manage project photos',
    icon: 'fas fa-images',
    color: 'text-blue-400',
    url: '/madinaface3bridgeproject/admin',
  },
  {
    id: 'shirleys-admin',
    name: 'Shirley\'s Gallery Admin',
    category: 'marketing',
    description: 'Manage bakery & fashion gallery',
    icon: 'fas fa-heart',
    color: 'text-pink-400',
    url: '/shirleys/admin',
  },
  // Marketing & Growth
  {
    id: 'blog-admin',
    name: 'Blog Admin',
    category: 'marketing',
    description: 'Manage blog posts',
    icon: 'fas fa-blog',
    color: 'text-orange-400',
    url: '/blog/admin',
  },
  {
    id: 'email-leads',
    name: 'Email Leads',
    category: 'marketing',
    description: 'Customer lead collection',
    icon: 'fas fa-envelope-open-text',
    color: 'text-sky-400',
    url: '/admin/email-leads',
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    category: 'marketing',
    description: 'Send HTML campaigns',
    icon: 'fas fa-paper-plane',
    color: 'text-rose-400',
    url: '/admin/email-marketing',
  },
  {
    id: 'newsletter-popup',
    name: 'Newsletter Popup',
    category: 'marketing',
    description: 'Popup settings & stats',
    icon: 'fas fa-envelope',
    color: 'text-violet-400',
    url: '/admin/newsletter',
  },
  {
    id: 'facebook-auto',
    name: 'Facebook Auto',
    category: 'marketing',
    description: 'Auto-post & integrations',
    icon: 'fab fa-facebook',
    color: 'text-blue-500',
    url: '/admin/facebook-auto-post',
  },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>({});
  const [forms, setForms] = useState<FormSnapshot>({});
  const [repairs, setRepairs] = useState<RepairSnapshot>({});
  const [ordersData, setOrdersData] = useState<OrdersSnapshot>({});
  const [deleting, setDeleting] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // Master Hub State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [iframeLoading, setIframeLoading] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showQuickAccess, setShowQuickAccess] = useState<boolean>(true);

  // 2FA Verification State
  const [requires2FA, setRequires2FA] = useState<boolean>(false);
  const [pendingToken, setPendingToken] = useState<string>('');
  const [twoFactorMode, setTwoFactorMode] = useState<'email' | 'totp' | 'both'>('both');
  const [selected2FAMethod, setSelected2FAMethod] = useState<'email' | 'totp'>('email');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [verifying2FA, setVerifying2FA] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string>('');

  // 2FA Settings Modal State
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);
  const [twoFASetupLoading, setTwoFASetupLoading] = useState<boolean>(false);
  const [twoFASetupData, setTwoFASetupData] = useState<any>(null);
  const [saving2FASettings, setSaving2FASettings] = useState<boolean>(false);
  const [setupFeedback, setSetupFeedback] = useState<string>('');

  // Sync tab with URL search parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ADMIN_PANELS.some(p => p.id === tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIframeLoading(true);
    setIframeKey(prev => prev + 1);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Check for saved session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-logout after 5 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    const IDLE_TIMEOUT = 5 * 60 * 1000;
    const WARNING_TIME = 30 * 1000;

    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowIdleWarning(false);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'keyup', 'input', 'scroll', 'touchstart', 'click', 'focus'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ADMIN_ACTIVITY') {
        updateActivity();
      }
    };
    window.addEventListener('message', handleMessage);

    const idleCheckInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;

      if (timeSinceLastActivity >= IDLE_TIMEOUT) {
        handleLogout();
        alert('Session expired due to inactivity. Please log in again.');
      } else if (timeSinceLastActivity >= IDLE_TIMEOUT - WARNING_TIME && !showIdleWarning) {
        setShowIdleWarning(true);
      }
    }, 10000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      window.removeEventListener('message', handleMessage);
      clearInterval(idleCheckInterval);
    };
  }, [isAuthenticated, lastActivity, showIdleWarning]);

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
    event.stopPropagation();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.requires2FA) {
          // Password correct -> move to Step 2 (2FA verification)
          setRequires2FA(true);
          setPendingToken(data.pendingToken);
          setTwoFactorMode(data.mode || 'both');
          setRecipientEmail(data.recipientEmail || '');
          setSelected2FAMethod(data.mode === 'totp' ? 'totp' : 'email');
          setPassword('');
        } else {
          // 2FA disabled -> directly logged in
          setIsAuthenticated(true);
          setPassword('');
          void loadData();
        }
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setError('Please enter your 6-digit verification code.');
      return;
    }

    setError('');
    setVerifying2FA(true);

    try {
      const response = await fetch('/api/admin/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingToken,
          method: selected2FAMethod,
          code: twoFactorCode
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setRequires2FA(false);
        setTwoFactorCode('');
        setPendingToken('');
        void loadData();
      } else {
        setError(data.error || 'Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed due to a connection error.');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleResendEmailCode = async () => {
    if (!pendingToken) return;
    setResendingEmail(true);
    setResendSuccessMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/auth/resend-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.pendingToken) setPendingToken(data.pendingToken);
        setResendSuccessMessage('New 6-digit code sent to your email!');
        setTimeout(() => setResendSuccessMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to resend email code.');
      }
    } catch (err) {
      setError('Resend failed.');
    } finally {
      setResendingEmail(false);
    }
  };

  const load2FASettings = async () => {
    setTwoFASetupLoading(true);
    try {
      const res = await fetch('/api/admin/2fa/setup');
      if (res.ok) {
        const data = await res.json();
        setTwoFASetupData(data);
      }
    } catch (err) {
      console.error('Failed to fetch 2FA setup data', err);
    } finally {
      setTwoFASetupLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    setIsAuthenticated(false);
    setPassword('');
    setAnalytics({});
    setForms({});
    setRepairs({});
    window.location.reload();
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      if (typeof window !== 'undefined') {
        const { cleanupOldImages, getAllBookings } = await import('@/lib/unified-booking-storage');
        cleanupOldImages();

        const localBookings = getAllBookings();
        if (localBookings.length > 0) {
          const apiResponse = await fetch(`/api/analytics/repairs/?t=${Date.now()}`, { cache: 'no-store' });
          const apiData = apiResponse.ok ? await apiResponse.json() : { allRepairs: [] };
          const existingTrackingIds = new Set(
            (apiData.allRepairs || []).map((r: any) => r.trackingId)
          );

          for (const booking of localBookings) {
            if (!existingTrackingIds.has(booking.trackingId)) {
              try {
                await fetch('/api/analytics/repairs/', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'create',
                    trackingId: booking.trackingId,
                    customerName: booking.customerName,
                    email: booking.email,
                    phone: booking.phone,
                    deviceType: booking.deviceType,
                    deviceModel: booking.deviceModel,
                    issueDescription: booking.issueDescription,
                    serviceType: booking.serviceType,
                    address: booking.address,
                    status: booking.status,
                    notes: booking.notes,
                    totalCost: booking.cost,
                    estimatedCompletion: booking.estimatedCompletion,
                  }),
                });
              } catch (err) {
                console.error(`Failed to sync booking ${booking.trackingId}:`, err);
              }
            }
          }
        }
      }

      const ts = Date.now();
      const [analyticsRes, formsRes, repairsRes, ordersRes] = await Promise.all([
        fetch(`/api/analytics/visitor/?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/analytics/forms/?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/analytics/repairs/?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/orders?t=${ts}`, { cache: 'no-store' }),
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (formsRes.ok) setForms(await formsRes.json());
      if (repairsRes.ok) setRepairs(await repairsRes.json());

      // Compute total orders revenue
      if (ordersRes.ok) {
        try {
          const ordersJson = await ordersRes.json();
          const orders: any[] = Array.isArray(ordersJson) ? ordersJson : (ordersJson.orders || []);
          const totalOrderRevenue = orders
            .filter((o: any) => o.status !== 'cancelled')
            .reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount ?? o.total ?? 0)), 0);
          setOrdersData({ totalOrders: orders.length, totalRevenue: Math.round(totalOrderRevenue * 100) / 100 });
        } catch (_) {}
      }

      setRefreshSuccess('Data refreshed successfully!');
      setTimeout(() => setRefreshSuccess(''), 3500);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const statusSummary = useMemo(() => {
    if (!repairs.statusCounts) return [];
    return Object.entries(repairs.statusCounts).map(([label, count]) => ({
      label: label.replace(/-/g, ' '),
      count: count as number,
    }));
  }, [repairs.statusCounts]);

  const filteredPanels = useMemo(() => {
    if (!searchQuery.trim()) return ADMIN_PANELS;
    const q = searchQuery.toLowerCase();
    return ADMIN_PANELS.filter(
      p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activePanelObj = useMemo(() => {
    return ADMIN_PANELS.find(p => p.id === activeTab) || ADMIN_PANELS[0];
  }, [activeTab]);

  const handleDeleteSubmission = async (formType: string, timestamp: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/analytics/forms/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, timestamp })
      });
      if (res.ok) void loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Combined revenue: repairs (paid) + marketplace orders
  const combinedRevenue = useMemo(() => {
    const repairRev = repairs.totalRevenue ?? 0;
    const orderRev = ordersData.totalRevenue ?? 0;
    return Math.round((repairRev + orderRev) * 100) / 100;
  }, [repairs.totalRevenue, ordersData.totalRevenue]);

  // If not authenticated, render Login / 2FA Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-slate-950/80 pointer-events-none" />

        <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-700/60 rounded-3xl p-8 shadow-2xl backdrop-blur">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/30">
              <i className={`fas ${requires2FA ? 'fa-lock-keyhole' : 'fa-shield-halved'} text-white text-3xl`}></i>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">BridgeTech <span className="text-red-400">IT Services</span></h1>
            <p className="text-red-400 font-medium text-sm mt-1">Master Admin Operations Portal</p>
            <p className="text-slate-500 text-xs mt-1">
              {requires2FA ? 'Step 2: Two-Factor Authentication (2FA)' : 'Freetown · Sierra Leone'}
            </p>
          </div>

          {!requires2FA ? (
            /* STEP 1: Admin Password Entry */
            <form onSubmit={handleAuth} className="space-y-5" data-no-analytics="true">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Administrator Access Key
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-circle-notch fa-spin mr-2"></i> Verifying Credentials...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-shield-halved mr-2"></i> Continue to 2FA Verification
                  </span>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Two-Factor Code Verification */
            <form onSubmit={handle2FAVerify} className="space-y-5" data-no-analytics="true">
              {/* Method Selector if both or available */}
              {twoFactorMode === 'both' && (
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setSelected2FAMethod('email'); setError(''); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      selected2FAMethod === 'email'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fas fa-envelope"></i> Email Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelected2FAMethod('totp'); setError(''); }}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      selected2FAMethod === 'totp'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fas fa-[#4285F4] fa-mobile-screen"></i> Authenticator App
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {selected2FAMethod === 'email'
                    ? `Enter 6-Digit Code sent to ${recipientEmail || 'your email'}`
                    : 'Enter 6-Digit Code from Google Authenticator / Authy'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  autoFocus
                />

                {resendSuccessMessage && (
                  <p className="text-emerald-400 text-xs mt-2 flex items-center">
                    <i className="fas fa-check-circle mr-1.5"></i> {resendSuccessMessage}
                  </p>
                )}

                {error && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <i className="fas fa-exclamation-circle mr-2"></i> {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={verifying2FA || twoFactorCode.length < 6}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {verifying2FA ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-circle-notch fa-spin mr-2"></i> Verifying 2FA Code...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-unlock mr-2"></i> Complete Login
                  </span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                {selected2FAMethod === 'email' ? (
                  <button
                    type="button"
                    onClick={handleResendEmailCode}
                    disabled={resendingEmail}
                    className="text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
                  >
                    <i className={`fas fa-rotate-right ${resendingEmail ? 'animate-spin' : ''}`}></i>
                    {resendingEmail ? 'Sending...' : 'Resend Email Code'}
                  </button>
                ) : (
                  <span className="text-slate-500">Google Auth / Authy / Microsoft Auth</span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setError('');
                    setTwoFactorCode('');
                  }}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  &larr; Back to Password
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-xs text-slate-500">
            2FA Protected &bull; EARPI &amp; BridgeTech IT Services
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Idle Warning Bar */}
      {showIdleWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white font-bold px-4 py-2 text-center text-sm flex items-center justify-center gap-2 shadow-lg">
          <i className="fas fa-clock animate-bounce"></i>
          <span>Session will expire in 30 seconds due to inactivity! Move your mouse or click to stay logged in.</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isSidebarOpen ? 'w-full md:w-72' : 'w-full md:w-20'
        } bg-[#0f1117] border-r border-red-900/30 flex flex-col shrink-0 transition-all duration-300 z-30`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-red-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 bg-red-600/20 border border-red-600/40 rounded-xl flex items-center justify-center shrink-0"
              title={!isSidebarOpen ? "Master Admin Hub — BridgeTech IT Services" : undefined}
            >
              <i className="fas fa-shield-alt text-red-400 text-lg"></i>
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <h2 className="font-bold text-white text-sm leading-tight truncate">Master Admin Hub</h2>
                <p className="text-xs text-red-400 truncate">BridgeTech IT Services</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Search Bar */}
        {isSidebarOpen && (
          <div className="p-3 border-b border-red-900/20">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                placeholder="Search 20 admin panels..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          {/* Overview Section */}
          <div>
            {isSidebarOpen && (
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-500/60 px-3 mb-2">
                Overview & Control
              </h3>
            )}
            <div className="space-y-1">
              {filteredPanels
                .filter(p => p.category === 'overview')
                .map(panel => (
                  <button
                    key={panel.id}
                    onClick={() => handleTabChange(panel.id)}
                    title={!isSidebarOpen ? panel.name : undefined}
                    className={`w-full flex items-center ${
                      isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
                    } py-2.5 rounded-xl transition-all ${
                      activeTab === panel.id
                        ? 'bg-red-600/20 text-red-400 border border-red-600/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <i className={`${panel.icon} ${panel.color} ${isSidebarOpen ? 'mr-3' : ''} text-base`}></i>
                    {isSidebarOpen && <span className="text-xs truncate">{panel.name}</span>}
                  </button>
                ))}
            </div>
          </div>

          {/* E-Commerce Section */}
          <div>
            {isSidebarOpen && (
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-500/60 px-3 mb-2">
                Commerce & Inventory
              </h3>
            )}
            <div className="space-y-1">
              {filteredPanels
                .filter(p => p.category === 'ecommerce')
                .map(panel => (
                  <button
                    key={panel.id}
                    onClick={() => handleTabChange(panel.id)}
                    title={!isSidebarOpen ? panel.name : undefined}
                    className={`w-full flex items-center ${
                      isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
                    } py-2.5 rounded-xl transition-all ${
                      activeTab === panel.id
                        ? 'bg-red-600/20 text-red-400 border border-red-600/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <i className={`${panel.icon} ${panel.color} ${isSidebarOpen ? 'mr-3' : ''} text-base`}></i>
                    {isSidebarOpen && <span className="text-xs truncate">{panel.name}</span>}
                  </button>
                ))}
            </div>
          </div>

          {/* Services Section */}
          <div>
            {isSidebarOpen && (
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-500/60 px-3 mb-2">
                Services & Community
              </h3>
            )}
            <div className="space-y-1">
              {filteredPanels
                .filter(p => p.category === 'services')
                .map(panel => (
                  <button
                    key={panel.id}
                    onClick={() => handleTabChange(panel.id)}
                    title={!isSidebarOpen ? panel.name : undefined}
                    className={`w-full flex items-center ${
                      isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
                    } py-2.5 rounded-xl transition-all ${
                      activeTab === panel.id
                        ? 'bg-red-600/20 text-red-400 border border-red-600/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <i className={`${panel.icon} ${panel.color} ${isSidebarOpen ? 'mr-3' : ''} text-base`}></i>
                    {isSidebarOpen && <span className="text-xs truncate">{panel.name}</span>}
                  </button>
                ))}
            </div>
          </div>

          {/* Marketing Section */}
          <div>
            {isSidebarOpen && (
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-red-500/60 px-3 mb-2">
                Marketing & Growth
              </h3>
            )}
            <div className="space-y-1">
              {filteredPanels
                .filter(p => p.category === 'marketing')
                .map(panel => (
                  <button
                    key={panel.id}
                    onClick={() => handleTabChange(panel.id)}
                    title={!isSidebarOpen ? panel.name : undefined}
                    className={`w-full flex items-center ${
                      isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
                    } py-2.5 rounded-xl transition-all ${
                      activeTab === panel.id
                        ? 'bg-red-600/20 text-red-400 border border-red-600/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <i className={`${panel.icon} ${panel.color} ${isSidebarOpen ? 'mr-3' : ''} text-base`}></i>
                    {isSidebarOpen && <span className="text-xs truncate">{panel.name}</span>}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-red-900/30 space-y-2">
          <button
            onClick={() => {
              setShow2FAModal(true);
              void load2FASettings();
            }}
            title={!isSidebarOpen ? '2FA Security Setup' : undefined}
            className={`w-full flex items-center ${
              isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
            } py-2 rounded-lg text-amber-400 hover:bg-amber-500/10 text-xs font-medium transition-colors`}
          >
            <i className={`fas fa-key ${isSidebarOpen ? 'mr-2' : ''}`}></i>
            {isSidebarOpen && <span>2FA Security Setup</span>}
          </button>
          <Link
            href="/"
            target="_blank"
            title={!isSidebarOpen ? 'View Public Site' : undefined}
            className={`w-full flex items-center ${
              isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
            } py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/50 text-xs transition-colors`}
          >
            <i className={`fas fa-external-link-alt ${isSidebarOpen ? 'mr-2' : ''}`}></i>
            {isSidebarOpen && <span>View Public Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? 'Logout Session' : undefined}
            className={`w-full flex items-center ${
              isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
            } py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors`}
          >
            <i className={`fas fa-right-from-bracket ${isSidebarOpen ? 'mr-2' : ''}`}></i>
            {isSidebarOpen && <span>Logout Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Workspace Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
        {/* Workspace Top Bar */}
        <header className="h-16 border-b border-red-900/30 bg-[#0f1117]/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <i className={`${activePanelObj.icon} ${activePanelObj.color} text-xl`}></i>
            <div>
              <h1 className="font-bold text-white text-base leading-tight truncate">
                {activePanelObj.name}
              </h1>
              <p className="text-xs text-slate-400 truncate">{activePanelObj.description}</p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShow2FAModal(true);
                void load2FASettings();
              }}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5"
              title="Configure Two-Factor Authentication & Google Authenticator"
            >
              <i className="fas fa-shield-cat"></i>
              <span className="hidden sm:inline">2FA Settings</span>
            </button>
            <button
              onClick={() => {
                if (activeTab === 'dashboard') {
                  void loadData();
                } else {
                  setIframeKey(prev => prev + 1);
                }
              }}
              disabled={isRefreshing}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title={activeTab === 'dashboard' ? 'Refresh Dashboard & Repair Data' : 'Reload Panel Workspace'}
            >
              <i className={`fas fa-arrows-rotate ${isRefreshing && activeTab === 'dashboard' ? 'fa-spin text-red-400' : ''}`}></i>
              <span className="hidden sm:inline">{isRefreshing && activeTab === 'dashboard' ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <a
              href={activePanelObj.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open full page in new tab"
            >
              <i className="fas fa-arrow-up-right-from-square"></i>
              <span>Open Direct</span>
            </a>
            <button
              onClick={handleLogout}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <i className="fas fa-lock"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Workspace Content Area */}
        <div className="flex-1 relative bg-slate-950 overflow-y-auto">
          {refreshSuccess && (
            <div className="fixed top-20 right-6 z-50 bg-emerald-600/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-emerald-400/40 animate-bounce">
              <i className="fas fa-check-circle text-sm text-emerald-200"></i>
              <span>{refreshSuccess}</span>
            </div>
          )}
          {activeTab === 'dashboard' ? (
            /* Native Overview, Repairs & Analytics Panel */
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              {/* Analytics Snapshot Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue Card */}
                <div className="bg-gradient-to-br from-red-900/30 to-slate-900 border border-red-800/40 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Revenue</span>
                    <i className="fas fa-dollar-sign text-red-400 text-lg"></i>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    Le {combinedRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-400 mt-1">
                    Repairs: Le {(repairs.totalRevenue ?? 0).toLocaleString()} &bull; Orders: Le {(ordersData.totalRevenue ?? 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Repairs & Bookings</span>
                    <i className="fas fa-tools text-orange-400 text-lg"></i>
                  </div>
                  <div className="text-2xl font-bold text-white">{repairs.totalRepairs || 0}</div>
                  <p className="text-xs text-slate-400 mt-1">Orders: {ordersData.totalOrders || 0} marketplace</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Form Submissions</span>
                    <i className="fas fa-paper-plane text-yellow-400 text-lg"></i>
                  </div>
                  <div className="text-2xl font-bold text-white">{forms.totalSubmissions || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Conversion: {forms.overallConversionRate || 0}%</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Site Visitors</span>
                    <i className="fas fa-users text-cyan-400 text-lg"></i>
                  </div>
                  <div className="text-2xl font-bold text-white">{analytics.totalVisitors || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Unique: {analytics.uniqueVisitors || 0} &bull; Bounce: {analytics.bounceRate || 0}%</p>
                </div>
              </div>

              {/* Full Repair Operations Console */}
              <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-900/20 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <i className="fas fa-wrench text-red-400"></i> Repair Operations & Tracking
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Track active repair jobs, update job status, record costs, and diagnostic images.
                    </p>
                  </div>
                  <button
                    onClick={() => void loadData()}
                    disabled={isRefreshing}
                    className="px-3 py-1.5 bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto disabled:opacity-50"
                  >
                    <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i>
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh Repairs'}</span>
                  </button>
                </div>

                <RepairManagement repairs={repairs} onUpdate={loadData} statusSummary={statusSummary} />
              </div>

              {/* Quick Navigation Panels Grid */}
              {showQuickAccess && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-th text-red-400"></i> Quick Access Admin Modules
                    </h3>
                    <button
                      onClick={() => setShowQuickAccess(false)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
                      title="Hide Quick Access Panel"
                    >
                      <i className="fas fa-times text-sm"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ADMIN_PANELS.filter(p => p.id !== 'dashboard').map(panel => (
                      <button
                        key={panel.id}
                        onClick={() => handleTabChange(panel.id)}
                        className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-red-700/40 rounded-xl text-left transition-all hover:scale-[1.02] group"
                      >
                        <i className={`${panel.icon} ${panel.color} text-xl mb-2 block group-hover:scale-110 transition-transform`}></i>
                        <h4 className="font-semibold text-white text-xs truncate">{panel.name}</h4>
                        <p className="text-slate-400 text-[11px] mt-0.5 truncate">{panel.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Form Submissions Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Recent Customer Enquiries
                  </h3>
                  <button
                    onClick={() => void loadData()}
                    disabled={isRefreshing}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`}></i>
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                  </button>
                </div>

                {forms.recentSubmissions && forms.recentSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Type</th>
                          <th className="p-3">Details</th>
                          <th className="p-3">Submitted</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {forms.recentSubmissions.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/50">
                            <td className="p-3 font-semibold text-emerald-400 capitalize">{sub.formType}</td>
                            <td className="p-3 max-w-md truncate">
                              {sub.fields ? JSON.stringify(sub.fields) : '—'}
                            </td>
                            <td className="p-3 text-slate-400">
                              {sub.timestamp ? new Date(sub.timestamp).toLocaleString() : '—'}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() =>
                                  sub.formType && sub.timestamp && handleDeleteSubmission(sub.formType, sub.timestamp)
                                }
                                disabled={deleting}
                                className="text-rose-400 hover:text-rose-300 p-1"
                                title="Delete Submission"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">No recent form submissions found.</p>
                )}
              </div>
            </div>
          ) : (
            /* Embedded Workspace Frame for Selected Panel */
            <div className="w-full h-full relative min-h-[calc(100vh-64px)] bg-slate-950">
              {iframeLoading && (
                <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-semibold text-white">Loading {activePanelObj.name} Workspace...</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">Connecting to {activePanelObj.url}</p>
                  <a
                    href={activePanelObj.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow"
                  >
                    Open Panel Directly in New Window
                  </a>
                </div>
              )}
              <iframe
                key={`${activeTab}-${iframeKey}`}
                src={iframeUrl(activePanelObj.url)}
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full min-h-[calc(100vh-64px)] border-0"
                title={activePanelObj.name}
              />
            </div>
          )}
        </div>
      </main>

      {/* 2FA Security Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 font-bold">
                  <i className="fas fa-shield-cat text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Master Admin 2FA Security</h3>
                  <p className="text-xs text-slate-400">Authenticator App &amp; Email OTP Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <i className="fas fa-xmark text-lg"></i>
              </button>
            </div>

            {twoFASetupLoading ? (
              <div className="py-12 text-center text-slate-400">
                <i className="fas fa-circle-notch fa-spin text-2xl mb-2 text-amber-400"></i>
                <p className="text-xs font-semibold">Loading 2FA Security Config...</p>
              </div>
            ) : twoFASetupData ? (
              <div className="space-y-6 text-xs">
                {/* Status Alert */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-shield-halved text-emerald-400 text-base"></i>
                    <div>
                      <p className="font-semibold text-slate-200">2FA Status</p>
                      <p className="text-[11px] text-slate-400">
                        {twoFASetupData.config?.enabled ? 'Active — Protected against unauthorized access' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const newStatus = !twoFASetupData.config.enabled;
                      setSaving2FASettings(true);
                      try {
                        const res = await fetch('/api/admin/2fa/setup', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ enabled: newStatus })
                        });
                        if (res.ok) {
                          setTwoFASetupData((prev: any) => ({
                            ...prev,
                            config: { ...prev.config, enabled: newStatus }
                          }));
                          setSetupFeedback(`2FA successfully ${newStatus ? 'ENABLED' : 'DISABLED'}.`);
                          setTimeout(() => setSetupFeedback(''), 4000);
                        }
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setSaving2FASettings(false);
                      }
                    }}
                    disabled={saving2FASettings}
                    className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                      twoFASetupData.config?.enabled
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30'
                    }`}
                  >
                    {twoFASetupData.config?.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {setupFeedback && (
                  <p className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                    <i className="fas fa-check-circle"></i> {setupFeedback}
                  </p>
                )}

                {/* Section 1: Google Authenticator QR Code Setup */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fas fa-qrcode"></i> Step 1: Bind Authenticator App (Google Auth / Authy)
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {twoFASetupData.totp?.qrCodeUrl && (
                      <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                        <img
                          src={twoFASetupData.totp.qrCodeUrl}
                          alt="Google Authenticator 2FA QR Code"
                          className="w-32 h-32"
                        />
                      </div>
                    )}
                    <div className="space-y-2 text-slate-300">
                      <p>
                        Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>Microsoft Authenticator</strong> on your phone.
                      </p>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">Secret Key (Manual Entry):</span>
                        <code className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg font-mono text-amber-300 text-xs tracking-wider select-all inline-block mt-0.5">
                          {twoFASetupData.totp?.secret}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: 2FA Mode & Email Config */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <i className="fas fa-sliders"></i> Step 2: Preferred Verification Method
                  </h4>

                  <div className="space-y-2">
                    {[
                      {
                        key: 'both',
                        label: 'Both Email Code & Authenticator App (Recommended)',
                        desc: 'Allows admins to enter either the 6-digit email code OR their Authenticator App code at login.'
                      },
                      {
                        key: 'email',
                        label: 'Email Verification Code Only',
                        desc: 'Sends a fresh 6-digit OTP code to the configured admin email on every login attempt.'
                      },
                      {
                        key: 'totp',
                        label: 'Authenticator App Only (TOTP)',
                        desc: 'Requires code from Google Authenticator / Authy app on phone.'
                      }
                    ].map(opt => (
                      <label
                        key={opt.key}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          twoFASetupData.config?.mode === opt.key
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="2fa-mode"
                          checked={twoFASetupData.config?.mode === opt.key}
                          onChange={async () => {
                            setSaving2FASettings(true);
                            try {
                              const res = await fetch('/api/admin/2fa/setup', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ mode: opt.key })
                              });
                              if (res.ok) {
                                setTwoFASetupData((prev: any) => ({
                                  ...prev,
                                  config: { ...prev.config, mode: opt.key }
                                }));
                                setSetupFeedback('2FA Mode updated successfully.');
                                setTimeout(() => setSetupFeedback(''), 4000);
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setSaving2FASettings(false);
                            }
                          }}
                          className="mt-0.5 accent-amber-500"
                        />
                        <div>
                          <p className="font-semibold text-white">{opt.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Recipient Email Input */}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-slate-400 font-semibold mb-1">
                      Notification Email for 2FA Codes:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        defaultValue={twoFASetupData.config?.recipientEmail || ''}
                        id="2fa-recipient-email-input"
                        placeholder="admin@itservicesfreetown.com"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const inputEl = document.getElementById('2fa-recipient-email-input') as HTMLInputElement;
                          const newEmail = inputEl?.value.trim();
                          if (!newEmail) return;
                          setSaving2FASettings(true);
                          try {
                            const res = await fetch('/api/admin/2fa/setup', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ recipientEmail: newEmail })
                            });
                            if (res.ok) {
                              setTwoFASetupData((prev: any) => ({
                                ...prev,
                                config: { ...prev.config, recipientEmail: newEmail }
                              }));
                              setSetupFeedback('2FA Recipient Email updated.');
                              setTimeout(() => setSetupFeedback(''), 4000);
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setSaving2FASettings(false);
                          }
                        }}
                        disabled={saving2FASettings}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg transition-colors text-xs"
                      >
                        Save Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-3">
                <i className="fas fa-triangle-exclamation text-amber-400 text-3xl"></i>
                <p className="text-xs text-slate-300">Unable to load 2FA configuration details.</p>
                <button
                  type="button"
                  onClick={() => void load2FASettings()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                >
                  <i className="fas fa-rotate-right mr-1.5"></i> Retry Loading 2FA Settings
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPAIR MANAGEMENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface RepairManagementProps {
  repairs: RepairSnapshot;
  onUpdate: () => void;
  statusSummary: Array<{ label: string; count: number }>;
}

function RepairManagement({ repairs, onUpdate, statusSummary }: RepairManagementProps) {
  // ── Constants ──────────────────────────────────────────────────────────────
  const CONSULTATION_FEE_COMPUTER = 50;
  const CONSULTATION_FEE_MOBILE = 30;
  const REPAIRS_PER_PAGE = 6;

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [repairPage, setRepairPage] = useState<number>(1);

  const [updateForm, setUpdateForm] = useState({
    status: '',
    paymentStatus: 'pending',
    amountPaid: '',
    diagnosticNotes: '',
    diagnosticImages: [] as string[],
  });

  // Repair line items: each row has a label + individual cost
  const [repairItems, setRepairItems] = useState<{ description: string; cost: string }[]>([]);
  const [newItem, setNewItem] = useState({ description: '', cost: '' });
  const [waiveConsultationFee, setWaiveConsultationFee] = useState<boolean>(false);

  // Reset pagination when filters change
  useEffect(() => { setRepairPage(1); }, [filterStatus, searchFilter]);

  // Keep selectedRepair in sync with fresh data when repairs update
  useEffect(() => {
    if (selectedRepair && repairs.allRepairs) {
      const updated = repairs.allRepairs.find(r => r.trackingId === selectedRepair.trackingId);
      if (updated) {
        setSelectedRepair(updated);
      }
    }
  }, [repairs.allRepairs]);

  // Determine base consultation fee by device type
  const baseConsultationFee = useMemo(() => {
    if (!selectedRepair) return 0;
    const d = (selectedRepair.deviceType || '').toLowerCase();
    if (d.includes('laptop') || d.includes('desktop') || d.includes('computer') || d.includes('pc')) {
      return CONSULTATION_FEE_COMPUTER;
    }
    return CONSULTATION_FEE_MOBILE;
  }, [selectedRepair]);

  // Active consultation fee (0 if waived)
  const consultationFee = waiveConsultationFee ? 0 : baseConsultationFee;

  const isComputer = useMemo(() => {
    if (!selectedRepair) return false;
    const d = (selectedRepair.deviceType || '').toLowerCase();
    return d.includes('laptop') || d.includes('desktop') || d.includes('computer') || d.includes('pc');
  }, [selectedRepair]);

  const itemsSubtotal = useMemo(
    () => repairItems.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0),
    [repairItems]
  );
  const grandTotal = consultationFee + itemsSubtotal;

  // When a repair is selected, populate the form
  useEffect(() => {
    if (!selectedRepair) {
      setUpdateForm({ status: '', paymentStatus: 'pending', amountPaid: '', diagnosticNotes: '', diagnosticImages: [] });
      setRepairItems([]);
      setNewItem({ description: '', cost: '' });
      setWaiveConsultationFee(false);
      return;
    }

    const images = ((selectedRepair as any).diagnosticImages ?? []).map(
      (img: any) => (typeof img === 'string' ? img : img.data)
    );

    const notes = (selectedRepair as any).notes || '';

    // ── Restore part-payment amount ────────────────────────────────────────
    let existingAmountPaid = '';
    const partMatch = notes.match(/[•\-]?\s*Part Payment Received:\s*Le\s*([\d,\.]+)/i)
      || notes.match(/Part Payment:\s*Le\s*([\d,\.]+)/i);
    if (partMatch) existingAmountPaid = partMatch[1].replace(/,/g, '');

    setUpdateForm({
      status: selectedRepair.status ?? '',
      paymentStatus: selectedRepair.paymentStatus ?? 'pending',
      amountPaid: existingAmountPaid,
      diagnosticNotes: (selectedRepair as any).diagnosticNotes ?? '',
      diagnosticImages: images,
    });

    // ── Restore waive state from consultation fee line ─────────────────────
    const feeLineWaived = /Consultation Fee[^:]*\[Waived\]/i.test(notes);
    setWaiveConsultationFee(feeLineWaived);

    // ── Restore repair line items from cost breakdown ──────────────────────
    const restoredItems: { description: string; cost: string }[] = [];
    const breakdownMarker = '--- Cost Breakdown ---';
    const idx = notes.indexOf(breakdownMarker);
    if (idx !== -1) {
      const block = notes.slice(idx + breakdownMarker.length);
      const lines = block.split('\n').map((l: string) => l.trim()).filter(Boolean);
      for (const line of lines) {
        // Skip consultation fee, part payment, balance due, and total lines
        if (/Consultation Fee/i.test(line)) continue;
        if (/Part Payment Received/i.test(line)) continue;
        if (/Balance Due/i.test(line)) continue;
        if (/^Total:/i.test(line)) continue;

        // Match: • Screen Replacement: Le 350
        const m = line.match(/^[•\-]?\s*(.+?):\s*Le\s*([\d,\.]+)$/i);
        if (m) {
          const desc = m[1].trim();
          const cost = String(parseFloat(m[2].replace(/,/g, '')));
          if (desc && cost) restoredItems.push({ description: desc, cost });
        }
      }
    }

    setRepairItems(restoredItems);
    setNewItem({ description: '', cost: '' });
  }, [selectedRepair]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const addRepairItem = () => {
    const desc = newItem.description.trim();
    const cost = newItem.cost.trim();
    if (!desc || !cost || isNaN(parseFloat(cost))) {
      alert('Enter a repair description and a valid cost.');
      return;
    }
    setRepairItems(prev => [...prev, { description: desc, cost }]);
    setNewItem({ description: '', cost: '' });
  };

  const removeRepairItem = (index: number) => {
    setRepairItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (files.length + updateForm.diagnosticImages.length > 5) {
      alert('Maximum 5 images allowed.');
      return;
    }
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} exceeds 5MB`); continue; }
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) newImages.push(ev.target.result as string); resolve(); };
        reader.readAsDataURL(file);
      });
    }
    setUpdateForm(prev => ({ ...prev, diagnosticImages: [...prev.diagnosticImages, ...newImages] }));
  };

  const saveRepair = async () => {
    if (!selectedRepair) return;
    const feeLabel = isComputer 
      ? `Consultation Fee (Computer)${waiveConsultationFee ? ' [Waived]' : ''}` 
      : `Consultation Fee (Mobile)${waiveConsultationFee ? ' [Waived]' : ''}`;
    let costBreakdown = `--- Cost Breakdown ---\n• ${feeLabel}: Le ${consultationFee.toLocaleString()}`;
    repairItems.forEach(item => {
      costBreakdown += `\n• ${item.description}: Le ${parseFloat(item.cost || '0').toLocaleString()}`;
    });

    const paidVal = parseFloat(updateForm.amountPaid) || 0;
    const balanceDue = Math.max(0, grandTotal - paidVal);

    if (updateForm.paymentStatus === 'part_payment') {
      costBreakdown += `\n• Part Payment Received: Le ${paidVal.toLocaleString()}`;
      costBreakdown += `\n• Balance Due: Le ${balanceDue.toLocaleString()}`;
    }

    costBreakdown += `\n\nTotal: Le ${grandTotal.toLocaleString()}`;

    try {
      const res = await fetch('/api/analytics/repairs/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: selectedRepair.trackingId,
          status: updateForm.status,
          paymentStatus: updateForm.paymentStatus,
          notes: costBreakdown,
          totalCost: grandTotal,
          diagnosticNotes: updateForm.diagnosticNotes,
          diagnosticImages: updateForm.diagnosticImages,
        }),
      });
      if (res.ok) {
        alert('Repair updated! Customer can now view the updated status and cost breakdown.');
        setSelectedRepair(null);
        onUpdate();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving repair');
    }
  };

  const handleDeleteRepair = async (trackingId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Delete repair ${trackingId}? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/analytics/repairs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', trackingId }),
      });
      if (res.ok) {
        try { const { deleteBooking } = await import('@/lib/unified-booking-storage'); deleteBooking(trackingId); } catch (_) {}
        alert('Repair deleted.');
        if (selectedRepair?.trackingId === trackingId) setSelectedRepair(null);
        onUpdate();
      } else { alert('Failed to delete repair'); }
    } catch (err) { console.error(err); alert('Error deleting repair'); }
  };

  const handleCancelRepair = async (trackingId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const reason = prompt(`Cancel repair ${trackingId}?\n\nEnter reason (optional):`);
    if (reason === null) return;
    try {
      const res = await fetch('/api/analytics/repairs/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId, status: 'cancelled', notes: reason || 'Cancelled by admin.' }),
      });
      if (res.ok) {
        alert('Repair cancelled.');
        if (selectedRepair?.trackingId === trackingId) setSelectedRepair(null);
        onUpdate();
      }
    } catch (err) { console.error(err); }
  };

  const filteredRepairs = useMemo(() => {
    if (!repairs.allRepairs) return [];
    return repairs.allRepairs.filter(r => {
      const matchStatus = filterStatus === 'all' || r.status === filterStatus;
      const q = searchFilter.toLowerCase();
      const matchSearch = !q
        || r.trackingId.toLowerCase().includes(q)
        || (r.customerName || '').toLowerCase().includes(q)
        || (r.deviceType || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [repairs.allRepairs, filterStatus, searchFilter]);

  const paginatedRepairs = filteredRepairs.slice(
    (repairPage - 1) * REPAIRS_PER_PAGE,
    repairPage * REPAIRS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredRepairs.length / REPAIRS_PER_PAGE);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 text-xs">

      {/* Consultation Fee Constants Banner */}
      <div className="flex flex-col sm:flex-row gap-3 bg-amber-950/30 border border-amber-700/40 rounded-xl p-4">
        <div className="flex items-center gap-2 text-amber-300 font-black text-[11px] uppercase tracking-wider shrink-0">
          <i className="fas fa-coins text-amber-400" />
          Fixed Consultation Fees
        </div>
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="flex items-center gap-2 bg-amber-900/40 border border-amber-700/50 rounded-lg px-4 py-2">
            <i className="fas fa-laptop text-amber-400 text-sm" />
            <div>
              <p className="text-[10px] text-amber-300/70 uppercase tracking-wide">Computers &amp; Laptops</p>
              <p className="font-black text-amber-300 text-sm">Le 50</p>
            </div>
            <span className="ml-1 text-[9px] bg-amber-800/50 text-amber-200 rounded px-1.5 py-0.5 font-bold uppercase">Fixed</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-900/40 border border-amber-700/50 rounded-lg px-4 py-2">
            <i className="fas fa-mobile-alt text-amber-400 text-sm" />
            <div>
              <p className="text-[10px] text-amber-300/70 uppercase tracking-wide">Mobile Phones</p>
              <p className="font-black text-amber-300 text-sm">Le 30</p>
            </div>
            <span className="ml-1 text-[9px] bg-amber-800/50 text-amber-200 rounded px-1.5 py-0.5 font-bold uppercase">Fixed</span>
          </div>
          <p className="self-center text-[10px] text-amber-300/50 italic">Auto-added to total when you select a repair.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${filterStatus === 'all' ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            All ({repairs.totalRepairs || 0})
          </button>
          {statusSummary.map(s => (
            <button
              key={s.label}
              onClick={() => setFilterStatus(s.label.replace(/ /g, '-'))}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize whitespace-nowrap transition-all shrink-0 ${filterStatus === s.label.replace(/ /g, '-') ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>
        <div className="relative shrink-0">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, name, device..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full sm:w-60 bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Two-Column Layout: List + Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Repairs List */}
        <div className="lg:col-span-2 space-y-2">
          {paginatedRepairs.length > 0 ? paginatedRepairs.map(repair => (
            <div
              key={repair.trackingId}
              onClick={() => setSelectedRepair(repair)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedRepair?.trackingId === repair.trackingId
                  ? 'bg-red-600/10 border-red-600/40 shadow-md'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{repair.trackingId}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  repair.status === 'collected' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : repair.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : repair.status === 'ready-for-pickup' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : repair.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {repair.status ? repair.status.replace(/-/g, ' ') : 'Pending'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                <div><span className="block text-[10px] text-slate-500 uppercase">Customer</span><span className="font-medium text-slate-200">{repair.customerName || 'N/A'}</span></div>
                <div><span className="block text-[10px] text-slate-500 uppercase">Device</span><span className="font-medium text-slate-200">{repair.deviceType || 'N/A'}</span></div>
                <div><span className="block text-[10px] text-slate-500 uppercase">Total Cost</span><span className="font-medium text-red-400">{repair.totalCost ? `Le ${repair.totalCost.toLocaleString()}` : 'Not set'}</span></div>
                <div><span className="block text-[10px] text-slate-500 uppercase">Payment</span><span className={`font-semibold capitalize ${repair.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>{repair.paymentStatus || 'Pending'}</span></div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-500">
                <span className="truncate max-w-xs">{repair.issueSummary || 'No description'}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button onClick={e => handleCancelRepair(repair.trackingId, e)} className="text-amber-400 hover:underline">Cancel</button>
                  <span>&bull;</span>
                  <button onClick={e => handleDeleteRepair(repair.trackingId, e)} className="text-rose-400 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500">
              No repairs match your filter.
            </div>
          )}

          {/* Pagination */}
          {filteredRepairs.length > REPAIRS_PER_PAGE && (
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Page {repairPage} of {totalPages} ({filteredRepairs.length} total)</span>
              <div className="flex gap-2">
                <button onClick={() => setRepairPage(p => Math.max(1, p - 1))} disabled={repairPage === 1} className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold text-[11px] rounded-lg">Prev</button>
                <button onClick={() => setRepairPage(p => Math.min(totalPages, p + 1))} disabled={repairPage === totalPages} className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold text-[11px] rounded-lg">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Edit Inspector Panel ── */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 overflow-y-auto max-h-[88vh]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">
              {selectedRepair ? `Edit · ${selectedRepair.trackingId}` : 'Select a Repair'}
            </h3>
            {selectedRepair && (
              <button onClick={() => setSelectedRepair(null)} className="text-xs text-rose-400 hover:underline">Clear</button>
            )}
          </div>

          {selectedRepair ? (
            <div className="space-y-4">

              {/* Repair Status */}
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] uppercase tracking-wide">Repair Status</label>
                <select
                  value={updateForm.status}
                  onChange={e => setUpdateForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="received">Received</option>
                  <option value="diagnosed">Diagnosed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="ready-for-pickup">Ready for Pickup</option>
                  <option value="collected">Collected (Customer Picked Up)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] uppercase tracking-wide font-bold">Payment Status</label>
                <select
                  value={updateForm.paymentStatus}
                  onChange={e => setUpdateForm(p => ({ ...p, paymentStatus: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500 font-semibold"
                >
                  <option value="pending">Pending (Unpaid)</option>
                  <option value="part_payment">Part Payment (Deposit)</option>
                  <option value="paid">Paid (Fully Paid)</option>
                </select>
              </div>

              {/* Part Payment Input & Live Calculation */}
              {updateForm.paymentStatus === 'part_payment' && (
                <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <label className="block text-amber-300 text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                      <i className="fas fa-coins text-amber-400 text-xs" />
                      Part Payment Amount Received (Le)
                    </label>
                    <span className="text-[10px] text-amber-300/70 font-mono font-bold">
                      Total: Le {grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 200"
                    value={updateForm.amountPaid}
                    onChange={e => setUpdateForm(p => ({ ...p, amountPaid: e.target.value }))}
                    className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  {grandTotal > 0 && (
                    <div className="flex items-center justify-between text-[11px] bg-slate-900/90 rounded-lg px-3 py-2 border border-slate-800">
                      <span className="text-emerald-400 font-semibold">
                        Paid: Le {(parseFloat(updateForm.amountPaid) || 0).toLocaleString()}
                      </span>
                      <span className="text-amber-400 font-black font-mono">
                        Balance Due: Le {Math.max(0, grandTotal - (parseFloat(updateForm.amountPaid) || 0)).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Repair Cost Builder ── */}
              <div className="rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-700 flex items-center gap-2">
                  <i className="fas fa-calculator text-red-400" />
                  <span className="font-bold text-white text-[11px] uppercase tracking-wide">Repair Cost Builder</span>
                </div>
                <div className="p-4 space-y-2.5">

                  {/* Consultation Fee Row (With Waive / Maintain Toggle) */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-2.5 gap-2 transition-all ${
                    waiveConsultationFee
                      ? 'bg-emerald-950/40 border-emerald-700/50'
                      : 'bg-amber-950/40 border-amber-700/40'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <i className={`fas ${isComputer ? 'fa-laptop' : 'fa-mobile-alt'} ${waiveConsultationFee ? 'text-emerald-400' : 'text-amber-400'} text-xs`} />
                      <span className={`${waiveConsultationFee ? 'text-emerald-200' : 'text-amber-200'} font-semibold text-[11px]`}>
                        Consultation Fee ({isComputer ? 'Computer' : 'Mobile'})
                      </span>
                      <span className={`text-[9px] rounded px-1.5 py-0.5 font-bold uppercase ${
                        waiveConsultationFee 
                          ? 'bg-emerald-800/60 text-emerald-200 border border-emerald-600/40' 
                          : 'bg-amber-800/50 text-amber-200'
                      }`}>
                        {waiveConsultationFee ? 'Waived' : 'Fixed'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <span className={`font-black text-xs whitespace-nowrap ${
                        waiveConsultationFee ? 'text-emerald-400 line-through opacity-70' : 'text-amber-300'
                      }`}>
                        Le {consultationFee.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setWaiveConsultationFee(!waiveConsultationFee)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all shadow-sm flex items-center gap-1.5 shrink-0 ${
                          waiveConsultationFee
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-900/50'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        }`}
                        title={waiveConsultationFee ? "Click to maintain consultation fee" : "Click to waive consultation fee"}
                      >
                        <i className={`fas ${waiveConsultationFee ? 'fa-check-circle' : 'fa-tag'}`} />
                        {waiveConsultationFee ? 'Waived (Le 0)' : 'Waive Fee'}
                      </button>
                    </div>
                  </div>

                  {/* Repair Line Items */}
                  {repairItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <i className="fas fa-wrench text-red-400 text-[10px] shrink-0" />
                        <span className="text-slate-200 text-[11px] truncate">{item.description}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-red-400 text-xs whitespace-nowrap">Le {parseFloat(item.cost || '0').toLocaleString()}</span>
                        <button
                          onClick={() => removeRepairItem(index)}
                          className="text-rose-500 hover:text-rose-300 transition-colors"
                          title="Remove"
                        >
                          <i className="fas fa-times text-[10px]" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Repair Line */}
                  <div className="pt-1 space-y-1.5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">+ Add Repair Type</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Screen replacement"
                        value={newItem.description}
                        onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addRepairItem()}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[11px] focus:outline-none focus:border-red-500 min-w-0"
                      />
                      <input
                        type="number"
                        placeholder="Le cost"
                        value={newItem.cost}
                        onChange={e => setNewItem(prev => ({ ...prev, cost: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addRepairItem()}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[11px] focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={addRepairItem}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg transition-colors shrink-0"
                      >
                        <i className="fas fa-plus" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 italic">Press Enter or + to add. You can add as many repair types as needed.</p>
                  </div>

                  {/* Grand Total */}
                  <div className="flex items-center justify-between border-t border-slate-700 pt-3 mt-1">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Grand Total</p>
                      <p className="text-[10px] text-slate-600">Consultation + {repairItems.length} repair line{repairItems.length !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="font-black text-emerald-400 text-lg">Le {grandTotal.toLocaleString()}</span>
                  </div>

                </div>
              </div>

              {/* Diagnostic Notes */}
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] uppercase tracking-wide">Diagnostic Notes for Customer</label>
                <textarea
                  rows={3}
                  value={updateForm.diagnosticNotes}
                  onChange={e => setUpdateForm(p => ({ ...p, diagnosticNotes: e.target.value }))}
                  placeholder="e.g. Screen replaced. Board tested OK."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Customer Comments Display */}
              {((selectedRepair as any)?.customerComments || []).length > 0 && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-comments text-amber-400" />
                      Customer Comments ({((selectedRepair as any)?.customerComments || []).length})
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {((selectedRepair as any)?.customerComments || []).map((cmt: any) => (
                      <div key={cmt.id} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px]">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-1 font-semibold">
                          <span className="text-amber-300">{cmt.authorName}</span>
                          <span>{new Date(cmt.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                        <p className="text-slate-200 text-xs whitespace-pre-wrap">{cmt.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Images */}
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] uppercase tracking-wide">Diagnostic Images (max 5)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-red-600/20 file:text-red-400 file:font-semibold cursor-pointer"
                />
                {updateForm.diagnosticImages.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {updateForm.diagnosticImages.map((img, i) => (
                      <img key={i} src={img} className="w-12 h-12 object-cover rounded-lg border border-slate-800 shrink-0" alt={`Diagnostic ${i + 1}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={saveRepair}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition-colors shadow-lg shadow-red-900/30"
              >
                <i className="fas fa-paper-plane mr-2" />
                Save &amp; Publish Update to Customer
              </button>
            </div>
          ) : (
            <div className="py-16 text-center">
              <i className="fas fa-mouse-pointer text-slate-700 text-2xl mb-3 block" />
              <p className="text-slate-500 text-xs">Click any repair on the left to set status, build costs, or upload diagnostic photos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

