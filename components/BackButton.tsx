// components/BackButton.tsx
// Smart back button — remembers the previous page via sessionStorage.
// Falls back to a default URL if no history is available.
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { colors, radius, fontSize } from '@/lib/design-tokens'

type Props = {
  fallback?: string // Default URL if no history — defaults to '/'
}

// Computes the back button label once, at state initialization,
// instead of starting with a default value and correcting it
// afterward inside a useEffect (which used to trigger an extra render).
function getInitialLabel(): string {
  // sessionStorage doesn't exist server-side — keep the fallback
  // during SSR; the correct value is read on the first client render.
  if (typeof window === 'undefined') return '← Back'

  // Read the referrer stored by the feed/profile/hivecheck pages
  const from = sessionStorage.getItem('projectDetailFrom')
  if (from === '/') return '← Back to projects'
  if (from?.startsWith('/profile'))   return '← Back to profile'
  if (from?.startsWith('/hivecheck')) return '← Back to HiveCheck'
  if (from?.startsWith('/archive'))   return '← Back to archive'
  return '← Back'
}

export default function BackButton({ fallback = '/' }: Props) {
  const router = useRouter()

  // Label is computed once via getInitialLabel() — no effect needed
  const [label] = useState(getInitialLabel)

  function handleBack() {
    const from = sessionStorage.getItem('projectDetailFrom')
    if (from) {
      router.push(from)
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      onClick={handleBack}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: fontSize.sm,
        color: colors.text.muted,
        backgroundColor: 'transparent',
        border: `0.5px solid ${colors.border.default}`,
        borderRadius: radius.lg,
        padding: '5px 12px',
        cursor: 'pointer',
        marginBottom: '20px',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.color = colors.text.secondary
        ;(e.currentTarget as HTMLElement).style.borderColor = colors.border.hover
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.color = colors.text.muted
        ;(e.currentTarget as HTMLElement).style.borderColor = colors.border.default
      }}
    >
      {label}
    </button>
  )
}