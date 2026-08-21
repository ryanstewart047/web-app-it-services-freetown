import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function getImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    return null;
  }
}

function formatPrice(price: string) {
  const value = price.trim();
  if (!value) return '';
  if (/^(le|sll|usd|\$|gbp)/i.test(value)) return value;
  return `Le ${value}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);

    const layout = searchParams.get('layout') || 'photo-only';
    const title = searchParams.get('title') || 'BridgeTech IT Services';
    const description = searchParams.get('description') || '';
    const price = searchParams.get('price') || '';
    const tag = searchParams.get('tag') || '';
    let image = searchParams.get('image') || '';
    const theme = searchParams.get('theme') || 'navy';
    const imageFit = searchParams.get('fit') || 'contain';
    const imageScale = Number(searchParams.get('scale') || '100');
    const imagePositionX = Number(searchParams.get('positionX') || '50');
    const imagePositionY = Number(searchParams.get('positionY') || '50');

    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com';
    const fallbackImage = `${baseUrl}/assets/images/slide01.jpg`;

    if (!image) {
      image = fallbackImage;
    }

    if (image && image.startsWith('/')) {
      image = `${baseUrl}${image}`;
    }

    // Convert github blob to raw
    if (image && image.includes('github.com') && image.includes('/blob/')) {
      image = image
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')
        .replace('/blob/', '/')
        .replace(/[?&]raw=true/, '');
    }

    // Fetch Base64 if needed
    if (image && !image.startsWith('data:')) {
      const b64 = await getImageAsBase64(image);
      if (b64) {
        image = b64;
      } else if (image !== fallbackImage) {
        const fallbackB64 = await getImageAsBase64(fallbackImage);
        image = fallbackB64 || '';
      } else {
        image = '';
      }
    }

    const safeScale = Number.isFinite(imageScale)
      ? Math.min(1.8, Math.max(0.55, imageScale / 100))
      : 1;
    const safePositionX = Number.isFinite(imagePositionX)
      ? Math.min(100, Math.max(0, imagePositionX))
      : 50;
    const safePositionY = Number.isFinite(imagePositionY)
      ? Math.min(100, Math.max(0, imagePositionY))
      : 50;
    const priceDisplay = formatPrice(price);
    const truncatedTitle = title.length > 76 ? title.substring(0, 73) + '...' : title;
    const truncatedDesc = description.length > 150 ? description.substring(0, 147) + '...' : description;

    if (layout === 'photo-only') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              overflow: 'hidden',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {image ? (
              <img
                src={image}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: imageFit === 'cover' ? 'cover' : 'contain',
                  objectPosition: `${safePositionX}% ${safePositionY}%`,
                  transform: `scale(${safeScale})`,
                  transformOrigin: `${safePositionX}% ${safePositionY}%`,
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  color: '#475569',
                  fontSize: '54px',
                  fontWeight: 800,
                }}
              >
                BridgeTech IT Services
              </div>
            )}
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    if (layout === 'product-preview') {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                height: '390px',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              {image ? (
                <img
                  src={image}
                  alt={title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: imageFit === 'cover' ? 'cover' : 'contain',
                    objectPosition: `${safePositionX}% ${safePositionY}%`,
                    transform: `scale(${safeScale})`,
                    transformOrigin: `${safePositionX}% ${safePositionY}%`,
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '58px',
                    fontWeight: 900,
                    color: '#64748b',
                  }}
                >
                  BridgeTech
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '26px 42px 24px',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '28px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '39px',
                      fontWeight: 950,
                      color: '#0f172a',
                      lineHeight: 1.08,
                      maxHeight: '86px',
                      overflow: 'hidden',
                    }}
                  >
                    {truncatedTitle}
                  </div>

                  {truncatedDesc ? (
                    <div
                      style={{
                        display: 'flex',
                        fontSize: '21px',
                        color: '#475569',
                        lineHeight: 1.35,
                        marginTop: '12px',
                        maxHeight: '58px',
                        overflow: 'hidden',
                      }}
                    >
                      {truncatedDesc}
                    </div>
                  ) : null}
                </div>

                {priceDisplay ? (
                  <div
                    style={{
                      display: 'flex',
                      flexShrink: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#dc2626',
                      color: '#ffffff',
                      borderRadius: '18px',
                      padding: '16px 22px',
                      fontSize: priceDisplay.length > 16 ? '27px' : '34px',
                      fontWeight: 950,
                      minWidth: '220px',
                      boxShadow: '0 16px 34px rgba(220, 38, 38, 0.25)',
                    }}
                  >
                    {priceDisplay}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    color: '#0f172a',
                    fontSize: '15px',
                    fontWeight: 850,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {tag || 'Official Product Preview'}
                </div>
                <div
                  style={{
                    display: 'flex',
                    color: '#64748b',
                    fontSize: '15px',
                    fontWeight: 750,
                  }}
                >
                  itservicesfreetown.com
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Theme backgrounds
    const bgGradients: Record<string, string> = {
      navy: 'linear-gradient(135deg, #040e40 0%, #091a63 50%, #040e40 100%)',
      dark: 'linear-gradient(135deg, #090d16 0%, #131b2e 50%, #090d16 100%)',
      emerald: 'linear-gradient(135deg, #062c1d 0%, #0b4d34 50%, #062c1d 100%)',
      crimson: 'linear-gradient(135deg, #3b0d11 0%, #5c131a 50%, #3b0d11 100%)',
    };

    const bg = bgGradients[theme] || bgGradients.navy;

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
            background: bg,
            padding: '44px 50px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Left Frame: Image */}
          <div
            style={{
              display: 'flex',
              width: '42%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {image ? (
              <img
                src={image}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: imageFit === 'cover' ? 'cover' : 'contain',
                  objectPosition: `${safePositionX}% ${safePositionY}%`,
                  transform: `scale(${safeScale})`,
                  transformOrigin: `${safePositionX}% ${safePositionY}%`,
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px',
                  color: '#94a3b8',
                }}
              >
                💻
              </div>
            )}
          </div>

          {/* Right Frame: Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '54%',
              height: '100%',
              justifyContent: 'space-between',
              paddingLeft: '32px',
              paddingTop: '6px',
              paddingBottom: '6px',
            }}
          >
            {/* Tag / Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {tag ? (
                <div
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    padding: '6px 16px',
                    borderRadius: '16px',
                    fontSize: '15px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {tag}
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    padding: '6px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '700',
                  }}
                >
                  BridgeTech
                </div>
              )}
              <div
                style={{
                  fontSize: '13px',
                  color: '#cbd5e1',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Official Store
              </div>
            </div>

            {/* Title & Desc */}
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
                  fontSize: '36px',
                  fontWeight: '900',
                  color: '#ffffff',
                  lineHeight: 1.22,
                  maxHeight: '94px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                }}
              >
                {truncatedTitle}
              </div>

              {truncatedDesc && (
                <div
                  style={{
                    display: 'flex',
                    fontSize: '19px',
                    color: '#e2e8f0',
                    lineHeight: 1.35,
                    maxHeight: '56px',
                    overflow: 'hidden',
                  }}
                >
                  {truncatedDesc}
                </div>
              )}
            </div>

            {/* Price & Action */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                paddingTop: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {price ? (
                  <span
                    style={{
                      fontSize: '40px',
                      fontWeight: '900',
                      color: '#f87171',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {priceDisplay}
                  </span>
                ) : null}
                <span
                  style={{
                    fontSize: '13px',
                    color: '#94a3b8',
                  }}
                >
                  itservicesfreetown.com · Freetown, SL
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '800',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.5)',
                }}
              >
                Order Now ↗
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating custom OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
