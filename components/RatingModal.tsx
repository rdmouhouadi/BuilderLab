// components/RatingModal.tsx
// Modal qui s'affiche quand un projet est terminé
// Permet de noter chaque collaborateur de 0 à 5 étoiles
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

type Member = {
  id: string          // project_member_id
  user_id: string
  profiles: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
  } | null
}

type Props = {
  projectId: string
  members: Member[]        // Membres à noter (excluant soi-même)
  currentUserId: string
  onComplete: () => void   // Callback quand toutes les notes sont soumises
}

export default function RatingModal({ projectId, members, currentUserId, onComplete }: Props) {
  const supabase = createBrowserSupabaseClient()

  // État des notes — un score par membre
  // On initialise à 0 pour chaque membre
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(members.map(m => [m.user_id, 0]))
  )

  // Commentaires optionnels par membre
  const [comments, setComments] = useState<Record<string, string>>(
    Object.fromEntries(members.map(m => [m.user_id, '']))
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Nom complet d'un membre
  function getMemberName(member: Member) {
    const p = member.profiles
    if (!p) return 'Anonymous'
    const full = [p.first_name, p.last_name].filter(Boolean).join(' ')
    return full || p.name || 'Anonymous'
  }

  // Initiales pour l'avatar
  function getInitials(member: Member) {
    const p = member.profiles
    if (!p) return '?'
    return [p.first_name?.[0], p.last_name?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || p.name?.[0]?.toUpperCase() || '?'
  }

  // Met à jour le score d'un membre
  function setScore(userId: string, score: number) {
    setRatings(prev => ({ ...prev, [userId]: score }))
  }

  // Soumet toutes les notes
  async function handleSubmit() {
    // Vérifier que tous les membres ont été notés
    const unrated = members.filter(m => ratings[m.user_id] === 0)
    if (unrated.length > 0) {
      setError('Please rate all collaborators before submitting.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // On insère une note pour chaque membre
      for (const member of members) {
        const { error: ratingError } = await supabase
          .from('ratings')
          .insert({
            project_member_id: member.id,
            rater_id: currentUserId,
            rated_id: member.user_id,
            score: ratings[member.user_id],
            comment: comments[member.user_id] || null,
          })

        if (ratingError) throw ratingError
      }

      // On marque rating_required = false pour l'utilisateur courant
      // pour ne plus afficher la bannière
      await supabase
        .from('project_members')
        .update({ rating_required: false })
        .eq('project_id', projectId)
        .eq('user_id', currentUserId)

      // On notifie le parent que les notes sont soumises
      onComplete()

    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // Overlay sombre derrière le modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
      >
        {/* Header du modal */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-1" style={{ color: '#F1F5F9' }}>
            Rate your collaborators
          </h2>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Your feedback helps build trust in the community.
            All ratings are mandatory.
          </p>
        </div>

        {/* Liste des membres à noter */}
        <div className="flex flex-col gap-5 mb-6">
          {members.map(member => (
            <div
              key={member.user_id}
              className="p-4 rounded-xl"
              style={{ backgroundColor: '#0C1120', border: '1px solid #1E2840' }}
            >
              {/* Infos du membre */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
                >
                  {getInitials(member)}
                </div>
                <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                  {getMemberName(member)}
                </p>
              </div>

              {/* Étoiles de notation */}
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScore(member.user_id, star)}
                    className="text-2xl transition-transform hover:scale-110"
                    // Étoile pleine si <= score, vide sinon
                    style={{
                      color: star <= ratings[member.user_id]
                        ? '#F59E0B'
                        : '#1E2840',
                      filter: star <= ratings[member.user_id]
                        ? 'drop-shadow(0 0 4px rgba(245,158,11,0.5))'
                        : 'none',
                    }}
                  >
                    ★
                  </button>
                ))}
                {/* Score affiché en chiffre */}
                {ratings[member.user_id] > 0 && (
                  <span className="text-sm ml-1 self-center" style={{ color: '#94A3B8' }}>
                    {ratings[member.user_id]}/5
                  </span>
                )}
              </div>

              {/* Commentaire optionnel */}
              <input
                type="text"
                placeholder="Add a comment (optional)..."
                value={comments[member.user_id]}
                onChange={e => setComments(prev => ({
                  ...prev,
                  [member.user_id]: e.target.value
                }))}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{
                  backgroundColor: '#161B28',
                  border: '1px solid #1E2840',
                  color: '#F1F5F9',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
                onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
              />
            </div>
          ))}
        </div>

        {/* Erreur */}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm mb-4"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#FCA5A5',
            }}
          >
            {error}
          </div>
        )}

        {/* Bouton submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all"
          style={{
            backgroundColor: '#0D9488',
            color: 'white',
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit ratings'}
        </button>
      </div>
    </div>
  )
}