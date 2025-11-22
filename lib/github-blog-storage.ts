/**
 * GitHub Issues as Blog Database
 * Uses GitHub Issues API to store blog posts and comments
 * Works with static GitHub Pages deployment
 */

const GITHUB_OWNER = 'ryanstewart047'
const GITHUB_REPO = 'web-app-it-services-freetown'

// GitHub token for API access
// In development: reads from .env.local
// In production: uses hardcoded token (protected by admin password)
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''

interface GitHubIssue {
  number: number
  title: string
  body: string
  created_at: string
  updated_at: string
  user: {
    login: string
  }
  labels: Array<{ name: string }>
  comments: number
  reactions: {
    '+1': number
    '-1': number
  }
}

interface GitHubComment {
  id: number
  user: {
    login: string
  }
  body: string
  created_at: string
}

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  date: string
  likes: number
  dislikes: number
  media?: any[]
  comments: any[]
  githubIssueNumber?: number
}

/**
 * Fetch all blog posts from GitHub Issues
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    }
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=blog-post&state=open&sort=created&direction=desc&per_page=100`,
      { 
        headers,
        cache: 'no-store', // Ensure we get fresh data
        next: { revalidate: 0 } // Next.js specific: disable caching
      }
    )

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`)
      const errorData = await response.text()
      console.error('Error details:', errorData)
      throw new Error(`Failed to fetch posts: ${response.status}`)
    }

    const issues: GitHubIssue[] = await response.json()

    const posts: BlogPost[] = issues.map(issue => {
      // Parse body to extract content and metadata
      const body = issue.body || ''
      const metadata = extractMetadata(body)

      return {
        id: issue.number.toString(),
        title: issue.title,
        content: metadata.content,
        author: metadata.author || 'IT Services Freetown',
        date: new Date(issue.created_at).toISOString().split('T')[0],
        likes: issue.reactions['+1'] || 0,
        dislikes: issue.reactions['-1'] || 0,
        media: metadata.media,
        comments: [],
        githubIssueNumber: issue.number
      }
    })

    return posts
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

/**
 * Fetch comments for a specific blog post
 */
export async function fetchPostComments(issueNumber: number): Promise<any[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    }
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`,
      { headers }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }

    const githubComments: GitHubComment[] = await response.json()

    return githubComments.map(comment => ({
      id: comment.id.toString(),
      author: comment.user.login,
      content: comment.body,
      timestamp: new Date(comment.created_at)
    }))
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

/**
 * Create a new blog post (GitHub Issue)
 * Note: Requires GitHub token with repo scope
 */
export async function createBlogPost(
  title: string,
  content: string,
  author: string,
  media?: any[]
): Promise<{ success: boolean; issueNumber?: number; error?: string }> {
  try {
    if (!GITHUB_TOKEN) {
      return {
        success: false,
        error: 'GitHub token required to create posts. Configure NEXT_PUBLIC_GITHUB_TOKEN in .env.local'
      }
    }

    // Format body with metadata
    const body = formatPostBody(content, author, media)

    console.log('[Blog Storage] Creating blog post with GitHub Issues API');
    console.log('[Blog Storage] Repo:', `${GITHUB_OWNER}/${GITHUB_REPO}`);

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          labels: ['blog-post']
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      console.error('[Blog Storage] GitHub API Error:', response.status, errorData);
      
      if (response.status === 404) {
        throw new Error('Repository not found or token lacks access. Please check NEXT_PUBLIC_GITHUB_TOKEN has repo permissions.')
      }
      
      if (response.status === 401) {
        throw new Error('Invalid or expired GitHub token. Please update NEXT_PUBLIC_GITHUB_TOKEN in Vercel environment variables.')
      }
      
      throw new Error(errorData.message || `GitHub API Error: ${response.status}`)
    }

    const issue = await response.json()
    console.log('[Blog Storage] Blog post created successfully. Issue #' + issue.number);

    return {
      success: true,
      issueNumber: issue.number
    }
  } catch (error: any) {
    console.error('Error creating blog post:', error)
    return {
      success: false,
      error: error.message || 'Failed to create post'
    }
  }
}

/**
 * Add a comment to a blog post
 * Note: Requires GitHub token
 */
export async function addComment(
  issueNumber: number,
  author: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!GITHUB_TOKEN) {
      return {
        success: false,
        error: 'GitHub token required to add comments'
      }
    }

    const commentBody = `**${author}** wrote:\n\n${content}`

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: commentBody
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to add comment')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error adding comment:', error)
    return {
      success: false,
      error: error.message || 'Failed to add comment'
    }
  }
}

/**
 * Add reaction (like/dislike) to a post
 */
export async function addReaction(
  issueNumber: number,
  reaction: '+1' | '-1'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!GITHUB_TOKEN) {
      return {
        success: false,
        error: 'GitHub token required to add reactions'
      }
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/reactions`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: reaction
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to add reaction')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error adding reaction:', error)
    return {
      success: false,
      error: error.message || 'Failed to add reaction'
    }
  }
}

