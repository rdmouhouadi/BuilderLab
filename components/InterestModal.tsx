// components/InterestModal.tsx
// Modal displayed when a user clicks "I'm interested".
// Allows sending a personalized message with the connection request.
// Pre-fills the message with the user's preferred contact if set.
'use client'

import { useState } from 'react'
import { CONTACT_TYPES } from '@/lib/constants'
import Link from 'next/link'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  projectTitle: string
  preferredContactType: string | null
  preferredContactValue: string | null
  onConfirm: (message: string) => void
  onCancel: () => void
  loading: boolean
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function InterestModal({
  projectTitle,
  preferredContactType,
  preferredContactValue,
  onConfirm,
  onCancel,
  loading,
}: Props) {

  // Pre-fill message with preferred contact if available
  const defaultMessage = preferredContactType && preferredContactValue
    ? `Hi! I'm interested in collaborating on your project. Feel free to reach me on ${
        CONTACT_TYPES[preferredContactType]?.label ?? preferredContactType
      }: ${preferredContactValue}`
    : `Hi! I'm interested in collaborating on your project. Feel free to reach me on [your preferred contact].`

  const [message, setMessage] = useState(defaultMessage)

  const isOverLimit = message.length > 300
  const canSubmit   = !loading && message.trim() && !isOverLimit

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
        backgroundColor: 'rgba(0,0,0,0.6)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        style={{
          width: '100%', maxWidth: '440px',
          backgroundColor: colors.bg.elevated,
          border: `0.5px solid ${colors.border.hover}`,
          borderRadius: radius.xxl,
          padding: '24px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{
            fontSize: fontSize.md,
            fontWeight: 500,
            color: colors.text.primary,
            marginBottom: '4px',
            letterSpacing: '-0.01em',
          }}>
            Express your interest
          </h2>
          <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
            Sending a request to join{' '}
            <span style={{ color: colors.accent.tealText }}>&quot;{projectTitle}&quot;</span>
          </p>
        </div>

        {/* Hint — shown if no preferred contact is set */}
        {!preferredContactType && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '8px',
            padding: '10px 12px',
            borderRadius: radius.lg,
            marginBottom: '14px',
            backgroundColor: colors.status.warningDim,
            border: `0.5px solid rgba(245,158,11,0.25)`,
            fontSize: fontSize.xs,
            color: colors.status.warning,
          }}>
            <span>💡</span>
            <span>
              Add your preferred contact in your{' '}
              <Link
                href="/profile"
                style={{ color: colors.status.warning, textDecoration: 'underline' }}
                onClick={e => e.stopPropagation()}
              >
                profile
              </Link>
              {' '}to pre-fill it automatically next time.
            </span>
          </div>
        )}

        {/* Message textarea */}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          placeholder="Introduce yourself and explain why you're interested..."
          autoFocus
          style={{
            width: '100%',
            backgroundColor: colors.bg.surface,
            border: `0.5px solid ${colors.border.default}`,
            borderRadius: radius.lg,
            color: colors.text.primary,
            fontSize: fontSize.sm,
            padding: '10px 12px',
            outline: 'none',
            resize: 'none',
            marginBottom: '8px',
            fontFamily: 'inherit',
            lineHeight: 1.6,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = colors.accent.teal)}
          onBlur={e => (e.currentTarget.style.borderColor = colors.border.default)}
        />

        {/* Character count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
            Keep it short and genuine 👋
          </p>
          <span style={{
            fontSize: fontSize.xs,
            color: isOverLimit ? colors.status.danger : colors.text.muted,
          }}>
            {message.length}/300
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              ...styles.btnGhost,
              flex: 1,
              padding: '8px',
              fontSize: fontSize.sm,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => canSubmit && onConfirm(message)}
            disabled={!canSubmit}
            style={{
              ...styles.btnPrimary,
              flex: 1,
              padding: '8px',
              fontSize: fontSize.sm,
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Sending...' : 'Send request →'}
          </button>
        </div>
      </div>
    </div>
  )
}