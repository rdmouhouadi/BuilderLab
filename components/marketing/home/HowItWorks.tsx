// components/marketing/home/HowItWorks.tsx
// "How it works" section — 4-step flow from posting an idea to peer review.
import ScrollReveal from '@/components/marketing/ScrollReveal'
import { Wrap, SectionHead } from './shared'
import { colors, radiusMkt, fontFamily, fontSizeMkt, breakpoints } from '@/lib/design-tokens'

const STEPS = [
  { n: '1', title: 'Post an idea', body: '"I want to build something in healthcare." Define scope, roles, and the stack you\'re after.' },
  { n: '2', title: 'Your team forms', body: 'An SWE joins. A Data Analyst or Data Engineer jumps in. Complementary skills, one goal.' },
  { n: '3', title: 'Build in the open', body: 'Plan, commit, and document together — building something that could become a real product.' },
  { n: '4', title: 'Get reviewed & showcased', body: 'Structured peer review keeps quality high. Top projects get featured for others to learn from.' },
]

export default function HowItWorks() {
  return (
    <section style={{ padding: '24px 0 65px', position: 'relative' }} id="how">
      <Wrap>
        <ScrollReveal>
          <SectionHead
            eyebrow="How it works"
            title="From a spark to a shipped, reviewed project"
            sub="One flow, built for teams. A Data Science student posts an idea — and a real crew forms around it."
          />
        </ScrollReveal>

        <div className="steps-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap: '18px',
        }}>
          {STEPS.map(({ n, title, body }, i) => (
            <ScrollReveal key={n} delay={i * 60}>
              <div style={{
                position: 'relative',
                padding: '26px 24px 30px',
                borderRadius: radiusMkt.md,
                border: `1px solid ${colors.border.mkt}`,
                backgroundColor: colors.bg.mktSurface,
                height: '100%',
              }}>
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: '9px',
                  display: 'grid', placeItems: 'center',
                  fontFamily: fontFamily.mono,
                  fontSize: '14px', fontWeight: 600,
                  color: colors.accent.bright,
                  background: `rgba(${colors.accent.glowRgb},0.1)`,
                  border: `1px solid ${colors.border.accent}`,
                  marginBottom: '18px',
                }}>
                  {n}
                </div>
                <h4 style={{ fontFamily: fontFamily.head, fontSize: '17px', marginBottom: '8px' }}>{title}</h4>
                <p style={{ color: colors.text.muted2, fontSize: fontSizeMkt.nav, lineHeight: 1.55 }}>{body}</p>

                {/* Arrow — hidden on last card */}
                {i < STEPS.length - 1 && (
                  <span className="step-arrow" style={{
                    position: 'absolute',
                    right: '-13px', top: '38px',
                    color: colors.text.dim,
                    fontSize: '18px',
                    zIndex: 2,
                  }}>→</span>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Wrap>

      <style>{`
        @media (max-width: ${breakpoints.md}) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .step-arrow { display: none !important; }
        }
      `}</style>
    </section>
  )
}