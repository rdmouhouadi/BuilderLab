// components/LeaveProjectModal.tsx
// Modal shown when a member leaves or is removed from a project.
// Requires a mandatory reason before confirming.
'use client'

import { useState } from 'react'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  // 'leave' = member leaving voluntarily
  // 'remove' = owner removing a member
  mode: 'leave' | 'remove'
  memberName: string
  onConfirm: (reason: string) => void
  onCancel: () => void
  loading: boolean
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function LeaveProjectModal({
  mode,
  memberName,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  const [reason, setReason] = useState('')

  const isLeave     = mode === 'leave'
  const isValid     = reason.trim().length >= 10 && reason.trim().length <= 300
  const isOverLimit = reason.trim().length > 300
  const isTooShort  = reason.trim().length > 0 && reason.trim().length < 10

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
          width: '100%', maxWidth: '420px',
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
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}>
            {isLeave ? 'Leave this project' : `Remove ${memberName}`}
          </h2>
          <p style={{ fontSize: fontSize.xs, color: colors.text.muted, lineHeight: 1.5 }}>
            {isLeave
              ? 'You will lose access to the team chat, Build Log, and HiveOS.'
              : `${memberName} will lose access to the team chat, Build Log, and HiveOS.`
            }
          </p>
        </div>

        {/* Reason textarea */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            fontSize: fontSize.xs,
            color: colors.text.muted,
            display: 'block',
            marginBottom: '6px',
          }}>
            {isLeave ? 'Why are you leaving?' : 'Reason for removal'}
            <span style={{ color: colors.status.danger, marginLeft: '2px' }}>*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder={isLeave
              ? 'e.g. I no longer have time to contribute to this project.'
              : 'e.g. The member has been inactive for several weeks.'
            }
            style={{
              width: '100%',
              backgroundColor: colors.bg.surface,
              border: `0.5px solid ${isOverLimit
                ? colors.status.danger
                : colors.border.default}`,
              borderRadius: radius.lg,
              color: colors.text.primary,
              fontSize: fontSize.sm,
              padding: '8px 10px',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = isOverLimit
              ? colors.status.danger
              : colors.accent.teal)}
            onBlur={e => (e.currentTarget.style.borderColor = isOverLimit
              ? colors.status.danger
              : colors.border.default)}
          />

          {/* Character count + validation hint */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '4px',
          }}>
            <span style={{
              fontSize: fontSize.xs,
              color: isTooShort
                ? colors.status.warning
                : colors.text.muted,
            }}>
              {isTooShort && 'Minimum 10 characters'}
            </span>
            <span style={{
              fontSize: fontSize.xs,
              color: isOverLimit ? colors.status.danger : colors.text.muted,
            }}>
              {reason.length}/300
            </span>
          </div>
        </div>

        {/* Warning box */}
        <div style={{
          backgroundColor: colors.status.dangerDim,
          border: `0.5px solid rgba(239,68,68,0.25)`,
          borderRadius: radius.lg,
          padding: '10px 12px',
          marginBottom: '20px',
        }}>
          <p style={{ fontSize: fontSize.xs, color: colors.status.danger, lineHeight: 1.5 }}>
            {isLeave
              ? '⚠ This action cannot be undone. You will need to request to join again.'
              : '⚠ This action cannot be undone. The reason will be visible to the removed member.'
            }
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{ ...styles.btnGhost, flex: 1, padding: '8px', fontSize: fontSize.sm }}
          >
            Cancel
          </button>
          <button
            onClick={() => isValid && onConfirm(reason.trim())}
            disabled={!isValid || loading}
            style={{
              flex: 1, padding: '8px',
              fontSize: fontSize.sm, fontWeight: 500,
              borderRadius: radius.lg, cursor: isValid ? 'pointer' : 'not-allowed',
              opacity: isValid ? 1 : 0.5,
              backgroundColor: colors.status.danger,
              color: '#fff',
              border: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            {loading
              ? 'Processing...'
              : isLeave ? 'Leave project' : 'Remove member'
            }
          </button>
        </div>
      </div>
    </div>
  )
}