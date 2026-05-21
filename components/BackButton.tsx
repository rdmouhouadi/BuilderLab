'use client'

import { useRouter } from 'next/navigation'

type Props = {
  // URL de fallback si pas d'historique
  fallback?: string
  label?: string
}

export default function BackButton({ fallback = '/', label = '← Back' }: Props) {
  const router = useRouter()

  function handleBack() {
    // Si l'utilisateur a un historique → retour arrière
    // Sinon → on redirige vers le fallback
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm mb-6 transition-colors px-3 py-1.5 rounded-md font-medium"
      style={{ color: '#475569', border: '1px solid #1E2840' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = '#F1F5F9'
        ;(e.currentTarget as HTMLElement).style.borderColor = '#94A3B8'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = '#475569'
        ;(e.currentTarget as HTMLElement).style.borderColor = '#1E2840'
      }}
    >
      {label}
    </button>
  )
}