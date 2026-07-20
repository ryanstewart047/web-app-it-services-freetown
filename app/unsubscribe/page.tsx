'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function UnsubscribePage() {
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')

  const handleUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real system, we would call an API here to mark the email as unsubscribed.
    // For now, we just show a success message.
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black">Email Preferences</h1>
          <p className="text-red-100 text-sm mt-2">Manage your subscription to IT Services Freetown</p>
        </div>

        <div className="p-8">
          {!done ? (
            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <p className="text-slate-600 text-sm leading-relaxed text-center">
                We're sorry to see you go. Enter your email below to stop receiving marketing updates from us.
              </p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                Unsubscribe Me
              </button>
            </form>
          ) : (
            <div className="text-center py-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">You're Unsubscribed</h2>
              <p className="text-slate-500 text-sm mb-8">
                Your email has been removed from our marketing list. You may still receive service updates related to your repairs or orders.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
              >
                Go back to home <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            IT Services Freetown | Quality Service Guaranteed
          </p>
        </div>
      </div>
    </div>
  )
}
