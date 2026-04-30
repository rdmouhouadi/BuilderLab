// components/ProfileClient.tsx
// Gère l'affichage ET l'édition du profil
// 'use client' car on utilise useState pour le mode édition
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project } from '@/types'
// On importe les couleurs et constantes depuis lib/constants.ts
// pour éviter de les redéfinir ici
import { SKILL_COLORS, LEVEL_COLORS, CONTACT_TYPES } from '@/lib/constants'

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  country: string | null
  bio: string | null
  school: string | null
  major: string | null
  avg_rating: number
  ratings_count: number
  preferred_contact_type: string | null
  preferred_contact_value: string | null
}

type Props = {
  profile: Profile
  projects: Project[]
  email: string
}

export default function ProfileClient({ profile, projects, email }: Props) {
  const supabase = createBrowserSupabaseClient()

  // Mode édition — true = formulaire visible, false = affichage
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // État du formulaire — initialisé avec les données du profil
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    country: profile?.country ?? '',
    bio: profile?.bio ?? '',
    school: profile?.school ?? '',
    major: profile?.major ?? '',
    preferred_contact_type: profile?.preferred_contact_type ?? '',
    preferred_contact_value: profile?.preferred_contact_value ?? '',
  })

  // Nom complet reconstruit depuis first + last name
  const fullName = [form.first_name, form.last_name].filter(Boolean).join(' ')

  // Initiales pour l'avatar — première lettre de chaque prénom/nom
  const initials = [form.first_name?.[0], form.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || email[0].toUpperCase()

  // Met à jour un champ du formulaire
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Sauvegarde le profil dans Supabase
  async function handleSave() {
    setSaving(true)

    await supabase
      .from('profiles')
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        // On reconstruit name pour la compatibilité
        // avec les autres parties de l'app qui utilisent profiles.name
        name: fullName || null,
        country: form.country,
        bio: form.bio,
        school: form.school,
        major: form.major,
        preferred_contact_type: form.preferred_contact_type || null,
        preferred_contact_value: form.preferred_contact_value || null,
      })
      .eq('id', profile.id)

    setSaving(false)
    setSaved(true)
    setEditing(false)

    // Reset le message "Saved" après 2 secondes
    setTimeout(() => setSaved(false), 2000)
  }

  // Style commun pour tous les inputs en mode édition
  const inputStyle = {
    backgroundColor: '#0C1120',
    border: '1px solid #1E2840',
    color: '#F1F5F9',
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      {/* Header du profil */}
      <div
        className="rounded-2xl p-8 mb-6"
        style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
      >
        <div className="flex items-start justify-between mb-6">

          {/* Avatar + infos principales */}
          <div className="flex items-center gap-5">

            {/* Avatar avec initiales */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
            >
              {initials}
            </div>

            {editing ? (
              // Mode édition — first name + last name séparés
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="first_name"
                  type="text"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
                />
                <input
                  name="last_name"
                  type="text"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
                />
              </div>
            ) : (
              // Mode affichage
              <div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#F1F5F9' }}>
                  {fullName || 'No name yet'}
                </h1>
                <p className="text-sm" style={{ color: '#475569' }}>
                  {email}
                </p>
                {/* Contact préféré affiché sous l'email */}
                {form.preferred_contact_type && CONTACT_TYPES[form.preferred_contact_type] && (
                  <p className="text-xs mt-1" style={{
                    color: CONTACT_TYPES[form.preferred_contact_type].color
                  }}>
                    {CONTACT_TYPES[form.preferred_contact_type].icon}{' '}
                    {CONTACT_TYPES[form.preferred_contact_type].label}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Boutons Edit / Save / Cancel */}
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs" style={{ color: '#6EE7B7' }}>✓ Saved</span>
            )}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{ color: '#64748B', border: '1px solid #1E2840' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
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
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(13,148,136,0.14)',
                  color: '#5EEAD4',
                  border: '1px solid rgba(13,148,136,0.28)',
                }}
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Champs détaillés — mode édition */}
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                Country
              </label>
              <input
                name="country"
                type="text"
                placeholder="Ex: Congo"
                value={form.country}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              />
            </div>

            {/* School */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                School / University
              </label>
              <input
                name="school"
                type="text"
                placeholder="Ex: DataScienceTech Institute"
                value={form.school}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              />
            </div>

            {/* Major */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                Major / Specialty
              </label>
              <input
                name="major"
                type="text"
                placeholder="Ex: Computer Science"
                value={form.major}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              />
            </div>

            {/* Preferred contact type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                Preferred contact
              </label>
              <select
                name="preferred_contact_type"
                value={form.preferred_contact_type}
                onChange={handleChange}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  ...inputStyle,
                  color: form.preferred_contact_type ? '#F1F5F9' : '#475569',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              >
                <option value="">Select a platform</option>
                {/* On itère sur CONTACT_TYPES depuis constants.ts */}
                {Object.entries(CONTACT_TYPES).map(([key, val]) => (
                  <option key={key} value={key} style={{ backgroundColor: '#161B28' }}>
                    {val.icon} {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred contact value — affiché seulement si type sélectionné */}
            {form.preferred_contact_type && (
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                  {CONTACT_TYPES[form.preferred_contact_type]?.label} link or username
                </label>
                <input
                  name="preferred_contact_value"
                  type="text"
                  placeholder={
                    form.preferred_contact_type === 'email'
                      ? 'your@email.com'
                      : form.preferred_contact_type === 'discord'
                      ? 'https://discord.gg/yourserver'
                      : 'https://...'
                  }
                  value={form.preferred_contact_value}
                  onChange={handleChange}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
                />
              </div>
            )}

            {/* Bio — prend toute la largeur */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-medium" style={{ color: '#64748B' }}>
                Bio
              </label>
              <textarea
                name="bio"
                placeholder="Tell others about yourself, your skills and what you want to build..."
                value={form.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              />
            </div>
          </div>

        ) : (
          // Mode affichage — bio + infos secondaires
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              {form.bio || 'No bio yet. Click "Edit profile" to add one.'}
            </p>

            {/* Infos secondaires — pays, école, spécialité */}
            <div className="flex flex-wrap gap-4">
              {form.country && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                  <span>🌍</span>
                  <span>{form.country}</span>
                </div>
              )}
              {form.school && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                  <span>🎓</span>
                  <span>{form.school}</span>
                </div>
              )}
              {form.major && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
                  <span>📚</span>
                  <span>{form.major}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats : rating moyen + nombre de projets */}
        <div
          className="flex items-center gap-6 mt-6 pt-6"
          style={{ borderTop: '1px solid #1E2840' }}
        >
          <div>
            <p className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
              {profile?.avg_rating ? profile.avg_rating.toFixed(1) : '—'}
            </p>
            <p className="text-xs" style={{ color: '#475569' }}>
              ⭐ Average rating ({profile?.ratings_count ?? 0} reviews)
            </p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
              {projects.length}
            </p>
            <p className="text-xs" style={{ color: '#475569' }}>
              Projects posted
            </p>
          </div>
        </div>
      </div>

      {/* Projets postés par l'utilisateur */}
      <div>
        <h2 className="text-base font-semibold mb-4" style={{ color: '#94A3B8' }}>
          My projects
        </h2>

        {projects.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
          >
            <p className="text-sm mb-3" style={{ color: '#475569' }}>
              You haven't posted any projects yet.
            </p>
            {/* Link Next.js pour la navigation interne — pas <a> */}
            <Link href="/post" className="text-sm font-medium" style={{ color: '#0D9488' }}>
              Post your first project →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map(project => (
              // Chaque projet est cliquable et mène à sa page détaillée
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-2xl p-5 transition-all"
                style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2840')}
              >
                {/* Titre + badge status */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
                    {project.title}
                  </h3>
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-md font-medium capitalize"
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

                {/* Description courte */}
                <p
                  className="text-xs leading-relaxed line-clamp-2 mb-3"
                  style={{ color: '#64748B' }}
                >
                  {project.problem}
                </p>

                {/* Skills + niveau — on utilise SKILL_COLORS et LEVEL_COLORS
                    depuis constants.ts pour la cohérence */}
                <div className="flex flex-wrap gap-2">
                  {project.project_skills?.map(skill => {
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
                  {project.level && (() => {
                    const colors = LEVEL_COLORS[project.level] ?? {
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
              </Link>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}