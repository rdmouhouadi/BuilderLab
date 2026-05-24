// components/ArchiveClient.tsx
// Affiche les projets complétés et publics
// Feed similaire au feed principal mais pour les projets terminés
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Project } from '@/types'
import { SKILL_COLORS, LEVEL_COLORS } from '@/lib/constants'
import { getTimeLabel } from '@/lib/timeLabel'
import BackButton from '@/components/BackButton'

type Props = {
  projects: Project[]
}

export default function ArchiveClient({ projects }: Props) {
  const [search, setSearch] = useState('')

  // Filtre par recherche dans le titre et la description
  const filtered = useMemo(() => {
    if (!search) return projects
    return projects.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.problem?.toLowerCase().includes(search.toLowerCase())
    )
  }, [projects, search])

  // Nom complet du owner
  function getOwnerName(profile: Project['profiles']) {
    if (!profile) return 'Anonymous'
    const full = [(profile as any).first_name, (profile as any).last_name]
      .filter(Boolean).join(' ')
    return full || (profile as any).name || 'Anonymous'
  }

  // Initiales pour l'avatar
  function getInitials(profile: Project['profiles']) {
    if (!profile) return '?'
    const first = (profile as any).first_name?.[0]
    const last = (profile as any).last_name?.[0]
    if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
    return (profile as any).name?.[0]?.toUpperCase() ?? '?'
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      <BackButton fallback="/" />

      {/* Hero */}
      <div
        className="w-full rounded-2xl px-6 py-8 mb-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1A0D2E 0%, #0F1A2E 100%)',
          border: '1px solid #1E2840',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: '#A5B4FC' }}>🏁</span>
          <span className="text-sm font-medium" style={{ color: '#A5B4FC' }}>
            {projects.length} completed {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#F1F5F9' }}>
          The Archive
        </h1>
        <p className="text-sm max-w-lg" style={{ color: '#64748B' }}>
          Projects that shipped. Each one is a real story of students who built
          something together — browse, learn, and get inspired.
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-6"
        style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-1"
          style={{ backgroundColor: '#080c1d' }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            style={{ color: '#475569' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search completed projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#F1F5F9' }}
          />
        </div>
      </div>

      {/* Compteur */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: '#475569' }}>
          Showing{' '}
          <span className="font-bold" style={{ color: '#F1F5F9' }}>
            {filtered.length}
          </span>{' '}
          {filtered.length === 1 ? 'project' : 'projects'}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20"
          style={{ color: '#475569' }}
        >
          <p className="text-lg mb-2">No completed projects found.</p>
          <p className="text-sm">Try a different search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-2xl p-5 flex flex-col h-full transition-all"
              style={{
                backgroundColor: '#161B28',
                border: '1px solid #1E2840',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#A5B4FC')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2840')}
            >
              {/* Header : auteur */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  {getInitials(project.profiles)}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                    {getOwnerName(project.profiles)}
                  </p>
                  {project.profiles?.country && (
                    <p className="text-xs" style={{ color: '#475569' }}>
                      {(project.profiles as any).country}
                    </p>
                  )}
                </div>

                {/* Badge completed */}
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-md font-medium"
                  style={{
                    backgroundColor: 'rgba(99,102,241,0.14)',
                    color: '#A5B4FC',
                    border: '1px solid rgba(99,102,241,0.28)',
                  }}
                >
                  ✓ Shipped
                </span>
              </div>

              {/* Titre */}
              <h3 className="font-semibold text-base mb-2 leading-snug flex-1"
                style={{ color: '#F1F5F9' }}
              >
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed line-clamp-3 mb-4"
                style={{ color: '#64748B' }}
              >
                {project.problem}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.project_skills?.slice(0, 2).map(skill => {
                  const colors = SKILL_COLORS[skill.skill_needed] ?? {
                    bg: 'rgba(255,255,255,0.07)', text: '#CBD5E1'
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
                {project.project_skills && project.project_skills.length > 2 && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-md font-medium"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      color: '#64748B',
                      border: '1px solid #1E2840',
                    }}
                  >
                    +{project.project_skills.length - 2} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid #1E2840' }}
              >
                <div className="flex items-center gap-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs"
                    style={{ color: '#475569' }}
                  >
                    <span>⭐</span>
                    <span>
                      {project.profiles?.avg_rating
                        ? project.profiles.avg_rating.toFixed(1)
                        : 'New'
                      }
                    </span>
                  </div>

                  {/* Membres */}
                  <div className="flex items-center gap-1 text-xs"
                    style={{ color: '#475569' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.project_members?.length ?? 0} members
                  </div>
                </div>

                {/* Timestamp */}
                <span className="text-xs" style={{ color: '#475569' }}>
                  {getTimeLabel(project.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}