import { Metadata } from 'next'
import { fetchBlogPosts } from '@/lib/github-blog-storage'
import Link from 'next/link'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import PageBanner from '@/components/PageBanner'

type Props = {
  params: { id: string }
}

// Pre-generate all known blog post paths at build time so Google can crawl them
export async function generateStaticParams() {
  try {
    const posts = await fetchBlogPosts()
    return posts.map((post) => ({ id: post.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const posts = await fetchBlogPosts()
    const post = posts.find(p => p.id === params.id)
    
    if (!post) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.',
        robots: { index: false },
      }
    }
    
    const shareImage = post.media?.find(m => m.type === 'image')?.url
    const contentPreview = post.content.replace(/<[^>]*>/g, '').substring(0, 200)
    const canonicalUrl = `https://www.itservicesfreetown.com/blog/${params.id}`
    
    const ogImageUrl = new URL('/api/og-blog', 'https://www.itservicesfreetown.com')
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
      // Self-referencing canonical — critical for indexing
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        type: 'article',
        title: post.title,
        description: contentPreview,
        url: canonicalUrl,
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
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-snippet': -1,
          'max-image-preview': 'large',
        },
      },
    }
  } catch (error) {
    console.error('Error generating blog post metadata:', error)
    return {
      title: 'Blog Post',
      description: 'Read our latest tech tips and insights from IT Services Freetown.',
    }
  }
}

import { DisplayAd, InArticleAd, MultiplexAd } from '@/components/AdSense'

export default async function BlogPostPage({ params }: Props) {
  const posts = await fetchBlogPosts();
  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col pt-20 pb-12 px-6">
        <div className="max-w-md mx-auto text-center p-12 bg-white rounded-3xl shadow-lg border border-gray-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">Post Not Found</h1>
          <p className="text-gray-500 mb-8">The article you're looking for was either moved or doesn't exist.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const dateStr = new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PageBanner
        title={post.title}
        subtitle="Insights & Updates"
        icon="fas fa-file-alt"
      />
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold mb-8 transition-transform transform hover:-translate-x-1">
          <ArrowLeft className="w-5 h-5" />
          Back to all posts
        </Link>
        
        {/* Top Ad */}
        <div className="mb-8">
          <DisplayAd />
        </div>

        <article className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12">
          {/* Structured Data for the article */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.content.replace(/<[^>]*>/g, '').substring(0, 200),
                author: {
                  '@type': 'Person',
                  name: post.author,
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'IT Services Freetown',
                  url: 'https://www.itservicesfreetown.com',
                },
                datePublished: post.date,
                dateModified: post.date,
                url: `https://www.itservicesfreetown.com/blog/${params.id}`,
                mainEntityOfPage: {
                  '@type': 'WebPage',
                  '@id': `https://www.itservicesfreetown.com/blog/${params.id}`,
                },
              }),
            }}
          />

          {/* Header */}
          <header className="mb-10 border-b border-gray-100 pb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 text-lg">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{dateStr}</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                <User className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">{post.author}</span>
              </div>
            </div>
          </header>
          
          {/* In-Article Ad */}
          <div className="mb-10">
            <InArticleAd />
          </div>

          {/* Main Content */}
          <div 
            className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed" 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
          {/* Media Attachments */}
          {post.media && post.media.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-slate-800">Media Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {post.media.map((item, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden shadow-md group">
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.caption || 'Post image'} className="w-full h-auto object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <video src={item.url} controls className="w-full h-auto" />
                    )}
                    {item.caption && <p className="p-4 bg-gray-50 font-medium text-gray-600 italic text-center text-sm">{item.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Bottom Ad */}
        <div className="mt-12">
          <MultiplexAd />
        </div>
      </main>
    </div>
  );
}
