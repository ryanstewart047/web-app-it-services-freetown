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

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  ndash: '–',
  mdash: '—',
  hellip: '…',
}

/** Decode common named and numeric HTML entities into plain text characters. */
export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    const lower = entity.toLowerCase()
    if (lower.startsWith('#x')) {
      const codePoint = Number.parseInt(lower.slice(2), 16)
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }
    if (lower.startsWith('#')) {
      const codePoint = Number.parseInt(lower.slice(1), 10)
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match
    }
    return NAMED_HTML_ENTITIES[lower] ?? match
  })
}

export function stripHtml(content: string) {
  return decodeHtmlEntities(content.replace(/<[^>]*>?/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Derive a clean, publication-safe subject title from an AI prompt or explicit topic title.
 * Strips prompt imperatives ("Write a practical...", "Investigate and write...", source instructions)
 * so raw editorial prompts never leak into published articles, summaries, or captions.
 */
export function cleanPromptSubject(
  rawPrompt: string,
  explicitTitle?: string,
  matchedTitle?: string
): string {
  const promptVerbPattern =
    /^(?:please\s+)?(?:investigate(?:\s+and\s+write)?|write|create|draft|generate|compose|produce|prepare)\s+(?:a|an|the)?\s*(?:[^:.?!\n]{0,80}?\b(?:blog\s+post|blog\s+article|feature(?:\s+story|\s+article)?|article|story|guide|advisory|report|post|briefing|analysis)\b)\s*(?:about|on|regarding|detailing|explaining|covering|discussing|analyzing|examining|for|:)?\s*/i

  const editorialTrailingSentencePattern =
    /\.\s+(?:analyze|discuss|cover|explain|detail|outline|highlight|incorporate|provide|include|cite|offer)\b[\s\S]*$/i

  const sanitizeCandidate = (input?: string): string => {
    if (!input) return ''
    let cleaned = stripHtml(input)
      .replace(/\(Source:[\s\S]*?\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    cleaned = cleaned.replace(promptVerbPattern, '').trim()
    cleaned = cleaned.replace(editorialTrailingSentencePattern, '').trim()
    cleaned = cleaned.replace(/^["'“”‘’]+|["'“”‘’.]+$/g, '').trim()
    if (!cleaned) return ''
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  }

  const fromExplicit = sanitizeCandidate(explicitTitle)
  if (fromExplicit.length >= 6) return fromExplicit.slice(0, 180)

  const fromMatched = sanitizeCandidate(matchedTitle)
  if (fromMatched.length >= 6) return fromMatched.slice(0, 180)

  const fromPrompt = sanitizeCandidate(rawPrompt)
  if (fromPrompt.length >= 6) return fromPrompt.slice(0, 180)

  return 'Sierra Leone Technology & Digital Infrastructure Update'
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

export function getPrimaryImage(post: Partial<BlogPost>) {
  if (post.image) {
    if (post.image.startsWith('/')) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
      return `${baseUrl}${post.image}`
    }
    return post.image
  }
  
  const mediaImage = post.media?.find((item) => item.type === 'image')?.url
  if (mediaImage) {
    if (mediaImage.startsWith('/')) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
      return `${baseUrl}${mediaImage}`
    }
    return mediaImage
  }

  if (post.content) {
    // Improved regex to handle different quote types and attribute orders
    const imgMatch = post.content.match(/<img[^>]+src=["']([^"']+)["']/i) || 
                     post.content.match(/<img[^>]+src=([^>\s]+)/i)
    
    if (imgMatch && imgMatch[1]) {
      let imageUrl = imgMatch[1]
      
      // If it's a relative path, make it absolute
      if (imageUrl.startsWith('/')) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
        return `${baseUrl}${imageUrl}`
      }
      
      return imageUrl
    }
  }
  
  return undefined
}

export function getVideoEmbed(url: string): { type: 'iframe' | 'video'; src: string } {
  if (!url) return { type: 'video', src: '' }
  // YouTube: watch?v=, youtu.be/, shorts/, embed/
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` }
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }
  // Facebook
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return {
      type: 'iframe',
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=0`,
    }
  }
  // Direct file (mp4, webm, mov, etc.)
  return { type: 'video', src: url }
}

export function getPrimaryVideo(post: Partial<BlogPost>): string | undefined {
  const mediaVideo = post.media?.find((item) => item.type === 'video')?.url
  if (mediaVideo) {
    if (mediaVideo.startsWith('/')) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
      return `${baseUrl}${mediaVideo}`
    }
    return mediaVideo
  }

  if (post.content) {
    const videoMatch = post.content.match(/<video[^>]+src=["']([^"']+)["']/i) || 
                       post.content.match(/<source[^>]+src=["']([^"']+)["']/i) ||
                       post.content.match(/<iframe[^>]+src=["']([^"']+)["']/i) ||
                       post.content.match(/(https?:\/\/[^\s"'<>]+\.(?:mp4|webm|mov))/i) ||
                       post.content.match(/(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\s"'<>]+)/i)
    
    if (videoMatch && videoMatch[1]) {
      let videoUrl = videoMatch[1]
      if (videoUrl.startsWith('/')) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
        return `${baseUrl}${videoUrl}`
      }
      return videoUrl
    }
  }

  return undefined
}

export function hasVideo(post: Partial<BlogPost>): boolean {
  return !!getPrimaryVideo(post)
}

export function getPostCategory(post: Pick<BlogPost, 'title' | 'content'>) {
  const haystack = `${post.title} ${stripHtml(post.content)}`.toLowerCase()

  if (/(repair|replace|fix|broken|screen|battery)/.test(haystack)) {
    return 'Expert Guide'
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
