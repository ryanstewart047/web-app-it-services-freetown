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

    // Normalise GitHub blob URLs → raw.githubusercontent.com so the actual
    // image bytes are served (blob URLs return an HTML page, not the image).
    if (image && image.includes('github.com') && image.includes('/blob/')) {
      image = image
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')
        .replace('/blob/', '/')
        // Strip ?raw=true suffix – not needed on raw.githubusercontent.com
        .replace(/[?&]raw=true/, '')
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
            background: 'linear-gradient(135deg, #040e40 0%, #08164d 50%, #0c1f6d 100%)',
            padding: '48px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Left side - Product Image Box (contained, centered, clean white frame) */}
          <div
            style={{
              display: 'flex',
              width: '42%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
            }}
          >
            {image ? (
              <img
                src={image}
                alt={name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
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
                  background: '#f1f5f9',
                  borderRadius: '16px',
                  fontSize: '54px',
                  color: '#94a3b8',
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
              width: '54%',
              height: '100%',
              justifyContent: 'space-between',
              paddingLeft: '32px',
              paddingTop: '8px',
              paddingBottom: '8px',
            }}
          >
            {/* Header: Badge & Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.25)',
                  border: '1.5px solid #ef4444',
                  color: '#fca5a5',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {condition === 'new' ? '✨ Brand New' : condition === 'refurbished' ? '♻️ Refurbished' : '📦 Quality Tested'}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Official Store
              </div>
            </div>

            {/* Middle: Title & Description */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '40px',
                  fontWeight: '800',
                  color: '#ffffff',
                  lineHeight: 1.2,
                  marginBottom: '12px',
                  maxHeight: '96px',
                  overflow: 'hidden',
                }}
              >
                {name}
              </div>

              {truncatedDesc && (
                <div
                  style={{
                    display: 'flex',
                    fontSize: '20px',
                    color: '#cbd5e1',
                    lineHeight: 1.35,
                    maxHeight: '60px',
                    overflow: 'hidden',
                  }}
                >
                  {truncatedDesc}
                </div>
              )}
            </div>

            {/* Price section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                marginTop: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '52px',
                  fontWeight: '900',
                  color: '#ef4444',
                  letterSpacing: '-1px',
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
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                paddingTop: '16px',
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
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#ffffff',
                    letterSpacing: '0.5px',
                  }}
                >
                  BridgeTech IT Services
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                  }}
                >
                  Freetown, Sierra Leone · itservicesfreetown.com
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  background: '#ef4444',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                }}
              >
                View Item ↗
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
