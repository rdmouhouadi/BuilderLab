// components/InterestModal.tsx
// Modal qui s'affiche quand un utilisateur clique sur "I'm interested"
// Permet d'envoyer un message personnalisé avec la demande de connexion
// Le message est pré-rempli avec le contact préféré de l'utilisateur
'use client'

import { useState } from 'react'
import { CONTACT_TYPES } from '@/lib/constants'
import Link from 'next/link'

type Props = {
  projectTitle: string
  // Contact préféré de l'utilisateur connecté
  // pour pré-remplir le message automatiquement
  preferredContactType: string | null
  preferredContactValue: string | null
  onConfirm: (message: string) => void
  onCancel: () => void
  loading: boolean
}

export default function InterestModal({
  projectTitle,
  preferredContactType,
  preferredContactValue,
  onConfirm,
  onCancel,
  loading,  
}: Props) {

  // On construit le message par défaut
  // Si l'utilisateur a un contact préféré → on l'inclut automatiquement
  const defaultMessage = preferredContactType && preferredContactValue
    ? `Hi! I'm interested in collaborating on your project. Feel free to reach me on ${
        CONTACT_TYPES[preferredContactType]?.label ?? preferredContactType
      }: ${preferredContactValue}`
    : `Hi! I'm interested in collaborating on your project. Feel free to reach me on [your preferred contact].`

  const [message, setMessage] = useState(defaultMessage)

  return (
    // Overlay sombre
    // e.stopPropagation() empêche le clic de remonter au Link parent
    // et de naviguer vers la page détail du projet
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={e => {
        e.stopPropagation()
        e.preventDefault()
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
        // Stoppe aussi la propagation sur le contenu du modal
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-base font-bold mb-1" style={{ color: '#F1F5F9' }}>
            Express your interest
          </h2>
          <p className="text-xs" style={{ color: '#64748B' }}>
            Send a message to the owner of{' '}
            <span style={{ color: '#5EEAD4' }}>"{projectTitle}"</span>
          </p>
        </div>

        {/* Hint si pas de contact préféré renseigné */}
        {!preferredContactType && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs"
            style={{
              backgroundColor: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
              color: '#FCD34D',
            }}
          >
            <span>💡</span>
            <span>
              Add your preferred contact in your{' '}
              <Link href="/profile" 
                    style={{ textDecoration: 'underline' }}
                    onClick={e => e.stopPropagation()}
                >
                profile
              </Link>
              {' '}to pre-fill it automatically next time.
            </span>
          </div>
        )}

        {/* Textarea du message */}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Introduce yourself and explain why you're interested..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-2"
          style={{
            backgroundColor: '#0C1120',
            border: '1px solid #1E2840',
            color: '#F1F5F9',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#0D9488')}
          onBlur={e => (e.currentTarget.style.borderColor = '#1E2840')}
          autoFocus
        />

        {/* Compteur de caractères */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: '#475569' }}>
            Keep it short and genuine 👋
          </p>
          <span
            className="text-xs"
            style={{ color: message.length > 300 ? '#FCA5A5' : '#475569' }}
          >
            {message.length}/300
          </span>
        </div>

        {/* Boutons */}
        <div className="flex gap-2">
          <button
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              onCancel()
            }}
            className="flex-1 py-2.5 rounded-xl text-sm transition-colors"
            style={{ color: '#64748B', border: '1px solid #1E2840' }}
          >
            Cancel
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              onConfirm(message)
            }}
            disabled={loading || !message.trim() || message.length > 300}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: '#0D9488',
              color: 'white',
              opacity: loading || !message.trim() ? 0.7 : 1,
              cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Send request →'}
          </button>
        </div>
      </div>
    </div>
  )
}