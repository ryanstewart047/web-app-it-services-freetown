'use client'

import {
  Fragment,
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpenText,
  Calendar,
  Clock3,
  MessageCircle,
  Search,
  Send,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'
import { DisplayAd, InFeedAd } from '@/components/AdSense'
import {
  addComment,
  addReaction,
  fetchBlogPosts,
  fetchPostComments,
} from '@/lib/github-blog-storage'
import styles from './blog.module.css'
import {
  BlogFilter,
  BlogPost,
  formatCommentDate,
  formatLongDate,
  formatShortDate,
  getExcerpt,
  getPostCategory,
  getPrimaryImage,
  getReadingTime,
  sortPosts,
  stripHtml,
} from './blog-utils'

const FILTER_OPTIONS: { key: BlogFilter; label: string }[] = [
  { key: 'all', label: 'Editor picks' },
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Popular' },
  { key: 'discussed', label: 'Discussed' },
]

const FALLBACK_POSTS: BlogPost[] = [
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
    comments: [],
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
    comments: [],
  },
]

function rehydratePosts(rawPosts: any[]): BlogPost[] {
  return rawPosts
    .filter((post: any) => !post.title.startsWith('[DRAFT]'))
    .map((post: any) => ({
      ...post,
      comments: (post.comments || []).map((comment: any) => ({
        ...comment,
        timestamp: new Date(comment.timestamp),
      })),
    }))
}

function getTagClass(category: string) {
  if (category === 'Repair Guide') return styles.tagRepair
  if (category === 'Data Care') return styles.tagData
  if (category === 'Buying Advice') return styles.tagBuyer
  if (category === 'Device Tips') return styles.tagDevice
  return styles.tagInsight
}

