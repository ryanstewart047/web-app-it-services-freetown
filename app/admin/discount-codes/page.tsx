'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  timesUsed: number;
  specificEmail: string | null;
  createdAt: string;
}

export default function DiscountCodesAdmin() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountAmount, setDiscountAmount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [specificEmail, setSpecificEmail] = useState('');

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/admin/discount-codes');
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (error) {
      toast.error('Failed to load discount codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountAmount) {
      toast.error('Code and amount are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType,
          discountAmount: parseFloat(discountAmount),
          expiresAt: expiresAt || null,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          specificEmail: specificEmail || null
        })
      });

      if (res.ok) {
        toast.success('Discount code created!');
        setCode('');
        setDiscountAmount('');
        setExpiresAt('');
        setUsageLimit('');
        setSpecificEmail('');
        fetchCodes();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create code');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentStatus })
      });
      if (res.ok) {
        toast.success(currentStatus ? 'Code disabled' : 'Code activated');
        fetchCodes();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;
    try {
      const res = await fetch(`/api/admin/discount-codes?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Code deleted');
        fetchCodes();
      } else {
        toast.error('Failed to delete code');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discount Codes</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage promotional codes for your store.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create New Code</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER2025"
                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white uppercase"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (SLL)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder={discountType === 'percentage' ? "e.g. 10" : "e.g. 50"}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date (Optional)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Limit (Optional)</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="e.g. 100 uses"
                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specific Customer Email (Optional)</label>
              <input
                type="email"
                value={specificEmail}
                onChange={(e) => setSpecificEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Discount Code'}
            </button>
          </form>
        </div>

        {/* Codes List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Code</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Discount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Usage</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading codes...</td>
                  </tr>
                ) : codes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No discount codes found.</td>
                  </tr>
                ) : (
                  codes.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{c.code}</div>
                        {c.specificEmail && <div className="text-xs text-blue-500">For: {c.specificEmail}</div>}
                        {c.expiresAt && <div className="text-xs text-red-400">Expires: {new Date(c.expiresAt).toLocaleDateString()}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {c.discountType === 'percentage' ? `${c.discountAmount}% OFF` : `SLL ${c.discountAmount.toLocaleString()} OFF`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {c.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {c.timesUsed} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => toggleActive(c.id, c.active)}
                          className={`text-sm font-medium ${c.active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {c.active ? 'Disable' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
