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
  impressions: number;
  clicks: number;
  createdAt: string;
}

export default function AdsAdminPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    size: 'rectangle',
    active: true
  });

  useEffect(() => {
    fetchAds();
  }, []);

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
      } else {
        console.error('API returned non-array data:', data);
        setError('Received invalid data from server.');
      }
    } catch (err) {
      setError('Failed to load ads.');
    } finally {
      setLoading(false);
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
        setShowForm(false);
        setEditingAd(null);
        setFormData({ title: '', description: '', imageUrl: '', targetUrl: '', size: 'rectangle', active: true });
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
      active: ad.active
    });
    setShowForm(true);
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          imageUrl: ad.imageUrl,
          targetUrl: ad.targetUrl,
          size: ad.size,
          active: !ad.active
        }),
      });

      if (res.ok) {
        setAds(prev => prev.map(item => item.id === ad.id ? { ...item, active: !ad.active } : item));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to toggle ad status.');
      }
    } catch (err) {
      alert('Network error while toggling ad.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAds();
      }
    } catch (err) {
      alert('Failed to delete ad.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
      </div>
    );
  }

  const productionCode = `<div class="its-ad-unit"></div>\n<script src="https://itservicesfreetown.com/js/its-ads.js"></script>`;
  const localTestCode = `<div class="its-ad-unit"></div>\n<script src="http://localhost:3000/js/its-ads.js"></script>`;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Ad Network</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50 sm:text-3xl">
            Manage Your Ads
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create and track promotions that show on other websites.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingAd(null);
              setFormData({ title: '', description: '', imageUrl: '', targetUrl: '', size: 'rectangle', active: true });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {showForm ? 'Cancel' : 'Create New Ad'}
          </button>
          <a
            href="/admin"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back
          </a>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingAd ? 'Edit Ad' : 'New Advertisement'}</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g. Free PC Health Check"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target URL *</label>
              <input
                type="text"
                required
                value={formData.targetUrl}
                onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://itservicesfreetown.com/book"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL *</label>
              <input
                type="text"
                required
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Format / Size *</label>
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
              placeholder="Short catchy description..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={e => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active (Visible on network)</label>
          </div>

          {/* Live Preview Section */}
          <div className="mt-8 border-t pt-8">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Live Preview ({formData.size})</h4>
            <div className="w-full">
              <div className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all dark:border-gray-800 dark:bg-gray-900 ${
                formData.size === 'square' ? 'max-w-[320px] mx-auto' :
                formData.size === 'skyscraper' ? 'max-w-[280px] mx-auto' :
                formData.size === 'leaderboard' ? 'w-full flex flex-col sm:flex-row items-stretch' : 'max-w-md mx-auto'
              }`}>
                <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden ${
                  formData.size === 'square' ? 'aspect-square w-full' :
                  formData.size === 'skyscraper' ? 'aspect-[9/16] w-full max-h-[360px]' :
                  formData.size === 'leaderboard' ? 'sm:w-2/5 aspect-[21/9] sm:aspect-auto' : 'aspect-video w-full'
                }`}>
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Ad Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-4">
                      <svg className="w-8 h-8 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Banner image will appear here
                    </div>
                  )}
                </div>
                <div className={`p-4 flex flex-col justify-center ${formData.size === 'leaderboard' ? 'sm:w-3/5' : 'w-full'}`}>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {formData.title || 'Your Ad Title Here'}
                  </h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {formData.description || 'Add a description to catch people\'s attention...'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sponsored</span>
                    <span className="text-sm font-semibold text-red-600">Learn More →</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-gray-400">This is how your ad will look on other websites when formatted as {formData.size}.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-600 font-medium">❌ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {saving ? 'Saving...' : editingAd ? 'Update Ad' : 'Publish Ad'}
          </button>
        </form>
      )}

      {/* Ad List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Ads</h3>
        {ads.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-500 dark:border-gray-700">
            No ads created yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {ads.map(ad => (
              <div key={ad.id} className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
                <div>
                  <div className={`w-full bg-gray-100 dark:bg-gray-800 ${
                    ad.size === 'square' ? 'aspect-square max-w-[200px] mx-auto mt-4 rounded-2xl overflow-hidden' :
                    ad.size === 'skyscraper' ? 'aspect-[9/16] max-w-[160px] mx-auto mt-4 rounded-2xl overflow-hidden max-h-[240px]' :
                    ad.size === 'leaderboard' ? 'aspect-[21/9]' : 'aspect-video'
                  }`}>
                    <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{ad.title}</h4>
                        <p className="text-[10px] text-gray-500 truncate max-w-[180px]">Target: {ad.targetUrl}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ad.active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                          {ad.active ? 'Active' : 'Paused'}
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {ad.size || 'rectangle'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <div className="text-center">
                        <p className="text-xl font-bold text-red-600">{ad.impressions}</p>
                        <p className="text-[10px] uppercase text-gray-500 font-semibold">Impressions</p>
                      </div>
                      <div className="text-center border-l border-gray-100 dark:border-gray-800">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{ad.clicks}</p>
                        <p className="text-[10px] uppercase text-gray-500 font-semibold">Clicks</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="p-6 pt-0 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(ad)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1 ${
                      ad.active 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/80' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/80'
                    }`}
                  >
                    {ad.active ? 'Disable Ad' : 'Enable Ad'}
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
            ))}
          </div>
        )}
      </div>

      {/* Embed Section */}
      <div className="rounded-3xl bg-[#040e40] p-8 text-white shadow-xl space-y-6">
        <div>
          <h3 className="text-xl font-bold">Network Embed Code</h3>
          <p className="mt-2 text-sm text-gray-300">
            Give this code to other website owners. They can place the <code>&lt;div&gt;</code> where they want the ad, or just paste the script anywhere for automatic injection.
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
              <p className="text-xs text-gray-400 mb-3">Use this code for real live external websites. It connects directly to your live production domain.</p>
              <div className="rounded-xl bg-black/60 p-3 font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre border border-white/5">
                {productionCode}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(productionCode);
                alert('Production Embed Code copied to clipboard!');
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
              <p className="text-xs text-gray-400 mb-3">Use this when testing an HTML file on your local machine while running <code>localhost:3000</code>.</p>
              <div className="rounded-xl bg-black/60 p-3 font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre border border-white/5">
                {localTestCode}
              </div>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(localTestCode);
                alert('Local Test Embed Code copied to clipboard!');
              }}
              className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold transition hover:bg-white/20 border border-white/10 text-white"
            >
              Copy Local Test Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
