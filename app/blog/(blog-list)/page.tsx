import { fetchPublishedBlogPosts, fetchPostComments } from '@/lib/github-blog-storage'
import BlogNewsClient from './BlogNewsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Re-fetch published blog posts every 60s for Googlebot & visitors

export default async function BlogPage() {
  let postsWithComments: any[] = []

  try {
    const publishedPosts = await fetchPublishedBlogPosts()
    postsWithComments = await Promise.all(
      publishedPosts.map(async (post) => {
        try {
          const comments = await fetchPostComments(parseInt(post.id, 10))
          return {
            ...post,
            comments: comments.map((c) => ({
              id: c.id.toString(),
              author: c.author,
              content: c.content,
              timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp,
            })),
          }
        } catch {
          return post
        }
      })
    )
  } catch (err) {
    console.error('[Blog Page SSR] Error loading published posts:', err)
  }

  return <BlogNewsClient initialPosts={postsWithComments} />
}
