// components/marketing/home/BuildInPublic.tsx
// "Build in public" philosophy section — three pillars with icons.
import ScrollReveal from '@/components/marketing/ScrollReveal'
import Eyebrow from '@/components/marketing/Eyebrow'
import { Wrap } from './shared'
import { colors, fontFamily, fontSizeMkt, breakpoints } from '@/lib/design-tokens'

const BIP_ITEMS = [
  {
    title: 'Progress in the open',
    body: 'Share milestones and decisions as you go — accountability that keeps teams shipping.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    title: 'Feedback as a feature',
    body: 'Structured peer review is built into the journey, not bolted on at the end.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    title: 'Showcased for the community',
    body: 'Top projects get featured so the next builder gets inspired — and starts theirs.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l2.4 7.4H22l-6 4.5 2.3 7.1-6.3-4.6L5.7 21l2.3-7.1-6-4.5h7.6z"/>
      </svg>
    ),
  },
]

export default function BuildInPublic() {
  return (
    <section style={{ padding: '65px 0', position: 'relative' }} id="public">
      <Wrap>
        <div className="bip-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '56px',
          alignItems: 'center',
        }}>
          <ScrollReveal>
            <Eyebrow>Build in public</Eyebrow>
            <p style={{
              fontFamily: fontFamily.head,
              fontWeight: 600,
              fontSize: 'clamp(24px, 3vw, 34px)',
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              marginTop: '20px',
            }}>
              We learn faster{' '}
              <span style={{ color: colors.accent.bright }}>in the open</span>
              {' '}— sharing progress, welcoming feedback, and building things other people can actually learn from.
            </p>
            <p style={{
              marginTop: '22px',
              color: colors.text.dim,
              fontSize: '14px',
              fontFamily: fontFamily.mono,
            }}>
              {'// the BuilderLab philosophy'}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {BIP_ITEMS.map(({ title, body, icon }) => (
                <div key={title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0,
                    width: '36px', height: '36px',
                    borderRadius: '9px',
                    display: 'grid', placeItems: 'center',
                    backgroundColor: colors.bg.surface2,
                    border: `1px solid ${colors.border.mkt}`,
                    color: colors.accent.bright,
                  }}>
                    {icon}
                  </span>
                  <div>
                    <h4 style={{ fontFamily: fontFamily.head, fontSize: '16px', marginBottom: '3px' }}>{title}</h4>
                    <p style={{ color: colors.text.muted2, fontSize: fontSizeMkt.nav, lineHeight: 1.55 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </Wrap>

      <style>{`
        @media (max-width: ${breakpoints.md}) { .bip-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  )
}