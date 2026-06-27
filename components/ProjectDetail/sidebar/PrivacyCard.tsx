// components/ProjectDetail/sidebar/PrivacyCard.tsx
// Owner-only card with Public/Private toggles for each section
// of the project (Milestones, Build Log, Team Chat, Team members).
import { Project } from '@/types'
import { colors, radius, fontSize } from '@/lib/design-tokens'
import { cardStyle, sectionTitle } from '../shared'

// The 4 toggleable sections, paired with their column name in the
// projects table and a human-readable label for the UI.
const PRIVACY_TOGGLES = [
  { key: 'show_milestones', label: 'Milestones' },
  { key: 'show_build_log',  label: 'Build Log' },
  { key: 'show_chat',       label: 'Team Chat' },
  { key: 'show_team',       label: 'Team members' },
] as const

type Props = {
  project: Project
  // Called when the owner clicks a toggle — handles the Supabase
  // update and refresh, the card itself only triggers the action
  onToggle: (key: typeof PRIVACY_TOGGLES[number]['key']) => void
}

export default function PrivacyCard({ project, onToggle }: Props) {
  return (
    <div style={cardStyle}>
      <h2 style={sectionTitle}>Privacy</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PRIVACY_TOGGLES.map(({ key, label }) => {
          const isPublic = project[key]
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: fontSize.xs, color: colors.text.secondary }}>{label}</span>
              <button
                onClick={() => onToggle(key)}
                style={{
                  fontSize: fontSize.xs, padding: '3px 8px',
                  borderRadius: radius.md, cursor: 'pointer',
                  backgroundColor: isPublic ? colors.status.successDim : colors.bg.hover,
                  color:           isPublic ? colors.status.success    : colors.text.muted,
                  border:          isPublic ? `0.5px solid rgba(16,185,129,0.25)` : `0.5px solid ${colors.border.default}`,
                }}
              >
                {isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: '10px' }}>
        Private sections are visible to members and followers only.
      </p>
    </div>
  )
}