// components/ProjectDetailClient.tsx
// Orchestrates the full project detail page.
// Delegates rendering to: ProjectHeader, HiveOSPanel.
// Handles all state and data mutations.
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project, Milestone, ProjectUpdate, ProjectMessage, ProjectComment, Task } from '@/types'
import { CONTACT_TYPES } from '@/lib/constants'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'
import Link from 'next/link'

import BackButton from '@/components/BackButton'
import ProjectHeader from '@/components/ProjectHeader'
import ProjectUpdates from '@/components/ProjectUpdates'
import ProjectChat from '@/components/ProjectChat'
import ProjectComments from '@/components/ProjectComments'
import RatingModal from '@/components/RatingModal'
import InterestModal from '@/components/InterestModal'
import CompletionModal from '@/components/CompletionModal'
import LeaveProjectModal from '@/components/LeaveProjectModal'

import HiveOSPanel from '@/components/HiveOSPanel'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Member = {
  id: string
  user_id: string
  role: string | null
  rating_required: boolean
  is_hiveos_manager: boolean
  leave_reason: string | null
  left_at: string | null
  profiles: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
    country: string | null
    avg_rating: number
    preferred_contact_type: string | null
    preferred_contact_value: string | null
  } | null
}

type Connection = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
}

type AcceptedConnection = {
  sender_id: string
  message: string | null
}

