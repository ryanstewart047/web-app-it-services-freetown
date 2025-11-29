import { Metadata } from 'next'
import { fetchBlogPosts } from '@/lib/github-blog-storage'
import BlogPostRedirect from './BlogPostRedirect'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Fetch the specific blog post
    const posts = await fetchBlogPosts()
    const post = posts.find(p => p.id === params.id)
    
    if (!post) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.'
      }
    }
    
    // Get first image from media or fallback
    const shareImage = post.media?.find(m => m.type === 'image')?.url || post.image
    const contentPreview = post.content.replace(/<[^>]*>/g, '').substring(0, 200)
    
    // Create OG image URL
    const ogImageUrl = new URL('/api/og-blog', 'https://itservicesfreetown.com')
    ogImageUrl.searchParams.set('title', post.title)
    ogImageUrl.searchParams.set('author', post.author)
    ogImageUrl.searchParams.set('date', new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
    ogImageUrl.searchParams.set('excerpt', contentPreview)
    ogImageUrl.searchParams.set('likes', post.likes.toString())
    if (shareImage) {
      ogImageUrl.searchParams.set('image', shareImage)
    }
    
    return {
      title: post.title,
      description: contentPreview,
      openGraph: {
        type: 'article',
        title: post.title,
        description: contentPreview,
        url: `https://itservicesfreetown.com/blog/${params.id}`,
        siteName: 'IT Services Freetown',
        images: [
          {
            url: ogImageUrl.toString(),
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ],
        publishedTime: post.date,
        authors: [post.author],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: contentPreview,
        images: [ogImageUrl.toString()],
      },
    }
  } catch (error) {
    console.error('Error generating blog post metadata:', error)
    return {
      title: 'Blog Post',
      description: 'Read our latest tech tips and insights.'
    }
  }
}

export default function BlogPostPage({ params }: Props) {
  return <BlogPostRedirect params={params} />
}
