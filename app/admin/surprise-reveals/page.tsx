'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  ImagePlus,
  Loader2,
  PartyPopper,
  Plus,
  Trash2,
  Trophy,
  Upload,
  UserRound,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_SURPRISE_SOUND_EFFECT, SURPRISE_SOUND_EFFECTS, type SurpriseSoundEffect } from '@/lib/surprise-reveal-sounds';

interface SurpriseRevealRecord {
  code: string;
  recipientName: string;
  achievement: string;
  message: string;
  imageUrl: string;
  soundEffect: SurpriseSoundEffect;
  createdAt: string;
  shareUrl: string;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Just created'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getSoundEffectLabel(value: SurpriseSoundEffect | undefined) {
  return SURPRISE_SOUND_EFFECTS.find((effect) => effect.value === value)?.label || 'Golden fanfare';
}

function prepareRevealImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const maxSide = 1600;
        const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Image preparation is unavailable.');

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('This image could not be read.'));
    };
    image.src = objectUrl;
  });
}

export default function SurpriseRevealsAdminPage() {
  const [recipientName, setRecipientName] = useState('');
  const [achievement, setAchievement] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [soundEffect, setSoundEffect] = useState<SurpriseSoundEffect>(DEFAULT_SURPRISE_SOUND_EFFECT);
  const [reveals, setReveals] = useState<SurpriseRevealRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingCode, setDeletingCode] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReveals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/surprise-reveals', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to load Surprise Reveals.');
      setReveals(Array.isArray(result.reveals) ? result.reveals : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load Surprise Reveals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReveals();
  }, []);

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image files must be 8MB or smaller.');
      return;
    }

    setUploading(true);
    try {
      const optimizedImage = await prepareRevealImage(file);
      setImageUrl(optimizedImage);

      const response = await fetch('/api/social-share-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: optimizedImage, fileName: file.name }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.error || 'The image could not be uploaded.');

      if (result.url) {
        setImageUrl(result.url);
      }
      toast.success('Photo ready for the reveal.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const createReveal = async () => {
    if (!recipientName.trim() || !achievement.trim() || !imageUrl.trim()) {
      toast.error('Add a name, achievement, and photo before creating the link.');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/surprise-reveals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientName, achievement, message, imageUrl, soundEffect }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.reveal) throw new Error(result.error || 'Unable to create the Surprise Reveal.');

      const record = { ...result.reveal, shareUrl: result.shareUrl } as SurpriseRevealRecord;
      setReveals((current) => [record, ...current]);
      setRecipientName('');
      setAchievement('');
      setMessage('');
      setImageUrl('');
      setSoundEffect(DEFAULT_SURPRISE_SOUND_EFFECT);
      toast.success('Surprise Reveal link is ready.');
      await navigator.clipboard.writeText(record.shareUrl).catch(() => undefined);
      setCopiedCode(record.code);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create the Surprise Reveal.');
    } finally {
      setCreating(false);
    }
  };

  const copyLink = async (reveal: SurpriseRevealRecord) => {
    try {
      await navigator.clipboard.writeText(reveal.shareUrl);
      setCopiedCode(reveal.code);
      toast.success('Reveal link copied.');
      window.setTimeout(() => setCopiedCode((current) => current === reveal.code ? '' : current), 2200);
    } catch {
      toast.error('Could not copy the reveal link.');
    }
  };

  const deleteReveal = async (reveal: SurpriseRevealRecord) => {
    if (!window.confirm(`Remove ${reveal.recipientName}'s Surprise Reveal? This link will stop working.`)) return;

    setDeletingCode(reveal.code);
    try {
      const response = await fetch(`/api/admin/surprise-reveals?code=${encodeURIComponent(reveal.code)}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to remove the Surprise Reveal.');
      setReveals((current) => current.filter((item) => item.code !== reveal.code));
      toast.success('Surprise Reveal removed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to remove the Surprise Reveal.');
    } finally {
      setDeletingCode('');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex min-w-0 items-start gap-3">
            <Link href="/admin" aria-label="Back to admin dashboard" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700"><PartyPopper className="h-4 w-4" /> Celebration Studio</p>
              <h1 className="text-2xl font-black tracking-normal text-slate-950 sm:text-3xl">Surprise Reveals</h1>
              <p className="mt-1 text-sm text-slate-600">Create a personal celebration link that opens with a golden achievement reveal.</p>
            </div>
          </div>
          <a href="#new-reveal" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" /> New reveal
          </a>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
          <section id="new-reveal" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-slate-950"><Trophy className="h-5 w-5" /></span>
              <div><h2 className="font-black text-slate-950">Create a celebration</h2><p className="text-sm text-slate-500">The link starts locked, then reveals the achievement.</p></div>
            </div>

            <div className="space-y-4">
              <label className="block"><span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700"><UserRound className="h-4 w-4 text-amber-700" /> Recipient name</span><input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} maxLength={90} placeholder="Example: Mariama Kamara" className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200" /></label>
              <label className="block"><span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700"><Trophy className="h-4 w-4 text-amber-700" /> Achievement</span><input value={achievement} onChange={(event) => setAchievement(event.target.value)} maxLength={160} placeholder="Example: Staff Member of the Quarter" className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700">Personal message <span className="font-normal text-slate-400">(optional)</span></span><textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} rows={4} placeholder="A short note to make the moment feel personal." className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200" /></label>

              <label className="block"><span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700"><Volume2 className="h-4 w-4 text-amber-700" /> Reveal sound</span><select value={soundEffect} onChange={(event) => setSoundEffect(event.target.value as SurpriseSoundEffect)} className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200">{SURPRISE_SOUND_EFFECTS.map((effect) => <option key={effect.value} value={effect.value}>{effect.label}</option>)}</select></label>

              <div className="border-t border-slate-200 pt-4">
                <div className="mb-2 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-bold text-slate-700"><ImagePlus className="h-4 w-4 text-amber-700" /> Professional photo</span><span className="text-xs text-slate-400">PNG, JPG, WEBP up to 8MB</span></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="Paste an image URL" inputMode="url" className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200" />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60">{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? 'Uploading' : 'Upload'}</button>
                </div>
              </div>
              <button type="button" onClick={createReveal} disabled={creating || uploading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-black text-slate-950 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60"><PartyPopper className="h-4 w-4" />{creating ? 'Creating reveal' : 'Create surprise link'}</button>
            </div>
          </section>

          <section aria-label="Live locked-screen preview" className="overflow-hidden rounded-lg bg-slate-950 p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between text-amber-300"><span className="text-xs font-black uppercase tracking-[0.16em]">Live preview</span><span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-300/30"><PartyPopper className="h-4 w-4" /></span></div>
            <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden border border-amber-300/20 px-5 py-8 text-center">
              <div className="absolute inset-5 border border-amber-100/15" />
              {imageUrl ? <div className="relative z-10 h-16 w-16 overflow-hidden rounded-md border border-amber-200/70 bg-slate-900 p-1 shadow-[0_0_0_7px_rgba(245,158,11,0.08)]"><img src={imageUrl} alt="Reveal preview" className="h-full w-full rounded-[3px] object-cover" /></div> : <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-amber-300/60 text-amber-300"><ImagePlus className="h-5 w-5" /></div>}
              <span className="relative z-10 mt-10 inline-flex min-h-16 min-w-[min(88vw,300px)] items-center justify-center overflow-hidden rounded-md border border-amber-100 bg-amber-400 px-8 text-lg font-black text-slate-950 shadow-[0_12px_0_#a15c11,0_22px_48px_rgba(245,158,11,0.25)]">Your Surprise</span>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-lg font-black text-slate-950">Published reveals</h2><p className="text-sm text-slate-600">Each link opens its own private celebration page.</p></div><button type="button" onClick={() => void loadReveals()} className="text-sm font-bold text-amber-800 hover:text-amber-950">Refresh</button></div>
          {loading ? <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading reveals</div> : reveals.length === 0 ? <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 text-center"><PartyPopper className="mb-3 h-7 w-7 text-amber-600" /><p className="font-bold text-slate-800">No celebrations created yet.</p><p className="mt-1 text-sm text-slate-500">Your first personalized link will appear here.</p></div> : <div className="grid gap-3 lg:grid-cols-2">{reveals.map((reveal) => <article key={reveal.code} className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"><img src={reveal.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-black text-slate-950">{reveal.recipientName}</p><p className="mt-0.5 line-clamp-2 text-sm font-semibold text-amber-800">{reveal.achievement}</p><p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><Volume2 className="h-3.5 w-3.5" /> {getSoundEffectLabel(reveal.soundEffect)}</p><p className="mt-1 text-xs text-slate-500">Created {formatCreatedAt(reveal.createdAt)}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void copyLink(reveal)} aria-label="Copy reveal link" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800">{copiedCode === reveal.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copiedCode === reveal.code ? 'Copied' : 'Copy link'}</button><a href={reveal.shareUrl} target="_blank" rel="noreferrer" aria-label="Open surprise reveal" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"><ExternalLink className="h-4 w-4" /></a><button type="button" onClick={() => void deleteReveal(reveal)} disabled={deletingCode === reveal.code} aria-label={`Delete ${reveal.recipientName}'s surprise reveal`} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50">{deletingCode === reveal.code ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></div></div></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
