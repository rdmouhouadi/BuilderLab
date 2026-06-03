import { ReactNode } from 'react'
import { colors, radiusMkt, fontSizeMkt, fontFamily } from '@/lib/design-tokens'

type Props = {
  children: ReactNode
  dot?: boolean
  style?: React.CSSProperties
}

export default function Eyebrow({ children, dot = true, style }: Props) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: fontFamily.mono,
      fontSize: fontSizeMkt.eyebrow,
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
      color: colors.accent.bright,
      padding: '5px 11px',
      border: `1px solid ${colors.border.accent}`,
      borderRadius: '999px',
      background: `rgba(${colors.accent.glowRgb},0.06)`,
      ...style,
    }}>
      {dot && (
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: colors.accent.bright,
          boxShadow: `0 0 0 3px rgba(${colors.accent.glowRgb},0.22)`,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  )
}
