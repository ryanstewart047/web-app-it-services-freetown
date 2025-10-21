'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  date: string
  likes: number
  dislikes: number
  comments: any[]
}

export default function BlogAdminPage() {
  const router = useRouter()
  const { isLoading } = usePageLoader()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('IT Services Freetown')
  const [preview, setPreview] = useState(false)

  useScrollAnimations()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    // Load existing posts
    const savedPosts = localStorage.getItem('blog_posts')
    const posts: BlogPost[] = savedPosts ? JSON.parse(savedPosts) : []

    // Create new post
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      dislikes: 0,
      comments: []
    }

    // Add to beginning of posts array (newest first)
    posts.unshift(newPost)

    // Save to localStorage
    localStorage.setItem('blog_posts', JSON.stringify(posts))

    toast.success('Blog post published successfully!')
    
    // Reset form
    setTitle('')
    setContent('')
    
    // Redirect to blog page after a short delay
    setTimeout(() => {
      router.push('/blog')
    }, 1500)
  }

  const handleCancel = () => {
    if (title || content) {
      if (confirm('Are you sure you want to discard this post?')) {
        router.push('/blog')
      }
    } else {
      router.push('/blog')
    }
  }

  if (isLoading) {
    return <LoadingOverlay />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 scroll-animate">
          <button
            onClick={handleCancel}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </button>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#040e40' }}>
            Create New Blog Post
          </h1>
          <p className="text-gray-600 mt-2">Share tech tips and updates with your audience</p>
        </div>

        {/* Form */}
        {!preview ? (
          <form onSubmit={handleSubmit} className="space-y-6 scroll-animate">
            {/* Author */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author Name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your name or company name"
                required
              />
            </div>

            {/* Title */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Post Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-2xl font-bold"
                placeholder="Enter an engaging title..."
                required
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Post Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Write your blog post content here...

Tips:
- Use **bold** for emphasis
- Keep paragraphs short and readable
- Include actionable advice
- Add contact information when relevant"
                rows={15}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Use markdown-style formatting like **bold** and bullet points for better readability
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setPreview(true)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
              >
                <Eye className="w-5 h-5 mr-2" />
                Preview
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)' }}
              >
                <Save className="w-5 h-5 mr-2" />
                Publish Post
              </button>
            </div>
          </form>
        ) : (
          /* Preview */
          <div className="scroll-animate">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="mx-2">•</span>
                <span>{author}</span>
              </div>

              <h2 className="text-3xl font-bold mb-6" style={{ color: '#040e40' }}>
                {title || 'Your Post Title'}
              </h2>

              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {content || 'Your post content will appear here...'}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setPreview(false)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
              >
                Edit Post
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)' }}
              >
                <Save className="w-5 h-5 mr-2" />
                Publish Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
