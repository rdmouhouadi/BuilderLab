// components/ConnectionsClient.tsx
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import { colors, radius, radiusMkt, fontSize, fontSizeMkt, layout } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Connection = {
  id: string
  sender_id: string
  project_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  projects?: { id: string; title: string }
  profiles?: {
    id: string
    name: string | null
    country: string | null
    avg_rating: number
  }
}

type Props = {
  received: Connection[]
  sent: Connection[]
  currentUserId: string
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase()
}

function statusStyle(status: string) {
  switch (status) {
    case 'accepted': return {
      backgroundColor: colors.status.successDim,
      color: colors.status.success,
      border: `1px solid rgba(16,185,129,0.25)`,
    }
    case 'rejected': return {
      backgroundColor: colors.status.dangerDim,
      color: colors.status.danger,
      border: `1px solid rgba(239,68,68,0.25)`,
    }
    default: return {
      backgroundColor: colors.status.warningDim,
      color: colors.status.warning,
      border: `1px solid rgba(245,158,11,0.25)`,
    }
  }
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function ConnectionsClient({ received, sent }: Props) {
  const supabase = createBrowserSupabaseClient()

  const [activeTab,   setActiveTab]   = useState<'received' | 'sent'>('received')
  const [connections, setConnections] = useState(received)

  const pending = connections.filter(c => c.status === 'pending')

  async function handleAction(id: string, action: 'accepted' | 'rejected') {
    const { error } = await supabase
      .from('connections')
      .update({ status: action })
      .eq('id', id)

    if (!error) {
      setConnections(prev =>
        prev.map(c => c.id === id ? { ...c, status: action } : c)
      )

      if (action === 'accepted') {
        fetch('/api/notify/accepted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionId: id }),
        }).catch(console.error)
      }
    }
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <main style={{
      maxWidth: '1152px',
      margin: '0 auto',
      padding: `40px ${layout.wrapPadding}`,
    }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: fontSize.xxl,
          fontWeight: 600,
          color: colors.text.base,
          letterSpacing: '-0.03em',
          marginBottom: '6px',
        }}>
          Connections
        </h1>
        <p style={{ fontSize: fontSize.base, color: colors.text.muted2 }}>
          Manage your collaboration requests
        </p>
      </div>

      {/* Tabs — Received / Sent */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '3px',
        borderRadius: radiusMkt.sm,
        backgroundColor: colors.bg.elevated,
        border: `1px solid ${colors.border.mkt}`,
        width: 'fit-content',
        marginBottom: '24px',
      }}>
        {(['received', 'sent'] as const).map(tab => {
          const isActive = activeTab === tab
          const count    = tab === 'received' ? pending.length : sent.length

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 18px',
                borderRadius: '6px',
                fontSize: fontSizeMkt.nav,
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
                backgroundColor: isActive ? colors.bg.hover : 'transparent',
                color:           isActive ? colors.text.base : colors.text.muted2,
                border:          isActive ? `1px solid ${colors.border.mkt2}` : '1px solid transparent',
              }}
            >
              {tab}
              <span style={{
                fontSize: fontSize.xs,
                padding: '1px 6px',
                borderRadius: radius.sm,
                backgroundColor: isActive ? colors.bg.elevated : colors.bg.hover,
                color: isActive ? colors.text.soft : colors.text.muted2,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Received tab ── */}
      {activeTab === 'received' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pending.length === 0 ? (
            <div style={{
              backgroundColor: colors.bg.elevated,
              border: `1px solid ${colors.border.mkt}`,
              borderRadius: radiusMkt.md,
              padding: '48px 32px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '20px', marginBottom: '8px' }}>👋</p>
              <p style={{ fontSize: fontSize.base, color: colors.text.muted2 }}>
                No pending requests
              </p>
              <p style={{ fontSize: fontSize.sm, color: colors.text.muted, marginTop: '4px' }}>
                When someone wants to join your project, it'll appear here.
              </p>
            </div>
          ) : (
            pending.map(conn => (
              <div
                key={conn.id}
                style={{
                  backgroundColor: colors.bg.elevated,
                  border: `1px solid ${colors.border.mkt}`,
                  borderRadius: radiusMkt.md,
                  padding: '20px',
                }}
              >
                {/* Top row — sender + project */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '38px', height: '38px',
                      borderRadius: radiusMkt.sm,
                      backgroundColor: colors.accent.base,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: fontSize.sm, fontWeight: 600,
                      color: colors.accent.ink, flexShrink: 0,
                    }}>
                      {getInitials(conn.profiles?.name)}
                    </div>

                    <div>
                      <Link
                        href={`/profile/${conn.profiles?.id}`}
                        style={{
                          fontSize: fontSize.base,
                          fontWeight: 500,
                          color: colors.text.base,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = colors.accent.bright)}
                        onMouseLeave={e => (e.currentTarget.style.color = colors.text.base)}
                      >
                        {conn.profiles?.name ?? 'Anonymous'}
                      </Link>
                      <p style={{ fontSize: fontSize.sm, color: colors.text.muted2, marginTop: '2px' }}>
                        {conn.profiles?.country ?? '—'} · ⭐{' '}
                        {conn.profiles?.avg_rating
                          ? conn.profiles.avg_rating.toFixed(1)
                          : 'New'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Pending badge */}
                  <span style={{
                    ...statusStyle('pending'),
                    fontSize: fontSize.xs,
                    padding: '3px 9px',
                    borderRadius: radius.md,
                    flexShrink: 0,
                  }}>
                    Pending
                  </span>
                </div>

                {/* Project name */}
                <p style={{
                  fontSize: fontSize.sm,
                  color: colors.text.muted2,
                  marginBottom: conn.message ? '10px' : '14px',
                }}>
                  Interested in{' '}
                  <Link
                    href={`/projects/${conn.projects?.id}`}
                    style={{ color: colors.text.base, textDecoration: 'none', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget.style.color = colors.accent.bright)}
                    onMouseLeave={e => (e.currentTarget.style.color = colors.text.base)}
                  >
                    {conn.projects?.title ?? 'Unknown project'}
                  </Link>
                </p>

                {/* Message */}
                {conn.message && (
                  <p style={{
                    fontSize: fontSize.sm,
                    lineHeight: 1.65,
                    padding: '10px 14px',
                    borderRadius: radiusMkt.sm,
                    fontStyle: 'italic',
                    color: colors.text.soft,
                    backgroundColor: colors.bg.surface,
                    border: `1px solid ${colors.border.mkt}`,
                    marginBottom: '14px',
                  }}>
                    "{conn.message}"
                  </p>
                )}

                {/* Accept / Decline */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleAction(conn.id, 'accepted')}
                    style={{
                      fontSize: fontSizeMkt.nav,
                      fontWeight: 500,
                      padding: '7px 16px',
                      borderRadius: radiusMkt.sm,
                      cursor: 'pointer',
                      backgroundColor: colors.status.successDim,
                      color: colors.status.success,
                      border: `1px solid rgba(16,185,129,0.25)`,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.22)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.status.successDim)}
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleAction(conn.id, 'rejected')}
                    style={{
                      fontSize: fontSizeMkt.nav,
                      fontWeight: 400,
                      padding: '7px 16px',
                      borderRadius: radiusMkt.sm,
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      color: colors.text.muted2,
                      border: `1px solid ${colors.border.mkt}`,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget.style.backgroundColor = colors.status.dangerDim)
                      ;(e.currentTarget.style.color = colors.status.danger)
                      ;(e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)')
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget.style.backgroundColor = 'transparent')
                      ;(e.currentTarget.style.color = colors.text.muted2)
                      ;(e.currentTarget.style.borderColor = colors.border.mkt)
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Sent tab ── */}
      {activeTab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sent.length === 0 ? (
            <div style={{
              backgroundColor: colors.bg.elevated,
              border: `1px solid ${colors.border.mkt}`,
              borderRadius: radiusMkt.md,
              padding: '48px 32px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '20px', marginBottom: '8px' }}>🚀</p>
              <p style={{ fontSize: fontSize.base, color: colors.text.muted2 }}>
                No requests sent yet
              </p>
              <p style={{ fontSize: fontSize.sm, color: colors.text.muted, marginTop: '4px' }}>
                Browse projects and send your first collaboration request.
              </p>
            </div>
          ) : (
            sent.map(conn => (
              <div
                key={conn.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  backgroundColor: colors.bg.elevated,
                  border: `1px solid ${colors.border.mkt}`,
                  borderRadius: radiusMkt.md,
                  padding: '16px 20px',
                }}
              >
                <div>
                  <Link
                    href={`/projects/${conn.projects?.id}`}
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: 500,
                      color: colors.text.base,
                      textDecoration: 'none',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = colors.accent.bright)}
                    onMouseLeave={e => (e.currentTarget.style.color = colors.text.base)}
                  >
                    {conn.projects?.title ?? 'Unknown project'}
                  </Link>
                  <p style={{ fontSize: fontSize.sm, color: colors.text.muted2 }}>
                    Sent {new Date(conn.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>

                <span style={{
                  ...statusStyle(conn.status),
                  fontSize: fontSize.xs,
                  padding: '3px 9px',
                  borderRadius: radius.md,
                  textTransform: 'capitalize',
                  flexShrink: 0,
                }}>
                  {conn.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  )
}
