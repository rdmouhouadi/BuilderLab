// app/projects/[id]/page.tsx
// Dynamic project detail page — fetches all project data server-side.
// [id] is a dynamic URL parameter — each project has its own URL.
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ProjectDetailClient from '@/components/ProjectDetailClient'
import PageTransition from '@/components/PageTransition'
import { Analytics } from "@vercel/analytics/next"

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Project with owner profile and skills
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles!projects_owner_id_fkey(
        id, name, first_name, last_name, country, bio, avg_rating,
        preferred_contact_type, preferred_contact_value
      ),
      project_skills(skill_needed)
    `)
    .eq('id', id)
    .single()

  if (error || !project) redirect('/')

  // Active members with profiles + HiveOS fields
  const { data: members } = await supabase
    .from('project_members')
    .select(`
      *,
      profiles(
        id, name, first_name, last_name, country, avg_rating,
        preferred_contact_type, preferred_contact_value
      )
    `)
    .eq('project_id', id)
    .eq('status', 'active')

  // Accepted connection messages — shown in team section
  const { data: acceptedConnections } = await supabase
    .from('connections')
    .select('sender_id, message')
    .eq('project_id', id)
    .eq('status', 'accepted')

  // Last 50 group chat messages
  const { data: messages } = await supabase
    .from('project_messages')
    .select('*, profiles(id, name, first_name, last_name)')
    .eq('project_id', id)
    .order('created_at', { ascending: true })
    .limit(50)

  // Milestones ordered by position
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true })

  // Build log updates — most recent first
  const { data: updates } = await supabase
    .from('project_updates')
    .select('*, profiles(id, name, first_name, last_name, avg_rating)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // HiveOS tasks — ordered by position within each status
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assignee_id_fkey(id, name, first_name, last_name)
    `)
    .eq('project_id', id)
    .order('position', { ascending: true })

  // Existing connection request from current user
  let existingConnection = null
  if (user) {
    const { data } = await supabase
      .from('connections')
      .select('*')
      .eq('project_id', id)
      .eq('sender_id', user.id)
      .single()
    existingConnection = data
  }

  // Follower count
  const { count: followersCount } = await supabase
    .from('project_followers')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  // Is the current user already following?
  let isFollowing = false
  if (user) {
    const { data: followData } = await supabase
      .from('project_followers')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single()
    isFollowing = !!followData
  }

  // Community feedback comments
  const { data: comments } = await supabase
    .from('project_comments')
    .select('*, profiles(id, name, first_name, last_name, avg_rating)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  // Check if current user was previously removed from this project
  let removedReason: string | null = null
  if (user) {
    const { data: leftMember } = await supabase
      .from('project_members')
      .select('leave_reason, status')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .eq('status', 'left')
      .single()

    removedReason = leftMember?.leave_reason ?? null
  }

  return (
    <PageTransition>
      <ProjectDetailClient
        project={project}
        members={members ?? []}
        milestones={milestones ?? []}
        updates={updates ?? []}
        currentUserId={user?.id ?? null}
        existingConnection={existingConnection}
        acceptedConnections={acceptedConnections ?? []}
        initialMessages={messages ?? []}
        followersCount={followersCount ?? 0}
        isFollowing={isFollowing}
        isFollower={isFollowing}
        initialComments={comments ?? []}
        initialTasks={tasks ?? []}
        removedReason={removedReason}
      />
      <Analytics />
    </PageTransition>
  )
}