'use client'

// Auth-aware primary CTA button for the landing page.
// Shows "Start building → /login" for visitors, "Continue building → /feed" for logged-in users.
// Defaults to the logged-out label on first render to avoid layout shift for most visitors.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { colors, radiusMkt, fontSizeMkt, fontFamily, shadows } from '@/lib/design-tokens'

type Props = { lg?: boolean }

export default function PrimaryCtaButton({ lg }: Props) {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()
    // Check the session once on mount — no subscription needed here
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLoggedIn(true)
    })
  }, [])

  const href  = loggedIn ? '/feed'  : '/login'
  const label = loggedIn ? 'Continue building' : 'Start building'

  return (
    <Link
      href={href}
      style={{
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
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Link>
  )
}