type Props = {
  project: Project
  members: Member[]
  milestones: Milestone[]
  updates: ProjectUpdate[]
  currentUserId: string | null
  existingConnection: Connection | null
  acceptedConnections: AcceptedConnection[]
  initialMessages: ProjectMessage[]
  followersCount: number
  isFollowing: boolean
  isFollower: boolean
  initialComments: ProjectComment[]
  initialTasks: Task[]
  removedReason: string | null
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getFullName(profile: Member['profiles']) {
  if (!profile) return 'Anonymous'
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return full || profile.name || 'Anonymous'
}

function getInitials(profile: Member['profiles'] | Project['profiles']) {
  if (!profile) return '?'
  const first = (profile as any).first_name?.[0]
  const last  = (profile as any).last_name?.[0]
  if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
  return (profile as any).name?.[0]?.toUpperCase() ?? '?'
}

const cardStyle = {
  backgroundColor: colors.bg.elevated,
  border: `0.5px solid ${colors.border.default}`,
  borderRadius: radius.xxl,
  padding: '18px',
}

const sectionTitle = {
  fontSize: fontSize.sm,
  fontWeight: 500,
  color: colors.text.primary,
  marginBottom: '14px',
}

// ─────────────────────────────────────────
// Main component
// ─────────────────────────────────────────

export default function ProjectDetailClient({
  project,
  members,
  milestones: initialMilestones,
  updates,
  currentUserId,
  existingConnection,
  acceptedConnections,
  initialMessages,
  followersCount: initialFollowersCount,
  isFollowing: initialIsFollowing,
  isFollower,
  initialComments,
  initialTasks,
  removedReason,
}: Props) {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  // ── Role checks ──
  const isOwner       = currentUserId === project.owner_id
  const isMember      = members.some(m => m.user_id === currentUserId)
  const canSeePrivate = isOwner || isMember || isFollower

  // ── Project data ──
  const [projectData, setProjectData] = useState<{
    title: string
    problem: string
    level: string
    domain: string
    duration: string
    spots: number | null
    project_skills: { id?: string; project_id?: string; skill_needed: string }[]
  }>({
    title:          project.title,
    problem:        project.problem        ?? '',
    level:          project.level          ?? '',
    domain:         project.domain         ?? '',
    duration:       project.duration       ?? '',
    spots:          project.spots          ?? null,
    project_skills: project.project_skills ?? [],
  })

  // ── Edit mode ──
  const [editing,    setEditing]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [editForm,   setEditForm]   = useState({
    title:    project.title,
    problem:  project.problem  ?? '',
    level:    project.level    ?? '',
    domain:   project.domain   ?? '',
    duration: project.duration ?? '',
    spots:    project.spots?.toString() ?? '',
  })
  const [editSkills, setEditSkills] = useState<string[]>(
    project.project_skills?.map(s => s.skill_needed) ?? []
  )

  // ── Interest / connection ──
  const [connStatus,   setConnStatus]   = useState<'idle' | 'loading' | 'sent' | 'error'>(
    existingConnection ? 'sent' : 'idle'
  )
  const [showModal,    setShowModal]    = useState(false)
  const [userContact,  setUserContact]  = useState<{ type: string | null; value: string | null }>({
    type: null, value: null,
  })

  // ── Follow ──
  const [isFollowing,    setIsFollowing]    = useState(initialIsFollowing)
  const [followersCount, setFollowersCount] = useState(initialFollowersCount)
  const [followLoading,  setFollowLoading]  = useState(false)

  // ── Leave / Remove ──
  const [leaveModal, setLeaveModal] = useState<{
    mode: 'leave' | 'remove'
    memberId: string      // project_members.id
    userId: string        // profiles.id
    memberName: string
  } | null>(null)
  const [leaveLoading, setLeaveLoading] = useState(false)

  // ── Milestones ──
  const [milestones,      setMilestones]      = useState<Milestone[]>(initialMilestones)
  const [newMilestone,    setNewMilestone]    = useState('')
  const [addingMilestone, setAddingMilestone] = useState(false)

  // ── Rating ──
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingRequired,  setRatingRequired]  = useState(
    members.some(m => m.user_id === currentUserId && m.rating_required)
  )

  // ── Completion ──
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completing,          setCompleting]          = useState(false)

  // ── HiveOS ──
  const [tasks,       setTasks]       = useState<Task[]>(initialTasks)
  const [hiveOSOpen,  setHiveOSOpen]  = useState(false)

  const isHiveOSManager = members.some(
    m => m.user_id === currentUserId && m.is_hiveos_manager
  )
  const canManageHiveOS = isOwner || isHiveOSManager

  const progress = milestones.length > 0
    ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)
    : 0

  // Fetch user's preferred contact for interest modal pre-fill
  useEffect(() => {
    if (!currentUserId) return
    supabase
      .from('profiles')
      .select('preferred_contact_type, preferred_contact_value')
      .eq('id', currentUserId)
      .single()
      .then(({ data }) => {
        if (data) setUserContact({
          type:  data.preferred_contact_type,
          value: data.preferred_contact_value,
        })
      })
  }, [currentUserId])

  // ── Handlers ──

  async function handleConfirmInterest(message: string) {
    setConnStatus('loading')
    try {
      const { error } = await supabase
        .from('connections')
        .insert({ sender_id: currentUserId, project_id: project.id, message, status: 'pending' })
      if (error?.code === '23505') setConnStatus('sent')
      else if (error) throw error
      else setConnStatus('sent')
      setShowModal(false)
    } catch {
      setConnStatus('error')
    }
  }

  async function handleFollow() {
    if (!currentUserId) { router.push('/login'); return }
    setFollowLoading(true)
    if (isFollowing) {
      const { error } = await supabase.from('project_followers').delete()
        .eq('project_id', project.id).eq('user_id', currentUserId)
      if (!error) { setIsFollowing(false); setFollowersCount(p => Math.max(0, p - 1)) }
    } else {
      const { error } = await supabase.from('project_followers')
        .insert({ project_id: project.id, user_id: currentUserId })
      if (!error) { setIsFollowing(true); setFollowersCount(p => p + 1) }
    }
    setFollowLoading(false)
  }

  async function handleLeaveOrRemove(reason: string) {
    if (!leaveModal) return
    setLeaveLoading(true)

    const { error } = await supabase
      .from('project_members')
      .update({
        status:       'left',
        leave_reason: reason,
        left_at:      new Date().toISOString(),
        rating_required: false,
      })
      .eq('id', leaveModal.memberId)

    if (!error) {
      setLeaveModal(null)
      // If the current user left — redirect to feed
      if (leaveModal.mode === 'leave') {
        router.push('/')
      } else {
        // Owner removed a member — refresh to update team list
        router.refresh()
      }
    }

    setLeaveLoading(false)
  }

  async function toggleMilestone(milestone: Milestone) {
    setMilestones(prev => prev.map(m =>
      m.id === milestone.id ? { ...m, completed: !m.completed } : m
    ))
    await supabase.from('milestones')
      .update({ completed: !milestone.completed })
      .eq('id', milestone.id)
  }

  async function handleAddMilestone() {
    if (!newMilestone.trim()) return
    setAddingMilestone(true)
    const { data, error } = await supabase
      .from('milestones')
      .insert({ project_id: project.id, title: newMilestone.trim(), position: milestones.length })
      .select().single()
    if (!error && data) { setMilestones(prev => [...prev, data]); setNewMilestone('') }
    setAddingMilestone(false)
  }

  async function handleDeleteMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id))
    await supabase.from('milestones').delete().eq('id', id)
  }

  async function handleMarkCompleted(isPublic: boolean) {
    setCompleting(true)
    await supabase.from('projects')
      .update({ status: 'completed', is_public: isPublic })
      .eq('id', project.id)
    await supabase.from('project_members')
      .update({ rating_required: true })
      .eq('project_id', project.id)
    setCompleting(false)
    setShowCompletionModal(false)
    router.refresh()
  }

  async function handleDeleteProject() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.'
    )
    if (!confirmed) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (!error) router.push('/')
  }

  async function handleSaveEdit() {
    setSaving(true)
    const { error } = await supabase.from('projects').update({
      title:    editForm.title,
      problem:  editForm.problem,
      level:    editForm.level.toLowerCase(),
      domain:   editForm.domain,
      duration: editForm.duration || null,
      spots:    editForm.spots ? parseInt(editForm.spots) : null,
    }).eq('id', project.id)

    if (error) { setSaving(false); return }

    await supabase.from('project_skills').delete().eq('project_id', project.id)
    if (editSkills.length > 0) {
      await supabase.from('project_skills').insert(
        editSkills.map(skill => ({ project_id: project.id, skill_needed: skill }))
      )
    }
    setProjectData({
      title:          editForm.title,
      problem:        editForm.problem,
      level:          editForm.level.toLowerCase(),
      domain:         editForm.domain,
      duration:       editForm.duration || '',
      spots:          editForm.spots ? parseInt(editForm.spots) : null,
      project_skills: editSkills.map(skill => ({ skill_needed: skill })),
    })
    setSaving(false)
    setEditing(false)
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px 16px' }}>

      <BackButton />

      {/* Outer flex — main content + HiveOS slide panel */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

        {/* Main content — compresses when HiveOS opens */}
        <div style={{ flex: 1, minWidth: 0, transition: 'all 0.3s ease' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Main column (2/3) ── */}
            <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <ProjectHeader
                project={project}
                projectData={projectData}
                isOwner={isOwner}
                editing={editing}
                saving={saving}
                editForm={editForm}
                editSkills={editSkills}
                onEdit={() => setEditing(true)}
                onCancel={() => setEditing(false)}
                onSave={handleSaveEdit}
                onEditFormChange={(field, value) => setEditForm(p => ({ ...p, [field]: value }))}
                onEditSkillToggle={skill => setEditSkills(prev =>
                  prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
                )}
              />

              {/* Milestones + Build Log + Chat */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h2 style={sectionTitle}>Milestones</h2>
                  <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                    {milestones.filter(m => m.completed).length}/{milestones.length} completed
                  </span>
                </div>

                {milestones.length > 0 && (
                  <div style={{ width: '100%', height: '3px', borderRadius: radius.full, backgroundColor: colors.bg.hover, marginBottom: '12px' }}>
                    <div style={{ width: `${progress}%`, height: '3px', borderRadius: radius.full, backgroundColor: colors.accent.teal, transition: 'width 0.4s ease' }} />
                  </div>
                )}

                {project.show_milestones || canSeePrivate ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {milestones.length === 0 && (
                        <p style={{ fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', padding: '16px 0' }}>
                          No milestones yet.{isOwner && ' Add your first one below.'}
                        </p>
                      )}
                      {milestones.map(milestone => (
                        <div
                          key={milestone.id}
                          className="group"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: radius.lg,
                            backgroundColor: colors.bg.surface,
                          }}
                        >
                          <button
                            onClick={() => isOwner && toggleMilestone(milestone)}
                            style={{
                              width: '14px', height: '14px', borderRadius: '3px',
                              border: `1px solid ${milestone.completed ? colors.accent.teal : colors.border.default}`,
                              backgroundColor: milestone.completed ? colors.accent.teal : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0, cursor: isOwner ? 'pointer' : 'default',
                              transition: 'all 0.15s',
                            }}
                          >
                            {milestone.completed && (
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span style={{
                            fontSize: fontSize.sm, flex: 1,
                            color: milestone.completed ? colors.text.muted : colors.text.secondary,
                            textDecoration: milestone.completed ? 'line-through' : 'none',
                          }}>
                            {milestone.title}
                          </span>
                          {isOwner && (
                            <button
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              className="opacity-0 group-hover:opacity-100"
                              style={{ fontSize: fontSize.xs, color: colors.text.muted, background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {isOwner && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="Add a milestone..."
                          value={newMilestone}
                          onChange={e => setNewMilestone(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                          style={{
                            flex: 1, backgroundColor: colors.bg.surface,
                            border: `0.5px solid ${colors.border.default}`,
                            borderRadius: radius.lg, color: colors.text.primary,
                            fontSize: fontSize.sm, padding: '7px 10px',
                            outline: 'none', fontFamily: 'inherit',
                          }}
                          onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
                          onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)}
                        />
                        <button
                          onClick={handleAddMilestone}
                          disabled={addingMilestone || !newMilestone.trim()}
                          style={{ ...styles.btnTeal, opacity: !newMilestone.trim() ? 0.5 : 1 }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center', padding: '12px 0' }}>
                    🔒 Milestones are private. Follow to see progress.
                  </p>
                )}

                {/* Build Log */}
                <div style={{ marginTop: '16px' }}>
                  {project.show_build_log || canSeePrivate ? (
                    <ProjectUpdates
                      projectId={project.id}
                      updates={updates}
                      currentUserId={currentUserId}
                      canPost={isOwner || isMember}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.bg.elevated, border: `0.5px solid ${colors.border.default}`, borderRadius: radius.xl }}>
                      <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>🔒 Build Log is private. Follow to see updates.</p>
                    </div>
                  )}
                </div>

                {/* Team Chat */}
                <div style={{ marginTop: '16px' }}>
                  {project.show_chat || canSeePrivate ? (
                    <ProjectChat
                      projectId={project.id}
                      initialMessages={initialMessages}
                      currentUserId={currentUserId}
                      canChat={isOwner || isMember}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: colors.bg.elevated, borderRadius: radius.xl, border: `0.5px solid ${colors.border.default}` }}>
                      <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>🔒 Team Chat is private. Follow to see the conversation.</p>
                    </div>
                  )}
                </div>
              </div>

              <ProjectComments
                projectId={project.id}
                initialComments={initialComments}
                currentUserId={currentUserId}
              />
            </div>

            {/* ── Sidebar (1/3) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Owner card */}
              <div style={cardStyle}>
                <h2 style={sectionTitle}>Posted by</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: radius.lg,
                    backgroundColor: colors.accent.teal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: fontSize.xs, fontWeight: 500, color: '#fff', flexShrink: 0,
                  }}>
                    {getInitials(project.profiles)}
                  </div>
                  <div>
                    <Link
                      href={`/profile/${project.profiles?.id}`}
                      style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary, textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {getFullName(project.profiles as any)}
                    </Link>
                    <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                      {project.profiles?.country ?? ''} · ⭐{' '}
                      {project.profiles?.avg_rating ? project.profiles.avg_rating.toFixed(1) : 'New'}
                    </p>
                  </div>
                </div>
                {project.profiles?.preferred_contact_type &&
                  CONTACT_TYPES[project.profiles.preferred_contact_type] && (
                    <a
                    href={project.profiles.preferred_contact_value ?? '#'}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: fontSize.xs, padding: '7px 10px',
                      borderRadius: radius.lg, width: '100%',
                      backgroundColor: colors.bg.surface,
                      border: `0.5px solid ${colors.border.default}`,
                      color: CONTACT_TYPES[project.profiles.preferred_contact_type].color,
                      textDecoration: 'none', transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <span>{CONTACT_TYPES[project.profiles.preferred_contact_type].icon}</span>
                    <span>Contact via {CONTACT_TYPES[project.profiles.preferred_contact_type].label}</span>
                  </a>
                )}
              </div>

              {/* Team card */}
              {project.show_team || canSeePrivate ? (
                <div style={cardStyle}>
                  <h2 style={sectionTitle}>
                    Team · {members.length} {members.length === 1 ? 'member' : 'members'}
                  </h2>
                  {members.length === 0 ? (
                    <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                      No members yet. Be the first to join!
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {members.map(member => {
                        const connectionMessage = acceptedConnections.find(
                          c => c.sender_id === member.user_id
                        )?.message
                        return (
                          <div key={member.id}>
                            {/* Avatar + info row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              {/* Avatar */}
                              <div style={{
                                width: '28px', height: '28px', borderRadius: radius.lg,
                                backgroundColor: colors.accent.teal,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: fontSize.xs, fontWeight: 500, color: '#fff', flexShrink: 0,
                              }}>
                                {getInitials(member.profiles)}
                              </div>

                              {/* Name + HiveOS manager badge + contact link */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Name + badge on same line */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <Link
                                    href={`/profile/${member.profiles?.id}`}
                                    style={{
                                      fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary,
                                      textDecoration: 'none', overflow: 'hidden',
                                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                                  >
                                    {getFullName(member.profiles)}
                                  </Link>

                                  {/* HiveOS manager badge — inline with name */}
                                  {member.is_hiveos_manager && (
                                    <span style={{
                                      fontSize: fontSize.xs,
                                      color: colors.accent.indigoText,
                                      backgroundColor: colors.accent.indigoDim,
                                      border: `0.5px solid ${colors.accent.indigoBorder}`,
                                      borderRadius: radius.sm,
                                      padding: '1px 5px',
                                      flexShrink: 0,
                                    }}>
                                      ⚡HiveOS Manager
                                    </span>
                                  )}
                                </div>

                                {/* Preferred contact link */}
                                {member.profiles?.preferred_contact_type &&
                                  CONTACT_TYPES[member.profiles.preferred_contact_type] && (
                                  <a
                                    href={member.profiles.preferred_contact_value ?? '#'}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{
                                      fontSize: fontSize.xs,
                                      color: CONTACT_TYPES[member.profiles.preferred_contact_type].color,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    {CONTACT_TYPES[member.profiles.preferred_contact_type].icon}{' '}
                                    {CONTACT_TYPES[member.profiles.preferred_contact_type].label}
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Remove button — owner only, visible on hover
                                marginLeft aligns it under the member name */}
                            {isOwner && member.user_id !== currentUserId && (
                              <button
                                onClick={() => setLeaveModal({
                                  mode:       'remove',
                                  memberId:   member.id,
                                  userId:     member.user_id,
                                  memberName: getFullName(member.profiles),
                                })}
                                style={{
                                  fontSize: fontSize.xs,
                                  color: colors.text.muted,
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px 0',
                                  marginLeft: '36px',
                                  marginBottom: '4px',
                                  display: 'block',
                                  transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = colors.status.danger)}
                                onMouseLeave={e => (e.currentTarget.style.color = colors.text.muted)}
                              >
                                Remove from project
                              </button>
                            )}

                            {/* Connection message — visible to owner only
                                Shows why this member joined the project */}
                            {connectionMessage && (
                              <p style={{
                                fontSize: fontSize.xs, lineHeight: 1.5,
                                padding: '6px 10px', borderRadius: radius.lg,
                                fontStyle: 'italic', color: colors.text.muted,
                                backgroundColor: colors.bg.surface,
                                border: `0.5px solid ${colors.border.default}`,
                                marginLeft: '36px',
                              }}>
                                "{connectionMessage}"
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                  <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginBottom: '4px' }}>🔒 Team is private</p>
                  <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>Follow to see who's building this.</p>
                </div>
              )}

              {/* Details card */}
              <div style={cardStyle}>
                <h2 style={sectionTitle}>Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {project.duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
                      <span>⏱</span>
                      <span>Duration: <span style={{ color: colors.text.secondary }}>{project.duration}</span></span>
                    </div>
                  )}
                  {project.spots && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
                      <span>👥</span>
                      <span>Spots: <span style={{ color: colors.text.secondary }}>{project.spots}</span></span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
                    <span>📅</span>
                    <span>Posted: <span style={{ color: colors.text.secondary }}>
                      {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
                    <span>👁</span>
                    <span style={{ color: colors.text.secondary }}>
                      {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
                    </span>
                  </div>

                  {(project.website_url || project.github_url) && (
                    <div style={{ paddingTop: '8px', borderTop: `0.5px solid ${colors.border.default}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {project.website_url && (
                        <a
                          href={project.website_url}
                          target="_blank" rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: fontSize.xs, color: colors.accent.tealText,
                            textDecoration: 'none', padding: '5px 8px',
                            borderRadius: radius.md,
                            backgroundColor: colors.accent.tealDim,
                            border: `0.5px solid ${colors.accent.tealBorder}`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          🌐 View demo
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank" rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: fontSize.xs, color: colors.text.secondary,
                            textDecoration: 'none', padding: '5px 8px',
                            borderRadius: radius.md,
                            backgroundColor: colors.bg.surface,
                            border: `0.5px solid ${colors.border.default}`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = colors.border.hover)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border.default)}
                        >
                          ⌥ GitHub repository
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy settings — owner only */}
              {isOwner && (
                <div style={cardStyle}>
                  <h2 style={sectionTitle}>Privacy</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { key: 'show_milestones', label: 'Milestones' },
                      { key: 'show_build_log',  label: 'Build Log' },
                      { key: 'show_chat',       label: 'Team Chat' },
                      { key: 'show_team',       label: 'Team members' },
                    ].map(({ key, label }) => {
                      const isPublic = (project as any)[key]
                      return (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: fontSize.xs, color: colors.text.secondary }}>{label}</span>
                          <button
                            onClick={async () => {
                              await supabase.from('projects').update({ [key]: !isPublic }).eq('id', project.id)
                              router.refresh()
                            }}
                            style={{
                              fontSize: fontSize.xs, padding: '3px 8px',
                              borderRadius: radius.md, cursor: 'pointer',
                              backgroundColor: isPublic ? colors.status.successDim : colors.bg.hover,
                              color:           isPublic ? colors.status.success    : colors.text.muted,
                              border:          isPublic ? `0.5px solid rgba(16,185,129,0.25)` : `0.5px solid ${colors.border.default}`,
                            }}
                          >
                            {isPublic ? 'Public' : 'Private'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: '10px' }}>
                    Private sections are visible to members and followers only.
                  </p>
                </div>
              )}

              {/* Mark as completed */}
              {isOwner && project.status === 'open' && (
                <button
                  onClick={() => setShowCompletionModal(true)}
                  style={{ ...styles.btnIndigo, width: '100%', padding: '10px', fontSize: fontSize.sm }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.indigoDim)}
                >
                  ✓ Mark as completed
                </button>
              )}

              {/* Delete project */}
              {isOwner && (
                <button
                  onClick={handleDeleteProject}
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

              {/* Rating banner */}
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
                    onClick={() => setShowRatingModal(true)}
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

              {/* Removed notice — shown only to the removed member */}
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

              {/* Follow button */}
              {!isOwner && !isMember && (
                <button
                  onClick={handleFollow}
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

              {/* I'm interested */}
              {!isOwner && !isMember && (
                <button
                  onClick={() => {
                    if (!currentUserId) { router.push('/login'); return }
                    setShowModal(true)
                  }}
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

              {/* Already a member badge and leave button */}
              {isMember && !isOwner && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Badge */}
                  <div style={{
                    width: '100%', padding: '10px', textAlign: 'center',
                    fontSize: fontSize.sm, fontWeight: 500, borderRadius: radius.lg,
                    backgroundColor: colors.accent.indigoDim,
                    color: colors.accent.indigoText,
                    border: `0.5px solid ${colors.accent.indigoBorder}`,
                  }}>
                    ✓ You're on this team
                  </div>

                  {/* Leave button */}
                  <button
                    onClick={() => {
                      const me = members.find(m => m.user_id === currentUserId)
                      if (!me) return
                      setLeaveModal({
                        mode:       'leave',
                        memberId:   me.id,
                        userId:     currentUserId!,
                        memberName: 'you',
                      })
                    }}
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

              {/* HiveOS button — members and owner only */}
              {(isMember || isOwner) && (
                <button
                  onClick={() => {
                    setHiveOSOpen(prev => !prev)
                    // Scroll to top of HiveOS panel when opening
                    if (!hiveOSOpen) {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
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

            </div>
          </div>
        </div>

        {/* HiveOS slide panel */}
        {hiveOSOpen && (isMember || isOwner) && (
          <HiveOSPanel
            projectId={project.id}
            tasks={tasks}
            milestones={milestones}
            members={members}
            currentUserId={currentUserId}
            canManage={canManageHiveOS}
            isOwner={isOwner}
            onClose={() => setHiveOSOpen(false)}
            onTasksChange={setTasks}
          />
        )}
      </div>

      {/* Modals */}
      {showRatingModal && currentUserId && (
        <RatingModal
          projectId={project.id}
          members={members.filter(m => m.user_id !== currentUserId)}
          currentUserId={currentUserId}
          onComplete={() => { setShowRatingModal(false); setRatingRequired(false) }}
        />
      )}

      {showModal && (
        <InterestModal
          projectTitle={project.title}
          preferredContactType={userContact.type}
          preferredContactValue={userContact.value}
          onConfirm={handleConfirmInterest}
          onCancel={() => setShowModal(false)}
          loading={connStatus === 'loading'}
        />
      )}

      {showCompletionModal && (
        <CompletionModal
          projectTitle={project.title}
          onConfirm={handleMarkCompleted}
          onCancel={() => setShowCompletionModal(false)}
          loading={completing}
        />
      )}

      {leaveModal && (
        <LeaveProjectModal
          mode={leaveModal.mode}
          memberName={leaveModal.memberName}
          onConfirm={handleLeaveOrRemove}
          onCancel={() => setLeaveModal(null)}
          loading={leaveLoading}
        />
      )}
    </main>
  )
}