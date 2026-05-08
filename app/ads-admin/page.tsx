'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl: string;
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
        setFormData({ title: '', description: '', imageUrl: '', targetUrl: '', active: true });
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
      active: ad.active
    });
    setShowForm(true);
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

  const copyEmbedCode = () => {
    const code = `<div class="its-ad-unit"></div>\n<script src="https://itservicesfreetown.com/js/its-ads.js"></script>`;
    navigator.clipboard.writeText(code);
    alert('Embed code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
      </div>
    );
  }

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
              setFormData({ title: '', description: '', imageUrl: '', targetUrl: '', active: true });
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                placeholder="https://itservicesfreetown.com/book"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL *</label>
            <input
              type="text"
              required
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
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

          {error && <p className="text-sm text-red-600">{error}</p>}

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
              <div key={ad.id} className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800">
                  <img src={ad.imageUrl} alt={ad.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{ad.title}</h4>
                      <p className="text-[10px] text-gray-500 truncate max-w-[150px]">Target: {ad.targetUrl}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ad.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                    <div className="text-center">
                      <p className="text-xl font-bold text-red-600">{ad.impressions}</p>
                      <p className="text-[10px] uppercase text-gray-500">Impressions</p>
                    </div>
                    <div className="text-center border-l border-gray-100 dark:border-gray-800">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{ad.clicks}</p>
                      <p className="text-[10px] uppercase text-gray-500">Clicks</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-2 text-xs font-semibold hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
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
            ))}
          </div>
        )}
      </div>

      {/* Embed Section */}
      <div className="rounded-3xl bg-[#040e40] p-8 text-white">
        <h3 className="text-xl font-bold">Network Embed Code</h3>
        <p className="mt-2 text-sm text-gray-300">
          Give this code to other website owners to show your ads on their site.
        </p>
        
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-black/30 p-4 font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre">
{`<div class="its-ad-unit"></div>
<script src="https://itservicesfreetown.com/js/its-ads.js"></script>`}
          </div>
          <button
            onClick={copyEmbedCode}
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold transition hover:bg-white/20"
          >
            Copy Embed Code
          </button>
        </div>
      </div>
    </div>
  );
}
