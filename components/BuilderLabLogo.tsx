// components/BuilderLabLogo.tsx
// "Hive Trio" mark + wordmark lockup.
// BuilderLabMark  — icon only (color or mono variant)
// BuilderLabLogo  — horizontal lockup: mark + "Builder Lab" wordmark
import { useId } from 'react'
import { colors, fontFamily } from '@/lib/design-tokens'

// ─── Geometry (viewBox 0 0 100 100, flat-top hexagons, radius 15) ────────────
const TOP = '65,29 57.5,41.99 42.5,41.99 35,29 42.5,16.01 57.5,16.01'
const BL  = '48,57 40.5,69.99 25.5,69.99 18,57 25.5,44.01 40.5,44.01'
const BR  = '82,57 74.5,69.99 59.5,69.99 52,57 59.5,44.01 74.5,44.01'

// ─────────────────────────────────────────────────────────────────────────────

type Tone = 'color' | 'mono'

interface MarkProps {
  size?: number
  tone?: Tone
  className?: string
  style?: React.CSSProperties
}

/**
 * Hive Trio mark — icon only.
 * color: three-shade teal with gradient top cell.
 * mono : single currentColor (works on any bg, depth via opacity).
 */
export function BuilderLabMark({ size = 32, tone = 'color', className, style }: MarkProps) {
  const gid = useId()

  // The hexagons span y=16–70 in the 100×100 viewBox (visual centre y=43, not 50).
  // translate(0,7) shifts them down so the mark centres at y=50 and aligns
  // with adjacent text without changing the brand geometry.
  if (tone === 'mono') {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size} height={size}
        fill="currentColor"
        className={className}
        style={style}
        role="img"
        aria-label="BuilderLab"
      >
        <g transform="translate(0,7)">
          <polygon points={TOP} />
          <polygon points={BL} opacity={0.8} />
          <polygon points={BR} opacity={0.6} />
        </g>
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size} height={size}
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label="BuilderLab"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colors.accent.bright} />
          <stop offset="1" stopColor={colors.accent.deep} />
        </linearGradient>
      </defs>
      <g transform="translate(0,7)">
        <polygon points={TOP} fill={`url(#${gid})`} />
        <polygon points={BL}  fill={colors.accent.base} />
        <polygon points={BR}  fill={colors.accent.deep} />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface LogoProps {
  markSize?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Full horizontal lockup: Hive Trio mark + "BuilderLab" wordmark.
 * "Builder" renders in the primary text color; "Lab" in accent bright.
 * Font: Sora 700, tracking -0.03em — matches LOGO_PROMPT.md spec.
 */
export function BuilderLabLogo({ markSize = 28, className, style }: LogoProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        ...style,
      }}
    >
      <BuilderLabMark size={markSize} />
      <span style={{
        fontFamily: fontFamily.head,
        fontWeight: 700,
        fontSize: `${Math.round(markSize * 0.62)}px`,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ color: colors.text.base }}>Builder</span>
        <span style={{ color: colors.accent.bright }}>Lab</span>
      </span>
    </span>
  )
}
