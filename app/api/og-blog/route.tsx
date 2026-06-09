import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { fetchBlogPosts } from '@/lib/github-blog-storage'
import { formatLongDate, getExcerpt, getPrimaryImage } from '../../blog/blog-utils'

export const runtime = 'edge'

async function getImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      return null
    }
    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    // Convert ArrayBuffer to Base64 in Edge runtime
    let binary = ''
    const bytes = new Uint8Array(arrayBuffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Error fetching image for Base64 conversion:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    
    const id = searchParams.get('id')
    let title = searchParams.get('title') || 'Blog Post'
    let author = searchParams.get('author') || 'IT Services Freetown'
    let date = searchParams.get('date') || new Date().toLocaleDateString()
    let image = searchParams.get('image') || ''
    let excerpt = searchParams.get('excerpt') || ''
    let likes = searchParams.get('likes') || '0'

    if (id) {
      try {
        const posts = await fetchBlogPosts()
        const post = posts.find((p) => p.id === id)
        if (post) {
          title = post.title
          author = post.author
          date = formatLongDate(post.date)
          excerpt = getExcerpt(post.content, 200)
          likes = post.likes.toString()
          image = getPrimaryImage(post) || ''
        }
      } catch (err) {
        console.error('Error fetching blog post in OG API:', err)
      }
    }

    // Determine the base URL dynamically from the request origin
    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
    const fallbackImage = `${baseUrl}/assets/images/slide01.jpg`

    // Fall back to the default site banner if no image is defined for the post
    if (!image) {
      image = fallbackImage
    }

    // Ensure image URL is absolute for the OG engine
    if (image && image.startsWith('/')) {
      image = `${baseUrl}${image}`
    }

    // Convert image to Base64 to bypass hotlink blocks and catch fetch errors gracefully
    if (image && !image.startsWith('data:')) {
      const base64Image = await getImageAsBase64(image)
      if (base64Image) {
        image = base64Image
      } else if (image !== fallbackImage) {
        // If fetching the custom image failed, fall back to our default site banner
        const base64Fallback = await getImageAsBase64(fallbackImage)
        if (base64Fallback) {
          image = base64Fallback
        } else {
          image = ''
        }
      } else {
        image = ''
      }
    }

    // Truncate text to fit in preview
    const truncatedTitle = title.length > 80 ? title.substring(0, 77) + '...' : title
    const truncatedExcerpt = excerpt.length > 200 ? excerpt.substring(0, 197) + '...' : excerpt

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #040e40 0%, #1a1a2e 50%, #040e40 100%)',
            padding: '0',
            position: 'relative',
          }}
        >
          {/* Top Red Bar */}
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #dc2626 100%)',
            }}
          />

          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              padding: '0',
            }}
          >
            {/* Left Side - Post Image (40%) */}
            {image && (
              <div
                style={{
                  width: '40%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px',
                  background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(4, 14, 64, 0.2) 100%)',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  <img
                    src={image}
                    alt="Post"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Right Side - Post Details (60% or 100% if no image) */}
            <div
              style={{
                width: image ? '60%' : '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '50px',
                color: 'white',
              }}
            >
              {/* Top Section - Title & Excerpt */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                {/* Blog Label */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
                      padding: '8px 20px',
                      borderRadius: '20px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                    }}
                  >
                    BLOG POST
                  </div>
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: image ? '48px' : '64px',
                    fontWeight: 'bold',
                    lineHeight: '1.2',
                    color: 'white',
                    display: 'flex',
                    flexWrap: 'wrap',
                  }}
                >
                  {truncatedTitle}
                </div>

                {/* Excerpt */}
                {truncatedExcerpt && (
                  <div
                    style={{
                      fontSize: '24px',
                      lineHeight: '1.5',
                      color: 'rgba(255, 255, 255, 0.85)',
                      display: 'flex',
                      flexWrap: 'wrap',
                    }}
                  >
                    {truncatedExcerpt}
                  </div>
                )}
              </div>

              {/* Bottom Section - Meta Info */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  borderTop: '2px solid rgba(220, 38, 38, 0.3)',
                  paddingTop: '24px',
                }}
              >
                {/* Author & Date */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px',
                    fontSize: '22px',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #dc2626 0%, #040e40 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                      }}
                    >
                      {author.charAt(0)}
                    </div>
                    <span>{author}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    📅 {date}
                  </div>
                  {likes !== '0' && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      👍 {likes} likes
                    </div>
                  )}
                </div>

                {/* Branding */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                    }}
                  >
                    💻
                  </div>
                  <span>IT Services Freetown</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`Error generating OG image: ${e.message}`)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
