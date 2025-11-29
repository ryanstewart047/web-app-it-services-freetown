import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const name = searchParams.get('name') || 'Product'
    const price = searchParams.get('price') || '0'
    const image = searchParams.get('image') || ''
    const description = searchParams.get('description') || ''
    const condition = searchParams.get('condition') || 'new'
    
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
