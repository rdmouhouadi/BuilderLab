// components/ConnectionsClient.tsx
// Affiche les demandes reçues et envoyées
// Permet d'accepter ou rejeter les demandes reçues
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import Link from 'next/link'

type Connection = {
  id: string
  sender_id: string
  project_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  projects?: { id: string; title: string }
  profiles?: {
    id: string
    name: string | null
    country: string | null
    avg_rating: number
  }
}

type Props = {
  received: Connection[]
  sent: Connection[]
  currentUserId: string
}

export default function ConnectionsClient({ received, sent, currentUserId }: Props) {
  const supabase = createBrowserSupabaseClient()

  // Onglet actif — "received" ou "sent"
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  // État local des connexions reçues
  // On les stocke en state pour mettre à jour l'UI
  // On garde toutes les connexions pour référence
  const [connections, setConnections] = useState(received)

  //On filtre - seule les pending s'affichent dans la Liste
  //Les "accepted/rejected" disparaissent après action
  const pendingConnections = connections.filter(c => c.status === 'pending')
  const resolvedConnections = connections.filter(c => c.status !== 'pending')

  
  // Met à jour le status d'une connexion
  // Si accepté → envoie aussi une notification email au sender
  async function handleAction(id: string, action: 'accepted' | 'rejected') {
    const { error } = await supabase
      .from('connections')
      .update({ status: action })
      .eq('id', id)

    if (!error) {
      // Met à jour l'UI immédiatement sans attendre un refetch
      setConnections(prev =>
        prev.map(c => c.id === id ? { ...c, status: action } : c)
      )

      // Si accepté → envoie la notification email au sender
      // On ne bloque pas l'UI si l'email échoue — catch silencieux
      if (action === 'accepted') {
        fetch('/api/notify/accepted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionId: id }),
        }).catch(console.error)
      }
    }
  }

  // Couleur du badge de status
  function getStatusStyle(status: string) {
    switch (status) {
      case 'accepted': return { bg: 'rgba(16,185,129,0.14)', text: '#6EE7B7', border: '1px solid rgba(16,185,129,0.28)' }
      case 'rejected': return { bg: 'rgba(239,68,68,0.14)',  text: '#FCA5A5', border: '1px solid rgba(239,68,68,0.28)' }
      default:         return { bg: 'rgba(245,158,11,0.14)', text: '#FCD34D', border: '1px solid rgba(245,158,11,0.28)' }
    }
  }

  // Initiales pour l'avatar
  function getInitials(name: string | null | undefined) {
    if (!name) return '?'
    return name.split(' ').map(w => w[0]).join('').toUpperCase()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#F1F5F9' }}>
          Connections
        </h1>
        <p className="text-sm" style={{ color: '#475569' }}>
          Manage your collaboration requests
        </p>
      </div>

      {/* Onglets Received / Sent */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
      >
        {(['received', 'sent'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              backgroundColor: activeTab === tab ? '#0D9488' : 'transparent',
              color: activeTab === tab ? 'white' : '#64748B',
            }}
          >
            {tab}
            {/* Badge - on affiche seulement les pending pour Request Received */}
            <span
              className="ml-2 text-xs px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor: activeTab === tab
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(255,255,255,0.07)',
                color: activeTab === tab ? 'white' : '#475569',
              }}
            >
              {tab === 'received' ? pendingConnections.length : sent.length}
            </span>
          </button>
        ))}
      </div>

      {/* Liste des demandes reçues - seulement les pending */}
      {activeTab === 'received' && (
        <div className="flex flex-col gap-3">
          {pendingConnections.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
            >
              <p className="text-sm" style={{ color: '#475569' }}>
                No pending requests.
              </p>
            </div>
          ) : (
            pendingConnections.map(conn => (
              <div
                key={conn.id}
                className="rounded-2xl p-5"
                style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Infos du sender */}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
                    >
                      {getInitials(conn.profiles?.name)}
                    </div>

                    <div>
                      <Link
                        href={`/profile/${conn.profiles?.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#F1F5F9' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {conn.profiles?.name ?? 'Anonymous'}
                      </Link>
                      <p className="text-xs" style={{ color: '#475569' }}>
                        {conn.profiles?.country ?? ''} ·{' '}
                        ⭐ {conn.profiles?.avg_rating
                          ? conn.profiles.avg_rating.toFixed(1)
                          : 'New'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Badge pending */}
                  <span
                    className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize flex-shrink-0"
                    style={{
                      //backgroundColor: getStatusStyle(conn.status).bg, --old
                      backgroundColor: 'rgba(245,158,11,0.14)',
                      //color: getStatusStyle(conn.status).text, --old
                      color: '#FCD34D',
                      //border: getStatusStyle(conn.status).border,--old
                      border: '1px solid rgba(245,158,11,0.28)',
                    }}
                  >
                    pending
                  </span>
                </div>

                {/* Projet concerné */}
                <p className="text-xs mt-3 mb-2" style={{ color: '#475569' }}>
                  Interested in:{' '}
                  <span style={{ color: '#94A3B8' }}>
                    {conn.projects?.title ?? 'Unknown project'}
                  </span>
                </p>

                {/* Message */}
                {conn.message && (
                  <p
                    className="text-xs leading-relaxed mb-4 px-3 py-2 rounded-lg"
                    style={{
                      color: '#64748B',
                      backgroundColor: '#0C1120',
                      border: '1px solid #1E2840',
                    }}
                  >
                    "{conn.message}"
                  </p>
                )}

                {/* Boutons Accept / Reject — seulement si pending */}
                {conn.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAction(conn.id, 'accepted')}
                      className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: 'rgba(16,185,129,0.14)',
                        color: '#6EE7B7',
                        border: '1px solid rgba(16,185,129,0.28)',
                      }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleAction(conn.id, 'rejected')}
                      className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.14)',
                        color: '#FCA5A5',
                        border: '1px solid rgba(239,68,68,0.28)',
                      }}
                    >
                      ✕ Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Liste des demandes envoyées */}
      {activeTab === 'sent' && (
        <div className="flex flex-col gap-3">
          {sent.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
            >
              <p className="text-sm" style={{ color: '#475569' }}>
                You haven't sent any requests yet.
              </p>
            </div>
          ) : (
            sent.map(conn => (
              <div
                key={conn.id}
                className="rounded-2xl p-5 flex items-center justify-between"
                style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
              >
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#F1F5F9' }}>
                    {conn.projects?.title ?? 'Unknown project'}
                  </p>
                  <p className="text-xs" style={{ color: '#475569' }}>
                    Sent {new Date(conn.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Badge status */}
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-medium capitalize"
                  style={{
                    backgroundColor: getStatusStyle(conn.status).bg,
                    color: getStatusStyle(conn.status).text,
                    border: getStatusStyle(conn.status).border,
                  }}
                >
                  {conn.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </main>
  )
}