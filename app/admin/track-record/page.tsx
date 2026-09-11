'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Users,
  CheckCircle2,
  Clock,
  Save,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Database,
  Building2,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useAdminSession } from '../../../src/hooks/useAdminSession';

interface TrackRecordData {
  settings: {
    baselineDevices: number;
    offlineDevices: number;
    baselineCustomers: number;
    offlineCustomers: number;
    successRate: number;
    responseTimeHours: number;
    updatedAt?: string;
  };
  liveData: {
    devices: number;
    customers: number;
    successRate: number;
    responseTime: number;
    breakdown: {
      baselineDevices: number;
      offlineDevices: number;
      liveDevices: number;
      baselineCustomers: number;
      offlineCustomers: number;
      liveCustomers: number;
      totalOnlineRepairs: number;
      totalOnlineAppointments: number;
      totalOnlineCustomers: number;
    };
    updatedAt: string;
  };
}

export default function AdminTrackRecordPage() {
  useAdminSession({
    idleTimeout: 10 * 60 * 1000,
    warningTime: 30 * 1000,
  });

  const [data, setData] = useState<TrackRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [offlineDevices, setOfflineDevices] = useState<number>(0);
  const [offlineCustomers, setOfflineCustomers] = useState<number>(0);
  const [baselineDevices, setBaselineDevices] = useState<number>(450);
  const [baselineCustomers, setBaselineCustomers] = useState<number>(300);
  const [successRate, setSuccessRate] = useState<number>(98);
  const [responseTimeHours, setResponseTimeHours] = useState<number>(2);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/track-record?t=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to load track record settings');
      const json: TrackRecordData = await res.json();
      setData(json);

      // Populate form
      setOfflineDevices(json.settings.offlineDevices || 0);
      setOfflineCustomers(json.settings.offlineCustomers || 0);
      setBaselineDevices(json.settings.baselineDevices || 450);
      setBaselineCustomers(json.settings.baselineCustomers || 300);
      setSuccessRate(json.settings.successRate || 98);
      setResponseTimeHours(json.settings.responseTimeHours || 2);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error fetching data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/track-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offlineDevices: Number(offlineDevices) || 0,
          offlineCustomers: Number(offlineCustomers) || 0,
          baselineDevices: Number(baselineDevices) || 450,
          baselineCustomers: Number(baselineCustomers) || 300,
          successRate: Number(successRate) || 98,
          responseTimeHours: Number(responseTimeHours) || 2,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save settings');

      setMessage({ type: 'success', text: 'Track record settings updated and live on homepage!' });
      setData(result);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  // Preview calculations
  const liveDevices = data?.liveData.breakdown.liveDevices || 0;
  const liveCustomers = data?.liveData.breakdown.liveCustomers || 0;
  const previewDevices = (Number(baselineDevices) || 0) + (Number(offlineDevices) || 0) + liveDevices;
  const previewCustomers = (Number(baselineCustomers) || 0) + (Number(offlineCustomers) || 0) + liveCustomers;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Back to Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
                Track Record &amp; Stats
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage offline repairs and configure dynamic numbers shown on the homepage
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
              message.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <HelpCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Top Summary Cards: Live Online Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Online Repairs in DB
              </span>
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {loading ? '...' : data?.liveData.breakdown.totalOnlineRepairs ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Logged directly through customer repair tracker
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Online Bookings in DB
              </span>
              <Wrench className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {loading ? '...' : data?.liveData.breakdown.totalOnlineAppointments ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              All appointments booked (including completed &amp; cancelled)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Customers
              </span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {loading ? '...' : data?.liveData.breakdown.totalOnlineCustomers ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Unique customer accounts stored in database
            </p>
          </div>
        </div>

        {/* Live Preview on Homepage */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-bold text-white">
                Live Homepage Preview
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full">
              Real-time Output
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-black text-white mb-1">
                {previewDevices}+
              </div>
              <p className="text-xs font-bold text-slate-300">Devices Repaired</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {baselineDevices} base + {offlineDevices} offline + {liveDevices} online
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-black text-rose-500 mb-1">
                {previewCustomers}+
              </div>
              <p className="text-xs font-bold text-slate-300">Happy Customers</p>
              <p className="text-[10px] text-slate-500 mt-1">
                {baselineCustomers} base + {offlineCustomers} offline + {liveCustomers} online
              </p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-black text-emerald-400 mb-1">
                {successRate}%
              </div>
              <p className="text-xs font-bold text-slate-300">Success Rate</p>
              <p className="text-[10px] text-slate-500 mt-1">Consistently high standard</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-3xl font-black text-purple-400 mb-1">
                {responseTimeHours}hrs
              </div>
              <p className="text-xs font-bold text-slate-300">Avg Response Time</p>
              <p className="text-[10px] text-slate-500 mt-1">Fast turnaround in Freetown</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Offline Repairs Addition */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-700/70 pb-3">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-white text-base">
                  Offline Workshop Repairs &amp; Walk-ins
                </h3>
                <p className="text-xs text-slate-400">
                  Add repairs and clients serviced in person at the workshop that weren't logged through the website.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Offline Devices Repaired
                </label>
                <input
                  type="number"
                  min="0"
                  value={offlineDevices}
                  onChange={(e) => setOfflineDevices(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. 150"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Added to the {baselineDevices} baseline + live online repairs.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Offline Happy Customers
                </label>
                <input
                  type="number"
                  min="0"
                  value={offlineCustomers}
                  onChange={(e) => setOfflineCustomers(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. 120"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Added to the {baselineCustomers} baseline + live online bookings.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Baseline & Performance Metrics */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-700/70 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-base">
                  Baseline Numbers &amp; Guarantee Targets
                </h3>
                <p className="text-xs text-slate-400">
                  Historical foundation representing BridgeTech's multi-year establishment in Sierra Leone.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Baseline Devices
                </label>
                <input
                  type="number"
                  min="0"
                  value={baselineDevices}
                  onChange={(e) => setBaselineDevices(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Baseline Customers
                </label>
                <input
                  type="number"
                  min="0"
                  value={baselineCustomers}
                  onChange={(e) => setBaselineCustomers(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Success Rate (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={successRate}
                  onChange={(e) => setSuccessRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Avg Response (hrs)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={responseTimeHours}
                  onChange={(e) => setResponseTimeHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/40 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save &amp; Update Homepage
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
