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
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const [topicsRes, repliesRes] = await Promise.all([
          fetch('/api/forum/topics'), // We fetch all then filter because of GitHub REST structure
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).slice(0, 2); // Max 2
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

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      // 1. Upload Images
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

      // 2. Post Reply
      const res = await fetch(`/api/forum/topics/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, images: imageUrls })
      });

      if (res.ok) {
        setReplyContent('');
        setFiles([]);
        // Refresh replies natively
        const rRes = await fetch(`/api/forum/topics/${id}/replies`);
         if (rRes.ok) setReplies(await rRes.json());
      } else {
        setError('Failed to post reply.');
      }
    } catch (e) {
      setError('A network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-20"><div className="animate-pulse h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div></div>;
  if (!topic) return <div className="text-center mt-20">Topic not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <Link href="/forum" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        Back to Dashboard
      </Link>

      {/* Main Topic */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{topic.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            {topic.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-gray-900">{topic.author}</span>
            <span className="mx-2">•</span>
            <span>{new Date(topic.date).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="prose prose-blue max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: topic.content }} />
        
        {topic.images && topic.images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
             {topic.images.map((img: string, i: number) => (
                <a href={img} target="_blank" rel="noreferrer" key={i} className="block rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <img src={img} alt="Attachment" className="w-full h-auto object-cover max-h-64" />
                </a>
             ))}
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">Replies ({replies.length})</h3>

      {/* Replies List */}
      <div className="space-y-4">
        {replies.map(reply => (
          <div key={reply.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6 ml-0 md:ml-8">
            <div className="flex items-center gap-3 text-sm mb-4">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                {reply.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-gray-900">{reply.author}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-500">{new Date(reply.createdAt).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="prose prose-blue max-w-none text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: reply.content }} />
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8 md:ml-8">
        <h4 className="font-bold text-gray-900 mb-4">Write a Reply</h4>
        {error && <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>}
        <form onSubmit={handlePostReply}>
           <textarea 
             required 
             rows={4} 
             value={replyContent} 
             onChange={e => setReplyContent(e.target.value)} 
             className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-4 mb-4" 
             placeholder="Offer a solution or ask for clarification..."
           />
           
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Photos (Max 2)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                />
                {files.length > 0 && <p className="text-xs text-gray-500 mt-2">{files.length} file(s) selected</p>}
              </div>

              <button 
                type="submit" 
                disabled={submitting || replyContent.trim() === ''} 
                className="px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm w-full sm:w-auto"
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
           </div>
        </form>
      </div>

    </div>
  );
}
