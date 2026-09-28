'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, CreditCard, Headphones, LockKeyhole, Monitor, ShieldCheck, Smartphone, UsersRound, Wifi } from 'lucide-react';

const services = [
  ['Remote Quick Fix', 'Up to 30 minutes for email, software, printer, Wi-Fi, or performance issues.', 'Best for one clear problem'],
  ['Remote Full Support', 'Up to 90 minutes for deeper troubleshooting, setup, cleanup, or guided recovery.', 'For complex device issues'],
  ['Business Remote Care', 'Priority help desk, user setup, maintenance, backup, and security support for your team.', 'Monthly business support'],
  ['After-hours Emergency', 'Priority response for urgent business disruption, subject to technician availability.', 'Emergency support'],
];

export default function RemoteSupportPage() {
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', deviceType: 'Windows PC', deviceModel: '', service: 'Remote Quick Fix', issueDescription: '', preferredTime: '', paymentMethod: 'Afrimoney Merchant Pay', consentAccepted: false });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const update = (field: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setState('sending');
    try {
      const response = await fetch('/api/remote-support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error();
      setState('sent');
    } catch {
      setState('error');
    }
  }

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="bg-[#040e40] px-4 py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />Secure remote IT help</span>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">Expert tech support, wherever you are.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">Get a BridgeTech technician to safely troubleshoot your computer, software, email, Wi-Fi, and business technology without visiting our workshop.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#request" className="rounded-xl bg-red-600 px-6 py-3 font-bold hover:bg-red-700">Request remote help</a><a href="https://wa.me/23233399391" className="rounded-xl border border-white/30 px-6 py-3 font-bold hover:bg-white/10">WhatsApp us</a></div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl backdrop-blur">
            <ShieldCheck className="h-11 w-11 text-cyan-300" />
            <h2 className="mt-4 text-xl font-black">You stay in control</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-200"><li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />You approve every attended session.</li><li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />We never ask for bank, mobile-money, or account passwords.</li><li className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />A secure connection link or code is sent only after booking.</li></ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16"><div className="text-center"><h2 className="text-3xl font-black">Remote services for home and business</h2><p className="mt-3 text-slate-600">Fast help for the technology problems that do not need a workshop visit.</p></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[[Monitor, 'Computer tune-ups', 'Slow PCs, updates, software installation, and cleanup.'], [Wifi, 'Network & Wi-Fi', 'Internet, router, printer, and shared-device troubleshooting.'], [LockKeyhole, 'Security & backup', 'Malware assessment, updates, account safety, and backup setup.'], [UsersRound, 'Business IT care', 'Remote help desk and maintenance for your team.']].map(([Icon, title, description]) => { const FeatureIcon = Icon as typeof Monitor; return <div key={title as string} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><FeatureIcon className="h-7 w-7 text-red-600" /><h3 className="mt-4 font-bold">{title as string}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{description as string}</p></div> })}</div></section>

      <section className="bg-white px-4 py-16"><div className="mx-auto max-w-6xl"><h2 className="text-center text-3xl font-black">Choose the right support level</h2><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">{services.map(([title, description, note]) => <div key={title} className="rounded-2xl border border-slate-200 p-6"><Headphones className="h-7 w-7 text-red-600" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p><p className="mt-5 text-xs font-bold uppercase tracking-wide text-red-600">{note}</p></div>)}</div></div></section>

      <section id="request" className="px-4 py-16"><div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[.75fr_1.25fr]"><aside><h2 className="text-3xl font-black">Request a session</h2><p className="mt-3 leading-relaxed text-slate-600">Tell us what is happening. We will confirm the scope, price, payment instructions, and the secure support method before connecting.</p><div className="mt-7 space-y-4 text-sm"><p className="flex gap-3"><Clock3 className="h-5 w-5 text-red-600" />Scheduled support and urgent requests</p><p className="flex gap-3"><CreditCard className="h-5 w-5 text-red-600" />Afrimoney Merchant Pay, Orange Money, or bank transfer</p><p className="flex gap-3"><Smartphone className="h-5 w-5 text-red-600" />Windows, Mac, Android, and guided iPhone support</p></div><Link href="/privacy" className="mt-8 inline-block text-sm font-bold text-red-600 hover:underline">Read our privacy policy</Link></aside>
        {state === 'sent' ? <div className="rounded-2xl bg-emerald-50 p-8 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><h3 className="mt-4 text-2xl font-black">Request received</h3><p className="mt-2 text-slate-600">We will contact you to confirm your session and payment instructions. Do not download remote-access software until we do.</p></div> : <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><input required placeholder="Full name" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} className="rounded-xl border p-3" /><input required type="email" placeholder="Email address" value={form.email} onChange={(e) => update('email', e.target.value)} className="rounded-xl border p-3" /></div><div className="grid gap-4 sm:grid-cols-2"><input required placeholder="Phone / WhatsApp number" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="rounded-xl border p-3" /><input placeholder="Device brand/model" value={form.deviceModel} onChange={(e) => update('deviceModel', e.target.value)} className="rounded-xl border p-3" /></div><div className="grid gap-4 sm:grid-cols-2"><select value={form.deviceType} onChange={(e) => update('deviceType', e.target.value)} className="rounded-xl border p-3">{['Windows PC', 'Mac', 'Android phone/tablet', 'iPhone/iPad', 'Network / Wi-Fi', 'Other'].map((item) => <option key={item}>{item}</option>)}</select><select value={form.service} onChange={(e) => update('service', e.target.value)} className="rounded-xl border p-3">{services.map(([item]) => <option key={item}>{item}</option>)}</select></div><textarea required minLength={10} rows={5} placeholder="Describe the problem and any error messages" value={form.issueDescription} onChange={(e) => update('issueDescription', e.target.value)} className="w-full rounded-xl border p-3" /><div className="grid gap-4 sm:grid-cols-2"><input placeholder="Preferred date/time" value={form.preferredTime} onChange={(e) => update('preferredTime', e.target.value)} className="rounded-xl border p-3" /><select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className="rounded-xl border p-3">{['Afrimoney Merchant Pay', 'Orange Money', 'Bank transfer', 'Need advice'].map((item) => <option key={item}>{item}</option>)}</select></div><label className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm"><input required type="checkbox" checked={form.consentAccepted} onChange={(e) => update('consentAccepted', e.target.checked)} className="mt-1" />I understand I must approve the session and will not share passwords, PINs, one-time codes, or banking/mobile-money details.</label>{state === 'error' && <p className="text-sm text-red-600">We could not submit this request. Please try again or contact us on WhatsApp.</p>}<button disabled={state === 'sending'} className="w-full rounded-xl bg-[#040e40] py-3 font-bold text-white disabled:opacity-60">{state === 'sending' ? 'Sending request…' : 'Request secure remote support'}</button></form>}</div></section>
    </main>
  );
}
