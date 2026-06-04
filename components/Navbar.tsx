// components/Navbar.tsx
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Layers, Users, Star, Bell } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import {
  colors, radius, radiusMkt, fontSize, fontSizeMkt, styles,
  shadows, fontFamily, layout,
} from '@/lib/design-tokens'
import type { User } from '@supabase/supabase-js'
import type { Notification } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  requiresAuth?: boolean
  isHiveCheck?: boolean
}

type UserProfile = {
  first_name: string | null
  last_name: string | null
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { href: '/feed',        label: 'Projects',    icon: Layers },
  { href: '/hivecheck',   label: 'HiveCheck',   icon: Star,  isHiveCheck: true },
  { href: '/connections', label: 'Connections', icon: Users, requiresAuth: true },
]

// ─────────────────────────────────────────
// Sub-component: NavLogo
// ─────────────────────────────────────────

function NavLogo() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <span style={{
        width: '28px', height: '28px',
        borderRadius: '8px',
        background: `linear-gradient(150deg, ${colors.accent.bright}, ${colors.accent.deep})`,
        boxShadow: shadows.logoMark,
        display: 'grid', placeItems: 'center',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
            stroke={colors.accent.ink} strokeWidth="1.7" strokeLinejoin="round"
            fill="rgba(4,32,29,0.18)" />
          <path d="M12 7.2L7 10v4l5 2.8 5-2.8v-4l-5-2.8z" fill={colors.accent.ink} />
        </svg>
      </span>
      <span style={{
        fontFamily: fontFamily.head,
        fontWeight: 700,
        fontSize: '17px',
        letterSpacing: '-0.02em',
        color: colors.text.base,
      }}>
        BuilderLab
      </span>
    </Link>
  )
}

// ─────────────────────────────────────────
// Sub-component: NavLinks (flat, no capsule)
// ─────────────────────────────────────────

type NavLinksProps = {
  user: User | null
  pendingCount: number
}

function NavLinks({ user, pendingCount }: NavLinksProps) {
  const pathname = usePathname()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {NAV_ITEMS.map(item => {
        if (item.requiresAuth && !user) return null

        const isActive = pathname === item.href
        const isHive = item.isHiveCheck

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 13px',
              borderRadius: radiusMkt.sm,
              fontSize: fontSizeMkt.nav,
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive
                ? isHive ? colors.accent.indigoText : colors.text.base
                : colors.text.muted2,
              backgroundColor: isActive ? colors.bg.elevated : 'transparent',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.text.base
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.text.muted2
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              }
            }}
          >
            <item.icon size={13} />
            <span>{item.label}</span>

            {isHive && (
              <span style={{
                fontSize: '9px',
                backgroundColor: colors.accent.indigoDim,
                color: colors.accent.indigoText,
                border: `0.5px solid ${colors.accent.indigoBorder}`,
                borderRadius: radius.sm,
                padding: '1px 4px',
              }}>
                beta
              </span>
            )}

            {item.href === '/connections' && pendingCount > 0 && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: radius.full,
                backgroundColor: colors.status.danger,
                fontSize: '9px',
                fontWeight: 500,
                color: '#fff',
              }}>
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────
// Sub-component: NavNotifications
// ─────────────────────────────────────────

type NavNotificationsProps = {
  notifications: Notification[]
  unreadCount: number
  onOpen: () => void
  isOpen: boolean
  notifRef: React.RefObject<HTMLDivElement | null>
}

