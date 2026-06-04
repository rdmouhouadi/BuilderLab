// lib/design-tokens.ts
// Single source of truth for all design tokens — app AND marketing site.
// Every component imports from here — no hardcoded hex values elsewhere.

export const colors = {
  bg: {
    // Unified with marketing — same warm dark palette across the whole product
    base:       '#0a0d11',   // page background
    surface:    '#12181f',   // navbar, panels
    elevated:   '#161d27',   // cards, dropdowns
    hover:      '#1b232e',   // hover states
    // Marketing aliases (same values — kept for semantic clarity)
    mkt:        '#0a0d11',
    mkt2:       '#0c1016',   // strip, footer, card gradient end
    mktSurface: '#12181f',
    surface2:   '#161d27',
    surface3:   '#1b232e',
  },
  border: {
    default: 'rgba(255,255,255,0.07)',
    hover:   'rgba(255,255,255,0.12)',
    active:  'rgba(255,255,255,0.18)',
    mkt:     'rgba(255,255,255,0.07)',
    mkt2:    'rgba(255,255,255,0.11)',
    accent:  'rgba(45,212,191,0.28)',
  },
  text: {
    primary:   '#FAFAFA',
    secondary: '#A1A1AA',
    muted:     '#52525B',
    // Unified text scale (used across app + marketing)
    base:  '#eef2f6',
    soft:  '#c2cbd5',
    muted2: '#8a94a0',
    dim:   '#5c6773',
  },
  accent: {
    // ─── Teal family ──────────────────────────────────────────────────────────
    // Canonical marketing names
    base:         '#14b8a6',              // primary fill — buttons, badges
    deep:         '#0d9488',              // gradient base, icon fill
    bright:       '#2dd4bf',             // highlight text, active states
    ink:          '#04201d',             // text on teal fills
    glowRgb:      '20 184 166',
    // App aliases (same values)
    teal:         '#0d9488',              // == deep
    tealDim:      'rgba(13,148,136,0.12)',
    tealBorder:   'rgba(13,148,136,0.25)',
    tealText:     '#2dd4bf',              // == bright
    // ─── Indigo family (HiveCheck) ────────────────────────────────────────────
    indigo:       '#6366F1',              // primary indigo fill
    indigoDeep:   '#4338CA',             // deep indigo (mirrors teal.deep)
    indigoBright: '#818cf8',             // medium indigo — links, tags
    indigoText:   '#A5B4FC',             // highlight indigo text
    indigoInk:    '#1e1b4b',             // text on indigo fills (mirrors teal.ink)
    indigoDim:    'rgba(99,102,241,0.12)',
    indigoBorder: 'rgba(99,102,241,0.25)',
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

// ─── App UI radii (small, pixel-precise) ────────────────────────────────────
export const radius = {
  sm:   '4px',
  md:   '6px',
  lg:   '8px',
  xl:   '10px',
  xxl:  '12px',
  full: '9999px',
} as const

// ─── Marketing site radii (larger, rounder) ─────────────────────────────────
export const radiusMkt = {
  xs: '6px',   // --r-xs  chips, tags
  sm: '8px',   // --r-sm  buttons, inputs, cards
  md: '12px',  // --r-md  section cards
  lg: '16px',  // --r-lg  ecosystem cards, bip-banner
  xl: '22px',  // --r-xl  CTA box, large containers
} as const

// ─── App UI font sizes ───────────────────────────────────────────────────────
// Scale: xs < sm < md < base < lg < xl < xxl
// md is a dense label size (13px), slightly below base — used for compact UI text
export const fontSize = {
  xs:   '11px',
  sm:   '12px',
  md:   '13px',
  base: '14px',
  lg:   '15px',
  xl:   '18px',
  xxl:  '22px',
} as const

// ─── Marketing typography sizes ──────────────────────────────────────────────
export const fontSizeMkt = {
  eyebrow: '12px',    // pill labels, mono eyebrows
  nav:     '14px',    // nav links, footer links, body text
  body:    '16px',    // default marketing body
  bodyMd:  '15px',    // section card body text
  bodyLg:  '18px',    // section subtitles
  lead:    '19px',    // hero sub
  h4:      '17px',    // step cards
  h3:      '23px',    // ecosystem card names
  h2sm:    'clamp(26px, 3vw, 36px)',
  h2:      'clamp(30px, 4vw, 44px)',
  h2lg:    'clamp(32px, 4.4vw, 52px)',
  pageHero:'clamp(36px, 5vw, 58px)',
  hero:    'clamp(40px, 5.4vw, 68px)',
} as const

// ─── Font families ────────────────────────────────────────────────────────────
export const fontFamily = {
  head: '"Sora", "Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
} as const

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  card:     '0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 50px -28px rgba(0,0,0,0.8)',
  heroShot: '0 40px 90px -40px rgba(0,0,0,0.95), 0 2px 0 rgba(255,255,255,0.05) inset',
  btnPrimary: '0 8px 22px -10px rgba(20,184,166,0.85)',
  btnPrimaryHover: '0 10px 28px -8px rgba(20,184,166,1)',
  logoMark: '0 4px 14px -4px rgba(20,184,166,0.7)',
} as const

// ─── Layout constants ─────────────────────────────────────────────────────────
export const layout = {
  maxWidth:     '1200px',
  wrapPadding:  '32px',
  wrapPaddingSm:'20px',
  sectionPad:   '96px 0',
  sectionPadSm: '64px 0',
  navHeight:    '64px',
} as const

// ─── Responsive breakpoints ───────────────────────────────────────────────────
export const breakpoints = {
  md:  '980px',  // hero/grid collapse to single column
  nav: '880px',  // hide nav links, 2-col footer, drop section pad
  sm:  '560px',  // small hero media adjustments
} as const

// ─── Pre-built style objects reused across components ─────────────────────────
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
