'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  PartnerItem,
  PartnersSectionSettings,
  PartnerColorMode,
  DEFAULT_PARTNERS_SETTINGS,
  INITIAL_DEFAULT_PARTNERS,
} from '@/lib/server/partners-store';
import { getLogoColorClasses } from '@/components/PartnersSection';

const COLOR_MODES: {
  id: PartnerColorMode;
  label: string;
  description: string;
  icon: string;
  badge: string;
}[] = [
  {
    id: 'grayscale-hover-color',
    label: 'Black & White (Color on Hover)',
    description: 'Displays in elegant grayscale, smoothly turning full color when visitors hover.',
    icon: 'fa-magic',
    badge: 'Popular & Clean',
  },
  {
    id: 'black-white',
    label: 'Pure Black & White',
    description: 'Always stays in clean, high-contrast monochrome grayscale across all devices.',
    icon: 'fa-adjust',
    badge: 'Classic Monochrome',
  },
  {
    id: 'monochrome',
    label: 'High-Contrast Silhouette',
    description: 'Deepened contrast silhouette, ideal for bold minimal tech aesthetics.',
    icon: 'fa-moon',
    badge: 'Minimal Silhouette',
  },
  {
    id: 'original-color',
    label: 'Full Brand Color',
    description: 'Always displays logos in their full original brand colors.',
    icon: 'fa-palette',
    badge: 'Original Colors',
  },
];

