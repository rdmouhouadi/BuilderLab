// components/ProjectChat.tsx
// Group chat du projet avec polling toutes les 5 secondes
// Accessible uniquement aux membres et au owner
'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ProjectMessage } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'
import Link from 'next/link'

type Props = {
  projectId: string
  initialMessages: ProjectMessage[]
  currentUserId: string | null
  canChat: boolean  // true si owner ou membre actif
}

export default function ProjectChat({
  projectId,
  initialMessages,
  currentUserId,
  canChat,
}: Props) {
  const supabase = createBrowserSupabaseClient()

  // Messages stockés en state local
  const [messages, setMessages] = useState<ProjectMessage[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  // Ref vers le bas du chat pour auto-scroll
  const bottomRef = useRef<HTMLDivElement>(null)

  // Ne scroller vers le bas que si un nouveau message est arrivé
  const prevCountRef = useRef(initialMessages.length)

  // Nom complet depuis un profil
  function getFullName(profile: ProjectMessage['profiles']) {
    if (!profile) return 'Anonymous'
    const full = [profile.first_name, profile.last_name]
      .filter(Boolean).join(' ')
    return full || profile.name || 'Anonymous'
  }

  // Initiales pour l'avatar
  function getInitials(profile: ProjectMessage['profiles']) {
    if (!profile) return '?'
    const first = profile.first_name?.[0]
    const last = profile.last_name?.[0]
    if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
    return profile.name?.[0]?.toUpperCase() ?? '?'
  }

  // Polling — fetch les nouveaux messages toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('project_messages')
        .select('*, profiles(id, name, first_name, last_name)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (data) setMessages(data)
    }, 5000)

    // Nettoyage — on arrête le polling quand le composant est démonté
    return () => clearInterval(interval)
  }, [projectId])

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    // On scroll seulement si le nombre de messages a augmenté
    // pas à chaque polling
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      prevCountRef.current = messages.length
    }
  }, [messages])

  // Envoyer un message
  async function handleSend() {
    if (!content.trim() || !currentUserId) return
    setSending(true)

    const { data, error } = await supabase
      .from('project_messages')
      .insert({
        project_id: projectId,
        author_id: currentUserId,
        content: content.trim(),
      })
      .select('*, profiles(id, name, first_name, last_name)')
      .single()

    if (!error && data) {
      // Optimistic update — on ajoute le message immédiatement
      setMessages(prev => [...prev, data])
      setContent('')
    }

    setSending(false)
  }

  // Supprimer un message
  async function handleDelete(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id))
    await supabase.from('project_messages').delete().eq('id', id)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#161B28', border: '1px solid #1E2840' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #1E2840' }}
      >
        <h2 className="font-semibold text-sm" style={{ color: '#F1F5F9' }}>
          Team Chat
          <span
            className="ml-2 text-xs px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#0C1120', color: '#475569' }}
          >
            {messages.length}
          </span>
        </h2>
        {/* Indicateur de polling */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#475569' }}>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#0D9488' }}
          />
          Live
        </div>
      </div>

      {/* Zone des messages */}
      <div
        className="flex flex-col gap-4 p-5 overflow-y-auto"
        style={{ maxHeight: '400px', minHeight: '200px' }}
      >
        {messages.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: '#475569' }}>
            No messages yet.
            {canChat && ' Start the conversation!'}
          </p>
        ) : (
          messages.map(message => {
            const isMe = message.author_id === currentUserId

            return (
              <div
                key={message.id}
                className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <Link href={`/profile/${message.profiles?.id}`}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #0D9488, #0EA5E9)' }}
                  >
                    {getInitials(message.profiles)}
                  </div>
                </Link>

                <div className={`flex flex-col gap-1 max-w-xs ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Nom + timestamp */}
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                      {isMe ? 'You' : getFullName(message.profiles)}
                    </span>
                    <span className="text-xs" style={{ color: '#475569' }}>
                      {getTimeLabel(message.created_at)}
                    </span>
                  </div>

                  {/* Contenu du message */}
                  <div
                    className="px-3 py-2 rounded-xl text-sm leading-relaxed break-words"
                    style={{
                      backgroundColor: isMe
                        ? 'rgba(13,148,136,0.2)'
                        : '#0C1120',
                      color: isMe ? '#5EEAD4' : '#94A3B8',
                      border: isMe
                        ? '1px solid rgba(13,148,136,0.3)'
                        : '1px solid #1E2840',
                      maxWidth: '240px',
                    }}
                  >
                    {message.content}
                  </div>

                  {/* Bouton supprimer — visible au hover, seulement pour l'auteur */}
                  {isMe && (
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#475569' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
        {/* Ancre pour auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie — seulement pour les membres et le owner */}
      {canChat ? (
        <div
          className="flex gap-2 px-4 py-3"
          style={{ borderTop: '1px solid #1E2840' }}
        >
          <input
            type="text"
            placeholder="Send a message..."
            value={content}
            onChange={e => setContent(e.target.value)}
            // Enter pour envoyer
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
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
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
            style={{
              backgroundColor: '#0D9488',
              color: 'white',
              opacity: !content.trim() ? 0.5 : 1,
              cursor: !content.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      ) : (
        // Message pour les visiteurs non membres
        <div
          className="px-5 py-3 text-xs text-center"
          style={{
            borderTop: '1px solid #1E2840',
            color: '#475569',
          }}
        >
          Join the team to participate in the chat.
        </div>
      )}
    </div>
  )
}