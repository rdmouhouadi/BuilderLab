// app/profile/page.tsx
// Page de profil de l'utilisateur connecté
// Server Component — on fetch les données côté serveur
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Project } from '@/types'
import ProfileClient from '@/components/ProfileClient'
import PageTransition from '@/components/PageTransition'
import { Analytics } from "@vercel/analytics/next"

export default async function ProfilePage() {
  const supabase = await createClient()

  // On récupère l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()

  // Si pas connecté → rediriger vers login
  if (!user) redirect('/login')

  // On récupère le profil complet
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // On récupère les projets postés par cet utilisateur
  const { data: ownedProjects } = await supabase
    .from('projects')
    .select('*, project_skills(skill_needed)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  
  // Projets où l'utilisateur est membre (pas owner)
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


  // On extrait les projets depuis la jointure
  const joinedProjects = memberProjects
    ?.map(m => m.projects)
    .filter(Boolean) ?? [] as Project[]

  // Projets suivis par l'utilisateur
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

  // On extrait les projets depuis la jointure
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