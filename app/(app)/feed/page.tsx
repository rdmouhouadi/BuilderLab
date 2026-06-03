// Page principale de BuilderLab — le feed de projets
// C'est un Server Component Next.js par défaut
// Ça veut dire que le fetch des données se fait côté serveur
// avant même que la page arrive dans le navigateur — plus rapide et meilleur pour le SEO
// puis les passe au composant Feed (Client) pour l'interactivité

import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import Feed from '@/components/Feed'
import PageTransition from '@/components/PageTransition'

export default async function HomePage() {
  const supabase = await createClient()

  // On récupère l'utilisateur connecté
  // pour exclure ses propres projets du feed
  const { data: { user } } = await supabase.auth.getUser()

  // Construction de la requête de base
  let query = supabase
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

  // Si connecté → on exclut ses propres projets du feed
  // Ils sont accessibles depuis "My Projects" dans le profil
  if (user) {
    query = query.neq('owner_id', user.id)
  }

  const { data: projects, error } = await query

  if (error) {
    console.error('Erreur fetch projets:', error.message)
    return <div className="p-8 text-red-400">Erreur : {error.message}</div>
  }

  return (
    <PageTransition>
      {/* On passe les projets ET le currentUserId au composant Feed
          currentUserId permet de filtrer les projets
          dont l'utilisateur est déjà membre */}
      <Feed
        projects={(projects as Project[]) ?? []}
        currentUserId={user?.id ?? null}
      />
    </PageTransition>
  )
}