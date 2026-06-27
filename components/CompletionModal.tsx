// components/CompletionModal.tsx
// Celebratory modal shown when the owner marks a project as completed.
// Public by default — owner can opt out (build in public philosophy).
'use client'

import { useState } from 'react'
import { colors, radius, fontSize, styles } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  projectTitle: string
  onConfirm: (isPublic: boolean) => void
  onCancel: () => void
  loading: boolean
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function CompletionModal({ projectTitle, onConfirm, onCancel, loading }: Props) {
  // Public by default — owner can opt out
  const [keepPrivate, setKeepPrivate] = useState(false)

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
          padding: '28px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Celebration emoji */}
        <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '40px' }}>
          🎉
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: fontSize.xl,
          fontWeight: 500,
          color: colors.text.primary,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          marginBottom: '6px',
        }}>
          You shipped it!
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: fontSize.sm,
          color: colors.text.muted,
          textAlign: 'center',
          marginBottom: '20px',
          lineHeight: 1.6,
        }}>
          <span style={{ color: colors.accent.tealText }}>&quot;{projectTitle}&quot;</span>{' '}
          is complete. Congratulations to your whole team.
        </p>

        {/* Build in public message */}
        <div style={{
          backgroundColor: colors.accent.tealDim,
          border: `0.5px solid ${colors.accent.tealBorder}`,
          borderRadius: radius.lg,
          padding: '12px 14px',
          marginBottom: '18px',
        }}>
          <p style={{ fontSize: fontSize.xs, color: colors.text.secondary, lineHeight: 1.6 }}>
            🌍 By default, your project will be{' '}
            <span style={{ color: colors.accent.tealText, fontWeight: 500 }}>
              published in the Archive
            </span>{' '}
            so other builders can learn from your journey. This is the spirit of building in public.
          </p>
        </div>

        {/* Opt-out checkbox */}
        <div
          onClick={() => setKeepPrivate(p => !p)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            marginBottom: '20px', cursor: 'pointer',
          }}
        >
          {/* Custom checkbox */}
          <div style={{
            width: '14px', height: '14px',
            flexShrink: 0, marginTop: '1px',
            borderRadius: '3px',
            border: `1px solid ${keepPrivate ? colors.accent.teal : colors.border.active}`,
            backgroundColor: keepPrivate ? colors.accent.teal : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {keepPrivate && (
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: fontSize.xs, color: colors.text.muted, lineHeight: 1.5 }}>
            Keep this project private — don&apos;t publish it in the Archive.
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              ...styles.btnGhost,
              flex: 1, padding: '9px',
              fontSize: fontSize.sm,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(!keepPrivate)}
            disabled={loading}
            style={{
              ...styles.btnPrimary,
              flex: 1, padding: '9px',
              fontSize: fontSize.sm,
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