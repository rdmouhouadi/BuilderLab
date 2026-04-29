// Page principale de BuilderLab — le feed de projets
// C'est un Server Component Next.js par défaut
// Ça veut dire que le fetch des données se fait côté serveur
// avant même que la page arrive dans le navigateur — plus rapide et meilleur pour le SEO

import { createClient } from '@/lib/supabase'
import { Project } from '@/types'
import ProjectCard from '@/components/ProjectCard'
import FilterBar from '@/components/FilterBar'

export default async function HomePage() {

  // createClient() est async donc on doit l'awaiter
  const supabase = await createClient()

  // Requête simple d'abord — on ajoutera les jointures après
const { data: projects, error } = await supabase
  .from('projects')
  .select(`
    *,
    profiles!projects_owner_id_fkey(id, name, country, avg_rating),
    project_skills(skill_needed)
  `)
  // !projects_owner_id_fkey dit à Supabase quelle clé étrangère utiliser
  // pour joindre la table profiles à projects
  // Sans ça, Supabase ne sait pas comment relier les deux tables

  // project_skills n'a qu'une seule FK vers projects
  // donc pas besoin de préciser la clé — Supabase la trouve tout seul

  .eq('status', 'open')
  // On filtre uniquement les projets ouverts à la collaboration
  // 'open' correspond au status par défaut qu'on a défini dans le schéma SQL

  .order('created_at', { ascending: false })
  // Les plus récents en premier
  // ascending: false = ordre décroissant (du plus récent au plus ancien)

  if (error) {
    console.error('Erreur fetch projets:', error.message)
    return (
      <div className="p-8 text-red-400">
        Erreur : {error.message}
      </div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Trouve ton prochain projet
        </h1>
        <p className="text-slate-400">
          Collabore avec des étudiants, construis des projets réels, enrichis ton portfolio.
        </p>
      </div>

      <FilterBar />

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project as Project} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <p className="text-lg mb-2">Aucun projet disponible pour l'instant.</p>
          <p className="text-sm">Sois le premier à en poster un !</p>
        </div>
      )}
    </main>
  )
}