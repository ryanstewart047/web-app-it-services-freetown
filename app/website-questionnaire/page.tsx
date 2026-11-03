'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import {
  Building2, User, Mail, Phone, Globe, CheckCircle2, ChevronRight,
  ChevronLeft, Send, Camera, FileText, Settings, Target, Lightbulb,
  ShoppingCart, Calendar, Languages, Search, Share2, DollarSign, Clock,
  Monitor, Layers, HelpCircle
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 – Organisation
  organizationName: string
  contactName: string
  email: string
  phone: string
  websitePurpose: string
  // Step 2 – Content & Brand
  siteType: string
  hasExistingDomain: boolean
  existingDomain: string
  hasExistingBranding: boolean
  brandingDescription: string
  hasHighQualityPhotos: boolean
  photosDescription: string
  hasContent: boolean
  contentDescription: string
  // Step 3 – Technical Requirements
  canMaintainSelf: boolean
  needsCMS: boolean
  needsEcommerce: boolean
  needsBooking: boolean
  needsMultilingual: boolean
  integrations: string
  // Step 4 – Goals & Budget
  targetAudience: string
  competitors: string
  budgetRange: string
  timeline: string
  needsSEO: boolean
  socialMediaLinks: string
  inspirationUrls: string
  additionalNotes: string
}

const INITIAL: FormData = {
  organizationName: '', contactName: '', email: '', phone: '', websitePurpose: '',
  siteType: '', hasExistingDomain: false, existingDomain: '', hasExistingBranding: false,
  brandingDescription: '', hasHighQualityPhotos: false, photosDescription: '', hasContent: false,
  contentDescription: '', canMaintainSelf: false, needsCMS: false, needsEcommerce: false,
  needsBooking: false, needsMultilingual: false, integrations: '', targetAudience: '',
  competitors: '', budgetRange: '', timeline: '', needsSEO: false, socialMediaLinks: '',
  inspirationUrls: '', additionalNotes: '',
}

const TOTAL_STEPS = 4

// ─── Helper components ────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#040e40] mb-1">
      {children} {required && <span className="text-[#ef4444]">*</span>}
    </label>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 focus:border-[#ef4444] transition text-gray-800 placeholder-gray-400 bg-white text-sm"
    />
  )
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/40 focus:border-[#ef4444] transition text-gray-800 placeholder-gray-400 bg-white text-sm resize-none"
    />
  )
}

