import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const title = searchParams.get('title') || 'Blog Post'
    const author = searchParams.get('author') || 'IT Services Freetown'
    const date = searchParams.get('date') || new Date().toLocaleDateString()
    const image = searchParams.get('image') || ''
    const excerpt = searchParams.get('excerpt') || ''
    const likes = searchParams.get('likes') || '0'

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
