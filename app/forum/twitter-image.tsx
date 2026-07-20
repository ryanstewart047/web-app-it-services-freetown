import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Technicians Forum | IT Services Freetown'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #04091a 0%, #0b1120 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }} />

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20px', backgroundColor: '#ef4444' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '96px', color: 'white', fontWeight: '900', margin: '0', letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              Technicians Forum
            </h1>
          </div>

          <p style={{ fontSize: '48px', color: '#3b82f6', margin: '0 0 60px 0', letterSpacing: '0.05em', fontWeight: 'bold' }}>
            IT SERVICES FREETOWN
          </p>

          <div style={{ 
            display: 'flex', 
            padding: '24px 48px', 
            background: 'rgba(255,255,255,0.08)', 
            borderRadius: '24px', 
            border: '2px solid rgba(255,255,255,0.15)', 
            color: 'white', 
            fontSize: '36px',
            fontWeight: '600'
          }}>
            Collaborate. Troubleshoot. Connect.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
