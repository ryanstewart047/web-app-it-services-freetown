import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpenText,
  Calendar,
  Clock3,
  ThumbsDown,
  ThumbsUp,
  User,
} from 'lucide-react'
import { fetchBlogPosts } from '@/lib/github-blog-storage'
import { DisplayAd, InArticleAd, MultiplexAd } from '@/components/AdSense'
import styles from '../blog.module.css'
import {
  formatLongDate,
  getExcerpt,
  getPostCategory,
  getPrimaryImage,
  getReadingTime,
} from '../blog-utils'

type Props = {
  params: { id: string }
}

function getTagClass(category: string) {
  if (category === 'Expert Guide') return styles.tagRepair
  if (category === 'Data Care') return styles.tagData
  if (category === 'Buying Advice') return styles.tagBuyer
  if (category === 'Device Tips') return styles.tagDevice
  return styles.tagInsight
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
    const post = posts.find((entry) => entry.id === params.id)

    if (!post) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.',
        robots: { index: false },
      }
    }

    const shareImage = getPrimaryImage(post)
    const contentPreview = getExcerpt(post.content, 200)
    const canonicalUrl = `https://www.itservicesfreetown.com/blog/${params.id}`

    const ogImageUrl = new URL('/api/og-blog', 'https://www.itservicesfreetown.com')
    ogImageUrl.searchParams.set('title', post.title)
    ogImageUrl.searchParams.set('author', post.author)
    ogImageUrl.searchParams.set('date', formatLongDate(post.date))
    ogImageUrl.searchParams.set('excerpt', contentPreview)
    ogImageUrl.searchParams.set('likes', post.likes.toString())
    if (shareImage) {
      ogImageUrl.searchParams.set('image', shareImage)
    }

    return {
      title: post.title,
      description: contentPreview,
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
          },
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

export default async function BlogPostPage({ params }: Props) {
  const posts = await fetchBlogPosts()
  const post = posts.find((entry) => entry.id === params.id)

  if (!post) {
    return (
      <div className={styles.pageShell}>
        <div className={styles.meshOrbOne} />
        <div className={styles.meshOrbTwo} />
        <main className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className={`${styles.emptyState} w-full max-w-xl px-6 py-14 text-center sm:px-10`}>
            <BookOpenText className="mx-auto h-14 w-14 text-primary-950/70" />
            <h1 className="mt-5 text-4xl font-black text-slate-900">Post not found</h1>
            <p className="mt-4 text-slate-600">
              The article you were looking for may have been moved or is no longer available.
            </p>
            <Link
              href="/blog"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to the blog
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const publishedDate = formatLongDate(post.date)
  const readingTime = getReadingTime(post.content)
  const category = getPostCategory(post)
  const heroImage = getPrimaryImage(post)
  const leadExcerpt = getExcerpt(post.content, 240)
  const mediaAttachments = (post.media || []).filter(
    (item, index) => item.url !== heroImage || index !== 0
  )

  return (
    <div className={styles.pageShell}>
      <div className={styles.meshOrbOne} />
      <div className={styles.meshOrbTwo} />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className={`${styles.backPanel} inline-flex p-1`}>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to the journal
          </Link>
        </div>

        <section className={`${styles.articleHero} mt-6 p-6 sm:p-8 lg:p-10`}>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`${styles.tagBase} ${getTagClass(category)}`}>
                  {category}
                </span>
                <span className={`${styles.metaChip} text-xs font-semibold`}>
                  <Clock3 className="h-3.5 w-3.5" />
                  {readingTime} min read
                </span>
              </div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                IT Services Freetown Blog
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
                {post.title}
              </h1>
              <p className={`${styles.articleLead} mt-6 text-base leading-8 sm:text-lg`}>
                {leadExcerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className={`${styles.metaChip} text-sm font-semibold`}>
                  <Calendar className="h-4 w-4" />
                  {publishedDate}
                </span>
                <span className={`${styles.metaChip} text-sm font-semibold`}>
                  <User className="h-4 w-4" />
                  {post.author}
                </span>
              </div>
            </div>

            <div className={styles.articleHeroMedia}>
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={post.title}
                  className="h-full min-h-[20rem] w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[20rem] items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-8 text-center">
                  <div>
                    <BookOpenText className="mx-auto h-14 w-14 text-primary-950/70" />
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Article spotlight
                    </p>
                    <p className="mt-2 text-slate-600">
                      Read the full breakdown below.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8">
          <DisplayAd />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className={styles.articleSidebarSticky}>
            <div className={`${styles.articleSidebarCard} p-5`}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quick facts
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Published
                  </p>
                  <p className="mt-2 font-bold text-slate-900">{publishedDate}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Reading time
                  </p>
                  <p className="mt-2 font-bold text-slate-900">{readingTime} minutes</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Likes
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 font-bold text-slate-900">
                      <ThumbsUp className="h-4 w-4 text-blue-600" />
                      {post.likes}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Dislikes
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 font-bold text-slate-900">
                      <ThumbsDown className="h-4 w-4 text-orange-600" />
                      {post.dislikes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-primary-950 p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-100">
                  Need help with this issue?
                </p>
                <p className="mt-3 text-sm leading-7 text-blue-50/90">
                  Use this article as context, then book a repair or message the team for direct support.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/book-appointment"
                    className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-primary-950 transition hover:bg-red-50"
                  >
                    Book appointment
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-white/20 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Contact support
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <article className={`${styles.articleContentCard} p-6 sm:p-8 lg:p-10`}>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'BlogPosting',
                  headline: post.title,
                  description: leadExcerpt,
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

            <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 px-5 py-4 text-sm leading-7 text-slate-600">
              This article is part of the IT Services Freetown knowledge library, designed to make
              repair decisions clearer before you spend time or money.
            </div>

            <div className="my-8">
              <InArticleAd />
            </div>

            <div
              className={`${styles.articleProse} prose prose-lg max-w-none`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {mediaAttachments.length > 0 && (
              <section className="mt-12 border-t border-slate-100 pt-8">
                <div className="mb-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Supporting media
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    Images and video from this article
                  </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {mediaAttachments.map((item, index) => (
                    <div key={`${item.url}-${index}`} className={styles.attachmentCard}>
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.caption || 'Article media'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video src={item.url} controls className="h-full w-full" />
                      )}
                      {item.caption && (
                        <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>

        <div className="mt-12">
          <MultiplexAd />
        </div>

        <section className={`${styles.ctaPanel} mt-12 p-6 sm:p-8`}>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Keep reading or get help
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
                Continue exploring the library, or let our team solve the problem for you.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                The redesigned article view is built for careful reading, but it also keeps the next
                action close when you are ready for real support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/blog"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Back to articles
              </Link>
              <Link
                href="/book-appointment"
                className="rounded-full bg-primary-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-900"
              >
                Book support
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
