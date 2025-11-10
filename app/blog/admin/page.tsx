'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ArrowLeft, Save, Eye, Upload, X, Image as ImageIcon, Video, Lock, Sparkles, RefreshCw, Trash2, List } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBlogPost, fetchBlogPosts, deleteBlogPost } from '@/lib/github-blog-storage'
import dynamic from 'next/dynamic'
import { useAdminSession } from '../../../src/hooks/useAdminSession'

// Dynamically import ReactQuill to avoid SSR issues and build issues
const ReactQuill = dynamic(
  () => import('react-quill'),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded">Loading editor...</div>
  }
)

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  caption?: string
}

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  date: string
  likes: number
  dislikes: number
  comments: any[]
  media?: MediaItem[]
}

// Admin password - In production, this should be in environment variables
const ADMIN_PASSWORD = 'ITServices2025!'

// Rich text editor configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
}

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'font',
  'align',
  'link'
]

export default function BlogAdminPage() {
  // Admin session management - auto-logout after 5 minutes of inactivity
  const { showIdleWarning, getRemainingTime } = useAdminSession({
    idleTimeout: 5 * 60 * 1000, // 5 minutes
    warningTime: 30 * 1000 // 30 seconds warning
  });

  const router = useRouter()
  const { isLoading } = usePageLoader()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPasswordError, setShowPasswordError] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('IT Services Freetown')
  const [preview, setPreview] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [generatingContent, setGeneratingContent] = useState(false)
  const [contentPrompt, setContentPrompt] = useState('')
  const [showAIHelper, setShowAIHelper] = useState(false)
  const [publishProgress, setPublishProgress] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showManagePosts, setShowManagePosts] = useState(false)
  const [existingPosts, setExistingPosts] = useState<BlogPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich') // 'rich' for WYSIWYG, 'html' for HTML preview
  const [htmlContent, setHtmlContent] = useState('')

  useScrollAnimations()

  // Check if user is already authenticated
  useEffect(() => {
    const adminAuth = localStorage.getItem('blog_admin_auth')
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('blog_admin_auth', 'authenticated')
      toast.success('Welcome, Admin!')
      setShowPasswordError(false)
    } else {
      setShowPasswordError(true)
      toast.error('Incorrect password')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('blog_admin_auth')
    setIsAuthenticated(false)
    router.push('/blog')
    toast.success('Logged out successfully')
  }

  const loadPosts = async () => {
    setLoadingPosts(true)
    try {
      const posts = await fetchBlogPosts()
      setExistingPosts(posts)
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoadingPosts(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteBlogPost(parseInt(postId))
      
      if (result.success) {
        setExistingPosts(existingPosts.filter(post => post.id !== postId))
        toast.success('Post deleted successfully!')
      } else {
        toast.error(result.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const toggleManagePosts = async () => {
    if (!showManagePosts) {
      await loadPosts()
    }
    setShowManagePosts(!showManagePosts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsPublishing(true)
    setPublishProgress(0)

    try {
      // Simulate progress stages
      setPublishProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Try to create post in GitHub Issues first
      setPublishProgress(40)
      const result = await createBlogPost(
        title.trim(),
        content.trim(),
        author.trim(),
        media.length > 0 ? media : undefined
      )

      setPublishProgress(80)
      await new Promise(resolve => setTimeout(resolve, 300))

      if (result.success) {
        setPublishProgress(100)
        toast.success('✅ Blog post published to GitHub Issues!')
        
        // Reset form
        setTitle('')
        setContent('')
        setMedia([])
        setContentPrompt('')
        
        // Redirect to blog page after a short delay
        setTimeout(() => {
          setIsPublishing(false)
          setPublishProgress(0)
          router.push('/blog')
        }, 1000)
      } else {
        // Fallback to localStorage if GitHub fails
        setPublishProgress(0)
        setIsPublishing(false)
        toast.error(result.error || 'GitHub publish failed, saving locally...')
        saveToLocalStorage()
      }
    } catch (error) {
      console.error('Error publishing to GitHub:', error)
      setPublishProgress(0)
      setIsPublishing(false)
      toast.error('Failed to publish to GitHub, saving locally...')
      saveToLocalStorage()
    }
  }

  const saveToLocalStorage = () => {
    try {
      // Load existing posts
      const savedPosts = localStorage.getItem('blog_posts')
      const posts: BlogPost[] = savedPosts ? JSON.parse(savedPosts) : []

      // Create new post WITHOUT media to avoid quota issues
      // Media is stored in GitHub, not localStorage
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        dislikes: 0,
        comments: []
        // Note: media excluded to prevent localStorage quota errors
      }

      // Add to beginning of posts array (newest first)
      posts.unshift(newPost)

      // Save to localStorage (without media)
      localStorage.setItem('blog_posts', JSON.stringify(posts))

      toast.success('Blog post saved locally!')
      
      // Reset form
      setTitle('')
      setContent('')
      setMedia([])
      setContentPrompt('')
      
      // Redirect to blog page after a short delay
      setTimeout(() => {
        router.push('/blog')
      }, 1500)
    } catch (error) {
      console.error('localStorage error:', error)
      toast.error('Failed to save locally - localStorage is full. Please clear your browser data.')
    }
  }

  const generateAIContent = async () => {
    if (!contentPrompt.trim() && !title.trim()) {
      toast.error('Please provide a topic or title first')
      return
    }

    setGeneratingContent(true)

    try {
      // Use local API route (works for Vercel deployment)
      const GROQ_PROXY_URL = '/api/groq'

      const topic = contentPrompt.trim() || title.trim()
      
      const response = await fetch(GROQ_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a professional tech blog writer for IT Services Freetown, a computer and mobile repair service. Write engaging, informative blog posts that help customers understand tech issues and solutions. Include practical tips, clear explanations, and always mention contacting IT Services Freetown at +23233399391 or visiting #1 Regent Highway Jui Junction when professional help is needed. Keep the tone friendly but professional.`
            },
            {
              role: 'user',
              content: `Write a detailed blog post about: "${topic}". 

Requirements:
- Write 300-500 words
- Use clear paragraphs (no markdown formatting)
- Include practical tips or steps
- Make it engaging and easy to understand
- Add a call-to-action mentioning IT Services Freetown contact: +23233399391 and location: #1 Regent Highway Jui Junction
- Focus on helping customers solve problems or learn about tech

Write the content now:`
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      const generatedContent = data.choices[0]?.message?.content || ''

      if (generatedContent) {
        setContent(generatedContent)
        toast.success('AI content generated successfully!')
        setShowAIHelper(false)
        setContentPrompt('')
      } else {
        throw new Error('No content generated')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('Failed to generate content. Please try again.')
    } finally {
      setGeneratingContent(false)
    }
  }

  const handleMediaUpload = (type: 'image' | 'video') => {
    const url = prompt(`Enter ${type} URL:`)
    if (!url) return

    // Validate URL
    try {
      new URL(url)
    } catch {
      toast.error('Invalid URL')
      return
    }

    const newMediaItem: MediaItem = {
      id: Date.now().toString() + Math.random(),
      type,
      url: url,
      caption: ''
    }
    
    setMedia(prev => [...prev, newMediaItem])
    toast.success(`${type === 'image' ? 'Image' : 'Video'} added successfully!`)
  }

  const removeMedia = (mediaId: string) => {
    setMedia(prev => prev.filter(item => item.id !== mediaId))
    toast.success('Media removed')
  }

  const updateMediaCaption = (mediaId: string, caption: string) => {
    setMedia(prev => prev.map(item => 
      item.id === mediaId ? { ...item, caption } : item
    ))
  }

  const handleCancel = () => {
    if (title || content || media.length > 0) {
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

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 scroll-animate">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)' }}>
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#040e40' }}>
                Admin Access Required
              </h1>
              <p className="text-gray-600">
                Enter the admin password to create blog posts
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6" data-no-analytics="true">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setShowPasswordError(false)
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    showPasswordError ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
                {showPasswordError && (
                  <p className="text-red-500 text-sm mt-2">
                    ❌ Incorrect password. Please try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)' }}
              >
                Login as Admin
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/blog')}
                className="text-gray-600 hover:text-gray-900 text-sm flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </button>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-semibold mb-1">💡 Admin Password:</p>
              <p className="text-xs">Contact the site administrator for access</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Idle Warning Banner */}
        {showIdleWarning && (
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fas fa-exclamation-triangle text-xl"></i>
              <span className="font-semibold">
                Your session will expire in {getRemainingTime()} seconds due to inactivity. Move your mouse to stay logged in.
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 scroll-animate">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={toggleManagePosts}
                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <List className="w-4 h-4 mr-2" />
                {showManagePosts ? 'Hide' : 'Manage'} Posts
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Lock className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#040e40' }}>
            Create New Blog Post
          </h1>
          <p className="text-gray-600 mt-2">Share tech tips and updates with your audience</p>
        </div>

        {/* Manage Posts Section */}
        {showManagePosts && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 scroll-animate">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#040e40' }}>Existing Posts</h2>
            {loadingPosts ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : existingPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No posts found</p>
            ) : (
              <div className="space-y-4">
                {existingPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        By {post.author} • {post.date} • {post.likes} likes
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {!preview ? (
          <form onSubmit={handleSubmit} className="space-y-6 scroll-animate" data-no-analytics="true">
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
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Post Content
                </label>
                <div className="flex items-center gap-3">
                  {/* Editor Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (editorMode === 'html') {
                          setContent(htmlContent)
                        }
                        setEditorMode('rich')
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        editorMode === 'rich' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📝 Rich Text
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHtmlContent(content)
                        setEditorMode('html')
                      }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        editorMode === 'html' 
                          ? 'bg-white text-purple-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      👁️ HTML Preview
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowAIHelper(!showAIHelper)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: showAIHelper ? 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white'
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    {showAIHelper ? 'Hide AI Helper' : 'AI Writer'}
                  </button>
                </div>
              </div>

              {/* AI Content Generator */}
              {showAIHelper && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-start space-x-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">AI Content Generator</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Describe what you want to write about, and AI will create professional blog content for you.
                      </p>
                      <input
                        type="text"
                        value={contentPrompt}
                        onChange={(e) => setContentPrompt(e.target.value)}
                        placeholder="E.g., 'Tips for preventing malware on phones' or 'How to backup iPhone data'"
                        className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                        disabled={generatingContent}
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={generateAIContent}
                          disabled={generatingContent}
                          className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                        >
                          {generatingContent ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Content
                            </>
                          )}
                        </button>
                        {content && (
                          <button
                            type="button"
                            onClick={() => setContent('')}
                            className="px-4 py-2 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rich Text Editor (Default Mode) */}
              {editorMode === 'rich' && (
                <>
                  <div className="quill-wrapper">
                    <ReactQuill 
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Write your blog post content here...

Tips:
- Use the toolbar above for formatting
- Keep paragraphs short and readable
- Include actionable advice
- Add contact information when relevant"
                      style={{ height: '400px', marginBottom: '50px' }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Tip: Use the AI Writer to generate professional content instantly, or write manually with rich text formatting
                  </p>
                </>
              )}

              {/* HTML Preview Mode (Split Screen) */}
              {editorMode === 'html' && (
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Preview Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b-2 border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 ml-2">HTML Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(htmlContent)
                          toast.success('HTML copied to clipboard!')
                        }}
                        className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        📋 Copy HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const preview = document.getElementById('html-preview-content')
                          if (preview) {
                            navigator.clipboard.writeText(preview.innerText)
                            toast.success('Plain text copied to clipboard!')
                          }
                        }}
                        className="px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      >
                        📋 Copy Text
                      </button>
                    </div>
                  </div>

                  {/* Split View Container */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                    {/* HTML Source Pane */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <span>📄</span> HTML Source
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setContent(htmlContent)
                            toast.success('Applied HTML changes!')
                          }}
                          className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          ✓ Apply Changes
                        </button>
                      </div>
                      <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        className="w-full h-[500px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white"
                        placeholder="Paste your HTML content here..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Edit HTML directly and click "Apply Changes" to update
                      </p>
                    </div>

                    {/* Live Preview Pane */}
                    <div className="p-4 bg-white">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span>👁️</span> Live Preview
                      </h3>
                      <div 
                        id="html-preview-content"
                        className="prose prose-sm max-w-none h-[500px] overflow-y-auto p-4 border border-gray-200 rounded-lg"
                        dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-400 italic">Preview will appear here...</p>' }}
                        style={{
                          fontSize: '16px',
                          lineHeight: '1.8'
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        👁️ This is how your content will look when published
                      </p>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 px-4 py-3 border-t-2 border-blue-200">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">💡</span>
                      <div className="text-sm text-blue-900">
                        <strong>HTML Tips:</strong> Use <code className="bg-blue-100 px-1 rounded">&lt;h2&gt;</code> for headers, 
                        <code className="bg-blue-100 px-1 rounded mx-1">&lt;p&gt;</code> for paragraphs, 
                        <code className="bg-blue-100 px-1 rounded mx-1">&lt;strong&gt;</code> for bold, 
                        <code className="bg-blue-100 px-1 rounded mx-1">&lt;ul&gt;</code> for lists
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Media Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Photos & Videos (Optional)
              </label>
              
              {/* Add Media Buttons */}
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleMediaUpload('image')}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-all duration-300"
                  disabled={uploadingMedia}
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Add Image URL
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMediaUpload('video')}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-all duration-300"
                  disabled={uploadingMedia}
                >
                  <Video className="w-5 h-5 mr-2" />
                  Add Video URL
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mb-4">💡 Tip: Upload images to <a href="https://imgur.com/upload" target="_blank" className="text-blue-600 hover:underline">Imgur</a> or <a href="https://postimages.org/" target="_blank" className="text-blue-600 hover:underline">PostImages</a>, then paste the URL here.</p>

              {/* Media Preview */}
              {media.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 font-semibold">Added Media ({media.length})</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {media.map((item) => (
                      <div key={item.id} className="relative bg-gray-50 rounded-lg overflow-hidden">
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt="Preview" 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <video 
                            src={item.url} 
                            controls 
                            className="w-full h-48 object-cover"
                          />
                        )}
                        
                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeMedia(item.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Caption Input */}
                        <div className="p-3">
                          <input
                            type="text"
                            placeholder="Add a caption (optional)"
                            value={item.caption || ''}
                            onChange={(e) => updateMediaCaption(item.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadingMedia && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                </div>
              )}
            </div>

            {/* Publishing Progress Bar */}
            {isPublishing && (
              <div className="mb-6 scroll-animate">
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="h-full transition-all duration-500 ease-out rounded-full"
                    style={{ 
                      width: `${publishProgress}%`,
                      background: 'linear-gradient(90deg, #ef4444 0%, #040e40 100%)'
                    }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">
                  {publishProgress < 40 ? 'Preparing post...' : 
                   publishProgress < 80 ? 'Publishing to GitHub...' : 
                   publishProgress < 100 ? 'Finalizing...' : 
                   'Published successfully!'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPreview(true)}
                disabled={isPublishing}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-5 h-5 mr-2" />
                Preview
              </button>
              <button
                type="submit"
                disabled={isPublishing}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)' }}
              >
                <Save className="w-5 h-5 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish Post'}
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

              <div 
                className="prose max-w-none text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400">Your post content will appear here...</p>' }}
              />

              {/* Media Preview in Post */}
              {media.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {media.map((item) => (
                      <div key={item.id} className="rounded-lg overflow-hidden">
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={item.caption || 'Post image'} 
                            className="w-full h-auto object-cover rounded-lg"
                          />
                        ) : (
                          <video 
                            src={item.url} 
                            controls 
                            className="w-full h-auto rounded-lg"
                          />
                        )}
                        {item.caption && (
                          <p className="text-sm text-gray-600 mt-2 italic">{item.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      <style jsx global>{`
        .quill-wrapper .ql-container {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border: 2px solid #e5e7eb;
          font-size: 16px;
        }
        
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border: 2px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .quill-wrapper .ql-editor {
          min-height: 400px;
          font-family: inherit;
        }
        
        .quill-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        .quill-wrapper .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        
        .quill-wrapper .ql-toolbar .ql-fill {
          fill: #374151;
        }
        
        .quill-wrapper .ql-toolbar button:hover,
        .quill-wrapper .ql-toolbar button:focus,
        .quill-wrapper .ql-toolbar button.ql-active {
          color: #3b82f6;
        }
        
        .quill-wrapper .ql-toolbar button:hover .ql-stroke,
        .quill-wrapper .ql-toolbar button:focus .ql-stroke,
        .quill-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }
        
        .quill-wrapper .ql-toolbar button:hover .ql-fill,
        .quill-wrapper .ql-toolbar button:focus .ql-fill,
        .quill-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }

        /* HTML Preview Styling */
        #html-preview-content h1 {
          color: #1a202c;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        #html-preview-content h2 {
          color: #2d3748;
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #667eea;
        }

        #html-preview-content h3 {
          color: #2d3748;
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        #html-preview-content p {
          margin-bottom: 1rem;
          line-height: 1.8;
          color: #4a5568;
        }

        #html-preview-content strong {
          color: #1a202c;
          font-weight: 600;
        }

        #html-preview-content ul,
        #html-preview-content ol {
          margin: 1rem 0 1rem 1.5rem;
          line-height: 1.8;
        }

        #html-preview-content li {
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        #html-preview-content a {
          color: #667eea;
          text-decoration: underline;
        }

        #html-preview-content a:hover {
          color: #764ba2;
        }

        #html-preview-content code {
          background: #f7fafc;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
          color: #d73a49;
        }

        #html-preview-content blockquote {
          border-left: 4px solid #667eea;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #718096;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
