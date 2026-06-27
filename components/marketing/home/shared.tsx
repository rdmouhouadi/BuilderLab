// components/marketing/home/shared.tsx
// Shared layout and button primitives used across multiple
// landing page sections (Hero, Problem, HowItWorks, FinalCTA, etc.)
import Link from 'next/link'
import Eyebrow from '@/components/marketing/Eyebrow'
import {
  colors, radiusMkt, fontSizeMkt, fontFamily,
  shadows, layout,
} from '@/lib/design-tokens'

// ─── Wrap ─────────────────────────────────────────────────────────────────────
// Centers content at the standard marketing page width

export function Wrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
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

// ─── BtnPrimary ───────────────────────────────────────────────────────────────
// Gradient CTA button — kept available for future sections even though
// the current page uses PrimaryCtaButton (auth-aware) for its main CTAs

export function BtnPrimary({ href, children, lg }: { href: string; children: React.ReactNode; lg?: boolean }) {
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

// ─── BtnSoft ──────────────────────────────────────────────────────────────────
// Secondary/ghost CTA button — used for "Read the vision", "Join the journey"

export function BtnSoft({ href, children, lg }: { href: string; children: React.ReactNode; lg?: boolean }) {
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

// ─── SectionHead ──────────────────────────────────────────────────────────────
// Eyebrow + title + optional subtitle, used at the top of every major section

export function SectionHead({
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