'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Send, Users, Image as ImageIcon, Type, Link as LinkIcon, CheckSquare, Square, Trash2, RefreshCw, Mail, ArrowLeft, Sparkles, Wand2 } from 'lucide-react'
import Link from 'next/link'
import 'react-quill/dist/quill.snow.css'

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface EmailLead {
  id: string
  email: string
  name: string | null
  source: string
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
  const [showBtnModal, setShowBtnModal] = useState(false)
  const [showImgModal, setShowImgModal] = useState(false)
  const [btnText, setBtnText] = useState('Click Here')
  const [btnUrl, setBtnUrl] = useState('https://')
  const [imageUrl, setImageUrl] = useState('')
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLeads()
    checkConfig()
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

  const toggleSelectAll = () => {
    const next = new Set(selectedEmails)
    const allFilteredEmails = filteredLeads.map(l => l.email)
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
    try {
      const buttonHtml = `<a href="${btnUrl}" class="email-button" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">${btnText}</a>`
      const quill = quillRef.current?.getEditor()
      
      if (quill) {
        quill.focus()
        // Use remembered range or current or end
        const index = lastRange.current ? lastRange.current.index : quill.getLength()
        quill.clipboard.dangerouslyPasteHTML(index, buttonHtml)
        // Explicitly update content state from editor
        setTimeout(() => setContent(quill.root.innerHTML), 100)
      } else {
        setContent(prev => prev + '<p>' + buttonHtml + '</p>')
      }
      setShowBtnModal(false)
    } catch (e) {
      console.error('Insert button error:', e)
      setContent(prev => prev + `<p><a href="${btnUrl}" style="color:red;font-weight:bold;">${btnText}</a></p>`)
      setShowBtnModal(false)
    }
  }

  const insertImage = () => {
    if (!imageUrl) {
      alert('Please enter an image URL first.')
      return
    }
    try {
      const imgHtml = `<img src="${imageUrl}" alt="Email Image" style="max-width: 100%; height: auto; display: block; margin: 15px 0; border-radius: 8px;" />`
      const quill = quillRef.current?.getEditor()
      
      if (quill) {
        quill.focus()
        // Use remembered range or current or end
        const index = lastRange.current ? lastRange.current.index : quill.getLength()
        quill.clipboard.dangerouslyPasteHTML(index, imgHtml)
        // Explicitly update content state from editor
        setTimeout(() => setContent(quill.root.innerHTML), 100)
      } else {
        setContent(prev => prev + '<p>' + imgHtml + '</p>')
      }
      setShowImgModal(false)
      setImageUrl('')
    } catch (e) {
      console.error('Insert image error:', e)
      setContent(prev => prev + `<p><img src="${imageUrl}" style="max-width:100%" /></p>`)
      setShowImgModal(false)
      setImageUrl('')
    }
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
      if (data.subject && data.content) {
        setSubject(data.subject)
        setContent(data.content)
        setShowAi(false)
        setAiPrompt('')
        alert('AI content generated and placed in editor!')
      } else {
        alert('AI generation failed: ' + (data.error || 'Unknown error'))
      }
    } catch (e) {
      alert('Error during AI generation')
    } finally {
      setGenerating(false)
    }
  }

  const toggleEmail = (email: string) => {
    const next = new Set(selectedEmails)
    if (next.has(email)) next.delete(email)
    else next.add(email)
    setSelectedEmails(next)
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
                {generating ? 'AI is Writing...' : 'Generate Email'}
              </button>
            </div>
            <p className="mt-3 text-xs text-amber-600">The AI will automatically draft a subject line and a professional HTML body for you.</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          
          {/* Main Editor */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
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

              <div className="mb-4 flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Body (HTML Editor)</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setContent(''); if(quillRef.current) quillRef.current.getEditor().setText(''); }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear Editor
                  </button>
                  <button 
                    onClick={() => { setShowImgModal(!showImgModal); setShowBtnModal(false); }}
                    className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                  >
                    <ImageIcon className="h-3 w-3" />
                    Insert Image URL
                  </button>
                  <button 
                    onClick={() => { setShowBtnModal(!showBtnModal); setShowImgModal(false); }}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                  >
                    <LinkIcon className="h-3 w-3" />
                    Insert Red Button
                  </button>
                </div>
              </div>

              {showImgModal && (
                <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4 animate-in zoom-in-95 duration-200">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-blue-800 uppercase">Paste Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        placeholder="https://example.com/photo.jpg"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className="flex-1 rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <button onClick={insertImage} className="rounded-lg bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700">Add</button>
                      <button onClick={() => setShowImgModal(false)} className="px-2 py-2 text-xs font-bold text-slate-500">Cancel</button>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-blue-600/60 italic">Note: Use a direct link to an image (ending in .jpg, .png, etc.)</p>
                </div>
              )}

              {showBtnModal && (
                <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/30 p-4 animate-in zoom-in-95 duration-200">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-red-800 uppercase">Button Text</label>
                      <input 
                        value={btnText}
                        onChange={e => setBtnText(e.target.value)}
                        className="w-full rounded-lg border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-bold text-red-800 uppercase">Link URL</label>
                      <input 
                        value={btnUrl}
                        onChange={e => setBtnUrl(e.target.value)}
                        className="w-full rounded-lg border border-red-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setShowBtnModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
                    <button onClick={insertButton} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-200 hover:bg-red-700">Add to Email</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Body (HTML Editor)</label>
                <div className="quill-wrapper">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    onChangeSelection={handleSelectionChange}
                    modules={modules}
                    placeholder="Start designing your email here..."
                    className="h-[500px] overflow-hidden rounded-2xl border-slate-100 bg-slate-50 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Live Mobile Preview</h3>
              <div className="mx-auto max-w-[375px] rounded-[3rem] border-[8px] border-slate-900 bg-white shadow-2xl">
                <div className="h-6 w-full bg-slate-900"></div>
                <div className="h-[500px] overflow-y-auto p-4 text-sm">
                  <div className="mb-4 border-b border-slate-100 pb-2">
                    <p className="text-[10px] text-slate-400">Subject: <span className="text-slate-900 font-bold">{subject || '(No Subject)'}</span></p>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: content }} className="preview-content" />
                </div>
                <div className="h-6 w-full bg-slate-900"></div>
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
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-black text-slate-900">
                    <Users className="h-5 w-5 text-blue-500" />
                    Recipient List
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleSelectAll}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {filteredLeads.every(l => selectedEmails.has(l.email)) ? 'Deselect Filtered' : 'Select Filtered'}
                    </button>
                    {selectedEmails.size > 0 && (
                      <button 
                        onClick={deselectAll}
                        className="text-xs font-bold text-red-600 hover:underline border-l border-slate-200 pl-2"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
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
                    {filteredLeads.map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => toggleEmail(lead.email)}
                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                          selectedEmails.has(lead.email) 
                            ? 'bg-blue-50 border border-blue-100' 
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {selectedEmails.has(lead.email) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-bold ${selectedEmails.has(lead.email) ? 'text-blue-900' : 'text-slate-800'}`}>
                            {lead.name || 'Anonymous Customer'}
                          </p>
                          <p className="truncate text-[10px] text-slate-500">{lead.email}</p>
                        </div>
                        <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase text-slate-400">
                          {lead.source}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-widest">Total Selected</span>
                  <span className="font-black text-blue-600">{selectedEmails.size} / {leads.length}</span>
                </div>
              </div>
            </div>
          </div>
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
