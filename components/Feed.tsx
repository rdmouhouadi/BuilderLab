// components/Feed.tsx
// Client component — handles search, filters, and project grid display.
// Receives all projects from the server and filters client-side.
// No refetch needed on filter change — faster UX.
'use client'

import { useState, useMemo, useEffect } from 'react'
import { Project } from '@/types'
import ProjectCard from '@/components/ProjectCard'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import { SKILLS, LEVELS, DURATIONS } from '@/lib/constants'
import { colors, radius, fontSize } from '@/lib/design-tokens'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Props = {
  projects: Project[]
  currentUserId: string | null
}

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────

// Chevron icon
function Chevron() {
  return (
    <svg style={{ width: '10px', height: '10px', flexShrink: 0 }}
      fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
    )
}

const SKILL_OPTIONS    = ['All Skills',    ...SKILLS]
const LEVEL_OPTIONS    = ['All Levels',    ...LEVELS]
const DURATION_OPTIONS = ['Any Duration',  ...DURATIONS]

// ─────────────────────────────────────────
// Sub-component: FeedFilters
// ─────────────────────────────────────────

type FeedFiltersProps = {
  search: string
  skill: string
  level: string
  duration: string
  onSearch:   (v: string) => void
  onSkill:    (v: string) => void
  onLevel:    (v: string) => void
  onDuration: (v: string) => void
}

