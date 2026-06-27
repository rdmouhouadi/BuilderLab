// components/marketing/home/Problem.tsx
// "The gap" section — three reasons learners struggle before they start.
import ScrollReveal from '@/components/marketing/ScrollReveal'
import { Wrap, SectionHead } from './shared'
import { colors, radiusMkt, fontFamily, fontSizeMkt, breakpoints } from '@/lib/design-tokens'

const PROBLEMS = [
  { n: '01', title: "You don't know what to build", body: "Tutorials end and the blank page begins. Picking a problem worth solving is its own skill." },
  { n: '02', title: "You can't find committed collaborators", body: 'Plenty of people say "let\'s build something." Far fewer show up on week three.' },
  { n: '03', title: "Building alone is tough", body: 'No code review, no momentum, no one to unblock you. Motivation quietly drains away.' },
]

export default function Problem() {
  return (
    <section style={{ padding: '65px 0', position: 'relative' }} id="problem">
      <Wrap>
        <ScrollReveal>
          <SectionHead
            eyebrow="The gap"
            title="To stand out as a junior, you need proof. Building it alone is the hard part."
            sub="The market wants projects that solve real problems. But three things stop most learners before they start."
          />
        </ScrollReveal>

        <div className="problem-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: '20px',
        }}>
          {PROBLEMS.map(({ n, title, body }) => (
            <ScrollReveal key={n}>
              <div style={{
                padding: '28px',
                borderRadius: radiusMkt.md,
                border: `1px solid ${colors.border.mkt}`,
                backgroundColor: colors.bg.mktSurface,
                height: '100%',
              }}>
                <div style={{
                  fontFamily: fontFamily.mono,
                  fontSize: '13px',
                  color: colors.accent.bright,
                  marginBottom: '14px',
                }}>
                  {n}
                </div>
                <h4 style={{
                  fontFamily: fontFamily.head,
                  fontSize: '19px',
                  marginBottom: '8px',
                }}>
                  {title}
                </h4>
                <p style={{ color: colors.text.muted2, fontSize: fontSizeMkt.bodyMd, lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div style={{
            marginTop: '32px',
            padding: '28px 32px',
            borderRadius: radiusMkt.md,
            border: `1px solid ${colors.border.accent}`,
            background: `linear-gradient(120deg, rgba(${colors.accent.glowRgb},0.07), transparent 70%)`,
            fontFamily: fontFamily.head,
            fontWeight: 600,
            fontSize: 'clamp(20px, 2.4vw, 27px)',
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}>
            Once we&apos;re hired, we&apos;re expected to work in teams.
            So why are we only building personal projects{' '}
            <strong style={{ color: colors.accent.bright, fontWeight: 600 }}>solo?</strong>
          </div>
        </ScrollReveal>
      </Wrap>

      <style>{`
        @media (max-width: ${breakpoints.md}) { .problem-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}