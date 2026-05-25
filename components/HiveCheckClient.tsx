// components/HiveCheckClient.tsx
// HiveCheck — public leaderboard of completed projects.
// Merged with Archive — all completed public projects appear here.
// Projects with peer reviews will be ranked by score in V0.5.0.
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Project } from '@/types'
import { getTimeLabel } from '@/lib/timeLabel'
import { colors, radius, fontSize } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  projects: Project[]
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const tagStyle = {
  fontSize: fontSize.xs,
  padding: '2px 7px',
  borderRadius: radius.md,
  backgroundColor: colors.bg.hover,
  border: `0.5px solid ${colors.border.default}`,
  color: colors.text.secondary,
  display: 'inline-block' as const,
}

function getOwnerName(profile: Project['profiles']) {
  if (!profile) return 'Anonymous'
  const full = [(profile as any).first_name, (profile as any).last_name]
    .filter(Boolean).join(' ')
  return full || (profile as any).name || 'Anonymous'
}

function getInitials(profile: Project['profiles']) {
  if (!profile) return '?'
  const first = (profile as any).first_name?.[0]
  const last  = (profile as any).last_name?.[0]
  if (first || last) return [first, last].filter(Boolean).join('').toUpperCase()
  return (profile as any).name?.[0]?.toUpperCase() ?? '?'
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function HiveCheckClient({ projects }: Props) {
  const [search, setSearch] = useState('')

  // Filter by title and description
  const filtered = useMemo(() => {
    if (!search) return projects
    const q = search.toLowerCase()
    return projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.problem?.toLowerCase().includes(q)
    )
  }, [projects, search])

  return (
    <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px',
        }}>
          <span style={{
            fontSize: fontSize.xs,
            color: colors.accent.indigoText,
            backgroundColor: colors.accent.indigoDim,
            border: `0.5px solid ${colors.accent.indigoBorder}`,
            borderRadius: radius.md,
            padding: '2px 8px',
          }}>
            beta
          </span>
          <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
            {projects.length} completed {projects.length === 0 || projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
        <h1 style={{
          fontSize: fontSize.xxl,
          fontWeight: 500,
          color: colors.text.primary,
          letterSpacing: '-0.02em',
          marginBottom: '6px',
        }}>
          See builders journey{' '} 
          <span style={{ color: colors.accent.indigo }}>
            and get inspired.
          </span>
        </h1>
        <p style={{
          fontSize: fontSize.base,
          color: colors.text.muted,
          maxWidth: '480px',
          lineHeight: 1.6,
        }}>
          Browse completed work, learn from peer-reviewed journeys.
          (Peer-reviewed ranking coming soon).
        </p>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: colors.bg.elevated,
        border: `0.5px solid ${colors.border.default}`,
        borderRadius: radius.lg,
        padding: '7px 12px',
        marginBottom: '16px',
      }}>
        <svg style={{ width: '14px', height: '14px', color: colors.text.muted, flexShrink: 0 }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search completed projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: fontSize.base,
            color: colors.text.primary,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Results count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
          Showing{' '}
          <span style={{ color: colors.text.primary, fontWeight: 500 }}>
            {filtered.length}
          </span>{' '}
          {filtered.length === 0 || filtered.length === 1 ? 'project' : 'projects'}
        </p>
        {/* Placeholder — will become score-based sort in V0.5.0 */}
        <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
          Most recent
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 0', gap: '8px',
        }}>
          <p style={{ fontSize: fontSize.lg, color: colors.text.muted }}>
            No completed projects found.
          </p>
          <p style={{ fontSize: fontSize.base, color: colors.text.muted }}>
            Try a different search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              onClick={() => sessionStorage.setItem('projectDetailFrom', '/hivecheck')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                backgroundColor: colors.bg.elevated,
                border: `0.5px solid ${colors.border.default}`,
                borderRadius: radius.xxl,
                padding: '14px',
                height: '100%',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = colors.accent.indigoBorder)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border.default)}
            >
              {/* Author row */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Avatar — indigo for HiveCheck */}
                  <div style={{
                    width: '24px', height: '24px',
                    borderRadius: radius.lg,
                    backgroundColor: colors.accent.indigo,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: fontSize.xs, fontWeight: 500,
                    color: '#fff', flexShrink: 0,
                  }}>
                    {getInitials(project.profiles)}
                  </div>
                  <div>
                    <p style={{ fontSize: fontSize.sm, fontWeight: 500, color: colors.text.secondary }}>
                      {getOwnerName(project.profiles)}
                    </p>
                    {(project.profiles as any)?.country && (
                      <p style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                        {(project.profiles as any).country}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipped badge */}
                <span style={{
                  fontSize: fontSize.xs,
                  padding: '2px 7px',
                  borderRadius: radius.md,
                  backgroundColor: colors.accent.indigoDim,
                  color: colors.accent.indigoText,
                  border: `0.5px solid ${colors.accent.indigoBorder}`,
                  flexShrink: 0,
                }}>
                  ✓ Shipped
                </span>
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: fontSize.md,
                fontWeight: 500,
                color: colors.text.primary,
                letterSpacing: '-0.01em',
                marginBottom: '6px',
                lineHeight: 1.4,
                flex: 1,
              }}>
                {project.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: fontSize.sm,
                color: colors.text.muted,
                lineHeight: 1.6,
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}>
                {project.problem}
              </p>

              {/* Tags — monochrome */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                {project.project_skills?.slice(0, 2).map(skill => (
                  <span key={skill.skill_needed} style={tagStyle}>
                    {skill.skill_needed}
                  </span>
                ))}
                {project.project_skills && project.project_skills.length > 2 && (
                  <span style={{ ...tagStyle, color: colors.text.muted }}>
                    +{project.project_skills.length - 2} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: `0.5px solid ${colors.border.default}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                    ⭐ {project.profiles?.avg_rating
                      ? project.profiles.avg_rating.toFixed(1)
                      : 'New'
                    }
                  </span>
                  <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                    {project.project_members?.length ?? 0} members
                  </span>
                </div>
                <span style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                  {getTimeLabel(project.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}