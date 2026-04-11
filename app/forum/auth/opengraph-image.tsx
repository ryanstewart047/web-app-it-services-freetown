import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Join the Technicians Forum | IT Services Freetown'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #04091a 0%, #0b1120 60%, #0d1726 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.04) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.04) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }} />

        {/* Red top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '18px', backgroundColor: '#ef4444' }} />

        {/* Blue bottom bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px', backgroundColor: '#1d4ed8' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, padding: '0 80px' }}>

          {/* Lock / Join badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
            padding: '12px 28px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '50px',
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span style={{ fontSize: '24px', color: '#fca5a5', fontWeight: '700', letterSpacing: '0.15em' }}>
              CREATE YOUR ACCOUNT
            </span>
          </div>

          {/* Main heading */}
          <h1 style={{
            fontSize: '88px',
            color: 'white',
            fontWeight: '900',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            lineHeight: 1.05
          }}>
            Technicians Forum
          </h1>

          {/* Sub-brand */}
          <p style={{
            fontSize: '40px',
            color: '#60a5fa',
            margin: '0 0 50px 0',
            letterSpacing: '0.06em',
            fontWeight: '700',
          }}>
            IT SERVICES FREETOWN
          </p>

          {/* Tagline pill */}
          <div style={{
            display: 'flex',
            padding: '22px 52px',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: '20px',
            border: '2px solid rgba(255,255,255,0.12)',
            color: '#e2e8f0',
            fontSize: '32px',
            fontWeight: '600',
          }}>
            Collaborate. Troubleshoot. Connect.
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
