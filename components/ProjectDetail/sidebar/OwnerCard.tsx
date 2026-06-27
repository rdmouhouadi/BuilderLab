// components/ProjectDetail/sidebar/OwnerCard.tsx
// Shows who posted the project: avatar, name, country, rating,
// and a contact link if the owner set one in their profile.
import Link from 'next/link'
import { Project } from '@/types'
import { CONTACT_TYPES } from '@/lib/constants'
import { colors, radius, fontSize } from '@/lib/design-tokens'
import { cardStyle, sectionTitle, getFullName, getInitials } from '../shared'

type Props = {
  profile: Project['profiles']
}

export default function OwnerCard({ profile }: Props) {
  // Contact info is optional — only render the button if both
  // the type (e.g. "linkedin") and a matching style exist
  const contactType = profile?.preferred_contact_type
  const contact = contactType ? CONTACT_TYPES[contactType] : null

  return (
    <div style={cardStyle}>
      <h2 style={sectionTitle}>Posted by</h2>

      {/* Avatar + name + country + rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '36px', height: '36px',
          borderRadius: radius.lg,
          backgroundColor: colors.accent.teal,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fontSize.xs, fontWeight: 500, color: '#fff', flexShrink: 0,
        }}>
          {getInitials(profile)}
        </div>
        <div>
          <Link
            href={`/profile/${profile?.id}`}
            style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            {getFullName(profile)}
          </Link>
          <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
            {profile?.country ?? ''} · ⭐{' '}
            {profile?.avg_rating ? profile.avg_rating.toFixed(1) : 'New'}
          </p>
        </div>
      </div>

      {/* Contact button — only shown if the owner set a preferred contact */}
      {contact && (
       <a 
          href={profile?.preferred_contact_value ?? '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: fontSize.xs, padding: '7px 10px',
            borderRadius: radius.lg, width: '100%',
            backgroundColor: colors.bg.surface,
            border: `0.5px solid ${colors.border.default}`,
            color: contact.color,
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span>{contact.icon}</span>
          <span>Contact via {contact.label}</span>
        </a>
      )}
    </div>
  )
}