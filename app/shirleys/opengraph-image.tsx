import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Shirley's Stiches & Sweet - Bakery, Pastries and Fashion"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#fffdf8',
          color: '#2f1f2a',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 28,
            background: 'linear-gradient(90deg, #8a2746, #f7c948, #2f6f6a)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -100,
            top: 70,
            width: 430,
            height: 430,
            borderRadius: 430,
            background: '#f7c948',
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -80,
            bottom: -120,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: '#8a2746',
            opacity: 0.16,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '76px 80px 60px',
            width: '68%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              marginBottom: 34,
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 32,
                background: '#8a2746',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f7c948',
                fontSize: 58,
                fontWeight: 900,
                border: '8px solid #f7c948',
              }}
            >
              S
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: '#8a2746' }}>
                Shirley's
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>
                STICHES & SWEET
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 66,
              lineHeight: 1.02,
              fontWeight: 900,
              maxWidth: 760,
            }}
          >
            Bakery, pastries and custom fashion in Freetown.
          </div>

          <div
            style={{
              display: 'flex',
              gap: 14,
              marginTop: 34,
              flexWrap: 'wrap',
            }}
          >
            {['Custom treats', 'Small chops', 'Tailoring', 'Event bundles'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  borderRadius: 999,
                  background: 'white',
                  border: '2px solid rgba(138, 39, 70, 0.18)',
                  padding: '12px 20px',
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#4d3039',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: '32%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            paddingRight: 64,
          }}
        >
          {[
            ['#f7c948', '#2f1f2a', 'Cake boxes'],
            ['#8a2746', '#ffffff', 'Custom looks'],
            ['#2f6f6a', '#ffffff', 'Party trays'],
          ].map(([bg, color, label], index) => (
            <div
              key={label}
              style={{
                height: index === 1 ? 152 : 128,
                borderRadius: 34,
                background: bg,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 900,
                boxShadow: '0 24px 70px rgba(47, 31, 42, 0.15)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
