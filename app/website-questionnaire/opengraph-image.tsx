import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Website Development Project Discovery Brief | BridgeTech IT Services'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #040e40 0%, #0a1b5c 50%, #040e40 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          padding: '60px 70px',
          overflow: 'hidden',
        }}
      >
        {/* Top vibrant red brand bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '14px',
            backgroundColor: '#ef4444',
          }}
        />

        {/* Decorative background glow circles */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '500px',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-140px',
            left: '-100px',
            width: '550px',
            height: '550px',
            borderRadius: '550px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(59, 130, 246, 0) 70%)',
          }}
        />

        {/* Header: Logo and Organization */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Shield Logo Avatar */}
            <div
              style={{
                width: '64px',
                height: '74px',
                borderRadius: '16px',
                backgroundColor: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  backgroundColor: '#040e40',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#ffffff',
                }}
              >
                <span>B</span>
                <span style={{ color: '#ef4444' }}>S</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', color: '#ffffff' }}>
                BridgeTech
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '0.25em',
                  color: '#ef4444',
                  textTransform: 'uppercase',
                }}
              >
                IT SERVICES • FREETOWN
              </span>
            </div>
          </div>

          {/* Intake Form Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '10px',
                backgroundColor: '#10b981',
              }}
            />
            <span>Online Project Brief</span>
          </div>
        </div>

        {/* Center Content: Title & Tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1
              style={{
                fontSize: '66px',
                fontWeight: '900',
                lineHeight: 1.05,
                margin: 0,
                color: '#ffffff',
                letterSpacing: '-0.03em',
              }}
            >
              Website Development
            </h1>
            <span
              style={{
                fontSize: '66px',
                fontWeight: '900',
                lineHeight: 1.05,
                margin: 0,
                color: '#ef4444',
                letterSpacing: '-0.03em',
              }}
            >
              Project Discovery Brief
            </span>
          </div>

          <p
            style={{
              fontSize: '22px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '6px 0 0 0',
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            Plan your custom website in 5 minutes. Tell us your goals, branding, and technical features to receive a tailored scope & proposal.
          </p>

          {/* Feature Badges */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
            {['⚡ Modern & Responsive', '🛒 E-Commerce & CMS', '🎨 Brand & Custom Design', '🔒 Secure Hosting & Domain'].map((pill, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#ffffff',
                }}
              >
                {pill}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info: Contact & Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <span>📍 #1 Regent Highway, Jui Junction, Freetown</span>
            <span>•</span>
            <span>📞 +232 33 399 391</span>
          </div>

          <div
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#ffffff',
              backgroundColor: '#ef4444',
              padding: '8px 20px',
              borderRadius: '10px',
            }}
          >
            itservicesfreetown.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
