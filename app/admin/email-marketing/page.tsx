'use client';

import { useState, useEffect, useRef } from 'react'
import dynamicImport from 'next/dynamic'
import { Send, Users, Image as ImageIcon, Link as LinkIcon, CheckSquare, Square, Trash2, RefreshCw, Mail, ArrowLeft, Sparkles, Wand2, Calendar, ToggleLeft, ToggleRight, Plus, X, FlaskConical, History, ChevronDown, ChevronUp, Eye, ExternalLink, Megaphone, AlertTriangle, UserPlus, Code } from 'lucide-react'
import Link from 'next/link'
import 'react-quill/dist/quill.snow.css'

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamicImport(() => import('react-quill'), { ssr: false }) as any

interface EmailLead {
  id: string
  email: string
  name: string | null
  source: string
  deliveryFailed: boolean
}

interface NewsletterSettings {
  id: string
  enabled: boolean
  subjectPrefix: string
  topics: string[]
  lastSentAt: string | null
}

interface NewsletterLog {
  id: string
  status: string
  topic: string
  subject: string
  imageUrl: string | null
  recipients: number
  error: string | null
  createdAt: string
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
}

const DEFAULT_TOPICS = [
  "5 Essential Tips to Keep Your Laptop from Overheating in Freetown's Heat",
  "How to Protect Your Smartphone Screen from Scratches and Accidental Drops",
  "Warning Signs Your Computer Hard Drive is About to Fail (And How to Save Your Data)",
  "Easy Ways to Boost Your Home Wi-Fi Signal Strength and Speed",
  "Why You Should Stop Leaving Your Phone Plugs and Laptop Chargers in the Outlet",
  "How to Clean Your Phone Charging Port Safely (Fix Charging Issues)",
  "How to Secure Your Social Media Accounts from Hackers (2-Factor Authentication)",
  "What to Do Immediately if You Spill Water or Tea on Your Laptop"
]