function FeedFilters({
  search, skill, level, duration,
  onSearch, onSkill, onLevel, onDuration,
}: FeedFiltersProps) {

  const [skillOpen,    setSkillOpen]    = useState(false)
  const [levelOpen,    setLevelOpen]    = useState(false)
  const [durationOpen, setDurationOpen] = useState(false)

  // Shared style for filter trigger buttons
  function filterBtnStyle(isActive: boolean) {
    return {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '6px',
      padding: '6px 10px',
      borderRadius: radius.lg,
      fontSize: fontSize.xs,
      cursor: 'pointer',
      transition: 'all 0.15s',
      backgroundColor: isActive ? colors.accent.tealDim     : 'transparent',
      color:           isActive ? colors.accent.tealText    : colors.text.muted,
      border:          isActive
        ? `0.5px solid ${colors.accent.tealBorder}`
        : `0.5px solid ${colors.border.default}`,
    }
  }

  // Shared style for dropdown containers
  const dropdownStyle = {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    left: 0,
    zIndex: 20,
    minWidth: '160px',
    backgroundColor: colors.bg.elevated,
    border: `0.5px solid ${colors.border.hover}`,
    borderRadius: radius.xl,
    overflow: 'hidden',
  }

  // Shared style for dropdown option buttons
  function optionStyle(isSelected: boolean) {
    return {
      width: '100%',
      textAlign: 'left' as const,
      padding: '8px 14px',
      fontSize: fontSize.xs,
      cursor: 'pointer',
      backgroundColor: isSelected ? colors.accent.tealDim : 'transparent',
      color: isSelected ? colors.accent.tealText : colors.text.secondary,
      border: 'none',
      transition: 'background 0.1s',
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      backgroundColor: colors.bg.elevated,
      border: `0.5px solid ${colors.border.default}`,
      borderRadius: radius.xxl,
      padding: '12px',
      marginBottom: '16px',
    }}>

      {/* Search bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: colors.bg.surface,
        border: `0.5px solid ${colors.border.default}`,
        borderRadius: radius.lg,
        padding: '6px 12px',
      }}>
        <svg style={{ width: '14px', height: '14px', color: colors.text.muted, flexShrink: 0 }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => onSearch(e.target.value)}
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

      {/* Filter row — 2 cols on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">

        {/* Skills dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={filterBtnStyle(skill !== 'All Skills')}
            onClick={() => { setSkillOpen(p => !p); setLevelOpen(false); setDurationOpen(false) }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {skill}
            </span>
            <Chevron />
          </button>
          {skillOpen && (
            <div style={{ ...dropdownStyle, width: '192px' }}>
              {SKILL_OPTIONS.map(s => (
                <button
                  key={s}
                  style={optionStyle(skill === s)}
                  onClick={() => { onSkill(s); setSkillOpen(false) }}
                  onMouseEnter={e => { if (skill !== s) (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.hover }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = skill === s ? colors.accent.tealDim : 'transparent' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Levels dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={filterBtnStyle(level !== 'All Levels')}
            onClick={() => { setLevelOpen(p => !p); setSkillOpen(false); setDurationOpen(false) }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
              {level}
            </span>
            <Chevron />
          </button>
          {levelOpen && (
            <div style={dropdownStyle}>
              {LEVEL_OPTIONS.map(l => (
                <button
                  key={l}
                  style={{ ...optionStyle(level === l), textTransform: 'capitalize' }}
                  onClick={() => { onLevel(l); setLevelOpen(false) }}
                  onMouseEnter={e => { if (level !== l) (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.hover }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = level === l ? colors.accent.tealDim : 'transparent' }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Duration dropdown — full width on mobile */}
        <div style={{ position: 'relative' }} className="col-span-2 md:col-span-1">
          <button
            style={filterBtnStyle(duration !== 'Any Duration')}
            onClick={() => { setDurationOpen(p => !p); setSkillOpen(false); setLevelOpen(false) }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <svg style={{ width: '12px', height: '12px', flexShrink: 0 }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {duration}
              </span>
            </div>
            <Chevron />
          </button>
          {durationOpen && (
            <div style={dropdownStyle}>
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  style={optionStyle(duration === d)}
                  onClick={() => { onDuration(d); setDurationOpen(false) }}
                  onMouseEnter={e => { if (duration !== d) (e.currentTarget as HTMLElement).style.backgroundColor = colors.bg.hover }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = duration === d ? colors.accent.tealDim : 'transparent' }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Main component: Feed
// ─────────────────────────────────────────

export default function Feed({ projects, currentUserId: initialUserId }: Props) {
  const supabase = createBrowserSupabaseClient()

  // Filter states
  const [search,   setSearch]   = useState('')
  const [skill,    setSkill]    = useState('All Skills')
  const [level,    setLevel]    = useState('All Levels')
  const [duration, setDuration] = useState('Any Duration')

  // currentUserId may arrive as null server-side — re-fetch client-side to confirm
  const [currentUserId, setCurrentUserId] = useState<string | null>(initialUserId)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })
  }, [])

  // Filter projects client-side — recomputes only when dependencies change
  const filtered = useMemo(() => {
    return projects.filter(project => {
      // Exclude projects the user has already joined
      const isMember = project.project_members?.some(m => m.user_id === currentUserId)
      if (isMember) return false

      const matchSearch = search === '' ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.problem?.toLowerCase().includes(search.toLowerCase())

      const matchSkill    = skill    === 'All Skills'    || project.project_skills?.some(s => s.skill_needed === skill)
      const matchLevel    = level    === 'All Levels'    || project.level    === level
      const matchDuration = duration === 'Any Duration'  || project.duration === duration

      return matchSearch && matchSkill && matchLevel && matchDuration
    })
  }, [projects, search, skill, level, duration, currentUserId])

  return (
    <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: fontSize.sm, color: colors.accent.tealText, marginBottom: '6px' }}>
          ↗ {projects.length} {projects.length === 0 || projects.length === 1 ? 'project' : 'projects'} available
        </p>
        <h1 style={{
          fontSize: fontSize.xxl,
          fontWeight: 500,
          color: colors.text.primary,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          marginBottom: '8px',
        }}>
          Find your next{' '}
          <span style={{ color: colors.accent.tealText }}>
            collab project
          </span>
        </h1>
        <p style={{ fontSize: fontSize.base, color: colors.text.muted, maxWidth: '480px', lineHeight: 1.6 }}>
          Connect with builders working on meaningful projects.
          Build your skills, and ship real things together.
        </p>
      </div>

      {/* Search + filters */}
      <FeedFilters
        search={search}   onSearch={setSearch}
        skill={skill}     onSkill={setSkill}
        level={level}     onLevel={setLevel}
        duration={duration} onDuration={setDuration}
      />

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
        <p style={{ fontSize: fontSize.sm, color: colors.text.muted }}>
          Most recent
        </p>
      </div>

      {/* Project grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 0',
          gap: '8px',
        }}>
          <p style={{ fontSize: fontSize.lg, color: colors.text.muted }}>
            No projects found.
          </p>
          <p style={{ fontSize: fontSize.base, color: colors.text.muted }}>
            Try different filters.
          </p>
        </div>
      )}
    </main>
  )
}