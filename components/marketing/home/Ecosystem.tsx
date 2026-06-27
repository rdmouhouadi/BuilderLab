// components/marketing/home/Ecosystem.tsx
// "The ecosystem" section — BuilderLab Core / HiveOS / HiveCheck layer cards.
import ScrollReveal from '@/components/marketing/ScrollReveal'
import { Wrap, SectionHead } from './shared'
import { colors, radiusMkt, fontFamily, shadows, breakpoints } from '@/lib/design-tokens'

const ECO_CARDS = [
  {
    stage: 'Layer 01 — Foundation',
    name: 'BuilderLab Core',
    badge: 'Live',
    badgeType: 'live',
    tag: 'Find your team',
    body: 'Post ideas, discover projects, and assemble a committed cross-functional crew. The front door to everything you build here.',
  },
  {
    stage: 'Layer 02 — Workflow',
    name: 'HiveOS',
    badge: 'Beta',
    badgeType: 'beta',
    tag: 'Organize the build',
    body: 'A shared workspace for tasks, docs, and progress — so teams stay aligned and momentum never stalls mid-project.',
  },
  {
    stage: 'Layer 03 — Quality',
    name: 'HiveCheck',
    badge: 'Soon',
    badgeType: 'next',
    tag: 'Structured peer review',
    body: 'Mid-project feedback when you\'re stuck, plus a final review before completion — turning good projects into portfolio-worthy ones.',
  },
]

// Returns the color/border/background combo for a given badge type
function badgeStyle(type: string) {
  if (type === 'live') return {
    color: colors.accent.bright,
    border: `1px solid ${colors.border.accent}`,
    background: `rgba(${colors.accent.glowRgb},0.08)`,
  }
  if (type === 'beta') return {
    color: colors.accent.indigoBright,
    border: '1px solid rgba(99,102,241,0.35)',
    background: 'rgba(99,102,241,0.1)',
  }
  return {
    color: colors.text.dim,
    border: `1px solid ${colors.border.mkt2}`,
    background: 'transparent',
  }
}

export default function Ecosystem() {
  return (
    <section style={{ padding: '65px 0', position: 'relative' }} id="ecosystem">
      <Wrap>
        <ScrollReveal>
          <SectionHead
            eyebrow="The ecosystem"
            title="One platform, built in layers"
            sub="BuilderLab grows with you — from finding your team, to organizing the work, to guaranteeing the quality."
          />
        </ScrollReveal>

        <div className="eco-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: '18px',
          alignItems: 'stretch',
        }}>
          {ECO_CARDS.map(({ stage, name, badge, badgeType, tag, body }) => (
            <ScrollReveal key={name}>
              <div style={{
                padding: '30px 28px 32px',
                borderRadius: radiusMkt.lg,
                border: `1px solid ${colors.border.mkt}`,
                background: `linear-gradient(180deg, ${colors.bg.mktSurface} 0%, ${colors.bg.mkt2} 100%)`,
                boxShadow: shadows.card,
                display: 'flex',
                flexDirection: 'column' as const,
                height: '100%',
              }}>
                <div style={{
                  fontFamily: fontFamily.mono,
                  fontSize: '12px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase' as const,
                  color: colors.text.dim,
                  marginBottom: '14px',
                }}>
                  {stage}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h3 style={{ fontFamily: fontFamily.head, fontSize: '23px' }}>{name}</h3>
                  <span style={{
                    fontFamily: fontFamily.mono,
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '999px',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    ...badgeStyle(badgeType),
                  }}>
                    {badge}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: colors.accent.bright, fontWeight: 500, marginBottom: '14px' }}>
                  {tag}
                </div>
                <p style={{ color: colors.text.muted2, fontSize: '14.5px', lineHeight: 1.6, flex: 1 }}>{body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Connector row */}
        <div className="eco-connector" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          marginTop: '26px',
          color: colors.text.dim,
          fontFamily: fontFamily.mono,
          fontSize: '13px',
        }}>
          <span>Find</span>
          <span style={{ height: '1px', width: '60px', backgroundColor: colors.border.mkt2 }} />
          <span>Build</span>
          <span style={{ height: '1px', width: '60px', backgroundColor: colors.border.mkt2 }} />
          <span>Review</span>
        </div>
      </Wrap>

      <style>{`
        @media (max-width: ${breakpoints.md}) {
          .eco-grid { grid-template-columns: 1fr !important; }
          .eco-connector { display: none !important; }
        }
      `}</style>
    </section>
  )
}