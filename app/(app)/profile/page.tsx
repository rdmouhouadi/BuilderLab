// app/profile/page.tsx
// Profile page for the currently logged-in user.
// Server Component — data is fetched on the server and passed to a client component.
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Project } from '@/types'
import ProfileClient from '@/components/ProfileClient'
import PageTransition from '@/components/PageTransition'
import { Analytics } from "@vercel/analytics/next"

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get the logged-in user; redirect to login if not authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the user's full profile row
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch projects the user owns (posted by them)
  const { data: ownedProjects } = await supabase
    .from('projects')
    .select('*, project_skills(skill_needed)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch projects where the user is an active member but not the owner
  const { data: memberProjects } = await supabase
    .from('project_members')
    .select(`
      project_id,
      projects(
        *,
        project_skills(skill_needed),
        profiles!projects_owner_id_fkey(name, country)
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Unwrap the join result to get a flat list of project objects
  const joinedProjects = memberProjects
    ?.map(m => m.projects)
    .filter(Boolean) ?? [] as Project[]

  // Fetch projects the user is following (saved/bookmarked)
  const { data: followedProjects } = await supabase
    .from('project_followers')
    .select(`
      project_id,
      projects(
        *,
        project_skills(skill_needed),
        profiles!projects_owner_id_fkey(name, country)
      )
    `)
    .eq('user_id', user.id)

  const followedProjectsList = (followedProjects
    ?.map(f => f.projects)
    .filter(Boolean)
    .flat() ?? []) as Project[]

  return (
    <PageTransition>
      <ProfileClient
        profile={profile}
        ownedProjects={(ownedProjects as Project[]) ?? []}
        joinedProjects={joinedProjects as any[]}
        followedProjects={followedProjectsList}
        email={user.email ?? ''}
      />
      <Analytics />
    </PageTransition>
  )
}