function NavNotifications({ notifications, unreadCount, onOpen, isOpen, notifRef }: NavNotificationsProps) {
  const NOTIF_ICONS: Record<string, string> = {
    connection_request:  '👋',
    connection_accepted: '✅',
    new_member:          '🎉',
    new_message:         '💬',
  }

  return (
    <div style={{ position: 'relative' }} ref={notifRef}>
      <button
        aria-label="Notifications"
        onClick={onOpen}
        style={{
          width: '34px', height: '34px',
          borderRadius: radiusMkt.sm,
          backgroundColor: 'transparent',
          border: `1px solid ${isOpen ? colors.border.mkt2 : colors.border.mkt}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: isOpen ? colors.text.soft : colors.text.muted2,
          position: 'relative',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = colors.border.mkt2
          ;(e.currentTarget as HTMLElement).style.color = colors.text.soft
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = isOpen ? colors.border.mkt2 : colors.border.mkt
          ;(e.currentTarget as HTMLElement).style.color = isOpen ? colors.text.soft : colors.text.muted2
        }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '5px', right: '5px',
            width: '5px', height: '5px',
            borderRadius: radius.full,
            backgroundColor: colors.status.danger,
            border: `1.5px solid ${colors.bg.surface}`,
          }} />
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          backgroundColor: colors.bg.elevated,
          border: `1px solid ${colors.border.mkt2}`,
          borderRadius: radiusMkt.md,
          overflow: 'hidden',
          zIndex: 50,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `0.5px solid ${colors.border.default}`,
          }}>
            <span style={{ fontSize: fontSize.md, fontWeight: 500, color: colors.text.primary }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span style={{ fontSize: fontSize.xs, color: colors.accent.tealText }}>
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
                No notifications yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notifications.map(notif => {
                const isRead = notif.read
                return (
                  <Link
                    key={notif.id}
                    href={notif.link ?? '/notifications'}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px 16px',
                      borderBottom: `0.5px solid ${colors.border.default}`,
                      textDecoration: 'none',
                      backgroundColor: isRead ? 'transparent' : 'rgba(13,148,136,0.04)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.hover
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = isRead
                        ? 'transparent'
                        : 'rgba(13,148,136,0.04)'
                    }}
                  >
                    <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
                      {NOTIF_ICONS[notif.type] ?? '🔔'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: fontSize.sm,
                        fontWeight: 500,
                        color: colors.text.primary,
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p style={{ fontSize: fontSize.xs, color: colors.text.muted, lineHeight: 1.5 }}>
                          {notif.body}
                        </p>
                      )}
                      <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: '3px' }}>
                        {getTimeLabel(notif.created_at)}
                      </p>
                    </div>
                    {!isRead && (
                      <span style={{
                        width: '6px', height: '6px',
                        borderRadius: radius.full,
                        backgroundColor: colors.accent.teal,
                        flexShrink: 0,
                        marginTop: '4px',
                      }} />
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          <Link
            href="/notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 16px',
              fontSize: fontSize.sm,
              color: colors.accent.tealText,
              textDecoration: 'none',
              borderTop: `0.5px solid ${colors.border.default}`,
              transition: 'color 0.15s',
            }}
          >
            See all notifications →
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Sub-component: NavMobileMenu
// ─────────────────────────────────────────

type NavMobileMenuProps = {
  user: User | null
  isOpen: boolean
  menuRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  onSignOut: () => void
}

function NavMobileMenu({ user, isOpen, menuRef, onClose, onSignOut }: NavMobileMenuProps) {
  const pathname = usePathname()
  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        backgroundColor: colors.bg.mktSurface,
        borderTop: `1px solid ${colors.border.mkt}`,
        borderBottom: `1px solid ${colors.border.mkt}`,
        padding: '12px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        zIndex: 40,
      }}
    >
      {NAV_ITEMS.map(item => {
        if (item.requiresAuth && !user) return null
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: radiusMkt.sm,
              fontSize: fontSizeMkt.nav,
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive
                ? item.isHiveCheck ? colors.accent.indigoText : colors.accent.bright
                : colors.text.muted2,
              backgroundColor: isActive
                ? item.isHiveCheck
                  ? `rgba(99,102,241,0.07)`
                  : `rgba(${colors.accent.glowRgb},0.07)`
                : 'transparent',
              marginBottom: '2px',
            }}
          >
            <item.icon size={14} />
            {item.label}
          </Link>
        )
      })}

      <div style={{ height: '1px', backgroundColor: colors.border.mkt, margin: '12px 0' }} />

      {user ? (
        <>
          <Link
            href="/post"
            onClick={onClose}
            style={{
              padding: '10px 12px',
              borderRadius: radiusMkt.sm,
              fontSize: fontSizeMkt.nav,
              fontWeight: 600,
              textDecoration: 'none',
              color: colors.accent.bright,
            }}
          >
            + Post a project
          </Link>
          <Link
            href="/profile"
            onClick={onClose}
            style={{
              padding: '10px 12px',
              borderRadius: radiusMkt.sm,
              fontSize: fontSizeMkt.nav,
              textDecoration: 'none',
              color: colors.text.muted2,
            }}
          >
            My profile
          </Link>
          <button
            onClick={() => { onSignOut(); onClose() }}
            style={{
              padding: '10px 12px',
              borderRadius: radiusMkt.sm,
              fontSize: fontSizeMkt.nav,
              background: 'none',
              border: 'none',
              textAlign: 'left',
              color: colors.text.muted2,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/login" onClick={onClose} style={{
            flex: 1,
            textAlign: 'center',
            padding: '10px',
            borderRadius: radiusMkt.sm,
            border: `1px solid ${colors.border.mkt2}`,
            color: colors.text.soft,
            fontSize: fontSizeMkt.nav,
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Sign in
          </Link>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Main component: Navbar
// ─────────────────────────────────────────

export default function Navbar() {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const notifRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)

  const navInitials = userProfile
    ? ([userProfile.first_name?.[0], userProfile.last_name?.[0]]
        .filter(Boolean).join('').toUpperCase()
      ) || (user?.email?.[0].toUpperCase() ?? '?')
    : (user?.email?.[0].toUpperCase() ?? '?')

  async function fetchPendingCount(userId: string) {
    const { data: projects } = await supabase
      .from('projects').select('id').eq('owner_id', userId)

    if (!projects?.length) { setPendingCount(0); return }

    const { count } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .in('project_id', projects.map(p => p.id))

    setPendingCount(count ?? 0)
  }

  async function fetchNotifications(userId: string) {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    }
  }

  async function fetchUserProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()
    if (data) setUserProfile(data)
  }

  async function markAllRead() {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        fetchPendingCount(data.user.id)
        fetchNotifications(data.user.id)
        fetchUserProfile(data.user.id)
      }
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchPendingCount(session.user.id)
        fetchNotifications(session.user.id)
        fetchUserProfile(session.user.id)
      } else {
        setPendingCount(0)
        setNotifications([])
        setUnreadCount(0)
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      backdropFilter: 'blur(14px) saturate(140%)',
      WebkitBackdropFilter: 'blur(14px) saturate(140%)',
      backgroundColor: 'rgba(10,13,17,0.80)',
      borderBottom: `1px solid ${colors.border.mkt}`,
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: layout.maxWidth,
        margin: '0 auto',
        padding: `0 ${layout.wrapPadding}`,
        height: layout.navHeight,
        gap: '24px',
      }}>

        {/* Left — logo */}
        <NavLogo />

        {/* Center — nav links (desktop only) */}
        <div style={{ display: 'none' }} className="md-flex-center">
          <NavLinks user={user} pendingCount={pendingCount} />
        </div>

        {/* Right — actions (desktop only) */}
        <div style={{ display: 'none' }} className="md-flex-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NavNotifications
                notifications={notifications}
                unreadCount={unreadCount}
                isOpen={notifOpen}
                notifRef={notifRef}
                onOpen={() => {
                  setNotifOpen(prev => !prev)
                  if (!notifOpen) markAllRead()
                }}
              />
              <Link
                href="/post"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: fontFamily.body,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  padding: '9px 18px',
                  borderRadius: radiusMkt.sm,
                  background: `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
                  color: colors.accent.ink,
                  border: '1px solid transparent',
                  textDecoration: 'none',
                  boxShadow: shadows.btnPrimary,
                  transition: 'box-shadow 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = shadows.btnPrimaryHover
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = shadows.btnPrimary
                }}
              >
                + Post project
              </Link>
              <Link
                href="/profile"
                aria-label="My profile"
                style={styles.avatar(30)}
              >
                {navInitials}
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: fontFamily.body,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  padding: '9px 18px',
                  borderRadius: radiusMkt.sm,
                  border: `1px solid ${colors.border.mkt2}`,
                  backgroundColor: 'transparent',
                  color: colors.text.soft,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s, border-color 0.15s, background 0.15s',
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
                Log out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: fontFamily.body,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  padding: '9px 18px',
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
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: fontFamily.body,
                  fontSize: fontSizeMkt.nav,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  padding: '9px 18px',
                  borderRadius: radiusMkt.sm,
                  background: `linear-gradient(180deg, ${colors.accent.bright}, ${colors.accent.deep})`,
                  color: colors.accent.ink,
                  border: '1px solid transparent',
                  textDecoration: 'none',
                  boxShadow: shadows.btnPrimary,
                  transition: 'box-shadow 0.15s',
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
            </div>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(prev => !prev)}
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
          className="md-hamburger"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      <NavMobileMenu
        user={user}
        isOpen={menuOpen}
        menuRef={mobileMenuRef}
        onClose={() => setMenuOpen(false)}
        onSignOut={handleSignOut}
      />

      <style>{`
        @media (min-width: 768px) {
          .md-flex-center {
            display: flex !important;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
          .md-flex-right   { display: flex !important; }
          .md-hamburger    { display: none !important; }
        }
        @media (max-width: 767px) {
          .md-hamburger    { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
