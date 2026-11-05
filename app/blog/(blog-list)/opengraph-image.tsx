import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'BridgeTech IT Services Blog'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #040e40 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
          BridgeTech IT Services
        </div>
        <div style={{ fontSize: 48 }}>
          Tech Blog
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
