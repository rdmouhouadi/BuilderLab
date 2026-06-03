import type { Metadata } from 'next'
import Link from 'next/link'
import Eyebrow from '@/components/marketing/Eyebrow'
import ScrollReveal from '@/components/marketing/ScrollReveal'
import {
  colors, radiusMkt, fontSizeMkt, fontFamily, shadows, layout, breakpoints,
} from '@/lib/design-tokens'
import { Users, MessageSquare, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Vision',
  description: 'BuilderLab is building an ecosystem for builders — where learning through teamwork is the default, not the exception.',
}

function Wrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '100%', maxWidth: layout.maxWidth,
      margin: '0 auto', padding: `0 ${layout.wrapPadding}`, ...style,
    }}>
      {children}
    </div>
  )
}

function BtnPrimary({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: fontFamily.body, fontSize: '15px', fontWeight: 600,
      letterSpacing: '-0.01em', padding: '13px 24px',
      borderRadius: radiusMkt.sm,
      background: `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
      color: colors.accent.ink, border: '1px solid transparent',
      textDecoration: 'none', boxShadow: shadows.btnPrimary,
      whiteSpace: 'nowrap' as const,
    }}>{children}</Link>
  )
}

function BtnSoft({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: fontFamily.body, fontSize: '15px', fontWeight: 600,
      letterSpacing: '-0.01em', padding: '13px 24px',
      borderRadius: radiusMkt.sm, backgroundColor: colors.bg.surface2,
      color: colors.text.base, border: `1px solid ${colors.border.mkt}`,
      textDecoration: 'none', whiteSpace: 'nowrap' as const,
    }}>{children}</Link>
  )
}

const PILLARS = [
  {
    icon: <Users size={20} />,
    title: 'Collaboration by default',
    body: 'Working in teams is a skill. BuilderLab makes cross-functional collaboration the starting point — not an afterthought for when you join a company.',
  },
  {
    icon: <MessageSquare size={20} />,
    title: 'Quality through review',
    body: 'Peer review isn\'t grading — it\'s a conversation. HiveCheck gives you structured feedback from builders who genuinely care about the work.',
  },
  {
    icon: <Globe size={20} />,
    title: 'Built in public',
    body: 'When you work in the open, you learn faster. Progress shared is progress that compounds — for you, and for everyone watching.',
  },
]

const PRINCIPLES = [
  { title: 'Transparency accelerates learning', body: 'When you share your process — including failures — others learn, and so do you.' },
  { title: 'Feedback is a gift', body: 'We design for thoughtful, structured feedback that helps builders improve, not criticism that discourages.' },
  { title: 'Real work compounds', body: 'Every project shipped becomes a proof point. We\'re building a portfolio of results, not just practice.' },
]

const TIMELINE = [
  {
    stage: 'Live today',
    title: 'BuilderLab Core',
    body: 'Team formation, project posting, build-in-public updates, and the project feed. The foundation is live.',
    tag: 'Live',
    tagType: 'live',
  },
  {
    stage: 'In progress',
    title: 'HiveOS Workspace',
    body: 'Task boards, milestone tracking, team communication, and project documentation — all in one shared workspace.',
    tag: 'Beta',
    tagType: 'beta',
  },
  {
    stage: 'Coming soon',
    title: 'HiveCheck Peer Review',
    body: 'Mid-project and final peer review with structured rubrics. Turning good projects into portfolio-worthy ones.',
    tag: 'Planned',
    tagType: 'next',
  },
  {
    stage: 'The goal',
    title: 'A portfolio that speaks for itself',
    body: 'Builders who complete the full BuilderLab journey have real projects, real collaborators, and a real track record to show.',
    tag: 'Vision',
    tagType: 'next',
  },
]

function tagStyleForType(type: string) {
  if (type === 'live') return {
    color: colors.accent.bright, border: `1px solid ${colors.border.accent}`,
    background: `rgba(${colors.accent.glowRgb},0.08)`,
  }
  if (type === 'beta') return {
    color: colors.accent.indigoBright, border: '1px solid rgba(99,102,241,0.35)',
    background: 'rgba(99,102,241,0.1)',
  }
  return { color: colors.text.dim, border: `1px solid ${colors.border.mkt2}`, background: 'transparent' }
}

export default function VisionPage() {
  return (
    <>
      {/* Page Hero */}
      <section style={{ padding: '72px 0 8px' }}>
        <Wrap>
          <Eyebrow>Our vision</Eyebrow>
          <h1 style={{
            fontFamily: fontFamily.head,
            fontSize: fontSizeMkt.pageHero,
            lineHeight: 1.04,
            marginTop: '22px',
            textWrap: 'balance',
          } as React.CSSProperties}>
            An ecosystem<br />for builders.
          </h1>
          <p style={{
            marginTop: '22px',
            fontSize: '20px',
            lineHeight: 1.6,
            color: colors.text.muted2,
            maxWidth: '640px',
          }}>
            We&apos;re building a platform where learning through teamwork is the default — not the exception. Where every project shipped becomes proof.
          </p>
        </Wrap>
      </section>

      {/* Vision Statement */}
      <section style={{ padding: '80px 0 64px' }}>
        <Wrap>
          <ScrollReveal>
            <p style={{
              fontFamily: fontFamily.head,
              fontWeight: 600,
              fontSize: 'clamp(26px, 3.4vw, 40px)',
              lineHeight: 1.28,
              letterSpacing: '-0.02em',
              maxWidth: '900px',
            }}>
              We believe the{' '}
              <span style={{ color: colors.accent.bright }}>gap between learning and working</span>
              {' '}is closable — not by grinding courses alone,{' '}
              <span style={{ color: colors.text.dim }}>but by building real things with real people.</span>
            </p>
          </ScrollReveal>
        </Wrap>
      </section>

      {/* Pillars */}
      <section style={{ padding: '0 0 96px' }}>
        <Wrap>
          <div className="pillars-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px',
          }}>
            {PILLARS.map(({ icon, title, body }) => (
              <ScrollReveal key={title}>
                <div style={{
                  padding: '30px 28px', borderRadius: radiusMkt.md,
                  border: `1px solid ${colors.border.mkt}`, backgroundColor: colors.bg.mktSurface,
                  height: '100%',
                }}>
                  <span style={{
                    width: '42px', height: '42px', borderRadius: '11px',
                    display: 'grid', placeItems: 'center',
                    background: `rgba(${colors.accent.glowRgb},0.1)`,
                    border: `1px solid ${colors.border.accent}`,
                    color: colors.accent.bright, marginBottom: '18px',
                  }}>
                    {icon}
                  </span>
                  <h3 style={{ fontFamily: fontFamily.head, fontSize: '20px', marginBottom: '10px' }}>{title}</h3>
                  <p style={{ color: colors.text.muted2, fontSize: fontSizeMkt.bodyMd, lineHeight: 1.62 }}>{body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Wrap>

        <style>{`
          @media (max-width: ${breakpoints.md}) { .pillars-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      {/* Build in Public Banner */}
      <section style={{ padding: '0 0 96px' }}>
        <Wrap>
          <ScrollReveal>
            <div className="bip-banner" style={{
              display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '48px',
              alignItems: 'center', padding: '44px', borderRadius: radiusMkt.lg,
              border: `1px solid ${colors.border.accent}`,
              background: `
                radial-gradient(600px 300px at 90% 10%, rgba(${colors.accent.glowRgb},0.1), transparent 70%),
                linear-gradient(180deg, ${colors.bg.mktSurface}, ${colors.bg.mkt2})
              `,
            }}>
              <div>
                <h2 style={{
                  fontFamily: fontFamily.head,
                  fontSize: 'clamp(26px, 3vw, 36px)',
                  marginBottom: '14px',
                }}>
                  Why we build in public
                </h2>
                <p style={{ color: colors.text.muted2, fontSize: '16px', lineHeight: 1.65, marginBottom: '12px' }}>
                  Transparency isn&apos;t just a value — it&apos;s a strategy. When builders share their journey, they create a trail that inspires the next person.
                </p>
                <p style={{ color: colors.text.muted2, fontSize: '16px', lineHeight: 1.65 }}>
                  BuilderLab is itself built this way: you&apos;re watching the product take shape in real time.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {PRINCIPLES.map(({ title, body }) => (
                  <div key={title} style={{
                    display: 'flex', gap: '13px', alignItems: 'flex-start',
                    padding: '16px 18px', borderRadius: radiusMkt.sm,
                    backgroundColor: colors.bg.mkt, border: `1px solid ${colors.border.mkt}`,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent.bright} strokeWidth="2.2" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div>
                      <strong style={{ fontSize: '15px', display: 'block', marginBottom: '2px', fontFamily: fontFamily.head }}>{title}</strong>
                      <span style={{ color: colors.text.muted2, fontSize: '14px', lineHeight: 1.5 }}>{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </Wrap>

        <style>{`
          @media (max-width: ${breakpoints.md}) {
            .bip-banner { grid-template-columns: 1fr !important; gap: 28px !important; padding: 30px !important; }
          }
        `}</style>
      </section>

      {/* Roadmap Timeline */}
      <section style={{ padding: '0 0 96px' }}>
        <Wrap>
          <ScrollReveal>
            <div style={{ marginBottom: '48px' }}>
              <Eyebrow>Roadmap</Eyebrow>
              <h2 style={{ fontFamily: fontFamily.head, fontSize: fontSizeMkt.h2, marginTop: '18px' }}>
                Where we are, and where we&apos;re headed
              </h2>
            </div>
          </ScrollReveal>

          <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {TIMELINE.map(({ stage, title, body, tag, tagType }, i) => (
              <ScrollReveal key={stage} delay={i * 80}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 1fr',
                  gap: '28px',
                  padding: '0 0 36px',
                  position: 'relative',
                }}>
                  {/* Left: stage label */}
                  <div style={{
                    fontFamily: fontFamily.mono,
                    fontSize: '13px',
                    color: colors.text.dim,
                    textAlign: 'right',
                    paddingTop: '1px',
                  }}>
                    {stage}
                  </div>

                  {/* Right: node + content */}
                  <div style={{ position: 'relative', paddingLeft: '26px' }}>
                    {/* Vertical hairline */}
                    {i < TIMELINE.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '14px',
                        bottom: '-8px',
                        width: '1px',
                        backgroundColor: colors.border.mkt2,
                      }} />
                    )}
                    {/* Node dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-3px',
                      top: '6px',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: colors.accent.bright,
                      boxShadow: `0 0 0 4px rgba(${colors.accent.glowRgb},0.18)`,
                    }} />

                    <h4 style={{ fontFamily: fontFamily.head, fontSize: '18px', marginBottom: '6px' }}>{title}</h4>
                    <p style={{ color: colors.text.muted2, fontSize: fontSizeMkt.bodyMd, lineHeight: 1.6 }}>{body}</p>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      marginTop: '10px',
                      fontFamily: fontFamily.mono,
                      fontSize: '10px',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      ...tagStyleForType(tagType),
                    }}>
                      {tag}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Wrap>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 0 120px' }}>
        <Wrap>
          <ScrollReveal>
            <div style={{
              textAlign: 'center',
              padding: '64px 40px',
              borderRadius: radiusMkt.lg,
              border: `1px solid ${colors.border.accent}`,
              background: `
                radial-gradient(600px 300px at 50% 0%, rgba(${colors.accent.glowRgb},0.1), transparent 70%),
                linear-gradient(180deg, ${colors.bg.mktSurface}, ${colors.bg.mkt2})
              `,
            }}>
              <Eyebrow>Ready to start?</Eyebrow>
              <h2 style={{
                fontFamily: fontFamily.head, fontSize: fontSizeMkt.h2,
                marginTop: '18px', textWrap: 'balance',
              } as React.CSSProperties}>
                Be part of building what&apos;s next.
              </h2>
              <p style={{
                margin: '16px auto 0', maxWidth: '480px',
                color: colors.text.muted2, fontSize: fontSizeMkt.bodyLg,
              }}>
                Join the earliest builders on BuilderLab. Your feedback shapes the platform.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
                <BtnPrimary href="/login">Start building free</BtnPrimary>
                <BtnSoft href="/contact">Join the journey</BtnSoft>
              </div>
            </div>
          </ScrollReveal>
        </Wrap>
      </section>
    </>
  )
}
