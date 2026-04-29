// app/projects/[id]/page.tsx
// Page détaillée d'un projet
// [id] est un paramètre dynamique — chaque projet a sa propre URL
// Ex: /projects/123e4567-e89b-12d3-a456-426614174000
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ProjectDetailClient from '@/components/ProjectDetailClient'
import PageTransition from '@/components/PageTransition'

type Props = {
  // Next.js passe automatiquement les paramètres de l'URL
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Utilisateur connecté — peut être null
  const { data: { user } } = await supabase.auth.getUser()

  // On fetch le projet avec toutes ses relations
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      profiles!projects_owner_id_fkey(
        id, name, country, bio, avg_rating,
        preferred_contact_type, preferred_contact_value
      ),
      project_skills(skill_needed)
    `)
    .eq('id', id)
    .single()

  // Projet introuvable → page 404
  if (error || !project) redirect('/')

  // On fetch les membres acceptés du projet
  const { data: members } = await supabase
    .from('project_members')
    .select(`
      *,
      profiles(
        id, name, country, avg_rating,
        preferred_contact_type, preferred_contact_value
      )
    `)
    .eq('project_id', id)
    .eq('status', 'active')

  // On fetch les milestones du projet
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true })

  // On vérifie si l'utilisateur a déjà envoyé une demande
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

  return (
    <PageTransition>
      <ProjectDetailClient
        project={project}
        members={members ?? []}
        milestones={milestones ?? []}
        currentUserId={user?.id ?? null}
        existingConnection={existingConnection}
      />
    </PageTransition>
  )
}