// components/Feed.tsx
// Client Component — gère la recherche, les filtres et l'affichage
// Reçoit tous les projets du serveur et filtre côté client
// Pas besoin de refetch à chaque filtre — plus rapide
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Project } from '@/types'
import ProjectCard from '@/components/ProjectCard'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

// Props que ce composant reçoit depuis app/page.tsx
type Props = {
  projects: Project[]
}

// Options des dropdowns
const SKILLS = ['All Skills', 'Developer', 'Designer', 'Data Scientist', 'Business', 'Marketing']
const LEVELS = ['All Levels', 'débutant', 'intermédiaire', 'avancé']

export default function Feed({ projects }: Props) {

  // États des filtres
  const [search, setSearch] = useState('')
  const [skill, setSkill] = useState('All Skills')
  const [level, setLevel] = useState('All Levels')

  // États des dropdowns ouverts/fermés
  const [skillOpen, setSkillOpen] = useState(false)
  const [levelOpen, setLevelOpen] = useState(false)

  // Client Supabase pour récupérer l'utilisateur connecté
  const supabase = createBrowserSupabaseClient()

  // ID de l'utilisateur connecté — null si pas connecté
  // Permet de savoir si l'utilisateur est le owner d'un projet
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    // On récupère l'utilisateur au chargement du composant
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [])

  // useMemo recalcule les projets filtrés seulement quand
  // search, skill ou level changent — optimisation des performances
  const filtered = useMemo(() => {
    return projects.filter(project => {

      // Filtre par recherche — on cherche dans le titre et le problème
      const matchSearch = search === '' ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.problem?.toLowerCase().includes(search.toLowerCase())

      // Filtre par skill — on cherche dans les skills recherchées du projet
      const matchSkill = skill === 'All Skills' ||
        project.project_skills?.some(s => s.skill_needed === skill)

      // Filtre par niveau
      const matchLevel = level === 'All Levels' || project.level === level

      // Un projet s'affiche seulement s'il passe tous les filtres
      return matchSearch && matchSkill && matchLevel
    })
  }, [projects, search, skill, level])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero banner */}
      <div
        className="w-full rounded-2xl px-8 py-10 mb-8"
        style={{
          background: 'linear-gradient(135deg, #0D2137 0%, #0F2A1F 100%)',
          border: '1px solid #1E2840',
        }}
      >
        {/* Stat de la semaine */}
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: '#0D9488' }}>↗</span>
          <span className="text-sm font-medium" style={{ color: '#0D9488' }}>
            {projects.length} available projects
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-3" style={{ color: '#F1F5F9' }}>
          Find your next{' '}
          <strong style={{ color: '#0D9488', fontWeight: "bold" }}>collab project</strong>
        </h1>
        <p className="text-sm max-w-lg" style={{ color: '#64748B' }}>
          Connect with students working on meaningful projects. 
        </p>
        <p className="text-sm max-w-lg" style={{ color: '#64748B' }}>
          Build your skills, and ship real things together.
        </p>
      </div>

      {/* Barre de recherche + filtres — style Figma */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-6"
        style={{
          backgroundColor: '#161B28',
          border: '1px solid #1E2840',
        }}
      >

        {/* Capsule de "Icône loupe + Input de recherche"  */ }
        <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1"
        style={{ backgroundColor: '#080c1d' }}
        >
            {/* Icône loupe */}
            <svg
            className="w-4 h-4 flex-shrink-0"
            style={{ color: '#475569' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Input de recherche */}
            <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#F1F5F9' }}
            />
        </div>

        {/* Séparateur vertical */}
        <div className="w-px h-5 mx-2" style={{ backgroundColor: '#1E2840' }} />

        {/* Icône filtre */}
        <svg
          className="w-4 h-4 flex-shrink-0"
          style={{ color: '#475569' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>

        {/* Dropdown All Skills */}
        <div className="relative">
          <button
            onClick={() => { setSkillOpen(!skillOpen); setLevelOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: skill !== 'All Skills' ? 'rgba(13,148,136,0.14)' : 'transparent',
              color: skill !== 'All Skills' ? '#5EEAD4' : '#94A3B8',
              border: skill !== 'All Skills' ? '1px solid rgba(13,148,136,0.28)' : '2px solid #1E2840',
            }}
          >
            {skill}
            {/* Icône chevron */}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Menu dropdown Skills */}
          {skillOpen && (
            <div
              className="absolute top-full mt-1 right-0 rounded-xl overflow-hidden z-10 min-w-40"
              style={{
                backgroundColor: '#1A2235',
                border: '1px solid #1E2840',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {SKILLS.map(s => (
                <button
                  key={s}
                  onClick={() => { setSkill(s); setSkillOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    color: skill === s ? '#5EEAD4' : '#94A3B8',
                    backgroundColor: skill === s ? 'rgba(13,148,136,0.1)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = skill === s ? 'rgba(13,148,136,0.1)' : 'transparent')}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown All Levels */}
        <div className="relative">
          <button
            onClick={() => { setLevelOpen(!levelOpen); setSkillOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: level !== 'All Levels' ? 'rgba(13,148,136,0.14)' : 'transparent',
              color: level !== 'All Levels' ? '#5EEAD4' : '#94A3B8',
              border: level !== 'All Levels' ? '1px solid rgba(13,148,136,0.28)' : '2px solid #1E2840',
            }}
          >
            {level}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Menu dropdown Levels */}
          {levelOpen && (
            <div
              className="absolute top-full mt-1 right-0 rounded-xl overflow-hidden z-10 min-w-40"
              style={{
                backgroundColor: '#1A2235',
                border: '1px solid #1E2840',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => { setLevel(l); setLevelOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors capitalize"
                  style={{
                    color: level === l ? '#5EEAD4' : '#94A3B8',
                    backgroundColor: level === l ? 'rgba(13,148,136,0.1)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = level === l ? 'rgba(13,148,136,0.1)' : 'transparent')}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: '#475569' }}>
          {/* Affiche le nombre de projets filtrés */}
          Showing <span className="font-bold" style={{ color: 'rgb(255, 255, 255)', fontWeight: 'bold' }}>{filtered.length}</span> projects
        </p>
        <p className="text-sm font-medium" style={{ color: '#0D9488', fontWeight: 'bold' }}>
          Most Recent
        </p>
      </div>

      {/* Grille de projets */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        // État vide — aucun projet ne correspond aux filtres
        <div className="flex flex-col items-center justify-center py-20"
          style={{ color: '#475569' }}
        >
          <p className="text-lg mb-2">Aucun projet trouvé.</p>
          <p className="text-sm">Essaie d'autres filtres.</p>
        </div>
      )}

    </main>
  )
}