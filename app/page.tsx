// Page principale de BuilderLab — le feed de projets
// C'est un Server Component Next.js par défaut
// Ça veut dire que le fetch des données se fait côté serveur
// avant même que la page arrive dans le navigateur — plus rapide et meilleur pour le SEO
//puis les passe au composant Feed (Client) pour l'interactivité

import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import Feed from '@/components/Feed'
import PageTransition from '@/components/PageTransition'

export default async function HomePage() {
  const supabase = await createClient()

  // On fetch tous les projets ouverts avec leurs jointures
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
        *,
        profiles!projects_owner_id_fkey(id, name, country, avg_rating),
        project_skills(skill_needed),
        project_members(user_id),
        project_updates(created_at)
      `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur fetch projets:', error.message)
    return <div className="p-8 text-red-400">Erreur : {error.message}</div>
  }

  return (
    <PageTransition>
      {/* On passe les projets au composant Feed */}
      <Feed projects={(projects as Project[]) ?? []} />
    </PageTransition>
  )
}