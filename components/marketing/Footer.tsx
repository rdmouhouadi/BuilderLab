'use client'

import Link from 'next/link'
import { BuilderLabLogo } from '@/components/BuilderLabLogo'
import { colors, radiusMkt, fontSizeMkt, fontFamily, layout } from '@/lib/design-tokens'

const FOOTER_COLS = [
  {
    title: 'Platform',
    links: [
      { label: 'How it works', href: '/#how' },
      { label: 'Ecosystem',    href: '/#ecosystem' },
      { label: 'Docs',         href: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Vision',         href: '/vision' },
      { label: 'Build in public', href: '/#public' },
      { label: 'Contact',        href: '/contact' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { label: 'Sign in',         href: '/login' },
      { label: 'Sign up',         href: '/login' },
      { label: 'Join the journey', href: '/contact' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${colors.border.mkt}`,
      backgroundColor: colors.bg.mkt2,
      padding: '56px 0 40px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: layout.maxWidth,
        margin: '0 auto',
        padding: `0 ${layout.wrapPadding}`,
      }}>
        {/* Grid */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: '40px',
        }}>
          {/* Brand column */}
          <div>
            {/* logo */}
            <Link href="/" aria-label="BuilderLab home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <BuilderLabLogo markSize={28} />
            </Link>
            <p style={{
              color: colors.text.muted2,
              fontSize: fontSizeMkt.nav,
              maxWidth: '280px',
              lineHeight: 1.6,
            }}>
              For anyone who learns by building. Find a team, build in public, ship something real.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <h5 style={{
                fontFamily: fontFamily.body,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: colors.text.dim,
                margin: '0 0 16px',
                fontWeight: 600,
              }}>
                {col.title}
              </h5>
              {col.links.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  style={{
                    display: 'block',
                    color: colors.text.muted2,
                    fontSize: fontSizeMkt.nav,
                    padding: '5px 0',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = colors.text.base
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = colors.text.muted2
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: `1px solid ${colors.border.mkt}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap' as const,
          color: colors.text.dim,
          fontSize: '13px',
        }}>
          <span>© 2025 BuilderLab. Built in public.</span>
          <span style={{
            fontFamily: fontFamily.mono,
            fontSize: '11px',
            color: colors.accent.bright,
            padding: '3px 9px',
            border: `1px solid ${colors.border.accent}`,
            borderRadius: radiusMkt.xl,
          }}>
            v0.5 — early access
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </footer>
  )
}
