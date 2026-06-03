// components/Navbar.tsx
// Main navigation bar — sticky, responsive.
// Broken into sub-components for maintainability:
//   NavLogo, NavCapsule, NavNotifications, NavMobileMenu
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Layers, Users, Star, Bell } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'
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
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
      {/* Hexagon logo mark — B.hive ready */}
      <div style={{
        width: '20px', height: '20px',
        borderRadius: radius.md,
        backgroundColor: colors.accent.teal,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
        </svg>
      </div>
      <span style={{
        fontSize: fontSize.md,
        fontWeight: 500,
        color: colors.text.primary,
        letterSpacing: '-0.01em',
      }}>
        BuilderLab
      </span>
    </Link>
  )
}

// ─────────────────────────────────────────
// Sub-component: NavCapsule
// ─────────────────────────────────────────

type NavCapsuleProps = {
  user: User | null
  pendingCount: number
}

function NavCapsule({ user, pendingCount }: NavCapsuleProps) {
  const pathname = usePathname()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      backgroundColor: colors.bg.elevated,
      border: `0.5px solid ${colors.border.default}`,
      borderRadius: radius.xl,
      padding: '3px',
    }}>
      {NAV_ITEMS.map(item => {
        // Hide auth-required tabs for unauthenticated users
        if (item.requiresAuth && !user) return null

        const isActive = pathname === item.href
        const isHive = item.isHiveCheck

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 14px',
              borderRadius: radius.lg,
              fontSize: fontSize.base,
              textDecoration: 'none',
              color: isActive
                ? isHive ? colors.accent.indigoText : colors.text.primary
                : colors.text.muted,
              transition: 'color 0.15s',
              zIndex: 1,
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.text.secondary
                ;(e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.hover
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = colors.text.muted
                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              }
            }}
          >
            {/* Animated active capsule */}
            {isActive && (
              <motion.span
                layoutId="nav-active"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: radius.lg,
                  backgroundColor: colors.bg.hover,
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <item.icon size={13} />
            <span>{item.label}</span>

            {/* HiveCheck beta badge */}
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

            {/* Pending connections dot */}
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
      {/* Bell button */}
      <button
        aria-label="Notifications"
        onClick={onOpen}
        style={{
          width: '30px', height: '30px',
          borderRadius: radius.lg,
          backgroundColor: 'transparent',
          border: `0.5px solid ${isOpen ? colors.border.hover : colors.border.default}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: isOpen ? colors.text.secondary : colors.text.muted,
          position: 'relative',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = colors.border.hover
          ;(e.currentTarget as HTMLElement).style.color = colors.text.secondary
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = isOpen ? colors.border.hover : colors.border.default
          ;(e.currentTarget as HTMLElement).style.color = isOpen ? colors.text.secondary : colors.text.muted
        }}
      >
        <Bell size={14} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px', right: '4px',
            width: '5px', height: '5px',
            borderRadius: radius.full,
            backgroundColor: colors.status.danger,
            border: `1.5px solid ${colors.bg.surface}`,
          }} />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '320px',
          backgroundColor: colors.bg.elevated,
          border: `0.5px solid ${colors.border.hover}`,
          borderRadius: radius.xxl,
          overflow: 'hidden',
          zIndex: 50,
        }}
        >
          {/* Header */}
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

          {/* List */}
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

          {/* Footer */}
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
        backgroundColor: colors.bg.surface,
        borderBottom: `0.5px solid ${colors.border.default}`,
        padding: '12px 16px',
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
              padding: '8px 10px',
              borderRadius: radius.lg,
              fontSize: fontSize.base,
              textDecoration: 'none',
              color: isActive
                ? item.isHiveCheck ? colors.accent.indigoText : colors.accent.tealText
                : colors.text.muted,
              backgroundColor: isActive ? colors.bg.hover : 'transparent',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.hover}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = isActive 
              ? colors.bg.hover 
              : 'transparent'}
          >
            <item.icon size={14} />
            {item.label}
          </Link>
        )
      })}

      {/* Divider */}
      <div style={{ height: '0.5px', backgroundColor: colors.border.default, margin: '8px 0' }} />

      {user ? (
        <>
          <Link
            href="/post"
            onClick={onClose}
            style={{
              padding: '8px 10px',
              borderRadius: radius.lg,
              fontSize: fontSize.base,
              textDecoration: 'none',
              color: colors.accent.tealText,
            }}
          >
            + Post a project
          </Link>
          <Link
            href="/profile"
            onClick={onClose}
            style={{
              padding: '8px 10px',
              borderRadius: radius.lg,
              fontSize: fontSize.base,
              textDecoration: 'none',
              color: colors.text.muted,
            }}
          >
            My profile
          </Link>
          <button
            onClick={() => { onSignOut(); onClose() }}
            style={{
              padding: '8px 10px',
              borderRadius: radius.lg,
              fontSize: fontSize.base,
              background: 'none',
              border: 'none',
              textAlign: 'left',
              color: colors.text.muted,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onClose}
          style={{
            padding: '8px 10px',
            borderRadius: radius.lg,
            fontSize: fontSize.base,
            textDecoration: 'none',
            color: colors.accent.tealText,
          }}

        >
          Sign in
        </Link>
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

  // Compute initials from profile, fallback to email
  const navInitials = userProfile
    ? ([userProfile.first_name?.[0], userProfile.last_name?.[0]]
        .filter(Boolean).join('').toUpperCase()
      ) || (user?.email?.[0].toUpperCase() ?? '?')
    : (user?.email?.[0].toUpperCase() ?? '?')

  // ── Data fetchers ──

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

  // ── Auth listener ──

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

  // ── Close dropdowns on outside click ──

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
      backgroundColor: colors.bg.surface,
      borderBottom: `0.5px solid ${colors.border.default}`,
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '44px',
      }}>

        {/* Left — logo */}
        <NavLogo />

        {/* Center — nav tabs (desktop only) */}
        <div style={{ display: 'none' }} className="md-flex-center">
          <NavCapsule user={user} pendingCount={pendingCount} />
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
              <Link href="/post" style={styles.btnPrimary}>
                + Post project
              </Link>
              <Link
                href="/profile"
                aria-label="My profile"
                style={styles.avatar(28)}
              >
                {navInitials}
              </Link>
              <button
                onClick={handleSignOut}
                style={{
                  ...styles.btnGhost,
                  fontSize: fontSize.sm,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.border.hover
                  ;(e.currentTarget as HTMLElement).style.color = colors.text.secondary
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = colors.border.default
                  ;(e.currentTarget as HTMLElement).style.color = colors.text.muted
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <Link href="/login" style={styles.btnPrimary}>
              Log in
            </Link>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(prev => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text.muted,
            cursor: 'pointer',
            fontSize: '18px',
          }}
          className="md-hidden"
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

      {/* Responsive helpers */}
      <style>{`
        @media (min-width: 768px) {
          .md-flex-center {
            display: flex !important;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
          .md-flex-right { display: flex !important; }
          .md-hidden { display: none !important; }
        }
      `}</style>
    </nav>
  )
}