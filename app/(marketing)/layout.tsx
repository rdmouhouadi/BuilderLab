import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Sora } from 'next/font/google'
import MktNavbar from '@/components/marketing/MktNavbar'
import Footer from '@/components/marketing/Footer'
import { colors } from '@/lib/design-tokens'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: {
    default: 'BuilderLab — Build real projects, with a real team',
    template: '%s | BuilderLab',
  },
  description: 'BuilderLab is where solo learners become teams. Post an idea, form a cross-functional crew, and build portfolio-worthy projects with structured peer review.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${inter.variable} ${sora.variable}`}
      style={{
        backgroundColor: colors.bg.mkt,
        color: colors.text.base,
        fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        letterSpacing: '-0.005em',
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Ambient radial gradient field */}
      <div aria-hidden style={{
        position: 'fixed',
        inset: 0,
        zIndex: -2,
        background: `
          radial-gradient(900px 520px at 78% -8%, rgba(20,184,166,0.13), transparent 60%),
          radial-gradient(760px 520px at 8% 6%, rgba(99,102,241,0.08), transparent 58%)
        `,
        pointerEvents: 'none',
      }} />
      {/* Faint grid */}
      <div aria-hidden style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
        WebkitMaskImage: 'radial-gradient(circle at 50% 0%, #000, transparent 80%)',
        maskImage: 'radial-gradient(circle at 50% 0%, #000, transparent 80%)',
        pointerEvents: 'none',
      }} />

      <MktNavbar />
      <main>{children}</main>
      <Footer />

      <style>{`
        :root {
          --font-head: var(--font-sora), "Inter", system-ui, sans-serif;
          --font-body: var(--font-inter), system-ui, -apple-system, sans-serif;
          --font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
        }
        h1, h2, h3, h4 {
          font-family: var(--font-sora), "Inter", system-ui, sans-serif;
          font-weight: 700;
          letter-spacing: -0.025em;
          line-height: 1.05;
          margin: 0;
          color: ${colors.text.base};
        }
        p { margin: 0; }
        a { color: inherit; text-decoration: none; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
