// app/profile/page.tsx
// Page de profil de l'utilisateur connecté
// Server Component — on fetch les données côté serveur
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Project } from '@/types'
import ProfileClient from '@/components/ProfileClient'
import PageTransition from '@/components/PageTransition'

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
  const { data: projects } = await supabase
    .from('projects')
    .select('*, project_skills(skill_needed)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <PageTransition>
      <ProfileClient
        profile={profile}
        projects={(projects as Project[]) ?? []}
        email={user.email ?? ''}
      />
    </PageTransition>
  )
}