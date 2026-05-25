// components/ProjectComments.tsx
// Community feedback section on a project page.
// Open to all authenticated builders — distinct from HiveCheck peer reviews.
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ProjectComment } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  projectId: string
  initialComments: ProjectComment[]
  currentUserId: string | null
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getFullName(profile: ProjectComment['profiles']) {
  if (!profile) return 'Anonymous'
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return full || profile.name || 'Anonymous'
}

function getInitials(profile: ProjectComment['profiles']) {
  if (!profile) return '?'
  const first = profile.first_name?.[0]
  const last  = profile.last_name?.[0]
  if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
  return profile.name?.[0]?.toUpperCase() ?? '?'
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function ProjectComments({
  projectId,
  initialComments,
  currentUserId,
}: Props) {
  const supabase = createBrowserSupabaseClient()

  const [comments, setComments] = useState<ProjectComment[]>(initialComments)
  const [content,  setContent]  = useState('')
  const [posting,  setPosting]  = useState(false)

  // Post a comment — optimistic prepend
  async function handlePost() {
    if (!content.trim() || !currentUserId) return
    setPosting(true)

    const { data, error } = await supabase
      .from('project_comments')
      .insert({ project_id: projectId, author_id: currentUserId, content: content.trim() })
      .select('*, profiles(id, name, first_name, last_name, avg_rating)')
      .single()

    if (!error && data) {
      setComments(prev => [data, ...prev])
      setContent('')
    }

    setPosting(false)
  }

  // Delete a comment — optimistic remove
  async function handleDelete(id: string) {
    setComments(prev => prev.filter(c => c.id !== id))
    await supabase.from('project_comments').delete().eq('id', id)
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div style={{
      backgroundColor: colors.bg.elevated,
      border: `0.5px solid ${colors.border.default}`,
      borderRadius: radius.xxl,
      padding: '18px',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '16px',
      }}>
        <h2 style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary }}>
          Community Feedback
        </h2>
        <span style={{
          fontSize: fontSize.xs,
          padding: '1px 6px',
          borderRadius: radius.md,
          backgroundColor: colors.bg.hover,
          color: colors.text.muted,
          border: `0.5px solid ${colors.border.default}`,
        }}>
          {comments.length}
        </span>
      </div>

      {/* Post form — authenticated users only */}
      {currentUserId ? (
        <div style={{ marginBottom: '20px' }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            placeholder="Share your thoughts, ideas, or encouragement..."
            style={{
              width: '100%',
              backgroundColor: colors.bg.surface,
              border: `0.5px solid ${colors.border.default}`,
              borderRadius: radius.lg,
              color: colors.text.primary,
              fontSize: fontSize.sm,
              padding: '8px 10px',
              outline: 'none',
              resize: 'none',
              marginBottom: '8px',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
            onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: fontSize.xs,
              color: content.length > 450
                ? colors.status.warning
                : colors.text.muted,
            }}>
              {content.length}/500
            </span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim() || content.length > 500}
              style={{
                ...styles.btnPrimary,
                fontSize: fontSize.xs,
                padding: '5px 12px',
                opacity: !content.trim() || posting ? 0.5 : 1,
                cursor: !content.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {posting ? 'Posting...' : 'Post feedback →'}
            </button>
          </div>
        </div>
      ) : (
        // Sign in prompt for unauthenticated visitors
        <div style={{
          backgroundColor: colors.bg.surface,
          border: `0.5px solid ${colors.border.default}`,
          borderRadius: radius.lg,
          padding: '10px 14px',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
            <Link href="/login" style={{ color: colors.accent.tealText, textDecoration: 'none' }}>
              Sign in
            </Link>{' '}
            to leave feedback on this project.
          </p>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <p style={{
          fontSize: fontSize.xs,
          color: colors.text.muted,
          textAlign: 'center',
          padding: '20px 0',
        }}>
          No feedback yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map(comment => {
            const isAuthor = comment.author_id === currentUserId

            return (
              <div
                key={comment.id}
                className="group"
                style={{ display: 'flex', gap: '10px' }}
              >
                {/* Avatar — links to public profile */}
                <Link
                  href={`/profile/${comment.profiles?.id}`}
                  style={{ textDecoration: 'none', flexShrink: 0 }}
                >
                  <div style={{
                    width: '28px', height: '28px',
                    borderRadius: radius.lg,
                    backgroundColor: colors.accent.teal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: fontSize.xs,
                    fontWeight: 500,
                    color: '#fff',
                    marginTop: '1px',
                  }}>
                    {getInitials(comment.profiles)}
                  </div>
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Meta row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    flexWrap: 'wrap',
                  }}>
                    <Link
                      href={`/profile/${comment.profiles?.id}`}
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: 500,
                        color: colors.text.primary,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {getFullName(comment.profiles)}
                    </Link>

                    {/* Rating */}
                    {comment.profiles?.avg_rating ? (
                      <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                        ⭐ {comment.profiles.avg_rating.toFixed(1)}
                      </span>
                    ) : null}

                    {/* Timestamp */}
                    <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                      {getTimeLabel(comment.created_at)}
                    </span>

                    {/* Delete — author only, visible on hover */}
                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(comment.id)}
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

                  {/* Comment content */}
                  <p style={{
                    fontSize: fontSize.sm,
                    color: colors.text.secondary,
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                  }}>
                    {comment.content}
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