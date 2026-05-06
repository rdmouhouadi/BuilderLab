// lib/timeLabel.ts
// Retourne un label de temps relatif à partir d'une date ISO
// Utilisé sur les cartes projet pour afficher l'ancienneté

export function getTimeLabel(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)

  // Différence en millisecondes
  const diffMs = now.getTime() - created.getTime()

  // Conversion en unités lisibles
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  // Moins de 24h → "New"
  if (diffHours < 24) return 'New'

  // Moins de 48h → "Yesterday"
  if (diffHours < 48) return 'Yesterday'

  // Moins de 7 jours → "X days ago"
  if (diffDays < 7) return `${diffDays}d ago`

  // Moins de 30 jours → "X weeks ago"
  if (diffWeeks < 4) return `${diffWeeks}w ago`

  // Moins de 12 mois → "X months ago"
  if (diffMonths < 12) return `${diffMonths}mo ago`

  // Plus d'un an → "X years ago"
  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears}y ago`
}