// components/ProjectDetail/shared.tsx
// Shared styles and helpers used across the project detail page
// and its sub-components (sidebar cards, milestones, etc.)
// Keeping these in one place avoids repeating the same style
// object in every file.
import { colors, radius, fontSize } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────

// Standard card look used by every sidebar section
// (Owner, Team, Details, Privacy) and the Milestones block.
export const cardStyle = {
  backgroundColor: colors.bg.elevated,
  border: `0.5px solid ${colors.border.default}`,
  borderRadius: radius.xxl,
  padding: '18px',
}

// Standard small heading used at the top of every card
export const sectionTitle = {
  fontSize: fontSize.sm,
  fontWeight: 500,
  color: colors.text.primary,
  marginBottom: '14px',
}

// ─────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────

// A team member, with the fields the sidebar and HiveOS need.
// This mirrors the project_members table joined with profiles.
export type Member = {
  id: string
  user_id: string
  role: string | null
  rating_required: boolean
  is_hiveos_manager: boolean
  leave_reason: string | null
  left_at: string | null
  profiles: {
    id: string
    name: string | null
    first_name: string | null
    last_name: string | null
    country: string | null
    avg_rating: number
    preferred_contact_type: string | null
    preferred_contact_value: string | null
  } | null
}

// A pending or accepted connection request — only the fields
// the detail page actually reads.
export type Connection = {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
}

// The message a member sent when they first requested to join,
// shown under their name in the Team card once accepted.
export type AcceptedConnection = {
  sender_id: string
  message: string | null
}

// ─────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────

// Builds a display name from first/last name, falling back to a
// single "name" field, and finally "Anonymous" if nothing exists.
// Works for both Member['profiles'] and Project['profiles'] since
// they share the same first_name/last_name/name shape.
export function getFullName(
  profile: { first_name: string | null; last_name: string | null; name: string | null } | null | undefined
) {
  if (!profile) return 'Anonymous'
  const full = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  return full || profile.name || 'Anonymous'
}

// Builds initials for an avatar circle, e.g. "Richie Mouhouadi" → "RM"
export function getInitials(
  profile: { first_name: string | null; last_name: string | null; name: string | null } | null | undefined
) {
  if (!profile) return '?'
  const first = profile.first_name?.[0]
  const last  = profile.last_name?.[0]
  if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
  return profile.name?.[0]?.toUpperCase() ?? '?'
}