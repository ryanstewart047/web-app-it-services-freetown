'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import {
  Building2, User, Mail, Phone, Globe, CheckCircle2, ChevronRight,
  ChevronLeft, Send, Camera, FileText, Settings, Target, Lightbulb,
  ShoppingCart, Calendar, Languages, Search, Share2, DollarSign, Clock,
  Monitor, Layers, HelpCircle, Download, CheckCircle, MailCheck,
  Palette, AlertCircle, Sparkles, Server, MessageSquare, Paintbrush
} from 'lucide-react'
import { downloadQuestionnairePDF, downloadBlankQuestionnairePDF } from '@/lib/website-questionnaire-pdf'

// ─── Types ───────────────────────────────────────────────────────────────────

interface BrandColors {
  primary: string
  secondary: string
  accent: string
}

interface FormData {
  // Step 1 – Organisation & Contact
  organizationName: string
  contactName: string
  email: string
  phone: string
  preferredContactMethod: 'whatsapp' | 'email' | 'phone'
  websitePurpose: string

  // Step 2 – Content, Brand & Domain
  siteType: string
  domainStatus: 'have-domain' | 'need-domain' | 'unsure'
  hasExistingDomain: boolean
  existingDomain: string
  hasExistingBranding: boolean
  brandingDescription: string
  brandColors: BrandColors
  hasHighQualityPhotos: boolean
  photosDescription: string
  hasContent: boolean
  contentDescription: string
  wantsContentWriting: boolean
  wantsGraphicDesign: boolean

  // Step 3 – Technical Requirements & Scope
  pageCount: '1-landing' | '3-5-pages' | '6-10-pages' | '10-plus' | 'unsure'
  needsHosting: boolean
  canMaintainSelf: boolean
  needsCMS: boolean
  needsEcommerce: boolean
  needsBooking: boolean
  needsMultilingual: boolean
  needsSEO: boolean
  integrations: string

  // Step 4 – Goals, Schedule & Budget
  targetAudience: string
  competitors: string
  budgetRange: string
  timeline: string
  targetDeadline: string
  socialMediaLinks: string
  inspirationUrls: string
  additionalNotes: string
}

const INITIAL: FormData = {
  organizationName: '',
  contactName: '',
  email: '',
  phone: '',
  preferredContactMethod: 'whatsapp',
  websitePurpose: '',

  siteType: '',
  domainStatus: 'need-domain',
  hasExistingDomain: false,
  existingDomain: '',
  hasExistingBranding: false,
  brandingDescription: '',
  brandColors: {
    primary: '#040e40',
    secondary: '#ef4444',
    accent: '#3b82f6',
  },
  hasHighQualityPhotos: false,
  photosDescription: '',
  hasContent: false,
  contentDescription: '',
  wantsContentWriting: false,
  wantsGraphicDesign: false,

  pageCount: '3-5-pages',
  needsHosting: true,
  canMaintainSelf: false,
  needsCMS: false,
  needsEcommerce: false,
  needsBooking: false,
  needsMultilingual: false,
  needsSEO: true,
  integrations: '',

  targetAudience: '',
  competitors: '',
  budgetRange: '',
  timeline: '',
  targetDeadline: '',
  socialMediaLinks: '',
  inspirationUrls: '',
  additionalNotes: '',
}

const TOTAL_STEPS = 4

// ─── UI Helper Components ─────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#040e40] mb-1.5">
      {children} {required && <span className="text-[#ef4444] font-bold">*</span>}
    </label>
  )
}