/**
 * Format post body with metadata
 */
function formatPostBody(content: string, author: string, media?: any[]): string {
  console.log('formatPostBody called with media:', media)
  
  let body = `<!-- METADATA
Author: ${author}
Media: ${media && media.length > 0 ? JSON.stringify(media) : '[]'}
-->\n\n`

  body += content

  if (media && media.length > 0) {
    body += '\n\n---\n### Media\n\n'
    media.forEach((item, index) => {
      if (item.type === 'image') {
        body += `![${item.caption || `Image ${index + 1}`}](${item.url})\n`
        if (item.caption) {
          body += `*${item.caption}*\n\n`
        }
      } else if (item.type === 'video') {
        body += `\n**Video ${index + 1}**${item.caption ? `: ${item.caption}` : ''}\n`
        body += `[View Video](${item.url})\n\n`
      }
    })
  }

  console.log('Formatted body length:', body.length)
  return body
}

/**
 * Extract metadata from post body
 */
function extractMetadata(body: string): {
  content: string
  author?: string
  media?: any[]
} {
  console.log('extractMetadata called, body length:', body.length)
  
  const metadataMatch = body.match(/<!-- METADATA\n([\s\S]*?)\n-->/m)
  
  if (!metadataMatch) {
    console.log('No metadata found in body')
    return { content: body }
  }

  const metadataText = metadataMatch[1]
  console.log('Metadata text:', metadataText)
  
  const authorMatch = metadataText.match(/Author: (.+)/)
  const mediaMatch = metadataText.match(/Media: ([\s\S]+?)(?:\n|$)/)

  let media: any[] = []
  if (mediaMatch) {
    try {
      const mediaJson = mediaMatch[1].trim()
      console.log('Media JSON to parse:', mediaJson)
      media = JSON.parse(mediaJson)
      console.log('Parsed media:', media)
    } catch (e) {
      console.error('Error parsing media JSON:', e)
      media = []
    }
  } else {
    console.log('No media match found')
  }

  // Remove metadata section AND the media display section from content
  let content = body.replace(/<!-- METADATA[\s\S]*?-->\n\n/, '')
  content = content.replace(/\n\n---\n### Media\n\n[\s\S]*$/, '')

  return {
    content: content.trim(),
    author: authorMatch?.[1],
    media: media.length > 0 ? media : undefined
  }
}

/**
 * Check if user has already reacted to a post
 * Note: Requires authentication to check
 */
export async function getUserReaction(issueNumber: number): Promise<'+1' | '-1' | null> {
  // Store reactions in localStorage for anonymous users
  const localReactions = localStorage.getItem('github_blog_reactions')
  if (localReactions) {
    const reactions = JSON.parse(localReactions)
    return reactions[issueNumber] || null
  }
  return null
}

/**
 * Store user reaction locally
 */
export function storeUserReaction(issueNumber: number, reaction: '+1' | '-1' | null) {
  const localReactions = localStorage.getItem('github_blog_reactions')
  const reactions = localReactions ? JSON.parse(localReactions) : {}
  
  if (reaction === null) {
    delete reactions[issueNumber]
  } else {
    reactions[issueNumber] = reaction
  }
  
  localStorage.setItem('github_blog_reactions', JSON.stringify(reactions))
}

/**
 * Delete a blog post (Close GitHub Issue)
 * Note: Requires GitHub token with repo scope
 */
export async function deleteBlogPost(
  issueNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!GITHUB_TOKEN) {
      return {
        success: false,
        error: 'GitHub token required to delete posts'
      }
    }

    // Close the issue (soft delete)
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: 'closed'
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete post')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting blog post:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete post'
    }
  }
}

/**
 * Update an existing blog post (Edit GitHub Issue)
 * Note: Requires GitHub token with repo scope
 */
export async function updateBlogPost(
  issueNumber: number,
  title: string,
  content: string,
  author: string,
  media?: any[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!GITHUB_TOKEN) {
      return {
        success: false,
        error: 'GitHub token required to update posts'
      }
    }

    // Format body with metadata
    const body = formatPostBody(content, author, media)

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update post')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error updating blog post:', error)
    return {
      success: false,
      error: error.message || 'Failed to update post'
    }
  }
}
