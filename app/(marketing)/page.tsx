import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Eyebrow from '@/components/marketing/Eyebrow'
import ScrollReveal from '@/components/marketing/ScrollReveal'
import PrimaryCtaButton from '@/components/marketing/PrimaryCtaButton'
import {
  colors, radiusMkt, fontSizeMkt, fontFamily, fontFamily as ff,
  shadows, layout, breakpoints,
} from '@/lib/design-tokens'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'BuilderLab — Build real projects, with a real team',
  description:
    'BuilderLab is where solo learners become teams. Post an idea, form a cross-functional crew, and build portfolio-worthy projects with structured peer review.',
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Wrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: layout.maxWidth,
      margin: '0 auto',
      padding: `0 ${layout.wrapPadding}`,
      ...style,
    }}>
      {children}
    </div>
  )
}

function BtnPrimary({ href, children, lg }: { href: string; children: React.ReactNode; lg?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fontFamily.body,
      fontSize: lg ? '15px' : fontSizeMkt.nav,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      padding: lg ? '13px 24px' : '10px 18px',
      borderRadius: radiusMkt.sm,
      background: `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
      color: colors.accent.ink,
      border: '1px solid transparent',
      textDecoration: 'none',
      boxShadow: shadows.btnPrimary,
      transition: 'box-shadow 0.15s, transform 0.12s',
      whiteSpace: 'nowrap' as const,
    }}>
      {children}
    </Link>
  )
}

function BtnSoft({ href, children, lg }: { href: string; children: React.ReactNode; lg?: boolean }) {
  return (
    <Link href={href} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fontFamily.body,
      fontSize: lg ? '15px' : fontSizeMkt.nav,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      padding: lg ? '13px 24px' : '10px 18px',
      borderRadius: radiusMkt.sm,
      backgroundColor: colors.bg.surface2,
      color: colors.text.base,
      border: `1px solid ${colors.border.mkt}`,
      textDecoration: 'none',
      transition: 'background 0.15s, border-color 0.15s',
      whiteSpace: 'nowrap' as const,
    }}>
      {children}
    </Link>
  )
}

function SectionHead({
  eyebrow, title, sub, center,
}: {
  eyebrow: string
  title: React.ReactNode
  sub?: string
  center?: boolean
}) {
  return (
    <div style={{
      maxWidth: '680px',
      marginBottom: '52px',
      ...(center ? { marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' as const } : {}),
    }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{
        fontFamily: fontFamily.head,
        fontSize: fontSizeMkt.h2,
        marginTop: '18px',
        textWrap: 'balance',
      } as React.CSSProperties}>
        {title}
      </h2>
      {sub && (
        <p style={{
          marginTop: '18px',
          color: colors.text.muted2,
          fontSize: fontSizeMkt.bodyLg,
          lineHeight: 1.65,
        }}>
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
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

// ─── STRIP ────────────────────────────────────────────────────────────────────

const STRIP_ITEMS = ['Post an idea', 'Form a team', 'Build together', 'Get peer review', 'Showcase & learn']

function Strip() {
  return (
    <div style={{
      borderTop: `1px solid ${colors.border.mkt}`,
      borderBottom: `1px solid ${colors.border.mkt}`,
      backgroundColor: colors.bg.mkt2,
      padding: '22px 0',
    }}>
      <Wrap>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '36px',
          flexWrap: 'wrap' as const,
          color: colors.text.dim,
          fontSize: '13.5px',
          fontFamily: fontFamily.mono,
          letterSpacing: '0.02em',
        }}>
          {STRIP_ITEMS.map(item => (
            <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
              <span style={{
                width: '4px', height: '4px',
                borderRadius: '50%',
                backgroundColor: colors.accent.bright,
                display: 'block',
              }} />
              {item}
            </span>
          ))}
        </div>
      </Wrap>
    </div>
  )
}

// ─── PROBLEM ─────────────────────────────────────────────────────────────────

const PROBLEMS = [
  { n: '01', title: "You don't know what to build", body: "Tutorials end and the blank page begins. Picking a problem worth solving is its own skill." },
  { n: '02', title: "You can't find committed collaborators", body: 'Plenty of people say "let\'s build something." Far fewer show up on week three.' },
  { n: '03', title: "Building alone is tough", body: 'No code review, no momentum, no one to unblock you. Motivation quietly drains away.' },
]

function Problem() {
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

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────

const STEPS = [
  { n: '1', title: 'Post an idea', body: '"I want to build something in healthcare." Define scope, roles, and the stack you\'re after.' },
  { n: '2', title: 'Your team forms', body: 'An SWE joins. A Data Analyst or Data Engineer jumps in. Complementary skills, one goal.' },
  { n: '3', title: 'Build in the open', body: 'Plan, commit, and document together — building something that could become a real product.' },
  { n: '4', title: 'Get reviewed & showcased', body: 'Structured peer review keeps quality high. Top projects get featured for others to learn from.' },
]

function HowItWorks() {
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

// ─── ECOSYSTEM ───────────────────────────────────────────────────────────────

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

function Ecosystem() {
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

// ─── BUILD IN PUBLIC ──────────────────────────────────────────────────────────

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

function BuildInPublic() {
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

// ─── FINAL CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
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

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <Strip />
      <Problem />
      <HowItWorks />
      <Ecosystem />
      <BuildInPublic />
      <FinalCTA />
      <Analytics />
    </>
  )
}
