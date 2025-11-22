'use client'

import { useState, useEffect } from 'react'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, User, Send, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchBlogPosts, fetchPostComments, addComment, addReaction } from '@/lib/github-blog-storage'
import { DisplayAd, InFeedAd } from '@/components/AdSense'

interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
}

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
  image?: string
  media?: MediaItem[]
  likes: number
  dislikes: number
  comments: Comment[]
}

export default function BlogPage() {
  const { isLoading } = usePageLoader()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [commentAuthors, setCommentAuthors] = useState<{ [key: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'like' | 'dislike' | null }>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)

  useScrollAnimations()

  useEffect(() => {
    const loadPosts = async () => {
      try {
        console.log('Fetching blog posts from GitHub Issues...')
        // Try to load posts from GitHub Issues first
        const githubPosts = await fetchBlogPosts()
        
        console.log(`Fetched ${githubPosts.length} posts from GitHub`)
        
        if (githubPosts.length > 0) {
          // Load comments for each post from GitHub
          const postsWithComments = await Promise.all(
            githubPosts.map(async (post) => {
              const comments = await fetchPostComments(parseInt(post.id))
              return {
                ...post,
                comments: comments.map(c => ({
                  id: c.id.toString(),
                  author: c.author,
                  content: c.content,
                  timestamp: c.timestamp
                }))
              }
            })
          )
          console.log('Successfully loaded posts with comments from GitHub')
          setPosts(postsWithComments)
          // Also save to localStorage as cache
          localStorage.setItem('blog_posts', JSON.stringify(postsWithComments))
          return
        } else {
          console.warn('No posts returned from GitHub Issues API')
        }
      } catch (error) {
        console.error('Failed to load posts from GitHub:', error)
      }

      // Fallback to localStorage if GitHub fails
      console.log('Attempting to load posts from localStorage...')
      const savedPosts = localStorage.getItem('blog_posts')
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts)
        // Convert date strings back to Date objects
        const postsWithDates = parsedPosts.map((post: any) => ({
          ...post,
          comments: post.comments.map((comment: any) => ({
            ...comment,
            timestamp: new Date(comment.timestamp)
          }))
        }))
        console.log(`Loaded ${postsWithDates.length} posts from localStorage`)
        setPosts(postsWithDates)
      } else {
        console.log('No cached posts found, using sample posts')
        // Initialize with sample posts if nothing in localStorage
        const samplePosts: BlogPost[] = [
          {
            id: '1',
            title: '5 Signs Your Device Needs Professional Repair',
            content: `Is your device acting up? Here are the top 5 signs that indicate it's time to bring your device in for professional repair:

1. **Slow Performance** - If your device is significantly slower than usual, it might be a hardware issue.

2. **Battery Draining Fast** - A battery that drains within hours could need replacement.

3. **Screen Issues** - Cracks, dead pixels, or unresponsive touch screens need immediate attention.

4. **Overheating** - Excessive heat can damage internal components.

5. **Strange Noises** - Unusual sounds often indicate hardware problems.

Don't wait until it's too late! Contact us at +23233399391 for a free diagnosis.`,
            author: 'IT Services Freetown',
            date: '2025-10-15',
            likes: 12,
            dislikes: 1,
            comments: []
          },
          {
            id: '2',
            title: 'How to Protect Your Data Before Repair',
            content: `Before bringing your device for repair, follow these essential steps to protect your data:

**Step 1: Backup Everything**
Use cloud services or external drives to backup your important files, photos, and documents.

**Step 2: Sign Out of Accounts**
Log out of all accounts including email, social media, and banking apps.

**Step 3: Remove SIM & Memory Cards**
Take out your SIM card and any external storage cards.

**Step 4: Note Down Important Information**
Write down any passwords or settings you might need later.

**Step 5: Disable Security Features**
Turn off Find My Device, screen locks, and encryption (you can re-enable after repair).

At IT Services Freetown, we take your privacy seriously. Visit us at 37 Kissy Road or call +23233399391.`,
            author: 'IT Services Freetown',
            date: '2025-10-10',
            likes: 8,
            dislikes: 0,
            comments: []
          }
        ]
        setPosts(samplePosts)
        localStorage.setItem('blog_posts', JSON.stringify(samplePosts))
      }
    }

    // Load posts immediately
    loadPosts()

    // Auto-refresh posts every 30 seconds
    const refreshInterval = setInterval(() => {
      loadPosts()
    }, 30000) // 30 seconds

    // Load user votes from localStorage
    const savedVotes = localStorage.getItem('blog_votes')
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes))
    }

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval)
  }, [])

  // Handle URL hash navigation for shared links
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const postId = window.location.hash.replace('#post-', '')
      const post = posts.find(p => p.id === postId)
      
      if (post) {
        // Update meta tags for social sharing
        const shareImage = post.media?.find(m => m.type === 'image')?.url || post.image
        
        // Update Open Graph tags
        let ogImage = document.querySelector('meta[property="og:image"]')
        if (!ogImage) {
          ogImage = document.createElement('meta')
          ogImage.setAttribute('property', 'og:image')
          document.head.appendChild(ogImage)
        }
        if (shareImage) {
          ogImage.setAttribute('content', shareImage)
        }
        
        let ogTitle = document.querySelector('meta[property="og:title"]')
        if (!ogTitle) {
          ogTitle = document.createElement('meta')
          ogTitle.setAttribute('property', 'og:title')
          document.head.appendChild(ogTitle)
        }
        ogTitle.setAttribute('content', post.title)
        
        let ogDescription = document.querySelector('meta[property="og:description"]')
        if (!ogDescription) {
          ogDescription = document.createElement('meta')
          ogDescription.setAttribute('property', 'og:description')
          document.head.appendChild(ogDescription)
        }
        const contentPreview = post.content.replace(/<[^>]*>/g, '').substring(0, 200)
        ogDescription.setAttribute('content', contentPreview)
        
        // Update Twitter Card tags
        let twitterCard = document.querySelector('meta[name="twitter:card"]')
        if (!twitterCard) {
          twitterCard = document.createElement('meta')
          twitterCard.setAttribute('name', 'twitter:card')
          document.head.appendChild(twitterCard)
        }
        twitterCard.setAttribute('content', 'summary_large_image')
        
        let twitterImage = document.querySelector('meta[name="twitter:image"]')
        if (!twitterImage) {
          twitterImage = document.createElement('meta')
          twitterImage.setAttribute('name', 'twitter:image')
          document.head.appendChild(twitterImage)
        }
        if (shareImage) {
          twitterImage.setAttribute('content', shareImage)
        }
        
        // Scroll to post
        const postElement = document.getElementById(`post-${postId}`)
        if (postElement) {
          setTimeout(() => {
            postElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 500)
        }
      }
    }
  }, [posts])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log('Manual refresh: Fetching blog posts from GitHub...')
      const githubPosts = await fetchBlogPosts()
      
      console.log(`Manual refresh: Fetched ${githubPosts.length} posts`)
      
      if (githubPosts.length > 0) {
        const postsWithComments = await Promise.all(
          githubPosts.map(async (post) => {
            const comments = await fetchPostComments(parseInt(post.id))
            return {
              ...post,
              comments: comments.map(c => ({
                id: c.id.toString(),
                author: c.author,
                content: c.content,
                timestamp: c.timestamp
              }))
            }
          })
        )
        setPosts(postsWithComments)
        localStorage.setItem('blog_posts', JSON.stringify(postsWithComments))
        toast.success(`Refreshed! Loaded ${postsWithComments.length} blog posts`)
      } else {
        console.warn('Manual refresh: No posts returned from GitHub')
        toast('No new posts available')
      }
    } catch (error) {
      console.error('Failed to refresh posts:', error)
      toast.error('Failed to refresh posts')
    } finally {
      setIsRefreshing(false)
    }
  }

  const savePosts = (updatedPosts: BlogPost[]) => {
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts))
    setPosts(updatedPosts)
  }

  const handleLike = async (postId: string) => {
    const currentVote = userVotes[postId]
    
    if (currentVote === 'like') {
      toast('You already liked this post')
      return
    }

    try {
      const result = await addReaction(parseInt(postId), '+1')
      
      if (result.success) {
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              likes: post.likes + 1,
              dislikes: currentVote === 'dislike' ? post.dislikes - 1 : post.dislikes
            }
          }
          return post
        })

        const updatedVotes = { ...userVotes, [postId]: 'like' as const }
        
        setUserVotes(updatedVotes)
        localStorage.setItem('blog_votes', JSON.stringify(updatedVotes))
        setPosts(updatedPosts)
        toast.success('Thanks for liking this post!')
      } else {
        toast.error('Failed to add like')
      }
    } catch (error) {
      console.error('Error adding like:', error)
      toast.error('Failed to add like')
    }
  }

  const handleDislike = async (postId: string) => {
    const currentVote = userVotes[postId]
    
    if (currentVote === 'dislike') {
      toast('You already disliked this post')
      return
    }

    try {
      const result = await addReaction(parseInt(postId), '-1')
      
      if (result.success) {
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              dislikes: post.dislikes + 1,
              likes: currentVote === 'like' ? post.likes - 1 : post.likes
            }
          }
          return post
        })

        const updatedVotes = { ...userVotes, [postId]: 'dislike' as const }
        
        setUserVotes(updatedVotes)
        localStorage.setItem('blog_votes', JSON.stringify(updatedVotes))
        setPosts(updatedPosts)
      } else {
        toast.error('Failed to add dislike')
      }
    } catch (error) {
      console.error('Error adding dislike:', error)
      toast.error('Failed to add dislike')
    }
  }

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    const author = commentAuthors[postId]?.trim()

    if (!content || !author) {
      toast.error('Please enter your name and comment')
      return
    }

    try {
      const result = await addComment(parseInt(postId), content, author)
      
      if (result.success) {
        // Refresh comments for this post
        const comments = await fetchPostComments(parseInt(postId))
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return { ...post, comments }
          }
          return post
        })
        
        setPosts(updatedPosts)
        setCommentInputs({ ...commentInputs, [postId]: '' })
        setCommentAuthors({ ...commentAuthors, [postId]: '' })
        toast.success('Comment added!')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] })
  }

  const handleShare = async (post: BlogPost) => {
    const shareUrl = `${window.location.origin}/blog#post-${post.id}`
    const shareTitle = post.title
    
    // Get the first image from media or fallback to post.image
    const shareImage = post.media?.find(m => m.type === 'image')?.url || post.image
    
    // Create a more detailed share text with image info
    const contentPreview = post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
    const shareText = shareImage 
      ? `${post.title}\n\n${contentPreview}\n\nRead more at IT Services Freetown`
      : `Check out this article: ${post.title}\n\n${contentPreview}`

    // Try native Web Share API first (mobile)
    if (navigator.share) {
      try {
        // Web Share API supports files on some platforms
        const shareData: any = {
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        }
        
        // Try to include image if available (works on some mobile browsers)
        if (shareImage && navigator.canShare) {
          try {
            // Fetch the image and convert to blob
            const response = await fetch(shareImage)
            const blob = await response.blob()
            const file = new File([blob], 'image.jpg', { type: blob.type })
            
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file]
            }
          } catch (e) {
            console.log('Could not include image in share:', e)
          }
        }
        
        await navigator.share(shareData)
        toast.success('Shared successfully!')
        return
      } catch (error) {
        // User cancelled or share failed, fall back to copy link
        if ((error as Error).name !== 'AbortError') {
          console.log('Share failed, falling back to copy link')
        }
      }
    }

    // Fallback: Copy link to clipboard with additional info
    try {
      const clipboardText = shareImage 
        ? `${shareTitle}\n\n${shareUrl}\n\n📸 View image: ${shareImage}`
        : `${shareTitle}\n\n${shareUrl}`
      
      await navigator.clipboard.writeText(clipboardText)
      setCopiedPostId(post.id)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopiedPostId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatCommentDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return <LoadingOverlay />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-95"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-white">
              Tech Tips & <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">Innovation</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Discover the latest insights, tutorials, and news in technology and IT services
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Auto-updating every 30s</span>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 hover:border-white/30"
                title="Manually refresh blog posts"
              >
                <svg 
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Top Ad - Display Banner */}
        <div className="mb-12 scroll-animate">
          <DisplayAd className="max-w-4xl mx-auto" />
        </div>

        {/* Blog Posts */}
        <div className="space-y-8">{posts.length === 0 ? (
            <div className="text-center py-20 scroll-animate">
              <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No posts yet</p>
                <p className="text-gray-400">Check back soon for exciting content!</p>
              </div>
            </div>
          ) : (
            posts.map((post, index) => (
              <div key={post.id} id={`post-${post.id}`}>
                <article 
                  className="group bg-white rounded-3xl shadow-lg overflow-hidden scroll-animate hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                {/* Post Header with Gradient Bar */}
                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="p-8 md:p-10">
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">{post.author}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 bg-clip-text text-transparent leading-tight group-hover:scale-[1.02] transition-transform duration-300">
                    {post.title}
                  </h2>

                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none text-gray-700 mb-8 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Media Display */}
                  {post.media && post.media.length > 0 && (
                    <div className="mt-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {post.media.map((item) => (
                          <div key={item.id} className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                            {item.type === 'image' ? (
                              <img 
                                src={item.url} 
                                alt={item.caption || 'Post image'} 
                                className="w-full h-auto object-cover"
                              />
                            ) : (
                              <video 
                                src={item.url} 
                                controls 
                                className="w-full h-auto"
                              />
                            )}
                            {item.caption && (
                              <p className="text-sm text-gray-600 mt-3 px-2 italic">{item.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Engagement Bar */}
                <div className="border-t border-gray-100 px-8 md:px-10 py-6 bg-gradient-to-r from-gray-50 to-slate-50">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Like/Dislike Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${
                          userVotes[post.id] === 'like'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200'
                            : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-bold">{post.likes}</span>
                      </button>

                      <button
                        onClick={() => handleDislike(post.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm ${
                          userVotes[post.id] === 'dislike'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-200'
                            : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 hover:shadow-md'
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span className="font-bold">{post.dislikes}</span>
                      </button>
                    </div>

                    {/* Comments Button */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-bold">{post.comments.length}</span>
                      <span className="hidden sm:inline">Comments</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleShare(post)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md ${
                        copiedPostId === post.id
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="hidden sm:inline">{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="border-t border-gray-100 px-8 md:px-10 py-8 bg-gradient-to-br from-gray-50 to-slate-50">
                    {/* Add Comment Form */}
                    <div className="mb-8">
                      <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                        <MessageCircle className="w-6 h-6 text-purple-600" />
                        Leave a Comment
                      </h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={commentAuthors[post.id] || ''}
                          onChange={(e) => setCommentAuthors({ ...commentAuthors, [post.id]: e.target.value })}
                          className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm"
                        />
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r from-purple-600 to-pink-600"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {post.comments.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                        </div>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {comment.author.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-gray-900">{comment.author}</span>
                              </div>
                              <span className="text-sm text-gray-400">{formatCommentDate(comment.timestamp)}</span>
                            </div>
                            <p className="text-gray-700 ml-12">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </article>
              
              {/* Insert In-Feed Ad after every 2 posts */}
              {(index + 1) % 2 === 0 && index < posts.length - 1 && (
                <div className="my-8 scroll-animate">
                  <InFeedAd />
                </div>
              )}
            </div>
            ))
          )}
        </div>

        {/* Bottom Ad - Before Footer */}
        <div className="mt-12 mb-8 scroll-animate">
          <DisplayAd className="max-w-4xl mx-auto" />
        </div>

        {/* Modern Footer */}
        <footer className="mt-20 pt-12 border-t border-gray-200">
          <div className="text-center space-y-6">
            {/* Auto-refresh Indicator */}
            <div className="flex items-center justify-center gap-3 text-gray-500 flex-wrap">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Auto-updating every 30s</span>
              </div>
            </div>
            
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              © 2025 IT Services Freetown. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
