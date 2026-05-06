'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { addReaction, addComment, fetchPostComments } from '@/lib/github-blog-storage'
import styles from '../blog.module.css'

interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
}

interface ArticleInteractionsProps {
  postId: string
  initialLikes: number
  initialDislikes: number
  initialComments: any[]
  postTitle: string
}

export default function ArticleInteractions({
  postId,
  initialLikes,
  initialDislikes,
  initialComments,
  postTitle
}: ArticleInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [comments, setComments] = useState<Comment[]>(
    initialComments.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp)
    }))
  )
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    const savedVotes = localStorage.getItem('blog_votes')
    if (savedVotes) {
      const parsedVotes = JSON.parse(savedVotes)
      if (parsedVotes[postId]) {
        setUserVote(parsedVotes[postId])
      }
    }
  }, [postId])

  const handleLike = async () => {
    if (userVote === 'like') {
      toast('You already liked this post')
      return
    }

    try {
      const result = await addReaction(parseInt(postId, 10), '+1')
      if (result.success) {
        setLikes(prev => prev + 1)
        if (userVote === 'dislike') setDislikes(prev => prev - 1)
        
        const newVote = 'like'
        setUserVote(newVote)
        
        const savedVotes = JSON.parse(localStorage.getItem('blog_votes') || '{}')
        savedVotes[postId] = newVote
        localStorage.setItem('blog_votes', JSON.stringify(savedVotes))
        
        toast.success('Thanks for liking this post!')
      } else {
        toast.error('Failed to add like')
      }
    } catch (e) {
      toast.error('Failed to add like')
    }
  }

  const handleDislike = async () => {
    if (userVote === 'dislike') {
      toast('You already disliked this post')
      return
    }

    try {
      const result = await addReaction(parseInt(postId, 10), '-1')
      if (result.success) {
        setDislikes(prev => prev + 1)
        if (userVote === 'like') setLikes(prev => prev - 1)
        
        const newVote = 'dislike'
        setUserVote(newVote)
        
        const savedVotes = JSON.parse(localStorage.getItem('blog_votes') || '{}')
        savedVotes[postId] = newVote
        localStorage.setItem('blog_votes', JSON.stringify(savedVotes))
        
        toast.success('Feedback recorded')
      } else {
        toast.error('Failed to add dislike')
      }
    } catch (e) {
      toast.error('Failed to add dislike')
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
        return
      } catch (e) {
        // Fallback
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      toast.success('Article link copied!')
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (e) {
      toast.error('Failed to copy link')
    }
  }

  const handleAddComment = async () => {
    if (!commentName.trim() || !commentText.trim()) {
      toast.error('Please enter your name and comment')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addComment(parseInt(postId, 10), commentText.trim(), commentName.trim())
      if (result.success) {
        const updatedComments = await fetchPostComments(parseInt(postId, 10))
        setComments(updatedComments.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })))
        setCommentText('')
        setCommentName('')
        toast.success('Comment added!')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (e) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCommentDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return \`\${minutes}m ago\`
    if (hours < 24) return \`\${hours}h ago\`
    if (days < 7) return \`\${days}d ago\`
    return date.toLocaleDateString()
  }

  return (
    <div className="mt-12 border-t border-slate-100 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={styles.storyActionRail}>
          <button
            onClick={handleLike}
            className={\`\${styles.storyActionButton} \${
              userVote === 'like' ? styles.storyActionActiveBlue : ''
            }\`}
          >
            <ThumbsUp className="h-5 w-5" />
            <span className="text-sm font-semibold">{likes}</span>
          </button>
          
          <button
            onClick={handleDislike}
            className={\`\${styles.storyActionButton} \${
              userVote === 'dislike' ? styles.storyActionActiveRed : ''
            }\`}
          >
            <ThumbsDown className="h-5 w-5" />
            <span className="text-sm font-semibold">{dislikes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={styles.storyActionButton}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-semibold">{comments.length} Comments</span>
          </button>
          
          <button
            onClick={handleShare}
            className={styles.storyActionButton}
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-semibold">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="mt-8 rounded-2xl bg-slate-50 p-6 border border-slate-100">
          <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            Discussion
          </h3>
          
          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Your name"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
              <button
                onClick={handleAddComment}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl font-bold text-white bg-primary-950 hover:bg-primary-900 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No comments yet. Be the first to start the discussion!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900">{comment.author}</span>
                    </div>
                    <span className="text-xs text-slate-400">{formatCommentDate(comment.timestamp)}</span>
                  </div>
                  <p className="text-slate-700 ml-10 text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
