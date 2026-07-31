'use client'

import {
  Fragment,
  Suspense,
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  BookOpenText,
  Calendar,
  ChevronRight,
  Clock3,
  MessageCircle,
  Play,
  Radio,
  Search,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Tv2,
  User,
  Video,
  Volume2,
  Zap,
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
import newsStyles from '../news.module.css'
import {
  BlogFilter,
  BlogPost,
  formatCommentDate,
  formatLongDate,
  formatShortDate,
  getExcerpt,
  getPostCategory,
  getPrimaryImage,
  getPrimaryVideo,
  getReadingTime,
  hasVideo,
  sortPosts,
  stripHtml,
} from '../blog-utils'

const FILTER_OPTIONS: { key: BlogFilter; label: string }[] = [
  { key: 'all', label: 'Top Stories' },
  { key: 'latest', label: 'Latest' },
  { key: 'popular', label: 'Trending' },
  { key: 'discussed', label: 'Most Discussed' },
]

const TICKER_HEADLINES = [
  'New screen replacement service now available for all Samsung Galaxy models',
  'Free device diagnostics every Saturday – walk-ins welcome at 37 Kissy Road',
  'Battery replacement under 1 hour – book online or call +23233399391',
  'Data recovery service: we recover files from water-damaged and broken devices',
  'Now accepting trade-ins: bring your old device and get credit toward repairs',
]

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '5 Signs Your Device Needs Professional Repair',
    content: `Is your device acting up? Here are the top 5 signs that indicate it's time to bring your device in for professional repair:\n\n1. **Slow Performance** - If your device is significantly slower than usual, it might be a hardware issue.\n\n2. **Battery Draining Fast** - A battery that drains within hours could need replacement.\n\n3. **Screen Issues** - Cracks, dead pixels, or unresponsive touch screens need immediate attention.\n\n4. **Overheating** - Excessive heat can damage internal components.\n\n5. **Strange Noises** - Unusual sounds often indicate hardware problems.\n\nDon't wait until it's too late! Contact us at +23233399391 for a free diagnosis.`,
    author: 'IT Services Freetown',
    date: '2025-10-15',
    likes: 12,
    dislikes: 1,
    comments: [],
  },
  {
    id: '2',
    title: 'How to Protect Your Data Before Repair',
    content: `Before bringing your device for repair, follow these essential steps to protect your data:\n\n**Step 1: Backup Everything**\nUse cloud services or external drives to backup your important files, photos, and documents.\n\n**Step 2: Sign Out of Accounts**\nLog out of all accounts including email, social media, and banking apps.\n\n**Step 3: Remove SIM & Memory Cards**\nTake out your SIM card and any external storage cards.\n\n**Step 4: Note Down Important Information**\nWrite down any passwords or settings you might need later.\n\n**Step 5: Disable Security Features**\nTurn off Find My Device, screen locks, and encryption (you can re-enable after repair).\n\nAt IT Services Freetown, we take your privacy seriously. Visit us at 37 Kissy Road or call +23233399391.`,
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

// ── News Ticker Component ──────────────────────────────────────────────────────
function NewsTicker() {
  const [tickerIndex, setTickerIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_HEADLINES.length)
        setFade(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={newsStyles.ticker}>
      <div className={newsStyles.tickerLabel}>
        <Radio className="h-3.5 w-3.5" />
        <span>LIVE</span>
      </div>
      <div className={newsStyles.tickerDivider} />
      <div className={newsStyles.tickerContent}>
        <p
          className={newsStyles.tickerText}
          style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          {TICKER_HEADLINES[tickerIndex]}
        </p>
      </div>
    </div>
  )
}

// ── Video Preview Card ─────────────────────────────────────────────────────────
function VideoMediaCard({
  post,
  aspectRatio = 'card',
}: {
  post: BlogPost
  aspectRatio?: 'hero' | 'card'
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const imageUrl = getPrimaryImage(post)
  const videoUrl = getPrimaryVideo(post)
  const hasVid = !!videoUrl && !videoError

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (hasVid && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setVideoError(true))
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const heightClass = aspectRatio === 'hero' ? newsStyles.heroMediaHeight : newsStyles.cardMediaHeight

  return (
    <div
      className={`${newsStyles.mediaWrapper} ${heightClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Poster Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={post.title}
          className={`${newsStyles.mediaPoster} ${isHovered ? newsStyles.mediaPosterZoomed : ''}`}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=1000&q=80'
          }}
        />
      ) : (
        <div className={newsStyles.mediaPlaceholder}>
          <BookOpenText className="h-12 w-12 text-white/40" />
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/40">
            {getPostCategory(post)}
          </p>
        </div>
      )}

      {/* Hover Video Overlay */}
      {hasVid && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoError(true)}
          className={`${newsStyles.mediaVideo} ${isHovered && isPlaying ? newsStyles.mediaVideoVisible : ''}`}
        />
      )}

      {/* Video Badge */}
      {hasVid && (
        <div className={newsStyles.videoBadge}>
          <span className={`${newsStyles.liveDot} ${isHovered ? newsStyles.liveDotPing : ''}`} />
          <Video className="h-3 w-3" />
          <span>{isHovered && isPlaying ? 'PLAYING' : 'VIDEO'}</span>
        </div>
      )}

      {/* Play Button */}
      {hasVid && !isPlaying && (
        <div className={newsStyles.playOverlay}>
          <div className={newsStyles.playButton}>
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Playing Indicator */}
      {isHovered && isPlaying && (
        <div className={newsStyles.playingBadge}>
          <Volume2 className="h-3.5 w-3.5 text-red-400" />
          <span>Hover Preview</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className={newsStyles.mediaGradient} />
    </div>
  )
}

// ── Category Badge ─────────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    'Expert Guide': newsStyles.badgeRed,
    'Data Care': newsStyles.badgeBlue,
    'Buying Advice': newsStyles.badgeAmber,
    'Device Tips': newsStyles.badgeGreen,
    'Tech Insight': newsStyles.badgeIndigo,
  }
  const colorClass = colorMap[category] ?? newsStyles.badgeIndigo
  return <span className={`${newsStyles.categoryBadge} ${colorClass}`}>{category}</span>
}

// ── Main Blog Content ──────────────────────────────────────────────────────────
function BlogPageContent() {
  const { isLoading } = usePageLoader()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [commentAuthors, setCommentAuthors] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike' | null>>({})
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<BlogFilter>('all')

  const deferredQuery = useDeferredValue(searchQuery)
  useScrollAnimations()

  // Live clock for the network bar
  useEffect(() => {
    const tick = () => {
      const el = document.getElementById('news-clock')
      if (el) {
        el.textContent = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const query = searchParams
      ? searchParams.get('search') || searchParams.get('tag') || searchParams.get('q')
      : ''
    if (query) setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const githubPosts = await fetchBlogPosts()
        if (githubPosts.length > 0) {
          const publishedPosts = githubPosts.filter((p) => !p.title.startsWith('[DRAFT]'))
          const postsWithComments = await Promise.all(
            publishedPosts.map(async (post) => {
              const comments = await fetchPostComments(parseInt(post.id, 10))
              return {
                ...post,
                comments: comments.map((c) => ({
                  id: c.id.toString(),
                  author: c.author,
                  content: c.content,
                  timestamp: c.timestamp,
                })),
              }
            })
          )
          setPosts(postsWithComments)
          localStorage.setItem('blog_posts', JSON.stringify(postsWithComments))
          return
        }
      } catch (err) {
        console.error('GitHub load failed:', err)
      }
      const saved = localStorage.getItem('blog_posts')
      if (saved) { setPosts(rehydratePosts(JSON.parse(saved))); return }
      setPosts(FALLBACK_POSTS)
      localStorage.setItem('blog_posts', JSON.stringify(FALLBACK_POSTS))
    }
    loadPosts()
    const savedVotes = localStorage.getItem('blog_votes')
    if (savedVotes) setUserVotes(JSON.parse(savedVotes))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash || posts.length === 0) return
    const postId = window.location.hash.replace('#post-', '')
    setTimeout(() => {
      document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }, [posts])

  const handleLike = async (postId: string) => {
    if (userVotes[postId] === 'like') { toast('You already liked this post'); return }
    try {
      const result = await addReaction(parseInt(postId, 10), '+1')
      if (!result.success) { toast.error('Failed to add like'); return }
      const updated = posts.map((p) =>
        p.id !== postId ? p : {
          ...p,
          likes: p.likes + 1,
          dislikes: userVotes[postId] === 'dislike' ? p.dislikes - 1 : p.dislikes,
        }
      )
      const votes = { ...userVotes, [postId]: 'like' as const }
      setUserVotes(votes)
      localStorage.setItem('blog_votes', JSON.stringify(votes))
      setPosts(updated)
      toast.success('Thanks for liking this post!')
    } catch { toast.error('Failed to add like') }
  }

  const handleDislike = async (postId: string) => {
    if (userVotes[postId] === 'dislike') { toast('You already disliked this post'); return }
    try {
      const result = await addReaction(parseInt(postId, 10), '-1')
      if (!result.success) { toast.error('Failed to add dislike'); return }
      const updated = posts.map((p) =>
        p.id !== postId ? p : {
          ...p,
          dislikes: p.dislikes + 1,
          likes: userVotes[postId] === 'like' ? p.likes - 1 : p.likes,
        }
      )
      const votes = { ...userVotes, [postId]: 'dislike' as const }
      setUserVotes(votes)
      localStorage.setItem('blog_votes', JSON.stringify(votes))
      setPosts(updated)
      toast.success('Feedback recorded')
    } catch { toast.error('Failed to add dislike') }
  }

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim()
    const author = commentAuthors[postId]?.trim()
    if (!content || !author) { toast.error('Please enter your name and comment'); return }
    try {
      const result = await addComment(parseInt(postId, 10), content, author)
      if (!result.success) { toast.error('Failed to add comment'); return }
      const comments = await fetchPostComments(parseInt(postId, 10))
      setPosts(posts.map((p) => p.id === postId ? { ...p, comments } : p))
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
      setCommentAuthors((prev) => ({ ...prev, [postId]: '' }))
      toast.success('Comment added!')
    } catch { toast.error('Failed to add comment') }
  }

  const handleShare = async (post: BlogPost) => {
    const url = `${window.location.origin}/blog/${post.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: getExcerpt(post.content, 150), url })
        toast.success('Shared successfully!')
        return
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error(e)
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopiedPostId(post.id)
      toast.success('Article link copied!')
      setTimeout(() => setCopiedPostId(null), 1800)
    } catch { toast.error('Failed to copy link') }
  }

  const toggleComments = (postId: string) =>
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }))

  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const filteredPosts = sortPosts(posts, activeFilter).filter((post) => {
    if (!normalizedQuery) return true
    return [post.title, stripHtml(post.content), post.author, getPostCategory(post)]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  })

  const heroPost = filteredPosts[0]
  const secondPost = filteredPosts[1]
  const thirdPost = filteredPosts[2]
  const gridPosts = filteredPosts.slice(3)
  const sidebarPosts = sortPosts(posts, 'popular').slice(0, 5)
  const trendingPosts = sortPosts(posts, 'popular').slice(0, 3)
  const totalComments = posts.reduce((s, p) => s + p.comments.length, 0)
  const totalReactions = posts.reduce((s, p) => s + p.likes + p.dislikes, 0)

  return (
    <>
      <LoadingOverlay show={isLoading} />

      {/* ── News Channel Shell ── */}
      <div className={newsStyles.channelShell}>

        {/* ── Network Header Bar ── */}
        <div className={newsStyles.networkBar}>
          <div className={newsStyles.networkBarInner}>
            <div className={newsStyles.networkBrand}>
              <Tv2 className="h-5 w-5" />
              <span className={newsStyles.networkName}>IT<span className={newsStyles.networkAccent}>SL</span> NEWS</span>
              <span className={newsStyles.networkTagline}>Sierra Leone's Tech Channel</span>
            </div>
            <div className={newsStyles.networkRight}>
              <span className={newsStyles.liveIndicator}>
                <span className={newsStyles.livePulse} />
                ON AIR
              </span>
              <span className={newsStyles.networkTime} id="news-clock" suppressHydrationWarning />
            </div>
          </div>
        </div>

        {/* ── News Ticker ── */}
        <NewsTicker />

        {/* ── Main Content Area ── */}
        <main className={newsStyles.mainContent}>

          {/* ── Search + Filter Toolbar ── */}
          <div className={newsStyles.toolbar}>
            <div className={newsStyles.toolbarInner}>
              <div className={newsStyles.searchWrap}>
                <Search className={newsStyles.searchIcon} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
                  placeholder="Search tech news, repair guides, device tips…"
                  className={newsStyles.searchInput}
                />
              </div>
              <div className={newsStyles.filterRow}>
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => startTransition(() => setActiveFilter(f.key))}
                    className={`${newsStyles.filterBtn} ${activeFilter === f.key ? newsStyles.filterBtnActive : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={newsStyles.toolbarMeta}>
              <span><strong>{filteredPosts.length}</strong> stories</span>
              <span className={newsStyles.metaDot} />
              <span><strong>{totalReactions}</strong> reader reactions</span>
              <span className={newsStyles.metaDot} />
              <span><strong>{totalComments}</strong> comments</span>
            </div>
          </div>

          {/* ── Ad Banner ── */}
          <div className="mt-4">
            <DisplayAd className="mx-auto max-w-5xl" />
          </div>

          {filteredPosts.length === 0 ? (
            <div className={newsStyles.emptyState}>
              <MessageCircle className="h-14 w-14 text-slate-300 mx-auto" />
              <h2 className="mt-5 text-2xl font-black text-slate-900">No stories match your search</h2>
              <p className="mt-3 text-slate-500">Try a broader keyword or switch back to Top Stories.</p>
              <button
                type="button"
                onClick={() => startTransition(() => { setSearchQuery(''); setActiveFilter('all') })}
                className={newsStyles.resetBtn}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <>
              {/* ── Section Label ── */}
              <div className={newsStyles.sectionLabel}>
                <Zap className="h-4 w-4" />
                <span>Top Stories</span>
              </div>

              {/* ── Hero + Sidebar Layout ── */}
              <div className={newsStyles.heroGrid}>

                {/* Left: Hero Story */}
                {heroPost && (
                  <article className={newsStyles.heroStory} id={`post-${heroPost.id}`}>
                    <div className={newsStyles.heroMediaWrap}>
                      <Link
                        href={`/blog/${heroPost.id}`}
                        aria-label={`Read: ${heroPost.title}`}
                        className={newsStyles.heroMediaLink}
                      />
                      <VideoMediaCard post={heroPost} aspectRatio="hero" />
                      <div className={newsStyles.heroMeta}>
                        <CategoryBadge category={getPostCategory(heroPost)} />
                        {hasVideo(heroPost) && (
                          <span className={newsStyles.videoTag}>
                            <Video className="h-3 w-3" /> VIDEO
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={newsStyles.heroBody}>
                      <Link href={`/blog/${heroPost.id}`} className={newsStyles.heroTitleLink}>
                        <h2 className={newsStyles.heroTitle}>{heroPost.title}</h2>
                      </Link>
                      <p className={newsStyles.heroExcerpt}>{getExcerpt(heroPost.content, 220)}</p>
                      <div className={newsStyles.heroFooter}>
                        <div className={newsStyles.heroByline}>
                          <div className={newsStyles.authorAvatar}>
                            {heroPost.author.charAt(0)}
                          </div>
                          <div>
                            <p className={newsStyles.authorName}>{heroPost.author}</p>
                            <p className={newsStyles.authorMeta}>
                              <Calendar className="h-3 w-3" /> {formatLongDate(heroPost.date)}
                              <span className={newsStyles.metaDot} />
                              <Clock3 className="h-3 w-3" /> {getReadingTime(heroPost.content)} min read
                            </p>
                          </div>
                        </div>
                        <div className={newsStyles.actionRow}>
                          <button
                            type="button"
                            onClick={() => handleLike(heroPost.id)}
                            className={`${newsStyles.actionBtn} ${userVotes[heroPost.id] === 'like' ? newsStyles.actionBtnActive : ''}`}
                            title="Like"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{heroPost.likes}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDislike(heroPost.id)}
                            className={`${newsStyles.actionBtn} ${userVotes[heroPost.id] === 'dislike' ? newsStyles.actionBtnDislike : ''}`}
                            title="Dislike"
                          >
                            <ThumbsDown className="h-4 w-4" />
                            <span>{heroPost.dislikes}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleComments(heroPost.id)}
                            className={newsStyles.actionBtn}
                            title="Comments"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{heroPost.comments.length}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShare(heroPost)}
                            className={newsStyles.actionBtn}
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                            <span>{copiedPostId === heroPost.id ? 'Copied!' : 'Share'}</span>
                          </button>
                          <Link href={`/blog/${heroPost.id}`} className={newsStyles.readMoreBtn}>
                            Read Full Story <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      {/* Hero Comments */}
                      {showComments[heroPost.id] && (
                        <CommentSection
                          post={heroPost}
                          commentInputs={commentInputs}
                          commentAuthors={commentAuthors}
                          setCommentInputs={setCommentInputs}
                          setCommentAuthors={setCommentAuthors}
                          onSubmit={handleAddComment}
                        />
                      )}
                    </div>
                  </article>
                )}

                {/* Right: Sidebar */}
                <aside className={newsStyles.sidebar}>
                  {/* Breaking / Trending */}
                  <div className={newsStyles.sidebarBlock}>
                    <div className={newsStyles.sidebarHeader}>
                      <TrendingUp className="h-4 w-4" />
                      <span>Trending Now</span>
                    </div>
                    {trendingPosts.map((post, i) => (
                      <Link key={post.id} href={`/blog/${post.id}`} className={newsStyles.sidebarItem}>
                        <span className={newsStyles.sidebarRank}>{i + 1}</span>
                        <div className={newsStyles.sidebarItemBody}>
                          <CategoryBadge category={getPostCategory(post)} />
                          <p className={newsStyles.sidebarItemTitle}>{post.title}</p>
                          <p className={newsStyles.sidebarItemMeta}>
                            <Clock3 className="h-3 w-3" /> {getReadingTime(post.content)} min read
                            {hasVideo(post) && (
                              <span className={newsStyles.sidebarVideoTag}>
                                <Video className="h-3 w-3" /> VIDEO
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* CTA Panel */}
                  <div className={newsStyles.sidebarCta}>
                    <p className={newsStyles.sidebarCtaLabel}>Need a repair?</p>
                    <p className={newsStyles.sidebarCtaText}>
                      37 Kissy Road, Freetown · +23233399391
                    </p>
                    <div className={newsStyles.sidebarCtaButtons}>
                      <Link href="/book-appointment" className={newsStyles.ctaBtnPrimary}>
                        Book Appointment
                      </Link>
                      <Link href="/contact" className={newsStyles.ctaBtnSecondary}>
                        Contact Us
                      </Link>
                    </div>
                  </div>

                  {/* Second & Third Stories Compact */}
                  {(secondPost || thirdPost) && (
                    <div className={newsStyles.sidebarBlock}>
                      <div className={newsStyles.sidebarHeader}>
                        <ArrowRight className="h-4 w-4" />
                        <span>More Stories</span>
                      </div>
                      {[secondPost, thirdPost].filter(Boolean).map((post) => (
                        post && (
                          <Link key={post.id} href={`/blog/${post.id}`} className={newsStyles.compactCard}>
                            {getPrimaryImage(post) && (
                              <img
                                src={getPrimaryImage(post)}
                                alt={post.title}
                                className={newsStyles.compactThumb}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            )}
                            <div className={newsStyles.compactBody}>
                              <CategoryBadge category={getPostCategory(post)} />
                              <p className={newsStyles.compactTitle}>{post.title}</p>
                              <p className={newsStyles.compactMeta}>
                                <Clock3 className="h-3 w-3" /> {getReadingTime(post.content)} min
                              </p>
                            </div>
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                </aside>
              </div>

              {/* ── Article Grid ── */}
              {gridPosts.length > 0 && (
                <section className="mt-10">
                  <div className={newsStyles.sectionLabel}>
                    <BookOpenText className="h-4 w-4" />
                    <span>More Tech Stories</span>
                  </div>

                  <div className={newsStyles.articleGrid}>
                    {gridPosts.map((post, index) => {
                      const category = getPostCategory(post)
                      const image = getPrimaryImage(post)
                      const isWide = index % 5 === 0 // every 5th card is wide

                      return (
                        <Fragment key={post.id}>
                          <article
                            id={`post-${post.id}`}
                            className={`${newsStyles.gridCard} ${isWide ? newsStyles.gridCardWide : ''} scroll-animate`}
                          >
                            {/* Media */}
                            <div className={newsStyles.gridCardMedia}>
                              <Link
                                href={`/blog/${post.id}`}
                                aria-label={`Read: ${post.title}`}
                                className={newsStyles.gridCardLink}
                              />
                              <VideoMediaCard post={post} aspectRatio="card" />
                              <div className={newsStyles.gridCardBadges}>
                                <CategoryBadge category={category} />
                                {hasVideo(post) && (
                                  <span className={newsStyles.videoTag}>
                                    <Video className="h-3 w-3" /> VIDEO
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Body */}
                            <div className={newsStyles.gridCardBody}>
                              <div className={newsStyles.gridCardByline}>
                                <span className={newsStyles.gridCardAuthor}>
                                  <User className="h-3 w-3" /> {post.author}
                                </span>
                                <span className={newsStyles.gridCardDate}>
                                  <Calendar className="h-3 w-3" /> {formatShortDate(post.date)}
                                </span>
                              </div>

                              <Link href={`/blog/${post.id}`}>
                                <h3 className={newsStyles.gridCardTitle}>{post.title}</h3>
                              </Link>

                              <p className={newsStyles.gridCardExcerpt}>
                                {getExcerpt(post.content, isWide ? 180 : 110)}
                              </p>

                              <div className={newsStyles.gridCardFooter}>
                                <Link href={`/blog/${post.id}`} className={newsStyles.gridReadMore}>
                                  Read more <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                                <div className={newsStyles.gridActions}>
                                  <button
                                    type="button"
                                    onClick={() => handleLike(post.id)}
                                    className={`${newsStyles.gridActionBtn} ${userVotes[post.id] === 'like' ? newsStyles.gridActionActive : ''}`}
                                  >
                                    <ThumbsUp className="h-3.5 w-3.5" />
                                    <span>{post.likes}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDislike(post.id)}
                                    className={`${newsStyles.gridActionBtn} ${userVotes[post.id] === 'dislike' ? newsStyles.gridActionDislike : ''}`}
                                  >
                                    <ThumbsDown className="h-3.5 w-3.5" />
                                    <span>{post.dislikes}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleComments(post.id)}
                                    className={newsStyles.gridActionBtn}
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    <span>{post.comments.length}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleShare(post)}
                                    className={newsStyles.gridActionBtn}
                                  >
                                    <Share2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Comments */}
                            {showComments[post.id] && (
                              <CommentSection
                                post={post}
                                commentInputs={commentInputs}
                                commentAuthors={commentAuthors}
                                setCommentInputs={setCommentInputs}
                                setCommentAuthors={setCommentAuthors}
                                onSubmit={handleAddComment}
                              />
                            )}
                          </article>

                          {(index + 1) % 4 === 0 && index < gridPosts.length - 1 && (
                            <div className="col-span-full">
                              <InFeedAd />
                            </div>
                          )}
                        </Fragment>
                      )
                    })}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── Ad ── */}
          <div className="mt-12">
            <DisplayAd className="mx-auto max-w-5xl" />
          </div>

          {/* ── CTA Footer ── */}
          <div className={newsStyles.ctaFooter}>
            <div className={newsStyles.ctaFooterInner}>
              <div>
                <p className={newsStyles.ctaFooterLabel}>From Article to Action</p>
                <h2 className={newsStyles.ctaFooterTitle}>
                  Turn what you just read into a fix that gets done right.
                </h2>
                <p className={newsStyles.ctaFooterText}>
                  Our team handles diagnostics, repair, setup, and support — right here in Freetown.
                </p>
              </div>
              <div className={newsStyles.ctaFooterButtons}>
                <Link href="/book-appointment" className={newsStyles.ctaBtnPrimary}>
                  Book Appointment
                </Link>
                <Link href="/learn-more" className={newsStyles.ctaBtnSecondaryDark}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

// ── Comment Section ────────────────────────────────────────────────────────────
function CommentSection({
  post,
  commentInputs,
  commentAuthors,
  setCommentInputs,
  setCommentAuthors,
  onSubmit,
}: {
  post: BlogPost
  commentInputs: Record<string, string>
  commentAuthors: Record<string, string>
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setCommentAuthors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  onSubmit: (postId: string) => void
}) {
  return (
    <div className={newsStyles.commentSection}>
      <p className={newsStyles.commentTitle}>
        <MessageCircle className="h-4 w-4" />
        Reader Comments ({post.comments.length})
      </p>

      <div className={newsStyles.commentForm}>
        <input
          type="text"
          placeholder="Your name"
          value={commentAuthors[post.id] || ''}
          onChange={(e) => setCommentAuthors((p) => ({ ...p, [post.id]: e.target.value }))}
          className={newsStyles.commentInput}
        />
        <div className={newsStyles.commentRow}>
          <textarea
            placeholder="Share your thoughts…"
            value={commentInputs[post.id] || ''}
            onChange={(e) => setCommentInputs((p) => ({ ...p, [post.id]: e.target.value }))}
            onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') onSubmit(post.id) }}
            rows={3}
            className={`${newsStyles.commentInput} resize-y min-h-[6rem]`}
          />
          <button
            type="button"
            onClick={() => onSubmit(post.id)}
            className={newsStyles.commentSubmit}
          >
            <Send className="h-4 w-4" />
            Post
          </button>
        </div>
      </div>

      <div className={newsStyles.commentList}>
        {post.comments.length === 0 ? (
          <div className={newsStyles.noComments}>No comments yet. Start the conversation.</div>
        ) : (
          post.comments.map((c) => (
            <div key={c.id} className={newsStyles.commentItem}>
              <div className={newsStyles.commentAvatar}>{c.author.charAt(0).toUpperCase()}</div>
              <div className={newsStyles.commentBody}>
                <div className={newsStyles.commentHeader}>
                  <span className={newsStyles.commentAuthor}>{c.author}</span>
                  <span className={newsStyles.commentTime}>{formatCommentDate(c.timestamp)}</span>
                </div>
                <p className={newsStyles.commentContent}>{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <BlogPageContent />
    </Suspense>
  )
}