export default function BlogPage() {
  const { isLoading } = usePageLoader()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const [userVotes, setUserVotes] = useState<
    Record<string, 'like' | 'dislike' | null>
  >({})
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<BlogFilter>('all')

  const deferredQuery = useDeferredValue(searchQuery)

  useScrollAnimations()

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const githubPosts = await fetchBlogPosts()

        if (githubPosts.length > 0) {
          const publishedPosts = githubPosts.filter(
            (post) => !post.title.startsWith('[DRAFT]')
          )

          const postsWithComments = await Promise.all(
            publishedPosts.map(async (post) => {
              const comments = await fetchPostComments(parseInt(post.id, 10))
              return {
                ...post,
                comments: comments.map((comment) => ({
                  id: comment.id.toString(),
                  author: comment.author,
                  content: comment.content,
                  timestamp: comment.timestamp,
                })),
              }
            })
          )

          setPosts(postsWithComments)
          localStorage.setItem('blog_posts', JSON.stringify(postsWithComments))
          return
        }
      } catch (error) {
        console.error('Failed to load posts from GitHub:', error)
      }

      const savedPosts = localStorage.getItem('blog_posts')

      if (savedPosts) {
        setPosts(rehydratePosts(JSON.parse(savedPosts)))
        return
      }

      setPosts(FALLBACK_POSTS)
      localStorage.setItem('blog_posts', JSON.stringify(FALLBACK_POSTS))
    }

    loadPosts()

    const savedVotes = localStorage.getItem('blog_votes')
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes))
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash || posts.length === 0) {
      return
    }

    const postId = window.location.hash.replace('#post-', '')

    setTimeout(() => {
      const element = document.getElementById(`post-${postId}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }, [posts])

  const handleLike = async (postId: string) => {
    const currentVote = userVotes[postId]

    if (currentVote === 'like') {
      toast('You already liked this post')
      return
    }

    try {
      const result = await addReaction(parseInt(postId, 10), '+1')

      if (!result.success) {
        toast.error('Failed to add like')
        return
      }

      const updatedPosts = posts.map((post) => {
        if (post.id !== postId) return post

        return {
          ...post,
          likes: post.likes + 1,
          dislikes: currentVote === 'dislike' ? post.dislikes - 1 : post.dislikes,
        }
      })

      const updatedVotes = { ...userVotes, [postId]: 'like' as const }

      setUserVotes(updatedVotes)
      localStorage.setItem('blog_votes', JSON.stringify(updatedVotes))
      setPosts(updatedPosts)
      toast.success('Thanks for liking this post!')
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
      const result = await addReaction(parseInt(postId, 10), '-1')

      if (!result.success) {
        toast.error('Failed to add dislike')
        return
      }

      const updatedPosts = posts.map((post) => {
        if (post.id !== postId) return post

        return {
          ...post,
          dislikes: post.dislikes + 1,
          likes: currentVote === 'like' ? post.likes - 1 : post.likes,
        }
      })

      const updatedVotes = { ...userVotes, [postId]: 'dislike' as const }

      setUserVotes(updatedVotes)
      localStorage.setItem('blog_votes', JSON.stringify(updatedVotes))
      setPosts(updatedPosts)
      toast.success('Feedback recorded')
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
      const result = await addComment(parseInt(postId, 10), content, author)

      if (!result.success) {
        toast.error('Failed to add comment')
        return
      }

      const comments = await fetchPostComments(parseInt(postId, 10))
      const updatedPosts = posts.map((post) =>
        post.id === postId ? { ...post, comments } : post
      )

      setPosts(updatedPosts)
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
      setCommentAuthors((prev) => ({ ...prev, [postId]: '' }))
      toast.success('Comment added!')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const handleShare = async (post: BlogPost) => {
    const shareUrl = `${window.location.origin}/blog/${post.id}`
    const contentPreview = getExcerpt(post.content, 150)
    const shareText = `${post.title}\n\n${contentPreview}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
        return
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedPostId(post.id)
      toast.success('Article link copied!')

      setTimeout(() => {
        setCopiedPostId(null)
      }, 1800)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const filteredPosts = sortPosts(posts, activeFilter).filter((post) => {
    if (!normalizedQuery) return true

    const searchableText = [
      post.title,
      stripHtml(post.content),
      post.author,
      getPostCategory(post),
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedQuery)
  })

  const featuredPost = filteredPosts[0]
  const libraryPosts = filteredPosts.slice(1)
  const popularPosts = sortPosts(posts, 'popular').slice(0, 3)
  const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0)
  const totalReactions = posts.reduce(
    (sum, post) => sum + post.likes + post.dislikes,
    0
  )
  const totalReadingMinutes = posts.reduce(
    (sum, post) => sum + getReadingTime(post.content),
    0
  )
  const latestPost = sortPosts(posts, 'latest')[0]

  return (
    <>
      <LoadingOverlay show={isLoading} />

      <div className={styles.pageShell}>
        <div className={styles.meshOrbOne} />
        <div className={styles.meshOrbTwo} />

        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <section className={`${styles.heroPanel} scroll-animate`}>
            <div className="relative z-10 grid gap-10 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.45fr_0.95fr] lg:px-12 lg:py-14">
              <div className="space-y-6">
                <span className={styles.eyebrow}>
                  <Sparkles className="h-4 w-4" />
                  IT Services Freetown Journal
                </span>

                <div className="space-y-4">
                  <h1 className={`${styles.heroTitle} font-black text-white`}>
                    A sharper blog for repair know-how, device care, and local tech insight.
                  </h1>
                  <p className={`${styles.heroLead} text-base sm:text-lg`}>
                    Browse practical articles built for customers in Freetown:
                    repair guidance, data protection tips, smarter buying advice,
                    and real-world answers for the devices people rely on every day.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className={`${styles.statCard} p-4`}>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-200">
                      Articles
                    </p>
                    <p className="mt-3 text-3xl font-bold text-white">
                      {posts.length}
                    </p>
                  </div>
                  <div className={`${styles.statCard} p-4`}>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-200">
                      Community replies
                    </p>
                    <p className="mt-3 text-3xl font-bold text-white">
                      {totalComments}
                    </p>
                  </div>
                  <div className={`${styles.statCard} p-4`}>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-200">
                      Reading library
                    </p>
                    <p className="mt-3 text-3xl font-bold text-white">
                      {totalReadingMinutes} min
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`${styles.statCard} p-6`}>
                  <p className="text-sm uppercase tracking-[0.18em] text-red-100">
                    What you will find here
                  </p>
                  <div className="mt-5 space-y-4 text-sm text-blue-50/90 sm:text-base">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="mt-0.5 h-5 w-5 text-red-200" />
                      <p>Short, useful repair guidance that answers real customer questions fast.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpenText className="mt-0.5 h-5 w-5 text-red-200" />
                      <p>Plain-language explanations instead of generic copy or jargon-heavy tutorials.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-5 w-5 text-red-200" />
                      <p>
                        Updated {latestPost ? formatLongDate(latestPost.date) : 'as new stories are published'}.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`${styles.statCard} p-6`}>
                  <p className="text-sm uppercase tracking-[0.18em] text-red-100">
                    Need direct help?
                  </p>
                  <p className="mt-3 text-sm text-blue-50/90 sm:text-base">
                    If an article sounds like your issue, jump straight to support or book a repair with the team.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href="/book-appointment"
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-950 transition hover:bg-red-50"
                    >
                      Book a repair
                    </Link>
                    <Link
                      href="/contact"
                      className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Contact us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.toolbarShell} mt-8 p-4 sm:p-5 scroll-animate`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    startTransition(() => {
                      setSearchQuery(nextValue)
                    })
                  }}
                  placeholder="Search repair guides, data tips, and device advice"
                  className="w-full rounded-full border border-slate-200 bg-white px-12 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((filter) => {
                  const isActive = activeFilter === filter.key

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => {
                        startTransition(() => {
                          setActiveFilter(filter.key)
                        })
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-primary-950 text-white shadow-lg shadow-blue-950/10'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span>
                Showing <strong className="text-slate-900">{filteredPosts.length}</strong> article
                {filteredPosts.length === 1 ? '' : 's'}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span>
                <strong className="text-slate-900">{totalReactions}</strong> total reactions from readers
              </span>
            </div>
          </section>

          <div className="mt-8 scroll-animate">
            <DisplayAd className="mx-auto max-w-4xl" />
          </div>

          {featuredPost ? (
            <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_22rem]">
              <Link
                href={`/blog/${featuredPost.id}`}
                className={`${styles.featureCard} scroll-animate block`}
              >
                <div className={styles.featureMedia}>
                  {getPrimaryImage(featuredPost) ? (
                    <img
                      src={getPrimaryImage(featuredPost)}
                      alt={featuredPost.title}
                      className={styles.featureImage}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-10 text-center">
                      <div>
                        <BookOpenText className="mx-auto h-14 w-14 text-primary-950/70" />
                        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-950/70">
                          Featured story
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.featureContent}>
                  <span className={styles.featureBadge}>
                    <Sparkles className="h-4 w-4" />
                    Featured article
                  </span>
                  <h2 className="mt-4 max-w-3xl text-2xl font-black leading-tight text-white sm:text-4xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-blue-50/90 sm:text-base">
                    {getExcerpt(featuredPost.content, 220)}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-blue-50/85">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatLongDate(featuredPost.date)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      {getReadingTime(featuredPost.content)} min read
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {featuredPost.likes} likes
                    </span>
                  </div>
                </div>
              </Link>

              <aside className="space-y-4">
                <div className={`${styles.insightCard} scroll-animate rounded-[1.75rem] p-5`}>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Popular right now
                  </p>
                  <div className="mt-4 space-y-4">
                    {popularPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className="block rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-slate-200 hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                          <span>{getPostCategory(post)}</span>
                          <span>{getReadingTime(post.content)} min</span>
                        </div>
                        <h3 className="mt-2 text-base font-bold leading-snug text-slate-900">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {getExcerpt(post.content, 92)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className={`${styles.insightCard} scroll-animate rounded-[1.75rem] p-5`}>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Reading room note
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    This new layout is tuned for fast scanning first, deep reading second, so customers can
                    find the right answer before committing to a repair.
                  </p>
                </div>
              </aside>
            </section>
          ) : (
            <div className={`${styles.emptyState} mt-10 scroll-animate px-6 py-16 text-center`}>
              <div className="mx-auto max-w-xl">
                <MessageCircle className="mx-auto h-14 w-14 text-primary-950/70" />
                <h2 className="mt-5 text-3xl font-black text-slate-900">
                  No articles match your search yet
                </h2>
                <p className="mt-3 text-slate-600">
                  Try a broader keyword or switch back to editor picks to browse the full library.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setSearchQuery('')
                      setActiveFilter('all')
                    })
                  }}
                  className="mt-6 rounded-full bg-primary-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-900"
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}

          {libraryPosts.length > 0 && (
            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Article library
                  </p>
                  <h2 className="mt-2 text-3xl font-black text-slate-900">
                    More stories worth reading
                  </h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {libraryPosts.map((post, index) => {
                  const category = getPostCategory(post)
                  const image = getPrimaryImage(post)

                  return (
                    <Fragment key={post.id}>
                      <article
                        id={`post-${post.id}`}
                        className={`${styles.storyCard} group scroll-animate overflow-hidden`}
                      >
                        <div className="flex h-full flex-col p-5 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`${styles.tagBase} ${getTagClass(category)}`}>
                              {category}
                            </span>
                            <span className={`${styles.metaChip} text-xs font-semibold`}>
                              <Clock3 className="h-3.5 w-3.5" />
                              {getReadingTime(post.content)} min read
                            </span>
                          </div>

                          {image && (
                            <Link
                              href={`/blog/${post.id}`}
                              className={`${styles.storyMedia} mt-5 block overflow-hidden`}
                            >
                              <img
                                src={image}
                                alt={post.title}
                                className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </Link>
                          )}

                          <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className={`${styles.metaChip} text-xs`}>
                              <Calendar className="h-3.5 w-3.5" />
                              {formatShortDate(post.date)}
                            </span>
                            <span className={`${styles.metaChip} text-xs`}>
                              <User className="h-3.5 w-3.5" />
                              {post.author}
                            </span>
                          </div>

                          <Link href={`/blog/${post.id}`} className="mt-4 block">
                            <h3 className="text-2xl font-black leading-tight text-slate-900 transition hover:text-primary-900">
                              {post.title}
                            </h3>
                          </Link>

                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {getExcerpt(post.content, 155)}
                          </p>

                          <div className="mt-auto pt-6">
                            <div className="flex items-center justify-between gap-3">
                              <Link
                                href={`/blog/${post.id}`}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-950 transition hover:text-blue-700"
                              >
                                Read article
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                {post.comments.length} comments
                              </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleLike(post.id)}
                                className={`${styles.iconButton} ${
                                  userVotes[post.id] === 'like'
                                    ? styles.iconButtonActiveBlue
                                    : ''
                                }`}
                              >
                                <ThumbsUp className="h-4 w-4" />
                                <span className="text-sm font-semibold">{post.likes}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDislike(post.id)}
                                className={`${styles.iconButton} ${
                                  userVotes[post.id] === 'dislike'
                                    ? styles.iconButtonActiveRed
                                    : ''
                                }`}
                              >
                                <ThumbsDown className="h-4 w-4" />
                                <span className="text-sm font-semibold">{post.dislikes}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleComments(post.id)}
                                className={styles.iconButton}
                              >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                  {showComments[post.id] ? 'Hide' : 'Reply'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleShare(post)}
                                className={styles.iconButton}
                              >
                                <Share2 className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                  {copiedPostId === post.id ? 'Copied' : 'Share'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {showComments[post.id] && (
                          <div className={`${styles.commentPanel} p-5 sm:p-6`}>
                            <div className="space-y-4">
                              <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                                <input
                                  type="text"
                                  placeholder="Your name"
                                  value={commentAuthors[post.id] || ''}
                                  onChange={(event) =>
                                    setCommentAuthors((prev) => ({
                                      ...prev,
                                      [post.id]: event.target.value,
                                    }))
                                  }
                                  className={styles.commentField}
                                />
                                <div className="flex flex-col gap-3 sm:flex-row">
                                  <textarea
                                    placeholder="Add a thoughtful reply"
                                    value={commentInputs[post.id] || ''}
                                    onChange={(event) =>
                                      setCommentInputs((prev) => ({
                                        ...prev,
                                        [post.id]: event.target.value,
                                      }))
                                    }
                                    onKeyDown={(event) => {
                                      if (
                                        (event.metaKey || event.ctrlKey) &&
                                        event.key === 'Enter'
                                      ) {
                                        handleAddComment(post.id)
                                      }
                                    }}
                                    rows={3}
                                    className={`${styles.commentField} min-h-[7rem] resize-y`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddComment(post.id)}
                                    className={`${styles.submitButton} min-h-[3.5rem] px-5 py-3 sm:self-start`}
                                  >
                                    <Send className="h-4 w-4" />
                                    Post
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {post.comments.length === 0 ? (
                                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
                                    No comments yet. Start the conversation.
                                  </div>
                                ) : (
                                  post.comments.map((comment) => (
                                    <div
                                      key={comment.id}
                                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                                    >
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-950 text-sm font-bold text-white">
                                            {comment.author.charAt(0).toUpperCase()}
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-900">
                                              {comment.author}
                                            </p>
                                            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                              Reader response
                                            </p>
                                          </div>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                          {formatCommentDate(comment.timestamp)}
                                        </p>
                                      </div>
                                      <p className="mt-3 text-sm leading-7 text-slate-600">
                                        {comment.content}
                                      </p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </article>

                      {(index + 1) % 3 === 0 && index < libraryPosts.length - 1 && (
                        <div className="md:col-span-2 xl:col-span-3">
                          <div className="scroll-animate">
                            <InFeedAd />
                          </div>
                        </div>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </section>
          )}

          <div className="mt-12 scroll-animate">
            <DisplayAd className="mx-auto max-w-4xl" />
          </div>

          <section className={`${styles.ctaPanel} mt-14 scroll-animate p-6 sm:p-8`}>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  From article to action
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                  Turn what you just learned into a fix that gets done right.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Our new blog layout is built to educate first. When you are ready, the same team can
                  handle diagnostics, repair, setup, and support.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/book-appointment"
                  className="rounded-full bg-primary-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-900"
                >
                  Book appointment
                </Link>
                <Link
                  href="/learn-more"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
