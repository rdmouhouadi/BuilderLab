// components/ProjectCard.tsx
// Displays a single project as a card in the feed.
// Handles: interest request, follow/unfollow, activity signal.
// The InterestModal is rendered outside the Link to prevent click conflicts.
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project } from '@/types'
import Link from 'next/link'
import { getTimeLabel } from '@/lib/timeLabel'
import InterestModal from '@/components/InterestModal'
import { colors, radius, fontSize } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  project: Project
  currentUserId?: string | null
}

type InterestStatus = 'idle' | 'loading' | 'sent' | 'error'

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

// All skill tags use the same neutral monochrome style — Linear aesthetic
const TAG_STYLE = {
  backgroundColor: colors.bg.hover,
  border: `0.5px solid ${colors.border.default}`,
  borderRadius: radius.md,
  color: colors.text.secondary,
  fontSize: fontSize.xs,
  padding: '2px 7px',
  display: 'inline-block' as const,
}

// ─────────────────────────────────────────
// Sub-component: CardAuthor
// ─────────────────────────────────────────

type CardAuthorProps = {
  name: string | null | undefined
  country: string | null | undefined
  activitySignal: string | null
}

function CardAuthor({ name, country, activitySignal }: CardAuthorProps) {
  // Compute initials from full name
  const initials = name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Avatar */}
        <div style={{
          width: '24px', height: '24px',
          borderRadius: radius.lg,
          backgroundColor: colors.accent.teal,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fontSize.xs,
          fontWeight: 500,
          color: '#fff',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <p style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.secondary }}>
            {name ?? 'Anonymous'}
          </p>
          {country && (
            <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
              {country}
            </p>
          )}
        </div>
      </div>

      {/* Activity signal — pulsing dot + label */}
      {activitySignal && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ position: 'relative', display: 'flex', width: '6px', height: '6px' }}>
            <span style={{
              position: 'absolute', inset: 0,
              borderRadius: radius.full,
              backgroundColor: colors.status.success,
              opacity: 0.5,
              animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }} />
            <span style={{
              borderRadius: radius.full,
              width: '6px', height: '6px',
              backgroundColor: colors.status.success,
            }} />
          </span>
          <span style={{ fontSize: fontSize.xs, color: colors.status.success }}>
            {activitySignal}
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Sub-component: CardTags
// ─────────────────────────────────────────

type CardTagsProps = {
  skills: { skill_needed: string }[] | undefined
  level: string | undefined
}

