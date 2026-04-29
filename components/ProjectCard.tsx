// Ce composant affiche UN projet sous forme de carte
// Il reçoit un projet en "prop" depuis la page principale
// Une prop c'est comme un argument de fonction — des données passées de parent à enfant

import { Project } from '@/types'

// On définit le type des props que ce composant accepte
type Props = {
  project: Project
}

export default function ProjectCard({ project }: Props) {

  // Couleurs associées à chaque compétence
  // On les définit ici pour garder la carte lisible
  const skillColors: Record<string, { bg: string; text: string }> = {
    'Developer':       { bg: 'rgba(13,148,136,0.14)',  text: '#5EEAD4' },
    'Designer':        { bg: 'rgba(14,165,233,0.14)',  text: '#7DD3FC' },
    'Data Scientist':  { bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
    'Business':        { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
    'Marketing':       { bg: 'rgba(236,72,153,0.14)',  text: '#F9A8D4' },
  }

  // Couleurs pour le niveau de difficulté
  const levelColors: Record<string, { bg: string; text: string }> = {
    'Biginner':       { bg: 'rgba(16,185,129,0.14)',  text: '#6EE7B7' },
    'Intermediate':  { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
    'Advanced':         { bg: 'rgba(239,68,68,0.14)',   text: '#FCA5A5' },
  }

  // On récupère les initiales du créateur pour l'avatar
  // Ex: "Moussa Ba" → "MB"
  const initials = project.profiles?.name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase() ?? '?'

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        backgroundColor: '#161B28',
        border: '1px solid #1E2840',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      }}
    >

      {/* En-tête : auteur + pays */}
      <div className="flex items-center gap-3">
        {/* Avatar avec initiales */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
        >
          {initials}
        </div>
        <div>
          {/* Nom du créateur */}
          <p className="text-sm font-medium text-white">
            {project.profiles?.name ?? 'Anonyme'}
          </p>
          {/* Pays — optionnel */}
          {project.profiles?.country && (
            <p className="text-xs text-slate-400">{project.profiles.country}</p>
          )}
        </div>
      </div>

      {/* Titre et description du projet */}
      <div>
        <h3 className="text-white font-semibold text-base mb-1 leading-snug">
          {project.title}
        </h3>
        {/* line-clamp-3 = on coupe le texte après 3 lignes */}
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {project.problem}
        </p>
      </div>

      {/* Tags : compétences recherchées + niveau */}
      <div className="flex flex-wrap gap-2">
        {/* On affiche chaque compétence recherchée */}
        {project.project_skills?.map((skill) => {
          const colors = skillColors[skill.skill_needed] ?? {
            bg: 'rgba(255,255,255,0.07)',
            text: '#CBD5E1'
          }
          return (
            <span
              key={skill.skill_needed}
              className="text-xs px-2.5 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {skill.skill_needed}
            </span>
          )
        })}

        {/* Badge de niveau */}
        {project.level && (() => {
          const colors = levelColors[project.level] ?? {
            bg: 'rgba(255,255,255,0.07)',
            text: '#CBD5E1'
          }
          return (
            <span
              className="text-xs px-2.5 py-0.5 rounded-md font-medium"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {project.level}
            </span>
          )
        })()}
      </div>

      {/* Pied de carte : rating auteur + bouton */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid #1E2840' }}
      >
        {/* Note moyenne de l'auteur */}
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>⭐</span>
          <span>
            {project.profiles?.avg_rating
              ? project.profiles.avg_rating.toFixed(1)
              : 'New'
            }
          </span>
        </div>

        {/* Bouton d'intérêt — on branchera la logique plus tard */}
        <button
          className="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: 'rgba(13,148,136,0.14)',
            color: '#5EEAD4',
            border: '1px solid rgba(13,148,136,0.28)',
          }}
        >
          I'm interested
        </button>
      </div>

    </div>
  )
}