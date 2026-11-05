'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl: string;
  size: string;
  active: boolean;
  disabledWebsites?: string[];
  impressions: number;
  clicks: number;
  createdAt: string;
}

interface WebsiteData {
  domain: string;
  globalEnabled: boolean;
  totalImpressions: number;
  totalClicks: number;
  lastSeenAt: string;
  adRules: Record<string, boolean>; // adId -> enabled
}

export default function AdsAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ads' | 'websites'>('ads');
  const [ads, setAds] = useState<Ad[]>([]);
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  // Modal for managing websites for a specific ad
  const [selectedAdForWebsites, setSelectedAdForWebsites] = useState<Ad | null>(null);
  const [newDomainInput, setNewDomainInput] = useState('');
  
  // New website manual add form
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState(false);
  const [manualWebsiteInput, setManualWebsiteInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    size: 'rectangle',
    active: true,
    disabledWebsites: [] as string[]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchAds(), fetchWebsites()]);
    setLoading(false);
  };

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setAds(data);
      }
    } catch (err) {
      console.error('Failed to load ads:', err);
      setError('Failed to load ads.');
    }
  };

  const fetchWebsites = async () => {
    try {
      const res = await fetch('/api/ads/websites');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.websites)) {
          setWebsites(data.websites);
        }
      }
    } catch (err) {
      console.error('Failed to load websites:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const method = editingAd ? 'PUT' : 'POST';
      const body = editingAd ? { ...formData, id: editingAd.id } : formData;

      const res = await fetch('/api/ads', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchAds();
        await fetchWebsites();
        setShowForm(false);
        setEditingAd(null);
        setFormData({ title: '', description: '', imageUrl: '', targetUrl: '', size: 'rectangle', active: true, disabledWebsites: [] });
        showNotification('Ad saved successfully!');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save ad.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description || '',
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl,
      size: ad.size || 'rectangle',
      active: ad.active,
      disabledWebsites: ad.disabledWebsites || []
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      const nextActive = !ad.active;
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ad.id,
          active: nextActive
        }),
      });

      if (res.ok) {
        setAds(prev => prev.map(item => item.id === ad.id ? { ...item, active: nextActive } : item));
        showNotification(`Ad ${nextActive ? 'enabled' : 'disabled'} successfully!`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to toggle ad status.');
      }
    } catch (err) {
      alert('Network error while toggling ad.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad? It will stop displaying across all websites.')) return;

    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAds();
        await fetchWebsites();
        showNotification('Ad deleted successfully.');
      }
    } catch (err) {
      alert('Failed to delete ad.');
    }
  };

  // Toggle specific ad for a website
  const handleToggleAdForWebsite = async (domain: string, adId: string, currentEnabled: boolean) => {
    try {
      const nextEnabled = !currentEnabled;
      const res = await fetch('/api/ads/websites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          adId,
          enabled: nextEnabled
        })
      });

      if (res.ok) {
        // Refresh local state
        await fetchAds();
        await fetchWebsites();
        showNotification(`Ad ${nextEnabled ? 'enabled' : 'disabled'} for ${domain}`);
      } else {
        alert('Failed to update website setting.');
      }
    } catch (err) {
      alert('Network error updating website setting.');
    }
  };

  // Toggle entire website global status
  const handleToggleWebsiteGlobal = async (domain: string, currentGlobalEnabled: boolean) => {
    try {
      const nextEnabled = !currentGlobalEnabled;
      const res = await fetch('/api/ads/websites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          enabled: nextEnabled
        })
      });

      if (res.ok) {
        await fetchWebsites();
        showNotification(`All ads ${nextEnabled ? 'enabled' : 'disabled'} on ${domain}`);
      } else {
        alert('Failed to update website status.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  // Add website domain manually for a specific ad
  const handleAddWebsiteForAd = async (ad: Ad) => {
    const domain = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!domain) return;

    try {
      const res = await fetch('/api/ads/websites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          adId: ad.id,
          enabled: false // By default when added here, it is disabled for this ad
        })
      });

      if (res.ok) {
        setNewDomainInput('');
        await fetchAds();
        await fetchWebsites();
        showNotification(`Disabled "${ad.title}" on ${domain}`);
      }
    } catch (err) {
      alert('Failed to add website rule.');
    }
  };

  // Add website domain globally
  const handleAddWebsiteGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    const domain = manualWebsiteInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!domain) return;

    try {
      const res = await fetch('/api/ads/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, enabled: true })
      });

      if (res.ok) {
        setManualWebsiteInput('');
        setShowAddWebsiteModal(false);
        await fetchWebsites();
        showNotification(`Website ${domain} added.`);
      }
    } catch (err) {
      alert('Failed to add website.');
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
      </div>
    );
  }

  // Calculate network totals
  const totalImpressions = ads.reduce((acc, ad) => acc + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, ad) => acc + (ad.clicks || 0), 0);

  const productionCode = `<div class="its-ad-unit"></div>\n<script src="https://itservicesfreetown.com/js/its-ads.js"></script>`;
  const localTestCode = `<div class="its-ad-unit"></div>\n<script src="http://localhost:3000/js/its-ads.js"></script>`;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-2xl border border-gray-700 animate-fade-in flex items-center gap-2">
          <span className="text-emerald-400">✓</span> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Ad Network Manager</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-gray-50 sm:text-3xl tracking-tight">
            Ads &amp; Website Distribution
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Control which ads run on external websites and easily toggle ads on/off per website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAd(null);
              setFormData({ title: '', description: '', imageUrl: '', targetUrl: '', size: 'rectangle', active: true, disabledWebsites: [] });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow"
          >
            {showForm ? 'Cancel Form' : '+ Create New Ad'}
          </button>
          <a
            href="/admin"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ← Admin
          </a>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ads</p>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{ads.length}</p>
          <p className="mt-1 text-[11px] text-gray-400">{ads.filter(a => a.active).length} Active</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Partner Sites</p>
          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">{websites.length}</p>
          <p className="mt-1 text-[11px] text-gray-400">Connected</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Impressions</p>
          <p className="mt-1 text-2xl font-black text-red-600">{totalImpressions.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-gray-400">Views served</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Clicks</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{totalClicks.toLocaleString()}</p>
          <p className="mt-1 text-[11px] text-gray-400">{totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0}% CTR</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
            activeTab === 'ads'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <span>🎯 Your Advertisements</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {ads.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('websites')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
            activeTab === 'websites'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <span>🌐 Connected Websites &amp; Placements</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {websites.length}
          </span>
        </button>
      </div>

      {/* Ad Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
            </h3>
            <span className="text-xs text-gray-400">All fields marked * are required</span>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g. Free PC Diagnostic & Health Check"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Destination URL *</label>
              <input
                type="text"
                required
                value={formData.targetUrl}
                onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://itservicesfreetown.com/book-appointment"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Banner Image URL *</label>
              <input
                type="text"
                required
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://example.com/images/banner.jpg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Format / Dimensions *</label>
              <select
                value={formData.size}
                onChange={e => setFormData({ ...formData, size: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="rectangle">Rectangle Banner (16:9)</option>
                <option value="square">Square Box (1:1)</option>
                <option value="leaderboard">Leaderboard (Wide Horizontal)</option>
                <option value="skyscraper">Skyscraper (Tall Vertical, 9:16)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={2}
              placeholder="Short catchy tagline or service description..."
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={e => setFormData({ ...formData, active: e.target.checked })}
              className="h-5 w-5 rounded text-red-600 focus:ring-red-500 border-gray-300"
            />
            <div>
              <label htmlFor="active" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                Global Status: {formData.active ? 'Active (Displaying on network)' : 'Paused (Disabled everywhere)'}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                When unchecked, this ad is disabled globally and will not display on any website.
              </p>
            </div>
          </div>

          {/* Live Preview */}
          <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Live Preview ({formData.size})
            </h4>
            <div className="w-full">
              <div className={`group/ad relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 ${
                formData.size === 'square' ? 'max-w-[320px] mx-auto' :
                formData.size === 'skyscraper' ? 'max-w-[280px] mx-auto' :
                formData.size === 'leaderboard' ? 'w-full flex flex-col sm:flex-row items-stretch' : 'max-w-md mx-auto'
              }`}>
                <div className="absolute top-2 right-2 z-20 flex items-center bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-full px-1.5 py-0.5 shadow-xs">
                  <span className="text-xs font-bold text-gray-500 font-mono w-3.5 h-3.5 flex items-center justify-center">i</span>
                  <span className="text-[11px] font-semibold text-gray-700 ml-1.5">Ads by BridgeTech</span>
                </div>

                <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden ${
                  formData.size === 'square' ? 'aspect-square w-full' :
                  formData.size === 'skyscraper' ? 'aspect-[9/16] w-full max-h-[360px]' :
                  formData.size === 'leaderboard' ? 'sm:w-2/5 aspect-[21/9] sm:aspect-auto' : 'aspect-video w-full'
                }`}>
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Ad Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-4">Banner preview</div>
                  )}
                </div>

                <div className={`p-4 flex flex-col justify-center ${formData.size === 'leaderboard' ? 'sm:w-3/5' : 'w-full'}`}>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {formData.title || 'Your Ad Title'}
                  </h4>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {formData.description || 'Description will appear here...'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sponsored</span>
                    <span className="text-xs font-semibold text-red-600">Learn More →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-600 font-medium">❌ {error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {saving ? 'Saving...' : editingAd ? 'Update Ad' : 'Publish Ad'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAd(null);
              }}
              className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* TAB 1: ADS LIST */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Advertisements</h3>
              <p className="text-xs text-gray-500">Manage your promotions and their website targeting.</p>
            </div>
          </div>

          {ads.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-500 dark:border-gray-800">
              <p className="text-sm">No ads created yet. Click "+ Create New Ad" above to get started.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {ads.map(ad => {
                const disabledCount = ad.disabledWebsites ? ad.disabledWebsites.length : 0;
                
                return (
                  <div key={ad.id} className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
                    <div>
                      {/* Image Banner */}
                      <div className={`w-full bg-gray-100 dark:bg-gray-800 ${
                        ad.size === 'square' ? 'aspect-square max-w-[200px] mx-auto mt-4 rounded-2xl overflow-hidden' :
                        ad.size === 'skyscraper' ? 'aspect-[9/16] max-w-[160px] mx-auto mt-4 rounded-2xl overflow-hidden max-h-[220px]' :
                        ad.size === 'leaderboard' ? 'aspect-[21/9]' : 'aspect-video'
                      }`}>
                        <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover" />
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{ad.title}</h4>
                            <p className="text-xs text-gray-500 truncate mt-0.5" title={ad.targetUrl}>
                              Target: <span className="text-blue-600 dark:text-blue-400">{ad.targetUrl}</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              ad.active 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}>
                              {ad.active ? '● Active' : '○ Paused'}
                            </span>
                            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              {ad.size || 'rectangle'}
                            </span>
                          </div>
                        </div>

                        {/* Website Targeting Badge */}
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            Website distribution:
                          </span>
                          {disabledCount === 0 ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              ✓ Running on all websites
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              ⚠️ Blocked on {disabledCount} website{disabledCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        
                        {/* Metrics */}
                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                          <div className="text-center">
                            <p className="text-xl font-black text-red-600">{ad.impressions.toLocaleString()}</p>
                            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Impressions</p>
                          </div>
                          <div className="text-center border-l border-gray-100 dark:border-gray-800">
                            <p className="text-xl font-black text-gray-900 dark:text-white">{ad.clicks.toLocaleString()}</p>
                            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Clicks</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="p-5 pt-0 space-y-2">
                      <button
                        onClick={() => setSelectedAdForWebsites(ad)}
                        className="w-full rounded-xl border border-indigo-200 bg-indigo-50/70 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-300 transition flex items-center justify-center gap-1.5"
                      >
                        🌐 Manage Website Permissions ({disabledCount === 0 ? 'All Enabled' : `${disabledCount} Disabled`})
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleActive(ad)}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1 ${
                            ad.active 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/80' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80'
                          }`}
                        >
                          {ad.active ? 'Pause Globally' : 'Enable Globally'}
                        </button>
                        <button
                          onClick={() => handleEdit(ad)}
                          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2 text-xs font-semibold hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="flex-1 rounded-xl border border-red-100 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONNECTED WEBSITES & PLACEMENTS */}
      {activeTab === 'websites' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Partner Websites Network</h3>
              <p className="text-xs text-gray-500">
                Websites where your ad script is installed. Toggle ads on or off for individual websites.
              </p>
            </div>
            <button
              onClick={() => setShowAddWebsiteModal(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              + Add Website Domain
            </button>
          </div>

          {websites.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-500 dark:border-gray-800 space-y-3">
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No partner websites detected yet</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Once someone pastes your ad script onto their website (or when you test on a local page), the website will automatically appear here!
              </p>
              <button
                onClick={() => setShowAddWebsiteModal(true)}
                className="mt-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Pre-configure a Website Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {websites.map(site => (
                <div key={site.domain} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-bold text-sm">
                        🌐
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                          {site.domain}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Last ad served: {new Date(site.lastSeenAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="font-bold text-gray-900 dark:text-white">{site.totalImpressions.toLocaleString()}</span> views • <span className="font-bold text-gray-900 dark:text-white">{site.totalClicks.toLocaleString()}</span> clicks
                      </div>

                      {/* Global toggle for this website */}
                      <button
                        onClick={() => handleToggleWebsiteGlobal(site.domain, site.globalEnabled)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                          site.globalEnabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {site.globalEnabled ? '✓ All Ads Allowed' : '✕ All Ads Blocked'}
                      </button>
                    </div>
                  </div>

                  {/* Per-ad overrides for this website */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Individual Ad Controls for {site.domain}
                    </h5>

                    {!site.globalEnabled ? (
                      <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        ⚠️ All ads are currently blocked on <strong>{site.domain}</strong>. Click "All Ads Allowed" above to enable ad serving for this site.
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {ads.map(ad => {
                          // Check if disabled specifically on this site
                          const isExplicitlyDisabled = site.adRules[ad.id] === false || (ad.disabledWebsites && ad.disabledWebsites.includes(site.domain));
                          const isEnabledOnThisSite = !isExplicitlyDisabled;

                          return (
                            <div key={ad.id} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <img src={ad.imageUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                                <div className="truncate">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{ad.title}</p>
                                  <p className="text-[10px] text-gray-500">
                                    Global status: {ad.active ? 'Active' : 'Paused'}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleToggleAdForWebsite(site.domain, ad.id, isEnabledOnThisSite)}
                                className={`shrink-0 ml-2 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                  isEnabledOnThisSite
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-rose-600 text-white hover:bg-rose-700'
                                }`}
                              >
                                {isEnabledOnThisSite ? 'Enabled' : 'Disabled'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Manage Website Permissions for a Specific Ad */}
      {selectedAdForWebsites && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Website Targeting</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  Targeting for: "{selectedAdForWebsites.title}"
                </h3>
              </div>
              <button
                onClick={() => setSelectedAdForWebsites(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Toggle this ad on or off for specific websites. If a partner website asks to disable this ad, switch it to <strong>Disabled</strong> below. The ad will continue running on all other websites.
            </p>

            {/* Quick Add Domain to block */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Disable this ad on a specific website:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. partnerblog.com"
                  value={newDomainInput}
                  onChange={e => setNewDomainInput(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs text-gray-900 focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddWebsiteForAd(selectedAdForWebsites)}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Block on Site
                </button>
              </div>
            </div>

            {/* List of Connected Websites & their status for this ad */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Connected Websites:
              </label>

              {websites.length === 0 && (!selectedAdForWebsites.disabledWebsites || selectedAdForWebsites.disabledWebsites.length === 0) ? (
                <p className="text-xs text-gray-400 italic">No websites registered yet. This ad is allowed everywhere by default.</p>
              ) : (
                <div className="space-y-2">
                  {/* Combine detected websites and any custom disabled domains */}
                  {Array.from(new Set([
                    ...websites.map(w => w.domain),
                    ...(selectedAdForWebsites.disabledWebsites || [])
                  ])).map(domain => {
                    const isBlocked = (selectedAdForWebsites.disabledWebsites && selectedAdForWebsites.disabledWebsites.includes(domain)) ||
                                     websites.find(w => w.domain === domain)?.adRules[selectedAdForWebsites.id] === false;
                    const isEnabled = !isBlocked;

                    return (
                      <div key={domain} className="flex items-center justify-between rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">{domain}</span>
                          {isBlocked && (
                            <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                              Blocked
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleToggleAdForWebsite(domain, selectedAdForWebsites.id, isEnabled)}
                          className={`rounded-lg px-3 py-1 font-bold text-[11px] transition ${
                            isEnabled
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {isEnabled ? '✓ Running (Click to Disable)' : '✕ Disabled (Click to Enable)'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAdForWebsites(null)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Website Globally */}
      {showAddWebsiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <form onSubmit={handleAddWebsiteGlobal} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Add Partner Website Domain
            </h3>
            <p className="text-xs text-gray-500">
              Pre-register a partner domain so you can customize which ads will run before they even install the code.
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Website Domain *</label>
              <input
                type="text"
                required
                placeholder="e.g. freetownpost.com or blog.salone.sl"
                value={manualWebsiteInput}
                onChange={e => setManualWebsiteInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddWebsiteModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Add Website
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Embed Code Section */}
      <div className="rounded-3xl bg-[#040e40] p-8 text-white shadow-xl space-y-6">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight">Ad Network Embed Code</h3>
          <p className="mt-2 text-sm text-gray-300 max-w-2xl">
            Provide this script to your partner website owners. When pasted on any website, our network automatically identifies their domain and serves only the ads you have approved for them.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Production Code */}
          <div className="rounded-2xl bg-black/40 p-5 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-400">Production Code</h4>
                <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-semibold">Live Websites</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                For external live partner websites. Connects securely to your live production domain.
              </p>
              <div className="rounded-xl bg-black/60 p-3 font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre border border-white/5">
                {productionCode}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(productionCode);
                showNotification('Production Embed Code copied to clipboard!');
              }}
              className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold transition hover:bg-white/20 border border-white/10 text-white"
            >
              Copy Production Code
            </button>
          </div>

          {/* Local Test Code */}
          <div className="rounded-2xl bg-black/40 p-5 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Local Test Code</h4>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">Localhost Only</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Use when testing an HTML page on your local computer running <code>localhost:3000</code>.
              </p>
              <div className="rounded-xl bg-black/60 p-3 font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre border border-white/5">
                {localTestCode}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(localTestCode);
                showNotification('Local Test Embed Code copied to clipboard!');
              }}
              className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold transition hover:bg-white/20 border border-white/10 text-white"
            >
              Copy Local Test Code
            </button>
          </div>
        </div>

        {/* Optional attributes guide */}
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 text-xs text-gray-300 space-y-2">
          <p className="font-bold text-white">💡 Advanced Placement Options (Optional):</p>
          <ul className="list-disc list-inside space-y-1 text-gray-300">
            <li><strong>Lock to a specific format:</strong> Add <code>data-size="leaderboard"</code> (or <code>rectangle</code>, <code>square</code>, <code>skyscraper</code>) to the <code>&lt;div class="its-ad-unit"&gt;</code> container.</li>
            <li><strong>Lock to a specific ad:</strong> Add <code>data-ad-id="AD_ID_HERE"</code> to force that unit to only display a specific ad (if active and allowed for that website).</li>
            <li><strong>Automatic collapsing:</strong> If an ad is disabled or no ads are approved for a website, the container automatically collapses without showing any default or broken placeholder.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
