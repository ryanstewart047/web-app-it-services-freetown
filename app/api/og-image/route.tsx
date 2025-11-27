import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profilePhoto = searchParams.get('photo') || '/assets/profile-ryan.jpg'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
            }}
          >
            {/* Profile Image */}
            <div
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #3b82f6',
                display: 'flex',
              }}
            >
              <img
                src={profilePhoto.startsWith('data:') ? profilePhoto : `https://itservicesfreetown.com${profilePhoto}`}
                alt="Profile"
                width="200"
                height="200"
                style={{
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Text Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '60px',
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                Ryan J Stewart
              </div>
              <div
                style={{
                  fontSize: '32px',
                  color: '#94a3b8',
                  lineHeight: 1.2,
                }}
              >
                Full Stack Developer
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  marginTop: '20px',
                }}
              >
                <div
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '20px',
                  }}
                >
                  Next.js
                </div>
                <div
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#8b5cf6',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '20px',
                  }}
                >
                  React
                </div>
                <div
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '20px',
                  }}
                >
                  Node.js
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
    console.error(e)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
