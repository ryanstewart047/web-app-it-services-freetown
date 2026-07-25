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

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

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
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const { cleanupOldImages, getAllBookings } = await import('@/lib/unified-booking-storage');
        cleanupOldImages();

        const localBookings = getAllBookings();
        if (localBookings.length > 0) {
          const apiResponse = await fetch('/api/analytics/repairs/');
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

      const [analyticsRes, formsRes, repairsRes, ordersRes] = await Promise.all([
        fetch('/api/analytics/visitor/'),
        fetch('/api/analytics/forms/'),
        fetch('/api/analytics/repairs/'),
        fetch('/api/orders'),
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
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
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

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* Subtle background grid */}
        <div className="absolute inset-0 bg-slate-950/80 pointer-events-none" />

        <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-700/60 rounded-3xl p-8 shadow-2xl backdrop-blur">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/30">
              <i className="fas fa-shield-halved text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">IT Services Freetown</h1>
            <p className="text-red-400 font-medium text-sm mt-1">Master Admin Operations Portal</p>
            <p className="text-slate-500 text-xs mt-1">Freetown · Sierra Leone</p>
          </div>

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
                  <i className="fas fa-circle-notch fa-spin mr-2"></i> Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <i className="fas fa-shield-halved mr-2"></i> Unlock Master Console
                </span>
              )}
            </button>
          </form>
          <div className="mt-8 text-center text-xs text-slate-500">
            Secure SSL Encrypted &bull; EARPI &amp; IT Services Freetown
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
            <div className="w-10 h-10 bg-red-600/20 border border-red-600/40 rounded-xl flex items-center justify-center shrink-0">
              <i className="fas fa-shield-alt text-red-400 text-lg"></i>
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <h2 className="font-bold text-white text-sm leading-tight truncate">Master Admin Hub</h2>
                <p className="text-xs text-red-400 truncate">IT Services Freetown</p>
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
          <Link
            href="/"
            target="_blank"
            className={`w-full flex items-center ${
              isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
            } py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/50 text-xs transition-colors`}
          >
            <i className={`fas fa-external-link-alt ${isSidebarOpen ? 'mr-2' : ''}`}></i>
            {isSidebarOpen && <span>View Public Site</span>}
          </Link>
          <button
            onClick={handleLogout}
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
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => setIframeKey(prev => prev + 1)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                title="Reload Panel Workspace"
              >
                <i className="fas fa-arrows-rotate"></i>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
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
                    onClick={loadData}
                    className="px-3 py-1.5 bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600/20 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                  >
                    <i className="fas fa-sync-alt"></i> Refresh Repairs
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
                    onClick={loadData}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <i className="fas fa-sync-alt"></i> Refresh Data
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
  const [selectedRepair, setSelectedRepair] = useState<RepairRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [repairPage, setRepairPage] = useState<number>(1);
  const REPAIRS_PER_PAGE = 6;

  // Reset pagination when filter/search changes
  useEffect(() => {
    setRepairPage(1);
  }, [filterStatus, searchFilter]);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    paymentStatus: '',
    notes: '',
    totalCost: '',
    diagnosticNotes: '',
    diagnosticImages: [] as string[],
  });
  const [repairItems, setRepairItems] = useState<{ description: string; cost: string }[]>([]);
  const [newRepairItem, setNewRepairItem] = useState({ description: '', cost: '' });

  // Auto-calculate totalCost from repairItems
  useEffect(() => {
    if (repairItems.length > 0) {
      const sum = repairItems.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
      setUpdateForm(prev => ({ ...prev, totalCost: sum > 0 ? String(sum) : '' }));
    }
  }, [repairItems]);

  useEffect(() => {
    if (!selectedRepair) {
      setUpdateForm({ status: '', paymentStatus: '', notes: '', totalCost: '', diagnosticNotes: '', diagnosticImages: [] });
      setRepairItems([]);
      setNewRepairItem({ description: '', cost: '' });
      return;
    }

    const images = (selectedRepair as any).diagnosticImages ?? [];
    const imageData = images.map((img: any) => typeof img === 'string' ? img : img.data);

    setUpdateForm({
      status: selectedRepair.status ?? '',
      paymentStatus: selectedRepair.paymentStatus ?? 'pending',
      notes: selectedRepair.issueSummary ?? '',
      totalCost: selectedRepair.totalCost ? String(selectedRepair.totalCost) : '',
      diagnosticNotes: (selectedRepair as any).diagnosticNotes ?? '',
      diagnosticImages: imageData,
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
          paymentStatus: updateForm.paymentStatus,
          notes: repairItems.length > 0
            ? (updateForm.notes ? updateForm.notes + '\n\n' : '') +
              '--- Cost Breakdown ---\n' +
              repairItems.map(item => `• ${item.description}: Le ${parseFloat(item.cost || '0').toLocaleString()}`).join('\n') +
              `\nTotal: Le ${repairItems.reduce((s, i) => s + (parseFloat(i.cost) || 0), 0).toLocaleString()}`
            : updateForm.notes,
          totalCost: updateForm.totalCost ? parseFloat(updateForm.totalCost) : undefined,
          diagnosticNotes: updateForm.diagnosticNotes,
          diagnosticImages: updateForm.diagnosticImages,
        }),
      });

      if (response.ok) {
        alert('Repair updated successfully! Customer can now view updated status and notes.');
        setSelectedRepair(null);
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to update repair: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating repair:', err);
      alert('Error updating repair');
    }
  };

  const handleDeleteRepair = async (trackingId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Permanently delete repair ${trackingId}? This cannot be undone.`)) return;

    try {
      const response = await fetch('/api/analytics/repairs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', trackingId }),
      });

      if (response.ok) {
        try {
          const { deleteBooking } = await import('@/lib/unified-booking-storage');
          deleteBooking(trackingId);
        } catch (_) {}

        alert('Repair deleted.');
        if (selectedRepair?.trackingId === trackingId) setSelectedRepair(null);
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to delete repair: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting repair:', err);
      alert('Error deleting repair');
    }
  };

  const handleCancelRepair = async (trackingId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const reason = prompt(`Cancel repair ${trackingId}?\n\nEnter cancellation reason:`);
    if (reason === null) return;

    try {
      const response = await fetch('/api/analytics/repairs/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId,
          status: 'cancelled',
          notes: reason || 'Repair cancelled by admin.',
        }),
      });

      if (response.ok) {
        alert('Repair cancelled.');
        if (selectedRepair?.trackingId === trackingId) setSelectedRepair(null);
        onUpdate();
      }
    } catch (err) {
      console.error('Error cancelling repair:', err);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxImages = 5;
    if (files.length + updateForm.diagnosticImages.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} exceeds 5MB limit`);
        continue;
      }

      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (e) => {
          if (e.target?.result) newImages.push(e.target.result as string);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    setUpdateForm(prev => ({
      ...prev,
      diagnosticImages: [...prev.diagnosticImages, ...newImages],
    }));
  };

  const filteredRepairs = useMemo(() => {
    if (!repairs.allRepairs) return [];
    return repairs.allRepairs.filter(r => {
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      const q = searchFilter.toLowerCase();
      const matchesSearch =
        !q ||
        r.trackingId.toLowerCase().includes(q) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.deviceType && r.deviceType.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [repairs.allRepairs, filterStatus, searchFilter]);

  return (
    <div className="space-y-6 text-xs">
      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All ({repairs.totalRepairs || 0})
          </button>
          {statusSummary.map(s => (
            <button
              key={s.label}
              onClick={() => setFilterStatus(s.label.replace(/ /g, '-'))}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all shrink-0 ${
                filterStatus === s.label.replace(/ /g, '-')
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {s.label} ({s.count})
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
          <input
            type="text"
            placeholder="Search repairs by ID, customer, device..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full sm:w-64 bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Repairs Table & Edit Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repairs List */}
        <div className="lg:col-span-2 space-y-2">
          {filteredRepairs.length > 0 ? (
            filteredRepairs
              .slice((repairPage - 1) * REPAIRS_PER_PAGE, repairPage * REPAIRS_PER_PAGE)
              .map((repair) => (
              <div
                key={repair.trackingId}
                onClick={() => setSelectedRepair(repair)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedRepair?.trackingId === repair.trackingId
                    ? 'bg-red-600/10 border-red-600/40 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">{repair.trackingId}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    repair.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : repair.status === 'cancelled'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {repair.status || 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Customer</span>
                    <span className="font-medium text-slate-200">{repair.customerName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Device</span>
                    <span className="font-medium text-slate-200">{repair.deviceType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Estimated Cost</span>
                    <span className="font-medium text-red-400">
                      {repair.totalCost ? `Le ${repair.totalCost.toLocaleString()}` : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase">Payment</span>
                    <span className={`font-semibold capitalize ${
                      repair.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {repair.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-500">
                  <span className="truncate max-w-md">{repair.issueSummary || 'No notes'}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleCancelRepair(repair.trackingId, e)}
                      className="text-amber-400 hover:underline"
                    >
                      Cancel
                    </button>
                    <span>&bull;</span>
                    <button
                      onClick={(e) => handleDeleteRepair(repair.trackingId, e)}
                      className="text-rose-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 bg-slate-950 border border-slate-800 rounded-xl text-center text-slate-500">
              No repairs match your search or filter.
            </div>
          )}

          {/* Repair Pagination Controls */}
          {filteredRepairs.length > REPAIRS_PER_PAGE && (
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 mt-2">
              <span className="text-[11px] text-slate-400">
                Page {repairPage} of {Math.ceil(filteredRepairs.length / REPAIRS_PER_PAGE)} ({filteredRepairs.length} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRepairPage(p => Math.max(1, p - 1))}
                  disabled={repairPage === 1}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold text-[11px] rounded-lg transition-colors"
                >
                  Prev
                </button>
                <button
                  onClick={() => setRepairPage(p => Math.min(Math.ceil(filteredRepairs.length / REPAIRS_PER_PAGE), p + 1))}
                  disabled={repairPage === Math.ceil(filteredRepairs.length / REPAIRS_PER_PAGE)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-bold text-[11px] rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Repair Inspector & Edit Form */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">
              {selectedRepair ? `Edit Repair ${selectedRepair.trackingId}` : 'Select a Repair to Edit'}
            </h3>
            {selectedRepair && (
              <button
                onClick={() => setSelectedRepair(null)}
                className="text-xs text-rose-400 hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          {selectedRepair ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Repair Status</label>
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
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Payment Status</label>
                <select
                  value={updateForm.paymentStatus}
                  onChange={e => setUpdateForm(p => ({ ...p, paymentStatus: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Total Estimated Cost (Le)</label>
                <input
                  type="number"
                  value={updateForm.totalCost}
                  onChange={e => setUpdateForm(p => ({ ...p, totalCost: e.target.value }))}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Diagnostic Notes for Customer</label>
                <textarea
                  rows={3}
                  value={updateForm.diagnosticNotes}
                  onChange={e => setUpdateForm(p => ({ ...p, diagnosticNotes: e.target.value }))}
                  placeholder="e.g. Screen replaced. Internal board tested OK."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px]">Upload Diagnostic Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-red-600/20 file:text-red-400 file:font-semibold"
                />
                {updateForm.diagnosticImages.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {updateForm.diagnosticImages.map((img, i) => (
                      <img key={i} src={img} className="w-12 h-12 object-cover rounded-lg border border-slate-800" />
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={updateRepair}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors shadow"
              >
                Save & Publish Update to Customer
              </button>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-12 text-xs">
              Click any repair on the left to edit status, set repair costs, or upload photos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
