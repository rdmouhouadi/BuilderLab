// components/ProjectChat.tsx
// Group chat with 5-second polling.
// Readable by all, writable by members and owner only.
'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { ProjectMessage } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'
import Link from 'next/link'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  projectId: string
  initialMessages: ProjectMessage[]
  currentUserId: string | null
  canChat: boolean // True if owner or active member
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getFullName(profile: ProjectMessage['profiles']) {
  if (!profile) return 'Anonymous'
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return full || profile.name || 'Anonymous'
}

function getInitials(profile: ProjectMessage['profiles']) {
  if (!profile) return '?'
  const first = profile.first_name?.[0]
  const last  = profile.last_name?.[0]
  if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
  return profile.name?.[0]?.toUpperCase() ?? '?'
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function ProjectChat({
  projectId,
  initialMessages,
  currentUserId,
  canChat,
}: Props) {
  const supabase = createBrowserSupabaseClient()

  const [messages, setMessages] = useState<ProjectMessage[]>(initialMessages)
  const [content,  setContent]  = useState('')
  const [sending,  setSending]  = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(initialMessages.length)

  // Poll for new messages every 5 seconds
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

    return () => clearInterval(interval)
  }, [projectId])

  // Auto-scroll only when new messages arrive — not on every poll
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      prevCountRef.current = messages.length
    }
  }, [messages])

  // Send a message — optimistic append
  async function handleSend() {
    if (!content.trim() || !currentUserId) return
    setSending(true)

    const { data, error } = await supabase
      .from('project_messages')
      .insert({ project_id: projectId, author_id: currentUserId, content: content.trim() })
      .select('*, profiles(id, name, first_name, last_name)')
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data])
      setContent('')
    }

    setSending(false)
  }

  // Delete a message — optimistic remove
  async function handleDelete(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id))
    await supabase.from('project_messages').delete().eq('id', id)
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div style={{
      backgroundColor: colors.bg.surface,
      border: `0.5px solid ${colors.border.default}`,
      borderRadius: radius.xl,
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: `0.5px solid ${colors.border.default}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h2 style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary }}>
            Team Chat
          </h2>
          <span style={{
            fontSize: fontSize.xs,
            padding: '1px 6px',
            borderRadius: radius.md,
            backgroundColor: colors.bg.hover,
            color: colors.text.muted,
            border: `0.5px solid ${colors.border.default}`,
          }}>
            {messages.length}
          </span>
        </div>

        {/* Live polling indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: fontSize.xs, color: colors.text.muted }}>
          <span style={{
            width: '5px', height: '5px',
            borderRadius: radius.full,
            backgroundColor: colors.accent.teal,
            display: 'inline-block',
          }} />
          Live
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '14px',
        maxHeight: '360px',
        minHeight: '160px',
        overflowY: 'auto',
      }}>
        {messages.length === 0 ? (
          <p style={{
            fontSize: fontSize.xs,
            color: colors.text.muted,
            textAlign: 'center',
            padding: '24px 0',
          }}>
            No messages yet.{canChat && ' Start the conversation!'}
          </p>
        ) : (
          messages.map(message => {
            const isMe = message.author_id === currentUserId

            return (
              <div
                key={message.id}
                className="group"
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                }}
              >
                {/* Avatar — links to public profile */}
                <Link href={`/profile/${message.profiles?.id}`}>
                  <div style={{
                    width: '24px', height: '24px',
                    borderRadius: radius.lg,
                    backgroundColor: colors.accent.teal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: fontSize.xs,
                    fontWeight: 500,
                    color: '#fff',
                    flexShrink: 0,
                    marginTop: '2px',
                    textDecoration: 'none',
                  }}>
                    {getInitials(message.profiles)}
                  </div>
                </Link>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '240px',
                }}>
                  {/* Name + timestamp */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                  }}>
                    <span style={{ fontSize: fontSize.xs, fontWeight: 500, color: colors.text.secondary }}>
                      {isMe ? 'You' : getFullName(message.profiles)}
                    </span>
                    <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                      {getTimeLabel(message.created_at)}
                    </span>
                  </div>

                  {/* Message bubble */}
                  <div style={{
                    padding: '7px 10px',
                    borderRadius: radius.xl,
                    fontSize: fontSize.sm,
                    lineHeight: 1.5,
                    wordBreak: 'break-word',
                    // My messages: teal tint — others: neutral surface
                    backgroundColor: isMe ? colors.accent.tealDim  : colors.bg.elevated,
                    color:           isMe ? colors.accent.tealText : colors.text.secondary,
                    border:          isMe
                      ? `0.5px solid ${colors.accent.tealBorder}`
                      : `0.5px solid ${colors.border.default}`,
                  }}>
                    {message.content}
                  </div>

                  {/* Delete — author only, visible on hover */}
                  {isMe && (
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="opacity-0 group-hover:opacity-100"
                      style={{
                        fontSize: fontSize.xs,
                        color: colors.text.muted,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {canChat ? (
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 14px',
          borderTop: `0.5px solid ${colors.border.default}`,
        }}>
          <input
            type="text"
            placeholder="Send a message..."
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            style={{
              flex: 1,
              backgroundColor: colors.bg.elevated,
              border: `0.5px solid ${colors.border.default}`,
              borderRadius: radius.lg,
              color: colors.text.primary,
              fontSize: fontSize.sm,
              padding: '7px 10px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
            onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)}
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            style={{
              ...styles.btnPrimary,
              padding: '7px 14px',
              fontSize: fontSize.sm,
              opacity: !content.trim() ? 0.5 : 1,
              cursor: !content.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      ) : (
        <div style={{
          padding: '10px 14px',
          borderTop: `0.5px solid ${colors.border.default}`,
          fontSize: fontSize.xs,
          color: colors.text.muted,
          textAlign: 'center',
        }}>
          Join the team to participate in the chat.
        </div>
      )}
    </div>
  )
}