'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ArrowLeft, Save, Eye, Upload, X, Image as ImageIcon, Video, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function BlogAdminPage() {
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
      comments: [],
      media: media.length > 0 ? media : undefined
    }

    // Add to beginning of posts array (newest first)
    posts.unshift(newPost)

    // Save to localStorage
    localStorage.setItem('blog_posts', JSON.stringify(posts))

    toast.success('Blog post published successfully!')
    
    // Reset form
    setTitle('')
    setContent('')
    setMedia([])
    
    // Redirect to blog page after a short delay
    setTimeout(() => {
      router.push('/blog')
    }, 1500)
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingMedia(true)

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const newMediaItem: MediaItem = {
          id: Date.now().toString() + Math.random(),
          type,
          url: event.target?.result as string,
          caption: ''
        }
        
        setMedia(prev => [...prev, newMediaItem])
        setUploadingMedia(false)
        toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`)
      }
      
      reader.onerror = () => {
        toast.error('Failed to upload file')
        setUploadingMedia(false)
      }
      
      reader.readAsDataURL(file)
    })

    // Reset input
    e.target.value = ''
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

            <form onSubmit={handleLogin} className="space-y-6">
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
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Lock className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
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

            {/* Media Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Photos & Videos (Optional)
              </label>
              
              {/* Upload Buttons */}
              <div className="flex space-x-4 mb-6">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMediaUpload(e, 'image')}
                    className="hidden"
                    disabled={uploadingMedia}
                  />
                  <div className="flex items-center justify-center px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-all duration-300">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Upload Images
                  </div>
                </label>
                
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleMediaUpload(e, 'video')}
                    className="hidden"
                    disabled={uploadingMedia}
                  />
                  <div className="flex items-center justify-center px-6 py-3 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-all duration-300">
                    <Video className="w-5 h-5 mr-2" />
                    Upload Videos
                  </div>
                </label>
              </div>

              {/* Media Preview */}
              {media.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 font-semibold">Uploaded Media ({media.length})</p>
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

              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap mb-6">
                {content || 'Your post content will appear here...'}
              </div>

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
    </div>
  )
}
