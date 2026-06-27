// components/ProjectDetail/sidebar/ProjectActions.tsx
// All the action buttons shown in the sidebar, depending on the
// viewer's relationship to the project: owner, member, or visitor.
// Each section below is shown or hidden based on that role —
// only one "primary" action group is visible at a time.
import { Project } from '@/types'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

type Props = {
  project: Project
  isOwner: boolean
  isMember: boolean

  // Mark as completed — owner only, while project.status === 'open'
  onMarkCompleted: () => void

  // Delete project — owner only
  onDeleteProject: () => void

  // Rating banner — shown after a project is marked completed,
  // until the current member submits their ratings
  ratingRequired: boolean
  showRatingModal: boolean
  onOpenRatingModal: () => void

  // Removed notice — shown only to a member who was removed
  removedReason: string | null

  // Follow button — non-owner, non-member only
  isFollowing: boolean
  followLoading: boolean
  onFollow: () => void

  // Interest button — non-owner, non-member only
  connStatus: 'idle' | 'loading' | 'sent' | 'error'
  onShowInterestModal: () => void

  // Leave button — member, non-owner only
  onLeaveProject: () => void

  // HiveOS button — member or owner only
  hiveOSOpen: boolean
  onToggleHiveOS: () => void
}

export default function ProjectActions({
  project,
  isOwner,
  isMember,
  onMarkCompleted,
  onDeleteProject,
  ratingRequired,
  showRatingModal,
  onOpenRatingModal,
  removedReason,
  isFollowing,
  followLoading,
  onFollow,
  connStatus,
  onShowInterestModal,
  onLeaveProject,
  hiveOSOpen,
  onToggleHiveOS,
}: Props) {
  return (
    <>
      {/* Mark as completed — owner, while the project is still open */}
      {isOwner && project.status === 'open' && (
        <button
          onClick={onMarkCompleted}
          style={{ ...styles.btnIndigo, width: '100%', padding: '10px', fontSize: fontSize.sm }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.indigoDim)}
        >
          ✓ Mark as completed
        </button>
      )}

      {/* Delete project — owner only, always available */}
      {isOwner && (
        <button
          onClick={onDeleteProject}
          style={{
            width: '100%', padding: '10px',
            fontSize: fontSize.sm, fontWeight: 500,
            borderRadius: radius.lg, cursor: 'pointer',
            backgroundColor: colors.status.dangerDim,
            color: colors.status.danger,
            border: `0.5px solid rgba(239,68,68,0.25)`,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.status.dangerDim)}
        >
          Delete project
        </button>
      )}

      {/* Rating banner — only while a rating is required and the
          modal hasn't been opened yet */}
      {ratingRequired && !showRatingModal && (
        <div style={{
          padding: '14px', borderRadius: radius.xl,
          backgroundColor: colors.status.warningDim,
          border: `0.5px solid rgba(245,158,11,0.25)`,
        }}>
          <p style={{ fontSize: fontSize.xs, color: colors.status.warning, marginBottom: '10px' }}>
            ⭐ Project completed. Please rate your collaborators.
          </p>
          <button
            onClick={onOpenRatingModal}
            style={{
              width: '100%', padding: '7px',
              fontSize: fontSize.xs, fontWeight: 500,
              borderRadius: radius.lg, cursor: 'pointer',
              backgroundColor: 'rgba(245,158,11,0.2)',
              color: colors.status.warning,
              border: `0.5px solid rgba(245,158,11,0.25)`,
            }}
          >
            Rate collaborators →
          </button>
        </div>
      )}

      {/* Removed notice — only shown to the member who was removed
          (they are no longer in `members`, so isMember is false here) */}
      {removedReason && !isMember && !isOwner && (
        <div style={{
          padding: '12px 14px',
          borderRadius: radius.xl,
          backgroundColor: colors.status.dangerDim,
          border: `0.5px solid rgba(239,68,68,0.25)`,
        }}>
          <p style={{
            fontSize: fontSize.xs,
            color: colors.status.danger,
            fontWeight: 500,
            marginBottom: '6px',
          }}>
            You were removed from this project.
          </p>
          <p style={{ fontSize: fontSize.xs, color: colors.text.muted, lineHeight: 1.5 }}>
            Reason: {removedReason}
          </p>
        </div>
      )}

      {/* Follow button — anyone who is neither the owner nor a member */}
      {!isOwner && !isMember && (
        <button
          onClick={onFollow}
          disabled={followLoading}
          style={{
            width: '100%', padding: '10px',
            fontSize: fontSize.sm, fontWeight: 500,
            borderRadius: radius.lg,
            cursor: followLoading ? 'not-allowed' : 'pointer',
            opacity: followLoading ? 0.7 : 1,
            backgroundColor: isFollowing ? colors.accent.indigoDim  : 'transparent',
            color:           isFollowing ? colors.accent.indigoText : colors.text.muted,
            border:          isFollowing
              ? `0.5px solid ${colors.accent.indigoBorder}`
              : `0.5px solid ${colors.border.default}`,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            if (!followLoading) (e.currentTarget as HTMLElement).style.borderColor = colors.border.hover
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = isFollowing
              ? colors.accent.indigoBorder
              : colors.border.default
          }}
        >
          {followLoading ? '...' : isFollowing ? '✓ Following' : '+ Follow this project'}
        </button>
      )}

      {/* "I'm interested" button — same audience as Follow */}
      {!isOwner && !isMember && (
        <button
          onClick={onShowInterestModal}
          disabled={connStatus === 'loading' || connStatus === 'sent'}
          style={{
            width: '100%', padding: '10px',
            fontSize: fontSize.sm, fontWeight: 500,
            borderRadius: radius.lg,
            cursor: connStatus === 'sent' ? 'default' : 'pointer',
            opacity: connStatus === 'loading' ? 0.7 : 1,
            backgroundColor: connStatus === 'sent' ? colors.status.successDim : colors.accent.teal,
            color:           connStatus === 'sent' ? colors.status.success    : '#fff',
            border:          connStatus === 'sent' ? `0.5px solid rgba(16,185,129,0.25)` : 'none',
            transition: 'all 0.15s',
          }}
        >
          {connStatus === 'loading' && 'Sending...'}
          {connStatus === 'sent'    && '✓ Request sent'}
          {connStatus === 'error'   && 'Try again'}
          {connStatus === 'idle'    && "I'm interested →"}
        </button>
      )}

      {/* Member badge + Leave button — active members who aren't the owner */}
      {isMember && !isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            width: '100%', padding: '10px', textAlign: 'center',
            fontSize: fontSize.sm, fontWeight: 500, borderRadius: radius.lg,
            backgroundColor: colors.accent.indigoDim,
            color: colors.accent.indigoText,
            border: `0.5px solid ${colors.accent.indigoBorder}`,
          }}>
            ✓ You&apos;re on this team
          </div>

          <button
            onClick={onLeaveProject}
            style={{
              width: '100%', padding: '8px',
              fontSize: fontSize.xs,
              borderRadius: radius.lg, cursor: 'pointer',
              backgroundColor: 'transparent',
              color: colors.text.muted,
              border: `0.5px solid ${colors.border.default}`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget.style.color = colors.status.danger)
              ;(e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)')
            }}
            onMouseLeave={e => {
              (e.currentTarget.style.color = colors.text.muted)
              ;(e.currentTarget.style.borderColor = colors.border.default)
            }}
          >
            Leave project
          </button>
        </div>
      )}

      {/* HiveOS button — visible to members and the owner */}
      {(isMember || isOwner) && (
        <button
          onClick={onToggleHiveOS}
          style={{
            width: '100%', padding: '10px',
            fontSize: fontSize.sm, fontWeight: 500,
            borderRadius: radius.lg, cursor: 'pointer',
            transition: 'all 0.15s',
            backgroundColor: hiveOSOpen ? colors.accent.indigoDim  : colors.bg.elevated,
            color:           hiveOSOpen ? colors.accent.indigoText : colors.text.secondary,
            border:          hiveOSOpen
              ? `0.5px solid ${colors.accent.indigoBorder}`
              : `0.5px solid ${colors.border.default}`,
          }}
          onMouseEnter={e => {
            if (!hiveOSOpen) {
              (e.currentTarget.style.borderColor = colors.accent.indigoBorder)
              ;(e.currentTarget.style.color = colors.accent.indigoText)
            }
          }}
          onMouseLeave={e => {
            if (!hiveOSOpen) {
              (e.currentTarget.style.borderColor = colors.border.default)
              ;(e.currentTarget.style.color = colors.text.secondary)
            }
          }}
        >
          {hiveOSOpen ? '✕ Close HiveOS' : '⚡ Open HiveOS'}
        </button>
      )}
    </>
  )
}