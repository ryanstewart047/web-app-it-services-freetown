'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

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
}

interface RepairSnapshot {
  totalRepairs?: number;
  statusCounts?: Record<string, number>;
  averageCompletionDays?: number;
  totalRevenue?: number;
  allRepairs?: RepairRecord[];
}

interface AdminPanelItem {
  id: string;
  name: string;
  category: 'overview' | 'ecommerce' | 'services' | 'marketing';
  description: string;
  icon: string;
  color: string;
  url: string;
  badge?: string;
}

const ADMIN_PANELS: AdminPanelItem[] = [
  // Overview
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'overview',
    description: 'Overview & analytics',
    icon: 'fas fa-tachometer-alt',
    color: 'text-cyan-400',
    url: '/admin',
  },
  {
    id: 'banner-admin',
    name: 'Global Banner',
    category: 'overview',
    description: 'Site announcements',
    icon: 'fas fa-bullhorn',
    color: 'text-red-400',
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
    color: 'text-emerald-400',
    url: '/admin/add-product',
  },
  {
    id: 'bulk-upload',
    name: 'Bulk Upload',
    category: 'ecommerce',
    description: 'Upload multiple products',
    icon: 'fas fa-file-upload',
    color: 'text-teal-400',
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
    color: 'text-green-400',
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
    color: 'text-yellow-400',
    url: '/ads-admin',
  },
  // Services & Community
  {
    id: 'bookings',
    name: 'Bookings',
    category: 'services',
    description: 'Service appointments',
    icon: 'fas fa-calendar-check',
    color: 'text-red-400',
    url: '/admin/bookings',
  },
  {
    id: 'forum-admin',
    name: 'Forum Admin',
    category: 'services',
    description: 'Manage technicians',
    icon: 'fas fa-users-gear',
    color: 'text-indigo-400',
    url: '/api/forum/admin/bridge',
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
  const [deleting, setDeleting] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // Master Hub State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [iframeLoading, setIframeLoading] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

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
        console.log('[Admin] Auto-logout due to inactivity');
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

      const [analyticsRes, formsRes, repairsRes] = await Promise.all([
        fetch('/api/analytics/visitor/'),
        fetch('/api/analytics/forms/'),
        fetch('/api/analytics/repairs/'),
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (formsRes.ok) setForms(await formsRes.json());
      if (repairsRes.ok) setRepairs(await repairsRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-lock text-emerald-400 text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">IT Services Freetown</h1>
            <p className="text-emerald-400 font-medium text-sm mt-1">Master Admin Operations Portal</p>
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
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
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
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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
            Secure SSL Encrypted &bull; EARPI & IT Services Freetown
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Idle Warning Bar */}
      {showIdleWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 text-center text-sm flex items-center justify-center gap-2 shadow-lg">
          <i className="fas fa-clock animate-bounce"></i>
          <span>Session will expire in 30 seconds due to inactivity! Move your mouse or click to stay logged in.</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isSidebarOpen ? 'w-full md:w-72' : 'w-full md:w-20'
        } bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 z-30`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center justify-center shrink-0">
              <i className="fas fa-shield-alt text-emerald-400 text-lg"></i>
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <h2 className="font-bold text-white text-sm leading-tight truncate">Master Admin Console</h2>
                <p className="text-xs text-emerald-400 truncate">Freetown IT Services</p>
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
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                placeholder="Search panels..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          {/* Overview Section */}
          <div>
            {isSidebarOpen && (
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
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
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
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
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
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
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
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
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
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
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
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
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
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
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
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
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className={`w-full flex items-center ${
              isSidebarOpen ? 'justify-start px-3' : 'justify-center px-0'
            } py-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 text-xs transition-colors`}
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
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
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
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="Pop out into full tab"
            >
              <i className="fas fa-arrow-up-right-from-square"></i>
              <span className="hidden sm:inline">Pop Out</span>
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
            /* Native Overview & Analytics Panel */
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              {/* Analytics Snapshot Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Visitors</span>
                    <i className="fas fa-users text-cyan-400 text-lg"></i>
                  </div>
                  <div className="text-2xl font-bold text-white">{analytics.totalVisitors || 0}</div>
                  <p className="text-xs text-slate-500 mt-1">Unique: {analytics.uniqueVisitors || 0}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Total Repairs & Bookings</span>
                    <i className="fas fa-tools text-emerald-400 text-lg"></i>
                  </div>
                  <div className="text-2xl font-bold text-white">{repairs.totalRepairs || 0}</div>
                  <p className="text-xs text-emerald-400 mt-1">Revenue: ${repairs.totalRevenue || 0}</p>
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
                    <span className="text-xs font-medium text-slate-400">Bounce Rate</span>
                    <i className="fas fa-chart-line text-purple-400 text-lg"></i>
                  </div>
                  <div className="text-2xl font-bold text-white">{analytics.bounceRate || 0}%</div>
                  <p className="text-xs text-slate-500 mt-1">Avg Session: {analytics.avgSessionDuration || 0}s</p>
                </div>
              </div>

              {/* Quick Navigation Panels Grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <i className="fas fa-grid-2 text-emerald-400"></i> All Operational Panels
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {ADMIN_PANELS.filter(p => p.id !== 'dashboard').map(panel => (
                    <button
                      key={panel.id}
                      onClick={() => handleTabChange(panel.id)}
                      className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all hover:scale-[1.02] group"
                    >
                      <i className={`${panel.icon} ${panel.color} text-xl mb-2 block group-hover:scale-110 transition-transform`}></i>
                      <h4 className="font-semibold text-white text-xs truncate">{panel.name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5 truncate">{panel.description}</p>
                    </button>
                  ))}
                </div>
              </div>

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
            /* Embedded High-Performance Workspace Frame for Other Panels */
            <div className="w-full h-full relative min-h-[calc(100vh-64px)] bg-slate-950">
              {iframeLoading && (
                <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-semibold text-white">Loading {activePanelObj.name} Workspace...</p>
                  <p className="text-xs text-slate-400 mt-1">Connecting to {activePanelObj.url}</p>
                </div>
              )}
              <iframe
                key={`${activeTab}-${iframeKey}`}
                src={activePanelObj.url}
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
