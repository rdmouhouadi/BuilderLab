// lib/timeLabel.ts
// Returns a human-readable relative time label from an ISO date string.
// Used on project cards to show how long ago a project was posted.

export function getTimeLabel(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)

  // Difference in milliseconds
  const diffMs = now.getTime() - created.getTime()

  // Convert to progressively larger units
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours   = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays    = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks   = Math.floor(diffDays / 7)
  const diffMonths  = Math.floor(diffDays / 30)

  if (diffHours < 24) return 'New'
  if (diffHours < 48) return '1d ago'
  if (diffDays < 7)   return `${diffDays}d ago`
  if (diffWeeks < 4)  return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`

  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears}y ago`
}
