'use client'

// Marketing navbar — shown on all public pages (home, vision, docs, contact).
// When the user is logged in it swaps the auth buttons for a "Feed" link and
// a user-initials avatar, mirroring what the app navbar shows.
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { colors, radiusMkt, fontSizeMkt, fontFamily, shadows, layout } from '@/lib/design-tokens'
import { BuilderLabLogo } from '@/components/BuilderLabLogo'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

const NAV_LINKS = [
  { href: '/vision',  label: 'Vision' },
  { href: '/docs',    label: 'Docs' },
  { href: '/contact', label: 'Contact' },
]

// Derive up to two capital letters from a name or email to use as an avatar
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export default function MktNavbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Auth state — null means "not yet checked", false means "not logged in"
  const [userInitials, setUserInitials] = useState<string | null>(null)
  const [loggedIn, setLoggedIn]         = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    // Load the current session and user profile on mount
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoggedIn(false); return }

      // Fetch the profile to get the user's display name for initials
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, first_name, last_name')
        .eq('id', session.user.id)
        .single()

      const displayName = profile?.name
        ?? (profile?.first_name ? `${profile.first_name} ${profile.last_name ?? ''}`.trim() : null)

      setUserInitials(getInitials(displayName, session.user.email ?? ''))
      setLoggedIn(true)
    }

    loadUser()

    // Keep auth state in sync when the user signs in or out in another tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setLoggedIn(false); setUserInitials(null) }
      else loadUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  // Don't flash the wrong buttons while we wait for the session check
  if (loggedIn === null) return null

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      backgroundColor: `rgba(10,13,17,0.72)`,
      borderBottom: `1px solid ${colors.border.mkt}`,
    }}>
      <div style={{
        width: '100%',
        maxWidth: layout.maxWidth,
        margin: '0 auto',
        padding: `0 ${layout.wrapPadding}`,
        height: layout.navHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        position: 'relative',
      }}>
        {/* Left: logo */}
        <Link href="/" aria-label="BuilderLab home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <BuilderLabLogo markSize={28} />
        </Link>

        {/* Center: nav links — hidden below 880px */}
        <div className="mkt-nav-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '7px 13px',
                  borderRadius: radiusMkt.sm,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? colors.text.base : colors.text.muted2,
                  backgroundColor: active ? colors.bg.surface2 : 'transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = colors.text.base
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = colors.text.muted2
                    ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right: auth buttons (or Feed + avatar when logged in) — hidden below 880px */}
        <div className="mkt-nav-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {loggedIn ? (
            // ── Logged-in state ───────────────────────────────────
            <>
              {/* Feed button replaces "Sign in" */}
              <Link
                href="/feed"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fontFamily.body,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  padding: '10px 18px',
                  borderRadius: radiusMkt.sm,
                  border: `1px solid ${colors.border.mkt2}`,
                  backgroundColor: 'transparent',
                  color: colors.text.soft,
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = colors.text.base
                  ;(e.currentTarget as HTMLElement).style.borderColor = colors.text.dim
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = colors.text.soft
                  ;(e.currentTarget as HTMLElement).style.borderColor = colors.border.mkt2
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                Projects
              </Link>

              {/* User avatar (initials) replaces "Sign up" */}
              <Link
                href="/profile"
                aria-label="Your profile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.accent.bright}, ${colors.accent.deep})`,
                  color: colors.accent.ink,
                  fontFamily: fontFamily.body,
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                {userInitials ?? '??'}
              </Link>
            </>
          ) : (
            // ── Logged-out state ──────────────────────────────────
            <>
              {/* Sign in button */}
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fontFamily.body,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  padding: '10px 18px',
                  borderRadius: radiusMkt.sm,
                  border: `1px solid ${colors.border.mkt2}`,
                  backgroundColor: 'transparent',
                  color: colors.text.soft,
                  textDecoration: 'none',
                  transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = colors.text.base
                  ;(e.currentTarget as HTMLElement).style.borderColor = colors.text.dim
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = colors.text.soft
                  ;(e.currentTarget as HTMLElement).style.borderColor = colors.border.mkt2
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                Sign in
              </Link>

              {/* Sign up button */}
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fontFamily.body,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  padding: '10px 18px',
                  borderRadius: radiusMkt.sm,
                  background: `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
                  color: colors.accent.ink,
                  border: '1px solid transparent',
                  textDecoration: 'none',
                  boxShadow: shadows.btnPrimary,
                  transition: 'box-shadow 0.15s, transform 0.12s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = shadows.btnPrimaryHover
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = shadows.btnPrimary
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — visible below 880px */}
        <button
          className="mkt-hamburger"
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none',
            border: `1px solid ${colors.border.mkt2}`,
            borderRadius: radiusMkt.sm,
            color: colors.text.muted2,
            cursor: 'pointer',
            padding: '6px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          borderTop: `1px solid ${colors.border.mkt}`,
          backgroundColor: colors.bg.mktSurface,
          padding: '12px 20px 20px',
        }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: radiusMkt.sm,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? colors.accent.bright : colors.text.muted2,
                  backgroundColor: active ? `rgba(${colors.accent.glowRgb},0.07)` : 'transparent',
                  marginBottom: '2px',
                }}
              >
                {label}
              </Link>
            )
          })}

          <div style={{ height: '1px', backgroundColor: colors.border.mkt, margin: '12px 0' }} />

          {/* Mobile auth buttons — also switch based on login state */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {loggedIn ? (
              <>
                <Link href="/feed" onClick={() => setMenuOpen(false)} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: radiusMkt.sm,
                  border: `1px solid ${colors.border.mkt2}`,
                  color: colors.text.soft,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>Projects</Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: radiusMkt.sm,
                  background: `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
                  color: colors.accent.ink,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>My profile</Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: radiusMkt.sm,
                  border: `1px solid ${colors.border.mkt2}`,
                  color: colors.text.soft,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>Sign in</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: radiusMkt.sm,
                  background: `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
                  color: colors.accent.ink,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .mkt-nav-links { display: none !important; }
          .mkt-nav-right  { display: none !important; }
          .mkt-hamburger  { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
