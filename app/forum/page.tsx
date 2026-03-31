'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Topic {
  id: string;
  title: string;
  author: string;
  repliesCount: number;
  date: string;
}

export default function ForumDashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState({ online: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // New Topic Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, statsRes] = await Promise.all([
          fetch('/api/forum/topics'),
          fetch('/api/forum/heartbeat')
        ]);
        
        if (topicsRes.ok) setTopics(await topicsRes.json());
        if (statsRes.ok) {
           const data = await statsRes.json();
           setStats({ online: data.onlineMembers, total: data.totalMembers });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).slice(0, 2); // Max 2 rule
      setFiles(selected);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');
    
    try {
      // 1. Fastly Upload Image Data Stream
      const imageUrls: string[] = [];
      for (const file of files) {
         const b64 = await toBase64(file);
         const upRes = await fetch('/api/forum/upload', {
            method: 'POST',
            body: JSON.stringify({ base64Data: b64, fileName: file.name }),
            headers: { 'Content-Type': 'application/json' }
         });
         const upData = await upRes.json();
         if (upData.success) imageUrls.push(upData.url);
      }

      // 2. Dispatch the Payload
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, images: imageUrls })
      });
      
      if (res.ok) {
        setShowModal(false);
        setNewTitle('');
        setNewContent('');
        setFiles([]);
        
        // Refresh topics silently
        const newTopicsRes = await fetch('/api/forum/topics');
        if (newTopicsRes.ok) setTopics(await newTopicsRes.json());
      } else {
        const errorData = await res.json();
        setErrorText(errorData.error || 'Failed to initialize discussion.');
      }
    } catch (error) {
       setErrorText('Node connection error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="text-center mt-32">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
      <div className="space-y-4 max-w-4xl mx-auto px-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse border border-slate-700/50"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 font-sans">
      
      {/* Sidebar: Diagnostics Board */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            System Telemetry
          </h3>
          
          <div className="flex items-center justify-between mb-5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-300 font-bold text-sm tracking-wide">Network Nodes (Live)</span>
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 border border-green-500/30">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span> {stats.online}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3">
            <span className="text-slate-500 font-bold text-sm tracking-wide">Registered Users</span>
            <span className="text-slate-300 font-bold">{stats.total}</span>
          </div>
        </div>

        <button 
           onClick={() => setShowModal(true)}
           className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wider uppercase py-4 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 border border-blue-400/30"
        >
          + Request Support
        </button>
      </div>

      {/* Main Feed: Topic Log */}
      <div className="md:col-span-3 space-y-4">
        {topics.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 p-16 text-center text-slate-500">
            <svg className="w-16 h-16 mx-auto text-slate-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <p className="font-medium tracking-wide">Data module empty. Begin a new transmission.</p>
          </div>
        ) : (
          topics.map(topic => (
            <Link href={`/forum/${topic.id}`} key={topic.id} className="block group">
              <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all p-5 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors mb-2 leading-tight">
                      {topic.title}
                    </h2>
                    <div className="text-xs text-slate-500 flex items-center gap-3 font-medium uppercase tracking-wider">
                      <span className="text-slate-300 px-2 py-0.5 bg-slate-800 rounded flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {topic.author}
                      </span>
                      <span>•</span>
                      <span>{new Date(topic.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-800/50 rounded-lg p-3 min-w-[70px] border border-slate-700/50 group-hover:bg-slate-800 transition-colors">
                    <span className={`font-black text-lg ${topic.repliesCount > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                      {topic.repliesCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Replies</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Upload/New Topic Modal Base */}
      {showModal && (
        <div className="fixed inset-0 bg-[#04091a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/10 relative">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="border-b border-slate-800 px-6 py-5 flex justify-between items-center bg-slate-900/80 z-10">
              <h2 className="text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Initialize Support Requisition
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateTopic} className="px-6 py-5 flex-1 overflow-y-auto space-y-5 z-10">
              {errorText && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{errorText}</div>}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Subject Header</label>
                <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-inner px-4 py-3 text-white border" placeholder="Identified issue anomaly..." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Detailed Log</label>
                <textarea required rows={5} value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-inner px-4 py-3 text-white border" placeholder="Execute detailed breakdown of the issue array..."></textarea>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Attach Evidence (Max 2 Photos)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-colors file:cursor-pointer"
                />
                {files.length > 0 && <p className="text-xs font-bold text-green-400 mt-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{files.length} Evidence unit(s) secured.</p>}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 bg-transparent border border-slate-700 hover:border-slate-500 rounded-lg transition-all">Abort</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
                   {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                   {submitting ? 'TRANSMITTING...' : 'TRANSMIT TICKET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
