'use client'

import { useState, useEffect } from 'react'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, User, Send, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchBlogPosts, fetchPostComments, addComment, addReaction, getUserReaction, storeUserReaction } from '@/lib/github-blog-storage'

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

  useScrollAnimations()

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Try to load posts from GitHub Issues first
        const githubPosts = await fetchBlogPosts()
        
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
          setPosts(postsWithComments)
          // Also save to localStorage as cache
          localStorage.setItem('blog_posts', JSON.stringify(postsWithComments))
          return
        }
      } catch (error) {
        console.error('Failed to load posts from GitHub:', error)
        toast.error('Loading posts from local cache')
      }

      // Fallback to localStorage if GitHub fails
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

    loadPosts()
  }, [])

  // Load user reactions after posts are loaded
  useEffect(() => {
    const loadReactions = async () => {
      const votes: { [key: string]: 'like' | 'dislike' | null } = {}
      for (const post of posts) {
        const reaction = await getUserReaction(parseInt(post.id))
        votes[post.id] = reaction === '+1' ? 'like' : reaction === '-1' ? 'dislike' : null
      }
      setUserVotes(votes)
    }
    
    if (posts.length > 0) {
      loadReactions()
    }
  }, [posts])

  const savePosts = (updatedPosts: BlogPost[]) => {
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts))
    setPosts(updatedPosts)
  }

  const refreshPosts = async () => {
    try {
      toast.loading('Refreshing posts from GitHub...')
      const githubPosts = await fetchBlogPosts()
      
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
        toast.dismiss()
        toast.success('✅ Posts refreshed from GitHub!')
      } else {
        toast.dismiss()
        toast.error('No posts found on GitHub')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to refresh posts from GitHub')
      console.error('Refresh error:', error)
    }
  }

  const handleLike = async (postId: string) => {
    const issueNumber = parseInt(postId)
    const currentVote = await getUserReaction(issueNumber)
    const currentVoteUI = currentVote === '+1' ? 'like' : currentVote === '-1' ? 'dislike' : null
    
    try {
      if (currentVoteUI === 'like') {
        // Remove like - just update UI optimistically
        const updatedPosts = posts.map(post => 
          post.id === postId ? { ...post, likes: post.likes - 1 } : post
        )
        setPosts(updatedPosts)
        storeUserReaction(issueNumber, null)
        setUserVotes({ ...userVotes, [postId]: null })
      } else {
        // Add like to GitHub
        const result = await addReaction(issueNumber, '+1')
        
        if (result.success) {
          // Update UI
          const updatedPosts = posts.map(post => {
            if (post.id === postId) {
              if (currentVoteUI === 'dislike') {
                return { ...post, likes: post.likes + 1, dislikes: post.dislikes - 1 }
              } else {
                return { ...post, likes: post.likes + 1 }
              }
            }
            return post
          })
          setPosts(updatedPosts)
          storeUserReaction(issueNumber, '+1')
          setUserVotes({ ...userVotes, [postId]: 'like' })
          toast.success('Thanks for liking this post!')
        } else {
          toast.error('Failed to like post')
        }
      }
    } catch (error) {
      console.error('Like error:', error)
      toast.error('Failed to like post')
    }
  }

  const handleDislike = async (postId: string) => {
    const issueNumber = parseInt(postId)
    const currentVote = await getUserReaction(issueNumber)
    const currentVoteUI = currentVote === '+1' ? 'like' : currentVote === '-1' ? 'dislike' : null
    
    try {
      if (currentVoteUI === 'dislike') {
        // Remove dislike - just update UI optimistically
        const updatedPosts = posts.map(post => 
          post.id === postId ? { ...post, dislikes: post.dislikes - 1 } : post
        )
        setPosts(updatedPosts)
        storeUserReaction(issueNumber, null)
        setUserVotes({ ...userVotes, [postId]: null })
      } else {
        // Add dislike to GitHub
        const result = await addReaction(issueNumber, '-1')
        
        if (result.success) {
          // Update UI
          const updatedPosts = posts.map(post => {
            if (post.id === postId) {
              if (currentVoteUI === 'like') {
                return { ...post, likes: post.likes - 1, dislikes: post.dislikes + 1 }
              } else {
                return { ...post, dislikes: post.dislikes + 1 }
              }
            }
            return post
          })
          setPosts(updatedPosts)
          storeUserReaction(issueNumber, '-1')
          setUserVotes({ ...userVotes, [postId]: 'dislike' })
          toast('Feedback noted', { icon: '👍' })
        } else {
          toast.error('Failed to dislike post')
        }
      }
    } catch (error) {
      console.error('Dislike error:', error)
      toast.error('Failed to dislike post')
    }
  }

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    const author = commentAuthors[postId]?.trim()

    if (!content || !author) {
      toast.error('Please enter your name and comment')
      return
    }

    const issueNumber = parseInt(postId)

    try {
      // Add comment to GitHub
      const result = await addComment(issueNumber, author, content)

      if (result.success) {
        // Refetch comments from GitHub to get the latest
        const comments = await fetchPostComments(issueNumber)
        
        // Update UI with refreshed comments
        const updatedPosts = posts.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              comments: comments.map(c => ({
                id: c.id.toString(),
                author: c.author,
                content: c.content,
                timestamp: c.timestamp
              }))
            }
          }
          return post
        })

        setPosts(updatedPosts)
        localStorage.setItem('blog_posts', JSON.stringify(updatedPosts))
        setCommentInputs({ ...commentInputs, [postId]: '' })
        setCommentAuthors({ ...commentAuthors, [postId]: '' })
        toast.success('Comment added!')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Comment error:', error)
      toast.error('Failed to add comment')
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

  if (isLoading) {
    return <LoadingOverlay />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 scroll-animate">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#040e40' }}>
            Tech Tips & News
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest tech tips, repair guides, and device care advice
          </p>
        </div>

        {/* Admin Link */}
        <div className="mb-8 flex justify-center items-center gap-4 scroll-animate">
          <a 
            href="/blog/admin" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, #040e40 0%, #ef4444 100%)',
              color: 'white'
            }}
          >
            <User className="w-4 h-4 mr-2" />
            Admin: Create New Post
          </a>
          
          <button
            onClick={refreshPosts}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 border-2"
            style={{ 
              borderColor: '#040e40',
              color: '#040e40'
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Posts
          </button>
        </div>

        {/* Blog Posts */}
        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-16 scroll-animate">
              <p className="text-gray-500 text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden scroll-animate hover:shadow-xl transition-shadow duration-300"
              >
                {/* Post Header */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(post.date)}</span>
                    <span className="mx-2">•</span>
                    <User className="w-4 h-4 mr-2" />
                    <span>{post.author}</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#040e40' }}>
                    {post.title}
                  </h2>

                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap mb-6">
                    {post.content}
                  </div>

                  {/* Media Display */}
                  {post.media && post.media.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {post.media.map((item) => (
                          <div key={item.id} className="rounded-lg overflow-hidden">
                            {item.type === 'image' ? (
                              <img 
                                src={item.url} 
                                alt={item.caption || 'Post image'} 
                                className="w-full h-auto object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                              />
                            ) : (
                              <video 
                                src={item.url} 
                                controls 
                                className="w-full h-auto rounded-lg shadow-md"
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

                {/* Engagement Bar */}
                <div className="border-t px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Like/Dislike Buttons */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          userVotes[post.id] === 'like'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-white text-gray-600 hover:bg-blue-50'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-semibold">{post.likes}</span>
                      </button>

                      <button
                        onClick={() => handleDislike(post.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          userVotes[post.id] === 'dislike'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-white text-gray-600 hover:bg-red-50'
                        }`}
                      >
                        <ThumbsDown className="w-5 h-5" />
                        <span className="font-semibold">{post.dislikes}</span>
                      </button>
                    </div>

                    {/* Comments Button */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-gray-600 hover:bg-gray-100 transition-all duration-300"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{post.comments.length} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="border-t px-6 py-6 bg-white">
                    {/* Add Comment Form */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Leave a Comment</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={commentAuthors[post.id] || ''}
                          onChange={(e) => setCommentAuthors({ ...commentAuthors, [post.id]: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)' }}
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {post.comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                      ) : (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">{comment.author}</span>
                              <span className="text-sm text-gray-500">{formatCommentDate(comment.timestamp)}</span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
