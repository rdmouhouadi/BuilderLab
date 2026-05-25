// components/BackButton.tsx
// Smart back button — remembers the previous page via sessionStorage.
// Falls back to a default URL if no history is available.
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { colors, radius, fontSize } from '@/lib/design-tokens'

type Props = {
  fallback?: string // Default URL if no history — defaults to '/'
}

export default function BackButton({ fallback = '/' }: Props) {
  const router = useRouter()
  const [label, setLabel] = useState('← Back')

  useEffect(() => {
    // Read the referrer stored by the feed/profile/hivecheck pages
    const from = sessionStorage.getItem('projectDetailFrom')
    if (from === '/') setLabel('← Back to projects')
    else if (from?.startsWith('/profile')) setLabel('← Back to profile')
    else if (from?.startsWith('/hivecheck')) setLabel('← Back to HiveCheck')
    else if (from?.startsWith('/archive')) setLabel('← Back to archive')
    else setLabel('← Back')
  }, [])

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