export default function PartnersAdminPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Data state
  const [settings, setSettings] = useState<PartnersSectionSettings>(DEFAULT_PARTNERS_SETTINGS);
  const [partners, setPartners] = useState<PartnerItem[]>([]);

  // Add Partner Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'upload' | 'url'>('upload');
  const [addName, setAddName] = useState('');
  const [addWebsiteUrl, setAddWebsiteUrl] = useState('');
  const [addLogoUrl, setAddLogoUrl] = useState('');
  const [addSelectedFile, setAddSelectedFile] = useState<File | null>(null);
  const [addPreviewUrl, setAddPreviewUrl] = useState('');
  const [addColorMode, setAddColorMode] = useState<PartnerColorMode | ''>('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Partner State
  const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);
  const [editMode, setEditMode] = useState<'upload' | 'url'>('url');
  const [editName, setEditName] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [editColorMode, setEditColorMode] = useState<PartnerColorMode | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Deleting State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/partners');
      if (res.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings || DEFAULT_PARTNERS_SETTINGS);
        setPartners(data.partners || []);
      } else {
        setError(data.error || 'Failed to load partners data.');
      }
    } catch (err) {
      setError('Network error while connecting to partners API.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    setError('');

    try {
      const res = await fetch('/api/admin/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-settings', settings }),
      });

      const result = await res.json();
      if (result.success) {
        setSettings(result.settings);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update section settings.');
      }
    } catch (err) {
      setError('Network error updating settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle File Input Change for Add
  const handleAddFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAddSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAddPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle File Input Change for Edit
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Create Partner
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      setError('Partner name is required.');
      return;
    }

    if (addMode === 'upload' && !addSelectedFile) {
      setError('Please choose a logo file to upload.');
      return;
    }

    if (addMode === 'url' && !addLogoUrl.trim()) {
      setError('Please paste a valid logo image URL.');
      return;
    }

    setIsAdding(true);
    setError('');

    try {
      let res;
      if (addMode === 'upload' && addSelectedFile) {
        const formData = new FormData();
        formData.append('name', addName.trim());
        formData.append('websiteUrl', addWebsiteUrl.trim());
        formData.append('file', addSelectedFile);
        if (addColorMode) formData.append('colorMode', addColorMode);
        formData.append('active', 'true');

        res = await fetch('/api/admin/partners', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/admin/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: addName.trim(),
            logoUrl: addLogoUrl.trim(),
            websiteUrl: addWebsiteUrl.trim(),
            colorMode: addColorMode || undefined,
            active: true,
          }),
        });
      }

      const data = await res.json();
      if (data.success && data.partner) {
        setPartners((prev) => [...prev, data.partner]);
        // Reset form
        setAddName('');
        setAddWebsiteUrl('');
        setAddLogoUrl('');
        setAddSelectedFile(null);
        setAddPreviewUrl('');
        setAddColorMode('');
        setShowAddModal(false);
      } else {
        setError(data.error || 'Failed to add partner.');
      }
    } catch (err) {
      setError('Network error while creating partner.');
    } finally {
      setIsAdding(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (partner: PartnerItem) => {
    setEditingPartner(partner);
    setEditName(partner.name);
    setEditWebsiteUrl(partner.websiteUrl || '');
    setEditLogoUrl(partner.logoUrl);
    setEditPreviewUrl(partner.logoUrl);
    setEditSelectedFile(null);
    setEditColorMode(partner.colorMode || '');
    setEditMode(partner.logoUrl.startsWith('data:') ? 'upload' : 'url');
  };

  // Handle Update Partner
  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    if (!editName.trim()) {
      setError('Partner name is required.');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      let res;
      if (editMode === 'upload' && editSelectedFile) {
        const formData = new FormData();
        formData.append('id', editingPartner.id);
        formData.append('name', editName.trim());
        formData.append('websiteUrl', editWebsiteUrl.trim());
        formData.append('file', editSelectedFile);
        formData.append('colorMode', editColorMode || '');

        res = await fetch('/api/admin/partners', {
          method: 'PUT',
          body: formData,
        });
      } else {
        res = await fetch('/api/admin/partners', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPartner.id,
            name: editName.trim(),
            logoUrl: editLogoUrl.trim() || editingPartner.logoUrl,
            websiteUrl: editWebsiteUrl.trim(),
            colorMode: editColorMode || undefined,
          }),
        });
      }

      const data = await res.json();
      if (data.success && data.partner) {
        setPartners((prev) =>
          prev.map((p) => (p.id === editingPartner.id ? data.partner : p))
        );
        setEditingPartner(null);
      } else {
        setError(data.error || 'Failed to update partner.');
      }
    } catch (err) {
      setError('Network error while updating partner.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle Partner Active Status
  const handleToggleActive = async (partner: PartnerItem) => {
    try {
      const nextStatus = !partner.active;
      // Optimistic update
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, active: nextStatus } : p))
      );

      const res = await fetch('/api/admin/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: partner.id, active: nextStatus }),
      });

      const data = await res.json();
      if (!data.success) {
        // Revert on error
        setPartners((prev) =>
          prev.map((p) => (p.id === partner.id ? { ...p, active: partner.active } : p))
        );
        setError('Failed to toggle partner visibility.');
      }
    } catch (err) {
      setError('Network error updating status.');
    }
  };

  // Move Partner Position (Up / Down)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;

    const newPartners = [...partners];
    const temp = newPartners[index];
    newPartners[index] = newPartners[targetIndex];
    newPartners[targetIndex] = temp;

    setPartners(newPartners);

    try {
      const orderedIds = newPartners.map((p) => p.id);
      await fetch('/api/admin/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', orderedIds }),
      });
    } catch (err) {
      console.error('Failed to save reorder:', err);
    }
  };

  // Delete Partner
  const handleDeletePartner = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this partner logo?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/partners?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPartners((prev) => prev.filter((p) => p.id !== id));
      } else {
        setError(data.error || 'Failed to delete partner.');
      }
    } catch (err) {
      setError('Network error deleting partner.');
    } finally {
      setDeletingId(null);
    }
  };

  // Restore Default Brand Presets
  const handleRestoreDefaults = async () => {
    if (!window.confirm('Add default technology brand logos (Apple, Samsung, Huawei, Xiaomi, etc.)?')) return;

    setLoading(true);
    try {
      for (const brand of INITIAL_DEFAULT_PARTNERS) {
        await fetch('/api/admin/partners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: brand.name,
            logoUrl: brand.logoUrl,
            websiteUrl: brand.websiteUrl,
            active: true,
          }),
        });
      }
      await fetchData();
    } catch (err) {
      setError('Failed to restore default brands.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-100 dark:bg-red-900/30 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
              <i className="fas fa-handshake"></i> Showcase Module
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Partners &amp; Brand Logos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Control the partner showcase displayed right above the footer. Upload logos, paste URLs, and customize Black &amp; White color filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <i className="fas fa-plus"></i> Add Partner Logo
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <i className="fas fa-arrow-left"></i> Back to Admin
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-circle shrink-0 text-base"></i>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {settingsSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
          <i className="fas fa-check-circle shrink-0 text-base"></i>
          <span>Section settings updated and published successfully!</span>
        </div>
      )}

      {/* ── LIVE PREVIEW BOX ── */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
              Live Preview
            </p>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Pre-Footer Presentation
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Active Mode: <strong className="text-gray-700 dark:text-gray-200 capitalize">{settings.colorMode.replace('-', ' ')}</strong>
          </span>
        </div>

        {/* Mock Pre-Footer Box */}
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-950/70 p-6 sm:p-8 text-center transition-all">
          {settings.enabled ? (
            <>
              {settings.title && (
                <div className="mb-6">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {settings.title}
                  </h4>
                  {settings.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {settings.subtitle}
                    </p>
                  )}
                </div>
              )}

              {partners.filter((p) => p.active).length === 0 ? (
                <div className="py-6 text-gray-400 text-sm">
                  <i className="fas fa-image text-3xl mb-2 block text-gray-300"></i>
                  No active logos. Add logos or toggle existing ones active below.
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  {partners
                    .filter((p) => p.active)
                    .map((partner) => {
                      const mode = partner.colorMode || settings.colorMode;
                      const colorClass = getLogoColorClasses(mode);

                      return (
                        <div
                          key={partner.id}
                          className="flex items-center justify-center h-16 w-36 sm:h-18 sm:w-40 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 shadow-2xs transition-all hover:scale-105"
                        >
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className={`max-h-9 sm:max-h-10 max-w-[110px] w-auto h-auto object-contain transition-all duration-300 ${colorClass}`}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          ) : (
            <div className="py-6 text-amber-600 dark:text-amber-400 text-sm">
              <i className="fas fa-eye-slash text-3xl mb-2 block opacity-70"></i>
              The Partners section is currently disabled. Toggle it ON below to make it visible on your website.
            </div>
          )}
        </div>
      </div>

      {/* ── SECTION SETTINGS FORM ── */}
      <form
        onSubmit={handleSaveSettings}
        className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:p-8"
      >
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Section Display &amp; Color Style Settings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Choose the logo color appearance, section title, and layout before the footer.
          </p>
        </div>

        {/* Section Visibility Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Show Section on Website</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When enabled, the partners showcase will appear directly above the footer on all visitor pages.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.enabled ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Section Title & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Section Title
            </label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Trusted Brands & Technology Partners"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Section Subtitle (Optional)
            </label>
            <input
              type="text"
              value={settings.subtitle || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="e.g. Certified repair center for leading device manufacturers"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 shadow-2xs transition focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Logo Color Style Options (CRITICAL FEATURE) */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
            Logo Color Treatment <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {COLOR_MODES.map((mode) => {
              const isSelected = settings.colorMode === mode.id;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, colorMode: mode.id }))}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-2 ring-red-400 dark:ring-red-600'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      isSelected ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <i className={`fas ${mode.icon}`}></i>
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {mode.badge}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {mode.label}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                    {mode.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
            Display Layout
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="layout"
                checked={settings.layout === 'grid'}
                onChange={() => setSettings((prev) => ({ ...prev, layout: 'grid' }))}
                className="text-red-600 focus:ring-red-500"
              />
              <span>Responsive Clean Grid</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="layout"
                checked={settings.layout === 'marquee'}
                onChange={() => setSettings((prev) => ({ ...prev, layout: 'marquee' }))}
                className="text-red-600 focus:ring-red-500"
              />
              <span>Continuous Scrolling Track (Marquee)</span>
            </label>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:hover:bg-red-500 disabled:opacity-50"
          >
            {savingSettings ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving Settings...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Section Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── PARTNER LOGOS LIST & MANAGEMENT ── */}
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Partner Logos ({partners.length})
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All logos automatically scale to uniform heights and proportions. Use the arrows to reorder.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title="Add default brand presets"
            >
              <i className="fas fa-sync-alt"></i> Load Brand Presets
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition"
            >
              <i className="fas fa-plus"></i> Add New Logo
            </button>
          </div>
        </div>

        {partners.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <i className="fas fa-images text-4xl mb-3 block text-gray-300"></i>
            <p className="text-sm font-medium">No partner logos added yet.</p>
            <p className="text-xs text-gray-400 mt-1">Upload an image or paste a logo URL to get started.</p>
            <button
              onClick={handleRestoreDefaults}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2 text-xs font-bold"
            >
              <i className="fas fa-magic"></i> Load Brand Presets (Apple, Samsung, etc.)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner, index) => {
              const effectiveMode = partner.colorMode || settings.colorMode;
              const colorClass = getLogoColorClasses(effectiveMode);

              return (
                <div
                  key={partner.id}
                  className={`flex flex-col rounded-2xl border p-4 transition-all ${
                    partner.active
                      ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-850'
                      : 'border-dashed border-gray-300 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-900/50 opacity-60'
                  }`}
                >
                  {/* Logo Preview Container with Normalized Uniform Size */}
                  <div className="relative flex items-center justify-center h-24 w-full rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 mb-3">
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className={`max-h-12 max-w-[130px] w-auto h-auto object-contain transition-all duration-300 ${colorClass}`}
                    />
                    <span
                      className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        partner.active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {partner.active ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        {partner.name}
                      </h4>
                      {partner.colorMode && (
                        <span className="text-[10px] bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 px-2 py-0.5 rounded-md font-medium">
                          Custom Color
                        </span>
                      )}
                    </div>
                    {partner.websiteUrl ? (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block mt-0.5"
                      >
                        <i className="fas fa-external-link-alt text-[10px] mr-1"></i>
                        {partner.websiteUrl}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 mt-0.5 block">No link configured</span>
                    )}
                  </div>

                  {/* Actions & Ordering */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                      >
                        <i className="fas fa-arrow-up text-xs"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === partners.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                      >
                        <i className="fas fa-arrow-down text-xs"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(partner)}
                        className={`ml-1 px-2 py-1 rounded-lg font-medium ${
                          partner.active
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                        }`}
                      >
                        {partner.active ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(partner)}
                        className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Edit Partner"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePartner(partner.id)}
                        disabled={deletingId === partner.id}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Delete Partner"
                      >
                        {deletingId === partner.id ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-trash-alt"></i>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: ADD NEW PARTNER ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-plus-circle text-red-600"></i> Add Partner Logo
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4">
              {/* Partner Name */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Partner / Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Apple, Dell, Orange, Google"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Input Method Toggle (Upload vs URL) */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Logo Source <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode('upload');
                      setAddPreviewUrl(addSelectedFile ? addPreviewUrl : '');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      addMode === 'upload'
                        ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <i className="fas fa-upload mr-1.5"></i> Upload Image File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode('url');
                      setAddPreviewUrl(addLogoUrl);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      addMode === 'url'
                        ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <i className="fas fa-link mr-1.5"></i> Paste Logo URL
                  </button>
                </div>

                {addMode === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 dark:bg-gray-800/40 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleAddFileSelect}
                      className="hidden"
                    />
                    <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2 block"></i>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {addSelectedFile ? addSelectedFile.name : 'Click or drop logo image here'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      PNG, SVG, JPG, WebP supported (transparent background recommended)
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={addLogoUrl}
                      onChange={(e) => {
                        setAddLogoUrl(e.target.value);
                        setAddPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/logo.png"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Direct link to logo PNG, SVG, or WebP</p>
                  </div>
                )}
              </div>

              {/* Live Thumbnail Preview */}
              {addPreviewUrl && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Logo Preview</p>
                  <div className="flex items-center justify-center h-16 w-36 mx-auto bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                    <img
                      src={addPreviewUrl}
                      alt="Preview"
                      className={`max-h-10 max-w-[120px] w-auto h-auto object-contain ${getLogoColorClasses(addColorMode || settings.colorMode)}`}
                    />
                  </div>
                </div>
              )}

              {/* Website URL */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Website Destination URL (Optional)
                </label>
                <input
                  type="url"
                  value={addWebsiteUrl}
                  onChange={(e) => setAddWebsiteUrl(e.target.value)}
                  placeholder="https://brand.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-[10px] text-gray-400 mt-1">If provided, clicking the logo will open this URL in a new tab.</p>
              </div>

              {/* Optional Color Override */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Logo Color Override (Optional)
                </label>
                <select
                  value={addColorMode}
                  onChange={(e) => setAddColorMode(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Use Section Default ({settings.colorMode})</option>
                  <option value="grayscale-hover-color">Black &amp; White (Color on Hover)</option>
                  <option value="black-white">Always Black &amp; White</option>
                  <option value="monochrome">High Contrast Silhouette</option>
                  <option value="original-color">Always Full Color</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {isAdding ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Adding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Add Partner Logo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PARTNER ── */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-edit text-red-600"></i> Edit Partner Logo
              </h3>
              <button
                onClick={() => setEditingPartner(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleUpdatePartner} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Partner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Logo Source Toggle */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                  Update Logo (Upload or Paste URL)
                </label>
                <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setEditMode('upload')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      editMode === 'upload'
                        ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <i className="fas fa-upload mr-1.5"></i> Upload New File
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode('url')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      editMode === 'url'
                        ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <i className="fas fa-link mr-1.5"></i> Logo URL
                  </button>
                </div>

                {editMode === 'upload' ? (
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-red-500 rounded-2xl p-5 text-center cursor-pointer bg-gray-50/50 dark:bg-gray-800/40"
                  >
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleEditFileSelect}
                      className="hidden"
                    />
                    <i className="fas fa-cloud-upload-alt text-xl text-gray-400 mb-1 block"></i>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {editSelectedFile ? editSelectedFile.name : 'Click to replace logo file'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={editLogoUrl}
                      onChange={(e) => {
                        setEditLogoUrl(e.target.value);
                        setEditPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/logo.png"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Preview */}
              {editPreviewUrl && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-3 text-center">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Logo</p>
                  <div className="flex items-center justify-center h-16 w-36 mx-auto bg-white dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                    <img
                      src={editPreviewUrl}
                      alt="Preview"
                      className={`max-h-10 max-w-[120px] w-auto h-auto object-contain ${getLogoColorClasses(editColorMode || settings.colorMode)}`}
                    />
                  </div>
                </div>
              )}

              {/* Website URL */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={editWebsiteUrl}
                  onChange={(e) => setEditWebsiteUrl(e.target.value)}
                  placeholder="https://brand.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Color Override */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Color Mode Override
                </label>
                <select
                  value={editColorMode}
                  onChange={(e) => setEditColorMode(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Use Section Default ({settings.colorMode})</option>
                  <option value="grayscale-hover-color">Black &amp; White (Color on Hover)</option>
                  <option value="black-white">Always Black &amp; White</option>
                  <option value="monochrome">High Contrast Silhouette</option>
                  <option value="original-color">Always Full Color</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
