// components/marketing/home/Strip.tsx
// Thin horizontal strip below the hero listing the core flow steps.
import { Wrap } from './shared'
import { colors, fontFamily } from '@/lib/design-tokens'

const STRIP_ITEMS = ['Post an idea', 'Form a team', 'Build together', 'Get peer review', 'Showcase & learn']

export default function Strip() {
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