// components/marketing/home/FinalCTA.tsx
// Final call-to-action section at the bottom of the landing page.
import ScrollReveal from '@/components/marketing/ScrollReveal'
import Eyebrow from '@/components/marketing/Eyebrow'
import PrimaryCtaButton from '@/components/marketing/PrimaryCtaButton'
import { Wrap, BtnSoft } from './shared'
import { colors, radiusMkt, fontFamily, fontSizeMkt } from '@/lib/design-tokens'

export default function FinalCTA() {
  return (
    <section style={{ padding: '65px 0' }}>
      <Wrap>
        <ScrollReveal>
          <div style={{
            position: 'relative',
            textAlign: 'center',
            padding: '76px 40px',
            borderRadius: radiusMkt.xl,
            border: `1px solid ${colors.border.accent}`,
            background: `
              radial-gradient(700px 300px at 50% 0%, rgba(${colors.accent.glowRgb},0.14), transparent 70%),
              linear-gradient(180deg, ${colors.bg.mktSurface}, ${colors.bg.mkt2})
            `,
            overflow: 'hidden',
          }}>
            <Eyebrow>Stop building alone</Eyebrow>
            <h2 style={{
              fontFamily: fontFamily.head,
              fontSize: fontSizeMkt.h2lg,
              marginTop: '20px',
              textWrap: 'balance',
            } as React.CSSProperties}>
              Your next portfolio project starts with a team.
            </h2>
            <p style={{
              margin: '18px auto 0',
              maxWidth: '540px',
              color: colors.text.muted2,
              fontSize: fontSizeMkt.bodyLg,
            }}>
              Join BuilderLab, post your idea, and find the people who&apos;ll actually show up — and ship it with you.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '34px',
              justifyContent: 'center',
              flexWrap: 'wrap' as const,
            }}>
              <PrimaryCtaButton lg />
              <BtnSoft href="/contact" lg>Join the journey</BtnSoft>
            </div>
          </div>
        </ScrollReveal>
      </Wrap>
    </section>
  )
}