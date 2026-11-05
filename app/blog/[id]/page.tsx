import { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Calendar,
  Clock3,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
} from 'lucide-react'
import { fetchBlogPosts, fetchPostComments } from '@/lib/github-blog-storage'
import { DisplayAd, InArticleAd, MultiplexAd } from '@/components/AdSense'
import ArticleInteractions from './ArticleInteractions'
import styles from '../blog.module.css'
import {
  formatLongDate,
  getExcerpt,
  getPostCategory,
  getPrimaryImage,
  getPrimaryVideo,
  getVideoEmbed,
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

    const contentPreview = getExcerpt(post.content, 200)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
    const canonicalUrl = `${baseUrl}/blog/${params.id}`

    // Direct image URL for OG preview (prevents Vercel serverless image rendering origin transfer)
    const primaryImg = getPrimaryImage(post);
    let blogImage = primaryImg || `${baseUrl}/assets/images/slide01.jpg`;
    if (blogImage.startsWith('/')) blogImage = `${baseUrl}${blogImage}`;
    if (blogImage.includes('github.com') && blogImage.includes('/blob/')) {
      blogImage = blogImage
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')
        .replace('/blob/', '/')
        .replace(/[?&]raw=true/, '');
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
        siteName: 'BridgeTech IT Services',
        images: [
          {
            url: blogImage,
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
        images: [blogImage],
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
      description: 'Read our latest tech tips and insights from BridgeTech IT Services.',
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

  const comments = await fetchPostComments(parseInt(post.id, 10))

  const publishedDate = formatLongDate(post.date)
  const readingTime = getReadingTime(post.content)
  const category = getPostCategory(post)
  const heroImage = getPrimaryImage(post)
  const leadExcerpt = getExcerpt(post.content, 240)
  const mediaAttachments = (post.media || []).filter(
    (item, index) => item.url !== heroImage || index !== 0
  )

  // Find related articles (same category first, then other recent articles) to boost internal linking & session stickiness
  const sameCategoryPosts = posts.filter(
    (p) => p.id !== post.id && getPostCategory(p) === category
  )
  const otherPosts = posts.filter(
    (p) => p.id !== post.id && getPostCategory(p) !== category
  )
  const relatedPosts = [...sameCategoryPosts, ...otherPosts].slice(0, 3)

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
                BridgeTech IT Services Blog
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

              <div className="mt-6 rounded-2xl bg-primary-950 p-5 text-white shadow-lg">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                  Direct Expert Support
                </p>
                <h4 className="mt-1.5 text-base font-extrabold text-white">
                  Need Help Fixing This?
                </h4>
                <p className="mt-2 text-xs leading-5 text-blue-100/90">
                  Our certified technicians in Freetown can diagnose and repair your device today with warranty.
                </p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <a
                    href="https://wa.me/23233399391?text=Hello%20BridgeTech,%20I%20am%20reading%20your%20article%20and%20need%20help%20with%20my%20device"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-emerald-600 px-4 py-2.5 text-center text-xs font-extrabold text-white transition hover:bg-emerald-500 shadow-md flex items-center justify-center gap-2"
                  >
                    <i className="fab fa-whatsapp text-base"></i>
                    <span>Chat on WhatsApp</span>
                  </a>
                  <Link
                    href="/book-appointment"
                    className="rounded-full bg-white px-4 py-2 text-center text-xs font-bold text-primary-950 transition hover:bg-slate-100 shadow-sm"
                  >
                    📅 Book Repair Appointment
                  </Link>
                  <Link
                    href="/digital-tools"
                    className="rounded-full border border-white/25 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/10"
                  >
                    ✨ Free 3D Card &amp; Digital Tools
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
                    name: 'BridgeTech IT Services',
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
              This article is part of the BridgeTech IT Services knowledge library, designed to make
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
                  {mediaAttachments.map((item, index) => {
                    if (item.type === 'image') {
                      return (
                        <div key={`${item.url}-${index}`} className={styles.attachmentCard}>
                          <img
                            src={item.url}
                            alt={item.caption || 'Article media'}
                            className="h-full w-full object-cover"
                          />
                          {item.caption && (
                            <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                              {item.caption}
                            </p>
                          )}
                        </div>
                      )
                    }
                    const embed = getVideoEmbed(item.url)
                    return (
                      <div key={`${item.url}-${index}`} className={styles.attachmentCard}>
                        {embed.type === 'iframe' ? (
                          <iframe
                            src={embed.src}
                            className="aspect-video w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        ) : (
                          <video
                            src={embed.src}
                            controls
                            preload="metadata"
                            className="h-full w-full"
                          />
                        )}
                        {item.caption && (
                          <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <ArticleInteractions
              postId={post.id}
              postTitle={post.title}
              initialLikes={post.likes || 0}
              initialDislikes={post.dislikes || 0}
              initialComments={comments}
            />
          </article>
        </div>

        <div className="mt-12">
          <MultiplexAd />
        </div>

        {/* ── Related Articles (Improves Page Stickiness & Internal Linking) ── */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                  Recommended Reading
                </p>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Related Tech Guides &amp; Solutions
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Full Knowledge Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => {
                const relImg = getPrimaryImage(related)
                const relCategory = getPostCategory(related)
                const relReadingTime = getReadingTime(related.content)
                const relExcerpt = getExcerpt(related.content, 110)

                return (
                  <Link
                    key={related.id}
                    href={`/blog/${related.id}`}
                    className="group flex flex-col rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-300 hover:bg-white hover:border-blue-400 hover:shadow-lg overflow-hidden"
                  >
                    <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-200 mb-3.5">
                      {relImg ? (
                        <img
                          src={relImg}
                          alt={related.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <BookOpenText className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm">
                        {relCategory}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1">
                      {relExcerpt}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock3 className="w-3 h-3 text-slate-400" />
                        {relReadingTime} min read
                      </span>
                      <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Internal Cross-Link: Free Digital Tools Studio ── */}
        <section className="mt-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-[#040e40] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-amber-300 border border-white/20 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                100% Free Online Studio
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Try Our 3D Business Card &amp; ID Studio + AI Tools
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Design print-ready 300 DPI executive business cards, staff ID badges, erase image backgrounds, or convert audio/video directly in your browser.
              </p>
            </div>
            <Link
              href="/digital-tools"
              className="shrink-0 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 px-6 py-3.5 text-sm font-black text-slate-900 shadow-lg shadow-orange-500/30 transition-all hover:scale-105 text-center"
            >
              Launch Free Tools Studio →
            </Link>
          </div>
        </section>

        {/* ── Main Bottom CTA ── */}
        <section className={`${styles.ctaPanel} mt-8 p-6 sm:p-8`}>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                Direct Support &amp; Bookings
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                Ready to resolve your device problem in Freetown?
              </h2>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-slate-600">
                Reach out to our certified technicians for same-day repairs, original screen replacements, and verified unlocks with a 1-month warranty.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 lg:justify-end">
              <a
                href="https://wa.me/23233399391?text=Hello%20BridgeTech,%20I%20need%20assistance%20with%20a%20device%20repair"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs sm:text-sm font-bold text-white transition shadow-md flex items-center gap-2"
              >
                <i className="fab fa-whatsapp text-base"></i>
                <span>WhatsApp Chat</span>
              </a>
              <Link
                href="/book-appointment"
                className="rounded-full bg-primary-950 px-5 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-primary-900 shadow-md"
              >
                Book Appointment
              </Link>
              <Link
                href="/blog"
                className="rounded-full border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                All Articles
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
