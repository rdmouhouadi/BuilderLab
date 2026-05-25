// components/ProjectHeader.tsx
// Displays the project title, badges, and inline edit form.
// Owner-only edit mode with title, description, level, duration, spots, skills.
'use client'

import { colors, radius, fontSize } from '@/lib/design-tokens'
import { Project } from '@/types'
import { SKILLS, DURATIONS, LEVELS } from '@/lib/constants'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type EditForm = {
  title: string
  problem: string
  level: string
  domain: string
  duration: string
  spots: string
}

type ProjectData = {
  title: string
  problem: string
  level: string
  domain: string
  duration: string
  spots: number | null
  project_skills: { id?: string; project_id?: string; skill_needed: string }[]  // ← fields optional
}

type Props = {
  project: Project
  projectData: ProjectData
  isOwner: boolean
  editing: boolean
  saving: boolean
  editForm: EditForm
  editSkills: string[]
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onEditFormChange: (field: keyof EditForm, value: string) => void
  onEditSkillToggle: (skill: string) => void
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const inputStyle = {
  width: '100%',
  backgroundColor: colors.bg.surface,
  border: `0.5px solid ${colors.border.default}`,
  borderRadius: radius.lg,
  color: colors.text.primary,
  fontSize: fontSize.sm,
  padding: '8px 12px',
  outline: 'none',
  fontFamily: 'inherit',
}

const tagStyle = {
  fontSize: fontSize.xs,
  padding: '2px 7px',
  borderRadius: radius.md,
  backgroundColor: colors.bg.hover,
  border: `0.5px solid ${colors.border.default}`,
  color: colors.text.secondary,
  display: 'inline-block' as const,
}

// ─────────────────────────────────────────
// Component
// ─────────────────────────────────────────

export default function ProjectHeader({
  project,
  projectData,
  isOwner,
  editing,
  saving,
  editForm,
  editSkills,
  onEdit,
  onCancel,
  onSave,
  onEditFormChange,
  onEditSkillToggle,
}: Props) {
  const onFocus = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.accent.teal
  const onBlur  = (e: React.FocusEvent<HTMLElement>) =>
    (e.currentTarget as HTMLElement).style.borderColor = colors.border.default

  return (
    <div style={{
      backgroundColor: colors.bg.elevated,
      border: `0.5px solid ${colors.border.default}`,
      borderRadius: radius.xxl,
      padding: '20px',
    }}>
      {/* Top row — badges + edit actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Domain badge */}
          <span style={{
            fontSize: fontSize.xs,
            padding: '3px 8px',
            borderRadius: radius.md,
            backgroundColor: colors.accent.tealDim,
            color: colors.accent.tealText,
            border: `0.5px solid ${colors.accent.tealBorder}`,
          }}>
            {project.domain}
          </span>
          {/* Status badge */}
          <span style={{
            fontSize: fontSize.xs,
            padding: '3px 8px',
            borderRadius: radius.md,
            textTransform: 'capitalize',
            backgroundColor: project.status === 'open'
              ? colors.status.successDim
              : colors.status.warningDim,
            color: project.status === 'open'
              ? colors.status.success
              : colors.status.warning,
          }}>
            {project.status}
          </span>
        </div>

        {/* Edit / Save / Cancel — owner only */}
        {isOwner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {editing ? (
              <>
                <button
                  onClick={onCancel}
                  style={{
                    fontSize: fontSize.xs,
                    padding: '4px 10px',
                    borderRadius: radius.md,
                    color: colors.text.muted,
                    border: `0.5px solid ${colors.border.default}`,
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  style={{
                    fontSize: fontSize.xs,
                    padding: '4px 10px',
                    borderRadius: radius.md,
                    backgroundColor: colors.accent.teal,
                    color: '#fff',
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    fontWeight: 500,
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={onEdit}
                style={{
                  fontSize: fontSize.xs,
                  padding: '4px 10px',
                  borderRadius: radius.md,
                  backgroundColor: colors.accent.tealDim,
                  color: colors.accent.tealText,
                  border: `0.5px solid ${colors.accent.tealBorder}`,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(13,148,136,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.accent.tealDim)}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        // ── Edit mode ──
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Title */}
          <input
            type="text"
            value={editForm.title}
            onChange={e => onEditFormChange('title', e.target.value)}
            style={{ ...inputStyle, fontSize: fontSize.lg, fontWeight: 500 }}
            onFocus={onFocus} onBlur={onBlur}
            placeholder="Project title"
          />

          {/* Description */}
          <textarea
            value={editForm.problem}
            onChange={e => onEditFormChange('problem', e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={onFocus} onBlur={onBlur}
            placeholder="Problem description"
          />

          {/* Level */}
          <div>
            <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '6px' }}>
              Level
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LEVELS.map(l => {
                const isActive = editForm.level === l
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onEditFormChange('level', l)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: radius.lg,
                      fontSize: fontSize.xs,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      backgroundColor: isActive ? colors.accent.tealDim  : colors.bg.surface,
                      border:          isActive ? `0.5px solid ${colors.accent.tealBorder}` : `0.5px solid ${colors.border.default}`,
                      color:           isActive ? colors.accent.tealText : colors.text.muted,
                    }}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Duration + Spots */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '4px' }}>Duration</label>
              <select
                value={editForm.duration}
                onChange={e => onEditFormChange('duration', e.target.value)}
                style={{ ...inputStyle, color: editForm.duration ? colors.text.primary : colors.text.muted }}
                onFocus={onFocus} onBlur={onBlur}
              >
                <option value="">No duration</option>
                {DURATIONS.map(d => (
                  <option key={d} value={d} style={{ backgroundColor: colors.bg.elevated }}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '4px' }}>Spots</label>
              <input
                type="number" min="1" max="10"
                value={editForm.spots}
                onChange={e => onEditFormChange('spots', e.target.value)}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label style={{ fontSize: fontSize.xs, color: colors.text.muted, display: 'block', marginBottom: '6px' }}>Skills needed</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {SKILLS.map(skill => {
                const isActive = editSkills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onEditSkillToggle(skill)}
                    style={{
                      fontSize: fontSize.xs,
                      padding: '3px 9px',
                      borderRadius: radius.md,
                      cursor: 'pointer',
                      backgroundColor: isActive ? colors.accent.tealDim  : colors.bg.surface,
                      border:          isActive ? `0.5px solid ${colors.accent.tealBorder}` : `0.5px solid ${colors.border.default}`,
                      color:           isActive ? colors.accent.tealText : colors.text.muted,
                    }}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

      ) : (
        // ── Display mode ──
        <>
          <h1 style={{
            fontSize: fontSize.xl,
            fontWeight: 500,
            color: colors.text.primary,
            letterSpacing: '-0.02em',
            marginBottom: '10px',
          }}>
            {projectData.title}
          </h1>
          <p style={{
            fontSize: fontSize.sm,
            color: colors.text.secondary,
            lineHeight: 1.7,
            marginBottom: '14px',
            wordBreak: 'break-word',
          }}>
            {projectData.problem}
          </p>

          {/* Tags — monochrome */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {projectData.project_skills?.map(skill => (
              <span key={skill.skill_needed} style={tagStyle}>
                {skill.skill_needed}
              </span>
            ))}
            {projectData.level && (
              <span style={{ ...tagStyle, textTransform: 'capitalize', color: colors.text.muted }}>
                {projectData.level}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}