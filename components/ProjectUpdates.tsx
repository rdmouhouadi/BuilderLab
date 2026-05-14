// components/ProjectUpdates.tsx
// Feed d'updates à l'intérieur d'un projet
// Permet aux membres de partager leur progression
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ProjectUpdate } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'

type Props = {
  projectId: string
  updates: ProjectUpdate[]
  currentUserId: string | null
  // L'utilisateur peut poster seulement s'il est membre ou owner
  canPost: boolean
}

// Icône et couleur pour chaque type d'update
const UPDATE_TYPES: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  update:    { label: 'Update',    icon: '📢', color: '#5EEAD4', bg: 'rgba(13,148,136,0.14)' },
  milestone: { label: 'Milestone', icon: '🏁', color: '#6EE7B7', bg: 'rgba(16,185,129,0.14)' },
  blocker:   { label: 'Blocker',   icon: '🚧', color: '#FCA5A5', bg: 'rgba(239,68,68,0.14)'  },
  decision:  { label: 'Decision',  icon: '✅', color: '#A5B4FC', bg: 'rgba(99,102,241,0.14)' },
  demo:      { label: 'Demo',      icon: '🚀', color: '#FCD34D', bg: 'rgba(245,158,11,0.14)' },
}

export default function ProjectUpdates({ projectId, updates: initialUpdates, currentUserId, canPost }: Props) {
  const supabase = createBrowserSupabaseClient()

  // Updates stockées en state local pour mise à jour optimiste
  const [updates, setUpdates] = useState<ProjectUpdate[]>(initialUpdates)

  // Formulaire de nouvel update
  const [content, setContent] = useState('')
  const [type, setType] = useState<ProjectUpdate['type']>('update')
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Nom complet d'un profil
  function getFullName(profile: ProjectUpdate['profiles']) {
    if (!profile) return 'Anonymous'
    const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    return full || profile.name || 'Anonymous'
  }

  // Initiales pour l'avatar
  function getInitials(profile: ProjectUpdate['profiles']) {
    if (!profile) return '?'
    const first = profile.first_name?.[0]
    const last = profile.last_name?.[0]
    if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
    return profile.name?.[0]?.toUpperCase() ?? '?'
  }

  // Poster un nouvel update
  async function handlePost() {
    if (!content.trim() || !currentUserId) return
    setPosting(true)

    const { data, error } = await supabase
      .from('project_updates')
      .insert({
        project_id: projectId,
        author_id: currentUserId,
        type,
        content: content.trim(),
      })
      .select('*, profiles(id, name, first_name, last_name, avg_rating)')
      .single()

    if (!error && data) {
      // Optimistic update — on ajoute en tête de liste
      setUpdates(prev => [data, ...prev])
      setContent('')
      setType('update')
      setShowForm(false)
    }

    setPosting(false)
  }

  // Supprimer un update
  async function handleDelete(id: string) {
    setUpdates(prev => prev.filter(u => u.id !== id))
    await supabase.from('project_updates').delete().eq('id', id)
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
          Build Log
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#0C1120', color: '#475569' }}
          >
            {updates.length}
          </span>
        </h2>

        {/* Bouton Post update — membres et owner seulement */}
        {canPost && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'rgba(13,148,136,0.14)',
              color: '#5EEAD4',
              border: '1px solid rgba(13,148,136,0.28)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(13,148,136,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(13,148,136,0.14)')}
          >
            + Post update
          </button>
        )}
      </div>

      {/* Formulaire de post */}
      {canPost && showForm && (
        <div
          className="mb-4 p-4 rounded-xl"
          style={{ backgroundColor: '#0C1120', border: '1px solid #1E2840' }}
        >
          {/* Sélecteur de type */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {Object.entries(UPDATE_TYPES).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key as ProjectUpdate['type'])}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  backgroundColor: type === key ? val.bg : 'transparent',
                  color: type === key ? val.color : '#475569',
                  border: type === key
                    ? `1px solid ${val.color}40`
                    : '1px solid #1E2840',
                }}
              >
                {val.icon} {val.label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            placeholder={
              type === 'update' ? "What did you work on?"
              : type === 'blocker' ? "What's blocking you?"
              : type === 'decision' ? "What did you decide?"
              : type === 'milestone' ? "What milestone did you reach?"
              : "What did you demo?"
            }
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none mb-3"
            style={{
              backgroundColor: '#161B28',
              border: '1px solid #1E2840',
              color: '#F1F5F9',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
          />

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setContent('') }}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: '#64748B', border: '1px solid #1E2840' }}
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="text-xs px-4 py-1.5 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: '#0D9488',
                color: 'white',
                opacity: !content.trim() ? 0.5 : 1,
                cursor: !content.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Feed d'updates */}
      {updates.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: '#475569' }}>
          No updates yet.
          {canPost && ' Be the first to share a progress update!'}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {updates.map(update => {
            const typeConfig = UPDATE_TYPES[update.type] ?? UPDATE_TYPES.update
            const isAuthor = currentUserId === update.author_id

            return (
              <div
                key={update.id}
                className="flex gap-3 group"
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
                >
                  {getInitials(update.profiles)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header de l'update */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-medium" style={{ color: '#F1F5F9' }}>
                      {getFullName(update.profiles)}
                    </span>

                    {/* Badge type */}
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium"
                      style={{
                        backgroundColor: typeConfig.bg,
                        color: typeConfig.color,
                      }}
                    >
                      {typeConfig.icon} {typeConfig.label}
                    </span>

                    {/* Timestamp */}
                    <span className="text-xs" style={{ color: '#475569' }}>
                      {getTimeLabel(update.created_at)}
                    </span>

                    {/* Bouton supprimer — auteur seulement, visible au hover */}
                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs transition-opacity ml-auto"
                        style={{ color: '#475569' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Contenu */}
                  <p
                    className="text-sm leading-relaxed break-words"
                    style={{ color: '#94A3B8' }}
                  >
                    {update.content}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}