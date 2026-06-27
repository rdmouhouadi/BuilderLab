// components/marketing/home/Hero.tsx
// Landing page hero — headline, CTA buttons, and two overlapping
// product screenshots.
import Image from 'next/image'
import Eyebrow from '@/components/marketing/Eyebrow'
import PrimaryCtaButton from '@/components/marketing/PrimaryCtaButton'
import { BtnSoft, Wrap } from './shared'
import {
  colors, fontSizeMkt, fontFamily, shadows, radiusMkt, breakpoints,
} from '@/lib/design-tokens'

// ─── WindowChrome ─────────────────────────────────────────────────────────────
// Fake browser title bar (3 dots) drawn on top of each product screenshot

function WindowChrome() {
  return (
    <>
      <div style={{
        position: 'absolute',
        inset: '0 0 auto 0',
        height: '30px',
        background: `linear-gradient(180deg, ${colors.bg.surface2}, ${colors.bg.mktSurface})`,
        borderBottom: `1px solid ${colors.border.mkt}`,
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute',
        top: '11px', left: '13px',
        display: 'flex', gap: '6px',
        zIndex: 3,
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            backgroundColor: colors.border.mkt2,
            display: 'block',
          }} />
        ))}
      </div>
    </>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <header style={{ position: 'relative', padding: '76px 0 88px', overflow: 'hidden' }}>
      {/* teal radial glow */}
      <div aria-hidden style={{
        position: 'absolute',
        width: '520px', height: '520px',
        right: 'calc(50% - 660px)', top: '-40px',
        background: `radial-gradient(circle, rgba(${colors.accent.glowRgb},0.22), transparent 65%)`,
        filter: 'blur(20px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <Wrap>
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.04fr) minmax(0,1fr)',
          alignItems: 'center',
          gap: '56px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Copy */}
          <div style={{ maxWidth: '580px' }}>
            <Eyebrow>For anyone who learns by building</Eyebrow>

            <h1 style={{
              fontFamily: fontFamily.head,
              fontSize: fontSizeMkt.hero,
              lineHeight: 1.02,
              margin: '22px 0 0',
              textWrap: 'balance',
            } as React.CSSProperties}>
              Grow together. Ship projects{' '}
              <span style={{
                background: `linear-gradient(120deg, ${colors.accent.bright}, ${colors.accent.indigoBright})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}>
                worth showing.
              </span>
            </h1>

            <p style={{
              marginTop: '24px',
              fontSize: fontSizeMkt.lead,
              lineHeight: 1.6,
              color: colors.text.muted2,
              maxWidth: '520px',
            }}>
              BuilderLab is where solo learners become teams. Post an idea, form a
              cross-functional crew, and build portfolio-worthy projects — with
              structured peer review guiding you from first commit to final ship.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '34px', flexWrap: 'wrap' as const }}>
              <PrimaryCtaButton lg />
              <BtnSoft href="/vision" lg>Read the vision →</BtnSoft>
            </div>

            <div style={{
              marginTop: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap' as const,
              color: colors.text.dim,
              fontSize: '13.5px',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: colors.text.muted2 }}>
                <strong style={{ color: colors.text.soft, fontWeight: 600 }}>Data Science</strong>
              </span>
              <span>+</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: colors.text.muted2 }}>
                <strong style={{ color: colors.text.soft, fontWeight: 600 }}>Software Eng</strong>
              </span>
              <span>+</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: colors.text.muted2 }}>
                <strong style={{ color: colors.text.soft, fontWeight: 600 }}>Data Analysts</strong>
              </span>
              <span>— building real products, in public.</span>
            </div>
          </div>

          {/* Media — two overlapping screenshots (overlap layout) */}
          <div className="hero-media" style={{ position: 'relative', minHeight: '460px' }}>
            {/* Back shot — offset down-right */}
            <figure style={{
              position: 'absolute',
              top: '150px',
              left: '20%',
              width: '82%',
              margin: 0,
              zIndex: 2,
              borderRadius: radiusMkt.md,
              border: `1px solid ${colors.border.mkt2}`,
              backgroundColor: colors.bg.mktSurface,
              overflow: 'hidden',
              boxShadow: shadows.heroShot,
            }}>
              <WindowChrome />
              <Image
                src="/images/shot-login.png"
                alt="BuilderLab app"
                width={900}
                height={600}
                style={{ display: 'block', width: '100%', height: 'auto', marginTop: '30px' }}
                priority
              />
            </figure>

            {/* Front shot — top-left */}
            <figure style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '82%',
              margin: 0,
              zIndex: 3,
              borderRadius: radiusMkt.md,
              border: `1px solid ${colors.border.mkt2}`,
              backgroundColor: colors.bg.mktSurface,
              overflow: 'hidden',
              boxShadow: shadows.heroShot,
            }}>
              <WindowChrome />
              <Image
                src="/images/shot-projects.png"
                alt="BuilderLab projects feed"
                width={900}
                height={600}
                style={{ display: 'block', width: '100%', height: 'auto', marginTop: '30px' }}
                priority
              />
            </figure>
          </div>
        </div>
      </Wrap>

      <style>{`
        @media (max-width: ${breakpoints.md}) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-media { min-height: 420px !important; }
        }
        @media (max-width: ${breakpoints.sm}) {
          .hero-media { min-height: 340px !important; }
        }
      `}</style>
    </header>
  )
}