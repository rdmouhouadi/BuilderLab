import { ImageResponse } from 'next/og'

export const contentType = 'image/png'
export const size = { width: 180, height: 180 }

// Hive Trio mark as inline SVG — encoded so ImageResponse can render it as <img>
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2dd4bf"/>
      <stop offset="1" stop-color="#0d9488"/>
    </linearGradient>
  </defs>
  <polygon points="65,29 57.5,41.99 42.5,41.99 35,29 42.5,16.01 57.5,16.01" fill="url(#g)"/>
  <polygon points="48,57 40.5,69.99 25.5,69.99 18,57 25.5,44.01 40.5,44.01" fill="#14b8a6"/>
  <polygon points="82,57 74.5,69.99 59.5,69.99 52,57 59.5,44.01 74.5,44.01" fill="#0d9488"/>
</svg>`

const markDataUrl = `data:image/svg+xml;base64,${Buffer.from(markSvg).toString('base64')}`

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0d11',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={markDataUrl} width={120} height={120} alt="" />
      </div>
    ),
    { ...size },
  )
}
