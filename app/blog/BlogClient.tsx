'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, User, Send, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchBlogPosts, fetchPostComments, addComment, addReaction } from '@/lib/github-blog-storage'
import { DisplayAd, InFeedAd } from '@/components/AdSense'
import PageBanner from '@/components/PageBanner'

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

export default function BlogClient({ initialPosts }: { initialPosts: any[] }) {
  const { isLoading } = usePageLoader()
  
  // Format the initial posts coming from Server (convert string timestamps to Date objects)
  const formattedInitialPosts = initialPosts ? initialPosts.map((post) => ({
    ...post,
    comments: post.comments ? post.comments.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp)
    })) : []
  })) : [];

  const [posts, setPosts] = useState<BlogPost[]>(formattedInitialPosts)
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [commentAuthors, setCommentAuthors] = useState<{ [key: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'like' | 'dislike' | null }>({})
  const [expandedPosts, setExpandedPosts] = useState<{ [key: string]: boolean }>({})
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)

  useScrollAnimations()

  useEffect(() => {
    const loadPosts = async () => {
      // Since SSR already fetched the data safely, if we have it, we use it!
      if (initialPosts && initialPosts.length > 0) {
        localStorage.setItem('blog_posts', JSON.stringify(initialPosts))
        return
      }

      try {
        // Try to load posts from GitHub Issues first
        const githubPosts = await fetchBlogPosts()
        
        if (githubPosts.length > 0) {
          // Filter out draft posts (those with [DRAFT] prefix)
          const publishedPosts = githubPosts.filter(post => !post.title.startsWith('[DRAFT]'))
          
          // Load comments for each post from GitHub
          const postsWithComments = await Promise.all(
            publishedPosts.map(async (post) => {
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
          // Also save to localStorage as cache
          localStorage.setItem('blog_posts', JSON.stringify(postsWithComments))
          return
        }
      } catch (error) {
        console.error('Failed to load posts from GitHub:', error)
      }

      // Fallback to localStorage if GitHub fails
      const savedPosts = localStorage.getItem('blog_posts')
      if (savedPosts) {
        const parsedPosts = JSON.parse(savedPosts)
        // Convert date strings back to Date objects and filter out drafts
        const postsWithDates = parsedPosts
          .filter((post: any) => !post.title.startsWith('[DRAFT]'))
          .map((post: any) => ({
            ...post,
            comments: post.comments.map((comment: any) => ({
              ...comment,
              timestamp: new Date(comment.timestamp)
            }))
          }))
        setPosts(postsWithDates)
      } else {
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

    // Load user votes from localStorage
    const savedVotes = localStorage.getItem('blog_votes')
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes))
    }
  }, [])

  // Handle URL hash navigation for shared links and update meta tags
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && posts.length > 0) {
      const postId = window.location.hash.replace('#post-', '')
      const post = posts.find(p => p.id === postId)
      
      if (post) {
        // Update meta tags for social sharing
        const shareImage = post.media?.find(m => m.type === 'image')?.url || post.image
        
        // Update Open Graph image
        let ogImage = document.querySelector('meta[property="og:image"]')
        if (!ogImage) {
          ogImage = document.createElement('meta')
          ogImage.setAttribute('property', 'og:image')
          document.head.appendChild(ogImage)
        }
        if (shareImage) {
          ogImage.setAttribute('content', shareImage)
        }
        
        // Update Open Graph title
        let ogTitle = document.querySelector('meta[property="og:title"]')
        if (!ogTitle) {
          ogTitle = document.createElement('meta')
          ogTitle.setAttribute('property', 'og:title')
          document.head.appendChild(ogTitle)
        }
        ogTitle.setAttribute('content', post.title)
        
        // Update Open Graph description
        let ogDescription = document.querySelector('meta[property="og:description"]')
        if (!ogDescription) {
          ogDescription = document.createElement('meta')
          ogDescription.setAttribute('property', 'og:description')
          document.head.appendChild(ogDescription)
        }
        const contentPreview = post.content.replace(/<[^>]*>/g, '').substring(0, 200)
        ogDescription.setAttribute('content', contentPreview)
        
        // Update Twitter card image
        let twitterImage = document.querySelector('meta[name="twitter:image"]')
        if (!twitterImage) {
          twitterImage = document.createElement('meta')
          twitterImage.setAttribute('name', 'twitter:image')
          document.head.appendChild(twitterImage)
        }
        if (shareImage) {
          twitterImage.setAttribute('content', shareImage)
        }
        
        // Expand the post automatically when accessed via hash
        setExpandedPosts(prev => ({
          ...prev,
          [postId]: true
        }))
        
        // Scroll to the post
        setTimeout(() => {
          const element = document.getElementById(`post-${postId}`)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 100)
      }
    }
  }, [posts])

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
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
        return
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
        }
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedPostId(post.id)
      toast.success('Link copied to clipboard!')
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedPostId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] })
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

  const getExcerpt = (content: string, maxLength: number = 300) => {
    const strippedContent = content.replace(/<[^>]*>/g, '')
    if (strippedContent.length <= maxLength) return content
    return strippedContent.substring(0, maxLength).trim() + '...'
  }

  // Expanded posts logic is now handled by dedicated article pages

  return (
    <>
      <LoadingOverlay show={isLoading} />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <PageBanner
        title="Tech Tips & Innovation"
        subtitle="Discover the latest insights, tutorials, and news in technology and IT services"
        icon="fas fa-blog"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Top Ad - Display Banner */}
        <div className="mb-12 scroll-animate">
          <DisplayAd className="max-w-4xl mx-auto" />
        </div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {posts.length === 0 ? (
            <div className="text-center py-20 scroll-animate col-span-full">
              <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No posts yet</p>
                <p className="text-gray-400">Check back soon for exciting content!</p>
              </div>
            </div>
          ) : (
            posts.map((post, index) => {
              const firstImage = post.media && post.media.find(m => m.type === 'image');
              return (
              <div key={post.id} className="flex flex-col h-full">
                <Link href={`/blog/${post.id}`} className="group flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 scroll-animate">
                  {/* Post Header with Gradient Bar */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                  <div className="p-4 md:p-5 flex flex-col h-full">
                    {/* Title */}
                    <h2 className="text-lg md:text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                    
                    {/* Image with Hover Animation */}
                    {firstImage && (
                      <div className="relative w-full h-36 md:h-40 rounded-xl overflow-hidden mb-4 shadow-sm">
                        <img 
                          src={firstImage.url} 
                          alt={firstImage.caption || post.title} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}

                    {/* Excerpt */}
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {/* Using the same getExcerpt logic from before, assuming it's available */}
                      {post.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
                    </p>

                    {/* Meta Info */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md truncate max-w-[80px]">{post.author}</span>
                        <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{new Date(post.date).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Insert In-Feed Ad after every 3 posts to match grid columns */}
                {(index + 1) % 3 === 0 && index < posts.length - 1 && (
                  <div className="mt-8 col-span-full scroll-animate">
                    <InFeedAd />
                  </div>
                )}
              </div>
              )
            })
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
            {/* Copyright */}
            <p className="text-gray-400 text-sm">
              © 2025 IT Services Freetown. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
    </>
  )
}