function CardTags({ skills, level }: CardTagsProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
      {skills?.slice(0, 2).map(skill => (
        <span key={skill.skill_needed} style={TAG_STYLE}>
          {skill.skill_needed}
        </span>
      ))}

      {/* Show overflow count if more than 2 skills */}
      {skills && skills.length > 2 && (
        <span style={{ ...TAG_STYLE, color: colors.text.muted }}>
          +{skills.length - 2} more
        </span>
      )}

      {/* Level badge */}
      {level && (
        <span style={{ ...TAG_STYLE, color: colors.text.muted }}>
          {level}
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// Sub-component: CardFooter
// ─────────────────────────────────────────

type CardFooterProps = {
  project: Project
  isOwner: boolean
  interestStatus: InterestStatus
  isFollowing: boolean
  followLoading: boolean
  onInterest: () => void
  onFollow: (e: React.MouseEvent) => void
}

function CardFooter({
  project,
  isOwner,
  interestStatus,
  isFollowing,
  followLoading,
  onInterest,
  onFollow,
}: CardFooterProps) {
  const memberCount = project.project_members?.length ?? 0

  // Interest button style changes based on status
  function getInterestStyle() {
    switch (interestStatus) {
      case 'sent':    return { backgroundColor: colors.status.successDim, color: colors.status.success, border: `0.5px solid rgba(16,185,129,0.25)`, cursor: 'default' as const }
      case 'error':   return { backgroundColor: colors.status.dangerDim,  color: colors.status.danger,  border: `0.5px solid rgba(239,68,68,0.25)`,  cursor: 'pointer' as const }
      case 'loading': return { backgroundColor: colors.accent.tealDim,    color: colors.accent.tealText, border: `0.5px solid ${colors.accent.tealBorder}`, cursor: 'not-allowed' as const, opacity: 0.6 }
      default:        return { backgroundColor: colors.accent.tealDim,    color: colors.accent.tealText, border: `0.5px solid ${colors.accent.tealBorder}`, cursor: 'pointer' as const }
    }
  }

  function getInterestLabel() {
    switch (interestStatus) {
      case 'loading': return 'Sending...'
      case 'sent':    return '✓ Sent'
      case 'error':   return 'Try again'
      default:        return "I'm interested"
    }
  }

  return (
    <div style={{
      marginTop: 'auto',
      paddingTop: '10px',
      borderTop: `0.5px solid ${colors.border.default}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {/* Row 1 — meta + interest button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {/* Rating or timestamp */}
          <span style={{ fontSize: fontSize.xs, color: colors.text.muted, flexShrink: 0 }}>
            ⭐ {project.profiles?.avg_rating
              ? project.profiles.avg_rating.toFixed(1)
              : getTimeLabel(project.created_at)
            }
          </span>

          {/* Duration */}
          {project.duration && (
            <span style={{ fontSize: fontSize.xs, color: colors.text.muted, flexShrink: 0 }}>
              {project.duration}
            </span>
          )}

          {/* Spots — hidden on small screens */}
          {project.spots && (
            <span
              className="hidden lg:inline"
              style={{ fontSize: fontSize.xs, color: colors.text.muted }}
            >
              {project.spots} {project.spots === 1 ? 'spot' : 'spots'}
            </span>
          )}
        </div>

        {/* Interest button or "Your project" badge */}
        {!isOwner ? (
          <button
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onInterest()
            }}
            disabled={interestStatus === 'loading' || interestStatus === 'sent'}
            style={{
              ...getInterestStyle(),
              borderRadius: radius.lg,
              fontSize: fontSize.xs,
              fontWeight: 500,
              padding: '4px 10px',
              flexShrink: 0,
              whiteSpace: 'nowrap' as const,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              if (interestStatus === 'idle') {
                (e.currentTarget as HTMLElement).style.backgroundColor = colors.accent.teal
                ;(e.currentTarget as HTMLElement).style.color = '#ffffff'
              }
            }}
            onMouseLeave={e => {
              if (interestStatus === 'idle') {
                (e.currentTarget as HTMLElement).style.backgroundColor = colors.accent.tealDim
                ;(e.currentTarget as HTMLElement).style.color = colors.accent.tealText
              }
            }}
          >
            {getInterestLabel()}
          </button>
        ) : (
          <span style={{
            fontSize: fontSize.xs,
            color: colors.text.muted,
            backgroundColor: colors.bg.hover,
            border: `0.5px solid ${colors.border.default}`,
            borderRadius: radius.lg,
            padding: '4px 10px',
            flexShrink: 0,
          }}>
            Your project
          </span>
        )}
      </div>

      {/* Row 2 — member count + follow button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>

        {/* Follow button — hidden for owner */}
        {!isOwner && (
          <button
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onFollow(e)
            }}
            disabled={followLoading}
            style={{
              fontSize: fontSize.xs,
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: radius.lg,
              flexShrink: 0,
              whiteSpace: 'nowrap' as const,
              transition: 'all 0.15s',
              cursor: followLoading ? 'not-allowed' : 'pointer',
              opacity: followLoading ? 0.6 : 1,
              backgroundColor: isFollowing ? colors.accent.indigoDim : 'transparent',
              color: isFollowing ? colors.accent.indigoText : colors.text.muted,
              border: isFollowing
                ? `0.5px solid ${colors.accent.indigoBorder}`
                : `0.5px solid ${colors.border.default}`,
            }}
            onMouseEnter={e => {
              if (!followLoading && !isFollowing) {
                (e.currentTarget as HTMLElement).style.color = colors.text.secondary
                ;(e.currentTarget as HTMLElement).style.borderColor = colors.border.hover
              }
            }}
            onMouseLeave={e => {
              if (!isFollowing) {
                (e.currentTarget as HTMLElement).style.color = colors.text.muted
                ;(e.currentTarget as HTMLElement).style.borderColor = colors.border.default
              }
            }}
          >
            {followLoading ? '...' : isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Main component: ProjectCard
// ─────────────────────────────────────────

export default function ProjectCard({ project, currentUserId }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])

  const [interestStatus, setInterestStatus] = useState<InterestStatus>('idle')
  const [showModal, setShowModal] = useState(false)
  const [userContact, setUserContact] = useState<{ type: string | null; value: string | null }>({
    type: null, value: null,
  })
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isOwner = currentUserId === project.owner_id

  // Fetch user's preferred contact to pre-fill the interest modal
  useEffect(() => {
    if (!currentUserId) return
    supabase
      .from('profiles')
      .select('preferred_contact_type, preferred_contact_value')
      .eq('id', currentUserId)
      .single()
      .then(({ data }) => {
        if (data) setUserContact({ type: data.preferred_contact_type, value: data.preferred_contact_value })
      })
  }, [currentUserId, supabase])

  // Check if the user is already following this project
  useEffect(() => {
    if (!currentUserId) return
    supabase
      .from('project_followers')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', currentUserId)
      .single()
      .then(({ data }) => { if (data) setIsFollowing(true) })
  }, [currentUserId, project.id, supabase])

  // useMemo that Compute activity signal from latest project update once, at page loading
  const activitySignal = useMemo((): string | null => {
    const updates = project.project_updates
    if (!updates?.length) return null

    const latest = updates.reduce((a, b) =>
      new Date(a.created_at) > new Date(b.created_at) ? a : b
    )
    const diffHours = Math.floor((Date.now() - new Date(latest.created_at).getTime()) / 3600000)

    if (diffHours < 24) return 'Active today'
    if (diffHours < 48) return '1d ago'
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7)  return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return null
  }, [project.project_updates])

  // Open interest modal — redirect to login if not authenticated
  function handleInterest() {
    if (!currentUserId) { router.push('/login'); return }
    setShowModal(true)
  }

  // Submit interest request with personalized message
  async function handleConfirmInterest(message: string) {
    setInterestStatus('loading')
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({ sender_id: currentUserId, project_id: project.id, message, status: 'pending' })
        .select()
        .single()

      if (error?.code === '23505') {
        setInterestStatus('sent')
      } else if (error) {
        throw error
      } else {
        setInterestStatus('sent')
        // Send email notification — non-blocking
        fetch('/api/notify/interest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionId: data.id }),
        }).catch(console.error)
      }
    } catch {
      setInterestStatus('error')
    } finally {
      setShowModal(false)
    }
  }

  // Toggle follow/unfollow — optimistic update
  async function handleFollow() {
    if (!currentUserId) { router.push('/login'); return }
    setFollowLoading(true)

    if (isFollowing) {
      await supabase.from('project_followers').delete()
        .eq('project_id', project.id).eq('user_id', currentUserId)
      setIsFollowing(false)
    } else {
      await supabase.from('project_followers')
        .insert({ project_id: project.id, user_id: currentUserId })
      setIsFollowing(true)
    }

    setFollowLoading(false)
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <>
      <Link 
        href={`/projects/${project.id}`} 
        onClick={() => sessionStorage.setItem('projectDetailFrom', '/')}
        style={{ display: 'block', height: '100%', textDecoration: 'none' }}
      >
        <div
          style={{
            backgroundColor: colors.bg.elevated,
            border: `0.5px solid ${colors.border.default}`,
            borderRadius: radius.xxl,
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = colors.border.hover)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border.default)}
        >
          {/* Author row + activity signal */}
          <CardAuthor
            name={project.profiles?.name}
            country={project.profiles?.country}
            activitySignal={activitySignal}
          />

          {/* Title */}
          <h3 style={{
            fontSize: fontSize.md,
            fontWeight: 500,
            color: colors.text.primary,
            letterSpacing: '-0.01em',
            marginBottom: '6px',
            lineHeight: 1.4,
          }}>
            {project.title}
          </h3>

          {/* Description */}
          <p style={{
            fontSize: fontSize.sm,
            color: colors.text.muted,
            lineHeight: 1.6,
            marginBottom: '12px',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}>
            {project.problem}
          </p>

          {/* Tags */}
          <CardTags
            skills={project.project_skills}
            level={project.level}
          />

          {/* Footer */}
          <CardFooter
            project={project}
            isOwner={isOwner}
            interestStatus={interestStatus}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onInterest={handleInterest}
            onFollow={handleFollow}
          />
        </div>
      </Link>

      {/* Interest modal — outside Link to prevent navigation on click */}
      {showModal && (
        <InterestModal
          projectTitle={project.title}
          preferredContactType={userContact.type}
          preferredContactValue={userContact.value}
          onConfirm={handleConfirmInterest}
          onCancel={() => setShowModal(false)}
          loading={interestStatus === 'loading'}
        />
      )}
    </>
  )
}