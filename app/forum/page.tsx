'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForum } from './layout';

interface Topic {
  id: string;
  title: string;
  author: string;
  repliesCount: number;
  date: string;
}

export default function ForumDashboard() {
  const { user } = useForum();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState({ online: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // New Topic Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent })
      });
      if (res.ok) {
        setShowModal(false);
        setNewTitle('');
        setNewContent('');
        // Refresh topics natively without reload
        const newTopicsRes = await fetch('/api/forum/topics');
        if (newTopicsRes.ok) setTopics(await newTopicsRes.json());
      }
    } catch (error) {
       console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-20"><div className="animate-pulse h-8 w-32 bg-gray-200 rounded mx-auto mb-4"></div><div className="space-y-3 max-w-4xl mx-auto"><div className="h-16 bg-gray-200 rounded"></div><div className="h-16 bg-gray-200 rounded"></div></div></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4">
      
      {/* Sidebar: Online Stats */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Forum Stats</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700 font-medium">Members Online:</span>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {stats.online}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Total Registered:</span>
            <span className="text-gray-900 font-bold">{stats.total}</span>
          </div>
        </div>

        <button 
           onClick={() => setShowModal(true)}
           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors text-center"
        >
          + New Discussion
        </button>
      </div>

      {/* Main Feed: Topics */}
      <div className="md:col-span-3 space-y-4">
        {topics.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            No discussions found. Be the first to start a topic!
          </div>
        ) : (
          topics.map(topic => (
            <Link href={`/forum/${topic.id}`} key={topic.id} className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h2>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="font-medium text-gray-900">{topic.author}</span>
                    <span>•</span>
                    <span>{new Date(topic.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-3 min-w-[60px]">
                  <span className="font-bold text-gray-900">{topic.repliesCount}</span>
                  <span className="text-xs text-gray-500 font-medium">replies</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* New Topic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Start new discussion</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
                <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border" placeholder="What do you need help with?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea required rows={6} value={newContent} onChange={e => setNewContent(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2 border" placeholder="Explain the issue in detail..."></textarea>
              </div>
              {/* Note: In a production app you'd add image attachment buttons here triggering /api/forum/upload, but for brevity we rely strictly on text first. We'll add images to replies later. */}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Posting...' : 'Post Topic'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
