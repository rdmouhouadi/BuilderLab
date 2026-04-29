// components/ProjectDetailClient.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project, Milestone } from '@/types'

type Member = {
  id: string
  user_id: string
  role: string | null
  profiles: {
    id: string
    name: string | null
    country: string | null
    avg_rating: number
    preferred_contact_type: string | null
    preferred_contact_value: string | null
  } | null
}

type Connection = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
}

type Props = {
  project: Project
  members: Member[]
  milestones: Milestone[]
  currentUserId: string | null
  existingConnection: Connection | null
}

// Icônes et labels pour chaque type de contact
const CONTACT_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  discord:   { label: 'Discord',   icon: '🎮', color: '#5865F2' },
  whatsapp:  { label: 'WhatsApp',  icon: '💬', color: '#25D366' },
  slack:     { label: 'Slack',     icon: '⚡', color: '#E01E5A' },
  telegram:  { label: 'Telegram',  icon: '✈️', color: '#0088CC' },
  email:     { label: 'Email',     icon: '📧', color: '#0D9488' },
}

const skillColors: Record<string, { bg: string; text: string }> = {
  'Developer':      { bg: 'rgba(13,148,136,0.14)',  text: '#5EEAD4' },
  'Designer':       { bg: 'rgba(14,165,233,0.14)',  text: '#7DD3FC' },
  'Data Scientist': { bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
  'Business':       { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
  'Marketing':      { bg: 'rgba(236,72,153,0.14)',  text: '#F9A8D4' },
}

const levelColors: Record<string, { bg: string; text: string }> = {
  'débutant':      { bg: 'rgba(16,185,129,0.14)', text: '#6EE7B7' },
  'intermédiaire': { bg: 'rgba(245,158,11,0.14)', text: '#FCD34D' },
  'avancé':        { bg: 'rgba(239,68,68,0.14)',  text: '#FCA5A5' },
}

export default function ProjectDetailClient({
  project, members, milestones: initialMilestones,
  currentUserId, existingConnection
}: Props) {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  // État du bouton "I'm interested"
  const [connStatus, setConnStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(
    existingConnection ? 'sent' : 'idle'
  )

  // État des milestones — on les stocke localement
  // pour mettre à jour l'UI sans refetch
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)

  // État du formulaire d'ajout de milestone
  const [newMilestone, setNewMilestone] = useState('')
  const [addingMilestone, setAddingMilestone] = useState(false)

  const isOwner = currentUserId === project.owner_id
  const isMember = members.some(m => m.user_id === currentUserId)

  // Initiales pour l'avatar
  function getInitials(name: string | null | undefined) {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase()
  }

  // Envoyer une demande de connexion
  async function handleInterest() {
    if (!currentUserId) {
      router.push('/login')
      return
    }
    setConnStatus('loading')
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
        setConnStatus('sent')
      } else if (error) {
        throw error
      } else {
        setConnStatus('sent')
      }
    } catch {
      setConnStatus('error')
    }
  }

  // Cocher/décocher un milestone
  async function toggleMilestone(milestone: Milestone) {
    // On met à jour l'UI immédiatement — optimistic update
    // Si Supabase échoue, on pourra rollback
    setMilestones(prev =>
      prev.map(m => m.id === milestone.id
        ? { ...m, completed: !m.completed }
        : m
      )
    )
    await supabase
      .from('milestones')
      .update({ completed: !milestone.completed })
      .eq('id', milestone.id)
  }

  // Ajouter un nouveau milestone
  async function handleAddMilestone() {
    if (!newMilestone.trim()) return
    setAddingMilestone(true)

    const { data, error } = await supabase
      .from('milestones')
      .insert({
        project_id: project.id,
        title: newMilestone.trim(),
        // Position = après le dernier milestone existant
        position: milestones.length,
      })
      .select()
      .single()

    if (!error && data) {
      setMilestones(prev => [...prev, data])
      setNewMilestone('')
    }
    setAddingMilestone(false)
  }

  // Supprimer un milestone
  async function handleDeleteMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id))
    await supabase.from('milestones').delete().eq('id', id)
  }

  // Progression des milestones en pourcentage
  const progress = milestones.length > 0
    ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)
    : 0

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      {/* Bouton retour */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors px-3 py-1.5 rounded-md font-medium"
        //className="text-sm px-3 py-1.5 rounded-lg transition-colors"
        style={{ 
            color: '#475569',
            border: '1px solid #1E2840',
         }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#F1F5F9'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#94A3B8'
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#64748B'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#1E2840'
        }}
      >
        ← Back to projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Colonne principale — 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Header du projet */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            {/* Domain + status */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs px-2.5 py-1 rounded-md font-medium"
                style={{
                  backgroundColor: 'rgba(13,148,136,0.14)',
                  color: '#5EEAD4',
                  border: '1px solid rgba(13,148,136,0.28)',
                }}
              >
                {project.domain}
              </span>
              <span
                className="text-xs px-2.5 py-1 rounded-md font-medium capitalize"
                style={{
                  backgroundColor: project.status === 'open'
                    ? 'rgba(16,185,129,0.14)'
                    : 'rgba(245,158,11,0.14)',
                  color: project.status === 'open' ? '#6EE7B7' : '#FCD34D',
                }}
              >
                {project.status}
              </span>
            </div>

            {/* Titre */}
            <h1
              className="text-2xl font-bold mb-4"
              style={{ color: '#F1F5F9' }}
            >
              {project.title}
            </h1>

            {/* Description complète */}
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: '#94A3B8' }}
            >
              {project.problem}
            </p>

            {/* Skills + niveau */}
            <div className="flex flex-wrap gap-2">
              {project.project_skills?.map(skill => {
                const colors = skillColors[skill.skill_needed] ?? {
                  bg: 'rgba(255,255,255,0.07)', text: '#CBD5E1'
                }
                return (
                  <span
                    key={skill.skill_needed}
                    className="text-xs px-2.5 py-1 rounded-md font-medium"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {skill.skill_needed}
                  </span>
                )
              })}
              {project.level && (() => {
                const colors = levelColors[project.level] ?? {
                  bg: 'rgba(255,255,255,0.07)', text: '#CBD5E1'
                }
                return (
                  <span
                    className="text-xs px-2.5 py-1 rounded-md font-medium capitalize"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {project.level}
                  </span>
                )
              })()}
            </div>
          </div>

          {/* Milestones */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            {/* Header milestones */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                Milestones
              </h2>
              {/* Progression */}
              <span className="text-xs" style={{ color: '#475569' }}>
                {milestones.filter(m => m.completed).length}/{milestones.length} completed
              </span>
            </div>

            {/* Barre de progression */}
            {milestones.length > 0 && (
              <div
                className="w-full h-1.5 rounded-full mb-4"
                style={{ backgroundColor: '#1E2840' }}
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: '#0D9488',
                  }}
                />
              </div>
            )}

            {/* Liste des milestones */}
            <div className="flex flex-col gap-2 mb-4">
              {milestones.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: '#475569' }}>
                  No milestones yet.
                  {isOwner && ' Add your first one below.'}
                </p>
              )}
              {milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl group"
                  style={{ backgroundColor: '#0C1120' }}
                >
                  {/* Checkbox — seulement cliquable par le owner */}
                  <button
                    onClick={() => isOwner && toggleMilestone(milestone)}
                    className="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: milestone.completed
                        ? '#0D9488'
                        : 'transparent',
                      borderColor: milestone.completed ? '#0D9488' : '#1E2840',
                      cursor: isOwner ? 'pointer' : 'default',
                    }}
                  >
                    {milestone.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Titre du milestone */}
                  <span
                    className="text-sm flex-1"
                    style={{
                      color: milestone.completed ? '#475569' : '#94A3B8',
                      textDecoration: milestone.completed ? 'line-through' : 'none',
                    }}
                  >
                    {milestone.title}
                  </span>

                  {/* Bouton supprimer — seulement pour le owner */}
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                      style={{ color: '#475569' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Formulaire ajout milestone — seulement pour le owner */}
            {isOwner && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a milestone..."
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  // Appuyer sur Enter pour ajouter
                  onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: '#0C1120',
                    border: '1px solid #1E2840',
                    color: '#F1F5F9',
                  }}
                />
                <button
                  onClick={handleAddMilestone}
                  disabled={addingMilestone || !newMilestone.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'rgba(13,148,136,0.14)',
                    color: '#5EEAD4',
                    border: '1px solid rgba(13,148,136,0.28)',
                    opacity: !newMilestone.trim() ? 0.5 : 1,
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale — 1/3 */}
        <div className="flex flex-col gap-6">

          {/* Owner */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: '#F1F5F9' }}>
              Posted by
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
              >
                {getInitials(project.profiles?.name)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                  {project.profiles?.name ?? 'Anonymous'}
                </p>
                <p className="text-xs" style={{ color: '#475569' }}>
                  {project.profiles?.country ?? ''} · ⭐{' '}
                  {project.profiles?.avg_rating
                    ? project.profiles.avg_rating.toFixed(1)
                    : 'New'
                  }
                </p>
              </div>
            </div>

            {/* Contact préféré du owner */}
            {project.profiles?.preferred_contact_type && (
              <a
                href={project.profiles.preferred_contact_value ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl w-full transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#0C1120',
                  border: '1px solid #1E2840',
                  color: CONTACT_TYPES[project.profiles.preferred_contact_type]?.color ?? '#94A3B8',
                }}
              >
                <span>
                  {CONTACT_TYPES[project.profiles.preferred_contact_type]?.icon}
                </span>
                <span>
                  Contact via {CONTACT_TYPES[project.profiles.preferred_contact_type]?.label}
                </span>
              </a>
            )}
          </div>

          {/* Team members */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: '#F1F5F9' }}>
              Team · {members.length} member{members.length !== 1 ? 's' : ''}
            </h2>

            {members.length === 0 ? (
              <p className="text-xs" style={{ color: '#475569' }}>
                No members yet. Be the first to join!
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
                    >
                      {getInitials(member.profiles?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#F1F5F9' }}>
                        {member.profiles?.name ?? 'Anonymous'}
                      </p>
                      {/* Contact préféré du membre */}
                      {member.profiles?.preferred_contact_type && (
                        <a
                          href={member.profiles.preferred_contact_value ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs hover:opacity-80 transition-opacity"
                          style={{
                            color: CONTACT_TYPES[member.profiles.preferred_contact_type]?.color ?? '#475569',
                          }}
                        >
                          {CONTACT_TYPES[member.profiles.preferred_contact_type]?.icon}{' '}
                          {CONTACT_TYPES[member.profiles.preferred_contact_type]?.label}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infos du projet */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: '#F1F5F9' }}>
              Details
            </h2>
            <div className="flex flex-col gap-3">
              {project.duration && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duration: <span style={{ color: '#94A3B8' }}>{project.duration}</span>
                </div>
              )}
              {project.spots && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Spots: <span style={{ color: '#94A3B8' }}>{project.spots}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Posted:{' '}
                <span style={{ color: '#94A3B8' }}>
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Bouton I'm interested — caché si owner ou déjà membre */}
          {!isOwner && !isMember && (
            <button
              onClick={handleInterest}
              disabled={connStatus === 'loading' || connStatus === 'sent'}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all"
              style={{
                backgroundColor: connStatus === 'sent'
                  ? 'rgba(16,185,129,0.14)'
                  : '#0D9488',
                color: connStatus === 'sent' ? '#6EE7B7' : 'white',
                border: connStatus === 'sent'
                  ? '1px solid rgba(16,185,129,0.28)'
                  : 'none',
                opacity: connStatus === 'loading' ? 0.7 : 1,
                cursor: connStatus === 'sent' ? 'default' : 'pointer',
                transition: 'background-color 0.3s ease', // ajout transition
              }}
              onMouseEnter={e => {
                if (connStatus !== 'sent' && connStatus !== 'loading') {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#09746b'
                }
              }}
              onMouseLeave={e => {
                if (connStatus !== 'sent' && connStatus !== 'loading') {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0D9488'
                }
              }}
            >
              {connStatus === 'loading' && 'Sending...'}
              {connStatus === 'sent' && '✓ Request sent'}
              {connStatus === 'error' && 'Try again'}
              {connStatus === 'idle' && "I'm interested"}
            </button>
          )}

          {/* Badge si déjà membre */}
          {isMember && (
            <div
              className="w-full py-3 rounded-xl text-center text-sm font-medium"
              style={{
                backgroundColor: 'rgba(99,102,241,0.14)',
                color: '#A5B4FC',
                border: '1px solid rgba(99,102,241,0.28)',
              }}
            >
              ✓ You're on this team
            </div>
          )}
        </div>
      </div>
    </main>
  )
}