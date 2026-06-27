// components/ProjectDetail/sidebar/TeamCard.tsx
// Shows the project's team: avatar, name, HiveOS manager badge,
// contact link, and the message they sent when they first asked
// to join. The owner can also remove a member from here.
import Link from 'next/link'
import { CONTACT_TYPES } from '@/lib/constants'
import { colors, radius, fontSize } from '@/lib/design-tokens'
import { cardStyle, sectionTitle, getFullName, getInitials, Member, AcceptedConnection } from '../shared'

type Props = {
  members: Member[]
  acceptedConnections: AcceptedConnection[]
  isOwner: boolean
  currentUserId: string | null
  // Called when the owner clicks "Remove from project" on a member
  onRemoveMember: (member: Member) => void
}

export default function TeamCard({
  members,
  acceptedConnections,
  isOwner,
  currentUserId,
  onRemoveMember,
}: Props) {
  return (
    <div style={cardStyle}>
      <h2 style={sectionTitle}>
        Team · {members.length} {members.length === 1 ? 'member' : 'members'}
      </h2>

      {members.length === 0 ? (
        <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
          No members yet. Be the first to join!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {members.map(member => {
            // The message this member sent when requesting to join,
            // shown as a quote under their name once accepted
            const connectionMessage = acceptedConnections.find(
              c => c.sender_id === member.user_id
            )?.message

            const contactType = member.profiles?.preferred_contact_type
            const contact = contactType ? CONTACT_TYPES[contactType] : null

            return (
              <div key={member.id}>

                {/* Avatar + name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: radius.lg,
                    backgroundColor: colors.accent.teal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: fontSize.xs, fontWeight: 500, color: '#fff', flexShrink: 0,
                  }}>
                    {getInitials(member.profiles)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + HiveOS manager badge, on the same line */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <Link
                        href={`/profile/${member.profiles?.id}`}
                        style={{
                          fontSize: fontSize.sm, fontWeight: 500, color: colors.text.primary,
                          textDecoration: 'none', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {getFullName(member.profiles)}
                      </Link>

                      {/* Badge shown only for the current HiveOS manager */}
                      {member.is_hiveos_manager && (
                        <span style={{
                          fontSize: fontSize.xs,
                          color: colors.accent.indigoText,
                          backgroundColor: colors.accent.indigoDim,
                          border: `0.5px solid ${colors.accent.indigoBorder}`,
                          borderRadius: radius.sm,
                          padding: '1px 5px',
                          flexShrink: 0,
                        }}>
                          ⚡ Manager
                        </span>
                      )}
                    </div>

                    {/* Contact link — only if the member set one in their profile */}
                    {contact && (
                      <a
                        href={member.profiles?.preferred_contact_value ?? '#'}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: fontSize.xs, color: contact.color, textDecoration: 'none' }}
                      >
                        {contact.icon} {contact.label}
                      </a>
                    )}
                  </div>
                </div>

                {/* Remove button — owner only, hidden for the owner's own row */}
                {isOwner && member.user_id !== currentUserId && (
                  <button
                    onClick={() => onRemoveMember(member)}
                    style={{
                      fontSize: fontSize.xs,
                      color: colors.text.muted,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 0',
                      marginLeft: '36px', // lines up under the avatar
                      marginBottom: '4px',
                      display: 'block',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = colors.status.danger)}
                    onMouseLeave={e => (e.currentTarget.style.color = colors.text.muted)}
                  >
                    Remove from project
                  </button>
                )}

                {/* Join message — only shown if one was provided */}
                {connectionMessage && (
                  <p style={{
                    fontSize: fontSize.xs, lineHeight: 1.5,
                    padding: '6px 10px', borderRadius: radius.lg,
                    fontStyle: 'italic', color: colors.text.muted,
                    backgroundColor: colors.bg.surface,
                    border: `0.5px solid ${colors.border.default}`,
                    marginLeft: '36px',
                  }}>
                    &quot;{connectionMessage}&quot;
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}