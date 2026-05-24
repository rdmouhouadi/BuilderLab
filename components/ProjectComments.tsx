// components/ProjectComments.tsx
// Section de feedback/commentaires sur un projet
// Accessible à tous les builders connectés
// Distinct de HiveCheck — informel et conversationnel
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ProjectComment } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'

type Props = {
  projectId: string
  initialComments: ProjectComment[]
  currentUserId: string | null
}

export default function ProjectComments({
  projectId,
  initialComments,
  currentUserId,
}: Props) {
  const supabase = createBrowserSupabaseClient()
  const [comments, setComments] = useState<ProjectComment[]>(initialComments)
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  // Nom complet depuis un profil
  function getFullName(profile: ProjectComment['profiles']) {
    if (!profile) return 'Anonymous'
    const full = [profile.first_name, profile.last_name]
      .filter(Boolean).join(' ')
    return full || profile.name || 'Anonymous'
  }

  // Initiales pour l'avatar
  function getInitials(profile: ProjectComment['profiles']) {
    if (!profile) return '?'
    const first = profile.first_name?.[0]
    const last = profile.last_name?.[0]
    if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
    return profile.name?.[0]?.toUpperCase() ?? '?'
  }

  // Poster un commentaire
  async function handlePost() {
    if (!content.trim() || !currentUserId) return
    setPosting(true)

    const { data, error } = await supabase
      .from('project_comments')
      .insert({
        project_id: projectId,
        author_id: currentUserId,
        content: content.trim(),
      })
      .select('*, profiles(id, name, first_name, last_name, avg_rating)')
      .single()

    if (!error && data) {
      // Optimistic update — on ajoute en tête de liste
      setComments(prev => [data, ...prev])
      setContent('')
    }

    setPosting(false)
  }

  // Supprimer un commentaire
  async function handleDelete(id: string) {
    setComments(prev => prev.filter(c => c.id !== id))
    await supabase.from('project_comments').delete().eq('id', id)
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
          Community Feedback
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#0C1120', color: '#475569' }}
          >
            {comments.length}
          </span>
        </h2>
      </div>

      {/* Formulaire — visible seulement si connecté */}
      {currentUserId ? (
        <div className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            placeholder="Share your thoughts, ideas, or encouragement..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-2"
            style={{
              backgroundColor: '#0C1120',
              border: '1px solid #1E2840',
              color: '#F1F5F9',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#475569' }}>
              {content.length}/500
            </span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim() || content.length > 500}
              className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: '#0D9488',
                color: 'white',
                opacity: !content.trim() || posting ? 0.5 : 1,
                cursor: !content.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {posting ? 'Posting...' : 'Post feedback →'}
            </button>
          </div>
        </div>
      ) : (
        // Invitation à se connecter pour commenter
        <div
          className="rounded-xl px-4 py-3 mb-6 text-center"
          style={{ backgroundColor: '#0C1120', border: '1px solid #1E2840' }}
        >
          <p className="text-xs" style={{ color: '#475569' }}>
            <Link href="/login" style={{ color: '#0D9488' }}>
              Sign in
            </Link>{' '}
            to leave feedback on this project.
          </p>
        </div>
      )}

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: '#475569' }}>
          No feedback yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map(comment => {
            const isAuthor = comment.author_id === currentUserId

            return (
              <div key={comment.id} className="flex gap-3 group">
                {/* Avatar cliquable vers le profil public */}
                <Link href={`/profile/${comment.profiles?.id}`}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
                  >
                    {getInitials(comment.profiles)}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  {/* Header du commentaire */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link
                      href={`/profile/${comment.profiles?.id}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#F1F5F9' }}
                    >
                      {getFullName(comment.profiles)}
                    </Link>

                    {/* Rating du commentateur */}
                    {comment.profiles?.avg_rating ? (
                      <span className="text-xs" style={{ color: '#475569' }}>
                        ⭐ {comment.profiles.avg_rating.toFixed(1)}
                      </span>
                    ) : null}

                    {/* Timestamp */}
                    <span className="text-xs" style={{ color: '#475569' }}>
                      {getTimeLabel(comment.created_at)}
                    </span>

                    {/* Bouton supprimer — auteur seulement, au hover */}
                    {isAuthor && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs transition-opacity ml-auto"
                        style={{ color: '#475569' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Contenu du commentaire */}
                  <p
                    className="text-sm leading-relaxed break-words"
                    style={{ color: '#94A3B8' }}
                  >
                    {comment.content}
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