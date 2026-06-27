// components/ProjectDetailClient.tsx
// Orchestrates the full project detail page.
// Owns all state and Supabase mutations; delegates rendering to
// ProjectHeader, ProjectMilestonesCard, the sidebar cards, and HiveOSPanel.
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project, Milestone, ProjectUpdate, ProjectMessage, ProjectComment, Task } from '@/types'
import { colors, radius, fontSize, layout } from '@/lib/design-tokens'

import BackButton from '@/components/BackButton'
import ProjectHeader from '@/components/ProjectHeader'
import ProjectComments from '@/components/ProjectComments'
import RatingModal from '@/components/RatingModal'
import InterestModal from '@/components/InterestModal'
import CompletionModal from '@/components/CompletionModal'
import LeaveProjectModal from '@/components/LeaveProjectModal'
import HiveOSPanel from '@/components/HiveOSPanel'

import ProjectMilestonesCard from '@/components/ProjectDetail/ProjectMilestonesCard'
import OwnerCard from '@/components/ProjectDetail/sidebar/OwnerCard'
import TeamCard from '@/components/ProjectDetail/sidebar/TeamCard'
import DetailsCard from '@/components/ProjectDetail/sidebar/DetailsCard'
import PrivacyCard from '@/components/ProjectDetail/sidebar/PrivacyCard'
import ProjectActions from '@/components/ProjectDetail/sidebar/ProjectActions'
import { cardStyle, Member, Connection, AcceptedConnection, getFullName } from '@/components/ProjectDetail/shared'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

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
  // These three booleans drive almost every conditional in the
  // sidebar and milestones card, so they're computed once here.
  const isOwner       = currentUserId === project.owner_id
  const isMember      = members.some(m => m.user_id === currentUserId)
  const canSeePrivate = isOwner || isMember || isFollower

  // ── Project data (kept in sync after an edit) ──
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
  }, [currentUserId, supabase])

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

  // Toggles one privacy column (show_milestones, show_chat, etc.)
  async function handlePrivacyToggle(key: 'show_milestones' | 'show_build_log' | 'show_chat' | 'show_team') {
    await supabase.from('projects').update({ [key]: !project[key] }).eq('id', project.id)
    router.refresh()
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <main style={{ maxWidth: '1024px', margin: '0 auto', padding: `40px ${layout.wrapPadding}` }}>

      <BackButton fallback="/feed" />

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

              <ProjectMilestonesCard
                project={project}
                milestones={milestones}
                updates={updates}
                initialMessages={initialMessages}
                currentUserId={currentUserId}
                isOwner={isOwner}
                isMember={isMember}
                canSeePrivate={canSeePrivate}
                newMilestone={newMilestone}
                addingMilestone={addingMilestone}
                onNewMilestoneChange={setNewMilestone}
                onAddMilestone={handleAddMilestone}
                onToggleMilestone={toggleMilestone}
                onDeleteMilestone={handleDeleteMilestone}
              />

              <ProjectComments
                projectId={project.id}
                initialComments={initialComments}
                currentUserId={currentUserId}
              />
            </div>

            {/* ── Sidebar (1/3) ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <OwnerCard profile={project.profiles} />

              {project.show_team || canSeePrivate ? (
                <TeamCard
                  members={members}
                  acceptedConnections={acceptedConnections}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  onRemoveMember={member => setLeaveModal({
                    mode:       'remove',
                    memberId:   member.id,
                    userId:     member.user_id,
                    memberName: getFullName(member.profiles),
                  })}
                />
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                  <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginBottom: '4px' }}>🔒 Team is private</p>
                  <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>Follow to see who&apos;s building this.</p>
                </div>
              )}

              <DetailsCard project={project} followersCount={followersCount} />

              {isOwner && (
                <PrivacyCard project={project} onToggle={handlePrivacyToggle} />
              )}

              <ProjectActions
                project={project}
                isOwner={isOwner}
                isMember={isMember}
                onMarkCompleted={() => setShowCompletionModal(true)}
                onDeleteProject={handleDeleteProject}
                ratingRequired={ratingRequired}
                showRatingModal={showRatingModal}
                onOpenRatingModal={() => setShowRatingModal(true)}
                removedReason={removedReason}
                isFollowing={isFollowing}
                followLoading={followLoading}
                onFollow={handleFollow}
                connStatus={connStatus}
                onShowInterestModal={() => {
                  if (!currentUserId) { router.push('/login'); return }
                  setShowModal(true)
                }}
                onLeaveProject={() => {
                  const me = members.find(m => m.user_id === currentUserId)
                  if (!me) return
                  setLeaveModal({ mode: 'leave', memberId: me.id, userId: currentUserId!, memberName: 'you' })
                }}
                hiveOSOpen={hiveOSOpen}
                onToggleHiveOS={() => {
                  setHiveOSOpen(prev => !prev)
                  // Scroll to top so the HiveOS panel is visible right away
                  if (!hiveOSOpen) window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
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