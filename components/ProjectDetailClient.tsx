// components/ProjectDetailClient.tsx
// Affiche le détail complet d'un projet
// Gère : milestones, team, contact, rating, "I'm interested"
// 'use client' car on utilise useState pour les interactions
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project, Milestone, ProjectUpdate } from '@/types'
import RatingModal from '@/components/RatingModal'
import ProjectUpdates from '@/components/ProjectUpdates'

// On importe les couleurs et constantes depuis lib/constants.ts
// pour garder la cohérence visuelle dans toute l'app
import { SKILL_COLORS, LEVEL_COLORS, CONTACT_TYPES ,SKILLS, DURATIONS, LEVELS } from '@/lib/constants'

// Type pour un membre du projet
type Member = {
  id: string           // project_member_id
  user_id: string
  role: string | null
  rating_required: boolean
  profiles: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
    country: string | null
    avg_rating: number
    preferred_contact_type: string | null
    preferred_contact_value: string | null
  } | null
}

// Type pour une connexion existante
type Connection = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
}

type Props = {
  project: Project
  members: Member[]
  milestones: Milestone[]
  updates: ProjectUpdate[]
  currentUserId: string | null
  existingConnection: Connection | null
}


export default function ProjectDetailClient({
  project,
  members,
  milestones: initialMilestones,
  updates,
  currentUserId,
  existingConnection,
}: Props) {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  // On stocke les données du projet en state local
  // On utilise un type partiel pour project_skills
  // car après édition on n'a pas encore les id générés par Supabase
  const [projectData, setProjectData] = useState<{
    title: string
    problem: string
    level: string
    domain: string
    duration: string
    spots: number | null
    // On accepte soit un ProjectSkill complet soit juste skill_needed
    project_skills: { id?: string; project_id?: string; skill_needed: string }[]
  }>({
    title: project.title,
    problem: project.problem ?? '',
    level: project.level ?? '',
    domain: project.domain ?? '',
    duration: project.duration ?? '',
    spots: project.spots ?? null,
    project_skills: project.project_skills ?? [],
  })

  // État du bouton "I'm interested"
  // Si une connexion existe déjà, on part en état "sent"
  const [connStatus, setConnStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>(
    existingConnection ? 'sent' : 'idle'
  )

  // État des milestones — stocké localement pour éviter un refetch
  // à chaque modification
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)

  // Champ de saisie pour ajouter un nouveau milestone
  const [newMilestone, setNewMilestone] = useState('')
  const [addingMilestone, setAddingMilestone] = useState(false)

  // Contrôle l'affichage du modal de rating
  const [showRatingModal, setShowRatingModal] = useState(false)

  // true si l'utilisateur courant doit encore noter ses collaborateurs
  const [ratingRequired, setRatingRequired] = useState(
    members.some(m => m.user_id === currentUserId && m.rating_required)
  )

  // L'utilisateur est-il le owner du projet ?
  const isOwner = currentUserId === project.owner_id

  // L'utilisateur est-il déjà membre du projet ?
  const isMember = members.some(m => m.user_id === currentUserId)

  // Progression des milestones en pourcentage
  const progress = milestones.length > 0
    ? Math.round(
        (milestones.filter(m => m.completed).length / milestones.length) * 100
      )
    : 0

  // Mode édition du projet
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: project.title,
    problem: project.problem ?? '',
    level: project.level ?? '',
    domain: project.domain ?? '',
    duration: project.duration ?? '',
    spots: project.spots?.toString() ?? '',
  })
  const [editSkills, setEditSkills] = useState<string[]>(
    // On initialise avec les skills actuelles du projet
    project.project_skills?.map(s => s.skill_needed) ?? []
  )
  const [saving, setSaving] = useState(false)


  // Nom complet d'un profil — reconstruit depuis first + last name
  function getFullName(profile: Member['profiles']) {
    if (!profile) return 'Anonymous'
    const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    return full || profile.name || 'Anonymous'
  }

  // Initiales pour l'avatar
  function getInitials(profile: Member['profiles'] | Project['profiles']) {
    if (!profile) return '?'
    // On essaie first_name/last_name d'abord, puis name
    const first = (profile as any).first_name?.[0]
    const last = (profile as any).last_name?.[0]
    if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
    return (profile as any).name?.[0]?.toUpperCase() ?? '?'
  }

  // Envoyer une demande de connexion
  async function handleInterest() {
    // Si pas connecté → rediriger vers login
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
        // Code 23505 = doublon — demande déjà envoyée
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

  // Cocher/décocher un milestone — optimistic update
  // On met à jour l'UI immédiatement sans attendre Supabase
  async function toggleMilestone(milestone: Milestone) {
    setMilestones(prev =>
      prev.map(m =>
        m.id === milestone.id ? { ...m, completed: !m.completed } : m
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
      // On ajoute le nouveau milestone à la liste locale
      setMilestones(prev => [...prev, data])
      setNewMilestone('')
    }

    setAddingMilestone(false)
  }

  // Supprimer un milestone — optimistic update
  async function handleDeleteMilestone(id: string) {
    setMilestones(prev => prev.filter(m => m.id !== id))
    await supabase.from('milestones').delete().eq('id', id)
  }

  // Marquer le projet comme completed
  async function handleMarkCompleted() {
    // On met à jour le status du projet
    await supabase
      .from('projects')
      .update({ status: 'completed' })
      .eq('id', project.id)

    // On marque rating_required = true pour tous les membres
    // pour déclencher le système de notation obligatoire
    await supabase
      .from('project_members')
      .update({ rating_required: true })
      .eq('project_id', project.id)

    // On recharge la page pour refléter le nouveau status
    router.refresh()
  }

  // Fonction de suppression du projet
  async function handleDeleteProject() {
    // Confirmation avant suppression — évite les suppressions accidentelles
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.'
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)

    if (!error) {
      // On redirige vers le feed après suppression
      router.push('/')
    }
  }

  // Sauvegarde les modifications du projet
  async function handleSaveEdit() {
  setSaving(true)

  // Étape 1 — Mettre à jour les champs du projet
  const { error: projectError } = await supabase
    .from('projects')
    .update({
      title: editForm.title,
      problem: editForm.problem,
      // On s'assure que le level est en minuscules
      // pour respecter la contrainte SQL
      level: editForm.level.toLowerCase(),
      domain: editForm.domain,
      duration: editForm.duration || null,
      spots: editForm.spots ? parseInt(editForm.spots) : null,
    })
    .eq('id', project.id)

  if (projectError) {
    setSaving(false)
    return
  }

  // Étape 2 — Mettre à jour les skills
  await supabase
    .from('project_skills')
    .delete()
    .eq('project_id', project.id)

  if (editSkills.length > 0) {
    await supabase
      .from('project_skills')
      .insert(editSkills.map(skill => ({
        project_id: project.id,
        skill_needed: skill,
      })))
  }

  // Étape 3 — Mettre à jour le state local
  // pour afficher les nouvelles données sans recharger
  setProjectData({
    title: editForm.title,
    problem: editForm.problem,
    level: editForm.level.toLowerCase(),
    domain: editForm.domain,
    duration: editForm.duration || '',
    spots: editForm.spots ? parseInt(editForm.spots) : null,
    project_skills: editSkills.map(skill => ({ skill_needed: skill })),
  })

  setSaving(false)
  // On quitte le mode édition — les nouvelles données
  // sont déjà dans le state local, pas besoin de recharger
  setEditing(false)
}


  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      {/* Bouton retour vers le feed */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors px-3 py-1.5 rounded-md font-medium"
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

      {/* Layout en deux colonnes sur desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Header du projet */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            {/* Domain + status badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
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

              {/* Boutons Edit / Save / Cancel — owner seulement */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                        style={{ color: '#64748B', border: '1px solid #1E2840' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                        style={{
                          backgroundColor: '#0D9488',
                          color: 'white',
                          opacity: saving ? 0.7 : 1,
                        }}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'rgba(13,148,136,0.14)',
                        color: '#5EEAD4',
                        border: '1px solid rgba(13,148,136,0.28)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(13,148,136,0.25)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(13,148,136,0.14)')}
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            {editing ? (
              // Mode édition — formulaire inline
              <div className="flex flex-col gap-4">

                {/* Titre */}
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none font-bold"
                  style={{
                    backgroundColor: '#0C1120',
                    border: '1px solid #0D9488',
                    color: '#F1F5F9',
                    fontSize: '1.1rem',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
                />

                {/* Description */}
                <textarea
                  value={editForm.problem}
                  onChange={e => setEditForm(p => ({ ...p, problem: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    backgroundColor: '#0C1120',
                    border: '1px solid #1E2840',
                    color: '#F1F5F9',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
                />

                {/* Level */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium" style={{ color: '#64748B' }}>Level</label>
                  <div className="flex gap-2">
                    {LEVELS.map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setEditForm(p => ({ ...p, level: l }))}
                        className="flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                        style={{
                          backgroundColor: editForm.level === l
                            ? 'rgba(13,148,136,0.2)' : '#0C1120',
                          border: editForm.level === l
                            ? '1px solid #0D9488' : '1px solid #1E2840',
                          color: editForm.level === l ? '#5EEAD4' : '#64748B',
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration + Spots */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: '#64748B' }}>Duration</label>
                    <select
                      value={editForm.duration}
                      onChange={e => setEditForm(p => ({ ...p, duration: e.target.value }))}
                      className="px-3 py-2 rounded-lg text-xs outline-none"
                      style={{
                        backgroundColor: '#0C1120',
                        border: '1px solid #1E2840',
                        color: '#F1F5F9',
                      }}
                    >
                      <option value="">No duration</option>
                      {DURATIONS.map(d => (
                        <option key={d} value={d} style={{ backgroundColor: '#161B28' }}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: '#64748B' }}>Spots</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.spots}
                      onChange={e => setEditForm(p => ({ ...p, spots: e.target.value }))}
                      className="px-3 py-2 rounded-lg text-xs outline-none"
                      style={{
                        backgroundColor: '#0C1120',
                        border: '1px solid #1E2840',
                        color: '#F1F5F9',
                      }}
                    />
                  </div>
                </div>

                {/* Skills recherchées */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                    Skills needed
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setEditSkills(prev =>
                          prev.includes(skill)
                            ? prev.filter(s => s !== skill)
                            : [...prev, skill]
                        )}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          backgroundColor: editSkills.includes(skill)
                            ? 'rgba(13,148,136,0.2)' : '#0C1120',
                          border: editSkills.includes(skill)
                            ? '1px solid #0D9488' : '1px solid #1E2840',
                          color: editSkills.includes(skill) ? '#5EEAD4' : '#64748B',
                        }}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            ) : (
              // Mode affichage normal
              <>
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#F1F5F9' }}>
                  {projectData.title}
                </h1>
                <p className="text-sm leading-relaxed mb-4 break-words overflow-hidden" style={{ color: '#94A3B8' }}>
                  {projectData.problem}
                </p>

                {/* Skills + niveau */}
                <div className="flex flex-wrap gap-2">
                  {projectData.project_skills?.map(skill => {
                    const colors = SKILL_COLORS[skill.skill_needed] ?? {
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
                  {projectData.level && (() => {
                    const colors = LEVEL_COLORS[project.level] ?? {
                      bg: 'rgba(255,255,255,0.07)', text: '#CBD5E1'
                    }
                    return (
                      <span
                        className="text-xs px-2.5 py-1 rounded-md font-medium capitalize"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {projectData.level}
                      </span>
                    )
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Section Milestones */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            {/* Header milestones */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                Milestones
              </h2>
              <span className="text-xs" style={{ color: '#475569' }}>
                {milestones.filter(m => m.completed).length}/{milestones.length} completed
              </span>
            </div>

            {/* Barre de progression — visible seulement si au moins 1 milestone */}
            {milestones.length > 0 && (
              <div
                className="w-full h-1.5 rounded-full mb-4"
                style={{ backgroundColor: '#1E2840' }}
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: '#0D9488' }}
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
                  {/* Checkbox — cliquable seulement par le owner */}
                  <button
                    onClick={() => isOwner && toggleMilestone(milestone)}
                    className="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: milestone.completed ? '#0D9488' : 'transparent',
                      borderColor: milestone.completed ? '#0D9488' : '#1E2840',
                      cursor: isOwner ? 'pointer' : 'default',
                    }}
                  >
                    {/* Icône check quand complété */}
                    {milestone.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Titre du milestone — barré si complété */}
                  <span
                    className="text-sm flex-1"
                    style={{
                      color: milestone.completed ? '#475569' : '#94A3B8',
                      textDecoration: milestone.completed ? 'line-through' : 'none',
                    }}
                  >
                    {milestone.title}
                  </span>

                  {/* Bouton supprimer — visible au hover, seulement pour le owner */}
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
                  // Enter pour ajouter rapidement sans cliquer le bouton
                  onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    backgroundColor: '#0C1120',
                    border: '1px solid #1E2840',
                    color: '#F1F5F9',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
                />
                <button
                  onClick={handleAddMilestone}
                  disabled={addingMilestone || !newMilestone.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: 'rgba(13,148,136,0.14)',
                    color: '#5EEAD4',
                    border: '1px solid rgba(13,148,136,0.28)',
                    // Opacité réduite si champ vide ou en cours d'ajout
                    opacity: !newMilestone.trim() ? 0.5 : 1,
                  }}
                >
                  Add
                </button>
              </div>
            )}

            {/* Espace entre Milestones et Build Log */}
            <div className="mt-2" />

            {/* Section Build Log — updates du projet */}
            <ProjectUpdates
              projectId={project.id}
              updates={updates}
              currentUserId={currentUserId}
              // Peut poster si owner ou membre actif
              canPost={isOwner || isMember}
            />

          </div>
        </div>

        {/* ── Colonne latérale (1/3) ── */}
        <div className="flex flex-col gap-6">

          {/* Card Owner */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: '#F1F5F9' }}>
              Posted by
            </h2>

            <div className="flex items-center gap-3 mb-3">
              {/* Avatar du owner */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
              >
                {getInitials(project.profiles)}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                  {getFullName(project.profiles as any)}
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

            {/* Lien de contact préféré du owner
                On utilise CONTACT_TYPES depuis constants.ts */}
            {project.profiles?.preferred_contact_type &&
              CONTACT_TYPES[project.profiles.preferred_contact_type] && (
              <a
                href={project.profiles.preferred_contact_value ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl w-full transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: '#0C1120',
                  border: '1px solid #1E2840',
                  color: CONTACT_TYPES[project.profiles.preferred_contact_type].color,
                }}
              >
                <span>{CONTACT_TYPES[project.profiles.preferred_contact_type].icon}</span>
                <span>
                  Contact via {CONTACT_TYPES[project.profiles.preferred_contact_type].label}
                </span>
              </a>
            )}
          </div>

          {/* Card Team */}
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
                    {/* Avatar du membre */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
                    >
                      {getInitials(member.profiles)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#F1F5F9' }}>
                        {getFullName(member.profiles)}
                      </p>
                      {/* Lien de contact préféré du membre */}
                      {member.profiles?.preferred_contact_type &&
                        CONTACT_TYPES[member.profiles.preferred_contact_type] && (
                        <a
                          href={member.profiles.preferred_contact_value ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs hover:opacity-80 transition-opacity"
                          style={{
                            color: CONTACT_TYPES[member.profiles.preferred_contact_type].color,
                          }}
                        >
                          {CONTACT_TYPES[member.profiles.preferred_contact_type].icon}{' '}
                          {CONTACT_TYPES[member.profiles.preferred_contact_type].label}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card Details du projet */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            <h2 className="font-semibold text-sm mb-4" style={{ color: '#F1F5F9' }}>
              Details
            </h2>
            <div className="flex flex-col gap-3">

              {/* Durée estimée */}
              {project.duration && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Duration:{' '}
                  <span style={{ color: '#94A3B8' }}>{project.duration}</span>
                </div>
              )}

              {/* Nombre de spots */}
              {project.spots && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#64748B' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Spots:{' '}
                  <span style={{ color: '#94A3B8' }}>{project.spots}</span>
                </div>
              )}

              {/* Date de création */}
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

          {/* ── Actions ── */}

          {/* Bouton Mark as completed — owner seulement, projet encore ouvert */}
          {isOwner && project.status === 'open' && (
            <button
              onClick={handleMarkCompleted}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all"
              style={{
                backgroundColor: 'rgba(99,102,241,0.14)',
                color: '#A5B4FC',
                border: '1px solid rgba(99,102,241,0.28)',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.14)')}
            >
              ✓ Mark as completed
            </button>
          )}

          {/* Bouton Delete project — owner seulement */}
          {isOwner && (
            <button
              onClick={handleDeleteProject}
              className="w-full py-3 rounded-xl font-medium text-sm transition-all"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#FCA5A5',
                border: '1px solid rgba(239,68,68,0.28)',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')}
            >
              🗑 Delete project
            </button>
          )}

          {/* Bannière de rating — visible pour les membres
              qui doivent encore noter leurs collaborateurs */}
          {ratingRequired && !showRatingModal && (
            <div
              className="w-full p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}
            >
              <p className="text-xs mb-3" style={{ color: '#FCD34D' }}>
                ⭐ This project is completed. Please rate your collaborators.
              </p>
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'rgba(245,158,11,0.2)',
                  color: '#FCD34D',
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
              >
                Rate collaborators →
              </button>
            </div>
          )}

          {/* Bouton "I'm interested" — caché si owner ou déjà membre */}
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
              }}
            >
              {connStatus === 'loading' && 'Sending...'}
              {connStatus === 'sent' && '✓ Request sent'}
              {connStatus === 'error' && 'Try again'}
              {connStatus === 'idle' && "I'm interested →"}
            </button>
          )}

          {/* Badge si déjà membre de l'équipe */}
          {isMember && !isOwner && (
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

      {/* Modal de rating — affiché par dessus tout le contenu
          On exclut l'utilisateur courant de la liste à noter
          car on ne se note pas soi-même */}
      {showRatingModal && currentUserId && (
        <RatingModal
          projectId={project.id}
          members={members.filter(m => m.user_id !== currentUserId)}
          currentUserId={currentUserId}
          onComplete={() => {
            // Cache le modal et la bannière après soumission
            setShowRatingModal(false)
            setRatingRequired(false)
          }}
        />
      )}
    </main>
  )
}