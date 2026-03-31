'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ThreadView() {
  const { id } = useParams();
  const [topic, setTopic] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply State
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const [topicsRes, repliesRes] = await Promise.all([
          fetch('/api/forum/topics'),
          fetch(`/api/forum/topics/${id}/replies`)
        ]);

        if (topicsRes.ok) {
           const allTopics = await topicsRes.json();
           const t = allTopics.find((x: any) => x.id === id);
           setTopic(t);
        }
        if (repliesRes.ok) {
           setReplies(await repliesRes.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchThread();
  }, [id]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/forum/topics/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, images: [] }) // Empty images per specs
      });

      if (res.ok) {
        setReplyContent('');
        
        // Refresh replies natively
        const rRes = await fetch(`/api/forum/topics/${id}/replies`);
        if (rRes.ok) setReplies(await rRes.json());
      } else {
        setError('Failed to transmit reply to nexus.');
      }
    } catch (e) {
      setError('A network disruption occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="text-center mt-32">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
      <div className="space-y-4 max-w-4xl mx-auto px-4">
        {[1,2].map(i => (
          <div key={i} className={`h-${i === 1 ? '64' : '32'} bg-slate-800/50 rounded-xl animate-pulse border border-slate-700/50`}></div>
        ))}
      </div>
    </div>
  );

  if (!topic) return (
    <div className="text-center mt-32 text-slate-500">
      <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300">Entity Null</h2>
      <p className="mt-2 text-sm">The transmission you requested does not exist or was redacted.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6 font-sans">
      
      <Link href="/forum" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors w-fit bg-blue-900/10 px-4 py-2 rounded-lg border border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-900/20">
        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Abort to Dashboard
      </Link>

      {/* Main Topic Intel */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 md:p-10 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <h1 className="text-3xl font-extrabold text-white mb-6 leading-tight tracking-tight relative z-10">{topic.title}</h1>
        
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-700/50 pb-6 relative z-10">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30">
            {topic.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-blue-400">{topic.author}</span>
            <span className="mx-3 text-slate-600">///</span>
            <span>{new Date(topic.date).toLocaleString()}</span>
          </div>
        </div>
        
        {/* Topic Content Body */}
        <div className="prose prose-invert prose-blue max-w-none text-slate-300 mb-8 relative z-10 custom-markdown" dangerouslySetInnerHTML={{ __html: topic.content }} />
        
        {/* Evidence Photos */}
        {topic.images && topic.images.length > 0 && (
          <div className="mt-10 mb-4 relative z-10">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L28 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Secured Visual Evidence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {topic.images.map((img: string, i: number) => (
                  <a href={img} target="_blank" rel="noreferrer" key={i} className="block rounded-xl overflow-hidden border border-slate-700/80 shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all group relative">
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors z-10"></div>
                    <img src={img} alt={`Evidence ${i}`} className="w-full h-auto object-cover max-h-72 transform group-hover:scale-105 transition-transform duration-500" />
                  </a>
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-6 pb-2">
         <span className="h-px bg-slate-700 flex-1"></span>
         <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transmission Log ({replies.length})</h3>
         <span className="h-px bg-slate-700 flex-1"></span>
      </div>

      {/* Replies List */}
      <div className="space-y-4">
        {replies.map(reply => (
          <div key={reply.id} className="bg-slate-900/40 backdrop-blur-md rounded-xl shadow-lg border border-slate-700/40 p-5 md:p-8 ml-0 md:ml-12 hover:border-blue-500/30 transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500/10"></div>
            
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest mb-4">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-black border border-slate-600 shadow-inner ring-1 ring-slate-700/50">
                {reply.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-200">{reply.author}</span>
                <span className="hidden sm:inline mx-3 text-slate-600">///</span>
                <span className="text-slate-500 text-[10px] mt-1 sm:mt-0">{new Date(reply.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="prose prose-invert prose-blue max-w-none text-slate-300 text-sm pl-0 sm:pl-12" dangerouslySetInnerHTML={{ __html: reply.content }} />
          </div>
        ))}
      </div>

      {/* Reply Box (No File Attachments) */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-500/20 p-6 md:p-8 mt-10 md:ml-12 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-[40px] pointer-events-none"></div>

        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
          Transmit Response
        </h4>
        
        {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm font-medium relative z-10">{error}</div>}
        
        <form onSubmit={handlePostReply} className="relative z-10">
           <textarea 
             required 
             rows={4} 
             value={replyContent} 
             onChange={e => setReplyContent(e.target.value)} 
             className="w-full bg-slate-900 border-slate-700 rounded-xl shadow-inner focus:border-blue-500 focus:ring-blue-500 focus:ring-1 border p-4 mb-4 text-white placeholder-slate-500 transition-colors" 
             placeholder="Compile solution matrix..."
           />
           
           <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
              <button 
                type="submit" 
                disabled={submitting || replyContent.trim() === ''} 
                className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-400/30 flex items-center gap-2"
              >
                {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {submitting ? 'UPLOADING...' : 'BROADCAST'}
              </button>
           </div>
        </form>
      </div>

    </div>
  );
}
