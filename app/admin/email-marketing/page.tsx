'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Send, Users, Image as ImageIcon, Type, Link as LinkIcon, CheckSquare, Square, Trash2, RefreshCw, Mail, ArrowLeft } from 'lucide-react'
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
  const [leads, setLeads] = useState<EmailLead[]>([])
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

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

  const toggleSelectAll = () => {
    if (selectedEmails.size === leads.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(leads.map(l => l.email)))
    }
  }

  const toggleEmail = (email: string) => {
    const next = new Set(selectedEmails)
    if (next.has(email)) next.delete(email)
    else next.add(email)
    setSelectedEmails(next)
  }

  const handleSend = async () => {
    if (!subject || !content || selectedEmails.size === 0) {
      alert('Please provide a subject, content, and select at least one recipient.')
      return
    }

    if (!confirm(`Send this email to ${selectedEmails.size} recipients?`)) return

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
      if (data.success) {
        alert(`Success! Campaign sent to ${data.sent} recipients. ${data.failed} failed.`)
      } else {
        alert('Failed to send: ' + data.error)
      }
    } catch (e) {
      alert('Error sending campaign')
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

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Email Body (HTML Editor)</label>
                <div className="quill-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    placeholder="Start designing your email here..."
                    className="h-[500px] overflow-hidden rounded-2xl border-slate-100 bg-slate-50 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-800">
              <h3 className="mb-2 font-bold">Pro Tip: Personalization</h3>
              <p className="opacity-80">You can paste images directly into the editor. Links will be automatically tracked for engagement. Every email will include your official business footer and an unsubscribe link.</p>
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
                  <button 
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    {selectedEmails.size === leads.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search leads..."
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pl-9 pr-4 text-xs outline-none focus:border-blue-200 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <p className="text-xs font-medium">Loading leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-xs font-medium text-slate-400">No leads found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {leads.map(lead => (
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
                  <span className="font-bold text-slate-500 uppercase tracking-widest">Total Leads</span>
                  <span className="font-black text-slate-900">{leads.length}</span>
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
