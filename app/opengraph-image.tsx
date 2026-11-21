import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'For Tshidi — A Birthday Universe';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #07051a 0%, #1b0c38 55%, #3d1140 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(255,90,167,0.35), rgba(255,90,167,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -140,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(168,85,247,0.3), rgba(168,85,247,0) 70%)',
          }}
        />
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 14, color: '#ffd5a9', marginBottom: 28 }}>
          A UNIVERSE MADE FOR ONE
        </div>
        <div style={{ display: 'flex', fontSize: 132, fontWeight: 700, color: '#fff7ff' }}>
          For Tshidi
        </div>
        <div style={{ display: 'flex', fontSize: 34, fontStyle: 'italic', color: '#ffc4df', marginTop: 26 }}>
          a birthday universe made with love
        </div>
        <div style={{ display: 'flex', gap: 26, fontSize: 42, marginTop: 44 }}>
          <span>♥</span><span>🌹</span><span>♥</span>
        </div>
      </div>
    ),
    size
  );
}
