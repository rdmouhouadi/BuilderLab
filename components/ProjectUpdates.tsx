// components/ProjectUpdates.tsx
// Build Log feed inside a project workspace.
// Members and owners can post updates, blockers, decisions, milestones, and demos.
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ProjectUpdate } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  projectId: string
  updates: ProjectUpdate[]
  currentUserId: string | null
  canPost: boolean // True if the user is a member or owner
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

// Neutral monochrome type config — consistent with new design system
const UPDATE_TYPES: Record<string, {
  label: string
  icon: string
  placeholder: string
}> = {
  update:    { label: 'Update',    icon: '📢', placeholder: "What did you work on?" },
  milestone: { label: 'Milestone', icon: '🏁', placeholder: "What milestone did you reach?" },
  blocker:   { label: 'Blocker',   icon: '🚧', placeholder: "What's blocking you?" },
  decision:  { label: 'Decision',  icon: '✅', placeholder: "What did you decide?" },
  demo:      { label: 'Demo',      icon: '🚀', placeholder: "What did you demo?" },
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getFullName(profile: ProjectUpdate['profiles']) {
  if (!profile) return 'Anonymous'
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return full || profile.name || 'Anonymous'
}

function getInitials(profile: ProjectUpdate['profiles']) {
  if (!profile) return '?'
  const first = profile.first_name?.[0]
  const last  = profile.last_name?.[0]
  if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
  return profile.name?.[0]?.toUpperCase() ?? '?'
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function ProjectUpdates({
  projectId,
  updates: initialUpdates,
  currentUserId,
  canPost,
}: Props) {
  const supabase = createBrowserSupabaseClient()

  const [updates,   setUpdates]   = useState<ProjectUpdate[]>(initialUpdates)
  const [content,   setContent]   = useState('')
  const [type,      setType]      = useState<ProjectUpdate['type']>('update')
  const [posting,   setPosting]   = useState(false)
  const [showForm,  setShowForm]  = useState(false)

  // Post a new update — optimistic prepend
  async function handlePost() {
    if (!content.trim() || !currentUserId) return
    setPosting(true)

    const { data, error } = await supabase
      .from('project_updates')
      .insert({ project_id: projectId, author_id: currentUserId, type, content: content.trim() })
      .select('*, profiles(id, name, first_name, last_name, avg_rating)')
      .single()

    if (!error && data) {
      setUpdates(prev => [data, ...prev])
      setContent('')
      setType('update')
      setShowForm(false)
    }

    setPosting(false)
  }

  // Delete an update — optimistic remove
  async function handleDelete(id: string) {
    setUpdates(prev => prev.filter(u => u.id !== id))
    await supabase.from('project_updates').delete().eq('id', id)
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h2 style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary }}>
            Build Log
          </h2>
          <span style={{
            fontSize: fontSize.xs,
            padding: '1px 6px',
            borderRadius: radius.md,
            backgroundColor: colors.bg.hover,
            color: colors.text.muted,
            border: `0.5px solid ${colors.border.default}`,
          }}>
            {updates.length}
          </span>
        </div>

        {/* Post update button — members and owner only */}
        {canPost && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ ...styles.btnTeal, fontSize: fontSize.xs, padding: '4px 10px' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(13,148,136,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.tealDim)}
          >
            + Post update
          </button>
        )}
      </div>

      {/* Post form */}
      {canPost && showForm && (
        <div style={{
          backgroundColor: colors.bg.surface,
          border: `0.5px solid ${colors.border.default}`,
          borderRadius: radius.xl,
          padding: '14px',
          marginBottom: '14px',
        }}>
          {/* Type selector — monochrome pills */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {Object.entries(UPDATE_TYPES).map(([key, val]) => {
              const isActive = type === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key as ProjectUpdate['type'])}
                  style={{
                    fontSize: fontSize.xs,
                    padding: '3px 9px',
                    borderRadius: radius.md,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    backgroundColor: isActive ? colors.bg.hover    : 'transparent',
                    color:           isActive ? colors.text.primary : colors.text.muted,
                    border:          isActive
                      ? `0.5px solid ${colors.border.active}`
                      : `0.5px solid ${colors.border.default}`,
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {val.icon} {val.label}
                </button>
              )
            })}
          </div>

          {/* Textarea */}
          <textarea
            placeholder={UPDATE_TYPES[type]?.placeholder ?? "What's new?"}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              backgroundColor: colors.bg.elevated,
              border: `0.5px solid ${colors.border.default}`,
              borderRadius: radius.lg,
              color: colors.text.primary,
              fontSize: fontSize.sm,
              padding: '8px 10px',
              outline: 'none',
              resize: 'none',
              marginBottom: '10px',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
            onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setShowForm(false); setContent('') }}
              style={{ ...styles.btnGhost, fontSize: fontSize.xs, padding: '4px 10px' }}
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              style={{
                ...styles.btnPrimary,
                fontSize: fontSize.xs,
                padding: '4px 12px',
                opacity: !content.trim() ? 0.5 : 1,
                cursor: !content.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Updates feed */}
      {updates.length === 0 ? (
        <p style={{
          fontSize: fontSize.xs,
          color: colors.text.muted,
          textAlign: 'center',
          padding: '20px 0',
        }}>
          No updates yet.{canPost && ' Be the first to share a progress update!'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {updates.map(update => {
            const typeConfig = UPDATE_TYPES[update.type] ?? UPDATE_TYPES.update
            const isAuthor   = currentUserId === update.author_id

            return (
              <div
                key={update.id}
                className="group"
                style={{ display: 'flex', gap: '10px' }}
              >
                {/* Avatar */}
                <div style={{
                  width: '26px', height: '26px',
                  borderRadius: radius.lg,
                  backgroundColor: colors.accent.teal,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: fontSize.xs,
                  fontWeight: 500,
                  color: '#fff',
                  flexShrink: 0,
                  marginTop: '1px',
                }}>
                  {getInitials(update.profiles)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Meta row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: fontSize.xs, fontWeight: 500, color: colors.text.primary }}>
                      {getFullName(update.profiles)}
                    </span>

                    {/* Type badge — monochrome */}
                    <span style={{
                      fontSize: fontSize.xs,
                      padding: '1px 6px',
                      borderRadius: radius.md,
                      backgroundColor: colors.bg.hover,
                      color: colors.text.secondary,
                      border: `0.5px solid ${colors.border.default}`,
                    }}>
                      {typeConfig.icon} {typeConfig.label}
                    </span>

                    {/* Timestamp */}
                    <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                      {getTimeLabel(update.created_at)}
                    </span>

                    {/* Delete — author only, visible on hover */}
                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="opacity-0 group-hover:opacity-100"
                        style={{
                          fontSize: fontSize.xs,
                          color: colors.text.muted,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginLeft: 'auto',
                          transition: 'opacity 0.15s',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <p style={{
                    fontSize: fontSize.sm,
                    color: colors.text.secondary,
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                  }}>
                    {update.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}