function Input({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div>
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl border transition text-gray-800 placeholder-gray-400 bg-white text-sm shadow-sm focus:outline-none ${
          error
            ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20 focus:border-[#ef4444] focus:ring-[#ef4444]/40 bg-red-50/20'
            : 'border-gray-200 focus:ring-2 focus:ring-[#ef4444]/40 focus:border-[#ef4444]'
        }`}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#ef4444]" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

function Textarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <div>
      <textarea
        rows={3}
        {...props}
        className={`w-full px-4 py-3 rounded-xl border transition text-gray-800 placeholder-gray-400 bg-white text-sm resize-none shadow-sm focus:outline-none ${
          error
            ? 'border-[#ef4444] ring-2 ring-[#ef4444]/20 focus:border-[#ef4444] focus:ring-[#ef4444]/40 bg-red-50/20'
            : 'border-gray-200 focus:ring-2 focus:ring-[#ef4444]/40 focus:border-[#ef4444]'
        }`}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#ef4444]" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

function Toggle({
  checked, onChange, label, description, badge,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; badge?: string }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
        checked ? 'border-[#ef4444] bg-red-50/60 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
        checked ? 'border-[#ef4444] bg-[#ef4444]' : 'border-gray-300 bg-white'
      }`}>
        {checked && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[#040e40]">{label}</p>
          {badge && (
            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
      </div>
    </div>
  )
}

function SelectCard({
  selected, onClick, icon: Icon, label, description,
}: { selected: boolean; onClick: () => void; icon: React.ElementType; label: string; description: string }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected ? 'border-[#ef4444] bg-red-50/60 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <Icon className={`w-5 h-5 mb-2 ${selected ? 'text-[#ef4444]' : 'text-gray-400'}`} />
      <p className={`text-sm font-bold ${selected ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>{label}</p>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
  )
}

// ─── Step 1: Organisation & Contact ──────────────────────────────────────────

function Step1({ data, errors, onChange }: { data: FormData; errors: Record<string, string>; onChange: (k: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label required>Organisation / Website Name</Label>
          <Input
            placeholder="e.g. BridgeTech IT Services"
            value={data.organizationName}
            error={errors.organizationName}
            onChange={e => onChange('organizationName', e.target.value)}
          />
        </div>
        <div>
          <Label required>Your Full Name</Label>
          <Input
            placeholder="e.g. Mohamed Kamara"
            value={data.contactName}
            error={errors.contactName}
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
            error={errors.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label>Phone / WhatsApp Number</Label>
          <Input
            type="tel"
            placeholder="+232 33 399 391"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Preferred Contact Method</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {[
            { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, desc: 'Instant chat' },
            { value: 'phone',    label: 'Phone Call', icon: Phone,        desc: 'Direct voice' },
            { value: 'email',    label: 'Email',      icon: Mail,         desc: 'Formal writeup' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('preferredContactMethod', opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                data.preferredContactMethod === opt.value
                  ? 'border-[#ef4444] bg-red-50/70 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <opt.icon className={`w-4 h-4 ${data.preferredContactMethod === opt.value ? 'text-[#ef4444]' : 'text-gray-400'}`} />
                <span className={`text-xs font-bold ${data.preferredContactMethod === opt.value ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>
                  {opt.label}
                </span>
              </div>
              <p className="text-[11px] text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label required>What is the primary purpose of this website?</Label>
        <Textarea
          rows={3}
          placeholder="Describe what the website should achieve for your organisation (e.g. showcase our consulting services, sell clothing online, allow clients to book appointments, recruit staff, or publish news and updates)…"
          value={data.websitePurpose}
          error={errors.websitePurpose}
          onChange={e => onChange('websitePurpose', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Step 2: Content, Brand & Domain ──────────────────────────────────────────

const PRESET_PALETTES = [
  { name: 'BridgeTech Classic', primary: '#040e40', secondary: '#ef4444', accent: '#3b82f6' },
  { name: 'Emerald Growth',     primary: '#064e3b', secondary: '#10b981', accent: '#f59e0b' },
  { name: 'Corporate Slate',    primary: '#0f172a', secondary: '#2563eb', accent: '#38bdf8' },
  { name: 'Royal Sunset',       primary: '#311042', secondary: '#f97316', accent: '#ec4899' },
]

function Step2({ data, errors, onChange }: { data: FormData; errors: Record<string, string>; onChange: (k: keyof FormData, v: any) => void }) {
  const siteTypes = [
    { value: 'static',    icon: Monitor,      label: 'Static / Brochure',  description: 'Clean company presentation, fast and minimal updates' },
    { value: 'dynamic',   icon: Layers,       label: 'Dynamic / CMS',      description: 'Blog, news portal, frequently updated services' },
    { value: 'ecommerce', icon: ShoppingCart, label: 'E-Commerce Store',   description: 'Online catalog with shopping cart & payment gateway' },
    { value: 'portfolio', icon: Camera,       label: 'Portfolio / Media',  description: 'Creative work showcase, photography, high-res gallery' },
    { value: 'unsure',    icon: HelpCircle,   label: 'Help Us Choose',     description: 'We will recommend the best fit based on your brief' },
  ]

  const domainOptions = [
    {
      value: 'have-domain',
      label: 'I already have a domain name',
      desc: 'You registered it (e.g. mycompany.com)',
    },
    {
      value: 'need-domain',
      label: "We don't have a domain name yet",
      desc: 'We want BridgeTech to register one for us',
    },
    {
      value: 'unsure',
      label: 'Not sure / Need advice',
      desc: 'Help us choose the best available domain',
    },
  ]

  return (
    <div className="space-y-6">
      {/* ─── Website Type ─── */}
      <div>
        <Label required>What type of website do you need?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1.5">
          {siteTypes.map(st => (
            <SelectCard
              key={st.value}
              selected={data.siteType === st.value}
              onClick={() => onChange('siteType', st.value)}
              icon={st.icon}
              label={st.label}
              description={st.description}
            />
          ))}
        </div>
        {errors.siteType && (
          <p className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold mt-2.5 bg-red-50 border border-red-200 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444]" />
            <span>{errors.siteType}</span>
          </p>
        )}
      </div>

      {/* ─── Domain Name Section ─── */}
      <div className="pt-2 border-t border-gray-100">
        <Label required>Domain Name Status (Web Address)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1.5">
          {domainOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                onChange('domainStatus', opt.value)
                onChange('hasExistingDomain', opt.value === 'have-domain')
              }}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none ${
                data.domainStatus === opt.value
                  ? 'border-[#ef4444] bg-red-50/70 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  data.domainStatus === opt.value ? 'border-[#ef4444] bg-[#ef4444]' : 'border-gray-300'
                }`}>
                  {data.domainStatus === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <p className="text-xs font-bold text-[#040e40]">{opt.label}</p>
              </div>
              <p className="text-[11px] text-gray-500 pl-6 leading-tight">{opt.desc}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Domain Input based on selection */}
        {data.domainStatus === 'have-domain' && (
          <div className="mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <Label required>What is your existing domain?</Label>
            <Input
              placeholder="e.g. www.mycompany.com"
              value={data.existingDomain}
              error={errors.existingDomain}
              onChange={e => onChange('existingDomain', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">We will help you connect your existing registrar DNS to our server.</p>
          </div>
        )}

        {data.domainStatus === 'need-domain' && (
          <div className="mt-3 bg-amber-50/70 p-4 rounded-xl border border-amber-200/80">
            <Label>What domain name would you like to register?</Label>
            <Input
              placeholder="e.g. mycompany.com or mybusiness.sl"
              value={data.existingDomain}
              onChange={e => onChange('existingDomain', e.target.value)}
            />
            <div className="flex items-start gap-2 mt-2 text-xs text-amber-900 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Registering a new domain name involves an <strong>annual registry fee</strong> (typically $15–$50/yr depending on extension e.g. .com, .org, or .sl), billed separately from web development.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Existing Branding & Color Picker ─── */}
      <div className="pt-2 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Toggle
            checked={data.hasExistingBranding}
            onChange={v => onChange('hasExistingBranding', v)}
            label="We have existing branding"
            description="Logo, brand colours, fonts, or style guide"
          />
          <Toggle
            checked={data.hasHighQualityPhotos}
            onChange={v => onChange('hasHighQualityPhotos', v)}
            label="We have high-quality photos ready"
            description="Professional photos of team, products, or office"
          />
        </div>

        {/* Color picker appears when branding is checked */}
        {data.hasExistingBranding && (
          <div className="mt-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#ef4444]" />
                <Label>Brand Colours (Pick or enter HEX codes)</Label>
              </div>
              <span className="text-xs text-gray-500">Click a swatch to adjust</span>
            </div>

            {/* Live 3-Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Primary Color */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-600 block mb-1.5">Primary Color (Header / Navy)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.brandColors.primary}
                    onChange={e => onChange('brandColors', { ...data.brandColors, primary: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={data.brandColors.primary}
                    onChange={e => onChange('brandColors', { ...data.brandColors, primary: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 font-mono text-xs border border-gray-200 rounded-lg text-gray-800 uppercase"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-600 block mb-1.5">Secondary Color (Accent / Red)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.brandColors.secondary}
                    onChange={e => onChange('brandColors', { ...data.brandColors, secondary: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={data.brandColors.secondary}
                    onChange={e => onChange('brandColors', { ...data.brandColors, secondary: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 font-mono text-xs border border-gray-200 rounded-lg text-gray-800 uppercase"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-600 block mb-1.5">Highlight / Accent Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.brandColors.accent}
                    onChange={e => onChange('brandColors', { ...data.brandColors, accent: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={data.brandColors.accent}
                    onChange={e => onChange('brandColors', { ...data.brandColors, accent: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 font-mono text-xs border border-gray-200 rounded-lg text-gray-800 uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Quick Preset Palettes */}
            <div>
              <span className="text-xs text-gray-500 font-semibold block mb-1.5">Or select a quick palette preset:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_PALETTES.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => onChange('brandColors', { primary: p.primary, secondary: p.secondary, accent: p.accent })}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-gray-400 text-xs text-gray-700 transition"
                  >
                    <span className="flex -space-x-1">
                      <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.secondary }} />
                      <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.accent }} />
                    </span>
                    <span className="text-[11px] font-medium">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Logo files & brand style notes</Label>
              <Textarea
                rows={2}
                placeholder="Mention what file formats you have (PNG, SVG, AI, PDF) or link to your logo/Google Drive folder…"
                value={data.brandingDescription}
                onChange={e => onChange('brandingDescription', e.target.value)}
              />
            </div>
          </div>
        )}

        {data.hasHighQualityPhotos && (
          <div className="mt-3">
            <Label>Describe your photo assets</Label>
            <Textarea
              rows={2}
              placeholder="What photos do you have? Team headshots, facility photos, finished project gallery, high-res stock photography…"
              value={data.photosDescription}
              onChange={e => onChange('photosDescription', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ─── Content Readiness & Add-on Services ─── */}
      <div className="pt-2 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Toggle
            checked={data.hasContent}
            onChange={v => onChange('hasContent', v)}
            label="We have written content ready"
            description="Our team already drafted page text and descriptions"
          />
          <Toggle
            checked={data.wantsContentWriting}
            onChange={v => onChange('wantsContentWriting', v)}
            label="We want the developer to write content for us"
            description="Professional copywriting & SEO page text creation"
            badge="Add-on"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Toggle
            checked={data.wantsGraphicDesign}
            onChange={v => onChange('wantsGraphicDesign', v)}
            label="We want developer to design graphics for us"
            description="Custom website banners, infographics & photo retouching"
            badge="Add-on"
          />
        </div>

        {data.hasContent && (
          <div className="mt-3">
            <Label>Describe your ready written content</Label>
            <Textarea
              rows={2}
              placeholder="What text is ready? Home page message, About Us history, service list, staff bios…"
              value={data.contentDescription}
              onChange={e => onChange('contentDescription', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ─── EXTRA COST NOTICE BANNER ─── */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
              Important Notice Regarding Specialized Add-on Services
            </h4>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
              Base website development covers responsive frontend coding, system architecture, page styling, and testing.
              Please note that the following specialized services carry an <strong>extra fee</strong>:
            </p>
            <ul className="text-xs text-amber-950/90 mt-2 space-y-1 list-disc pl-4 leading-relaxed font-medium">
              <li><strong>Domain Name Registration:</strong> Annual registry fee ($15–$50/yr depending on .com, .org, .sl).</li>
              <li><strong>Content Writing & Copywriting:</strong> Industry-specific copywriting, editing, and content formatting.</li>
              <li><strong>Custom Graphic Design:</strong> Brand logo creation/refinement, custom banners, vector icons, and photo retouching.</li>
            </ul>
            <p className="text-[11px] text-amber-800 mt-2 italic">
              Our team will outline transparent, itemized line items for each requested add-on in your official quotation.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Technical Features & Scope ───────────────────────────────────────

function Step3({ data, errors, onChange }: { data: FormData; errors: Record<string, string>; onChange: (k: keyof FormData, v: any) => void }) {
  const pageCountOptions = [
    { value: '1-landing', label: '1 Page', desc: 'Single-page landing or micro-site' },
    { value: '3-5-pages', label: '3 – 5 Pages', desc: 'Standard business (Home, About, Services, Contact)' },
    { value: '6-10-pages', label: '6 – 10 Pages', desc: 'Detailed catalog or multi-service showcase' },
    { value: '10-plus', label: '10+ Pages', desc: 'Large corporate portal, institute, or platform' },
    { value: 'unsure', label: 'Not Sure Yet', desc: 'We will recommend based on your goals' },
  ]

  return (
    <div className="space-y-6">
      {/* ─── Estimated Page Count ─── */}
      <div>
        <Label required>Estimated Website Size (Number of Pages)</Label>
        <p className="text-xs text-gray-500 mb-2">Help us scope the size and architecture of your website.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {pageCountOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('pageCount', opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                data.pageCount === opt.value
                  ? 'border-[#ef4444] bg-red-50/70 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className={`text-xs font-bold ${data.pageCount === opt.value ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>
                {opt.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>
        {errors.pageCount && (
          <p className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold mt-2.5 bg-red-50 border border-red-200 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444]" />
            <span>{errors.pageCount}</span>
          </p>
        )}
      </div>

      {/* ─── Core Features ─── */}
      <div className="pt-2 border-t border-gray-100">
        <Label>Select all features and capabilities your website will need:</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <Toggle
            checked={data.needsHosting}
            onChange={v => onChange('needsHosting', v)}
            label="Cloud Hosting & Custom Business Email"
            description="Fast reliable server setup with custom email accounts (e.g. info@yourcompany.com)"
            badge="Recommended"
          />
          <Toggle
            checked={data.needsCMS}
            onChange={v => onChange('needsCMS', v)}
            label="Content Management System (CMS)"
            description="Admin dashboard to add blog posts, services, or products yourself"
          />
          <Toggle
            checked={data.needsEcommerce}
            onChange={v => onChange('needsEcommerce', v)}
            label="E-Commerce / Online Store & Payments"
            description="Product catalog, shopping cart, checkout, and payment gateways"
          />
          <Toggle
            checked={data.needsBooking}
            onChange={v => onChange('needsBooking', v)}
            label="Online Booking & Appointments"
            description="Clients can book calendar slots, consultations, or services"
          />
          <Toggle
            checked={data.needsMultilingual}
            onChange={v => onChange('needsMultilingual', v)}
            label="Multi-language Support"
            description="Site translated into multiple languages (e.g. English, French, Krio)"
          />
          <Toggle
            checked={data.needsSEO}
            onChange={v => onChange('needsSEO', v)}
            label="Search Engine Optimisation (SEO)"
            description="Meta tags, schema markup, and Google Search indexing setup"
          />
          <Toggle
            checked={data.canMaintainSelf}
            onChange={v => onChange('canMaintainSelf', v)}
            label="We can maintain the site ourselves"
            description="Your team has staff to update content once delivered"
          />
        </div>
      </div>

      {/* ─── Third-Party Integrations ─── */}
      <div className="pt-2 border-t border-gray-100">
        <Label>Third-party integrations needed</Label>
        <Textarea
          rows={3}
          placeholder="e.g. Floating WhatsApp chat widget, Google Maps location pin, social media feeds, newsletter signup (Mailchimp), CRM, payment gateways (Orange Money, Afrimoney, Stripe, PayPal)…"
          value={data.integrations}
          onChange={e => onChange('integrations', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Step 4: Goals, Budget & Schedule ─────────────────────────────────────────

const BUDGET_OPTIONS = [
  { value: '200-500',    label: '$200 – $500',      desc: 'Starter / One-Page Landing / Micro-site' },
  { value: '500-1000',   label: '$500 – $1,000',    desc: 'Small Business / Multi-page Brochure' },
  { value: '1000-3000',  label: '$1,000 – $3,000',  desc: 'Professional / Dynamic CMS / Growing Co.' },
  { value: '3000-10000', label: '$3,000 – $10,000', desc: 'Custom / Feature-Rich / E-Commerce' },
  { value: '10000+',     label: '$10,000+',         desc: 'Enterprise / Complex Platform' },
  { value: 'flexible',   label: 'Flexible',         desc: 'Open to recommendations based on scope' },
]

const TIMELINE_OPTIONS = [
  { value: 'urgent-2weeks', label: 'ASAP (< 2 weeks)', desc: 'Rush delivery turnaround' },
  { value: '1-month',       label: '1 Month',          desc: 'Standard professional build' },
  { value: '2-3-months',    label: '2 – 3 Months',     desc: 'Detailed phased rollout' },
  { value: 'flexible',      label: 'Flexible',         desc: 'No hard delivery deadline' },
]

function Step4({ data, errors, onChange }: { data: FormData; errors: Record<string, string>; onChange: (k: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Label>Who is your target audience?</Label>
        <Textarea
          rows={2}
          placeholder="Describe your ideal customers or audience (e.g. corporate clients in Sierra Leone, diaspora community, young professionals, students, international NGOs)…"
          value={data.targetAudience}
          onChange={e => onChange('targetAudience', e.target.value)}
        />
      </div>

      <div>
        <Label>Competitor or inspiration websites</Label>
        <Textarea
          rows={2}
          placeholder="List any websites you like the look and feel of, or your main competitors. Even 1 or 2 URLs gives us great creative direction."
          value={data.competitors}
          onChange={e => onChange('competitors', e.target.value)}
        />
      </div>

      <div>
        <Label required>Project Budget Range (USD)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {BUDGET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('budgetRange', opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                data.budgetRange === opt.value
                  ? 'border-[#ef4444] bg-red-50/70 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className={`text-xs font-bold ${data.budgetRange === opt.value ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>
                {opt.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>
        {errors.budgetRange && (
          <p className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold mt-2.5 bg-red-50 border border-red-200 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#ef4444]" />
            <span>{errors.budgetRange}</span>
          </p>
        )}
      </div>

      <div>
        <Label>Preferred Delivery Timeline</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {TIMELINE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('timeline', opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                data.timeline === opt.value
                  ? 'border-[#ef4444] bg-red-50/70 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <p className={`text-xs font-bold ${data.timeline === opt.value ? 'text-[#ef4444]' : 'text-[#040e40]'}`}>
                {opt.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Specific Target Launch Date (Optional)</Label>
          <Input
            type="date"
            value={data.targetDeadline}
            onChange={e => onChange('targetDeadline', e.target.value)}
          />
        </div>
        <div>
          <Label>Social Media Handles / Links</Label>
          <Input
            placeholder="Facebook, Instagram, LinkedIn, X handles"
            value={data.socialMediaLinks}
            onChange={e => onChange('socialMediaLinks', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Anything else we should know?</Label>
        <Textarea
          rows={3}
          placeholder="Special requirements, third-party payment accounts, accessibility needs, or any specific questions for our engineers…"
          value={data.additionalNotes}
          onChange={e => onChange('additionalNotes', e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────

const STEP_META = [
  { title: 'Your Organisation',      icon: Building2, subtitle: 'Tell us who you are and what you need' },
  { title: 'Content, Brand & Domain',icon: Paintbrush, subtitle: 'Domain requirements and design assets' },
  { title: 'Scope & Technical Needs',icon: Settings,   subtitle: 'Page count, features and architecture' },
  { title: 'Goals & Budget',         icon: Target,     subtitle: 'Scope, timeline and investment tier' },
]

export default function WebsiteQuestionnairePage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [emailDelivered, setEmailDelivered] = useState<boolean | null>(null)
  const formCardRef = useRef<HTMLDivElement>(null)

  // Warn user before refreshing or closing the page with unsaved form entries
  useEffect(() => {
    const isDirty = () => {
      if (submitted) return false
      return (
        Boolean(data.organizationName.trim()) ||
        Boolean(data.contactName.trim()) ||
        Boolean(data.email.trim()) ||
        Boolean(data.websitePurpose.trim()) ||
        Boolean(data.existingDomain.trim()) ||
        step > 1
      )
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [data, step, submitted])

  function update(key: keyof FormData, value: any) {
    setData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    }
  }

  function validateStep(s: number): boolean {
    const newErrors: Record<string, string> = {}

    if (s === 1) {
      if (!data.organizationName.trim()) {
        newErrors.organizationName = 'Please enter your organisation or website name.'
      }
      if (!data.contactName.trim()) {
        newErrors.contactName = 'Please enter your full name.'
      }
      if (!data.email.trim()) {
        newErrors.email = 'Please enter your email address.'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = 'Please enter a valid email address (e.g. name@example.com).'
      }
      if (!data.websitePurpose.trim()) {
        newErrors.websitePurpose = 'Please describe what the website should achieve.'
      }
    }

    if (s === 2) {
      if (!data.siteType) {
        newErrors.siteType = 'Please select what type of website you need.'
      }
      if (data.domainStatus === 'have-domain' && !data.existingDomain.trim()) {
        newErrors.existingDomain = 'Please provide your existing domain name (e.g. mycompany.com).'
      }
    }

    if (s === 3) {
      if (!data.pageCount) {
        newErrors.pageCount = 'Please select an estimated number of pages.'
      }
    }

    if (s === 4) {
      if (!data.budgetRange) {
        newErrors.budgetRange = 'Please select a project budget range tier.'
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstMsg = Object.values(newErrors)[0]
      toast.error(firstMsg)
      return false
    }

    return true
  }

  function scrollToFormTop() {
    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function next() {
    const isValid = validateStep(step)
    if (!isValid) return
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
    scrollToFormTop()
  }

  function back() {
    setErrors({})
    setStep(s => Math.max(s - 1, 1))
    scrollToFormTop()
  }

  async function submit() {
    const isValid = validateStep(step)
    if (!isValid) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/website-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Submission failed')
      if (json.id) setSubmissionId(json.id)
      setEmailDelivered(Boolean(json.emailSent))
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
    <div className="min-h-screen bg-gradient-to-br from-[#040e40] via-[#091a54] to-[#040e40] selection:bg-[#ef4444] selection:text-white">
      <Toaster position="top-center" />

      {/* ─── Top Header (Clean distraction-free navigation) ─── */}
      <header className="w-full bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <a
            href="https://www.itservicesfreetown.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 group transition"
          >
            <Image
              src="/assets/bridgetech-avatar-transparent.png"
              alt="BridgeTech Logo Shield"
              width={42}
              height={42}
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain group-hover:scale-105 transition-transform"
              priority
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">BridgeTech</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.2em] text-[#ef4444] uppercase leading-tight mt-0.5">IT Services</span>
            </div>
          </a>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                downloadBlankQuestionnairePDF()
                toast.success('Downloading blank questionnaire PDF...')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition shadow-sm"
              title="Download a blank printable form to review or fill offline"
            >
              <FileText className="w-3.5 h-3.5 text-[#ef4444]" />
              <span className="hidden sm:inline">Download</span> Blank Form (PDF)
            </button>
            <div className="text-right hidden md:block">
              <p className="text-white/60 text-[11px]">Need immediate help?</p>
              <a href="tel:+23233399391" className="text-[#ef4444] font-bold text-xs hover:underline">+232 33 399 391</a>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Form Container ─── */}
      <main className="w-full max-w-2xl mx-auto px-0 sm:px-4 py-2 sm:py-8 pb-12 sm:pb-16">

        {submitted ? (
          /* ─── Success screen ─── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-white rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl p-4 sm:p-10 text-center border-0 sm:border border-white/20"
          >
            {/* BridgeTech Brand Logo on Success Screen */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <Image
                  src="/assets/bridgetech-avatar-transparent.png"
                  alt="BridgeTech Logo"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
                <div className="text-left">
                  <span className="text-base font-black text-[#040e40] leading-none block">BridgeTech</span>
                  <span className="text-[9px] font-extrabold text-[#ef4444] tracking-widest uppercase block mt-0.5">IT SERVICES</span>
                </div>
              </div>
            </div>

            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#040e40] mb-2">
              Thank You — We&apos;ve Got Your Brief!
            </h1>
            <p className="text-gray-600 text-sm max-w-lg mx-auto mb-6">
              Your questionnaire has been submitted successfully to <strong>BridgeTech IT Services</strong>. Our engineering team will review your specifications and reach out within <strong>1–2 business days</strong> via {data.preferredContactMethod.toUpperCase()}.
            </p>

            {/* Email notification status pill */}
            {emailDelivered ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left">
                <MailCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Automatic Receipt Delivered</p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    We sent an official confirmation and copy of your answers to <strong>{data.email}</strong>.
                    {submissionId && (
                      <span className="block mt-1 font-mono text-[11px] text-emerald-700">Reference ID: #{submissionId.slice(-8).toUpperCase()}</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Project Brief Logged</p>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Your answers and specifications have been recorded successfully.
                    {submissionId && (
                      <span className="block mt-1 font-mono text-[11px] text-blue-700">Reference ID: #{submissionId.slice(-8).toUpperCase()}</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* PDF Download Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <button
                type="button"
                onClick={() => {
                  downloadQuestionnairePDF(data, { submissionId: submissionId || undefined })
                  toast.success('Downloading your summary PDF...')
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download Summary (PDF)
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadBlankQuestionnairePDF()
                  toast.success('Downloading blank form PDF...')
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-300 transition"
              >
                <FileText className="w-4 h-4 text-slate-600" /> Download Blank Form (PDF)
              </button>
            </div>

            {/* ─── Summary of Answers ─── */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 text-left mb-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <h2 className="text-xs font-bold text-[#040e40] uppercase tracking-wider">Summary of Submitted Answers</h2>
                <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">
                  {submissionId ? `#${submissionId.slice(-8).toUpperCase()}` : 'Submitted'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Organisation / Project</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{data.organizationName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Contact Person</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{data.contactName}</p>
                  <p className="text-slate-500 text-[11px]">{data.email} {data.phone ? `• ${data.phone}` : ''} ({data.preferredContactMethod.toUpperCase()})</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Website Type & Pages</p>
                  <p className="font-semibold text-slate-800 mt-0.5 capitalize">
                    {data.siteType} • {data.pageCount}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase">Budget & Timeline</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {data.budgetRange || 'Flexible'} • {data.timeline || 'Flexible'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-slate-400 font-semibold uppercase mb-1">Domain & Brand Assets</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg font-medium border bg-white border-slate-200 text-slate-700">
                      Domain: {data.domainStatus === 'need-domain' ? 'Needs Registration' : data.domainStatus === 'have-domain' ? 'Owned' : 'Guidance Needed'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg font-medium border bg-white border-slate-200 text-slate-700">
                      Branding: {data.hasExistingBranding ? '✓ Has Branding' : '✗ Needs Branding'}
                    </span>
                    {data.wantsContentWriting && (
                      <span className="px-2.5 py-1 rounded-lg font-semibold border bg-blue-50 border-blue-200 text-blue-700">
                        ✍️ Copywriting Add-on
                      </span>
                    )}
                    {data.wantsGraphicDesign && (
                      <span className="px-2.5 py-1 rounded-lg font-semibold border bg-rose-50 border-rose-200 text-rose-700">
                        🎨 Graphics Add-on
                      </span>
                    )}
                    {data.needsHosting && (
                      <span className="px-2.5 py-1 rounded-lg font-semibold border bg-indigo-50 border-indigo-200 text-indigo-700">
                        ☁️ Cloud Hosting & Email
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-slate-400 font-semibold uppercase mb-1">Primary Purpose</p>
                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {data.websitePurpose}
                  </p>
                </div>
              </div>
            </div>

            {/* Office details */}
            <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-2 mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Our Contact Details</p>
              <p className="text-sm text-gray-700">📍 #1 Regent Highway, Jui Junction, Freetown, Sierra Leone</p>
              <p className="text-sm text-gray-700">📞 <a href="tel:+23233399391" className="text-[#ef4444] font-semibold">+232 33 399 391</a></p>
              <p className="text-sm text-gray-700">✉️ <a href="mailto:info@itservicesfreetown.com" className="text-gray-700 hover:text-[#ef4444]">info@itservicesfreetown.com</a></p>
              <p className="text-sm text-gray-700">🌐 <a href="https://www.itservicesfreetown.com" target="_blank" rel="noreferrer" className="text-gray-700 hover:text-[#ef4444]">www.itservicesfreetown.com</a></p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <a
                href="https://www.itservicesfreetown.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-8 py-3 rounded-xl bg-[#040e40] text-white font-bold text-sm hover:bg-[#0a1a5c] transition"
              >
                Visit BridgeTech IT Services
              </a>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ─── Hero Title with BridgeTech Brand Emblem ─── */}
            <div className="text-center px-3 sm:px-0 mb-7">
              <div className="flex justify-center mb-3.5">
                <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
                  <Image
                    src="/assets/bridgetech-avatar-transparent.png"
                    alt="BridgeTech Logo Shield"
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain drop-shadow"
                    priority
                  />
                  <div className="text-left">
                    <p className="text-white font-black text-sm tracking-tight leading-none">BridgeTech</p>
                    <p className="text-[#ef4444] text-[9px] font-black tracking-widest uppercase mt-0.5">IT SERVICES</p>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Website Development<br />
                <span className="text-[#ef4444]">Project Discovery Brief</span>
              </h1>
              <p className="text-white/70 mt-2.5 text-sm max-w-md mx-auto leading-relaxed">
                Complete this discovery brief so our team can accurately scope your website and prepare a custom proposal.
              </p>
            </div>

            {/* ─── Step Progress Bar ─── */}
            <div className="px-3 sm:px-0 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                {STEP_META.map((s, i) => {
                  const n = i + 1
                  const active = n === step
                  const done   = n < step
                  const Icon   = s.icon
                  return (
                    <div key={n} className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all font-bold text-sm border-2 ${
                        done   ? 'bg-[#ef4444] border-[#ef4444] text-white shadow-md' :
                        active ? 'bg-white border-[#ef4444] text-[#ef4444] shadow-md scale-105' :
                                 'bg-white/10 border-white/20 text-white/40'
                      }`}>
                        {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <p className={`text-[11px] font-semibold hidden sm:block text-center ${active ? 'text-white' : done ? 'text-[#ef4444]' : 'text-white/30'}`}>
                        {s.title}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#ef4444] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                />
              </div>
              <p className="text-white/50 text-xs text-center mt-2 font-medium">Step {step} of {TOTAL_STEPS}</p>
            </div>

            {/* ─── Main Form Card ─── */}
            <div ref={formCardRef} className="bg-white rounded-none sm:rounded-3xl shadow-none sm:shadow-2xl overflow-hidden border-0 sm:border border-white/20 scroll-mt-16 w-full">
              {/* Brand Header Banner DIRECTLY ON THE FORM */}
              <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src="/assets/bridgetech-avatar-transparent.png"
                    alt="BridgeTech Logo Shield"
                    width={48}
                    height={48}
                    className="h-11 w-11 object-contain drop-shadow-sm"
                    priority
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-black tracking-tight text-[#040e40]">BridgeTech</span>
                      <span className="text-[10px] font-extrabold tracking-widest text-[#ef4444] uppercase bg-red-50 border border-red-200 px-2 py-0.5 rounded">IT SERVICES</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium">Official Website Intake & Scope Discovery Form</p>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-[11px] font-bold text-gray-700">Freetown, Sierra Leone</span>
                  <a href="tel:+23233399391" className="text-[11px] text-[#ef4444] font-bold hover:underline">+232 33 399 391</a>
                </div>
              </div>

              {/* Card Step Header */}
              <div className="bg-gradient-to-r from-[#040e40] to-[#0a1a5c] px-4 sm:px-6 py-3.5 sm:py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 flex items-center justify-center shrink-0">
                  <StepIcon className="w-5 h-5 text-[#ef4444]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">{STEP_META[step - 1].title}</h2>
                  <p className="text-white/60 text-xs">{STEP_META[step - 1].subtitle}</p>
                </div>
              </div>

              {/* Card Body with Framer Motion Animated Transitions */}
              <div className="p-4 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {step === 1 && <Step1 data={data} errors={errors} onChange={update} />}
                    {step === 2 && <Step2 data={data} errors={errors} onChange={update} />}
                    {step === 3 && <Step3 data={data} errors={errors} onChange={update} />}
                    {step === 4 && <Step4 data={data} errors={errors} onChange={update} />}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Card Footer Navigation */}
              <div className="px-4 sm:px-8 pb-6 flex items-center justify-between border-t border-gray-100 pt-5">
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
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white text-sm font-bold shadow-md shadow-red-200 transition hover:scale-[1.01]"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#040e40] hover:bg-[#0a1a5c] text-white text-sm font-bold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01]"
                  >
                    {submitting ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting Brief…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Project Brief</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* ─── Footer Note ─── */}
            <p className="text-white/40 text-xs text-center mt-6">
              Your information is confidential and used solely to prepare your technical proposal. We never share details with third parties.
            </p>
          </>
        )}
      </main>

      {/* ─── Bottom Footer ─── */}
      <footer className="bg-black/25 border-t border-white/5 py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="text-white font-bold text-sm">BridgeTech IT Services</span>
            <span className="text-white/20 text-xs">|</span>
            <span className="text-white/50 text-xs">#1 Regent Highway, Jui Junction, Freetown, Sierra Leone</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <a href="tel:+23233399391" className="text-white/60 hover:text-white text-xs transition">+232 33 399 391</a>
            <a href="mailto:info@itservicesfreetown.com" className="text-white/60 hover:text-white text-xs transition">info@itservicesfreetown.com</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
