// components/CompletionModal.tsx
// Modal celebratoire affiché quand le owner marque un projet comme completed
// Build in public par défaut — le owner peut opt-out
'use client'

import { useState } from 'react'

type Props = {
  projectTitle: string
  onConfirm: (isPublic: boolean) => void
  onCancel: () => void
  loading: boolean
}

export default function CompletionModal({
  projectTitle,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  // Par défaut — public (build in public philosophy)
  // Le owner peut opt-out en cochant la case
  const [keepPrivate, setKeepPrivate] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={e => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Emoji celebratoire */}
        <div className="text-center mb-6">
          <span className="text-5xl">🎉</span>
        </div>

        {/* Titre */}
        <h2
          className="text-xl font-bold text-center mb-2"
          style={{ color: '#F1F5F9' }}
        >
          You shipped it!
        </h2>

        {/* Sous-titre */}
        <p className="text-sm text-center mb-6" style={{ color: '#64748B' }}>
          <span style={{ color: '#5EEAD4' }}>"{projectTitle}"</span>{' '}
          is now complete. Congratulations to your whole team.
        </p>

        {/* Message build in public */}
        <div
          className="rounded-xl px-4 py-4 mb-6"
          style={{
            backgroundColor: 'rgba(13,148,136,0.08)',
            border: '1px solid rgba(13,148,136,0.2)',
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
            🌍 By default, your completed project will be{' '}
            <span style={{ color: '#5EEAD4' }}>
              published in the Archive
            </span>{' '}
            so other builders can learn from your journey. This is the spirit
            of building in public.
          </p>
        </div>

        {/* Option opt-out */}
        <label
          className="flex items-start gap-3 mb-6 cursor-pointer"
          onClick={() => setKeepPrivate(!keepPrivate)}
        >
          <div
            className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
            style={{
              backgroundColor: keepPrivate ? '#0D9488' : 'transparent',
              borderColor: keepPrivate ? '#0D9488' : '#1E2840',
            }}
          >
            {keepPrivate && (
              <svg className="w-2.5 h-2.5 text-white" fill="none"
                viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-xs" style={{ color: '#64748B' }}>
            Keep this project private (don't publish it in the Archive)
          </span>
        </label>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color: '#64748B', border: '1px solid #1E2840' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(!keepPrivate)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: '#0D9488',
              color: 'white',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Completing...' : 'Complete project →'}
          </button>
        </div>
      </div>
    </div>
  )
}