// components/ProjectDetail/sidebar/DetailsCard.tsx
// Shows quick facts about the project: duration, spots, post date,
// follower count, and links to a live demo / GitHub repo if provided.
import { Project } from '@/types'
import { colors, radius, fontSize } from '@/lib/design-tokens'
import { cardStyle, sectionTitle } from '../shared'

type Props = {
  project: Project
  followersCount: number
}

export default function DetailsCard({ project, followersCount }: Props) {
  // Format the posted date as "Jan 5, 2026" instead of a raw ISO string
  const postedDate = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div style={cardStyle}>
      <h2 style={sectionTitle}>Details</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Duration — only shown if the owner filled it in */}
        {project.duration && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
            <span>⏱</span>
            <span>Duration: <span style={{ color: colors.text.secondary }}>{project.duration}</span></span>
          </div>
        )}

        {/* Spots — only shown if a number was provided */}
        {project.spots && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
            <span>👥</span>
            <span>Spots: <span style={{ color: colors.text.secondary }}>{project.spots}</span></span>
          </div>
        )}

        {/* Posted date — always shown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
          <span>📅</span>
          <span>Posted: <span style={{ color: colors.text.secondary }}>{postedDate}</span></span>
        </div>

        {/* Follower count — always shown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: fontSize.xs, color: colors.text.muted }}>
          <span>👁</span>
          <span style={{ color: colors.text.secondary }}>
            {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
          </span>
        </div>

        {/* Optional links — only render this block if at least one link exists */}
        {(project.website_url || project.github_url) && (
          <div style={{ paddingTop: '8px', borderTop: `0.5px solid ${colors.border.default}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {project.website_url && (
             <a 
                href={project.website_url}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: fontSize.xs, color: colors.accent.tealText,
                  textDecoration: 'none', padding: '5px 8px',
                  borderRadius: radius.md,
                  backgroundColor: colors.accent.tealDim,
                  border: `0.5px solid ${colors.accent.tealBorder}`,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                🌐 View demo
              </a>
            )}
            {project.github_url && (
                <a
                href={project.github_url}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: fontSize.xs, color: colors.text.secondary,
                  textDecoration: 'none', padding: '5px 8px',
                  borderRadius: radius.md,
                  backgroundColor: colors.bg.surface,
                  border: `0.5px solid ${colors.border.default}`,
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = colors.border.hover)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border.default)}
              >
                ⌥ GitHub repository
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}