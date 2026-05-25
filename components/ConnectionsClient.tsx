// components/ConnectionsClient.tsx
// Displays received and sent connection requests.
// Allows the user to accept or decline pending requests.
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

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

// Status badge style — monochrome except for semantic meaning
function statusStyle(status: string) {
  switch (status) {
    case 'accepted': return {
      backgroundColor: colors.status.successDim,
      color: colors.status.success,
      border: `0.5px solid rgba(16,185,129,0.25)`,
    }
    case 'rejected': return {
      backgroundColor: colors.status.dangerDim,
      color: colors.status.danger,
      border: `0.5px solid rgba(239,68,68,0.25)`,
    }
    default: return {
      backgroundColor: colors.status.warningDim,
      color: colors.status.warning,
      border: `0.5px solid rgba(245,158,11,0.25)`,
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

  // Only pending requests are shown in the received tab
  const pending = connections.filter(c => c.status === 'pending')

  // Accept or decline a connection request
  async function handleAction(id: string, action: 'accepted' | 'rejected') {
    const { error } = await supabase
      .from('connections')
      .update({ status: action })
      .eq('id', id)

    if (!error) {
      // Optimistic update — reflect the change immediately
      setConnections(prev =>
        prev.map(c => c.id === id ? { ...c, status: action } : c)
      )

      // Send email notification to the sender on accept — non-blocking
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
    <main style={{ maxWidth: '672px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: fontSize.xl,
          fontWeight: 500,
          color: colors.text.primary,
          letterSpacing: '-0.02em',
          marginBottom: '4px',
        }}>
          Connections
        </h1>
        <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
          Manage your collaboration requests
        </p>
      </div>

      {/* Tabs — Received / Sent */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '3px',
        borderRadius: radius.xl,
        backgroundColor: colors.bg.elevated,
        border: `0.5px solid ${colors.border.default}`,
        width: 'fit-content',
        marginBottom: '20px',
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
                gap: '6px',
                padding: '5px 16px',
                borderRadius: radius.lg,
                fontSize: fontSize.sm,
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
                backgroundColor: isActive ? colors.bg.hover    : 'transparent',
                color:           isActive ? colors.text.primary : colors.text.muted,
                border:          isActive ? `0.5px solid ${colors.border.active}` : 'none',
              }}
            >
              {tab}
              {/* Count badge */}
              <span style={{
                fontSize: fontSize.xs,
                padding: '1px 5px',
                borderRadius: radius.sm,
                backgroundColor: isActive ? colors.bg.elevated : colors.bg.hover,
                color: isActive ? colors.text.secondary : colors.text.muted,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Received tab */}
      {activeTab === 'received' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pending.length === 0 ? (
            <div style={{
              ...styles.card ?? {},
              backgroundColor: colors.bg.elevated,
              border: `0.5px solid ${colors.border.default}`,
              borderRadius: radius.xxl,
              padding: '32px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
                No pending requests.
              </p>
            </div>
          ) : (
            pending.map(conn => (
              <div
                key={conn.id}
                style={{
                  backgroundColor: colors.bg.elevated,
                  border: `0.5px solid ${colors.border.default}`,
                  borderRadius: radius.xxl,
                  padding: '16px',
                }}
              >
                {/* Top row — sender info + status badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Avatar */}
                    <div style={{
                      width: '34px', height: '34px',
                      borderRadius: radius.lg,
                      backgroundColor: colors.accent.teal,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: fontSize.xs, fontWeight: 500,
                      color: '#fff', flexShrink: 0,
                    }}>
                      {getInitials(conn.profiles?.name)}
                    </div>

                    <div>
                      <Link
                        href={`/profile/${conn.profiles?.id}`}
                        style={{
                          fontSize: fontSize.sm,
                          fontWeight: 500,
                          color: colors.text.primary,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {conn.profiles?.name ?? 'Anonymous'}
                      </Link>
                      <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                        {conn.profiles?.country ?? ''} · ⭐{' '}
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
                    padding: '2px 8px',
                    borderRadius: radius.md,
                    flexShrink: 0,
                  }}>
                    Pending
                  </span>
                </div>

                {/* Project name */}
                <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginBottom: '8px' }}>
                  Interested in:{' '}
                  <span style={{ color: colors.text.secondary }}>
                    {conn.projects?.title ?? 'Unknown project'}
                  </span>
                </p>

                {/* Message */}
                {conn.message && (
                  <p style={{
                    fontSize: fontSize.xs,
                    lineHeight: 1.6,
                    padding: '8px 10px',
                    borderRadius: radius.lg,
                    fontStyle: 'italic',
                    color: colors.text.muted,
                    backgroundColor: colors.bg.surface,
                    border: `0.5px solid ${colors.border.default}`,
                    marginBottom: '12px',
                  }}>
                    "{conn.message}"
                  </p>
                )}

                {/* Accept / Decline buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleAction(conn.id, 'accepted')}
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: 500,
                      padding: '5px 12px',
                      borderRadius: radius.lg,
                      cursor: 'pointer',
                      backgroundColor: colors.status.successDim,
                      color: colors.status.success,
                      border: `0.5px solid rgba(16,185,129,0.25)`,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.status.successDim)}
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => handleAction(conn.id, 'rejected')}
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: 500,
                      padding: '5px 12px',
                      borderRadius: radius.lg,
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      color: colors.text.muted,
                      border: `0.5px solid ${colors.border.default}`,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget.style.backgroundColor = colors.status.dangerDim)
                      ;(e.currentTarget.style.color = colors.status.danger)
                      ;(e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)')
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget.style.backgroundColor = 'transparent')
                      ;(e.currentTarget.style.color = colors.text.muted)
                      ;(e.currentTarget.style.borderColor = colors.border.default)
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

      {/* Sent tab */}
      {activeTab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sent.length === 0 ? (
            <div style={{
              backgroundColor: colors.bg.elevated,
              border: `0.5px solid ${colors.border.default}`,
              borderRadius: radius.xxl,
              padding: '32px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
                You haven't sent any requests yet.
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
                  backgroundColor: colors.bg.elevated,
                  border: `0.5px solid ${colors.border.default}`,
                  borderRadius: radius.xxl,
                  padding: '14px 16px',
                }}
              >
                <div>
                  <p style={{
                    fontSize: fontSize.sm,
                    fontWeight: 500,
                    color: colors.text.primary,
                    marginBottom: '3px',
                  }}>
                    {conn.projects?.title ?? 'Unknown project'}
                  </p>
                  <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                    Sent {new Date(conn.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Status badge */}
                <span style={{
                  ...statusStyle(conn.status),
                  fontSize: fontSize.xs,
                  padding: '2px 8px',
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