export default function EmailMarketingPage() {
  const quillRef = useRef<any>(null)
  const lastRange = useRef<any>(null)
  const [leads, setLeads] = useState<EmailLead[]>([])
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showAi, setShowAi] = useState(false)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const [showBtnModal, setShowBtnModal] = useState(false)
  const [showImgModal, setShowImgModal] = useState(false)
  
  // Enhanced Link & Button Insertion State
  const [linkModalTab, setLinkModalTab] = useState<'button' | 'text'>('button')
  const [btnText, setBtnText] = useState('Book Your Repair Now')
  const [btnUrl, setBtnUrl] = useState('https://www.itservicesfreetown.com/book-appointment')
  const [btnColor, setBtnColor] = useState<'red' | 'blue' | 'green' | 'indigo' | 'slate'>('red')
  const [btnAlign, setBtnAlign] = useState<'center' | 'left' | 'right'>('center')
  const [inlineLinkText, setInlineLinkText] = useState('')
  const [inlineLinkUrl, setInlineLinkUrl] = useState('https://www.itservicesfreetown.com')

  // Enhanced Photo / Image Insertion State
  const [imgTab, setImgTab] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageAlt, setImageAlt] = useState('')
  const [imageCaption, setImageCaption] = useState('')
  const [imageAlignment, setImageAlignment] = useState<'center' | 'left' | 'right'>('center')
  const [imageWidth, setImageWidth] = useState<'100%' | '75%' | '50%'>('100%')
  const [imageBorderRadius, setImageBorderRadius] = useState<'12' | '6' | '0'>('12')
  const [imageLinkUrl, setImageLinkUrl] = useState('')

  // Enhanced AI & Preview State
  const [generatingNewsletter, setGeneratingNewsletter] = useState(false)
  const [manualBlastTopic, setManualBlastTopic] = useState('')
  const [aiDraftNotice, setAiDraftNotice] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [recipientPage, setRecipientPage] = useState(1)
  const RECIPIENTS_PER_PAGE = 20

  // --- Manual Add Emails State ---
  const [showAddEmails, setShowAddEmails] = useState(false)
  const [manualEmailsInput, setManualEmailsInput] = useState('')
  const [autoSelectNewEmails, setAutoSelectNewEmails] = useState(true)
  const [addingEmails, setAddingEmails] = useState(false)
  const [addEmailsError, setAddEmailsError] = useState<string | null>(null)

  useEffect(() => {
    setRecipientPage(1)
  }, [searchTerm])

  // --- Weekly Newsletter State ---
  const [newsletterSettings, setNewsletterSettings] = useState<NewsletterSettings | null>(null)
  const [newsletterLogs, setNewsletterLogs] = useState<NewsletterLog[]>([])
  const [showNewsletterPanel, setShowNewsletterPanel] = useState(false)
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [sendingManualBlast, setSendingManualBlast] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testTopic, setTestTopic] = useState('')
  const [sendingTest, setSendingTest] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  // --- Emergency Flood Advisory State ---
  const [emergencySending, setEmergencySending] = useState(false)
  const [emergencySuccess, setEmergencySuccess] = useState('')
  const [emergencyBannerActive, setEmergencyBannerActive] = useState(false)

  useEffect(() => {
    fetchLeads()
    checkConfig()
    fetchNewsletterSettings()
    fetchNewsletterLogs()
  }, [])

  const filteredLeads = leads.filter(lead => 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    lead.source.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Track cursor position whenever it changes
  const handleSelectionChange = (range: any) => {
    if (range) {
      lastRange.current = range
    }
  }

  const checkConfig = async () => {
    try {
      const res = await fetch('/api/admin/email-marketing/config-check')
      const data = await res.json()
      setIsConfigured(data.configured)
    } catch (e) {
      setIsConfigured(false)
    }
  }

  const fetchNewsletterSettings = async () => {
    try {
      const res = await fetch('/api/admin/email-marketing/newsletter-settings')
      if (res.ok) {
        const data = await res.json()
        setNewsletterSettings({
          ...data,
          topics: Array.isArray(data.topics) ? data.topics : DEFAULT_TOPICS
        })
      }
    } catch (e) {
      console.error('Failed to fetch newsletter settings')
    }
  }

  const fetchNewsletterLogs = async () => {
    try {
      const res = await fetch('/api/admin/email-marketing/newsletter-logs')
      if (res.ok) {
        const data = await res.json()
        setNewsletterLogs(data.logs || [])
      }
    } catch (e) {
      console.error('Failed to fetch newsletter logs')
    }
  }

  const saveNewsletterSettings = async () => {
    if (!newsletterSettings) return
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/email-marketing/newsletter-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsletterSettings)
      })
      if (res.ok) {
        const data = await res.json()
        setNewsletterSettings({ ...data, topics: Array.isArray(data.topics) ? data.topics : DEFAULT_TOPICS })
        alert('✅ Newsletter settings saved successfully!')
      } else {
        alert('❌ Failed to save settings.')
      }
    } catch (e) {
      alert('❌ Error saving settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  const sendTestNewsletter = async () => {
    if (!testEmail) {
      alert('Please enter a test email address.')
      return
    }
    setSendingTest(true)
    try {
      const res = await fetch('/api/admin/email-marketing/newsletter-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail, topic: testTopic || undefined })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`✅ Test newsletter sent!\n\nTopic: ${data.topic}\nSubject: ${data.subject}\nSent to: ${data.recipient}`)
        fetchNewsletterLogs()
      } else {
        alert('❌ Failed to send test: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      alert('❌ Error sending test newsletter.')
    } finally {
      setSendingTest(false)
    }
  }

  const sendManualBlast = async () => {
    if (!confirm('🚨 WARNING: This will immediately send the newsletter to ALL active subscribers. Make sure you have reviewed the email in the editor above before proceeding. Are you sure?')) return
    
    setSendingManualBlast(true)
    try {
      const res = await fetch('/api/cron/weekly-newsletter?manual=true')
      
      if (res.ok) {
        alert('✅ Manual Blast successfully completed!')
        fetchNewsletterLogs()
      } else {
        const data = await res.json().catch(() => ({}))
        alert('❌ Failed to trigger manual blast: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      alert('❌ Error sending manual blast.')
    } finally {
      setSendingManualBlast(false)
    }
  }

  // Generate AI newsletter draft and load it into the main editor for review/editing before blasting
  const handleGenerateNewsletterDraft = async () => {
    setGeneratingNewsletter(true)
    setAiDraftNotice(null)
    try {
      const res = await fetch('/api/admin/email-marketing/newsletter-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: manualBlastTopic || undefined })
      })
      const data = await res.json()
      if (res.ok && data.subject && data.content) {
        // Load into the main editor so admin can review, edit, add images/links
        setSubject(data.subject)
        setContent(data.content)
        if (quillRef.current) {
          quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(data.content)
        }
        setAiDraftNotice(`✅ AI draft loaded! Topic: "${data.topic}" — Scroll up to review and edit the email in the editor, then use the Campaign blast button to send.`)
        // Scroll editor into view
        setTimeout(() => {
          document.getElementById('email-editor-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      } else {
        alert('❌ Failed to generate newsletter draft: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      alert('❌ Network error generating newsletter draft.')
    } finally {
      setGeneratingNewsletter(false)
    }
  }

  const addTopic = () => {
    if (!newTopic.trim()) return
    if (!newsletterSettings) return
    setNewsletterSettings(prev => prev ? {
      ...prev,
      topics: [...prev.topics, newTopic.trim()]
    } : prev)
    setNewTopic('')
  }

  const removeTopic = (index: number) => {
    if (!newsletterSettings) return
    setNewsletterSettings(prev => prev ? {
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    } : prev)
  }

  // --- Flood Emergency Functions ---
  const handleLoadFloodEmergencyTemplate = () => {
    const floodSubject = '⚠️ URGENT: Freetown Heavy Rain & Flood Safety Advisory — Dial 117 for Emergency Help'
    setSubject(floodSubject)
    const floodHtml = `<div style="padding:16px; background-color:#fef2f2; border:2px solid #ef4444; border-radius:12px; text-align:center; margin-bottom:20px;">
  <p style="margin:0; font-size:12px; font-weight:800; color:#991b1b; text-transform:uppercase; letter-spacing:1.5px;">National Emergency Toll-Free Hotline</p>
  <p style="margin:4px 0; font-size:34px; font-weight:900; color:#dc2626;">DIAL 117</p>
  <p style="margin:0; font-size:12px; color:#7f1d1d;">Free from Africell, Orange, QCell across Sierra Leone to report floods, mudslides, or rescue needs.</p>
</div>

<p><strong>Dear Valued Customer and Freetown Resident,</strong></p>
<p>Due to hours of persistent heavy rainfall across Freetown, severe flooding and landslide hazards have rapidly increased across vulnerable low-lying and hillside communities.</p>

<p><strong>🛑 CRITICAL FLOOD SAFETY RULES:</strong></p>
<ul>
  <li><strong>Never walk or drive through moving water:</strong> 15 cm of swift current can sweep an adult off their feet; 30 cm can carry vehicles.</li>
  <li><strong>Stay away from overflowing gutters and drainages:</strong> Culverts in Kroo Bay, Culvert, Dwarzark, Susan's Bay, and Congo Market conceal dangerous suction.</li>
  <li><strong>Move to higher ground early:</strong> Do not wait until escape routes are underwater.</li>
</ul>

<p><strong>🔌 TECH &amp; ELECTRICAL PROTECTION:</strong></p>
<ul>
  <li><strong>Unplug electronics immediately:</strong> Disconnect laptops, desktop PCs, TVs, routers, and extension power strips to prevent surge damage.</li>
  <li><strong>Elevate devices:</strong> Move computers, phones, and essential paperwork off the floor onto high tables.</li>
  <li><strong>Turn off main breaker:</strong> If floodwater begins entering your home, shut off your main breaker switch immediately.</li>
  <li><strong>Never power on wet electronics:</strong> If a phone or laptop got wet, keep it turned off! Never connect a charger.</li>
</ul>

<div style="text-align:center; margin:24px 0;">
  <a href="https://www.itservicesfreetown.com/flood-safety-guide" class="email-button" style="background-color:#dc2626; color:#ffffff !important; padding:14px 28px; text-decoration:none; border-radius:10px; font-weight:bold; display:inline-block;">
    🚨 Open Step-by-Step Flood Safety Guide &rarr;
  </a>
</div>

<p>Stay safe, stay dry, and call <strong>117</strong> in case of any danger or emergency.</p>
<p><em>With deep care and solidarity,<br>The Team at BridgeTech IT Services (#1 Regent Highway, Jui Junction)</em></p>`

    setContent(floodHtml)
    if (quillRef.current) {
      quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(floodHtml)
    }
    setSelectedEmails(new Set(leads.map(l => l.email)))
    alert('✅ Flood Emergency Advisory template loaded into editor and all customer recipients selected!')
  }

  const handleActivateEmergencyBanner = async () => {
    try {
      const res = await fetch('/api/admin/emergency-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-banner-only' }),
      })
      const data = await res.json()
      if (data.success) {
        setEmergencyBannerActive(true)
        alert('🚨 Website Global Banner updated to Red Flood Emergency Alert with link to 117 Safety Reveal!')
      } else {
        alert('Failed to update banner: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      alert('Error updating banner.')
    }
  }

  const handleQuickEmergencyBroadcast = async () => {
    if (!confirm('🚨 Are you sure you want to broadcast the Freetown Flood Emergency Safety Warning to all customers? This will send emails with the 117 emergency hotline and the interactive safety reveal link.')) {
      return
    }
    setEmergencySending(true)
    setEmergencySuccess('')
    try {
      const res = await fetch('/api/admin/emergency-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-broadcast',
          updateGlobalBanner: true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setEmergencySuccess(`✅ Emergency Broadcast Complete! Successfully sent to ${data.sentCount} customers (${data.failedCount} failed). Global banner activated.`)
        alert(`✅ Emergency Broadcast Sent!\n\nDelivered: ${data.sentCount} customers\nFailed: ${data.failedCount}\nWebsite Top Banner: Activated\nSafety Reveal URL: ${data.revealUrl}`)
      } else {
        alert('❌ Broadcast failed: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      alert('❌ Network error sending emergency broadcast.')
    } finally {
      setEmergencySending(false)
    }
  }

  const clearNewsletterLogs = async () => {
    if (!confirm('Clear all newsletter run history logs?')) return
    try {
      const res = await fetch('/api/admin/email-marketing/newsletter-logs', { method: 'DELETE' })
      if (res.ok) {
        setNewsletterLogs([])
        alert('✅ Logs cleared.')
      }
    } catch (e) {
      alert('❌ Failed to clear logs.')
    }
  }

  const toggleSelectAll = () => {
    const next = new Set(selectedEmails)
    const validFilteredLeads = filteredLeads.filter(l => !l.deliveryFailed)
    const allFilteredEmails = validFilteredLeads.map(l => l.email)
    
    if (allFilteredEmails.length === 0) return

    const allFilteredSelected = allFilteredEmails.every(email => next.has(email))

    if (allFilteredSelected) {
      // Deselect only filtered ones
      allFilteredEmails.forEach(email => next.delete(email))
    } else {
      // Select all filtered ones
      allFilteredEmails.forEach(email => next.add(email))
    }
    setSelectedEmails(next)
  }

  const deselectAll = () => {
    setSelectedEmails(new Set())
  }

  const insertButton = () => {
    const colorMap: Record<string, string> = {
      red: '#dc2626', blue: '#2563eb', green: '#16a34a', indigo: '#4f46e5', slate: '#334155'
    }
    const alignPad = btnAlign === 'center' ? 'auto' : btnAlign === 'right' ? '0 0 0 auto' : '0 auto 0 0'
    const buttonHtml = `<div style="text-align:${btnAlign}; margin: 20px 0;"><a href="${btnUrl}" class="email-button" style="display: inline-block; background-color: ${colorMap[btnColor]}; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 15px; letter-spacing: 0.3px;">${btnText}</a></div>`
    try {
      const quill = quillRef.current?.getEditor()
      if (quill) {
        quill.focus()
        const index = lastRange.current ? lastRange.current.index : quill.getLength()
        quill.clipboard.dangerouslyPasteHTML(index, buttonHtml)
        setTimeout(() => setContent(quill.root.innerHTML), 100)
      } else {
        setContent(prev => prev + buttonHtml)
      }
      setShowBtnModal(false)
    } catch (e) {
      console.error('Insert button error:', e)
      setContent(prev => prev + buttonHtml)
      setShowBtnModal(false)
    }
  }

  const insertImage = () => {
    const finalUrl = imagePreviewUrl || imageUrl
    if (!finalUrl) { alert('Please provide an image URL or upload a photo first.'); return }
    const wrapAlign = imageAlignment === 'center' ? '0 auto' : imageAlignment === 'right' ? '0 0 0 auto' : '0 auto 0 0'
    const imgStyle = `max-width:${imageWidth}; height:auto; display:block; border-radius:${imageBorderRadius}px; margin:${wrapAlign};`
    const captionHtml = imageCaption ? `<p style="text-align:${imageAlignment}; font-size:12px; color:#6b7280; margin-top:6px; font-style:italic;">${imageCaption}</p>` : ''
    const innerImg = `<img src="${finalUrl}" alt="${imageAlt || 'Email Image'}" style="${imgStyle}" />${captionHtml}`
    const imgBlock = imageLinkUrl
      ? `<div style="margin:20px 0;"><a href="${imageLinkUrl}" target="_blank" rel="noopener noreferrer" style="display:block;">${innerImg}</a></div>`
      : `<div style="margin:20px 0;">${innerImg}</div>`
    try {
      const quill = quillRef.current?.getEditor()
      if (quill) {
        quill.focus()
        const index = lastRange.current ? lastRange.current.index : quill.getLength()
        quill.clipboard.dangerouslyPasteHTML(index, imgBlock)
        setTimeout(() => setContent(quill.root.innerHTML), 100)
      } else {
        setContent(prev => prev + imgBlock)
      }
      setShowImgModal(false)
      setImageUrl('')
      setImagePreviewUrl(null)
      setImageAlt('')
      setImageCaption('')
      setImageLinkUrl('')
    } catch (e) {
      console.error('Insert image error:', e)
      setContent(prev => prev + imgBlock)
      setShowImgModal(false)
    }
  }

  // Handle direct photo upload → convert to base64 data URL for embedding
  const handleImageFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return }
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      setImagePreviewUrl(dataUrl)
      setImageUrl('')
    }
    reader.readAsDataURL(file)
  }

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/email-leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (e) {
      console.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt) return
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/email-marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      })
      const data = await res.json()
      if (res.ok && data.subject && data.content) {
        setSubject(data.subject)
        setContent(data.content)
        if (quillRef.current) {
          quillRef.current.getEditor().clipboard.dangerouslyPasteHTML(data.content)
        }
        setShowAi(false)
        setAiPrompt('')
        setAiDraftNotice('✅ AI email generated! Review and edit it in the editor below, then add images or links, and blast when ready.')
        setTimeout(() => {
          document.getElementById('email-editor-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 300)
      } else {
        alert('❌ AI generation failed:\n\n' + (data.error || 'Unknown error. Check that GROQ_API_KEY is set in your Vercel environment variables.'))
      }
    } catch (e) {
      alert('❌ Network error during AI generation. Please check your connection.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleEmail = (email: string) => {
    const lead = leads.find(l => l.email === email)
    if (lead?.deliveryFailed) return // Don't toggle failed emails

    const next = new Set(selectedEmails)
    if (next.has(email)) next.delete(email)
    else next.add(email)
    setSelectedEmails(next)
  }

  const [cleaning, setCleaning] = useState(false)

  const handleDeleteLead = async (email: string) => {
    if (!confirm(`Delete all entries for ${email} from the database?`)) return
    try {
      const res = await fetch(`/api/admin/email-leads?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.email !== email))
        const next = new Set(selectedEmails)
        next.delete(email)
        setSelectedEmails(next)
      } else {
        alert('Failed to delete lead')
      }
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const handleAddManualEmails = async () => {
    if (!manualEmailsInput.trim()) {
      setAddEmailsError('Please enter at least one email address.')
      return
    }

    // Split by commas, semicolons, newlines, or whitespace
    const rawTokens = manualEmailsInput
      .split(/[\s,;]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0)

    if (rawTokens.length === 0) {
      setAddEmailsError('No valid email addresses found.')
      return
    }

    // Deduplicate case-insensitively
    const uniqueMap = new Map<string, string>()
    for (const token of rawTokens) {
      const lower = token.toLowerCase()
      if (!uniqueMap.has(lower)) {
        uniqueMap.set(lower, lower)
      }
    }
    const uniqueEmails = Array.from(uniqueMap.values())

    // Standard email regex
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
    const validEmails = uniqueEmails.filter(e => EMAIL_REGEX.test(e))
    const invalidEmails = uniqueEmails.filter(e => !EMAIL_REGEX.test(e))

    if (validEmails.length === 0) {
      setAddEmailsError(`Invalid email format: ${invalidEmails.slice(0, 3).join(', ')}${invalidEmails.length > 3 ? '...' : ''}`)
      return
    }

    setAddingEmails(true)
    setAddEmailsError(null)

    try {
      const payload = validEmails.map(email => ({
        email,
        source: 'manual',
      }))

      const res = await fetch('/api/admin/email-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Refresh leads list
        await fetchLeads()

        // Auto-select valid newly added emails if option is checked
        if (autoSelectNewEmails) {
          setSelectedEmails(prev => {
            const next = new Set(prev)
            validEmails.forEach(email => next.add(email))
            return next
          })
        }

        let feedback = `✅ Added ${data.added} email(s) to the marketing list!`
        if (invalidEmails.length > 0) {
          feedback += `\n\n⚠️ Skipped ${invalidEmails.length} invalid entry/entries: ${invalidEmails.slice(0, 3).join(', ')}`
        }
        if (data.skipped > 0 && data.errors?.length > 0) {
          feedback += `\n\n⚠️ Notice: ${data.errors.slice(0, 3).join('\n')}`
        }

        alert(feedback)
        setManualEmailsInput('')
        setShowAddEmails(false)
      } else {
        setAddEmailsError(data.error || data.message || 'Failed to add emails.')
      }
    } catch (err) {
      console.error('Error adding emails:', err)
      setAddEmailsError('Network error while saving emails. Please try again.')
    } finally {
      setAddingEmails(false)
    }
  }

  const handleCleanBounced = async () => {
    const count = leads.filter(l => l.deliveryFailed).length
    if (count === 0) {
      alert('No bounced emails to clean.')
      return
    }
    if (!confirm(`Are you sure you want to permanently remove all ${count} bounced emails?`)) return
    setCleaning(true)
    try {
      const res = await fetch('/api/admin/email-leads?failed=true', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        alert(`Successfully removed ${data.deleted} bounced emails!`)
        // Filter out deleted leads from local state
        setLeads(prev => prev.filter(l => !l.deliveryFailed))
        // Deselect any that were removed just in case
        const next = new Set(selectedEmails)
        leads.forEach(l => {
          if (l.deliveryFailed) next.delete(l.email)
        })
        setSelectedEmails(next)
      } else {
        alert('Failed to clean bounced emails: ' + data.error)
      }
    } catch (e) {
      alert('Error cleaning bounced emails')
    } finally {
      setCleaning(false)
    }
  }

  const handleRestoreBounced = async () => {
    const count = leads.filter(l => l.deliveryFailed).length
    if (count === 0) {
      alert('No bounced emails to restore.')
      return
    }
    if (!confirm(`Restore all ${count} bounced emails back to active status?`)) return
    try {
      const res = await fetch('/api/admin/email-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetAll: true })
      })
      const data = await res.json()
      if (data.success) {
        alert(`Successfully restored ${data.updated} emails!`)
        // Update local state
        setLeads(prev => prev.map(l => ({ ...l, deliveryFailed: false })))
      } else {
        alert('Failed to restore bounced emails: ' + (data.error || 'Unknown error'))
      }
    } catch {
      alert('Error restoring bounced emails')
    }
  }

  const handleSend = async () => {
    // Basic validation
    if (!subject) {
      alert('Please enter a campaign subject.')
      return
    }
    if (!content || content === '<p><br></p>') {
      alert('Please write some content for your email.')
      return
    }
    if (selectedEmails.size === 0) {
      alert('Please select at least one recipient from the list on the right.')
      return
    }

    if (!confirm(`Confirm: Send this campaign to ${selectedEmails.size} recipients now?`)) return

    setSending(true)
    try {
      const res = await fetch('/api/admin/email-marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content,
          recipients: Array.from(selectedEmails)
        })
      })
      
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      alert(`🎉 Campaign blast successful!\n\nSent: ${data.sent}\nFailed: ${data.failed}`)
      
    } catch (e: any) {
      alert('❌ Error sending campaign: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin" className="mb-2 flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600">
              <ArrowLeft className="mr-1 h-3 w-3" /> Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-200">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Email Marketing</h1>
                <p className="text-sm text-slate-500">Design and blast professional emails to your leads</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAi(!showAi)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                showAi 
                  ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200' 
                  : 'bg-white text-slate-700 shadow-sm border border-slate-100 hover:bg-slate-50'
              }`}
            >
              <Sparkles className={`h-4 w-4 ${generating ? 'animate-pulse' : ''}`} />
              AI Assistant
            </button>
            <div className="rounded-xl bg-white px-4 py-2 shadow-sm border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recipients Selected</p>
              <p className="text-xl font-black text-blue-600">{selectedEmails.size} <span className="text-xs text-slate-300 font-normal">/ {leads.length}</span></p>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || selectedEmails.size === 0}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 transition hover:scale-105 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:hover:scale-100"
            >
              {sending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              {sending ? 'Sending Campaign...' : 'Blast Campaign'}
            </button>
          </div>
        </div>

        {/* Urgent Flood Emergency Safety Advisory Card */}
        <div className="mb-8 overflow-hidden rounded-3xl border-2 border-red-500 bg-gradient-to-br from-red-950/40 via-slate-900 to-red-900/30 p-6 sm:p-8 shadow-2xl shadow-red-950/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-red-600/50 animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  🚨 Freetown Emergency Broadcast
                </span>
                <span className="rounded-full bg-red-950 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-200">
                  National Hotline: 117
                </span>
                <a
                  href="/flood-safety-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
                >
                  <Eye className="h-3 w-3" />
                  Preview Flood Safety Guide
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Freetown Heavy Rainfall &amp; Flood Safety Advisory
              </h2>
              
              <p className="text-sm text-slate-300 leading-relaxed">
                Send an immediate caring flood safety warning to all <strong>{leads.length} verified customers</strong>. Warns residents to dial <strong>117</strong> for emergency disaster response, provides practical flood rules, tech protection steps (unplugging devices), and links to the interactive Safety Reveal.
              </p>

              {emergencySuccess && (
                <div className="rounded-xl bg-emerald-900/40 border border-emerald-500/50 p-3 text-xs font-bold text-emerald-300">
                  {emergencySuccess}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={handleLoadFloodEmergencyTemplate}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-3.5 text-xs font-black shadow-sm transition hover:scale-105"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                Load Template in Editor &amp; Select All
              </button>

              <button
                type="button"
                onClick={handleActivateEmergencyBanner}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3.5 text-xs shadow-md transition hover:scale-105"
              >
                <Megaphone className="h-4 w-4 text-slate-950" />
                Activate Red Banner on Website
              </button>

              <button
                type="button"
                onClick={handleQuickEmergencyBroadcast}
                disabled={emergencySending}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black px-6 py-4 text-sm shadow-xl shadow-red-900/60 transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {emergencySending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Broadcasting to All Customers...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    ⚡ Broadcast Alert to All Customers
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Warning */}
        {isConfigured === false && (
          <div className="mb-8 rounded-3xl border-2 border-red-200 bg-red-50 p-6 shadow-lg shadow-red-100 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-900">Email System Not Configured</h3>
                <p className="mt-1 text-sm text-red-700">
                  Your SMTP settings are missing or using placeholder values. Emails will <strong>not be delivered</strong> to customers until you update your <code>.env.local</code> file with valid <code>SMTP_USER</code> and <code>SMTP_PASS</code>.
                </p>
                <Link href="/EMAIL_SETUP_GUIDE.md" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition">
                  View Setup Guide <ArrowLeft className="h-3 w-3 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* AI Generation Panel */}
        {showAi && (
          <div className="mb-8 overflow-hidden rounded-3xl border-2 border-amber-200 bg-amber-50/50 p-6 shadow-lg shadow-amber-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="mb-4 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-amber-600" />
              <h2 className="text-lg font-black text-amber-900">AI Email Marketing Writer</h2>
              <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-700">Generates editable draft</span>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                placeholder="e.g. Write a promotional email for 20% off screen repairs this week..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
                className="flex-1 rounded-2xl border border-amber-200 bg-white px-6 py-4 text-slate-900 outline-none focus:ring-4 focus:ring-amber-100"
              />
              <button
                onClick={handleAiGenerate}
                disabled={generating || !aiPrompt}
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-8 py-4 text-sm font-black text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {generating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                {generating ? 'AI is Writing...' : 'Generate & Load into Editor'}
              </button>
            </div>
            <p className="mt-3 text-xs text-amber-600">⬇️ The AI will generate a full HTML email and load it directly into the editor below — you can then edit, add images, links, and buttons before sending.</p>
          </div>
        )}

        {/* AI Draft Loaded Notice */}
        {aiDraftNotice && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800">{aiDraftNotice}</p>
            </div>
            <button onClick={() => setAiDraftNotice(null)} className="shrink-0 text-emerald-500 hover:text-emerald-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          
          {/* Main Editor */}
          <div className="space-y-6">
            <div id="email-editor-top" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Campaign Subject</label>
                  <input
                    type="text"
                    placeholder="Enter an catchy subject line..."
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-lg font-bold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Body (HTML Editor)</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setIsRawHtmlMode(m => !m)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${isRawHtmlMode ? 'border-violet-300 bg-violet-100 text-violet-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Code className="h-3 w-3" />
                    {isRawHtmlMode ? 'Visual Editor' : 'Raw HTML'}
                  </button>
                  <button 
                    onClick={() => { setContent(''); if(quillRef.current) quillRef.current.getEditor().setText(''); setAiDraftNotice(null); }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                  <button 
                    onClick={() => { setShowImgModal(!showImgModal); setShowBtnModal(false); }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${showImgModal ? 'border-blue-400 bg-blue-100 text-blue-800' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                  >
                    <ImageIcon className="h-3 w-3" />
                    📷 Add Photo
                  </button>
                  <button 
                    onClick={() => { setShowBtnModal(!showBtnModal); setShowImgModal(false); }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${showBtnModal ? 'border-indigo-400 bg-indigo-100 text-indigo-800' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <LinkIcon className="h-3 w-3" />
                    Add Button / Link
                  </button>
                </div>
              </div>

              {/* ── Photo Insertion Panel ───────────────────────────────── */}
              {showImgModal && (
                <div className="mb-5 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 p-5 animate-in zoom-in-95 duration-200">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-blue-600" />
                      <h4 className="font-black text-blue-900">Insert Photo into Email</h4>
                    </div>
                    <button onClick={() => setShowImgModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"><X className="h-4 w-4" /></button>
                  </div>

                  {/* Tab: Upload vs URL */}
                  <div className="mb-4 flex rounded-xl border border-blue-100 bg-white p-1">
                    <button onClick={() => setImgTab('upload')} className={`flex-1 rounded-lg py-2 text-xs font-black transition ${imgTab === 'upload' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>⬆️ Upload from Computer</button>
                    <button onClick={() => setImgTab('url')} className={`flex-1 rounded-lg py-2 text-xs font-black transition ${imgTab === 'url' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>🔗 Paste Image URL</button>
                  </div>

                  {imgTab === 'upload' ? (
                    <div className="mb-4">
                      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 text-center hover:border-blue-400 hover:bg-blue-100/40 transition">
                        <ImageIcon className="h-8 w-8 text-blue-400" />
                        <div>
                          <p className="font-bold text-blue-700">Click to select a photo</p>
                          <p className="text-[11px] text-blue-500 mt-1">JPG, PNG, WebP — max 5MB</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageFileUpload(e.target.files[0])} />
                      </label>
                      {imagePreviewUrl && (
                        <div className="mt-3 relative rounded-xl overflow-hidden border border-blue-200">
                          <img src={imagePreviewUrl} alt="preview" className="w-full max-h-48 object-contain bg-slate-100" />
                          <button onClick={() => setImagePreviewUrl(null)} className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow"><X className="h-3 w-3" /></button>
                          <p className="py-1 text-center text-[10px] text-blue-600 font-bold bg-blue-50">✅ Photo ready — configure options below and click Insert</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="mb-1 block text-[10px] font-bold uppercase text-blue-700">Image URL</label>
                      <input 
                        placeholder="https://example.com/photo.jpg"
                        value={imageUrl}
                        onChange={e => { setImageUrl(e.target.value); setImagePreviewUrl(null); }}
                        className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Alt Text (Accessibility)</label>
                      <input value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="Photo description..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Caption (Optional)</label>
                      <input value={imageCaption} onChange={e => setImageCaption(e.target.value)} placeholder="e.g. Our team at work..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Link (Optional)</label>
                      <input value={imageLinkUrl} onChange={e => setImageLinkUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Alignment</label>
                      <div className="flex gap-1">
                        {(['left', 'center', 'right'] as const).map(a => (
                          <button key={a} onClick={() => setImageAlignment(a)} className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition ${imageAlignment === a ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{a}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Width</label>
                      <div className="flex gap-1">
                        {(['100%', '75%', '50%'] as const).map(w => (
                          <button key={w} onClick={() => setImageWidth(w)} className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${imageWidth === w ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{w}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Rounded Corners</label>
                      <div className="flex gap-1">
                        {([['12', 'Soft'], ['6', 'Mild'], ['0', 'None']] as const).map(([v, label]) => (
                          <button key={v} onClick={() => setImageBorderRadius(v)} className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${imageBorderRadius === v ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{label}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => { setShowImgModal(false); setImagePreviewUrl(null); setImageUrl(''); }} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                    <button onClick={insertImage} disabled={!imagePreviewUrl && !imageUrl} className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-40">
                      <ImageIcon className="h-3.5 w-3.5" /> Insert Photo into Email
                    </button>
                  </div>
                </div>
              )}

              {/* ── Button / Link Insertion Panel ──────────────────────── */}
              {showBtnModal && (
                <div className="mb-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-slate-50 p-5 animate-in zoom-in-95 duration-200">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-indigo-600" />
                      <h4 className="font-black text-indigo-900">Insert Button / Link</h4>
                    </div>
                    <button onClick={() => setShowBtnModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"><X className="h-4 w-4" /></button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-indigo-700">Button Text</label>
                      <input value={btnText} onChange={e => setBtnText(e.target.value)} placeholder="Book Your Repair Now" className="w-full rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-indigo-700">Destination URL</label>
                      <input value={btnUrl} onChange={e => setBtnUrl(e.target.value)} placeholder="https://www.itservicesfreetown.com/..." className="w-full rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-indigo-700">Button Color</label>
                      <div className="flex gap-2">
                        {([['red','#dc2626'],['blue','#2563eb'],['green','#16a34a'],['indigo','#4f46e5'],['slate','#334155']] as const).map(([c, hex]) => (
                          <button key={c} onClick={() => setBtnColor(c)} className="h-8 w-8 rounded-lg ring-2 ring-offset-2 transition" style={{ backgroundColor: hex, ringColor: btnColor === c ? hex : 'transparent', outline: btnColor === c ? `2px solid ${hex}` : 'none' }} title={c} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase text-indigo-700">Alignment</label>
                      <div className="flex gap-1">
                        {(['left', 'center', 'right'] as const).map(a => (
                          <button key={a} onClick={() => setBtnAlign(a)} className={`flex-1 rounded-lg py-2 text-xs font-bold capitalize transition ${btnAlign === a ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>{a}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-white p-4">
                    <p className="mb-2 text-[10px] font-bold uppercase text-indigo-400">Button Preview</p>
                    <div style={{ textAlign: btnAlign }}>
                      <span style={{ display:'inline-block', backgroundColor: ['#dc2626','#2563eb','#16a34a','#4f46e5','#334155'][['red','blue','green','indigo','slate'].indexOf(btnColor)], color:'#fff', padding:'12px 24px', borderRadius:'10px', fontWeight:'bold', fontSize:'14px' }}>
                        {btnText || 'Button Text'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setShowBtnModal(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                    <button onClick={insertButton} disabled={!btnText || !btnUrl} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-40">
                      <LinkIcon className="h-3.5 w-3.5" /> Insert into Email
                    </button>
                  </div>
                </div>
              )}

              {/* ── Rich Text Editor or Raw HTML ────────────────────────── */}
              {isRawHtmlMode ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-violet-600">Raw HTML Mode</label>
                    <span className="text-[10px] text-slate-400">Edit HTML directly — switch back to Visual Editor to use the toolbar</span>
                  </div>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="h-[520px] w-full rounded-2xl border border-violet-200 bg-slate-950 p-6 font-mono text-xs text-emerald-300 outline-none focus:ring-2 focus:ring-violet-400"
                    spellCheck={false}
                    placeholder="<h1>Hello,</h1><p>Your message here...</p>"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Visual Editor</label>
                  <div className="quill-wrapper">
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      onChangeSelection={handleSelectionChange}
                      modules={modules}
                      placeholder="Paste AI-generated content here, or start typing your email..."
                      className="h-[520px] overflow-hidden rounded-2xl border-slate-100 bg-slate-50 text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Live Mobile Preview (iPhone 12)</h3>
              
              {/* iPhone 12 Container */}
              <div className="relative mx-auto w-[320px] h-[650px] rounded-[40px] border-[10px] border-slate-900 bg-slate-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] ring-4 ring-slate-800 ring-opacity-30">
                {/* Ring / Silent Toggle */}
                <div className="absolute top-[80px] -left-[13px] h-[20px] w-[3px] rounded-l bg-slate-800"></div>
                {/* Volume Up */}
                <div className="absolute top-[120px] -left-[13px] h-[40px] w-[3px] rounded-l bg-slate-800"></div>
                {/* Volume Down */}
                <div className="absolute top-[170px] -left-[13px] h-[40px] w-[3px] rounded-l bg-slate-800"></div>
                {/* Side Power Button */}
                <div className="absolute top-[140px] -right-[13px] h-[60px] w-[3px] rounded-r bg-slate-800"></div>

                {/* The Notch */}
                <div className="absolute top-0 left-1/2 z-50 h-[22px] w-[140px] -translate-x-1/2 rounded-b-[14px] bg-slate-900 flex items-center justify-center gap-1.5 pb-1">
                  {/* Speaker */}
                  <div className="h-[3px] w-[35px] rounded-full bg-zinc-700"></div>
                  {/* Camera */}
                  <div className="h-[6px] w-[6px] rounded-full bg-zinc-800 border border-zinc-700/50"></div>
                </div>

                {/* Screen Content Wrapper */}
                <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[30px] bg-white pt-[22px] pb-[16px]">
                  {/* Status Bar */}
                  <div className="flex h-[24px] items-center justify-between px-6 text-[10px] font-bold text-slate-800 select-none bg-slate-50 border-b border-slate-100">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      {/* Signal */}
                      <svg className="h-2.5 w-2.5 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 22h20V2z" />
                      </svg>
                      {/* Wifi */}
                      <svg className="h-2.5 w-2.5 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21l-12-12c4.4-4.4 11.6-4.4 16 0z" />
                      </svg>
                      {/* Battery */}
                      <div className="h-3 w-5 rounded-sm border border-slate-800 p-0.5 flex items-center">
                        <div className="h-full w-full bg-slate-800 rounded-2xs"></div>
                      </div>
                    </div>
                  </div>

                  {/* Mail Header / App bar */}
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500 font-semibold select-none">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">BT</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate text-[11px]">BridgeTech IT Services</p>
                      <p className="text-[9px] text-slate-400 truncate">Subject: {subject || '(No Subject)'}</p>
                    </div>
                  </div>

                  {/* Email Body Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 text-xs scrollbar-thin">
                    <div dangerouslySetInnerHTML={{ __html: content }} className="preview-content" />
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-1 left-1/2 h-[4px] w-[110px] -translate-x-1/2 rounded-full bg-slate-800 z-50"></div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-800">
              <h3 className="mb-2 font-bold">Pro Tip: Personalization & Images</h3>
              <p className="opacity-80">You can paste images directly into the editor, but for best compatibility with Gmail and Outlook, we recommend using <strong>Image URLs</strong>. Links will be automatically tracked for engagement. Every email will include your official business footer and an unsubscribe link.</p>
            </div>
          </div>

          {/* Sidebar - Recipients */}
          <div className="space-y-6">
            <div className="flex h-[800px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-black text-slate-900">
                    <Users className="h-5 w-5 text-blue-500" />
                    Recipient List
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddEmails(!showAddEmails)
                      setAddEmailsError(null)
                    }}
                    className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition shadow-sm ${
                      showAddEmails
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title="Add email addresses separated by comma"
                  >
                    {showAddEmails ? (
                      <>
                        <X className="h-3.5 w-3.5" />
                        Close
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        Add Emails
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-3 flex flex-wrap items-center justify-between gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={toggleSelectAll}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {filteredLeads.filter(l => !l.deliveryFailed).length > 0 &&
                       filteredLeads.filter(l => !l.deliveryFailed).every(l => selectedEmails.has(l.email)) 
                        ? 'Deselect Filtered' 
                        : 'Select Filtered'}
                    </button>
                    {selectedEmails.size > 0 && (
                      <button 
                        onClick={deselectAll}
                        className="text-xs font-bold text-red-600 hover:underline border-l border-slate-200 pl-2"
                      >
                        Clear All
                      </button>
                    )}
                    {leads.some(l => l.deliveryFailed) && (
                      <>
                        <button 
                          onClick={handleRestoreBounced}
                          className="text-xs font-bold text-emerald-600 hover:underline border-l border-slate-200 pl-2"
                        >
                          Restore Bounced
                        </button>
                        <button 
                          onClick={handleCleanBounced}
                          disabled={cleaning}
                          className="text-xs font-bold text-amber-600 hover:underline border-l border-slate-200 pl-2"
                        >
                          {cleaning ? 'Cleaning…' : 'Clean Bounced'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Manual Add Emails Panel */}
                {showAddEmails && (
                  <div className="mb-4 rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-4 shadow-sm animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-blue-900">
                          Add Emails (Comma-Separated)
                        </h3>
                      </div>
                      <button
                        onClick={() => { setShowAddEmails(false); setManualEmailsInput(''); setAddEmailsError(null); }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-blue-100/50"
                        title="Close"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                      Paste or type multiple email addresses separated by commas:
                    </p>

                    <textarea
                      rows={3}
                      value={manualEmailsInput}
                      onChange={(e) => { setManualEmailsInput(e.target.value); setAddEmailsError(null); }}
                      placeholder="client1@gmail.com, client2@yahoo.com, info@firm.com..."
                      className="w-full rounded-xl border border-blue-200 bg-white p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono transition resize-none placeholder:text-slate-400"
                    />

                    {addEmailsError && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-600">{addEmailsError}</p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSelectNewEmails}
                          onChange={(e) => setAutoSelectNewEmails(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Auto-select for campaign</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setShowAddEmails(false); setManualEmailsInput(''); setAddEmailsError(null); }}
                          className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={addingEmails || !manualEmailsInput.trim()}
                          onClick={handleAddManualEmails}
                          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                          {addingEmails ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Adding…
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Add to List
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, email or source..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-200 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <p className="text-xs font-medium">Loading leads...</p>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-xs font-medium text-slate-400">No leads match your search</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredLeads
                      .slice((recipientPage - 1) * RECIPIENTS_PER_PAGE, recipientPage * RECIPIENTS_PER_PAGE)
                      .map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => toggleEmail(lead.email)}
                        disabled={lead.deliveryFailed}
                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                          lead.deliveryFailed
                            ? 'opacity-50 bg-slate-50/50 cursor-not-allowed border border-slate-100'
                            : selectedEmails.has(lead.email) 
                              ? 'bg-blue-50 border border-blue-100' 
                              : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {lead.deliveryFailed ? (
                            <div className="h-5 w-5 rounded border border-red-300 bg-red-50 flex items-center justify-center text-[10px] font-black text-red-500">✕</div>
                          ) : selectedEmails.has(lead.email) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-bold ${lead.deliveryFailed ? 'text-slate-400 line-through' : selectedEmails.has(lead.email) ? 'text-blue-900' : 'text-slate-800'}`}>
                            {lead.name || 'Anonymous Customer'}
                          </p>
                          <p className="truncate text-[10px] text-slate-500">{lead.email}</p>
                        </div>
                        {lead.deliveryFailed ? (
                          <div className="rounded-full bg-red-100 px-2 py-0.5 text-[8px] font-black uppercase text-red-600 border border-red-200">
                            Bounced
                          </div>
                        ) : (
                          <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase text-slate-400">
                            {lead.source}
                          </div>
                        )}
                        {lead.deliveryFailed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.email);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 transition rounded-lg ml-1"
                            title="Remove this lead"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recipient Pagination Footer */}
              {filteredLeads.length > RECIPIENTS_PER_PAGE && (
                <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-slate-50/50">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Page {recipientPage} of {Math.ceil(filteredLeads.length / RECIPIENTS_PER_PAGE)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRecipientPage(p => Math.max(1, p - 1))}
                      disabled={recipientPage === 1}
                      className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setRecipientPage(p => Math.min(Math.ceil(filteredLeads.length / RECIPIENTS_PER_PAGE), p + 1))}
                      disabled={recipientPage === Math.ceil(filteredLeads.length / RECIPIENTS_PER_PAGE)}
                      className="px-2.5 py-1 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-widest">Total Selected</span>
                  <span className="font-black text-blue-600">{selectedEmails.size} / {leads.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== WEEKLY AUTO-NEWSLETTER PANEL ========== */}
        <div className="mt-10 rounded-3xl border-2 border-emerald-100 bg-white shadow-sm overflow-hidden">
          {/* Panel Header */}
          <button
            onClick={() => setShowNewsletterPanel(!showNewsletterPanel)}
            className="w-full flex items-center justify-between p-6 hover:bg-emerald-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black text-slate-900">Weekly Auto-Newsletter</h2>
                <p className="text-sm text-slate-500">Fires every Monday at 9 AM — AI writes clean, professional copy, system sends it</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {newsletterSettings && (
                <span className={`rounded-full px-3 py-1 text-xs font-black ${newsletterSettings.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {newsletterSettings.enabled ? '● Active' : '○ Inactive'}
                </span>
              )}
              {showNewsletterPanel ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </div>
          </button>

          {showNewsletterPanel && (
            <div className="border-t border-emerald-100 p-6 space-y-8">

              {/* Enable/Disable toggle */}
              {newsletterSettings && (
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div>
                    <p className="font-black text-slate-800">Enable Automated Weekly Send</p>
                    <p className="text-sm text-slate-500 mt-0.5">When enabled, the system automatically sends every Monday at 9:00 AM.</p>
                    {newsletterSettings.lastSentAt && (
                      <p className="mt-1 text-xs text-slate-400">Last sent: {new Date(newsletterSettings.lastSentAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setNewsletterSettings(prev => prev ? { ...prev, enabled: !prev.enabled } : prev)}
                    className="flex-shrink-0"
                  >
                    {newsletterSettings.enabled
                      ? <ToggleRight className="h-10 w-10 text-emerald-500" />
                      : <ToggleLeft className="h-10 w-10 text-slate-300" />}
                  </button>
                </div>
              )}

              {/* Subject Prefix */}
              {newsletterSettings && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Subject Prefix</label>
                  <input
                    type="text"
                    value={newsletterSettings.subjectPrefix}
                    onChange={e => setNewsletterSettings(prev => prev ? { ...prev, subjectPrefix: e.target.value } : prev)}
                    placeholder="e.g. BridgeTech IT Services: "
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 text-slate-900 font-semibold outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition"
                  />
                  <p className="mt-1 text-xs text-slate-400">This text appears before the AI-generated subject line. Example: <em>BridgeTech IT Services: 5 Tips to Protect Your Phone Screen</em></p>
                </div>
              )}

              {/* Topics Pool */}
              {newsletterSettings && (
                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Newsletter Topics Pool ({newsletterSettings.topics.length} topics)</label>
                  <p className="mb-3 text-sm text-slate-500">The system rotates through these topics automatically, using each one before repeating. The AI generates unique content for each topic every week.</p>
                  <div className="space-y-2 mb-4">
                    {newsletterSettings.topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">{index + 1}</span>
                        <p className="flex-1 text-sm text-slate-700">{topic}</p>
                        <button
                          onClick={() => removeTopic(index)}
                          className="text-slate-300 hover:text-red-500 transition flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTopic()}
                      placeholder="Add a new newsletter topic..."
                      className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-50 transition"
                    />
                    <button
                      onClick={addTopic}
                      disabled={!newTopic.trim()}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-40 transition"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </button>
                  </div>
                </div>
              )}

              {/* Save Settings */}
              <div className="flex justify-end">
                <button
                  onClick={saveNewsletterSettings}
                  disabled={savingSettings || !newsletterSettings}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-200 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 transition hover:scale-105"
                >
                  {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              {/* Test Send Section */}
              <div className="rounded-2xl border-2 border-amber-100 bg-amber-50/40 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-amber-600" />
                  <h3 className="font-black text-amber-900">Send a Test Newsletter Now</h3>
                </div>
                <p className="mb-4 text-sm text-amber-700">This will generate a full newsletter email using AI (with a unique illustration) and send it to the address below. The next rotating topic will be selected automatically unless you specify one.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase text-amber-700">Test Recipient Email</label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={e => setTestEmail(e.target.value)}
                      placeholder="support@itservicesfreetown.com"
                      className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase text-amber-700">Override Topic (optional)</label>
                    <input
                      type="text"
                      value={testTopic}
                      onChange={e => setTestTopic(e.target.value)}
                      placeholder="Leave blank to use next rotation topic"
                      className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={sendTestNewsletter}
                    disabled={sendingTest || !testEmail}
                    className="flex items-center gap-2 rounded-2xl bg-amber-600 px-8 py-3 text-sm font-black text-white shadow-md shadow-amber-200 hover:bg-amber-700 disabled:opacity-50 transition"
                  >
                    {sendingTest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
                    {sendingTest ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>

              {/* Manual Blast Section — Generate → Review & Edit → Blast */}
              <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50/30 p-5 mt-4">
                <div className="mb-3 flex items-center gap-2">
                  <Send className="h-5 w-5 text-red-600" />
                  <h3 className="font-black text-red-900">Manual Newsletter Blast</h3>
                  <span className="ml-auto rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-700">2-step: Generate → Edit → Send</span>
                </div>
                <p className="mb-4 text-sm text-red-700">
                  First, generate the AI newsletter draft and load it into the editor so you can <strong>review, edit, add photos and links</strong>. Once you're happy, click <strong>Blast Campaign</strong> in the header to send to all selected subscribers.
                </p>

                {/* Step 1: Generate draft */}
                <div className="mb-4 rounded-xl border border-red-100 bg-white p-4">
                  <p className="mb-2 text-[10px] font-black uppercase text-red-500">Step 1 — Generate AI Draft</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualBlastTopic}
                      onChange={e => setManualBlastTopic(e.target.value)}
                      placeholder="Optional: specify topic (leave blank for auto-rotation)"
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
                    />
                    <button
                      onClick={handleGenerateNewsletterDraft}
                      disabled={generatingNewsletter}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-black text-white shadow shadow-amber-200 hover:bg-amber-600 disabled:opacity-50 transition"
                    >
                      {generatingNewsletter ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {generatingNewsletter ? 'Generating...' : 'Generate AI Draft'}
                    </button>
                  </div>
                  {generatingNewsletter && (
                    <p className="mt-2 text-[11px] text-amber-600 animate-pulse">⏳ AI is writing your newsletter — this takes 5–15 seconds...</p>
                  )}
                </div>

                {/* Step 2: After draft is loaded into editor */}
                <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
                  <p className="mb-2 text-[10px] font-black uppercase text-red-500">Step 2 — After Editing in the Editor Above</p>
                  <p className="mb-3 text-xs text-red-600">Select your recipients in the sidebar, then use the <strong>"Blast Campaign"</strong> button in the top right header to send. Or use the emergency direct blast below (bypasses editor, uses AI auto-generated content).</p>
                  <div className="flex items-center justify-between gap-3 border-t border-red-100 pt-3">
                    <p className="text-[10px] text-red-400 italic">⚠️ Emergency only — skips editor review</p>
                    <button
                      onClick={sendManualBlast}
                      disabled={sendingManualBlast}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow shadow-red-200 hover:bg-red-700 disabled:opacity-50 transition"
                    >
                      {sendingManualBlast ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {sendingManualBlast ? 'Blasting...' : '⚡ Emergency Blast (Skip Review)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Run History Logs */}
              <div>
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-5 py-3.5 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" />
                    <span className="font-black text-sm text-slate-700">Run History ({newsletterLogs.length} logs)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {newsletterLogs.length > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); clearNewsletterLogs() }}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                    {showLogs ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </button>

                {showLogs && (
                  <div className="mt-2 space-y-2">
                    {newsletterLogs.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-400">No newsletter runs logged yet. Send a test to see history here.</p>
                    ) : (
                      newsletterLogs.slice(0, 20).map(log => (
                        <div key={log.id} className={`rounded-xl border px-4 py-3 text-sm ${log.status === 'success' ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 line-clamp-1">{log.topic}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{log.subject}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${log.status === 'success' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
                                {log.status === 'success' ? `✓ ${log.recipients} sent` : '✕ Failed'}
                              </span>
                              <p className="mt-1 text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          {log.error && <p className="mt-1 text-xs text-red-600 font-medium">{log.error}</p>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      <style jsx global>{`
        .ql-container {
          font-family: inherit !important;
          font-size: 16px !important;
          border: none !important;
        }
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          background: #f8fafc;
          padding: 12px 20px !important;
          border-radius: 20px 20px 0 0;
        }
        .ql-editor {
          padding: 30px !important;
          min-height: 400px;
        }
        .ql-editor.ql-blank::before {
          font-style: normal !important;
          color: #94a3b8 !important;
          font-weight: 500;
        }
        .quill-wrapper {
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  )
}
