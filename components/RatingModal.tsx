// components/RatingModal.tsx
// Modal shown when a project is completed.
// Allows rating each collaborator from 1 to 5 stars.
// All ratings are mandatory before submitting.
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Member = {
  id: string       // project_member_id
  user_id: string
  profiles: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
  } | null
}

type Props = {
  projectId: string
  members: Member[]       // Members to rate (excludes current user)
  currentUserId: string
  onComplete: () => void  // Called after all ratings are submitted
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getMemberName(member: Member) {
  const p = member.profiles
  if (!p) return 'Anonymous'
  const full = [p.first_name, p.last_name].filter(Boolean).join(' ')
  return full || p.name || 'Anonymous'
}

function getInitials(member: Member) {
  const p = member.profiles
  if (!p) return '?'
  return [p.first_name?.[0], p.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase()
    || p.name?.[0]?.toUpperCase() || '?'
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function RatingModal({ projectId, members, currentUserId, onComplete }: Props) {
  const supabase = createBrowserSupabaseClient()

  // One score per member — initialized to 0
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(members.map(m => [m.user_id, 0]))
  )

  // Optional comment per member
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(members.map(m => [m.user_id, '']))
  )

  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  function setScore(userId: string, score: number) {
    setRatings(prev => ({ ...prev, [userId]: score }))
  }

  // Submit all ratings sequentially
  async function handleSubmit() {
    // All members must be rated
    const unrated = members.filter(m => ratings[m.user_id] === 0)
    if (unrated.length > 0) {
      setError('Please rate all collaborators before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      for (const member of members) {
        const { error: ratingError } = await supabase
          .from('ratings')
          .insert({
            project_member_id: member.id,
            rater_id:          currentUserId,
            rated_id:          member.user_id,
            score:             ratings[member.user_id],
            comment:           comments[member.user_id] || null,
          })
        if (ratingError) throw ratingError
      }

      // Mark rating_required = false for the current user
      await supabase
        .from('project_members')
        .update({ rating_required: false })
        .eq('project_id', projectId)
        .eq('user_id', currentUserId)

      onComplete()

    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
        backgroundColor: 'rgba(0,0,0,0.6)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '480px',
          backgroundColor: colors.bg.elevated,
          border: `0.5px solid ${colors.border.hover}`,
          borderRadius: radius.xxl,
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: fontSize.lg,
            fontWeight: 500,
            color: colors.text.primary,
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}>
            Rate your collaborators
          </h2>
          <p style={{ fontSize: fontSize.sm, color: colors.text.muted, lineHeight: 1.5 }}>
            Your feedback helps build trust in the community. All ratings are mandatory.
          </p>
        </div>

        {/* Member list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {members.map(member => (
            <div
              key={member.user_id}
              style={{
                backgroundColor: colors.bg.surface,
                border: `0.5px solid ${colors.border.default}`,
                borderRadius: radius.xl,
                padding: '14px',
              }}
            >
              {/* Member info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: radius.lg,
                  backgroundColor: colors.accent.teal,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: fontSize.xs, fontWeight: 500, color: '#fff', flexShrink: 0,
                }}>
                  {getInitials(member)}
                </div>
                <p style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary }}>
                  {getMemberName(member)}
                </p>
              </div>

              {/* Star rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map(star => {
                  const isActive = star <= ratings[member.user_id]
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setScore(member.user_id, star)}
                      style={{
                        fontSize: '22px',
                        color: isActive ? colors.status.warning : colors.border.active,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        lineHeight: 1,
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      ★
                    </button>
                  )
                })}
                {ratings[member.user_id] > 0 && (
                  <span style={{ fontSize: fontSize.xs, color: colors.text.muted, marginLeft: '4px' }}>
                    {ratings[member.user_id]}/5
                  </span>
                )}
              </div>

              {/* Optional comment */}
              <input
                type="text"
                placeholder="Add a comment (optional)..."
                value={comments[member.user_id]}
                onChange={e => setComments(prev => ({ ...prev, [member.user_id]: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: colors.bg.elevated,
                  border: `0.5px solid ${colors.border.default}`,
                  borderRadius: radius.lg,
                  color: colors.text.primary,
                  fontSize: fontSize.xs,
                  padding: '7px 10px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
                onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)}
              />
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: radius.lg,
            marginBottom: '14px',
            backgroundColor: colors.status.dangerDim,
            border: `0.5px solid rgba(239,68,68,0.25)`,
            fontSize: fontSize.sm,
            color: colors.status.danger,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            ...styles.btnPrimary,
            width: '100%',
            padding: '10px',
            fontSize: fontSize.sm,
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit ratings'}
        </button>
      </div>
    </div>
  )
}