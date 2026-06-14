import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

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
    
    const name = searchParams.get('name') || 'Product'
    const price = searchParams.get('price') || '0'
    let image = searchParams.get('image') || ''
    const description = searchParams.get('description') || ''
    const condition = searchParams.get('condition') || 'new'
    
    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com'
    const fallbackImage = `${baseUrl}/assets/images/slide01.jpg`

    if (!image) {
      image = fallbackImage
    }

    if (image && image.startsWith('/')) {
      image = `${baseUrl}${image}`
    }

    if (image && !image.startsWith('data:')) {
      const base64Image = await getImageAsBase64(image)
      if (base64Image) {
        image = base64Image
      } else if (image !== fallbackImage) {
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

    // Truncate description to 100 characters
    const truncatedDesc = description.length > 100 
      ? description.substring(0, 100) + '...' 
      : description

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #040e40 0%, #0a1854 100%)',
            padding: '60px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Left side - Product Image */}
          <div
            style={{
              display: 'flex',
              width: '45%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {image ? (
              <img
                src={image}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '16px',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  background: '#f3f4f6',
                  borderRadius: '16px',
                  fontSize: '48px',
                  color: '#9ca3af',
                }}
              >
                📦
              </div>
            )}
          </div>

          {/* Right side - Product Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '50%',
              height: '100%',
              justifyContent: 'center',
              paddingLeft: '40px',
            }}
          >
            {/* Brand Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {condition === 'new' ? '🆕 New' : condition === 'refurbished' ? '♻️ Refurbished' : '📦 Used'}
              </div>
            </div>

            {/* Product Name */}
            <div
              style={{
                display: 'flex',
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2,
                marginBottom: '24px',
                maxHeight: '144px',
                overflow: 'hidden',
              }}
            >
              {name}
            </div>

            {/* Description */}
            {truncatedDesc && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  color: '#cbd5e1',
                  lineHeight: 1.4,
                  marginBottom: '32px',
                  maxHeight: '100px',
                  overflow: 'hidden',
                }}
              >
                {truncatedDesc}
              </div>
            )}

            {/* Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginBottom: '32px',
              }}
            >
              <span
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#ef4444',
                  marginRight: '12px',
                }}
              >
                Le {parseFloat(price).toLocaleString()}
              </span>
            </div>

            {/* Footer with branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  IT Services Freetown
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    color: '#94a3b8',
                  }}
                >
                  Tap to view product →
                </span>
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
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
