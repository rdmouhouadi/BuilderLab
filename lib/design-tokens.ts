// lib/design-tokens.ts
// Single source of truth for all design tokens.
// Every component imports from here — no hardcoded hex values elsewhere.

export const colors = {
  bg: {
    base:     '#0A0A0B',  // page background
    surface:  '#111113',  // navbar, panels
    elevated: '#18181B',  // cards, dropdowns
    hover:    '#1E1E22',  // hover states
  },
  border: {
    default: 'rgba(255,255,255,0.06)',
    hover:   'rgba(255,255,255,0.12)',
    active:  'rgba(255,255,255,0.18)',
  },
  text: {
    primary:   '#FAFAFA',
    secondary: '#A1A1AA',
    muted:     '#52525B',
  },
  accent: {
    teal:         '#0D9488',
    tealDim:      'rgba(13,148,136,0.12)',
    tealBorder:   'rgba(13,148,136,0.25)',
    tealText:     '#2DD4BF',
    indigo:       '#6366F1',
    indigoDim:    'rgba(99,102,241,0.12)',
    indigoBorder: 'rgba(99,102,241,0.25)',
    indigoText:   '#A5B4FC',
  },
  status: {
    danger:      '#EF4444',
    dangerDim:   'rgba(239,68,68,0.12)',
    success:     '#10B981',
    successDim:  'rgba(16,185,129,0.12)',
    warning:     '#F59E0B',
    warningDim:  'rgba(245,158,11,0.12)',
  },
} as const

export const radius = {
  sm:   '4px',
  md:   '6px',
  lg:   '8px',
  xl:   '10px',
  xxl:  '12px',
  full: '9999px',
} as const

export const fontSize = {
  xs:   '10px',
  sm:   '11px',
  base: '12px',
  md:   '13px',
  lg:   '15px',
  xl:   '18px',
  xxl:  '22px',
} as const

// Pre-built style objects reused across components
export const styles = {
  // Surface card — elevated bg + default border
  card: {
    backgroundColor: colors.bg.elevated,
    border: `0.5px solid ${colors.border.default}`,
    borderRadius: radius.xxl,
  },
  // Tag/pill — neutral monochrome
  tag: {
    backgroundColor: colors.bg.hover,
    border: `0.5px solid ${colors.border.default}`,
    borderRadius: radius.md,
    color: colors.text.secondary,
    fontSize: fontSize.xs,
    padding: '2px 7px',
    display: 'inline-block' as const,
  },
  // Primary action button — teal filled
  btnPrimary: {
    backgroundColor: colors.accent.teal,
    color: '#ffffff',
    border: 'none',
    borderRadius: radius.lg,
    fontSize: fontSize.base,
    fontWeight: 500,
    padding: '5px 12px',
    cursor: 'pointer',
  },
  // Ghost button — teal tinted
  btnTeal: {
    backgroundColor: colors.accent.tealDim,
    color: colors.accent.tealText,
    border: `0.5px solid ${colors.accent.tealBorder}`,
    borderRadius: radius.lg,
    fontSize: fontSize.sm,
    fontWeight: 500,
    padding: '5px 12px',
    cursor: 'pointer',
  },
  // Ghost button — indigo tinted (HiveCheck)
  btnIndigo: {
    backgroundColor: colors.accent.indigoDim,
    color: colors.accent.indigoText,
    border: `0.5px solid ${colors.accent.indigoBorder}`,
    borderRadius: radius.lg,
    fontSize: fontSize.sm,
    fontWeight: 500,
    padding: '5px 12px',
    cursor: 'pointer',
  },
  // Ghost button — neutral
  btnGhost: {
    backgroundColor: 'transparent',
    color: colors.text.muted,
    border: `0.5px solid ${colors.border.default}`,
    borderRadius: radius.lg,
    fontSize: fontSize.sm,
    padding: '5px 12px',
    cursor: 'pointer',
  },
  // Avatar circle
  avatar: (size = 28) => ({
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: radius.lg,
    background: colors.accent.teal,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: fontSize.xs,
    fontWeight: 500,
    color: '#ffffff',
    flexShrink: 0 as const,
  }),
} as const