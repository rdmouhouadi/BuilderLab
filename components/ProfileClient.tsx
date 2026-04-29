// components/ProfileClient.tsx
// Gère l'affichage ET l'édition du profil
// 'use client' car on utilise useState pour le mode édition
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { Project } from '@/types'


type Profile = {
  id: string
  name: string | null
  country: string | null
  bio: string | null
  avg_rating: number
  ratings_count: number
}

type Props = {
  profile: Profile
  projects: Project[]
  email: string
}

const skillColors: Record<string, { bg: string; text: string }> = {
  'Developer':      { bg: 'rgba(13,148,136,0.14)',  text: '#5EEAD4' },
  'Designer':       { bg: 'rgba(14,165,233,0.14)',  text: '#7DD3FC' },
  'Data Scientist': { bg: 'rgba(99,102,241,0.14)',  text: '#A5B4FC' },
  'Business':       { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
  'Marketing':      { bg: 'rgba(236,72,153,0.14)',  text: '#F9A8D4' },
}

const levelColors: Record<string, { bg: string; text: string }> = {
  'Biginner':      { bg: 'rgba(16,185,129,0.14)',  text: '#6EE7B7' },
  'Intermediate': { bg: 'rgba(245,158,11,0.14)',  text: '#FCD34D' },
  'Advanced':        { bg: 'rgba(239,68,68,0.14)',   text: '#FCA5A5' },
}

export default function ProfileClient({ profile, projects, email }: Props) {
  const supabase = createBrowserSupabaseClient()

  // Mode édition — true = formulaire visible, false = affichage
  const [editing, setEditing] = useState(false)

  // État du formulaire d'édition
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    country: profile?.country ?? '',
    bio: profile?.bio ?? '',
  })

  // État de sauvegarde
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Initiales pour l'avatar
  const initials = form.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase() ?? email[0].toUpperCase()

  // Sauvegarde le profil dans Supabase
  async function handleSave() {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({
        name: form.name,
        country: form.country,
        bio: form.bio,
      })
      .eq('id', profile.id)

    setSaving(false)
    setSaved(true)
    setEditing(false)

    // Reset le message "Saved" après 2 secondes
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      {/* Header du profil */}
      <div
        className="rounded-2xl p-8 mb-6"
        style={{
          backgroundColor: '#161B28',
          border: '1px solid #1E2840',
        }}
      >
        <div className="flex items-start justify-between">

          {/* Infos principales */}
          <div className="flex items-center gap-5">

            {/* Avatar grand format */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
            >
              {initials}
            </div>

            <div>
              {editing ? (
                // Mode édition — champs modifiables
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: '#0C1120',
                      border: '1px solid #0D9488',
                      color: '#F1F5F9',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.country}
                    onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                    className="px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: '#0C1120',
                      border: '1px solid #1E2840',
                      color: '#F1F5F9',
                    }}
                  />
                </div>
              ) : (
                // Mode affichage
                <>
                  <h1
                    className="text-xl font-bold mb-1"
                    style={{ color: '#F1F5F9' }}
                  >
                    {form.name || 'No name yet'}
                  </h1>
                  <p className="text-sm" style={{ color: '#475569' }}>
                    {form.country || 'No country yet'} · {email}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Boutons Edit / Save */}
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs" style={{ color: '#6EE7B7' }}>
                ✓ Saved
              </span>
            )}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm px-4 py-2 rounded-lg transition-colors"
                  style={{
                    color: '#64748B',
                    border: '1px solid #1E2840',
                  }}
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

        {/* Bio */}
        <div className="mt-6">
          {editing ? (
            <textarea
              placeholder="Tell others about yourself, your skills and what you want to build..."
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{
                backgroundColor: '#0C1120',
                border: '1px solid #1E2840',
                color: '#F1F5F9',
              }}
            />
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              {form.bio || 'No bio yet. Click "Edit profile" to add one.'}
            </p>
          )}
        </div>

        {/* Stats : rating + nombre de projets */}
        <div
          className="flex items-center gap-6 mt-6 pt-6"
          style={{ borderTop: '1px solid #1E2840' }}
        >
          {/* Rating moyen */}
          <div>
            <p className="text-xl font-bold" style={{ color: '#F1F5F9' }}>
              {profile?.avg_rating
                ? profile.avg_rating.toFixed(1)
                : '—'
              }
            </p>
            <p className="text-xs" style={{ color: '#475569' }}>
              ⭐ Average rating ({profile?.ratings_count ?? 0} reviews)
            </p>
          </div>

          {/* Nombre de projets */}
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

      {/* Projets postés */}
      <div>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: '#94A3B8' }}
        >
          My projects
        </h2>

        {projects.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              backgroundColor: '#161B28',
              border: '1px solid #1E2840',
            }}
          >
            <p className="text-sm mb-3" style={{ color: '#475569' }}>
              You haven't posted any projects yet.
            </p>
            
            <link
              href="/post"
              className="text-sm font-medium"
              style={{ color: '#0D9488' }}
            >
              Post your first project →
            </link>
        </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map(project => (
              <div
                key={project.id}
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: '#161B28',
                  border: '1px solid #1E2840',
                }}
              >
                {/* Titre + status */}
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: '#F1F5F9' }}
                  >
                    {project.title}
                  </h3>
                  {/* Badge de status */}
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

                {/* Description */}
                <p
                  className="text-xs leading-relaxed line-clamp-2 mb-3"
                  style={{ color: '#64748B' }}
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
                        className="text-xs px-2.5 py-0.5 rounded-md font-medium"
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
                        className="text-xs px-2.5 py-0.5 rounded-md font-medium capitalize"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {project.level}
                      </span>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}