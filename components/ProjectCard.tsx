// Ce composant affiche UN projet sous forme de carte
// Il reçoit un projet en "prop" depuis la page principale
// Une prop c'est comme un argument de fonction — des données passées de parent à enfant
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project } from '@/types'
import Link from 'next/link'
import { getTimeLabel } from '@/lib/timeLabel'


type Props = {
  project: Project
  currentUserId?: string | null
}

export default function ProjectCard({ project, currentUserId }: Props) {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  const skillColors: Record<string, { bg: string; text: string }> = {
    'Developer':      { bg: 'rgba(13,148,136,0.14)',  text: '#5EEAD4' },
    'Designer':       { bg: 'rgba(14,165,233,0.14)',  text: '#7DD3FC' },
    'Data Scientist': { bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
    'Business':       { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
    'Marketing':      { bg: 'rgba(236,72,153,0.14)',  text: '#F9A8D4' },
  }

  const levelColors: Record<string, { bg: string; text: string }> = {
    'beginner':      { bg: 'rgba(16,185,129,0.14)',  text: '#6EE7B7' },
    'intermediate':  { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
    'advanced':      { bg: 'rgba(239,68,68,0.14)',   text: '#FCA5A5' },
    'débutant':      { bg: 'rgba(16,185,129,0.14)',  text: '#6EE7B7' },
    'intermédiaire': { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
    'avancé':        { bg: 'rgba(239,68,68,0.14)',   text: '#FCA5A5' },
  }

  const initials = project.profiles?.name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase() ?? '?'

  const isOwner = currentUserId === project.owner_id

  async function handleInterest() {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    setStatus('loading')
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          sender_id: currentUserId,
          project_id: project.id,
          message: "I'm interested in collaborating on your project.",
          status: 'pending',
        })
      if (error?.code === '23505') {
        setStatus('sent')
      } else if (error) {
        throw error
      } else {
        setStatus('sent')
      }
    } catch {
      setStatus('error')
    }
  }

  function getButtonStyle() {
    switch (status) {
      case 'sent':    return { backgroundColor: 'rgba(16,185,129,0.14)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.28)', cursor: 'default' }
      case 'error':   return { backgroundColor: 'rgba(239,68,68,0.14)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.28)', cursor: 'pointer' }
      case 'loading': return { backgroundColor: 'rgba(13,148,136,0.14)', color: '#5EEAD4', border: '1px solid rgba(13,148,136,0.28)', cursor: 'not-allowed', opacity: 0.6 }
      default:        return { backgroundColor: 'rgba(13,148,136,0.14)', color: '#5EEAD4', border: '1px solid rgba(13,148,136,0.28)', cursor: 'pointer' }
    }
  }

  function getButtonLabel() {
    switch (status) {
      case 'loading': return 'Sending...'
      case 'sent':    return '✓ Request sent'
      case 'error':   return 'Try again'
      default:        return "I'm interested"
    }
  }

  // Calcule le signal d'activité du projet
  // Basé sur le dernier update posté par un membre
  function getActivitySignal(): string | null {
    const updates = project.project_updates
    if (!updates || updates.length === 0) return null

    // On prend le plus récent — le premier dans la liste
    // car on fetch avec order created_at desc
    const latest = updates.reduce((a, b) =>
      new Date(a.created_at) > new Date(b.created_at) ? a : b
    )

    const diffHours = Math.floor(
      (Date.now() - new Date(latest.created_at).getTime()) / (1000 * 60 * 60)
    )

    if (diffHours < 24) return 'Active today'
    if (diffHours < 48) return 'Active yesterday'

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Active ${diffDays}d ago`
    if (diffDays < 30) return `Active ${Math.floor(diffDays / 7)}w ago`
    return null // Trop inactif — on n'affiche rien
  }

  const activitySignal = getActivitySignal()
  const memberCount = project.project_members?.length ?? 0

  // Rectangle unique, pas de double encapsulation
  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <div
        className="rounded-2xl p-5 flex flex-col h-full cursor-pointer transition-all"
        style={{
          backgroundColor: '#161B28',
          border: '1px solid #1E2840',
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#0D9488')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2840')}
      >
        {/* En-tête : auteur + pays */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
              {project.profiles?.name ?? 'Anonymous'}
            </p>
            {project.profiles?.country && (
              <p className="text-xs" style={{ color: '#475569' }}>
                {project.profiles.country}
              </p>
            )}
          </div>
        </div>

        {/* Titre */}
        <h3 className="font-semibold text-base mb-2 leading-snug" style={{ color: '#F1F5F9' }}>
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed line-clamp-3 flex-1 mb-4" style={{ color: '#64748B' }}>
          {project.problem}
        </p>

        {/* Skills + niveau
        On affiche seulement les 2 premières skills
        et un badge "+N more" si il y en a plus */}
        <div className="flex flex-wrap gap-2">
          {project.project_skills?.slice(0, 2).map(skill => {
            const colors = skillColors[skill.skill_needed] ?? {
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

          {/* Badge "+N more" si plus de 2 skills */}
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

          {/* Badge niveau — toujours affiché */}
          {project.level && (() => {
            const colors = levelColors[project.level] ?? {
              bg: 'rgba(255,255,255,0.07)', text: '#CBD5E1'
            }
            return (
              <span
                className="text-xs px-2.5 py-0.5 rounded-md font-medium capitalize"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {project.level}
              </span>
            )
          })()}
        </div>

        {/* Footer */}
        <div
          className="flex flex-col gap-2 pt-3 mt-auto"
          style={{ borderTop: '1px solid #1E2840' }}
        >
          {/* Ligne 1 : rating + duration + spots + bouton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">

              {/* Rating ou timestamp */}
              <div className="flex items-center gap-1 text-xs flex-shrink-0 whitespace-nowrap" style={{ color: '#475569' }}>
                <span>⭐</span>
                <span>
                  {project.profiles?.avg_rating
                    ? project.profiles.avg_rating.toFixed(1)
                    : getTimeLabel(project.created_at)
                  }
                </span>
              </div>

              {/* Duration */}
              {project.duration && (
                <div className="flex items-center gap-1 text-xs flex-shrink-0 whitespace-nowrap" style={{ color: '#475569' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {project.duration}
                </div>
              )}

              {/* Spots */}
              {project.spots && (
                <div className="flex items-center gap-1 text-xs flex-shrink-0 whitespace-nowrap" style={{ color: '#475569' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.spots} spots
                </div>
              )}
            </div>

            {/* Espace entre Spots et Button */}
            <div className="mt-2" />

            {/* Bouton I'm interested / Your project */}
            {!isOwner && (
              <button
                onClick={handleInterest}
                disabled={status === 'loading' || status === 'sent'}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex-shrink-0 whitespace-nowrap"
                style={getButtonStyle()}
              >
                {getButtonLabel()}
              </button>
            )}

            {isOwner && (
              <span
                className="text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0 whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(99,102,241,0.14)',
                  color: '#A5B4FC',
                  border: '1px solid rgba(99,102,241,0.28)',
                }}
              >
                Your project
              </span>
            )}
          </div>

          {/* Ligne 2 : activity signals — seulement si données disponibles */}
          {(memberCount > 0 || activitySignal) && (
            <div className="flex items-center gap-3">

              {/* Nombre de membres */}
              {memberCount > 0 && (
                <div className="flex items-center gap-1 text-xs" style={{ color: '#475569' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {memberCount} {memberCount === 1 ? 'member' : 'members'}
                </div>
              )}

              {/* Signal d'activité */}
              {activitySignal && (
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: '#10B981',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                  <span style={{ color: '#10B981' }}>{activitySignal}</span>
                </div>
              )}
            </div>
          )}
        </div>



      </div>
    </Link>
  )
}