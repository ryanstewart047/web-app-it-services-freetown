export interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
}

export interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  caption?: string
}

export interface BlogPost {
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

export type BlogFilter = 'all' | 'latest' | 'popular' | 'discussed'

export function stripHtml(content: string) {
  return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function getExcerpt(content: string, maxLength = 180) {
  const plainText = stripHtml(content)

  if (plainText.length <= maxLength) {
    return plainText
  }

  return `${plainText.slice(0, maxLength).trim()}...`
}

export function getReadingTime(content: string) {
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(wordCount / 220))
}

export function formatLongDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatCommentDate(date: Date) {
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

export function getPrimaryImage(post: Pick<BlogPost, 'image' | 'media'>) {
  return post.image || post.media?.find((item) => item.type === 'image')?.url
}

export function getPostCategory(post: Pick<BlogPost, 'title' | 'content'>) {
  const haystack = `${post.title} ${stripHtml(post.content)}`.toLowerCase()

  if (/(repair|replace|fix|broken|screen|battery)/.test(haystack)) {
    return 'Repair Guide'
  }

  if (/(backup|data|privacy|security|protect|password)/.test(haystack)) {
    return 'Data Care'
  }

  if (/(best|top|buy|choose|compare|review)/.test(haystack)) {
    return 'Buying Advice'
  }

  if (/(iphone|android|laptop|computer|mobile|device)/.test(haystack)) {
    return 'Device Tips'
  }

  return 'Tech Insight'
}

export function sortPosts(posts: BlogPost[], filter: BlogFilter) {
  const rankedPosts = [...posts]

  if (filter === 'latest' || filter === 'all') {
    return rankedPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  if (filter === 'popular') {
    return rankedPosts.sort((a, b) => {
      const scoreA = a.likes * 2 + a.comments.length - a.dislikes
      const scoreB = b.likes * 2 + b.comments.length - b.dislikes
      return scoreB - scoreA
    })
  }

  return rankedPosts.sort((a, b) => b.comments.length - a.comments.length)
}
