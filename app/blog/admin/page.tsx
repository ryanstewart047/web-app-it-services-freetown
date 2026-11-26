'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ArrowLeft, Save, Eye, Upload, X, Image as ImageIcon, Video, Lock, Sparkles, RefreshCw, Trash2, List, Edit, Search, ExternalLink, Globe, Newspaper, Zap, Filter, ChevronRight, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createBlogPost, fetchBlogPosts, deleteBlogPost, updateBlogPost } from '@/lib/github-blog-storage'
import dynamic from 'next/dynamic'
import { useAdminSession } from '../../../src/hooks/useAdminSession'
import { getVideoEmbed } from '../blog-utils'

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

// Rich text editor configuration
const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    handlers: {
      image: function() {
        const url = prompt('Enter image URL (e.g. from Imgur or PostImages):');
        if (url) {
          // @ts-ignore
          const quill = this.quill;
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
        }
      },
      video: function() {
        const url = prompt('Enter video URL (e.g. YouTube embed URL):');
        if (url) {
          // @ts-ignore
          const quill = this.quill;
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'video', url);
        }
      }
    }
  }
}

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'font',
  'align',
  'link',
  'image',
  'video'
]

const AdminLoginForm = ({ 
  isLoading, 
  handleLogin, 
  password, 
  setPassword, 
  showPasswordError, 
  setShowPasswordError, 
  router,
  authStep,
  setAuthStep,
  handle2FASubmit,
  twoFACode,
  setTwoFACode,
  twoFAMode,
  twoFAMethod,
  setTwoFAMethod,
  twoFARecipient,
  twoFAError,
  twoFASubmitting
}: any) => {
  return (
    <>
      <LoadingOverlay show={isLoading} />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 scroll-animate">
            {authStep === '2fa' ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-amber-100 text-amber-600">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2 text-gray-900">
                    Two-Factor Authentication
                  </h1>
                  <p className="text-sm text-gray-600">
                    {twoFAMethod === 'email'
                      ? <>Code sent to <span className="font-semibold text-gray-800">{twoFARecipient}</span></>
                      : <>Enter the 6-digit code from your <span className="font-semibold text-gray-800">Authenticator App</span></>
                    }
                  </p>
                </div>

                {twoFAMode === 'both' && (
                  <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6 text-sm">
                    <button
                      type="button"
                      onClick={() => setTwoFAMethod('email')}
                      className={`flex-1 py-2 font-medium transition-colors ${twoFAMethod === 'email' ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      Email Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setTwoFAMethod('totp')}
                      className={`flex-1 py-2 font-medium transition-colors ${twoFAMethod === 'totp' ? 'bg-amber-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    >
                      Auth App
                    </button>
                  </div>
                )}

                <form onSubmit={handle2FASubmit} className="space-y-6" data-no-analytics="true">
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                      maxLength={6}
                      autoFocus
                      disabled={twoFASubmitting}
                    />
                    {twoFAError && (
                      <p className="mt-2 text-sm text-red-600">
                        {twoFAError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={twoFASubmitting || twoFACode.length < 6}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {twoFASubmitting ? 'Verifying...' : 'Verify 2FA Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthStep('password')}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 text-center block"
                  >
                    ← Back to Password
                  </button>
                </form>
              </>
            ) : (
              <>
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
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setShowPasswordError(false)
                      }}
                      className={`w-full px-4 py-3 rounded-xl border ${showPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#ef4444] focus:ring-[#ef4444]'} focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="Enter password..."
                      data-lpignore="true"
                      data-form-type="other"
                    />
                    {showPasswordError && (
                      <p className="mt-2 text-sm text-red-600 animate-pulse">
                        Incorrect password. Please try again.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!password}
                  >
                    Access Admin Dashboard
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

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
  // 2FA state for blog/admin
  const [authStep, setAuthStep] = useState<'password' | '2fa'>('password')
  const [pendingToken, setPendingToken] = useState('')
  const [twoFACode, setTwoFACode] = useState('')
  const [twoFAMode, setTwoFAMode] = useState<'email' | 'totp' | 'both'>('email')
  const [twoFAMethod, setTwoFAMethod] = useState<'email' | 'totp'>('email')
  const [twoFARecipient, setTwoFARecipient] = useState('')
  const [twoFAError, setTwoFAError] = useState('')
  const [twoFASubmitting, setTwoFASubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('BridgeTech IT Services')
  const [preview, setPreview] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [generatingContent, setGeneratingContent] = useState(false)
  const [contentPrompt, setContentPrompt] = useState('')
  const [showAIHelper, setShowAIHelper] = useState(false)
  const [deepInvestigate, setDeepInvestigate] = useState(true)
  const [aiProgressMessage, setAiProgressMessage] = useState('')
  const [publishProgress, setPublishProgress] = useState(0)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showManagePosts, setShowManagePosts] = useState(false)
  const [existingPosts, setExistingPosts] = useState<BlogPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [editorMode, setEditorMode] = useState<'rich' | 'html'>('rich') // 'rich' for WYSIWYG, 'html' for HTML preview
  const [htmlContent, setHtmlContent] = useState('')
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null)
  const [automatedDrafts, setAutomatedDrafts] = useState<any[]>([])
  const [loadingAutomatedDrafts, setLoadingAutomatedDrafts] = useState(false)
  const [runningAutomation, setRunningAutomation] = useState(false)
  const autoSavePromptedRef = React.useRef(false)

  // Sierra Leone Tech News Finder state
  const [slNewsTopics, setSlNewsTopics] = useState<any[]>([])
  const [loadingSlNews, setLoadingSlNews] = useState(false)
  const [slNewsCategory, setSlNewsCategory] = useState('All Categories')
  const [slNewsSearch, setSlNewsSearch] = useState('')
  const [showSLNewsFinder, setShowSLNewsFinder] = useState(false)
  const [slNewsLoaded, setSlNewsLoaded] = useState(false)

  useScrollAnimations()

  // Check if user is already authenticated via secure HTTP-only cookie session
  useEffect(() => {
    // SECURITY: Do NOT use localStorage to check auth — it can be trivially bypassed via DevTools.
    // Always verify against the server-side HTTP-only cookie session.
    const verifySession = async () => {
      try {
        const response = await fetch('/api/admin/auth')
        if (response.ok) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Session verification failed:', error)
      }
    }
    verifySession()

    // Load auto-save on mount
    const autoSaved = localStorage.getItem('blog_auto_save')
    if (autoSaved && !autoSavePromptedRef.current) {
      try {
        const draft = JSON.parse(autoSaved)
        const draftTime = new Date(draft.timestamp).getTime()
        const now = new Date().getTime()
        // If the auto-save is from the last 24 hours
        if (now - draftTime < 24 * 60 * 60 * 1000) {
          autoSavePromptedRef.current = true;
          if (confirm('You have an auto-saved draft from a previous session. Would you like to restore it?')) {
            setTitle(draft.title || '')
            setContent(draft.content || '')
            setHtmlContent(draft.htmlContent || '')
            setAuthor(draft.author || 'BridgeTech IT Services')
            setMedia(draft.media || [])
            if (draft.editingPostId) {
              setEditingPostId(draft.editingPostId)
            }
            toast.success('Draft restored!')
          } else {
             localStorage.removeItem('blog_auto_save')
          }
        }
      } catch (e) {
        console.error('Error parsing auto-save', e)
      }
    }
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (!title && !content && !htmlContent && media.length === 0) return;

    const timer = setTimeout(() => {
      const draft = {
        title,
        content,
        htmlContent,
        author,
        media,
        timestamp: new Date().toISOString(),
        isAutoSave: true,
        editingPostId
      }
      localStorage.setItem('blog_auto_save', JSON.stringify(draft))
      setLastAutoSaved(new Date());
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, content, htmlContent, author, media, editingPostId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowPasswordError(false)
        if (data.requires2FA) {
          // 2FA required — do NOT grant access yet
          setPendingToken(data.pendingToken || '')
          setTwoFAMode(data.mode || 'email')
          setTwoFAMethod(data.mode === 'totp' ? 'totp' : 'email')
          setTwoFARecipient(data.recipientEmail || '')
          setTwoFAError('')
          setTwoFACode('')
          setAuthStep('2fa')
        } else {
          // 2FA disabled — grant access
          setIsAuthenticated(true)
          toast.success('Welcome, Admin!')
        }
        setPassword('')
      } else {
        setShowPasswordError(true)
        if (response.status === 429) {
          toast.error(data.error || 'Too many login attempts. Please try again later.')
        } else {
          toast.error('Incorrect password')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
      setShowPasswordError(true)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTwoFASubmitting(true)
    setTwoFAError('')
    try {
      const response = await fetch('/api/admin/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken, method: twoFAMethod, code: twoFACode.trim() }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setIsAuthenticated(true)
        setAuthStep('password')
        toast.success('Welcome, Admin!')
      } else {
        setTwoFAError(data.error || 'Invalid code. Please try again.')
        setTwoFACode('')
      }
    } catch {
      setTwoFAError('Verification failed. Please try again.')
    } finally {
      setTwoFASubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      // SECURITY: Clear the server-side HTTP-only session cookie on logout.
      await fetch('/api/admin/auth', { method: 'DELETE' })
    } catch (error) {
      console.error('Logout error:', error)
    }
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

  const handleEditPost = (post: BlogPost) => {
    setEditingPostId(post.id)
    setTitle(post.title)
    setContent(post.content)
    setAuthor(post.author)
    setMedia(post.media || [])
    setShowManagePosts(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.success('Post loaded for editing')
  }

  const handleCancelEdit = () => {
    if (confirm('Discard changes and clear the form?')) {
      setEditingPostId(null)
      setTitle('')
      setContent('')
      setAuthor('BridgeTech IT Services')
      setMedia([])
      toast('Edit cancelled')
    }
  }

  const loadAutomatedDrafts = async () => {
    setLoadingAutomatedDrafts(true)
    try {
      const res = await fetch('/api/admin/blog/drafts')
      if (res.ok) {
        const data = await res.json()
        setAutomatedDrafts(data.drafts || [])
      }
    } catch (err) {
      console.error('Failed fetching automated drafts', err)
    } finally {
      setLoadingAutomatedDrafts(false)
    }
  }

  const handleDeleteAutomatedDraft = async (id: string) => {
    if (!confirm('Are you sure you want to discard this auto-generated draft?')) return
    try {
      const res = await fetch(`/api/admin/blog/drafts?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setAutomatedDrafts((prev) => prev.filter((d) => d.id !== id))
        toast.success('Draft removed')
      } else {
        toast.error('Failed to delete draft')
      }
    } catch (err) {
      toast.error('Network error deleting draft')
    }
  }

  const handleLoadAutomatedDraft = (draft: any) => {
    setTitle(draft.h1Title || draft.title || '')
    setContent(draft.content || '')
    setHtmlContent(draft.content || '')
    setAuthor('BridgeTech IT Services')
    setEditorMode('html')
    setShowManagePosts(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.success('🤖 AI Draft loaded into HTML editor! Review and publish.')
    if (draft.editorNotes) {
      toast(`💡 Editor Tip: ${draft.editorNotes.slice(0, 120)}...`, { duration: 6000 })
    }
  }

  const handleTriggerAutomationNow = async () => {
    setRunningAutomation(true)
    const toastId = toast.loading('Running automated news background worker...')
    try {
      const res = await fetch('/api/cron/auto-draft-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxArticles: 2 }),
      })
      const data = await res.json()
      if (data.success && data.draftsCreated > 0) {
        toast.success(`Success! Created ${data.draftsCreated} new draft(s).`, { id: toastId })
        loadAutomatedDrafts()
      } else {
        const errorMsg =
          data.error ||
          (data.errors && data.errors.length > 0
            ? data.errors[0]
            : 'All feeds are up to date (no unread stories).');
        toast.error(`Automation notice: ${errorMsg}`, { id: toastId, duration: 6000 })
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId })
    } finally {
      setRunningAutomation(false)
    }
  }

  const toggleManagePosts = async () => {
    if (!showManagePosts) {
      await Promise.all([loadPosts(), loadAutomatedDrafts()])
    }
    setShowManagePosts(!showManagePosts)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalContent = (editorMode === 'html' && htmlContent.trim()) ? htmlContent.trim() : content.trim()

    if (!title.trim() || !finalContent) {
      toast.error('Please fill in all fields')
      return
    }

    setIsPublishing(true)
    setPublishProgress(0)

    try {
      // Simulate progress stages
      setPublishProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))

      setPublishProgress(40)
      
      let result
      if (editingPostId) {
        // Update existing post
        result = await updateBlogPost(
          parseInt(editingPostId),
          title.trim(),
          finalContent,
          author.trim(),
          media.length > 0 ? media : undefined
        )
      } else {
        // Create new post
        result = await createBlogPost(
          title.trim(),
          finalContent,
          author.trim(),
          media.length > 0 ? media : undefined
        )
      }

      setPublishProgress(80)
      await new Promise(resolve => setTimeout(resolve, 300))

      if (result.success) {
        setPublishProgress(100)
        toast.success(editingPostId ? '✅ Blog post updated successfully!' : '✅ Blog post published to GitHub Issues!')
        localStorage.removeItem('blog_auto_save');
        setLastAutoSaved(null);
        
        setTimeout(() => {
          setIsPublishing(false)
          setPublishProgress(0)
          
          if (!editingPostId) {
            // Only reset form and redirect for new posts
            setTitle('')
            setContent('')
            setMedia([])
            setContentPrompt('')
            router.push('/blog')
          }
          // For updates, we remain on the admin page with the form intact
        }, 1000)
      } else {
        // Fallback to localStorage if GitHub fails
        setPublishProgress(0)
        setIsPublishing(false)
        toast.error(result.error || 'GitHub operation failed, saving locally...')
        if (!editingPostId) {
          saveToLocalStorage()
        }
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

      localStorage.removeItem('blog_auto_save');
      setLastAutoSaved(null);

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

  const loadSierraLeoneTechNews = async (customQuery?: string, cat?: string, forceRefresh = false) => {
    setLoadingSlNews(true)
    try {
      const params = new URLSearchParams()
      const q = typeof customQuery === 'string' ? customQuery : slNewsSearch
      const c = cat !== undefined ? cat : slNewsCategory

      if (q && q.trim()) params.append('q', q.trim())
      if (c && c !== 'All Categories') params.append('category', c)
      if (forceRefresh) params.append('refresh', 'true')

      const res = await fetch(`/api/admin/blog/sl-tech-news?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.topics)) {
          setSlNewsTopics(data.topics)
          setSlNewsLoaded(true)
        }
      } else {
        toast.error('Failed to fetch Sierra Leone tech news')
      }
    } catch (err: any) {
      console.warn('[SL Tech News] Fetch failed:', err)
      toast.error('Failed to connect to tech news finder')
    } finally {
      setLoadingSlNews(false)
    }
  }

  const handleWriteStoryFromTopic = async (topicItem: any) => {
    setShowAIHelper(true)
    setContentPrompt(topicItem.writingPrompt)
    const newTitle = topicItem.suggestedBlogTitle || topicItem.title
    setTitle(newTitle)
    setDeepInvestigate(true)

    // Smooth scroll to top of editor area
    window.scrollTo({ top: 320, behavior: 'smooth' })
    toast(`🇸🇱 Investigating: "${topicItem.title.slice(0, 42)}..."`, { duration: 4000 })

    await generateAIContent(topicItem.writingPrompt, newTitle)
  }

  const handleLoadTopicToPrompt = (topicItem: any) => {
    setShowAIHelper(true)
    setContentPrompt(topicItem.writingPrompt)
    if (!title.trim() || title.trim().length < 15) {
      setTitle(topicItem.suggestedBlogTitle || topicItem.title)
    }
    setDeepInvestigate(true)
    window.scrollTo({ top: 350, behavior: 'smooth' })
    toast.success('Topic loaded into AI Writer! Customize prompt or click Generate Complete Story.')
  }

  const generateAIContent = async (overridePrompt?: string | any, overrideTitle?: string) => {
    const promptStr = typeof overridePrompt === 'string' ? overridePrompt : ''
    const rawPrompt = (promptStr || contentPrompt || title).trim()
    if (!rawPrompt) {
      toast.error('Please provide a topic or title first')
      return
    }

    setGeneratingContent(true)
    const topic = rawPrompt

    if (overrideTitle && typeof overrideTitle === 'string' && (!title.trim() || title.trim().length < 15)) {
      setTitle(overrideTitle)
    }

    try {
      setAiProgressMessage('🔍 Capturing realistic source photos & investigating facts...')
      try {
        const response = await fetch('/api/admin/blog/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            includeImages: true,
            includeSources: true,
          }),
        })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.content) {
              setContent(data.content)
              setHtmlContent(data.content)

              // Auto-populate Title if empty or short
              if (!title.trim() || title.trim().length < 15) {
                if (data.title) {
                  setTitle(data.title)
                }
              }

              // Auto-populate Media gallery with real discovered photos
              if (Array.isArray(data.media) && data.media.length > 0) {
                setMedia((prev) => {
                  const existingUrls = new Set(prev.map((m) => m.url))
                  const newItems = data.media.filter((m: any) => !existingUrls.has(m.url))
                  return [...prev, ...newItems]
                })
              }

              toast.success(
                `✨ Complete story generated! Attached ${data.media?.length || 0} real image(s) & ${data.sources?.length || 0} verified source(s).`,
                { duration: 6000 }
              )
              setShowAIHelper(false)
              setContentPrompt('')
              return
            }
          }
        } catch (investigateErr) {
          console.warn('[AI Generator] Deep investigation endpoint error, using proxy fallback:', investigateErr)
        }
      }

      // Fallback: Direct proxy generation with 4096 tokens (never cut off)
      setAiProgressMessage('✍️ Writing complete journalistic story...')
      const GROQ_PROXY_URL = '/api/groq'

      const response = await fetch(GROQ_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert, professional investigative tech journalist and technical columnist for BridgeTech IT Services (itservicesfreetown.com), located at No. 1 Regent Highway, Jui Junction, Freetown (Phone: +232 33 399 391).
Write highly engaging, deeply researched, and complete blog posts.
CRITICAL INSTRUCTION: You MUST write the ENTIRE story from introduction to conclusion. NEVER truncate or leave a section unfinished.
Format with clean, modern HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <u>, <blockquote>. Do NOT use markdown.
Ensure there is a compelling TL;DR summary box, structured sections, local industry perspective from BridgeTech IT Services, and a strong conclusion with a call-to-action.`
            },
            {
              role: 'user',
              content: `Write a complete, detailed, beautifully formatted HTML blog feature about: "${topic}". 

Requirements:
- Comprehensive coverage: Write 800-1200 words of rich content.
- MUST output ONLY valid HTML code (do NOT wrap it in backticks or markdown code blocks).
- NEVER cut off or stop midway: complete every single section thoroughly from introduction to final conclusion.
- Include an introduction with context, detailed core points with descriptive <h2> headers, key statistics highlighted in <strong>, underlined key terms with <u>, and a full conclusion.
- Add local perspective from BridgeTech IT Services (#1 Regent Highway, Jui Junction, Freetown | +232 33 399 391).
- Include a "Sources & References" section at the end.

Write the complete HTML article now:`
            }
          ],
          temperature: 0.7,
          max_tokens: 4096 // Upgraded from 800 to 4096 to prevent truncation
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      let generatedContent = data.choices[0]?.message?.content || ''

      if (generatedContent) {
        if (generatedContent.startsWith('```')) {
          generatedContent = generatedContent.replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/i, '')
        }
        setContent(generatedContent)
        setHtmlContent(generatedContent)

        // If title is empty, deduce title from first heading
        if (!title.trim()) {
          const hMatch = generatedContent.match(/<h[12][^>]*>(.*?)<\/h[12]>/i)
          if (hMatch) {
            setTitle(hMatch[1].replace(/<[^>]+>/g, '').trim())
          }
        }

        toast.success('AI content generated successfully!')
        setShowAIHelper(false)
        setContentPrompt('')
      } else {
        throw new Error('No content generated')
      }
    } catch (error: any) {
      console.error('Error generating content:', error)
      toast.error(error.message || 'Failed to generate content. Please try again.')
    } finally {
      setGeneratingContent(false)
      setAiProgressMessage('')
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingMedia(true)
    const toastId = toast.loading(`Processing ${type} file...`)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (ev) => resolve(ev.target?.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const newMediaItem: MediaItem = {
          id: Date.now().toString() + Math.random(),
          type,
          url: dataUrl,
          caption: file.name
        }
        setMedia(prev => [...prev, newMediaItem])
      }
      toast.success(`${type === 'image' ? 'Image' : 'Video'} added successfully!`, { id: toastId })
    } catch (err) {
      console.error('File upload failed:', err)
      toast.error(`Failed to process ${type} file`, { id: toastId })
    } finally {
      setUploadingMedia(false)
      e.target.value = ''
    }
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

  // Save HTML draft to localStorage and GitHub (accessible across devices)
  const saveDraft = async () => {
    if (!title && !content && !htmlContent) {
      toast.error('Nothing to save! Add some content first.')
      return
    }

    const draft = {
      title,
      content,
      htmlContent,
      author,
      media,
      timestamp: new Date().toISOString()
    }
    
    // Save to localStorage as backup
    localStorage.setItem('blog_draft', JSON.stringify(draft))
    
    // Save to GitHub Issues for cross-device access
    try {
      const draftTitle = `[DRAFT] ${title || 'Untitled Draft ' + new Date().toLocaleTimeString()}`
      const draftContent = `<!-- DRAFT DATA START
${JSON.stringify(draft, null, 2)}
DRAFT DATA END -->

${htmlContent || content || 'Empty draft'}`
      
      const result = await createBlogPost(draftTitle, draftContent, author, media.length > 0 ? media : undefined)
      
      if (result.success) {
        // Store the draft issue ID
        localStorage.setItem('blog_draft_issue_id', result.issueNumber?.toString() || '')
        toast.success('✅ Draft saved and synced to cloud! Access from any device.')
      } else {
        toast.error('Draft saved locally only. Check your internet connection.')
      }
    } catch (error) {
      console.error('Error syncing draft:', error)
      toast.error('Draft saved to this device only (no internet connection)')
    }
  }

  // Load draft from GitHub or localStorage
  const loadDraft = async () => {
    setLoadingPosts(true)
    
    try {
      // First, try to load from GitHub
      const posts = await fetchBlogPosts()
      const draftPosts = posts.filter(p => p.title.startsWith('[DRAFT]'))
      
      if (draftPosts.length > 0) {
        // Get the most recent draft
        const latestDraft = draftPosts[0]
        
        // Try to extract the JSON data from the content
        const jsonMatch = latestDraft.content.match(/<!-- DRAFT DATA START\n([\s\S]*?)\nDRAFT DATA END -->/)
        
        if (jsonMatch) {
          const draftData = JSON.parse(jsonMatch[1])
          setTitle(draftData.title?.replace('[DRAFT] ', '') || '')
          setContent(draftData.content || '')
          setHtmlContent(draftData.htmlContent || '')
          setAuthor(draftData.author || 'BridgeTech IT Services')
          setMedia(draftData.media || [])
          toast.success(`📂 Draft loaded from cloud (${new Date(draftData.timestamp).toLocaleString()})`)
          setLoadingPosts(false)
          return
        } else {
          // Fallback: use the post content directly
          setTitle(latestDraft.title.replace('[DRAFT] ', ''))
          setContent(latestDraft.content.replace(/<!-- DRAFT DATA START[\s\S]*?DRAFT DATA END -->/, '').trim())
          setHtmlContent(latestDraft.content.replace(/<!-- DRAFT DATA START[\s\S]*?DRAFT DATA END -->/, '').trim())
          setAuthor(latestDraft.author)
          setMedia(latestDraft.media || [])
          toast.success(`📂 Draft loaded from cloud`)
          setLoadingPosts(false)
          return
        }
      }
    } catch (error) {
      console.error('Error loading from GitHub:', error)
    }
    
    // Fallback to localStorage
    const savedDraft = localStorage.getItem('blog_draft')
    if (savedDraft) {
      const draft = JSON.parse(savedDraft)
      setTitle(draft.title?.replace('[DRAFT] ', '') || '')
      setContent(draft.content || '')
      setHtmlContent(draft.htmlContent || '')
      setAuthor(draft.author || 'BridgeTech IT Services')
      setMedia(draft.media || [])
      toast.success(`📂 Draft loaded from this device (${new Date(draft.timestamp).toLocaleString()})`)
    } else {
      toast.error('No saved draft found on this device or cloud')
    }
    
    setLoadingPosts(false)
  }

  // Download content as Word document
  const downloadAsWord = () => {
    const htmlToDownload = htmlContent || content
    
    // Create a complete HTML document for Word
    const wordDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || 'Blog Post'}</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; margin: 2cm; }
    h1 { color: #040e40; font-size: 24pt; margin-bottom: 10pt; }
    h2 { color: #040e40; font-size: 18pt; margin-top: 15pt; margin-bottom: 8pt; }
    p { margin-bottom: 10pt; text-align: justify; }
    strong { font-weight: bold; }
    em { font-style: italic; }
  </style>
</head>
<body>
  <h1>${title || 'Untitled Blog Post'}</h1>
  <p><em>By ${author} • ${new Date().toLocaleDateString()}</em></p>
  <hr>
  ${htmlToDownload}
</body>
</html>
    `
    
    const blob = new Blob([wordDoc], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(title || 'blog-post').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Downloaded as Word document!')
  }

  // Download content as PDF (using print-to-PDF approach)
  const downloadAsPDF = () => {
    const htmlToDownload = htmlContent || content
    
    // Create a new window with the content
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Please allow pop-ups to download PDF')
      return
    }
    
    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title || 'Blog Post'}</title>
  <style>
    @media print {
      @page { margin: 2cm; }
    }
    body { 
      font-family: 'Georgia', 'Times New Roman', serif; 
      line-height: 1.8; 
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { 
      color: #040e40; 
      font-size: 32px; 
      margin-bottom: 10px;
      border-bottom: 3px solid #ef4444;
      padding-bottom: 10px;
    }
    h2 { color: #040e40; font-size: 24px; margin-top: 25px; margin-bottom: 10px; }
    p { margin-bottom: 15px; text-align: justify; }
    img { max-width: 100%; height: auto; margin: 15px 0; }
    .metadata { color: #666; font-style: italic; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>${title || 'Untitled Blog Post'}</h1>
  <div class="metadata">By ${author} • ${new Date().toLocaleDateString()}</div>
  ${htmlToDownload}
  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => window.close(), 500);
    }
  </script>
</body>
</html>
    `)
    printWindow.document.close()
    toast.success('Opening print dialog for PDF download...')
  }

  const handleCancel = () => {
    if (title || content || media.length > 0) {
      if (confirm('Are you sure you want to discard this post?')) {
        router.push('/blog')
      }
    } else {
      router.push('/blog')
    }
  };

  if (!isAuthenticated) {
    return <AdminLoginForm
      isLoading={isLoading}
      handleLogin={handleLogin}
      password={password}
      setPassword={setPassword}
      showPasswordError={showPasswordError}
      setShowPasswordError={setShowPasswordError}
      router={router}
      authStep={authStep}
      setAuthStep={setAuthStep}
      handle2FASubmit={handle2FASubmit}
      twoFACode={twoFACode}
      setTwoFACode={setTwoFACode}
      twoFAMode={twoFAMode}
      twoFAMethod={twoFAMethod}
      setTwoFAMethod={setTwoFAMethod}
      twoFARecipient={twoFARecipient}
      twoFAError={twoFAError}
      twoFASubmitting={twoFASubmitting}
    />
  }

  return (
    <>
      <LoadingOverlay show={isLoading} />
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
            <div className="flex gap-3 items-center">
              {lastAutoSaved && (
                <span className="text-xs text-gray-400 mr-2 hidden sm:inline">
                  Auto-saved {lastAutoSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button
                type="button"
                onClick={toggleManagePosts}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
            {editingPostId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600 mt-2">
            {editingPostId ? 'Update your published post' : 'Share tech tips and updates with your audience'}
          </p>
          {editingPostId && (
            <button
              onClick={handleCancelEdit}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel & Create New Post
            </button>
          )}
        </div>

        {/* Manage Posts Section */}
        {showManagePosts && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 scroll-animate">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold" style={{ color: '#040e40' }}>Manage Posts & Automated Drafts</h2>
              <button
                type="button"
                onClick={handleTriggerAutomationNow}
                disabled={runningAutomation}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50 text-xs sm:text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {runningAutomation ? 'Scanning Feeds & Writing...' : '⚡ Run News Worker Now'}
              </button>
            </div>

            {/* AI Automated Tech News Drafts Section */}
            <div className="mb-8 p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-md border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <h3 className="text-lg font-bold text-sky-400">
                    Automated Tech News Drafts ({automatedDrafts.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={loadAutomatedDrafts}
                  disabled={loadingAutomatedDrafts}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAutomatedDrafts ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4">
                Articles automatically harvested from tech news RSS feeds, scraped, and written by AI with strict anti-cliché journalism rules. All items stay in <strong>Draft</strong> until you review and publish them.
              </p>

              {loadingAutomatedDrafts ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                  Loading automated drafts...
                </div>
              ) : automatedDrafts.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                  <p className="text-slate-400 text-sm">No pending automated drafts.</p>
                  <p className="text-slate-500 text-xs mt-1">
                    The background worker runs every 24h via Vercel Cron. You can also click <strong>&quot;Run News Worker Now&quot;</strong> above to scan feeds immediately.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {automatedDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-sky-500/50 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              {draft.sourceFeed || 'Tech Feed'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              🔒 Draft (Unpublished)
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(draft.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-base">
                            {draft.h1Title || draft.title}
                          </h4>
                          {draft.metaDescription && (
                            <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                              {draft.metaDescription}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleLoadAutomatedDraft(draft)}
                            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            📂 Load & Review
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAutomatedDraft(draft.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors"
                            title="Discard draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {draft.editorNotes && (
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-xs">
                          <span className="font-semibold text-amber-400">💡 Notes for Human Editor:</span>{' '}
                          <span className="text-slate-300">{draft.editorNotes}</span>
                        </div>
                      )}

                      {draft.sourceUrl && (
                        <div className="mt-2 text-[11px]">
                          <a
                            href={draft.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:underline"
                          >
                            🔗 View original source article &rarr;
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {loadingPosts ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-red-600 mb-2" />
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : existingPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No posts found</p>
            ) : (
              <div className="space-y-6">
                {/* Draft Posts Section */}
                {existingPosts.filter(p => p.title.startsWith('[DRAFT]')).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-600 mb-3 flex items-center gap-2">
                      📝 Drafts ({existingPosts.filter(p => p.title.startsWith('[DRAFT]')).length})
                    </h3>
                    <div className="space-y-4">
                      {existingPosts.filter(p => p.title.startsWith('[DRAFT]')).map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border-l-4 border-orange-500">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{post.title.replace('[DRAFT] ', '')}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              By {post.author} • {post.date}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={async () => {
                                // Load this specific draft
                                const jsonMatch = post.content.match(/<!-- DRAFT DATA START\n([\s\S]*?)\nDRAFT DATA END -->/)
                                if (jsonMatch) {
                                  const draftData = JSON.parse(jsonMatch[1])
                                  setTitle(draftData.title?.replace('[DRAFT] ', '') || '')
                                  setContent(draftData.content || '')
                                  setHtmlContent(draftData.htmlContent || '')
                                  setAuthor(draftData.author || 'BridgeTech IT Services')
                                  setMedia(draftData.media || [])
                                  toast.success('Draft loaded!')
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                } else {
                                  handleEditPost(post)
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                            >
                              📂 Load
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Posts Section */}
                {existingPosts.filter(p => !p.title.startsWith('[DRAFT]')).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                      ✅ Published ({existingPosts.filter(p => !p.title.startsWith('[DRAFT]')).length})
                    </h3>
                    <div className="space-y-4">
                      {existingPosts.filter(p => !p.title.startsWith('[DRAFT]')).map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{post.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              By {post.author} • {post.date} • {post.likes} likes
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-2xl font-bold"
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
                          ? 'bg-white text-red-600 shadow-sm' 
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
                          ? 'bg-white text-[#040e40] shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      👁️ HTML Preview
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !showSLNewsFinder
                        setShowSLNewsFinder(next)
                        if (next && !slNewsLoaded) {
                          loadSierraLeoneTechNews()
                        }
                      }}
                      className="flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 border border-emerald-400/60 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm"
                    >
                      <span className="mr-1.5 text-base leading-none">🇸🇱</span>
                      {showSLNewsFinder ? 'Hide SL News' : 'Find SL Tech News'}
                      {slNewsTopics.length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-800 text-white font-bold rounded-full text-[10px]">
                          {slNewsTopics.length}
                        </span>
                      )}
                    </button>

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
              </div>

              {/* Sierra Leone Tech News & Storyline Finder Section */}
              {showSLNewsFinder && (
                <div className="mb-6 p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white rounded-2xl border-2 border-emerald-500/50 shadow-2xl transition-all">
                  {/* Finder Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-800/40">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🇸🇱</span>
                        <h3 className="font-extrabold text-base sm:text-lg text-emerald-400 flex items-center gap-2">
                          Sierra Leone Tech News & Storyline Finder
                          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
                            Live & Curated
                          </span>
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 max-w-2xl">
                        Discover breaking tech news, MoCTI government policies, 4G/5G fiber expansion, fintech (Orange Money & Afrimoney), and hardware assembly deals in Sierra Leone. Click <strong>&quot;Write Story with AI&quot;</strong> to instantly investigate and write a complete blog post!
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => loadSierraLeoneTechNews(slNewsSearch, slNewsCategory, true)}
                        disabled={loadingSlNews}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingSlNews ? 'animate-spin' : ''}`} />
                        {loadingSlNews ? 'Scanning...' : 'Refresh Live News'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSLNewsFinder(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                        title="Close Finder"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Search & Category Filter Bar */}
                  <div className="space-y-3 mb-5">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={slNewsSearch}
                        onChange={(e) => setSlNewsSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            loadSierraLeoneTechNews(e.currentTarget.value, slNewsCategory)
                          }
                        }}
                        placeholder="Search Sierra Leone tech topics (e.g., 'Starlink', 'Unique Group', 'Fiber', 'MoCTI', 'Fintech', 'Assembly')..."
                        className="w-full pl-10 pr-24 py-2 bg-slate-800/90 border border-emerald-500/30 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                      />
                      <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                        {slNewsSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setSlNewsSearch('')
                              loadSierraLeoneTechNews('', slNewsCategory)
                            }}
                            className="text-xs text-slate-400 hover:text-white px-1.5 py-1"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => loadSierraLeoneTechNews(slNewsSearch, slNewsCategory)}
                          className="text-xs bg-emerald-600/80 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Category Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                      {[
                        'All Categories',
                        'Digital Governance & MoCTI',
                        'Hardware & Assembly',
                        'Telecom & 4G/5G',
                        'FinTech & Payments',
                        'Cybersecurity & Enterprise',
                        'Green Tech & Power',
                        'Startups & Youth STEM',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSlNewsCategory(cat)
                            loadSierraLeoneTechNews(slNewsSearch, cat)
                          }}
                          className={`whitespace-nowrap px-3 py-1 rounded-lg font-medium transition-all ${
                            slNewsCategory === cat
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content / Cards Grid */}
                  {loadingSlNews ? (
                    <div className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-2" />
                      <p className="text-sm font-medium text-slate-300">Scanning Sierra Leone tech news & MoCTI dossiers...</p>
                      <p className="text-xs text-slate-500 mt-1">Checking live Google News RSS and verified national tech reports</p>
                    </div>
                  ) : slNewsTopics.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-emerald-900/50 rounded-xl bg-slate-900/40">
                      <p className="text-slate-300 text-sm">No topics found matching &quot;{slNewsSearch}&quot;.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSlNewsSearch('')
                          setSlNewsCategory('All Categories')
                          loadSierraLeoneTechNews('', 'All Categories')
                        }}
                        className="mt-2 text-xs text-emerald-400 hover:underline font-semibold"
                      >
                        Reset filters and show all topics
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[580px] overflow-y-auto pr-1">
                      {slNewsTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex flex-col justify-between p-4 bg-slate-800/80 border border-slate-700 hover:border-emerald-500/60 rounded-xl transition-all shadow-sm group hover:bg-slate-800"
                        >
                          <div>
                            {/* Category & Source Header */}
                            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {topic.category}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span className="truncate max-w-[140px] font-medium text-slate-300">{topic.source}</span>
                                <span>•</span>
                                <span>{topic.pubDate}</span>
                              </div>
                            </div>

                            {/* Title */}
                            <h4 className="font-bold text-white text-sm sm:text-base leading-snug mb-2 group-hover:text-emerald-300 transition-colors">
                              {topic.title}
                            </h4>

                            {/* Summary */}
                            <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-3">
                              {topic.summary}
                            </p>

                            {/* Suggested Angle */}
                            {topic.suggestedAngle && (
                              <div className="mb-3 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200">
                                <strong className="text-emerald-400">💡 Suggested Angle:</strong> {topic.suggestedAngle}
                              </div>
                            )}
                          </div>

                          {/* Actions Footer */}
                          <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleWriteStoryFromTopic(topic)}
                                disabled={generatingContent}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1 hover:scale-[1.02] disabled:opacity-50"
                                title="Investigate this topic and write a full story with AI"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                                Write Story with AI
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadTopicToPrompt(topic)}
                                className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors flex items-center gap-1"
                                title="Copy topic and prompt into AI Writer box"
                              >
                                Use as Prompt
                              </button>
                            </div>

                            {topic.sourceUrl && (
                              <a
                                href={topic.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 flex-shrink-0"
                                title="Open original news article"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Source
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AI Content Generator */}
              {showAIHelper && (
                <div className="mb-4 p-4 sm:p-5 bg-gradient-to-r from-red-50 via-white to-purple-50 rounded-xl border-2 border-purple-200 shadow-md">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                          AI Investigative Blog & Story Writer
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">4000+ Tokens Full Stories</span>
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter any topic, news development, or repair guide. The AI will thoroughly investigate the story, gather real press photos from the web, cite official sources, and write a complete, beautifully structured article.
                      </p>

                      <textarea
                        value={contentPrompt}
                        onChange={(e) => setContentPrompt(e.target.value)}
                        placeholder="E.g., 'Investigate and write a story about the 21.9 million dollar project signed in Freetown' or 'How to protect laptops from tropical humidity in Sierra Leone'..."
                        rows={3}
                        className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2.5 text-sm transition-all"
                        disabled={generatingContent}
                      />

                      {/* Deep Investigation Checkbox */}
                      <label className="flex items-center space-x-2.5 text-xs sm:text-sm text-gray-700 font-medium mb-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={deepInvestigate}
                          onChange={(e) => setDeepInvestigate(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                          disabled={generatingContent}
                        />
                        <span>
                          🔍 <strong>Deep Investigation & Real Media:</strong> Search web for verified facts, embed real press photographs, and include official citations & links.
                        </span>
                      </label>

                      {/* Quick Prompt Suggestion Chips */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                            💡 Quick Investigation Topics:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSLNewsFinder(true)
                              if (!slNewsLoaded) loadSierraLeoneTechNews()
                            }}
                            className="text-xs text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <span>🇸🇱</span>
                            <span>Browse Sierra Leone Tech News Topics &raquo;</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            {
                              label: "🇸🇱 $21.9M Mobile Assembly Project (MoCTI & Unique Group)",
                              prompt: "Investigate and write a comprehensive feature story about the 21.9 million dollar mobile phone and electronics assembly MoU signed in Freetown between Sierra Leone's ICT Ministry and Unique Group Company Ltd."
                            },
                            {
                              label: "⚡ Why Device Repair Skills Drive Digital Economy",
                              prompt: "How local electronics assembly and professional motherboard repair facilities in Freetown create high-paying technical jobs for Sierra Leonean youth."
                            },
                            {
                              label: "📱 5 Signs Your Smartphone Screen Needs Replacement",
                              prompt: "5 critical warning signs that your smartphone screen or digitizer needs professional replacement before causing permanent display failure."
                            },
                            {
                              label: "🛡️ Protecting Laptops & Electronics in Freetown's Climate",
                              prompt: "The ultimate guide to protecting laptops, desktop computers, and smartphones from salt air, humidity, and power fluctuations in Freetown."
                            }
                          ].map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setContentPrompt(chip.prompt)}
                              className="text-xs bg-white hover:bg-purple-50 text-gray-700 hover:text-purple-700 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-purple-300 transition-all text-left"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Progress Notification */}
                      {generatingContent && (
                        <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-xs text-purple-800 animate-pulse">
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-600 flex-shrink-0" />
                          <span>{aiProgressMessage || 'Investigating live facts, gathering real images, and generating complete story...'}</span>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => generateAIContent()}
                          disabled={generatingContent}
                          className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                        >
                          {generatingContent ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Investigating & Generating Story...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Complete Story
                            </>
                          )}
                        </button>
                        {content && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Clear the current editor content?')) {
                                setContent('');
                                setHtmlContent('');
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-300"
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={saveDraft}
                        className="px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                      >
                        💾 Save Draft
                      </button>
                      <button
                        type="button"
                        onClick={loadDraft}
                        className="px-3 py-1 text-xs font-medium text-[#040e40] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                      >
                        📂 Load Draft
                      </button>
                      <button
                        type="button"
                        onClick={downloadAsWord}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                      >
                        📄 Word
                      </button>
                      <button
                        type="button"
                        onClick={downloadAsPDF}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                      >
                        📑 PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(htmlContent)
                          toast.success('HTML copied to clipboard!')
                        }}
                        className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
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
                        className="px-3 py-1 text-xs font-medium text-[#040e40] hover:bg-gray-100 rounded transition-colors"
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
                          className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          ✓ Apply Changes
                        </button>
                      </div>
                      <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        className="w-full h-[500px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none bg-white"
                        style={{ whiteSpace: 'pre-wrap' }}
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
                          lineHeight: '1.8',
                          whiteSpace: 'normal'
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        👁️ This is how your content will look when published
                      </p>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-red-50 px-4 py-3 border-t-2 border-red-200">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">💡</span>
                        <div className="text-sm text-[#040e40]">
                          <strong>HTML Tips:</strong> Use <code className="bg-red-100 px-1 rounded">&lt;h2&gt;</code> for headers, 
                          <code className="bg-red-100 px-1 rounded mx-1">&lt;p&gt;</code> for paragraphs, 
                          <code className="bg-red-100 px-1 rounded mx-1">&lt;strong&gt;</code> for bold, 
                          <code className="bg-red-100 px-1 rounded mx-1">&lt;ul&gt;</code> for lists
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">💾</span>
                        <div className="text-sm text-green-900">
                          <strong>Save Draft:</strong> Saves your work to browser storage and syncs to cloud. Access from any device!
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#040e40] mt-0.5">📥</span>
                        <div className="text-sm text-[#040e40]">
                          <strong>Download:</strong> Export as Word (.doc) for editing in Microsoft Word, or save as PDF for sharing
                        </div>
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
              {/* Free Stock Photo Resources */}
              <div className="bg-gradient-to-r from-red-50 to-gray-50 rounded-xl p-4 mb-6 border-2 border-red-100">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📸 Free Quality Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <a 
                    href="https://unsplash.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-lg transition-all hover:shadow-md text-center"
                  >
                    🎨 Unsplash
                  </a>
                  <a 
                    href="https://www.pexels.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white hover:bg-green-50 text-green-600 font-semibold rounded-lg transition-all hover:shadow-md text-center"
                  >
                    📷 Pexels
                  </a>
                  <a 
                    href="https://pixabay.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-[#040e40] font-semibold rounded-lg transition-all hover:shadow-md text-center"
                  >
                    🖼️ Pixabay
                  </a>
                  <a 
                    href="https://www.freepik.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-lg transition-all hover:shadow-md text-center"
                  >
                    ✨ Freepik
                  </a>
                  <a 
                    href="https://stocksnap.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-[#040e40] font-semibold rounded-lg transition-all hover:shadow-md text-center"
                  >
                    📸 StockSnap
                  </a>
                  <a 
                    href="https://burst.shopify.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-white hover:bg-orange-50 text-orange-600 font-semibold rounded-lg transition-all hover:shadow-md text-center"
                  >
                    🛍️ Burst
                  </a>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  💡 All sources offer free, high-quality images. Copy the image URL and paste below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <label className="flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-sm text-xs">
                  <Video className="w-4 h-4 mr-2" />
                  Upload Video File
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                    disabled={uploadingMedia}
                  />
                </label>

                <label className="flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer transition-all duration-300 shadow-sm text-xs">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Upload Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                    disabled={uploadingMedia}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleMediaUpload('video')}
                  className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-all duration-300 text-xs border border-purple-200"
                  disabled={uploadingMedia}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video URL
                </button>

                <button
                  type="button"
                  onClick={() => handleMediaUpload('image')}
                  className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-all duration-300 text-xs border border-blue-200"
                  disabled={uploadingMedia}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image URL
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mb-4">🎥 Upload MP4/WebM videos directly or add video/image URLs. Videos will auto-play on hover in CNN news mode!</p>

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
                        ) : (() => {
                          const embed = getVideoEmbed(item.url)
                          return embed.type === 'iframe' ? (
                            <iframe
                              src={embed.src}
                              className="w-full h-48 rounded"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video 
                              src={item.url} 
                              controls 
                              className="w-full h-48 object-cover"
                            />
                          )
                        })()}
                        
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
                onClick={() => {
                  if (editorMode === 'html' && htmlContent.trim()) {
                    setContent(htmlContent)
                  }
                  setPreview(true)
                }}
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
                {isPublishing 
                  ? (editingPostId ? 'Updating...' : 'Publishing...') 
                  : (editingPostId ? 'Update Post' : 'Publish Post')
                }
              </button>
            </div>
          </form>
        ) : (
          /* Preview */
          <div className="w-full">
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
                dangerouslySetInnerHTML={{ __html: (editorMode === 'html' && htmlContent.trim() ? htmlContent : content) || content || '<p class="text-gray-400">Your post content will appear here...</p>' }}
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
                        ) : (() => {
                          const embed = getVideoEmbed(item.url)
                          return embed.type === 'iframe' ? (
                            <iframe
                              src={embed.src}
                              className="w-full aspect-video rounded-lg"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video 
                              src={item.url} 
                              controls 
                              className="w-full h-auto rounded-lg"
                            />
                          )
                        })()}
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

        /* Table support in preview and prose */
        .prose table,
        #html-preview-content table {
          display: table !important;
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 1.5rem 0 !important;
          font-size: 14px !important;
        }

        .prose thead, #html-preview-content thead { display: table-header-group !important; }
        .prose tbody, #html-preview-content tbody { display: table-row-group !important; }
        .prose tr, #html-preview-content tr { display: table-row !important; }

        .prose th,
        .prose td,
        #html-preview-content th,
        #html-preview-content td {
          display: table-cell !important;
          padding: 10px 14px !important;
          border: 1px solid #d1d5db !important;
          text-align: left !important;
        }

        .prose th,
        #html-preview-content th {
          background-color: #1e293b !important;
          color: #ffffff !important;
          font-weight: 700 !important;
        }

        /* Div-based flex grid table support */
        .prose div[style*="display: flex"],
        .prose div[style*="display:flex"],
        #html-preview-content div[style*="display: flex"],
        #html-preview-content div[style*="display:flex"] {
          display: flex !important;
        }
      `}</style>
      </div>
    </>
  )
}
