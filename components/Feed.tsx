// components/Feed.tsx
// Client Component — gère la recherche, les filtres et l'affichage
// Reçoit tous les projets du serveur et filtre côté client
// Pas besoin de refetch à chaque filtre — plus rapide
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Project } from '@/types'
import ProjectCard from '@/components/ProjectCard'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { SKILLS, LEVELS, DURATIONS } from '@/lib/constants'

// Props que ce composant reçoit depuis app/page.tsx
type Props = {
  projects: Project[]
  currentUserId: string | null // ID de l'utilisateur connecté, ou null si pas connecté
}

// Options des dropdowns — on ajoute l'option "All" en tête de liste
const SKILL_OPTIONS = ['All Skills', ...SKILLS]
const LEVEL_OPTIONS = ['All Levels', ...LEVELS]
const DURATION_OPTIONS = ['Any Duration', ...DURATIONS]

export default function Feed({ projects }: Props) {

  // États des filtres
  const [search, setSearch] = useState('')
  const [skill, setSkill] = useState('All Skills')
  const [level, setLevel] = useState('All Levels')
  const [duration, setDuration] = useState('Any Duration')

  // États des dropdowns ouverts/fermés
  const [skillOpen, setSkillOpen] = useState(false)
  const [levelOpen, setLevelOpen] = useState(false)
  const [durationOpen, setDurationOpen] = useState(false)

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
  // search, skill, level ou duration changent — optimisation des performances
  const filtered = useMemo(() => {
    return projects.filter(project => {

      // Exclure les projets dont on est déjà membre
      // project_members contient les user_id des membres
      const isMember = project.project_members?.some(
        m => m.user_id === currentUserId
      )
      if (isMember) return false

      // Filtre par recherche — on cherche dans le titre et le problème
      const matchSearch = search === '' ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.problem?.toLowerCase().includes(search.toLowerCase())

      // Filtre par skill — on cherche dans les skills recherchées du projet
      const matchSkill = skill === 'All Skills' ||
        project.project_skills?.some(s => s.skill_needed === skill)

      // Filtre par niveau
      const matchLevel = level === 'All Levels' || project.level === level

      // Filtre par durée
      const matchDuration = duration === 'Any Duration' || project.duration === duration

      // Un projet s'affiche seulement s'il passe TOUS les filtres
      return matchSearch && matchSkill && matchLevel && matchDuration
    })
  }, [projects, search, skill, level, duration, currentUserId])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Hero banner */}
      <div
        className="w-full rounded-2xl px-6 py-8 mb-8"
        style={{
          background: 'linear-gradient(135deg, #0D2137 0%, #0F2A1F 100%)',
          border: '1px solid #1E2840',
          // Empêche tout débordement sur mobile
          overflow: 'hidden',
        }}
      >
        {/* Nombre de projets disponibles */}
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: '#0D9488' }}>↗</span>
          <span className="text-sm font-medium" style={{ color: '#0D9488' }}>
            {projects.length} available {projects.length !== 1 ? 'project' : 'project'}
          </span>
        </div>

        {/* Titre — plus petit sur mobile grâce à text-2xl md:text-3xl */}
        <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#F1F5F9' }}>
          Find your next{' '}
          <strong style={{ color: '#0D9488', fontWeight: 'bold' }}>collab project</strong>
        </h1>
        <p className="text-sm max-w-lg" style={{ color: '#64748B' }}>
          Connect with students working on meaningful projects.
          Build your skills, and ship real things together.
        </p>
      </div>

      {/* Barre de recherche + filtres — responsive */}
      <div
        className="flex flex-col gap-2 px-4 py-3 rounded-2xl mb-6"
        style={{
          backgroundColor: '#161B28',
          border: '1px solid #1E2840',
        }}
      >

        {/* Ligne 1 — Search bar */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
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

        {/* Ligne 2 — Filtres en grid
            2 colonnes sur mobile, 3 colonnes sur desktop
            Duration prend toute la largeur sur mobile (col-span-2) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">

          {/* Dropdown All Skills */}
          <div className="relative">
            <button
              onClick={() => { setSkillOpen(!skillOpen); setLevelOpen(false); setDurationOpen(false) }}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: skill !== 'All Skills' ? 'rgba(13,148,136,0.14)' : 'transparent',
                color: skill !== 'All Skills' ? '#5EEAD4' : '#94A3B8',
                border: skill !== 'All Skills' ? '1px solid rgba(13,148,136,0.28)' : '1px solid #1E2840',
              }}
            >
              <span className="truncate text-xs">{skill}</span>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu dropdown Skills */}
            {skillOpen && (
              <div
                className="absolute top-full mt-1 left-0 rounded-xl overflow-hidden z-20 w-48"
                style={{
                  backgroundColor: '#1A2235',
                  border: '1px solid #1E2840',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* On utilise SKILL_OPTIONS qui inclut "All Skills" en tête */}
                {SKILL_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSkill(s); setSkillOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors"
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
              onClick={() => { setLevelOpen(!levelOpen); setSkillOpen(false); setDurationOpen(false) }}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: level !== 'All Levels' ? 'rgba(13,148,136,0.14)' : 'transparent',
                color: level !== 'All Levels' ? '#5EEAD4' : '#94A3B8',
                border: level !== 'All Levels' ? '1px solid rgba(13,148,136,0.28)' : '1px solid #1E2840',
              }}
            >
              <span className="truncate text-xs capitalize">{level}</span>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu dropdown Levels */}
            {levelOpen && (
              <div
                className="absolute top-full mt-1 left-0 rounded-xl overflow-hidden z-20 w-40"
                style={{
                  backgroundColor: '#1A2235',
                  border: '1px solid #1E2840',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* On utilise LEVEL_OPTIONS qui inclut "All Levels" en tête */}
                {LEVEL_OPTIONS.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLevel(l); setLevelOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors capitalize"
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

          {/* Dropdown Any Duration
              col-span-2 sur mobile = pleine largeur
              md:col-span-1 sur desktop = largeur normale */}
          <div className="relative col-span-2 md:col-span-1">
            <button
              onClick={() => { setDurationOpen(!durationOpen); setSkillOpen(false); setLevelOpen(false) }}
              className="w-full flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                backgroundColor: duration !== 'Any Duration' ? 'rgba(13,148,136,0.14)' : 'transparent',
                color: duration !== 'Any Duration' ? '#5EEAD4' : '#94A3B8',
                border: duration !== 'Any Duration' ? '1px solid rgba(13,148,136,0.28)' : '1px solid #1E2840',
              }}
            >
              <div className="flex items-center gap-1.5">
                {/* Icône horloge */}
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate text-xs">{duration}</span>
              </div>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu dropdown Duration */}
            {durationOpen && (
              <div
                className="absolute top-full mt-1 left-0 rounded-xl overflow-hidden z-20 w-40"
                style={{
                  backgroundColor: '#1A2235',
                  border: '1px solid #1E2840',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* On utilise DURATION_OPTIONS qui inclut "Any Duration" en tête */}
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => { setDuration(d); setDurationOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs transition-colors"
                    style={{
                      color: duration === d ? '#5EEAD4' : '#94A3B8',
                      backgroundColor: duration === d ? 'rgba(13,148,136,0.1)' : 'transparent',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = duration === d ? 'rgba(13,148,136,0.1)' : 'transparent')}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Compteur de résultats */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: '#475569' }}>
          Showing{' '}
          <span className="font-bold" style={{ color: 'rgb(255, 255, 255)' }}>
            {filtered.length}
          </span>{' '}
          
          {filtered.length !== 1 ? 'projects' : 'project'}
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
          <p className="text-lg mb-2">No projects found.</p>
          <p className="text-sm">Try different filters.</p>
        </div>
      )}

    </main>
  )
}