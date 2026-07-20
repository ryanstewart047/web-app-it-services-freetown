'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Topic {
  id: string;
  title: string;
  author: string;
  category: string;
  repliesCount: number;
  date: string;
}

const CATEGORIES = [
  'Technology', 'General knowledge', 'Mobile repair', 'Computer repair',
  'Operating Systems', 'Windows', 'Linux', 'Mobile unlock',
  'Web development', 'Graphics', 'Communication'
];

const CATEGORY_COLORS: Record<string, string> = {
  'Technology': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'General knowledge': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Mobile repair': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Computer repair': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Operating Systems': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Windows': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  'Linux': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Mobile unlock': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Web development': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Graphics': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Communication': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat] || 'bg-blue-500/10 text-blue-400 border-blue-500/20';
}

export default function ForumDashboard() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState({ online: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // New Topic Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
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
      const selected = Array.from(e.target.files).slice(0, 2);
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

      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent, images: imageUrls, category: newCategory })
      });
      
      if (res.ok) {
        setShowModal(false);
        setNewTitle('');
        setNewContent('');
        setFiles([]);
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
    <div className="text-center mt-20">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
      <div className="space-y-4 max-w-2xl mx-auto px-4">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse border border-slate-700/50"></div>
        ))}
      </div>
    </div>
  );

  const filteredTopics = topics.filter(topic => {
     const query = searchQuery.toLowerCase();
     return topic.title.toLowerCase().includes(query) || 
            topic.author.toLowerCase().includes(query) || 
            (topic.category || '').toLowerCase().includes(query);
  });

  return (
    <div className="font-sans">
      {/* Mobile Stats Bar */}
      <div className="flex sm:hidden items-center justify-between gap-3 mb-4 bg-slate-900/60 rounded-xl border border-slate-700/50 p-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
          <span className="text-xs font-bold text-slate-300">{stats.online} Online</span>
        </div>
        <div className="text-xs font-bold text-slate-500">{stats.total} Members</div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs tracking-wider uppercase py-2 px-4 rounded-lg shadow-lg shadow-blue-500/25 border border-blue-400/30"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">

        {/* Main Feed: Topic Log — comes first in HTML so it's on top on mobile */}
        <div className="md:col-span-3 order-1">

          {/* Search Bar */}
          <div className="relative mb-4">
            <input 
              type="search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, categories, authors..." 
              className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl pl-11 pr-4 py-3 sm:py-4 text-white text-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          {/* Topic List */}
          <div className="space-y-3">
            {filteredTopics.length === 0 ? (
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700/50 p-10 sm:p-16 text-center text-slate-500">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p className="font-medium tracking-wide text-sm">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No discussions yet. Start one!'}
                </p>
              </div>
            ) : (
              filteredTopics.map(topic => (
                <Link href={`/forum/${topic.id}`} key={topic.id} className="block group">
                  <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all p-4 sm:p-5 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] active:scale-[0.99]">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2 flex-wrap">
                          <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold border ${getCategoryColor(topic.category || 'General')}`}>
                            {topic.category || 'General'}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-snug mb-2 line-clamp-2">
                          {topic.title}
                        </h2>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 font-medium uppercase tracking-wider flex-wrap">
                          <span className="text-slate-300 flex items-center gap-1">
                            <svg className="w-3 h-3 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            <span className="truncate max-w-[100px] sm:max-w-none">{topic.author}</span>
                          </span>
                          <span className="text-slate-700">•</span>
                          <span>{new Date(topic.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {/* Reply Count Badge */}
                      <div className="flex flex-col items-center justify-center bg-slate-800/60 rounded-lg px-2.5 py-2 min-w-[52px] border border-slate-700/50 group-hover:bg-slate-800 transition-colors shrink-0">
                        <span className={`font-black text-lg sm:text-xl leading-none ${topic.repliesCount > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                          {topic.repliesCount}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Replies</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: hidden on mobile, shown on md+ */}
        <div className="hidden md:block md:col-span-1 space-y-6 order-2">
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
            + New Discussion
          </button>

          {/* Category Filter Legend */}
          <div className="bg-slate-900/40 rounded-xl border border-slate-700/50 p-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Categories</h4>
            <div className="space-y-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSearchQuery(searchQuery === cat ? '' : cat)}
                  className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    searchQuery === cat ? getCategoryColor(cat) + ' border' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getCategoryColor(cat).split(' ')[1].replace('text-', 'bg-')}`}></span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Topic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#04091a]/90 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 font-sans">
          <div className="bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-700 w-full sm:max-w-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-white/10 relative">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>

            <div className="border-b border-slate-800 px-5 py-4 flex justify-between items-center bg-slate-900/80 z-10">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                New Discussion
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateTopic} className="px-5 py-5 flex-1 overflow-y-auto space-y-4 z-10">
              {errorText && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">{errorText}</div>}
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Title</label>
                <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner px-4 py-3 text-white border text-sm" placeholder="What's your question or topic?" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                <select 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                  className="w-full bg-slate-800 border-slate-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner px-4 py-3 text-white border appearance-none text-sm"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                <textarea required rows={4} value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner px-4 py-3 text-white border text-sm resize-none" placeholder="Describe your issue or idea in detail..."></textarea>
              </div>
              
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Attach Photos (Max 2)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-colors file:cursor-pointer"
                />
                {files.length > 0 && <p className="text-xs font-bold text-green-400 mt-2 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{files.length} photo(s) attached.</p>}
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 bg-transparent border border-slate-700 hover:border-slate-500 rounded-lg transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
                   {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                   {submitting ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