function Toggle({
  checked, onChange, label, description,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
        checked ? 'border-[#ef4444] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
        checked ? 'border-[#ef4444] bg-[#ef4444]' : 'border-gray-300'
      }`}>
        {checked && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#040e40]">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function SelectCard({
  value, selected, onClick, icon: Icon, label, description,
}: { value: string; selected: boolean; onClick: () => void; icon: React.ElementType; label: string; description: string }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected ? 'border-[#ef4444] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-[#ef4444]' : 'text-gray-400'}`} />
      <p className={`text-sm font-bold ${selected ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{description}</p>
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Organisation / Website Name</Label>
          <Input
            placeholder="e.g. BridgeTech IT Services"
            value={data.organizationName}
            onChange={e => onChange('organizationName', e.target.value)}
          />
        </div>
        <div>
          <Label required>Your Full Name</Label>
          <Input
            placeholder="e.g. Mohamed Kamara"
            value={data.contactName}
            onChange={e => onChange('contactName', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Email Address</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            placeholder="+232 XX XXX XXX"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label required>What is the primary purpose of this website?</Label>
        <Textarea
          placeholder="Describe what the website should do for your organisation. E.g. showcase services, sell products, accept bookings, share news…"
          value={data.websitePurpose}
          onChange={e => onChange('websitePurpose', e.target.value)}
        />
      </div>
    </div>
  )
}

function Step2({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string | boolean) => void }) {
  const siteTypes = [
    { value: 'static',    icon: Monitor,    label: 'Static / Brochure',  description: 'Simple info site, no frequent updates' },
    { value: 'dynamic',   icon: Layers,     label: 'Dynamic / CMS',      description: 'Blog, news, frequently updated content' },
    { value: 'ecommerce', icon: ShoppingCart, label: 'E-Commerce',       description: 'Online store with payments & cart' },
    { value: 'portfolio', icon: Camera,     label: 'Portfolio / Gallery', description: 'Showcase work, photography, art' },
    { value: 'unsure',    icon: HelpCircle, label: 'Not Sure Yet',        description: 'We\'ll recommend the best fit' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Label required>What type of website do you need?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {siteTypes.map(st => (
            <SelectCard
              key={st.value}
              value={st.value}
              selected={data.siteType === st.value}
              onClick={() => onChange('siteType', st.value)}
              icon={st.icon}
              label={st.label}
              description={st.description}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Toggle
          checked={data.hasExistingDomain}
          onChange={v => onChange('hasExistingDomain', v)}
          label="I already have a domain name"
          description="e.g. mycompany.com"
        />
        <Toggle
          checked={data.hasExistingBranding}
          onChange={v => onChange('hasExistingBranding', v)}
          label="We have existing branding"
          description="Logo, brand colours, style guide"
        />
      </div>

      {data.hasExistingDomain && (
        <div>
          <Label>What is your existing domain?</Label>
          <Input
            placeholder="e.g. www.mycompany.com"
            value={data.existingDomain}
            onChange={e => onChange('existingDomain', e.target.value)}
          />
        </div>
      )}

      {data.hasExistingBranding && (
        <div>
          <Label>Tell us about your branding assets</Label>
          <Textarea
            placeholder="Describe or list what you have: logo files, colour hex codes, fonts, style guide PDF…"
            value={data.brandingDescription}
            onChange={e => onChange('brandingDescription', e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Toggle
          checked={data.hasHighQualityPhotos}
          onChange={v => onChange('hasHighQualityPhotos', v)}
          label="We have high-quality photos"
          description="Professional images ready to use on the site"
        />
        <Toggle
          checked={data.hasContent}
          onChange={v => onChange('hasContent', v)}
          label="We have written content ready"
          description="Page copy, service descriptions, articles…"
        />
      </div>

      {data.hasHighQualityPhotos && (
        <div>
          <Label>Describe your photo assets</Label>
          <Textarea
            placeholder="What photos do you have? Product shots, team photos, location images…"
            value={data.photosDescription}
            onChange={e => onChange('photosDescription', e.target.value)}
          />
        </div>
      )}

      {data.hasContent && (
        <div>
          <Label>Describe your written content</Label>
          <Textarea
            placeholder="What text content is ready? Home page, about us, service descriptions…"
            value={data.contentDescription}
            onChange={e => onChange('contentDescription', e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

function Step3({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">Select all features your website will need.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Toggle
          checked={data.needsCMS}
          onChange={v => onChange('needsCMS', v)}
          label="Content Management System (CMS)"
          description="Ability to update pages, blogs, or products yourself"
        />
        <Toggle
          checked={data.needsEcommerce}
          onChange={v => onChange('needsEcommerce', v)}
          label="E-Commerce / Online Payments"
          description="Shopping cart, checkout, payment gateway"
        />
        <Toggle
          checked={data.needsBooking}
          onChange={v => onChange('needsBooking', v)}
          label="Online Booking / Appointments"
          description="Customers book services or slots online"
        />
        <Toggle
          checked={data.needsMultilingual}
          onChange={v => onChange('needsMultilingual', v)}
          label="Multi-language Support"
          description="Site available in more than one language"
        />
        <Toggle
          checked={data.needsSEO}
          onChange={v => onChange('needsSEO', v)}
          label="SEO Optimisation"
          description="Improve visibility on Google and other search engines"
        />
        <Toggle
          checked={data.canMaintainSelf}
          onChange={v => onChange('canMaintainSelf', v)}
          label="We can manage the site ourselves"
          description="Your team has technical capacity to update content"
        />
      </div>

      <div>
        <Label>Third-party integrations needed</Label>
        <Textarea
          placeholder="e.g. WhatsApp chat, Google Maps, social media feeds, email newsletter, CRM, payment gateway (Stripe, PayPal)…"
          value={data.integrations}
          onChange={e => onChange('integrations', e.target.value)}
        />
      </div>
    </div>
  )
}

const BUDGET_OPTIONS = [
  { value: 'under-1000',  label: 'Under \$1,000',   desc: 'Basic / starter site' },
  { value: '1000-3000',   label: '\$1,000 – \$3,000', desc: 'Small business site' },
  { value: '3000-10000',  label: '\$3,000 – \$10,000',desc: 'Professional / feature-rich' },
  { value: '10000+',      label: '\$10,000+',         desc: 'Enterprise / complex system' },
  { value: 'flexible',    label: 'Flexible',          desc: 'Open to recommendations' },
]

const TIMELINE_OPTIONS = [
  { value: 'urgent-2weeks', label: 'ASAP (< 2 weeks)', desc: 'Rush delivery needed' },
  { value: '1-month',       label: '1 Month',          desc: 'Standard pace' },
  { value: '2-3-months',    label: '2–3 Months',       desc: 'Thorough build' },
  { value: 'flexible',      label: 'Flexible',         desc: 'No strict deadline' },
]

function Step4({ data, onChange }: { data: FormData; onChange: (k: keyof FormData, v: string | boolean) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Who is your target audience?</Label>
        <Textarea
          placeholder="Describe your ideal visitors or customers. Include age range, location, interests, what problem they have that you solve…"
          value={data.targetAudience}
          onChange={e => onChange('targetAudience', e.target.value)}
        />
      </div>

      <div>
        <Label>Competitor or inspiration websites</Label>
        <Textarea
          placeholder="List any websites you admire or that are similar to what you want. Even one or two URLs helps a lot."
          value={data.competitors}
          onChange={e => onChange('competitors', e.target.value)}
        />
      </div>

      <div>
        <Label>Budget Range</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {BUDGET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('budgetRange', opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                data.budgetRange === opt.value
                  ? 'border-[#ef4444] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className={`text-xs font-bold ${data.budgetRange === opt.value ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Preferred Timeline</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {TIMELINE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('timeline', opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                data.timeline === opt.value
                  ? 'border-[#ef4444] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className={`text-xs font-bold ${data.timeline === opt.value ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Social media pages / handles</Label>
        <Textarea
          rows={2}
          placeholder="Facebook, Instagram, LinkedIn, X/Twitter — paste links or handles"
          value={data.socialMediaLinks}
          onChange={e => onChange('socialMediaLinks', e.target.value)}
        />
      </div>

      <div>
        <Label>Anything else we should know?</Label>
        <Textarea
          rows={4}
          placeholder="Special requirements, important deadlines, accessibility needs, or anything else you'd like us to consider…"
          value={data.additionalNotes}
          onChange={e => onChange('additionalNotes', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STEP_META = [
  { title: 'Your Organisation',      icon: Building2,  subtitle: 'Tell us who you are and what you need' },
  { title: 'Content & Brand',        icon: Camera,     subtitle: 'What assets and content do you already have?' },
  { title: 'Technical Requirements', icon: Settings,   subtitle: 'What features does your site need?' },
  { title: 'Goals & Budget',         icon: Target,     subtitle: 'Help us scope the project correctly' },
]

export default function WebsiteQuestionnairePage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function update(key: keyof FormData, value: string | boolean) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function validateStep(s: number): string | null {
    if (s === 1) {
      if (!data.organizationName.trim()) return 'Please enter your organisation or website name.'
      if (!data.contactName.trim())      return 'Please enter your full name.'
      if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Please enter a valid email address.'
      if (!data.websitePurpose.trim())   return 'Please describe the purpose of the website.'
    }
    if (s === 2) {
      if (!data.siteType) return 'Please select a website type.'
    }
    return null
  }

  function next() {
    const err = validateStep(step)
    if (err) { toast.error(err); return }
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setStep(s => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submit() {
    const err = validateStep(step)
    if (err) { toast.error(err); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/website-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Submission failed')
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const StepIcon = STEP_META[step - 1].icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040e40] via-[#0a1a5c] to-[#040e40]">
      <Toaster position="top-center" />

      {/* ─── Header ─── */}
      <header className="w-full bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="https://www.itservicesfreetown.com" target="_blank" rel="noreferrer">
            <Image src="/assets/logo-dark.svg" alt="BridgeTech IT Services" width={160} height={40} className="h-10 w-auto" />
          </a>
          <div className="text-right hidden sm:block">
            <p className="text-white/60 text-xs">Questions? Call us</p>
            <a href="tel:+23233399391" className="text-[#ef4444] font-bold text-sm">+232 33 399 391</a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">

        {submitted ? (
          /* ─── Success screen ─── */
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#040e40] mb-3">
              Thank You — We&apos;ve Got Your Brief!
            </h1>
            <p className="text-gray-600 mb-2">
              Your questionnaire has been submitted successfully. Our team at <strong>BridgeTech IT Services</strong> will review your requirements and get back to you within <strong>1–2 business days</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              If you have urgent needs, give us a call at{' '}
              <a href="tel:+23233399391" className="text-[#ef4444] font-semibold">+232 33 399 391</a>.
            </p>
            <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-2 mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Our Details</p>
              <p className="text-sm text-gray-700">📍 #1 Regent Highway, Jui Junction, Freetown, Sierra Leone</p>
              <p className="text-sm text-gray-700">📞 +232 33 399 391</p>
              <p className="text-sm text-gray-700">✉️ info@itservicesfreetown.com</p>
              <p className="text-sm text-gray-700">🌐 www.itservicesfreetown.com</p>
            </div>
            <a
              href="https://www.itservicesfreetown.com"
              className="inline-block px-8 py-3 rounded-xl bg-[#040e40] text-white font-bold text-sm hover:bg-[#0a1a5c] transition"
            >
              Back to Homepage
            </a>
          </div>
        ) : (
          <>
            {/* ─── Hero title ─── */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Website Development<br />
                <span className="text-[#ef4444]">Project Brief</span>
              </h1>
              <p className="text-white/60 mt-3 text-sm max-w-md mx-auto">
                Fill this out so we can understand exactly what you need and give you an accurate quote. Takes about 5 minutes.
              </p>
            </div>

            {/* ─── Progress bar ─── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                {STEP_META.map((s, i) => {
                  const n = i + 1
                  const active = n === step
                  const done   = n < step
                  const Icon   = s.icon
                  return (
                    <div key={n} className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-bold text-sm border-2 ${
                        done   ? 'bg-[#ef4444] border-[#ef4444] text-white' :
                        active ? 'bg-white border-[#ef4444] text-[#ef4444]' :
                                 'bg-white/10 border-white/20 text-white/40'
                      }`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <p className={`text-xs font-semibold hidden sm:block text-center ${active ? 'text-white' : done ? 'text-[#ef4444]' : 'text-white/30'}`}>
                        {s.title}
                      </p>
                      {i < STEP_META.length - 1 && (
                        <div className="absolute hidden" />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#ef4444] rounded-full transition-all duration-500"
                  style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                />
              </div>
              <p className="text-white/40 text-xs text-center mt-2">Step {step} of {TOTAL_STEPS}</p>
            </div>

            {/* ─── Form card ─── */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Card header */}
              <div className="bg-gradient-to-r from-[#040e40] to-[#0a1a5c] px-6 py-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center">
                  <StepIcon className="w-5 h-5 text-[#ef4444]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">{STEP_META[step - 1].title}</h2>
                  <p className="text-white/50 text-xs">{STEP_META[step - 1].subtitle}</p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 sm:p-8">
                {step === 1 && <Step1 data={data} onChange={update} />}
                {step === 2 && <Step2 data={data} onChange={update} />}
                {step === 3 && <Step3 data={data} onChange={update} />}
                {step === 4 && <Step4 data={data} onChange={update} />}
              </div>

              {/* Card footer / navigation */}
              <div className="px-6 sm:px-8 pb-6 flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-bold shadow-md shadow-red-200 transition"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#040e40] hover:bg-[#0a1a5c] text-white text-sm font-bold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Brief</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* ─── Footer note ─── */}
            <p className="text-white/30 text-xs text-center mt-6">
              Your information is private and only used to scope your project. We never share it with third parties.
            </p>
          </>
        )}
      </main>

      {/* ─── Bottom footer ─── */}
      <footer className="bg-black/20 border-t border-white/5 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo-dark.svg" alt="BridgeTech" width={110} height={28} className="h-7 w-auto opacity-70" />
            <span className="text-white/20 text-xs">|</span>
            <span className="text-white/40 text-xs">#1 Regent Highway, Jui Junction, Freetown</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+23233399391" className="text-white/50 hover:text-white text-xs transition">+232 33 399 391</a>
            <a href="mailto:info@itservicesfreetown.com" className="text-white/50 hover:text-white text-xs transition">info@itservicesfreetown.com</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
